'use server';

import { createClient } from '@/lib/supabase/server';
import { TEACHING_RESOURCES, type TeachingResource } from '@/lib/constants/resources';

// ═══════════════════════════════════════
// COACH TEACHING STATS
// ═══════════════════════════════════════

export interface CoachStats {
  total_sessions: number;
  total_hours: number;
  unique_students: number;
  sessions_this_month: number;
}

export async function getCoachStats(coachId: string): Promise<CoachStats> {
  const supabase = await createClient();

  // Query cascade_sessions (uses total_duration as text, e.g. "60")
  const { data: cascadeSessions } = await supabase
    .from('cascade_sessions')
    .select('id, student_id, total_duration, session_date')
    .eq('coach_id', coachId);

  // Query standalone_sessions (uses duration_minutes as number)
  const { data: standaloneSessions } = await supabase
    .from('standalone_sessions')
    .select('id, student_id, duration_minutes, session_date')
    .eq('coach_id', coachId);

  // Safe duration parser: handles NULL, strings, numbers
  const parseDuration = (val: any): number => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Camp sessions — the coach delivers these via the SessionPlanner flow.
  // They live in student_session_results (one row per student per day), so
  // we group by camp_session_id to count each DAY once (not per student).
  const { data: campResults } = await supabase
    .from('student_session_results')
    .select('camp_session_id, student_id, duration_minutes, created_at, camp_sessions:camp_session_id(session_date)')
    .eq('coach_id', coachId)
    .not('camp_session_id', 'is', null);

  // Normalize both to a common shape for stats
  const cascadeNormalized = (cascadeSessions ?? []).map(s => ({
    id: s.id,
    student_id: s.student_id,
    duration_minutes: parseDuration(s.total_duration),
    session_date: s.session_date,
  }));
  const standaloneNormalized = (standaloneSessions ?? []).map(s => ({
    id: s.id,
    student_id: s.student_id,
    duration_minutes: parseDuration(s.duration_minutes),
    session_date: s.session_date,
  }));

  // One entry per distinct camp_session_id (a delivered camp day).
  const campDays = new Map<string, { id: string; student_id: string | null; duration_minutes: number; session_date: string | null }>();
  const campStudentIds: string[] = [];
  for (const r of campResults ?? []) {
    if (r.student_id) campStudentIds.push(r.student_id);
    const csid = (r as any).camp_session_id as string;
    if (campDays.has(csid)) continue;
    const cs = Array.isArray((r as any).camp_sessions) ? (r as any).camp_sessions[0] : (r as any).camp_sessions;
    campDays.set(csid, {
      id: csid,
      student_id: r.student_id,
      duration_minutes: parseDuration(r.duration_minutes),
      session_date: cs?.session_date ?? (r.created_at ? String(r.created_at).slice(0, 10) : null),
    });
  }

  const allSessions = [...cascadeNormalized, ...standaloneNormalized, ...Array.from(campDays.values())];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const uniqueStudentIds = new Set(
    [...allSessions.map(s => s.student_id), ...campStudentIds].filter(Boolean)
  );

  const totalMinutes = allSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  const sessionsThisMonth = allSessions.filter(
    s => s.session_date && s.session_date >= monthStart
  ).length;

  return {
    total_sessions: allSessions.length,
    total_hours: Math.round((totalMinutes / 60) * 10) / 10,
    unique_students: uniqueStudentIds.size,
    sessions_this_month: sessionsThisMonth,
  };
}

// ═══════════════════════════════════════
// COACH RATING STATS
// ═══════════════════════════════════════

export interface CoachRatingStats {
  avg_rating: number;
  total_ratings: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

export async function getCoachRatingStats(coachId: string): Promise<CoachRatingStats> {
  const supabase = await createClient();

  // Compute directly from survey_responses scoped to this coach's sessions
  // (covers camp + standalone + cascade). The legacy view missed camp surveys.
  const resultIds = await coachSessionResultIds(supabase, coachId);
  const empty: CoachRatingStats = {
    avg_rating: 0, total_ratings: 0, five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0,
  };
  if (resultIds.length === 0) return empty;

  const { data, error } = await supabase
    .from('survey_responses')
    .select('coach_rating')
    .in('session_result_id', resultIds)
    .not('coach_rating', 'is', null);

  if (error || !data || data.length === 0) return empty;

  const dist = [0, 0, 0, 0, 0]; // index 0 = 1 star … index 4 = 5 stars
  let sum = 0;
  for (const r of data as any[]) {
    const v = r.coach_rating as number;
    if (v >= 1 && v <= 5) { dist[v - 1] += 1; sum += v; }
  }
  const total = dist.reduce((a, b) => a + b, 0);
  return {
    avg_rating: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    total_ratings: total,
    five_star: dist[4],
    four_star: dist[3],
    three_star: dist[2],
    two_star: dist[1],
    one_star: dist[0],
  };
}

// ═══════════════════════════════════════
// COACH STUDENT FEEDBACK
// ═══════════════════════════════════════

export interface CoachFeedbackItem {
  coach_rating: number;          // Q1 — coach overall
  feedback_clarity: number | null; // Q2 — how clear was their feedback
  improvement_value: number | null; // Q3 — how much it helped the student improve
  flow_channel: number | null;   // Q4 — how the class felt (1 bored … 3 optimal … 5 frustrating)
  open_comment: string | null;
  created_at: string;
  student_first_name: string | null;
}

// Resolve every survey a student left on a session this coach ran. We go
// survey_responses → session_result_id → student_session_results.coach_id,
// which covers ALL session types (camp days, standalone, cascade) — not just
// the legacy view that missed camp sessions.
async function coachSessionResultIds(supabase: any, coachId: string): Promise<string[]> {
  const { data } = await supabase
    .from('student_session_results')
    .select('id')
    .eq('coach_id', coachId);
  return (data ?? []).map((r: any) => r.id);
}

export async function getCoachStudentFeedback(
  coachId: string,
  limit = 20
): Promise<CoachFeedbackItem[]> {
  const supabase = await createClient();

  const resultIds = await coachSessionResultIds(supabase, coachId);
  if (resultIds.length === 0) return [];

  const { data, error } = await supabase
    .from('survey_responses')
    .select('coach_rating, q2_feedback, q4_session_value, flow_channel, open_comment, submitted_at, students:student_id(first_name)')
    .in('session_result_id', resultIds)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as any[]).map((r) => {
    const stu = Array.isArray(r.students) ? r.students[0] : r.students;
    return {
      coach_rating: r.coach_rating ?? 0,
      feedback_clarity: r.q2_feedback ?? null,
      improvement_value: r.q4_session_value ?? null,
      flow_channel: r.flow_channel ?? null,
      open_comment: r.open_comment ?? null,
      created_at: r.submitted_at,
      student_first_name: stu?.first_name ?? null,
    };
  });
}

// ═══════════════════════════════════════
// COACH TEACHING RESOURCES
// ═══════════════════════════════════════

export async function getCoachTeachingResources(coachId: string): Promise<TeachingResource[]> {
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from('coaches')
    .select('certification_level')
    .eq('id', coachId)
    .single();

  if (!coach?.certification_level) return [];

  // Extract numeric level from certification_level string (e.g. "tss_level_3" → 3)
  const match = String(coach.certification_level).match(/(\d+)/);
  const certLevel = match ? parseInt(match[1], 10) : 0;

  if (certLevel <= 0) return [];

  return TEACHING_RESOURCES.filter(r => r.minCertLevel <= certLevel);
}

// ═══════════════════════════════════════
// RECENT SESSIONS (combined)
// ═══════════════════════════════════════

export interface RecentSessionItem {
  id: string;
  session_date: string;
  student_name: string | null;
  pilar: string | null;
  status: string | null;
  source: 'cascade' | 'standalone' | 'camp';
}

export async function getCoachRecentSessions(
  coachId: string,
  limit = 10
): Promise<RecentSessionItem[]> {
  const supabase = await createClient();

  // Get cascade sessions with student info
  const { data: cascadeRows } = await supabase
    .from('cascade_sessions')
    .select('id, session_date, completion_state, students(first_name, last_name)')
    .eq('coach_id', coachId)
    .order('session_date', { ascending: false })
    .limit(limit);

  // Get standalone sessions with student info
  const { data: standaloneRows } = await supabase
    .from('standalone_sessions')
    .select('id, session_date, mission, student_id, students(first_name, last_name)')
    .eq('coach_id', coachId)
    .order('session_date', { ascending: false })
    .limit(limit);

  // Camp sessions — one item per delivered day (dedup by camp_session_id).
  const { data: campRows } = await supabase
    .from('student_session_results')
    .select('camp_session_id, created_at, camp_sessions:camp_session_id(day_number, session_date, session_status, camp_instances:camp_instance_id(camp_name))')
    .eq('coach_id', coachId)
    .not('camp_session_id', 'is', null)
    .order('created_at', { ascending: false });

  const items: RecentSessionItem[] = [];

  const seenCampDays = new Set<string>();
  for (const row of campRows ?? []) {
    const csid = (row as any).camp_session_id as string;
    if (seenCampDays.has(csid)) continue;
    seenCampDays.add(csid);
    const cs = Array.isArray((row as any).camp_sessions) ? (row as any).camp_sessions[0] : (row as any).camp_sessions;
    const inst = cs ? (Array.isArray(cs.camp_instances) ? cs.camp_instances[0] : cs.camp_instances) : null;
    items.push({
      id: csid,
      session_date: cs?.session_date ?? (row.created_at ? String(row.created_at).slice(0, 10) : ''),
      student_name: inst?.camp_name ?? 'Camp',
      pilar: cs?.day_number != null ? `Day ${cs.day_number}` : null,
      status: cs?.session_status ?? null,
      source: 'camp',
    });
  }

  for (const row of cascadeRows ?? []) {
    const student = row.students as unknown as { first_name?: string; last_name?: string } | null;
    items.push({
      id: row.id,
      session_date: row.session_date,
      student_name: student ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() : null,
      pilar: null,
      status: row.completion_state ?? null,
      source: 'cascade',
    });
  }

  for (const row of standaloneRows ?? []) {
    const student = row.students as unknown as { first_name?: string; last_name?: string } | null;
    items.push({
      id: row.id,
      session_date: row.session_date,
      student_name: student ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() : null,
      pilar: row.mission ?? null,
      status: null,
      source: 'standalone',
    });
  }

  // Sort combined by date descending, take limit
  items.sort((a, b) => (b.session_date > a.session_date ? 1 : -1));
  return items.slice(0, limit);
}

// ═══════════════════════════════════════
// SERVICES / CAMPS LED BY COACH
// ═══════════════════════════════════════

export interface CoachServiceItem {
  id: string;
  camp_name: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  template_name: string | null;
  role: 'head_coach' | 'coach';
  participant_count: number;
}

export async function getCoachServices(coachId: string): Promise<CoachServiceItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('camp_instances')
    .select('id, camp_name, start_date, end_date, status, coach_id, head_coach_id, camp_templates:template_id(template_name)')
    .or(`coach_id.eq.${coachId},head_coach_id.eq.${coachId}`)
    .order('start_date', { ascending: false });

  const rows = data ?? [];
  if (rows.length === 0) return [];

  // Active-participant counts per instance, in one query.
  const ids = rows.map((r: any) => r.id);
  const counts = new Map<string, number>();
  const { data: parts } = await supabase
    .from('camp_participants')
    .select('camp_instance_id')
    .in('camp_instance_id', ids)
    .eq('enrollment_status', 'active');
  for (const p of parts ?? []) {
    counts.set((p as any).camp_instance_id, (counts.get((p as any).camp_instance_id) ?? 0) + 1);
  }

  return rows.map((r: any) => {
    const tpl = Array.isArray(r.camp_templates) ? r.camp_templates[0] : r.camp_templates;
    return {
      id: r.id,
      camp_name: r.camp_name ?? null,
      start_date: r.start_date ?? null,
      end_date: r.end_date ?? null,
      status: r.status ?? null,
      template_name: tpl?.template_name ?? null,
      role: r.head_coach_id === coachId ? 'head_coach' : 'coach',
      participant_count: counts.get(r.id) ?? 0,
    };
  });
}
