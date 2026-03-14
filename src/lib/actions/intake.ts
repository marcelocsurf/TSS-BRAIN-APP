'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// ═══════════════════════════════════════
// INTAKE FORM INPUT
// ═══════════════════════════════════════

export interface IntakeFormInput {
  // Identity
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  languages?: string;
  instagram?: string;

  // Surf profile
  stance?: string;
  surf_experience_years?: string;
  surf_frequency?: string;
  board_type?: string;
  other_sports?: string;
  learning_style?: string;

  // Goals
  goal_short_term?: string;
  goal_mid_term?: string;
  goal_long_term?: string;
  biggest_barrier?: string;
  fears_phobias?: string;

  // Safety
  swim_level?: string;
  allergies?: string;
  injuries?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // Logistics
  height?: string;
  weight?: string;
  shirt_size?: string;
  how_did_you_hear?: string;
  returning_student?: boolean;
  waiver_signed?: boolean;
}

// ═══════════════════════════════════════
// SUBMIT INTAKE
// ═══════════════════════════════════════

export async function submitIntake(token: string, input: IntakeFormInput) {
  const admin = createAdminClient();

  // Find student by portal token
  const { data: student, error: findErr } = await admin
    .from('students')
    .select('id, intake_completed_at')
    .eq('portal_token', token)
    .single();

  if (findErr || !student) {
    throw new Error('Invalid link. Please contact your coordinator.');
  }

  // Allow re-submission (student can update their info)
  // but track when it was first completed
  const isFirstSubmission = !student.intake_completed_at;

  // Clean and prepare updates
  const updates: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      updates[key] = value.trim() || null;
    } else if (value !== undefined) {
      updates[key] = value;
    }
  }

  // Mark intake as completed
  if (isFirstSubmission) {
    updates.intake_completed_at = new Date().toISOString();
  }

  const { error: updateErr } = await admin
    .from('students')
    .update(updates)
    .eq('id', student.id);

  if (updateErr) throw new Error(updateErr.message);

  return { success: true, firstSubmission: isFirstSubmission };
}

// ═══════════════════════════════════════
// GET STUDENT FOR INTAKE (public, minimal)
// ═══════════════════════════════════════

export async function getStudentForIntake(token: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('students')
    .select(`
      id, first_name, last_name, photo_url, belt_level,
      email, phone, age, gender, nationality, languages, instagram,
      date_of_birth, stance, surf_experience_years, surf_frequency,
      board_type, other_sports, learning_style,
      goal_short_term, goal_mid_term, goal_long_term,
      biggest_barrier, fears_phobias,
      swim_level, allergies, injuries, medical_notes,
      emergency_contact_name, emergency_contact_phone,
      height, weight, shirt_size, how_did_you_hear,
      returning_student, waiver_signed, intake_completed_at
    `)
    .eq('portal_token', token)
    .single();

  if (error || !data) return null;
  return data;
}
