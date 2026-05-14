'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CoachRole } from '@/lib/constants/brand';

export interface CurrentCoach {
  id: string;
  display_name: string;
  role: CoachRole;
  academy_id?: string | null;
  is_platform_admin?: boolean;
}

export async function getCurrentCoach(): Promise<CurrentCoach | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('coaches')
    .select('id, display_name, role, academy_id, is_platform_admin')
    .eq('auth_user_id', user.id)
    .single();

  if (!data) return null;
  return data as CurrentCoach;
}

// Quick permission checks (async required by 'use server' directive)
export async function isAdmin(role: CoachRole): Promise<boolean> {
  return role === 'admin';
}

export async function isCoordinatorOrAbove(role: CoachRole): Promise<boolean> {
  return role === 'admin' || role === 'coordinator';
}

export async function isCoachOrAbove(role: CoachRole): Promise<boolean> {
  return role === 'admin' || role === 'coordinator' || role === 'coach';
}

// ─── Multi-tenant scope helpers (M1) ─────────────────────────────
//
// getCurrentAcademyId(): the academy the current coach belongs to.
// Returns null for platform_admin (= "see across all academies").
// Returns null if no coach record is found (caller decides what to do).

export async function getCurrentAcademyId(): Promise<string | null> {
  const coach = await getCurrentCoach();
  if (!coach) return null;
  if (coach.is_platform_admin) return null;
  return coach.academy_id ?? null;
}

// ─── Time-bounded coach access (M3) ──────────────────────────────
//
// Returns the set of student_ids a coach can see right now.
// Access window: any camp_instance where (coach_id = me OR head_coach_id = me)
// AND today BETWEEN start_date AND (end_date + 1 day inclusive).
// Used only when role === 'coach' AND NOT platform_admin. Coordinators
// and platform admins are not gated by this — they see all academy
// students.

export async function getCoachAccessibleStudentIds(coachId: string): Promise<string[]> {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // Pull all camp_instances assigned to this coach. Filter precisely in JS.
  const { data: instances } = await admin
    .from('camp_instances')
    .select('id, start_date, end_date')
    .or(`coach_id.eq.${coachId},head_coach_id.eq.${coachId}`);

  if (!instances || instances.length === 0) return [];

  const todayDate = new Date(today);
  const activeInstances = instances.filter((c: any) => {
    if (!c.start_date || !c.end_date) return false;
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    end.setDate(end.getDate() + 1); // window is end_date + 1 day inclusive
    return todayDate >= start && todayDate <= end;
  });

  if (activeInstances.length === 0) return [];

  const instanceIds = activeInstances.map((c: any) => c.id);
  const { data: participants } = await admin
    .from('camp_participants')
    .select('student_id')
    .in('camp_instance_id', instanceIds)
    .eq('enrollment_status', 'active');

  return Array.from(new Set((participants ?? []).map((p: any) => p.student_id as string)));
}
