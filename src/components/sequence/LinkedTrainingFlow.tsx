'use client';

import { useEffect, useState } from 'react';
import {
  getDrillMissionForTraining,
  saveLinkedTrainingSession,
  type DrillMissionRow,
  type CriterionResult,
  type CriterionEvaluation,
} from '@/lib/actions/sequence';
import {
  VENUE_TYPES,
  WAVE_CONDITIONS,
  WIND_OPTIONS,
  TIDE_OPTIONS,
  CROWD_OPTIONS,
} from '@/lib/constants/training';
import {
  SELF_TRAINING_WARMUPS,
  MENTAL_HACK_OPTIONS,
} from '@/lib/constants/brand';

type Phase =
  | 'loading'
  | 'venue'
  | 'warmup'
  | 'intent'
  | 'mental'
  | 'review'
  | 'in_progress'
  | 'evaluation'
  | 'done'
  | 'error';

interface Props {
  drillMissionId: string;
  studentId: string;
  studentBelt?: string;
  onClearIncoming: () => void;
  onReturnToSequence: () => void;
}

const PHASE_ORDER: Phase[] = [
  'venue',
  'warmup',
  'intent',
  'mental',
  'review',
  'in_progress',
  'evaluation',
];

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

  // Venue
  const [venueType, setVenueType] = useState<string | null>(null);
  const [waveConditions, setWaveConditions] = useState<string | null>(null);
  const [wind, setWind] = useState<string | null>(null);
  const [tide, setTide] = useState<string | null>(null);
  const [crowdLevel, setCrowdLevel] = useState<string | null>(null);
  const [safetyCheck, setSafetyCheck] = useState(false);
  const [venueNotes, setVenueNotes] = useState('');

  // Warmup
  const [warmUp, setWarmUp] = useState<string | null>(null);
  const [warmUpCustom, setWarmUpCustom] = useState('');

  // Intent
  const [intention, setIntention] = useState('');
  const [plannedDuration, setPlannedDuration] = useState<number>(20);
  const [plannedReps, setPlannedReps] = useState<number>(5);

  // Mental
  const [mentalHack, setMentalHack] = useState<string | null>(null);

  // Evaluation
  const [criteriaResults, setCriteriaResults] = useState<Record<number, CriterionResult>>({});
  const [focusRating, setFocusRating] = useState<number>(2);
  const [executionRating, setExecutionRating] = useState<number>(0);
  const [notesText, setNotesText] = useState('');

  // Load drill on mount
  useEffect(() => {
    let mounted = true;
    setPhase('loading');
    getDrillMissionForTraining(drillMissionId)
      .then((d) => {
        if (!mounted) return;
        if (!d) {
          setErrorMsg('Drill / mission not found');
          setPhase('error');
          return;
        }
        setDrill(d);
        if (d.reps_recommended) {
          const match = d.reps_recommended.match(/(\d+)/);
          if (match) setPlannedReps(parseInt(match[1], 10));
        }
        setPhase('venue');
      })
      .catch((e) => {
        if (!mounted) return;
        setErrorMsg(e?.message || 'Failed to load drill');
        setPhase('error');
      });
    return () => {
      mounted = false;
    };
  }, [drillMissionId]);

  if (phase === 'loading') {
    return (
      <div className="text-center py-16">
        <div className="animate-pulse text-4xl mb-2">🎯</div>
        <p className="text-gray-500 text-sm">Loading drill...</p>
      </div>
    );
  }

  if (phase === 'error' || !drill) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">{errorMsg || 'Something went wrong'}</p>
        <button onClick={onClearIncoming} className="text-sm underline text-gray-600">
          ← Back to Train
        </button>
      </div>
    );
  }

  const isBeach = venueType === 'beach';
  const successCriteria = drill.success_criteria || [];
  const warmupOptions =
    SELF_TRAINING_WARMUPS[studentBelt] || SELF_TRAINING_WARMUPS['white_belt'];

  // ─── PHASE: VENUE ───
  if (phase === 'venue') {
    const canContinue = !!venueType;
    return (
      <FlowShell drill={drill} phase={phase} onCancel={onClearIncoming}>
        <PhaseHeader
          step="1 / 5"
          title="Venue Analysis"
          subtitle="Where are you practicing today? Read the conditions before you start."
        />

        <div className="space-y-4">
          {/* Venue type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              📍 Where are you?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_TYPES.map((v) => (
                <Pill
                  key={v.value}
                  active={venueType === v.value}
                  onClick={() => setVenueType(v.value)}
                  label={v.label}
                />
              ))}
            </div>
          </div>

          {/* Beach-only fields */}
          {isBeach && (
            <>
              <Picker
                label="🌊 Wave size"
                options={WAVE_CONDITIONS}
                value={waveConditions}
                onChange={setWaveConditions}
                cols={3}
              />
              <Picker
                label="💨 Wind"
                options={WIND_OPTIONS}
                value={wind}
                onChange={setWind}
                cols={2}
              />
              <Picker
                label="🌙 Tide"
                options={TIDE_OPTIONS}
                value={tide}
                onChange={setTide}
                cols={3}
              />
              <Picker
                label="👥 Crowd"
                options={CROWD_OPTIONS}
                value={crowdLevel}
                onChange={setCrowdLevel}
                cols={2}
              />
              <label className="flex items-start gap-2 cursor-pointer p-3 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={safetyCheck}
                  onChange={(e) => setSafetyCheck(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs text-green-900">
                  <strong>Safety check:</strong> I identified the safe zone, the
                  impact zone, hazards, and entry/exit points.
                </span>
              </label>
            </>
          )}

          <textarea
            value={venueNotes}
            onChange={(e) => setVenueNotes(e.target.value)}
            placeholder="Any notes about today's conditions? (optional)"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>

        <NavButtons
          onBack={onClearIncoming}
          backLabel="Cancel"
          onNext={() => setPhase('warmup')}
          nextDisabled={!canContinue}
        />
      </FlowShell>
    );
  }

  // ─── PHASE: WARMUP ───
  if (phase === 'warmup') {
    return (
      <FlowShell drill={drill} phase={phase} onCancel={onClearIncoming}>
        <PhaseHeader
          step="2 / 5"
          title="Warm Up"
          subtitle="Prepare your body and mind. Pick the warm-up that fits today's session."
        />

        <div className="space-y-2">
          {warmupOptions.map((w) => (
            <button
              key={w.value}
              onClick={() => setWarmUp(w.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left text-sm transition-colors ${
                warmUp === w.value
                  ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{w.label}</div>
            </button>
          ))}

          {warmUp === 'custom' && (
            <input
              type="text"
              value={warmUpCustom}
              onChange={(e) => setWarmUpCustom(e.target.value)}
              placeholder="Describe your custom warm-up..."
              className="w-full px-3 py-2 border-2 border-[var(--tss-navy)] rounded-lg text-sm"
              autoFocus
            />
          )}

          <button
            onClick={() => setWarmUp('skip')}
            className={`w-full px-4 py-3 rounded-lg border-2 text-left text-xs transition-colors ${
              warmUp === 'skip'
                ? 'border-gray-400 bg-gray-100'
                : 'border-dashed border-gray-300 hover:border-gray-400 text-gray-500'
            }`}
          >
            Skip warm-up (already warmed up)
          </button>
        </div>

        <NavButtons
          onBack={() => setPhase('venue')}
          onNext={() => setPhase('intent')}
          nextDisabled={!warmUp || (warmUp === 'custom' && !warmUpCustom.trim())}
        />
      </FlowShell>
    );
  }

  // ─── PHASE: INTENT (drill/mission auto-loaded, set duration + reps + intention) ───
  if (phase === 'intent') {
    return (
      <FlowShell drill={drill} phase={phase} onCancel={onClearIncoming}>
        <PhaseHeader
          step={`3 / 5`}
          title={drill.type === 'drill' ? 'Drill Plan' : 'Mission Plan'}
          subtitle={
            drill.type === 'drill'
              ? 'The drill is pre-selected from My Sequence. Set your time and reps.'
              : 'The mission is pre-selected from My Sequence. Set your time and reps.'
          }
        />

        {/* Pre-selected card */}
        <div
          className="rounded-lg p-4 border-2 mb-4"
          style={{
            borderColor: drill.type === 'drill' ? '#fcd34d' : '#93c5fd',
            background: drill.type === 'drill' ? '#fffbeb' : '#eff6ff',
          }}
        >
          <div
            className={`text-[10px] uppercase tracking-wider font-bold ${
              drill.type === 'drill' ? 'text-amber-700' : 'text-blue-700'
            }`}
          >
            {drill.type === 'drill' ? '🏖 DRILL — PRE-SELECTED' : '🌊 MISSION — PRE-SELECTED'}
          </div>
          <div className="font-bold text-sm mt-0.5">{drill.title}</div>
          <div className="text-[11px] text-gray-600 mt-0.5">
            {drill.time_estimate} · Suggested reps: {drill.reps_recommended}
          </div>
          {drill.key_words && drill.key_words.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {drill.key_words.map((kw, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-[var(--tss-navy)] text-white text-[9px] font-bold rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              📝 Today's intention <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g., Focus on keeping elbows close to the body during the roll"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              ⏱ Time you'll focus on this
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 45].map((min) => (
                <Pill
                  key={min}
                  active={plannedDuration === min}
                  onClick={() => setPlannedDuration(min)}
                  label={`${min} min`}
                />
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={180}
              value={plannedDuration}
              onChange={(e) => setPlannedDuration(parseInt(e.target.value, 10) || 0)}
              className="w-full mt-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              placeholder="Custom (minutes)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              🔁 Reps you'll complete
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={plannedReps}
              onChange={(e) => setPlannedReps(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        <NavButtons
          onBack={() => setPhase('warmup')}
          onNext={() => setPhase('mental')}
          nextDisabled={plannedDuration < 1 || plannedReps < 1}
        />
      </FlowShell>
    );
  }

  // ─── PHASE: MENTAL HACK ───
  if (phase === 'mental') {
    return (
      <FlowShell drill={drill} phase={phase} onCancel={onClearIncoming}>
        <PhaseHeader
          step="4 / 5"
          title="Mental Hack"
          subtitle="Pick one mental tool to anchor your focus during practice."
        />

        <div className="space-y-2">
          {MENTAL_HACK_OPTIONS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMentalHack(m.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left text-sm transition-colors ${
                mentalHack === m.value
                  ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{m.label}</div>
            </button>
          ))}
          <button
            onClick={() => setMentalHack('none')}
            className={`w-full px-4 py-3 rounded-lg border-2 text-left text-xs transition-colors ${
              mentalHack === 'none'
                ? 'border-gray-400 bg-gray-100'
                : 'border-dashed border-gray-300 text-gray-500'
            }`}
          >
            None — pure execution
          </button>
        </div>

        <NavButtons
          onBack={() => setPhase('intent')}
          onNext={() => setPhase('review')}
          nextDisabled={!mentalHack}
        />
      </FlowShell>
    );
  }

  // ─── PHASE: REVIEW ───
  if (phase === 'review') {
    const venueLabel =
      VENUE_TYPES.find((v) => v.value === venueType)?.label || venueType || '—';
    const waveLabel = WAVE_CONDITIONS.find((w) => w.value === waveConditions)?.label;
    const windLabel = WIND_OPTIONS.find((w) => w.value === wind)?.label;
    const tideLabel = TIDE_OPTIONS.find((t) => t.value === tide)?.label;
    const crowdLabel = CROWD_OPTIONS.find((c) => c.value === crowdLevel)?.label;
    const warmUpLabel =
      warmUp === 'skip'
        ? 'Skipped'
        : warmUp === 'custom'
        ? `Custom: ${warmUpCustom}`
        : warmupOptions.find((w) => w.value === warmUp)?.label;
    const mentalLabel =
      mentalHack === 'none'
        ? 'None'
        : MENTAL_HACK_OPTIONS.find((m) => m.value === mentalHack)?.label;

    return (
      <FlowShell drill={drill} phase={phase} onCancel={onClearIncoming}>
        <PhaseHeader
          step="5 / 5"
          title="Your Plan"
          subtitle="Review the full session before you go practice."
        />

        <div className="bg-white border-2 border-[var(--tss-navy)]/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-[var(--tss-navy)] text-white text-xs uppercase tracking-wider font-bold">
            Session Plan
          </div>

          <div className="p-4 space-y-3">
            <PlanRow icon="📍" label="Venue" value={venueLabel} />
            {isBeach && (
              <div className="ml-7 space-y-1 text-[11px] text-gray-500">
                {waveLabel && <div>Waves: {waveLabel}</div>}
                {windLabel && <div>Wind: {windLabel}</div>}
                {tideLabel && <div>Tide: {tideLabel}</div>}
                {crowdLabel && <div>Crowd: {crowdLabel}</div>}
                {safetyCheck && <div className="text-green-700">✓ Safety zone identified</div>}
              </div>
            )}
            <PlanRow icon="🏋️" label="Warm-up" value={warmUpLabel || '—'} />
            <PlanRow
              icon={drill.type === 'drill' ? '🏖' : '🌊'}
              label={drill.type === 'drill' ? 'Drill' : 'Mission'}
              value={drill.title}
              accent={drill.type === 'drill' ? 'amber' : 'blue'}
            />
            <PlanRow icon="⏱" label="Time" value={`${plannedDuration} min`} />
            <PlanRow icon="🔁" label="Reps" value={`${plannedReps}`} />
            <PlanRow icon="🧠" label="Mental Hack" value={mentalLabel || '—'} />
            {intention && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2">
                <div className="text-[9px] uppercase font-bold text-amber-700 tracking-wider">
                  Today's intention
                </div>
                <div className="text-xs italic text-amber-900 mt-0.5">"{intention}"</div>
              </div>
            )}
          </div>
        </div>

        <NavButtons
          onBack={() => setPhase('mental')}
          onNext={() => setPhase('in_progress')}
          nextLabel="Start Practice →"
          nextEmphasis
        />
      </FlowShell>
    );
  }

  // ─── PHASE: IN PROGRESS ───
  if (phase === 'in_progress') {
    return (
      <div className="space-y-4">
        <Banner drill={drill} onCancel={onClearIncoming} />

        <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[var(--tss-navy-dark,#0a1628)] text-white rounded-xl shadow-lg p-6 text-center space-y-4">
          <div className="text-5xl">{drill.type === 'mission' ? '🌊' : '🏖'}</div>
          <h3 className="font-bold text-lg">Now go practice</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            {drill.type === 'mission'
              ? 'You are practicing in the water. The ocean sets the pace. When you finish your reps or feel done, come back and evaluate.'
              : 'Execute the drill on land. When you finish your reps, come back and evaluate.'}
          </p>

          <div className="grid grid-cols-2 gap-3 text-left mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Planned</div>
              <div className="text-sm font-bold mt-0.5">{plannedDuration} min</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Reps target</div>
              <div className="text-sm font-bold mt-0.5">{plannedReps}</div>
            </div>
          </div>

          {intention && (
            <div className="bg-white/10 rounded-lg p-3 text-left">
              <div className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Your intention</div>
              <div className="text-xs italic mt-1">"{intention}"</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setPhase('evaluation')}
          className="w-full py-4 rounded-xl bg-amber-400 text-amber-900 font-bold text-base hover:bg-amber-500 transition-colors shadow-md"
        >
          ✓ I finished — Evaluate now
        </button>

        <button
          onClick={() => setPhase('review')}
          className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
        >
          ← Back to plan
        </button>
      </div>
    );
  }

  // ─── PHASE: EVALUATION ───
  if (phase === 'evaluation') {
    const allCriteriaEvaluated =
      successCriteria.length === 0 ||
      successCriteria.every((_, i) => criteriaResults[i] !== undefined);
    const canSave = allCriteriaEvaluated && executionRating > 0 && !saving;

    const handleSave = async () => {
      if (!canSave || !drill) return;
      setSaving(true);
      setErrorMsg('');

      const criteria_evaluation: CriterionEvaluation[] = successCriteria.map((text, i) => ({
        criterion_index: i,
        criterion_text: text,
        result: criteriaResults[i],
      }));

      const metCount = criteria_evaluation.filter((c) => c.result === 'met').length;
      const partialCount = criteria_evaluation.filter((c) => c.result === 'partial').length;
      const mission_completion: 'yes' | 'partial' | 'no' =
        metCount === successCriteria.length
          ? 'yes'
          : metCount + partialCount > 0
          ? 'partial'
          : 'no';

      const res = await saveLinkedTrainingSession(studentId, drill.id, {
        intention_text: intention || undefined,
        planned_duration_minutes: plannedDuration,
        planned_reps: plannedReps,
        duration_minutes: plannedDuration,
        reps_completed: plannedReps,
        venue_type: venueType || undefined,
        wave_conditions: isBeach ? waveConditions || undefined : undefined,
        wind: isBeach ? wind || undefined : undefined,
        tide: isBeach ? tide || undefined : undefined,
        crowd_level: isBeach ? crowdLevel || undefined : undefined,
        safety_check: safetyCheck,
        venue_notes: venueNotes || undefined,
        focus_rating: focusRating,
        mission_completion,
        execution_rating: executionRating,
        criteria_evaluation,
        notes: notesText || undefined,
      });

      setSaving(false);
      if (res.ok) {
        setPhase('done');
      } else {
        setErrorMsg(res.error || 'Failed to save session');
      }
    };

    return (
      <div className="space-y-4 pb-4">
        <Banner drill={drill} onCancel={onClearIncoming} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Honest Evaluation
            </div>
            <h3 className="font-bold text-base">How did it go?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Honesty here is what makes you progress. Coach validates in person.
            </p>
          </div>

          {successCriteria.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-700 font-bold mb-2">
                ✅ Success criteria — evaluate each one
              </div>
              <div className="space-y-2">
                {successCriteria.map((text, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-800 mb-2 leading-relaxed">
                      <span className="font-bold mr-1">{i + 1}.</span>
                      {text}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { key: 'met', label: '✅ Met', color: 'green' },
                          { key: 'partial', label: '🟡 Partial', color: 'amber' },
                          { key: 'not_met', label: '❌ Not met', color: 'red' },
                        ] as const
                      ).map((opt) => {
                        const selected = criteriaResults[i] === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() =>
                              setCriteriaResults((prev) => ({ ...prev, [i]: opt.key }))
                            }
                            className={`py-2 rounded text-[11px] font-bold transition-colors ${
                              selected
                                ? opt.color === 'green'
                                  ? 'bg-green-500 text-white'
                                  : opt.color === 'amber'
                                  ? 'bg-amber-400 text-amber-900'
                                  : 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {opt.label}
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
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              🧠 Focus level during practice (0–3)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((n) => {
                const labels = ['Distracted', 'Some focus', 'Mostly focused', 'Locked in'];
                return (
                  <button
                    key={n}
                    onClick={() => setFocusRating(n)}
                    className={`py-2 rounded text-[10px] font-bold transition-colors flex flex-col items-center gap-0.5 ${
                      focusRating === n
                        ? 'bg-[var(--tss-navy)] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-base leading-none">{n}</span>
                    <span className="text-[9px] leading-tight">{labels[n]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              ⭐ Overall execution today (1–5)
            </label>
            <p className="text-[11px] text-gray-500 mb-2">
              This updates your self-rating in My Sequence.
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const labels = ["Can't yet", 'Trying', 'Sometimes', 'Consistent', 'Mastery'];
                return (
                  <button
                    key={n}
                    onClick={() => setExecutionRating(n)}
                    className={`py-2 rounded text-[10px] font-bold transition-colors flex flex-col items-center gap-0.5 ${
                      executionRating === n
                        ? 'bg-amber-400 text-amber-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-base leading-none">{'★'.repeat(n)}</span>
                    <span className="text-[8px] leading-tight">{labels[n - 1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              💭 What you learned <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="One thing you noticed, felt, or want to remember..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errorMsg}</p>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full py-3 rounded-lg font-bold text-sm transition-colors ${
              canSave
                ? 'bg-[var(--tss-navy)] text-white hover:bg-[var(--tss-navy-dark,#0a1628)]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : '💾 Save & Update My Sequence'}
          </button>
          {!canSave && !saving && (
            <p className="text-[11px] text-gray-400 text-center">
              {executionRating === 0
                ? 'Pick an overall execution rating to continue'
                : !allCriteriaEvaluated
                ? 'Evaluate every success criterion to continue'
                : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── PHASE: DONE ───
  if (phase === 'done') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm space-y-4">
          <div className="text-5xl">🤙</div>
          <div>
            <h2 className="text-xl font-bold text-[var(--tss-navy)]">Session saved</h2>
            <p className="text-sm text-gray-500 mt-1">
              {drill.title} · {drill.step_id}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Execution rating</span>
              <span className="font-bold text-[var(--tss-navy)]">
                {'★'.repeat(executionRating)}
                {'☆'.repeat(5 - executionRating)} {executionRating}/5
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Focus level</span>
              <span className="font-bold">{focusRating}/3</span>
            </div>
            {successCriteria.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Criteria met</span>
                <span className="font-bold">
                  {Object.values(criteriaResults).filter((r) => r === 'met').length} /{' '}
                  {successCriteria.length}
                </span>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            ✓ Your self-rating in <strong>My Sequence</strong> has been updated to {executionRating}/5.
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onReturnToSequence}
              className="w-full py-3 rounded-lg bg-[var(--tss-navy)] text-white font-bold text-sm"
            >
              ← Back to My Sequence
            </button>
            <button
              onClick={onClearIncoming}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Stay in Train tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Layout helpers ───

function FlowShell({
  drill,
  phase,
  onCancel,
  children,
}: {
  drill: DrillMissionRow;
  phase: Phase;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  const stepIndex = PHASE_ORDER.indexOf(phase);
  const totalPlanSteps = 5; // venue → warmup → intent → mental → review

  return (
    <div className="space-y-4">
      <Banner drill={drill} onCancel={onCancel} />

      {/* Progress dots */}
      {phase !== 'in_progress' && phase !== 'evaluation' && phase !== 'done' && (
        <div className="flex items-center justify-center gap-1.5 px-2">
          {Array.from({ length: totalPlanSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < stepIndex
                  ? 'w-6 bg-[var(--tss-navy)]'
                  : i === stepIndex
                  ? 'w-10 bg-[var(--tss-navy)]'
                  : 'w-6 bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
        {children}
      </div>
    </div>
  );
}

function PhaseHeader({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
        Step {step}
      </div>
      <h3 className="font-bold text-base">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function NavButtons({
  onBack,
  backLabel = 'Back',
  onNext,
  nextLabel = 'Next →',
  nextDisabled = false,
  nextEmphasis = false,
}: {
  onBack: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextEmphasis?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        onClick={onBack}
        className="flex-1 py-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`flex-[2] py-3 rounded-lg text-sm font-bold transition-colors ${
          nextDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : nextEmphasis
            ? 'bg-amber-400 text-amber-900 hover:bg-amber-500'
            : 'bg-[var(--tss-navy)] text-white hover:bg-[var(--tss-navy-dark,#0a1628)]'
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function Pill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-lg text-xs font-bold transition-colors ${
        active
          ? 'bg-[var(--tss-navy)] text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
  cols = 2,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
  cols?: 2 | 3 | 4;
}) {
  const colsClass =
    cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4';
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className={`grid ${colsClass} gap-2`}>
        {options.map((o) => (
          <Pill
            key={o.value}
            active={value === o.value}
            onClick={() => onChange(o.value)}
            label={o.label}
          />
        ))}
      </div>
    </div>
  );
}

function PlanRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: 'amber' | 'blue';
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
          {label}
        </div>
        <div
          className={`text-sm font-medium ${
            accent === 'amber'
              ? 'text-amber-900'
              : accent === 'blue'
              ? 'text-blue-900'
              : 'text-gray-800'
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function Banner({ drill, onCancel }: { drill: DrillMissionRow; onCancel: () => void }) {
  const typeIcon = drill.type === 'drill' ? '🏖' : '🌊';
  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">{typeIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">
          🎯 Practicing from My Sequence · {drill.step_id}
        </div>
        <div className="text-sm font-bold text-amber-900 truncate mt-0.5">{drill.title}</div>
        <div className="text-[11px] text-amber-700 mt-0.5">
          {drill.type === 'drill' ? 'Drill (out of water)' : 'Mission (in water)'} ·{' '}
          {drill.time_estimate}
        </div>
      </div>
      <button
        onClick={onCancel}
        title="Cancel linked session"
        className="text-amber-700 hover:text-amber-900 text-lg flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
