'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { getCourse } from '@/lib/constants/courses';
import { revalidatePath } from 'next/cache';

export interface CourseGrantRow {
  id: string;
  student_id: string;
  academy_id: string | null;
  course_key: string;
  granted_at: string;
  granted_by: string | null;
  source: string;
  billable: boolean;
}

// ─── Grant a course to a student ───

export async function grantCourseToStudent(
  studentId: string,
  courseKey: string,
  source: 'manual' | 'auto_on_intake'
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

  // Manual grants require completed intake + signed waiver.
  if (source === 'manual') {
    if (!student.waiver_signed || !student.intake_completed_at) {
      return {
        ok: false,
        error: 'Student must complete intake and sign the waiver first.',
      };
    }
  }

  // Resolve current coach (null for auto-grants / unauthenticated).
  let grantedBy: string | null = null;
  if (source === 'manual') {
    const coach = await getCurrentCoach();
    grantedBy = coach?.id ?? null;
  }

  // Snapshot the course price at grant time so future price changes don't
  // rewrite history. Falls back to (null, 'USD') if pricing isn't set yet.
  const { getCoursePriceCents } = await import('./pricing');
  const priceSnap = await getCoursePriceCents(courseKey);

  // Insert grant; ignore conflict on the unique (student_id, course_key) index.
  const { data: inserted, error: insertErr } = await admin
    .from('course_grants')
    .upsert(
      {
        student_id: studentId,
        academy_id: student.academy_id ?? null,
        course_key: courseKey,
        granted_by: grantedBy,
        source,
        billable: true,
        price_cents: priceSnap?.price_cents ?? null,
        currency: priceSnap?.currency ?? 'USD',
      },
      { onConflict: 'student_id,course_key', ignoreDuplicates: true }
    )
    .select('id');

  if (insertErr) return { ok: false, error: insertErr.message };

  const alreadyGranted = !inserted || inserted.length === 0;

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
