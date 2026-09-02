'use server';

// Public lead-magnet action — creates a Lead from the surf-level quiz with no
// login. The belt is stored PROVISIONAL (a coach confirms later). Used by the
// public /quiz page.

import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';
import { sendQuizLeadEmail } from './email';
import { resolveLevel, levelForScore, LEVELS } from '@/lib/quiz/surf-level';
import { computeV2, isValidV2Answers } from '@/lib/quiz/surf-level-v2';

// Friendly slug aliases → real academy slugs (so marketing links can use a
// clean slug even if the stored slug has a typo).
const SLUG_ALIASES: Record<string, string> = {
  'puro-surf': 'el-zonte-la-libetad',
};

export type QuizAttempt = {
  attempt_number: number | null;
  belt: string | null;
  score: number | null;
  skillmap: { name: string; pct: number }[] | null;
  /** 'public_quiz' (v1, /70) · 'public_quiz_v2' / 'token_quiz_v2' (/100). */
  source: string | null;
  created_at: string;
};

// Full surf-level quiz history for a student (incl. retakes). Read via the
// service-role admin client because level_quiz_attempts is locked to the server.
export async function getQuizAttempts(studentId: string): Promise<QuizAttempt[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('level_quiz_attempts')
    .select('attempt_number, belt, score, skillmap, source, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return (data ?? []) as QuizAttempt[];
}

export async function createLeadFromQuiz(input: {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  academy_slug?: string | null;
  /** Camino NATIVO (/quiz): las respuestas crudas — el servidor es la única
      autoridad: recalcula score, skillmap, ocean y cinta con resolveLevel
      (incluida LA REGLA DEL AGUA). Lo que calcule el cliente no se usa. */
  tech_answers?: number[];
  ocean_answers?: number[];
  /** Camino EXTERNO (/api/quiz-lead, HTML del sitio): solo llega un score.
      Se clampa 0–70 y SIN evidencia de autosuficiencia en el agua rige la
      regla de Marcelo: nada por encima de Novice. La cinta textual que
      manden se IGNORA siempre. */
  score?: number;
  skillmap?: { name: string; pct: number }[];
  /** @deprecated se ignora — la cinta la calcula el servidor. */
  belt?: string;
  /** SOLO para /api/quiz-lead (el quiz externo del sitio web manda "nombre"
      en un campo único que no podemos partir con garantías). El quiz nativo
      NUNCA lo pasa: ahí el apellido es obligatorio. */
  allow_missing_last_name?: boolean;
  /** Camino V2 (quiz-v2.html, EL OFICIAL desde 2026-09-01): 10 índices 0-3.
      El servidor recalcula con computeV2 — misma autoridad que el nativo. */
  v2?: {
    answers: number[];
    board?: string | null;
    needs?: number[];
  };
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.first_name?.trim()) return { ok: false, error: 'First name is required.' };
  // Mandatorio del mostrador (2026-08-18): sin apellido no se puede ni buscar
  // a la persona — misma regla que el QR de clases.
  if (!input.last_name?.trim() && !input.allow_missing_last_name) {
    return { ok: false, error: 'Last name is required.' };
  }
  if (!input.email?.trim() && !input.phone?.trim()) {
    return { ok: false, error: 'Email or phone is required.' };
  }

  const admin = createAdminClient();

  // Resolve academy by slug (optional). Otherwise lead is unassigned (TSS Direct).
  let academyId: string | null = null;
  let academyName: string | null = null;
  if (input.academy_slug) {
    const slug = SLUG_ALIASES[input.academy_slug] ?? input.academy_slug;
    const { data: aca } = await admin
      .from('academies')
      .select('id, name')
      .eq('slug', slug)
      .maybeSingle();
    academyId = aca?.id ?? null;
    academyName = aca?.name ?? null;
  }

  // Light duplicate guard: if a lead with this email/phone already exists,
  // update its quiz result instead of creating a second record.
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;
  // Dedup requires contact match AND name match. Email/phone alone is not
  // enough: shared emails are a real pattern (a coordinator quizzing campers,
  // parents quizzing kids) and matching by contact only silently merged
  // different people into one record — overwriting the first one's quiz.
  const norm = (v: string | null | undefined) =>
    (v || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // strip accents
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  const incomingName = norm(`${input.first_name} ${input.last_name || ''}`);
  let existingId: string | null = null;
  if (email || phone) {
    // El filtro por contacto va EN LA CONSULTA, no en JavaScript.
    //
    // Antes esto traía "los primeros 50 alumnos activos" en orden arbitrario y
    // recién ahí buscaba el email en el bucle de abajo. Con 2.727 alumnos en la
    // base, la persona que estaba haciendo el quiz casi nunca caía en esos 50:
    // el match fallaba, se creaba un alumno nuevo, y su intento quedaba colgado
    // de un registro distinto. Por eso Patricia Tracz aparecía dos veces con
    // "1 attempt" cada una en vez de una vez con dos intentos.
    //
    // Dos consultas separadas en vez de un .or(): los emails con caracteres
    // especiales rompen la sintaxis de filtros de PostgREST.
    const candidates: {
      id: string; email: string | null; phone: string | null;
      first_name: string | null; last_name: string | null;
    }[] = [];
    const lookup = async (col: 'email' | 'phone', value: string) => {
      let q = admin
        .from('students')
        .select('id, email, phone, first_name, last_name')
        .eq('status', 'active')
        .limit(50);
      // ilike sin comodines = igualdad sin distinguir mayúsculas.
      q = col === 'email' ? q.eq('email', value) : q.eq('phone', value);
      if (academyId) q = q.eq('academy_id', academyId);
      const { data } = await q;
      candidates.push(...((data ?? []) as typeof candidates));
    };
    if (email) await lookup('email', email);
    if (phone) await lookup('phone', phone);

    for (const s of candidates) {
      const contactMatch =
        (email && s.email && s.email.trim().toLowerCase() === email) ||
        (phone && s.phone && s.phone.trim() === phone);
      if (!contactMatch) continue;
      const existingName = norm(`${s.first_name || ''} ${s.last_name || ''}`);
      if (existingName && incomingName && existingName === incomingName) {
        existingId = s.id;
        break;
      }
    }
  }

  // ── AUTORIDAD SERVER-SIDE (2026-08-31, diagnóstico del quiz) ──
  // La cinta se calcula ACÁ, siempre. El cliente ya no la dicta.
  const now = new Date().toISOString();
  let belt: string;
  let score: number;
  let skillmap: { name: string; pct: number }[];
  const hasOcean = (input.ocean_answers ?? []).some((a) => typeof a === 'number' && a >= 0);
  let oceanLevel: string | null = null;
  let cappedBy: string | null = null;

  let v2Payload: Record<string, unknown> | null = null;
  if (input.v2 && isValidV2Answers(input.v2.answers)) {
    // ── V2, el oficial: 10 escenas /100, dos tracks, puertas de doctrina. ──
    const r = computeV2(input.v2.answers);
    belt = r.belt;
    score = r.score;
    skillmap = r.skillmap;
    // El océano sale DERIVADO de las 4 escenas del agua — conservador y
    // provisional; el coach lo confirma con su botón.
    oceanLevel = r.oceanLevel;
    cappedBy = r.cappedBy;
    v2Payload = {
      score: r.score,
      mar: r.mar,
      ola: r.ola,
      level_name: r.levelName,
      capped_by: r.cappedBy,
      capped_gaps: r.cappedGaps,
      uncapped_name: r.uncappedName,
      board: input.v2.board ?? null,
      needs: Array.isArray(input.v2.needs) ? input.v2.needs.slice(0, 2) : [],
      answers: input.v2.answers,
    };
  } else if (Array.isArray(input.tech_answers)) {
    const r = resolveLevel(input.tech_answers, input.ocean_answers ?? []);
    belt = r.level.belt;
    score = r.score;
    skillmap = r.skills;
    oceanLevel = hasOcean ? r.oceanLevel : null;
    cappedBy = r.cappedBy;
  } else {
    // Externo: score clampeado; sin ocean no hay autosuficiencia probada →
    // LA REGLA DEL AGUA capea a Novice todo lo que el score diga Foundation+.
    score = Math.max(0, Math.min(70, Math.round(Number(input.score) || 0)));
    let lv = levelForScore(score);
    if (LEVELS.indexOf(lv) >= 2) {
      lv = LEVELS.find((l) => l.belt === 'yellow_belt')!;
      cappedBy = 'water';
    }
    belt = lv.belt;
    skillmap = input.skillmap ?? [];
  }

  const quizFields: Record<string, unknown> = {
    belt_level: belt,
    belt_provisional: true,
    level_quiz_score: score,
    level_quiz_skillmap: skillmap,
  };
  if (v2Payload) {
    // El V2 pregunta el agua ESTRUCTURALMENTE (5 escenas del mar), así que
    // estampa completo: el intake no vuelve a preguntar. El resultado entero
    // viaja en level_quiz_v2 para la ficha del coach (tracks + what held it).
    quizFields.level_quiz_v2 = v2Payload;
    quizFields.level_quiz_completed_at = now;
    quizFields.ocean_level = oceanLevel;
    quizFields.ocean_level_provisional = true;
    quizFields.ocean_quiz_completed_at = now;
  } else if (Array.isArray(input.tech_answers) && hasOcean) {
    // Solo se estampa "completado" con el quiz ENTERO (técnica + océano):
    // así el intake puede saltarlo con razón. Sin océano, el intake vuelve
    // a preguntar todo.
    quizFields.level_quiz_completed_at = now;
    quizFields.ocean_level = oceanLevel;
    quizFields.ocean_level_provisional = true;
    quizFields.ocean_quiz_completed_at = now;
  }
  // Camino externo: SIN estampas — el intake vuelve a correr el quiz completo
  // (antes se estampaba ocean='beginner' + completed_at FALSO y el intake
  // salteaba todo: el resultado inflado de la web quedaba para siempre).
  //
  // Una retoma NO-v2 limpia el payload v2 viejo: la ficha del coach muestra
  // /100 + tracks + "what held it" con la SOLA presencia de level_quiz_v2, y
  // dejarlo colgado mezclaría dos intentos distintos en pantalla.
  if (!v2Payload) quizFields.level_quiz_v2 = null;

  let studentId = existingId;
  if (existingId) {
    // Una retoma del quiz público NUNCA pisa lo CONFIRMADO por un coach o
    // admin (cinta u océano). El guard falla CERRADO: si no podemos LEER el
    // estado, no escribimos — el intento igual se loguea abajo.
    const { data: existing, error: gErr } = await admin
      .from('students')
      .select('belt_provisional, ocean_level_provisional')
      .eq('id', existingId)
      .maybeSingle();
    if (gErr || !existing) {
      // Estado desconocido → no tocar al alumno; el historial queda igual.
    } else {
      const update: Record<string, unknown> = { ...quizFields };
      if (existing.belt_provisional === false) {
        delete update.belt_level;
        delete update.belt_provisional;
      }
      if (existing.ocean_level_provisional === false) {
        delete update.ocean_level;
        delete update.ocean_level_provisional;
        delete update.ocean_quiz_completed_at;
      }
      const { error } = await admin.from('students').update(update).eq('id', existingId);
      if (error) return { ok: false, error: error.message };
    }
  } else {
    const { data: created, error } = await admin.from('students').insert({
      first_name: input.first_name.trim(),
      last_name: input.last_name?.trim() || '',
      email,
      phone,
      academy_id: academyId,
      portal_token: randomUUID(),
      lifecycle_status: 'lead',
      student_type: 'member',
      course_access_white: false,
      course_access_yellow: false,
      course_access_blue: false,
      current_sequence_number: 1,
      current_step_order: 1,
      status: 'active',
      waiver_signed: false,
      ...quizFields,
    }).select('id').single();
    if (error) return { ok: false, error: error.message };
    studentId = created?.id ?? null;
  }

  // Record THIS submission so the full retake history stays on the profile.
  // The student fields above hold the latest result; this row keeps every one.
  try {
    let attemptNumber = 1;
    if (studentId) {
      const { count } = await admin
        .from('level_quiz_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId);
      attemptNumber = (count ?? 0) + 1;
    }
    await admin.from('level_quiz_attempts').insert({
      student_id: studentId,
      email,
      phone,
      belt,
      score,
      skillmap,
      academy_id: academyId,
      source: v2Payload ? 'public_quiz_v2' : 'public_quiz',
      attempt_number: attemptNumber,
    });
  } catch (e) {
    console.error('[createLeadFromQuiz] attempt logging failed', e);
  }

  // Notify the academy / TSS of the new (or updated) quiz lead. Never block
  // the lead on an email failure.
  try {
    await sendQuizLeadEmail({
      name: `${input.first_name.trim()} ${input.last_name?.trim() || ''}`.trim(),
      email: email,
      phone: phone,
      belt,
      score,
      scoreMax: v2Payload ? 100 : 70,
      academyName,
      academyId,
    });
  } catch (e) {
    console.error('[createLeadFromQuiz] notification email failed', e);
  }

  return { ok: true };
}

// ═══ V2 CON TOKEN — el alumno que YA existe (intake / portal) ═══
//
// quiz-v2.html?t=<portal_token>: sin pantalla de captura (ya sabemos quién
// es) y el resultado se ata directo a SU ficha. Mismos guards que la retoma
// pública: NUNCA pisa cinta ni océano CONFIRMADOS, y el guard falla CERRADO.
// Las estampas hacen que el intake saltee su paso de quiz solo.
export async function submitQuizV2ByToken(
  token: string,
  input: { answers: number[]; board?: string | null; needs?: number[] },
): Promise<{ ok: boolean; error?: string }> {
  if (!token?.trim()) return { ok: false, error: 'Missing token.' };
  if (!isValidV2Answers(input.answers)) return { ok: false, error: 'Invalid answers.' };

  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, belt_provisional, ocean_level_provisional, academy_id')
    .eq('portal_token', token.trim())
    .maybeSingle();
  if (!student) return { ok: false, error: 'Student not found.' };

  const r = computeV2(input.answers);
  const now = new Date().toISOString();
  // DISEÑO (revisión 2026-09-01): en un alumno con cinta/océano CONFIRMADOS
  // el snapshot del quiz (score, skillmap, level_quiz_v2, sellos) SÍ se
  // actualiza — última retoma gana, con todo el historial preservado en
  // level_quiz_attempts. Lo confirmado por el coach es lo único intocable.
  const update: Record<string, unknown> = {
    belt_level: r.belt,
    belt_provisional: true,
    level_quiz_score: r.score,
    level_quiz_skillmap: r.skillmap,
    level_quiz_v2: {
      score: r.score,
      mar: r.mar,
      ola: r.ola,
      level_name: r.levelName,
      capped_by: r.cappedBy,
      capped_gaps: r.cappedGaps,
      uncapped_name: r.uncappedName,
      board: input.board ?? null,
      needs: Array.isArray(input.needs) ? input.needs.slice(0, 2) : [],
      answers: input.answers,
    },
    level_quiz_completed_at: now,
    ocean_level: r.oceanLevel,
    ocean_level_provisional: true,
    ocean_quiz_completed_at: now,
  };
  if (student.belt_provisional === false) {
    delete update.belt_level;
    delete update.belt_provisional;
  }
  if (student.ocean_level_provisional === false) {
    delete update.ocean_level;
    delete update.ocean_level_provisional;
    delete update.ocean_quiz_completed_at;
  }
  const { error } = await admin.from('students').update(update).eq('id', student.id);
  if (error) return { ok: false, error: error.message };

  try {
    const { count } = await admin
      .from('level_quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', student.id);
    await admin.from('level_quiz_attempts').insert({
      student_id: student.id,
      belt: r.belt,
      score: r.score,
      skillmap: r.skillmap,
      academy_id: student.academy_id ?? null,
      source: 'token_quiz_v2',
      attempt_number: (count ?? 0) + 1,
    });
  } catch (e) {
    console.error('[submitQuizV2ByToken] attempt logging failed', e);
  }
  return { ok: true };
}
