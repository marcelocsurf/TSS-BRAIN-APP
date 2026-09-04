'use client';

// ═══ LET'S PLAY POR SECUENCIA — plan · go · evaluate ═══
// Marcelo (2026-09-04): la unidad de entreno es la SECUENCIA.
//   Run the whole sequence → una estrella para la cadena (obligatoria);
//     opcional: qué paso la detuvo; opcional: qué detalle de ese paso.
//   Work on one step → la misma cadena con un paso como foco; al cerrar se
//     evalúa ese paso (veredicto contra el plan + estrella + detalle
//     opcional) y, opcional, la cadena.
// Mismas tres pantallas que el flujo por pieza. Lo nuevo es la entrada.

import { useEffect, useState } from 'react';
import {
  getSequenceTraining,
  saveSequenceSession,
  type SequenceTraining,
  type SequenceTrainingStep,
  type TrainingMode,
  type NextFocus,
} from '@/lib/actions/lets-play';
import { getWeeklyPracticeCount, getLastPracticeHint, type CriterionResult } from '@/lib/actions/sequence';
import { SELF_TRAINING_WARMUPS } from '@/lib/constants/brand';
import { Target, Check, CircleDot, X, Flame, Dumbbell, Waves, Play, Clock, Repeat } from 'lucide-react';
import { sequenceLabel } from '@/lib/constants/learning-blocks';
import { StarRating } from './StarRating';
import { MarkdownContent } from '@/components/course/MarkdownContent';

type Phase = 'loading' | 'plan' | 'ready' | 'evaluation' | 'done' | 'error';

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };

const SAFETY_CHECKS = [
  { key: 'level', label: 'Conditions are appropriate and safe for my level' },
  { key: 'entry', label: 'I know where I get in and where I get out' },
  { key: 'lineup', label: 'I know where I will wait for the waves' },
  { key: 'hazards', label: 'I identified today’s hazards (rocks, currents, crowd)' },
] as const;
type SafetyKey = (typeof SAFETY_CHECKS)[number]['key'];

const CRIT_OPTS = [
  { key: 'met', label: 'Met', Icon: Check, bg: GREEN, fg: INK },
  { key: 'partial', label: 'Partial', Icon: CircleDot, bg: GOLD, fg: '#5b4300' },
  { key: 'not_met', label: 'Not met', Icon: X, bg: '#FF6B6B', fg: '#fff' },
] as const;

// Componentes FUERA del render: definidos adentro se remontan con cada
// cambio de estado (refs muertos, textarea que pierde el foco por tecla).
function Shell({ step, seqLabel, title, onCancel, children }: { step: 1 | 2 | 3; seqLabel: string; title: string; onCancel: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl p-3 sm:p-4" style={{ background: INK }}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[9px] truncate" style={{ ...F_M, color: 'rgba(247,249,250,.6)' }}>Let’s Play · {seqLabel}</p>
          <p className="text-[15px] truncate" style={{ ...F_D, color: PAPER }}>{title}</p>
        </div>
        <button type="button" onClick={onCancel} className="text-[11px] shrink-0 ml-3" style={{ color: 'rgba(247,249,250,.6)' }} aria-label="Cancel">Cancel</button>
      </div>
      <div className="flex gap-1">
        {(['Plan', 'Play', 'Evaluate'] as const).map((l, i) => (
          <div key={l} className="flex-1">
            <div className="h-1 rounded-full" style={{ background: i + 1 <= step ? CYAN : 'rgba(247,249,250,.15)' }} />
            <p className="text-[8px] mt-1" style={{ ...F_M, color: i + 1 === step ? CYAN : 'rgba(247,249,250,.4)' }}>{l}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-4 space-y-5">{children}</div>
    </div>
  );
}

function Chain({ steps, highlight = null }: { steps: SequenceTrainingStep[]; highlight?: string | null }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((s, i) => {
        const hot = highlight === s.step_id;
        return (
          <li key={s.step_id} className="flex items-start gap-2.5 rounded-xl px-3 py-2" style={hot ? { background: '#FFFBF0', boxShadow: 'inset 3px 0 0 #E0A62B' } : { background: '#f7f9fa' }}>
            <span className="text-[10px] font-bold w-4 shrink-0 mt-0.5" style={{ color: hot ? '#9A6A12' : '#9ca3af' }}>{i + 1}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight" style={{ color: INK }}>{s.title}{hot ? ' · today’s focus' : ''}</p>
              {s.key_words.length > 0 && <p className="text-[10px] text-gray-500 mt-0.5">{s.key_words.join(' · ')}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CriteriaGrid({ list, value, onPick }: { list: string[]; value: Record<number, CriterionResult>; onPick: (i: number, r: CriterionResult) => void }) {
  return (
    <div className="space-y-2">
      {list.map((text, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-2.5 bg-white">
          <p className="text-[12px] text-gray-800 mb-1.5 leading-snug"><span className="font-bold mr-1">{i + 1}.</span>{text}</p>
          <div className="grid grid-cols-3 gap-1">
            {CRIT_OPTS.map((o) => {
              const sel = value[i] === o.key;
              return (
                <button key={o.key} type="button" aria-pressed={sel} onClick={() => onPick(i, o.key)}
                  className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold"
                  style={sel ? { background: o.bg, color: o.fg } : { background: '#f3f4f6', color: '#6b7280' }}>
                  <o.Icon size={11} strokeWidth={2.25} />{o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function FlowPicker({ flow, onChange }: { flow: number | null; onChange: (n: number | null) => void }) {
  return (
    <div>
      <p className="text-[9px] text-gray-400 mb-1" style={F_M}>How did the challenge feel? (optional)</p>
      <div className="grid grid-cols-5 gap-1">
        {(['Bored', 'Easy', 'Flow', 'Hard', 'Too much'] as const).map((l, i) => {
          const n = i + 1; const sel = flow === n;
          return (
            <button key={l} type="button" aria-pressed={sel} onClick={() => onChange(sel ? null : n)}
              className="py-2 rounded-lg text-[10.5px] font-bold"
              style={sel ? { background: n === 3 ? GREEN : INK, color: n === 3 ? INK : PAPER } : { background: '#f3f4f6', color: '#6b7280' }}>{l}</button>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  portalToken: string;
  sequenceId: string;
  belt: string;
  mode: TrainingMode;
  focusStepId?: string | null;
  studentBelt?: string;
  onCancel: () => void;
  /** "Rehearse it on land first": abre el drill del paso en el flujo por pieza. */
  onRehearse: (drillId: string) => void;
  onDone: () => void;
}

export function SequenceTrainingFlow({ portalToken, sequenceId, belt, mode, focusStepId = null, studentBelt = 'white_belt', onCancel, onRehearse, onDone }: Props) {
  const isRun = mode === 'sequence_run';
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState<SequenceTraining | null>(null);
  const [focusId, setFocusId] = useState<string | null>(focusStepId);

  // Plan
  const [checks, setChecks] = useState<Record<SafetyKey, boolean>>({ level: false, entry: false, lineup: false, hazards: false });
  const [plannedDuration, setPlannedDuration] = useState(20);
  const [plannedReps, setPlannedReps] = useState(5);
  const [intention, setIntention] = useState('');
  const [hintText, setHintText] = useState<string | null>(null);
  // Ready
  const [warmUp, setWarmUp] = useState<string | null>(null);
  const [warmUpCustom, setWarmUpCustom] = useState('');
  // Evaluate · run
  const [seqStars, setSeqStars] = useState<number | null>(null);
  const [held, setHeld] = useState<Record<string, boolean>>({});
  const [stepStars, setStepStars] = useState<Record<string, number>>({});
  const [stepCrit, setStepCrit] = useState<Record<string, Record<number, CriterionResult>>>({});
  // Evaluate · focus
  const [outcome, setOutcome] = useState<'yes' | 'partial' | 'no' | null>(null);
  const [execStars, setExecStars] = useState<number | null>(null);
  const [focusCrit, setFocusCrit] = useState<Record<number, CriterionResult>>({});
  const [seqStarsOptional, setSeqStarsOptional] = useState<number | null>(null);
  // Común
  const [flow, setFlow] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ nextFocus: NextFocus; sequenceRating: number | null } | null>(null);
  const [weekCount, setWeekCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setPhase('loading');
    getSequenceTraining(portalToken, sequenceId, belt)
      .then((res) => {
        if (!mounted) return;
        if (!res.ok) { setErrorMsg(res.error); setPhase('error'); return; }
        setData(res.data);
        const f = focusStepId && res.data.steps.some((s) => s.step_id === focusStepId) ? focusStepId : res.data.suggestedFocusStepId;
        setFocusId(f);
        // Lo que quedó flojo la última vez ya es el objetivo de hoy.
        if (isRun) {
          const hb = res.data.seqRating?.held_back_step_id;
          const t = hb ? res.data.steps.find((s) => s.step_id === hb)?.title : null;
          if (t) { setHintText(`Last run, ${t} held the sequence back.`); setIntention((c) => c || `Keep ${t} clean through the whole run.`); }
        } else {
          const step = res.data.steps.find((s) => s.step_id === f);
          const runHint = f ? res.data.stepHints[f] : undefined;
          if (runHint) {
            // Lo que marcaste en tu último run de la secuencia.
            setHintText(`Your last run · ${runHint.result === 'not_met' ? 'not met' : 'partial'}: ${runHint.text}`);
            setIntention((c) => c || runHint.text);
          } else if (step?.mission) {
            getLastPracticeHint(portalToken, step.mission.id).then((h) => {
              if (!mounted || !h?.weakest) return;
              setHintText(`Your last practice · ${h.weakest.result === 'not_met' ? 'not met' : 'partial'}: ${h.weakest.text}`);
              setIntention((c) => c || h.weakest!.text);
            }).catch(() => {});
          }
        }
        setPhase('plan');
      })
      .catch(() => { if (mounted) { setErrorMsg('Could not load the sequence.'); setPhase('error'); } });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalToken, sequenceId, belt, mode]);

  if (phase === 'loading') {
    return (
      <div className="text-center py-16">
        <Target size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2" style={{ color: CYAN }} />
        <p className="text-gray-500 text-sm">Loading your sequence…</p>
      </div>
    );
  }
  if (phase === 'error' || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">{errorMsg || 'Something went wrong'}</p>
        <button onClick={onCancel} className="text-sm underline text-gray-600">← Back to My Sequence</button>
      </div>
    );
  }

  const seq = data.sequence;
  const steps = data.steps;
  const focus: SequenceTrainingStep | null = !isRun ? steps.find((s) => s.step_id === focusId) ?? null : null;
  // El mismo rótulo que ve en todos lados (y el que se guarda en drill_name):
  // "#3 · Pop-Up", o "Foundation · …" para las que no son escalones numerados.
  const seqLabel = sequenceLabel(seq.id, seq.order, seq.name);
  const allSafe = SAFETY_CHECKS.every((c) => checks[c.key]);
  const warmupOptions = SELF_TRAINING_WARMUPS[studentBelt] || SELF_TRAINING_WARMUPS['white_belt'];

  const shellTitle = isRun ? 'Run the whole sequence' : `Focus: ${focus?.title ?? '—'}`;

  // ─── PLAN ───
  if (phase === 'plan') {
    const canStart = allSafe && plannedDuration >= 1 && plannedReps >= 1 && (isRun || !!focus);
    return (
      <Shell step={1} seqLabel={seqLabel} title={shellTitle} onCancel={onCancel}>
        <div className="rounded-2xl p-4" style={{ background: INK }}>
          <p className="text-[9px]" style={{ ...F_M, color: CYAN }}>{isRun ? 'Today · the whole chain, in the water' : `Today · one step inside ${seqLabel}`}</p>
          <p className="text-[20px] mt-1.5" style={{ ...F_D, color: PAPER }}>{isRun ? seq.name : focus?.title}</p>
          {!isRun && focus && focus.key_words.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {focus.key_words.map((kw, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${CYAN}66`, color: CYAN }}>{kw}</span>
              ))}
            </div>
          )}
          {isRun && seq.promise && <p className="text-[12px] mt-2 leading-snug" style={{ color: 'rgba(247,249,250,.8)' }}>{seq.promise}</p>}
        </div>

        {isRun ? (
          <div>
            <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}>The chain · {steps.length} steps</p>
            <Chain steps={steps} />
          </div>
        ) : focus ? (
          <div className="space-y-3">
            {focus.mission ? (
              <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2">
                <p className="text-[9px] text-gray-400" style={F_M}><Waves size={11} className="inline mr-1 -mt-0.5" />Your mission for every run</p>
                <p className="text-[14px] font-semibold" style={{ color: INK }}>{focus.mission.title}</p>
                {focus.mission.description_md && (
                  <div className="text-[12.5px] text-gray-700 leading-relaxed">
                    <MarkdownContent markdown={focus.mission.description_md} />
                  </div>
                )}
                {focus.mission.success_criteria?.length > 0 && (
                  <div>
                    <p className="text-[9px] text-gray-400 mt-2 mb-1" style={F_M}>What success looks like</p>
                    <ol className="space-y-1">
                      {focus.mission.success_criteria.map((c, i) => (
                        <li key={i} className="text-[12.5px] text-gray-800 leading-snug"><span className="font-bold mr-1">{i + 1}.</span>{c}</li>
                      ))}
                    </ol>
                    <p className="mt-2 text-[10.5px]" style={{ color: '#0a7c5d', opacity: .8 }}>Your coach confirms it when you train together.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 p-3.5">
                <p className="text-[12.5px] text-gray-700">This step has no mission card yet. Run the sequence with <b>{focus.title}</b> as your focus and rate how it went.</p>
              </div>
            )}
            {focus.drill && (
              <button type="button" onClick={() => onRehearse(focus.drill!.id)}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] border-dashed border-gray-300 text-left active:scale-[0.99]">
                <Dumbbell size={16} strokeWidth={1.75} className="text-gray-500 shrink-0" />
                <span className="text-[12.5px] text-gray-700"><b>Rehearse it on land first</b> → {focus.drill.title}</span>
              </button>
            )}
            <div>
              <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}>Inside the chain</p>
              <Chain steps={steps} highlight={focus.step_id} />
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <p className="text-[9px] text-gray-400" style={F_M}>Safety check · every session</p>
          {SAFETY_CHECKS.map((c) => {
            const on = checks[c.key];
            return (
              <button key={c.key} type="button" aria-pressed={on} onClick={() => setChecks((p) => ({ ...p, [c.key]: !p[c.key] }))}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] text-left transition-colors active:scale-[0.99]"
                style={on ? { background: 'rgba(6,214,160,.12)', borderColor: GREEN } : { background: '#fff', borderColor: '#e5e7eb' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={on ? { background: GREEN } : { border: '1.5px solid #d1d5db' }}>
                  {on && <Check size={12} strokeWidth={3} style={{ color: INK }} />}
                </span>
                <span className="text-[12.5px] leading-snug" style={{ color: on ? INK : '#6b7280' }}>{c.label}</span>
              </button>
            );
          })}
          {!allSafe && <p className="text-[11px] text-gray-400 pt-1">Answer the 4 safety questions to continue.</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Clock size={11} className="inline mr-1 -mt-0.5" />Time on this</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[10, 20, 30, 45].map((m) => (
                <button key={m} type="button" aria-pressed={plannedDuration === m} onClick={() => setPlannedDuration(m)}
                  className="py-2 rounded-lg text-[12px] font-bold"
                  style={plannedDuration === m ? { background: INK, color: PAPER } : { background: '#f3f4f6', color: '#6b7280' }}>{m} min</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Repeat size={11} className="inline mr-1 -mt-0.5" />Runs target</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPlannedReps((r) => Math.max(1, r - 1))} className="w-10 h-10 rounded-lg bg-gray-100 text-lg font-bold" aria-label="Fewer runs">−</button>
              <span className="flex-1 text-center text-xl font-bold" style={{ color: INK }}>{plannedReps}</span>
              <button type="button" onClick={() => setPlannedReps((r) => Math.min(100, r + 1))} className="w-10 h-10 rounded-lg bg-gray-100 text-lg font-bold" aria-label="More runs">+</button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">One run = the whole sequence, start to finish.</p>
          </div>
        </div>

        <div>
          <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}>Specific objective (optional)</p>
          {hintText && <p className="text-[11px] mb-1.5 rounded-lg px-2.5 py-1.5" style={{ background: '#FFF8E7', color: '#9A6A12' }}>{hintText}</p>}
          <textarea value={intention} onChange={(e) => setIntention(e.target.value)} rows={2} aria-label="Specific objective (optional)"
            placeholder={isRun ? 'e.g. Keep the chain flowing — no stop between steps' : 'e.g. Weight on the front foot through the whole ride'}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px]" />
        </div>

        <button type="button" disabled={!canStart} onClick={() => setPhase('ready')}
          className="w-full h-12 rounded-xl text-[14px] font-bold disabled:opacity-40 active:scale-[0.99]"
          style={{ background: canStart ? CYAN : '#e5e7eb', color: INK, ...F_D }}>
          I’m ready →
        </button>
      </Shell>
    );
  }

  // ─── READY ───
  if (phase === 'ready') {
    return (
      <Shell step={2} seqLabel={seqLabel} title={shellTitle} onCancel={onCancel}>
        <div className="rounded-2xl p-5 text-center" style={{ background: INK }}>
          <p className="text-[9px]" style={{ ...F_M, color: CYAN }}>The Surf Sequence</p>
          <p className="text-[24px] mt-1" style={{ ...F_D, color: PAPER }}>Now go surf</p>
          <p className="text-[12px] mt-2" style={{ color: 'rgba(247,249,250,.75)' }}>
            {isRun ? 'Run the whole chain, start to finish, every time. When you are done, come back and evaluate.' : `Run the chain with ${focus?.title} as your focus. When you are done, come back and evaluate.`}
          </p>
          <div className="flex justify-center gap-6 mt-3">
            <div><p className="text-[9px]" style={{ ...F_M, color: 'rgba(247,249,250,.5)' }}>Planned</p><p className="text-lg font-bold" style={{ color: PAPER }}>{plannedDuration} min</p></div>
            <div><p className="text-[9px]" style={{ ...F_M, color: 'rgba(247,249,250,.5)' }}>Runs target</p><p className="text-lg font-bold" style={{ color: PAPER }}>{plannedReps}</p></div>
          </div>
        </div>

        {intention.trim() && (
          <div className="rounded-xl px-3.5 py-2.5" style={{ background: '#FFF8E7' }}>
            <p className="text-[9px]" style={{ ...F_M, color: '#9A6A12' }}>Today’s objective</p>
            <p className="text-[13px] text-gray-800">{intention}</p>
          </div>
        )}

        <div>
          <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}>The chain</p>
          <Chain steps={steps} highlight={focus?.step_id ?? null} />
        </div>

        <div>
          <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}>Warm-up · one tap</p>
          <div className="flex flex-wrap gap-1.5">
            {warmupOptions.map((w) => (
              <button key={w.value} type="button" onClick={() => setWarmUp(w.value)}
                className="px-3 py-2 rounded-full text-[11.5px] font-semibold"
                style={warmUp === w.value ? { background: GREEN, color: INK } : { background: '#fff', border: '1px solid #e5e7eb', color: '#374151' }}>
                {warmUp === w.value ? '✓ ' : ''}{w.label}
              </button>
            ))}
            <button type="button" onClick={() => setWarmUp('skip')}
              className="px-3 py-2 rounded-full text-[11.5px] font-semibold"
              style={warmUp === 'skip' ? { background: GREEN, color: INK } : { background: '#fff', border: '1px dashed #d1d5db', color: '#9ca3af' }}>
              {warmUp === 'skip' ? '✓ ' : ''}Already warm
            </button>
          </div>
          {warmUp === 'custom' && (
            <input
              value={warmUpCustom}
              onChange={(e) => setWarmUpCustom(e.target.value)}
              placeholder="Describe your warm-up…"
              aria-label="Custom warm-up"
              className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px]"
            />
          )}
        </div>

        <button type="button" onClick={() => setPhase('evaluation')}
          className="w-full h-12 rounded-xl text-[14px] font-bold active:scale-[0.99]" style={{ background: INK, color: PAPER, ...F_D }}>
          <Play size={14} className="inline mr-1.5 -mt-0.5" />I finished — evaluate now
        </button>
        <button type="button" onClick={() => setPhase('plan')} className="w-full text-[12px] text-gray-500 underline">← Back to plan</button>
      </Shell>
    );
  }

  // ─── EVALUATE ───
  if (phase === 'evaluation') {
    const canSave = isRun ? seqStars !== null && !saving : outcome !== null && execStars !== null && !saving;

    const handleSave = async () => {
      setSaving(true);
      setErrorMsg('');
      try {
        // Solo los pasos marcados llevan detalle: si lo destildó, su estrella y
        // sus criterios no viajan (el servidor también lo exige).
        const heldIds = steps.filter((s) => held[s.step_id]).map((s) => s.step_id);
        const heldSet = new Set(heldIds);
        const stepRatings = Object.fromEntries(Object.entries(stepStars).filter(([id]) => heldSet.has(id)));
        const stepCriteria: Record<string, { criterion_index: number; result: CriterionResult }[]> = {};
        for (const [sid, m] of Object.entries(stepCrit)) {
          if (!heldSet.has(sid)) continue;
          const list = Object.entries(m).map(([i, r]) => ({ criterion_index: Number(i), result: r }));
          if (list.length) stepCriteria[sid] = list;
        }
        const res = await saveSequenceSession(portalToken, {
          sequenceId: seq.id,
          belt,
          mode,
          focusStepId: focus?.step_id ?? null,
          intention_text: intention.trim() || undefined,
          planned_duration_minutes: plannedDuration,
          planned_reps: plannedReps,
          safety_check: allSafe,
          warm_up: warmUp === 'custom' ? (warmUpCustom.trim() || null) : warmUp && warmUp !== 'skip' ? warmUp : null,
          notes: notes.trim() || undefined,
          flow_channel: flow,
          sequence_rating: isRun ? seqStars : seqStarsOptional,
          held_back_step_ids: isRun ? heldIds : undefined,
          step_ratings: isRun ? stepRatings : undefined,
          step_criteria: isRun ? stepCriteria : undefined,
          mission_completion: !isRun ? outcome ?? undefined : undefined,
          execution_rating: !isRun ? execStars ?? undefined : undefined,
          criteria: !isRun ? Object.entries(focusCrit).map(([i, r]) => ({ criterion_index: Number(i), result: r })) : undefined,
        });
        if (!res.ok) { setErrorMsg(res.error); setSaving(false); return; }
        setResult({ nextFocus: res.nextFocus, sequenceRating: res.sequenceRating });
        getWeeklyPracticeCount(portalToken).then(setWeekCount).catch(() => {});
        setPhase('done');
      } catch {
        setErrorMsg('Could not save the session. Check your connection and try again.');
      } finally {
        setSaving(false);
      }
    };

    return (
      <Shell step={3} seqLabel={seqLabel} title={shellTitle} onCancel={onCancel}>
        {isRun ? (
          <>
            <div>
              <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Honest evaluation</p>
              <h3 className="text-[20px] mt-1" style={{ ...F_D, color: INK }}>How did the sequence run?</h3>
              <p className="text-[12.5px] text-gray-500 mt-1">One star for the whole chain. Honesty here is what makes you progress.</p>
              <div className="mt-2"><StarRating value={seqStars} onChange={setSeqStars} size="lg" showLabel /></div>
            </div>

            <div>
              <p className="text-[9px] text-gray-400 mb-1" style={F_M}>Which step held it back? (optional)</p>
              <p className="text-[11px] text-gray-500 mb-2">Tap the step. Rate it or mark a detail only if you want — the earliest one in the chain becomes your next focus.</p>
              <div className="space-y-1.5">
                {steps.map((s, i) => {
                  const on = !!held[s.step_id];
                  const crit = s.mission?.success_criteria ?? [];
                  return (
                    <div key={s.step_id} className="rounded-xl border" style={on ? { borderColor: '#E0A62B', background: '#FFFBF0' } : { borderColor: '#e5e7eb' }}>
                      <button type="button" aria-pressed={on}
                        onClick={() => {
                          const next = !on;
                          setHeld((h) => ({ ...h, [s.step_id]: next }));
                          if (!next) {
                            // Destildar borra su estrella y sus criterios: nada
                            // viejo viaja escondido en el guardado.
                            setStepStars((p) => { const n = { ...p }; delete n[s.step_id]; return n; });
                            setStepCrit((p) => { const n = { ...p }; delete n[s.step_id]; return n; });
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={on ? { background: '#E0A62B' } : { border: '1.5px solid #d1d5db' }}>
                          {on && <X size={12} strokeWidth={3} className="text-white" />}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-[13px] font-semibold flex-1 min-w-0 truncate" style={{ color: INK }}>{s.title}</span>
                        {on && <span className="text-[9px] shrink-0" style={{ ...F_M, color: '#9A6A12' }}>held it back</span>}
                      </button>
                      {on && (
                        <div className="px-3 pb-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-500">{s.title} today (optional)</span>
                            <StarRating value={stepStars[s.step_id] ?? null} onChange={(n) => setStepStars((p) => ({ ...p, [s.step_id]: n }))} size="sm" />
                          </div>
                          {crit.length > 0 && (
                            <div>
                              <p className="text-[9px] text-gray-400 mb-1" style={F_M}>Technique · which detail? (optional)</p>
                              <CriteriaGrid list={crit} value={stepCrit[s.step_id] ?? {}} onPick={(ci, r) => setStepCrit((p) => ({ ...p, [s.step_id]: { ...(p[s.step_id] ?? {}), [ci]: r } }))} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : focus ? (
          <>
            <div>
              <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Honest evaluation · {focus.title}</p>
              <h3 className="text-[20px] mt-1" style={{ ...F_D, color: INK }}>Did you do what you planned?</h3>
              <p className="text-[12.5px] text-gray-500 mt-1">{plannedReps} runs · {plannedDuration} min was the plan.</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: 'yes', label: 'Done', sub: 'What you planned', bg: GREEN, fg: INK },
                { key: 'partial', label: 'Partly', sub: 'Some of it', bg: GOLD, fg: '#5b4300' },
                { key: 'no', label: 'Not yet', sub: 'Keep at it', bg: '#FF6B6B', fg: '#fff' },
              ] as const).map((o) => {
                const sel = outcome === o.key;
                return (
                  <button key={o.key} type="button" aria-pressed={sel} onClick={() => setOutcome(o.key)}
                    className="py-3 rounded-xl border-[1.5px] flex flex-col items-center gap-0.5 px-1 active:scale-[0.98]"
                    style={sel ? { background: o.bg, borderColor: o.bg, color: o.fg } : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
                    <span className="text-[12px] font-bold leading-tight text-center">{o.label}</span>
                    <span className="text-[9px] leading-tight text-center opacity-80">{o.sub}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <p className="text-[9px] text-gray-400 mb-1" style={F_M}>{focus.title} today</p>
              <p className="text-[11px] text-gray-500 mb-1.5">This updates your self-rating for this step in My Sequence.</p>
              <StarRating value={execStars} onChange={setExecStars} size="lg" showLabel />
            </div>

            {focus.mission && focus.mission.success_criteria?.length > 0 && (
              <div>
                <p className="text-[9px] text-gray-400 mb-1" style={F_M}>Technique · which detail? (optional)</p>
                <p className="text-[11px] text-gray-500 mb-2">Mark only what you want. A weak one becomes your next objective; mark nothing and you keep working the whole step.</p>
                <CriteriaGrid list={focus.mission.success_criteria} value={focusCrit} onPick={(i, r) => setFocusCrit((p) => ({ ...p, [i]: r }))} />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-400" style={F_M}>And the whole sequence? (optional)</p>
                <p className="text-[11px] text-gray-500">How the chain ran around your focus.</p>
              </div>
              <StarRating value={seqStarsOptional} onChange={setSeqStarsOptional} size="md" />
            </div>
          </>
        ) : null}

        <FlowPicker flow={flow} onChange={setFlow} />

        <div>
          <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}>What you learned (optional)</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} aria-label="What you learned (optional)"
            placeholder="One thing you noticed, felt, or want to remember…"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px]" />
        </div>

        {errorMsg && <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>}

        <button type="button" disabled={!canSave} onClick={handleSave}
          className="w-full h-12 rounded-xl text-[14px] font-bold disabled:opacity-40 active:scale-[0.99]"
          style={{ background: canSave ? CYAN : '#e5e7eb', color: INK, ...F_D }}>
          {saving ? 'Saving…' : 'Save & update My Sequence'}
        </button>
        {!canSave && !saving && (
          <p className="text-[11px] text-gray-400 text-center -mt-2">
            {isRun ? 'Rate the sequence to save' : 'Say whether you did what you planned and rate the step'}
          </p>
        )}
      </Shell>
    );
  }

  // ─── DONE ───
  const nf = result?.nextFocus ?? null;
  const heldTitles = steps.filter((s) => held[s.step_id]).map((s) => s.title);
  return (
    <div className="space-y-4 rounded-2xl p-3 sm:p-4" style={{ background: INK }}>
      <div className="bg-white rounded-2xl p-7 text-center shadow-sm space-y-4">
        <div>
          <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Session saved</p>
          <h2 className="text-[22px] mt-1" style={{ ...F_D, color: INK }}>{isRun ? seq.name : focus?.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{seqLabel}</p>
        </div>

        {weekCount != null && weekCount > 0 && (
          <p className="text-[12px] font-bold rounded-full inline-block px-4 py-1.5" style={{ background: 'rgba(0,210,255,.12)', color: '#0090B0' }}>
            <Flame size={12} className="inline -mt-0.5 mr-1" /> {weekCount} practice{weekCount === 1 ? '' : 's'} in the last 7 days
          </p>
        )}

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
          {isRun ? (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">The whole sequence</span>
                <span className="font-bold" style={{ color: INK }}>{'★'.repeat(seqStars ?? 0)}{'☆'.repeat(5 - (seqStars ?? 0))} {seqStars ?? 0}/5</span>
              </div>
              {heldTitles.length > 0 && (
                <div className="flex justify-between text-xs gap-3">
                  <span className="text-gray-500 shrink-0">Held it back</span>
                  <span className="font-bold text-right" style={{ color: INK }}>{heldTitles.join(' · ')}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">What you planned</span>
                <span className="font-bold" style={{ color: INK }}>{outcome === 'yes' ? 'Done' : outcome === 'partial' ? 'Partly' : 'Not yet'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{focus?.title} today</span>
                <span className="font-bold" style={{ color: INK }}>{'★'.repeat(execStars ?? 0)}{'☆'.repeat(5 - (execStars ?? 0))} {execStars ?? 0}/5</span>
              </div>
              {seqStarsOptional !== null && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">The whole sequence</span>
                  <span className="font-bold" style={{ color: INK }}>{seqStarsOptional}/5</span>
                </div>
              )}
            </>
          )}
        </div>

        {nf ? (
          <div className="rounded-xl p-4 text-left" style={{ background: '#FFF8E7' }}>
            <p className="text-[9px]" style={{ ...F_M, color: '#9A6A12' }}>Work on this next</p>
            <p className="text-[14px] font-bold mt-0.5" style={{ color: INK }}>{nf.stepTitle}</p>
            {nf.criterionText && <p className="text-[12px] text-gray-700 mt-0.5">{nf.criterionText}</p>}
            <p className="text-[11px] text-gray-500 mt-1.5">Next time you open this sequence, it will already be your focus.</p>
          </div>
        ) : (
          <div className="rounded-xl p-4 text-left" style={{ background: isRun && (seqStars ?? 0) < 4 ? '#FFF8E7' : 'rgba(6,214,160,.12)' }}>
            {isRun && (seqStars ?? 0) < 4 ? (
              <>
                <p className="text-[14px] font-bold" style={{ color: INK }}>Nothing marked this time</p>
                <p className="text-[12px] text-gray-600 mt-0.5">Your previous focus stays where it was. Next run, tap the step that holds it back so the work gets specific.</p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-bold" style={{ color: INK }}>{isRun ? 'Nothing held it back' : 'Keep it going'}</p>
                <p className="text-[12px] text-gray-600 mt-0.5">{isRun ? 'Run it again and raise the bar.' : 'Run the whole sequence next time and see if it holds.'}</p>
              </>
            )}
          </div>
        )}

        <button type="button" onClick={onDone} className="w-full h-11 rounded-xl text-[13px] font-bold" style={{ background: INK, color: PAPER }}>
          ← Back to My Sequence
        </button>
      </div>
    </div>
  );
}
