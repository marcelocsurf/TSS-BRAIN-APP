'use client';

import { useState, useMemo } from 'react';
import { BRAND } from '@/lib/constants/brand';
import {
  OCEAN_QUIZ,
  EMPTY_OCEAN_ANSWERS,
  scoreOceanQuiz,
  isOceanQuizComplete,
  type OceanQuizAnswers,
  type OceanQuestion,
} from '@/lib/constants/ocean-quiz';
import { OCEAN_LEVEL_INFO, type OceanLevel } from '@/lib/constants/ocean-levels';
import { submitOceanQuiz } from '@/lib/actions/intake';
import { Waves } from 'lucide-react';

interface Props {
  token: string;
  initialAnswers?: OceanQuizAnswers | null;
  /** Called once the quiz is submitted successfully. Passes the resolved
   * level and whether the student is a true beginner (never surfed outside
   * whitewater — P0 short-circuit). */
  onComplete: (level: OceanLevel, isBeginner: boolean) => void;
}

export function OceanQuizStep({ token, initialAnswers, onComplete }: Props) {
  const [answers, setAnswers] = useState<OceanQuizAnswers>(
    initialAnswers ?? EMPTY_OCEAN_ANSWERS
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine which questions to show. P0 short-circuit hides P1-P5.
  const visibleQuestions: OceanQuestion[] = useMemo(() => {
    const p0 = OCEAN_QUIZ[0].options.find((o) => o.value === answers.P0);
    if (p0?.shortCircuitTo) return [OCEAN_QUIZ[0]];
    return OCEAN_QUIZ;
  }, [answers.P0]);

  const canSubmit = isOceanQuizComplete(answers);

  const setSingle = (qid: keyof OceanQuizAnswers, value: string) => {
    if (qid === 'P5') return;
    setAnswers((prev) => {
      const next = { ...prev, [qid]: value } as OceanQuizAnswers;
      // If P0 changes to short-circuit, clear P1-P5 to keep state clean
      if (qid === 'P0') {
        const p0opt = OCEAN_QUIZ[0].options.find((o) => o.value === value);
        if (p0opt?.shortCircuitTo) {
          next.P1 = null;
          next.P2 = null;
          next.P3 = null;
          next.P4 = null;
          next.P5 = [];
        }
      }
      return next;
    });
    setError('');
  };

  const toggleP5 = (value: string) => {
    setAnswers((prev) => {
      const has = prev.P5.includes(value);
      return {
        ...prev,
        P5: has ? prev.P5.filter((v) => v !== value) : [...prev.P5, value],
      };
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please answer all questions before continuing.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { level } = scoreOceanQuiz(answers);
      await submitOceanQuiz(token, answers);
      const p0 = OCEAN_QUIZ[0].options.find((o) => o.value === answers.P0);
      const isBeginner = !!p0?.shortCircuitTo;
      onComplete(level, isBeginner);
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)] inline-flex items-center gap-1.5">
            <Waves size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
            Ocean Self-Sufficiency
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            6 quick questions. Helps your coach know exactly what conditions you
            can handle alone vs where you&apos;ll need them beside you.
          </p>
        </div>

        <div className="p-4 space-y-6">
          {visibleQuestions.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              q={q}
              index={idx}
              total={visibleQuestions.length}
              answers={answers}
              onPickSingle={setSingle}
              onToggleMulti={toggleP5}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="w-full py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
        style={{ background: BRAND.colors.navy }}
      >
        {loading
          ? 'Saving...'
          : canSubmit
          ? 'Continue to Safety & Waiver'
          : 'Answer all questions to continue'}
      </button>
    </div>
  );
}

function QuestionBlock({
  q,
  index,
  total,
  answers,
  onPickSingle,
  onToggleMulti,
}: {
  q: OceanQuestion;
  index: number;
  total: number;
  answers: OceanQuizAnswers;
  onPickSingle: (qid: keyof OceanQuizAnswers, value: string) => void;
  onToggleMulti: (value: string) => void;
}) {
  const currentSingle = answers[q.id as keyof OceanQuizAnswers] as string | null;
  const currentMulti = answers.P5;

  return (
    <div>
      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
        Question {index + 1} of {total}
      </p>
      <p className="text-sm font-medium text-gray-800 leading-snug">
        {q.prompt}
      </p>
      {q.helper && (
        <p className="text-[11px] text-gray-500 italic mt-1">{q.helper}</p>
      )}
      <div className="mt-3 space-y-2">
        {q.type === 'single'
          ? q.options.map((o) => {
              const selected = currentSingle === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() =>
                    onPickSingle(q.id as keyof OceanQuizAnswers, o.value)
                  }
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                    selected
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  style={selected ? { background: BRAND.colors.navy } : {}}
                >
                  <span className="text-sm leading-snug">{o.label}</span>
                </button>
              );
            })
          : q.options.map((o) => {
              const checked = currentMulti.includes(o.value);
              return (
                <label
                  key={o.value}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    checked
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  style={checked ? { background: BRAND.colors.navy } : {}}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleMulti(o.value)}
                    className="hidden"
                  />
                  <span
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      checked ? 'border-white' : 'border-gray-300'
                    }`}
                  >
                    {checked && <span className="text-xs">&#10003;</span>}
                  </span>
                  <span className="text-sm leading-snug">{o.label}</span>
                </label>
              );
            })}
      </div>
    </div>
  );
}

/** Compact result view shown briefly between quiz and basic intake. */
export function OceanQuizResult({
  level,
  onContinue,
}: {
  level: OceanLevel;
  onContinue: () => void;
}) {
  const info = OCEAN_LEVEL_INFO[level];
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-3">
        <Waves size={36} strokeWidth={1.5} className="mx-auto text-[var(--tss-cyan,#5AC3E7)]" />
        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
          Provisional Level — {info.short}
        </p>
        <p className="text-lg font-bold text-[var(--tss-navy)]">{info.name}</p>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">{info.cleared}</p>
        <p className="text-[10px] text-gray-400 italic mt-2">
          Your coach will confirm or adjust this in person.
        </p>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        style={{ background: BRAND.colors.navy }}
      >
        Continue to Safety &amp; Waiver
      </button>
    </div>
  );
}
