'use client';

// ═══ Cierre en una línea (Marcelo 2026-09-20) ═══
// Por alumno y por secuencia del día:
//   1. "Vos planeaste": la secuencia, tal cual el plan.
//   2. La estrella.
//   3. Si fue 1–3★: ¿dónde se rompió? (opcional, un toque en el paso).
// Y la línea de MAÑANA aparece sola: 1–3★ repite la secuencia (con el paso),
// 4–5★ sigue lo que la plantilla ya tiene para mañana. Cerrar el día es
// confirmar esa línea; cambiarla es un toque. "Se trabajó otra cosa" cambia
// la secuencia que se califica (queda planeado · trabajado en la bitácora).
// Lo que se SACÓ del cierre (confundía): aguantó / se rompió, momentos,
// criterios de la misión, foco 0–3, flow, estado a mano, "mandar a otra
// secuencia" y los botones "mañana igual / avanzar".

import { useState, type ReactNode } from 'react';
import { StarRating } from '@/components/sequence/StarRating';
import { SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';
import { sequenceElements, isElementOf } from '@/lib/sequence-pages/circles-seq';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import { resolveSequenceForSteps } from '@/lib/sequence-pages/resolve';
import type { ServicePlanBlock, ServicePlanStudent } from '@/lib/actions/service-planner';

const STAR_LABEL: Record<number, string> = {
  1: "Can't do it yet",
  2: 'Trying, not consistent',
  3: 'Sometimes',
  4: 'Consistent · the sequence is theirs',
  5: 'Clean every time',
};

const FLOW = [
  { n: 1, color: '#3B82F6', label: 'Bored' },
  { n: 2, color: '#06B6D4', label: 'Easy' },
  { n: 3, color: '#10B981', label: 'Optimal' },
  { n: 4, color: '#F59E0B', label: 'Hard' },
  { n: 5, color: '#EF4444', label: 'Frustrated' },
] as const;

export const seqTag = (c: SequencePageConfig) => (c.eyebrow ? c.title : `#${c.number} ${c.title}`);
const seqTitle = (c: SequencePageConfig) => (c.eyebrow ? c.title : `Sequence #${c.number} · ${c.title}`);

export type DaySequence = {
  /** La secuencia que se califica: la trabajada si el coach la cambió, si no la planeada. */
  cfg: SequencePageConfig;
  plannedCfg: SequencePageConfig;
  order: number;
  focusStepId: string | null;
  focusTitle: string | null;
  /** Misiones del día (hasta 3 elementos, en orden), si el plan las tiene. */
  focusMoments: string[];
};

/** Las secuencias que ESTE alumno trabajó hoy (bloques de agua), en orden. */
export function daySequencesOf(
  student: ServicePlanStudent,
  stpLabel: (id: string | null) => string | null,
): DaySequence[] {
  const out: DaySequence[] = [];
  const blocks = [...student.blocks].sort((a, b) => a.order_index - b.order_index);
  for (const b of blocks) {
    const landOnly = !!(b.land_drill_id || b.land_drill_custom) && !b.water_drill_id && !b.water_drill_custom && b.order_index !== 0;
    if (landOnly) continue;
    if (b.sequence_id === 'THREE-CIRCLES') continue;
    const plannedCfg = (b.sequence_id && SEQUENCE_PAGES[b.sequence_id]) || resolveSequenceForSteps({ stepIds: b.step_ids, stepId: b.step_id }, student.belt_level ?? null);
    if (!plannedCfg) continue;
    const workedCfg = (b.worked_sequence_id && SEQUENCE_PAGES[b.worked_sequence_id]) || null;
    const cfg = workedCfg ?? plannedCfg;
    const seen = out.find((x) => x.plannedCfg.id === plannedCfg.id);
    const ft = !workedCfg && b.focus_step_id ? elementTitle(plannedCfg, b.focus_step_id, stpLabel(b.focus_step_id)) : null;
    if (seen) {
      // Dos bloques del mismo círculo (Posture y Rotation): los focos se suman en el rótulo.
      // Si el primero ya se cambió por otra secuencia, los focos planeados no aplican.
      if (seen.cfg.id !== seen.plannedCfg.id) continue;
      if (b.focus_step_id && !seen.focusStepId) { seen.focusStepId = b.focus_step_id; seen.focusTitle = ft; }
      else if (ft && seen.focusTitle && !seen.focusTitle.includes(ft)) seen.focusTitle = `${seen.focusTitle} · ${ft}`;
      continue;
    }
    const fm = !workedCfg && Array.isArray(b.focus_moments) ? (b.focus_moments as string[]).filter((id) => isElementOf(plannedCfg, id)).slice(0, 3) : [];
    out.push({ cfg, plannedCfg, order: b.order_index, focusStepId: workedCfg ? null : (b.focus_step_id ?? null), focusTitle: ft, focusMoments: fm });
  }
  return out;
}

/** La siguiente secuencia de la misma cinta ("Move on"). */
export function nextSequenceAfter(cfg: SequencePageConfig): SequencePageConfig | null {
  return Object.values(SEQUENCE_PAGES)
    .filter((n) => n.belt === cfg.belt && !n.eyebrow && n.number > cfg.number)
    .sort((a, b) => a.number - b.number)[0] ?? null;
}

/** Lo que la plantilla ya tiene para mañana, para este alumno. null = no hay mañana. */
export type TomorrowPlan = { day_number: number; planned: { sequence_id: string | null; focus_step_id: string | null; focus_moments?: string[] | null } | null; /** mañana tiene bloques aunque ninguno sea secuencia (examen, teoría) */ hasBlocks?: boolean } | null;

export type TomorrowLine = { seqId: string; stepId: string | null; why: 'repeats' | 'plan' | 'moves' | 'keep' | 'you'; /** misiones (hasta 3, en orden) */ moments?: string[] | null };

/**
 * La regla (Marcelo 2026-09-20): con todas las secuencias del día calificadas,
 * la más floja con 1–3★ se repite mañana (con el paso donde se rompió, o el
 * foco planeado); si todo fue 4–5★, sigue lo que la plantilla ya tiene para
 * mañana; sin plantilla, la siguiente de la cinta. Sin calificar → sin línea.
 */
export function deriveTomorrow(args: {
  seqs: DaySequence[];
  starOf: (s: DaySequence) => number | null;
  brokenOf: (s: DaySequence) => string | null;
  tomorrow: TomorrowPlan;
  isLastDay: boolean;
}): TomorrowLine | null {
  const { seqs, starOf, brokenOf, tomorrow, isLastDay } = args;
  if (seqs.length === 0) return null;
  const rated = seqs.map((s) => ({ s, star: starOf(s) }));
  if (rated.some((x) => !x.star)) return null;
  const weak = rated
    .filter((x) => (x.star ?? 0) <= 3)
    .sort((a, b) => (a.star! - b.star!) || (b.s.order - a.s.order))[0];
  if (weak) {
    const plannedFocus = weak.s.focusStepId && isElementOf(weak.s.cfg, weak.s.focusStepId) ? weak.s.focusStepId : null;
    const broke = brokenOf(weak.s);
    const moments = broke ? [broke] : weak.s.focusMoments.length ? weak.s.focusMoments : plannedFocus ? [plannedFocus] : null;
    return { seqId: weak.s.cfg.id, stepId: broke ?? plannedFocus, why: 'repeats', moments };
  }
  const plannedId = tomorrow?.planned?.sequence_id ?? null;
  if (!isLastDay && plannedId && SEQUENCE_PAGES[plannedId]) {
    const pm = (tomorrow?.planned?.focus_moments ?? []).filter((id) => isElementOf(SEQUENCE_PAGES[plannedId], id)).slice(0, 3);
    return { seqId: plannedId, stepId: pm[0] ?? tomorrow?.planned?.focus_step_id ?? null, why: 'plan', moments: pm.length ? pm : null };
  }
  const last = seqs[seqs.length - 1];
  // Mañana está planeado pero sin secuencia (examen, teoría): se sigue con la de hoy.
  if (!isLastDay && tomorrow?.hasBlocks) return { seqId: last.cfg.id, stepId: null, why: 'keep' };
  const next = nextSequenceAfter(last.cfg);
  if (next) return { seqId: next.id, stepId: null, why: 'moves' };
  return { seqId: last.cfg.id, stepId: null, why: 'keep' };
}

const BELT_ORDER = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt'];
// La frase libre del coach va después de " – " (guion corto): el largo " — "
// aparece en títulos de pasos ("Bottom Turn Medium — Frontside").
const NOTE_SEP = ' – ';

export function DayCloseCard({
  student,
  isClosed,
  isLastDay,
  stpLabel,
  avatar,
  profile,
  onCommit,
  onRateSequence,
  tomorrow = null,
  campBelt = null,
  token,
}: {
  /** Para el puente: del veredicto al material para enseñarlo. */
  token: string;
  student: ServicePlanStudent;
  isClosed: boolean;
  isLastDay: boolean;
  stpLabel: (id: string | null) => string | null;
  avatar: ReactNode;
  profile: ReactNode;
  onCommit: (orderIndex: number, patch: Partial<ServicePlanBlock>) => void;
  /** rating null = borrar la estrella de hoy de esa secuencia ("se trabajó otra cosa"). */
  onRateSequence: (sequenceId: string, rating: number | null) => void;
  tomorrow?: TomorrowPlan;
  /** Cinta del camp: el selector de "Change" llega hasta ella (+1), no solo hasta la del alumno. */
  campBelt?: string | null;
}) {
  const blocks = student.blocks;
  const gen = (blocks.find((b) => b.order_index === 0) ?? blocks[0] ?? null) as ServicePlanBlock | null;
  const genOrder = gen?.order_index ?? 0;
  const seqs = daySequencesOf(student, stpLabel);
  const [showProfile, setShowProfile] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeSeq, setChangeSeq] = useState<string>('');

  const cur = gen?.whats_next ?? '';
  const sepIdx = cur.indexOf(NOTE_SEP);
  const main = (sepIdx >= 0 ? cur.slice(0, sepIdx) : cur).trim();
  const note = (sepIdx >= 0 ? cur.slice(sepIdx + NOTE_SEP.length) : '').trim();
  const [noteDraft, setNoteDraft] = useState(note);
  const savedSeqId = gen?.next_focus_sequence_id ?? null;
  const savedStepId = gen?.next_focus_step_id ?? null;
  const savedMoments: string[] = Array.isArray(gen?.next_focus_moments) ? (gen!.next_focus_moments as string[]) : [];

  const blockOf = (order: number) => blocks.find((b) => b.order_index === order) ?? null;
  const starOf = (s: DaySequence) => blockOf(s.order)?.coach_sequence_rating ?? null;
  // Paso donde se rompió, por secuencia (local); el de la línea se guarda en
  // next_focus_step_id. Se siembra solo si la línea guardada era un "repeats"
  // (1–3★ en esa secuencia): el foco que trae la plantilla no es un paso roto.
  const [broken, setBroken] = useState<Record<string, string | null>>(() => {
    if (!savedSeqId || !savedStepId) return {};
    if (savedMoments.length > 1) return {}; // una lista de misiones no es un paso roto
    const s = seqs.find((x) => x.cfg.id === savedSeqId);
    const st = s ? starOf(s) : null;
    return s && st !== null && st <= 3 ? { [savedSeqId]: savedStepId } : {};
  });
  // "Change" a mano: la regla deja de sobrescribir la línea hasta "Reset to automatic".
  const [manual, setManual] = useState(false);
  const stepsOf = (cfg: SequencePageConfig) => sequenceElements(cfg, (id) => stpLabel(id));
  const stepTitleOf = (cfg: SequencePageConfig, id: string) => elementTitle(cfg, id, stpLabel(id)) ?? id;

  const derive = (o: { star?: [number, number]; broken?: Record<string, string | null> } = {}) =>
    deriveTomorrow({
      seqs,
      starOf: (s) => (o.star && o.star[0] === s.order ? o.star[1] : starOf(s)),
      brokenOf: (s) => (o.broken ?? broken)[s.cfg.id] ?? null,
      tomorrow,
      isLastDay,
    });

  /** La línea como texto ("#10 Snap Frontside · Bottom Turn Medium — Frontside") + campos estructurados. */
  const linePatch = (l: TomorrowLine | null, noteText: string = noteDraft): Partial<ServicePlanBlock> => {
    const n = noteText.trim();
    if (!l || !SEQUENCE_PAGES[l.seqId]) return { whats_next: n || null, next_focus_sequence_id: null, next_focus_step_id: null, next_focus_moments: null } as any;
    const cfg = SEQUENCE_PAGES[l.seqId];
    const ms = (l.moments ?? []).filter((id) => isElementOf(cfg, id)).slice(0, 3);
    const stepId = ms[0] ?? l.stepId;
    const text = ms.length > 1
      ? `${seqTag(cfg)} · ${ms.map((id) => stepTitleOf(cfg, id)).join(' · ')}`
      : `${seqTag(cfg)}${stepId ? ` · ${stepTitleOf(cfg, stepId)}` : ''}`;
    return { whats_next: [text, n].filter(Boolean).join(NOTE_SEP), next_focus_sequence_id: l.seqId, next_focus_step_id: stepId, next_focus_moments: ms.length ? ms : null } as any;
  };

  // La línea que se muestra: lo guardado en el bloque (fuente de verdad).
  const derived = derive();
  const sameMoments = (a: string[] | null | undefined, b: string[] | null | undefined) => (a ?? []).join('|') === (b ?? []).join('|');
  const line: TomorrowLine | null = savedSeqId && SEQUENCE_PAGES[savedSeqId]
    ? { seqId: savedSeqId, stepId: savedStepId, moments: savedMoments.length ? savedMoments : null, why: derived && derived.seqId === savedSeqId && (derived.stepId ?? null) === (savedStepId ?? null) && sameMoments(derived.moments, savedMoments) ? derived.why : 'you' }
    : null;
  const isManual = manual || line?.why === 'you';

  // Estado del día = la peor estrella del día (la misma regla que la línea).
  // Sin todas las estrellas no hay estado: así Finalize pide la que falta.
  const statusOf = (worst: number | null) => (worst === null ? null : worst >= 4 ? 'achieved' : worst >= 2 ? 'partial' : 'not_yet');
  const worstStar = (o?: [number, number]) => {
    const stars = seqs.map((s) => (o && o[0] === s.order ? o[1] : starOf(s)));
    if (stars.some((x) => !x)) return null;
    return Math.min(...(stars as number[]));
  };

  const rate = (s: DaySequence, n: number) => {
    const nb = n >= 4 ? { ...broken, [s.cfg.id]: null } : broken;
    if (n >= 4) setBroken(nb);
    const worst = worstStar([s.order, n]);
    const genPatch: Partial<ServicePlanBlock> = { day_objective_status: statusOf(worst), ...(isManual ? {} : linePatch(derive({ star: [s.order, n], broken: nb }))) } as any;
    if (s.order === genOrder) onCommit(genOrder, { coach_sequence_rating: n, ...genPatch } as any);
    else { onCommit(s.order, { coach_sequence_rating: n } as any); onCommit(genOrder, genPatch); }
    onRateSequence(s.cfg.id, n);
  };

  const pickBroken = (s: DaySequence, stepId: string) => {
    const nb = { ...broken, [s.cfg.id]: broken[s.cfg.id] === stepId ? null : stepId };
    setBroken(nb);
    if (!isManual) onCommit(genOrder, linePatch(derive({ broken: nb })));
  };

  // "Se trabajó otra cosa": cambia la secuencia que se califica; la estrella
  // vuelve a cero, también la oficial que ya viajó a los pasos de la anterior.
  const setWorked = (s: DaySequence, seqId: string | null) => {
    setBroken((b) => ({ ...b, [s.cfg.id]: null }));
    setManual(false);
    if (starOf(s) !== null) onRateSequence(s.cfg.id, null);
    const reset: Partial<ServicePlanBlock> = { worked_sequence_id: seqId, coach_sequence_rating: null } as any;
    const genPatch: Partial<ServicePlanBlock> = { day_objective_status: null, ...linePatch(null) } as any;
    if (s.order === genOrder) onCommit(genOrder, { ...reset, ...genPatch });
    else { onCommit(s.order, reset); onCommit(genOrder, genPatch); }
  };

  const setByHand = (seqId: string, moments: string[]) => {
    setManual(true);
    onCommit(genOrder, linePatch({ seqId, stepId: moments[0] ?? null, moments: moments.length ? moments : null, why: 'you' }));
  };
  // Hasta tres partes, en el orden en que se tocan; tocar una elegida la saca.
  const toggleMission = (seqId: string, id: string) => {
    const cur = line?.seqId === seqId ? (line.moments ?? (line.stepId ? [line.stepId] : [])) : [];
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 3 ? cur : [...cur, id];
    setByHand(seqId, next);
  };
  const resetAuto = () => {
    setManual(false);
    setChangeOpen(false);
    setChangeSeq('');
    onCommit(genOrder, linePatch(derive()));
  };

  const lineCfg = line ? SEQUENCE_PAGES[line.seqId] : null;
  const lineMoments = line && lineCfg ? (line.moments ?? []).filter((id) => isElementOf(lineCfg, id)) : [];
  const lineText = line && lineCfg
    ? (lineMoments.length > 1 ? `${seqTag(lineCfg)} · ${lineMoments.map((id, i) => `${i + 1} ${stepTitleOf(lineCfg, id)}`).join(' · ')}` : `${seqTag(lineCfg)}${line.stepId ? ` · ${stepTitleOf(lineCfg, line.stepId)}` : ''}`)
    : (main || null);
  const allRated = seqs.length > 0 && seqs.every((s) => !!starOf(s));
  const WHY: Record<TomorrowLine['why'], string> = {
    repeats: 'Repeats · under 4★, not theirs yet',
    plan: 'From the plan · 4★ and up',
    moves: 'Moves on · 4★ and up, next in the belt',
    keep: '4★ and up · keep it sharp',
    you: 'Set by you',
  };

  const myBelt = Math.max(BELT_ORDER.indexOf(String(student.belt_level ?? 'white_belt')), BELT_ORDER.indexOf(String(campBelt ?? '')));
  const pickable = Object.values(SEQUENCE_PAGES)
    .filter((c) => c.id !== 'THREE-CIRCLES' && BELT_ORDER.indexOf(c.belt) <= Math.max(myBelt, 0) + 1)
    .sort((a, b) => BELT_ORDER.indexOf(a.belt) - BELT_ORDER.indexOf(b.belt) || (a.kind === 'entry' ? -1 : 0) - (b.kind === 'entry' ? -1 : 0) || a.number - b.number);
  const changeCfg = changeSeq ? SEQUENCE_PAGES[changeSeq] ?? null : null;

  return (
    <div className="bg-[#E9E2D2] rounded-[8px] border border-[#DCD7C6] p-3.5 space-y-3">
      <div className="flex items-center gap-2 min-w-0">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-extrabold text-[#10263B] truncate leading-tight" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>{student.display_name}</p>
          <p className="text-[12px] text-[#55666E] capitalize mt-0.5">{student.belt_level?.replace(/_/g, ' ')}</p>
        </div>
        <button type="button" onClick={() => setShowProfile((v) => !v)} aria-pressed={showProfile} className="shrink-0 w-10 h-10 rounded-full border border-[#DCD7C6] bg-white text-[#55666E] text-[16px]" title="Profile & bitácora">📋</button>
      </div>
      {showProfile && profile}

      {seqs.map((s) => {
        const v = starOf(s);
        const worked = s.cfg.id !== s.plannedCfg.id;
        const steps = stepsOf(s.cfg);
        const brokenId = broken[s.cfg.id] ?? null;
        return (
          <div key={s.plannedCfg.id} className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] p-3">
            {/* 1 · Vos planeaste (o: se trabajó otra cosa) */}
            <p className="text-[11px] font-mono uppercase tracking-[0.14em]" style={{ color: '#00A8CC' }}>{worked ? 'Worked instead' : 'You planned'}</p>
            <p className="text-[19px] font-extrabold text-[#10263B] leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>{seqTitle(s.cfg)}</p>
            <p className="text-[15px] text-[#10263B] mt-1 leading-snug">
              {worked ? `Planned: ${seqTag(s.plannedCfg)}` : s.focusMoments.length > 1 ? `Missions: ${s.focusMoments.map((id, i) => `${i + 1} ${stepTitleOf(s.cfg, id)}`).join(' · ')}` : s.focusTitle ? `Focus: ${s.focusTitle}` : 'The whole line, start to finish'}
            </p>

            {/* 2 · Estrella */}
            <div className="mt-2.5">
              <StarRating value={v} size="lg" variant="official" readOnly={isClosed} onChange={(n) => rate(s, n)} />
            </div>
            <p className="text-[15px] mt-1.5 leading-snug" style={{ color: v ? '#10263B' : '#55666E' }}>{v ? `${v}★ · ${STAR_LABEL[v]}` : 'Tap a star. 4★ = the sequence is theirs.'}</p>

            {/* 3 · Solo con 1–3★: ¿dónde se rompió? Un toque, opcional. */}
            {v !== null && v <= 3 && (
              <div className="mt-2.5">
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#55666E]">Where did it break? · optional · tap the step</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[...steps].sort((a, b) => { const ia = s.focusMoments.indexOf(a.id); const ib = s.focusMoments.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); }).map((st) => {
                    const i = steps.findIndex((x) => x.id === st.id);
                    const on = brokenId === st.id;
                    return (
                      <button key={st.id} type="button" aria-pressed={on} disabled={isClosed} onClick={() => pickBroken(s, st.id)}
                        className="px-3 py-2 min-h-[40px] rounded-full text-[13px] font-semibold border disabled:opacity-70 text-left"
                        style={on ? { background: '#E0413B', borderColor: '#E0413B', color: '#fff' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
                        {i + 1} · {st.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Se trabajó otra cosa: la misma línea, otra secuencia. */}
            {!isClosed && (
              <details className="mt-2">
                <summary className="text-[13px] text-[#55666E] cursor-pointer py-1">{worked ? 'Back to what was planned' : 'Worked something else'}</summary>
                <select value={worked ? s.cfg.id : ''} onChange={(e) => setWorked(s, e.target.value || null)} className="mt-1.5 w-full px-2.5 py-2.5 border border-[#DCD7C6] rounded-lg text-[14px] bg-white">
                  <option value="">{seqTag(s.plannedCfg)} · as planned</option>
                  {pickable.filter((c) => c.id !== s.plannedCfg.id).map((c) => <option key={c.id} value={c.id}>{seqTag(c)} · {c.belt.replace('_belt', '')}</option>)}
                </select>
              </details>
            )}
          </div>
        );
      })}

      {/* + otra secuencia que también trabajaron hoy (Marcelo 2026-09-21): un bloque más, con su estrella. */}
      {!isClosed && (
        <details className="px-1">
          <summary className="text-[13px] text-[#55666E] cursor-pointer py-1">+ another sequence they also worked today</summary>
          <select value="" onChange={(e) => {
              const c = SEQUENCE_PAGES[e.target.value]; if (!c) return;
              const nextOrder = Math.max(0, ...blocks.map((b) => b.order_index)) + 1;
              const games = (c as any).games as Record<string, string> | undefined;
              onCommit(nextOrder, { sequence_id: c.id, worked_sequence_id: null, step_id: c.stepIds[0], step_ids: c.stepIds, focus_step_id: null, focus_moments: null, objective_text: `Whole line · ${seqTag(c)}`, water_drill_id: games ? (games[c.stepIds[0]] ?? null) : null, notes_pre: 'Added at the close.' } as any);
            }} className="mt-1.5 w-full px-2.5 py-2.5 border border-[#DCD7C6] rounded-lg text-[14px] bg-white">
            <option value="">— pick the sequence —</option>
            {pickable.filter((c) => !seqs.some((s) => s.cfg.id === c.id || s.plannedCfg.id === c.id)).map((c) => <option key={c.id} value={c.id}>{seqTag(c)} · {c.belt.replace('_belt', '')}</option>)}
          </select>
        </details>
      )}

      {/* Sin secuencias (clase suelta): el estado del día a mano. */}
      {seqs.length === 0 && (
        <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] p-2.5 space-y-1.5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#55666E]">Did they meet today&apos;s objective?</p>
          <StatusButtons value={gen?.day_objective_status ?? null} disabled={isClosed} onPick={(v) => onCommit(genOrder, { day_objective_status: v } as any)} />
        </div>
      )}

      {/* MAÑANA: la línea aparece sola. Confirmar es registrar; cambiar es un toque. */}
      <div className="rounded-[5px] px-3.5 py-3" style={{ background: '#061C2B' }}>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em]" style={{ color: '#00D2FF' }}>
          {isLastDay ? "What's next · the final evaluation" : `Next training session${tomorrow?.day_number ? ` · day ${tomorrow.day_number}` : ''}`}
          {isClosed && !lineText ? ' · not set' : ''}
        </p>
        {lineText ? (
          <>
            {lineMoments.length > 1 && lineCfg ? (
              <>
                <p className="text-[21px] font-extrabold mt-1.5 leading-tight" style={{ color: '#F7F9FA', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>{seqTag(lineCfg)}</p>
                <ol className="mt-1 space-y-0.5">
                  {lineMoments.map((id, i) => (
                    <li key={id} className="text-[15px] leading-snug" style={{ color: '#F7F9FA' }}><span className="font-mono text-[12px] mr-1.5" style={{ color: '#00D2FF' }}>M{i + 1}</span>{stepTitleOf(lineCfg, id)}</li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-[21px] font-extrabold mt-1.5 leading-tight" style={{ color: '#F7F9FA', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>{lineText}</p>
            )}
            {line && <p className="text-[13px] mt-1.5" style={{ color: '#7DE3FF' }}>{WHY[line.why]} · the student sees this in their portal</p>}
            {/* El puente (Marcelo 2026-09-24): del veredicto al material.
                Lleva el momento que se rompió para abrir ahí. */}
            {line?.seqId && (
              <a href={`/coach-portal/${token}/teach/${line.seqId}${lineMoments[0] ? `?focus=${encodeURIComponent(lineMoments[0])}&from=${encodeURIComponent('the close')}` : ''}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold mt-2 no-underline" style={{ color: '#00D2FF' }}>
                How to teach this →
              </a>
            )}
          </>
        ) : (
          <p className="text-[15px] mt-1.5" style={{ color: 'rgba(247,249,250,.7)' }}>
            {seqs.length === 0 ? 'Write it below, in your words.' : allRated ? 'Set it below.' : 'Tap a star above. The line fills in by itself.'}
          </p>
        )}
        {!isClosed && seqs.length > 0 && (
          <div className="flex gap-3 mt-1.5">
            <button type="button" onClick={() => setChangeOpen((o) => !o)} aria-expanded={changeOpen} className="text-[13px] underline py-1" style={{ color: '#7DE3FF' }}>
              {changeOpen ? 'Close' : 'Change'}
            </button>
            {isManual && line && (
              <button type="button" onClick={resetAuto} className="text-[13px] underline py-1" style={{ color: 'rgba(247,249,250,.7)' }}>
                Reset to automatic
              </button>
            )}
          </div>
        )}
        {changeOpen && !isClosed && (
          <div className="mt-1.5 space-y-1.5">
            <select value={changeSeq} onChange={(e) => { setChangeSeq(e.target.value); if (e.target.value) setByHand(e.target.value, []); }} className="w-full px-2.5 py-2.5 rounded-[4px] text-[14px] bg-[#0E2A40] text-[#F7F9FA] border border-[#1E3A52]">
              <option value="">— pick a sequence —</option>
              {pickable.map((c) => <option key={c.id} value={c.id}>{seqTag(c)} · {c.belt.replace('_belt', '')}</option>)}
            </select>
            {changeCfg && (
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => setByHand(changeCfg.id, [])} aria-pressed={line?.seqId === changeCfg.id && !line?.stepId}
                  className="px-3 py-2 min-h-[40px] rounded-full text-[13px] font-semibold border"
                  style={line?.seqId === changeCfg.id && !line?.stepId ? { background: '#00D2FF', borderColor: '#00D2FF', color: '#061C2B' } : { background: 'transparent', borderColor: '#1E3A52', color: '#F7F9FA' }}>
                  Whole line
                </button>
                {stepsOf(changeCfg).map((st, i) => {
                  const chosen = line?.seqId === changeCfg.id ? (line.moments ?? (line.stepId ? [line.stepId] : [])) : [];
                  const pos = chosen.indexOf(st.id);
                  const on = pos >= 0;
                  return (
                    <button key={st.id} type="button" onClick={() => toggleMission(changeCfg.id, st.id)} aria-pressed={on}
                      className="px-3 py-2 min-h-[40px] rounded-full text-[13px] font-semibold border"
                      style={on ? { background: '#00D2FF', borderColor: '#00D2FF', color: '#061C2B' } : { background: 'transparent', borderColor: '#1E3A52', color: '#F7F9FA' }}>
                      {on && chosen.length > 1 ? `M${pos + 1} · ` : `${i + 1} · `}{st.title}
                    </button>
                  );
                })}
                <p className="basis-full text-[12px]" style={{ color: 'rgba(247,249,250,.6)' }}>Tap up to three parts, in order: they become the missions of the next session.</p>
              </div>
            )}
          </div>
        )}
        <input
          type="text"
          defaultValue={seqs.length === 0 ? cur : note}
          disabled={isClosed && !!lineText}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={(e) => {
            const nn = e.target.value;
            setNoteDraft(nn);
            if (seqs.length === 0) onCommit(genOrder, { whats_next: nn.trim() || null } as any);
            else if (line) onCommit(genOrder, linePatch(line, nn));
            else onCommit(genOrder, { whats_next: [main, nn.trim()].filter(Boolean).join(NOTE_SEP) || null } as any);
          }}
          placeholder={seqs.length === 0 ? 'What to work on next' : 'Note for the student (optional)'}
          className="mt-2.5 w-full px-2.5 py-2.5 rounded-[4px] text-[14px] bg-[#0E2A40] text-[#F7F9FA] placeholder:text-[#7C8C94] border border-[#1E3A52] disabled:opacity-60"
        />
      </div>

      {/* FLOW · el termómetro del día (Marcelo 2026-09-21): una fila, opcional,
          por alumno. Viaja a la sesión del alumno como coach_flow. */}
      <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] px-2.5 py-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#55666E] mb-1.5">Flow today · optional · was the demand right?</p>
        <div className="grid grid-cols-5 gap-1">
          {FLOW.map((opt) => {
            const on = gen?.flow_channel === opt.n;
            return (
              <button key={opt.n} type="button" disabled={isClosed} aria-pressed={on} onClick={() => onCommit(genOrder, { flow_channel: on ? null : opt.n } as any)}
                className="py-2.5 min-h-[40px] rounded-[5px] text-[12px] font-bold border disabled:opacity-70"
                style={on ? { background: opt.color, borderColor: opt.color, color: '#fff' } : { background: '#fff', borderColor: '#DCD7C6', color: '#55666E' }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plegado: nota interna (no la ve el alumno). */}
      <details className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] px-2.5 py-2">
        <summary className="text-[13px] text-[#55666E] cursor-pointer py-1">Internal note{gen?.notes_post ? ' · written' : ''}</summary>
        <div className="mt-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#55666E] mb-1.5">🔒 Not sent to the student</p>
          <textarea
            defaultValue={gen?.notes_post ?? ''}
            disabled={isClosed}
            onBlur={(e) => onCommit(genOrder, { notes_post: e.target.value })}
            rows={2}
            placeholder="e.g. Struggles on the skate, repeat on land"
            className="w-full px-2.5 py-2.5 border border-[#DCD7C6] rounded-lg text-[14px] bg-white disabled:opacity-70"
          />
        </div>
      </details>
    </div>
  );
}

function StatusButtons({ value, disabled, onPick }: { value: string | null; disabled: boolean; onPick: (v: 'achieved' | 'partial' | 'not_yet') => void }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {([
        { v: 'achieved', label: 'Achieved', bg: '#D1FAE5', fg: '#047857' },
        { v: 'partial', label: 'Partial', bg: '#FEF3C7', fg: '#92400E' },
        { v: 'not_yet', label: 'Not yet', bg: '#FEE2E2', fg: '#991B1B' },
      ] as const).map((opt) => (
        <button key={opt.v} type="button" disabled={disabled} onClick={() => onPick(opt.v)}
          className="py-2.5 min-h-[40px] rounded-lg text-[13px] font-bold disabled:opacity-70"
          style={value === opt.v ? { background: opt.bg, color: opt.fg, boxShadow: 'inset 0 0 0 2px ' + opt.fg } : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
