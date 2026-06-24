import { redirect } from 'next/navigation';
import { getCurrentCoach } from '@/lib/actions/auth';
import { listDetailedCourseGrants } from '@/lib/actions/course-grants';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Channel labels for the `source` column.
const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual',
  auto_on_camp_enrol: 'Camp',
  auto_on_intake: 'Auto (intake)',
  direct_purchase: 'TSS Direct',
  override: 'Override (admin)',
  access_code: 'Access code',
};
const SOURCE_STYLE: Record<string, string> = {
  manual: 'bg-blue-50 text-blue-700',
  auto_on_camp_enrol: 'bg-emerald-50 text-emerald-700',
  auto_on_intake: 'bg-gray-100 text-gray-600',
  direct_purchase: 'bg-purple-50 text-purple-700',
  override: 'bg-amber-50 text-amber-700',
  access_code: 'bg-cyan-50 text-cyan-700',
};

function courseLabel(key: string): string {
  return BELT_DISPLAY[key as BeltLevel]?.en || key.replace(/_/g, ' ');
}
function money(cents: number | null, currency: string | null): string {
  if (cents == null) return '—';
  return `${currency || 'USD'} ${(cents / 100).toFixed(2)}`;
}

export default async function SalesLogPage() {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'coordinator')) redirect('/dashboard');

  const rows = await listDetailedCourseGrants();
  const activeRows = rows.filter((r) => !r.revoked_at);
  const totalCents = activeRows.reduce((s, r) => s + (r.billable && r.price_cents ? r.price_cents : 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Course Sales Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Every course granted — date, channel, student and price. {me.is_platform_admin ? 'All academies.' : 'Your academy.'}
          </p>
        </div>
        <a
          href="/sales-log/export"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90 shrink-0"
        >
          <Download size={15} strokeWidth={1.9} /> CSV
        </a>
      </div>

      <div className="flex gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Active grants</p>
          <p className="text-2xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>{activeRows.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Billable total</p>
          <p className="text-2xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>USD {(totalCents / 100).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 italic">No course grants yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Student</th>
                  <th className="px-4 py-2.5 font-semibold">Course</th>
                  <th className="px-4 py-2.5 font-semibold">Channel</th>
                  {me.is_platform_admin && <th className="px-4 py-2.5 font-semibold">Academy</th>}
                  <th className="px-4 py-2.5 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => (
                  <tr key={r.id} className={r.revoked_at ? 'opacity-40 line-through' : ''}>
                    <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                      {new Date(r.granted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[var(--tss-navy)]">{r.student_name}</td>
                    <td className="px-4 py-2.5 text-gray-700">{courseLabel(r.course_key)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SOURCE_STYLE[r.source] || 'bg-gray-100 text-gray-600'}`}>
                        {SOURCE_LABEL[r.source] || r.source}
                      </span>
                    </td>
                    {me.is_platform_admin && <td className="px-4 py-2.5 text-gray-600">{r.academy_name}</td>}
                    <td className="px-4 py-2.5 text-right text-gray-700 whitespace-nowrap">
                      {r.billable ? money(r.price_cents, r.currency) : 'Free'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
