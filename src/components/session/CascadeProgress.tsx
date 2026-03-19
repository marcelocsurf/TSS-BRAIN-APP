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
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
      {/* Moment tabs */}
      <div className="flex gap-1 mb-2">
        {moments.map((moment) => {
          const range = MOMENT_RANGES[moment];
          const isActive = currentMoment === moment;
          const isPast = MOMENT_RANGES[moment].end < currentStep;

          return (
            <div
              key={moment}
              className={`flex-1 text-center py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1A1A2E] text-white'
                  : isPast
                  ? 'bg-[#D4A843] text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {MOMENT_LABELS[moment]}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#D4A843] rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step label */}
      <p className="text-xs text-gray-400 mt-1.5 text-center">
        Step {currentStep} of {isWaterVenue ? 22 : 21}
        {' — '}
        {CASCADE_STEPS.find((s) => s.id === currentStep)?.label}
      </p>
    </div>
  );
}
