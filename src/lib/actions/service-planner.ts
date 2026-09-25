'use server';
import { SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';
import { isElementOf } from '@/lib/sequence-pages/circles-seq';
import { isSidePair, resolveSidePair } from '@/lib/sequence-pages/side-pairs';
import { resolveSequenceForSteps, sequenceDisplayName } from '@/lib/sequence-pages/resolve';
import { emailEnabled } from '@/lib/email-switch';

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday, toElSalvadorDate } from '@/lib/utils/tz';
import { BELT_RANK, canCoachBelt, type BeltLevel } from '@/lib/constants/belts';
import { GRADUATION_RULES, waterRuleBlocker } from '@/lib/constants/graduation';
import { sortByBlocks } from '@/lib/constants/learning-blocks';
import { SHARED_PRE_COURSE_SECTIONS } from '@/lib/constants/courses';
import { participantPresentOn, participantLastDay, exigeCierreDeDias } from '@/lib/utils/camp-window';
import { isVisibleSelfSession, selfSessionDetail, resolveStepTitles } from '@/lib/activity/build';
import { stampNextFocus } from '@/lib/activity/coach-focus';

// ─── Types ─────────────────────────────────────────────────────────

// M45 — A summary of one day in a multi-day camp. The UI uses this to
// render the day-picker so the coach can switch between planned days.
export interface ServiceDaySummary {
  camp_session_id: string;
  day_number: number;
  session_date: string;
  completion_state: 'planned' | 'in_progress' | 'closed';
  // El día está DADO cuando camp_sessions.session_status = 'completed' — es
  // el último write de closeServicePlan (candado de pago) y la única prueba
  // de que la sesión del alumno existe. `completion_state` puede decir
  // 'closed' sin que el día se haya dado (planes sembrados), así que el
  // cierre del camp se mide con este campo, no con aquél.
  session_status: string | null;
}

export interface ServicePlanData {
  camp: {
    id: string;
    camp_name: string;
    start_date: string;
    end_date: string;
    status: string;
    scheduled_time: string | null;
    template_name: string | null;
    service_kind: string | null;
    needs_venue: boolean;
    target_belt: string | null;
    /** Sesión de prueba (capacitación): mismo flujo, sin efectos reales. */
    is_test?: boolean;
    // Accreditation context for the final evaluation UI.
    coach_max_belt: string | null;
    viewer_is_head_coach: boolean;
  };
  // M153 — students whose official final evaluation is already saved.
  finalEvaluatedIds: string[];
  /** Cierre en una línea (2026-09-20): lo que la plantilla ya tiene para
   *  mañana, por alumno (la primera secuencia de agua del día siguiente).
   *  null = no hay mañana. */
  tomorrow?: { day_number: number; byStudent: Record<string, { sequence_id: string | null; focus_step_id: string | null; focus_moments?: string[] | null }>; hasBlocks: Record<string, boolean> } | null;
  // M45 — list of all days (one camp_session per day) so the UI can render
  // a day picker. `selectedDay` is the day currently loaded in `plan` and
  // `students[].block` below.
  daySummaries: ServiceDaySummary[];
  selectedDay: ServiceDaySummary;
  plan: {
    venue_analysis: string | null;
    venue_go_no_go: 'go' | 'modified' | 'no_go' | null;
    venue_wave_size: string | null;
    venue_wind: string | null;
    venue_tide: string | null;
    venue_hazards: string | null;
    // M48 — extra standardized venue fields
    venue_crowd: string | null;
    venue_water_temp: string | null;
    venue_sky: string | null;
    warm_up_drill_id: string | null;
    warm_up_custom: string | null;
    mental_hack: string | null;
    notes_general: string | null;
    // Temas de teoría del día (topics.ts): circles, loop, lesson:<id>.
    topics: string[] | null;
    // Class-day logistics (M133): what time class starts, which beach, and
    // whether the coach needs transport (drives the coordinator's transport
    // board + the team's 7-day agenda).
    class_start_time: string | null;
    surf_venue: string | null;
    transport_needed: boolean | null;
    transport_depart: string | null;
    transport_return: string | null;
    transport_status: string | null;
    completion_state: 'planned' | 'in_progress' | 'closed';
    started_at: string | null;
    closed_at: string | null;
  };
  students: ServicePlanStudent[];
  // Coach's available tools (filtered by max_belt_permission). The
  // detail fields (description_md, success_criteria, reps_recommended)
  // power the DrillDetailModal popover the coach taps to read HOW to
  // teach the drill/mission to the student.
  availableDrills: Array<{
    id: string;
    step_id: string | null;
    title: string;
    type: 'drill' | 'mission';
    block_name: string | null;
    belt: string | null;
    key_words: string[] | null;
    time_estimate: string | null;
    reps_recommended: string | null;
    description_md: string | null;
    success_criteria: string[] | null;
  }>;
  // Canonical STP catalog (for picking sequence focus)
  stpCatalog: Array<{ id: string; title: string; pillar: string | null; display_order: number; course_section: string; step_number: number; wb_sequence_id: string | null; wb_sequence_name: string | null; wb_sequence_order: number | null; sequence_step_order: number | null }>;
  // Belt-specific sequence rated in the FINAL evaluation (graduation check).
  graduationCatalog: Array<{ id: string; title: string; pillar: string | null; display_order: number; course_section: string; step_number: number; wb_sequence_id: string | null; wb_sequence_name: string | null; wb_sequence_order: number | null; sequence_step_order: number | null }>;
  /** Progreso del PRE-CURSO por alumno. Es requisito para avanzar de cinta,
   *  pero NO bloquea el cierre: se muestra para que el coach y el alumno sepan
   *  qué falta. */
  preCourseByStudent: Record<string, { done: number; total: number }>;
  /** Los Learning Blocks son solo para Blue Belt; el resto queda como estaba. */
  graduationUsesBlocks: boolean;
  // Academy board inventory available for assignment (M108).
  availableBoards: Array<{ id: string; code: string; board_type: string | null; shape: string | null; length_feet: number | null; length_inches: number | null; volume_liters: string | null; status: string }>;
  // True when the viewer is an accepted assistant (view-only, no edits).
  readOnly: boolean;
  // M108 Fase 4 — board ids already taken by ANOTHER service on the selected
  // day's date (same academy). The picker hides/disables these to prevent
  // double-booking. Date-aware, so a board free today isn't blocked by an
  // unclosed plan on another date.
  boardConflictIds: string[];
  // M50 — per-(student, step) coach_rating so the cyan StarRating in
  // BlockEvalSection can show the current value. Empty when no rating
  // has been given yet.
  coachRatingByStudentStep: Record<string, Record<string, number>>;
  // M44 — template plan (the recipe the coordinator pre-built).
  // Coach sees this as a reference and can apply blocks to all students
  // with one tap so they don't replan from scratch.
  templatePlan: Array<{
    day_number: number;
    day_goal: string | null;
    venue_default: string | null;
    ocean_condition_target: string | null;
    evaluation_focus: string | null;
    day_notes: string | null;
    // Idioma del método (2026-09-18): secuencia principal y temas del día.
    sequence_id?: string | null;
    topic_ids?: string[] | null;
    // M77 — per-day support material (PPT / video / image / diagram).
    media: Array<{
      id: string;
      url: string;
      label: string | null;
      caption: string | null;
      media_type: 'video' | 'image' | 'diagram' | 'document';
      display_order: number;
    }>;
    blocks: Array<{
      block_order: number;
      pilar: string | null;
      pilar_part: string | null;
      block_type: string | null;
      mission_time: string | null;
      repetitions_default: number | null;
      warm_up: string | null;
      simulation: string | null;
      mental_hack: string | null;
      evaluation_focus: string | null;
      step_id: string | null;
      step_title: string | null;
      // Resolved drill (canonical via FK, or custom freeform text).
      drill_id: string | null;
      drill_custom: string | null;
      drill: {
        title: string;
        description_md: string | null;
        key_words: string[] | null;
        success_criteria: string[] | null;
        time_estimate: string | null;
      } | null;
      // Resolved mission.
      mission_id: string | null;
      mission_custom: string | null;
      mission: {
        title: string;
        description_md: string | null;
        key_words: string[] | null;
        success_criteria: string[] | null;
        time_estimate: string | null;
      } | null;
      // M78 — Activity taxonomy fields.
      explain_md: string | null;
      demonstrate_md: string | null;
      simulate_md: string | null;
      feedback_md: string | null;
      equipment: string | null;
      activity_subtype: string | null;
      step_ids: string[] | null;
      // Idioma del método (2026-09-18).
      sequence_id?: string | null;
      focus_step_id?: string | null;
      focus_moments?: string[] | null;
      topic_ids?: string[] | null;
    }>;
  }>;
  templateMeta: {
    id: string | null;
    name: string | null;
    duration_days: number | null;
  };
}

export interface StudentProfileSnapshot {
  age: number | null;            // computed from date_of_birth if age column is empty
  weight: number | null;
  height: number | null;
  ocean_level: string | null;
  stance: string | null;
  goofy_or_regular: string | null;
  surf_experience_years: number | null;
  surf_frequency: string | null;
  swim_level: string | null;
  board_type: string | null;
  board_length_feet: string | null;
  board_length_inches: string | null;
  board_volume_liters: string | null;
  favorite_wave_size: string | null;
  progression_status: string | null;
  current_sequence_number: number | null;
  current_step_order: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  primary_goal: string | null;
  personal_goal: string | null;
  goal_short_term: string | null;
  goal_mid_term: string | null;
  goal_long_term: string | null;
  fears_phobias: string | null;
  biggest_barrier: string | null;
  injuries: string | null;
  allergies: string | null;
  medical_notes: string | null;
  risk_notes: string | null;
  media_release_consent: boolean | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  current_focus_area: string | null;
  next_recommended_focus: string | null;
  next_focus_sequence_id?: string | null;
  next_focus_step_id?: string | null;
  coach_notes_general: string | null;
  learning_profile_primary: string | null;
  ocean_quiz_score: number | null;
  // Pedido de un coach: en la ficha se ve todo el perfil menos de dónde es la
  // persona y qué puntaje sacó en el formulario de nivel. Los dos ya estaban
  // en la base sin llegar nunca al planificador.
  nationality: string | null;
  level_quiz_score: number | null;
  /** true = el score es del quiz V2 (/100); false/undefined = v1 (/70). */
  level_quiz_is_v2?: boolean;
  /** Del quiz V2 (Marcelo 2026-09-25): la tabla que dijo usar y las dos
   *  cosas que eligió trabajar, en orden de prioridad (índices de V2_NEEDS). */
  level_quiz_board?: string | null;
  level_quiz_needs?: number[] | null;
  intake_completed_at?: string | null;
  intake_url?: string | null;
}

// One entry in a student's recent training history — coach session or
// self-training, merged + sorted so the coach sees the full picture.
export interface RecentSessionEntry {
  date: string | null;
  type: 'coach' | 'self';
  label: string;
  status: string | null;
  /** 🎯 Hilo de progresión (Fase 3, 2026-08-09): el "qué trabajar próximo" que
   *  dejó el coach de ESA sesión — el próximo coach ve el hilo completo, no
   *  solo el último valor. */
  whats_next?: string | null;
  /** La misma línea que la bitácora de la ficha (2026-09-25): secuencia ★,
   *  qué la frenó, misión lograda o no, foco/flow que reportó, venue. */
  detail?: string | null;
}

// Summary of the student's STP self-ratings (and any official coach
// ratings) — lets the coach spot over/under-estimation before planning.
export interface StepRatingSummary {
  selfRatedCount: number;
  avgSelfRating: number | null;
  coachRatedCount: number;
  avgCoachRating: number | null;
}

export interface ServicePlanBlock {
  id: string | null;
  order_index: number;
  step_id: string | null;
  // Multi-step blocks (M78 activity taxonomy) — all STPs this block trains.
  step_ids?: string[] | null;
  // Foco estructurado (2026-09-17): la secuencia del curso y los momentos
  // elegidos, al lado del objective_text (que sigue siendo el texto).
  sequence_id?: string | null;
  focus_step_id?: string | null;
  focus_moments?: string[] | null;
  land_drill_id: string | null;
  land_drill_custom: string | null;
  water_drill_id: string | null;
  water_drill_custom: string | null;
  objective_text: string | null;
  notes_pre: string | null;
  status: 'achieved' | 'partial' | 'not_yet' | null;
  notes_post: string | null;
  board_type: string | null;
  board_size_feet: number | null;
  board_size_inches: number | null;
  board_id: string | null;  // linked inventory board (M108)
  // M47 — Coach-rated, per-block-per-student (filled at close).
  focus_level: number | null;   // 0-3 (Distracted · Some · Mostly · Locked in), misma escala que el alumno
  flow_channel: number | null;  // 1=bored, 3=optimal, 5=frustrated
  day_objective_status?: string | null; // session-level: achieved | partial | not_yet (block 0)
  whats_next?: string | null; // session-level: qué trabajar próximo (block 0) — REQUERIDO al cierre de surf
  // Cierre con video análisis (2026-09-18): estrella del coach para la
  // secuencia de este bloque + próximo foco estructurado (bloque 0).
  coach_sequence_rating?: number | null;
  next_focus_sequence_id?: string | null;
  next_focus_step_id?: string | null;
  // Cierre en una línea (2026-09-20): "se trabajó otra cosa". La estrella
  // califica ESTA secuencia cuando está; la planeada sigue en sequence_id.
  worked_sequence_id?: string | null;
  /** Misiones de mañana (hasta 3 elementos, en orden) elegidas en el cierre (2026-09-21). */
  next_focus_moments?: string[] | null;
}

export interface ServicePlanStudent {
  student_id: string;
  display_name: string;
  belt_level: string | null;
  photo_url: string | null;
  profile: StudentProfileSnapshot;
  recentSessions: RecentSessionEntry[];
  stepRatings: StepRatingSummary;
  // M45 — all blocks for the SELECTED day, sorted by order_index. A day
  // can have multiple blocks (multi-mission day, multi-STP focus, etc).
  blocks: ServicePlanBlock[];
}

// ─── Load: plan + students + tools ─────────────────────────────────

/**
 * La primera secuencia de AGUA del día de un alumno, con la misma regla que
 * daySequencesOf en el cierre: se saltan THREE-CIRCLES y los bloques solo de
 * tierra; la secuencia sale de sequence_id o, en plantillas viejas, de los
 * pasos; el foco se toma del primer bloque de esa secuencia que lo tenga
 * (en v2 el bloque de tierra va antes que el de agua y no trae foco).
 */
function firstWaterSequenceOfDay(blocks: any[], belt: string | null): { cfg: import('@/lib/sequence-pages/types').SequencePageConfig; block: any; focusStepId: string | null } | null {
  const sorted = [...(blocks ?? [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  for (const b of sorted) {
    const landOnly = !!(b.land_drill_id || b.land_drill_custom) && !b.water_drill_id && !b.water_drill_custom && b.order_index !== 0;
    if (landOnly) continue;
    if (b.sequence_id === 'THREE-CIRCLES') continue;
    const cfg = (b.sequence_id && SEQUENCE_PAGES[b.sequence_id]) || resolveSequenceForSteps({ stepIds: b.step_ids, stepId: b.step_id }, belt);
    if (!cfg) continue;
    const withFocus = sorted.find((x) => {
      const c = (x.sequence_id && SEQUENCE_PAGES[x.sequence_id]) || resolveSequenceForSteps({ stepIds: x.step_ids, stepId: x.step_id }, belt);
      return c?.id === cfg.id && !!x.focus_step_id;
    });
    return { cfg, block: b, focusStepId: withFocus?.focus_step_id ?? null };
  }
  return null;
}

export async function getServicePlan(
  token: string,
  campInstanceId: string,
  dayNumberArg?: number
): Promise<ServicePlanData | null> {
  const admin = createAdminClient();

  // Resolve coach + verify they own this camp_instance
  const { data: coach } = await admin
    .from('coaches')
    .select('id, max_belt_permission')
    .eq('portal_token', token)
    .single();
  if (!coach) return null;

  const { data: camp } = await admin
    .from('camp_instances')
    .select(
      'id, camp_name, start_date, end_date, status, scheduled_time, coach_id, head_coach_id, template_id, academy_id, is_test, camp_templates:template_id(template_name, service_kind, duration_days, includes_course_key, needs_venue)'
    )
    .eq('id', campInstanceId)
    .single();
  if (!camp) return null;
  // Owner (coach/head coach) gets full edit. An accepted assistant gets
  // read-only access (can view the plan + student info, cannot modify).
  const isOwner = camp.coach_id === coach.id || camp.head_coach_id === coach.id;
  let readOnly = false;
  if (!isOwner) {
    const { data: asg } = await admin
      .from('service_staff')
      .select('id')
      .eq('camp_instance_id', campInstanceId)
      .eq('coach_id', coach.id)
      .eq('role', 'assistant')
      .eq('status', 'accepted')
      .maybeSingle();
    if (!asg) return null;
    readOnly = true;
  }

  const tpl = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;

  // M45 — load all days (camp_sessions) for this camp + their service_plans
  // so the UI can render a day picker. Pick the requested day (or default
  // to the earliest non-closed day) as the "selected" day to load.
  const { data: campSessions } = await admin
    .from('camp_sessions')
    .select('id, day_number, session_date, session_status')
    .eq('camp_instance_id', campInstanceId)
    .order('day_number');
  const sessions = campSessions ?? [];
  if (sessions.length === 0) return null;

  const sessionIds = sessions.map((s: any) => s.id);
  const { data: plansForCamp } = await admin
    .from('service_plans')
    .select('*')
    .in('camp_session_id', sessionIds);
  const planBySessionId = new Map<string, any>();
  for (const p of plansForCamp ?? []) planBySessionId.set(p.camp_session_id, p);

  // M153 — final-eval progress: which students already have their official
  // final evaluation saved (partial saves included).
  const { data: fevs } = await admin
    .from('camp_final_evaluations')
    .select('student_id')
    .eq('camp_instance_id', (camp as any).id);
  const finalEvaluatedIds = Array.from(new Set((fevs ?? []).map((f: any) => f.student_id)));

  const daySummaries: ServiceDaySummary[] = sessions.map((s: any) => ({
    camp_session_id: s.id,
    day_number: s.day_number,
    session_date: s.session_date,
    completion_state: (planBySessionId.get(s.id)?.completion_state as any) ?? 'planned',
    session_status: s.session_status ?? null,
  }));

  // Pick the day to load. Order of preference:
  // 1. The explicit dayNumberArg if it exists
  // 2. The first non-closed day
  // 3. Day 1
  let selectedDay: ServiceDaySummary;
  if (dayNumberArg) {
    selectedDay =
      daySummaries.find((d) => d.day_number === dayNumberArg) ?? daySummaries[0];
  } else {
    selectedDay =
      daySummaries.find((d) => d.completion_state !== 'closed') ?? daySummaries[0];
  }

  const plan = planBySessionId.get(selectedDay.camp_session_id) ?? null;

  // Students enrolled in this camp_instance — pull the full profile
  // snapshot so the coach can review level, goals, fears, injuries,
  // medical info and last-session history before planning.
  // NOTE: students has no display_name column (that's on coaches) — we
  // compose it from first_name + last_name.
  const { data: participantsRaw } = await admin
    .from('camp_participants')
    .select(
      'student_id, finalized_at, departed_on, planned_departure, students:student_id(' +
        'id, first_name, last_name, belt_level, photo_url, age, date_of_birth, weight, height, ocean_level, ' +
        'nationality, level_quiz_score, level_quiz_v2, ' +
        'ocean_quiz_score, stance, goofy_or_regular, surf_experience_years, surf_frequency, swim_level, ' +
        'board_type, board_length_feet, board_length_inches, board_volume_liters, ' +
        'favorite_wave_size, progression_status, ' +
        'current_sequence_number, current_step_order, ' +
        'emergency_contact_name, emergency_contact_phone, ' +
        'primary_goal, personal_goal, goal_short_term, goal_mid_term, goal_long_term, ' +
        'fears_phobias, biggest_barrier, injuries, allergies, medical_notes, risk_notes, media_release_consent, ' +
        'last_session_date, last_session_mission, last_session_status, last_homework, ' +
        'current_focus_area, next_recommended_focus, next_focus_sequence_id, next_focus_step_id, coach_notes_general, learning_profile_primary, intake_completed_at, portal_token' +
      ')'
    )
    .eq('camp_instance_id', campInstanceId)
    .eq('enrollment_status', 'active');

  // Camp corto o salida anticipada: fuera del roster de los días POSTERIORES
  // a su último día — caso Stanley 2026-08-22: cerró a dos el jueves y el
  // planner se los seguía pidiendo evaluar cada día. Los días hasta su salida
  // (incluida) quedan intactos para el historial. La regla vive en una sola
  // función, participantPresentOn(), que usan todas las pantallas de "quién
  // está hoy" — si se escribe a mano en cada sitio, se separan.
  const participants = (participantsRaw ?? []).filter((p: any) =>
    participantPresentOn(p, selectedDay.session_date),
  );

  const studentIds = (participants ?? []).map((p: any) => p.student_id);

  // M45 — All blocks for the SELECTED day, grouped per student.
  const { data: blocks } = await admin
    .from('service_plan_blocks')
    .select('*')
    .eq('camp_session_id', selectedDay.camp_session_id)
    .order('order_index');
  const blocksByStudent = new Map<string, any[]>();
  for (const b of blocks ?? []) {
    const arr = blocksByStudent.get(b.student_id) ?? [];
    arr.push(b);
    blocksByStudent.set(b.student_id, arr);
  }

  // Recent training history per student — coach sessions
  // (student_session_results) + self-training (self_training_sessions),
  // merged and sorted so the coach sees the full picture.
  const recentByStudent: Record<string, RecentSessionEntry[]> = {};
  if (studentIds.length > 0) {
    const [coachSessRes, selfSessRes] = await Promise.all([
      admin
        .from('student_session_results')
        .select('student_id, created_at, status, mission, coach_feedback, whats_next, standalone_sessions(mission)')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }),
      // Misma regla que la bitácora de la ficha (src/lib/activity/build.ts):
      // solo sesiones cerradas (status done) y sin los puentes de horas del
      // check-in HP. Antes entraban planes descartados y 600 filas HP.
      admin
        .from('self_training_sessions')
        .select('*')
        .in('student_id', studentIds)
        .eq('status', 'done')
        .order('created_at', { ascending: false }),
    ]);
    for (const r of coachSessRes.data ?? []) {
      const ss = Array.isArray(r.standalone_sessions)
        ? r.standalone_sessions[0]
        : r.standalone_sessions;
      // Camp/service sessions have no standalone_sessions row, so fall back
      // to a snippet of the coach's written feedback so the coach sees what
      // the last in-person class actually covered (not a generic label).
      const fbSnippet = r.coach_feedback
        ? r.coach_feedback.replace(/\s+/g, ' ').trim().slice(0, 60)
        : null;
      (recentByStudent[r.student_id] ??= []).push({
        date: r.created_at,
        type: 'coach',
        label: ss?.mission || r.mission || fbSnippet || 'Coach session',
        status: r.status,
        whats_next: (r as any).whats_next ?? null,
      });
    }
    // Nombres de los pasos que frenaron una cadena (una sola consulta).
    const heldIds = new Set<string>();
    for (const r of (selfSessRes.data ?? []) as any[]) for (const m of (r.step_marks ?? []) as any[]) if (m?.held_back && m?.step_id) heldIds.add(m.step_id);
    const heldTitle = await resolveStepTitles(admin, heldIds);
    for (const r of (selfSessRes.data ?? []) as any[]) {
      if (!isVisibleSelfSession(r)) continue;
      (recentByStudent[r.student_id] ??= []).push({
        date: r.session_date || r.created_at,
        type: 'self',
        label: r.kind === 'free_surf' ? 'Free surf' : (r.drill_name || r.intention_text || 'Self-training'),
        // El detalle ya dice si la misión se logró; el status solo avisa si quedó a medias.
        status: r.completed ? null : 'not finished',
        detail: selfSessionDetail(r, heldTitle, 'en'),
      });
    }
    for (const sid of Object.keys(recentByStudent)) {
      recentByStudent[sid].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
      recentByStudent[sid] = recentByStudent[sid].slice(0, 10);
    }
  }

  // STP self-rating summary per student (+ official coach ratings)
  // and a per-(student, step) coach_rating map so the eval UI can
  // show the current cyan star value the coach already gave.
  const ratingsByStudent: Record<string, { self: number[]; coach: number[] }> = {};
  const coachRatingByStudentStep: Record<string, Record<string, number>> = {};
  if (studentIds.length > 0) {
    const { data: ratings } = await admin
      .from('student_step_ratings')
      .select('student_id, step_id, current_rating, coach_rating')
      .in('student_id', studentIds);
    for (const r of ratings ?? []) {
      const e = (ratingsByStudent[r.student_id] ??= { self: [], coach: [] });
      if (r.current_rating && r.current_rating > 0) e.self.push(r.current_rating);
      if (r.coach_rating && r.coach_rating > 0) {
        e.coach.push(r.coach_rating);
        const stepMap = (coachRatingByStudentStep[r.student_id] ??= {});
        stepMap[r.step_id] = r.coach_rating;
      }
    }
  }
  const avgOf = (arr: number[]): number | null =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  // Compute age from date_of_birth (fallback when the age column is empty)
  const ageFrom = (age: number | null, dob: string | null): number | null => {
    if (age != null) return age;
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a >= 0 && a < 120 ? a : null;
  };

  const students: ServicePlanStudent[] = (participants ?? []).map((p: any) => {
    const s = Array.isArray(p.students) ? p.students[0] : p.students;
    const studentBlocks = blocksByStudent.get(p.student_id) ?? [];
    const rr = ratingsByStudent[p.student_id] ?? { self: [], coach: [] };
    return {
      student_id: p.student_id,
      display_name:
        `${s?.first_name ?? ''} ${s?.last_name ?? ''}`.trim() || 'Student',
      belt_level: s?.belt_level ?? null,
      photo_url: s?.photo_url ?? null,
      recentSessions: recentByStudent[p.student_id] ?? [],
      stepRatings: {
        selfRatedCount: rr.self.length,
        avgSelfRating: avgOf(rr.self),
        coachRatedCount: rr.coach.length,
        avgCoachRating: avgOf(rr.coach),
      },
      profile: {
        age: ageFrom(s?.age ?? null, s?.date_of_birth ?? null),
        weight: s?.weight ?? null,
        height: s?.height ?? null,
        ocean_level: s?.ocean_level ?? null,
        stance: s?.stance ?? null,
        goofy_or_regular: s?.goofy_or_regular ?? null,
        surf_experience_years: s?.surf_experience_years ?? null,
        surf_frequency: s?.surf_frequency ?? null,
        swim_level: s?.swim_level ?? null,
        board_type: s?.board_type ?? null,
        board_length_feet: s?.board_length_feet ?? null,
        board_length_inches: s?.board_length_inches ?? null,
        board_volume_liters: s?.board_volume_liters ?? null,
        favorite_wave_size: s?.favorite_wave_size ?? null,
        progression_status: s?.progression_status ?? null,
        current_sequence_number: s?.current_sequence_number ?? null,
        current_step_order: s?.current_step_order ?? null,
        emergency_contact_name: s?.emergency_contact_name ?? null,
        emergency_contact_phone: s?.emergency_contact_phone ?? null,
        primary_goal: s?.primary_goal ?? null,
        personal_goal: s?.personal_goal ?? null,
        goal_short_term: s?.goal_short_term ?? null,
        goal_mid_term: s?.goal_mid_term ?? null,
        goal_long_term: s?.goal_long_term ?? null,
        fears_phobias: s?.fears_phobias ?? null,
        biggest_barrier: s?.biggest_barrier ?? null,
        injuries: s?.injuries ?? null,
        allergies: s?.allergies ?? null,
        medical_notes: s?.medical_notes ?? null,
        risk_notes: s?.risk_notes ?? null,
        media_release_consent: s?.media_release_consent ?? null,
        last_session_date: s?.last_session_date ?? null,
        last_session_mission: s?.last_session_mission ?? null,
        last_session_status: s?.last_session_status ?? null,
        last_homework: s?.last_homework ?? null,
        current_focus_area: s?.current_focus_area ?? null,
        next_recommended_focus: s?.next_recommended_focus ?? null,
        next_focus_sequence_id: s?.next_focus_sequence_id ?? null,
        next_focus_step_id: s?.next_focus_step_id ?? null,
        coach_notes_general: s?.coach_notes_general ?? null,
        learning_profile_primary: s?.learning_profile_primary ?? null,
        ocean_quiz_score: s?.ocean_quiz_score ?? null,
        nationality: s?.nationality ?? null,
        level_quiz_score: s?.level_quiz_score ?? null,
        level_quiz_is_v2: s?.level_quiz_v2 != null,
        level_quiz_board: (s?.level_quiz_v2 as any)?.board ?? null,
        level_quiz_needs: Array.isArray((s?.level_quiz_v2 as any)?.needs) ? (s.level_quiz_v2 as any).needs : null,
        intake_completed_at: s?.intake_completed_at ?? null,
        intake_url: s?.portal_token ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com'}/intake/${s.portal_token}` : null,
      },
      blocks: studentBlocks.map((b: any) => ({
        id: b.id ?? null,
        order_index: b.order_index ?? 0,
        step_id: b.step_id ?? null,
        step_ids: b.step_ids ?? null,
        sequence_id: b.sequence_id ?? null,
        focus_step_id: b.focus_step_id ?? null,
        focus_moments: b.focus_moments ?? null,
        land_drill_id: b.land_drill_id ?? null,
        land_drill_custom: b.land_drill_custom ?? null,
        water_drill_id: b.water_drill_id ?? null,
        water_drill_custom: b.water_drill_custom ?? null,
        objective_text: b.objective_text ?? null,
        notes_pre: b.notes_pre ?? null,
        status: b.status ?? null,
        notes_post: b.notes_post ?? null,
        whats_next: b.whats_next ?? null,
        board_type: b.board_type ?? null,
        board_size_feet: b.board_size_feet ?? null,
        board_size_inches: b.board_size_inches ?? null,
        board_id: b.board_id ?? null,
        focus_level: b.focus_level ?? null,
        flow_channel: b.flow_channel ?? null,
        day_objective_status: b.day_objective_status ?? null,
        coach_sequence_rating: b.coach_sequence_rating ?? null,
        next_focus_sequence_id: b.next_focus_sequence_id ?? null,
        next_focus_step_id: b.next_focus_step_id ?? null,
        worked_sequence_id: b.worked_sequence_id ?? null,
        next_focus_moments: b.next_focus_moments ?? null,
      })),
    };
  });

  // Cierre en una línea (2026-09-20): lo que la plantilla ya tiene para mañana,
  // por alumno — la línea "Tomorrow" del cierre sale de acá cuando hoy fue 4★+.
  let tomorrow: ServicePlanData['tomorrow'] = null;
  {
    const nextDay = daySummaries.filter((d) => d.day_number > selectedDay.day_number).sort((a, b) => a.day_number - b.day_number)[0];
    if (nextDay) {
      const { data: nb } = await admin
        .from('service_plan_blocks')
        .select('student_id, order_index, sequence_id, focus_step_id, focus_moments, step_id, step_ids, land_drill_id, land_drill_custom, water_drill_id, water_drill_custom')
        .eq('camp_session_id', nextDay.camp_session_id)
        .order('order_index');
      const beltOf: Record<string, string | null> = {};
      for (const st of students) beltOf[st.student_id] = st.belt_level;
      const byStudentBlocks: Record<string, any[]> = {};
      for (const b of nb ?? []) (byStudentBlocks[b.student_id] ??= []).push(b);
      const byStudent: Record<string, { sequence_id: string | null; focus_step_id: string | null; focus_moments?: string[] | null }> = {};
      const hasBlocks: Record<string, boolean> = {};
      for (const sid of Object.keys(byStudentBlocks)) {
        hasBlocks[sid] = byStudentBlocks[sid].length > 0;
        const first = firstWaterSequenceOfDay(byStudentBlocks[sid], beltOf[sid] ?? null);
        if (first) byStudent[sid] = { sequence_id: first.cfg.id, focus_step_id: first.focusStepId, focus_moments: Array.isArray(first.block?.focus_moments) ? first.block.focus_moments.filter((x: string) => isElementOf(first.cfg, x)) : null };
      }
      tomorrow = { day_number: nextDay.day_number, byStudent, hasBlocks };
    }
  }

  // Coach's available drills (filtered by belt)
  const beltRank: Record<string, number> = {
    white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6,
  };
  const myBeltShort = (coach.max_belt_permission || '').replace('_belt', '');
  const myRank = beltRank[myBeltShort] ?? 6;
  const { data: drillsRaw } = await admin
    .from('drills_missions')
    .select(
      'id, step_id, title, type, block_name, belt, key_words, time_estimate, ' +
        'reps_recommended, description_md, success_criteria, display_order'
    )
    .eq('active', true)
    .eq('coach_visible', true)
    .order('display_order');
  const availableDrills = (drillsRaw ?? []).filter(
    (d: any) => (beltRank[d.belt] ?? 1) <= myRank
  );

  // STP catalog — belt-aware, con las MISMAS secciones que la graduación
  // (GRADUATION_RULES.sections). Estaba clavado en white_belt: el coach de un
  // camp de Blue elegía el "sequence focus" del día entre los 25 pasos de
  // White, sin poder apuntar el bloque a Frontside Pumping ni a nada de su
  // propia cinta. Ordenado por secuencia del método, no por display_order.
  const gradRule = tpl?.includes_course_key ? GRADUATION_RULES[tpl.includes_course_key] : undefined;
  const gradSections = gradRule?.sections ?? ['white_belt'];
  const { data: stpRowsRaw } = await admin
    .from('lessons')
    .select(
      'id, title, pillar, display_order, course_section, step_number, ' +
        'wb_sequence_id, wb_sequence_name, wb_sequence_order, sequence_step_order'
    )
    .in('course_section', gradSections)
    .eq('active', true)
    .order('display_order');
  const stpRows = (stpRowsRaw ?? []).slice().sort((a: any, b: any) => {
    const so = (x: any) => x.wb_sequence_order ?? 999;
    if (so(a) !== so(b)) return so(a) - so(b);
    const st = (x: any) => x.sequence_step_order ?? x.display_order;
    return st(a) - st(b);
  });

  // Graduation catalog — la evaluación final califica exactamente el mismo
  // corte, así que reutiliza el catálogo de arriba.
  const gradRows = stpRows;

  // Los Learning Blocks son SOLO para Blue Belt. White y Yellow conservan su
  // organización de siempre.
  const graduationUsesBlocks = tpl?.includes_course_key === 'blue_belt';

  // Pre-curso: cuántas de sus lecciones lleva leídas cada alumno del camp. Es
  // uno de los requisitos para avanzar de cinta — informativo, no bloquea.
  const preCourseByStudent: Record<string, { done: number; total: number }> = {};
  {
    const { data: pcLessons } = await admin
      .from('lessons')
      .select('id')
      .in('course_section', SHARED_PRE_COURSE_SECTIONS as unknown as string[])
      .eq('active', true);
    const pcIds = (pcLessons ?? []).map((l: any) => l.id);
    const studentIds = students.map((s) => s.student_id);
    if (pcIds.length && studentIds.length) {
      const { data: prog } = await admin
        .from('lesson_progress')
        .select('student_id, lesson_id')
        .in('student_id', studentIds)
        .in('lesson_id', pcIds)
        .eq('completed', true);
      for (const sid of studentIds) preCourseByStudent[sid] = { done: 0, total: pcIds.length };
      for (const r of (prog ?? []) as any[]) {
        if (preCourseByStudent[r.student_id]) preCourseByStudent[r.student_id].done += 1;
      }
    }
  }

  // M44 — load the template plan if there is a template attached.
  // Days come from camp_template_days, blocks from camp_template_blocks
  // (joined via template_day_id). Phase B (read view) needs drill +
  // mission FULL detail inline so we fetch + merge them here.
  let templatePlan: ServicePlanData['templatePlan'] = [];
  const templateMeta: ServicePlanData['templateMeta'] = {
    id: (camp as any).template_id ?? null,
    name: tpl?.template_name ?? null,
    duration_days: tpl?.duration_days ?? null,
  };
  if ((camp as any).template_id) {
    templatePlan = await hydrateTemplatePlan(admin, (camp as any).template_id);
  }

  // Board inventory for the camp's academy — for the planner picker.
  // Exclude retired boards and boards currently rented out to walk-ins
  // (those are held by the rentals engine and aren't available to assign).
  let availableBoards: ServicePlanData['availableBoards'] = [];
  let boardConflictIds: string[] = [];
  if ((camp as any).academy_id) {
    const { data: boardRows } = await admin
      .from('boards')
      .select('id, code, board_type, shape, length_feet, length_inches, volume_liters, status')
      .eq('academy_id', (camp as any).academy_id)
      .not('status', 'in', '(retired,rented)')
      .order('code');
    availableBoards = (boardRows ?? []) as any[];

    // Fase 4 — boards already booked by ANOTHER service on the same date.
    if (selectedDay.session_date) {
      const { data: sameDay } = await admin
        .from('camp_sessions')
        .select('id, camp_instances:camp_instance_id!inner(academy_id)')
        .eq('session_date', selectedDay.session_date)
        .eq('camp_instances.academy_id', (camp as any).academy_id)
        .neq('id', selectedDay.camp_session_id);
      const otherSessionIds = (sameDay ?? []).map((s: any) => s.id);
      if (otherSessionIds.length > 0) {
        const { data: takenRows } = await admin
          .from('service_plan_blocks')
          .select('board_id')
          .in('camp_session_id', otherSessionIds)
          .not('board_id', 'is', null);
        boardConflictIds = Array.from(new Set((takenRows ?? []).map((r: any) => r.board_id)));
      }
    }
  }

  return {
    camp: {
      id: camp.id,
      camp_name: camp.camp_name,
      start_date: camp.start_date,
      end_date: camp.end_date,
      status: camp.status,
      scheduled_time: camp.scheduled_time ?? null,
      template_name: tpl?.template_name ?? null,
      service_kind: tpl?.service_kind ?? null,
      // false = se da en la academia: el planner no pide playa ni transporte.
      needs_venue: tpl?.needs_venue !== false,
      target_belt: tpl?.includes_course_key ?? null,
      is_test: !!(camp as any).is_test,
      coach_max_belt: coach.max_belt_permission ?? null,
      viewer_is_head_coach: camp.head_coach_id === coach.id,
    },
    plan: {
      venue_analysis: plan?.venue_analysis ?? null,
      venue_go_no_go: plan?.venue_go_no_go ?? null,
      venue_wave_size: plan?.venue_wave_size ?? null,
      venue_wind: plan?.venue_wind ?? null,
      venue_tide: plan?.venue_tide ?? null,
      venue_hazards: plan?.venue_hazards ?? null,
      venue_crowd: plan?.venue_crowd ?? null,
      venue_water_temp: plan?.venue_water_temp ?? null,
      venue_sky: plan?.venue_sky ?? null,
      warm_up_drill_id: plan?.warm_up_drill_id ?? null,
      warm_up_custom: plan?.warm_up_custom ?? null,
      mental_hack: plan?.mental_hack ?? null,
      notes_general: plan?.notes_general ?? null,
      topics: plan?.topics ?? null,
      class_start_time: plan?.class_start_time ?? null,
      surf_venue: plan?.surf_venue ?? null,
      transport_needed: plan?.transport_needed ?? null,
      transport_depart: plan?.transport_depart ?? null,
      transport_return: plan?.transport_return ?? null,
      transport_status: plan?.transport_status ?? null,
      completion_state: (plan?.completion_state as any) ?? 'planned',
      started_at: plan?.started_at ?? null,
      closed_at: plan?.closed_at ?? null,
    },
    daySummaries,
    selectedDay,
    students,
    finalEvaluatedIds,
    tomorrow,
    availableDrills: availableDrills as any[],
    stpCatalog: (stpRows ?? []) as any[],
    graduationCatalog: (graduationUsesBlocks
      ? sortByBlocks((gradRows ?? stpRows ?? []) as any[])
      : (gradRows ?? stpRows ?? [])) as any[],
    graduationUsesBlocks,
    preCourseByStudent,
    availableBoards,
    boardConflictIds,
    readOnly,
    coachRatingByStudentStep,
    templatePlan,
    templateMeta,
  };
}

// ─── Lightweight template-plan fetch for read-only surfaces
// (camp detail page, coach Plan tab). Pulls the same templatePlan +
// templateMeta as getServicePlan but without needing a coach token /
// camp session id — just the camp_instance id.
export async function getCampPlanForRead(
  campInstanceId: string,
): Promise<{
  templatePlan: ServicePlanData['templatePlan'];
  templateMeta: ServicePlanData['templateMeta'];
}> {
  const admin = createAdminClient();

  const { data: camp } = await admin
    .from('camp_instances')
    .select('template_id, camp_templates(template_name, duration_days)')
    .eq('id', campInstanceId)
    .maybeSingle();

  const tpl: any = Array.isArray((camp as any)?.camp_templates)
    ? (camp as any).camp_templates[0]
    : (camp as any)?.camp_templates;

  const templateMeta: ServicePlanData['templateMeta'] = {
    id: (camp as any)?.template_id ?? null,
    name: tpl?.template_name ?? null,
    duration_days: tpl?.duration_days ?? null,
  };

  if (!templateMeta.id) return { templatePlan: [], templateMeta };

  const templatePlan: ServicePlanData['templatePlan'] = await hydrateTemplatePlan(admin, templateMeta.id);

  return { templatePlan, templateMeta };
}

// ─── Save plan-level (venue + warm-up + mental hack + notes) ──────

export async function saveServicePlanHeader(
  token: string,
  campSessionId: string,
  patch: Partial<{
    venue_analysis: string | null;
    venue_go_no_go: 'go' | 'modified' | 'no_go' | null;
    venue_wave_size: string | null;
    venue_wind: string | null;
    venue_tide: string | null;
    venue_hazards: string | null;
    venue_crowd: string | null;
    venue_water_temp: string | null;
    venue_sky: string | null;
    warm_up_drill_id: string | null;
    warm_up_custom: string | null;
    mental_hack: string | null;
    notes_general: string | null;
    topics: string[] | null;
    class_start_time: string | null;
    surf_venue: string | null;
    transport_needed: boolean | null;
    transport_depart: string | null;
    transport_return: string | null;
  }>
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Resolve the camp_instance + ownership through the session.
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Upsert the plan row for this specific day.
  const { data: existing } = await admin
    .from('service_plans')
    .select('id')
    .eq('camp_session_id', campSessionId)
    .maybeSingle();
  if (existing) {
    await admin
      .from('service_plans')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await admin.from('service_plans').insert({
      camp_instance_id: session.camp_instance_id,
      camp_session_id: campSessionId,
      ...patch,
      completion_state: 'planned',
    });
  }

  // Nota al equipo (coordinación + Front Desk) si se tocó el transporte
  // desde la vista del día. Best-effort — nunca traba el guardado.
  if ('transport_needed' in patch || 'transport_depart' in patch || 'transport_return' in patch) {
    try {
      const { data: instRow } = await admin
        .from('camp_instances').select('camp_name, academy_id')
        .eq('id', session.camp_instance_id).maybeSingle();
      const { data: coachRow } = await admin.from('coaches').select('display_name').eq('portal_token', token).maybeSingle();
      const { data: sessRow } = await admin.from('camp_sessions').select('session_date').eq('id', campSessionId).maybeSingle();
      await notifyTransportTeam(admin, (instRow as any)?.academy_id ?? null, {
        campName: (instRow as any)?.camp_name ?? '—',
        dateLabel: (sessRow as any)?.session_date ?? '',
        actor: (coachRow as any)?.display_name ?? 'Coach',
        needed: patch.transport_needed !== false,
        depart: (patch.transport_depart as string) ?? null,
        ret: (patch.transport_return as string) ?? null,
      });
    } catch { /* best-effort */ }
  }
}

// ─── Apply a header field to the WHOLE week (M134) ─────────────────
// The coach plans the group warm-up / mental hack once and reuses it for
// every day of the camp. Upserts a plan row per camp_session with the patch;
// days that already have their own value get overwritten on purpose (the
// coach pressed the button knowing that).

export async function applyPlanHeaderToWeek(
  token: string,
  campSessionId: string,
  patch: Partial<{
    warm_up_drill_id: string | null;
    warm_up_custom: string | null;
    mental_hack: string | null;
  }>
): Promise<{ ok: boolean; days?: number; error?: string }> {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) return { ok: false, error: 'Coach not found.' };

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) return { ok: false, error: 'Session not found.' };
  const camp = Array.isArray(session.camp_instances) ? session.camp_instances[0] : session.camp_instances;
  if (!camp || (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id)) {
    return { ok: false, error: 'You are not assigned to this service.' };
  }

  const { data: sessions } = await admin
    .from('camp_sessions')
    .select('id')
    .eq('camp_instance_id', session.camp_instance_id);
  const ids = (sessions ?? []).map((x: any) => x.id);
  const { data: plans } = await admin
    .from('service_plans')
    .select('id, camp_session_id, completion_state')
    .in('camp_session_id', ids);
  const planBySession = new Map((plans ?? []).map((p: any) => [p.camp_session_id, p]));

  let touched = 0;
  for (const sid of ids) {
    const existing = planBySession.get(sid);
    if (existing) {
      if (existing.completion_state === 'closed') continue; // never rewrite a closed day
      await admin.from('service_plans').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await admin.from('service_plans').insert({
        camp_instance_id: session.camp_instance_id,
        camp_session_id: sid,
        ...patch,
        completion_state: 'planned',
      });
    }
    touched++;
  }
  return { ok: true, days: touched };
}

// ─── Apply a student's board to the WHOLE week (M136) ──────────────
// The coach assigns a board once and reuses it for every day of the camp.
// Writes board fields to that student's block 0 for each non-closed day.
// Skips days where the (inventory) board is already taken by another service.
export async function applyStudentBoardToWeek(
  token: string,
  campSessionId: string,
  studentId: string,
  board: { board_id: string | null; board_type: string | null; board_size_feet: number | null; board_size_inches: number | null },
): Promise<{ ok: boolean; days?: number; skipped?: number; error?: string }> {
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id').eq('portal_token', token).single();
  if (!coach) return { ok: false, error: 'Coach not found.' };

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, camp_instances:camp_instance_id(coach_id, head_coach_id, academy_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) return { ok: false, error: 'Session not found.' };
  const camp = Array.isArray(session.camp_instances) ? session.camp_instances[0] : session.camp_instances;
  if (!camp || (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id)) {
    return { ok: false, error: 'You are not assigned to this service.' };
  }

  const { data: participant } = await admin
    .from('camp_participants').select('id, planned_departure, departed_on, finalized_at')
    .eq('camp_instance_id', session.camp_instance_id).eq('student_id', studentId).maybeSingle();
  if (!participant) return { ok: false, error: 'Student not enrolled in this service.' };

  // All days of this camp + their plan state (skip closed) and dates.
  const { data: sessions } = await admin
    .from('camp_sessions')
    .select('id, session_date')
    .eq('camp_instance_id', session.camp_instance_id);
  const ids = (sessions ?? []).map((x: any) => x.id);
  const { data: plans } = await admin
    .from('service_plans').select('camp_session_id, completion_state').in('camp_session_id', ids);
  const closedByS = new Map((plans ?? []).map((p: any) => [p.camp_session_id, p.completion_state === 'closed']));

  const boardPatch: Record<string, any> = {
    board_type: board.board_type ?? null,
    board_size_feet: board.board_size_feet ?? null,
    board_size_inches: board.board_size_inches ?? null,
  };

  let applied = 0, skipped = 0;
  if (board.board_id) await admin.from('boards').update({ status: 'in_use' }).eq('id', board.board_id);

  for (const sess of sessions ?? []) {
    if (closedByS.get(sess.id)) continue; // never touch a closed day
    // Camp corto: no se le asigna tabla en los días que ya no está. Si no,
    // queda inventario reservado que otro servicio necesita ese día.
    if (!participantPresentOn(participant as any, (sess as any).session_date)) continue;

    // Inventory-board double-booking guard, per date.
    let dayBoardId = board.board_id ?? null;
    if (dayBoardId && (sess as any).session_date && (camp as any).academy_id) {
      const { data: sameDay } = await admin
        .from('camp_sessions')
        .select('id, camp_instances:camp_instance_id!inner(academy_id)')
        .eq('session_date', (sess as any).session_date)
        .eq('camp_instances.academy_id', (camp as any).academy_id)
        .neq('id', sess.id);
      const otherIds = (sameDay ?? []).map((x: any) => x.id);
      if (otherIds.length > 0) {
        const { data: clash } = await admin
          .from('service_plan_blocks').select('id')
          .eq('board_id', dayBoardId).in('camp_session_id', otherIds).limit(1);
        if (clash && clash.length > 0) { dayBoardId = null; skipped++; } // leave board off that day
      }
    }

    const patch = { ...boardPatch, board_id: dayBoardId };
    // Bloque REAL del alumno ese día (las plantillas arrancan en order_index
    // 1 — el 0 fijo creaba un bloque fantasma y dejaba la tabla vieja del
    // bloque 1 bloqueando inventario). Los demás bloques quedan sin tabla.
    const { data: myBlocks } = await admin
      .from('service_plan_blocks').select('id, order_index')
      .eq('camp_session_id', sess.id).eq('student_id', studentId)
      .order('order_index');
    if (myBlocks && myBlocks.length > 0) {
      await admin.from('service_plan_blocks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', (myBlocks[0] as any).id);
      const restIds = myBlocks.slice(1).map((b: any) => b.id);
      if (restIds.length) {
        await admin.from('service_plan_blocks')
          .update({ board_id: null, board_type: null, board_size_feet: null, board_size_inches: null, updated_at: new Date().toISOString() })
          .in('id', restIds);
      }
    } else {
      await admin.from('service_plan_blocks').insert({
        camp_instance_id: session.camp_instance_id,
        camp_session_id: sess.id,
        student_id: studentId,
        order_index: 0,
        ...patch,
      });
    }
    applied++;
  }
  return { ok: true, days: applied, skipped };
}

// ─── Save per-student block ────────────────────────────────────────

export async function saveServicePlanBlock(
  token: string,
  campSessionId: string,
  studentId: string,
  orderIndex: number,
  patch: Partial<{
    step_id: string | null;
    land_drill_id: string | null;
    land_drill_custom: string | null;
    water_drill_id: string | null;
    water_drill_custom: string | null;
    objective_text: string | null;
    notes_pre: string | null;
    status: 'achieved' | 'partial' | 'not_yet' | null;
    notes_post: string | null;
    board_type: string | null;
    board_size_feet: number | null;
    board_size_inches: number | null;
    board_id: string | null;
    focus_level: number | null;
    flow_channel: number | null;
    whats_next: string | null;
    day_objective_status: string | null;
    coach_sequence_rating: number | null;
    next_focus_sequence_id: string | null;
    next_focus_step_id: string | null;
    worked_sequence_id: string | null;
    next_focus_moments: string[] | null;
    focus_moments: string[] | null;
  }>
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Resolve camp_instance through the session for ownership check.
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id, academy_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Fase 4 — date-aware double-booking guard. A board can't be on two
  // services the same day (same academy).
  if ('board_id' in patch && patch.board_id && (session as any).session_date && (camp as any).academy_id) {
    const { data: sameDay } = await admin
      .from('camp_sessions')
      .select('id, camp_instances:camp_instance_id!inner(academy_id)')
      .eq('session_date', (session as any).session_date)
      .eq('camp_instances.academy_id', (camp as any).academy_id)
      .neq('id', campSessionId);
    const otherIds = (sameDay ?? []).map((s: any) => s.id);
    if (otherIds.length > 0) {
      const { data: clash } = await admin
        .from('service_plan_blocks')
        .select('id')
        .eq('board_id', patch.board_id)
        .in('camp_session_id', otherIds)
        .limit(1);
      if (clash && clash.length > 0) {
        throw new Error('Esa tabla ya está asignada a otro servicio ese día. Elegí otra.');
      }
    }
  }

  // Verify student is in this camp_instance.
  const { data: participant } = await admin
    .from('camp_participants')
    .select('id')
    .eq('camp_instance_id', session.camp_instance_id)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!participant) throw new Error('Student not enrolled in this service.');

  const ALLOWED = [
    'step_id',
    'step_ids',
    'sequence_id',
    'focus_step_id',
    'focus_moments',
    'land_drill_id',
    'land_drill_custom',
    'water_drill_id',
    'water_drill_custom',
    'objective_text',
    'notes_pre',
    'status',
    'notes_post',
    'board_type',
    'board_size_feet',
    'board_size_inches',
    'board_id',
    'focus_level',
    'flow_channel',
    'whats_next',
    'day_objective_status',
    'coach_sequence_rating',
    'next_focus_sequence_id',
    'next_focus_step_id',
    'worked_sequence_id',
    'next_focus_moments',
  ] as const;
  const cleanPatch: Record<string, any> = {};
  for (const k of ALLOWED) {
    if (k in patch) cleanPatch[k] = (patch as any)[k];
  }

  // M45 — block is per (session, student, order_index).
  const { data: existing } = await admin
    .from('service_plan_blocks')
    .select('id, board_id')
    .eq('camp_session_id', campSessionId)
    .eq('student_id', studentId)
    .eq('order_index', orderIndex)
    .maybeSingle();

  // Board inventory status flip: when the assigned board changes, free the
  // old one and mark the new one in use. Skipped boards stay available.
  if ('board_id' in patch) {
    const oldId = existing?.board_id ?? null;
    const newId = patch.board_id ?? null;
    if (oldId !== newId) {
      if (oldId) await admin.from('boards').update({ status: 'available' }).eq('id', oldId);
      if (newId) await admin.from('boards').update({ status: 'in_use' }).eq('id', newId);
    }
  }

  if (existing) {
    const { error } = await admin
      .from('service_plan_blocks')
      .update({ ...cleanPatch, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('service_plan_blocks').insert({
      camp_instance_id: session.camp_instance_id,
      camp_session_id: campSessionId,
      student_id: studentId,
      order_index: orderIndex,
      ...cleanPatch,
    });
    if (error) throw new Error(error.message);
  }
}

// ═══ "Pasa a mañana" (Marcelo 2026-09-18) ═══
// El coach decide por alumno: la secuencia de hoy (con su foco) queda como
// bloque 0 de mañana. No toca a los demás alumnos ni al resto de mañana.
export async function carryStudentPlanToNextDay(
  token: string,
  campSessionId: string,
  studentId: string,
  /** "Move on": mañana arranca ESTA secuencia (línea completa) en vez de repetir la de hoy. */
  opts?: { sequenceId?: string | null },
): Promise<{ ok: boolean; error?: string; nextDay?: number }> {
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id').eq('portal_token', token).single();
  if (!coach) return { ok: false, error: 'Coach not found.' };
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, day_number, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) return { ok: false, error: 'Session not found.' };
  const camp: any = Array.isArray(session.camp_instances) ? session.camp_instances[0] : session.camp_instances;
  if (!camp || (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id)) return { ok: false, error: 'You are not assigned to this service.' };
  const { data: next } = await admin
    .from('camp_sessions')
    .select('id, day_number')
    .eq('camp_instance_id', session.camp_instance_id)
    .gt('day_number', session.day_number)
    .order('day_number')
    .limit(1)
    .maybeSingle();
  if (!next) return { ok: false, error: 'This is the last day of the service.' };
  // Bloque 0 (plan simple) o, si no hay, el primer bloque con secuencia (plantilla).
  const { data: todays } = await admin
    .from('service_plan_blocks')
    .select('order_index, step_id, step_ids, sequence_id, focus_step_id, focus_moments, objective_text, water_drill_id, water_drill_custom, land_drill_id, land_drill_custom')
    .eq('camp_session_id', campSessionId).eq('student_id', studentId)
    .order('order_index');
  const today = (todays ?? []).find((b: any) => b.order_index === 0 && (b.sequence_id || b.step_id || (b.step_ids ?? []).length))
    ?? (todays ?? []).find((b: any) => b.sequence_id && b.sequence_id !== 'THREE-CIRCLES');
  const moveTo = opts?.sequenceId ? SEQUENCE_PAGES[opts.sequenceId] ?? null : null;
  if (!today && !moveTo) return { ok: false, error: 'Nothing planned for this student today.' };
  const patch = moveTo ? {
    step_id: moveTo.stepIds[0] ?? null, step_ids: moveTo.stepIds, sequence_id: moveTo.id, focus_step_id: null, focus_moments: null,
    objective_text: `Whole line · ${moveTo.eyebrow ? moveTo.title : `#${moveTo.number} ${moveTo.title}`}`,
    water_drill_id: null, water_drill_custom: null, land_drill_id: null, land_drill_custom: null,
    notes_pre: 'Moved on at the close of day ' + session.day_number + '.',
  } : today ? {
    step_id: today.step_id, step_ids: today.step_ids, sequence_id: today.sequence_id, focus_step_id: today.focus_step_id, focus_moments: today.focus_moments,
    objective_text: today.objective_text, water_drill_id: today.water_drill_id, water_drill_custom: today.water_drill_custom, land_drill_id: today.land_drill_id, land_drill_custom: today.land_drill_custom,
    notes_pre: 'Carried over from day ' + session.day_number + '.',
  } : null;
  if (!patch) return { ok: false, error: 'Nothing planned for this student today.' };
  const { data: existing } = await admin
    .from('service_plan_blocks').select('id')
    .eq('camp_session_id', next.id).eq('student_id', studentId).eq('order_index', 0).maybeSingle();
  if (existing) {
    const { error } = await admin.from('service_plan_blocks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from('service_plan_blocks').insert({ camp_instance_id: session.camp_instance_id, camp_session_id: next.id, student_id: studentId, order_index: 0, ...patch });
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true, nextDay: next.day_number };
}

// M45 — Delete one block of a student's day. Used by the multi-block UI
// when the coach removes an extra block. The day always keeps at least
// one block; UI enforces that.
export async function deleteServicePlanBlock(
  token: string,
  campSessionId: string,
  studentId: string,
  orderIndex: number,
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  await admin
    .from('service_plan_blocks')
    .delete()
    .eq('camp_session_id', campSessionId)
    .eq('student_id', studentId)
    .eq('order_index', orderIndex);
}

// M45 — Replace ALL of a student's blocks for a given day with the
// canonical template blocks of that day. Used by the "Apply ALL blocks
// of this day to every student" button to re-seed an existing camp
// whose template was empty at creation time, or to reset a day.
export async function applyTemplateDayToStudents(
  token: string,
  campSessionId: string,
  templateBlocks: Array<{
    order_index: number;
    step_id: string | null;
    step_ids?: string[] | null;
    drill_id: string | null;
    drill_custom: string | null;
    mission_id: string | null;
    mission_custom: string | null;
    objective_text?: string | null;
    sequence_id?: string | null;
    focus_step_id?: string | null;
    focus_moments?: string[] | null;
  }>,
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Active participants of the parent camp
  const { data: parts } = await admin
    .from('camp_participants')
    .select('student_id, planned_departure, departed_on, finalized_at')
    .eq('camp_instance_id', session.camp_instance_id)
    .eq('enrollment_status', 'active');
  // Camp corto: sembrar los bloques del día solo para quien está ESE día.
  const studentIds = (parts ?? [])
    .filter((p: any) => participantPresentOn(p, (session as any).session_date))
    .map((p: any) => p.student_id);
  if (studentIds.length === 0) return;

  // Preserve per-student board assignments (e.g. "use this board all week",
  // M136) before wiping — the re-seed below would otherwise erase them.
  const { data: prevBlocks } = await admin
    .from('service_plan_blocks')
    .select('student_id, board_id, board_type, board_size_feet, board_size_inches')
    .eq('camp_session_id', campSessionId)
    .in('student_id', studentIds);
  const savedBoard = new Map<string, any>();
  for (const b of prevBlocks ?? []) {
    if ((b.board_id || b.board_type) && !savedBoard.has(b.student_id)) {
      savedBoard.set(b.student_id, { board_id: b.board_id, board_type: b.board_type, board_size_feet: b.board_size_feet, board_size_inches: b.board_size_inches });
    }
  }

  // Wipe existing blocks for this session × these students
  await admin
    .from('service_plan_blocks')
    .delete()
    .eq('camp_session_id', campSessionId)
    .in('student_id', studentIds);

  // Re-seed from template
  const rows: any[] = [];
  // "Tu lado": PAIR-* se resuelve por alumno (Regular → FS, Goofy → BS).
  const { data: stanceRows } = await admin.from('students').select('id, goofy_or_regular').in('id', studentIds);
  const stanceById = new Map<string, string | null>((stanceRows ?? []).map((r: any) => [r.id, r.goofy_or_regular ?? null]));
  for (const studentId of studentIds) {
    for (const tb0 of templateBlocks) {
      const tb = isSidePair(tb0.sequence_id) ? (() => {
        const r = resolveSidePair(tb0.sequence_id as any, stanceById.get(studentId));
        const cfg = SEQUENCE_PAGES[r.sequenceId];
        return { ...tb0, sequence_id: r.sequenceId, step_ids: cfg ? cfg.stepIds : null, step_id: null, focus_step_id: null, focus_moments: null };
      })() : tb0;
      rows.push({
        camp_instance_id: session.camp_instance_id,
        camp_session_id: campSessionId,
        student_id: studentId,
        order_index: tb.order_index,
        // Bloque de secuencia completa (sequence_id sin foco): step_id queda
        // vacío para no sugerir drills del primer paso (2026-09-18).
        step_id: tb.step_id ?? (tb.sequence_id && !tb.focus_step_id ? null : (tb.step_ids?.[0] ?? null)),
        step_ids: tb.step_ids ?? null,
        land_drill_id: tb.drill_id ?? null,
        land_drill_custom: tb.drill_id ? null : tb.drill_custom ?? null,
        water_drill_id: tb.mission_id ?? null,
        water_drill_custom: tb.mission_id ? null : tb.mission_custom ?? null,
        objective_text: tb.objective_text ?? null,
        // Idioma del método (2026-09-18): la secuencia y el foco viajan de la plantilla al plan.
        sequence_id: tb.sequence_id ?? null,
        focus_step_id: tb.focus_step_id ?? null,
        focus_moments: tb.focus_moments ?? null,
      });
    }
  }
  if (rows.length > 0) {
    let { error } = await admin.from('service_plan_blocks').insert(rows);
    if (error && /step_ids/.test(error.message)) {
      // Column not migrated yet — retry without the array.
      const legacy = rows.map(({ step_ids: _drop, ...rest }) => rest);
      ({ error } = await admin.from('service_plan_blocks').insert(legacy));
    }
    if (error) throw new Error(error.message);

    // Re-apply the preserved board to each student's FIRST block.
    if (savedBoard.size > 0) {
      const minIdx = Math.min(...templateBlocks.map((tb: any) => tb.order_index ?? 0));
      for (const [studentId, board] of savedBoard) {
        await admin
          .from('service_plan_blocks')
          .update(board)
          .eq('camp_session_id', campSessionId)
          .eq('student_id', studentId)
          .eq('order_index', minIdx);
      }
    }
  }
}

// M45 — Mark the entire camp as completed after the FinalCampEvaluation
// step. All per-day plans should already be closed by this point; this
// flips the parent camp_instance to 'completed' so it disappears from
// "upcoming" lists everywhere. Optionally accepts a batch of STP ratings
// to write in one shot (Final Eval gives the coach a chance to rate every
// STP of the student's belt level officially).
export async function closeCampFinal(
  token: string,
  campInstanceId: string,
  ratings?: Array<{ student_id: string; step_id: string; rating: number }>,
  results?: Array<{ student_id: string; approved: boolean; readiness_summary?: string; ocean_level?: string; student_visible_note: string; coach_private_note: string; next_focus?: string; next_focus_sequence_id?: string | null; next_focus_step_id?: string | null }>,
  promotions?: Array<{ student_id: string; belt_level: string }>,
  opts?: { finalize?: boolean },
): Promise<{ ok: boolean; error?: string; waterPending?: string[] }> {
  // finalize=false → per-student partial save (M153): writes ratings/acta/
  // promotion but does NOT complete the camp nor unlock surveys yet.
  // Invariante #2: estados esperables se DEVUELVEN, no se lanzan (Next enmascara
  // los throw de server actions en producción).
  const finalize = opts?.finalize !== false;
  // Alumnos cuya promoción cayó a recomendación pendiente por LA REGLA DEL
  // AGUA. El cierre no falla por esto, pero el coach tiene que enterarse
  // (revisión 2026-08-31: el desvío era invisible — devolvía ok:true pelado).
  const waterPending: string[] = [];

  // El "qué trabajar después" es OBLIGATORIO en cada evaluación. Estaba
  // bloqueado solo en el navegador, así que el servidor aceptaba un acta sin
  // él — y ese texto es lo que el alumno ve y con lo que el próximo coach
  // planea. Un results vacío sí pasa: es el camino que solo finaliza el camp
  // después de haber guardado alumno por alumno.
  const sinFoco = (results ?? []).filter(
    (r) => (r.next_focus ?? '').trim().length < 5
  );
  if (sinFoco.length > 0) {
    return {
      ok: false,
      error:
        'Falta "qué trabajar después" en ' +
        (sinFoco.length === 1 ? '1 alumno' : `${sinFoco.length} alumnos`) +
        '. Es obligatorio: el alumno lo ve y el próximo coach planea con eso.',
    };
  }

  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id, role, display_name, max_belt_permission')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach) return { ok: false, error: 'Coach not found.' };

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, coach_id, head_coach_id, academy_id, start_date, is_test')
    .eq('id', campInstanceId)
    .maybeSingle();
  if (!camp) return { ok: false, error: 'Service not found.' };
  // Sesión de prueba (capacitación 2026-09-18): se cierra igual, pero sin
  // encuestas, correos ni cintas. Nada sale hacia afuera.
  const isTestCamp = !!(camp as any).is_test;
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    return { ok: false, error: 'You are not assigned to this service.' };
  }

  // CERRAR TODOS LOS DÍAS ES OBLIGATORIO (Marcelo 2026-08-28): "así es parte
  // del sistema del coach y los obliga a hacerlo".
  //
  // Sin el cierre del día no existe la sesión del alumno — y sin sesión no hay
  // bitácora, ni horas de agua, ni encuesta del coach: el acta quedaba escrita
  // sobre el vacío (camp DEMO: 3 días, 0 sesiones, acta firmada). El día DADO
  // se mide por session_status='completed', que closeServicePlan escribe de
  // último; un plan marcado 'closed' sin ese sello NO cuenta.
  //
  // Solo aplica al cierre del camp. El guardado alumno por alumno y el short
  // camp (finalize:false) siguen libres — pasan a mitad de semana.
  //
  // Solo de 2026-08-28 en adelante (ver camp-window.ts): lo de atrás fue
  // temporada de pruebas y no se arrastra.
  let diasAbiertos: Array<{ day_number: number; session_date: string }> = [];
  if (finalize && exigeCierreDeDias((camp as any).start_date)) {
    const { data: diasCamp } = await admin
      .from('camp_sessions')
      .select('day_number, session_date, session_status')
      .eq('camp_instance_id', campInstanceId)
      .order('day_number');
    diasAbiertos = (diasCamp ?? [])
      .filter((d: any) => d.session_status !== 'completed' && d.session_status !== 'cancelled')
      .map((d: any) => ({ day_number: d.day_number, session_date: d.session_date }));
  }
  // Bloqueado = se pidió finalizar pero faltan días. Lo que el coach ya
  // escribió (estrellas, acta, nivel de agua, next focus) SÍ se guarda: se
  // trata como el guardado por alumno, y al final se devuelve el error.
  const bloqueadoPorDias = finalize && diasAbiertos.length > 0;
  const finalizeNow = finalize && !bloqueadoPorDias;

  // M150 — the final evaluation (normal OR forced-early) is the moment the
  // coach-rating survey unlocks for every student: take each student's most
  // recent session result of this camp and unlock it.
  if (finalizeNow && !isTestCamp) try {
    const { data: campSess } = await admin.from('camp_sessions').select('id').eq('camp_instance_id', campInstanceId);
    const sessIds = (campSess ?? []).map((x: any) => x.id);
    if (sessIds.length) {
      const { data: res } = await admin
        .from('student_session_results')
        .select('id, student_id, created_at')
        .in('camp_session_id', sessIds)
        .order('created_at', { ascending: false });
      const latest = new Map<string, string>();
      for (const r of res ?? []) if (!latest.has((r as any).student_id)) latest.set((r as any).student_id, (r as any).id);
      if (latest.size) {
        await admin.from('student_session_results').update({ survey_unlocked: true }).in('id', Array.from(latest.values()));
      }
    }
  } catch { /* survey unlock is best-effort */ }

  // Encuesta de EXPERIENCIA del camp (Opción A, 2026-08-21): al cerrar se
  // crea la fila pendiente por alumno activo (token propio). Se encadena
  // como paso 2 del survey de entreno y el host puede perseguirla por
  // WhatsApp. Idempotente (UNIQUE camp+alumno). Best-effort: nunca traba
  // el cierre del camp.
  if (finalizeNow && !isTestCamp) try {
    const { data: expParts } = await admin
      .from('camp_participants')
      .select('student_id, enrollment_status')
      .eq('camp_instance_id', campInstanceId);
    const expActive = (expParts ?? []).filter(
      (p: any) => p.enrollment_status !== 'removed' && p.enrollment_status !== 'cancelled' && p.student_id,
    );
    if (expActive.length) {
      await admin.from('camp_experience_surveys').upsert(
        expActive.map((p: any) => ({
          camp_instance_id: campInstanceId,
          student_id: p.student_id,
          academy_id: (camp as any).academy_id ?? null,
        })),
        { onConflict: 'camp_instance_id,student_id', ignoreDuplicates: true },
      );
    }
  } catch { /* experience seeding is best-effort */ }

  // Accreditation authority (policy 2026-07-11): EVERY coach — including the
  // camp's head coach — can only promote UP TO their own certification
  // (max_belt_permission). Only admins bypass. An under-certified coach's
  // promotion becomes a pending recommendation so someone WITH the level
  // performs/confirms the official evaluation. Default cap is black_belt so
  // coaches without the field set keep working as before (no regression).
  const coachCap = ((coach as any).max_belt_permission || 'black_belt') as BeltLevel;
  const canAccreditAny = (coach as any).role === 'admin';

  // Batch-write the official STP ratings, if any
  if (ratings && ratings.length > 0) {
    const rows = ratings.map((r) => ({
      student_id: r.student_id,
      step_id: r.step_id,
      coach_rating: r.rating,
      coach_rated_at: new Date().toISOString(),
      coach_rated_by: coach.id,
      last_updated: new Date().toISOString(),
    }));
    await admin
      .from('student_step_ratings')
      .upsert(rows, { onConflict: 'student_id,step_id' });
  }

  // Per-student "acta" from the final evaluation. One row per (camp,
  // student) in camp_final_evaluations: approved + finalized_at is the
  // frozen graduation record; student_visible_note shows in the student
  // portal; coach_private_note is coach/bitácora-only.
  if (results && results.length > 0) {
    const finalizedAt = new Date().toISOString();
    // Server-side graduation guard: "approved" must be consistent with the
    // submitted ratings (every rated STP >= 4 stars). The UI already derives
    // approval this way — this only blocks hand-crafted requests from writing
    // an approved=true record for a student whose ratings don't meet the bar.
    const ratingsByStudent = new Map<string, number[]>();
    for (const r of ratings ?? []) {
      const list = ratingsByStudent.get(r.student_id) ?? [];
      list.push(r.rating);
      ratingsByStudent.set(r.student_id, list);
    }
    const meetsBar = (studentId: string): boolean => {
      const list = ratingsByStudent.get(studentId);
      if (!list || list.length === 0) return true; // no ratings submitted — coach judgment call
      return list.every((n) => n >= 4);
    };
    const rows = results.map((r) => ({
      camp_instance_id: campInstanceId,
      student_id: r.student_id,
      coach_id: coach.id,
      approved: r.approved && meetsBar(r.student_id),
      readiness_summary: r.readiness_summary || null,
      ocean_level_recommendation: r.ocean_level || null,
      finalized_at: finalizedAt,
      student_visible_note: r.student_visible_note || null,
      coach_private_note: r.coach_private_note || null,
      // 🎯 Qué debe seguir trabajando (obligatorio en el UI desde 2026-08-09).
      areas_to_improve: r.next_focus?.trim() || null,
    }));
    await admin
      .from('camp_final_evaluations')
      .upsert(rows, { onConflict: 'camp_instance_id,student_id' });

    // 🎯 Continuidad del next focus: viaja a (a) students.next_recommended_focus
    // — lo ve el próximo coach al planear — y (b) el último session_result del
    // camp (whats_next) — lo ve el alumno como "Next Focus" en su portal.
    // Best-effort: el acta (areas_to_improve) ya quedó escrita arriba.
    try {
      const withFocus = results.filter((r) => (r.next_focus ?? '').trim().length > 0);
      if (withFocus.length) {
        const { data: campSess2 } = await admin.from('camp_sessions').select('id').eq('camp_instance_id', campInstanceId);
        const sessIds2 = (campSess2 ?? []).map((x: any) => x.id);
        const latestByStudent = new Map<string, string>();
        if (sessIds2.length) {
          const { data: ssr2 } = await admin
            .from('student_session_results')
            .select('id, student_id, created_at')
            .in('camp_session_id', sessIds2)
            .order('created_at', { ascending: false });
          for (const row of ssr2 ?? []) {
            if (!latestByStudent.has((row as any).student_id)) latestByStudent.set((row as any).student_id, (row as any).id);
          }
        }
        for (const r of withFocus) {
          const focus = (r.next_focus as string).trim();
          await admin.from('students').update({ next_recommended_focus: focus, next_focus_sequence_id: (r as any).next_focus_sequence_id || null, next_focus_step_id: (r as any).next_focus_step_id || null, ...stampNextFocus(coach.id) }).eq('id', r.student_id);
          const ssrId = latestByStudent.get(r.student_id);
          if (ssrId) await admin.from('student_session_results').update({ whats_next: focus }).eq('id', ssrId);
        }
      }
    } catch (e) {
      console.error('[closeCampFinal] next-focus continuity write failed:', e);
    }

    // In-water level assessment — write it the same way the bitácora's
    // Ocean Level evaluation does (history row + student update) so it shows
    // up in the student's profile and carries to the next camp.
    for (const r of results) {
      if (!r.ocean_level) continue;
      const { data: stu } = await admin
        .from('students')
        .select('ocean_level, ocean_level_provisional')
        .eq('id', r.student_id)
        .single();
      if (stu?.ocean_level === r.ocean_level) {
        // Mismo nivel ≠ no-op cuando venía PROVISIONAL del quiz: que el
        // coach lo deje tal cual en la evaluación final ES la confirmación
        // en el agua. Sin esto, el caso más común (el coach de acuerdo con
        // el quiz) dejaba provisional=true y la regla del agua bloqueaba la
        // cinta de ese MISMO cierre en silencio.
        if (stu?.ocean_level_provisional !== false) {
          await admin
            .from('students')
            .update({ ocean_level_provisional: false })
            .eq('id', r.student_id);
        }
        continue; // sin fila de historial: el nivel no cambió
      }
      await admin.from('ocean_level_evaluations').insert({
        student_id: r.student_id,
        evaluated_by: coach.id,
        previous_level: stu?.ocean_level ?? null,
        new_level: r.ocean_level,
        method: 'evaluation',
        notes: 'Camp final evaluation',
      });
      await admin
        .from('students')
        .update({ ocean_level: r.ocean_level, ocean_level_provisional: false })
        .eq('id', r.student_id);
    }
  }

  // Belt promotions — coach-confirmed. Only promote UP (never demote): set
  // the new belt when its rank is higher than the student's current belt.
  // If the coach isn't authorized to accredit the target belt, the promotion
  // is saved as a PENDING recommendation instead (a head coach/admin confirms).
  if (promotions && promotions.length > 0 && !isTestCamp) {
    for (const p of promotions) {
      const newBelt = p.belt_level as BeltLevel;
      if (!(newBelt in BELT_RANK)) continue;
      const { data: stu } = await admin
        .from('students')
        .select('first_name, belt_level, ocean_level, ocean_level_provisional')
        .eq('id', p.student_id)
        .single();
      const currentRank = stu?.belt_level ? BELT_RANK[stu.belt_level as BeltLevel] ?? 0 : 0;
      if (BELT_RANK[newBelt] <= currentRank) continue; // never demote / no-op

      // LA REGLA DEL AGUA: Blue+ exige océano semi_autonomous+ confirmado.
      // El loop de arriba ya grabó las confirmaciones de océano de ESTE
      // cierre, así que la lectura las ve. Si bloquea, la promoción no se
      // pierde: cae a recomendación pendiente (y su confirmación vuelve a
      // pasar por el mismo chequeo en belt-promotions).
      const waterBlock = waterRuleBlocker(newBelt, stu?.ocean_level, stu?.ocean_level_provisional);
      if (waterBlock) waterPending.push(stu?.first_name ?? 'A student');
      const authorized = (canAccreditAny || canCoachBelt(coachCap, newBelt)) && !waterBlock;
      if (authorized) {
        await admin
          .from('students')
          .update({
            belt_level: newBelt,
            // Una cinta OTORGADA por un coach deja de ser provisional —
            // tercera vía de promoción, mismo one-liner que belt-promotions.
            belt_provisional: false,
            // Sello de promoción: el portal del alumno celebra el ascenso
            // durante 30 días (banner "You're now a {belt}").
            belt_promoted_at: new Date().toISOString(),
            belt_promoted_from: stu?.belt_level ?? null,
          })
          .eq('id', p.student_id);
      } else {
        // Not authorized → record a pending recommendation for a head
        // coach/admin to confirm. Guarded so a missing table never breaks
        // the camp close (the belt just isn't changed until confirmed).
        try {
          const { data: existing } = await admin
            .from('belt_promotion_recommendations')
            .select('id')
            .eq('student_id', p.student_id)
            .eq('recommended_belt', newBelt)
            .eq('status', 'pending')
            .limit(1);
          if (!existing || existing.length === 0) {
            await admin.from('belt_promotion_recommendations').insert({
              student_id: p.student_id,
              camp_instance_id: campInstanceId,
              recommended_belt: newBelt,
              from_belt: stu?.belt_level ?? null,
              recommended_by: coach.id,
              recommended_by_name: (coach as any).display_name ?? null,
              coach_max_belt: coachCap,
              status: 'pending',
            });
          }
        } catch {
          /* table not present yet — belt simply stays until an admin promotes */
        }
      }
    }
  }

  // CRÍTICO (revisión 2026-08-21): estos dos efectos terminales SOLO con
  // finalize=true. El guardado parcial por alumno (M153 / short camp) llegaba
  // hasta acá y marcaba el camp ENTERO como completed + mandaba el correo de
  // encuesta a TODOS a mitad de camp (latente desde M153 — solo se disparaba
  // el último día, por eso nunca se vio).
  if (!finalizeNow) {
    if (bloqueadoPorDias) {
      const fecha = (iso: string) => {
        const [, m, d] = (iso ?? '').split('-');
        return m && d ? ` (${d}/${m})` : '';
      };
      const lista = diasAbiertos
        .map((d) => `Día ${d.day_number}${fecha(d.session_date)}`)
        .join(', ');
      return {
        ok: false,
        error:
          (diasAbiertos.length === 1 ? 'Falta cerrar ' : 'Faltan cerrar ') +
          lista +
          '. Tu evaluación quedó guardada. Cerrá ' +
          (diasAbiertos.length === 1 ? 'ese día' : 'esos días') +
          ' (Dar la clase → Cerrar la clase) y volvé a finalizar: sin el cierre del día el alumno se queda sin sesión en su bitácora y sin encuesta del coach.',
      };
    }
    return { ok: true, waterPending: waterPending.length ? waterPending : undefined };
  }

  await admin
    .from('camp_instances')
    .update({ status: 'completed' })
    .eq('id', campInstanceId);

  // M135 — the single coach-survey email per student, sent once here at the
  // official close of the camp (daily closes send nothing for camps). Uses
  // each student's most recent session result to deep-link the survey.
  if (!isTestCamp) try {
    const { data: campRow } = await admin
      .from('camp_instances')
      .select('camp_name')
      .eq('id', campInstanceId)
      .single();
    const { data: parts } = await admin
      .from('camp_participants')
      .select('student_id, enrollment_status, students:student_id(id, first_name, email, portal_token, belt_level, course_access_white, course_access_yellow)')
      .eq('camp_instance_id', campInstanceId);
    const active = (parts ?? []).filter((p: any) => p.enrollment_status !== 'removed' && p.enrollment_status !== 'cancelled');
    if (active.length > 0) {
      const studentIds = active.map((p: any) => p.student_id);
      // Latest closed session result per student, for feedback_token + survey id.
      const { data: sessRows } = await admin
        .from('camp_sessions')
        .select('id')
        .eq('camp_instance_id', campInstanceId);
      const sessIds = (sessRows ?? []).map((s: any) => s.id);
      const { data: results } = sessIds.length
        ? await admin
            .from('student_session_results')
            .select('id, student_id, feedback_token, created_at, email_sent')
            .in('camp_session_id', sessIds)
            .in('student_id', studentIds)
            .order('created_at', { ascending: false })
        : { data: [] as any[] };
      const latestByStudent = new Map<string, any>();
      for (const r of results ?? []) if (!latestByStudent.has(r.student_id)) latestByStudent.set(r.student_id, r);

      const { sendCoachSurveyEmail } = await import('@/lib/actions/email');
      for (const p of active) {
        const stu: any = Array.isArray(p.students) ? p.students[0] : p.students;
        if (!stu?.email) continue;
        const res = latestByStudent.get(p.student_id);
        if (res?.email_sent) continue; // already invited (idempotent re-close)
        const hasCourseAccess = !!stu.course_access_white || !!stu.course_access_yellow;
        await sendCoachSurveyEmail({
          studentName: stu.first_name,
          studentEmail: stu.email,
          portalToken: stu.portal_token,
          coachName: (coach as any).display_name || 'Coach',
          serviceName: campRow?.camp_name || 'your surf camp',
          sessionResultId: res?.id,
          feedbackToken: res?.feedback_token ?? undefined,
          studentHasCourseAccess: hasCourseAccess,
        });
        if (res?.id) {
          await admin.from('student_session_results').update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq('id', res.id);
        }
      }
    }
  } catch {
    /* non-blocking — the camp is closed regardless of email delivery */
  }
  return { ok: true, waterPending: waterPending.length ? waterPending : undefined };
}

// ─── SHORT CAMP: cerrar UN alumno el día que termina (2026-08-21) ───
// El coach guarda primero la evaluación oficial del alumno (closeCampFinal
// con finalize:false desde FinalCampEvaluation) y luego esta acción hace el
// "fin de camp" SOLO para él: Finished + fecha de salida, desbloquea su
// encuesta, siembra la de experiencia y le manda el correo ESE día — sin
// esperar a que el grupo termine. Todo idempotente: cuando el camp completo
// cierre, los email_sent / upserts evitan duplicados.
export async function finalizeStudentEarlyByToken(
  token: string,
  campInstanceId: string,
  studentId: string,
): Promise<{ ok: boolean; error?: string; surveyEmailSent?: boolean }> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id, display_name')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach) return { ok: false, error: 'Coach not found.' };

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, coach_id, head_coach_id, academy_id, camp_name')
    .eq('id', campInstanceId)
    .maybeSingle();
  if (!camp) return { ok: false, error: 'Service not found.' };
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    return { ok: false, error: 'You are not assigned to this service.' };
  }

  // 0. El alumno debe ser participante ACTIVO de ESTE camp — sin esto, un
  // studentId arbitrario sembraba encuestas de experiencia para alumnos
  // ajenos (hallazgo de la revisión).
  const { data: part } = await admin
    .from('camp_participants')
    .select('id, enrollment_status, finalized_at')
    .eq('camp_instance_id', campInstanceId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!part || (part as any).enrollment_status !== 'active') {
    return { ok: false, error: 'El alumno no es participante activo de este servicio.' };
  }

  // 1. Finished + fecha de salida (los días restantes ya no lo incluyen).
  const { error: partErr } = await admin
    .from('camp_participants')
    .update({ finalized_at: new Date().toISOString(), departed_on: elSalvadorToday() })
    .eq('id', (part as any).id)
    .is('finalized_at', null);
  if (partErr) return { ok: false, error: partErr.message };

  // 2. Su encuesta de HOY: desbloquear la última sesión + correo + experiencia.
  let surveyEmailSent = false;
  try {
    const { data: campSess } = await admin.from('camp_sessions').select('id').eq('camp_instance_id', campInstanceId);
    const sessIds = (campSess ?? []).map((x: any) => x.id);
    const { data: res } = sessIds.length
      ? await admin
          .from('student_session_results')
          .select('id, feedback_token, email_sent')
          .in('camp_session_id', sessIds)
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null as any };
    if (res?.id) {
      await admin.from('student_session_results').update({ survey_unlocked: true }).eq('id', res.id);
    }

    await admin.from('camp_experience_surveys').upsert(
      [{ camp_instance_id: campInstanceId, student_id: studentId, academy_id: (camp as any).academy_id ?? null }],
      { onConflict: 'camp_instance_id,student_id', ignoreDuplicates: true },
    );

    const { data: stu } = await admin
      .from('students')
      .select('first_name, email, portal_token, course_access_white, course_access_yellow')
      .eq('id', studentId)
      .maybeSingle();
    if (stu?.email && res?.id && !res.email_sent) {
      const { sendCoachSurveyEmail } = await import('@/lib/actions/email');
      await sendCoachSurveyEmail({
        studentName: (stu as any).first_name,
        studentEmail: (stu as any).email,
        portalToken: (stu as any).portal_token,
        coachName: (coach as any).display_name || 'Coach',
        serviceName: (camp as any).camp_name || 'your surf camp',
        sessionResultId: res.id,
        feedbackToken: res.feedback_token ?? undefined,
        studentHasCourseAccess: !!(stu as any).course_access_white || !!(stu as any).course_access_yellow,
      });
      await admin.from('student_session_results').update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq('id', res.id);
      surveyEmailSent = true;
    }
  } catch {
    /* best-effort: el alumno YA quedó Finished; encuesta/correo no traban */
  }

  return { ok: true, surveyEmailSent };
}

// M45 — Save a coach's official STP rating for a student during session
// close. Uses the portal token + camp_session ownership check (like the
// other portal actions). Writes to student_step_ratings.coach_rating so
// the student sees cyan official stars in their portal.
export async function saveOfficialStepRatingFromPortal(
  token: string,
  campSessionId: string,
  studentId: string,
  stepId: string,
  rating: number | null
): Promise<void> {
  const admin = createAdminClient();

  if (rating !== null && (rating < 1 || rating > 5)) {
    throw new Error('Rating must be 1-5 or null to clear.');
  }

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Verify ownership through the session
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');
  const camp = Array.isArray(session.camp_instances)
    ? session.camp_instances[0]
    : session.camp_instances;
  if (!camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // Confirm student is in the camp
  const { data: participant } = await admin
    .from('camp_participants')
    .select('id')
    .eq('camp_instance_id', session.camp_instance_id)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!participant) throw new Error('Student not enrolled in this service.');

  await admin
    .from('student_step_ratings')
    .upsert(
      {
        student_id: studentId,
        step_id: stepId,
        coach_rating: rating,
        coach_rated_at: rating !== null ? new Date().toISOString() : null,
        coach_rated_by: rating !== null ? coach.id : null,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'student_id,step_id' }
    );
}

// Cierre con video análisis (2026-09-18): UNA estrella para la secuencia del
// día = la misma nota en cada paso de esa secuencia (misma regla que
// "La tiene" en la evaluación por secuencia). Una sola llamada por toque.
export async function rateSequenceFromPortal(
  token: string,
  campSessionId: string,
  studentId: string,
  sequenceId: string,
  /** null = borrar la estrella que este coach puso hoy a esos pasos ("se trabajó otra cosa", 2026-09-20). */
  rating: number | null,
): Promise<{ ok: boolean; error?: string }> {
  if (rating !== null && (rating < 1 || rating > 5)) return { ok: false, error: 'Rating must be 1-5.' };
  const cfg = SEQUENCE_PAGES[sequenceId];
  if (!cfg) return { ok: false, error: 'Unknown sequence.' };
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id').eq('portal_token', token).single();
  if (!coach) return { ok: false, error: 'Coach not found.' };
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  if (!session) return { ok: false, error: 'Session not found.' };
  const camp: any = Array.isArray(session.camp_instances) ? session.camp_instances[0] : session.camp_instances;
  if (!camp || (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id)) return { ok: false, error: 'You are not assigned to this service.' };
  const { data: participant } = await admin.from('camp_participants').select('id').eq('camp_instance_id', session.camp_instance_id).eq('student_id', studentId).maybeSingle();
  if (!participant) return { ok: false, error: 'Student not enrolled in this service.' };
  const now = new Date().toISOString();
  if (rating === null) {
    // Solo lo que ESTE coach puso en las últimas horas: una estrella oficial
    // vieja de otro camp no se toca.
    const since = new Date(Date.now() - 12 * 3600 * 1000).toISOString();
    const { error } = await admin
      .from('student_step_ratings')
      .update({ coach_rating: null, coach_rated_at: null, coach_rated_by: null, last_updated: now })
      .eq('student_id', studentId)
      .in('step_id', cfg.stepIds)
      .eq('coach_rated_by', coach.id)
      .gte('coach_rated_at', since);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  const rows = cfg.stepIds.map((stepId) => ({ student_id: studentId, step_id: stepId, coach_rating: rating, coach_rated_at: now, coach_rated_by: coach.id, last_updated: now }));
  const { error } = await admin.from('student_step_ratings').upsert(rows, { onConflict: 'student_id,step_id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Lifecycle: start + close ──────────────────────────────────────

export async function startServicePlan(token: string, campSessionId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  // Resolve camp_instance through the session
  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id')
    .eq('id', campSessionId)
    .single();
  if (!session) throw new Error('Session not found.');

  const { data: existing } = await admin
    .from('service_plans')
    .select('id')
    .eq('camp_session_id', campSessionId)
    .maybeSingle();
  if (existing) {
    await admin
      .from('service_plans')
      .update({
        completion_state: 'in_progress',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await admin.from('service_plans').insert({
      camp_instance_id: session.camp_instance_id,
      camp_session_id: campSessionId,
      completion_state: 'in_progress',
      started_at: new Date().toISOString(),
    });
  }
}

// M45 — Close ONE day of the camp + sync per-day evaluations into the
// unified bitácora (student_session_results) so it shows up in the
// student portal + their admin profile.
//
// Renamed from closeServicePlan (camp-level) to closeServicePlan (day-level)
// keeping the same name for backward-compat with existing imports; the
// argument is now a camp_session_id (a single day), not a camp_instance_id.
//
// Steps:
//   1. Resolve the day + ownership.
//   2. Wipe + re-insert one student_session_results row per block of THIS day.
//   3. RPC update_student_profile_on_close per student.
//   4. Email each student feedback + survey link (first close only).
//   5. Flip THIS day's service_plans → closed.
//   6. camp_instance.status stays in_progress; the FinalCampEvaluation
//      flow flips it to 'completed' only after the official final eval.
export interface IncidentReport {
  student_id: string;
  incident_type: string;       // medical / board / equipment / conduct / venue / other
  incident_description: string;
  incident_action: string | null;
}

export async function closeServicePlan(
  token: string,
  campSessionId: string,
  incidents?: IncidentReport[],
  opts?: { generalFeedback?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  // Invariante #2: los estados esperables se DEVUELVEN, no se lanzan — Next
  // enmascara los throw de server actions en producción y el coach vería un
  // error genérico al cerrar. (El cuerpo atómico del cierre no cambia.)
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id, display_name')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach) return { ok: false, error: 'Coach not found.' };

  // Resolve day + parent camp. We pull scheduled_time + template service_kind
  // so we can estimate this session's duration_minutes for the bitácora /
  // surf hours totals on the student portal.
  const { data: session } = await admin
    .from('camp_sessions')
    .select(
      'id, day_number, session_date, camp_instance_id, ' +
        'camp_instances:camp_instance_id(' +
          'id, camp_name, start_date, coach_id, head_coach_id, scheduled_time, is_test, ' +
          'camp_templates:template_id(service_kind)' +
        ')'
    )
    .eq('id', campSessionId)
    .maybeSingle();
  if (!session) return { ok: false, error: 'Session not found.' };
  const sessionAny = session as any;
  const camp = Array.isArray(sessionAny.camp_instances)
    ? sessionAny.camp_instances[0]
    : sessionAny.camp_instances;
  if (!camp) return { ok: false, error: 'Service not found.' };
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    return { ok: false, error: 'You are not assigned to this service.' };
  }

  // Estimate session duration in minutes.
  // 1. If scheduled_time looks like "HH:MM - HH:MM", subtract.
  // 2. Otherwise fall back per service_kind: 90 min for surf_lesson,
  //    120 min for surf_camp days, 60 for anything else.
  const computeDurationMinutes = (): number => {
    const st: string | null = camp.scheduled_time ?? null;
    if (st) {
      const m = st.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (m) {
        const start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        const end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
        if (end > start) return end - start;
      }
    }
    const tpl = Array.isArray(camp.camp_templates)
      ? camp.camp_templates[0]
      : camp.camp_templates;
    const kind = tpl?.service_kind ?? null;
    if (kind === 'surf_lesson') return 90;
    if (kind === 'surf_camp') return 120;
    return 60;
  };
  const sessionDurationMinutes = computeDurationMinutes();

  const { data: plan } = await admin
    .from('service_plans')
    .select('*')
    .eq('camp_session_id', campSessionId)
    .maybeSingle();
  const alreadyClosed = plan?.completion_state === 'closed';

  const { data: blocks } = await admin
    .from('service_plan_blocks')
    .select('*')
    .eq('camp_session_id', campSessionId);

  // Skip students who already left the camp (finalized early / removed).
  // Their pre-seeded blocks for the remaining days must not produce session
  // results, feedback emails or survey invites.
  const { data: activeParts } = await admin
    .from('camp_participants')
    .select('student_id, finalized_at, departed_on, planned_departure, enrollment_status')
    .eq('camp_instance_id', sessionAny.camp_instance_id);
  // Corte POR FECHA (mismo criterio que el roster de getServicePlan): el día
  // de salida (incluido) el alumno se evalúa y se guarda normal; solo los
  // días POSTERIORES lo saltan. Antes cualquier finalized_at lo saltaba
  // siempre — la UI exigía evaluarlo y el cierre tiraba la evaluación.
  const closeDayDate = (sessionAny as any).session_date ?? null;
  const departed = new Set(
    (activeParts ?? [])
      .filter((p: any) => {
        if (p.enrollment_status !== 'active') return true;
        const last = participantLastDay(p);
        if (!last) return false;
        // Sin fecha de sesión no se puede comparar: se mantiene el criterio
        // conservador de antes y se salta a quien ya tiene salida marcada,
        // en vez de pedir una evaluación que el cierre después tiraría.
        if (!closeDayDate) return true;
        return closeDayDate > last;
      })
      .map((p: any) => p.student_id),
  );
  let allBlocks = (blocks ?? []).filter((b: any) => !departed.has(b.student_id));

  // ── Light services (class / trip, M150) — no per-student blocks exist.
  // Synthesize one block per active participant so every student still gets
  // a session result (bitácora + survey). The coach's single general note
  // becomes everyone's feedback.
  {
    const tplLight = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;
    const kindLight = tplLight?.service_kind ?? null;
    if (kindLight === 'class' || kindLight === 'trip') {
      const activeIds = (activeParts ?? [])
        .filter((p: any) => !departed.has(p.student_id))
        .map((p: any) => p.student_id);
      for (const sid of activeIds) {
        if (!allBlocks.some((b: any) => b.student_id === sid)) {
          allBlocks.push({ student_id: sid, order_index: 0, status: null, notes_post: null } as any);
        }
      }
      if (opts?.generalFeedback?.trim()) {
        for (const b of allBlocks) if (b.order_index === 0 || !allBlocks.some((x: any) => x.student_id === b.student_id && x.order_index < b.order_index)) {
          (b as any).notes_post = opts.generalFeedback.trim();
        }
      }
    }
  }

  // NOTA (fix auditoría #17): el candado de pago (session_status='completed')
  // se marca AL FINAL, después de escribir resultados y cerrar el plan. Antes
  // se marcaba acá arriba y, si el guardado fallaba a mitad, el pago quedaba
  // liberado sin bitácora. Ahora, si algo falla, el día NO queda cerrado y el
  // coach re-cierra limpio (los resultados se regeneran de service_plan_blocks).
  const campSession = { id: campSessionId };

  // ── Survey cadence (M150) ──
  // Rating the coach every single day of a camp is survey fatigue. Rule:
  //   • 1-day services (classes, lessons, trips) → survey on close.
  //   • Multi-day camps → survey only on day 3 and the final day.
  //   • A forced early finalization unlocks the survey via closeCampFinal.
  const { data: sessMeta } = await admin
    .from('camp_sessions')
    .select('day_number')
    .eq('id', campSessionId)
    .maybeSingle();
  const { count: totalDaysCount } = await admin
    .from('camp_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('camp_instance_id', sessionAny.camp_instance_id);
  const dayNo = (sessMeta as any)?.day_number ?? 1;
  const totalDays = totalDaysCount ?? 1;
  // Sesión de prueba (capacitación 2026-09-18): nunca encuesta ni correo.
  const isTestService = !!(camp as any).is_test;
  const unlockSurveyToday = !isTestService && (totalDays <= 1 || dayNo === 3 || dayNo === totalDays);

  // Board inventory: boards used today return to 'available' on close, unless
  // they were flagged 'in_repair' (e.g. by a damage incident). Phase 3.
  const usedBoardIds = Array.from(
    new Set(allBlocks.map((b: any) => b.board_id).filter(Boolean)),
  );
  if (usedBoardIds.length > 0) {
    await admin
      .from('boards')
      .update({ status: 'available' })
      .in('id', usedBoardIds)
      .neq('status', 'in_repair');

    // Log usage (one row per board per day) so we can later compute each
    // board's total uses + lifespan. Idempotent via UNIQUE(board_id, camp_session_id).
    const usageRows = usedBoardIds.map((bid) => ({
      board_id: bid,
      camp_session_id: campSession!.id,
      session_date: (session as any).session_date ?? null,
    }));
    await admin
      .from('board_usages')
      .upsert(usageRows, { onConflict: 'board_id,camp_session_id', ignoreDuplicates: true });
  }

  // Día de examen (2026-09-18): un día de plantilla con bloque de evaluación
  // y sin secuencias de agua se llama "Exit test", no por el texto del
  // primer bloque ("Read Today's Spot").
  let exitTestDay = false;
  try {
    const { data: sd } = await admin.from('camp_sessions').select('template_day_id').eq('id', campSessionId).maybeSingle();
    if ((sd as any)?.template_day_id) {
      const { count } = await admin.from('camp_template_blocks').select('id', { count: 'exact', head: true }).eq('template_day_id', (sd as any).template_day_id).eq('block_type', 'evaluation');
      exitTestDay = (count ?? 0) > 0;
    }
  } catch { /* best-effort */ }

  // ═══ Cierre en una línea (Marcelo 2026-09-20) ═══
  // La línea "Tomorrow" del cierre (next_focus_sequence_id + step del bloque 0)
  // se vuelve el plan de mañana del alumno cuando difiere de lo que la
  // plantilla ya tiene: repite por 1–3★, o el coach la cambió a mano. Mismo
  // efecto que los viejos botones "Tomorrow · same / move on", sin tocarlos.
  const { data: nextSess } = await admin
    .from('camp_sessions')
    .select('id, day_number')
    .eq('camp_instance_id', sessionAny.camp_instance_id)
    .gt('day_number', dayNo)
    .order('day_number')
    .limit(1)
    .maybeSingle();
  const nextBlocksByStudent: Record<string, any[]> = {};
  // Un mañana ya cerrado (re-cierres fuera de orden) no se toca.
  let nextClosed = false;
  if (nextSess) {
    const { data: np } = await admin.from('service_plans').select('completion_state').eq('camp_session_id', nextSess.id).maybeSingle();
    nextClosed = (np as any)?.completion_state === 'closed';
    const { data: nb } = await admin
      .from('service_plan_blocks')
      .select('id, student_id, order_index, sequence_id, focus_step_id, focus_moments, step_id, step_ids, land_drill_id, land_drill_custom, water_drill_id, water_drill_custom')
      .eq('camp_session_id', nextSess.id)
      .order('order_index');
    for (const b of nb ?? []) (nextBlocksByStudent[b.student_id] ??= []).push(b);
  }
  const stepTitleCache: Record<string, string> = {};
  const stepTitleOf = async (id: string): Promise<string> => {
    if (stepTitleCache[id]) return stepTitleCache[id];
    if (id.includes(':')) return (stepTitleCache[id] = id); // sub-elemento virtual: lo resuelve elementTitle
    const { data } = await admin.from('lessons').select('title').eq('id', id).maybeSingle();
    return (stepTitleCache[id] = (data as any)?.title ?? id);
  };
  const setTomorrowFromLine = async (studentId: string, firstBlock: any, studentBlocks: any[]) => {
    if (!nextSess || nextClosed) return;
    const nf: string | null = firstBlock.next_focus_sequence_id ?? null;
    if (!nf || !SEQUENCE_PAGES[nf]) return;
    const ns: string | null = firstBlock.next_focus_step_id ?? null;
    const cfgN = SEQUENCE_PAGES[nf];
    // Misiones de mañana (hasta 3, en orden): viajan a focus_moments del bloque.
    const nm: string[] | null = Array.isArray(firstBlock.next_focus_moments) ? firstBlock.next_focus_moments.filter((x: string) => isElementOf(cfgN, x)).slice(0, 3) : null;
    const missions = nm && nm.length ? nm : null;
    const nbs = nextBlocksByStudent[studentId] ?? [];
    const belt: string | null = studById[studentId]?.belt_level ?? null;
    // La misma regla que el cierre y que el mapa "tomorrow" del plan: la
    // primera secuencia de AGUA de mañana (plantillas viejas resuelven por pasos).
    const plannedFirst = firstWaterSequenceOfDay(nbs, belt);
    // Mañana tiene bloques pero ninguno es una secuencia de agua (día de examen,
    // teoría): ese día es así a propósito y no se pisa.
    if (!plannedFirst && nbs.length > 0) return;
    const plannedMissions = plannedFirst && Array.isArray(plannedFirst.block?.focus_moments) ? plannedFirst.block.focus_moments.filter((x: string) => isElementOf(plannedFirst.cfg, x)) : [];
    const differs = !plannedFirst || plannedFirst.cfg.id !== nf || (ns ?? null) !== (plannedFirst.focusStepId ?? null) || (missions ?? []).join('|') !== plannedMissions.join('|');
    if (!differs) return;
    // Misma secuencia que la plantilla → solo cambia el foco de ESE bloque.
    // Otra secuencia → va al bloque 0 (se agrega); la misión de la plantilla
    // no se pisa (Marcelo 2026-09-21: el repetir borró la postura del día 2).
    const planned = plannedFirst && plannedFirst.cfg.id === nf ? plannedFirst.block : null;
    // Lo de hoy que se repite: el bloque de AGUA de esa secuencia (trae la misión / el juego).
    const seqIdOfBlock = (x: any) => {
      const c = (x.worked_sequence_id && SEQUENCE_PAGES[x.worked_sequence_id]) || (x.sequence_id && SEQUENCE_PAGES[x.sequence_id]) || resolveSequenceForSteps({ stepIds: x.step_ids, stepId: x.step_id }, belt);
      return c?.id ?? null;
    };
    const sameAsToday = studentBlocks.find((x: any) => seqIdOfBlock(x) === nf && (x.water_drill_id || x.water_drill_custom))
      ?? studentBlocks.find((x: any) => seqIdOfBlock(x) === nf) ?? null;
    const tagN = cfgN.eyebrow ? cfgN.title : `#${cfgN.number} ${cfgN.title}`;
    const patch: any = {
      step_id: cfgN.stepIds[0] ?? null,
      step_ids: cfgN.stepIds,
      sequence_id: nf,
      worked_sequence_id: null,
      focus_step_id: missions ? missions[0] : ns,
      focus_moments: missions,
      // Mismo formato que lee el plan simple ("Focus: <paso>" / "Whole line · #n").
      objective_text: missions && missions.length > 1
        ? `Focus: ${(await Promise.all(missions.map(async (m) => elementTitle(cfgN, m, await stepTitleOf(m)) ?? m))).join(' · ')}`
        : ns ? `Focus: ${elementTitle(cfgN, ns, await stepTitleOf(ns)) ?? ns}` : `Whole line · ${tagN}`,
      water_drill_id: sameAsToday?.water_drill_id ?? null,
      water_drill_custom: sameAsToday?.water_drill_custom ?? null,
      land_drill_id: sameAsToday?.land_drill_id ?? null,
      land_drill_custom: sameAsToday?.land_drill_custom ?? null,
      notes_pre: `Set at the close of day ${dayNo}.`,
    };
    const target = planned ?? nbs.find((b: any) => b.order_index === 0) ?? null;
    // Sin misión de agua para copiar, tampoco se copia el drill de tierra: un
    // bloque solo de tierra no aparece en el cierre (daySequencesOf lo salta).
    if (!planned && !patch.water_drill_id && !patch.water_drill_custom) { patch.land_drill_id = null; patch.land_drill_custom = null; }
    if (planned) {
      // Misma secuencia que la plantilla: solo cambia el foco; los drills del
      // bloque quedan, salvo el juego de un círculo, que sigue a su elemento.
      delete patch.water_drill_id; delete patch.water_drill_custom; delete patch.land_drill_id; delete patch.land_drill_custom; delete patch.worked_sequence_id;
      if (cfgN.games && (missions?.[0] ?? ns)) {
        const nsx = (missions?.[0] ?? ns) as string;
        const el = cfgN.elements?.find((e) => e.id === nsx);
        const game = cfgN.games[nsx] ?? (el ? cfgN.games[el.stepId] : undefined);
        if (game) patch.water_drill_id = game;
      }
    }
    if (target) {
      const { error } = await admin.from('service_plan_blocks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', target.id);
      if (error) console.error('[close] tomorrow line update failed', error.message);
    } else {
      const { error } = await admin.from('service_plan_blocks').insert({ camp_instance_id: sessionAny.camp_instance_id, camp_session_id: nextSess.id, student_id: studentId, order_index: 0, ...patch });
      if (error) console.error('[close] tomorrow line insert failed', error.message);
    }
  };

  // 2. Idempotency — clear prior results for this camp_session.
  // OJO: NO borrar las SSR de alumnos ya Finished (short camp) — el re-cierre
  // no las reinserta (departed filtra sus blocks) y el link de su encuesta
  // ya emailada quedaría muerto.
  let clearQ = admin
    .from('student_session_results')
    .delete()
    .eq('camp_session_id', campSession!.id);
  if (departed.size > 0) {
    clearQ = clearQ.not('student_id', 'in', `(${Array.from(departed).map((x) => `"${x}"`).join(',')})`);
  }
  await clearQ;

  // Resolve drill/mission titles for the mission text
  const drillIds = Array.from(
    new Set(
      allBlocks
        .flatMap((b: any) => [b.water_drill_id, b.land_drill_id])
        .filter(Boolean)
    )
  );
  const titleById: Record<string, string> = {};
  if (drillIds.length > 0) {
    const { data: dm } = await admin
      .from('drills_missions')
      .select('id, title')
      .in('id', drillIds);
    for (const d of dm ?? []) titleById[d.id] = d.title;
  }

  // Students (portal_token + email for the close email)
  const studentIds = allBlocks.map((b: any) => b.student_id);
  const studById: Record<string, any> = {};
  if (studentIds.length > 0) {
    const { data: studs } = await admin
      .from('students')
      .select('id, first_name, email, portal_token, belt_level, course_access_white, course_access_yellow')
      .in('id', studentIds);
    for (const s of studs ?? []) studById[s.id] = s;
  }

  const STATUS_MAP: Record<string, string> = {
    achieved: 'competent',
    partial: 'partial',
    not_yet: 'not_yet',
  };

  // 3. ONE result per (student, session). Multi-block days used to write
  // one row per block which double-counted surf hours and split feedback
  // across multiple bitácora entries. Now we aggregate per student:
  //   - status: worst across blocks (not_yet > partial > achieved)
  //   - mission: first block's objective/drill/mission for the label
  //   - duration_minutes: session-level (credited once per student)
  //   - coach_feedback: block 0's notes_post (lifted to session level)
  const blocksByStudent2: Record<string, any[]> = {};
  for (const b of allBlocks) {
    (blocksByStudent2[b.student_id] ??= []).push(b);
  }
  for (const studentId of Object.keys(blocksByStudent2)) {
    const studentBlocks = blocksByStudent2[studentId].sort(
      (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );
    const firstBlock = studentBlocks[0];
    const stud = studById[studentId];
    // Red de seguridad (2026-09-18): el próximo foco vive en el bloque 0 o en
    // el primero, pero si por una carrera de guardados quedó en otro bloque
    // del mismo alumno, se toma igual — el alumno nunca se queda sin foco.
    if (!(firstBlock.whats_next ?? '').trim()) {
      const other = studentBlocks.find((x: any) => (x.whats_next ?? '').trim());
      if (other) {
        firstBlock.whats_next = other.whats_next;
        firstBlock.next_focus_sequence_id = firstBlock.next_focus_sequence_id ?? other.next_focus_sequence_id ?? null;
        firstBlock.next_focus_step_id = firstBlock.next_focus_step_id ?? other.next_focus_step_id ?? null;
      }
    }

    // Session status: prefer the coach's session-level "did they meet the
    // objective?" (block 0, the new light daily eval); fall back to the old
    // per-block worst-status aggregation for plans that didn't set it.
    const statusOrder: Record<string, number> = { not_yet: 0, partial: 1, achieved: 2 };
    const sessionObjective = firstBlock?.day_objective_status as string | undefined;
    let worst: any = 'achieved';
    if (sessionObjective === 'achieved' || sessionObjective === 'partial' || sessionObjective === 'not_yet') {
      worst = sessionObjective;
    } else {
      for (const b of studentBlocks) {
        if (!b.status) continue;
        if (statusOrder[b.status] < statusOrder[worst]) worst = b.status;
      }
    }
    const status = STATUS_MAP[worst as string] ?? 'partial';
    const achievedText =
      worst === 'achieved' ? 'yes' : worst === 'not_yet' ? 'not yet' : 'partial';

    // The mission shown to the student ("Latest session" card) should be the
    // MAIN work of the day, not the opening block. Prefer the first block
    // with a water mission whose label isn't a warm-up/venue/opening item;
    // fall back to the old first-block derivation.
    const labelOf = (blk: any): string | null =>
      blk.objective_text ||
      (blk.water_drill_id ? titleById[blk.water_drill_id] : blk.water_drill_custom) ||
      (blk.land_drill_id ? titleById[blk.land_drill_id] : blk.land_drill_custom) ||
      null;
    const isOpening = (s: string) => /warm.?up|venue analysis|welcome|opening|check.?in/i.test(s);
    const mainBlock =
      studentBlocks.find((blk: any) => {
        const label = labelOf(blk);
        return !!(blk.water_drill_id || blk.water_drill_custom) && label && !isOpening(label);
      }) ??
      studentBlocks.find((blk: any) => {
        const label = labelOf(blk);
        return label && !isOpening(label);
      }) ??
      firstBlock;
    // Idioma del método (2026-09-18): la sesión se nombra por las secuencias
    // trabajadas ("Getting to the wave · Navigate the Ocean · Catch Waves"),
    // no por el texto del primer bloque de la plantilla (salía el Kit).
    const seqTitles: string[] = [];
    for (const blk of studentBlocks as any[]) {
      // Cierre en una línea (2026-09-20): si el coach marcó "se trabajó otra
      // cosa", la sesión se nombra por lo trabajado, no por lo planeado.
      const seqIdOf = blk.worked_sequence_id ?? blk.sequence_id;
      const cfg = (seqIdOf && seqIdOf !== 'THREE-CIRCLES' && SEQUENCE_PAGES[seqIdOf]) || resolveSequenceForSteps({ stepIds: blk.step_ids, stepId: blk.step_id }, stud?.belt_level ?? null);
      const label = cfg ? (cfg.eyebrow ? `${cfg.eyebrow.split(' · ')[0]} · ${cfg.title}` : `Sequence ${sequenceDisplayName(cfg)}`) : (blk.sequence_id === 'THREE-CIRCLES' ? 'The Three Circles' : null);
      if (label && !seqTitles.includes(label)) seqTitles.push(label);
    }
    const missionTitle = seqTitles.length ? seqTitles.join(' · ') : (exitTestDay ? 'Exit test' : (labelOf(mainBlock) || labelOf(firstBlock) || 'Service session'));
    const b = firstBlock; // alias for the legacy code below

    const { data: result, error: resErr } = await admin
      .from('student_session_results')
      .insert({
        camp_session_id: campSession!.id,
        student_id: studentId,
        coach_id: coach.id,
        status,
        mission: missionTitle,
        coach_feedback: firstBlock.notes_post ?? null,
        achieved: achievedText,
        whats_next: firstBlock.whats_next ?? null,
        // Lo que el coach vio (2026-09-19): enfoque 0–3 y flow 1–5 viajan a la
        // sesión del alumno, para comparar con su autoevaluación.
        coach_focus: firstBlock.focus_level ?? null,
        coach_flow: firstBlock.flow_channel ?? null,
        homework: null,
        completion_state: 'closed',
        survey_unlocked: unlockSurveyToday,
        portal_token: stud?.portal_token ?? null,
        // M50 — surface session hours in the student's portal totals.
        duration_minutes: sessionDurationMinutes,
      })
      .select('id, feedback_token')
      .single();
    if (resErr) throw new Error(resErr.message);

    // Próximo foco estructurado (cierre con video análisis, 2026-09-18): la
    // secuencia y el paso viajan a la ficha para que Let's Play y el Home
    // los abran directo. El texto sigue en whats_next / next_recommended_focus.
    if (firstBlock.next_focus_sequence_id || (firstBlock.whats_next ?? '').trim()) {
      try {
        await admin.from('students').update({
          next_recommended_focus: firstBlock.whats_next ?? null,
          next_focus_sequence_id: firstBlock.next_focus_sequence_id ?? null,
          next_focus_step_id: firstBlock.next_focus_step_id ?? null,
          ...stampNextFocus(coach.id),
        }).eq('id', studentId);
      } catch { /* best-effort */ }
    }
    // La línea de mañana → el plan de mañana (cierre en una línea, 2026-09-20).
    try { await setTomorrowFromLine(studentId, firstBlock, studentBlocks); } catch (e) { console.error('[close] tomorrow line failed', e); }

    // Sync the student's profile snapshot (last_session_*)
    if (result) {
      try {
        await admin.rpc('update_student_profile_on_close', {
          p_student_id: b.student_id,
          p_session_result_id: result.id,
          p_session_date: new Date().toISOString(),
          p_mission: missionTitle,
          // p_pilar is the `pilar` enum (technical/physical/tactical/mental).
          // step_id ("STP-002") is NOT a pilar — passing it made the RPC
          // throw on the enum cast and silently skip the snapshot update,
          // leaving last_session_* null. Pass null instead.
          p_pilar: null,
          p_status: status,
          p_homework: null,
          p_whats_next: firstBlock.whats_next ?? null,
        });
      } catch {
        /* non-blocking — profile snapshot is best-effort */
      }
    }

    // FEEDBACK DEL DÍA (Marcelo 2026-09-10): al cerrar, el alumno recibe qué
    // hizo hoy y qué trabaja la próxima. Nace APAGADO (email_settings.day_feedback).
    if (!isTestService && stud?.email && result && stud.portal_token && (await emailEnabled('day_feedback'))) {
      try {
        const { sendSessionEmail } = await import('@/lib/actions/email');
        await sendSessionEmail({
          studentName: stud.first_name || 'surfer',
          studentEmail: stud.email,
          portalToken: stud.portal_token,
          coachName: coach.display_name ?? 'your coach',
          sessionDate: (sessionAny as any)?.session_date ?? new Date().toISOString().slice(0, 10),
          mission: missionTitle,
          status,
          coachFeedback: firstBlock.notes_post ?? '',
          homework: '',
          whatsNext: firstBlock.whats_next ?? '',
          beltLevel: stud.belt_level,
          sessionResultId: result.id,
          feedbackToken: (result as any).feedback_token ?? undefined,
          studentHasCourseAccess: !!stud.course_access_white || !!stud.course_access_yellow,
        });
      } catch (e) {
        console.error('[close] day feedback email failed', e);
      }
    }

    // 4b. One-day CLASS services (yoga, trips…) have no final-evaluation
    //     flow — closing the day IS the end of the service. Mark the camp
    //     completed so student portals stop showing it "in progress".
    //     (Done once per close; cheap idempotent update.)
    // NOTE: kept above the survey email so tplForEmail is in scope below.
    // 4. Coach-survey email (M135). Fase 3: no more daily reports. The student
    //    gets ONE survey email — and for a multi-day camp that goes out after
    //    the official FINAL evaluation (closeCampFinal), NOT on a daily close.
    //    A one-day lesson (surf_lesson / Discover Surfing) has no separate
    //    final eval, so its close IS the moment to send the survey.
    const tplForEmail = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;
    const kindForClose = tplForEmail?.service_kind ?? null;
    if (totalDays <= 1 && (kindForClose === 'class' || kindForClose === 'trip')) {
      await admin.from('camp_instances').update({ status: 'completed' }).eq('id', sessionAny.camp_instance_id);
    }
    const isOneDayLesson = kindForClose === 'surf_lesson' || (totalDays <= 1 && (kindForClose === 'class' || kindForClose === 'trip'));
    if (isOneDayLesson && !alreadyClosed && stud?.email && result && !isTestService) {
      try {
        const { sendCoachSurveyEmail } = await import('@/lib/actions/email');
        // M86 — Leads (no course access) land on the standalone
        // /feedback/[token] page; Members get the full portal.
        const hasCourseAccess =
          !!(stud as any).course_access_white ||
          !!(stud as any).course_access_yellow;
        await sendCoachSurveyEmail({
          studentName: stud.first_name,
          studentEmail: stud.email,
          portalToken: stud.portal_token,
          coachName: coach.display_name || 'Coach',
          serviceName: camp.camp_name || missionTitle,
          sessionResultId: result.id,
          feedbackToken: (result as any).feedback_token ?? undefined,
          studentHasCourseAccess: hasCourseAccess,
        });
        await admin
          .from('student_session_results')
          .update({ email_sent: true, email_sent_at: new Date().toISOString() })
          .eq('id', result.id);
      } catch {
        /* non-blocking */
      }
    }

    // M-audit — log session_closed per student. Same shape that
    // sessions.ts + multi-block-sessions.ts use, so the audit feed at
    // /audit treats every closure consistently regardless of which
    // close-path created it. Non-blocking.
    if (!alreadyClosed && result) {
      try {
        await admin.from('audit_log').insert({
          actor_type: 'coach',
          actor_id: coach.id,
          actor_name: coach.display_name,
          event_type: 'session_closed',
          status_before: 'draft',
          status_after: 'closed',
          note: `Service session closed for ${stud?.first_name ?? 'student'}. Overall: ${status}.`,
        });
      } catch {
        /* non-blocking — audit is best-effort */
      }
    }
  }

  // M48 — Per-student incident reports filed by the coach at close.
  // Updates the student_session_results row for each affected student
  // with the incident_* columns (00012 schema).
  if (incidents && incidents.length > 0) {
    for (const inc of incidents) {
      if (!inc.student_id || !inc.incident_type) continue;
      await admin
        .from('student_session_results')
        .update({
          incident_type: inc.incident_type,
          incident_description: inc.incident_description ?? null,
          incident_action: inc.incident_action ?? null,
        })
        .eq('camp_session_id', campSession!.id)
        .eq('student_id', inc.student_id);
    }
  }

  // 5. Flip lifecycle state for THIS day only
  if (plan) {
    await admin
      .from('service_plans')
      .update({
        completion_state: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', plan.id);
  } else {
    await admin.from('service_plans').insert({
      camp_instance_id: sessionAny.camp_instance_id,
      camp_session_id: campSessionId,
      completion_state: 'closed',
      closed_at: new Date().toISOString(),
    });
  }

  // AHORA sí: candado de pago. Todo lo anterior (resultados + plan cerrado) ya
  // quedó escrito, así que marcar la sesión 'completed' — que habilita el pago
  // en nómina — es el ÚLTIMO paso. Si algo falló antes, esto no se ejecuta y el
  // día sigue abierto (pago retenido) hasta un cierre limpio.
  await admin
    .from('camp_sessions')
    .update({ session_status: 'completed' })
    .eq('id', campSessionId);

  // camp_instance.status stays in_progress until the FinalCampEvaluation
  // step flips it to 'completed'. For 1-day services (lessons), Phase 6
  // will treat day-1 close as the final and trigger the eval inline.
  return { ok: true };
}

// Coach-to-coach internal note on a student (students.coach_notes_general).
// Persistent, coach-only — NOT shown in the student portal. Any coach assigned
// to a service the student is in can leave/read it, so the next coach sees
// context like "gets frustrated easily" or "this cue worked".
export async function saveStudentInternalNote(
  token: string,
  campSessionId: string,
  studentId: string,
  note: string,
): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: session } = await admin
    .from('camp_sessions')
    .select('id, camp_instance_id, session_date, camp_instances:camp_instance_id(coach_id, head_coach_id)')
    .eq('id', campSessionId)
    .single();
  const camp = Array.isArray((session as any)?.camp_instances)
    ? (session as any).camp_instances[0]
    : (session as any)?.camp_instances;
  if (!session || !camp) throw new Error('Service not found.');
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    throw new Error('You are not assigned to this service.');
  }

  // SECURITY: only write the note if the student is actually a participant
  // of THIS camp — otherwise a coach could edit any student in the database.
  const { data: participant } = await admin
    .from('camp_participants')
    .select('id')
    .eq('camp_instance_id', (session as any).camp_instance_id)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!participant) throw new Error('That student is not in this service.');

  const { error } = await admin
    .from('students')
    .update({ coach_notes_general: note.trim() || null })
    .eq('id', studentId);
  if (error) throw new Error(error.message);
}

// ─── 🚐 Transporte en DOS TOQUES desde la lista del Plan ─────────────
// Pedido de un coach vía Marcelo (2026-08-07): solicitar transporte sin
// abrir el planner. Lee/escribe el transporte del PRÓXIMO día del servicio.
// Sin input → solo devuelve el estado actual. Con input → guarda y avisa
// a coordinación (tablero de transporte + notificación).
export async function coachQuickTransport(
  token: string,
  campInstanceId: string,
  input?: { sessionId?: string; needed: boolean; depart?: string | null; ret?: string | null; venue?: string | null },
): Promise<{
  ok: boolean; error?: string; date?: string; needed?: boolean | null; depart?: string | null; ret?: string | null;
  days?: { session_id: string; date: string; day_number: number; needed: boolean | null; depart: string | null; ret: string | null; venue: string | null; closed: boolean }[];
}> {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, display_name, academy_id')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach) return { ok: false, error: 'Invalid link.' };

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, camp_name, coach_id, head_coach_id, academy_id, status')
    .eq('id', campInstanceId)
    .maybeSingle();
  if (!camp || camp.status === 'cancelled') return { ok: false, error: 'Service not found.' };
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    return { ok: false, error: 'You are not assigned to this service.' };
  }

  // Días PRÓXIMOS del servicio (hoy incluido, hora de El Salvador) con el
  // estado de transporte de cada uno — Bauti: en camps multi-día el coach
  // elige a QUÉ día pedirle la van, no solo el siguiente.
  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
  const { data: upSes } = await admin
    .from('camp_sessions')
    .select('id, session_date, day_number')
    .eq('camp_instance_id', campInstanceId)
    .gte('session_date', today)
    .order('session_date');
  if (!upSes?.length) return { ok: false, error: 'No upcoming day on this service.' };

  const { data: planRows } = await admin
    .from('service_plans')
    .select('id, camp_session_id, completion_state, transport_needed, transport_depart, transport_return, surf_venue')
    .in('camp_session_id', upSes.map((x: any) => x.id));
  const planBy = new Map(((planRows as any[]) ?? []).map((p: any) => [p.camp_session_id, p]));

  // Solo lectura: lista de días con su estado
  if (!input) {
    return {
      ok: true,
      days: upSes.map((x: any) => {
        const pl = planBy.get(x.id);
        return {
          session_id: x.id, date: x.session_date, day_number: x.day_number,
          needed: pl?.transport_needed ?? null,
          depart: pl?.transport_depart ?? null,
          ret: pl?.transport_return ?? null,
          venue: pl?.surf_venue ?? null,
          closed: pl?.completion_state === 'closed',
        };
      }),
    };
  }

  const target = input.sessionId ? upSes.find((x: any) => x.id === input.sessionId) : upSes[0];
  if (!target) return { ok: false, error: 'Day not found on this service.' };
  const nextSes = target as any;
  const plan = planBy.get(nextSes.id);
  if (plan?.completion_state === 'closed') return { ok: false, error: 'That day is already closed.' };
  const patch: Record<string, unknown> = {
    transport_needed: input.needed,
    transport_depart: input.needed ? (input.depart ?? null) : null,
    transport_return: input.needed ? (input.ret ?? null) : null,
    transport_status: input.needed ? 'requested' : null,
  };
  // La playa (pedido de Bauti): viaja junto al pedido de van y alimenta el
  // tablero de transporte y la agenda del host (📍 venue).
  if (input.venue !== undefined) patch.surf_venue = input.venue || null;
  if (plan) {
    const { error } = await admin.from('service_plans').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', plan.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from('service_plans').insert({
      camp_instance_id: campInstanceId,
      camp_session_id: nextSes.id,
      ...patch,
      completion_state: 'planned',
    });
    if (error) return { ok: false, error: error.message };
  }

  // Aviso a coordinación — el transporte se organiza con anticipación.
  try {
    const { createNotification } = await import('@/lib/actions/notifications');
    const { data: coords } = await admin.from('coaches').select('id').eq('academy_id', camp.academy_id).in('role', ['coordinator', 'admin', 'host']).eq('active_status', true);
    const base = (camp.camp_name ?? '').split(' · ')[0];
    for (const c of coords ?? []) {
      await createNotification({
        recipientCoachId: c.id,
        type: 'transport_request',
        title: input.needed
          ? `🚐 Transporte pedido: ${base} · ${nextSes.session_date}`
          : `🚐 Transporte CANCELADO: ${base} · ${nextSes.session_date}`,
        body: input.needed
          ? `${coach.display_name ?? 'Coach'} pide transporte — sale ${input.depart ?? '—'} · vuelve ${input.ret ?? '—'}${input.venue ? ` · 🏖 ${input.venue}` : ''}.`
          : `${coach.display_name ?? 'Coach'} canceló el pedido de transporte.`,
        link: null, metadata: { campInstanceId },
      }).catch(() => {});
    }
  } catch { /* best-effort */ }

  return { ok: true, date: nextSes.session_date, needed: input.needed, depart: input.depart ?? null, ret: input.ret ?? null };
}


// ─── Hidratación del plan de plantilla (fuente única) ──────────────
// Antes estaba duplicada verbatim en getServicePlan y getCampPlanForRead.
// Entra un templateId, sale el templatePlan (días + bloques + media resueltos).
async function hydrateTemplatePlan(
  admin: ReturnType<typeof createAdminClient>,
  templateId: string,
): Promise<ServicePlanData['templatePlan']> {
  const { data: tplDays } = await admin
    .from('camp_template_days')
    .select('id, day_number, day_goal, venue_default, ocean_condition_target, evaluation_focus, day_notes, sequence_id, topic_ids')
    .eq('template_id', templateId)
    .order('day_number');
  if (!tplDays || tplDays.length === 0) return [];

  const dayIds = tplDays.map((d: any) => d.id);
  const { data: tplBlocks } = await admin
    .from('camp_template_blocks')
    .select(
      'template_day_id, block_order, pilar, pilar_part, block_type, mission_time, repetitions_default, warm_up, simulation, mental_hack, evaluation_focus, step_id, drill_id, drill_custom, mission_id, mission_custom, explain_md, demonstrate_md, simulate_md, feedback_md, equipment, activity_subtype, step_ids, sequence_id, focus_step_id, focus_moments, topic_ids'
    )
    .in('template_day_id', dayIds)
    .order('block_order');

  // Resolve drill + mission + step titles in one round-trip each.
  const drillIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.drill_id).filter(Boolean)));
  const missionIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.mission_id).filter(Boolean)));
  const stepIds = Array.from(new Set((tplBlocks ?? []).map((b: any) => b.step_id).filter(Boolean)));

  const drillMap = new Map<string, any>();
  const missionMap = new Map<string, any>();
  const stepMap = new Map<string, any>();
  if (drillIds.length > 0 || missionIds.length > 0) {
    const { data: dms } = await admin
      .from('drills_missions')
      .select('id, title, description_md, key_words, success_criteria, time_estimate, type')
      .in('id', [...drillIds, ...missionIds]);
    for (const d of dms ?? []) {
      if (d.type === 'drill') drillMap.set(d.id, d);
      else if (d.type === 'mission' || d.type === 'game') missionMap.set(d.id, d); // juegos de los Tres Círculos también
    }
  }
  if (stepIds.length > 0) {
    const { data: stps } = await admin.from('lessons').select('id, title').in('id', stepIds);
    for (const s of stps ?? []) stepMap.set(s.id, s);
  }

  // M77 — per-day support media (PPT / video / image / diagram). Fail-soft.
  const mediaByDay = new Map<string, any[]>();
  try {
    const { data: mediaRows } = await admin
      .from('content_videos')
      .select('id, template_day_id, url, label, caption, media_type, display_order')
      .in('template_day_id', dayIds)
      .order('display_order');
    for (const m of mediaRows ?? []) {
      if (!m.template_day_id) continue;
      const arr = mediaByDay.get(m.template_day_id) ?? [];
      arr.push(m);
      mediaByDay.set(m.template_day_id, arr);
    }
  } catch (e) {
    console.error('[hydrateTemplatePlan] media fetch failed:', e);
  }

  return tplDays.map((d: any) => ({
    day_number: d.day_number,
    day_goal: d.day_goal,
    venue_default: d.venue_default ?? null,
    ocean_condition_target: d.ocean_condition_target ?? null,
    evaluation_focus: d.evaluation_focus ?? null,
    day_notes: d.day_notes ?? null,
    sequence_id: d.sequence_id ?? null,
    topic_ids: d.topic_ids ?? null,
    media: mediaByDay.get(d.id) ?? [],
    blocks: (tplBlocks ?? [])
      .filter((b: any) => b.template_day_id === d.id)
      .map((b: any) => {
        const drillRow = b.drill_id ? drillMap.get(b.drill_id) : null;
        const missionRow = b.mission_id ? missionMap.get(b.mission_id) : null;
        const stepRow = b.step_id ? stepMap.get(b.step_id) : null;
        return {
          block_order: b.block_order,
          pilar: b.pilar ?? null,
          pilar_part: b.pilar_part ?? null,
          block_type: b.block_type ?? null,
          mission_time: b.mission_time ?? null,
          repetitions_default: b.repetitions_default ?? null,
          warm_up: b.warm_up ?? null,
          simulation: b.simulation ?? null,
          mental_hack: b.mental_hack ?? null,
          evaluation_focus: b.evaluation_focus ?? null,
          step_id: b.step_id ?? null,
          step_title: stepRow?.title ?? null,
          drill_id: b.drill_id ?? null,
          drill_custom: b.drill_custom ?? null,
          drill: drillRow
            ? {
                title: drillRow.title,
                description_md: drillRow.description_md ?? null,
                key_words: drillRow.key_words ?? null,
                success_criteria: drillRow.success_criteria ?? null,
                time_estimate: drillRow.time_estimate ?? null,
              }
            : null,
          mission_id: b.mission_id ?? null,
          mission_custom: b.mission_custom ?? null,
          mission: missionRow
            ? {
                title: missionRow.title,
                description_md: missionRow.description_md ?? null,
                key_words: missionRow.key_words ?? null,
                success_criteria: missionRow.success_criteria ?? null,
                time_estimate: missionRow.time_estimate ?? null,
              }
            : null,
          // M78 — Activity taxonomy fields.
          explain_md: b.explain_md ?? null,
          demonstrate_md: b.demonstrate_md ?? null,
          simulate_md: b.simulate_md ?? null,
          feedback_md: b.feedback_md ?? null,
          equipment: b.equipment ?? null,
          activity_subtype: b.activity_subtype ?? null,
          step_ids: b.step_ids ?? null,
          sequence_id: b.sequence_id ?? null,
          focus_step_id: b.focus_step_id ?? null,
          focus_moments: b.focus_moments ?? null,
          topic_ids: b.topic_ids ?? null,
        };
      }),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// VISTA SEMANA — planner tipo Excel (2026-08-21)
// Una sola lectura con TODA la semana (logística + espacios + tablas por
// alumno) y escrituras por celda. La edición fina de bloques/drills sigue
// viviendo en la vista del día; esto es para PLANEAR de un vistazo.
// ═══════════════════════════════════════════════════════════════════

export interface WeekDayOverview {
  camp_session_id: string;
  day_number: number;
  session_date: string;
  state: 'planned' | 'in_progress' | 'closed';
  class_start_time: string | null;
  surf_venue: string | null;
  transport_needed: boolean | null;
  transport_depart: string | null;
  transport_return: string | null;
  spaces: Array<{ id: string; name: string; start: string; end: string; mine: boolean }>;
  /** Tabla asignada por alumno (bloque order_index 0 del día). */
  boards: Array<{ student_id: string; board_id: string | null; board_type: string | null; board_code: string | null }>;
}

export interface WeekOverview {
  ok: boolean;
  error?: string;
  campName?: string;
  days: WeekDayOverview[];
  students: Array<{ student_id: string; display_name: string }>;
  availableBoards: Array<{ id: string; code: string; board_type: string | null; length_feet: number | null; length_inches: number | null; status: string }>;
  academySpaces: Array<{ id: string; name: string }>;
}

async function weekGate(token: string, campInstanceId: string) {
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id').eq('portal_token', token).maybeSingle();
  if (!coach) return { admin, error: 'Coach not found.' as string, coach: null as any, camp: null as any };
  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, camp_name, academy_id, coach_id, head_coach_id')
    .eq('id', campInstanceId)
    .maybeSingle();
  if (!camp) return { admin, error: 'Service not found.', coach, camp: null as any };
  if (camp.coach_id !== coach.id && camp.head_coach_id !== coach.id) {
    return { admin, error: 'You are not assigned to this service.', coach, camp: null as any };
  }
  return { admin, error: null as string | null, coach, camp };
}

export async function getWeekOverviewByToken(token: string, campInstanceId: string): Promise<WeekOverview> {
  const empty: WeekOverview = { ok: false, days: [], students: [], availableBoards: [], academySpaces: [] };
  try {
    const { admin, error, coach, camp } = await weekGate(token, campInstanceId);
    if (error || !camp) return { ...empty, error: error ?? 'No autorizado.' };

    const [{ data: sess }, { data: parts }, { data: boardsInv }, { data: spacesList }, { data: bookings }] = await Promise.all([
      admin.from('camp_sessions').select('id, day_number, session_date').eq('camp_instance_id', campInstanceId).order('day_number'),
      admin.from('camp_participants')
        .select('student_id, enrollment_status, finalized_at, departed_on, planned_departure, students:student_id(first_name, last_name)')
        .eq('camp_instance_id', campInstanceId),
      admin.from('boards')
        .select('id, code, board_type, length_feet, length_inches, status')
        .eq('academy_id', (camp as any).academy_id)
        .not('status', 'in', '("retired","rented","in_repair")')
        .order('code'),
      admin.from('academy_spaces').select('id, name').eq('academy_id', (camp as any).academy_id).eq('active', true).order('sort_order'),
      // OJO: las reservas del coach van SIN camp_instance_id (status booked)
      // y las auto-reservas del servicio van CON instance pero status
      // 'confirmed' — filtrar por instance+booked no matcheaba NADA (crítico
      // de la revisión). Se trae por academia y se filtra en JS.
      admin.from('space_bookings')
        .select('id, space_id, coach_id, camp_instance_id, title, starts_at, ends_at, academy_spaces:space_id(name)')
        .eq('academy_id', (camp as any).academy_id)
        .neq('status', 'cancelled'),
    ]);

    const sessions = sess ?? [];
    const sessIds = sessions.map((x: any) => x.id);
    const [{ data: plans }, { data: blocks }] = await Promise.all([
      sessIds.length
        ? admin.from('service_plans')
            .select('camp_session_id, completion_state, class_start_time, surf_venue, transport_needed, transport_depart, transport_return')
            .in('camp_session_id', sessIds)
        : Promise.resolve({ data: [] as any[] }),
      sessIds.length
        ? admin.from('service_plan_blocks')
            .select('camp_session_id, student_id, board_id, board_type, order_index')
            .in('camp_session_id', sessIds)
            .order('order_index')
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const planByS = new Map((plans ?? []).map((p: any) => [p.camp_session_id, p]));
    const boardCode = new Map((boardsInv ?? []).map((b: any) => [b.id, b.code]));

    // Tabla por alumno/día: preferimos el bloque con tabla puesta.
    const boardsByDay = new Map<string, Map<string, { board_id: string | null; board_type: string | null }>>();
    for (const b of blocks ?? []) {
      if (!boardsByDay.has(b.camp_session_id)) boardsByDay.set(b.camp_session_id, new Map());
      const m = boardsByDay.get(b.camp_session_id)!;
      const cur = m.get(b.student_id);
      if (!cur || (!cur.board_id && !cur.board_type)) {
        m.set(b.student_id, { board_id: b.board_id ?? null, board_type: b.board_type ?? null });
      }
    }

    // BUG que esto corrige: el filtro era `!p.finalized_at`, ciego a la fecha,
    // así que un alumno cerrado a mitad de semana desaparecía de TODOS los
    // días — incluidos los que sí hizo, borrándole la grilla de tablas del
    // lunes y el martes. Ahora quedan todos los inscritos de la semana y cada
    // uno lleva su último día, para que la vista sepa hasta cuándo estuvo.
    const activeParts = (parts ?? []).filter((p: any) => p.enrollment_status === 'active');
    const students = activeParts.map((p: any) => {
      const st = Array.isArray(p.students) ? p.students[0] : p.students;
      return {
        student_id: p.student_id,
        display_name: [st?.first_name, st?.last_name].filter(Boolean).join(' ') || '—',
        last_day: participantLastDay(p),
      };
    });

    const days: WeekDayOverview[] = sessions.map((x: any) => {
      const p = planByS.get(x.id);
      const dayBookings = (bookings ?? []).filter((bk: any) => {
        const svDay = toElSalvadorDate(bk.starts_at);
        if (svDay !== x.session_date) return false;
        // Del camp (auto-reserva) o del propio coach — no TODA la academia.
        return bk.camp_instance_id === campInstanceId || bk.coach_id === (coach as any).id;
      }).map((bk: any) => {
        // timestamptz llega en UTC — mostrar en hora SV (-6h, sin DST).
        const sv = (ts: string) => new Date(Date.parse(ts) - 6 * 3600000).toISOString().slice(11, 16);
        return {
          id: bk.id,
          name: (Array.isArray(bk.academy_spaces) ? bk.academy_spaces[0] : bk.academy_spaces)?.name ?? 'Espacio',
          start: sv(bk.starts_at),
          end: sv(bk.ends_at),
          mine: bk.coach_id === (coach as any).id,
        };
      });
      const dayBoards = boardsByDay.get(x.id) ?? new Map();
      return {
        camp_session_id: x.id,
        day_number: x.day_number,
        session_date: x.session_date,
        state: (p?.completion_state ?? 'planned') as WeekDayOverview['state'],
        class_start_time: p?.class_start_time ?? null,
        surf_venue: p?.surf_venue ?? null,
        transport_needed: p?.transport_needed ?? null,
        transport_depart: p?.transport_depart ?? null,
        transport_return: p?.transport_return ?? null,
        spaces: dayBookings,
        boards: students.map((s) => {
          const b = dayBoards.get(s.student_id);
          return {
            student_id: s.student_id,
            board_id: b?.board_id ?? null,
            board_type: b?.board_type ?? null,
            board_code: b?.board_id ? (boardCode.get(b.board_id) ?? null) : null,
          };
        }),
      };
    });

    return {
      ok: true,
      campName: (camp as any).camp_name,
      days,
      students,
      availableBoards: (boardsInv ?? []) as any,
      academySpaces: (spacesList ?? []) as any,
    };
  } catch (e) {
    console.error('[week-overview] failed', e);
    return { ...empty, error: 'No se pudo cargar la semana.' };
  }
}

// Aviso al equipo (coordinación + FRONT DESK) cuando un coach toca el
// transporte — pedido de Marcelo 2026-08-21: "que les envíe una nota si un
// coach modifica el horario de transporte o cualquier cosa". Best-effort.
async function notifyTransportTeam(
  admin: ReturnType<typeof createAdminClient>,
  academyId: string | null,
  info: { campName: string; dateLabel: string; actor: string; needed: boolean; depart: string | null; ret: string | null },
): Promise<void> {
  if (!academyId) return;
  try {
    const { createNotification } = await import('@/lib/actions/notifications');
    const { data: team } = await admin
      .from('coaches').select('id')
      .eq('academy_id', academyId)
      .in('role', ['coordinator', 'admin', 'host'])
      .eq('active_status', true);
    const base = (info.campName ?? '').split(' · ')[0];
    for (const c of team ?? []) {
      await createNotification({
        recipientCoachId: c.id,
        type: 'transport_change',
        title: info.needed
          ? `🚐 Transporte: ${base} · ${info.dateLabel} → ${info.depart ?? '¿?'}–${info.ret ?? '¿?'}`
          : `🚐 Transporte CANCELADO: ${base} · ${info.dateLabel}`,
        body: `${info.actor} ${info.needed ? 'actualizó el transporte' : 'canceló el transporte'} — revisá el tablero 🚐 del Front Desk.`,
        link: null,
        metadata: null,
      }).catch(() => {});
    }
  } catch { /* best-effort */ }
}

// Logística de UN día (hora de clase, lugar, transporte) — o toda la semana.
export async function saveDayLogisticsByToken(
  token: string,
  campSessionId: string,
  patch: Partial<{
    class_start_time: string | null;
    surf_venue: string | null;
    transport_needed: boolean | null;
    transport_depart: string | null;
    transport_return: string | null;
  }>,
  applyToWeek = false,
): Promise<{ ok: boolean; days?: number; error?: string }> {
  try {
    const admin = createAdminClient();
    const { data: session } = await admin
      .from('camp_sessions')
      .select('id, camp_instance_id')
      .eq('id', campSessionId)
      .maybeSingle();
    if (!session) return { ok: false, error: 'Session not found.' };
    const { error, camp } = await weekGate(token, (session as any).camp_instance_id);
    if (error || !camp) return { ok: false, error: error ?? 'No autorizado.' };

    const { data: allSess } = await admin
      .from('camp_sessions').select('id').eq('camp_instance_id', (session as any).camp_instance_id);
    const targetIds = applyToWeek ? (allSess ?? []).map((x: any) => x.id) : [campSessionId];
    const { data: plans } = await admin
      .from('service_plans').select('id, camp_session_id, completion_state').in('camp_session_id', targetIds);
    const planByS = new Map((plans ?? []).map((p: any) => [p.camp_session_id, p]));

    let applied = 0;
    for (const sid of targetIds) {
      const existing = planByS.get(sid);
      if (existing?.completion_state === 'closed') continue; // día cerrado: no tocar
      if (existing) {
        const { error } = await admin.from('service_plans').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) return { ok: false, error: `No se pudo guardar (${error.message}).` };
      } else {
        const { error } = await admin.from('service_plans').insert({
          camp_instance_id: (session as any).camp_instance_id,
          camp_session_id: sid,
          ...patch,
        });
        if (error) return { ok: false, error: `No se pudo guardar (${error.message}).` };
      }
      applied++;
    }

    // Nota al equipo si se tocó el transporte (Front Desk incluido).
    if ('transport_needed' in patch || 'transport_depart' in patch || 'transport_return' in patch) {
      const { data: coachRow } = await admin.from('coaches').select('display_name').eq('portal_token', token).maybeSingle();
      const { data: sessRow } = await admin.from('camp_sessions').select('session_date').eq('id', campSessionId).maybeSingle();
      await notifyTransportTeam(admin, (camp as any).academy_id ?? null, {
        campName: (camp as any).camp_name ?? '—',
        dateLabel: applyToWeek ? 'toda la semana' : ((sessRow as any)?.session_date ?? ''),
        actor: (coachRow as any)?.display_name ?? 'Coach',
        needed: patch.transport_needed !== false,
        depart: (patch.transport_depart as string) ?? null,
        ret: (patch.transport_return as string) ?? null,
      });
    }
    return { ok: true, days: applied };
  } catch (e) {
    console.error('[week-logistics] failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

// Tabla de UN alumno para UN día (la semana entera ya existe:
// applyStudentBoardToWeek). Mismo guard anti doble-booking por fecha.
export async function setStudentDayBoardByToken(
  token: string,
  campSessionId: string,
  studentId: string,
  board: { board_id: string | null; board_type: string | null; board_size_feet: number | null; board_size_inches: number | null },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { data: session } = await admin
      .from('camp_sessions')
      .select('id, camp_instance_id, session_date')
      .eq('id', campSessionId)
      .maybeSingle();
    if (!session) return { ok: false, error: 'Session not found.' };
    const { error, camp } = await weekGate(token, (session as any).camp_instance_id);
    if (error || !camp) return { ok: false, error: error ?? 'No autorizado.' };

    const { data: participant } = await admin
      .from('camp_participants').select('id')
      .eq('camp_instance_id', (session as any).camp_instance_id).eq('student_id', studentId).maybeSingle();
    if (!participant) return { ok: false, error: 'El alumno no está inscrito en este servicio.' };

    const { data: plan } = await admin
      .from('service_plans').select('completion_state').eq('camp_session_id', campSessionId).maybeSingle();
    if (plan?.completion_state === 'closed') return { ok: false, error: 'Ese día ya está cerrado.' };

    // Anti doble-booking del inventario para esa fecha (mismo patrón que
    // applyStudentBoardToWeek).
    if (board.board_id && (session as any).session_date && (camp as any).academy_id) {
      const { data: sameDay } = await admin
        .from('camp_sessions')
        .select('id, camp_instances:camp_instance_id!inner(academy_id)')
        .eq('session_date', (session as any).session_date)
        .eq('camp_instances.academy_id', (camp as any).academy_id)
        .neq('id', campSessionId);
      const otherIds = (sameDay ?? []).map((x: any) => x.id);
      if (otherIds.length > 0) {
        const { data: clash } = await admin
          .from('service_plan_blocks').select('id')
          .eq('board_id', board.board_id).in('camp_session_id', otherIds).limit(1);
        if (clash && clash.length > 0) {
          return { ok: false, error: 'Esa tabla ya está asignada en otro servicio ese día.' };
        }
      }
      await admin.from('boards').update({ status: 'in_use' }).eq('id', board.board_id);
    }

    if (board.board_id) {
      const { data: b } = await admin.from('boards').select('status').eq('id', board.board_id).maybeSingle();
      if (b && ['rented', 'in_repair', 'retired'].includes((b as any).status)) {
        return { ok: false, error: 'Esa tabla no está disponible (rentada o en reparación).' };
      }
    }

    const patch = {
      board_id: board.board_id ?? null,
      board_type: board.board_type ?? null,
      board_size_feet: board.board_size_feet ?? null,
      board_size_inches: board.board_size_inches ?? null,
    };
    // Escribir en el bloque REAL del alumno (las plantillas arrancan en
    // order_index 1; escribir siempre en 0 creaba un bloque fantasma y la
    // tabla vieja del bloque 1 quedaba bloqueando el inventario). Los demás
    // bloques quedan sin tabla para no dejar asignaciones viejas.
    const { data: myBlocks } = await admin
      .from('service_plan_blocks').select('id, order_index, board_id')
      .eq('camp_session_id', campSessionId).eq('student_id', studentId)
      .order('order_index');

    // Liberar la tabla que deja de usar (2026-09-22). Sin esto, cambiar o
    // quitar la tabla dejaba la vieja en 'in_use' para siempre: recepción no
    // la podía rentar y el selector de la semana la mostraba "en uso".
    // saveServicePlanBlock ya hacía este intercambio; esta acción no.
    const dropped = Array.from(new Set(
      (myBlocks ?? []).map((b: any) => b.board_id).filter((id: any): id is string => !!id && id !== board.board_id),
    ));
    for (const oldId of dropped) {
      // Solo si ya no la usa nadie más (otro alumno, otro servicio ese día).
      const { data: stillUsed } = await admin
        .from('service_plan_blocks').select('id')
        .eq('board_id', oldId)
        .not('student_id', 'eq', studentId)
        .limit(1);
      if (stillUsed && stillUsed.length > 0) continue;
      await admin.from('boards').update({ status: 'available' }).eq('id', oldId).neq('status', 'in_repair');
    }

    if (myBlocks && myBlocks.length > 0) {
      await admin.from('service_plan_blocks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', (myBlocks[0] as any).id);
      const restIds = myBlocks.slice(1).map((b: any) => b.id);
      if (restIds.length) {
        await admin.from('service_plan_blocks')
          .update({ board_id: null, board_type: null, board_size_feet: null, board_size_inches: null, updated_at: new Date().toISOString() })
          .in('id', restIds);
      }
    } else {
      await admin.from('service_plan_blocks').insert({
        camp_instance_id: (session as any).camp_instance_id,
        camp_session_id: campSessionId,
        student_id: studentId,
        order_index: 0,
        ...patch,
      });
    }
    return { ok: true };
  } catch (e) {
    console.error('[week-board] failed', e);
    return { ok: false, error: 'No se pudo asignar la tabla.' };
  }
}

// ─── Misiones de la semana para la EVALUACIÓN FINAL (2026-08-21) ───
// El coach evaluaba a ciegas: la evaluación final solo recibía los bloques
// del día seleccionado, así que no veía qué trabajó cada alumno el resto del
// camp (ni lo agregado en otros días). Esto devuelve el recorrido completo.
export async function getCampWeekMissionsByToken(
  token: string,
  campInstanceId: string,
): Promise<{ ok: boolean; error?: string; byStudent?: Record<string, Array<{ day: number; items: string[] }>> }> {
  try {
    const { admin, error, camp } = await weekGate(token, campInstanceId);
    if (error || !camp) return { ok: false, error: error ?? 'No autorizado.' };

    const { data: sess } = await admin
      .from('camp_sessions').select('id, day_number').eq('camp_instance_id', campInstanceId).order('day_number');
    const sessIds = (sess ?? []).map((x: any) => x.id);
    if (!sessIds.length) return { ok: true, byStudent: {} };
    const dayByS = new Map((sess ?? []).map((x: any) => [x.id, x.day_number]));

    const { data: blocks } = await admin
      .from('service_plan_blocks')
      .select('camp_session_id, student_id, order_index, step_id, step_ids, sequence_id, focus_step_id, water_drill_id, land_drill_id, water_drill_custom, land_drill_custom, objective_text')
      .in('camp_session_id', sessIds)
      .order('order_index');

    const stepIds = new Set<string>();
    const drillIds = new Set<string>();
    for (const b of blocks ?? []) {
      if (b.step_id) stepIds.add(b.step_id);
      for (const sid of (b.step_ids ?? [])) if (sid) stepIds.add(sid);
      if (b.water_drill_id) drillIds.add(b.water_drill_id);
      if (b.land_drill_id) drillIds.add(b.land_drill_id);
    }
    const [{ data: stepRows }, { data: drillRows }] = await Promise.all([
      stepIds.size ? admin.from('lessons').select('id, title').in('id', Array.from(stepIds)) : Promise.resolve({ data: [] as any[] }),
      drillIds.size ? admin.from('drills_missions').select('id, title').in('id', Array.from(drillIds)) : Promise.resolve({ data: [] as any[] }),
    ]);
    const stepTitle = new Map((stepRows ?? []).map((r: any) => [r.id, r.title]));
    const drillTitle = new Map((drillRows ?? []).map((r: any) => [r.id, r.title]));

    const byStudent: Record<string, Array<{ day: number; items: string[] }>> = {};
    for (const b of blocks ?? []) {
      const day = dayByS.get(b.camp_session_id);
      if (day == null) continue;
      // Idioma del método (2026-09-18): el recorrido se cuenta en SECUENCIAS
      // de agua, no en el volcado de notas de cada bloque. Los bloques de
      // tierra sin agua (prep, refresh) no cuentan como trabajado.
      const landOnly = !!(b.land_drill_id || b.land_drill_custom) && !b.water_drill_id && !b.water_drill_custom && (b.order_index ?? 0) !== 0;
      if (landOnly) continue;
      const cfg = (b.sequence_id && b.sequence_id !== 'THREE-CIRCLES' && SEQUENCE_PAGES[b.sequence_id]) || resolveSequenceForSteps({ stepIds: b.step_ids, stepId: b.step_id }, null);
      if (cfg || b.sequence_id === 'THREE-CIRCLES') {
        const focus = b.focus_step_id ? (elementTitle(cfg ?? null, b.focus_step_id, stepTitle.get(b.focus_step_id) ?? null) ?? null) : null;
        const label = cfg ? `${cfg.eyebrow ? cfg.title : `#${cfg.number} ${cfg.title}`}${focus ? ` · ${focus}` : ''}` : 'The Three Circles';
        if (!byStudent[b.student_id]) byStudent[b.student_id] = [];
        let entry = byStudent[b.student_id].find((e) => e.day === day);
        if (!entry) { entry = { day, items: [] }; byStudent[b.student_id].push(entry); }
        if (!entry.items.includes(label)) entry.items.push(label);
        continue;
      }
      // Sin secuencia: solo pasos y drills DEL CATÁLOGO. El texto libre del
      // bloque (bienvenida, kit, cierre, video, prep) no es "lo trabajado":
      // volcaba las notas internas del coach (captura de Marcelo 2026-09-19).
      if (!b.step_id && !(b.step_ids ?? []).length && !b.water_drill_id) continue;
      const stps = [b.step_id, ...(b.step_ids ?? [])]
        .filter(Boolean)
        .map((id: string) => stepTitle.get(id))
        .filter(Boolean);
      const drill = drillTitle.get(b.water_drill_id) ?? drillTitle.get(b.land_drill_id) ?? null;
      const label = [Array.from(new Set(stps)).join(' + ') || null, drill]
        .filter(Boolean).join(' · ');
      if (!label) continue;
      if (!byStudent[b.student_id]) byStudent[b.student_id] = [];
      let entry = byStudent[b.student_id].find((e) => e.day === day);
      if (!entry) { entry = { day, items: [] }; byStudent[b.student_id].push(entry); }
      if (!entry.items.includes(label)) entry.items.push(label);
    }
    for (const k of Object.keys(byStudent)) byStudent[k].sort((a, b) => a.day - b.day);
    return { ok: true, byStudent };
  } catch (e) {
    console.error('[week-missions] failed', e);
    return { ok: false, error: 'No se pudo cargar el recorrido del camp.' };
  }
}
