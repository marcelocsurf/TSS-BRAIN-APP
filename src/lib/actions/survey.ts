'use server';

import { createAdminClient } from '@/lib/supabase/admin';

interface SurveyInput {
  session_result_id: string;
  student_id: string;
  coach_rating: number;
  academy_rating: number;
  session_quality: number;
  q1_clarity: number;
  q2_feedback: number;
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

  // Detect first-ever submission BEFORE insert — used to unlock "My Coach"
  // tab. We check student record's coach_profile_unlocked_at since one
  // student gets one unlock for life (not per-coach).
  const { data: studentRow } = await admin
    .from('students')
    .select('coach_profile_unlocked_at')
    .eq('id', input.student_id)
    .single();

  const isFirstUnlock = !studentRow?.coach_profile_unlocked_at;

  // Insert survey
  const { error: surveyErr } = await admin
    .from('survey_responses')
    .insert({
      session_result_id: input.session_result_id,
      student_id: input.student_id,
      coach_rating: input.coach_rating,
      academy_rating: input.academy_rating,
      session_quality: input.session_quality,
      q1_clarity: input.q1_clarity,
      q2_feedback: input.q2_feedback || null,
      q3_homework_clarity: input.q3_homework_clarity,
      q4_session_value: input.q4_session_value,
      open_comment: input.open_comment || null,
    });

  if (surveyErr) throw new Error(surveyErr.message);

  // Update result completion state and lock the survey
  const { error: updateErr } = await admin
    .from('student_session_results')
    .update({ completion_state: 'closed', survey_unlocked: false })
    .eq('id', input.session_result_id);

  if (updateErr) {
    console.error('Failed to update completion_state:', updateErr.message);
  }

  // First survey ever from this student → unlock "My Coach" tab forever
  if (isFirstUnlock) {
    const { error: unlockErr } = await admin
      .from('students')
      .update({ coach_profile_unlocked_at: new Date().toISOString() })
      .eq('id', input.student_id);

    if (unlockErr) {
      console.error('Failed to set coach_profile_unlocked_at:', unlockErr.message);
    }
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
    note: `Survey submitted. Coach rating: ${input.coach_rating}/5.${isFirstUnlock ? ' Coach profile unlocked.' : ''}`,
  });

  return { success: true, justUnlockedCoachProfile: isFirstUnlock };
}
