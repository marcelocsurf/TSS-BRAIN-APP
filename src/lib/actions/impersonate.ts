'use server';

// Admin impersonation — Tanda 5 of the onboarding plan.
//
// Platform admins (Marcelo, course owners) can "Open as" any student,
// coach, or coordinator-of-academy from the dashboard list views. The
// student/coach portals already authenticate by portal_token in the URL,
// so the impersonation is largely UX + audit + a persistent banner.
//
// The audit trail lives in admin_impersonations (created in M58).

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin, getCurrentCoach } from './auth';

const IMP_COOKIE = 'tss_impersonate';

export type ImpersonationTarget =
  | { kind: 'student'; portal_token: string; name: string; studentId: string }
  | { kind: 'coach'; portal_token: string; name: string; coachId: string };

async function ensureAdmin(): Promise<{ adminCoachId: string }> {
  const me = await getCurrentCoach();
  const real = await isRealPlatformAdmin();
  if (!me || !real) throw new Error('Not authorized.');
  return { adminCoachId: me.id };
}

// ─── Student impersonation ───
export async function startStudentImpersonation(studentId: string): Promise<string> {
  const { adminCoachId } = await ensureAdmin();
  const admin = createAdminClient();

  const { data: student, error } = await admin
    .from('students')
    .select('id, portal_token, first_name, last_name')
    .eq('id', studentId)
    .single();
  if (error || !student) throw new Error('Student not found.');

  await admin.from('admin_impersonations').insert({
    admin_coach_id: adminCoachId,
    target_kind: 'student',
    target_id: studentId,
  });

  // Persist the impersonation in a cookie so the banner stays visible
  // across navigations inside the impersonated portal.
  const jar = await cookies();
  jar.set(IMP_COOKIE, JSON.stringify({
    kind: 'student',
    targetId: studentId,
    portalToken: student.portal_token,
    name: `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || 'Student',
  }), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours — generous for a working session
  });

  return `/portal/${student.portal_token}?impersonate=1`;
}

// ─── Coach impersonation ───
export async function startCoachImpersonation(coachId: string): Promise<string> {
  const { adminCoachId } = await ensureAdmin();
  const admin = createAdminClient();

  // Coach portal lookups are by portal_token too (`/coach-portal/[token]`).
  const { data: coach, error } = await admin
    .from('coaches')
    .select('id, portal_token, display_name, first_name, last_name')
    .eq('id', coachId)
    .single();
  if (error || !coach) throw new Error('Coach not found.');
  if (!coach.portal_token) {
    throw new Error('Coach has no portal_token. Set one before impersonating.');
  }

  await admin.from('admin_impersonations').insert({
    admin_coach_id: adminCoachId,
    target_kind: 'coach',
    target_id: coachId,
  });

  const displayName =
    coach.display_name ||
    `${coach.first_name ?? ''} ${coach.last_name ?? ''}`.trim() ||
    'Coach';

  const jar = await cookies();
  jar.set(IMP_COOKIE, JSON.stringify({
    kind: 'coach',
    targetId: coachId,
    portalToken: coach.portal_token,
    name: displayName,
  }), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return `/coach-portal/${coach.portal_token}?impersonate=1`;
}

// ─── Coordinator (academy) impersonation ───
// Wraps the existing actAsAcademy() so we still get the audit row.
export async function startCoordinatorImpersonation(academyId: string): Promise<string> {
  const { adminCoachId } = await ensureAdmin();
  const admin = createAdminClient();

  await admin.from('admin_impersonations').insert({
    admin_coach_id: adminCoachId,
    target_kind: 'coordinator',
    target_id: academyId,
  });

  const { actAsAcademy } = await import('./auth');
  await actAsAcademy(academyId);
  return '/dashboard';
}

// ─── Active impersonation lookup (for banner) ───
export async function getActiveStudentOrCoachImpersonation(): Promise<
  ImpersonationTarget | null
> {
  const jar = await cookies();
  const raw = jar.get(IMP_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as
      | { kind: 'student'; targetId: string; portalToken: string; name: string }
      | { kind: 'coach'; targetId: string; portalToken: string; name: string };
    if (parsed.kind === 'student') {
      return {
        kind: 'student',
        portal_token: parsed.portalToken,
        name: parsed.name,
        studentId: parsed.targetId,
      };
    }
    if (parsed.kind === 'coach') {
      return {
        kind: 'coach',
        portal_token: parsed.portalToken,
        name: parsed.name,
        coachId: parsed.targetId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── End impersonation: close the audit row + clear cookie ───
export async function endImpersonation(): Promise<void> {
  const { adminCoachId } = await ensureAdmin();
  const admin = createAdminClient();

  // Close the most recent open impersonation row for this admin.
  const { data: openRows } = await admin
    .from('admin_impersonations')
    .select('id')
    .eq('admin_coach_id', adminCoachId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1);

  if (openRows && openRows.length > 0) {
    await admin
      .from('admin_impersonations')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', openRows[0].id);
  }

  // Clear both impersonation cookie and the act-as-academy cookie.
  const jar = await cookies();
  jar.delete(IMP_COOKIE);
  jar.delete('tss_act_as_academy_id');

  redirect('/dashboard');
}
