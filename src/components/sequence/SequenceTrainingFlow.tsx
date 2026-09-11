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
  planSequenceSession,
  addTask,
  type SequenceTraining,
  type SequenceTrainingStep,
  type TrainingMode,
  type NextFocus,
  type OpenSession,
} from '@/lib/actions/lets-play';
import { getWeeklyPracticeCount, getLastPracticeHint, type CriterionResult } from '@/lib/actions/sequence';
import { Target, Check, CircleDot, X, Flame, Dumbbell, Waves, Play, Clock, Repeat, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { MAX_OPEN_TASKS } from '@/lib/stars';
import { VenueScoutLauncher } from '@/components/venue-scout/VenueScoutLauncher';
import { sequenceLabel, SIDE_WORD } from '@/lib/constants/learning-blocks';
import { momentsByStep, type Moment } from '@/lib/sequence-pages/moments';
import { MomentChips } from './MySequenceTab';
import { COMMAND_COLORS, WaveBoard } from '@/components/portal/sequence-page/WaveBoard';
import { sequencePageFor } from '@/lib/sequence-pages';
import { boardFlip } from '@/lib/stance';
import { StarRating } from './StarRating';
import { MarkdownContent } from '@/components/course/MarkdownContent';

// Dos momentos (Marcelo 2026-09-10): el PLAN se guarda antes del agua
// ('saved' = andá a surfear); la EVALUACIÓN cierra la sesión al volver.
type Phase = 'loading' | 'plan' | 'saved' | 'evaluation' | 'done' | 'error';
type Measure = 'time' | 'reps' | 'waves' | 'time_reps';

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };


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
          <p className="text-[12px] truncate" style={{ ...F_M, color: 'rgba(247,249,250,.78)' }}>Let’s Play · {seqLabel}</p>
          <p className="text-[15px] truncate" style={{ ...F_D, color: PAPER }}>{title}</p>
        </div>
        <button type="button" onClick={onCancel} className="text-[12px] shrink-0 ml-3 h-11 px-3 -mr-3" style={{ color: 'rgba(247,249,250,.78)' }} aria-label="Cancel">Cancel</button>
      </div>
      <div className="flex gap-1">
        {(['Plan', 'Surf', 'Evaluate'] as const).map((l, i) => (
          <div key={l} className="flex-1">
            <div className="h-1 rounded-full" style={{ background: i + 1 <= step ? CYAN : 'rgba(247,249,250,.15)' }} />
            <p className="text-[12px] mt-1" style={{ ...F_M, color: i + 1 === step ? CYAN : 'rgba(247,249,250,.78)' }}>{l}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-4 space-y-5">{children}</div>
    </div>
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
                  className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[12px] font-bold"
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
      <p className="text-[12px] text-gray-400 mb-1" style={F_M}>How did the challenge feel? Flow lives between boredom and frustration.</p>
      <div className="grid grid-cols-5 gap-1">
        {(['Bored', 'Easy', 'Flow', 'Hard', 'Too much'] as const).map((l, i) => {
          const n = i + 1; const sel = flow === n;
          return (
            <button key={l} type="button" aria-pressed={sel} onClick={() => onChange(sel ? null : n)}
              className="py-2 rounded-lg text-[12px] font-bold"
              style={sel ? { background: n === 3 ? GREEN : INK, color: n === 3 ? INK : PAPER } : { background: '#f3f4f6', color: '#6b7280' }}>{l}</button>
          );
        })}
      </div>
    </div>
  );
}

// "Go deeper": cada nivel se abre solo si el alumno quiere. Cerrado = nada
// que llenar. Marcelo (2026-09-04): una sola cosa obligatoria, las estrellas.
function DeeperToggle({ open, onToggle, label, hint }: { open: boolean; onToggle: () => void; label: string; hint: string }) {
  return (
    <button type="button" aria-expanded={open} onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left"
      style={open ? { borderColor: INK, background: '#f7f9fa' } : { borderColor: '#d1d5db', borderStyle: 'dashed', background: '#fff' }}>
      <span className="min-w-0">
        <span className="block text-[12px] font-bold" style={{ color: INK }}>{label}</span>
        <span className="block text-[12px] text-gray-500">{hint}</span>
      </span>
      {open ? <ChevronUp size={16} className="shrink-0 text-gray-500" /> : <ChevronDown size={16} className="shrink-0 text-gray-500" />}
    </button>
  );
}

function FocusPicker({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  const labels = ['Distracted', 'Some', 'Mostly', 'Locked in'];
  return (
    <div>
      <p className="text-[12px] text-gray-400 mb-1.5" style={F_M}><Brain size={11} className="inline mr-1 -mt-0.5" />Focus during practice</p>
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((n) => {
          const sel = value === n;
          return (
            <button key={n} type="button" aria-pressed={sel} onClick={() => onChange(sel ? null : n)}
              className="py-2.5 rounded-xl border-[1.5px] flex flex-col items-center gap-0.5"
              style={sel ? { background: INK, borderColor: INK, color: PAPER } : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
              <span className="text-base font-bold leading-none">{n}</span>
              <span className="text-[12px] leading-tight opacity-80">{labels[n]}</span>
            </button>
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
  /** Objetivo precargado (la palabra elegida en la página de la secuencia). */
  initialIntention?: string | null;
  /** El momento de la línea elegido como foco (desde Your next moves o la página). */
  initialFocusMoment?: string | null;
  /** Cerrar un plan guardado antes del agua: arranca directo en la evaluación. */
  openSession?: OpenSession | null;
  /** Stance del alumno: el tablero se espeja para goofy frontside / regular backside. */
  goofy?: boolean;
  studentBelt?: string;
  onCancel: () => void;
  /** "Rehearse it on land first": el Feel it de la secuencia en el curso (null
   *  sin curso — los drills son material de aprendizaje, no se registran). */
  rehearseHref?: string | null;
  /** A dónde vuelve al terminar: 'home' (plan guardado) o 'sequence' (Let's Play). */
  onDone: (next?: 'home' | 'sequence') => void;
}

export function SequenceTrainingFlow({ portalToken, sequenceId, belt, mode, focusStepId = null, initialIntention = null, initialFocusMoment = null, openSession = null, goofy = false, studentBelt: _studentBelt = 'white_belt', onCancel, rehearseHref = null, onDone }: Props) {
  // El modo se elige EN el plan (toda la línea, o un paso/momento como foco).
  const [modeState, setModeState] = useState<TrainingMode>(openSession?.mode ?? mode);
  const isRun = modeState === 'sequence_run';
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState<SequenceTraining | null>(null);
  const [focusId, setFocusId] = useState<string | null>(openSession?.focusStepId ?? focusStepId);
  const [focusMoment, setFocusMoment] = useState<string | null>(openSession?.focusMoment ?? initialFocusMoment);

  // Plan
  const [conditionsOk, setConditionsOk] = useState(!!openSession);
  const [measure, setMeasure] = useState<Measure>(openSession?.measure ?? 'time_reps');
  const [plannedDuration, setPlannedDuration] = useState(openSession?.plannedDuration ?? 20);
  const [plannedReps, setPlannedReps] = useState(openSession?.plannedReps ?? 5);
  const [intention, setIntention] = useState(openSession?.intention ?? initialIntention ?? initialFocusMoment ?? '');
  const [objectiveOpen, setObjectiveOpen] = useState(!!(openSession?.intention ?? initialIntention ?? initialFocusMoment));
  // La sesión planificada que se está cerrando (o la recién guardada).
  const [sessionId, setSessionId] = useState<string | null>(openSession?.id ?? null);
  const [savingPlan, setSavingPlan] = useState(false);
  // Sin señal en la playa (auditoría 2026-09-10): avisar antes, no después.
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    sync();
    window.addEventListener('online', sync); window.addEventListener('offline', sync);
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync); };
  }, []);
  // El lado (Marcelo 2026-09-10): solo se pregunta en las secuencias que se
  // surfean de los dos lados (Yellow #7). En #8-#13 lo sabe el servidor.
  const [side, setSide] = useState<'fs' | 'bs' | null>(openSession?.side ?? null);
  const [hintText, setHintText] = useState<string | null>(null);
  // Evaluate · run
  const [seqStars, setSeqStars] = useState<number | null>(null);
  const [held, setHeld] = useState<Record<string, boolean>>({});
  const [stepStars, setStepStars] = useState<Record<string, number>>({});
  const [stepCrit, setStepCrit] = useState<Record<string, Record<number, CriterionResult>>>({});
  // El MOMENTO de la línea donde se rompió (Marcelo 2026-09-10): se toca el
  // momento, el sistema sabe a qué lección pertenece. Uno por lección.
  const [stepMoment, setStepMoment] = useState<Record<string, string>>({});
  // Evaluate · focus
  const [execStars, setExecStars] = useState<number | null>(null);
  // "Go deeper": niveles cerrados por defecto.
  const [deeper, setDeeper] = useState(false);
  const [deepStep, setDeepStep] = useState<Record<string, boolean>>({});
  const [noteOpen, setNoteOpen] = useState(false);
  const [focusRating, setFocusRating] = useState<number | null>(null);
  const [focusCrit, setFocusCrit] = useState<Record<number, CriterionResult>>({});
  const [seqStarsOptional, setSeqStarsOptional] = useState<number | null>(null);
  // Común
  const [flow, setFlow] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ nextFocus: NextFocus; sequenceRating: number | null } | null>(null);
  // Al cerrar: "¿qué trabajás la próxima?" — una tarea, o ninguna (Marcelo 2026-09-10).
  const [taskState, setTaskState] = useState<{ saved: string | null; error: string | null; picking: boolean; saving: boolean }>({ saved: null, error: null, picking: false, saving: false });
  const [weekCount, setWeekCount] = useState<number | null>(null);

  // ── BORRADOR de la evaluación en el teléfono (auditoría 2026-09-10) ──
  // Una llamada, un refresh o la pérdida de señal borraban estrella, foco,
  // flow y momentos antes de "Save". Se guarda en sessionStorage bajo la
  // sesión (o la secuencia) y se restaura al volver; se borra al guardar.
  const draftKey = `tss_eval_draft_${openSession?.id ?? sessionId ?? `${sequenceId}:${mode}`}`;
  const [draftRestored, setDraftRestored] = useState(false);
  useEffect(() => {
    if (phase !== 'evaluation' || draftRestored) return;
    setDraftRestored(true);
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.seqStars != null) setSeqStars(d.seqStars);
      if (d.execStars != null) setExecStars(d.execStars);
      if (d.held) setHeld(d.held);
      if (d.stepStars) setStepStars(d.stepStars);
      if (d.stepCrit) setStepCrit(d.stepCrit);
      if (d.stepMoment) setStepMoment(d.stepMoment);
      if (d.focusRating != null) setFocusRating(d.focusRating);
      if (d.flow != null) setFlow(d.flow);
      if (d.focusCrit) setFocusCrit(d.focusCrit);
      if (d.seqStarsOptional != null) setSeqStarsOptional(d.seqStarsOptional);
      if (typeof d.notes === 'string') setNotes(d.notes);
      if (d.held && Object.values(d.held).some(Boolean)) setDeeper(true);
    } catch { /* sin borrador */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    if (phase !== 'evaluation' || !draftRestored) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ seqStars, execStars, held, stepStars, stepCrit, stepMoment, focusRating, flow, focusCrit, seqStarsOptional, notes }));
    } catch { /* sin storage, sin borrador */ }
  }, [phase, draftRestored, draftKey, seqStars, execStars, held, stepStars, stepCrit, stepMoment, focusRating, flow, focusCrit, seqStarsOptional, notes]);
  const hasMarks = seqStars != null || execStars != null || focusRating != null || flow != null || Object.values(held).some(Boolean) || notes.trim().length > 0;
  const safeCancel = () => {
    if (phase === 'evaluation' && hasMarks && !window.confirm('Leave the evaluation? Your answers stay on this phone until you come back.')) return;
    onCancel();
  };

  useEffect(() => {
    let mounted = true;
    setPhase('loading');
    getSequenceTraining(portalToken, sequenceId, belt)
      .then((res) => {
        if (!mounted) return;
        if (!res.ok) { setErrorMsg(res.error); setPhase('error'); return; }
        setData(res.data);
        // Cerrar un plan guardado: directo a evaluar, con el plan tal cual se guardó.
        if (openSession) { setPhase('evaluation'); return; }
        const wanted = focusStepId ?? null;
        const f = wanted && res.data.steps.some((s) => s.step_id === wanted) ? wanted : res.data.suggestedFocusStepId;
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
  const moments = momentsByStep(seq.id, steps.map((s) => ({ id: s.step_id, title: s.title })));
  const focus: SequenceTrainingStep | null = !isRun ? steps.find((s) => s.step_id === focusId) ?? null : null;
  // El mismo rótulo que ve en todos lados (y el que se guarda en drill_name):
  // "#3 · Pop-Up", o "Foundation · …" para las que no son escalones numerados.
  const seqLabel = sequenceLabel(seq.id, seq.order, seq.name);
  const wantsTime = measure === 'time' || measure === 'time_reps';
  const wantsReps = measure !== 'time';
  const repsWord = measure === 'waves' ? 'waves' : 'runs';
  const measureText = [wantsTime ? `${plannedDuration} min` : null, wantsReps ? `${plannedReps} ${repsWord}` : null].filter(Boolean).join(' · ');

  const twoSided = seq.side === 'both';
  const sideTag = twoSided && side ? ` · ${SIDE_WORD[side]}` : '';
  const shellTitle = (isRun ? 'Run the whole sequence' : `Focus: ${focus?.title ?? '—'}`) + sideTag;

  // ─── PLAN ─── (se guarda antes del agua)
  if (phase === 'plan') {
    const canSave = conditionsOk && (isRun || !!focus) && (!twoSided || !!side)
      && (!wantsTime || plannedDuration >= 1) && (!wantsReps || plannedReps >= 1) && !savingPlan;
    const pickWhole = () => { setModeState('sequence_run'); setFocusMoment(null); };
    const pickStep = (id: string) => { setModeState('step_focus'); setFocusId(id); setFocusMoment(null); };
    const pickMoment = (id: string, m: Moment) => {
      setModeState('step_focus'); setFocusId(id); setFocusMoment(m.short);
      setIntention(m.short); setObjectiveOpen(true);
    };
    const handlePlan = async () => {
      setSavingPlan(true); setErrorMsg('');
      try {
        const res = await planSequenceSession(portalToken, {
          sequenceId: seq.id,
          belt,
          mode: modeState,
          focusStepId: focus?.step_id ?? null,
          focus_moment: focusMoment,
          side: twoSided ? side : null,
          intention_text: intention.trim() || undefined,
          measure,
          planned_duration_minutes: wantsTime ? plannedDuration : null,
          planned_reps: wantsReps ? plannedReps : null,
          conditions_ok: conditionsOk,
        });
        if (!res.ok) { setErrorMsg(res.error); return; }
        setSessionId(res.sessionId);
        setPhase('saved');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        setErrorMsg('Could not save your plan. Check your connection and try again.');
      } finally {
        setSavingPlan(false);
      }
    };
    return (
      <Shell step={1} seqLabel={seqLabel} title={shellTitle} onCancel={onCancel}>
        {/* 1 · Qué vas a entrenar */}
        <div className="rounded-2xl p-4" style={{ background: INK }}>
          <p className="text-[12px]" style={{ ...F_M, color: CYAN }}>What you train today</p>
          <p className="text-[20px] mt-1.5" style={{ ...F_D, color: PAPER }}>{seq.name}</p>
          {seq.promise && <p className="text-[12px] mt-2 leading-snug" style={{ color: 'rgba(247,249,250,.8)' }}>{seq.promise}</p>}
        </div>

        {twoSided && (
          <div className="rounded-2xl border border-gray-200 p-3.5">
            <p className="text-[12px] text-gray-400" style={F_M}>Which side today?</p>
            <p className="text-[12px] text-gray-600 mt-0.5 leading-snug">This line is yours only when you own it on both sides. Rate the side you surf.</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(['fs', 'bs'] as const).map((sd) => {
                const last = seq.sideRatings?.[sd] ?? null;
                const on = side === sd;
                return (
                  <button key={sd} type="button" onClick={() => setSide(sd)}
                    className="h-12 rounded-xl text-[12px] font-bold border-[1.5px] active:scale-[0.98]"
                    style={on ? { background: INK, borderColor: INK, color: PAPER } : { background: '#fff', borderColor: '#d1d5db', color: INK }}>
                    {SIDE_WORD[sd]}{last != null ? <span className="block text-[12px] font-normal" style={{ color: on ? 'rgba(247,249,250,.7)' : '#6b7280' }}>last {last}★</span> : <span className="block text-[12px] font-normal" style={{ color: on ? 'rgba(247,249,250,.7)' : '#9ca3af' }}>not rated yet</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2 · Tu foco: toda la línea, un paso, o un momento de la línea */}
        <div>
          <p className="text-[12px] text-gray-400 mb-1.5" style={F_M}>Your focus · tap one, or none</p>
          {data.tasks.length > 0 && (
            <div className="mb-1.5 space-y-1.5">
              {data.tasks.map((t) => {
                const sel = !isRun && focusId === t.stepId && (t.detail ? focusMoment === t.detail : !focusMoment);
                return (
                  <button key={t.id} type="button" aria-pressed={sel}
                    onClick={() => { setModeState('step_focus'); setFocusId(t.stepId); setFocusMoment(t.detail); if (t.detail) { setIntention(t.detail); setObjectiveOpen(true); } }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] text-left active:scale-[0.99]"
                    style={sel ? { background: '#FFF8E7', borderColor: '#E0A62B' } : { background: '#fff', borderColor: '#F3D48A' }}>
                    <span className="text-[12px] shrink-0" style={{ ...F_M, color: '#9A6A12' }}>My list</span>
                    <span className="text-[13px] font-semibold flex-1" style={{ color: INK }}>{t.stepTitle}{t.detail ? <span className="font-normal text-gray-600"> · {t.detail}</span> : null}</span>
                  </button>
                );
              })}
            </div>
          )}
          <button type="button" aria-pressed={isRun} onClick={pickWhole}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] text-left active:scale-[0.99]"
            style={isRun ? { background: INK, borderColor: INK, color: PAPER } : { background: '#fff', borderColor: '#e5e7eb', color: INK }}>
            <Play size={14} strokeWidth={2.25} className="shrink-0" />
            <span className="text-[13px] font-semibold">The whole line · no specific focus</span>
          </button>
          <ol className="space-y-1.5 mt-1.5">
            {steps.map((s, i) => {
              const on = !isRun && focusId === s.step_id;
              const ms = moments[s.step_id] ?? [];
              return (
                <li key={s.step_id} className="rounded-xl border-[1.5px] overflow-hidden" style={on ? { borderColor: '#E0A62B', background: '#FFFBF0' } : { borderColor: '#e5e7eb' }}>
                  <button type="button" aria-pressed={on} onClick={() => pickStep(s.step_id)} className="w-full flex items-start gap-2.5 px-3 py-3 min-h-[44px] text-left">
                    <span className="text-[12px] font-bold w-4 shrink-0 mt-0.5" style={{ color: on ? '#9A6A12' : '#9ca3af' }}>{i + 1}</span>
                    <span className="text-[13px] font-semibold leading-tight flex-1" style={{ color: INK }}>{s.title}</span>
                    {on && !focusMoment && <span className="text-[12px] shrink-0" style={{ ...F_M, color: '#9A6A12' }}>your focus</span>}
                  </button>
                  {/* Plegado (auditoría 2026-09-10): el plan medía 1777px; los
                      momentos se abren solo en el paso que elegiste. */}
                  {on && ms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-3 pb-2.5 -mt-0.5">
                      {ms.map((m) => {
                        const sel = on && focusMoment === m.short;
                        return (
                          <button key={m.key} type="button" aria-pressed={sel} onClick={() => pickMoment(s.step_id, m)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold border"
                            style={sel ? { background: '#E0A62B', borderColor: '#E0A62B', color: INK } : { background: '#fff', borderColor: '#e5e7eb', color: '#4b5563' }}>
                            <i className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: m.command ? COMMAND_COLORS[m.command] : '#9CA3AF' }} />
                            {m.short}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {hintText && <p className="text-[12px] mt-2 rounded-lg px-2.5 py-1.5" style={{ background: '#FFF8E7', color: '#9A6A12' }}>{hintText}</p>}
        </div>

        {/* La misión del paso elegido: los indicadores que vas a marcar al volver */}
        {!isRun && focus && (
          <div className="space-y-3">
            {focus.mission ? (
              <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2">
                <p className="text-[12px] text-gray-400" style={F_M}><Waves size={11} className="inline mr-1 -mt-0.5" />Your mission · one execution, then again</p>
                <p className="text-[14px] font-semibold" style={{ color: INK }}>{focus.mission.title}</p>
                {focus.mission.success_criteria?.length > 0 && (
                  <div>
                    <p className="text-[12px] text-gray-400 mt-2 mb-1" style={F_M}>What a good one looks like</p>
                    <ol className="space-y-1">
                      {focus.mission.success_criteria.map((c, i) => (
                        <li key={i} className="text-[12.5px] text-gray-800 leading-snug"><span className="font-bold mr-1">{i + 1}.</span>{c}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 p-3.5">
                <p className="text-[12.5px] text-gray-700">This step has no mission card yet. Run the sequence with <b>{focus.title}</b> as your focus and rate how it went.</p>
              </div>
            )}
            {focus.drill && rehearseHref && (
              <a href={rehearseHref}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] border-dashed border-gray-300 text-left active:scale-[0.99]">
                <Dumbbell size={16} strokeWidth={1.75} className="text-gray-500 shrink-0" />
                <span className="text-[12.5px] text-gray-700"><b>Rehearse it on land first</b> → {focus.drill.title} · Feel it, in the course</span>
              </a>
            )}
          </div>
        )}

        {/* 3 · Condiciones: un solo check; leer el spot es opcional */}
        <div className="space-y-2">
          <p className="text-[12px] text-gray-400" style={F_M}>Conditions</p>
          <button type="button" aria-pressed={conditionsOk} onClick={() => setConditionsOk((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] text-left transition-colors active:scale-[0.99]"
            style={conditionsOk ? { background: 'rgba(6,214,160,.12)', borderColor: GREEN } : { background: '#fff', borderColor: '#e5e7eb' }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={conditionsOk ? { background: GREEN } : { border: '1.5px solid #d1d5db' }}>
              {conditionsOk && <Check size={12} strokeWidth={3} style={{ color: INK }} />}
            </span>
            <span className="text-[12.5px] leading-snug" style={{ color: conditionsOk ? INK : '#6b7280' }}>The conditions fit my level, and my expectations are right for today.</span>
          </button>
          <details className="rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5">
            <summary className="cursor-pointer list-none text-[12px] text-gray-600 flex items-center justify-between">
              <span>Not sure? <b>Read the spot</b> first (optional)</span>
              <ChevronDown size={14} className="text-gray-400" />
            </summary>
            <div className="mt-2"><VenueScoutLauncher variant="light" /></div>
          </details>
        </div>

        {/* 4 · Tu medida: tiempo, runs/olas, o las dos */}
        <div>
          <p className="text-[12px] text-gray-400 mb-1.5" style={F_M}>Your measure</p>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl" style={{ background: '#f3f4f6' }}>
            {([['time', 'Time'], ['reps', 'Runs'], ['waves', 'Waves'], ['time_reps', 'Time + runs']] as [Measure, string][]).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={measure === k} onClick={() => setMeasure(k)}
                className="h-11 rounded-lg text-[12px] font-bold"
                style={measure === k ? { background: INK, color: PAPER } : { color: '#6b7280' }}>{l}</button>
            ))}
          </div>
          <div className={`grid gap-3 mt-2 ${wantsTime && wantsReps ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {wantsTime && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-[12px] text-gray-400 mb-1.5" style={F_M}><Clock size={11} className="inline mr-1 -mt-0.5" />Time in the water</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPlannedDuration((m) => Math.max(5, m - 5))} className="w-11 h-11 rounded-lg bg-gray-100 text-lg font-bold" aria-label="Less time">−</button>
                  <span className="flex-1 text-center text-2xl font-bold tabular-nums" style={{ color: INK }}>{plannedDuration}<span className="text-[12px] font-semibold text-gray-400 ml-1">min</span></span>
                  <button type="button" onClick={() => setPlannedDuration((m) => Math.min(240, m + 5))} className="w-11 h-11 rounded-lg bg-gray-100 text-lg font-bold" aria-label="More time">+</button>
                </div>
              </div>
            )}
            {wantsReps && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-[12px] text-gray-400 mb-1.5" style={F_M}><Repeat size={11} className="inline mr-1 -mt-0.5" />{measure === 'waves' ? 'Waves' : 'Runs'}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPlannedReps((r) => Math.max(1, r - 1))} className="w-11 h-11 rounded-lg bg-gray-100 text-lg font-bold" aria-label="Fewer">−</button>
                  <span className="flex-1 text-center text-2xl font-bold tabular-nums" style={{ color: INK }}>{plannedReps}</span>
                  <button type="button" onClick={() => setPlannedReps((r) => Math.min(100, r + 1))} className="w-11 h-11 rounded-lg bg-gray-100 text-lg font-bold" aria-label="More">+</button>
                </div>
                <p className="text-[12px] text-gray-400 mt-1">{measure === 'waves' ? 'Waves you will surf with this focus.' : isRun ? 'One run = the whole sequence, start to finish.' : 'One run = the whole sequence with your focus in it.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Objetivo en palabras (opcional, plegado) */}
        <details open={objectiveOpen} onToggle={(e) => setObjectiveOpen((e.currentTarget as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer list-none text-[12px] text-gray-400" style={F_M}>Your word for the wave (optional) ▾</summary>
          <textarea value={intention} onChange={(e) => setIntention(e.target.value)} rows={2} aria-label="Your word for the wave (optional)"
            placeholder={isRun ? 'e.g. Keep the chain flowing — no stop between steps' : 'e.g. Weight on the front foot through the whole ride'}
            className="mt-1.5 w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px]" />
        </details>

        {errorMsg && <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>}

        <button type="button" disabled={!canSave} onClick={handlePlan}
          className="w-full h-12 rounded-xl text-[14px] font-bold disabled:opacity-40 active:scale-[0.99]"
          style={{ background: canSave ? CYAN : '#e5e7eb', color: INK, ...F_D }}>
          {savingPlan ? 'Saving…' : 'Save my plan →'}
        </button>
        {!canSave && !savingPlan && (
          <p className="text-[12px] text-gray-400 text-center -mt-2">
            {!conditionsOk ? 'Confirm the conditions to save your plan' : twoSided && !side ? 'Pick your side' : 'Pick your measure'}
          </p>
        )}
      </Shell>
    );
  }

  // ─── SAVED · andá a surfear ───
  if (phase === 'saved') {
    return (
      <Shell step={2} seqLabel={seqLabel} title={shellTitle} onCancel={onDone}>
        <div className="rounded-2xl p-5 text-center" style={{ background: INK }}>
          <p className="text-[12px]" style={{ ...F_M, color: CYAN }}>Plan saved</p>
          <p className="text-[24px] mt-1" style={{ ...F_D, color: PAPER }}>Now go surf</p>
          <p className="text-[12px] mt-2" style={{ color: 'rgba(247,249,250,.75)' }}>
            {isRun ? 'Run the whole line, start to finish, every time.' : `Run the line with ${focus?.title} as your focus.`}
          </p>
          <div className="flex justify-center gap-6 mt-3">
            {wantsTime && <div><p className="text-[12px]" style={{ ...F_M, color: 'rgba(247,249,250,.78)' }}>Time</p><p className="text-lg font-bold" style={{ color: PAPER }}>{plannedDuration} min</p></div>}
            {wantsReps && <div><p className="text-[12px]" style={{ ...F_M, color: 'rgba(247,249,250,.78)' }}>{repsWord}</p><p className="text-lg font-bold" style={{ color: PAPER }}>{plannedReps}</p></div>}
          </div>
        </div>
        {/* La ola con la línea y su código de colores (la misma del curso),
            chica: de un vistazo, los pasos y dónde pasan (Marcelo 2026-09-10). */}
        {sequencePageFor(seq.id)?.think.board && (
          <div className="rounded-2xl p-2" style={{ background: INK }}>
            <WaveBoard data={sequencePageFor(seq.id)!.think.board!} title={`${seq.name} on the wave face`} flip={boardFlip(twoSided ? (side ?? 'fs') : seq.side, goofy)} />
          </div>
        )}
        {(focusMoment || intention.trim()) && (
          <div className="rounded-xl px-3.5 py-2.5" style={{ background: '#FFF8E7' }}>
            <p className="text-[12px]" style={{ ...F_M, color: '#9A6A12' }}>Your word for the wave</p>
            <p className="text-[13px] text-gray-800">{intention.trim() || focusMoment}</p>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 p-3.5">
          <p className="text-[12.5px] text-gray-700 leading-snug">Close the app and surf. When you are back, open it: <b>Home → Finish &amp; evaluate</b>. Your plan stays saved.</p>
        </div>
        <button type="button" onClick={() => onDone('home')} className="w-full h-12 rounded-xl text-[14px] font-bold active:scale-[0.99]" style={{ background: INK, color: PAPER, ...F_D }}>
          Done — see you after the water
        </button>
        <button type="button" onClick={() => setPhase('evaluation')} className="w-full text-[12px] text-gray-500 underline">Already back? Evaluate now</button>
      </Shell>
    );
  }

  // ─── EVALUATE ───
  if (phase === 'evaluation') {
    // Marcelo (2026-09-04): estrella + foco + flow obligatorios (tres toques).
    // Los pasos/criterios y la nota se abren solo si quiere.
    const feelDone = focusRating !== null && flow !== null;
    const canSave = isRun ? seqStars !== null && feelDone && !saving : execStars !== null && feelDone && !saving;

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
          mode: modeState,
          side: twoSided ? side : null,
          focusStepId: focus?.step_id ?? null,
          intention_text: intention.trim() || undefined,
          planned_duration_minutes: wantsTime ? plannedDuration : 1,
          planned_reps: wantsReps ? plannedReps : 1,
          safety_check: conditionsOk,
          warm_up: null,
          sessionId,
          measure,
          focus_moment: focusMoment,
          notes: notes.trim() || undefined,
          flow_channel: flow,
          sequence_rating: isRun ? seqStars : seqStarsOptional,
          held_back_step_ids: isRun ? heldIds : undefined,
          step_ratings: isRun ? stepRatings : undefined,
          step_criteria: isRun ? stepCriteria : undefined,
          step_moments: isRun ? Object.fromEntries(Object.entries(stepMoment).filter(([id]) => heldSet.has(id))) : undefined,
          focus_rating: focusRating ?? undefined,
          execution_rating: !isRun ? execStars ?? undefined : undefined,
          criteria: !isRun ? Object.entries(focusCrit).map(([i, r]) => ({ criterion_index: Number(i), result: r })) : undefined,
        });
        if (!res.ok) { setErrorMsg(res.error); setSaving(false); return; }
        try { sessionStorage.removeItem(draftKey); } catch { /* nada */ }
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
      <Shell step={3} seqLabel={seqLabel} title={shellTitle} onCancel={safeCancel}>
        {!online && (
          <p className="text-[13px] leading-snug rounded-xl px-3.5 py-2.5" style={{ background: '#FFF8E7', color: '#7a5c00' }}>
            No signal right now. Your answers stay on this phone — tap Save when you are back online.
          </p>
        )}
        {/* EL OBJETIVO, bien claro, antes de evaluar (Marcelo 2026-09-10:
            "para refrescarlo y en letras que se distingan"). */}
        <div className="rounded-2xl p-4" style={{ background: INK }}>
          <p className="text-[12px]" style={{ ...F_M, color: CYAN }}>Your objective today</p>
          <p className="text-[22px] mt-1.5" style={{ ...F_D, color: PAPER }}>{isRun ? 'The whole line' : focus?.title}</p>
          {(intention.trim() || focusMoment) && (
            <p className="text-[16px] font-semibold mt-2 leading-snug" style={{ color: GOLD }}>“{intention.trim() || focusMoment}”</p>
          )}
          <p className="text-[12px] mt-2" style={{ color: 'rgba(247,249,250,.7)' }}>{seq.name}{twoSided && side ? ` · ${SIDE_WORD[side]}` : ''}{measureText ? ` · ${measureText}` : ''}</p>
        </div>
        {isRun ? (
          <>
            <div>
              <p className="text-[12px]" style={{ ...F_M, color: '#0090B0' }}>Honest evaluation</p>
              <h3 className="text-[20px] mt-1" style={{ ...F_D, color: INK }}>How did it go?</h3>
              <p className="text-[12.5px] text-gray-500 mt-1">Three taps: your star for the whole chain, your focus, how it felt.</p>
              <div className="mt-2"><StarRating value={seqStars} onChange={setSeqStars} size="lg" showLabel /></div>
            </div>

            <FocusPicker value={focusRating} onChange={setFocusRating} />
            <FlowPicker flow={flow} onChange={setFlow} />

            <DeeperToggle open={deeper} onToggle={() => setDeeper((d) => !d)} label="Check each step of this sequence" hint="Tap the moment of the line where it broke, or the step itself — the earliest one in the chain becomes your next focus. Open a step to check its details." />
            {deeper && (
            <div>
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
                            setStepMoment((p) => { const n = { ...p }; delete n[s.step_id]; return n; });
                            setDeepStep((p) => { const n = { ...p }; delete n[s.step_id]; return n; });
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={on ? { background: '#E0A62B' } : { border: '1.5px solid #d1d5db' }}>
                          {on && <X size={12} strokeWidth={3} className="text-white" />}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-[13px] font-semibold flex-1 min-w-0 truncate" style={{ color: INK }}>{s.title}</span>
                        {on && <span className="text-[12px] shrink-0" style={{ ...F_M, color: '#9A6A12' }}>held it back</span>}
                      </button>
                      {/* ¿En qué MOMENTO de la línea se rompió? Tocar uno marca la
                          lección como la que frenó el run y deja ese momento como
                          objetivo de la próxima sesión. */}
                      {moments[s.step_id]?.length ? (
                        <div className="flex flex-wrap gap-1.5 px-3 pb-2.5 -mt-0.5">
                          {moments[s.step_id].map((m) => {
                            const sel = on && stepMoment[s.step_id] === m.short;
                            return (
                              <button key={m.key} type="button" aria-pressed={sel}
                                onClick={() => {
                                  if (sel) { setStepMoment((p) => { const n = { ...p }; delete n[s.step_id]; return n; }); return; }
                                  setHeld((h) => ({ ...h, [s.step_id]: true }));
                                  setStepMoment((p) => ({ ...p, [s.step_id]: m.short }));
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold border"
                                style={sel ? { background: '#E0A62B', borderColor: '#E0A62B', color: INK } : { background: '#fff', borderColor: '#e5e7eb', color: '#4b5563' }}>
                                <i className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: m.command ? COMMAND_COLORS[m.command] : '#9CA3AF' }} />
                                {m.short}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {on && (
                        <div className="px-3 pb-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-gray-500">{s.title} today (optional)</span>
                            <StarRating value={stepStars[s.step_id] ?? null} onChange={(n) => setStepStars((p) => ({ ...p, [s.step_id]: n }))} size="sm" />
                          </div>
                          {crit.length > 0 && (
                            <>
                              <DeeperToggle open={!!deepStep[s.step_id]} onToggle={() => setDeepStep((p) => ({ ...p, [s.step_id]: !p[s.step_id] }))} label="Check the details of this step" hint="Mark what was met and what was not. A weak one becomes your next objective." />
                              {deepStep[s.step_id] && (
                                <CriteriaGrid list={crit} value={stepCrit[s.step_id] ?? {}} onPick={(ci, r) => setStepCrit((p) => ({ ...p, [s.step_id]: { ...(p[s.step_id] ?? {}), [ci]: r } }))} />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </>
        ) : focus ? (
          <>
            <div>
              <p className="text-[12px]" style={{ ...F_M, color: '#0090B0' }}>Honest evaluation · {focus.title}</p>
              <h3 className="text-[20px] mt-1" style={{ ...F_D, color: INK }}>How did it go?</h3>
              <p className="text-[12.5px] text-gray-500 mt-1">Three taps: your star for {focus.title} today (it updates your self-rating in My Sequence), your focus, how it felt.</p>
              <div className="mt-2"><StarRating value={execStars} onChange={setExecStars} size="lg" showLabel /></div>
            </div>

            <FocusPicker value={focusRating} onChange={setFocusRating} />
            <FlowPicker flow={flow} onChange={setFlow} />

            <DeeperToggle open={deeper} onToggle={() => setDeeper((d) => !d)} label="Check the details of this step" hint="Mark what was met and what was not. A weak one becomes your next objective; mark nothing and you keep working the whole step." />
            {deeper && (
              <div className="space-y-4">
                {focus.mission && focus.mission.success_criteria?.length > 0 ? (
                  <CriteriaGrid list={focus.mission.success_criteria} value={focusCrit} onPick={(i, r) => setFocusCrit((p) => ({ ...p, [i]: r }))} />
                ) : (
                  <p className="text-[12px] text-gray-500">This step has no criteria card yet — the star is the whole story for now.</p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-gray-400" style={F_M}>And the whole sequence? (optional)</p>
                    <p className="text-[12px] text-gray-500">How the chain ran around your focus.</p>
                  </div>
                  <StarRating value={seqStarsOptional} onChange={setSeqStarsOptional} size="md" />
                </div>
              </div>
            )}
          </>
        ) : null}

        <DeeperToggle open={noteOpen} onToggle={() => setNoteOpen((d) => !d)} label="Add a note" hint="One thing you noticed, felt, or want to remember." />
        {noteOpen && (
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} aria-label="What you learned (optional)" autoFocus
            placeholder="One thing you noticed, felt, or want to remember…"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px]" />
        )}

        {errorMsg && <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>}

        <button type="button" disabled={!canSave} onClick={handleSave}
          className="w-full h-12 rounded-xl text-[14px] font-bold disabled:opacity-40 active:scale-[0.99]"
          style={{ background: canSave ? CYAN : '#e5e7eb', color: INK, ...F_D }}>
          {saving ? 'Saving…' : online ? 'Save & update My Sequence' : 'Save (waiting for signal)'}
        </button>
        {!canSave && !saving && (
          <p className="text-[12px] text-gray-400 text-center -mt-2">
            {(isRun ? seqStars === null : execStars === null) ? (isRun ? 'Rate the sequence to save' : 'Rate the step to save')
              : focusRating === null ? 'Pick your focus level to save'
              : 'Pick how the challenge felt to save'}
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
          <p className="text-[12px]" style={{ ...F_M, color: '#0090B0' }}>Session saved</p>
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
            <p className="text-[12px]" style={{ ...F_M, color: '#9A6A12' }}>Work on this next</p>
            <p className="text-[14px] font-bold mt-0.5" style={{ color: INK }}>{nf.stepTitle}</p>
            {nf.criterionText && <p className="text-[12px] text-gray-700 mt-0.5">{nf.criterionText}</p>}
            <p className="text-[12px] text-gray-500 mt-1.5">Next time you open this sequence, it will already be your focus.</p>
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

        {/* ¿Qué trabajás la próxima? Una tarea (o ninguna). Se ofrece, no se impone. */}
        <div className="rounded-xl p-4 text-left border border-gray-200 space-y-2">
          <p className="text-[12px]" style={{ ...F_M, color: '#0090B0' }}>What do you work on next?</p>
          {taskState.saved ? (
            <p className="text-[12.5px] text-gray-800"><b>On your list:</b> {taskState.saved}</p>
          ) : (
            <>
              {nf && (
                <button type="button" disabled={taskState.saving}
                  onClick={async () => {
                    setTaskState((s) => ({ ...s, saving: true, error: null }));
                    const r = await addTask(portalToken, { sequenceId: seq.id, stepId: nf.stepId, detail: nf.criterionText, belt });
                    setTaskState({ saved: r.ok ? `${r.task.stepTitle}${r.task.detail ? ` · ${r.task.detail}` : ''} (${r.openCount}/${MAX_OPEN_TASKS})` : null, error: r.ok ? null : r.error, picking: false, saving: false });
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold active:scale-[0.99]" style={{ background: '#FFF8E7', color: INK }}>
                  {nf.stepTitle}{nf.criterionText ? <span className="font-normal text-gray-600"> · {nf.criterionText}</span> : null} <span className="text-[12px] text-gray-500">· suggested</span>
                </button>
              )}
              <button type="button" onClick={() => setTaskState((s) => ({ ...s, picking: !s.picking }))} className="w-full text-left px-3.5 py-2.5 rounded-xl text-[12.5px] border border-gray-200" style={{ color: INK }}>
                {taskState.picking ? 'Hide the details' : 'Pick another detail of this sequence ▾'}
              </button>
              {taskState.picking && (
                <div className="space-y-1.5">
                  {steps.map((s) => (moments[s.step_id] ?? []).map((m) => (
                    <button key={`${s.step_id}:${m.key}`} type="button" disabled={taskState.saving}
                      onClick={async () => {
                        setTaskState((st) => ({ ...st, saving: true, error: null }));
                        const r = await addTask(portalToken, { sequenceId: seq.id, stepId: s.step_id, detail: m.short, belt });
                        setTaskState({ saved: r.ok ? `${r.task.stepTitle} · ${m.short} (${r.openCount}/${MAX_OPEN_TASKS})` : null, error: r.ok ? null : r.error, picking: !r.ok, saving: false });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-left" style={{ background: '#f7f9fa', color: INK }}>
                      <i className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.command ? COMMAND_COLORS[m.command] : '#9CA3AF' }} />
                      <span className="text-gray-500 shrink-0">{s.title.replace(/ Operationalized at Blue Belt/, '')} ·</span> {m.short}
                    </button>
                  )))}
                </div>
              )}
              {taskState.error && <p className="text-[12px] text-red-600">{taskState.error}</p>}
              <p className="text-[12px] text-gray-400">Or nothing — you always train what you choose. At most {MAX_OPEN_TASKS} on your list.</p>
            </>
          )}
        </div>

        <button type="button" onClick={() => onDone('sequence')} className="w-full h-11 rounded-xl text-[13px] font-bold" style={{ background: INK, color: PAPER }}>
          ← Back to My Sequence
        </button>
      </div>
    </div>
  );
}
