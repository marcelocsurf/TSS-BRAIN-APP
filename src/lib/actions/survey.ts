'use server';

import { createAdminClient } from '@/lib/supabase/admin';

interface SurveyInput {
  session_result_id: string;
  student_id: string;
  coach_rating: number;
  q1_clarity: number;
  q2_feedback: string;
  q3_homework_clarity: number;
  q4_session_value: number;
  open_comment: string;
}

export async function submitSurvey(input: SurveyInput) {
  const admin = createAdminClient();

  // Check if survey already exists
  const { data: existing } = await admin
    .from('survey_responses')
    .select('id')
    .eq('session_result_id', input.session_result_id)
    .single();

  if (existing) {
    throw new Error('Survey already submitted for this session.');
  }

  // Insert survey
  const { error: surveyErr } = await admin
    .from('survey_responses')
    .insert({
      session_result_id: input.session_result_id,
      student_id: input.student_id,
      coach_rating: input.coach_rating,
      q1_clarity: input.q1_clarity,
      q2_feedback: input.q2_feedback || null,
      q3_homework_clarity: input.q3_homework_clarity,
      q4_session_value: input.q4_session_value,
      open_comment: input.open_comment || null,
    });

  if (surveyErr) throw new Error(surveyErr.message);

  // Update result completion state
  const { error: updateErr } = await admin
    .from('student_session_results')
    .update({ completion_state: 'closed' })
    .eq('id', input.session_result_id);

  if (updateErr) {
    console.error('Failed to update completion_state:', updateErr.message);
  }

  // Audit log
  await admin.from('audit_log').insert({
    session_result_id: input.session_result_id,
    actor_type: 'student',
    actor_id: null,
    actor_name: input.student_id,
    event_type: 'survey_submitted',
    status_before: 'closed',
    status_after: 'closed',
    note: `Survey submitted. Coach rating: ${input.coach_rating}/5.`,
  });

  return { success: true };
}
