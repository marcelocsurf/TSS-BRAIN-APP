'use server';

// Lead lifecycle — a Lead is a prospective student who can attend 1–3 trial
// classes (surf lessons) but has no portal access yet. The coach captures
// the minimum safety info (waiver + emergency contact + swim level + medical)
// so the academy can take the student in the water without risk.
//
// When the Lead decides to enroll in a course (e.g. via a Surf Camp that
// includes white_belt), `promoteLeadToMember` flips the lifecycle_status to
// 'member' and seeds pending_courses so the next intake submission auto-
// grants the course.

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { getCurrentCoach } from './auth';

type CreateLeadInput = {
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  academy_id?: string | null;
  /** 'member' (academy, portal+course) | 'dropin' (single service, no portal/course). */
  student_type?: 'member' | 'dropin';
  /** Skip the duplicate-detection guard (caller confirmed it's a new person). */
  allowDuplicate?: boolean;
};

export type DuplicateMatch = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  matched_on: 'email' | 'phone';
};

// Look for an existing active student with the same email or phone in the
// same academy. Returns matches so the caller can decide to reuse the
// existing profile instead of creating a duplicate in the bitácora.
export async function findDuplicateStudents(input: {
  email?: string | null;
  phone?: string | null;
  academy_id?: string | null;
}): Promise<DuplicateMatch[]> {
  const me = await getCurrentCoach();
  if (!me) throw new Error('Not authenticated');
  const admin = createAdminClient();
  const academyId = input.academy_id ?? me.academy_id ?? null;

  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;
  if (!email && !phone) return [];

  let q = admin
    .from('students')
    .select('id, first_name, last_name, email, phone')
    .eq('status', 'active');
  if (academyId) q = q.eq('academy_id', academyId);

  const { data } = await q;
  const matches: DuplicateMatch[] = [];
  for (const s of data ?? []) {
    if (email && s.email && s.email.trim().toLowerCase() === email) {
      matches.push({ ...s, matched_on: 'email' });
    } else if (phone && s.phone && s.phone.trim() === phone) {
      matches.push({ ...s, matched_on: 'phone' });
    }
  }
  return matches;
}

export async function createLead(input: CreateLeadInput): Promise<{
  studentId: string;
  leadToken: string;
  leadFormUrl: string;
}> {
  const me = await getCurrentCoach();
  if (!me) throw new Error('Not authenticated');

  if (!input.first_name?.trim()) throw new Error('First name is required');
  if (!input.last_name?.trim()) throw new Error('Last name is required');

  const admin = createAdminClient();

  // Default academy to the coach's own academy when not specified.
  const academyId = input.academy_id ?? me.academy_id ?? null;

  // Duplicate guard — block creating a second record for someone who
  // already exists (same email/phone in this academy) unless the caller
  // explicitly confirmed it's a different person.
  if (!input.allowDuplicate) {
    const dupes = await findDuplicateStudents({
      email: input.email,
      phone: input.phone,
      academy_id: academyId,
    });
    if (dupes.length > 0) {
      const d = dupes[0];
      throw new Error(
        `DUPLICATE::${d.id}::${d.first_name} ${d.last_name}::${d.matched_on}`,
      );
    }
  }

  const portalToken = randomUUID();

  const { data, error } = await admin
    .from('students')
    .insert({
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      academy_id: academyId,
      portal_token: portalToken,
      lifecycle_status: 'lead',
      student_type: input.student_type ?? 'member',
      // Leads start with NO course access; they only get it once promoted.
      course_access_white: false,
      course_access_yellow: false,
      // Set sensible defaults for required-not-null fields used elsewhere.
      belt_level: 'white_belt',
      ocean_level: 'beginner',
      current_sequence_number: 1,
      current_step_order: 1,
      status: 'active',
      waiver_signed: false,
    })
    .select('id, portal_token')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create lead');

  revalidatePath('/dashboard/students');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return {
    studentId: data.id,
    leadToken: data.portal_token,
    leadFormUrl: `${baseUrl}/lead/${data.portal_token}`,
  };
}

type LeadSafetyInput = {
  date_of_birth: string;
  height?: string | null;
  weight?: string | null;
  swim_level: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  allergies?: string | null;
  injuries?: string | null;
  medical_notes?: string | null;
  waiver_signed: boolean;
};

export async function submitLeadForm(
  portalToken: string,
  input: LeadSafetyInput,
): Promise<void> {
  if (!input.waiver_signed) throw new Error('You must accept the waiver to continue.');
  if (!input.emergency_contact_name?.trim()) throw new Error('Emergency contact name is required.');
  if (!input.emergency_contact_phone?.trim()) throw new Error('Emergency contact phone is required.');
  if (!input.date_of_birth) throw new Error('Date of birth is required.');
  if (!input.swim_level) throw new Error('Swim level is required.');

  const admin = createAdminClient();

  const { data: student, error: lookupErr } = await admin
    .from('students')
    .select('id, lifecycle_status')
    .eq('portal_token', portalToken)
    .single();

  if (lookupErr || !student) throw new Error('Lead not found.');
  if (student.lifecycle_status !== 'lead') {
    // Already promoted — let them keep editing safety info but don't error.
  }

  const { error } = await admin
    .from('students')
    .update({
      date_of_birth: input.date_of_birth,
      height: input.height?.trim() || null,
      weight: input.weight?.trim() || null,
      swim_level: input.swim_level,
      emergency_contact_name: input.emergency_contact_name.trim(),
      emergency_contact_phone: input.emergency_contact_phone.trim(),
      allergies: input.allergies?.trim() || null,
      injuries: input.injuries?.trim() || null,
      medical_notes: input.medical_notes?.trim() || null,
      waiver_signed: true,
      waiver_signed_at: new Date().toISOString(),
      // Mark that the lead has completed the safety mini-form. We reuse
      // intake_tier='lead' so existing dashboards can distinguish.
      intake_tier: 'lead',
    })
    .eq('id', student.id);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/students');
}

// Coach action: promote a Lead to Member when they enroll in a course.
// Seeds pending_courses so the next intake submission (extended) auto-grants
// the course via activatePendingCoursesForStudent.
export async function promoteLeadToMember(
  studentId: string,
  courseKey: 'white_belt' | 'yellow_belt',
): Promise<void> {
  const me = await getCurrentCoach();
  if (!me) throw new Error('Not authenticated');

  const admin = createAdminClient();

  const { data: student, error: lookupErr } = await admin
    .from('students')
    .select('id, pending_courses, lifecycle_status')
    .eq('id', studentId)
    .single();

  if (lookupErr || !student) throw new Error('Student not found.');

  const pending = Array.isArray(student.pending_courses) ? student.pending_courses : [];
  if (!pending.includes(courseKey)) pending.push(courseKey);

  const { error } = await admin
    .from('students')
    .update({
      lifecycle_status: 'member',
      promoted_to_member_at: student.lifecycle_status === 'lead'
        ? new Date().toISOString()
        : undefined,
      pending_courses: pending,
    })
    .eq('id', studentId);

  if (error) throw new Error(error.message);

  // Grant the course immediately — enrolling in a course IS the billable
  // event for the academy. Course (lesson) access isn't gated behind the
  // waiver (the waiver gates in-water sessions, not online content). This
  // closes the gap where a promoted member sat with pending_courses that
  // never activated unless they happened to finish the extended intake.
  try {
    const { activatePendingCoursesForStudent } = await import('./course-grants');
    await activatePendingCoursesForStudent(studentId);
  } catch (e) {
    console.error('[promoteLeadToMember] course activation failed', e);
  }

  revalidatePath('/dashboard/students');
}
