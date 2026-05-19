'use client';

import { Check } from 'lucide-react';
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

// Text color that reads well on each belt color swatch
const SWATCH_TEXT: Record<BeltLevel, string> = {
  white_belt: '#0A1628',
  yellow_belt: '#0A1628',
  blue_belt: '#ffffff',
  purple_belt: '#ffffff',
  brown_belt: '#ffffff',
  black_belt: '#ffffff',
};

export function BeltJourney({ currentBelt }: { currentBelt: BeltLevel }) {
  const currentIdx = BELT_ORDER.indexOf(currentBelt);

  return (
    <div className="bg-[var(--tss-navy)] rounded-2xl p-4 shadow-sm">
      <p
        className="text-[10px] uppercase tracking-[0.22em] text-[var(--tss-cyan)] mb-1"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        Your Journey
      </p>
      <h3 className="text-sm font-bold text-white mb-4">
        White Belt → Black Belt
      </h3>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-5 bottom-5 w-[2px] bg-white/15" />
        {/* Progress fill */}
        <div
          className="absolute left-[19px] top-5 w-[2px] bg-[var(--tss-cyan)] transition-all"
          style={{
            height: currentIdx === 0
              ? '0%'
              : `${(currentIdx / (BELT_ORDER.length - 1)) * 100}%`,
          }}
        />

        <div className="space-y-3">
          {BELT_ORDER.map((belt: BeltLevel, idx: number) => {
            const d = BELT_DISPLAY[belt];
            const isCurrent = belt === currentBelt;
            const isPast = idx < currentIdx;
            const isFuture = idx > currentIdx;

            return (
              <div
                key={belt}
                className={`relative flex items-center gap-3 transition-all ${isFuture ? 'opacity-40' : ''}`}
              >
                {/* Belt color swatch / node */}
                <div
                  className={`relative z-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCurrent
                      ? 'w-10 h-10 ring-2 ring-[var(--tss-cyan)] ring-offset-2 ring-offset-[var(--tss-navy)]'
                      : 'w-9 h-9'
                  }`}
                  style={{
                    backgroundColor: d.color,
                    border: belt === 'white_belt' ? '1.5px solid rgba(255,255,255,0.35)' : 'none',
                  }}
                >
                  {isPast ? (
                    <Check
                      size={isCurrent ? 16 : 14}
                      strokeWidth={2.5}
                      style={{ color: SWATCH_TEXT[belt] }}
                    />
                  ) : (
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: SWATCH_TEXT[belt] }}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Belt info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`text-sm leading-tight ${
                        isCurrent ? 'text-white font-bold' : isPast ? 'text-white/70 font-medium' : 'text-white/50'
                      }`}
                    >
                      {d.levelName}
                    </p>
                    <p
                      className="text-[11px] shrink-0"
                      style={{ fontFamily: 'DM Mono, monospace', color: isCurrent ? 'var(--tss-cyan)' : 'rgba(255,255,255,0.3)' }}
                    >
                      {BELT_HOURS[belt]}
                    </p>
                  </div>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isCurrent ? 'text-white/60' : 'text-white/30'
                    }`}
                  >
                    {d.en}
                  </p>
                  {isCurrent && (
                    <span
                      className="inline-block text-[9px] uppercase tracking-wider text-[var(--tss-cyan)] font-bold mt-0.5"
                    >
                      You are here
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[9px] text-white/35 mt-5 leading-relaxed text-center italic">
        Based on the 10,000-hour rule and the 80/20 Pareto principle —
        average water time per level.
      </p>
    </div>
  );
}
