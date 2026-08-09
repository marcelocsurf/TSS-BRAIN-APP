import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAcademyPnL } from '@/lib/actions/reports-pnl';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard, money } from '@/components/reports/primitives';
import { DollarSign, TrendingUp, Users, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PnLReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const data = await getAcademyPnL({ from: sp.from, to: sp.to, academyId: sp.academy });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">P&L por academia</h1>
        <p className="text-sm text-gray-500">Ingresos (asientos + membresías) menos nómina real de coaches.</p>
      </header>

      <ReportControls exportHref="/reports/pnl/export" />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={DollarSign} label="Ingresos" value={money(data.totals.revenueCents)} sub={`asientos + membresías`} tone="navy" />
            <StatCard icon={Users} label="Nómina coaches" value={money(data.totals.coachCostCents)} sub="pagos emitidos" tone="amber" />
            <StatCard icon={TrendingUp} label="Neto" value={money(data.totals.netCents)} sub="después de nómina" tone={data.totals.netCents >= 0 ? 'emerald' : 'rose'} />
            <StatCard icon={TrendingUp} label="Margen" value={data.totals.marginPct != null ? `${data.totals.marginPct}%` : '—'} sub={`${data.from} → ${data.to}`} tone="cyan" />
          </section>

          <ReportCard title="Por academia" icon={DollarSign}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Academia</Th>
                    <Th align="right">Asientos</Th>
                    <Th align="right">Membresías</Th>
                    <Th align="right">Ingresos</Th>
                    <Th align="right">Nómina</Th>
                    <Th align="right">Neto</Th>
                    <Th align="right">Margen</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rows.map((r) => (
                    <tr key={r.academyId || 'none'}>
                      <Td><span className="font-medium text-gray-800">{r.academyName}</span></Td>
                      <Td align="right" mono>{money(r.seatRevenueCents)}</Td>
                      <Td align="right" mono>{money(r.membershipRevenueCents)}</Td>
                      <Td align="right" mono><span className="font-semibold text-[var(--tss-navy)]">{money(r.revenueCents)}</span></Td>
                      <Td align="right" mono>{money(r.coachCostCents)}</Td>
                      <Td align="right" mono><span className={`font-semibold ${r.netCents >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(r.netCents)}</span></Td>
                      <Td align="right"><span className={`font-semibold ${(r.marginPct ?? 0) >= 40 ? 'text-emerald-600' : (r.marginPct ?? 0) >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>{r.marginPct != null ? `${r.marginPct}%` : '—'}</span></Td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-6 text-xs text-gray-400">Sin datos en este rango.</td></tr>
                  )}
                </tbody>
                {data.rows.length > 1 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <Td><span className="font-semibold text-[var(--tss-navy)]">Total</span></Td>
                      <Td align="right" mono>{money(data.totals.seatRevenueCents)}</Td>
                      <Td align="right" mono>{money(data.totals.membershipRevenueCents)}</Td>
                      <Td align="right" mono><span className="font-bold text-[var(--tss-navy)]">{money(data.totals.revenueCents)}</span></Td>
                      <Td align="right" mono>{money(data.totals.coachCostCents)}</Td>
                      <Td align="right" mono><span className={`font-bold ${data.totals.netCents >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(data.totals.netCents)}</span></Td>
                      <Td align="right"><span className="font-bold text-[var(--tss-navy)]">{data.totals.marginPct != null ? `${data.totals.marginPct}%` : '—'}</span></Td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-400">
            Neto = ingresos − nómina real de coaches (<code>coach_payments</code>). Los costos no-coach por servicio (equipo, transporte,
            asistentes, filmer) <strong>no</strong> están incluidos acá — viven en el panel de costos de cada camp para no doble-contar la
            mano de obra ni sobrecargar la base. Ingresos fechados por fecha de pago; nómina por período de pago.
          </p>
        </>
      )}
    </div>
  );
}
