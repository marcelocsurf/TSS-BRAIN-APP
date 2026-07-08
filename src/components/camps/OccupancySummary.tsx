'use client';

import { useState, useMemo } from 'react';

// Sales/capacity roll-up across the services in view. Filterable by service
// type (client-side, doesn't reload the calendar). Academy scoping is handled
// upstream by the "acting-as academy" switcher, so this already reflects it.

const KIND_LABEL: Record<string, string> = {
  surf_lesson: 'Lessons',
  surf_camp: 'Camps',
  camp: 'Camps',
  custom: 'Custom',
};
const labelFor = (k: string) => KIND_LABEL[k] || k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function OccupancySummary({ camps }: { camps: any[] }) {
  const live = useMemo(() => (camps ?? []).filter((c) => c.status !== 'cancelled'), [camps]);

  // Distinct service kinds present → build the filter tabs.
  const kinds = useMemo(() => {
    const set = new Set<string>();
    for (const c of live) set.add(c.camp_templates?.service_kind || 'custom');
    return Array.from(set);
  }, [live]);

  const [filter, setFilter] = useState<string>('all');

  const shown = filter === 'all' ? live : live.filter((c) => (c.camp_templates?.service_kind || 'custom') === filter);

  const m = useMemo(() => {
    let spots = 0, sold = 0, reserved = 0, soldCents = 0, reservedCents = 0;
    for (const c of shown) {
      spots += c.capacity_override ?? c.camp_templates?.capacity_max ?? 4;
      for (const p of (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active')) {
        if (p.payment_status === 'paid') { sold += 1; soldCents += p.amount_cents ?? 0; }
        else { reserved += 1; reservedCents += p.amount_cents ?? 0; }
      }
    }
    const enrolled = sold + reserved;
    return { spots, sold, reserved, enrolled, available: Math.max(0, spots - enrolled), occupancy: spots ? Math.round((enrolled / spots) * 100) : 0, soldCents, reservedCents };
  }, [shown]);

  if (live.length === 0) return null;

  const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const stats = [
    { label: 'Spots opened', value: String(m.spots), accent: '#0A1628' },
    { label: 'Sold', value: String(m.sold), accent: '#059669' },
    { label: 'Reserved', value: String(m.reserved), accent: '#D97706' },
    { label: 'Available', value: String(m.available), accent: '#6B7280' },
  ];

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          Occupancy · {shown.length} service{shown.length === 1 ? '' : 's'}
        </p>
        <p className="text-[11px] font-semibold" style={{ color: m.occupancy >= 80 ? '#059669' : m.occupancy >= 40 ? '#D97706' : '#6B7280' }}>
          {m.occupancy}% full
        </p>
      </div>

      {/* Type filter tabs (only when there's more than one kind in view) */}
      {kinds.length > 1 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {['all', ...kinds].map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                filter === k ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {k === 'all' ? 'All' : labelFor(k)}
            </button>
          ))}
        </div>
      )}

      <div className="h-2.5 rounded-full overflow-hidden bg-gray-100 flex mb-3">
        <div style={{ width: m.spots ? `${(m.sold / m.spots) * 100}%` : '0%', background: '#059669' }} />
        <div style={{ width: m.spots ? `${(m.reserved / m.spots) * 100}%` : '0%', background: '#F59E0B' }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-xl font-bold leading-none" style={{ color: s.accent }}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1.5" style={{ fontFamily: 'DM Mono, monospace' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {(m.soldCents > 0 || m.reservedCents > 0) && (
        <p className="text-[11px] text-gray-500 mt-3">
          <span className="font-semibold text-emerald-700">{money(m.soldCents)}</span> collected
          {m.reservedCents > 0 && <> · <span className="font-semibold text-amber-700">{money(m.reservedCents)}</span> reserved (unpaid)</>}
          {' · '}<span className="text-gray-400">{money(m.soldCents + m.reservedCents)} committed</span>
        </p>
      )}
    </div>
  );
}
