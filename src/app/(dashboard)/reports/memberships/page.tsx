import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getMembershipsReport } from '@/lib/actions/reports-memberships';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard, money } from '@/components/reports/primitives';
import { RefreshCw, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default async function MembershipsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const data = await getMembershipsReport({ from: sp.from, to: sp.to, academyId: sp.academy });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Renovaciones de membresía</h1>
        <p className="text-sm text-gray-500">Pendientes por confirmar, renovaciones cobradas y membresías por vencer.</p>
      </header>

      <ReportControls exportHref="/reports/memberships/export" />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={RefreshCw} label="Ingreso renovaciones" value={money(data.totals.renewalRevenueCents)} sub={`${data.totals.renewalCount} en el rango`} tone="navy" />
            <StatCard icon={Clock} label="Por confirmar" value={data.totals.pendingCount} sub="pedidas por el alumno" tone={data.totals.pendingCount ? 'amber' : 'emerald'} />
            <StatCard icon={AlertTriangle} label="Por vencer (30d)" value={data.totals.expiringCount} sub="a perseguir" tone={data.totals.expiringCount ? 'rose' : 'emerald'} />
            <StatCard icon={RefreshCw} label="Renovaciones" value={data.totals.renewalCount} sub={`${data.from} → ${data.to}`} tone="cyan" />
          </section>

          {/* Pendientes por confirmar */}
          <ReportCard title="Pendientes por confirmar" icon={Clock}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><Th>Alumno</Th><Th>Email</Th><Th align="right">Meses</Th><Th align="right">Pedida</Th><Th align="right"></Th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.pending.map((p) => (
                    <tr key={p.studentId}>
                      <Td><span className="font-medium text-gray-800">{p.name}</span></Td>
                      <Td><span className="text-gray-500">{p.email || '—'}</span></Td>
                      <Td align="right" mono>{p.months ?? '—'}</Td>
                      <Td align="right" mono>{fmtDate(p.requestedAt)}</Td>
                      <Td align="right"><Link href={`/students/${p.studentId}`} className="text-[var(--tss-cyan)] font-semibold text-[12px]">Confirmar →</Link></Td>
                    </tr>
                  ))}
                  {data.pending.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-xs text-gray-400">Sin pendientes.</td></tr>}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* Por vencer */}
          <ReportCard title="Por vencer en 30 días" icon={AlertTriangle}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><Th>Alumno</Th><Th>Email</Th><Th align="right">Vence</Th><Th align="right">Días</Th><Th align="right"></Th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.expiring.map((e) => (
                    <tr key={e.studentId}>
                      <Td><span className="font-medium text-gray-800">{e.name}</span></Td>
                      <Td><span className="text-gray-500">{e.email || '—'}</span></Td>
                      <Td align="right" mono>{fmtDate(e.endsAt)}</Td>
                      <Td align="right"><span className={`font-semibold ${e.daysLeft <= 7 ? 'text-rose-600' : 'text-amber-600'}`}>{e.daysLeft}d</span></Td>
                      <Td align="right"><Link href={`/students/${e.studentId}`} className="text-[var(--tss-cyan)] font-semibold text-[12px]">Ver →</Link></Td>
                    </tr>
                  ))}
                  {data.expiring.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-xs text-gray-400">Nada por vencer en 30 días.</td></tr>}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* Confirmadas */}
          <ReportCard title="Renovaciones confirmadas (en el rango)" icon={RefreshCw}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><Th>Alumno</Th><Th align="right">Meses</Th><Th align="right">Monto</Th><Th>Método</Th><Th align="right">Vigente hasta</Th><Th align="right">Cobrada</Th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.confirmed.map((c, i) => (
                    <tr key={c.studentId + i}>
                      <Td><span className="font-medium text-gray-800">{c.name}</span></Td>
                      <Td align="right" mono>{c.months ?? '—'}</Td>
                      <Td align="right" mono>{money(c.amountCents)}</Td>
                      <Td><span className="text-gray-500">{c.paymentMethod || '—'}</span></Td>
                      <Td align="right" mono>{fmtDate(c.endsAt)}</Td>
                      <Td align="right" mono>{fmtDate(c.createdAt)}</Td>
                    </tr>
                  ))}
                  {data.confirmed.length === 0 && <tr><td colSpan={6} className="text-center py-5 text-xs text-gray-400">Sin renovaciones cobradas en el rango.</td></tr>}
                </tbody>
              </table>
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-400">
            "Por vencer" mira la membresía activa más lejana de cada alumno (no re-alerta si ya renovó). Las renovaciones se fechan por
            fecha de cobro. Los pedidos pendientes vienen del portal del alumno — confirmalos en su ficha.
          </p>
        </>
      )}
    </div>
  );
}
