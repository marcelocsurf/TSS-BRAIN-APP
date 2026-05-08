'use client';

import { useEffect, useState } from 'react';
import {
  getDrillMissionForTraining,
  saveLinkedTrainingSession,
  type DrillMissionRow,
  type CriterionResult,
  type CriterionEvaluation,
} from '@/lib/actions/sequence';

type Phase = 'loading' | 'intent' | 'in_progress' | 'evaluation' | 'done' | 'error';

interface Props {
  drillMissionId: string;
  studentId: string;
  onClearIncoming: () => void;
  onReturnToSequence: () => void;
}

export function LinkedTrainingFlow({
  drillMissionId,
  studentId,
  onClearIncoming,
  onReturnToSequence,
}: Props) {
  const [drill, setDrill] = useState<DrillMissionRow | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Intent state
  const [intention, setIntention] = useState('');
  const [plannedDuration, setPlannedDuration] = useState<number>(20);
  const [plannedReps, setPlannedReps] = useState<number>(5);

  // Evaluation state
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
          setErrorMsg('Drill not found');
          setPhase('error');
          return;
        }
        setDrill(d);
        // Pre-fill reps from canonical recommendation if numeric
        if (d.reps_recommended) {
          const match = d.reps_recommended.match(/(\d+)/);
          if (match) setPlannedReps(parseInt(match[1], 10));
        }
        setPhase('intent');
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

  const typeIcon = drill.type === 'drill' ? '🏖' : '🌊';
  const typeLabel = drill.type === 'drill' ? 'DRILL' : 'MISSION';
  const successCriteria = drill.success_criteria || [];

  // ─── Phase: Intent ───
  if (phase === 'intent') {
    return (
      <div className="space-y-4">
        <Banner drill={drill} onCancel={onClearIncoming} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Step 1 / 3 · Pre-Session Intent
            </div>
            <h3 className="font-bold text-base">Plan your practice</h3>
            <p className="text-xs text-gray-500 mt-1">
              Declare what you'll focus on. The ocean sets the pace, not a clock.
            </p>
          </div>

          {/* Today's intention */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              📝 Today's intention <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g., Focus on keeping elbows close to the body during the roll"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--tss-navy)] focus:outline-none"
            />
          </div>

          {/* Planned duration */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              ⏱ Time you'll focus on this
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 45].map((min) => (
                <button
                  key={min}
                  onClick={() => setPlannedDuration(min)}
                  className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                    plannedDuration === min
                      ? 'bg-[var(--tss-navy)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {min} min
                </button>
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

          {/* Planned reps */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              🔁 Reps you'll complete
              {drill.reps_recommended && (
                <span className="text-[10px] text-gray-400 font-normal ml-1">
                  · Suggested: {drill.reps_recommended}
                </span>
              )}
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

          {/* 5 Key Words reminder */}
          {drill.key_words && drill.key_words.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1.5">
                Remember the chain
              </div>
              <div className="flex flex-wrap gap-1.5">
                {drill.key_words.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-[var(--tss-navy)] text-white text-[10px] font-bold rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setPhase('in_progress')}
            className="w-full py-3 rounded-lg bg-[var(--tss-navy)] text-white font-bold text-sm hover:bg-[var(--tss-navy-dark,#0a1628)] transition-colors"
          >
            Start Practice →
          </button>
          <button
            onClick={onClearIncoming}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── Phase: In Progress ───
  if (phase === 'in_progress') {
    return (
      <div className="space-y-4">
        <Banner drill={drill} onCancel={onClearIncoming} />

        <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[var(--tss-navy-dark,#0a1628)] text-white rounded-xl shadow-lg p-6 text-center space-y-4">
          <div className="text-5xl">🌊</div>
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

        <p className="text-center text-[11px] text-gray-400">
          Take your time. The session is recorded when you save the evaluation.
        </p>
      </div>
    );
  }

  // ─── Phase: Evaluation ───
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
              Step 3 / 3 · Honest Evaluation
            </div>
            <h3 className="font-bold text-base">How did it go?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Honesty here is what makes you progress. Coach validates in person.
            </p>
          </div>

          {/* Per-criterion evaluation */}
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

          {/* Focus rating 0-3 */}
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

          {/* Overall execution 1-5 (updates self-rating) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              ⭐ Overall execution today (1–5)
            </label>
            <p className="text-[11px] text-gray-500 mb-2">
              This updates your self-rating in My Sequence.
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const labels = [
                  "Can't yet",
                  'Trying',
                  'Sometimes',
                  'Consistent',
                  'Mastery',
                ];
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              💭 What you learned <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="One thing you noticed, felt, or want to remember..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--tss-navy)] focus:outline-none"
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

  // ─── Phase: Done ───
  if (phase === 'done') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm space-y-4">
          <div className="text-5xl">🤙</div>
          <div>
            <h2 className="text-xl font-bold text-[var(--tss-navy)]">Session saved</h2>
            <p className="text-sm text-gray-500 mt-1">
              {drill.title} · STP-{drill.step_id?.replace('STP-', '')}
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

// ─── Banner (always visible during linked flow) ───

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
