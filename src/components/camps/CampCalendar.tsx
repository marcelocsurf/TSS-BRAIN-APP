'use client';

// Coordinator calendar panorama.
//
//   • Week view (default): 7-column grid on desktop, vertical stack on mobile.
//   • Month view: 7-column grid of days with capacity dots per service.
//
// Each camp_instance spans the days it covers (start_date → end_date).
// Camps are placed in the cell of every day they overlap.
//
// Navigation is URL-driven (`?view=week|month&anchor=YYYY-MM-DD`) so
// the back button + shareable links work.

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ServiceCard, paletteFor } from './ServiceCard';

type Camp = Parameters<typeof ServiceCard>[0]['camp'];

type Props = {
  camps: Camp[];
  view: 'week' | 'month';
  anchor: string; // YYYY-MM-DD, the Monday for week view or any day in month for month view
};

// ── date helpers (UTC-safe, no Date timezones shenanigans) ──
function toUTCDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function fromUTCDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(s: string, n: number): string {
  const d = toUTCDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUTCDate(d);
}
function startOfWeek(s: string): string {
  // ISO week: Monday = 1, Sunday = 7
  const d = toUTCDate(s);
  const dow = d.getUTCDay(); // 0=Sun..6=Sat
  const back = dow === 0 ? 6 : dow - 1;
  d.setUTCDate(d.getUTCDate() - back);
  return fromUTCDate(d);
}
function startOfMonth(s: string): string {
  const d = toUTCDate(s);
  d.setUTCDate(1);
  return fromUTCDate(d);
}
function monthLabel(s: string): string {
  return toUTCDate(s).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
function dayLabel(s: string): string {
  return toUTCDate(s).toLocaleString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });
}
function dayNum(s: string): number {
  return toUTCDate(s).getUTCDate();
}
function isInRange(day: string, start: string, end: string): boolean {
  return day >= start && day <= end;
}
function todayIso(): string {
  return fromUTCDate(new Date());
}

export function CampCalendar({ camps, view, anchor }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goto = (next: { view?: 'week' | 'month'; anchor?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.view) params.set('view', next.view);
    if (next.anchor) params.set('anchor', next.anchor);
    router.push(`/camps?${params.toString()}`);
  };

  // ── Week view ──────────────────────────────
  if (view === 'week') {
    const weekStart = startOfWeek(anchor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const campsPerDay = days.map((d) =>
      camps.filter((c) => isInRange(d, c.start_date, c.end_date)),
    );

    return (
      <div className="space-y-3">
        <CalendarHeader
          label={`${dayLabel(days[0])} ${dayNum(days[0])} → ${dayLabel(days[6])} ${dayNum(days[6])} · ${monthLabel(weekStart)}`}
          view={view}
          onPrev={() => goto({ anchor: addDays(weekStart, -7) })}
          onNext={() => goto({ anchor: addDays(weekStart, 7) })}
          onToday={() => goto({ anchor: todayIso() })}
          onChangeView={(v) => goto({ view: v })}
        />

        {/* Desktop: 7-column grid */}
        <div className="hidden md:grid grid-cols-7 gap-2">
          {days.map((d, i) => {
            const isToday = d === todayIso();
            return (
              <div
                key={d}
                className={`min-h-[180px] rounded-xl border p-2 bg-white ${
                  isToday
                    ? 'border-[var(--tss-cyan,#5AC3E7)] shadow-sm'
                    : 'border-gray-100'
                }`}
              >
                <div
                  className={`text-[10px] uppercase tracking-wider mb-2 ${
                    isToday
                      ? 'text-[var(--tss-cyan,#5AC3E7)] font-bold'
                      : 'text-gray-400'
                  }`}
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {dayLabel(d)} {dayNum(d)}
                </div>
                <div className="space-y-1.5">
                  {campsPerDay[i].map((c) => (
                    <ServiceCard key={c.id + d} camp={c} compact />
                  ))}
                  {campsPerDay[i].length === 0 && (
                    <Link
                      href={`/camps/new?date=${d}`}
                      className="block text-center text-[10px] text-gray-300 hover:text-gray-500 py-3 border border-dashed border-gray-150 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <Plus size={12} strokeWidth={2} className="inline" /> Schedule
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical stack */}
        <div className="md:hidden space-y-3">
          {days.map((d, i) => {
            const isToday = d === todayIso();
            return (
              <div key={d}>
                <div
                  className={`flex items-center justify-between mb-1.5 px-1 ${
                    isToday ? 'text-[var(--tss-cyan,#5AC3E7)]' : 'text-gray-500'
                  }`}
                >
                  <span
                    className="text-[10px] uppercase tracking-wider font-bold"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {dayLabel(d)} {dayNum(d)} {isToday && '· Today'}
                  </span>
                  <span
                    className="text-[10px] text-gray-400"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {campsPerDay[i].length || 'empty'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {campsPerDay[i].map((c) => (
                    <ServiceCard key={c.id + d} camp={c} />
                  ))}
                  {campsPerDay[i].length === 0 && (
                    <Link
                      href={`/camps/new?date=${d}`}
                      className="block text-center text-[11px] text-gray-300 hover:text-gray-500 py-2.5 border border-dashed border-gray-200 rounded-lg"
                    >
                      <Plus size={12} strokeWidth={2} className="inline" /> Schedule
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Month view ─────────────────────────────
  const monthStart = startOfMonth(anchor);
  const monthGridStart = startOfWeek(monthStart);
  const gridCells = useMemo(() => {
    // Always render 6 rows × 7 days = 42 cells so the layout is stable.
    return Array.from({ length: 42 }, (_, i) => addDays(monthGridStart, i));
  }, [monthGridStart]);

  const currentMonth = monthStart.slice(0, 7); // YYYY-MM

  return (
    <div className="space-y-3">
      <CalendarHeader
        label={monthLabel(monthStart)}
        view={view}
        onPrev={() => {
          const d = toUTCDate(monthStart);
          d.setUTCMonth(d.getUTCMonth() - 1);
          goto({ anchor: fromUTCDate(d) });
        }}
        onNext={() => {
          const d = toUTCDate(monthStart);
          d.setUTCMonth(d.getUTCMonth() + 1);
          goto({ anchor: fromUTCDate(d) });
        }}
        onToday={() => goto({ anchor: todayIso() })}
        onChangeView={(v) => goto({ view: v })}
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div
              key={d}
              className="px-2 py-1.5 text-center text-[10px] uppercase tracking-wider text-gray-500"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {gridCells.map((d, i) => {
            const dayCamps = camps.filter((c) =>
              isInRange(d, c.start_date, c.end_date),
            );
            const isToday = d === todayIso();
            const inMonth = d.slice(0, 7) === currentMonth;
            return (
              <button
                key={d + i}
                type="button"
                onClick={() => goto({ view: 'week', anchor: d })}
                className={`min-h-[80px] border-r border-b border-gray-100 p-1.5 text-left transition-colors ${
                  inMonth ? 'bg-white' : 'bg-gray-50/50'
                } hover:bg-gray-50`}
              >
                <div
                  className={`text-[11px] mb-1 ${
                    isToday
                      ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--tss-cyan,#5AC3E7)] text-white font-bold'
                      : inMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}
                >
                  {dayNum(d)}
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {dayCamps.slice(0, 6).map((c) => {
                    const { bg, ring } = paletteFor(
                      c.camp_templates?.service_kind,
                      c.camp_templates?.level_name,
                    );
                    return (
                      <span
                        key={c.id + d}
                        className={`block w-1.5 h-1.5 rounded-full ${bg} ${ring ?? ''}`}
                      />
                    );
                  })}
                  {dayCamps.length > 6 && (
                    <span className="text-[8px] text-gray-400">+{dayCamps.length - 6}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarHeader({
  label,
  view,
  onPrev,
  onNext,
  onToday,
  onChangeView,
}: {
  label: string;
  view: 'week' | 'month';
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeView: (v: 'week' | 'month') => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={16} strokeWidth={2} className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-md hover:bg-gray-100 transition-colors text-gray-700"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Today
        </button>
        <button
          type="button"
          onClick={onNext}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={16} strokeWidth={2} className="text-gray-700" />
        </button>
        <span
          className="ml-2 text-sm font-semibold text-[var(--tss-navy)]"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          {label}
        </span>
      </div>
      <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
        {(['week', 'month'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChangeView(v)}
            className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
              view === v
                ? 'bg-[var(--tss-navy)] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
