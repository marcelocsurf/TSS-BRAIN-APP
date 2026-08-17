'use client';

import { useEffect, useState } from 'react';
import { getMyHPAthletes, type HPAthleteRow } from '@/lib/actions/program-coach';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── Alto Rendimiento · Escalón 1 — la tarjeta de seguimiento del coach ───
//
// Mismo patrón que ProgramCard del alumno: autocontenida, busca sus datos con
// el token y devuelve null si el coach no tiene el Escalón 1 o no tiene
// atletas asignados con programa. Para el resto de coaches, el Home queda
// idéntico. Staff-facing: español.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

export function HPFollowCard({ token }: { token: string }) {
  const [athletes, setAthletes] = useState<HPAthleteRow[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    getMyHPAthletes(token)
      .then((r) => {
        if (r.ok && r.data && r.data.athletes.length > 0) setAthletes(r.data.athletes);
      })
      .catch(() => {});
  }, [token]);

  if (!athletes) return null;

  const ENERGY = ['◔', '◑', '◕', '●'];

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,209,102,.06)', border: '1px solid rgba(255,209,102,.4)' }}
    >
      <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>
        Alto Rendimiento · Seguimiento
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: '#9aa7ad' }}>
        {athletes.length} atleta{athletes.length === 1 ? '' : 's'} con programa a tu cargo
      </p>

      <div className="mt-3 space-y-2">
        {athletes.map((a) => {
          const pct = a.days_total > 0 ? Math.round((a.days_done / a.days_total) * 100) : 0;
          const expanded = open === a.assignment_id;
          return (
            <div
              key={a.assignment_id}
              className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : a.assignment_id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-white truncate">{a.student_name}</p>
                  <span
                    className="text-[10px] font-bold shrink-0"
                    style={{ color: a.active_today ? '#39D98A' : '#FFD166' }}
                  >
                    {a.active_today ? '✓ activo hoy' : 'sin actividad hoy'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-[10.5px]" style={{ color: '#9aa7ad' }}>
                    {a.program_title} ·{' '}
                    {a.position ? `S${a.position.week}·D${a.position.day}` : 'completado ✓'} · {a.days_done}/{a.days_total} días
                  </p>
                  {expanded ? (
                    <ChevronUp size={13} style={{ color: '#9aa7ad' }} />
                  ) : (
                    <ChevronDown size={13} style={{ color: '#9aa7ad' }} />
                  )}
                </div>
                <div className="mt-1.5 h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#FFD166' }} />
                </div>
              </button>

              {expanded && (
                <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  {a.last_checkin ? (
                    <>
                      <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>
                        Último check-in · {a.last_checkin.date}
                      </p>
                      <p className="text-[11.5px] mt-1" style={{ color: '#b8cad8' }}>
                        {a.last_checkin.water_glasses != null && <>💧 {a.last_checkin.water_glasses}/8 · </>}
                        {a.last_checkin.sleep_hours != null && <>😴 {a.last_checkin.sleep_hours} h · </>}
                        {a.last_checkin.energy != null && <>energía {ENERGY[a.last_checkin.energy - 1] ?? a.last_checkin.energy}</>}
                      </p>
                      {a.last_checkin.comment && (
                        <p className="text-[11.5px] italic mt-1.5" style={{ color: '#eaf4fa' }}>
                          «{a.last_checkin.comment}»
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[11px]" style={{ color: '#9aa7ad' }}>Todavía sin check-ins.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
