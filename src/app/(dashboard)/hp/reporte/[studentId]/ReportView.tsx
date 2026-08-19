'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hpAthleteReport, type HPAthleteReport } from '@/lib/actions/hp-cockpit';

// ─── Vista imprimible del reporte del atleta ───
// TEMA CLARO a propósito: esto termina en un PDF (Imprimir → Guardar como
// PDF), y un PDF oscuro gasta tinta y se lee mal. Brand v10: ink + cyan + gold.

const INK = '#061C2B';
const CYAN = '#0090B8';
const GOLD = '#B8862B';
const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

const PILLAR_LABEL: Record<string, { label: string; color: string }> = {
  fisico: { label: 'Físico', color: '#E07A2F' },
  tecnico: { label: 'Técnico', color: '#0090B8' },
  tactico: { label: 'Táctico', color: '#7C5CBF' },
  mental: { label: 'Mental', color: '#D97706' },
};

export function ReportView({ studentId }: { studentId: string }) {
  const [r, setR] = useState<HPAthleteReport | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    hpAthleteReport(studentId)
      .then((res) => { if (res.ok && res.report) setR(res.report); else setErr(res.error || 'No se pudo generar.'); })
      .catch(() => setErr('No se pudo generar.'));
  }, [studentId]);

  if (err) return <p className="text-sm text-red-600 p-6">{err}</p>;
  if (!r) return <p className="text-sm text-gray-400 p-6">Generando reporte…</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white">
      {/* Controles — no salen en el PDF */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href="/hp" className="text-xs text-gray-500">← Modo HP</Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-full text-xs font-bold text-white"
          style={{ background: INK }}
        >
          🖨 Imprimir / Guardar PDF
        </button>
      </div>

      <div className="border border-gray-200 rounded-2xl p-6 print:border-0 print:p-0 space-y-5">
        {/* Encabezado */}
        <div className="flex items-start justify-between pb-4" style={{ borderBottom: `3px solid ${INK}` }}>
          <div>
            <p className="text-[10px] uppercase tracking-[.2em]" style={{ ...MONO, color: CYAN }}>
              The Surf Sequence · High Performance
            </p>
            <h1 className="text-[26px] font-extrabold uppercase mt-1" style={{ color: INK, fontStretch: '125%' }}>
              {r.student.name}
            </h1>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {r.student.belt ? `Cinturón: ${r.student.belt.replace(/_/g, ' ')}` : ''}
              {r.season ? ` · ${r.season.title}` : ''}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#94A3B8' }}>Reporte del atleta</p>
            <p className="text-[12px] font-bold" style={{ color: INK }}>{r.generated_at}</p>
            {r.ranking && (
              <p className="text-[13px] font-bold mt-1" style={{ color: GOLD }}>
                Ranking #{r.ranking.position} de {r.ranking.total} · {r.ranking.points} pts
              </p>
            )}
          </div>
        </div>

        {/* Score por pilar */}
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Score por pilar</p>
          {r.pillars.length === 0 ? (
            <p className="text-[12px] text-gray-400 mt-1">Sin evaluaciones registradas todavía.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {r.pillars.map((p) => {
                const meta = PILLAR_LABEL[p.pillar] ?? { label: p.pillar, color: CYAN };
                return (
                  <div key={p.pillar}>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold" style={{ color: INK }}>{meta.label}</p>
                      <p className="text-[14px] font-bold" style={{ ...MONO, color: meta.color }}>
                        {p.avg.toFixed(1)}/10 <span className="text-[10px] text-gray-400 font-normal">({p.count} eval{p.count === 1 ? '' : 's'})</span>
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden mt-1">
                      <div className="h-full rounded-full" style={{ width: `${p.avg * 10}%`, background: meta.color }} />
                    </div>
                  </div>
                );
              })}
              {r.global_score != null && (
                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                  <p className="text-[13px] font-bold" style={{ color: INK }}>Score global</p>
                  <p className="text-[20px] font-extrabold" style={{ ...MONO, color: CYAN }}>{r.global_score.toFixed(1)}/10</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Programa */}
        <div className="rounded-xl p-4" style={{ background: '#FDF8EC', border: '1px solid #F0C36D' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Programa de entreno</p>
          {r.program ? (
            <>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[14px] font-bold" style={{ color: INK }}>{r.program.title}</p>
                <p className="text-[13px] font-bold" style={{ ...MONO, color: GOLD }}>
                  {r.program.position} · {r.program.adherence_pct}%
                </p>
              </div>
              <div className="h-2 rounded-full bg-white overflow-hidden mt-1.5" style={{ border: '1px solid #F0C36D' }}>
                <div className="h-full rounded-full" style={{ width: `${r.program.adherence_pct}%`, background: GOLD }} />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {r.program.days_done}/{r.program.days_total} días completados
                {r.program.start_date ? ` · desde ${r.program.start_date}` : ''}
              </p>
            </>
          ) : (
            <p className="text-[12px] text-gray-400 mt-1">Sin programa activo.</p>
          )}
        </div>

        {/* Hábitos + asistencia */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 border border-gray-200">
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Hábitos · últimos 7 días</p>
            <div className="mt-1.5 space-y-0.5 text-[12px] text-gray-600">
              <p>Check-ins: <b style={{ color: INK }}>{r.habits.checkins_last7}/7</b></p>
              <p>😴 Sueño prom.: <b style={{ color: INK }}>{r.habits.avg_sleep != null ? `${r.habits.avg_sleep} h` : '—'}</b></p>
              <p>💧 Agua prom.: <b style={{ color: INK }}>{r.habits.avg_water != null ? `${r.habits.avg_water}/8` : '—'}</b></p>
              <p>⚡ Energía prom.: <b style={{ color: INK }}>{r.habits.avg_energy != null ? `${r.habits.avg_energy}/4` : '—'}</b></p>
              <p>🍎 Dieta anotada: <b style={{ color: INK }}>{r.habits.nutrition_days} día{r.habits.nutrition_days === 1 ? '' : 's'}</b></p>
            </div>
          </div>
          <div className="rounded-xl p-4 border border-gray-200">
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Competencias y equipo</p>
            <div className="mt-1.5 space-y-0.5 text-[12px] text-gray-600">
              <p>🏆 Registradas: <b style={{ color: INK }}>{r.competitions.total}</b></p>
              {r.competitions.next && <p>Próxima: <b style={{ color: INK }}>{r.competitions.next}</b></p>}
              {r.competitions.last && <p>Última: <b style={{ color: INK }}>{r.competitions.last}</b></p>}
              <p>Sesiones presenciales (30 d): <b style={{ color: INK }}>{r.attendance_30d}</b></p>
              {r.season?.phase_now && <p>Fase: <b style={{ color: INK }}>{r.season.phase_now}</b></p>}
              {r.season?.days_to_peak != null && <p>Días al pico: <b style={{ color: GOLD }}>{r.season.days_to_peak}</b></p>}
            </div>
          </div>
        </div>

        {r.last_comment && (
          <div className="rounded-xl p-4 border border-gray-200">
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Última voz del atleta</p>
            <p className="text-[13px] italic mt-1" style={{ color: INK }}>«{r.last_comment}»</p>
          </div>
        )}

        <p className="text-center text-[9px] uppercase tracking-[.18em] pt-2" style={{ ...MONO, color: '#94A3B8' }}>
          The Surf Sequence® · Evolve through play · {r.generated_at}
        </p>
      </div>
    </div>
  );
}
