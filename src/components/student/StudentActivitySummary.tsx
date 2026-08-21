'use client';

import { useEffect, useState } from 'react';
import { getStudentActivitySummary, type StudentActivitySummary as Summary } from '@/lib/actions/student-activity';

// ─── Resumen de actividad en la BITÁCORA de la ficha (siempre visible) ───
// Los mismos números que el alumno ve en su portal (fórmula única de horas:
// surf-hours.ts) + la línea de tiempo unificada: coach + misiones + free surf.
// Dashboard claro. Staff: español. Autocontenido: null solo si falla la carga
// Y no hay nada que mostrar.

const fmtH = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-SV', { day: 'numeric', month: 'short' });

const KIND_META: Record<string, { icon: string; label: string; color: string }> = {
  coach: { icon: '🏄', label: 'Con coach', color: '#0090B8' },
  mission: { icon: '🎯', label: 'Misión sola', color: '#7C5CBF' },
  free_surf: { icon: '🌊', label: 'Free surf', color: '#1F9D6B' },
};

export function StudentActivitySummary({ studentId, beltLabel, seqStep }: {
  studentId: string;
  beltLabel: string;
  seqStep: string;
}) {
  const [d, setD] = useState<Summary | null>(null);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getStudentActivitySummary(studentId)
      .then((r) => { if (r.ok && r.data) setD(r.data); else setFailed(true); })
      .catch(() => setFailed(true));
  }, [studentId]);

  if (failed) return null;
  if (!d) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <p className="text-xs text-gray-400">Cargando actividad del alumno…</p>
      </div>
    );
  }

  const items = showAll ? d.timeline : d.timeline.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3" style={{ borderLeft: '4px solid #00A8CC' }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: '#0090B8' }}>
          Actividad del alumno · lo que registra en su portal
        </p>
        {d.week_practices > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF5', color: '#1F9D6B' }}>
            🔥 {d.week_practices} esta semana
          </span>
        )}
      </div>

      {/* Números clave — mismos que su portal */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { n: beltLabel, l: 'Nivel', accent: '#B8862B' },
          { n: seqStep, l: 'Secuencia · Paso', accent: '#0090B8' },
          { n: fmtH(d.hours.totalMinutes), l: 'Horas en agua', accent: '#0C2231' },
          { n: fmtH(d.hours.trainingMinutes), l: 'Entreno', accent: '#0090B8' },
          { n: fmtH(d.hours.freeSurfMinutes), l: 'Free surf', accent: '#1F9D6B' },
        ].map((x) => (
          <div key={x.l} className="rounded-xl py-2.5 px-2 text-center" style={{ background: '#F8FAFC', border: '1px solid #EEF2F6' }}>
            <p className="text-[14px] font-extrabold leading-tight" style={{ color: x.accent }}>{x.n}</p>
            <p className="text-[8.5px] font-mono uppercase tracking-wider text-gray-400 mt-0.5">{x.l}</p>
          </div>
        ))}
      </div>

      {/* Línea de tiempo unificada */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          Últimas sesiones · {d.counts.coach_sessions} con coach · {d.counts.self_missions} misiones · {d.counts.free_surfs} free surf
        </p>
        <div className="mt-1.5 space-y-1">
          {items.map((t, i) => {
            const meta = KIND_META[t.kind];
            return (
              <div key={i} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: '#F8FAFC' }}>
                <span className="text-[13px] shrink-0">{meta.icon}</span>
                <p className="text-[12px] flex-1 truncate" style={{ color: '#0C2231' }}>
                  <b>{t.title}</b>
                  {t.detail && <span className="text-gray-500"> · {t.detail}</span>}
                  {!t.completed && t.kind !== 'coach' && <span className="text-amber-600"> · sin completar</span>}
                </p>
                <p className="text-[10px] shrink-0 font-mono" style={{ color: meta.color }}>
                  {t.minutes > 0 ? `${t.minutes}m · ` : ''}{fmtDate(t.date)}
                </p>
              </div>
            );
          })}
          {d.timeline.length === 0 && (
            <p className="text-[11px] text-gray-400">Todavía no registra actividad en su portal.</p>
          )}
        </div>
        {d.timeline.length > 5 && (
          <button type="button" onClick={() => setShowAll(!showAll)} className="text-[11px] font-semibold mt-1.5" style={{ color: '#0090B8' }}>
            {showAll ? 'Ver menos' : `Ver ${d.timeline.length - 5} más`}
          </button>
        )}
      </div>
    </div>
  );
}
