import Link from 'next/link';
import type { PlatformOverviewData, AcademyPulse } from '@/lib/actions/platform-overview';
import { Building2, AlertTriangle, Award, Users, Tent, ClipboardList, TrendingUp } from 'lucide-react';

// Admin "control tower": platform pulse + one card per academy so the admin
// sees where everything (incidents included) is coming from at a glance.
// Server component — data is fetched by the dashboard page.

const timeAgo = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export function PlatformOverview({ data }: { data: PlatformOverviewData }) {
  const { totals, academies } = data;
  const money = totals.salesThisMonth.cents > 0
    ? `$${(totals.salesThisMonth.cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : `${totals.salesThisMonth.count}`;

  return (
    <div className="mb-8">
      {/* ── Platform pulse ── */}
      <p className="tss-section-label">
        <TrendingUp size={11} strokeWidth={1.75} />
        Platform pulse
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <PulseStat label="Active students" value={totals.studentsActive} href="/students" />
        <PulseStat label="Services today" value={totals.servicesToday} href="/camps" />
        <PulseStat label="Unread incidents" value={totals.unreadIncidents} href="/incidents" alert={totals.unreadIncidents > 0} />
        <PulseStat label="Promotions to confirm" value={totals.pendingPromotions} href="/dashboard" alert={totals.pendingPromotions > 0} />
        <PulseStat label="Sales this month" value={money} href="/sales-log" />
        <PulseStat
          label="Experience 30d"
          value={totals.experience30d.score != null ? `${totals.experience30d.score.toFixed(1)} ★` : '—'}
          href="/reports/experiencia"
        />
      </div>

      {/* ── One card per academy ── */}
      <div className="grid gap-3 lg:grid-cols-2">
        {academies.map((a) => (
          <AcademyCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}

function PulseStat({ label, value, href, alert }: { label: string; value: number | string; href: string; alert?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border bg-white px-3 py-3 text-center shadow-sm transition-colors hover:border-[var(--tss-cyan,#5AC3E7)] ${
        alert ? 'border-red-200 bg-red-50' : 'border-gray-100'
      }`}
    >
      <p className={`text-xl font-bold leading-none ${alert ? 'text-red-600' : 'text-[var(--tss-navy)]'}`}>{value}</p>
      <p className="mt-1.5 text-[9px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>
        {label}
      </p>
    </Link>
  );
}

function AcademyCard({ a }: { a: AcademyPulse }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--tss-navy)]/5 text-[var(--tss-navy)] shrink-0">
          <Building2 size={17} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--tss-navy)] truncate">{a.name}</p>
          <p className="text-[10px] text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>
            {a.studentsActive} active students
          </p>
        </div>
        <Link
          href={`/academies`}
          className="text-[11px] font-semibold text-[var(--tss-cyan,#0891b2)] shrink-0"
        >
          Manage →
        </Link>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Today */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1 inline-flex items-center gap-1">
            <Tent size={10} /> Today
          </p>
          {a.servicesToday.length === 0 ? (
            <p className="text-[12px] text-gray-400 italic">No services running today.</p>
          ) : (
            <ul className="space-y-1">
              {a.servicesToday.map((s) => (
                <li key={s.id} className="text-[12px] text-[var(--tss-navy)]">
                  <Link href={`/camps/${s.id}`} className="hover:underline">
                    {s.camp_name}
                  </Link>
                  <span className="text-gray-400">
                    {s.scheduled_time ? ` · ${s.scheduled_time}` : ''}
                    {s.head_coach_name ? ` · ${s.head_coach_name}` : ' · no coach assigned'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Incidents */}
        {(a.unreadIncidents > 0 || a.recentIncidents.length > 0) && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2">
            <p className="text-[9px] font-mono uppercase tracking-wider text-red-600 mb-1 inline-flex items-center gap-1">
              <AlertTriangle size={10} /> Incidents{a.unreadIncidents > 0 ? ` · ${a.unreadIncidents} unread` : ''}
            </p>
            <ul className="space-y-0.5">
              {a.recentIncidents.map((i, idx) => (
                <li key={idx} className="text-[11px] text-red-800 truncate">
                  {(i.type || 'other').replace(/_/g, ' ')} — {i.description || '—'}{' '}
                  <span className="text-red-400">· {timeAgo(i.when)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Needs action */}
        {(a.pendingPromotions > 0 || a.overdueTasks > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {a.pendingPromotions > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                <Award size={10} /> {a.pendingPromotions} promotion{a.pendingPromotions > 1 ? 's' : ''} to confirm
              </span>
            )}
            {a.overdueTasks > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                <ClipboardList size={10} /> {a.overdueTasks} overdue task{a.overdueTasks > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Week numbers */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-gray-50 px-3 py-2 text-center">
            <p className="text-base font-bold text-[var(--tss-navy)] leading-none">{a.weekSessionsClosed}</p>
            <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Sessions this week</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3 py-2 text-center">
            <p className="text-base font-bold text-[var(--tss-navy)] leading-none">{a.weekNewStudents}</p>
            <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>New students this week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
