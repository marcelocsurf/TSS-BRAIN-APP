import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getOccupancyReport, type OccupancyGroupBy } from '@/lib/actions/reports-occupancy';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard } from '@/components/reports/primitives';
import { Gauge, Tent, Ticket, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function pctTone(pct: number): string {
  if (pct >= 80) return 'text-emerald-600';
  if (pct >= 50) return 'text-amber-600';
  return 'text-rose-600';
}

function fmtWeek(key: string): string {
  const d = new Date(key + 'T00:00:00Z');
  const end = new Date(d.getTime() + 6 * 86400000);
  const f = (x: Date) => x.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${f(d)}–${f(end)}`;
}

export default async function OccupancyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; groupBy?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const groupBy = (sp.groupBy as OccupancyGroupBy) || 'service_kind';
  const data = await getOccupancyReport({ from: sp.from, to: sp.to, groupBy, academyId: sp.academy });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Ocupación vs capacidad</h1>
        <p className="text-sm text-gray-500">Utilización de cupos por servicio — para planear capacidad y ventas.</p>
      </header>

      <ReportControls
        exportHref="/reports/occupancy/export"
        segments={{
          param: 'groupBy',
          label: 'Agrupar',
          default: 'service_kind',
          options: [
            { value: 'service_kind', label: 'Servicio' },
            { value: 'template', label: 'Plantilla' },
            { value: 'week', label: 'Semana' },
          ],
        }}
      />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Gauge} label="Ocupación" value={`${data.totals.occupancyPct}%`} sub={`${data.totals.enrolled}/${data.totals.spots} cupos`} tone="navy" />
            <StatCard icon={Ticket} label="Ocupación pagada" value={`${data.totals.paidPct}%`} sub={`${data.totals.sold} pagados`} tone="cyan" />
            <StatCard icon={Tent} label="Servicios" value={data.totals.services} sub={`${data.totals.available} cupos libres`} tone="emerald" />
            <StatCard icon={Gauge} label="Sin cupo definido" value={data.totals.capacityNotSet} sub="servicios sin capacidad" tone={data.totals.capacityNotSet ? 'amber' : 'emerald'} />
          </section>

          <ReportCard title={groupBy === 'template' ? 'Por plantilla' : groupBy === 'week' ? 'Por semana' : 'Por tipo de servicio'} icon={Gauge}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>{groupBy === 'template' ? 'Plantilla' : groupBy === 'week' ? 'Semana' : 'Servicio'}</Th>
                    <Th align="right">Servicios</Th>
                    <Th align="right">Cupos</Th>
                    <Th align="right">Inscritos</Th>
                    <Th align="right">Pagados</Th>
                    <Th align="right">Libres</Th>
                    <Th align="right">Ocupación</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rows.map((r) => (
                    <tr key={r.key}>
                      <Td>
                        <span className="font-medium text-gray-800">{groupBy === 'week' ? fmtWeek(r.key) : r.label}</span>
                        {r.capacityNotSet > 0 && <span className="ml-2 text-[10px] text-amber-600">⚠ {r.capacityNotSet} sin cupo</span>}
                      </Td>
                      <Td align="right" mono>{r.services}</Td>
                      <Td align="right" mono>{r.spots || '—'}</Td>
                      <Td align="right" mono>{r.enrolled}</Td>
                      <Td align="right" mono>{r.sold}</Td>
                      <Td align="right" mono>{r.available}</Td>
                      <Td align="right"><span className={`font-semibold ${pctTone(r.occupancyPct)}`}>{r.spots ? `${r.occupancyPct}%` : '—'}</span></Td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-6 text-xs text-gray-400">Sin servicios en este rango.</td></tr>
                  )}
                </tbody>
                {data.rows.length > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <Td><span className="font-semibold text-[var(--tss-navy)]">Total</span></Td>
                      <Td align="right" mono>{data.totals.services}</Td>
                      <Td align="right" mono>{data.totals.spots}</Td>
                      <Td align="right" mono>{data.totals.enrolled}</Td>
                      <Td align="right" mono>{data.totals.sold}</Td>
                      <Td align="right" mono>{data.totals.available}</Td>
                      <Td align="right"><span className={`font-bold ${pctTone(data.totals.occupancyPct)}`}>{data.totals.occupancyPct}%</span></Td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-400">
            Capacidad efectiva = cupo del servicio (override) o el de su plantilla. Un camp de varios días cuenta en su semana de inicio.
            Ocupación = inscritos activos / cupos. "Ocupación pagada" solo cuenta asientos ya cobrados.
          </p>
        </>
      )}
    </div>
  );
}
