'use server';

import { cookies } from 'next/headers';
import { elSalvadorToday } from '@/lib/utils/tz';
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

// M7 — Act-as-academy cookie. Lets platform_admin (Marcelo) temporarily
// view the app scoped to a single academy, as if they were that
// academy's coordinator. Without this he sees everything mixed.
const ACT_AS_COOKIE = 'tss_act_as_academy_id';

// Internal — fetches the actual logged-in coach row without applying any
// act-as override. Used both by getCurrentCoach and by actAsAcademy to
// verify the caller is platform admin before letting them switch.
async function getCurrentCoachRaw(): Promise<CurrentCoach | null> {
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

export async function getCurrentCoach(): Promise<CurrentCoach | null> {
  const raw = await getCurrentCoachRaw();
  if (!raw) return null;

  // If platform admin has set the act-as cookie, present them as a
  // coordinator of the cookie's academy. The rest of the app already
  // scopes by academy_id when is_platform_admin is false, so this one
  // override scopes everything (students, coaches, camps, dashboard).
  if (raw.is_platform_admin) {
    const cookieStore = await cookies();
    const actAs = cookieStore.get(ACT_AS_COOKIE)?.value;
    if (actAs) {
      return {
        ...raw,
        academy_id: actAs,
        is_platform_admin: false,
        role: 'coordinator' as CoachRole, // act as coordinator of that academy
      };
    }
  }

  return raw;
}

// Public read-only flag for the dashboard layout banner. Returns the
// academy_id currently being impersonated (or null if not acting-as).
export async function getActAsAcademyId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACT_AS_COOKIE)?.value ?? null;
}

// Real platform-admin check that ignores the act-as override. Useful for
// rendering the "Exit act-as" banner only when a real admin is in
// act-as mode.
export async function isRealPlatformAdmin(): Promise<boolean> {
  const raw = await getCurrentCoachRaw();
  return !!raw?.is_platform_admin;
}

// Set or clear the act-as-academy cookie. Only platform admin can call this.
export async function actAsAcademy(academyId: string | null): Promise<void> {
  const raw = await getCurrentCoachRaw();
  if (!raw?.is_platform_admin) {
    throw new Error('Only platform admin can act as another academy.');
  }
  const cookieStore = await cookies();
  if (academyId === null) {
    cookieStore.delete(ACT_AS_COOKIE);
    return;
  }
  // Validate the academy exists
  const admin = createAdminClient();
  const { data: academy } = await admin
    .from('academies')
    .select('id')
    .eq('id', academyId)
    .single();
  if (!academy) throw new Error('Academy not found.');

  cookieStore.set(ACT_AS_COOKIE, academyId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
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
// Returns null for platform_admin NOT in act-as mode (= "see across all
// academies"). Returns the act-as academy_id when admin is impersonating.

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
  const today = elSalvadorToday();

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
