'use server';

// ═══ LET'S PLAY POR SECUENCIA ═══
// Marcelo (2026-09-04): la unidad de entreno es la SECUENCIA. El paso es el
// detalle de la secuencia; el criterio es el detalle del paso. Solo el primer
// nivel es obligatorio.
//
//   sequence_run  → correr la secuencia completa en el agua. Al cerrar: una
//                   estrella para la secuencia; opcional "qué paso la detuvo";
//                   opcional "qué detalle" dentro de ese paso.
//   step_focus    → la misma secuencia con UN paso como objetivo principal.
//                   Al cerrar: ese paso (veredicto + estrella + detalle
//                   opcional) y, opcional, la estrella de la secuencia.
//
// La estrella de la secuencia vive APARTE de las de los pasos
// (student_sequence_ratings): "corrí la secuencia y salió 4" no pisa "el
// pop-up sigue en 2". Los pasos solo se mueven si el alumno entra al detalle.
//
// Seguridad: el admin client salta RLS, así que la puerta es el token del
// portal; los ids de pasos y los textos de criterio se validan contra la
// secuencia y las tarjetas, nunca se confía en el cliente.

import { createAdminClient } from '@/lib/supabase/admin';
import { studentIdFromPortalToken } from '@/lib/portal/student-token';
import { pickWeakestCriterion, type CriterionEvaluationItem, type CriterionResultValue } from '@/lib/utils/criteria';
import { SEQUENCE_PASS_STARS, sequenceLabel } from '@/lib/constants/learning-blocks';
import { getMySequence, type DrillMissionRow, type SequenceData } from './sequence';

export type TrainingMode = 'sequence_run' | 'step_focus';

export type SequenceTrainingStep = {
  step_id: string;
  title: string;
  key_words: string[];
  rating: number | null;
  coach_rating: number | null;
  mission: DrillMissionRow | null;
  drill: DrillMissionRow | null;
};

export type SequenceTraining = {
  sequence: {
    id: string;
    order: number;
    name: string;
    belt: string;
    promise: string | null;
    state: SequenceData['sequences'][number]['state'];
    minRating: number | null;
  };
  steps: SequenceTrainingStep[];
  /** La nota del alumno para la cadena (aparte de los pasos). */
  seqRating: { current_rating: number | null; rating_count: number; held_back_step_id: string | null; last_updated: string } | null;
  /** El paso que conviene trabajar: el que la detuvo la última vez, si no el
   *  primero por debajo de la barra, si no el primero de la cadena. */
  suggestedFocusStepId: string | null;
  /** Lo que quedó flojo por paso en tus últimas sesiones de esta secuencia
   *  (runs y focos): el objetivo de hoy cuando elegís ese paso. La marca MÁS
   *  RECIENTE con detalle decide, aunque haya salido todo logrado. */
  stepHints: Record<string, { text: string; result: 'partial' | 'not_met'; at: string }>;
};

type StepMark = { step_id: string; held_back: boolean; rating?: number | null; criteria_evaluation?: CriterionEvaluationItem[] | null };

function isRating(n: unknown): n is number {
  return Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 5;
}
function inRange(n: unknown, lo: number, hi: number): n is number {
  return Number.isInteger(n) && (n as number) >= lo && (n as number) <= hi;
}

const BELT_ORDER = ['white', 'yellow', 'blue', 'purple', 'brown', 'black'];
const beltKey = (b: string | null | undefined) => String(b ?? 'white').replace(/_belt$/, '');
// Dueños del curso: revisan cualquier cinta. Mantener en sync con
// COURSE_OWNER_IDS en active-course.ts y portal/[token]/page.tsx.
const COURSE_OWNER_IDS = new Set<string>([
  '3518cc9c-d633-44ff-b32a-bfb86b5ae748', // Marcelo Castellanos
  '0f6816db-a637-4af0-86b6-1a1c8227953c', // Androide Salvadoreno (review account)
]);

/** La cinta más alta que el alumno puede entrenar: su cinta o la más alta de
 *  los cursos que tiene. El belt que manda el cliente se recorta a eso. */
async function allowedBeltFor(studentId: string, requested: string): Promise<string> {
  if (COURSE_OWNER_IDS.has(studentId)) return beltKey(requested);
  const admin = createAdminClient();
  const { data: st } = await admin
    .from('students')
    .select('belt_level, course_access_white, course_access_yellow, course_access_blue')
    .eq('id', studentId)
    .maybeSingle();
  const s = (st ?? {}) as any;
  let max = BELT_ORDER.indexOf(beltKey(s.belt_level));
  if (s.course_access_yellow) max = Math.max(max, BELT_ORDER.indexOf('yellow'));
  if (s.course_access_blue) max = Math.max(max, BELT_ORDER.indexOf('blue'));
  if (max < 0) max = 0;
  const req = BELT_ORDER.indexOf(beltKey(requested));
  return BELT_ORDER[req < 0 ? max : Math.min(req, max)];
}

async function loadSequence(portalToken: string, sequenceId: string, belt: string) {
  const data = await getMySequence(portalToken, belt);
  const seq = data.sequences.find((s) => s.id === sequenceId) ?? null;
  return { data, seq };
}

export async function getSequenceTraining(
  portalToken: string,
  sequenceId: string,
  belt: string = 'white'
): Promise<{ ok: true; data: SequenceTraining } | { ok: false; error: string }> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return { ok: false, error: 'Not authenticated.' };
    const safeBelt = await allowedBeltFor(studentId, belt);
    const { seq } = await loadSequence(portalToken, sequenceId, safeBelt);
    if (!seq) return { ok: false, error: 'Sequence not available yet.' };

    const admin = createAdminClient();
    const { data: sr } = await admin
      .from('student_sequence_ratings')
      .select('current_rating, rating_count, held_back_step_id, last_updated')
      .eq('student_id', studentId)
      .eq('sequence_id', sequenceId)
      .maybeSingle();

    const steps: SequenceTrainingStep[] = seq.items.map((i) => ({
      step_id: i.step_id,
      title: i.step_title,
      key_words: i.mission?.key_words?.length ? i.mission.key_words : (i.drill?.key_words ?? []),
      rating: i.rating ?? null,
      coach_rating: i.coach_rating ?? null,
      mission: i.mission,
      drill: i.drill,
    }));

    const stepIds = new Set(steps.map((s) => s.step_id));

    // El detalle de las últimas sesiones de ESTA secuencia, por paso: la marca
    // más reciente con criterios decide (run → step_marks; foco →
    // criteria_evaluation). Si salió todo logrado, no hay pista: un run viejo
    // no resucita un detalle que ya cerraste.
    const stepHints: SequenceTraining['stepHints'] = {};
    const decided = new Set<string>();
    const { data: recent } = await admin
      .from('self_training_sessions')
      .select('created_at, training_mode, linked_step_id, step_marks, criteria_evaluation')
      .eq('student_id', studentId)
      .eq('linked_sequence_id', sequenceId)
      .order('created_at', { ascending: false })
      .limit(15);
    const consider = (stepId: string | null, crit: unknown, at: string) => {
      if (!stepId || decided.has(stepId) || !stepIds.has(stepId)) return;
      if (!Array.isArray(crit) || crit.length === 0) return;
      decided.add(stepId);
      const weak = pickWeakestCriterion(crit as CriterionEvaluationItem[]);
      if (weak && weak.result !== 'met') stepHints[stepId] = { text: weak.criterion_text, result: weak.result, at };
    };
    for (const r of (recent ?? []) as any[]) {
      if (r.training_mode === 'sequence_run') {
        for (const m of (r.step_marks ?? []) as StepMark[]) consider(m?.step_id ?? null, m?.criteria_evaluation, r.created_at);
      } else {
        consider(r.linked_step_id ?? null, r.criteria_evaluation, r.created_at);
      }
    }

    let suggested: string | null = null;
    if (sr?.held_back_step_id && stepIds.has(sr.held_back_step_id)) suggested = sr.held_back_step_id;
    else if (seq.weakestStepId) suggested = seq.weakestStepId;
    else if (steps.length) suggested = steps[0].step_id;

    return {
      ok: true,
      data: {
        sequence: { id: seq.id, order: seq.order, name: seq.name, belt: seq.belt, promise: seq.promise, state: seq.state, minRating: seq.minRating },
        steps,
        seqRating: sr ? { current_rating: sr.current_rating ?? null, rating_count: sr.rating_count ?? 0, held_back_step_id: sr.held_back_step_id ?? null, last_updated: sr.last_updated } : null,
        suggestedFocusStepId: suggested,
        stepHints,
      },
    };
  } catch (e) {
    console.error('[lets-play] getSequenceTraining failed', e);
    return { ok: false, error: 'Could not load the sequence.' };
  }
}

export type SaveSequenceSessionInput = {
  sequenceId: string;
  belt: string;
  mode: TrainingMode;
  focusStepId?: string | null;
  intention_text?: string;
  planned_duration_minutes: number;
  planned_reps: number;
  duration_minutes?: number;
  reps_completed?: number;
  safety_check: boolean;
  warm_up?: string | null;
  notes?: string;
  flow_channel?: number | null;
  /** Run: obligatoria. Foco: opcional. */
  sequence_rating?: number | null;
  /** Run: los pasos que la detuvieron (opcional). Solo ellos admiten detalle. */
  held_back_step_ids?: string[];
  /** Run: estrella opcional por paso marcado. */
  step_ratings?: Record<string, number>;
  /** Run: detalle opcional por paso marcado (criterios de la MISIÓN de ese paso). */
  step_criteria?: Record<string, { criterion_index: number; result: CriterionResultValue }[]>;
  /** Foco: estrella del paso (obligatoria) + detalle opcional. El veredicto
   *  ya no se pregunta: se deriva de la estrella. */
  mission_completion?: 'yes' | 'partial' | 'no';
  execution_rating?: number;
  criteria?: { criterion_index: number; result: CriterionResultValue }[];
  /** "Go deeper · how it felt" (opcional, ambos modos). */
  focus_rating?: number | null;
};

export type NextFocus = { stepId: string; stepTitle: string; criterionText: string | null } | null;

function cleanCriteria(
  card: DrillMissionRow | null,
  marks: { criterion_index: number; result: CriterionResultValue }[] | undefined
): CriterionEvaluationItem[] | null {
  if (!card || !Array.isArray(marks) || marks.length === 0) return null;
  const list = Array.isArray(card.success_criteria) ? card.success_criteria : [];
  const seen = new Set<number>();
  const out: CriterionEvaluationItem[] = [];
  for (const m of marks) {
    const i = m?.criterion_index;
    if (!Number.isInteger(i) || i < 0 || i >= list.length || seen.has(i)) continue;
    if (!['met', 'partial', 'not_met'].includes(m.result)) continue;
    seen.add(i);
    // El texto sale de la tarjeta, nunca del cliente.
    out.push({ criterion_index: i, criterion_text: list[i], result: m.result });
  }
  out.sort((a, b) => a.criterion_index - b.criterion_index);
  return out.length ? out : null;
}

export async function saveSequenceSession(
  portalToken: string,
  input: SaveSequenceSessionInput
): Promise<{ ok: true; sessionId: string; nextFocus: NextFocus; sequenceRating: number | null } | { ok: false; error: string }> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return { ok: false, error: 'Not authenticated.' };
    if (input.mode !== 'sequence_run' && input.mode !== 'step_focus') return { ok: false, error: 'Invalid mode.' };
    if (!inRange(input.planned_duration_minutes, 1, 600)) return { ok: false, error: 'Invalid duration.' };
    if (!inRange(input.planned_reps, 1, 500)) return { ok: false, error: 'Invalid runs target.' };
    if (input.duration_minutes != null && !inRange(input.duration_minutes, 1, 600)) return { ok: false, error: 'Invalid duration.' };
    if (input.reps_completed != null && !inRange(input.reps_completed, 0, 500)) return { ok: false, error: 'Invalid runs completed.' };
    if (!input.safety_check) return { ok: false, error: 'Answer the safety check first.' };

    const safeBelt = await allowedBeltFor(studentId, input.belt);
    const { seq } = await loadSequence(portalToken, input.sequenceId, safeBelt);
    if (!seq) return { ok: false, error: 'Sequence not available yet.' };
    const byId = new Map(seq.items.map((i) => [i.step_id, i]));
    const order = seq.items.map((i) => i.step_id);

    const isRun = input.mode === 'sequence_run';
    const focus = !isRun ? byId.get(input.focusStepId ?? '') ?? null : null;
    if (!isRun && !focus) return { ok: false, error: 'Focus step not in this sequence.' };

    // ── Estrella de la secuencia ──
    const seqRating = input.sequence_rating == null ? null : isRating(input.sequence_rating) ? input.sequence_rating : NaN;
    if (Number.isNaN(seqRating)) return { ok: false, error: 'Invalid sequence rating.' };
    if (isRun && seqRating == null) return { ok: false, error: 'Rate the sequence to save.' };

    // ── Run: detalle opcional, SOLO en los pasos marcados ──
    let stepMarks: StepMark[] | null = null;
    if (isRun) {
      const held = new Set((input.held_back_step_ids ?? []).filter((id) => byId.has(id)));
      const marks: StepMark[] = [];
      for (const id of order) {
        if (!held.has(id)) continue;
        const r = input.step_ratings?.[id];
        const crit = cleanCriteria(byId.get(id)?.mission ?? null, input.step_criteria?.[id]);
        marks.push({ step_id: id, held_back: true, rating: isRating(r) ? r : null, criteria_evaluation: crit });
      }
      stepMarks = marks.length ? marks : null;
    }

    // ── Foco: el paso como misión ──
    let completion: 'yes' | 'partial' | 'no' | null = null;
    let execution: number | null = null;
    let focusCriteria: CriterionEvaluationItem[] | null = null;
    if (!isRun && focus) {
      if (input.mission_completion && !['yes', 'partial', 'no'].includes(input.mission_completion)) return { ok: false, error: 'Invalid outcome.' };
      completion = input.mission_completion ?? null;
      if (input.execution_rating != null && !isRating(input.execution_rating)) return { ok: false, error: 'Invalid rating.' };
      execution = input.execution_rating ?? null;
      focusCriteria = cleanCriteria(focus.mission, input.criteria);
      if (!execution) return { ok: false, error: 'Rate the step to save.' };
      // El veredicto sale de la estrella: 4-5 logrado · 3 a medias · 1-2 no.
      if (!completion) completion = execution >= 4 ? 'yes' : execution === 3 ? 'partial' : 'no';
    }

    const flow = input.flow_channel == null ? null : inRange(input.flow_channel, 1, 5) ? input.flow_channel : null;
    const focusRating = input.focus_rating == null ? null : inRange(input.focus_rating, 0, 3) ? input.focus_rating : null;
    const clip = (s: string | undefined | null, n: number) => (typeof s === 'string' ? s.slice(0, n) : null);

    // ── Próximo foco: el eslabón más flojo, en orden de cadena ──
    let nextFocus: NextFocus = null;
    let heldBackForRating: string | null = null;
    if (isRun) {
      const heldFirst = (stepMarks ?? [])[0] ?? null;
      if (heldFirst) {
        heldBackForRating = heldFirst.step_id;
        const weak = pickWeakestCriterion(heldFirst.criteria_evaluation ?? null);
        nextFocus = {
          stepId: heldFirst.step_id,
          stepTitle: byId.get(heldFirst.step_id)?.step_title ?? heldFirst.step_id,
          criterionText: weak && weak.result !== 'met' ? weak.criterion_text : null,
        };
      }
    } else if (focus) {
      const weak = pickWeakestCriterion(focusCriteria);
      const stillWorking = completion !== 'yes' || (execution ?? 0) < SEQUENCE_PASS_STARS;
      if (stillWorking || (weak && weak.result !== 'met')) {
        heldBackForRating = focus.step_id;
        nextFocus = { stepId: focus.step_id, stepTitle: focus.step_title, criterionText: weak && weak.result !== 'met' ? weak.criterion_text : null };
      }
    }

    const admin = createAdminClient();
    const seqLabel = sequenceLabel(seq.id, seq.order, seq.name);
    const { data: session, error } = await admin
      .from('self_training_sessions')
      .insert({
        student_id: studentId,
        kind: 'drill',
        training_mode: input.mode,
        linked_sequence_id: seq.id,
        linked_step_id: focus?.step_id ?? null,
        linked_drill_mission_id: focus?.mission?.id ?? null,
        // El nombre viaja con la sesión: Home, bitácora y planner lo leen.
        drill_name: isRun ? seqLabel : `${focus!.step_title} · ${seqLabel}`,
        session_date: new Date().toISOString().slice(0, 10),
        intention_text: clip(input.intention_text, 300),
        planned_duration_minutes: input.planned_duration_minutes,
        planned_reps: input.planned_reps,
        duration_minutes: inRange(input.duration_minutes, 1, 600) ? input.duration_minutes : input.planned_duration_minutes,
        reps_completed: inRange(input.reps_completed, 0, 500) ? input.reps_completed : null,
        safety_check: true,
        warm_up: clip(input.warm_up, 120),
        notes: clip(input.notes, 1000),
        flow_channel: flow,
        sequence_rating: seqRating,
        step_marks: stepMarks,
        mission_completion: completion,
        execution_rating: execution,
        criteria_evaluation: focusCriteria,
        focus_rating: focusRating,
        completed: true,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[lets-play] insert failed', error);
      return { ok: false, error: 'Could not save the session.' };
    }

    // Si una nota no se puede escribir, la sesión no queda a medias: se borra
    // y el alumno ve el error (reintentar no duplica nada).
    const rollback = async (msg: string) => {
      await admin.from('self_training_sessions').delete().eq('id', session.id);
      return { ok: false as const, error: msg };
    };

    // ── La nota de la secuencia (aparte de los pasos) ──
    const { data: prev } = await admin
      .from('student_sequence_ratings')
      .select('current_rating, rating_count, held_back_step_id')
      .eq('student_id', studentId)
      .eq('sequence_id', seq.id)
      .maybeSingle();
    // Qué paso queda como "el que la detiene":
    //   run con detalle  → el primero marcado en orden de cadena;
    //   run sin detalle  → si PASÓ la barra, nada la detiene (se limpia); si
    //                      no, se conserva el anterior (no marcar ≠ resolver);
    //   foco             → si sigue "working", ese paso; si cerró limpio y era
    //                      el que detenía la cadena, se suelta; si no, el anterior.
    const runPassed = isRun && (seqRating ?? 0) >= SEQUENCE_PASS_STARS;
    const focusClearsHeld = !isRun && focus && heldBackForRating === null && prev?.held_back_step_id === focus.step_id;
    const keptFocus = heldBackForRating ?? (isRun ? (runPassed ? null : prev?.held_back_step_id ?? null) : (focusClearsHeld ? null : prev?.held_back_step_id ?? null));
    if (seqRating != null || keptFocus !== (prev?.held_back_step_id ?? null)) {
      const { error: seqErr } = await admin.from('student_sequence_ratings').upsert({
        student_id: studentId,
        sequence_id: seq.id,
        current_rating: seqRating ?? prev?.current_rating ?? null,
        rating_count: (prev?.rating_count ?? 0) + (seqRating != null ? 1 : 0),
        held_back_step_id: keptFocus,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id,sequence_id' });
      if (seqErr) { console.error('[lets-play] sequence rating failed', seqErr); return rollback('Could not save your sequence rating.'); }
    }

    // ── Las estrellas de paso SOLO se mueven con detalle explícito ──
    const stepUpserts: { step_id: string; rating: number }[] = [];
    if (isRun) for (const m of stepMarks ?? []) if (isRating(m.rating)) stepUpserts.push({ step_id: m.step_id, rating: m.rating as number });
    if (!isRun && focus && execution) stepUpserts.push({ step_id: focus.step_id, rating: execution });
    for (const u of stepUpserts) {
      const { error: stepErr } = await admin.from('student_step_ratings').upsert({
        student_id: studentId,
        step_id: u.step_id,
        current_rating: u.rating,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id,step_id' });
      if (stepErr) { console.error('[lets-play] step rating failed', stepErr); return rollback('Could not save your step rating.'); }
    }

    return { ok: true, sessionId: session.id, nextFocus, sequenceRating: seqRating };
  } catch (e) {
    console.error('[lets-play] saveSequenceSession failed', e);
    return { ok: false, error: 'Could not save the session.' };
  }
}
