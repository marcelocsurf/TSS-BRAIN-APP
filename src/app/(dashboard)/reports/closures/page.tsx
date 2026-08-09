import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getClosuresByCoach } from '@/lib/actions/reports-closures';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard } from '@/components/reports/primitives';
import { CheckSquare, AlertTriangle, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function complianceTone(pct: number | null): string {
  if (pct == null) return 'text-gray-400';
  if (pct >= 90) return 'text-emerald-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-rose-600';
}

export default async function ClosuresReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const data = await getClosuresByCoach({ from: sp.from, to: sp.to, academyId: sp.academy });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Cierres por coach</h1>
        <p className="text-sm text-gray-500">Cumplimiento de cierre de sesiones (el cierre habilita el pago). Sin cierre = no pagable.</p>
      </header>

      <ReportControls exportHref="/reports/closures/export" />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={CheckSquare} label="Cumplimiento" value={data.totals.compliancePct != null ? `${data.totals.compliancePct}%` : '—'} sub={`${data.totals.closed} cerradas`} tone="navy" />
            <StatCard icon={AlertTriangle} label="Atrasadas" value={data.totals.overdue} sub="pasadas sin cerrar" tone={data.totals.overdue ? 'rose' : 'emerald'} />
            <StatCard icon={CheckSquare} label="Programadas" value={data.totals.scheduled} tone="cyan" />
            <StatCard icon={CheckSquare} label="Próximas" value={data.totals.upcoming} sub="futuras sin cerrar" tone="amber" />
          </section>

          <ReportCard title="Por coach" icon={CheckSquare}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Coach</Th>
                    {data.isPlatformAdmin && <Th>Academia</Th>}
                    <Th align="right">Programadas</Th>
                    <Th align="right">Cerradas</Th>
                    <Th align="right">Atrasadas</Th>
                    <Th align="right">Próximas</Th>
                    <Th align="right">Cumplimiento</Th>
                    <Th align="right">🎯 Con foco</Th>
                    <Th align="right">Copy-paste</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rows.map((r) => (
                    <tr key={r.coachId}>
                      <Td><span className="font-medium text-gray-800">{r.name}</span></Td>
                      {data.isPlatformAdmin && <Td><span className="text-gray-500">{r.academyName || '—'}</span></Td>}
                      <Td align="right" mono>{r.scheduled}</Td>
                      <Td align="right" mono>{r.closed}</Td>
                      <Td align="right" mono>{r.overdue ? <span className="text-rose-600 font-semibold">{r.overdue}</span> : '—'}</Td>
                      <Td align="right" mono>{r.upcoming || '—'}</Td>
                      <Td align="right"><span className={`font-semibold ${complianceTone(r.compliancePct)}`}>{r.compliancePct != null ? `${r.compliancePct}%` : '—'}</span></Td>
                      <Td align="right"><span className={`font-semibold ${complianceTone(r.withNextPct)}`}>{r.withNextPct != null ? `${r.withNextPct}%` : '—'}</span></Td>
                      <Td align="right" mono>{r.copyPaste ? <span className="text-amber-600 font-semibold">{r.copyPaste}</span> : '—'}</Td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && (
                    <tr><td colSpan={data.isPlatformAdmin ? 9 : 8} className="text-center py-6 text-xs text-gray-400">Sin sesiones en este rango.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-400">
            Cumplimiento = cerradas / (cerradas + atrasadas). Se atribuye al coach efectivo del servicio (head coach si aceptó la
            transferencia). Las sesiones futuras sin cerrar cuentan como "próximas", no afectan el cumplimiento.
            <br />🎯 "Con foco" = % de cierres del coach con "qué trabajar próximo" escrito (el corazón del seguimiento).
            "Copy-paste" = cierres con el mismo texto repetido en 3+ alumnos.
          </p>
        </>
      )}
    </div>
  );
}
