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
  | 'access_code'
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
  const caller = requiresGate ? await getCurrentCoach() : null;
  const callerIsPlatformAdmin = !!caller?.is_platform_admin;

  // SECURITY: a manual grant must come from a coordinator/admin of THIS
  // student's academy (platform admin bypasses). Auto/access-code/purchase
  // sources are gated separately below or are trusted internal callers.
  if (requiresGate && !callerIsPlatformAdmin) {
    const { isCoordinatorOrAbove } = await import('@/lib/actions/auth');
    if (!caller || !(await isCoordinatorOrAbove(caller.role)) || caller.academy_id !== (student as any).academy_id) {
      return { ok: false, error: 'Not authorized to grant this course.' };
    }
  }

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
  const priceSnap = await getCoursePriceCents(courseKey, student.academy_id ?? null);

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

  // Auto-sync Level Access — a course grant should always come with
  // the matching belt's practice library unlocked. Without this the
  // admin would have to click "Grant" twice in two different cards.
  // Idempotent: upsert by (student_id, access_type, level_key).
  // course.key is the same string as the belt's level_key (white_belt,
  // yellow_belt, …) so we can reuse it directly.
  await admin
    .from('student_level_access')
    .upsert(
      {
        student_id: studentId,
        access_type: 'level',
        level_key: course.key,
        source: 'auto_from_course',
        granted_by: grantedBy,
        active: true,
      },
      { onConflict: 'student_id,access_type,level_key' },
    );

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

      // Also close the auto-synced practice library for that belt — otherwise
      // the portal keeps showing "materials unlocked" while the lessons are
      // gated, which looks broken. Only the auto-from-course access is closed;
      // a manually-granted level access is left untouched.
      await admin
        .from('student_level_access')
        .update({ active: false })
        .eq('student_id', grant.student_id)
        .eq('level_key', grant.course_key)
        .eq('source', 'auto_from_course');
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

  const [grantsRes, refresherRes, academiesRes] = await Promise.all([
    admin
      .from('course_grants')
      .select('academy_id_at_grant, course_key, source, billable, price_cents, currency, revoked_at')
      .gte('granted_at', start)
      .lt('granted_at', end),
    admin
      .from('refresher_charges')
      .select('academy_id, course_key, price_cents, currency')
      .gte('created_at', start)
      .lt('created_at', end),
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

  // Refresher charges — repeaters billed at 50%. Shown as a 'refresher'
  // source line per academy/course so the admin sees them distinctly.
  for (const rc of refresherRes.data ?? []) {
    const academyKey = rc.academy_id ?? '__direct__';
    const key = `${academyKey}|${rc.course_key}|refresher`;
    const cur =
      buckets.get(key) ?? {
        academy_id: rc.academy_id ?? null,
        academy_name:
          rc.academy_id && academyMap.get(rc.academy_id)
            ? academyMap.get(rc.academy_id)!
            : 'TSS Direct',
        course_key: rc.course_key,
        source: 'refresher',
        count: 0,
        total_cents: 0,
        currency: rc.currency ?? 'USD',
        revoked_count: 0,
      };
    cur.count += 1;
    cur.total_cents += rc.price_cents ?? 0;
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

// ─── Detailed course-sales log (registry of every grant for backup) ───
//
// Returns one row per grant with the student name, course, sale date, channel
// (source), academy and price. Admin sees all academies; a coordinator/coach
// sees only their own academy. Used by the Course Sales Log page + CSV export.

export interface DetailedGrantRow {
  id: string;
  granted_at: string;
  student_name: string;
  student_id: string;
  course_key: string;
  source: string;
  academy_name: string;
  academy_id: string | null;
  price_cents: number | null;
  currency: string | null;
  billable: boolean;
  granted_by_name: string | null;
  revoked_at: string | null;
}

export async function listDetailedCourseGrants(opts?: {
  /** Restrict to one academy (snapshot at grant). */
  academyId?: string | null;
  /** ISO date lower bound (inclusive). */
  from?: string | null;
  /** ISO date upper bound (exclusive). */
  to?: string | null;
}): Promise<DetailedGrantRow[]> {
  const me = await getCurrentCoach();
  if (!me) return [];

  // Scope: platform admin → all (or a chosen academy); everyone else → own academy.
  const scopedAcademy = me.is_platform_admin
    ? (opts?.academyId ?? null)
    : (me.academy_id ?? '___none___');

  const admin = createAdminClient();
  let q = admin
    .from('course_grants')
    .select('id, granted_at, student_id, course_key, source, academy_id_at_grant, price_cents, currency, billable, granted_by, revoked_at')
    .order('granted_at', { ascending: false })
    .limit(2000);

  if (scopedAcademy) q = q.eq('academy_id_at_grant', scopedAcademy);
  if (opts?.from) q = q.gte('granted_at', opts.from);
  if (opts?.to) q = q.lt('granted_at', opts.to);

  const { data: grants } = await q;
  const rows = grants ?? [];
  if (rows.length === 0) return [];

  // Resolve names in bulk.
  const studentIds = Array.from(new Set(rows.map((r: any) => r.student_id).filter(Boolean)));
  const academyIds = Array.from(new Set(rows.map((r: any) => r.academy_id_at_grant).filter(Boolean)));
  const coachIds = Array.from(new Set(rows.map((r: any) => r.granted_by).filter(Boolean)));

  const [{ data: studs }, { data: acas }, { data: coaches }] = await Promise.all([
    admin.from('students').select('id, first_name, last_name').in('id', studentIds.length ? studentIds : ['___']),
    admin.from('academies').select('id, name').in('id', academyIds.length ? academyIds : ['___']),
    admin.from('coaches').select('id, first_name, last_name, display_name').in('id', coachIds.length ? coachIds : ['___']),
  ]);

  const sMap = new Map((studs ?? []).map((s: any) => [s.id, `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim()]));
  const aMap = new Map((acas ?? []).map((a: any) => [a.id, a.name]));
  const cMap = new Map((coaches ?? []).map((c: any) => [c.id, c.display_name || `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim()]));

  return rows.map((r: any) => ({
    id: r.id,
    granted_at: r.granted_at,
    student_name: sMap.get(r.student_id) || '(unknown)',
    student_id: r.student_id,
    course_key: r.course_key,
    source: r.source,
    academy_name: r.academy_id_at_grant ? (aMap.get(r.academy_id_at_grant) || '(academy)') : 'TSS Direct',
    academy_id: r.academy_id_at_grant,
    price_cents: r.price_cents ?? null,
    currency: r.currency ?? 'USD',
    billable: r.billable,
    granted_by_name: r.granted_by ? (cMap.get(r.granted_by) || null) : null,
    revoked_at: r.revoked_at ?? null,
  }));
}
