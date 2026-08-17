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
import { CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Alto Rendimiento · Escalón 1 — la tarjeta de seguimiento del coach ───
//
// Mismo patrón que ProgramCard del alumno: autocontenida, busca sus datos con
// el token y devuelve null si el coach no tiene el Escalón 1 o no tiene
// atletas asignados con programa. Para el resto de coaches, el Home queda
// idéntico. Staff-facing: español.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

export function HPFollowCard({ token }: { token: string }) {
  const [athletes, setAthletes] = useState<HPAthleteRow[] | null>(null);
  const [citas, setCitas] = useState<CoachAppointment[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [openCita, setOpenCita] = useState<string | null>(null);

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
      style={{ background: 'rgba(255,209,102,.06)', border: '1px solid rgba(255,209,102,.4)' }}
    >
      <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>
        Alto Rendimiento · Seguimiento
      </p>
      {athletes && (
        <p className="text-[11px] mt-0.5" style={{ color: '#9aa7ad' }}>
          {athletes.length} atleta{athletes.length === 1 ? '' : 's'} con programa a tu cargo
        </p>
      )}

      {citas.length > 0 && (
        <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
          <p className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ ...MONO, color: '#7BA2B5' }}>
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
                  <p className="text-[12px] truncate" style={{ color: '#eaf4fa' }}>
                    <b>{c.student_name}</b>
                    <span style={{ color: '#9aa7ad' }}> · {c.title || c.kind}</span>
                  </p>
                  <p className="text-[11px] font-bold shrink-0" style={{ color: '#FFD166' }}>
                    {c.appointment_date}{c.appointment_time ? ` · ${c.appointment_time}` : ''}
                  </p>
                </button>
                {/* El especialista evalúa DESDE la cita: su atleta puede no
                    estar en su lista de programas (él atiende, no da
                    seguimiento) y este es su único punto de entrada. */}
                {openCita === c.id && <EvalBlock token={token} studentId={c.student_id} />}
              </div>
            ))}
          </div>
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
                    {a.position ? `M${a.position.week}·D${a.position.day}` : 'completado ✓'} · {a.days_done}/{a.days_total} días
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
    <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>
          Evaluaciones por pilar
        </p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-[10px] font-bold"
            style={{ color: '#FFD166' }}
          >
            + Evaluar
          </button>
        )}
      </div>

      {evals.length > 0 && (
        <div className="mt-1.5 space-y-1">
          {evals.map((e) => (
            <p key={e.id} className="text-[11.5px]" style={{ color: '#b8cad8' }}>
              <b style={{ color: '#eaf4fa', textTransform: 'capitalize' }}>{e.pillar}</b>
              {e.score != null && <> · <b style={{ color: '#00D2FF' }}>{e.score}/10</b></>} · {e.eval_date}
              {e.notes && <span style={{ color: '#9aa7ad' }}> — {e.notes}</span>}
            </p>
          ))}
        </div>
      )}
      {evals.length === 0 && !adding && (
        <p className="text-[11px] mt-1" style={{ color: '#9aa7ad' }}>Sin evaluaciones todavía.</p>
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
                  background: pillar === p.key ? '#00D2FF' : 'rgba(255,255,255,.07)',
                  color: pillar === p.key ? '#061C2B' : '#9aa7ad',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: '#b8cad8' }}>Puntaje</span>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1"
              aria-label="Puntaje 1 a 10"
            />
            <span className="text-[13px] font-bold w-10 text-right" style={{ color: '#00D2FF' }}>{score}/10</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nota (opcional)…"
            aria-label="Nota de la evaluación"
            rows={2}
            className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
            style={{ background: 'rgba(255,255,255,.07)', border: '1px dashed #2A4D5F', color: '#eaf4fa' }}
          />
          {err && <p className="text-[11px]" style={{ color: '#ffb4a6' }}>{err}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="flex-1 rounded-full py-2 text-[11px] font-bold"
              style={{ background: '#00D2FF', color: '#061C2B', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'GUARDANDO…' : 'GUARDAR EVALUACIÓN'}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setErr(null); }}
              className="px-3 rounded-full text-[11px]"
              style={{ color: '#9aa7ad' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
