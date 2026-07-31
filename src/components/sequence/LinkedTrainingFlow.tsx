'use client';

// ═══ LET'S PLAY — flujo de práctica ligado a My Sequence (Brand Manual v10) ═══
// 2 pantallas antes del agua (antes eran 5):
//   PLAN  → misión pre-cargada + check de seguridad de 4 preguntas (cada
//           sesión, sin memoria: el mar cambia día a día) + tiempo/reps.
//           El análisis profundo (ola/viento/marea/crowd) queda opcional.
//   READY → "Now go practice" con warm-up y ancla mental como chips de un
//           toque (el mantra respira con el alumno 15s — momento de marca,
//           no formulario).
// La evaluación honesta post-agua se mantiene COMPLETA: ahí vive la
// profundidad pedagógica (criterios → coach valida → My Sequence).

import { useEffect, useRef, useState } from 'react';
import {
  getDrillMissionForTraining,
  saveLinkedTrainingSession,
  getWeeklyPracticeCount,
  type DrillMissionRow,
  type CriterionResult,
  type CriterionEvaluation,
} from '@/lib/actions/sequence';
import {
  WAVE_CONDITIONS,
  WIND_OPTIONS,
  TIDE_OPTIONS,
  CROWD_OPTIONS,
} from '@/lib/constants/training';
import { SELF_TRAINING_WARMUPS } from '@/lib/constants/brand';
import {
  Target, Dumbbell, Waves, Clock, Repeat, Check, CircleDot, X, Star,
  Lightbulb, Save, Brain, Play, ChevronDown, Moon, Smile, Flame, AlertTriangle,
} from 'lucide-react';

type Phase = 'loading' | 'plan' | 'ready' | 'evaluation' | 'done' | 'error';

interface Props {
  drillMissionId: string;
  studentId: string;
  studentBelt?: string;
  onClearIncoming: () => void;
  onReturnToSequence: () => void;
}

// ─── Brand Manual v10 ───
const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };

// Las 4 preguntas que un surfista con criterio responde antes de remar.
// Se contestan CADA sesión — el mar de la mañana no es el de la tarde.
const SAFETY_CHECKS = [
  { key: 'level', label: 'Conditions are appropriate and safe for my level' },
  { key: 'entry', label: 'I know where I get in and where I get out' },
  { key: 'lineup', label: 'I know where I will wait for the waves' },
  { key: 'hazards', label: 'I identified today’s hazards (rocks, currents, crowd)' },
] as const;
type SafetyKey = (typeof SAFETY_CHECKS)[number]['key'];

export function LinkedTrainingFlow({
  drillMissionId,
  studentId,
  studentBelt = 'white_belt',
  onClearIncoming,
  onReturnToSequence,
}: Props) {
  const [drill, setDrill] = useState<DrillMissionRow | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Seguridad (misiones en el agua) + análisis profundo opcional
  const [checks, setChecks] = useState<Record<SafetyKey, boolean>>({ level: false, entry: false, lineup: false, hazards: false });
  const [waveConditions, setWaveConditions] = useState<string | null>(null);
  const [wind, setWind] = useState<string | null>(null);
  const [tide, setTide] = useState<string | null>(null);
  const [crowdLevel, setCrowdLevel] = useState<string | null>(null);
  const [venueNotes, setVenueNotes] = useState('');

  // Plan
  const [intention, setIntention] = useState('');
  const [plannedDuration, setPlannedDuration] = useState<number>(20);
  const [plannedReps, setPlannedReps] = useState<number>(5);

  // Ready (chips de un toque)
  const [warmUp, setWarmUp] = useState<string | null>(null);
  const [warmUpCustom, setWarmUpCustom] = useState('');
  const [mentalHack, setMentalHack] = useState<string>('none');

  // Evaluación (intacta)
  const [criteriaResults, setCriteriaResults] = useState<Record<number, CriterionResult>>({});
  const [focusRating, setFocusRating] = useState<number>(2);
  const [executionRating, setExecutionRating] = useState<number>(0);
  const [flowChannel, setFlowChannel] = useState<number | null>(null);
  const [notesText, setNotesText] = useState('');
  const [weekCount, setWeekCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setPhase('loading');
    getDrillMissionForTraining(drillMissionId)
      .then((d) => {
        if (!mounted) return;
        if (!d) { setErrorMsg('Drill / mission not found'); setPhase('error'); return; }
        setDrill(d);
        if (d.reps_recommended) {
          const match = d.reps_recommended.match(/(\d+)/);
          if (match) setPlannedReps(parseInt(match[1], 10));
        }
        setPhase('plan');
      })
      .catch((e) => {
        if (!mounted) return;
        setErrorMsg(e?.message || 'Failed to load drill');
        setPhase('error');
      });
    return () => { mounted = false; };
  }, [drillMissionId]);

  if (phase === 'loading') {
    return (
      <div className="text-center py-16">
        <Target size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2" style={{ color: CYAN }} />
        <p className="text-gray-500 text-sm">Loading your mission…</p>
      </div>
    );
  }

  if (phase === 'error' || !drill) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">{errorMsg || 'Something went wrong'}</p>
        <button onClick={onClearIncoming} className="text-sm underline text-gray-600">← Back to Train</button>
      </div>
    );
  }

  const isMission = drill.type === 'mission';
  const successCriteria = drill.success_criteria || [];
  const warmupOptions = SELF_TRAINING_WARMUPS[studentBelt] || SELF_TRAINING_WARMUPS['white_belt'];
  const allSafe = !isMission || SAFETY_CHECKS.every((c) => checks[c.key]);

  // ─── PANTALLA 1 · PLAN ───
  if (phase === 'plan') {
    const canStart = allSafe && plannedDuration >= 1 && plannedReps >= 1;
    return (
      <Shell drill={drill} onCancel={onClearIncoming} step={1}>
        {/* Misión: la protagonista, pre-cargada de My Sequence */}
        <div className="rounded-2xl p-4" style={{ background: INK }}>
          <p className="text-[9px]" style={{ ...F_M, color: CYAN }}>
            Today’s {isMission ? 'mission (in water)' : 'drill (dry land)'} · {drill.step_id}
          </p>
          <p className="text-[20px] mt-1.5" style={{ ...F_D, color: PAPER }}>{drill.title}</p>
          {drill.key_words && drill.key_words.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {drill.key_words.map((kw, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${CYAN}66`, color: CYAN }}>{kw}</span>
              ))}
            </div>
          )}
        </div>

        {drill.videos && drill.videos.length > 0 && (
          <DrillVideoPlayer videos={drill.videos} title={drill.title} />
        )}

        {/* Check de seguridad — 4 toques, 4 respuestas pensadas. Cada sesión. */}
        {isMission && (
          <div className="space-y-1.5">
            <p className="text-[9px] text-gray-400" style={F_M}>Safety check · every session</p>
            {SAFETY_CHECKS.map((c) => {
              const on = checks[c.key];
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setChecks((p) => ({ ...p, [c.key]: !p[c.key] }))}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] text-left transition-colors active:scale-[0.99]"
                  style={on ? { borderColor: GREEN, background: 'rgba(6,214,160,.08)' } : { borderColor: '#e5e7eb', background: '#fff' }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
                    style={on ? { background: GREEN, color: INK } : { border: '1.5px solid #d1d5db', color: 'transparent' }}>✓</span>
                  <span className="text-[13px] leading-snug" style={{ color: on ? '#0a7c5d' : '#374151' }}>{c.label}</span>
                </button>
              );
            })}
            {!checks.level && (
              <p className="text-[11px] leading-snug rounded-xl px-3 py-2" style={{ background: 'rgba(255,209,102,.16)', color: '#7a5c00' }}>
                If today isn’t safe for your level, it’s not your day — the ocean will be here tomorrow.
              </p>
            )}

            {/* Análisis profundo: para el que quiere leer el mar en serio */}
            <details className="rounded-xl border border-gray-200 bg-white">
              <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-[11px] text-gray-500 select-none" style={F_M}>
                <span className="inline-flex items-center gap-1.5"><Waves size={12} /> Deep venue analysis (optional)</span>
                <ChevronDown size={14} className="text-gray-400" />
              </summary>
              <div className="px-3.5 pb-3.5 space-y-3">
                <Picker label="Wave size" options={WAVE_CONDITIONS} value={waveConditions} onChange={setWaveConditions} cols={3} />
                <Picker label="Wind" options={WIND_OPTIONS} value={wind} onChange={setWind} cols={2} />
                <Picker label="Tide" options={TIDE_OPTIONS} value={tide} onChange={setTide} cols={3} />
                <Picker label="Crowd" options={CROWD_OPTIONS} value={crowdLevel} onChange={setCrowdLevel} cols={2} />
                <textarea value={venueNotes} onChange={(e) => setVenueNotes(e.target.value)} rows={2}
                  placeholder="Notes about today’s conditions…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              </div>
            </details>
          </div>
        )}

        {/* Tiempo + reps, con lo esencial a un toque */}
        <div className="space-y-3">
          <div>
            <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Clock size={11} className="inline mr-1 -mt-0.5" />Time on this</p>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 45].map((min) => (
                <Pill key={min} active={plannedDuration === min} onClick={() => setPlannedDuration(min)} label={`${min} min`} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col px-3 py-2 border border-gray-200 rounded-xl bg-white">
              <span className="text-[9px] text-gray-400" style={F_M}>Custom min</span>
              <input type="number" min={1} max={180} value={plannedDuration}
                onChange={(e) => setPlannedDuration(parseInt(e.target.value, 10) || 0)}
                className="text-sm outline-none bg-transparent" />
            </label>
            <label className="flex flex-col px-3 py-2 border border-gray-200 rounded-xl bg-white">
              <span className="text-[9px] text-gray-400" style={F_M}><Repeat size={10} className="inline mr-1 -mt-0.5" />Reps target</span>
              <input type="number" min={1} max={100} value={plannedReps}
                onChange={(e) => setPlannedReps(parseInt(e.target.value, 10) || 0)}
                className="text-sm outline-none bg-transparent" />
            </label>
          </div>
          <details className="rounded-xl border border-gray-200 bg-white">
            <summary className="px-3.5 py-2.5 cursor-pointer text-[11px] text-gray-500 select-none" style={F_M}>
              <Target size={12} className="inline mr-1.5 -mt-0.5" />Specific objective (optional)
            </summary>
            <div className="px-3.5 pb-3">
              <textarea value={intention} onChange={(e) => setIntention(e.target.value)} rows={2}
                placeholder="e.g. posture, knee in, chest forward, scapula…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          </details>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button onClick={onClearIncoming} className="flex-1 py-3.5 rounded-full border border-gray-300 text-sm font-medium text-gray-600 active:scale-[0.98]">
            Cancel
          </button>
          <button onClick={() => setPhase('ready')} disabled={!canStart}
            className="flex-[2] py-3.5 rounded-full text-[11px] transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ ...F_M, background: canStart ? CYAN : '#e5e7eb', color: INK, fontWeight: 700 }}>
            I’m ready →
          </button>
        </div>
        {isMission && !allSafe && (
          <p className="text-[11px] text-gray-400 text-center">Answer the 4 safety questions to continue.</p>
        )}
      </Shell>
    );
  }

  // ─── PANTALLA 2 · READY (warm-up + mantra + go) ───
  if (phase === 'ready') {
    return (
      <Shell drill={drill} onCancel={onClearIncoming} step={2}>
        <div className="rounded-2xl p-5 text-center" style={{ background: INK }}>
          <p className="text-[9px]" style={{ ...F_M, color: CYAN }}>The Surf Sequence</p>
          <p className="text-[24px] mt-2" style={{ ...F_D, color: PAPER }}>Now go practice</p>
          <p className="text-[12.5px] mt-2 leading-relaxed" style={{ color: 'rgba(247,249,250,.7)' }}>
            {isMission
              ? 'The ocean sets the pace. When you finish your reps or feel done, come back and evaluate.'
              : 'Execute the drill on land. When you finish your reps, come back and evaluate.'}
          </p>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div className="rounded-xl p-3 text-left" style={{ background: 'rgba(247,249,250,.07)' }}>
              <p className="text-[8px]" style={{ ...F_M, color: 'rgba(247,249,250,.5)' }}>Planned</p>
              <p className="text-[15px] font-bold mt-0.5" style={{ color: PAPER }}>{plannedDuration} min</p>
            </div>
            <div className="rounded-xl p-3 text-left" style={{ background: 'rgba(247,249,250,.07)' }}>
              <p className="text-[8px]" style={{ ...F_M, color: 'rgba(247,249,250,.5)' }}>Reps target</p>
              <p className="text-[15px] font-bold mt-0.5" style={{ color: PAPER }}>{plannedReps}</p>
            </div>
          </div>
          {intention && (
            <p className="text-[11px] italic mt-3" style={{ color: 'rgba(247,249,250,.6)' }}>“{intention}”</p>
          )}
        </div>

        {/* El plan completo a la vista: qué va a hacer y qué cuenta como
            lograrlo — con esto decide si ancla la mente o rema directo. */}
        {successCriteria.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-3.5">
            <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Check size={11} className="inline mr-1 -mt-0.5" />Today’s plan · what success looks like</p>
            <ul className="space-y-1">
              {successCriteria.map((sc, i) => (
                <li key={i} className="text-[12px] leading-snug flex gap-2" style={{ color: INK }}>
                  <span className="font-bold shrink-0" style={{ color: '#0090B0' }}>{i + 1}.</span>
                  <span>{sc}</span>
                </li>
              ))}
            </ul>
            {drill.key_words && drill.key_words.length > 0 && (
              <p className="text-[10.5px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                Keys: {drill.key_words.join(' · ')}
              </p>
            )}
          </div>
        )}

        {/* Warm-up: un toque, no un paso */}
        <div>
          <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Dumbbell size={11} className="inline mr-1 -mt-0.5" />Warm-up · one tap</p>
          <div className="flex flex-wrap gap-1.5">
            {warmupOptions.map((w) => (
              <Chip key={w.value} active={warmUp === w.value} onClick={() => setWarmUp(w.value)} label={w.label} />
            ))}
            <Chip active={warmUp === 'skip'} onClick={() => setWarmUp('skip')} label="Already warm" muted />
          </div>
          {warmUp === 'custom' && (
            <input value={warmUpCustom} onChange={(e) => setWarmUpCustom(e.target.value)} autoFocus
              placeholder="Describe your warm-up…" className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
          )}
        </div>

        {/* El mantra vivo: tocá y respira con vos. Momento de marca, cero obligación. */}
        <BreathCard
          keyWords={drill.key_words && drill.key_words.length > 0 ? drill.key_words.join(' · ') : null}
          selected={mentalHack}
          onSelect={setMentalHack}
        />

        <button onClick={() => setPhase('evaluation')}
          className="w-full py-4 rounded-full text-[12px] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
          style={{ ...F_M, background: GOLD, color: INK, fontWeight: 700 }}>
          <Check size={16} strokeWidth={2.5} /> I finished — evaluate now
        </button>
        <button onClick={() => setPhase('plan')} className="w-full py-1 text-[11px] text-gray-400">← Back to plan</button>
      </Shell>
    );
  }

  // ─── EVALUACIÓN (profundidad intacta, diseño v10) ───
  if (phase === 'evaluation') {
    const allCriteriaEvaluated =
      successCriteria.length === 0 || successCriteria.every((_, i) => criteriaResults[i] !== undefined);
    const canSave = allCriteriaEvaluated && executionRating > 0 && flowChannel !== null && !saving;

    const handleSave = async () => {
      if (!canSave || !drill) return;
      setSaving(true);
      setErrorMsg('');
      const criteria_evaluation: CriterionEvaluation[] = successCriteria.map((text, i) => ({
        criterion_index: i, criterion_text: text, result: criteriaResults[i],
      }));
      const metCount = criteria_evaluation.filter((c) => c.result === 'met').length;
      const partialCount = criteria_evaluation.filter((c) => c.result === 'partial').length;
      const mission_completion: 'yes' | 'partial' | 'no' =
        metCount === successCriteria.length ? 'yes' : metCount + partialCount > 0 ? 'partial' : 'no';

      const res = await saveLinkedTrainingSession(studentId, drill.id, {
        intention_text: intention || undefined,
        planned_duration_minutes: plannedDuration,
        planned_reps: plannedReps,
        duration_minutes: plannedDuration,
        reps_completed: plannedReps,
        venue_type: isMission ? 'beach' : 'dry_land',
        wave_conditions: isMission ? waveConditions || undefined : undefined,
        wind: isMission ? wind || undefined : undefined,
        tide: isMission ? tide || undefined : undefined,
        crowd_level: isMission ? crowdLevel || undefined : undefined,
        safety_check: allSafe,
        venue_notes: venueNotes || undefined,
        focus_rating: focusRating,
        mission_completion,
        execution_rating: executionRating,
        flow_channel: flowChannel ?? undefined,
        criteria_evaluation,
        notes: notesText || undefined,
      });

      setSaving(false);
      if (res.ok) {
        getWeeklyPracticeCount(studentId).then(setWeekCount).catch(() => {});
        setPhase('done');
      } else {
        setErrorMsg(res.error || 'Failed to save session');
      }
    };

    return (
      <Shell drill={drill} onCancel={onClearIncoming} step={3}>
        <div>
          <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Honest evaluation</p>
          <h3 className="text-[20px] mt-1" style={{ ...F_D, color: INK }}>How did it go?</h3>
          <p className="text-[12.5px] text-gray-500 mt-1">Honesty here is what makes you progress. Your coach validates in person.</p>
        </div>

        {successCriteria.length > 0 && (
          <div>
            <p className="text-[9px] text-gray-400 mb-2" style={F_M}>Success criteria — evaluate each one</p>
            <div className="space-y-2">
              {successCriteria.map((text, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-white">
                  <div className="text-xs text-gray-800 mb-2 leading-relaxed"><span className="font-bold mr-1">{i + 1}.</span>{text}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { key: 'met', label: 'Met', Icon: Check, bg: GREEN, fg: INK },
                      { key: 'partial', label: 'Partial', Icon: CircleDot, bg: GOLD, fg: '#5b4300' },
                      { key: 'not_met', label: 'Not met', Icon: X, bg: '#FF6B6B', fg: '#fff' },
                    ] as const).map((opt) => {
                      const selected = criteriaResults[i] === opt.key;
                      return (
                        <button key={opt.key} onClick={() => setCriteriaResults((prev) => ({ ...prev, [i]: opt.key }))}
                          className="inline-flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-bold transition-colors"
                          style={selected ? { background: opt.bg, color: opt.fg } : { background: '#f3f4f6', color: '#6b7280' }}>
                          <opt.Icon size={12} strokeWidth={2} />{opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Brain size={11} className="inline mr-1 -mt-0.5" />Focus during practice</p>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((n) => {
              const labels = ['Distracted', 'Some', 'Mostly', 'Locked in'];
              const sel = focusRating === n;
              return (
                <button key={n} onClick={() => setFocusRating(n)}
                  className="py-2.5 rounded-xl border-[1.5px] transition-colors active:scale-[0.98] flex flex-col items-center gap-0.5"
                  style={sel ? { background: INK, borderColor: INK, color: PAPER } : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  <span className="text-base font-bold leading-none">{n}</span>
                  <span className="text-[9px] leading-tight opacity-80">{labels[n]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[9px] text-gray-400 mb-1" style={F_M}><Star size={11} className="inline mr-1 -mt-0.5" />Overall execution today</p>
          <p className="text-[11px] text-gray-500 mb-2">This updates your self-rating in My Sequence.</p>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const labels = ["Can't yet", 'Trying', 'Sometimes', 'Consistent', 'Mastery'];
              const sel = executionRating === n;
              return (
                <button key={n} onClick={() => setExecutionRating(n)}
                  className="py-2.5 rounded-xl border-[1.5px] transition-colors active:scale-[0.98] flex flex-col items-center gap-0.5"
                  style={sel ? { background: GOLD, borderColor: GOLD, color: INK } : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  <span className="text-[12px] leading-none">{'★'.repeat(n)}</span>
                  <span className="text-[8px] leading-tight">{labels[n - 1]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[9px] text-gray-400 mb-1" style={F_M}><Target size={11} className="inline mr-1 -mt-0.5" />How did the challenge feel?</p>
          <p className="text-[11px] text-gray-500 mb-2">Flow lives between boredom and frustration. This feeds your Flow Channel.</p>
          <div className="grid grid-cols-5 gap-1.5">
            {([
              { n: 1, label: 'Bored', Icon: Moon },
              { n: 2, label: 'Easy', Icon: Smile },
              { n: 3, label: 'Flow', Icon: Waves },
              { n: 4, label: 'Hard', Icon: Flame },
              { n: 5, label: 'Too much', Icon: AlertTriangle },
            ] as const).map((o) => {
              const sel = flowChannel === o.n;
              return (
                <button key={o.n} onClick={() => setFlowChannel(o.n)}
                  className="py-2.5 rounded-xl border-[1.5px] transition-colors active:scale-[0.98] flex flex-col items-center gap-1"
                  style={sel
                    ? o.n === 3 ? { background: CYAN, borderColor: CYAN, color: INK } : { background: INK, borderColor: INK, color: PAPER }
                    : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  <o.Icon size={16} strokeWidth={1.75} />
                  <span className="text-[8.5px] leading-tight">{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Lightbulb size={11} className="inline mr-1 -mt-0.5" />What you learned (optional)</p>
          <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} rows={3}
            placeholder="One thing you noticed, felt, or want to remember…"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
        </div>

        {errorMsg && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{errorMsg}</p>}

        <button onClick={handleSave} disabled={!canSave}
          className="w-full py-3.5 rounded-full text-[11px] transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ ...F_M, background: canSave ? CYAN : '#e5e7eb', color: INK, fontWeight: 700 }}>
          {saving ? 'Saving…' : <><Save size={14} strokeWidth={2} /> Save & update My Sequence</>}
        </button>
        {!canSave && !saving && (
          <p className="text-[11px] text-gray-400 text-center">
            {!allCriteriaEvaluated ? 'Evaluate every success criterion to continue'
              : executionRating === 0 ? 'Pick an overall execution rating to continue'
              : flowChannel === null ? 'Rate how the challenge felt to continue' : ''}
          </p>
        )}
      </Shell>
    );
  }

  // ─── CIERRE + racha ───
  if (phase === 'done') {
    return (
      <div className="space-y-4 rounded-2xl p-3 sm:p-4" style={{ background: INK }}>
        <div className="bg-white rounded-2xl p-7 text-center shadow-sm space-y-4">
          <svg width="72" height="72" viewBox="0 0 100 100" className="mx-auto" aria-hidden="true">
            <defs><clipPath id="ltf-yy"><circle cx="50" cy="50" r="48" /></clipPath></defs>
            <g clipPath="url(#ltf-yy)">
              <rect width="100" height="100" fill="#0a2a4a" />
              <path d="M50 2 a48 48 0 0 1 0 96 a24 24 0 0 1 0 -48 a24 24 0 0 0 0 -48" fill="#00D2FF" />
              <circle cx="50" cy="26" r="7.5" fill="#0a2a4a" />
              <circle cx="50" cy="74" r="7.5" fill="#00D2FF" />
            </g>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#1f3b57" strokeWidth="2" />
          </svg>
          <div>
            <h2 className="text-[22px]" style={{ ...F_D, color: INK }}>Session saved</h2>
            <p className="text-sm text-gray-500 mt-1">{drill.title} · {drill.step_id}</p>
          </div>

          {weekCount != null && weekCount > 0 && (
            <p className="text-[12px] font-bold rounded-full inline-block px-4 py-1.5" style={{ background: 'rgba(0,210,255,.12)', color: '#0090B0' }}>
              <Flame size={12} className="inline -mt-0.5 mr-1" /> {weekCount} practice{weekCount === 1 ? '' : 's'} in the last 7 days
            </p>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Execution rating</span>
              <span className="font-bold" style={{ color: INK }}>{'★'.repeat(executionRating)}{'☆'.repeat(5 - executionRating)} {executionRating}/5</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Focus level</span>
              <span className="font-bold">{focusRating}/3</span>
            </div>
            {successCriteria.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Criteria met</span>
                <span className="font-bold">{Object.values(criteriaResults).filter((r) => r === 'met').length} / {successCriteria.length}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 rounded-xl p-3 text-xs" style={{ background: 'rgba(255,209,102,.16)', color: '#7a5c00' }}>
            <Check size={13} strokeWidth={2} className="shrink-0" />
            <span>Your self-rating in <strong>My Sequence</strong> is now {executionRating}/5.</span>
          </div>

          <div className="space-y-2 pt-1">
            <button onClick={onReturnToSequence} className="w-full py-3 rounded-full text-[11px]" style={{ ...F_M, background: INK, color: PAPER, fontWeight: 700 }}>
              ← Back to My Sequence
            </button>
            <button onClick={onClearIncoming} className="w-full py-2 text-xs text-gray-500">Stay in Train tab</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── El mantra vivo: Breathe · Focus · Play ───
// Tocás la tarjeta y el círculo respira con vos 15s (box breath 4·4·4 ×1 ciclo
// visible + libre). No es un paso: es un momento. El que no quiere, no lo toca.
function BreathCard({ keyWords, selected, onSelect }: {
  keyWords: string | null;
  selected: string;
  onSelect: (v: string) => void;
}) {
  const [breathing, setBreathing] = useState(false);
  const [breathLabel, setBreathLabel] = useState('Inhale');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startBreath = () => {
    if (breathing) return;
    setBreathing(true);
    onSelect('play');
    timers.current.forEach(clearTimeout);
    timers.current = [];
    // 4s inhala · 4s sostené · 4s exhala — un ciclo guiado y cierra.
    const seq: Array<[string, number]> = [['Inhale', 0], ['Hold', 4000], ['Exhale', 8000], ['Go play', 12000]];
    seq.forEach(([label, at]) => timers.current.push(setTimeout(() => setBreathLabel(label), at)));
    timers.current.push(setTimeout(() => setBreathing(false), 15000));
  };

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  return (
    <div>
      <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}><Brain size={11} className="inline mr-1 -mt-0.5" />Mental anchor · optional</p>
      <button type="button" onClick={startBreath}
        className="w-full rounded-2xl p-4 text-center transition-all active:scale-[0.99] overflow-hidden relative"
        style={{ background: selected === 'play' ? 'rgba(0,210,255,.1)' : '#fff', border: `1.5px solid ${selected === 'play' ? CYAN : '#e5e7eb'}` }}>
        <style>{`@keyframes tssbreath { 0%{transform:scale(.55)} 26%{transform:scale(1)} 53%{transform:scale(1)} 80%{transform:scale(.55)} 100%{transform:scale(.55)} }`}</style>
        <span className="mx-auto mb-2 flex items-center justify-center rounded-full"
          style={{
            width: 56, height: 56, background: 'rgba(0,210,255,.25)', border: `2px solid ${CYAN}`,
            animation: breathing ? 'tssbreath 15s ease-in-out 1' : undefined,
            transform: breathing ? undefined : 'scale(.75)',
            transition: 'transform .5s',
          }}>
          <Play size={18} style={{ color: '#0090B0' }} />
        </span>
        <span className="block text-[14px] font-bold" style={{ color: INK }}>
          {breathing ? breathLabel : 'Breathe · Focus · Play'}
        </span>
        <span className="block text-[10.5px] text-gray-400 mt-0.5">
          {breathing ? 'Follow the circle' : selected === 'play' ? '✓ Anchored — The Surf Sequence mantra' : 'Tap to breathe 15 seconds and drop in'}
        </span>
      </button>
      {keyWords && (
        <button type="button" onClick={() => onSelect(selected === 'key_words' ? 'none' : 'key_words')}
          className="mt-1.5 w-full rounded-full px-3 py-2 text-[10.5px] transition-colors inline-flex items-center justify-center gap-1.5"
          style={selected === 'key_words'
            ? { background: INK, color: CYAN }
            : { background: '#fff', border: '1px solid #e5e7eb', color: '#6b7280' }}>
          <Target size={12} className="shrink-0" /> {selected === 'key_words' ? '✓ ' : ''}Mission key words: {keyWords}
        </button>
      )}
    </div>
  );
}

// ─── Layout v10 ───

function Shell({ drill, onCancel, step, children }: {
  drill: DrillMissionRow; onCancel: () => void; step: 1 | 2 | 3; children: React.ReactNode;
}) {
  const STEPS = ['Plan', 'Play', 'Evaluate'];
  return (
    <div className="space-y-3 rounded-2xl p-3 sm:p-4" style={{ background: INK }}>
      <Banner drill={drill} onCancel={onCancel} />
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <span key={s} className="text-[8px] px-2.5 py-1 rounded-full"
            style={{ ...F_M, background: i + 1 === step ? CYAN : 'rgba(247,249,250,.08)', color: i + 1 === step ? INK : 'rgba(247,249,250,.45)' }}>
            {s}
          </span>
        ))}
      </div>
      <div className="rounded-2xl p-4 space-y-4" style={{ background: PAPER }}>
        {children}
      </div>
    </div>
  );
}

function Banner({ drill, onCancel }: { drill: DrillMissionRow; onCancel: () => void }) {
  const TypeIcon = drill.type === 'drill' ? Dumbbell : Waves;
  return (
    <div className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: '#0A2438', borderLeft: `4px solid ${GOLD}` }}>
      <TypeIcon size={20} strokeWidth={1.75} className="flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
      <div className="flex-1 min-w-0">
        <p className="text-[8px]" style={{ ...F_M, color: GOLD }}>Practicing from My Sequence · {drill.step_id}</p>
        <p className="text-[13px] font-bold truncate mt-0.5" style={{ color: PAPER }}>{drill.title}</p>
      </div>
      <button onClick={onCancel} title="Cancel" aria-label="Cancel linked session"
        className="flex-shrink-0" style={{ color: 'rgba(247,249,250,.5)' }}>
        <X size={17} strokeWidth={2} />
      </button>
    </div>
  );
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-[12.5px] font-semibold border-[1.5px] transition-colors active:scale-[0.98]"
      style={active ? { background: INK, borderColor: INK, color: PAPER } : { background: '#fff', borderColor: '#e5e7eb', color: '#374151' }}>
      {active && <Check size={13} strokeWidth={2.5} className="flex-shrink-0" />}
      {label}
    </button>
  );
}

function Chip({ active, onClick, label, muted }: { active: boolean; onClick: () => void; label: string; muted?: boolean }) {
  return (
    <button onClick={onClick}
      className="px-3 py-2 rounded-full text-[11.5px] font-semibold transition-colors active:scale-[0.97]"
      style={active
        ? { background: GREEN, color: INK }
        : { background: '#fff', border: muted ? '1px dashed #d1d5db' : '1px solid #e5e7eb', color: muted ? '#9ca3af' : '#374151' }}>
      {active ? '✓ ' : ''}{label}
    </button>
  );
}

function Picker({ label, options, value, onChange, cols = 2 }: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
  cols?: 2 | 3 | 4;
}) {
  const colsClass = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4';
  return (
    <div>
      <p className="text-[9px] text-gray-400 mb-1.5" style={F_M}>{label}</p>
      <div className={`grid ${colsClass} gap-1.5`}>
        {options.map((o) => (
          <Pill key={o.value} active={value === o.value} onClick={() => onChange(o.value)} label={o.label} />
        ))}
      </div>
    </div>
  );
}

// ─── Drill / Mission video player ───

function DrillVideoPlayer({ videos, title }: {
  videos: { id: string; url: string; label: string | null }[];
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = videos[Math.min(activeIdx, videos.length - 1)];
  const embedUrl = toEmbedUrlLocal(current.url);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2">
      <p className="text-[9px] text-gray-400" style={F_M}>▶ Demo{videos.length > 1 ? ` (${videos.length} videos)` : ''}</p>
      {videos.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {videos.map((v, i) => (
            <button key={v.id ?? i} type="button" onClick={() => setActiveIdx(i)}
              className="px-2 py-1 text-[10px] font-medium rounded-full whitespace-nowrap"
              style={activeIdx === i ? { background: INK, color: PAPER } : { background: '#fff', border: '1px solid #e5e7eb', color: '#6b7280' }}>
              {v.label || `Video ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <div className="aspect-video bg-black rounded-xl overflow-hidden">
        {embedUrl ? (
          <iframe key={current.url} src={embedUrl} title={current.label || title} className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xs">Invalid video URL</div>
        )}
      </div>
      {current.label && videos.length === 1 && (
        <p className="text-[11px] text-gray-500 italic">{current.label}</p>
      )}
    </div>
  );
}

function toEmbedUrlLocal(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  const gd = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  const gdOpen = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (gdOpen) return `https://drive.google.com/file/d/${gdOpen[1]}/preview`;
  return url;
}
