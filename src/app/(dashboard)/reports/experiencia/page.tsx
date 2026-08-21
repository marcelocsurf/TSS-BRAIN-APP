import { getCurrentCoach } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getExperienceReport } from '@/lib/actions/reports-experience';
import { DIM_COLS } from '@/lib/survey/experience-questions';
import { ReportControls } from '@/components/reports/ReportControls';
import { StatCard, Th, Td, ReportCard } from '@/components/reports/primitives';
import { Smile, DollarSign, Megaphone, MessageSquare, AlertTriangle, ArrowLeft, Percent } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Reporte LIVE de experiencia del camp: instalaciones, equipo, transporte,
// comunicación, value for money y NPS — con alertas de scores bajos para que
// el equipo de servicio actúe el mismo día.

const scoreColor = (v: number | null) =>
  v == null ? 'text-gray-400' : v >= 4.5 ? 'text-emerald-600' : v >= 3.5 ? 'text-amber-600' : 'text-rose-600';

export default async function ExperienceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; academy?: string }>;
}) {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) redirect('/dashboard');

  const sp = await searchParams;
  const data = await getExperienceReport({ from: sp.from, to: sp.to, academyId: sp.academy });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header className="space-y-1">
        <Link href="/reports" className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700">
          <ArrowLeft size={12} /> Reportes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Experiencia del camp</h1>
        <p className="text-sm text-gray-500">
          Lo que el cliente dice de la EXPERIENCIA (no de la clase): instalaciones, equipo, transporte, comunicación y value for money.
        </p>
      </header>

      <ReportControls exportHref="/reports/experiencia/export" />

      {!data.ok ? (
        <p className="text-sm text-rose-600">{data.error || 'No se pudo cargar el reporte.'}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Smile} label="Score de experiencia" value={data.totals.overall ?? '—'} sub={`${data.totals.responses} respuestas`} tone="cyan" />
            <StatCard icon={DollarSign} label="Value for money" value={data.totals.dims.value_rating.avg ?? '—'} sub={`${data.totals.dims.value_rating.n} respuestas`} tone="amber" />
            <StatCard icon={Megaphone} label="NPS" value={data.totals.nps.score ?? '—'} sub={`${data.totals.nps.promoters}👍 ${data.totals.nps.detractors}👎 de ${data.totals.nps.n}`} tone="navy" />
            <StatCard icon={Percent} label="Tasa de respuesta" value={data.totals.responseRate != null ? `${data.totals.responseRate}%` : '—'} sub={`${data.totals.sent} enviadas en el rango`} tone="emerald" />
          </section>

          {/* Alertas: scores bajos — para actuar HOY, no a fin de mes */}
          {data.alerts.length > 0 && (
            <ReportCard title={`Alertas · ${data.alerts.length} respuestas con score bajo (≤3★ o NPS ≤6)`} icon={AlertTriangle}>
              <div className="space-y-2">
                {data.alerts.slice(0, 8).map((a) => (
                  <div key={a.id} className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
                    <p className="text-xs font-semibold text-rose-800">
                      {a.studentName}{a.campName ? ` · ${a.campName}` : ''} · {a.date}
                    </p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      {DIM_COLS.filter((c) => typeof a.scores[c] === 'number' && (a.scores[c] as number) <= 3)
                        .map((c) => `${data.labels[c]} ${a.scores[c]}★`)
                        .join(' · ')}
                      {a.nps != null && a.nps <= 6 ? `${' · '}NPS ${a.nps}` : ''}
                    </p>
                    {a.comment && <p className="text-[11px] text-gray-600 mt-1 italic">“{a.comment}”</p>}
                  </div>
                ))}
                {data.alerts.length > 8 && (
                  <p className="text-[11px] text-gray-500">…y {data.alerts.length - 8} más en el CSV.</p>
                )}
              </div>
            </ReportCard>
          )}

          {/* Score por dimensión con tendencia vs rango anterior */}
          <ReportCard title="Por dimensión" icon={Smile}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Dimensión</Th>
                    <Th align="right">Promedio</Th>
                    <Th align="right">N</Th>
                    <Th align="right">Rango anterior</Th>
                    <Th align="right">Tendencia</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {DIM_COLS.map((c) => {
                    const cur = data.totals.dims[c];
                    const prev = data.totals.prevDims[c];
                    const delta = cur.avg != null && prev.avg != null ? Math.round((cur.avg - prev.avg) * 10) / 10 : null;
                    return (
                      <tr key={c}>
                        <Td><span className="font-medium text-gray-800">{data.labels[c]}</span></Td>
                        <Td align="right"><span className={`font-semibold ${scoreColor(cur.avg)}`}>{cur.avg != null ? `${cur.avg.toFixed(1)} ★` : '—'}</span></Td>
                        <Td align="right" mono>{cur.n || '—'}</Td>
                        <Td align="right" mono>{prev.avg != null ? prev.avg.toFixed(1) : '—'}</Td>
                        <Td align="right">
                          {delta == null ? <span className="text-gray-400">—</span> : (
                            <span className={`font-semibold ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                              {delta > 0 ? `▲ +${delta.toFixed(1)}` : delta < 0 ? `▼ ${delta.toFixed(1)}` : '='}
                            </span>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* Por camp */}
          <ReportCard title="Por camp" icon={Smile}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Camp</Th>
                    <Th align="right">Inicio</Th>
                    <Th align="right">N</Th>
                    <Th align="right">Score</Th>
                    <Th align="right">Value</Th>
                    <Th align="right">NPS</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.camps.map((c) => (
                    <tr key={`${c.campName}-${c.startDate}`}>
                      <Td><span className="font-medium text-gray-800">{c.campName}</span></Td>
                      <Td align="right" mono>{c.startDate ?? '—'}</Td>
                      <Td align="right" mono>{c.n}</Td>
                      <Td align="right"><span className={`font-semibold ${scoreColor(c.overall)}`}>{c.overall != null ? c.overall.toFixed(1) : '—'}</span></Td>
                      <Td align="right"><span className={`font-semibold ${scoreColor(c.value)}`}>{c.value != null ? c.value.toFixed(1) : '—'}</span></Td>
                      <Td align="right" mono>{c.nps ?? '—'}</Td>
                    </tr>
                  ))}
                  {data.camps.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 text-xs text-gray-500">Sin respuestas en este rango.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* Comentarios recientes */}
          <ReportCard title="Comentarios recientes" icon={MessageSquare}>
            <div className="space-y-2">
              {data.responses.filter((r) => r.comment).slice(0, 12).map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2">
                  <p className="text-[11px] text-gray-500">{r.studentName}{r.campName ? ` · ${r.campName}` : ''} · {r.date}{r.nps != null ? ` · NPS ${r.nps}` : ''}</p>
                  <p className="text-sm text-gray-700 mt-0.5">“{r.comment}”</p>
                </div>
              ))}
              {data.responses.filter((r) => r.comment).length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">Sin comentarios en este rango.</p>
              )}
            </div>
          </ReportCard>

          <p className="text-[11px] text-gray-500">
            La encuesta se crea al cerrar cada camp y llega como paso 2 del survey de la clase (un solo link). Si el cliente no responde,
            el host puede reenviarla por WhatsApp desde la ficha del alumno en su portal. NPS = % promotores (9-10) − % detractores (0-6).
          </p>
        </>
      )}
    </div>
  );
}
