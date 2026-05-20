'use client';

import { useState, useEffect, useTransition } from 'react';
import { BRAND } from '@/lib/constants/brand';
import { Star, Waves, Dumbbell } from 'lucide-react';
import {
  addBlock,
  getDrillsForStep,
  getStepsForBelt,
  getSuggestedDrillsForStudent,
} from '@/lib/actions/multi-block-sessions';

interface DrillRow {
  id: string;
  step_id: string;
  title: string;
  type: 'drill' | 'mission';
  time_estimate: string | null;
  key_words: string[] | null;
  block_name?: string | null;
  currentRating?: number | null;
}

interface StepRow {
  id: string;
  title: string;
  sequence_step_order: number | null;
  wb_sequence_id: string | null;
  wb_sequence_name: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  multiBlockSessionId: string;
  studentId: string;
  beltLevel: string;
}

const DURATION_CHIPS = [10, 15, 20, 30];

export function AddBlockModal({
  open,
  onClose,
  onAdded,
  multiBlockSessionId,
  studentId,
  beltLevel,
}: Props) {
  const [allSteps, setAllSteps] = useState<StepRow[]>([]);
  const [suggested, setSuggested] = useState<DrillRow[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [stepDrills, setStepDrills] = useState<DrillRow[]>([]);
  const [loadingStep, setLoadingStep] = useState(false);

  const [duration, setDuration] = useState(15);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Load steps + suggestions when opening
  useEffect(() => {
    if (!open) return;
    setLoadingInit(true);
    setError('');
    setSelectedStep(null);
    setStepDrills([]);
    setDuration(15);
    Promise.all([
      getStepsForBelt(beltLevel),
      getSuggestedDrillsForStudent(studentId, beltLevel),
    ])
      .then(([steps, sug]) => {
        setAllSteps(steps);
        setSuggested(sug as DrillRow[]);
      })
      .catch((e: any) => setError(e.message || 'Failed to load options'))
      .finally(() => setLoadingInit(false));
  }, [open, beltLevel, studentId]);

  // When a step is picked, fetch its drills
  useEffect(() => {
    if (!selectedStep) {
      setStepDrills([]);
      return;
    }
    setLoadingStep(true);
    getDrillsForStep(selectedStep, beltLevel)
      .then((rows) => setStepDrills(rows as DrillRow[]))
      .catch((e: any) => setError(e.message || 'Failed to load drills'))
      .finally(() => setLoadingStep(false));
  }, [selectedStep, beltLevel]);

  const handleAdd = (drill: DrillRow) => {
    setError('');
    startTransition(async () => {
      try {
        const objective = drill.key_words && drill.key_words.length > 0
          ? drill.key_words.join(' · ')
          : null;
        await addBlock({
          multiBlockSessionId,
          studentId,
          stepId: drill.step_id,
          drillId: drill.id,
          durationMinutes: duration,
          objectiveText: objective,
        });
        onAdded();
      } catch (e: any) {
        setError(e.message || 'Failed to add block');
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Add Block</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingInit ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
          ) : (
            <>
              {/* Duration chips */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Duration
                </p>
                <div className="flex gap-2">
                  {DURATION_CHIPS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDuration(m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                        duration === m
                          ? 'border-transparent text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                      style={duration === m ? { background: BRAND.colors.navy } : {}}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested for this student */}
              {suggested.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-1.5 inline-flex items-center gap-1">
                    <Star size={11} strokeWidth={1.75} className="fill-amber-700" />
                    Suggested — student is struggling here
                  </p>
                  <div className="space-y-1.5">
                    {suggested.slice(0, 3).map((d) => (
                      <DrillRow
                        key={d.id}
                        drill={d}
                        duration={duration}
                        disabled={pending}
                        onAdd={handleAdd}
                        highlight
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step picker */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Or pick part of sequence
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allSteps.map((s) => {
                    const code = s.id.replace('STP-', '');
                    const selected = selectedStep === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStep(s.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                          selected
                            ? 'border-transparent text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                        style={selected ? { background: BRAND.colors.navy } : {}}
                        title={s.title}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
                {selectedStep && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    {allSteps.find((s) => s.id === selectedStep)?.title}
                  </p>
                )}
              </div>

              {/* Drills for selected step */}
              {selectedStep && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Drills for {selectedStep}
                  </p>
                  {loadingStep ? (
                    <p className="text-xs text-gray-400 text-center py-3">Loading…</p>
                  ) : stepDrills.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">
                      No drills available for this step yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {stepDrills.map((d) => (
                        <DrillRow
                          key={d.id}
                          drill={d}
                          duration={duration}
                          disabled={pending}
                          onAdd={handleAdd}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DrillRow({
  drill,
  duration,
  disabled,
  onAdd,
  highlight,
}: {
  drill: DrillRow;
  duration: number;
  disabled: boolean;
  onAdd: (d: DrillRow) => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border ${
        highlight
          ? 'border-amber-200 bg-amber-50/50'
          : 'border-gray-100 hover:border-gray-300'
      } transition`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">
          <span className="text-[10px] font-mono text-gray-400 mr-1">{drill.id}</span>
          {drill.title}
        </p>
        <p className="text-[11px] text-gray-500 truncate inline-flex items-center gap-1">
          {drill.type === 'mission' ? (
            <><Waves size={11} strokeWidth={1.75} /> Mission</>
          ) : (
            <><Dumbbell size={11} strokeWidth={1.75} /> Drill</>
          )}
          {drill.time_estimate ? ` · ${drill.time_estimate}` : ''}
          {typeof drill.currentRating === 'number'
            ? ` · self-rating ${'★'.repeat(drill.currentRating)}${'☆'.repeat(5 - drill.currentRating)}`
            : ''}
        </p>
        {drill.key_words && drill.key_words.length > 0 && (
          <p className="text-[10px] text-gray-400 truncate mt-0.5 italic">
            {drill.key_words.join(' · ')}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAdd(drill)}
        className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-[var(--tss-navy)] text-white hover:opacity-90 disabled:opacity-50"
      >
        + {duration}m
      </button>
    </div>
  );
}
