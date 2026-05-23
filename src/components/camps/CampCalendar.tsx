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
    const weekEnd = days[6];

    // Split camps into multi-day ribbons (surf_camp Mon→Sat blocks) and
    // single-day chips (surf_lesson / custom). A camp counts as multi-day
    // when start_date < end_date.
    const multiDay = camps.filter((c) => c.start_date !== c.end_date);
    const singleDay = camps.filter((c) => c.start_date === c.end_date);

    // For each multi-day camp, work out which week-columns it occupies.
    // Camps that started before this week or end after it are clamped at
    // the week boundary and marked with continuation flags.
    type Ribbon = {
      camp: Camp;
      startCol: number; // 0..6
      endCol: number;   // 0..6
      continuesBefore: boolean;
      continuesAfter: boolean;
    };
    const ribbons: Ribbon[] = multiDay
      .map((c) => {
        if (c.end_date < days[0] || c.start_date > weekEnd) return null;
        const startCol = c.start_date < days[0] ? 0 : days.indexOf(c.start_date);
        const endCol = c.end_date > weekEnd ? 6 : days.indexOf(c.end_date);
        if (startCol < 0 || endCol < 0) return null;
        return {
          camp: c,
          startCol,
          endCol,
          continuesBefore: c.start_date < days[0],
          continuesAfter: c.end_date > weekEnd,
        } as Ribbon;
      })
      .filter((r): r is Ribbon => r !== null)
      .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

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

        {/* ── Desktop layout ────────────────────────── */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 p-3 space-y-2">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const isToday = d === todayIso();
              return (
                <div
                  key={d}
                  className={`text-[10px] uppercase tracking-wider text-center py-1 rounded-md ${
                    isToday
                      ? 'bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-cyan,#5AC3E7)] font-bold'
                      : 'text-gray-400'
                  }`}
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {dayLabel(d)} {dayNum(d)}
                </div>
              );
            })}
          </div>

          {/* Multi-day camp ribbons — each track is a 7-col row */}
          {ribbons.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {ribbons.map((r) => (
                <div key={r.camp.id} className="grid grid-cols-7 gap-2">
                  <div
                    className="relative"
                    style={{
                      gridColumn: `${r.startCol + 1} / ${r.endCol + 2}`,
                    }}
                  >
                    <ServiceCard camp={r.camp} compact />
                    {r.continuesBefore && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                        ‹
                      </span>
                    )}
                    {r.continuesAfter && (
                      <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                        ›
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Single-day items per column */}
          <div className="grid grid-cols-7 gap-2 pt-1">
            {days.map((d) => {
              const items = singleDay.filter((c) => c.start_date === d);
              return (
                <div key={d} className="min-h-[80px] space-y-1.5">
                  {items.map((c) => (
                    <ServiceCard key={c.id} camp={c} compact />
                  ))}
                  {/* Always-visible "+ Add service" so the coordinator can
                      keep stacking services on the same day. Cyan-tinted
                      and bigger when the day is empty so it reads as the
                      primary creation surface; smaller chip when items
                      already exist. */}
                  <Link
                    href={`/camps/new?date=${d}`}
                    className={
                      items.length === 0
                        ? 'block text-center text-xs font-semibold text-[var(--tss-cyan,#5AC3E7)] hover:text-[var(--tss-navy)] py-4 border-2 border-dashed border-[var(--tss-cyan,#5AC3E7)]/40 hover:border-[var(--tss-cyan,#5AC3E7)] rounded-lg bg-[var(--tss-cyan,#5AC3E7)]/5 hover:bg-[var(--tss-cyan,#5AC3E7)]/10 transition-all'
                        : 'block text-center text-[11px] font-medium text-[var(--tss-cyan,#5AC3E7)] hover:text-[var(--tss-navy)] py-1.5 border border-dashed border-[var(--tss-cyan,#5AC3E7)]/40 hover:border-[var(--tss-cyan,#5AC3E7)] rounded-md transition-all'
                    }
                  >
                    <Plus size={items.length === 0 ? 14 : 12} strokeWidth={2} className="inline" />{' '}
                    {items.length === 0 ? 'Add service' : 'Add another'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mobile layout ─────────────────────────── */}
        <div className="md:hidden space-y-4">
          {/* Multi-day camps at top — one card each with the date range */}
          {ribbons.length > 0 && (
            <div>
              <p
                className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 px-1"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                Camps this week ({ribbons.length})
              </p>
              <div className="space-y-1.5">
                {ribbons.map((r) => (
                  <ServiceCard key={r.camp.id} camp={r.camp} />
                ))}
              </div>
            </div>
          )}

          {/* Per-day lessons / custom services */}
          <div className="space-y-3">
            {days.map((d) => {
              const isToday = d === todayIso();
              const items = singleDay.filter((c) => c.start_date === d);
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
                      {items.length || 'empty'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((c) => (
                      <ServiceCard key={c.id} camp={c} />
                    ))}
                    {/* Cyan-tinted creation surface, primary action of
                        the calendar now that "+ New Camp" left the top bar. */}
                    <Link
                      href={`/camps/new?date=${d}`}
                      className={
                        items.length === 0
                          ? 'block text-center text-xs font-semibold text-[var(--tss-cyan,#5AC3E7)] hover:text-[var(--tss-navy)] py-3 border-2 border-dashed border-[var(--tss-cyan,#5AC3E7)]/40 hover:border-[var(--tss-cyan,#5AC3E7)] rounded-lg bg-[var(--tss-cyan,#5AC3E7)]/5 hover:bg-[var(--tss-cyan,#5AC3E7)]/10 transition-all'
                          : 'block text-center text-[11px] font-medium text-[var(--tss-cyan,#5AC3E7)] hover:text-[var(--tss-navy)] py-1.5 border border-dashed border-[var(--tss-cyan,#5AC3E7)]/40 hover:border-[var(--tss-cyan,#5AC3E7)] rounded-lg transition-all'
                      }
                    >
                      <Plus size={items.length === 0 ? 14 : 12} strokeWidth={2} className="inline" />{' '}
                      {items.length === 0 ? 'Add service' : 'Add another'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Month view ─────────────────────────────
  // Render as 6 week-rows. Each week-row is its own grid so multi-day
  // camps can span horizontally Mon→Sat (visually obvious block) and
  // single-day items render as colored dots inside their day cell.
  const monthStart = startOfMonth(anchor);
  const monthGridStart = startOfWeek(monthStart);
  const currentMonth = monthStart.slice(0, 7); // YYYY-MM
  const weeks = useMemo(() => {
    return Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => addDays(monthGridStart, w * 7 + d)),
    );
  }, [monthGridStart]);

  const monthMultiDay = camps.filter((c) => c.start_date !== c.end_date);
  const monthSingleDay = camps.filter((c) => c.start_date === c.end_date);

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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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

        {weeks.map((week, wIdx) => {
          const weekStartIso = week[0];
          const weekEndIso = week[6];

          // Multi-day camps overlapping THIS week → ribbon spans
          const weekRibbons = monthMultiDay
            .map((c) => {
              if (c.end_date < weekStartIso || c.start_date > weekEndIso) return null;
              const startCol = c.start_date < weekStartIso ? 0 : week.indexOf(c.start_date);
              const endCol = c.end_date > weekEndIso ? 6 : week.indexOf(c.end_date);
              if (startCol < 0 || endCol < 0) return null;
              return { camp: c, startCol, endCol };
            })
            .filter((r): r is { camp: Camp; startCol: number; endCol: number } => r !== null);

          return (
            <div
              key={wIdx}
              className="border-b border-gray-100 last:border-b-0 relative"
            >
              {/* Day numbers row */}
              <div className="grid grid-cols-7">
                {week.map((d) => {
                  const isToday = d === todayIso();
                  const inMonth = d.slice(0, 7) === currentMonth;
                  const dayLessons = monthSingleDay.filter((c) => c.start_date === d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => goto({ view: 'week', anchor: d })}
                      className={`min-h-[90px] border-r border-gray-100 p-1.5 text-left transition-colors last:border-r-0 ${
                        inMonth ? 'bg-white' : 'bg-gray-50/50'
                      } hover:bg-gray-50`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[11px] ${
                            isToday
                              ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--tss-cyan,#5AC3E7)] text-white font-bold'
                              : inMonth
                              ? 'text-gray-700'
                              : 'text-gray-300'
                          }`}
                        >
                          {dayNum(d)}
                        </span>
                      </div>
                      {/* Spacer for the ribbons that will overlay this row */}
                      <div style={{ height: weekRibbons.length * 14 }} />
                      {/* Single-day dots */}
                      {dayLessons.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {dayLessons.slice(0, 6).map((c) => {
                            const { backgroundColor } = paletteFor(
                              c.camp_templates?.card_color,
                              c.camp_templates?.accent_color,
                            );
                            return (
                              <span
                                key={c.id}
                                className="block w-2 h-2 rounded-full ring-1 ring-black/10"
                                style={{ backgroundColor }}
                              />
                            );
                          })}
                          {dayLessons.length > 6 && (
                            <span className="text-[8px] text-gray-400">+{dayLessons.length - 6}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Multi-day ribbons overlayed on top of the day grid */}
              {weekRibbons.length > 0 && (
                <div className="pointer-events-none absolute inset-0 grid grid-cols-7 px-1.5 pt-7">
                  <div
                    className="col-span-7 grid grid-cols-7 gap-1"
                    style={{ gridTemplateRows: `repeat(${weekRibbons.length}, 12px)` }}
                  >
                    {weekRibbons.map((r, i) => {
                      const { backgroundColor, onDark } = paletteFor(
                        r.camp.camp_templates?.card_color,
                        r.camp.camp_templates?.accent_color,
                      );
                      return (
                        <Link
                          key={r.camp.id + wIdx}
                          href={`/camps/${r.camp.id}`}
                          className="rounded-sm shadow-sm flex items-center px-1.5 truncate pointer-events-auto hover:brightness-95 transition-all"
                          style={{
                            backgroundColor,
                            gridColumn: `${r.startCol + 1} / ${r.endCol + 2}`,
                            gridRow: i + 1,
                          }}
                        >
                          <span
                            className={`text-[10px] font-semibold truncate ${
                              onDark ? 'text-white' : 'text-black/80'
                            }`}
                          >
                            {r.camp.camp_name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
      <div className="inline-flex rounded-lg border-2 border-[var(--tss-navy)] overflow-hidden shadow-sm">
        {(['week', 'month'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChangeView(v)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors min-w-[80px] ${
              view === v
                ? 'bg-[var(--tss-navy)] text-white'
                : 'bg-white text-[var(--tss-navy)] hover:bg-gray-50'
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
