'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { getCourse } from '@/lib/constants/courses';
import { revalidatePath } from 'next/cache';

export interface CourseGrantRow {
  id: string;
  student_id: string;
  academy_id: string | null;
  /** Snapshot of academy at grant time — frozen for billing audit. */
  academy_id_at_grant: string | null;
  course_key: string;
  granted_at: string;
  granted_by: string | null;
  source: string;
  billable: boolean;
  price_cents?: number | null;
  currency?: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
}

/** All valid `source` values the UI and auto-flows may set. */
export type GrantSource =
  | 'manual'
  | 'auto_on_intake'
  | 'auto_on_camp_enrol'
  | 'direct_purchase'
  | 'override';

// ─── Grant a course to a student ───

export async function grantCourseToStudent(
  studentId: string,
  courseKey: string,
  source: GrantSource,
  options?: {
    /** Platform admin override: bypass the intake+waiver gate. */
    override?: boolean;
    /** Mark this grant as NOT billable to any academy (e.g. trial, comp). */
    nonBillable?: boolean;
  },
): Promise<{ ok: boolean; error?: string; alreadyGranted?: boolean }> {
  const admin = createAdminClient();

  const course = getCourse(courseKey);
  if (!course) return { ok: false, error: 'Unknown course.' };

  const { data: student, error: findErr } = await admin
    .from('students')
    .select('id, academy_id, waiver_signed, intake_completed_at')
    .eq('id', studentId)
    .single();

  if (findErr || !student) return { ok: false, error: 'Student not found.' };

  // Manual grants require completed intake + signed waiver, UNLESS the
  // caller is the platform admin using the override flag, OR this is a
  // direct-purchase grant (TSS collected payment off-platform — waiver
  // is signed in a separate flow). Auto grants skip the gate by design.
  const requiresGate = source === 'manual';
  const callerIsPlatformAdmin = requiresGate
    ? !!(await getCurrentCoach())?.is_platform_admin
    : false;

  if (requiresGate && !options?.override) {
    if (!student.waiver_signed || !student.intake_completed_at) {
      return {
        ok: false,
        error: 'Student must complete intake and sign the waiver first.',
      };
    }
  }
  if (requiresGate && options?.override && !callerIsPlatformAdmin) {
    return {
      ok: false,
      error: 'Override is restricted to platform administrators.',
    };
  }

  // Direct purchases bypass the waiver gate AND skip academy billing,
  // so only the platform admin can initiate them — coordinators could
  // otherwise mark grants as "not their academy's bill".
  if (source === 'direct_purchase') {
    const callerForDirect = await getCurrentCoach();
    if (!callerForDirect?.is_platform_admin) {
      return {
        ok: false,
        error: 'Direct purchase grants are restricted to platform administrators.',
      };
    }
  }

  // Resolve current coach (null for auto-grants / unauthenticated).
  let grantedBy: string | null = null;
  if (source === 'manual' || source === 'direct_purchase' || source === 'override') {
    const coach = await getCurrentCoach();
    grantedBy = coach?.id ?? null;
  }

  // Snapshot the course price at grant time so future price changes don't
  // rewrite history. Falls back to (null, 'USD') if pricing isn't set yet.
  const { getCoursePriceCents } = await import('./pricing');
  const priceSnap = await getCoursePriceCents(courseKey);

  // Coerce the source if the caller passed manual+override.
  const effectiveSource: GrantSource =
    source === 'manual' && options?.override ? 'override' : source;

  // Snapshot academy_id_at_grant. Direct purchases never bill an
  // academy → snapshot null. nonBillable flag also flips off billable.
  const academyIdAtGrant =
    effectiveSource === 'direct_purchase' ? null : student.academy_id ?? null;
  const billable = !options?.nonBillable && effectiveSource !== 'direct_purchase';

  // M82 — the unique index is now PARTIAL (only active rows). Postgres'
  // ON CONFLICT can't target a partial index without an explicit
  // index_predicate, which the Supabase JS client doesn't expose. So
  // we replace the previous upsert with a check-then-insert: detect
  // the active grant manually, INSERT only if none. Re-granting after
  // a previous revoke produces a brand-new row (correct audit trail).
  const { data: existing } = await admin
    .from('course_grants')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_key', courseKey)
    .is('revoked_at', null)
    .maybeSingle();

  const alreadyGranted = !!existing;

  if (!alreadyGranted) {
    const { error: insertErr } = await admin
      .from('course_grants')
      .insert({
        student_id: studentId,
        academy_id: student.academy_id ?? null,
        academy_id_at_grant: academyIdAtGrant,
        course_key: courseKey,
        granted_by: grantedBy,
        source: effectiveSource,
        billable,
        price_cents: priceSnap?.price_cents ?? null,
        currency: priceSnap?.currency ?? 'USD',
      });
    if (insertErr) return { ok: false, error: insertErr.message };
  }

  // Always ensure the access column is set (idempotent).
  const { error: updateErr } = await admin
    .from('students')
    .update({ [course.accessColumn]: true })
    .eq('id', studentId);

  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath('/students/' + studentId);

  if (alreadyGranted) return { ok: true, alreadyGranted: true };
  return { ok: true };
}

// ─── Revoke a course grant (platform admin) ───
// Soft-revokes: marks revoked_at + revoked_by, flips the boolean access
// column on the student to false. The grant row remains in the audit
// log forever — the billing dashboard can decide whether to count it.

export async function revokeCourseGrant(
  grantId: string,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) {
    return { ok: false, error: 'Only the platform admin can revoke a course grant.' };
  }
  const admin = createAdminClient();

  const { data: grant, error: findErr } = await admin
    .from('course_grants')
    .select('id, student_id, course_key, revoked_at')
    .eq('id', grantId)
    .single();
  if (findErr || !grant) return { ok: false, error: 'Grant not found.' };
  if (grant.revoked_at) return { ok: false, error: 'Already revoked.' };

  const course = getCourse(grant.course_key);

  const { error: revokeErr } = await admin
    .from('course_grants')
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: coach.id,
      revoke_reason: reason?.trim() || null,
    })
    .eq('id', grantId);
  if (revokeErr) return { ok: false, error: revokeErr.message };

  // Drop the boolean access column on the student so the portal hides
  // the course immediately. Only flip if the student has no OTHER
  // active grant for the same course_key.
  if (course) {
    const { data: stillActive } = await admin
      .from('course_grants')
      .select('id')
      .eq('student_id', grant.student_id)
      .eq('course_key', grant.course_key)
      .is('revoked_at', null)
      .limit(1);
    if (!stillActive || stillActive.length === 0) {
      await admin
        .from('students')
        .update({ [course.accessColumn]: false })
        .eq('id', grant.student_id);
    }
  }

  revalidatePath('/students/' + grant.student_id);
  revalidatePath('/admin/billing');
  return { ok: true };
}

// ─── Activate all pending courses after intake + waiver complete ───

export async function activatePendingCoursesForStudent(
  studentId: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: student, error: findErr } = await admin
    .from('students')
    .select('id, pending_courses')
    .eq('id', studentId)
    .single();

  if (findErr || !student) return { ok: false, error: 'Student not found.' };

  const pending: string[] = Array.isArray(student.pending_courses)
    ? student.pending_courses
    : [];

  for (const courseKey of pending) {
    await grantCourseToStudent(studentId, courseKey, 'auto_on_intake');
  }

  // Clear pending_courses regardless (unique index guards duplicates).
  await admin
    .from('students')
    .update({ pending_courses: [] })
    .eq('id', studentId);

  revalidatePath('/students/' + studentId);
  return { ok: true };
}

// ─── List a student's course grants ───

export async function listStudentCourseGrants(
  studentId: string
): Promise<CourseGrantRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('course_grants')
    .select('*')
    .eq('student_id', studentId)
    .order('granted_at', { ascending: false });

  if (error || !data) return [];
  return data as CourseGrantRow[];
}

// ─── Admin billing rollup: per academy, for a given month ───
//
// Returns one row per (academy, course_key, source). Includes a
// "direct" bucket (academy_id_at_grant IS NULL) so TSS-direct sales
// are visible separately. Revoked grants are excluded from billable
// totals but listed under `revoked_count` for reference.

export interface BillingMonthRow {
  academy_id: string | null;
  academy_name: string;
  course_key: string;
  source: string;
  count: number;
  total_cents: number;
  currency: string;
  revoked_count: number;
}

export async function getBillingForMonth(
  yearMonth: string, // 'YYYY-MM'
): Promise<BillingMonthRow[]> {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) return [];

  const admin = createAdminClient();

  // Compute UTC month boundaries from the YYYY-MM input.
  const [y, m] = yearMonth.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return [];
  const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
  const end = new Date(Date.UTC(y, m, 1)).toISOString();

  const [grantsRes, academiesRes] = await Promise.all([
    admin
      .from('course_grants')
      .select('academy_id_at_grant, course_key, source, billable, price_cents, currency, revoked_at')
      .gte('granted_at', start)
      .lt('granted_at', end),
    admin.from('academies').select('id, name'),
  ]);

  const grants = grantsRes.data ?? [];
  const academyMap = new Map<string, string>(
    (academiesRes.data ?? []).map((a: { id: string; name: string }) => [a.id, a.name]),
  );

  // Roll up by (academy_id_at_grant, course_key, source).
  const buckets = new Map<string, BillingMonthRow>();
  for (const g of grants) {
    const academyKey = g.academy_id_at_grant ?? '__direct__';
    const key = `${academyKey}|${g.course_key}|${g.source}`;
    const cur =
      buckets.get(key) ?? {
        academy_id: g.academy_id_at_grant ?? null,
        academy_name:
          g.academy_id_at_grant && academyMap.get(g.academy_id_at_grant)
            ? academyMap.get(g.academy_id_at_grant)!
            : 'TSS Direct',
        course_key: g.course_key,
        source: g.source,
        count: 0,
        total_cents: 0,
        currency: g.currency ?? 'USD',
        revoked_count: 0,
      };
    if (g.revoked_at) {
      cur.revoked_count += 1;
    } else if (g.billable) {
      cur.count += 1;
      cur.total_cents += g.price_cents ?? 0;
    } else {
      // Non-billable but not revoked — still counted in `count` so the
      // admin sees the volume, but contributes 0 to total_cents.
      cur.count += 1;
    }
    buckets.set(key, cur);
  }

  return Array.from(buckets.values()).sort((a, b) => {
    if (a.academy_name === b.academy_name) {
      return a.course_key.localeCompare(b.course_key);
    }
    return a.academy_name.localeCompare(b.academy_name);
  });
}

// ─── Admin billing tally: course grants per academy per month ───

export async function getCourseGrantBillingByAcademy(): Promise<
  {
    academy_id: string;
    academy_name: string;
    total_grants: number;
    this_month_grants: number;
  }[]
> {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) return [];

  const admin = createAdminClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: grants } = await admin
    .from('course_grants')
    .select('academy_id, granted_at');

  const { data: academies } = await admin.from('academies').select('id, name');

  if (!grants || !academies) return [];

  const academyMap = new Map<string, string>(
    academies.map((a: { id: string; name: string }) => [a.id, a.name])
  );

  const byAcademy = new Map<string, { total: number; thisMonth: number }>();

  for (const g of grants) {
    if (!g.academy_id) continue;
    const entry = byAcademy.get(g.academy_id) ?? { total: 0, thisMonth: 0 };
    entry.total++;
    if (g.granted_at >= monthStart) entry.thisMonth++;
    byAcademy.set(g.academy_id, entry);
  }

  return Array.from(byAcademy.entries()).map(([academy_id, stats]) => ({
    academy_id,
    academy_name: academyMap.get(academy_id) ?? 'Unknown',
    total_grants: stats.total,
    this_month_grants: stats.thisMonth,
  }));
}
