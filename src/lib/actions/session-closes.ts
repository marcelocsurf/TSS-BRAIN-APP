'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';

// Coordinator oversight (M137): recent session closes with the coach's internal
// feedback, plus services still in progress (started, not closed yet). Session-
// auth, scoped to the current/act-as academy.

export interface CloseStudent {
  name: string;
  status: string | null; // achieved | partial | not_yet
  feedback: string | null; // coach_feedback (internal)
  whats_next: string | null;
}
export interface SessionClose {
  camp_session_id: string;
  camp_name: string | null;
  day_number: number | null;
  session_date: string | null;
  coach_name: string | null;
  closed_at: string; // latest result created_at in the group
  is_new: boolean; // closed within the last 24h
  students: CloseStudent[];
}
export interface PendingService {
  camp_session_id: string;
  camp_name: string | null;
  day_number: number | null;
  session_date: string | null;
  coach_name: string | null;
}

const STATUS_RANK: Record<string, number> = { not_yet: 0, partial: 1, achieved: 2, competent: 2 };

export async function getRecentCloses(days = 7): Promise<SessionClose[]> {
  const me = await getCurrentCoach();
  if (!me?.academy_id) return [];
  const admin = createAdminClient();

  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await admin
    .from('student_session_results')
    .select(
      'id, status, coach_feedback, whats_next, created_at, camp_session_id, ' +
        'students:student_id!inner(first_name, last_name, academy_id), ' +
        'coaches:coach_id(display_name), ' +
        'camp_sessions:camp_session_id(session_date, day_number, camp_instances:camp_instance_id(camp_name))'
    )
    .eq('completion_state', 'closed')
    .eq('students.academy_id', me.academy_id)
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  if (error) return [];

  const dayAgo = Date.now() - 86400000;
  const groups = new Map<string, SessionClose>();
  for (const r of data ?? []) {
    const key = (r as any).camp_session_id || (r as any).id;
    const stu: any = Array.isArray((r as any).students) ? (r as any).students[0] : (r as any).students;
    const coach: any = Array.isArray((r as any).coaches) ? (r as any).coaches[0] : (r as any).coaches;
    const sess: any = Array.isArray((r as any).camp_sessions) ? (r as any).camp_sessions[0] : (r as any).camp_sessions;
    const inst: any = sess && (Array.isArray(sess.camp_instances) ? sess.camp_instances[0] : sess.camp_instances);
    let g = groups.get(key);
    if (!g) {
      g = {
        camp_session_id: key,
        camp_name: inst?.camp_name ?? null,
        day_number: sess?.day_number ?? null,
        session_date: sess?.session_date ?? null,
        coach_name: coach?.display_name ?? null,
        closed_at: (r as any).created_at,
        is_new: new Date((r as any).created_at).getTime() >= dayAgo,
        students: [],
      };
      groups.set(key, g);
    }
    g.students.push({
      name: `${stu?.first_name ?? ''} ${stu?.last_name ?? ''}`.trim() || 'Alumno',
      status: (r as any).status ?? null,
      feedback: (r as any).coach_feedback ?? null,
      whats_next: (r as any).whats_next ?? null,
    });
  }
  // Sort students within a group worst-first (so red bubbles up for the coordinator).
  for (const g of groups.values()) {
    g.students.sort((a, b) => (STATUS_RANK[a.status ?? ''] ?? 3) - (STATUS_RANK[b.status ?? ''] ?? 3));
  }
  return Array.from(groups.values());
}

// Services the coach started but hasn't closed yet — pending the close.
export async function getPendingServices(): Promise<PendingService[]> {
  const me = await getCurrentCoach();
  if (!me?.academy_id) return [];
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('service_plans')
    .select(
      'camp_session_id, camp_sessions:camp_session_id(session_date, day_number, ' +
        'camp_instances:camp_instance_id(camp_name, academy_id, head_coach:head_coach_id(display_name)))'
    )
    .eq('completion_state', 'in_progress');
  if (error) return [];

  const rows: PendingService[] = [];
  for (const p of data ?? []) {
    const sess: any = Array.isArray((p as any).camp_sessions) ? (p as any).camp_sessions[0] : (p as any).camp_sessions;
    const inst: any = sess && (Array.isArray(sess.camp_instances) ? sess.camp_instances[0] : sess.camp_instances);
    if (!inst || inst.academy_id !== me.academy_id) continue;
    const hc = Array.isArray(inst.head_coach) ? inst.head_coach[0] : inst.head_coach;
    rows.push({
      camp_session_id: (p as any).camp_session_id,
      camp_name: inst.camp_name ?? null,
      day_number: sess?.day_number ?? null,
      session_date: sess?.session_date ?? null,
      coach_name: hc?.display_name ?? null,
    });
  }
  rows.sort((a, b) => (b.session_date ?? '').localeCompare(a.session_date ?? ''));
  return rows;
}
