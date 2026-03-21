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

  // Normalize both to a common shape for stats
  const cascadeNormalized = (cascadeSessions ?? []).map(s => ({
    id: s.id,
    student_id: s.student_id,
    duration_minutes: s.total_duration ? parseInt(s.total_duration, 10) || 0 : 0,
    session_date: s.session_date,
  }));
  const standaloneNormalized = (standaloneSessions ?? []).map(s => ({
    id: s.id,
    student_id: s.student_id,
    duration_minutes: s.duration_minutes || 0,
    session_date: s.session_date,
  }));

  const allSessions = [...cascadeNormalized, ...standaloneNormalized];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const uniqueStudentIds = new Set(allSessions.map(s => s.student_id).filter(Boolean));

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

  // Try the coach_rating_stats view first
  const { data, error } = await supabase
    .from('coach_rating_stats')
    .select('*')
    .eq('coach_id', coachId)
    .single();

  if (error || !data) {
    // View doesn't exist yet or no data — return zeros
    return {
      avg_rating: 0,
      total_ratings: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0,
    };
  }

  return {
    avg_rating: data.avg_rating ?? 0,
    total_ratings: data.total_ratings ?? 0,
    five_star: data.five_star ?? 0,
    four_star: data.four_star ?? 0,
    three_star: data.three_star ?? 0,
    two_star: data.two_star ?? 0,
    one_star: data.one_star ?? 0,
  };
}

// ═══════════════════════════════════════
// COACH STUDENT FEEDBACK
// ═══════════════════════════════════════

export interface CoachFeedbackItem {
  coach_rating: number;
  open_comment: string | null;
  created_at: string;
  student_first_name: string | null;
}

export async function getCoachStudentFeedback(
  coachId: string,
  limit = 20
): Promise<CoachFeedbackItem[]> {
  const supabase = await createClient();

  // Try the coach_student_feedback view
  const { data, error } = await supabase
    .from('coach_student_feedback')
    .select('coach_rating, open_comment, created_at, student_first_name')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    // View doesn't exist yet — return empty array
    return [];
  }

  return data as CoachFeedbackItem[];
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
  source: 'cascade' | 'standalone';
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

  const items: RecentSessionItem[] = [];

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
