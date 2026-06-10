import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { getStudentAnalytics } from '@/lib/actions/analytics';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import Link from 'next/link';
import {
  Users,
  Activity,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Building2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) redirect('/dashboard');

  const data = await getStudentAnalytics();
  const t = data.totals;

  const activePct = t.students ? Math.round((t.active30d / t.students) * 100) : 0;
  const leadPct = t.students ? Math.round((t.leads / t.students) * 100) : 0;
  const maxBelt = Math.max(...data.beltDistribution.map((b) => b.count), 1);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform-wide student + engagement metrics
          </p>
        </div>
      </header>

      {/* Hero stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total students"
          value={t.students}
          sub={`${t.members} members · ${t.leads} leads (${leadPct}%)`}
          tone="navy"
        />
        <StatCard
          icon={Activity}
          label="Active (30d)"
          value={t.active30d}
          sub={`${activePct}% of all students`}
          tone="cyan"
        />
        <StatCard
          icon={Sparkles}
          label="Sessions (30d)"
          value={t.sessions30d}
          sub={`${t.avgSessionsPerStudent} avg per student`}
          tone="emerald"
        />
        <StatCard
          icon={Star}
          label="Avg rating"
          value={data.surveyStats.avgRating ?? '—'}
          sub={`${data.surveyStats.totalResponses} responses`}
          tone="amber"
        />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Belt distribution */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[var(--tss-navy)]" />
            <h2 className="text-sm font-semibold text-[var(--tss-navy)]">
              Belt distribution
            </h2>
          </div>
          {data.beltDistribution.length === 0 ? (
            <p className="text-xs text-gray-400">No students yet.</p>
          ) : (
            <div className="space-y-2.5">
              {data.beltDistribution.map((b) => {
                const display = BELT_DISPLAY[b.belt_level as keyof typeof BELT_DISPLAY];
                const color = display?.color || '#9CA3AF';
                const label = display?.en || b.belt_level;
                const pct = (b.count / maxBelt) * 100;
                return (
                  <div key={b.belt_level}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <span
                        className="text-xs text-gray-500 tabular-nums"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {b.count}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                          minWidth: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top students */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-[var(--tss-navy)]" />
            <h2 className="text-sm font-semibold text-[var(--tss-navy)]">
              Top 10 most active (30d)
            </h2>
          </div>
          {data.topStudents.length === 0 ? (
            <p className="text-xs text-gray-400">No sessions yet this period.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.topStudents.map((s, idx) => {
                const display = BELT_DISPLAY[s.belt_level as keyof typeof BELT_DISPLAY];
                return (
                  <Link
                    key={s.id}
                    href={`/students/${s.id}`}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="text-xs text-gray-400 tabular-nums w-5"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: display?.color || '#9CA3AF' }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">{s.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {s.academy_name || 'No academy'}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-semibold text-[var(--tss-navy)] tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {s.sessions_count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Per academy */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building2 size={18} className="text-[var(--tss-navy)]" />
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">
            Per academy breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <Th>Academy</Th>
                <Th align="right">Total</Th>
                <Th align="right">Members</Th>
                <Th align="right">Leads</Th>
                <Th align="right">Active 30d</Th>
                <Th align="right">Sessions 30d</Th>
                <Th align="right">Engagement</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.perAcademy.map((a) => {
                const engagement = a.total ? Math.round((a.active30d / a.total) * 100) : 0;
                return (
                  <tr key={a.academy_id || 'direct'}>
                    <Td>
                      <span className="font-medium text-gray-800">{a.academy_name}</span>
                    </Td>
                    <Td align="right" mono>{a.total}</Td>
                    <Td align="right" mono>{a.members}</Td>
                    <Td align="right" mono>{a.leads}</Td>
                    <Td align="right" mono>{a.active30d}</Td>
                    <Td align="right" mono>{a.sessions30d}</Td>
                    <Td align="right">
                      <span
                        className={`text-xs font-semibold ${
                          engagement >= 50
                            ? 'text-emerald-600'
                            : engagement >= 25
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {engagement}%
                      </span>
                    </Td>
                  </tr>
                );
              })}
              {data.perAcademy.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-xs text-gray-400">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-[11px] text-gray-400 text-center">
        All-time sessions: {t.sessionsAllTime.toLocaleString()} · Data refreshes on each page load
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: any;
  label: string;
  value: number | string;
  sub: string;
  tone: 'navy' | 'cyan' | 'emerald' | 'amber';
}) {
  const tones = {
    navy: 'bg-[var(--tss-navy)] text-white',
    cyan: 'bg-cyan-50 text-[var(--tss-navy)] border border-cyan-200',
    emerald: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border border-amber-200',
  };
  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className="opacity-80" />
        <span
          className="text-[10px] uppercase tracking-wider opacity-70"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-3xl font-bold tabular-nums"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {value}
      </p>
      <p className="text-[11px] opacity-70 mt-1">{sub}</p>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  mono = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  mono?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${align === 'right' ? 'text-right tabular-nums' : ''}`}
      style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}
    >
      {children}
    </td>
  );
}
