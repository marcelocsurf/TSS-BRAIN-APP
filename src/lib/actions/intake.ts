'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { consentMeta } from '@/lib/legal/consent-meta';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/versions';
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
  // Identity (the "ficha" — required to close a usable profile)
  date_of_birth?: string;
  /** Teléfono/WhatsApp del PROPIO alumno (students.phone) — el equipo lo usa
   *  para coordinar; distinto del emergency_contact_phone. */
  phone?: string;
  nationality?: string;
  languages?: string;
  gender?: string;
  // Surf history — drives whether a member skips the level quiz
  surf_self_level?: string; // 'Never' | 'Once or twice' | 'Yes, I surf'
  // Body (optional, helps the coach pick a board)
  height?: string;
  weight?: string;
  // Safety / medical
  emergency_contact_name: string;
  emergency_contact_phone: string;
  swim_level: string;
  allergies?: string;
  injuries?: string;
  medical_notes?: string;
  waiver_signed: boolean;
  media_release_consent?: boolean;
  waiver_version?: string;
  // Consentimientos legales (auditoría 2026-09-05): salud es EXPRESO y
  // obligatorio; términos + privacidad obligatorios; imagen es opt-in.
  health_data_consent?: boolean;
  terms_accepted?: boolean;
  guardian_name?: string | null;
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
  board_length_feet?: string;
  board_length_inches?: string;
  board_volume_liters?: string;
  other_sports?: string;
  learning_style?: string;

  // Adaptive — beginner branch
  board_familiarity?: string;
  water_comfort?: string;

  // Adaptive — experienced branch
  comfort_wave_size?: string;
  surf_self_level?: string;
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
  if (!input.health_data_consent) {
    throw new Error('We need your consent to store your health and safety information.');
  }
  if (!input.terms_accepted) {
    throw new Error('Please accept the Terms and the Privacy Policy to continue.');
  }

  const isFirstSubmission = !student.intake_completed_at;
  const meta = await consentMeta();
  const now = new Date().toISOString();

  const updates: Record<string, unknown> = {
    date_of_birth: input.date_of_birth?.trim() || null,
    // Solo pisar el teléfono si el alumno escribió algo — no borrar el que
    // el equipo ya haya cargado a mano.
    ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
    nationality: input.nationality?.trim() || null,
    languages: input.languages?.trim() || null,
    gender: input.gender?.trim() || null,
    surf_self_level: input.surf_self_level?.trim() || null,
    height: input.height?.trim() || null,
    weight: input.weight?.trim() || null,
    emergency_contact_name: input.emergency_contact_name.trim(),
    emergency_contact_phone: input.emergency_contact_phone.trim(),
    swim_level: input.swim_level,
    allergies: input.allergies?.trim() || null,
    injuries: input.injuries?.trim() || null,
    medical_notes: input.medical_notes?.trim() || null,
    waiver_signed: true,
    waiver_signed_at: now,
    media_release_consent: !!input.media_release_consent,
    media_release_consent_at: input.media_release_consent ? now : null,
    waiver_version: input.waiver_version ?? null,
    health_data_consent_at: now,
    terms_accepted_at: now,
    terms_version: `${TERMS_VERSION}+${PRIVACY_VERSION}`,
    ...meta,
    ...(input.guardian_name?.trim() ? { guardian_name: input.guardian_name.trim(), guardian_relationship: 'parent/guardian', waiver_signed_by: `${input.guardian_name.trim()} (parent/guardian)` } : {}),
  };

  // Mark tier as 'basic' but never downgrade a member who already reached 'extended'.
  if (student.intake_tier !== 'extended') {
    updates.intake_tier = 'basic';
  }

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

// Stage 1 — surf-level quiz result. Sets a PROVISIONAL belt (coach confirms
// later) + ocean_level + the skill map. Replaces the old self-rating ocean
// quiz as the single level engine.
//
// AUTORIDAD SERVER-SIDE (2026-08-31): recibe las RESPUESTAS crudas y
// recalcula acá con resolveLevel — score, evidencia técnica y LA REGLA DEL
// AGUA (Foundation exige autosuficiencia para agarrar olas solo). Antes
// confiaba en el belt/score que mandara el navegador.
export async function submitLevelQuiz(token: string, input: {
  tech_answers: number[];
  ocean_answers: number[];
}) {
  const { resolveLevel } = await import('@/lib/quiz/surf-level');
  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, belt_level, belt_provisional, ocean_level, ocean_level_provisional')
    .eq('portal_token', token)
    .single();
  if (!student) throw new Error('Invalid link. Please contact your coordinator.');

  const r = resolveLevel(input.tech_answers ?? [], input.ocean_answers ?? []);

  // EL QUIZ NUNCA PISA LO CONFIRMADO (revisión 2026-08-31): una cinta u
  // océano con provisional=false los validó un coach/admin — el intento se
  // guarda (score, skillmap, sellos) pero el nivel confirmado se conserva.
  const beltConfirmed = student.belt_provisional === false;
  const oceanConfirmed = student.ocean_level_provisional === false;
  const update: Record<string, unknown> = {
    level_quiz_score: r.score,
    // Retoma v1 desde el intake: limpia el payload V2 viejo — la ficha del
    // coach muestra /100 + tracks solo con la presencia de level_quiz_v2.
    level_quiz_v2: null,
    level_quiz_skillmap: r.skills,
    level_quiz_completed_at: new Date().toISOString(),
    ocean_quiz_completed_at: new Date().toISOString(),
  };
  if (!beltConfirmed) {
    update.belt_level = r.level.belt;
    update.belt_provisional = true;
  }
  if (!oceanConfirmed) {
    update.ocean_level = r.oceanLevel;
    update.ocean_level_provisional = true;
  }

  const { error } = await admin.from('students').update(update).eq('id', student.id);
  if (error) throw new Error(error.message);
  return {
    success: true,
    // La cinta VIGENTE: si estaba confirmada, es esa — no la del quiz.
    belt: beltConfirmed ? student.belt_level : r.level.belt,
    score: r.score,
    cappedBy: r.cappedBy,
    uncappedName: r.uncappedName,
  };
}

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

// Firma de waiver SOLO — para alumnos cuyo intake ya está completo (p. ej.
// fichas importadas de Word) y únicamente les falta la exención. Menores:
// firma el padre/madre/tutor y queda registrado como firmante.
export async function signWaiverOnly(token: string, input: {
  signed_name: string;
  guardian_name?: string | null;
  media_release_consent?: boolean;
  waiver_version: string;
  health_data_consent?: boolean;
  terms_accepted?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: st } = await admin
    .from('students')
    .select('id, first_name, date_of_birth, waiver_signed')
    .eq('portal_token', token)
    .maybeSingle();
  if (!st) return { ok: false, error: 'Link not valid.' };
  if (st.waiver_signed) return { ok: true };
  if (!input.signed_name?.trim() || input.signed_name.trim().length < 5) {
    return { ok: false, error: 'Type the full legal name to sign.' };
  }
  // Menor → exige nombre del guardián y lo registra como firmante real
  let minor = false;
  if (st.date_of_birth) {
    const d = new Date(st.date_of_birth + 'T00:00:00'); const n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    if (n.getMonth() - d.getMonth() < 0 || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
    minor = a < 18;
  }
  if (minor && !input.guardian_name?.trim()) {
    return { ok: false, error: 'A parent or legal guardian must sign for a minor.' };
  }
  if (!input.health_data_consent) return { ok: false, error: 'We need your consent to store health and safety information.' };
  if (!input.terms_accepted) return { ok: false, error: 'Please accept the Terms and the Privacy Policy.' };
  const now = new Date().toISOString();
  const meta = await consentMeta();
  const { error } = await admin.from('students').update({
    waiver_signed: true,
    waiver_signed_at: now,
    waiver_signed_by: minor ? `${input.guardian_name!.trim()} (parent/guardian)` : input.signed_name.trim(),
    waiver_version: input.waiver_version,
    media_release_consent: !!input.media_release_consent,
    media_release_consent_at: input.media_release_consent ? now : null,
    health_data_consent_at: now,
    terms_accepted_at: now,
    terms_version: `${TERMS_VERSION}+${PRIVACY_VERSION}`,
    ...meta,
    ...(minor ? { guardian_name: input.guardian_name!.trim(), guardian_relationship: 'parent/guardian' } : {}),
  }).eq('id', st.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
