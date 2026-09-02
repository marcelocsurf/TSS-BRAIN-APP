'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { pickWeakestCriterion, type CriterionEvaluationItem } from '@/lib/utils/criteria';
import { studentIdFromPortalToken } from '@/lib/portal/student-token';
import {
  COURSE_SEQUENCE_ORDER,
  stepKey,
  SEQUENCE_PASS_STARS,
} from '@/lib/constants/learning-blocks';

// ─── Types ───

export type DrillMissionRow = {
  id: string;
  step_id: string;
  title: string;
  type: 'drill' | 'mission';
  time_estimate: string | null;
  reps_recommended: string | null;
  key_words: string[];
  description_md: string | null;
  success_criteria: string[];
  belt: string;
  block_number: number;
  block_name: string;
  display_order: number;
  videos?: { id: string; url: string; label: string | null }[];
};

export type StepRating = {
  student_id: string;
  step_id: string;
  current_rating: number | null;
  rating_count: number;
  last_updated: string;
};

export type SequenceItem = {
  step_id: string;
  step_title: string;
  pillar: string | null;
  /** Cinta de la que viene el drill — la secuencia es acumulativa. */
  belt: string;
  block_number: number;
  block_name: string;
  display_order: number;
  // Per canon v1, each STP has BOTH a drill (training mechanic, on-land/calm)
  // AND a mission (water application — Ecological Dynamics).
  drill: DrillMissionRow | null;
  mission: DrillMissionRow | null;
  rating: number | null;
  rating_count: number;
  last_rated: string | null;
  // M4: Official rating from coach (gold). Null when not yet evaluated.
  coach_rating?: number | null;
  coach_rated_at?: string | null;
  last_practiced: string | null;
};

export type SequenceData = {
  belt: string;
  overallRating: number | null;
  totalSteps: number;
  ratedSteps: number;
  /** Pasos con evaluación OFICIAL del coach (pesa más que el auto-rating). */
  coachRatedSteps: number;
  /** Pasos con solo auto-evaluación del alumno (sin oficial). */
  selfRatedSteps: number;
  blocks: {
    belt: string;
    block_number: number;
    block_name: string;
    items: SequenceItem[];
  }[];
  /** Las mismas habilidades agrupadas por SECUENCIA del método, que es como
   *  se enseñan en el curso. Practicar el paso suelto no enseña la secuencia:
   *  el drill llega en su contexto y se ve qué va antes y qué va después. */
  sequences: {
    id: string;
    order: number;
    name: string;
    promise: string | null;
    belt: string;
    items: SequenceItem[];
    /** owned = todos sus pasos llegaron al umbral · working = alguno no llegó ·
     *  partial = todavía faltan pasos por evaluar · unrated = ninguno. */
    state: 'owned' | 'working' | 'partial' | 'unrated';
    /** Las estrellas del paso más flojo — lo que vale la secuencia. */
    minRating: number | null;
    /** El paso que la frena: por dónde empezar. */
    weakestStepId: string | null;
    weakestTitle: string | null;
    /** true = ese freno lo puso el coach, no la auto-evaluación. */
    weakestIsOfficial: boolean;
  }[];
};

// ─── Get full sequence catalog for a student ───

export async function getMySequence(portalToken: string, belt: string = 'white'): Promise<SequenceData> {
  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) {
    return { belt, sequences: [], overallRating: null, totalSteps: 0, ratedSteps: 0, coachRatedSteps: 0, selfRatedSteps: 0, blocks: [] };
  }
  return mySequenceForStudent(studentId, belt);
}

async function mySequenceForStudent(studentId: string, belt: string = 'white'): Promise<SequenceData> {
  const admin = createAdminClient();

  // Normalize belt: students.belt_level uses 'white_belt'/'yellow_belt'/etc,
  // but drills_missions.belt uses 'white'/'yellow'/etc.
  const beltKey = belt.replace(/_belt$/, '');
  // La secuencia es ACUMULATIVA: un alumno de Yellow entrena también los
  // drills de White, y uno de Blue los de White y Yellow. Antes cada cinta
  // solo veía los suyos (Yellow veía 33 de 147).
  const BELT_ORDER = ['white', 'yellow', 'blue', 'purple', 'brown', 'black'];
  const upto = BELT_ORDER.indexOf(beltKey);
  const beltKeys = upto >= 0 ? BELT_ORDER.slice(0, upto + 1) : [beltKey];
  const courseSections = beltKeys.map((b) => `${b}_belt`);
  const beltRank = (b: string) => {
    const i = BELT_ORDER.indexOf(b);
    return i < 0 ? BELT_ORDER.length : i;
  };

  // 1. Get all drills/missions for this belt (student-visible only — admins can
  // mark a drill coach-only via the Drill Library, which hides it here).
  const { data: drills } = await admin
    .from('drills_missions')
    .select('*')
    .in('belt', beltKeys)
    .eq('active', true)
    .eq('student_visible', true)
    .order('display_order', { ascending: true });

  // 2. Get all STP lessons (for titles + pillars)
  const { data: lessons } = await admin
    .from('lessons')
    .select(
      'id, title, pillar, display_order, course_section, step_number, ' +
        'wb_sequence_id, wb_sequence_name, wb_sequence_order, wb_sequence_promise, sequence_step_order'
    )
    .in('course_section', courseSections)
    .eq('active', true);

  // 3. Get student ratings
  const { data: ratings } = await admin
    .from('student_step_ratings')
    .select('*')
    .eq('student_id', studentId);

  // 4. Get last practiced per STP from self_training_sessions
  const { data: sessions } = await admin
    .from('self_training_sessions')
    .select('linked_step_id, created_at')
    .eq('student_id', studentId)
    .not('linked_step_id', 'is', null)
    .order('created_at', { ascending: false });

  // Build lookup maps — split drills and missions
  const drillMap = new Map<string, DrillMissionRow>();
  const missionMap = new Map<string, DrillMissionRow>();
  (drills || []).forEach((d: any) => {
    if (d.type === 'drill') drillMap.set(d.step_id, d as DrillMissionRow);
    else if (d.type === 'mission') missionMap.set(d.step_id, d as DrillMissionRow);
  });

  const lessonMap = new Map<string, any>();
  (lessons || []).forEach((l: any) => lessonMap.set(l.id, l));

  const ratingMap = new Map<string, any>();
  (ratings || []).forEach((r: any) => ratingMap.set(r.step_id, r));

  const lastPracticedMap = new Map<string, string>();
  (sessions || []).forEach((s: any) => {
    if (!lastPracticedMap.has(s.linked_step_id)) {
      lastPracticedMap.set(s.linked_step_id, s.created_at);
    }
  });

  // Get unique step IDs from drills+missions (one item per STP, with both)
  const stepIds = new Set<string>();
  (drills || []).forEach((d: any) => stepIds.add(d.step_id));

  // Build sequence items (one per STP, holds both drill and mission)
  const items: SequenceItem[] = Array.from(stepIds).map((stepId) => {
    const drill = drillMap.get(stepId) || null;
    const mission = missionMap.get(stepId) || null;
    const primary = drill || mission; // for block / display order
    const lesson = lessonMap.get(stepId);
    const rating = ratingMap.get(stepId);
    return {
      step_id: stepId,
      step_title: lesson?.title || stepId,
      pillar: lesson?.pillar || null,
      belt: primary?.belt || beltKey,
      block_number: primary?.block_number || 0,
      block_name: primary?.block_name || '',
      display_order: primary?.display_order || 0,
      drill,
      mission,
      rating: rating?.current_rating || null,
      rating_count: rating?.rating_count || 0,
      last_rated: rating?.last_updated || null,
      coach_rating: rating?.coach_rating ?? null,
      coach_rated_at: rating?.coach_rated_at ?? null,
      last_practiced: lastPracticedMap.get(stepId) || null,
    };
  });

  // Group by belt + block. La clave no puede ser solo block_number: white
  // "Block 1 · ENTRY / CONTROL / RETURN" y yellow "Block 1 · Yellow Belt" son
  // bloques distintos y se fusionarían en uno.
  const blocksMap = new Map<
    string,
    { belt: string; block_number: number; block_name: string; items: SequenceItem[] }
  >();
  items.forEach((item) => {
    const key = `${item.belt}:${item.block_number}`;
    if (!blocksMap.has(key)) {
      blocksMap.set(key, {
        belt: item.belt,
        block_number: item.block_number,
        block_name: item.block_name,
        items: [],
      });
    }
    blocksMap.get(key)!.items.push(item);
  });

  const blocks = Array.from(blocksMap.values())
    .sort(
      (a, b) => beltRank(a.belt) - beltRank(b.belt) || a.block_number - b.block_number
    )
    .map((g) => ({
      belt: g.belt,
      block_number: g.block_number,
      block_name: g.block_name,
      items: g.items.sort((a, b) => a.display_order - b.display_order),
    }));

  // Overall execution — la evaluación OFICIAL del coach pesa más que la
  // auto-evaluación: por paso, el rating efectivo es coach_rating si existe,
  // si no el auto-rating. Antes solo se contaba el auto-rating y un alumno
  // con toda la secuencia validada 5/5 por su coach veía "Not rated yet".
  const effective = (i: SequenceItem): number | null =>
    i.coach_rating ?? i.rating ?? null;
  const ratedItems = items.filter((i) => effective(i) !== null);
  const overallRating = ratedItems.length > 0
    ? ratedItems.reduce((sum, i) => sum + (effective(i) || 0), 0) / ratedItems.length
    : null;
  const coachRatedSteps = items.filter((i) => i.coach_rating != null).length;
  const selfRatedSteps = items.filter((i) => i.coach_rating == null && i.rating != null).length;

  // ── Las habilidades agrupadas por secuencia ──────────────────────────
  // El orden completo de las secuencias que se completan con pasos de una
  // cinta anterior vive en COURSE_SEQUENCE_ORDER (la tabla deja a cada paso
  // en una sola secuencia). El resto se agrupa por wb_sequence_id.
  const itemById = new Map(items.map((i) => [i.step_id, i]));
  const lessonByKey2 = new Map<string, any>();
  for (const l of (lessons ?? []) as any[]) {
    lessonByKey2.set(stepKey(l.course_section, l.step_number), l);
  }
  const seqMeta = new Map<string, any>();
  for (const l of (lessons ?? []) as any[]) {
    if (l.wb_sequence_id && !seqMeta.has(l.wb_sequence_id)) seqMeta.set(l.wb_sequence_id, l);
  }

  const sequences = Array.from(seqMeta.entries())
    .map(([seqId, meta]) => {
      const order = COURSE_SEQUENCE_ORDER[seqId];
      const stepIdsInSeq = order
        ? order.map((k) => lessonByKey2.get(k)?.id).filter(Boolean)
        : (lessons ?? [])
            .filter((l: any) => l.wb_sequence_id === seqId)
            .sort(
              (a: any, b: any) =>
                (a.sequence_step_order ?? a.display_order ?? 0) -
                (b.sequence_step_order ?? b.display_order ?? 0)
            )
            .map((l: any) => l.id);
      // Un paso sin drill ni misión NO puede desaparecer de la secuencia: la
      // cadena es el método y el drill es algo que se le cuelga. Pasaba con
      // "Bottom Turn Medium — Backside", que no tiene drill: las dos
      // secuencias backside se mostraban SIN su bottom turn, que es la
      // bisagra de la maniobra. Se arma el ítem desde la lección.
      const seqItems = stepIdsInSeq
        .map((id: string): SequenceItem | null => {
          const existing = itemById.get(id);
          if (existing) return existing;
          const l = lessonMap.get(id);
          if (!l) return null;
          const rating = ratingMap.get(id);
          return {
            step_id: id,
            step_title: l.title || id,
            pillar: l.pillar ?? null,
            belt: beltKey,
            block_number: 0,
            block_name: '',
            display_order: l.display_order ?? 0,
            drill: null,
            mission: null,
            rating: rating?.current_rating || null,
            rating_count: rating?.rating_count || 0,
            last_rated: rating?.last_updated || null,
            coach_rating: rating?.coach_rating ?? null,
            coach_rated_at: rating?.coach_rated_at ?? null,
            last_practiced: lastPracticedMap.get(id) || null,
          };
        })
        .filter((i): i is SequenceItem => Boolean(i));
      // La secuencia vale lo que vale su paso más flojo (canon: 4★ en cada
      // parte). Así el alumno ve QUÉ lo frena, no un promedio que esconde el
      // hueco.
      const withRating = seqItems
        .map((i) => ({ i, v: i.coach_rating ?? i.rating ?? null }))
        .filter((x): x is { i: SequenceItem; v: number } => x.v !== null);
      const minRating = withRating.length
        ? Math.min(...withRating.map((x) => x.v))
        : null;
      // Por dónde empezar: el paso más TEMPRANO de la cadena que no llega a la
      // barra, no el de menos estrellas. Si la postura está floja, el bottom
      // turn va a estar flojo por consecuencia — arreglar la postura arregla
      // los dos. Es la doctrina: no hay atajos, hay que caminar el camino.
      const weakest =
        withRating.find((x) => x.v < SEQUENCE_PASS_STARS)?.i ?? null;
      const state: 'owned' | 'working' | 'partial' | 'unrated' =
        withRating.length === 0
          ? 'unrated'
          : withRating.length < seqItems.length
            ? 'partial'
            : minRating! >= SEQUENCE_PASS_STARS
              ? 'owned'
              : 'working';
      return {
        id: seqId,
        order: meta.wb_sequence_order ?? 99,
        name: meta.wb_sequence_name ?? seqId,
        promise: meta.wb_sequence_promise ?? null,
        belt: (meta.course_section ?? '').replace('_belt', ''),
        items: seqItems,
        state,
        minRating,
        weakestStepId: weakest?.step_id ?? null,
        weakestTitle: weakest?.step_title ?? null,
        weakestIsOfficial: weakest?.coach_rating != null,
      };
    })
    .filter((s) => s.items.length > 0)
    .sort((a, b) => beltRank(a.belt) - beltRank(b.belt) || a.order - b.order);

  return {
    belt,
    sequences,
    overallRating,
    totalSteps: items.length,
    ratedSteps: ratedItems.length,
    coachRatedSteps,
    selfRatedSteps,
    blocks,
  };
}

// ─── Get full detail for a single STP ───

const EMPTY_STEP_DETAIL = {
  lesson: null as any, drill: null as any, mission: null as any,
  rating: null as number | null, ratingCount: 0, lastRated: null as string | null,
  sessionHistory: [] as any[],
};

export async function getStepDetail(portalToken: string, stepId: string) {
  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) return EMPTY_STEP_DETAIL;
  const admin = createAdminClient();

  // Get lesson info
  const { data: lesson } = await admin
    .from('lessons')
    .select('id, title, pillar, subtitle, description_md, drill_md, errors_md')
    .eq('id', stepId)
    .single();

  // Get drill AND mission for this step (canon v1: each STP has both)
  const { data: drillsAndMissions } = await admin
    .from('drills_missions')
    .select('*')
    .eq('step_id', stepId)
    .eq('active', true)
    // Solo lo que el alumno puede ver: el catálogo coach (student_visible=false)
    // no entra a la ficha del paso (bug 2026-09-02: STP-001 mostraba "Group
    // Venue Read", una misión solo-coach, como SU misión).
    .eq('student_visible', true);

  const drill =
    (drillsAndMissions || []).find((d: any) => d.type === 'drill') || null;
  const mission =
    (drillsAndMissions || []).find((d: any) => d.type === 'mission') || null;

  // Get current rating
  const { data: rating } = await admin
    .from('student_step_ratings')
    .select('*')
    .eq('student_id', studentId)
    .eq('step_id', stepId)
    .maybeSingle();

  // Get session history for this step
  const { data: sessions } = await admin
    .from('self_training_sessions')
    .select('id, created_at, duration_minutes, focus_rating, mission_completion, execution_rating, notes, linked_drill_mission_id, criteria_evaluation')
    .eq('student_id', studentId)
    .eq('linked_step_id', stepId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    lesson: lesson || null,
    drill,
    mission,
    rating: rating?.current_rating || null,
    ratingCount: rating?.rating_count || 0,
    lastRated: rating?.last_updated || null,
    sessionHistory: sessions || [],
  };
}

// ─── Update self-rating for a step (1-5) ───

export async function updateStepRating(
  portalToken: string,
  stepId: string,
  rating: number
) {
  if (rating < 1 || rating > 5) {
    return { ok: false, error: 'Rating must be 1-5' };
  }
  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) return { ok: false, error: 'Not authorized' };

  const admin = createAdminClient();

  // Upsert rating
  const { error } = await admin
    .from('student_step_ratings')
    .upsert({
      student_id: studentId,
      step_id: stepId,
      current_rating: rating,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'student_id,step_id' });

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

// ─── Get drill/mission for Train tab pre-fill ───

export async function getDrillMissionForTraining(portalToken: string, drillId: string) {
  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) return null;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('drills_missions')
    .select('*')
    .eq('id', drillId)
    .single();

  if (error || !data) return null;

  // Also pull any videos attached to this drill/mission (multi-video).
  const { data: videos } = await admin
    .from('content_videos')
    .select('id, url, label, display_order')
    .eq('drill_mission_id', drillId)
    .order('display_order');

  return { ...data, videos: videos || [] } as DrillMissionRow;
}

// ─── Save training session linked to a drill/mission ───

export type CriterionResult = 'met' | 'partial' | 'not_met';
export type CriterionEvaluation = {
  criterion_index: number;
  criterion_text: string;
  result: CriterionResult;
};

export async function saveLinkedTrainingSession(
  portalToken: string,
  drillMissionId: string,
  data: {
    intention_text?: string;
    planned_duration_minutes?: number;
    planned_reps?: number;
    duration_minutes?: number;
    reps_completed?: number;
    venue_type?: string;
    wave_conditions?: string;
    wind?: string;
    tide?: string;
    crowd_level?: string;
    safety_check?: boolean;
    venue_notes?: string;
    notes?: string;
    focus_rating?: number;        // 0-3
    mission_completion?: 'yes' | 'partial' | 'no';
    execution_rating?: number;    // 1-5
    flow_channel?: number;        // 1-5 (1 Bored · 3 Flow · 5 Frustrating)
    criteria_evaluation?: CriterionEvaluation[];
    warm_up?: string;             // chip elegido en READY (antes se perdía)
    mental_hack?: string;         // ancla mental elegida en READY (antes se perdía)
  }
) {
  // Validación en la acción: token + admin client saltan RLS, así que la
  // puerta es esta. Rangos = los CHECK de la tabla, más la forma del jsonb.
  const inRange = (v: number | undefined, lo: number, hi: number) =>
    v === undefined || (Number.isInteger(v) && v >= lo && v <= hi);
  if (!inRange(data.focus_rating, 0, 3)) return { ok: false as const, error: 'Focus rating out of range' };
  if (!inRange(data.execution_rating, 1, 5)) return { ok: false as const, error: 'Execution rating out of range' };
  if (!inRange(data.flow_channel, 1, 5)) return { ok: false as const, error: 'Flow channel out of range' };
  if (data.mission_completion !== undefined && !['yes', 'partial', 'no'].includes(data.mission_completion)) {
    return { ok: false as const, error: 'Invalid completion value' };
  }
  if (data.criteria_evaluation !== undefined) {
    const valid = Array.isArray(data.criteria_evaluation) && data.criteria_evaluation.length <= 20 && data.criteria_evaluation.every(
      (c) => c && Number.isInteger(c.criterion_index) && ['met', 'partial', 'not_met'].includes(c.result)
    );
    if (!valid) return { ok: false as const, error: 'Invalid criteria evaluation' };
  }
  const tooLong = (v: string | undefined, max: number) => typeof v === 'string' && v.length > max;
  if (tooLong(data.intention_text, 500) || tooLong(data.notes, 4000) || tooLong(data.venue_notes, 2000) || tooLong(data.warm_up, 200) || tooLong(data.mental_hack, 100)) {
    return { ok: false as const, error: 'Text too long' };
  }

  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) return { ok: false as const, error: 'Not authorized' };

  const admin = createAdminClient();

  // Get drill_mission to extract step_id (+ the card's real criteria: el
  // texto de cada criterio se toma de la tarjeta, nunca del cliente).
  const { data: drillMission } = await admin
    .from('drills_missions')
    .select('step_id, title, success_criteria')
    .eq('id', drillMissionId)
    .single();

  if (!drillMission) {
    return { ok: false, error: 'Drill/mission not found' };
  }

  // criteria_evaluation se reconstruye desde la tarjeta: índice válido,
  // texto de la tarjeta, un resultado por índice. Y mission_completion se
  // deriva acá (misma regla que el cliente) para que nunca se contradigan.
  const cardCriteria: string[] = Array.isArray(drillMission.success_criteria) ? drillMission.success_criteria : [];
  let criteriaClean: CriterionEvaluation[] | null = null;
  let completion = data.mission_completion;
  if (data.criteria_evaluation !== undefined) {
    const byIndex = new Map<number, CriterionResult>();
    for (const c of data.criteria_evaluation) {
      if (c.criterion_index < 0 || c.criterion_index >= cardCriteria.length) return { ok: false as const, error: 'Criterion index out of range' };
      byIndex.set(c.criterion_index, c.result);
    }
    criteriaClean = Array.from(byIndex.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([i, result]) => ({ criterion_index: i, criterion_text: cardCriteria[i], result }));
    if (criteriaClean.length > 0) {
      const met = criteriaClean.filter((c) => c.result === 'met').length;
      const partial = criteriaClean.filter((c) => c.result === 'partial').length;
      completion = met === cardCriteria.length ? 'yes' : met + partial > 0 ? 'partial' : 'no';
    }
  }

  // Insert training session
  const { data: session, error } = await admin
    .from('self_training_sessions')
    .insert({
      student_id: studentId,
      linked_drill_mission_id: drillMissionId,
      linked_step_id: drillMission.step_id,
      // El NOMBRE del drill viaja con la sesión (bug 2026-09-01: se guardaba
      // solo el id → Home "drills practiced", bitácora y planner del coach
      // mostraban "Misión" genérica o nada). kind explícito por si el
      // default de la tabla cambia.
      drill_name: drillMission.title ?? null,
      kind: 'drill',
      session_date: new Date().toISOString().slice(0, 10),
      intention_text: data.intention_text,
      planned_duration_minutes: data.planned_duration_minutes,
      planned_reps: data.planned_reps,
      duration_minutes: data.duration_minutes ?? data.planned_duration_minutes,
      reps_completed: data.reps_completed,
      venue_type: data.venue_type,
      wave_conditions: data.wave_conditions,
      wind: data.wind,
      tide: data.tide,
      crowd_level: data.crowd_level,
      safety_check: data.safety_check,
      venue_notes: data.venue_notes,
      notes: data.notes,
      focus_rating: data.focus_rating,
      mission_completion: completion,
      execution_rating: data.execution_rating,
      flow_channel: data.flow_channel ?? null,
      criteria_evaluation: criteriaClean,
      warm_up: data.warm_up ?? null,
      mental_hack: data.mental_hack ?? null,
      completed: true,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  // If execution_rating provided, update student_step_ratings
  if (data.execution_rating) {
    await admin
      .from('student_step_ratings')
      .upsert({
        student_id: studentId,
        step_id: drillMission.step_id,
        current_rating: data.execution_rating,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id,step_id' });
  }

  return { ok: true, session, stepId: drillMission.step_id };
}

// Práctica de la semana (para la racha del cierre del Let's Play).
export async function getWeeklyPracticeCount(portalToken: string): Promise<number> {
  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) return 0;
  const admin = createAdminClient();
  const since = new Date(Date.now() - 6 * 86400000);
  since.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from('self_training_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .gte('created_at', since.toISOString());
  return count ?? 0;
}

/**
 * El próximo movimiento del alumno, para el Home.
 *
 * Es la misma lectura de Let's Play condensada en una línea: la primera
 * secuencia que todavía no está lograda y el paso que la frena. Sale de las
 * notas que el coach ya puso — no hay nada nuevo que llenar.
 */
export async function getNextMove(
  portalToken: string,
  belt: string
): Promise<{
  sequenceId: string;
  sequenceOrder: number;
  sequenceName: string;
  stepId: string;
  stepTitle: string;
  stars: number | null;
  official: boolean;
  /** El detalle más flojo de la última práctica de ese paso (evaluación por
   *  criterio): el "Work on this" baja del paso al detalle concreto. */
  detail: { text: string; result: 'partial' | 'not_met'; drillTitle: string | null; date: string } | null;
} | null> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return null;
    const data = await mySequenceForStudent(studentId, belt);
    const seq = data.sequences.find((s) => s.state !== 'owned' && s.weakestStepId);
    if (!seq || !seq.weakestStepId) return null;
    let detail: { text: string; result: 'partial' | 'not_met'; drillTitle: string | null; date: string } | null = null;
    try {
      const admin = createAdminClient();
      const { data: last } = await admin
        .from('self_training_sessions')
        .select('created_at, drill_name, criteria_evaluation, linked_drill_mission_id')
        .eq('student_id', studentId)
        .eq('linked_step_id', seq.weakestStepId)
        .eq('kind', 'drill')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const weak = pickWeakestCriterion((last?.criteria_evaluation ?? null) as CriterionEvaluationItem[] | null);
      if (last && weak && weak.result !== 'met') {
        // El texto sale de la tarjeta ACTUAL (por índice): si el admin editó
        // el criterio, el alumno ve la versión vigente, no la foto vieja.
        const text = await currentCriterionText(admin, last.linked_drill_mission_id, weak.criterion_index, weak.criterion_text);
        if (text) detail = { text, result: weak.result, drillTitle: last.drill_name ?? null, date: last.created_at };
      }
    } catch {
      detail = null;
    }
    return {
      sequenceId: seq.id,
      sequenceOrder: seq.order,
      sequenceName: seq.name,
      stepId: seq.weakestStepId,
      stepTitle: seq.weakestTitle ?? seq.weakestStepId,
      stars: seq.minRating,
      official: seq.weakestIsOfficial,
      detail,
    };
  } catch {
    // El Home no se cae por esto: es una ayuda, no el contenido.
    return null;
  }
}


/**
 * Lo que quedó flojo la última vez que practicó ESTA pieza. La pantalla de
 * plan lo ofrece como objetivo de hoy con un toque: el alumno solo cierra el
 * círculo (evaluó por detalle → vuelve al detalle).
 */
export async function getLastPracticeHint(
  portalToken: string,
  drillMissionId: string
): Promise<{ date: string; weakest: { text: string; result: 'partial' | 'not_met' } | null; metAll: boolean } | null> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return null;
    const admin = createAdminClient();
    const { data } = await admin
      .from('self_training_sessions')
      .select('created_at, criteria_evaluation, mission_completion')
      .eq('student_id', studentId)
      .eq('linked_drill_mission_id', drillMissionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const weak = pickWeakestCriterion((data.criteria_evaluation ?? null) as CriterionEvaluationItem[] | null);
    const text = weak && weak.result !== 'met' ? await currentCriterionText(admin, drillMissionId, weak.criterion_index, weak.criterion_text) : null;
    return {
      date: data.created_at,
      weakest: weak && weak.result !== 'met' && text ? { text, result: weak.result } : null,
      metAll: data.mission_completion === 'yes',
    };
  } catch {
    return null;
  }
}

/** Texto vigente del criterio N de la tarjeta; null si la tarjeta ya no tiene ese índice. */
async function currentCriterionText(
  admin: ReturnType<typeof createAdminClient>,
  drillMissionId: string | null,
  index: number,
  fallback: string
): Promise<string | null> {
  if (!drillMissionId) return fallback || null;
  const { data } = await admin.from('drills_missions').select('success_criteria').eq('id', drillMissionId).maybeSingle();
  const list: string[] = Array.isArray(data?.success_criteria) ? data!.success_criteria : [];
  if (list.length === 0) return fallback || null;
  return index >= 0 && index < list.length ? list[index] : null;
}
