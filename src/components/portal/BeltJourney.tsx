'use client';

import { BELT_HIERARCHY, BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const BELT_ORDER: BeltLevel[] = BELT_HIERARCHY;

// The White Belt → Black Belt journey, themed after the TSS
// "What is your level?" progression. Hour milestones mirror the
// 10,000-hour / Pareto 80-20 model.
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

  return (
    <div className="bg-[var(--tss-navy)] rounded-2xl p-4 shadow-sm overflow-hidden">
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
        {/* connecting track */}
        <div className="absolute left-0 right-0 top-[18px] h-[2px] bg-white/15" />
        {/* progress fill up to current belt */}
        <div
          className="absolute left-0 top-[18px] h-[2px] bg-[var(--tss-cyan)] transition-all"
          style={{
            width: `${(currentIdx / (BELT_ORDER.length - 1)) * 100}%`,
          }}
        />

        <div className="relative flex justify-between">
          {BELT_ORDER.map((belt: BeltLevel, idx: number) => {
            const d = BELT_DISPLAY[belt];
            const isCurrent = belt === currentBelt;
            const isPast = idx < currentIdx;
            return (
              <div key={belt} className="flex flex-col items-center flex-1 min-w-0">
                {/* node */}
                <div
                  className={`rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCurrent ? 'w-9 h-9 ring-2 ring-[var(--tss-cyan)] ring-offset-2 ring-offset-[var(--tss-navy)]' : 'w-6 h-6'
                  }`}
                  style={{
                    backgroundColor: d.color,
                    border: belt === 'white_belt' ? '1px solid rgba(255,255,255,.4)' : 'none',
                    opacity: isPast || isCurrent ? 1 : 0.4,
                  }}
                >
                  {isCurrent && (
                    <span className="text-[9px] font-bold" style={{ color: belt === 'black_belt' || belt === 'blue_belt' || belt === 'purple_belt' || belt === 'brown_belt' ? '#fff' : '#0A1628' }}>
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* level name */}
                <p
                  className={`text-[9px] mt-2 text-center leading-tight ${
                    isCurrent ? 'text-white font-bold' : 'text-white/55'
                  }`}
                >
                  {d.levelName}
                </p>
                {/* hours */}
                <p
                  className="text-[8px] text-white/35 mt-0.5"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {BELT_HOURS[belt]}
                </p>
                {isCurrent && (
                  <span className="text-[7px] uppercase tracking-wider text-[var(--tss-cyan)] mt-1 font-bold">
                    You are here
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[9px] text-white/40 mt-4 leading-relaxed text-center italic">
        Based on the 10,000-hour rule and the 80/20 Pareto principle — the
        average water time to grow through each level of surfing.
      </p>
    </div>
  );
}
