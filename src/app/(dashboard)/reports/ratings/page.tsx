import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getRatingsByCoach } from '@/lib/actions/reports-ratings';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard } from '@/components/reports/primitives';
import { Star, Users, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RatingsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const data = await getRatingsByCoach({ from: sp.from, to: sp.to, academyId: sp.academy });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Ratings por coach</h1>
        <p className="text-sm text-gray-500">Satisfacción del alumno (survey al cierre) por coach que corrió la sesión.</p>
      </header>

      <ReportControls exportHref="/reports/ratings/export" />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard icon={Star} label="Promedio general" value={data.totals.avg ?? '—'} sub={`${data.totals.total} respuestas`} tone="amber" />
            <StatCard icon={Users} label="Coaches con rating" value={data.coaches.length} tone="navy" />
            <StatCard icon={Star} label="Respuestas" value={data.totals.total} sub={`${data.from} → ${data.to}`} tone="cyan" />
          </section>

          <ReportCard title="Leaderboard" icon={Star}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Coach</Th>
                    {data.isPlatformAdmin && <Th>Academia</Th>}
                    <Th align="right">Promedio</Th>
                    <Th align="right">N</Th>
                    <Th align="right">★5</Th>
                    <Th align="right">★4</Th>
                    <Th align="right">★3</Th>
                    <Th align="right">★2</Th>
                    <Th align="right">★1</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.coaches.map((c) => (
                    <tr key={c.coachId}>
                      <Td><span className="font-medium text-gray-800">{c.name}</span></Td>
                      {data.isPlatformAdmin && <Td><span className="text-gray-500">{c.academyName || '—'}</span></Td>}
                      <Td align="right">
                        <span className={`font-semibold ${c.avg >= 4.5 ? 'text-emerald-600' : c.avg >= 3.5 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {c.avg.toFixed(1)} ★
                        </span>
                      </Td>
                      <Td align="right" mono>{c.total}</Td>
                      <Td align="right" mono>{c.stars['5'] || '—'}</Td>
                      <Td align="right" mono>{c.stars['4'] || '—'}</Td>
                      <Td align="right" mono>{c.stars['3'] || '—'}</Td>
                      <Td align="right" mono>{c.stars['2'] || '—'}</Td>
                      <Td align="right" mono>{c.stars['1'] || '—'}</Td>
                    </tr>
                  ))}
                  {data.coaches.length === 0 && (
                    <tr><td colSpan={data.isPlatformAdmin ? 9 : 8} className="text-center py-6 text-xs text-gray-400">Sin ratings en este rango.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-400">
            El rating se atribuye al coach que <strong>cerró</strong> la sesión. En camps de varios días, la encuesta apunta al coach del
            último día. Solo se cuentan respuestas con estrella 1–5.
          </p>
        </>
      )}
    </div>
  );
}
