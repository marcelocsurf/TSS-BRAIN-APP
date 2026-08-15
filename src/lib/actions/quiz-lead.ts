'use server';

// Public lead-magnet action — creates a Lead from the surf-level quiz with no
// login. The belt is stored PROVISIONAL (a coach confirms later). Used by the
// public /quiz page.

import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';
import { sendQuizLeadEmail } from './email';

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
  created_at: string;
};

// Full surf-level quiz history for a student (incl. retakes). Read via the
// service-role admin client because level_quiz_attempts is locked to the server.
export async function getQuizAttempts(studentId: string): Promise<QuizAttempt[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('level_quiz_attempts')
    .select('attempt_number, belt, score, skillmap, created_at')
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
  belt: string;            // resolved from the quiz level
  score: number;
  skillmap: { name: string; pct: number }[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.first_name?.trim()) return { ok: false, error: 'Name is required.' };
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
      q = col === 'email' ? q.ilike('email', value) : q.eq('phone', value);
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

  const now = new Date().toISOString();
  const quizFields = {
    belt_level: input.belt,
    belt_provisional: true,
    level_quiz_score: input.score,
    level_quiz_skillmap: input.skillmap,
    level_quiz_completed_at: now,
    // Mark the ocean quiz done too (provisional) so the intake reliably SKIPS
    // the level quiz — the student won't re-take what they did on the public
    // quiz. The coach confirms the ocean level later.
    ocean_level: 'beginner',
    ocean_level_provisional: true,
    ocean_quiz_completed_at: now,
  };

  let studentId = existingId;
  if (existingId) {
    const { error } = await admin.from('students').update(quizFields).eq('id', existingId);
    if (error) return { ok: false, error: error.message };
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
      belt: input.belt,
      score: input.score,
      skillmap: input.skillmap,
      academy_id: academyId,
      source: 'public_quiz',
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
      belt: input.belt,
      score: input.score,
      academyName,
      academyId,
    });
  } catch (e) {
    console.error('[createLeadFromQuiz] notification email failed', e);
  }

  return { ok: true };
}
