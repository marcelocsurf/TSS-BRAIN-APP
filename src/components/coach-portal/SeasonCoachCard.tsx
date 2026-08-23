'use client';

import { useEffect, useState } from 'react';
import {
  getMySeasonsHP,
  coachAddSeasonContribution,
  coachCreateAppointmentHP,
  type CoachSeasonView,
} from '@/lib/actions/program-coach';
import { CalendarRange, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Entrega C: el plan anual desde el portal del coach/especialista ───
//
// OJO CON EL FONDO: zona BAJA del Home del coach = fondo CLARO (#F2F6F8) —
// misma paleta clara que HPFollowCard (ya hubo un blanco-sobre-blanco acá).
//
// Head coach: ve las cargas de la semana para ajustar y calibrar.
// Especialista: agenda sus citas (online/presencial) y deja aportes que el
// atleta ve en "From your team". Autocontenida: null sin temporadas.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

const C = {
  cardBg: '#FFFFFF',
  cardBorder: '#F0C36D',
  goldStrong: '#B8862B',
  goldText: '#8E6614',
  goldSoft: '#FDF8EC',
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

const KIND_LABEL: Record<string, string> = {
  fisico: 'Físico', mental: 'Mental', tecnico: 'Técnico', nutricion: 'Nutrición', evaluacion: 'Evaluación', otro: 'Otro',
};
const SPECIALTY_LABEL: Record<string, string> = {
  mental: 'Psicólogo', fisico: 'Prep. físico', nutricion: 'Nutricionista',
};

export function SeasonCoachCard({ token }: { token: string }) {
  const [seasons, setSeasons] = useState<CoachSeasonView[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const load = () => {
    getMySeasonsHP(token)
      .then((r) => { if (r.ok) setSeasons(r.seasons); })
      .catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [token]);

  if (seasons.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderLeft: `4px solid ${C.goldStrong}` }}
    >
      <p className="text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1.5" style={{ ...MONO, color: C.goldText }}>
        <CalendarRange size={11} /> Plan anual · Temporadas a tu cargo
      </p>

      <div className="mt-3 space-y-2">
        {seasons.map((s) => {
          const expanded = open === s.season_id;
          return (
            <div key={s.season_id} className="rounded-xl p-3" style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
              <button type="button" onClick={() => setOpen(expanded ? null : s.season_id)} className="w-full text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold truncate" style={{ color: C.navy }}>
                    {s.student_name}
                    <span
                      className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                      style={{ background: s.is_head ? C.goldSoft : '#E8F6FB', color: s.is_head ? C.goldText : C.cyan }}
                    >
                      {s.is_head ? 'Head coach' : 'Especialista'}
                    </span>
                  </p>
                  {expanded ? <ChevronUp size={13} style={{ color: C.faint }} /> : <ChevronDown size={13} style={{ color: C.faint }} />}
                </div>
                <p className="text-[10.5px] mt-0.5" style={{ color: C.dim }}>
                  {s.title}
                  {s.phase_now ? ` · fase: ${s.phase_now}` : ''}
                  {s.days_to_peak != null && (
                    <b style={{ color: C.goldStrong }}> · {s.days_to_peak} días al pico{s.peak_name ? ` (${s.peak_name})` : ''}</b>
                  )}
                </p>
              </button>

              {expanded && (
                <div className="mt-2.5 pt-2.5 space-y-3" style={{ borderTop: `1px solid ${C.rowBorder}` }}>
                  {/* Cargas de la semana — el monitor del head coach */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: C.faint }}>Cargas · últimos 7 días</p>
                    {s.load ? (
                      <>
                        <p className="text-[11.5px] mt-1" style={{ color: C.dim }}>
                          {s.load.program_title} · <b style={{ color: C.navy }}>{s.load.marks_last7}/7 días</b> marcados
                          {' '}· {s.load.checkins_last7} check-in{s.load.checkins_last7 === 1 ? '' : 's'}
                          {s.load.last_checkin_date ? ` (último ${s.load.last_checkin_date})` : ''}
                        </p>
                        <div className="mt-1.5 h-[4px] rounded-full overflow-hidden" style={{ background: C.track }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.load.days_total > 0 ? Math.round((s.load.days_done / s.load.days_total) * 100) : 0}%`,
                              background: C.goldStrong,
                            }}
                          />
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: C.faint }}>
                          {s.load.days_done}/{s.load.days_total} días del programa en total
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] mt-1" style={{ color: C.dim }}>Sin programa activo.</p>
                    )}
                  </div>

                  {/* Aportes recientes del equipo — todos alineados */}
                  {s.contributions.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: C.faint }}>Aportes del equipo</p>
                      <div className="mt-1 space-y-0.5">
                        {s.contributions.map((c, i) => (
                          <p key={i} className="text-[11.5px]" style={{ color: C.dim }}>
                            <b style={{ color: C.navy, textTransform: 'capitalize' }}>{c.kind}</b> · {c.title}
                            <span style={{ color: C.faint }}>
                              {' '}— {c.specialty ? SPECIALTY_LABEL[c.specialty] ?? c.coach_name : c.coach_name}
                              {c.target_date ? ` · para ${c.target_date}` : ''}
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <ContributionForm token={token} seasonId={s.season_id} onSaved={load} />
                  <AppointmentForm token={token} seasonId={s.season_id} studentName={s.student_name} onSaved={load} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContributionForm({ token, seasonId, onSaved }: { token: string; seasonId: string; onSaved: () => void }) {
  const [openForm, setOpenForm] = useState(false);
  const [kind, setKind] = useState<'video' | 'tarea' | 'nota'>('nota');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [detail, setDetail] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setErr(null);
    setSaving(true);
    const r = await coachAddSeasonContribution(token, seasonId, {
      kind, title, video_url: kind === 'video' ? url : null, detail: detail || null,
    });
    setSaving(false);
    if (!r.ok) { setErr(r.error || 'No se pudo guardar.'); return; }
    setOpenForm(false); setTitle(''); setUrl(''); setDetail('');
    onSaved();
  };

  if (!openForm) {
    return (
      <button type="button" onClick={() => setOpenForm(true)} className="text-[10px] font-bold" style={{ color: C.goldStrong }}>
        + Dejar aporte (video / tarea / nota)
      </button>
    );
  }
  return (
    <div className="rounded-lg p-2.5 space-y-2" style={{ background: '#FFFFFF', border: `1px dashed #CBD5E1` }}>
      <div className="flex gap-1.5">
        {(['video', 'tarea', 'nota'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize"
            style={{ background: kind === k ? C.cyan : '#EEF2F6', color: kind === k ? '#FFFFFF' : C.dim }}>
            {k}
          </button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (inglés — lo ve el atleta)" aria-label="Título del aporte"
        className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
        style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, color: C.navy }} />
      {kind === 'video' && (
        <input value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="Link del video (YouTube…)" aria-label="Link del video" inputMode="url"
          className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
          style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, color: C.navy }} />
      )}
      <textarea value={detail} onChange={(e) => setDetail(e.target.value)}
        placeholder="Detalle (opcional, inglés)…" aria-label="Detalle del aporte" rows={2}
        className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
        style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, color: C.navy }} />
      {err && <p className="text-[11px]" style={{ color: C.red }}>{err}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={saving || !title.trim() || (kind === 'video' && !url.trim())} onClick={save}
          className="flex-1 rounded-full py-2 text-[11px] font-bold"
          style={{ background: C.cyan, color: '#FFFFFF', opacity: saving || !title.trim() || (kind === 'video' && !url.trim()) ? 0.5 : 1 }}>
          {saving ? 'GUARDANDO…' : 'GUARDAR APORTE'}
        </button>
        <button type="button" onClick={() => { setOpenForm(false); setErr(null); }} className="px-3 rounded-full text-[11px]" style={{ color: C.faint }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function AppointmentForm({ token, seasonId, studentName, onSaved }: {
  token: string; seasonId: string; studentName: string; onSaved: () => void;
}) {
  const [openForm, setOpenForm] = useState(false);
  const [kind, setKind] = useState<'fisico' | 'mental' | 'tecnico' | 'nutricion' | 'evaluacion' | 'otro'>('fisico');
  const [mode, setMode] = useState<'online' | 'presencial'>('online');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setErr(null);
    setSaving(true);
    const r = await coachCreateAppointmentHP(token, { seasonId, kind, mode, date, time: time || null, title: title || null });
    setSaving(false);
    if (!r.ok) { setErr(r.error || 'No se pudo agendar.'); return; }
    setOpenForm(false); setDate(''); setTime(''); setTitle('');
    onSaved();
  };

  if (!openForm) {
    return (
      <button type="button" onClick={() => setOpenForm(true)} className="text-[10px] font-bold" style={{ color: C.goldStrong }}>
        + Agendar cita con {studentName} (online / presencial)
      </button>
    );
  }
  return (
    <div className="rounded-lg p-2.5 space-y-2" style={{ background: '#FFFFFF', border: `1px dashed #CBD5E1` }}>
      <div className="flex gap-1.5 flex-wrap">
        {(['fisico', 'mental', 'tecnico', 'nutricion', 'evaluacion', 'otro'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: kind === k ? C.cyan : '#EEF2F6', color: kind === k ? '#FFFFFF' : C.dim }}>
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        {(['online', 'presencial'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize"
            style={{ background: mode === m ? C.goldStrong : '#EEF2F6', color: mode === m ? '#FFFFFF' : C.dim }}>
            {m}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Fecha de la cita"
          className="flex-1 rounded-lg px-2.5 py-1.5 text-[12px]"
          style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, color: C.navy }} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Hora de la cita"
          className="rounded-lg px-2.5 py-1.5 text-[12px]"
          style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, color: C.navy }} />
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional) — Mental prep session" aria-label="Título de la cita"
        className="w-full rounded-lg px-2.5 py-1.5 text-[12px]"
        style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, color: C.navy }} />
      {err && <p className="text-[11px]" style={{ color: C.red }}>{err}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={saving || !date} onClick={save}
          className="flex-1 rounded-full py-2 text-[11px] font-bold"
          style={{ background: C.cyan, color: '#FFFFFF', opacity: saving || !date ? 0.5 : 1 }}>
          {saving ? 'AGENDANDO…' : 'AGENDAR CITA'}
        </button>
        <button type="button" onClick={() => { setOpenForm(false); setErr(null); }} className="px-3 rounded-full text-[11px]" style={{ color: C.faint }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
