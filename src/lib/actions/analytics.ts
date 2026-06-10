'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from './auth';

export interface BeltCount { belt_level: string; count: number; }
export interface AcademyRow {
  academy_id: string | null;
  academy_name: string;
  total: number;
  active30d: number;
  leads: number;
  members: number;
  sessions30d: number;
}
export interface TopStudent {
  id: string;
  name: string;
  academy_name: string | null;
  sessions_count: number;
  belt_level: string;
}
export interface StudentAnalytics {
  totals: {
    students: number;
    members: number;
    leads: number;
    active30d: number;
    sessions30d: number;
    sessionsAllTime: number;
    avgSessionsPerStudent: number;
  };
  beltDistribution: BeltCount[];
  perAcademy: AcademyRow[];
  topStudents: TopStudent[];
  surveyStats: {
    totalResponses: number;
    avgRating: number | null;
  };
}

export async function getStudentAnalytics(): Promise<StudentAnalytics> {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) {
    throw new Error('Forbidden — platform admin only.');
  }
  const admin = createAdminClient();
  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: students },
    { data: sessions },
    { count: sessionsAllCount },
    { data: academies },
    { data: surveys },
  ] = await Promise.all([
    admin
      .from('students')
      .select('id, first_name, last_name, belt_level, lifecycle_status, academy_id, last_session_date, status')
      .eq('status', 'active'),
    admin
      .from('student_session_results')
      .select('id, student_id, created_at')
      .gte('created_at', thirtyDaysAgo),
    admin
      .from('student_session_results')
      .select('id', { count: 'exact', head: true }),
    admin.from('academies').select('id, name'),
    admin.from('survey_responses').select('rating'),
  ]);

  const studentList = students || [];
  const sessionList = sessions || [];
  const academyMap = new Map((academies || []).map((a) => [a.id, a.name]));

  const totalStudents = studentList.length;
  const leads = studentList.filter((s) => s.lifecycle_status === 'lead').length;
  const members = totalStudents - leads;
  const active30d = studentList.filter(
    (s) => s.last_session_date && s.last_session_date >= thirtyDaysAgo,
  ).length;
  const sessions30d = sessionList.length;
  const sessionsAllTime = sessionsAllCount ?? 0;

  // beltDistribution
  const beltMap = new Map<string, number>();
  for (const s of studentList) {
    const k = s.belt_level || 'unknown';
    beltMap.set(k, (beltMap.get(k) || 0) + 1);
  }
  const beltDistribution: BeltCount[] = Array.from(beltMap.entries())
    .map(([belt_level, count]) => ({ belt_level, count }))
    .sort((a, b) => b.count - a.count);

  // perAcademy
  const sessionsByStudent = new Map<string, number>();
  for (const s of sessionList) {
    sessionsByStudent.set(s.student_id, (sessionsByStudent.get(s.student_id) || 0) + 1);
  }
  const academyAgg = new Map<string, AcademyRow>();
  for (const s of studentList) {
    const key = s.academy_id || '__direct__';
    const name = s.academy_id ? (academyMap.get(s.academy_id) || 'Unknown') : 'TSS Direct';
    if (!academyAgg.has(key)) {
      academyAgg.set(key, {
        academy_id: s.academy_id,
        academy_name: name,
        total: 0,
        active30d: 0,
        leads: 0,
        members: 0,
        sessions30d: 0,
      });
    }
    const row = academyAgg.get(key)!;
    row.total += 1;
    if (s.lifecycle_status === 'lead') row.leads += 1;
    else row.members += 1;
    if (s.last_session_date && s.last_session_date >= thirtyDaysAgo) row.active30d += 1;
    row.sessions30d += sessionsByStudent.get(s.id) || 0;
  }
  const perAcademy = Array.from(academyAgg.values()).sort((a, b) => b.total - a.total);

  // topStudents — top 10 by sessions in last 30d
  const topStudents: TopStudent[] = studentList
    .map((s) => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`.trim(),
      academy_name: s.academy_id ? academyMap.get(s.academy_id) || null : 'TSS Direct',
      sessions_count: sessionsByStudent.get(s.id) || 0,
      belt_level: s.belt_level || 'white_belt',
    }))
    .filter((s) => s.sessions_count > 0)
    .sort((a, b) => b.sessions_count - a.sessions_count)
    .slice(0, 10);

  const ratings = (surveys || []).map((r: any) => Number(r.rating)).filter((n) => !isNaN(n) && n > 0);
  const avgRating = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;

  const avgSessionsPerStudent = totalStudents ? sessions30d / totalStudents : 0;

  return {
    totals: {
      students: totalStudents,
      members,
      leads,
      active30d,
      sessions30d,
      sessionsAllTime,
      avgSessionsPerStudent: Math.round(avgSessionsPerStudent * 10) / 10,
    },
    beltDistribution,
    perAcademy,
    topStudents,
    surveyStats: {
      totalResponses: ratings.length,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    },
  };
}
