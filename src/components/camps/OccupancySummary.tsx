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

// ── date range helpers (UTC, matching the camps page) ──
type Period = 'day' | 'week' | 'month' | 'year' | 'total';
const PERIOD_LABEL: Record<Period, string> = { day: 'Día', week: 'Semana', month: 'Mes', year: 'Año', total: 'Total' };
function toUTC(s: string) { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function ymd(d: Date) { return d.toISOString().slice(0, 10); }
function startOfWeek(s: string) { const d = toUTC(s); const dow = d.getUTCDay(); d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow)); return ymd(d); }
function periodBounds(anchor: string, p: Period): { start: string; end: string } | null {
  if (p === 'total') return null;
  if (p === 'day') return { start: anchor, end: anchor };
  if (p === 'week') { const s = startOfWeek(anchor); const e = toUTC(s); e.setUTCDate(e.getUTCDate() + 6); return { start: s, end: ymd(e) }; }
  const y = anchor.slice(0, 4);
  if (p === 'year') return { start: `${y}-01-01`, end: `${y}-12-31` };
  const mo = anchor.slice(5, 7); // month
  const first = `${y}-${mo}-01`;
  const lastDay = new Date(Date.UTC(Number(y), Number(mo), 0)).getUTCDate();
  return { start: first, end: `${y}-${mo}-${String(lastDay).padStart(2, '0')}` };
}
function humanRange(anchor: string, p: Period): string {
  const b = periodBounds(anchor, p);
  if (!b) return 'todo el histórico';
  const fmt = (s: string, opts: Intl.DateTimeFormatOptions) => toUTC(s).toLocaleDateString('es', { ...opts, timeZone: 'UTC' });
  if (p === 'day') return fmt(anchor, { day: 'numeric', month: 'long', year: 'numeric' });
  if (p === 'year') return anchor.slice(0, 4);
  if (p === 'month') return fmt(b.start, { month: 'long', year: 'numeric' });
  return `${fmt(b.start, { day: 'numeric', month: 'short' })} – ${fmt(b.end, { day: 'numeric', month: 'short' })}`;
}

export function OccupancySummary({ camps, anchor }: { camps: any[]; anchor?: string }) {
  const ref = anchor ?? new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState<Period>('month');

  // Filter by the selected date range first (by camp start_date), then keep the
  // existing service-kind filter below.
  const inPeriod = useMemo(() => {
    const b = periodBounds(ref, period);
    const notCancelled = (camps ?? []).filter((c) => c.status !== 'cancelled');
    if (!b) return notCancelled;
    return notCancelled.filter((c) => c.start_date && c.start_date >= b.start && c.start_date <= b.end);
  }, [camps, ref, period]);
  const live = inPeriod;

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

  // Hide only when the academy has no services at all; otherwise keep the
  // widget so the period toggle stays usable even on empty periods.
  if ((camps ?? []).filter((c) => c.status !== 'cancelled').length === 0) return null;

  const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const stats = [
    { label: 'Spots opened', value: String(m.spots), accent: '#0A1628' },
    { label: 'Sold', value: String(m.sold), accent: '#059669' },
    { label: 'Reserved', value: String(m.reserved), accent: '#D97706' },
    { label: 'Available', value: String(m.available), accent: '#6B7280' },
  ];

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          Occupancy · {shown.length} service{shown.length === 1 ? '' : 's'}
          <span className="text-gray-300"> · {humanRange(ref, period)}</span>
        </p>
        <p className="text-[11px] font-semibold" style={{ color: m.occupancy >= 80 ? '#059669' : m.occupancy >= 40 ? '#D97706' : '#6B7280' }}>
          {m.occupancy}% full
        </p>
      </div>

      {/* Date-range filter — slice occupancy + sales by day / week / month /
          year / total (relative to the calendar's current date). */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {(['day', 'week', 'month', 'year', 'total'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              period === p ? 'bg-[var(--tss-cyan,#5AC3E7)] text-[var(--tss-navy)] border-[var(--tss-cyan,#5AC3E7)]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
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
