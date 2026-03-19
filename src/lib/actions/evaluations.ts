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

  // Update student's ocean level
  const { error: updateErr } = await supabase
    .from('students')
    .update({ ocean_level: input.newLevel })
    .eq('id', input.studentId);

  if (updateErr) throw new Error(updateErr.message);

  revalidatePath(`/students/${input.studentId}`);
  return evaluation;
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
