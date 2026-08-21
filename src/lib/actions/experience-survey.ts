'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// Encuesta de EXPERIENCIA del camp (Opción A encadenada, 2026-08-21).
// Las filas se crean al cerrar el camp (closeCampFinal); pendiente =
// submitted_at IS NULL. Las funciones por token son públicas (el token ES el
// auth, igual que feedback-token.ts); las de staff van gateadas en sus
// respectivas superficies. Invariante #2: {ok:false,error}, nunca throw.

export interface ExperienceTokenView {
  studentFirstName: string;
  campName: string | null;
  alreadySubmitted: boolean;
}

export interface PendingExperience {
  token: string;
  campName: string | null;
}

export interface ExperienceInput {
  facilities_rating?: number | null;
  equipment_rating?: number | null;   // null = N/A
  transport_rating?: number | null;   // null = N/A
  communication_rating?: number | null;
  value_rating?: number | null;
  nps?: number | null;                // 0-10
  open_comment?: string;
}

const campNameOf = (row: any): string | null => {
  const inst = Array.isArray(row?.camp_instances) ? row.camp_instances[0] : row?.camp_instances;
  return inst?.camp_name ?? null;
};

/** Resuelve un token de experiencia → datos para renderizar la página. */
export async function getExperienceByToken(token: string): Promise<ExperienceTokenView | null> {
  if (!token) return null;
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from('camp_experience_surveys')
    .select('id, submitted_at, students:student_id(first_name), camp_instances:camp_instance_id(camp_name)')
    .eq('token', token)
    .maybeSingle();
  if (error || !row) return null;
  const stu = Array.isArray((row as any).students) ? (row as any).students[0] : (row as any).students;
  return {
    studentFirstName: stu?.first_name ?? 'there',
    campName: campNameOf(row),
    alreadySubmitted: !!(row as any).submitted_at,
  };
}

/** Envía la encuesta. Una sola vez — el segundo submit no sobreescribe. */
export async function submitExperienceByToken(
  token: string,
  input: ExperienceInput,
): Promise<{ ok: boolean; error?: string; alreadySubmitted?: boolean }> {
  if (!token) return { ok: false, error: 'Missing token.' };

  const star = (n: number | null | undefined) => {
    if (n == null) return null; // N/A o sin responder
    const v = Math.round(Number(n));
    return v >= 1 && v <= 5 ? v : null;
  };
  const nps = input.nps == null ? null : Math.round(Number(input.nps));
  if (nps == null || nps < 0 || nps > 10) {
    return { ok: false, error: 'Please answer the recommendation question (0-10).' };
  }
  if (star(input.value_rating) == null) {
    return { ok: false, error: 'Please rate the value for the money (1-5).' };
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('camp_experience_surveys')
    .select('id, submitted_at')
    .eq('token', token)
    .maybeSingle();
  if (!row) return { ok: false, error: 'Invalid or expired link.' };
  if ((row as any).submitted_at) return { ok: true, alreadySubmitted: true };

  const { error } = await admin
    .from('camp_experience_surveys')
    .update({
      facilities_rating: star(input.facilities_rating),
      equipment_rating: star(input.equipment_rating),
      transport_rating: star(input.transport_rating),
      communication_rating: star(input.communication_rating),
      value_rating: star(input.value_rating),
      nps,
      open_comment: input.open_comment?.trim().slice(0, 800) || null,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', (row as any).id)
    .is('submitted_at', null); // carrera: el primero gana

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Encuesta de experiencia pendiente más reciente de un alumno (portal). */
export async function getPendingExperienceForStudent(
  studentId: string,
): Promise<PendingExperience | null> {
  if (!studentId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from('camp_experience_surveys')
    .select('token, camp_instances:camp_instance_id(camp_name)')
    .eq('student_id', studentId)
    .is('submitted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { token: (data as any).token, campName: campNameOf(data) };
}

/**
 * Encadenado (Opción A): a partir del feedback_token de la encuesta de
 * entreno, encuentra la experiencia pendiente del MISMO alumno — preferendo
 * la del mismo camp si la sesión pertenece a uno.
 */
export async function getPendingExperienceForFeedbackToken(
  feedbackToken: string,
): Promise<PendingExperience | null> {
  if (!feedbackToken) return null;
  const admin = createAdminClient();
  const { data: ssr } = await admin
    .from('student_session_results')
    .select('student_id, camp_sessions:camp_session_id(camp_instance_id)')
    .eq('feedback_token', feedbackToken)
    .maybeSingle();
  if (!ssr) return null;

  const cs = Array.isArray((ssr as any).camp_sessions) ? (ssr as any).camp_sessions[0] : (ssr as any).camp_sessions;
  const campInstanceId: string | null = cs?.camp_instance_id ?? null;

  const { data: rows } = await admin
    .from('camp_experience_surveys')
    .select('token, camp_instance_id, camp_instances:camp_instance_id(camp_name)')
    .eq('student_id', (ssr as any).student_id)
    .is('submitted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);
  if (!rows || rows.length === 0) return null;
  const preferred = campInstanceId
    ? rows.find((r: any) => r.camp_instance_id === campInstanceId) ?? rows[0]
    : rows[0];
  return { token: (preferred as any).token, campName: campNameOf(preferred) };
}
