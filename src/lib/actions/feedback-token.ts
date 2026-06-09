'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// Server actions for the standalone /feedback/[token] page used for
// Lead students (no course access). Every read/write uses the admin
// client because the page is publicly accessible (token IS the
// auth) — RLS on student_session_results / survey_responses doesn't
// apply via the service role.

export interface FeedbackTokenView {
  /** The session-result UUID — used as the foreign key for survey_responses. */
  sessionResultId: string;
  studentId: string;
  studentFirstName: string;
  coachName: string;
  sessionDate: string;
  mission: string | null;
  status: string | null;
  coachFeedback: string | null;
  homework: string | null;
  whatsNext: string | null;
  /** Whether the student has already submitted a survey for this session. */
  alreadySubmitted: boolean;
}

/**
 * Resolve a feedback_token → enough data to render the standalone
 * survey form. Returns null if the token doesn't exist (404).
 */
export async function getFeedbackByToken(
  token: string,
): Promise<FeedbackTokenView | null> {
  if (!token) return null;
  const admin = createAdminClient();

  const { data: row } = await admin
    .from('student_session_results')
    .select(
      `id, student_id, created_at, achieved, status, coach_feedback,
       homework, whats_next,
       coach:coaches(display_name),
       student:students(first_name)`,
    )
    .eq('feedback_token', token)
    .maybeSingle();

  if (!row) return null;

  const coach = Array.isArray((row as any).coach)
    ? (row as any).coach[0]
    : (row as any).coach;
  const student = Array.isArray((row as any).student)
    ? (row as any).student[0]
    : (row as any).student;

  // Has the student already submitted? One survey per session result.
  const { data: existing } = await admin
    .from('survey_responses')
    .select('id')
    .eq('session_result_id', row.id)
    .maybeSingle();

  return {
    sessionResultId: row.id,
    studentId: row.student_id,
    studentFirstName: student?.first_name ?? 'there',
    coachName: coach?.display_name ?? 'Your coach',
    sessionDate: row.created_at,
    mission: row.achieved ?? null,
    status: row.status ?? null,
    coachFeedback: row.coach_feedback ?? null,
    homework: row.homework ?? null,
    whatsNext: row.whats_next ?? null,
    alreadySubmitted: !!existing,
  };
}

/**
 * Submit the standalone feedback form. Inserts into survey_responses
 * keyed to the session_result_id. Idempotent — second submit returns
 * { ok: true, alreadySubmitted: true } without overwriting.
 */
export async function submitFeedbackByToken(
  token: string,
  input: {
    coach_rating: number; // 1-5
    q1_clarity?: number;
    q3_homework_clarity?: number;
    q4_session_value?: number;
    q2_feedback?: number;
    open_comment?: string;
  },
): Promise<{ ok: boolean; error?: string; alreadySubmitted?: boolean }> {
  if (!token) return { ok: false, error: 'Missing feedback token.' };

  // Basic range validation — Postgres has no CHECK constraint here, so
  // we guard at the app layer.
  if (
    !Number.isInteger(input.coach_rating) ||
    input.coach_rating < 1 ||
    input.coach_rating > 5
  ) {
    return { ok: false, error: 'Coach rating must be 1-5.' };
  }
  const clamp = (n: number | undefined) =>
    n == null ? null : Math.min(5, Math.max(1, Math.round(n)));

  const admin = createAdminClient();

  const { data: result } = await admin
    .from('student_session_results')
    .select('id, student_id')
    .eq('feedback_token', token)
    .maybeSingle();
  if (!result) return { ok: false, error: 'Invalid or expired token.' };

  // Idempotent guard — no duplicate survey per session.
  const { data: existing } = await admin
    .from('survey_responses')
    .select('id')
    .eq('session_result_id', result.id)
    .maybeSingle();
  if (existing) return { ok: true, alreadySubmitted: true };

  const { error } = await admin.from('survey_responses').insert({
    session_result_id: result.id,
    student_id: result.student_id,
    coach_rating: input.coach_rating,
    q1_clarity: clamp(input.q1_clarity),
    q3_homework_clarity: clamp(input.q3_homework_clarity),
    q4_session_value: clamp(input.q4_session_value),
    q2_feedback: clamp(input.q2_feedback),
    open_comment: input.open_comment?.trim() || null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
