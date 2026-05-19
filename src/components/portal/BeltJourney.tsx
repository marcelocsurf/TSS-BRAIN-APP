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
  const current = BELT_DISPLAY[currentBelt];

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

      {/* Horizontal track */}
      <div className="relative px-1">
        {/* Track line */}
        <div className="absolute left-3 right-3 top-[14px] h-[2px] bg-white/15" />
        {/* Progress fill */}
        <div
          className="absolute left-3 top-[14px] h-[2px] bg-[var(--tss-cyan)] transition-all"
          style={{
            width: `calc(${(currentIdx / (BELT_ORDER.length - 1)) * 100}% - ${(currentIdx / (BELT_ORDER.length - 1)) * 24}px)`,
          }}
        />

        <div className="relative flex justify-between">
          {BELT_ORDER.map((belt: BeltLevel, idx: number) => {
            const d = BELT_DISPLAY[belt];
            const isCurrent = belt === currentBelt;
            const isPast = idx < currentIdx;

            return (
              <div key={belt} className="flex flex-col items-center" style={{ width: 32 }}>
                <div
                  className={`relative z-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCurrent
                      ? 'w-7 h-7 ring-2 ring-[var(--tss-cyan)] ring-offset-2 ring-offset-[var(--tss-navy)]'
                      : 'w-6 h-6'
                  } ${!isPast && !isCurrent ? 'opacity-50' : ''}`}
                  style={{
                    backgroundColor: d.color,
                    border: belt === 'white_belt' ? '1.5px solid rgba(255,255,255,0.35)' : 'none',
                  }}
                >
                  {isPast && (
                    <Check
                      size={12}
                      strokeWidth={2.5}
                      style={{ color: SWATCH_TEXT[belt] }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current-belt detail panel */}
      <div className="mt-4 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-wider text-[var(--tss-cyan)] font-bold">
            You are here
          </p>
          <p className="text-sm font-bold text-white leading-tight mt-0.5">
            {current.levelName} <span className="text-white/50 font-normal">· {current.en}</span>
          </p>
        </div>
        <p
          className="text-xs text-white/60 shrink-0 ml-3"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {BELT_HOURS[currentBelt]}
        </p>
      </div>

      <p className="text-[9px] text-white/35 mt-3 leading-relaxed text-center italic">
        10,000-hour rule · average water time per level.
      </p>
    </div>
  );
}
