'use client';

import { CASCADE_STEPS, MOMENT_LABELS, MOMENT_RANGES } from '@/lib/constants/cascade';
import type { CascadeMoment } from '@/types/session';

interface Props {
  currentStep: number;
  isWaterVenue: boolean;
}

export function CascadeProgress({ currentStep, isWaterVenue }: Props) {
  const moments: CascadeMoment[] = ['context', 'planning', 'close'];

  function getMomentForStep(step: number): CascadeMoment {
    if (step <= 5) return 'context';
    if (step <= 13) return 'planning';
    return 'close';
  }

  const currentMoment = getMomentForStep(currentStep);

  // Calculate total effective steps (skip Step 3 if non-water)
  const totalSteps = isWaterVenue ? 22 : 21;
  const effectiveStep = !isWaterVenue && currentStep > 3 ? currentStep - 1 : currentStep;
  const progressPercent = Math.round((effectiveStep / totalSteps) * 100);

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[var(--tss-gray-100)] px-4 py-3 shadow-sm">
      {/* Moment tabs */}
      <div className="flex gap-1 mb-2">
        {moments.map((moment) => {
          const range = MOMENT_RANGES[moment];
          const isActive = currentMoment === moment;
          const isPast = MOMENT_RANGES[moment].end < currentStep;

          return (
            <div
              key={moment}
              className={`flex-1 text-center py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[var(--tss-cyan)] text-white shadow-sm'
                  : isPast
                  ? 'bg-[var(--tss-gold)] text-white'
                  : 'bg-[var(--tss-gray-100)] text-[var(--tss-gray-500)]'
              }`}
            >
              {MOMENT_LABELS[moment]}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--tss-gray-100)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--tss-cyan)] to-[var(--tss-gold)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step label */}
      <p className="text-xs text-[var(--tss-gray-500)] mt-1.5 text-center" style={{ fontFamily: 'var(--font-mono)' }}>
        Step {currentStep} of {isWaterVenue ? 22 : 21}
        {' \u2014 '}
        {CASCADE_STEPS.find((s) => s.id === currentStep)?.label}
      </p>
    </div>
  );
}
