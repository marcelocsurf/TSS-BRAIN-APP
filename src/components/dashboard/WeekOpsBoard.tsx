import { getOpsByDay, upcomingDays, dayProgramText } from '@/lib/ops/day-program';
import Link from 'next/link';
import { CalendarRange } from 'lucide-react';
import { CopyTextButton } from './CopyTextButton';

// ═══ WEEK OPERATIONS (pedido de Rick, 2026-08-25) ═══
// La LOGÍSTICA de la semana que los coaches ya planearon en su Vista Semana:
// por día, cada servicio con hora de encuentro, transfer, lugar, espacios,
// coach + staff, alumnos (idiomas, tallas, habitaciones). Reemplaza el Excel
// de "Programación semanal" — y cada día tiene su botón "copiar" con el
// formato de la "Programación diaria" que Rick manda al chat de performance
// (para los que no tienen perfil: instructores nuevos, camarógrafos, etc.).
// El OperationsBoard de arriba es el PROCESO (plan→abrir→cerrar); este es
// el QUÉ-DÓNDE-CUÁNDO.

const F_LABEL = { fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.16em' };

export async function WeekOpsBoard({ academyId }: { academyId: string }) {
  let data;
  try {
    const days = upcomingDays(7);
    const byDay = await getOpsByDay(academyId, days[0], days[6]);
    data = { days, byDay, today: days[0] };
  } catch (e) {
    console.error('[week-ops] failed', e);
    // Distinguible de "semana vacía": un fallo de carga se ve, no desaparece.
    return (
      <div className="mb-6 rounded-2xl bg-white border border-amber-200 p-4">
        <p className="text-[12px] text-amber-800">⚠ Week operations no pudo cargar — recargá la página.</p>
      </div>
    );
  }
  const { days, byDay, today } = data;
  if (Array.from(byDay.values()).every((r) => r.length === 0)) return null;

  const fmtDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

  return (
    <div className="mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <p className="text-[10px] inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
          <CalendarRange size={12} /> Week operations · logística planeada
        </p>
        <p className="text-[9px] text-gray-400">Lo que los coaches fijaron en su Vista Semana · 📋 copia el día para el chat de performance</p>
      </div>

      <div className="space-y-3 mt-2">
        {days.map((d) => {
          const rows = byDay.get(d) ?? [];
          if (rows.length === 0) return null;
          const isToday = d === today;
          const isTomorrow = days[1] === d;
          return (
            <div key={d} className="rounded-xl border overflow-hidden" style={{ borderColor: isToday ? 'rgba(0,210,255,.45)' : '#F0F2F4' }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ background: isToday ? 'rgba(0,210,255,.08)' : '#FAFBFC' }}>
                <p className="text-[11px] font-extrabold uppercase" style={{ color: '#061C2B' }}>
                  {fmtDay(d)}{isToday ? ' · HOY' : isTomorrow ? ' · MAÑANA' : ''}
                  <span className="text-gray-400 font-semibold normal-case"> · {rows.length} servicio{rows.length === 1 ? '' : 's'}</span>
                </p>
                <CopyTextButton text={dayProgramText(d, rows)} label="📋 Copiar" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="py-1.5 px-3 font-medium" style={F_LABEL}>Servicio</th>
                      <th className="py-1.5 pr-2 font-medium" style={F_LABEL}>Coach · staff</th>
                      <th className="py-1.5 pr-2 font-medium whitespace-nowrap" style={F_LABEL}>🕐 Encuentro</th>
                      <th className="py-1.5 pr-2 font-medium whitespace-nowrap" style={F_LABEL}>🚐 Transfer</th>
                      <th className="py-1.5 pr-2 font-medium" style={F_LABEL}>📍 Lugar</th>
                      <th className="py-1.5 pr-2 font-medium" style={F_LABEL}>🏛 Espacios</th>
                      <th className="py-1.5 pr-3 font-medium" style={F_LABEL}>👥 Alumnos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((r, i) => (
                      <tr key={`${r.campId}-${i}`} className="align-top hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <Link href={`/camps/${r.campId}`} className="font-bold text-[var(--tss-navy)] hover:underline">
                            {r.name}{r.dayNumber && r.totalDays && r.totalDays > 1 ? ` · D${r.dayNumber}/${r.totalDays}` : ''}
                          </Link>
                        </td>
                        <td className="py-2 pr-2">
                          {r.coachNote === 'rejected' ? (
                            <span className="text-red-600 font-bold">Sin coach ⚠ · rechazó — reasignar</span>
                          ) : !r.coach ? (
                            <span className="text-red-600 font-bold">Sin coach ⚠</span>
                          ) : (
                            <>
                              {r.coach}
                              {r.coachNote === 'pending' && (
                                <span className="text-amber-700 font-semibold"> · sin confirmar ⚠</span>
                              )}
                            </>
                          )}
                          {r.staff.length > 0 && <span className="text-gray-400"> · {r.staff.join(' · ')}</span>}
                        </td>
                        <td className="py-2 pr-2 font-extrabold whitespace-nowrap" style={{ color: '#0090B0' }}>{r.meeting ?? '—'}</td>
                        <td className="py-2 pr-2 whitespace-nowrap text-gray-600">
                          {r.vanState === 'ok' ? `${r.depart} → ${r.ret ?? '—'}`
                            : r.vanState === 'pending_times' ? <span className="text-amber-700 font-semibold">pedida · sin horario ⚠</span>
                            : r.vanState === 'cancelled' ? <span className="text-red-500">cancelada ✕</span>
                            : '—'}
                        </td>
                        <td className="py-2 pr-2 text-gray-600">{r.venue ?? '—'}</td>
                        <td className="py-2 pr-2 text-gray-600">{r.spaces.length ? r.spaces.join(' · ') : '—'}</td>
                        <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                          {r.students}{r.langs ? ` · ${r.langs}` : ''}{r.rooms ? ` · Hab ${r.rooms}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
