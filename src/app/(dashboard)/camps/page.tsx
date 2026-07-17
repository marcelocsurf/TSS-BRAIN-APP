import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listCampsInRange, listCampTemplates } from '@/lib/actions/camps';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CampCalendar } from '@/components/camps/CampCalendar';
import { OccupancySummary } from '@/components/camps/OccupancySummary';
import { CampFilters } from '@/components/camps/CampFilters';
import { ApplyWeekTemplateButton } from '@/components/camps/ApplyWeekTemplateButton';
import { DownloadPlanButton } from '@/components/camps/DownloadPlanButton';
import { listWeekTemplates } from '@/lib/actions/week-templates';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── date helpers (UTC, identical to CampCalendar) ──
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
  const d = toUTCDate(s);
  const dow = d.getUTCDay();
  const back = dow === 0 ? 6 : dow - 1;
  d.setUTCDate(d.getUTCDate() - back);
  return fromUTCDate(d);
}
function startOfMonth(s: string): string {
  const d = toUTCDate(s);
  d.setUTCDate(1);
  return fromUTCDate(d);
}
function todayIso(): string {
  return fromUTCDate(new Date());
}

export default async function CampsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    anchor?: string;
    kind?: string;
    level?: string;
    minOpen?: string;
  }>;
}) {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) {
    redirect('/dashboard');
  }

  const {
    view: viewParam,
    anchor: anchorParam,
    kind,
    level,
    minOpen,
  } = await searchParams;
  const view: 'week' | 'month' | 'year' =
    viewParam === 'month' ? 'month' : viewParam === 'year' ? 'year' : 'week';
  const anchor = anchorParam ?? todayIso();

  // Compute the fetch window. Pull a bit of slack on each side so a
  // multi-day camp that started before the window still shows up.
  let rangeStart: string;
  let rangeEnd: string;
  if (view === 'week') {
    rangeStart = addDays(startOfWeek(anchor), -7);
    rangeEnd = addDays(startOfWeek(anchor), 13);
  } else if (view === 'month') {
    const monthStart = startOfMonth(anchor);
    rangeStart = addDays(startOfWeek(monthStart), -7);
    rangeEnd = addDays(startOfWeek(monthStart), 49);
  } else {
    // Year view — full calendar year of the anchor.
    const year = parseInt(anchor.slice(0, 4), 10);
    rangeStart = `${year}-01-01`;
    rangeEnd = `${year}-12-31`;
  }

  const [campsRaw, templates, weekTemplates, occupancyCampsRaw] = await Promise.all([
    listCampsInRange(rangeStart, rangeEnd),
    listCampTemplates(),
    listWeekTemplates(),
    // Broad dataset for the occupancy widget so it can slice by day/month/year/
    // total independently of the calendar's current view window.
    listCampsInRange('2020-01-01', '2100-12-31'),
  ]);

  // Monday of the currently-anchored week — used by the Apply launcher.
  const mondayDate = startOfWeek(anchor);
  const weekEndDate = addDays(mondayDate, 6);
  const weekLabel = `${mondayDate} → ${weekEndDate}`;

  // Apply UI filters server-side so the calendar only renders matches.
  const camps = (campsRaw as any[]).filter((c) => {
    if (kind && c.camp_templates?.service_kind !== kind) return false;
    if (level && c.camp_templates?.level_name !== level) return false;
    if (minOpen) {
      const cap = c.capacity_override ?? c.camp_templates?.capacity_max ?? 4;
      const enrolled = (c.camp_participants ?? []).filter(
        (p: any) => p.enrollment_status === 'active',
      ).length;
      if (cap - enrolled < parseInt(minOpen, 10)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Camps
          </h2>
          <p
            className="text-[10px] uppercase tracking-wider text-gray-400 mt-1"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {camps.length} service{camps.length !== 1 ? 's' : ''} in view
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <ApplyWeekTemplateButton
            weekTemplates={weekTemplates}
            mondayDate={mondayDate}
            weekLabel={weekLabel}
          />
          <Link
            href="/camps/week-templates"
            className="px-3 py-2.5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 text-gray-700 transition-all"
          >
            Week templates
          </Link>
          <Link
            href="/camps/templates"
            className="px-3 py-2.5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 text-gray-700 transition-all"
          >
            Templates
          </Link>
          <DownloadPlanButton />
          {/* "+ New Camp" intentionally removed — creation now happens
              in-context from the calendar's "+ Add service" affordance,
              so the date is always implicit and the top bar stays clean. */}
        </div>
      </div>

      <CampFilters templates={templates as any} />

      <OccupancySummary camps={occupancyCampsRaw as any} anchor={anchor} />

      <CampCalendar
        camps={camps as any}
        view={view}
        anchor={anchor}
        templates={templates as any}
      />
    </div>
  );
}
