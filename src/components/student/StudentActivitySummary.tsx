'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStudentActivitySummary, type StudentActivitySummary as Summary } from '@/lib/actions/student-activity';

// ─── Resumen de actividad en la BITÁCORA de la ficha (siempre visible) ───
// Los mismos números que el alumno ve en su portal (fórmula única de horas:
// surf-hours.ts) + la línea de tiempo unificada: coach + misiones + free surf.
// Si la carga falla, se muestra una tarjeta de error con reintento — nunca
// desaparece en silencio.

const fmtH = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-SV', { day: 'numeric', month: 'short' });

const KIND_META: Record<string, { icon: string; label: string; color: string }> = {
  coach: { icon: '🏄', label: 'Sesión con coach', color: '#007A9E' },
  mission: { icon: '🎯', label: 'Misión por su cuenta', color: '#6B4FA8' },
  free_surf: { icon: '🌊', label: 'Free surf', color: '#177A54' },
};

export function StudentActivitySummary({ studentId, beltLabel, seqStep }: {
  studentId: string;
  beltLabel: string;
  /** Nivel de agua del alumno. Antes acá venía "Seq N · Step M", un puntero
   *  que nunca se movía: 997 de 1000 alumnos en la secuencia #1. */
  seqStep: string;
}) {
  const [d, setD] = useState<Summary | null>(null);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    setD(null);
    getStudentActivitySummary(studentId)
      .then((r) => { if (r.ok && r.data) setD(r.data); else setFailed(true); })
      .catch(() => setFailed(true));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  if (failed) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center justify-between gap-3" style={{ borderLeft: '4px solid #E4B33F' }}>
        <p className="text-xs text-gray-600">No se pudo cargar la actividad del portal del alumno.</p>
        <button type="button" onClick={load} className="text-xs font-semibold shrink-0" style={{ color: '#007A9E' }}>
          Reintentar
        </button>
      </div>
    );
  }
  if (!d) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <p className="text-xs text-gray-500">Cargando actividad del alumno…</p>
      </div>
    );
  }

  const items = showAll ? d.timeline : d.timeline.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3" style={{ borderLeft: '4px solid #00A8CC' }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: '#007A9E' }}>
          Actividad del alumno · lo que registra en su portal
        </p>
        {d.week_practices > 0 && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: '#ECFDF5', color: '#177A54' }}
            title="Prácticas que el alumno registró por su cuenta en su portal esta semana"
          >
            🔥 {d.week_practices} por su cuenta esta semana
          </span>
        )}
      </div>

      {/* Números clave — mismos que su portal */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {[
          { n: beltLabel, l: 'Nivel', accent: '#B8862B' },
          { n: seqStep || '—', l: 'En el agua', accent: '#007A9E' },
          { n: fmtH(d.hours.totalMinutes), l: 'Horas en agua', accent: '#0C2231' },
          { n: fmtH(d.hours.trainingMinutes), l: 'Entreno', accent: '#007A9E' },
          { n: fmtH(d.hours.freeSurfMinutes), l: 'Free surf', accent: '#177A54' },
        ].map((x) => (
          <div key={x.l} className="rounded-xl py-2.5 px-2 text-center" style={{ background: '#F8FAFC', border: '1px solid #EEF2F6' }}>
            <p className="text-[14px] font-extrabold leading-tight" style={{ color: x.accent }}>{x.n}</p>
            <p className="text-[9.5px] font-mono uppercase tracking-wide text-gray-500 mt-0.5">{x.l}</p>
          </div>
        ))}
      </div>

      {/* Línea de tiempo unificada */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          Últimas sesiones · {d.counts.coach_sessions} con coach · {d.counts.self_missions} misiones · {d.counts.free_surfs} free surf
        </p>
        <div className="mt-1.5 space-y-1">
          {items.map((t, i) => {
            const meta = KIND_META[t.kind];
            return (
              <div key={i} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: '#F8FAFC' }}>
                <span className="text-[13px] shrink-0" title={meta.label} aria-label={meta.label}>{meta.icon}</span>
                <p className="text-[12px] flex-1 truncate" style={{ color: '#0C2231' }}>
                  <b>{t.title}</b>
                  {t.detail && <span className="text-gray-600"> · {t.detail}</span>}
                  {!t.completed && t.kind !== 'coach' && <span className="text-amber-700"> · sin completar</span>}
                </p>
                <p className="text-[10px] shrink-0 font-mono" style={{ color: meta.color }}>
                  {t.minutes > 0 ? `${t.minutes}m · ` : ''}{fmtDate(t.date)}
                </p>
              </div>
            );
          })}
          {d.timeline.length === 0 && (
            <p className="text-[11px] text-gray-500">Todavía no registra actividad en su portal.</p>
          )}
        </div>
        {d.timeline.length > 5 && (
          <button type="button" onClick={() => setShowAll(!showAll)} className="text-[11px] font-semibold mt-1.5" style={{ color: '#007A9E' }}>
            {showAll ? 'Ver menos' : `Ver ${d.timeline.length - 5} más`}
          </button>
        )}
      </div>
    </div>
  );
}
