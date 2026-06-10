'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  scoreOceanQuiz,
  isOceanQuizComplete,
  type OceanQuizAnswers,
} from '@/lib/constants/ocean-quiz';
import { activatePendingCoursesForStudent } from './course-grants';

// ═══════════════════════════════════════
// INTAKE FORM INPUTS
// ═══════════════════════════════════════

export interface BasicIntakeInput {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  swim_level: string;
  allergies?: string;
  medical_notes?: string;
  waiver_signed: boolean;
}

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

  // Adaptive — beginner branch
  board_familiarity?: string;
  water_comfort?: string;

  // Adaptive — experienced branch
  comfort_wave_size?: string;
  maneuvers_current?: string[];
  surf_injuries?: string;

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
// SUBMIT BASIC INTAKE (Stage 1)
// ═══════════════════════════════════════

export async function submitBasicIntake(token: string, input: BasicIntakeInput) {
  const admin = createAdminClient();

  // Find student by portal token
  const { data: student, error: findErr } = await admin
    .from('students')
    .select('id, intake_completed_at, intake_tier')
    .eq('portal_token', token)
    .single();

  if (findErr || !student) {
    throw new Error('Invalid link. Please contact your coordinator.');
  }

  // Validate required fields
  if (!input.emergency_contact_name?.trim()) {
    throw new Error('Emergency contact name is required.');
  }
  if (!input.emergency_contact_phone?.trim()) {
    throw new Error('Emergency contact phone is required.');
  }
  if (!input.swim_level) {
    throw new Error('Swim level is required.');
  }
  if (!input.waiver_signed) {
    throw new Error('Please acknowledge the waiver to continue.');
  }

  const isFirstSubmission = !student.intake_completed_at;

  const updates: Record<string, unknown> = {
    emergency_contact_name: input.emergency_contact_name.trim(),
    emergency_contact_phone: input.emergency_contact_phone.trim(),
    swim_level: input.swim_level,
    allergies: input.allergies?.trim() || null,
    medical_notes: input.medical_notes?.trim() || null,
    waiver_signed: true,
    waiver_signed_at: new Date().toISOString(),
    intake_tier: 'basic',
  };

  if (isFirstSubmission) {
    updates.intake_completed_at = new Date().toISOString();
  }

  const { error: updateErr } = await admin
    .from('students')
    .update(updates)
    .eq('id', student.id);

  if (updateErr) throw new Error(updateErr.message);

  // Intake + waiver are now complete — auto-activate any earmarked courses.
  // A grant failure must never block intake submission.
  try {
    await activatePendingCoursesForStudent(student.id);
  } catch (err) {
    console.error('activatePendingCoursesForStudent failed:', err);
  }

  return { success: true, firstSubmission: isFirstSubmission };
}

// ═══════════════════════════════════════
// SUBMIT EXTENDED INTAKE (Stage 2)
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

  // Mark intake as completed and set extended tier
  if (isFirstSubmission) {
    updates.intake_completed_at = new Date().toISOString();
  }
  updates.intake_tier = 'extended';

  const { error: updateErr } = await admin
    .from('students')
    .update(updates)
    .eq('id', student.id);

  if (updateErr) throw new Error(updateErr.message);

  return { success: true, firstSubmission: isFirstSubmission };
}

// ═══════════════════════════════════════
// SUBMIT OCEAN QUIZ (Stage 0 — runs before Basic intake)
// ═══════════════════════════════════════

export async function submitOceanQuiz(token: string, answers: OceanQuizAnswers) {
  const admin = createAdminClient();

  if (!isOceanQuizComplete(answers)) {
    throw new Error('Please answer all questions before submitting.');
  }

  // Find student by portal token
  const { data: student, error: findErr } = await admin
    .from('students')
    .select('id, ocean_level_provisional')
    .eq('portal_token', token)
    .single();

  if (findErr || !student) {
    throw new Error('Invalid link. Please contact your coordinator.');
  }

  const { level, score } = scoreOceanQuiz(answers);

  const { error: updateErr } = await admin
    .from('students')
    .update({
      ocean_level: level,
      ocean_level_provisional: true,
      ocean_quiz_answers: answers,
      ocean_quiz_score: score,
      ocean_quiz_completed_at: new Date().toISOString(),
    })
    .eq('id', student.id);

  if (updateErr) throw new Error(updateErr.message);

  return { success: true, level, score };
}

// ═══════════════════════════════════════
// GET STUDENT FOR INTAKE (public, minimal)
// ═══════════════════════════════════════

export async function getStudentForIntake(token: string) {
  const admin = createAdminClient();

  // Use select('*') so the page does not 500/404 when new columns are
  // added in code but the migration hasn't been applied to Supabase yet.
  // The form treats every field as optional / nullable.
  const { data, error } = await admin
    .from('students')
    .select('*')
    .eq('portal_token', token)
    .single();

  if (error || !data) return null;
  return data;
}
