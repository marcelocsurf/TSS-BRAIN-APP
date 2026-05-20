'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  showLabel?: boolean;
  /**
   * 'self' (default) = amber stars, student self-rating.
   * 'official' = gold stars, coach-assigned canonical rating.
   */
  variant?: 'self' | 'official';
}

const RATING_LABELS: Record<number, string> = {
  1: "Can't do it yet",
  2: "Trying, not consistent",
  3: "Sometimes I do it well",
  4: "Consistent execution",
  5: "Mastery — clean every time",
};

const SIZES = {
  sm: { star: 'text-base', spacing: 'gap-0.5' },
  md: { star: 'text-xl', spacing: 'gap-1' },
  lg: { star: 'text-3xl', spacing: 'gap-1.5' },
};

export function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  showLabel = false,
  variant = 'self',
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  const display = hover ?? value;
  const cls = SIZES[size];

  // Color tokens by variant. M45 — official = TSS cyan (brand color);
  // self-rating stays amber so the two are visually distinct.
  const filledColor = variant === 'official' ? 'text-[var(--tss-cyan,#5AC3E7)]' : 'text-amber-400';
  const emptyColor = variant === 'official' ? 'text-[var(--tss-cyan,#5AC3E7)]/25' : 'text-gray-300';

  return (
    <div className="inline-flex flex-col items-start">
      <div
        className={`inline-flex items-center ${cls.spacing}`}
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = display !== null && n <= display;
          return (
            <button
              key={n}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange?.(n)}
              onMouseEnter={() => !readOnly && setHover(n)}
              className={`${cls.star} transition-all ${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              } ${filled ? filledColor : emptyColor}`}
              aria-label={`Rate ${n} stars${variant === 'official' ? ' (coach official)' : ''}`}
            >
              {filled ? '★' : '☆'}
            </button>
          );
        })}
        {value !== null && size !== 'sm' && (
          <span className="ml-2 text-sm font-medium text-gray-700">
            {value}/5
          </span>
        )}
        {variant === 'official' && value !== null && size !== 'sm' && (
          <span className="ml-1 text-[9px] uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] font-bold">
            Official
          </span>
        )}
      </div>
      {showLabel && (
        <div className="mt-1 text-[11px] text-gray-500 italic">
          {display !== null
            ? RATING_LABELS[display]
            : variant === 'official'
            ? 'Not yet officially evaluated'
            : 'Not rated yet — tap to self-evaluate'}
        </div>
      )}
    </div>
  );
}
