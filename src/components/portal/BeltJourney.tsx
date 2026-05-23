'use client';

// Solid "You are here" card — no horizontal dot timeline. Reads as a
// textbook progress indicator: big current-level title + linear
// progress bar (N of 6) + the hour rule for context.

import { BELT_HIERARCHY, BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const BELT_ORDER: BeltLevel[] = BELT_HIERARCHY;

const BELT_HOURS: Record<BeltLevel, string> = {
  white_belt: '20 h',
  yellow_belt: '30 h',
  blue_belt: '200 h',
  purple_belt: '1,000 h',
  brown_belt: '3,000 h',
  black_belt: '10,000 h',
};

export function BeltJourney({ currentBelt }: { currentBelt: BeltLevel }) {
  const currentIdx = BELT_ORDER.indexOf(currentBelt);
  const current = BELT_DISPLAY[currentBelt];
  const next = BELT_ORDER[currentIdx + 1];
  const nextDisplay = next ? BELT_DISPLAY[next] : null;
  const stepNumber = currentIdx + 1;
  const totalSteps = BELT_ORDER.length;
  const percent = (stepNumber / totalSteps) * 100;

  return (
    <div className="bg-[var(--tss-navy)] rounded-2xl p-5 shadow-md">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[var(--tss-cyan)] font-bold"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        You are here
      </p>
      <h3
        className="text-2xl text-white leading-tight mt-1"
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
      >
        {current.levelName}{' '}
        <span className="text-white/55 font-normal text-lg">· {current.en}</span>
      </h3>

      {/* Linear progress — solid, no dots */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[9px] uppercase tracking-wider text-white/55"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Level {stepNumber} of {totalSteps}
          </span>
          <span
            className="text-[9px] uppercase tracking-wider text-white/55"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {BELT_HOURS[currentBelt]} this level
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full"
            style={{ width: `${percent}%`, backgroundColor: current.color }}
          />
        </div>
      </div>

      {nextDisplay && (
        <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p
              className="text-[9px] uppercase tracking-wider text-white/45"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Next
            </p>
            <p
              className="text-sm text-white mt-0.5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {nextDisplay.levelName} · {nextDisplay.en}
            </p>
          </div>
          <span
            className="inline-block w-3 h-3 rounded-full ring-2 ring-white/25 shrink-0"
            style={{ backgroundColor: nextDisplay.color }}
          />
        </div>
      )}

      <p
        className="text-[9px] text-white/35 mt-4 italic"
        style={{ fontFamily: 'var(--font-tagline)' }}
      >
        10,000-hour rule · average water time per level.
      </p>
    </div>
  );
}
