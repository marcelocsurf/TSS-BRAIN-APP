'use server';

// Coach-scoped student access — surfaces "my students" inside the coach
// portal. Auth is by portal_token (same as the rest of the coach portal),
// the actual student set is the intersection of:
//   - students belonging to the coach's academy
//   - students the coach has been assigned to via active service windows
//     (camp_participants joined to camp_instances with this coach as
//     coach_id or head_coach_id, enrollment_status='active' or 'completed')
//
// This mirrors getCoachAccessibleStudentIds() from auth.ts but doesn't
// require a Supabase auth session — the coach portal is token-based.

import { createAdminClient } from '@/lib/supabase/admin';
import { SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';
import { waterRuleBlocker } from '@/lib/constants/graduation';
import { anyMedicalNote } from '@/lib/constants/medical';
import { buildStudentActivity, type StudentActivitySummary } from '@/lib/activity/build';
import { getCoachFocus, type CoachFocus } from '@/lib/activity/coach-focus';
import { readyToConfirmForStudent, type ReadyStep } from '@/lib/activity/ready-to-confirm';

export type CoachStudentSummary = {
  id: string;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  belt_level: string;
  swim_level: string | null;
  waiver_signed: boolean;
  intake_completed_at: string | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_status: string | null;
  has_safety_flag: boolean; // injuries / allergies / medical_notes present
  portal_last_seen_at: string | null;
  portal_last_screen: string | null;
  portal_visit_count: number;
  /** Vuelve: tiene historial y su última sesión fue hace 14+ días (Marcelo 2026-09-17). */
  is_returning: boolean;
  days_since_session: number | null;
};

/** Días desde una fecha ISO (entero, nunca negativo). */
function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}
const RETURNING_AFTER_DAYS = 14;

async function resolveCoachByToken(token: string): Promise<{
  id: string;
  academy_id: string | null;
} | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('coaches')
    .select('id, academy_id, course_access_granted')
    .eq('portal_token', token)
    .single();
  if (!data || !data.course_access_granted) return null;
  return { id: data.id, academy_id: data.academy_id ?? null };
}

async function studentIdsForCoach(coachId: string): Promise<Set<string>> {
  const admin = createAdminClient();
  // Pull every camp_instance this coach is responsible for, then collect
  // their participants. Mirrors auth.getCoachAccessibleStudentIds() but
  // without depending on a Supabase auth session.
  // Incluye también los servicios donde es ASISTENTE ACEPTADO — el mismo
  // criterio exacto de getServicePlan y getAcceptedAssistantCampIds:
  // role='assistant' + status='accepted'. SOLO ese rol: a un fotógrafo/
  // filmer aceptado el planner le niega el plan, así que la ficha (con
  // datos médicos y contacto de emergencia) tampoco le abre.
  const [{ data: instances }, { data: staffRows }] = await Promise.all([
    admin
      .from('camp_instances')
      .select('id')
      .or(`coach_id.eq.${coachId},head_coach_id.eq.${coachId}`),
    admin
      .from('service_staff')
      .select('camp_instance_id')
      .eq('coach_id', coachId)
      .eq('role', 'assistant')
      .eq('status', 'accepted'),
  ]);

  const ids = Array.from(new Set([
    ...(instances ?? []).map((i) => i.id),
    ...(staffRows ?? []).map((r: any) => r.camp_instance_id),
  ]));
  if (ids.length === 0) return new Set();
  const { data: participants } = await admin
    .from('camp_participants')
    .select('student_id')
    .in('camp_instance_id', ids)
    .in('enrollment_status', ['active', 'completed']);

  return new Set((participants ?? []).map((p) => p.student_id));
}

export async function listCoachStudents(
  token: string,
): Promise<CoachStudentSummary[]> {
  const coach = await resolveCoachByToken(token);
  if (!coach) return [];

  const accessible = await studentIdsForCoach(coach.id);
  if (accessible.size === 0) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select(
      `id, first_name, last_name, photo_url, belt_level, swim_level,
       waiver_signed, intake_completed_at,
       last_session_date, last_session_mission, last_session_status,
       portal_last_seen_at, portal_last_screen, portal_visit_count,
       allergies, injuries, medical_notes`,
    )
    .in('id', Array.from(accessible))
    .order('last_session_date', { ascending: false, nullsFirst: false });

  return (data ?? []).map((s) => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    photo_url: s.photo_url,
    belt_level: s.belt_level,
    swim_level: s.swim_level,
    waiver_signed: !!s.waiver_signed,
    intake_completed_at: s.intake_completed_at,
    last_session_date: s.last_session_date,
    last_session_mission: s.last_session_mission,
    last_session_status: s.last_session_status,
    has_safety_flag: anyMedicalNote(s.allergies, s.injuries, s.medical_notes),
    portal_last_seen_at: (s as any).portal_last_seen_at ?? null,
    portal_last_screen: (s as any).portal_last_screen ?? null,
    portal_visit_count: (s as any).portal_visit_count ?? 0,
    is_returning: (daysSince(s.last_session_date) ?? -1) >= RETURNING_AFTER_DAYS,
    days_since_session: daysSince(s.last_session_date),
  }));
}

export type CoachStudentDetail = {
  // Identity
  id: string;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  age: number | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  languages: string | null;
  instagram: string | null;
  // Belt / progression
  belt_level: string;
  /** true = la puso el QUIZ y ningún coach la confirmó todavía. */
  belt_provisional: boolean;
  level_quiz_score: number | null;
  level_quiz_skillmap: { name: string; pct: number }[] | null;
  /** Resultado del quiz V2 (/100, dos tracks) — presente = el quiz fue el V2. */
  level_quiz_v2: {
    score: number;
    mar: number;
    ola: number;
    level_name: string;
    capped_by: 'water' | 'evidence' | null;
    capped_gaps: string[];
    uncapped_name: string;
    board: string | null;
    needs: number[];
    answers: number[];
  } | null;
  ocean_level: string | null;
  /** true = lo declaró el quiz y ningún coach lo vio en el agua todavía. */
  ocean_level_provisional: boolean | null;
  current_sequence_number: number | null;
  current_step_order: number | null;
  // Safety
  swim_level: string | null;
  waiver_signed: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string | null;
  injuries: string | null;
  medical_notes: string | null;
  risk_notes: string | null;
  height: string | null;
  weight: string | null;
  // Surf profile
  stance: string | null;
  surf_experience_years: string | null;
  surf_frequency: string | null;
  board_type: string | null;
  other_sports: string | null;
  learning_style: string | null;
  // Goals
  primary_goal: string | null;
  goal_short_term: string | null;
  goal_mid_term: string | null;
  goal_long_term: string | null;
  biggest_barrier: string | null;
  fears_phobias: string | null;
  // Recent session snapshot
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_pilar: string | null;
  last_session_drill: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  next_recommended_focus: string | null;
  /** Lo que el alumno dice de sí mismo (2026-09-10): autoevaluaciones sin
   *  ola, su lista de tareas, y si tiene un plan abierto en el agua. */
  self_assessed: { step_id: string; title: string; rating: number; at: string | null }[];
  own_tasks: { step_title: string; detail: string | null; sequence_id: string }[];
  open_session: { name: string; planned_at: string | null } | null;
  /** Última sesión CALCULADA desde las estrellas del coach (Marcelo 2026-09-17):
   *  qué secuencias se vieron, si completas o un detalle, y el foco siguiente
   *  con nombre. No depende del texto libre de last_session_mission. */
  last_session_work: { sequence_id: string; sequence_name: string; rated: number; total: number; complete: boolean; weakest: { step_id: string; title: string; rating: number } | null }[];
  last_session_by: string | null;
  next_focus_label: string | null;
  /** LA BITÁCORA (2026-09-25): la misma línea de tiempo que ve el coordinador
   *  en la ficha del dashboard — sesiones con coach, misiones, free surf,
   *  lecciones, nivel de agua, cinta, evaluación final, encuesta. Una sola
   *  regla (src/lib/activity/build.ts). null si falló la carga. */
  activity: StudentActivitySummary | null;
  /** La tarea vigente del coach con su estado: pendiente o trabajada (fecha). */
  coach_focus: CoachFocus | null;
  /** Pasos que el coach dejó bajo 4★, el alumno se pone 4★+ y ya entrenó desde
   *  entonces: lo primero que evaluar cuando lo vuelve a ver (2026-09-25). */
  ready_to_confirm: ReadyStep[];
  /** Tarjeta de regreso (Marcelo 2026-09-17): cuánto pasó, qué le dijiste,
   *  qué hizo en el medio. null si no vuelve (sin historial o sesión reciente). */
  returning: {
    days_since: number;
    last_by: string | null;
    last_focus: string | null;
    since: { visits: number; last_seen: string | null; last_screen: string | null; lets_play: number; lessons: number };
  } | null;
};

export async function getCoachStudentDetail(
  token: string,
  studentId: string,
): Promise<CoachStudentDetail | null> {
  const coach = await resolveCoachByToken(token);
  if (!coach) return null;

  const accessible = await studentIdsForCoach(coach.id);
  if (!accessible.has(studentId)) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select(
      `id, first_name, last_name, photo_url, age, date_of_birth, gender, nationality, languages, instagram,
       belt_level, belt_provisional, level_quiz_score, level_quiz_skillmap, level_quiz_v2,
       ocean_level, ocean_level_provisional, current_sequence_number, current_step_order,
       swim_level, waiver_signed, emergency_contact_name, emergency_contact_phone,
       allergies, injuries, medical_notes, risk_notes, height, weight,
       stance, surf_experience_years, surf_frequency, board_type, other_sports, learning_style,
       primary_goal, goal_short_term, goal_mid_term, goal_long_term, biggest_barrier, fears_phobias,
       last_session_date, last_session_mission, last_session_pilar, last_session_drill,
       last_session_status, last_homework, next_recommended_focus,
       self_sufficiency, fitness_level, wave_preference, board_length_feet, board_length_inches, board_volume_liters, comfort_wave_size, water_comfort, surf_injuries, returning_student, personal_goal,
       next_focus_sequence_id, next_focus_step_id, intake_tier, intake_completed_at, level_quiz_completed_at, shirt_size,
       portal_last_seen_at, portal_last_screen, portal_visit_count`,
    )
    .eq('id', studentId)
    .single();

  if (!data) return null;

  // Lo que el alumno dice de sí mismo — para que el coach llegue sabiendo
  // qué cree el alumno y qué se propuso (Marcelo 2026-09-10).
  const [{ data: assessed }, { data: tasks }, { data: open }, activity] = await Promise.all([
    admin.from('student_step_ratings').select('step_id, current_rating, assessed_at').eq('student_id', studentId).eq('self_source', 'assessed').is('coach_rating', null).not('current_rating', 'is', null),
    admin.from('student_tasks').select('step_id, detail, sequence_id').eq('student_id', studentId).eq('status', 'open').order('created_at'),
    admin.from('self_training_sessions').select('drill_name, planned_at').eq('student_id', studentId).eq('status', 'planned').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    // La bitácora entera, ya pasado el gate por token de arriba. El portal
    // habla inglés. Si falla no tira la ficha: el coach ve null y sigue.
    buildStudentActivity(admin, studentId, { limit: 20, lang: 'en', surveys: false }).catch((e) => { console.error('[coach-students] activity failed', e); return null; }),
  ]);
  const coachFocus = await getCoachFocus(admin, studentId).catch((e) => { console.error('[coach-students] focus failed', e); return null; });
  const readyToConfirm = await readyToConfirmForStudent(admin, studentId).catch((e) => { console.error('[coach-students] ready failed', e); return [] as ReadyStep[]; });
  // Última sesión calculada: las estrellas que el coach puso en la última
  // fecha en que calificó (misma tanda = mismo día), agrupadas por secuencia.
  const { data: lastRated } = await admin
    .from('student_step_ratings')
    .select('step_id, coach_rating, coach_rated_at, coach_rated_by')
    .eq('student_id', studentId)
    .not('coach_rated_at', 'is', null)
    .order('coach_rated_at', { ascending: false })
    .limit(80);
  const lastAt = lastRated?.[0]?.coach_rated_at ? new Date(lastRated[0].coach_rated_at) : null;
  const sameDay = (iso: string) => lastAt != null && Math.abs(new Date(iso).getTime() - lastAt.getTime()) < 36 * 3600_000;
  const batch = (lastRated ?? []).filter((r: any) => r.coach_rated_at && sameDay(r.coach_rated_at));
  const focusIds = [(data as any).next_focus_step_id].filter(Boolean) as string[];
  const stepIds = Array.from(new Set([...(assessed ?? []).map((r: any) => r.step_id), ...(tasks ?? []).map((t: any) => t.step_id), ...batch.map((r: any) => r.step_id), ...focusIds]));
  const { data: lessons } = stepIds.length ? await admin.from('lessons').select('id, title, wb_sequence_id, wb_sequence_name').in('id', stepIds) : { data: [] as any[] };
  const title = new Map((lessons ?? []).map((l: any) => [l.id, l.title as string]));
  const seqOf = new Map((lessons ?? []).map((l: any) => [l.id, { id: l.wb_sequence_id as string | null, name: l.wb_sequence_name as string | null }]));
  const seqIds = Array.from(new Set([...(lessons ?? []).map((l: any) => l.wb_sequence_id).filter(Boolean), (data as any).next_focus_sequence_id].filter(Boolean))) as string[];
  const { data: seqLessons } = seqIds.length ? await admin.from('lessons').select('id, wb_sequence_id, wb_sequence_name').in('wb_sequence_id', seqIds).eq('active', true) : { data: [] as any[] };
  const seqTotal = new Map<string, number>(); const seqName = new Map<string, string>();
  for (const l of seqLessons ?? []) { seqTotal.set(l.wb_sequence_id, (seqTotal.get(l.wb_sequence_id) ?? 0) + 1); if (l.wb_sequence_name) seqName.set(l.wb_sequence_id, l.wb_sequence_name); }
  const work = new Map<string, { sequence_id: string; sequence_name: string; rated: number; total: number; complete: boolean; weakest: { step_id: string; title: string; rating: number } | null }>();
  for (const r of batch) {
    const sq = seqOf.get(r.step_id); if (!sq?.id) continue;
    const w = work.get(sq.id) ?? { sequence_id: sq.id, sequence_name: seqName.get(sq.id) ?? sq.name ?? sq.id, rated: 0, total: seqTotal.get(sq.id) ?? 0, complete: false, weakest: null };
    w.rated += 1;
    if (!w.weakest || r.coach_rating < w.weakest.rating) w.weakest = { step_id: r.step_id, title: title.get(r.step_id) ?? r.step_id, rating: r.coach_rating };
    work.set(sq.id, w);
  }
  for (const w of work.values()) w.complete = w.total > 0 && w.rated >= w.total;
  let lastBy: string | null = null;
  if (batch[0]?.coach_rated_by) {
    const { data: c } = await admin.from('coaches').select('display_name').eq('id', batch[0].coach_rated_by).maybeSingle();
    lastBy = c?.display_name ?? null;
  }
  const nfSeq = (data as any).next_focus_sequence_id as string | null; const nfStep = (data as any).next_focus_step_id as string | null;
  // Círculos y sub-elementos (2026-09-21) se nombran por el registro de secuencias, no por lessons.
  const nfCfg = nfSeq ? SEQUENCE_PAGES[nfSeq] ?? null : null;
  const nfSeqLabel = nfSeq ? (nfCfg ? (nfCfg.eyebrow ? nfCfg.title : `#${nfCfg.number} ${nfCfg.title}`) : (seqName.get(nfSeq) ?? nfSeq)) : null;
  const nfStepLabel = nfStep ? (elementTitle(nfCfg, nfStep, title.get(nfStep) ?? null) ?? nfStep) : null;
  const nextFocusLabel = nfSeq || nfStep ? [nfSeqLabel, nfStepLabel].filter(Boolean).join(' · ') : null;
  // Tarjeta de regreso: solo si hay historial y pasaron 14+ días.
  const ds = daysSince((data as any).last_session_date);
  let returning: CoachStudentDetail['returning'] = null;
  if (ds != null && ds >= RETURNING_AFTER_DAYS) {
    const since = (data as any).last_session_date as string;
    const [{ count: visits }, { count: plays }, { count: lessonsDone }] = await Promise.all([
      admin.from('portal_visits').select('id', { count: 'exact', head: true }).eq('student_id', studentId).gt('seen_at', since),
      admin.from('self_training_sessions').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'done').gt('created_at', since),
      admin.from('lesson_progress').select('lesson_id', { count: 'exact', head: true }).eq('student_id', studentId).eq('completed', true).gt('completed_at', since),
    ]);
    returning = {
      days_since: ds,
      last_by: lastBy,
      last_focus: nextFocusLabel ? `${nextFocusLabel}${(data as any).next_recommended_focus ? ` — ${(data as any).next_recommended_focus}` : ''}` : ((data as any).next_recommended_focus ?? null),
      since: { visits: visits ?? 0, last_seen: (data as any).portal_last_seen_at ?? null, last_screen: (data as any).portal_last_screen ?? null, lets_play: plays ?? 0, lessons: lessonsDone ?? 0 },
    };
  }
  return {
    ...(data as unknown as CoachStudentDetail),
    activity,
    coach_focus: coachFocus,
    ready_to_confirm: readyToConfirm,
    returning,
    self_assessed: (assessed ?? []).map((r: any) => ({ step_id: r.step_id, title: title.get(r.step_id) ?? r.step_id, rating: r.current_rating, at: r.assessed_at ?? null })),
    own_tasks: (tasks ?? []).map((t: any) => ({ step_title: title.get(t.step_id) ?? t.step_id, detail: t.detail ?? null, sequence_id: t.sequence_id })),
    open_session: open ? { name: open.drill_name ?? 'Session', planned_at: open.planned_at ?? null } : null,
    last_session_work: Array.from(work.values()).sort((a, b) => a.sequence_id.localeCompare(b.sequence_id)),
    last_session_by: lastBy,
    next_focus_label: nextFocusLabel,
  };
}

// ── Confirmar / ajustar la cinta provisional — EN EL AGUA ────────
//
// La pieza que faltaba del circuito (diagnóstico 2026-08-31): el quiz pone
// una cinta PROVISIONAL y le promete al alumno "your coach confirms it",
// pero el coach no tenía ningún botón — todos los flujos eran promote-only.
// Regla: mientras belt_provisional=true, el coach que tiene al alumno puede
// moverla en AMBAS direcciones y confirmarla (belt_provisional=false).
// BAJAR: siempre permitido. SUBIR/confirmar por encima de su certificación:
// no — la acreditación topa la promoción (política 2026-07-11).
const BELT_ORDER = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];

export async function coachConfirmBelt(
  token: string,
  studentId: string,
  belt: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!BELT_ORDER.includes(belt)) return { ok: false, error: 'Unknown belt.' };
  const coach = await resolveCoachByToken(token);
  if (!coach) return { ok: false, error: 'Coach not found.' };
  // Confirmar cintas es del coach TITULAR (coach_id/head_coach_id), no del
  // staff de apoyo: el asistente/filmer LEE fichas (studentIdsForCoach)
  // pero no acredita niveles.
  const adminGate = createAdminClient();
  const { data: owned } = await adminGate
    .from('camp_instances')
    .select('id')
    .or(`coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}`);
  const ownedIds = (owned ?? []).map((i) => i.id);
  if (ownedIds.length === 0) return { ok: false, error: 'Only the lead coach can confirm belts.' };
  const { data: mine } = await adminGate
    .from('camp_participants')
    .select('student_id')
    .in('camp_instance_id', ownedIds)
    .eq('student_id', studentId)
    .in('enrollment_status', ['active', 'completed'])
    .limit(1);
  if (!mine || mine.length === 0) return { ok: false, error: 'Only the lead coach can confirm belts.' };

  const admin = createAdminClient();
  const [{ data: stu }, { data: me }] = await Promise.all([
    admin.from('students').select('belt_level, belt_provisional, ocean_level, ocean_level_provisional').eq('id', studentId).maybeSingle(),
    admin.from('coaches').select('max_belt_permission').eq('id', coach.id).maybeSingle(),
  ]);
  if (!stu) return { ok: false, error: 'Student not found.' };
  if (stu.belt_provisional === false) {
    return { ok: false, error: 'This belt is already confirmed. Promotions go through the normal flow.' };
  }

  const target = BELT_ORDER.indexOf(belt);
  const current = BELT_ORDER.indexOf(stu.belt_level);
  // Sin certificación seteada rige lo MÁS restrictivo (white) — el contenido
  // se gana por nivel, nunca por omisión (misma regla que el catálogo).
  // BAJAR (target < current) es siempre libre; CONFIRMAR al nivel o SUBIR
  // acredita ese nivel, y acreditar topa con la certificación (política
  // 2026-07-11) — confirmar un brown del quiz siendo coach white, no.
  const cap = BELT_ORDER.indexOf((me?.max_belt_permission as string) || 'white_belt');
  if (target >= current && target > cap) {
    return { ok: false, error: 'Your certification level does not cover that belt — ask a coach certified for it.' };
  }

  // LA REGLA DEL AGUA: confirmar AL nivel o SUBIR a Blue+ exige océano
  // semi_autonomous+ confirmado — primero Confirm ocean level, después la
  // cinta. BAJAR queda libre SIEMPRE (revisión 2026-08-31): corregir un
  // purple inflado hacia blue es acercarse a la verdad, y bloquearlo lo
  // dejaba clavado en la cinta MÁS alta — lo contrario de la regla.
  if (target >= current) {
    const waterBlock = waterRuleBlocker(belt, stu.ocean_level, stu.ocean_level_provisional);
    if (waterBlock) return { ok: false, error: waterBlock };
  }

  // Update ATÓMICO sobre la condición: si otro coach (u otra vía) ya la
  // confirmó entre el check y este write, 0 filas — no se pisa nada.
  const { data: updated, error } = await admin
    .from('students')
    .update({ belt_level: belt, belt_provisional: false })
    .eq('id', studentId)
    .eq('belt_provisional', true)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!updated || updated.length === 0) {
    return { ok: false, error: 'This belt was just confirmed by someone else — refresh to see it.' };
  }
  return { ok: true };
}

// El botón que la regla del agua le ordena usar al coach TIENE que existir
// donde el coach trabaja (revisión 2026-08-31: solo estaba en el dashboard
// staff, y el mensaje "confirm it first" era un callejón sin salida desde el
// portal). Mismo gate titular que coachConfirmBelt; sin tope de
// certificación — el océano es seguridad, no acreditación de cinta.
const OCEAN_LEVELS_ORDER = ['beginner', 'supervised', 'semi_autonomous', 'autonomous', 'advanced'];

export async function coachConfirmOcean(
  token: string,
  studentId: string,
  level: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!OCEAN_LEVELS_ORDER.includes(level)) return { ok: false, error: 'Unknown ocean level.' };
  const coach = await resolveCoachByToken(token);
  if (!coach) return { ok: false, error: 'Coach not found.' };
  const adminGate = createAdminClient();
  const { data: owned } = await adminGate
    .from('camp_instances')
    .select('id')
    .or(`coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}`);
  const ownedIds = (owned ?? []).map((i) => i.id);
  if (ownedIds.length === 0) return { ok: false, error: 'Only the lead coach can confirm the ocean level.' };
  const { data: mine } = await adminGate
    .from('camp_participants')
    .select('student_id')
    .in('camp_instance_id', ownedIds)
    .eq('student_id', studentId)
    .in('enrollment_status', ['active', 'completed'])
    .limit(1);
  if (!mine || mine.length === 0) return { ok: false, error: 'Only the lead coach can confirm the ocean level.' };

  const admin = createAdminClient();
  const { data: stu } = await admin
    .from('students')
    .select('ocean_level')
    .eq('id', studentId)
    .maybeSingle();
  if (!stu) return { ok: false, error: 'Student not found.' };

  // Historial primero (misma forma que el cierre de camp y la bitácora) y
  // recién después el update — si el insert falla, no queda un nivel
  // confirmado sin rastro de quién lo confirmó.
  const { error: histError } = await admin.from('ocean_level_evaluations').insert({
    student_id: studentId,
    evaluated_by: coach.id,
    previous_level: stu.ocean_level ?? null,
    new_level: level,
    method: 'evaluation',
    notes: 'Coach portal confirmation',
  });
  if (histError) return { ok: false, error: histError.message };
  const { error } = await admin
    .from('students')
    .update({ ocean_level: level, ocean_level_provisional: false })
    .eq('id', studentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
