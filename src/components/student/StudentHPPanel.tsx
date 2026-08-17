'use client';

import { useEffect, useState } from 'react';
import { adminGetStudentHP, type StudentHPData } from '@/lib/actions/program-admin';

// ─── El bloque PROGRAMA de la ficha del alumno (sección 13 de la maqueta) ───
// Dashboard (fondo claro): tarjeta blanca con acento dorado, texto navy.
// Autocontenido: null si el alumno no tiene nada de la línea HP, o si quien
// mira no es admin de plataforma (la action devuelve data:null en ese caso).

const ENERGY = ['◔', '◑', '◕', '●'];

export function StudentHPPanel({ studentId }: { studentId: string }) {
  const [data, setData] = useState<StudentHPData | null>(null);

  useEffect(() => {
    adminGetStudentHP(studentId)
      .then((r) => { if (r.ok) setData(r.data); })
      .catch(() => {});
  }, [studentId]);

  if (!data) return null;
  const a = data.assignment;

  return (
    <div
      className="rounded-2xl bg-white p-4 space-y-3"
      style={{ border: '1px solid #F0C36D', borderLeft: '4px solid #B8862B' }}
    >
      <p className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: '#8E6614' }}>
        Alto Rendimiento · Programa
      </p>

      {data.season && (
        <div className="rounded-xl p-3" style={{ background: '#FDF8EC', border: '1px solid #F0C36D' }}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-[var(--tss-navy)]">{data.season.title}</p>
            {data.season.days_to_peak != null && (
              <p className="text-[11px] font-mono font-bold" style={{ color: '#8E6614' }}>
                {data.season.days_to_peak} DÍAS AL PICO{data.season.peak_name ? ` · ${data.season.peak_name.toUpperCase()}` : ''}
              </p>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {data.season.phase_now ? `Fase actual: ${data.season.phase_now}` : 'Temporada activa'}
            {data.season.objective ? ` · ${data.season.objective}` : ''}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            {data.season.head_coach ? `Head coach: ${data.season.head_coach}` : 'Head coach: Marcelo'}
            {data.season.specialists.length > 0 && ` · Especialistas: ${data.season.specialists.join(', ')}`}
          </p>
        </div>
      )}

      {a ? (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">{a.program_title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {a.position ? `M${a.position.week}·D${a.position.day}` : 'completado ✓'} · desde {a.start_date}
              {a.coach_name ? ` · coach: ${a.coach_name}` : ' · sin coach de seguimiento'}
            </p>
            {a.last_checkin && (
              <p className="text-[11px] text-gray-500 mt-1">
                Último check-in {a.last_checkin.date}:
                {a.last_checkin.water != null && <> 💧 {a.last_checkin.water}/8</>}
                {a.last_checkin.sleep != null && <> · 😴 {a.last_checkin.sleep} h</>}
                {a.last_checkin.energy != null && <> · {ENERGY[a.last_checkin.energy - 1] ?? a.last_checkin.energy}</>}
                {a.last_checkin.comment && <span className="italic text-[var(--tss-navy)]"> — «{a.last_checkin.comment}»</span>}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[var(--tss-navy)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {a.days_done}/{a.days_total} días · {a.adherence_pct}%
            </p>
            <div className="w-28 h-1.5 rounded-full bg-gray-100 overflow-hidden mt-1 ml-auto">
              <div className="h-full rounded-full" style={{ width: `${a.adherence_pct}%`, background: '#B8862B' }} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-gray-400">Sin programa activo.</p>
      )}

      {data.evaluations.length > 0 && (
        <div className="pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Evaluaciones por pilar</p>
          <div className="mt-1 space-y-0.5">
            {data.evaluations.map((e, i) => (
              <p key={i} className="text-[11.5px] text-gray-500">
                <b className="capitalize text-[var(--tss-navy)]">{e.pillar}</b>
                {e.score != null && <> · <b style={{ color: '#0090B8' }}>{e.score}/10</b></>} · {e.eval_date} · {e.coach_name}
                {e.notes && <span className="text-gray-500"> — {e.notes}</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {data.past_programs.length > 0 && (
        <div className="pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Programas anteriores</p>
          <div className="mt-1 space-y-0.5">
            {data.past_programs.map((p, i) => (
              <p key={i} className="text-[11.5px] text-gray-500">
                {p.title} — adherencia final <b className="text-[var(--tss-navy)]">{p.adherence_pct}%</b>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
