import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { getBillingForMonth } from '@/lib/actions/course-grants';
import { COURSES } from '@/lib/constants/courses';
import { BillingMonthClient } from './BillingMonthClient';

// Platform-admin-only billing dashboard. Shows per-academy course-grant
// roll-up for any month. Each academy can be invoiced from the figures
// here. "TSS Direct" rows correspond to grants where the student has
// no academy_id at grant time — those are TSS revenue, not academy
// invoiceable.

interface Props {
  searchParams: Promise<{ month?: string }>;
}

function defaultMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function fmtMonthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function BillingPage({ searchParams }: Props) {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) redirect('/dashboard');

  const { month } = await searchParams;
  const yearMonth = month ?? defaultMonth();
  const rows = await getBillingForMonth(yearMonth);

  // Roll up per academy: total billable cents + count per course.
  type Acc = {
    academy_id: string | null;
    academy_name: string;
    by_course: Record<string, { count: number; cents: number; sources: Record<string, number> }>;
    total_cents: number;
    total_count: number;
    total_revoked: number;
    currency: string;
  };
  const perAcademy = new Map<string, Acc>();
  for (const r of rows) {
    const key = r.academy_id ?? '__direct__';
    const cur =
      perAcademy.get(key) ??
      {
        academy_id: r.academy_id,
        academy_name: r.academy_name,
        by_course: {} as Record<string, { count: number; cents: number; sources: Record<string, number> }>,
        total_cents: 0,
        total_count: 0,
        total_revoked: 0,
        currency: r.currency,
      };
    const courseRow = cur.by_course[r.course_key] ?? { count: 0, cents: 0, sources: {} };
    courseRow.count += r.count;
    courseRow.cents += r.total_cents;
    courseRow.sources[r.source] = (courseRow.sources[r.source] ?? 0) + r.count;
    cur.by_course[r.course_key] = courseRow;
    cur.total_cents += r.total_cents;
    cur.total_count += r.count;
    cur.total_revoked += r.revoked_count;
    perAcademy.set(key, cur);
  }

  const grandTotalCents = Array.from(perAcademy.values()).reduce(
    (a, b) => a + b.total_cents,
    0,
  );
  const grandTotalCount = Array.from(perAcademy.values()).reduce(
    (a, b) => a + b.total_count,
    0,
  );

  const academyRows = Array.from(perAcademy.values()).sort((a, b) => {
    // TSS Direct always last.
    if (!a.academy_id && b.academy_id) return 1;
    if (a.academy_id && !b.academy_id) return -1;
    return a.academy_name.localeCompare(b.academy_name);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p
            className="text-[10px] tracking-[0.22em] text-[var(--tss-cyan,#5AC3E7)] uppercase mb-1 font-semibold"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            TSS Brain · Admin
          </p>
          <h1
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Course Billing — {fmtMonthLabel(yearMonth)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {grandTotalCount} course grant{grandTotalCount === 1 ? '' : 's'} ·{' '}
            ${(grandTotalCents / 100).toFixed(2)} total billable
          </p>
        </div>

        <BillingMonthClient yearMonth={yearMonth} />
      </div>

      {academyRows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
          No course grants in this month.
        </div>
      ) : (
        <div className="space-y-3">
          {academyRows.map((acc) => (
            <div
              key={acc.academy_id ?? 'direct'}
              className={`bg-white rounded-2xl border ${
                acc.academy_id ? 'border-gray-100' : 'border-[var(--tss-cyan,#5AC3E7)]/50'
              } shadow-sm overflow-hidden`}
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2
                    className="text-base font-bold text-[var(--tss-navy)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {acc.academy_name}
                    {!acc.academy_id && (
                      <span
                        className="ml-2 text-[9px] uppercase tracking-wider bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)] px-2 py-0.5 rounded-full font-semibold"
                        style={{ fontFamily: 'DM Mono, monospace' }}
                      >
                        TSS revenue
                      </span>
                    )}
                  </h2>
                  <p
                    className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {acc.total_count} grant{acc.total_count === 1 ? '' : 's'}
                    {acc.total_revoked > 0 && ` · ${acc.total_revoked} revoked`}
                  </p>
                </div>
                <p
                  className="text-xl font-bold text-[var(--tss-navy)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  ${(acc.total_cents / 100).toFixed(2)}
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {Object.entries(acc.by_course).map(([courseKey, row]) => {
                  const course = COURSES.find((c) => c.key === courseKey);
                  return (
                    <div
                      key={courseKey}
                      className="px-5 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {course?.label ?? courseKey}
                        </p>
                        <p
                          className="text-[10px] text-gray-400 mt-0.5"
                          style={{ fontFamily: 'DM Mono, monospace' }}
                        >
                          {Object.entries(row.sources)
                            .map(([s, n]) => `${s}:${n}`)
                            .join(' · ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-[var(--tss-navy)]">
                          {row.count} ×
                        </p>
                        <p
                          className="text-xs text-gray-500"
                          style={{ fontFamily: 'DM Mono, monospace' }}
                        >
                          ${(row.cents / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 italic px-1">
        Revoked grants are not counted in the billable totals.
        academy_id is snapshotted at grant time so future student moves
        don&apos;t rewrite historical invoices.
      </p>
    </div>
  );
}
