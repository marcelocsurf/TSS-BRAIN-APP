'use client';

// ═══ Cierre del día · video análisis (Marcelo 2026-09-18 / 2026-09-19) ═══
// Una sola lógica por alumno y por secuencia del día:
//   1. "Vos planeaste": la secuencia y el foco, tal cual el plan.
//   2. La estrella de la secuencia.
//   3. ¿Aguantó el foco? (o ¿salió limpia la línea?) Sí / No.
//   4. Si no: el PASO donde se rompió, en la lista numerada (la misma que ve
//      el alumno), y opcional el momento de ese paso.
// Eso es el próximo foco (texto + secuencia + paso). Un solo foco por alumno,
// siempre con el nombre de la secuencia adelante. Foco 0–3 (misma escala que
// el alumno), flow y nota quedan plegados. El video no es obligatorio.

import { useState, type ReactNode } from 'react';
import { StarRating } from '@/components/sequence/StarRating';
import { SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import { momentsByStep } from '@/lib/sequence-pages/moments';
import { resolveSequenceForSteps } from '@/lib/sequence-pages/resolve';
import type { ServicePlanBlock, ServicePlanStudent } from '@/lib/actions/service-planner';

const STAR_LABEL: Record<number, string> = {
  1: "Can't do it yet",
  2: 'Trying, not consistent',
  3: 'Sometimes',
  4: 'Consistent · the sequence is theirs',
  5: 'Clean every time',
};
// Misma escala y mismas palabras que la autoevaluación del alumno (Let's Play, HP).
const FOCUS_WORDS = ['Distracted', 'Some', 'Mostly', 'Locked in'];
const FLOW = [
  { n: 1, color: '#3B82F6', label: 'Bored' },
  { n: 2, color: '#06B6D4', label: 'Easy' },
  { n: 3, color: '#10B981', label: 'Optimal' },
  { n: 4, color: '#F59E0B', label: 'Hard' },
  { n: 5, color: '#EF4444', label: 'Frustrated' },
] as const;

export const seqTag = (c: SequencePageConfig) => (c.eyebrow ? c.title : `#${c.number} ${c.title}`);
const seqTitle = (c: SequencePageConfig) => (c.eyebrow ? c.title : `Sequence #${c.number} · ${c.title}`);

export type DaySequence = { cfg: SequencePageConfig; order: number; focusStepId: string | null; focusTitle: string | null };

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
    const cfg = (b.sequence_id && SEQUENCE_PAGES[b.sequence_id]) || resolveSequenceForSteps({ stepIds: b.step_ids, stepId: b.step_id }, student.belt_level ?? null);
    if (!cfg) continue;
    const seen = out.find((x) => x.cfg.id === cfg.id);
    const ft = b.focus_step_id ? elementTitle(cfg, b.focus_step_id, stpLabel(b.focus_step_id)) : null;
    if (seen) {
      // Dos bloques del mismo círculo (Posture y Rotation): los focos se suman en el rótulo.
      if (b.focus_step_id && !seen.focusStepId) { seen.focusStepId = b.focus_step_id; seen.focusTitle = ft; }
      else if (ft && seen.focusTitle && !seen.focusTitle.includes(ft)) seen.focusTitle = `${seen.focusTitle} · ${ft}`;
      continue;
    }
    out.push({ cfg, order: b.order_index, focusStepId: b.focus_step_id ?? null, focusTitle: ft });
  }
  return out;
}

/** La siguiente secuencia de la misma cinta ("Move on"). */
export function nextSequenceAfter(cfg: SequencePageConfig): SequencePageConfig | null {
  return Object.values(SEQUENCE_PAGES)
    .filter((n) => n.belt === cfg.belt && !n.eyebrow && n.number > cfg.number)
    .sort((a, b) => a.number - b.number)[0] ?? null;
}

const BELT_ORDER = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt'];

type Verdict = 'held' | 'broke' | null;

// Los momentos de un paso solo se preguntan cuando agregan algo: dos o más
// distintos, o uno que no sea el mismo nombre del paso ("Cobra Pick Line" →
// "Cobra, pick the line" no aporta; Marcelo 2026-09-19).
const normWords = (t: string) => t.toLowerCase().replace(/\b(the|a|an|of|to|your|and)\b/g, '').replace(/[^a-z0-9]/g, '');
function momentsAddInfo(moments: { short: string }[], stepTitle: string): boolean {
  const distinct = Array.from(new Set(moments.map((m) => normWords(m.short))));
  if (distinct.length >= 2) return true;
  if (distinct.length === 1) return distinct[0] !== normWords(stepTitle);
  return false;
}

export function DayCloseCard({
  student,
  isClosed,
  isLastDay,
  stpLabel,
  avatar,
  profile,
  onCommit,
  onRateSequence,
  onCarry,
}: {
  student: ServicePlanStudent;
  isClosed: boolean;
  isLastDay: boolean;
  stpLabel: (id: string | null) => string | null;
  avatar: ReactNode;
  profile: ReactNode;
  onCommit: (orderIndex: number, patch: Partial<ServicePlanBlock>) => void;
  onRateSequence: (sequenceId: string, rating: number) => void;
  onCarry: (sequenceId: string | null) => Promise<string | null>;
}) {
  const blocks = student.blocks;
  const gen = (blocks.find((b) => b.order_index === 0) ?? blocks[0] ?? null) as ServicePlanBlock | null;
  const genOrder = gen?.order_index ?? 0;
  const seqs = daySequencesOf(student, stpLabel);
  const [showProfile, setShowProfile] = useState(false);
  const [extraSeqId, setExtraSeqId] = useState<string | null>(null);
  const [tomorrow, setTomorrow] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // El próximo foco guardado: texto + secuencia + paso. La frase libre del
  // coach va después de " – " (guion corto): el largo " — " aparece en títulos
  // de pasos ("Bottom Turn Medium — Frontside") y partía el texto (bug 2026-09-19).
  const NOTE_SEP = ' – ';
  const cur = gen?.whats_next ?? '';
  const sepIdx = cur.indexOf(NOTE_SEP);
  const main = (sepIdx >= 0 ? cur.slice(0, sepIdx) : cur).trim();
  const note = (sepIdx >= 0 ? cur.slice(sepIdx + NOTE_SEP.length) : '').trim();
  const [noteDraft, setNoteDraft] = useState(note);
  const savedSeqId = (gen as any)?.next_focus_sequence_id ?? null;
  const savedStepId = (gen as any)?.next_focus_step_id ?? null;

  // Veredicto por secuencia: arranca de lo guardado (si el foco quedó en un
  // paso de esta secuencia → se rompió ahí).
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>(() => {
    const v: Record<string, Verdict> = {};
    for (const s of seqs) {
      if (savedSeqId === s.cfg.id && savedStepId) v[s.cfg.id] = 'broke';
      else if (savedSeqId === s.cfg.id && !savedStepId && /run the whole sequence|whole/i.test(main)) v[s.cfg.id] = 'held';
      else v[s.cfg.id] = null;
    }
    return v;
  });
  // Paso elegido (el que se rompió) para mostrar sus momentos.
  const [openStep, setOpenStep] = useState<string | null>(savedStepId);

  const writeFocus = (text: string | null, seqId: string | null, stepId: string | null) => {
    const full = [text ?? '', noteDraft.trim()].filter(Boolean).join(NOTE_SEP);
    onCommit(genOrder, { whats_next: full || null, next_focus_sequence_id: text ? seqId : null, next_focus_step_id: text ? stepId : null } as any);
  };

  const starOf = (s: DaySequence) => (blocks.find((b) => b.order_index === s.order) as any)?.coach_sequence_rating ?? null;
  const rate = (s: DaySequence, n: number) => {
    const status = n >= 4 ? 'achieved' : n >= 2 ? 'partial' : 'not_yet';
    if (s.order === genOrder) onCommit(genOrder, { coach_sequence_rating: n, day_objective_status: status } as any);
    else { onCommit(s.order, { coach_sequence_rating: n } as any); onCommit(genOrder, { day_objective_status: status } as any); }
    onRateSequence(s.cfg.id, n);
  };

  const stepsOf = (cfg: SequencePageConfig) => cfg.stepIds.map((id) => ({ id, title: elementTitle(cfg, id, stpLabel(id)) ?? id }));

  // "Aguantó": el foco sigue → próximo foco = el paso siguiente de la cadena
  // (o la línea completa si era el último / si el plan era la línea completa).
  const held = (s: DaySequence) => {
    setVerdicts((v) => ({ ...v, [s.cfg.id]: 'held' }));
    setOpenStep(null);
    const steps = stepsOf(s.cfg);
    const tag = seqTag(s.cfg);
    if (s.focusStepId) {
      const i = steps.findIndex((x) => x.id === s.focusStepId);
      const next = i >= 0 ? steps[i + 1] : null;
      if (next) { writeFocus(`${tag} · ${next.title}`, s.cfg.id, next.id); return; }
    }
    writeFocus(`${tag} · run the whole sequence`, s.cfg.id, null);
  };
  const broke = (s: DaySequence) => {
    setVerdicts((v) => ({ ...v, [s.cfg.id]: 'broke' }));
    // Si el plan tenía foco, lo más probable es que se rompió ahí: queda
    // preseleccionado y el coach lo cambia con un toque si fue otro paso.
    if (s.focusStepId) { setOpenStep(s.focusStepId); writeFocus(`${seqTag(s.cfg)} · ${s.focusTitle ?? s.focusStepId}`, s.cfg.id, s.focusStepId); }
    else setOpenStep(null);
  };
  const pickStep = (s: DaySequence, id: string, title: string) => {
    setOpenStep(id);
    writeFocus(`${seqTag(s.cfg)} · ${title}`, s.cfg.id, id);
  };
  const pickMoment = (s: DaySequence, stepId: string, stepTitle: string, short: string | null) => {
    writeFocus(short ? `${seqTag(s.cfg)} · ${stepTitle} · ${short}` : `${seqTag(s.cfg)} · ${stepTitle}`, s.cfg.id, stepId);
  };

  const lastSeq = seqs[seqs.length - 1] ?? null;
  const moveOn = lastSeq ? nextSequenceAfter(lastSeq.cfg) : null;
  const carry = async (seqId: string | null, label: string) => {
    setBusy(true);
    try { const r = await onCarry(seqId); if (r) setTomorrow(`${label} · ${r}`); } finally { setBusy(false); }
  };

  const myBelt = BELT_ORDER.indexOf(String(student.belt_level ?? 'white_belt'));
  const pickable = Object.values(SEQUENCE_PAGES)
    .filter((c) => BELT_ORDER.indexOf(c.belt) <= Math.max(myBelt, 0) + 1 && !seqs.some((s) => s.cfg.id === c.id))
    .sort((a, b) => BELT_ORDER.indexOf(a.belt) - BELT_ORDER.indexOf(b.belt) || (a.kind === 'entry' ? -1 : 0) - (b.kind === 'entry' ? -1 : 0) || a.number - b.number);

  const StatusButtons = () => (
    <div className="grid grid-cols-3 gap-1">
      {([
        { v: 'achieved', label: 'Achieved', bg: '#D1FAE5', fg: '#047857' },
        { v: 'partial', label: 'Partial', bg: '#FEF3C7', fg: '#92400E' },
        { v: 'not_yet', label: 'Not yet', bg: '#FEE2E2', fg: '#991B1B' },
      ] as const).map((opt) => (
        <button key={opt.v} type="button" disabled={isClosed} onClick={() => onCommit(genOrder, { day_objective_status: opt.v } as any)}
          className="py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-70"
          style={gen?.day_objective_status === opt.v ? { background: opt.bg, color: opt.fg, boxShadow: 'inset 0 0 0 2px ' + opt.fg } : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
          {opt.label}
        </button>
      ))}
    </div>
  );

  /** La secuencia como lista numerada (la misma que ve el alumno). */
  const StepList = ({ s, interactive }: { s: DaySequence; interactive: boolean }) => {
    const steps = stepsOf(s.cfg);
    const ms = momentsByStep(s.cfg.id, steps);
    return (
      <ol className="mt-2 space-y-1">
        {steps.map((st, i) => {
          const isFocus = st.id === s.focusStepId;
          const isBroken = interactive && openStep === st.id && savedSeqId === s.cfg.id && savedStepId === st.id;
          const mine = ms[st.id] ?? [];
          const row = (
            <span className="flex items-start gap-2 text-[13px] leading-snug w-full text-left" style={{ color: isBroken ? '#7A1F1A' : isFocus ? '#061C2B' : '#55666E' }}>
              <span className="shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center" style={isBroken ? { background: '#E0413B', color: '#fff' } : isFocus ? { background: '#FFD166', color: '#061C2B' } : { background: '#E9E2D2', color: '#55666E' }}>{i + 1}</span>
              <span className={isFocus || isBroken ? 'font-bold' : ''}>{st.title}{isFocus ? ' · planned focus' : ''}{isBroken ? ' · broke here' : ''}</span>
            </span>
          );
          return (
            <li key={st.id}>
              {interactive ? (
                <button type="button" disabled={isClosed} onClick={() => pickStep(s, st.id, st.title)} className="w-full rounded-[4px] px-1 py-0.5 disabled:opacity-70" style={isBroken ? { background: 'rgba(224,65,59,.10)' } : undefined}>{row}</button>
              ) : row}
              {interactive && isBroken && momentsAddInfo(mine, st.title) && (
                <div className="ml-7 mt-1 mb-1">
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#55666E]">Which moment of that step? · optional · sharpens the focus</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {mine.map((m) => {
                      const on = main === `${seqTag(s.cfg)} · ${st.title} · ${m.short}`;
                      return (
                        <button key={m.key} type="button" aria-pressed={on} disabled={isClosed} onClick={() => pickMoment(s, st.id, st.title, on ? null : m.short)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold border disabled:opacity-70"
                          style={on ? { background: '#E0A62B', borderColor: '#E0A62B', color: '#061C2B' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
                          {m.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    );
  };

  return (
    <div className="bg-[#E9E2D2] rounded-[8px] border border-[#DCD7C6] p-3 space-y-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#10263B] truncate">{student.display_name}</p>
          <p className="text-[11px] text-[#55666E] capitalize">{student.belt_level?.replace(/_/g, ' ')}</p>
        </div>
        <button type="button" onClick={() => setShowProfile((v) => !v)} aria-pressed={showProfile} className="shrink-0 w-9 h-9 rounded-full border border-[#DCD7C6] bg-white text-[#55666E] text-[14px]" title="Profile & bitácora">📋</button>
      </div>
      {showProfile && profile}

      {seqs.map((s) => {
        const v = starOf(s);
        const verdict = verdicts[s.cfg.id] ?? null;
        return (
          <div key={s.cfg.id} className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] p-2.5">
            {/* 1 · Vos planeaste */}
            <p className="text-[10px] font-mono uppercase tracking-[0.14em]" style={{ color: '#00A8CC' }}>You planned</p>
            <p className="text-[15px] font-extrabold text-[#10263B] leading-tight mt-0.5">{seqTitle(s.cfg)}</p>
            <p className="text-[12px] text-[#55666E] mt-0.5">{s.focusTitle ? `Focus: ${s.focusTitle}` : 'The whole line, start to finish'}</p>

            {/* 2 · Estrella */}
            <div className="mt-2.5">
              <StarRating value={v} size="lg" variant="official" readOnly={isClosed} onChange={(n) => rate(s, n)} />
            </div>
            <p className="text-[12px] text-[#55666E] mt-1">{v ? `${v}★ · ${STAR_LABEL[v]}` : 'Tap a star. 4★ = the sequence is theirs.'}</p>

            {/* 3 · ¿Aguantó? */}
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] mt-3" style={{ color: '#00A8CC' }}>{s.focusTitle ? 'Did the focus hold?' : 'Did the line come out clean?'}</p>
            <div className="flex gap-1.5 mt-1.5">
              <button type="button" disabled={isClosed} onClick={() => held(s)} aria-pressed={verdict === 'held'}
                className="flex-1 py-2 rounded-[5px] text-[12px] font-bold border disabled:opacity-70"
                style={verdict === 'held' ? { background: '#2FA36B', borderColor: '#2FA36B', color: '#fff' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
                {s.focusTitle ? '✓ Yes, it held' : '✓ Yes, clean'}
              </button>
              <button type="button" disabled={isClosed} onClick={() => broke(s)} aria-pressed={verdict === 'broke'}
                className="flex-1 py-2 rounded-[5px] text-[12px] font-bold border disabled:opacity-70"
                style={verdict === 'broke' ? { background: '#E0413B', borderColor: '#E0413B', color: '#fff' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
                {s.focusTitle ? '✗ No, it broke' : '✗ No, it broke somewhere'}
              </button>
            </div>

            {/* 4 · Dónde: la lista numerada de la secuencia */}
            {verdict === 'broke' && (
              <div className="mt-2.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#55666E]">Where did it break? · tap the step · it becomes the next focus</p>
                <StepList s={s} interactive />
              </div>
            )}
            {verdict === 'held' && (
              <p className="text-[12px] mt-2" style={{ color: '#2FA36B' }}>
                ✓ {s.focusTitle ? `${s.focusTitle} is theirs. Next focus moves one step along the line.` : 'The whole line is theirs.'}
              </p>
            )}
            {verdict === null && !isClosed && (
              <details className="mt-2">
                <summary className="text-[11px] text-[#55666E] cursor-pointer">See the steps of this sequence</summary>
                <StepList s={s} interactive={false} />
              </details>
            )}
          </div>
        );
      })}

      {/* Sin secuencias (clase suelta): el estado del día a mano. */}
      {seqs.length === 0 && (
        <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] p-2.5 space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E]">Did they meet today&apos;s objective?</p>
          <StatusButtons />
        </div>
      )}

      {/* Próximo foco: UNO por alumno, lo que ve esta noche. */}
      <div className="rounded-[5px] px-3 py-2.5" style={{ background: '#061C2B' }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.14em]" style={{ color: '#00D2FF' }}>
          Next focus · the student sees this tonight{isClosed && main.length < 5 ? ' · still pending' : ''}
        </p>
        <p className="text-[13px] font-semibold mt-1" style={{ color: '#F7F9FA' }}>{main || 'Answer above, or write it below.'}</p>
        <input
          type="text"
          defaultValue={note}
          disabled={isClosed && main.length >= 5}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={(e) => { const nn = e.target.value; setNoteDraft(nn); const full = [main, nn.trim()].filter(Boolean).join(NOTE_SEP); onCommit(genOrder, { whats_next: full || null } as any); }}
          placeholder={main ? 'Add a phrase in your words (optional)' : 'Or write the focus in your words'}
          className="mt-2 w-full px-2.5 py-1.5 rounded-[4px] text-[12px] bg-[#0E2A40] text-[#F7F9FA] placeholder:text-[#7C8C94] border border-[#1E3A52] disabled:opacity-60"
        />
        {main && !isClosed && (
          <button type="button" onClick={() => { setVerdicts({}); setOpenStep(null); onCommit(genOrder, { whats_next: noteDraft.trim() || null, next_focus_sequence_id: null, next_focus_step_id: null } as any); }} className="mt-1.5 text-[11px] underline" style={{ color: '#7DE3FF' }}>
            Clear
          </button>
        )}
      </div>

      {/* Mañana: repetir o avanzar. Solo cuando hay un mañana. */}
      {!isClosed && !isLastDay && seqs.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1.5">
            <button type="button" disabled={busy} onClick={() => carry(null, `Same sequence · ${seqTag(seqs[0].cfg)}`)}
              className="flex-1 py-2 rounded-[5px] text-[12px] font-bold border border-[#DCD7C6] bg-white text-[#10263B] disabled:opacity-60">
              Tomorrow · same ({seqTag(seqs[0].cfg)})
            </button>
            {moveOn && (
              <button type="button" disabled={busy} onClick={() => carry(moveOn.id, `Move on · ${seqTag(moveOn)}`)}
                className="flex-1 py-2 rounded-[5px] text-[12px] font-bold border border-[#DCD7C6] bg-white text-[#10263B] disabled:opacity-60">
                Tomorrow · move on to {seqTag(moveOn)}
              </button>
            )}
          </div>
          {tomorrow && <p className="text-[11px] text-[#2FA36B] font-semibold">✓ Tomorrow · {tomorrow}</p>}
        </div>
      )}

      {/* Plegado: enfoque 0–3 (misma escala que el alumno), flow, estado, nota. */}
      <details className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] px-2.5 py-2">
        <summary className="text-[12px] text-[#55666E] cursor-pointer">
          Focus · flow · internal note
          {gen?.focus_level !== null && gen?.focus_level !== undefined ? ` · focus ${FOCUS_WORDS[gen.focus_level] ?? gen.focus_level}` : ''}
          {gen?.flow_channel ? ` · ${FLOW[gen.flow_channel - 1]?.label ?? ''}` : ''}
        </summary>
        <div className="space-y-3 mt-2">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1">Focus — how present were they? (same scale the student uses)</p>
            <div className="grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((n) => (
                <button key={n} type="button" disabled={isClosed} onClick={() => onCommit(genOrder, { focus_level: n })}
                  className="py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-70"
                  style={gen?.focus_level === n ? { background: '#10263B', color: 'white' } : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
                  {FOCUS_WORDS[n]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1">Flow channel — was the demand right today?</p>
            <div className="grid grid-cols-5 gap-1">
              {FLOW.map((opt) => (
                <button key={opt.n} type="button" disabled={isClosed} onClick={() => onCommit(genOrder, { flow_channel: opt.n })}
                  className="py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-70"
                  style={gen?.flow_channel === opt.n ? { background: opt.color, color: 'white' } : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {seqs.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1">Objective of the day (set by the star, change if needed)</p>
              <StatusButtons />
            </div>
          )}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1">🔒 Internal note · not sent to the student</p>
            <textarea
              defaultValue={gen?.notes_post ?? ''}
              disabled={isClosed}
              onBlur={(e) => onCommit(genOrder, { notes_post: e.target.value })}
              rows={2}
              placeholder="e.g. Great pop-up, much steadier stance today"
              className="w-full px-2.5 py-2 border border-[#DCD7C6] rounded-lg text-[12px] bg-white disabled:opacity-70"
            />
          </div>
        </div>
      </details>

      {/* Otra secuencia: mandar al alumno a una que no entrenó hoy. */}
      {!isClosed && (
        <details className="px-1">
          <summary className="text-[11px] text-[#55666E] cursor-pointer">Send them to another sequence</summary>
          <select value={extraSeqId ?? ''} onChange={(e) => setExtraSeqId(e.target.value || null)} className="mt-1.5 w-full px-2 py-1.5 border border-[#DCD7C6] rounded-lg text-[11px] bg-white">
            <option value="">— pick a sequence —</option>
            {pickable.map((c) => <option key={c.id} value={c.id}>{seqTag(c)} · {c.belt.replace('_belt', '')}</option>)}
          </select>
          {extraSeqId && SEQUENCE_PAGES[extraSeqId] && (() => {
            const c = SEQUENCE_PAGES[extraSeqId];
            const steps = c.stepIds.map((id) => ({ id, title: stpLabel(id) ?? id }));
            return (
              <div className="mt-1.5">
                <button type="button" onClick={() => writeFocus(`${seqTag(c)} · run the whole sequence`, c.id, null)} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#DCD7C6] bg-white text-[#10263B] mr-1.5 mb-1.5">Whole line</button>
                {steps.map((st, i) => (
                  <button key={st.id} type="button" onClick={() => writeFocus(`${seqTag(c)} · ${st.title}`, c.id, st.id)} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#DCD7C6] bg-white text-[#10263B] mr-1.5 mb-1.5">{i + 1} · {st.title}</button>
                ))}
              </div>
            );
          })()}
        </details>
      )}
    </div>
  );
}
