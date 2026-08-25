'use client';

import { useEffect, useState } from 'react';
import {
  getMyHPAthletes,
  getMyHPAppointments,
  getAthleteEvaluations,
  coachCreateEvaluation,
  type HPAthleteRow,
  type CoachAppointment,
  type AthleteEvaluation,
} from '@/lib/actions/program-coach';
import { CalendarClock, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { coachGetWeeklyRanking } from '@/lib/actions/competitions';

// ─── Alto Rendimiento · Escalón 1 — la tarjeta de seguimiento del coach ───
//
// OJO CON EL FONDO: esta tarjeta vive en la zona BAJA del Home del coach, que
// es CLARA (#F2F6F8) — la paleta acá es la de la maqueta aprobada (tarjeta
// blanca, acento dorado, texto navy). La primera versión usó colores de fondo
// oscuro y Marcelo la vio blanco-sobre-blanco.
//
// Autocontenida: null si el coach no tiene Escalón 1 ni citas. Staff: español.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

const C = {
  cardBg: '#FFFFFF',
  cardBorder: '#F0C36D',
  goldStrong: '#B8862B',
  goldText: '#8E6614',
  navy: '#0C2231',
  dim: '#55707F',
  faint: '#7A96A4',
  rowBg: '#F8FAFC',
  rowBorder: '#E2E8F0',
  track: '#E7EFF3',
  green: '#1F9D6B',
  cyan: '#0090B8',
  red: '#C0392B',
};

export function HPFollowCard({ token }: { token: string }) {
  const [athletes, setAthletes] = useState<HPAthleteRow[] | null>(null);
  const [citas, setCitas] = useState<CoachAppointment[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [openCita, setOpenCita] = useState<string | null>(null);
  const [ranking, setRanking] = useState<{ student_id: string; name: string; points: number; position: number }[]>([]);
  const [showAllRank, setShowAllRank] = useState(false);

  useEffect(() => {
    coachGetWeeklyRanking(token)
      .then((r) => { if (r.ok) setRanking(r.rows); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    getMyHPAthletes(token)
      .then((r) => {
        if (r.ok && r.data && r.data.athletes.length > 0) setAthletes(r.data.athletes);
      })
      .catch(() => {});
    getMyHPAppointments(token)
      .then((r) => { if (r.ok) setCitas(r.appointments); })
      .catch(() => {});
  }, [token]);

  if (!athletes && citas.length === 0) return null;

  const ENERGY = ['◔', '◑', '◕', '●'];

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderLeft: `4px solid ${C.goldStrong}` }}
    >
      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: C.goldText }}>
        Alto Rendimiento · Seguimiento
      </p>
      {athletes && (
        <p className="text-[11px] mt-0.5" style={{ color: C.dim }}>
          {athletes.length} atleta{athletes.length === 1 ? '' : 's'} con programa a tu cargo
        </p>
      )}

      {citas.length > 0 && (
        <div className="mt-3 rounded-xl p-3" style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
          <p className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ ...MONO, color: C.faint }}>
            <CalendarClock size={11} /> Próximas citas
          </p>
          <div className="mt-1.5 space-y-1">
            {citas.map((c) => (
              <div key={c.id}>
                <button
                  type="button"
                  onClick={() => setOpenCita(openCita === c.id ? null : c.id)}
                  className="w-full flex items-center justify-between gap-2 text-left"
                >
                  <p className="text-[12px] truncate" style={{ color: C.navy }}>
                    <b>{c.student_name}</b>
                    <span style={{ color: C.dim }}> · {c.title || c.kind}</span>
                  </p>
                  <p className="text-[11px] font-bold shrink-0" style={{ color: C.goldStrong }}>
                    {c.appointment_date}{c.appointment_time ? ` · ${c.appointment_time}` : ''}{c.mode ? ` · ${c.mode}` : ''}
                  </p>
                </button>
                {/* El especialista evalúa DESDE la cita: puede no tener al
                    atleta en su lista de programas — este es su punto de entrada. */}
                {openCita === c.id && <EvalBlock token={token} studentId={c.student_id} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {ranking.length > 0 && (
        <div className="mt-3 rounded-xl p-3" style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
          <button type="button" onClick={() => setShowAllRank(!showAllRank)} className="w-full flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ ...MONO, color: C.faint }}>
              <Trophy size={11} /> Ranking semanal · grupo HP
            </p>
            {showAllRank ? <ChevronUp size={13} style={{ color: C.faint }} /> : <ChevronDown size={13} style={{ color: C.faint }} />}
          </button>
          <div className="mt-1.5 space-y-0.5">
            {(showAllRank ? ranking : ranking.slice(0, 5)).map((r) => {
              const isMine = (athletes ?? []).some((a) => a.student_id === r.student_id);
              return (
                <div key={r.student_id} className="flex items-center justify-between">
                  <p className="text-[11.5px]" style={{ color: isMine ? C.goldStrong : C.dim, fontWeight: isMine || r.position <= 3 ? 700 : 400 }}>
                    {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `${r.position}.`} {r.name}{isMine ? ' · tuyo' : ''}
                  </p>
                  <p className="text-[11px]" style={{ ...MONO, color: C.faint }}>{r.points}</p>
                </div>
              );
            })}
          </div>
          {!showAllRank && ranking.length > 5 && (
            <button type="button" onClick={() => setShowAllRank(true)} className="text-[10px] font-bold mt-1.5" style={{ color: C.cyan }}>
              Ver los {ranking.length} →
            </button>
          )}
        </div>
      )}

      <div className="mt-3 space-y-2">
        {(athletes ?? []).map((a) => {
          const pct = a.days_total > 0 ? Math.round((a.days_done / a.days_total) * 100) : 0;
          const expanded = open === a.assignment_id;
          return (
            <div
              key={a.assignment_id}
              className="rounded-xl p-3"
              style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : a.assignment_id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold truncate" style={{ color: C.navy }}>{a.student_name}</p>
                  <span
                    className="text-[10px] font-bold shrink-0"
                    style={{ color: a.active_today ? C.green : C.goldStrong }}
                  >
                    {a.active_today ? '✓ activo hoy' : 'sin actividad hoy'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-[10.5px]" style={{ color: C.dim }}>
                    {a.program_title} ·{' '}
                    {a.position ? `M${a.position.week}·D${a.position.day}` : 'completado ✓'} · {a.days_done}/{a.days_total} días
                  </p>
                  {expanded ? (
                    <ChevronUp size={13} style={{ color: C.faint }} />
                  ) : (
                    <ChevronDown size={13} style={{ color: C.faint }} />
                  )}
                </div>
                <div className="mt-1.5 h-[4px] rounded-full overflow-hidden" style={{ background: C.track }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.goldStrong }} />
                </div>
              </button>

              {expanded && (
                <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.rowBorder}` }}>
                  {a.last_checkin ? (
                    <>
                      <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: C.faint }}>
                        Último check-in · {a.last_checkin.date}
                      </p>
                      <p className="text-[11.5px] mt-1" style={{ color: C.dim }}>
                        {a.last_checkin.water_glasses != null && <>💧 {a.last_checkin.water_glasses}/8 · </>}
                        {a.last_checkin.sleep_hours != null && <>😴 {a.last_checkin.sleep_hours} h · </>}
                        {a.last_checkin.energy != null && <>energía {ENERGY[a.last_checkin.energy - 1] ?? a.last_checkin.energy}</>}
                        {(a.last_checkin as any).nutrition_clean
                          ? <> · 🥗 comió limpio: {({ si: 'sí', parcial: 'parcial', no: 'no' } as any)[(a.last_checkin as any).nutrition_clean]}</>
                          : a.last_checkin.nutrition ? <> · 🍎 {a.last_checkin.nutrition}</> : null}
                      </p>
                      {a.last_checkin.comment && (
                        <p className="text-[11.5px] italic mt-1.5" style={{ color: C.navy }}>
                          «{a.last_checkin.comment}»
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[11px]" style={{ color: C.dim }}>Todavía sin check-ins.</p>
                  )}
                  <EvalBlock token={token} studentId={a.student_id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Evaluaciones por pilar (el formulario del especialista) ───

const PILLARS = [
  { key: 'fisico', label: 'Físico' },
  { key: 'tecnico', label: 'Técnico' },
  { key: 'tactico', label: 'Táctico' },
  { key: 'mental', label: 'Mental' },
] as const;

function EvalBlock({ token, studentId }: { token: string; studentId: string }) {
  const [evals, setEvals] = useState<AthleteEvaluation[]>([]);
  const [adding, setAdding] = useState(false);
  const [pillar, setPillar] = useState<'fisico' | 'tecnico' | 'tactico' | 'mental'>('fisico');
  const [score, setScore] = useState(7);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    getAthleteEvaluations(token, studentId)
      .then((r) => { if (r.ok) setEvals(r.evaluations); })
      .catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [studentId]);

  const save = async () => {
    setErr(null);
    setSaving(true);
    const r = await coachCreateEvaluation(token, studentId, { pillar, score, notes });
    setSaving(false);
    if (!r.ok) { setErr(r.error || 'No se pudo guardar.'); return; }
    setAdding(false);
    setNotes('');
    load();
  };

  return (
    <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.rowBorder}` }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: C.faint }}>
          Evaluaciones por pilar
        </p>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="text-[10px] font-bold" style={{ color: C.goldStrong }}>
            + Evaluar
          </button>
        )}
      </div>

      {evals.length > 0 && (
        <div className="mt-1.5 space-y-1">
          {evals.map((e) => (
            <p key={e.id} className="text-[11.5px]" style={{ color: C.dim }}>
              <b style={{ color: C.navy, textTransform: 'capitalize' }}>{e.pillar}</b>
              {e.score != null && <> · <b style={{ color: C.cyan }}>{e.score}/10</b></>} · {e.eval_date}
              {e.notes && <span style={{ color: C.faint }}> — {e.notes}</span>}
            </p>
          ))}
        </div>
      )}
      {evals.length === 0 && !adding && (
        <p className="text-[11px] mt-1" style={{ color: C.faint }}>Sin evaluaciones todavía.</p>
      )}

      {adding && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {PILLARS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPillar(p.key)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{
                  background: pillar === p.key ? C.cyan : '#EEF2F6',
                  color: pillar === p.key ? '#FFFFFF' : C.dim,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: C.dim }}>Puntaje</span>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1"
              aria-label="Puntaje 1 a 10"
            />
            <span className="text-[13px] font-bold w-10 text-right" style={{ color: C.cyan }}>{score}/10</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nota (opcional)…"
            aria-label="Nota de la evaluación"
            rows={2}
            className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
            style={{ background: '#FFFFFF', border: `1px dashed #CBD5E1`, color: C.navy }}
          />
          {err && <p className="text-[11px]" style={{ color: C.red }}>{err}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="flex-1 rounded-full py-2 text-[11px] font-bold"
              style={{ background: C.cyan, color: '#FFFFFF', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'GUARDANDO…' : 'GUARDAR EVALUACIÓN'}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setErr(null); }}
              className="px-3 rounded-full text-[11px]"
              style={{ color: C.faint }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
