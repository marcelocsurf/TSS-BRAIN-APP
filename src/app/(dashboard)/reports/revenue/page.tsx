import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSeatRevenue, type Granularity } from '@/lib/actions/reports-revenue';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard, money } from '@/components/reports/primitives';
import { DollarSign, Ticket, Clock, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fmtPeriod(period: string, g: Granularity): string {
  if (g === 'month') {
    const [y, m] = period.split('-');
    return new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  }
  const d = new Date(period + 'T00:00:00Z');
  const end = new Date(d.getTime() + 6 * 86400000);
  const f = (x: Date) => x.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${f(d)}–${f(end)}`;
}

export default async function RevenueReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; granularity?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const granularity: Granularity = sp.granularity === 'month' ? 'month' : 'week';
  const data = await getSeatRevenue({ from: sp.from, to: sp.to, granularity, academyId: sp.academy });

  const avgTicket = data.totals.seats ? Math.round(data.totals.total / data.totals.seats) : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Ingresos por venta de asientos</h1>
        <p className="text-sm text-gray-500">
          Dinero cobrado (asientos pagados, sin INCLUIDO/cortesía) por {granularity === 'week' ? 'semana' : 'mes'} y tipo de servicio.
        </p>
      </header>

      <ReportControls granularity exportHref="/reports/revenue/export" />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={DollarSign} label="Cobrado" value={money(data.totals.total)} sub={`${data.totals.seats} asientos`} tone="navy" />
            <StatCard icon={Ticket} label="Ticket promedio" value={money(avgTicket)} sub="por asiento pagado" tone="cyan" />
            <StatCard icon={Clock} label="Pendiente" value={money(data.pipeline.total)} sub={`${data.pipeline.seats} reservas por cobrar`} tone="amber" />
            <StatCard icon={DollarSign} label="Períodos" value={data.rows.length} sub={`${data.from} → ${data.to}`} tone="emerald" />
          </section>

          {data.serviceTotals.length > 0 && (
            <section className="flex flex-wrap gap-2">
              {data.serviceTotals.map((s) => (
                <span key={s.key} className="text-[12px] rounded-full px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-700">
                  <span className="font-semibold text-[var(--tss-navy)]">{s.label}</span> · {money(s.cents)} <span className="text-gray-400">({s.seats})</span>
                </span>
              ))}
            </section>
          )}

          <ReportCard title={granularity === 'week' ? 'Por semana' : 'Por mes'} icon={DollarSign}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Período</Th>
                    {data.serviceTotals.map((s) => <Th key={s.key} align="right">{s.label}</Th>)}
                    <Th align="right">Total</Th>
                    <Th align="right">Asientos</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rows.map((r) => (
                    <tr key={r.period}>
                      <Td>{fmtPeriod(r.period, granularity)}</Td>
                      {data.serviceTotals.map((s) => (
                        <Td key={s.key} align="right" mono>{r.byService[s.key] ? money(r.byService[s.key]) : '—'}</Td>
                      ))}
                      <Td align="right" mono><span className="font-semibold text-[var(--tss-navy)]">{money(r.total)}</span></Td>
                      <Td align="right" mono>{r.seats}</Td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && (
                    <tr><td colSpan={data.serviceTotals.length + 3} className="text-center py-6 text-xs text-gray-400">Sin ventas en este rango.</td></tr>
                  )}
                </tbody>
                {data.rows.length > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <Td><span className="font-semibold text-[var(--tss-navy)]">Total</span></Td>
                      {data.serviceTotals.map((s) => <Td key={s.key} align="right" mono>{money(s.cents)}</Td>)}
                      <Td align="right" mono><span className="font-bold text-[var(--tss-navy)]">{money(data.totals.total)}</span></Td>
                      <Td align="right" mono>{data.totals.seats}</Td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-400">
            Ingreso = suma de <code>amount_cents</code> de asientos pagados (excluye INCLUIDO/cortesía de $0). Fechado por fecha de pago
            (hora El Salvador). El pendiente son reservas activas sin cobrar. Los datos se recalculan en cada carga.
          </p>
        </>
      )}
    </div>
  );
}
