import { redirect } from 'next/navigation';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { adminProgramReport } from '@/lib/actions/program-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Reporte de adherencia de programas (línea Alto Rendimiento).
// Solo admin de plataforma: los programas cruzan academias.
export default async function ProgramReportPage() {
  const platform = await isRealPlatformAdmin().catch(() => false);
  if (!platform) redirect('/reports');

  const { ok, rows, error } = await adminProgramReport();

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Programas · Adherencia</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cada alumno con programa activo: progreso, hábitos de los últimos 7 check-ins y alertas de inactividad.
        </p>
      </header>

      {!ok && <p className="text-sm rounded-lg px-3 py-2 bg-red-50 border border-red-200 text-red-700">{error}</p>}

      {ok && rows.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">No hay asignaciones activas.</p>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const alert = (r.days_inactive ?? 0) >= 3;
          return (
            <div
              key={r.assignment_id}
              className="rounded-2xl bg-white border p-4 flex items-center gap-4 flex-wrap"
              style={{
                borderColor: alert ? '#F0C36D' : '#E5E7EB',
                borderLeft: `4px solid ${alert ? '#C9822E' : '#B8862B'}`,
              }}
            >
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-bold text-[var(--tss-navy)]">{r.student_name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {r.program_title} · desde {r.start_date}
                  {r.coach_name ? ` · coach: ${r.coach_name}` : ' · sin coach de seguimiento'}
                </p>
                {alert && (
                  <p className="text-[11px] font-semibold mt-1" style={{ color: '#C9822E' }}>
                    ⚠ {r.days_inactive} día{r.days_inactive === 1 ? '' : 's'} sin actividad — avisar
                    {r.coach_name ? ` a ${r.coach_name}` : ''}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-[var(--tss-navy)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {r.days_done}/{r.days_total} días · {r.adherence_pct}%
                </p>
                <p className="text-[10px] text-gray-400">
                  {r.last_checkin ? `último check-in ${r.last_checkin}` : 'sin check-ins'}
                </p>
              </div>

              <div className="w-28">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.adherence_pct}%`, background: alert ? '#C9822E' : '#00A8CC' }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {r.avg_sleep != null && <>😴 {r.avg_sleep}h </>}
                  {r.avg_water != null && <>💧 {r.avg_water}/8</>}
                  {r.avg_sleep == null && r.avg_water == null && '— hábitos s/d'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
