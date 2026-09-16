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
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ServiceCard, paletteFor } from './ServiceCard';

type Camp = Parameters<typeof ServiceCard>[0]['camp'];

type Tpl = {
  id: string;
  template_name: string;
  level_name: string | null;
  service_kind: string | null;
  card_color: string | null;
};

type Props = {
  camps: Camp[];
  view: 'week' | 'month' | 'year';
  anchor: string; // YYYY-MM-DD, the Monday for week view or any day in month/year
  templates?: Tpl[]; // required only for year view
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

export function CampCalendar({ camps, view, anchor, templates = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goto = (next: { view?: 'week' | 'month' | 'year'; anchor?: string }) => {
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
        <div className="hidden md:block bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] border border-[#DCD7C6] p-3 space-y-2">
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
                      : 'text-[#55666E]'
                  }`}
                  style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
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
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-[10px] text-[#55666E]">
                        ‹
                      </span>
                    )}
                    {r.continuesAfter && (
                      <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-[10px] text-[#55666E]">
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
                className="text-[10px] uppercase tracking-wider text-[#55666E] mb-1.5 px-1"
                style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
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
                      isToday ? 'text-[var(--tss-cyan,#5AC3E7)]' : 'text-[#55666E]'
                    }`}
                  >
                    <span
                      className="text-[10px] uppercase tracking-wider font-bold"
                      style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
                    >
                      {dayLabel(d)} {dayNum(d)} {isToday && '· Today'}
                    </span>
                    <span
                      className="text-[10px] text-[#55666E]"
                      style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
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

  // ── Year view ──────────────────────────────
  // Matrix: rows = templates visible to the academy, columns = 52 ISO
  // weeks of the anchor's year. Each cell shows the count of camp_
  // instances of that template starting in that week. Click → drill
  // to that week's Week view.
  if (view === 'year') {
    const year = toUTCDate(anchor).getUTCFullYear();
    // ISO year is approximated by the Monday-of-week-1 anchor: start
    // from Jan 4 (always in week 1 per ISO) and walk back to Monday.
    const jan4 = `${year}-01-04`;
    const yearGridStart = startOfWeek(jan4);
    const weekStarts = Array.from({ length: 52 }, (_, w) => addDays(yearGridStart, w * 7));

    // Bucket camps into (template_id, weekIndex). A camp counts in the
    // week of its start_date.
    const counts = new Map<string, number>();
    for (const c of camps) {
      const tplId = c.template_id ?? '';
      if (!tplId) continue;
      const idx = weekStarts.findIndex(
        (ws) => c.start_date >= ws && c.start_date < addDays(ws, 7),
      );
      if (idx < 0) continue;
      const key = `${tplId}:${idx}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const todayMonday = startOfWeek(todayIso());
    const todayIdx = weekStarts.indexOf(todayMonday);

    return (
      <div className="space-y-3">
        <CalendarHeader
          label={`Year ${year}`}
          view={view}
          onPrev={() => goto({ anchor: `${year - 1}-06-15` })}
          onNext={() => goto({ anchor: `${year + 1}-06-15` })}
          onToday={() => goto({ anchor: todayIso() })}
          onChangeView={(v) => goto({ view: v })}
        />

        {templates.length === 0 ? (
          <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] border border-[#DCD7C6] p-6 text-center text-sm text-[#55666E]">
            No templates available for this academy yet.
          </div>
        ) : (
          <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] border border-[#DCD7C6] overflow-auto">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `220px repeat(52, 36px) 60px`,
              }}
            >
              {/* Top header — month bands + week numbers */}
              <div
                className="sticky left-0 top-0 z-20 bg-[#F7F9FA] border-b border-r border-[#DCD7C6] px-3 py-2 text-[10px] uppercase tracking-wider text-[#55666E]"
                style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
              >
                Service
              </div>
              {weekStarts.map((ws, i) => {
                const monthShort = toUTCDate(ws).toLocaleString('en-US', {
                  month: 'short',
                  timeZone: 'UTC',
                });
                const day = dayNum(ws);
                const isFirstOfMonth = i === 0 || toUTCDate(ws).getUTCMonth() !== toUTCDate(weekStarts[i - 1]).getUTCMonth();
                const isCurrentWeek = i === todayIdx;
                return (
                  <button
                    key={ws}
                    type="button"
                    onClick={() => goto({ view: 'week', anchor: ws })}
                    className={`border-b border-l border-[#DCD7C6] px-1 py-1 text-[9px] text-center transition-colors ${
                      isCurrentWeek
                        ? 'bg-[var(--tss-cyan,#5AC3E7)]/10 text-[var(--tss-cyan,#5AC3E7)] font-bold'
                        : 'text-[#55666E] hover:bg-[#F7F9FA]'
                    }`}
                    style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
                    title={`Week ${i + 1} · ${ws}`}
                  >
                    <div className={isFirstOfMonth ? 'font-semibold text-[#10263B]' : 'invisible'}>
                      {monthShort}
                    </div>
                    <div>{day}</div>
                  </button>
                );
              })}
              <div
                className="border-b border-l border-[#DCD7C6] px-1 py-1 text-[9px] text-center text-[#55666E] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
              >
                Total
              </div>

              {/* Body rows — one per template */}
              {templates.map((tpl) => {
                const rowTotal = weekStarts.reduce(
                  (acc, _, i) => acc + (counts.get(`${tpl.id}:${i}`) ?? 0),
                  0,
                );
                return (
                  <YearTemplateRow
                    key={tpl.id}
                    template={tpl}
                    weekStarts={weekStarts}
                    counts={counts}
                    rowTotal={rowTotal}
                    todayIdx={todayIdx}
                    onCellClick={(ws) => goto({ view: 'week', anchor: ws })}
                  />
                );
              })}

              {/* Bottom totals row */}
              <div
                className="sticky left-0 z-10 bg-[#F7F9FA] border-r border-t border-[#DCD7C6] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#55666E] font-semibold"
                style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
              >
                Total per week
              </div>
              {weekStarts.map((ws, i) => {
                let weekTotal = 0;
                for (const tpl of templates) weekTotal += counts.get(`${tpl.id}:${i}`) ?? 0;
                return (
                  <div
                    key={`tot-${ws}`}
                    className={`border-l border-t border-[#DCD7C6] px-1 py-1 text-center text-[10px] font-mono ${
                      weekTotal > 0 ? 'text-[var(--tss-navy)] font-bold' : 'text-[#B8B1A0]'
                    } ${i === todayIdx ? 'bg-[var(--tss-cyan,#5AC3E7)]/10' : 'bg-[#F7F9FA]'}`}
                  >
                    {weekTotal || ''}
                  </div>
                );
              })}
              <div
                className="bg-[#F7F9FA] border-l border-t border-[#DCD7C6] px-1 py-1 text-center text-[10px] font-bold text-[var(--tss-navy)] font-mono"
              >
                {templates.reduce(
                  (acc, tpl) =>
                    acc +
                    weekStarts.reduce((a, _, i) => a + (counts.get(`${tpl.id}:${i}`) ?? 0), 0),
                  0,
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#55666E] italic px-1">
          Read-only annual panorama · numbers = camp instances · tap any cell or week number to drill into that week.
        </p>
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
  // Plain computation — must NOT use useMemo here because we sit after
  // the Week + Year early returns and React's rules of hooks forbid a
  // hook to be called conditionally on render path.
  const weeks = Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(monthGridStart, w * 7 + d)),
  );

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

      <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] border border-[#DCD7C6] overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-[#DCD7C6] bg-[#F7F9FA]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div
              key={d}
              className="px-2 py-1.5 text-center text-[10px] uppercase tracking-wider text-[#55666E]"
              style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
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
              className="border-b border-[#DCD7C6] last:border-b-0 relative"
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
                      className={`min-h-[90px] border-r border-[#DCD7C6] p-1.5 text-left transition-colors last:border-r-0 ${
                        inMonth ? 'bg-[#F7F9FA]' : 'bg-[#F7F9FA]'
                      } hover:bg-[#F7F9FA]`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[11px] ${
                            isToday
                              ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--tss-cyan,#5AC3E7)] text-white font-bold'
                              : inMonth
                              ? 'text-[#10263B]'
                              : 'text-[#B8B1A0]'
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
                            <span className="text-[8px] text-[#55666E]">+{dayLessons.length - 6}</span>
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
  view: 'week' | 'month' | 'year';
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeView: (v: 'week' | 'month' | 'year') => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          className="p-1.5 rounded-md hover:bg-[#EDF3F5] transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={16} strokeWidth={2} className="text-[#10263B]" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-md hover:bg-[#EDF3F5] transition-colors text-[#10263B]"
          style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
        >
          Today
        </button>
        <button
          type="button"
          onClick={onNext}
          className="p-1.5 rounded-md hover:bg-[#EDF3F5] transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={16} strokeWidth={2} className="text-[#10263B]" />
        </button>
        <span
          className="ml-2 text-sm font-semibold text-[var(--tss-navy)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {label}
        </span>
      </div>
      <div className="inline-flex rounded-lg border-2 border-[var(--tss-navy)] overflow-hidden shadow-sm">
        {(['week', 'month', 'year'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChangeView(v)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors min-w-[80px] ${
              view === v
                ? 'bg-[var(--tss-navy)] text-white'
                : 'bg-[#F7F9FA] text-[var(--tss-navy)] hover:bg-[#F7F9FA]'
            }`}
            style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function YearTemplateRow({
  template,
  weekStarts,
  counts,
  rowTotal,
  todayIdx,
  onCellClick,
}: {
  template: Tpl;
  weekStarts: string[];
  counts: Map<string, number>;
  rowTotal: number;
  todayIdx: number;
  onCellClick: (weekStartIso: string) => void;
}) {
  const cardColor = template.card_color || '#F3F4F6';
  return (
    <>
      <div
        className="sticky left-0 z-10 bg-[#F7F9FA] border-t border-r border-[#DCD7C6] px-3 py-1.5 flex items-center gap-2"
      >
        <span
          className="inline-block w-3 h-3 rounded-sm border border-black/10 shrink-0"
          style={{ backgroundColor: cardColor }}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#10263B] truncate">
            {template.template_name}
          </p>
          {template.level_name && (
            <p
              className="text-[9px] uppercase tracking-wider text-[#55666E]"
              style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
            >
              {template.level_name}
            </p>
          )}
        </div>
      </div>
      {weekStarts.map((ws, i) => {
        const n = counts.get(`${template.id}:${i}`) ?? 0;
        const isCurrentWeek = i === todayIdx;
        return (
          <button
            key={`${template.id}-${ws}`}
            type="button"
            onClick={() => onCellClick(ws)}
            className={`border-t border-l border-[#DCD7C6] text-[11px] font-mono text-center transition-colors ${
              isCurrentWeek ? 'bg-[var(--tss-cyan,#5AC3E7)]/5' : ''
            } ${n > 0 ? 'hover:brightness-95' : 'hover:bg-[#F7F9FA]'}`}
            style={
              n > 0
                ? { backgroundColor: cardColor }
                : undefined
            }
            title={`${template.template_name} · week of ${ws} · ${n} instance${n === 1 ? '' : 's'}`}
          >
            {n > 0 ? (
              <span className={isDarkHex(cardColor) ? 'text-white font-bold' : 'text-black/80 font-bold'}>
                {n}
              </span>
            ) : (
              <span className="text-[#DCD7C6]">·</span>
            )}
          </button>
        );
      })}
      <div
        className={`border-t border-l border-[#DCD7C6] px-1 py-1 text-center text-[10px] font-mono ${
          rowTotal > 0 ? 'text-[var(--tss-navy)] font-bold' : 'text-[#B8B1A0]'
        } bg-[#F7F9FA]`}
      >
        {rowTotal || ''}
      </div>
    </>
  );
}

function isDarkHex(hex: string): boolean {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.6;
}
