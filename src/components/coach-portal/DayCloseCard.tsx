'use client';

// ═══ Cierre del día · video análisis (Marcelo 2026-09-18) ═══
// La pantalla de cierre por alumno, sin buscar nada: las secuencias del día
// ya están puestas. Dos toques por secuencia: la estrella y el momento donde
// se rompió. El próximo foco sale de ese toque (texto + secuencia + paso).
// El video no es obligatorio; si el coach lo tiene adelante, mejor.
// Reemplaza la tarjeta anterior (28 chips por alumno, página de 5.300 px —
// hallazgo de la prueba de punta a punta).

import { useState, type ReactNode } from 'react';
import { StarRating } from '@/components/sequence/StarRating';
import { SEQUENCE_PAGES } from '@/lib/sequence-pages';
import type { Command, SequencePageConfig } from '@/lib/sequence-pages/types';
import { momentsByStep } from '@/lib/sequence-pages/moments';
import { resolveSequenceForSteps } from '@/lib/sequence-pages/resolve';
import type { ServicePlanBlock, ServicePlanStudent } from '@/lib/actions/service-planner';

const CMD_COLOR: Record<Command, string> = {
  posture: '#E0413B',
  rail: '#F2C230',
  projection: '#2FA36B',
  maneuver: '#3B82F6',
  closure: '#9CA3AF',
};

const STAR_LABEL: Record<number, string> = {
  1: "Can't do it yet",
  2: 'Trying, not consistent',
  3: 'Sometimes',
  4: 'Consistent · the sequence is theirs',
  5: 'Clean every time',
};

export const seqTag = (c: SequencePageConfig) => (c.eyebrow ? c.title : `#${c.number} ${c.title}`);

export type DaySequence = { cfg: SequencePageConfig; order: number; focusTitle: string | null };

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
    if (out.some((x) => x.cfg.id === cfg.id)) continue;
    out.push({ cfg, order: b.order_index, focusTitle: b.focus_step_id ? stpLabel(b.focus_step_id) : null });
  }
  return out;
}

type Chip = { key: string; label: string; text: string; stepId: string | null; command: Command | null; symptom?: string; fixes?: string[] };

function chipsFor(cfg: SequencePageConfig, stpLabel: (id: string | null) => string | null): Chip[] {
  const steps = cfg.stepIds.map((id) => ({ id, title: stpLabel(id) ?? id }));
  const ms = momentsByStep(cfg.id, steps);
  const tag = seqTag(cfg);
  const chips: Chip[] = [];
  for (const st of steps) {
    const mine = ms[st.id] ?? [];
    if (!mine.length) { chips.push({ key: st.id, label: st.title, text: `${tag} · ${st.title}`, stepId: st.id, command: null }); continue; }
    for (const m of mine) {
      chips.push({
        key: `${st.id}:${m.key}`,
        label: m.kind === 'feet' ? m.short : `${st.title} · ${m.short}`,
        text: `${tag} · ${st.title} · ${m.short}`,
        stepId: st.id,
        command: m.command,
        symptom: m.symptom,
        fixes: m.indicators.map((i) => i.fix).filter(Boolean),
      });
    }
  }
  chips.push({ key: `${cfg.id}:whole`, label: 'Whole sequence', text: `${tag} · run the whole sequence`, stepId: null, command: null });
  return chips;
}

/** La siguiente secuencia de la misma cinta ("Move on"). */
export function nextSequenceAfter(cfg: SequencePageConfig): SequencePageConfig | null {
  return Object.values(SEQUENCE_PAGES)
    .filter((n) => n.belt === cfg.belt && !n.eyebrow && n.number > cfg.number)
    .sort((a, b) => a.number - b.number)[0] ?? null;
}

const BELT_ORDER = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt'];

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
  const [extraSeqId, setExtraSeqId] = useState<string | null>(null);
  const [tomorrow, setTomorrow] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // El texto del próximo foco: la parte elegida (chip) y la frase libre después de " — ".
  const cur = gen?.whats_next ?? '';
  const [mainRaw, ...noteParts] = cur.split(' — ');
  const main = String(mainRaw ?? '').trim();
  const note = noteParts.join(' — ').trim();
  const [noteDraft, setNoteDraft] = useState(note);

  const allChips: Chip[] = [
    ...seqs.flatMap((s) => chipsFor(s.cfg, stpLabel)),
    ...(extraSeqId && SEQUENCE_PAGES[extraSeqId] ? chipsFor(SEQUENCE_PAGES[extraSeqId], stpLabel) : []),
  ];
  const selected = allChips.find((c) => c.text === main) ?? null;
  const chipIsKnown = !!selected;

  const writeFocus = (chip: Chip | null, seqId: string | null, nextNote = noteDraft) => {
    const text = chip ? chip.text : (chipIsKnown ? '' : main);
    const full = [text, nextNote.trim()].filter(Boolean).join(' — ');
    onCommit(genOrder, {
      whats_next: full || null,
      next_focus_sequence_id: chip ? seqId : null,
      next_focus_step_id: chip ? chip.stepId : null,
    } as any);
  };

  const starOf = (s: DaySequence) => (blocks.find((b) => b.order_index === s.order) as any)?.coach_sequence_rating ?? null;
  const rate = (s: DaySequence, n: number) => {
    const status = n >= 4 ? 'achieved' : n >= 2 ? 'partial' : 'not_yet';
    if (s.order === genOrder) onCommit(genOrder, { coach_sequence_rating: n, day_objective_status: status } as any);
    else { onCommit(s.order, { coach_sequence_rating: n } as any); onCommit(genOrder, { day_objective_status: status } as any); }
    onRateSequence(s.cfg.id, n);
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

  const ChipRow = ({ cfg }: { cfg: SequencePageConfig }) => (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chipsFor(cfg, stpLabel).map((c) => {
        const on = selected?.text === c.text;
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={on}
            disabled={isClosed}
            onClick={() => writeFocus(on ? null : c, cfg.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border disabled:opacity-70"
            style={on ? { background: '#E0A62B', borderColor: '#E0A62B', color: '#061C2B' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}
          >
            <i className="inline-block w-[7px] h-[7px] rounded-full" style={{ background: c.command ? CMD_COLOR[c.command] : '#9CA3AF' }} />
            {c.label}
          </button>
        );
      })}
    </div>
  );

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

  return (
    <div className="bg-[#E9E2D2] rounded-[8px] border border-[#DCD7C6] p-3 space-y-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {avatar}
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#10263B] truncate">{student.display_name}</p>
          <p className="text-[11px] text-[#55666E] capitalize">
            {student.belt_level?.replace(/_/g, ' ')}{seqs.length ? ` · today: ${seqs.map((s) => seqTag(s.cfg)).join(' · ')}` : ''}
          </p>
        </div>
      </div>

      {profile}

      {/* Una tarjeta por secuencia del día: estrella + dónde se rompió. */}
      {seqs.map((s) => {
        const v = starOf(s);
        return (
          <div key={s.cfg.id} className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] p-2.5">
            <p className="text-[14px] font-extrabold text-[#10263B] leading-tight">{s.cfg.eyebrow ? s.cfg.title : `Sequence #${s.cfg.number} · ${s.cfg.title}`}</p>
            <p className="text-[11px] text-[#55666E] mt-0.5">{s.focusTitle ? `Focus today: ${s.focusTitle}` : 'Whole sequence'}</p>
            <div className="mt-2">
              <StarRating value={v} size="lg" variant="official" readOnly={isClosed} onChange={(n) => rate(s, n)} />
            </div>
            <p className="text-[12px] text-[#55666E] mt-1">{v ? `${v}★ · ${STAR_LABEL[v]}` : 'Tap a star. 4★ = the sequence is theirs.'}</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] mt-2.5" style={{ color: '#00A8CC' }}>Where did it break? · tap one, or none</p>
            <ChipRow cfg={s.cfg} />
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

      {/* Detalle opcional del momento elegido: qué se ve y la instrucción. */}
      {selected && (selected.symptom || selected.fixes?.length) && (
        <details className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] px-2.5 py-2">
          <summary className="text-[12px] text-[#55666E] cursor-pointer">Details (optional) · {selected.label}</summary>
          {selected.symptom && <p className="text-[12px] text-[#10263B] mt-1.5"><span className="text-[#55666E]">What you see:</span> {selected.symptom}</p>}
          {selected.fixes?.map((f, i) => <p key={i} className="text-[12px] text-[#10263B] mt-1"><span className="text-[#55666E]">Cue:</span> {f}</p>)}
        </details>
      )}

      {/* Próximo foco: lo que el alumno ve esta noche. */}
      <div className="rounded-[5px] px-3 py-2.5" style={{ background: '#061C2B' }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.14em]" style={{ color: '#00D2FF' }}>
          Next focus · the student sees this tonight{isClosed && main.length < 5 ? ' · still pending' : ''}
        </p>
        <p className="text-[13px] font-semibold mt-1" style={{ color: '#F7F9FA' }}>{main || 'Tap a moment above, or write it below.'}</p>
        <input
          type="text"
          defaultValue={note}
          disabled={isClosed && main.length >= 5}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={(e) => { const nn = e.target.value; setNoteDraft(nn); const text = chipIsKnown ? selected!.text : main; const full = [text, nn.trim()].filter(Boolean).join(' — '); onCommit(genOrder, { whats_next: full || null } as any); }}
          placeholder={main ? 'Add a phrase in your words (optional)' : 'Or write the focus in your words'}
          className="mt-2 w-full px-2.5 py-1.5 rounded-[4px] text-[12px] bg-[#0E2A40] text-[#F7F9FA] placeholder:text-[#7C8C94] border border-[#1E3A52] disabled:opacity-60"
        />
        {!chipIsKnown && main.length >= 5 && !isClosed && (
          <button type="button" onClick={() => onCommit(genOrder, { whats_next: noteDraft.trim() || null, next_focus_sequence_id: null, next_focus_step_id: null } as any)} className="mt-1.5 text-[11px] underline" style={{ color: '#7DE3FF' }}>
            Clear the written focus
          </button>
        )}
      </div>

      {/* Mañana: repetir o avanzar. Solo cuando hay un mañana. */}
      {!isClosed && !isLastDay && seqs.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1.5">
            <button type="button" disabled={busy} onClick={() => carry(null, `Same sequence · ${seqTag(seqs[0].cfg)}`)}
              className="flex-1 py-2 rounded-[5px] text-[12px] font-bold border border-[#DCD7C6] bg-white text-[#10263B] disabled:opacity-60">
              Same sequence tomorrow
            </button>
            {moveOn && (
              <button type="button" disabled={busy} onClick={() => carry(moveOn.id, `Move on · ${seqTag(moveOn)}`)}
                className="flex-1 py-2 rounded-[5px] text-[12px] font-bold border border-[#DCD7C6] bg-white text-[#10263B] disabled:opacity-60">
                Move on to {seqTag(moveOn)}
              </button>
            )}
          </div>
          {tomorrow && <p className="text-[11px] text-[#2FA36B] font-semibold">✓ Tomorrow · {tomorrow}</p>}
        </div>
      )}

      {/* Lo de siempre, plegado: estado, foco, flow, nota interna. */}
      <details className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-[5px] px-2.5 py-2">
        <summary className="text-[12px] text-[#55666E] cursor-pointer">
          Focus · flow · internal note{gen?.day_objective_status ? ` · ${gen.day_objective_status.replace('_', ' ')}` : ''}
        </summary>
        <div className="space-y-3 mt-2">
          {seqs.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1">Objective of the day (set by the star, change if needed)</p>
              <StatusButtons />
            </div>
          )}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1">Focus level — how present were they today?</p>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" disabled={isClosed} onClick={() => onCommit(genOrder, { focus_level: n })}
                  className="py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-70"
                  style={gen?.focus_level === n ? { background: '#10263B', color: 'white' } : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1">Flow channel — was the demand right today?</p>
            <div className="grid grid-cols-5 gap-1">
              {([
                { n: 1, color: '#3B82F6', label: 'Bored' },
                { n: 2, color: '#06B6D4', label: 'Easy' },
                { n: 3, color: '#10B981', label: 'Optimal' },
                { n: 4, color: '#F59E0B', label: 'Hard' },
                { n: 5, color: '#EF4444', label: 'Frustrated' },
              ] as const).map((opt) => (
                <button key={opt.n} type="button" disabled={isClosed} onClick={() => onCommit(genOrder, { flow_channel: opt.n })}
                  className="py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-70"
                  style={gen?.flow_channel === opt.n ? { background: opt.color, color: 'white' } : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
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
          {extraSeqId && SEQUENCE_PAGES[extraSeqId] && <ChipRow cfg={SEQUENCE_PAGES[extraSeqId]} />}
        </details>
      )}
    </div>
  );
}
