'use client';

import { useEffect, useState } from 'react';
import { adminGetStudentHP, adminSetHpAccess, type StudentHPData } from '@/lib/actions/program-admin';

// ─── El bloque PROGRAMA de la ficha del alumno (sección 13 de la maqueta) ───
// Dashboard (fondo claro): tarjeta blanca con acento dorado, texto navy.
// Autocontenido: null si el alumno no tiene nada de la línea HP, o si quien
// mira no es admin de plataforma (la action devuelve data:null en ese caso).

const ENERGY = ['◔', '◑', '◕', '●'];

export function StudentHPPanel({ studentId }: { studentId: string }) {
  const [data, setData] = useState<StudentHPData | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminGetStudentHP(studentId)
      .then((r) => { if (r.ok) setData(r.data); })
      .catch(() => {});
  }, [studentId]);

  if (!data) return null;
  const a = data.assignment;

  const toggleAccess = async () => {
    const on = !data.hp_access;
    if (!on && !window.confirm(
      'Quitar el acceso de Alto Rendimiento.\n\nEl alumno deja de ver su año, su programa, sus citas, sus competencias y su score. NO se borra nada — si se lo devolvés, vuelve todo tal cual.\n\n¿Quitarlo?',
    )) return;
    setBusy(true);
    const r = await adminSetHpAccess(studentId, on);
    if (!r.ok) { alert(r.error ?? 'No se pudo cambiar el acceso.'); setBusy(false); return; }
    const fresh = await adminGetStudentHP(studentId);
    if (fresh.ok) setData(fresh.data);
    setBusy(false);
  };

  // El interruptor SIEMPRE está — es la única forma de convertir a alguien en
  // atleta de Alto Rendimiento. Cuando no hay acceso ni datos, el panel es
  // solo esa línea: no ensucia la ficha de los ~2.765 alumnos normales.
  const AccessSwitch = (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: '#8E6614' }}>
          Alto Rendimiento · Acceso
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {data.hp_access
            ? <>Ve su año completo: temporada, programa, citas, competencias y score. Puede cargar sus propias competencias.{data.hp_access_granted_at ? ` · desde ${data.hp_access_granted_at.slice(0, 10)}` : ''}</>
            : 'Hoy es un alumno normal: ve cinta, secuencia y next focus. Nada de alto rendimiento.'}
        </p>
      </div>
      <button type="button" onClick={toggleAccess} disabled={busy}
        className="shrink-0 rounded-full px-4 py-2 text-[10px] font-mono uppercase tracking-wider font-bold disabled:opacity-50"
        style={data.hp_access
          ? { background: '#fff', color: '#8E6614', border: '1px solid #F0C36D' }
          : { background: '#B8862B', color: '#fff', border: '1px solid #B8862B' }}>
        {busy ? '…' : data.hp_access ? 'Quitar acceso' : '⭐ Otorgar acceso HP'}
      </button>
    </div>
  );

  if (!data.hp_access && data.empty) {
    return (
      <div className="rounded-2xl bg-white p-4" style={{ border: '1px solid #EFE3C8' }}>
        {AccessSwitch}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white p-4 space-y-3"
      style={{ border: '1px solid #F0C36D', borderLeft: '4px solid #B8862B' }}
    >
      {AccessSwitch}

      {/* Tiene datos HP pero el acceso está apagado: el staff lo ve, el
          alumno no. Hay que decirlo o parece que la app perdió su año. */}
      {!data.hp_access && !data.empty && (
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(192,69,69,.07)', border: '1px solid rgba(192,69,69,.28)' }}>
          <p className="text-[11px] font-semibold" style={{ color: '#c04545' }}>
            El alumno NO ve nada de esto en su portal — el acceso está apagado.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid #F3E7CE' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: '#8E6614' }}>
          Alto Rendimiento · Programa
        </p>
        <a href={`/hp/reporte/${studentId}`} className="text-[10px] font-bold" style={{ color: '#0090B8' }}>
          📄 Reporte del atleta →
        </a>
      </div>

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

      {(data.competitions.total > 0 || data.ranking_position) && (
        <div className="pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Competencias y ranking</p>
          <div className="mt-1 space-y-0.5">
            {data.ranking_position && (
              <p className="text-[11.5px] text-gray-500">
                Ranking semanal: <b style={{ color: '#B8862B' }}>#{data.ranking_position.position}</b> de {data.ranking_position.total} · {data.ranking_position.points} pts
              </p>
            )}
            {data.competitions.next && (
              <p className="text-[11.5px] text-gray-500">
                Próxima: <b className="text-[var(--tss-navy)]">{data.competitions.next.name}</b> · {data.competitions.next.comp_date}
                {data.competitions.next.location ? ` · ${data.competitions.next.location}` : ''}
              </p>
            )}
            {data.competitions.last && (
              <p className="text-[11.5px] text-gray-500">
                Última: {data.competitions.last.name}
                {data.competitions.last.final_place && <> — <b className="text-[var(--tss-navy)]">{data.competitions.last.final_place}</b></>}
              </p>
            )}
            <p className="text-[10px] text-gray-400">{data.competitions.total} competencia{data.competitions.total === 1 ? '' : 's'} registrada{data.competitions.total === 1 ? '' : 's'}</p>
          </div>
        </div>
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
