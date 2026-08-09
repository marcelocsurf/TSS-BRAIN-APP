'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { toElSalvadorDate } from '@/lib/utils/tz';

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
  /** Tipo de servicio + nombre para elegir el set de preguntas correcto. */
  serviceKind: string | null;
  serviceName: string | null;
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
      `id, student_id, created_at, standalone_session_id, achieved, status, mission, coach_feedback,
       homework, whats_next,
       coach:coaches(display_name),
       student:students(first_name),
       camp_session:camp_sessions!camp_session_id(session_date, camp_instances:camp_instance_id(camp_name, camp_templates:template_id(service_kind)))`,
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
  // Fecha REAL de la sesión + tipo de servicio (para la fecha correcta y las
  // preguntas por servicio). Fallback: convertir created_at a fecha SV.
  const campSession = Array.isArray((row as any).camp_session) ? (row as any).camp_session[0] : (row as any).camp_session;
  const inst = campSession && (Array.isArray(campSession.camp_instances) ? campSession.camp_instances[0] : campSession.camp_instances);
  const tpl = inst && (Array.isArray(inst.camp_templates) ? inst.camp_templates[0] : inst.camp_templates);
  const realDate = campSession?.session_date ?? toElSalvadorDate((row as any).created_at) ?? (row as any).created_at;
  // Sesiones cascade (standalone) son de surf por naturaleza.
  const serviceName = inst?.camp_name ?? ((row as any).standalone_session_id ? 'Surf' : null);
  const serviceKind = tpl?.service_kind ?? null;

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
    sessionDate: realDate,
    serviceKind,
    serviceName,
    mission: (row as any).mission ?? null,
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
    q1_clarity?: number;            // clarity
    q3_homework_clarity?: number;   // repurposed → safety in the water
    q4_session_value?: number;      // learned / progressed
    q2_feedback?: number;
    academy_rating?: number;        // repurposed → would take another class
    flow_channel?: number;          // how the class felt
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
    q2_feedback: clamp(input.q2_feedback ?? input.q1_clarity),
    q3_homework_clarity: clamp(input.q3_homework_clarity),   // safety
    q4_session_value: clamp(input.q4_session_value),
    session_quality: clamp(input.q4_session_value),
    academy_rating: clamp(input.academy_rating),             // recommend
    flow_channel: clamp(input.flow_channel),
    open_comment: input.open_comment?.trim() || null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
