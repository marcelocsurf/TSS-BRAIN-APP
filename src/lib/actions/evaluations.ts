'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ═══════════════════════════════════════
// EVALUATE STUDENT SEQUENCE
// ═══════════════════════════════════════

export async function evaluateStudentSequence(input: {
  studentId: string;
  coachId: string;
  sequenceNumber: number;
  stepNumber: number;
  status: 'passed' | 'failed' | 'in_progress';
  evaluationType?: 'progression' | 'assessment' | 'correction';
  notes?: string;
}) {
  const supabase = await createClient();

  // Get current student progression for "previous" snapshot
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('current_sequence_number, current_step_order')
    .eq('id', input.studentId)
    .single();

  if (studentErr || !student) throw new Error('Student not found');

  // Create evaluation record
  const { data: evaluation, error: evalErr } = await supabase
    .from('sequence_evaluations')
    .insert({
      student_id: input.studentId,
      evaluated_by: input.coachId,
      sequence_number: input.sequenceNumber,
      step_number: input.stepNumber,
      previous_sequence: student.current_sequence_number,
      previous_step: student.current_step_order,
      evaluation_type: input.evaluationType || 'progression',
      status: input.status,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (evalErr) throw new Error(evalErr.message);

  // Update student's current position
  const { error: updateErr } = await supabase
    .from('students')
    .update({
      current_sequence_number: input.sequenceNumber,
      current_step_order: input.stepNumber,
    })
    .eq('id', input.studentId);

  if (updateErr) throw new Error(updateErr.message);

  revalidatePath(`/students/${input.studentId}`);
  return evaluation;
}

// ═══════════════════════════════════════
// EVALUATE OCEAN LEVEL
// ═══════════════════════════════════════

export async function evaluateOceanLevel(input: {
  studentId: string;
  coachId: string;
  newLevel: string;
  method?: 'quiz' | 'coach_assessment' | 'evaluation';
  notes?: string;
}) {
  const supabase = await createClient();

  // Get current ocean level for "previous" snapshot
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('ocean_level')
    .eq('id', input.studentId)
    .single();

  if (studentErr || !student) throw new Error('Student not found');

  // Create evaluation record
  const { data: evaluation, error: evalErr } = await supabase
    .from('ocean_level_evaluations')
    .insert({
      student_id: input.studentId,
      evaluated_by: input.coachId,
      previous_level: student.ocean_level,
      new_level: input.newLevel,
      method: input.method || 'coach_assessment',
      notes: input.notes || null,
    })
    .select()
    .single();

  if (evalErr) throw new Error(evalErr.message);

  // Update student's ocean level — coach override clears the provisional flag
  const { error: updateErr } = await supabase
    .from('students')
    .update({ ocean_level: input.newLevel, ocean_level_provisional: false })
    .eq('id', input.studentId);

  if (updateErr) throw new Error(updateErr.message);

  revalidatePath(`/students/${input.studentId}`);
  return evaluation;
}

// ═══════════════════════════════════════
// SET OFFICIAL STEP RATING (M4)
// ═══════════════════════════════════════
//
// Coach can rate any STP for a student at any time. The rating lives in
// student_step_ratings.coach_rating + coach_rated_at + coach_rated_by,
// separate from current_rating (student self-rating). Portal renders gold
// when coach_rating is set; falls back to amber self-rating otherwise.

export async function setOfficialStepRating(input: {
  studentId: string;
  stepId: string;
  rating: number | null;  // null = clear official rating
  coachId: string;
}) {
  const supabase = await createClient();

  if (input.rating !== null && (input.rating < 1 || input.rating > 5)) {
    throw new Error('Rating must be 1-5 or null to clear.');
  }

  // Upsert the row keyed by (student_id, step_id)
  const { error } = await supabase
    .from('student_step_ratings')
    .upsert(
      {
        student_id: input.studentId,
        step_id: input.stepId,
        coach_rating: input.rating,
        coach_rated_at: input.rating !== null ? new Date().toISOString() : null,
        coach_rated_by: input.rating !== null ? input.coachId : null,
        // Don't touch current_rating — that's the student's space
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'student_id,step_id' }
    );

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${input.studentId}`);
}

// ═══════════════════════════════════════
// GET SEQUENCE EVALUATION HISTORY
// ═══════════════════════════════════════

export async function getSequenceEvaluationHistory(studentId: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sequence_evaluations')
    .select('*, coaches:evaluated_by(display_name)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ═══════════════════════════════════════
// GET OCEAN LEVEL HISTORY
// ═══════════════════════════════════════

export async function getOceanLevelHistory(studentId: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ocean_level_evaluations')
    .select('*, coaches:evaluated_by(display_name)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
