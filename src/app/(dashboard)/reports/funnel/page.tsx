import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getQrFunnel } from '@/lib/actions/reports-funnel';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard } from '@/components/reports/primitives';
import { TrendingUp, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FunnelReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const data = await getQrFunnel({ from: sp.from, to: sp.to, academyId: sp.academy });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Embudo QR → pagado</h1>
        <p className="text-sm text-gray-500">Conversión de reserva a pago por canal, para perseguir las reservas sin cobrar.</p>
      </header>

      <ReportControls exportHref="/reports/funnel/export" />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={TrendingUp} label="Reservas" value={data.totals.bookings} sub={`${data.from} → ${data.to}`} tone="navy" />
            <StatCard icon={Clock} label="Sin cobrar" value={data.totals.unpaid} sub="reservas activas" tone={data.totals.unpaid ? 'amber' : 'emerald'} />
            <StatCard icon={CheckCircle2} label="Pagadas" value={data.totals.paid} tone="emerald" />
            <StatCard icon={TrendingUp} label="Conversión" value={`${data.totals.conversionPct}%`} sub="pagadas / reservas" tone="cyan" />
          </section>

          <ReportCard title="Por canal" icon={TrendingUp}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Canal</Th>
                    <Th align="right">Reservas</Th>
                    <Th align="right">Sin cobrar</Th>
                    <Th align="right">Pagadas</Th>
                    <Th align="right">Canceladas</Th>
                    <Th align="right">Conversión</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.channels.map((c) => (
                    <tr key={c.channel}>
                      <Td><span className="font-medium text-gray-800">{c.label}</span></Td>
                      <Td align="right" mono>{c.bookings}</Td>
                      <Td align="right" mono>{c.unpaid ? <span className="text-amber-600 font-semibold">{c.unpaid}</span> : '—'}</Td>
                      <Td align="right" mono>{c.paid}</Td>
                      <Td align="right" mono>{c.cancelled || '—'}</Td>
                      <Td align="right"><span className={`font-semibold ${c.conversionPct >= 70 ? 'text-emerald-600' : c.conversionPct >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{c.conversionPct}%</span></Td>
                    </tr>
                  ))}
                  {data.channels.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 text-xs text-gray-400">Sin reservas en este rango.</td></tr>
                  )}
                </tbody>
                {data.channels.length > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <Td><span className="font-semibold text-[var(--tss-navy)]">Total</span></Td>
                      <Td align="right" mono>{data.totals.bookings}</Td>
                      <Td align="right" mono>{data.totals.unpaid}</Td>
                      <Td align="right" mono>{data.totals.paid}</Td>
                      <Td align="right" mono>{data.totals.cancelled}</Td>
                      <Td align="right"><span className="font-bold text-[var(--tss-navy)]">{data.totals.conversionPct}%</span></Td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-400">
            El tope del embudo es la <strong>reserva</strong> (no hay registro de escaneos del QR). Canal QR = reservas de auto-servicio;
            mostrador = las que registró un vendedor/recepción. Las reservas $0 (INCLUIDO) entran ya pagadas y suben la conversión.
          </p>
        </>
      )}
    </div>
  );
}
