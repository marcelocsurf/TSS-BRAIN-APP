'use client';

import { useState } from 'react';
import type { PeriodStats } from '@/lib/actions/manager-portal';

// Sales & occupancy card with Month / Year / Total tabs (M144). All three
// periods arrive pre-computed from the server — switching is instant.

const F_DISPLAY = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.08 } as const;
const F_LABEL = { fontFamily: 'var(--font-plex), monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' } as const;

const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export function SalesPanel({ periods, targetCents }: {
  periods: { month: PeriodStats; year: PeriodStats; total: PeriodStats };
  targetCents: number | null;
}) {
  const [tab, setTab] = useState<'month' | 'year' | 'total'>('month');
  const p = periods[tab];
  const committed = p.collectedCents + p.reservedCents;
  const showTarget = tab === 'month' && targetCents != null && targetCents > 0;
  const targetPct = showTarget ? Math.min(100, Math.round((committed / targetCents!) * 100)) : 0;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>Sales &amp; occupancy</p>
        <div className="flex gap-1">
          {(['month', 'year', 'total'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-full text-[9px] font-semibold border transition-all ${
                tab === t ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-200'
              }`}
              style={{ ...F_LABEL, letterSpacing: '0.1em', ...(tab === t ? { background: '#061C2B' } : {}) }}
            >
              {t === 'month' ? 'Month' : t === 'year' ? 'Year' : 'Total'}
            </button>
          ))}
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-[19px]" style={{ ...F_DISPLAY, color: '#061C2B' }}>{p.occupancyPct}% full</p>
        <p className="text-[10px] text-gray-400" style={{ ...F_LABEL, letterSpacing: '0.1em' }}>{p.services} services</p>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-gray-100 flex mb-3">
        <div style={{ width: p.spots ? `${(p.sold / p.spots) * 100}%` : '0%', background: '#06D6A0' }} />
        <div style={{ width: p.spots ? `${(p.reserved / p.spots) * 100}%` : '0%', background: '#F59E0B' }} />
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Spots', value: p.spots, color: '#061C2B' },
          { label: 'Sold', value: p.sold, color: '#047857' },
          { label: 'Reserved', value: p.reserved, color: '#B45309' },
          { label: 'Left', value: p.available, color: '#55666E' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-50 px-2 py-2 text-center">
            <p className="text-lg leading-none" style={{ ...F_DISPLAY, color: s.color }}>{s.value}</p>
            <p className="text-[7px] mt-1 text-gray-400" style={{ ...F_LABEL, letterSpacing: '0.1em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-500">
        <span className="font-semibold text-emerald-700">{money(p.collectedCents)}</span> collected
        {p.reservedCents > 0 && <> · <span className="font-semibold text-amber-700">{money(p.reservedCents)}</span> reserved</>}
        {' · '}<span className="text-gray-400">{money(committed)} committed</span>
      </p>

      {/* Monthly sales target — shown only when the academy set one */}
      {showTarget && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px]" style={{ ...F_LABEL, color: '#55666E' }}>Sales goal · month</p>
            <p className="text-[11px] font-bold" style={{ color: targetPct >= 100 ? '#047857' : '#061C2B' }}>
              {money(committed)} / {money(targetCents!)} · {targetPct}%
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${targetPct}%`, background: targetPct >= 100 ? '#06D6A0' : '#00D2FF' }} />
          </div>
        </div>
      )}
    </div>
  );
}
