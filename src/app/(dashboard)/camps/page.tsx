import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listCampsInRange } from '@/lib/actions/camps';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CampCalendar } from '@/components/camps/CampCalendar';

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
  searchParams: Promise<{ view?: string; anchor?: string }>;
}) {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) {
    redirect('/dashboard');
  }

  const { view: viewParam, anchor: anchorParam } = await searchParams;
  const view: 'week' | 'month' = viewParam === 'month' ? 'month' : 'week';
  const anchor = anchorParam ?? todayIso();

  // Compute the fetch window. Pull a bit of slack on each side so a
  // multi-day camp that started before the window still shows up.
  let rangeStart: string;
  let rangeEnd: string;
  if (view === 'week') {
    rangeStart = addDays(startOfWeek(anchor), -7);
    rangeEnd = addDays(startOfWeek(anchor), 13);
  } else {
    const monthStart = startOfMonth(anchor);
    rangeStart = addDays(startOfWeek(monthStart), -7);
    rangeEnd = addDays(startOfWeek(monthStart), 49);
  }

  const camps = await listCampsInRange(rangeStart, rangeEnd);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
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
        <div className="flex gap-2">
          <Link
            href="/camps/templates"
            className="px-3 py-2.5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 text-gray-700 transition-all"
          >
            Templates
          </Link>
          <Link
            href="/camps/new"
            className="px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all shadow-sm"
          >
            + New Camp
          </Link>
        </div>
      </div>

      <CampCalendar camps={camps as any} view={view} anchor={anchor} />
    </div>
  );
}
