'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// 3-question post-class survey. Student rates the coach right after class
// from the email deep-link or from their portal feed.
//   1. coach_rating       — overall coach impression
//   2. feedback_clarity   — how clear was their feedback (maps to q2_feedback)
//   3. improvement_value  — how much did this help me improve (maps to q4_session_value)
//
// The DB still has 7 rating columns from the original survey. We backfill
// the obsolete ones (academy_rating, session_quality, q1_clarity,
// q3_homework_clarity) with the coach_rating value so existing averages and
// dashboards keep producing sensible numbers without a schema migration.
interface SurveyInput {
  session_result_id: string;
  student_id: string;
  coach_rating: number;
  feedback_clarity: number;
  improvement_value: number;
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

  // Insert survey — fill obsolete legacy columns with coach_rating so any
  // SQL views averaging the old shape still see plausible data.
  const { error: surveyErr } = await admin
    .from('survey_responses')
    .insert({
      session_result_id: input.session_result_id,
      student_id: input.student_id,
      coach_rating: input.coach_rating,
      academy_rating: input.coach_rating,        // legacy — mirror coach
      session_quality: input.improvement_value,  // legacy — closest semantic match
      q1_clarity: input.feedback_clarity,        // legacy — closest semantic match
      q2_feedback: input.feedback_clarity,
      q3_homework_clarity: input.feedback_clarity, // legacy — closest match
      q4_session_value: input.improvement_value,
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
