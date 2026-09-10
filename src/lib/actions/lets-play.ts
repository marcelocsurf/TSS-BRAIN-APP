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
import { studentCanTrack, TRACKING_LOCKED_MESSAGE } from '@/lib/portal/access';
import { pickWeakestCriterion, type CriterionEvaluationItem, type CriterionResultValue } from '@/lib/utils/criteria';
import { SEQUENCE_PASS_STARS, sequenceLabel, sequenceSide, SIDE_WORD } from '@/lib/constants/learning-blocks';
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
    /** fs · bs · both · null (Marcelo 2026-09-10). En 'both' el flujo pide el lado. */
    side: SequenceData['sequences'][number]['side'];
    sideRatings: SequenceData['sequences'][number]['sideRatings'];
  };
  steps: SequenceTrainingStep[];
  /** La nota del alumno para la cadena (aparte de los pasos). */
  seqRating: { current_rating: number | null; rating_count: number; held_back_step_id: string | null; last_updated: string } | null;
  /** El paso que conviene trabajar: el que la detuvo la última vez, si no el
   *  primero por debajo de la barra, si no el primero de la cadena. */
  suggestedFocusStepId: string | null;
  /** Tus tareas abiertas EN esta secuencia (paso + detalle). Se ofrecen como
   *  foco al planear; nunca se imponen. */
  tasks: StudentTask[];
  /** Lo que quedó flojo por paso en tus últimas sesiones de esta secuencia
   *  (runs y focos): el objetivo de hoy cuando elegís ese paso. La marca MÁS
   *  RECIENTE con detalle decide, aunque haya salido todo logrado. */
  stepHints: Record<string, { text: string; result: 'partial' | 'not_met'; at: string }>;
};

/** `moment` (2026-09-10): el momento de la línea donde se rompió ("Back hand,
 *  palm up…"), en palabras de la página de la secuencia. */
type StepMark = { step_id: string; held_back: boolean; rating?: number | null; criteria_evaluation?: CriterionEvaluationItem[] | null; moment?: string | null };

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
      .eq('status', 'done')
      .eq('linked_sequence_id', sequenceId)
      .order('created_at', { ascending: false })
      .limit(15);
    const consider = (stepId: string | null, crit: unknown, at: string, moment: string | null = null) => {
      if (!stepId || decided.has(stepId) || !stepIds.has(stepId)) return;
      const hasCrit = Array.isArray(crit) && crit.length > 0;
      if (!hasCrit && !moment) return;
      decided.add(stepId);
      if (hasCrit) {
        const weak = pickWeakestCriterion(crit as CriterionEvaluationItem[]);
        if (weak && weak.result !== 'met') { stepHints[stepId] = { text: weak.criterion_text, result: weak.result, at }; return; }
        if (weak) return; // todo logrado: no hay pista
      }
      // Sin criterios pero con el momento donde se rompió: ese es el objetivo.
      if (moment) stepHints[stepId] = { text: moment, result: 'not_met', at };
    };
    for (const r of (recent ?? []) as any[]) {
      if (r.training_mode === 'sequence_run') {
        for (const m of (r.step_marks ?? []) as StepMark[]) consider(m?.step_id ?? null, m?.criteria_evaluation, r.created_at, typeof m?.moment === 'string' ? m.moment : null);
      } else {
        consider(r.linked_step_id ?? null, r.criteria_evaluation, r.created_at);
      }
    }

    const { data: taskRows } = await admin
      .from('student_tasks')
      .select('id, sequence_id, step_id, detail, source, created_at')
      .eq('student_id', studentId)
      .eq('status', 'open')
      .eq('sequence_id', sequenceId)
      .order('created_at', { ascending: true });
    const tasks: StudentTask[] = (taskRows ?? []).filter((t: any) => stepIds.has(t.step_id)).map((t: any) => ({
      id: t.id, sequenceId: t.sequence_id, sequenceLabel: sequenceLabel(seq.id, seq.order, seq.name), stepId: t.step_id,
      stepTitle: steps.find((s) => s.step_id === t.step_id)?.title ?? t.step_id, detail: t.detail ?? null, source: t.source, createdAt: t.created_at,
    }));

    let suggested: string | null = null;
    if (sr?.held_back_step_id && stepIds.has(sr.held_back_step_id)) suggested = sr.held_back_step_id;
    else if (seq.weakestStepId) suggested = seq.weakestStepId;
    else if (steps.length) suggested = steps[0].step_id;

    return {
      ok: true,
      data: {
        sequence: { id: seq.id, order: seq.order, name: seq.name, belt: seq.belt, promise: seq.promise, state: seq.state, minRating: seq.minRating, side: seq.side, sideRatings: seq.sideRatings },
        steps,
        seqRating: sr ? { current_rating: sr.current_rating ?? null, rating_count: sr.rating_count ?? 0, held_back_step_id: sr.held_back_step_id ?? null, last_updated: sr.last_updated } : null,
        suggestedFocusStepId: suggested,
        stepHints,
        tasks,
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
  /** El lado (Marcelo 2026-09-10). Obligatorio en las secuencias de dos
   *  lados (Yellow #7); en #8-#13 lo pone el servidor; sin lado = null. */
  side?: 'fs' | 'bs' | null;
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
  /** Run: el momento de la línea donde se rompió, por paso marcado. */
  step_moments?: Record<string, string>;
  /** La sesión PLANIFICADA que se cierra (plan guardado antes del agua). Si
   *  viene, se actualiza esa fila en vez de insertar una nueva. */
  sessionId?: string | null;
  /** Cómo se midió: tiempo, runs/olas, o las dos. */
  measure?: 'time' | 'reps' | 'waves' | 'time_reps' | null;
  /** El momento de la línea elegido como foco. */
  focus_moment?: string | null;
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
    if (!(await studentCanTrack(studentId))) return { ok: false, error: TRACKING_LOCKED_MESSAGE };
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

    // ── El lado ── fs/bs implícito en #8-#13; elegido en las de dos lados.
    const kind = sequenceSide(seq.id);
    let side: 'fs' | 'bs' | null = null;
    if (kind === 'fs' || kind === 'bs') side = kind;
    else if (kind === 'both') {
      if (input.side !== 'fs' && input.side !== 'bs') return { ok: false, error: 'Pick the side you surfed: frontside or backside.' };
      side = input.side;
    }

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
        const mo = input.step_moments?.[id];
        marks.push({ step_id: id, held_back: true, rating: isRating(r) ? r : null, criteria_evaluation: crit, moment: typeof mo === 'string' && mo.trim() ? mo.trim().slice(0, 80) : null });
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
          // Sin detalle por criterio, el momento de la línea es el objetivo.
          criterionText: weak && weak.result !== 'met' ? weak.criterion_text : (heldFirst.moment ?? null),
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
    // Cerrar un plan guardado: la fila ya existe (status 'planned') y es de
    // este alumno. Se completa en el mismo lugar — una sesión, no dos.
    let planned: { id: string } | null = null;
    if (input.sessionId) {
      const { data: pl } = await admin
        .from('self_training_sessions')
        .select('id')
        .eq('id', input.sessionId)
        .eq('student_id', studentId)
        .eq('status', 'planned')
        .maybeSingle();
      if (!pl) return { ok: false, error: 'That session was already closed. Start a new plan.' };
      planned = pl;
    }
    const row = {
        student_id: studentId,
        kind: 'drill',
        training_mode: input.mode,
        linked_sequence_id: seq.id,
        side,
        linked_step_id: focus?.step_id ?? null,
        linked_drill_mission_id: focus?.mission?.id ?? null,
        // El nombre viaja con la sesión: Home, bitácora y planner lo leen.
        drill_name: `${isRun ? seqLabel : `${focus!.step_title} · ${seqLabel}`}${kind === 'both' && side ? ` · ${SIDE_WORD[side]}` : ''}`,
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
        status: 'done' as const,
        measure: input.measure ?? null,
        focus_moment: clip(input.focus_moment, 80),
      };
    const { data: session, error } = planned
      ? await admin.from('self_training_sessions').update(row).eq('id', planned.id).select('id').single()
      : await admin.from('self_training_sessions').insert(row).select('id').single();
    if (error) {
      console.error('[lets-play] insert failed', error);
      return { ok: false, error: 'Could not save the session.' };
    }

    // Si una nota no se puede escribir, la sesión no queda a medias: se borra
    // y el alumno ve el error (reintentar no duplica nada).
    const rollback = async (msg: string) => {
      if (planned) await admin.from('self_training_sessions').update({ status: 'planned', completed: false }).eq('id', session.id);
      else await admin.from('self_training_sessions').delete().eq('id', session.id);
      return { ok: false as const, error: msg };
    };

    // ── La nota de la secuencia (aparte de los pasos) ──
    const { data: prev } = await admin
      .from('student_sequence_ratings')
      .select('current_rating, rating_count, held_back_step_id, rating_fs, rating_bs')
      .eq('student_id', studentId)
      .eq('sequence_id', seq.id)
      .maybeSingle();
    // Secuencia de dos lados: la nota se guarda POR LADO y la secuencia vale
    // su lado más flojo (doctrina "complete on both sides").
    const sideCols: { rating_fs?: number | null; rating_bs?: number | null } = {};
    let seqRatingToStore: number | null = seqRating ?? prev?.current_rating ?? null;
    if (kind === 'both' && seqRating != null && side) {
      const fs = side === 'fs' ? seqRating : prev?.rating_fs ?? null;
      const bs = side === 'bs' ? seqRating : prev?.rating_bs ?? null;
      sideCols.rating_fs = fs;
      sideCols.rating_bs = bs;
      seqRatingToStore = fs != null && bs != null ? Math.min(fs, bs) : (fs ?? bs);
    }
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
        current_rating: seqRatingToStore,
        ...sideCols,
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
        // Ejecutado en el agua: pisa cualquier autoevaluación.
        self_source: 'executed',
        assessed_criteria: null,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id,step_id' });
      if (stepErr) { console.error('[lets-play] step rating failed', stepErr); return rollback('Could not save your step rating.'); }
      // Una tarea propia se cierra sola cuando el paso llega a 4★ en el agua.
      if (u.rating >= SEQUENCE_PASS_STARS) {
        await admin.from('student_tasks').update({ status: 'done', done_at: new Date().toISOString(), done_reason: 'reached_4' })
          .eq('student_id', studentId).eq('step_id', u.step_id).eq('status', 'open');
      }
    }

    return { ok: true, sessionId: session.id, nextFocus, sequenceRating: seqRating };
  } catch (e) {
    console.error('[lets-play] saveSequenceSession failed', e);
    return { ok: false, error: 'Could not save the session.' };
  }
}


// ═══ EL PLAN SE GUARDA ANTES DEL AGUA (Marcelo 2026-09-10) ═══
// "La persona lo más seguro va a entrar al agua, va a cerrar el app y luego
// va a tener que entrar otra vez para cerrar la sesión." El plan nace como
// una sesión 'planned'; el Home la muestra hasta que se evalúa (→ 'done') o
// se descarta.

export type PlanSequenceSessionInput = {
  sequenceId: string;
  belt: string;
  mode: TrainingMode;
  focusStepId?: string | null;
  focus_moment?: string | null;
  side?: 'fs' | 'bs' | null;
  intention_text?: string;
  measure: 'time' | 'reps' | 'waves' | 'time_reps';
  planned_duration_minutes?: number | null;
  planned_reps?: number | null;
  /** "Conditions fit my level and my expectations are right." */
  conditions_ok: boolean;
};

export type OpenSession = {
  id: string;
  sequenceId: string;
  sequenceLabel: string;
  sequenceName: string;
  mode: TrainingMode;
  focusStepId: string | null;
  focusTitle: string | null;
  focusMoment: string | null;
  intention: string | null;
  side: 'fs' | 'bs' | null;
  measure: 'time' | 'reps' | 'waves' | 'time_reps' | null;
  plannedDuration: number | null;
  plannedReps: number | null;
  plannedAt: string;
  ageHours: number;
};

export async function planSequenceSession(
  portalToken: string,
  input: PlanSequenceSessionInput
): Promise<{ ok: true; sessionId: string } | { ok: false; error: string }> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return { ok: false, error: 'Not authenticated.' };
    if (!(await studentCanTrack(studentId))) return { ok: false, error: TRACKING_LOCKED_MESSAGE };
    if (input.mode !== 'sequence_run' && input.mode !== 'step_focus') return { ok: false, error: 'Invalid mode.' };
    if (!input.conditions_ok) return { ok: false, error: 'Confirm the conditions fit your level first.' };
    if (!['time', 'reps', 'waves', 'time_reps'].includes(input.measure)) return { ok: false, error: 'Pick how you will measure the session.' };
    const wantsTime = input.measure === 'time' || input.measure === 'time_reps';
    const wantsReps = input.measure !== 'time';
    const duration = wantsTime ? input.planned_duration_minutes : null;
    const reps = wantsReps ? input.planned_reps : null;
    if (wantsTime && !inRange(duration, 1, 600)) return { ok: false, error: 'Pick a time.' };
    if (wantsReps && !inRange(reps, 1, 500)) return { ok: false, error: 'Pick a number of runs or waves.' };

    const safeBelt = await allowedBeltFor(studentId, input.belt);
    const { seq } = await loadSequence(portalToken, input.sequenceId, safeBelt);
    if (!seq) return { ok: false, error: 'Sequence not available yet.' };
    const isRun = input.mode === 'sequence_run';
    const focus = !isRun ? seq.items.find((i) => i.step_id === input.focusStepId) ?? null : null;
    if (!isRun && !focus) return { ok: false, error: 'Focus step not in this sequence.' };
    const kind = sequenceSide(seq.id);
    let side: 'fs' | 'bs' | null = null;
    if (kind === 'fs' || kind === 'bs') side = kind;
    else if (kind === 'both') {
      if (input.side !== 'fs' && input.side !== 'bs') return { ok: false, error: 'Pick the side you will surf: frontside or backside.' };
      side = input.side;
    }
    const clip = (v: string | undefined | null, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null);
    const admin = createAdminClient();
    // Un solo plan abierto a la vez: el anterior sin cerrar se descarta.
    await admin.from('self_training_sessions').update({ status: 'discarded' }).eq('student_id', studentId).eq('status', 'planned');
    const seqLabel = sequenceLabel(seq.id, seq.order, seq.name);
    const { data, error } = await admin
      .from('self_training_sessions')
      .insert({
        student_id: studentId,
        kind: 'drill',
        status: 'planned',
        completed: false,
        training_mode: input.mode,
        linked_sequence_id: seq.id,
        linked_step_id: focus?.step_id ?? null,
        linked_drill_mission_id: focus?.mission?.id ?? null,
        side,
        drill_name: `${isRun ? seqLabel : `${focus!.step_title} · ${seqLabel}`}${kind === 'both' && side ? ` · ${SIDE_WORD[side]}` : ''}`,
        session_date: new Date().toISOString().slice(0, 10),
        intention_text: clip(input.intention_text, 300),
        focus_moment: clip(input.focus_moment, 80),
        measure: input.measure,
        // planned_duration_minutes es NOT NULL histórico: sin tiempo elegido va 0.
        planned_duration_minutes: duration ?? 0,
        planned_reps: reps ?? 0,
        safety_check: true,
        planned_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error || !data) {
      console.error('[lets-play] plan failed', error);
      return { ok: false, error: 'Could not save your plan.' };
    }
    return { ok: true, sessionId: data.id };
  } catch (e) {
    console.error('[lets-play] planSequenceSession failed', e);
    return { ok: false, error: 'Could not save your plan.' };
  }
}

export async function getOpenSession(portalToken: string): Promise<OpenSession | null> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return null;
    const admin = createAdminClient();
    const { data: r } = await admin
      .from('self_training_sessions')
      .select('id, linked_sequence_id, training_mode, linked_step_id, focus_moment, intention_text, side, measure, planned_duration_minutes, planned_reps, planned_at, created_at, drill_name')
      .eq('student_id', studentId)
      .eq('status', 'planned')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!r || !r.linked_sequence_id) return null;
    let focusTitle: string | null = null;
    if (r.linked_step_id) {
      const { data: l } = await admin.from('lessons').select('title').eq('id', r.linked_step_id).maybeSingle();
      focusTitle = l?.title ?? null;
    }
    const plannedAt = r.planned_at ?? r.created_at;
    const label = String(r.drill_name ?? '');
    return {
      id: r.id,
      sequenceId: r.linked_sequence_id,
      sequenceLabel: label.includes(' · ') && r.linked_step_id ? label.split(' · ').slice(1, 2).join(' · ') : label.split(' · ').slice(0, 2).join(' · '),
      sequenceName: label,
      mode: (r.training_mode === 'step_focus' ? 'step_focus' : 'sequence_run') as TrainingMode,
      focusStepId: r.linked_step_id ?? null,
      focusTitle,
      focusMoment: r.focus_moment ?? null,
      intention: r.intention_text ?? null,
      side: r.side === 'fs' || r.side === 'bs' ? r.side : null,
      measure: r.measure ?? null,
      plannedDuration: r.planned_duration_minutes || null,
      plannedReps: r.planned_reps || null,
      plannedAt,
      ageHours: Math.round((Date.now() - new Date(plannedAt).getTime()) / 36e5),
    };
  } catch {
    return null;
  }
}

export async function discardSession(portalToken: string, sessionId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return { ok: false, error: 'Not authenticated.' };
    const admin = createAdminClient();
    const { error } = await admin
      .from('self_training_sessions')
      .update({ status: 'discarded' })
      .eq('id', sessionId)
      .eq('student_id', studentId)
      .eq('status', 'planned');
    if (error) return { ok: false, error: 'Could not discard the session.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not discard the session.' };
  }
}


// ═══ TAREAS PROPIAS (Marcelo 2026-09-10) ═══
// "Que pueda ir acumulando detalles que sé que tengo que trabajar… pero
// siempre con la opción de trabajar en lo que yo quiera." Paso + detalle,
// máximo tres abiertas, se cierran solas al llegar a 4★ en el agua.

export const MAX_OPEN_TASKS = 3;

export type StudentTask = {
  id: string;
  sequenceId: string;
  sequenceLabel: string;
  stepId: string;
  stepTitle: string;
  detail: string | null;
  source: 'self' | 'system';
  createdAt: string;
};

export async function getTasks(portalToken: string): Promise<StudentTask[]> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return [];
    const admin = createAdminClient();
    const { data: rows } = await admin
      .from('student_tasks')
      .select('id, sequence_id, step_id, detail, source, created_at')
      .eq('student_id', studentId)
      .eq('status', 'open')
      .order('created_at', { ascending: true })
      .limit(MAX_OPEN_TASKS);
    if (!rows?.length) return [];
    const stepIds = Array.from(new Set(rows.map((r: any) => r.step_id)));
    const seqIds = Array.from(new Set(rows.map((r: any) => r.sequence_id)));
    const [{ data: lessons }, { data: seqs }] = await Promise.all([
      admin.from('lessons').select('id, title').in('id', stepIds),
      admin.from('lessons').select('wb_sequence_id, wb_sequence_name, wb_sequence_order').in('wb_sequence_id', seqIds),
    ]);
    const title = new Map((lessons ?? []).map((l: any) => [l.id, l.title]));
    const seqMeta = new Map<string, { name: string; order: number | null }>();
    for (const l of (seqs ?? []) as any[]) if (l.wb_sequence_id && !seqMeta.has(l.wb_sequence_id)) seqMeta.set(l.wb_sequence_id, { name: l.wb_sequence_name ?? l.wb_sequence_id, order: l.wb_sequence_order ?? null });
    return rows.map((r: any) => {
      const m = seqMeta.get(r.sequence_id);
      return {
        id: r.id, sequenceId: r.sequence_id,
        sequenceLabel: m ? sequenceLabel(r.sequence_id, m.order, m.name) : r.sequence_id,
        stepId: r.step_id, stepTitle: title.get(r.step_id) ?? r.step_id,
        detail: r.detail ?? null, source: r.source, createdAt: r.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function addTask(
  portalToken: string,
  input: { sequenceId: string; stepId: string; detail?: string | null; belt: string }
): Promise<{ ok: true; task: StudentTask; openCount: number } | { ok: false; error: string }> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return { ok: false, error: 'Not authenticated.' };
    const safeBelt = await allowedBeltFor(studentId, input.belt);
    const { seq } = await loadSequence(portalToken, input.sequenceId, safeBelt);
    if (!seq) return { ok: false, error: 'Sequence not available yet.' };
    const step = seq.items.find((i) => i.step_id === input.stepId);
    if (!step) return { ok: false, error: 'Step not in this sequence.' };
    const detail = typeof input.detail === 'string' && input.detail.trim() ? input.detail.trim().slice(0, 120) : null;
    const admin = createAdminClient();
    const { data: open } = await admin.from('student_tasks').select('id, step_id, detail').eq('student_id', studentId).eq('status', 'open');
    const dup = (open ?? []).find((t: any) => t.step_id === input.stepId && (t.detail ?? null) === detail);
    if (dup) return { ok: false, error: 'That one is already on your list.' };
    if ((open ?? []).length >= MAX_OPEN_TASKS) return { ok: false, error: `Your list is full (${MAX_OPEN_TASKS}). Finish or drop one first.` };
    const { data: row, error } = await admin.from('student_tasks').insert({
      student_id: studentId, sequence_id: seq.id, step_id: input.stepId, detail, source: 'self',
    }).select('id, created_at').single();
    if (error || !row) return { ok: false, error: 'Could not save your task.' };
    return {
      ok: true,
      openCount: (open ?? []).length + 1,
      task: { id: row.id, sequenceId: seq.id, sequenceLabel: sequenceLabel(seq.id, seq.order, seq.name), stepId: input.stepId, stepTitle: step.step_title, detail, source: 'self', createdAt: row.created_at },
    };
  } catch {
    return { ok: false, error: 'Could not save your task.' };
  }
}

export async function closeTask(portalToken: string, taskId: string, how: 'marked_done' | 'dropped'): Promise<{ ok: boolean; error?: string }> {
  try {
    const studentId = await studentIdFromPortalToken(portalToken);
    if (!studentId) return { ok: false, error: 'Not authenticated.' };
    const admin = createAdminClient();
    const { error } = await admin.from('student_tasks')
      .update({ status: how === 'dropped' ? 'dropped' : 'done', done_at: new Date().toISOString(), done_reason: how })
      .eq('id', taskId).eq('student_id', studentId).eq('status', 'open');
    if (error) return { ok: false, error: 'Could not update your task.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not update your task.' };
  }
}
