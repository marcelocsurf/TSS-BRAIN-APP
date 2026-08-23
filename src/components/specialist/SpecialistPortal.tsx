'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getSpecialistHome, getSpecialistAthlete, specialistPostWall, specialistSaveDiet, specialistCreateTask,
  specialistCreateAppointment,
  type SpecialistHome, type SpecialistAthlete,
} from '@/lib/actions/specialist';


// ═══ PORTAL DEL EQUIPO HP — Brand v10 (ink #061C2B · cyan #00D2FF · gold #FFD166) ═══
// Staff-facing → español. Cada especialista ve SUS atletas y sus herramientas.

const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#39D98A';
const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' as any, fontWeight: 800, letterSpacing: '-0.01em' };

const ROLE_COLOR: Record<string, string> = {
  psicologo: '#9B7BFF', fisico: GREEN, nutricionista: GOLD, head: CYAN, asistente: '#7BA2B5', coach: CYAN,
};
const KIND_META: Record<string, { icon: string; label: string }> = {
  fisico: { icon: '💪', label: 'Físico' },
  mental: { icon: '🧠', label: 'Mental' },
  tecnico: { icon: '🎯', label: 'Técnico' },
  nutricion: { icon: '🥗', label: 'Nutrición' },
  evaluacion: { icon: '📋', label: 'Evaluación' },
  otro: { icon: '📅', label: 'Cita' },
};
const PILLAR_META: Array<{ key: 'fis' | 'tec' | 'tac' | 'men'; label: string; color: string }> = [
  { key: 'fis', label: 'Físico', color: GREEN },
  { key: 'tec', label: 'Técnico', color: CYAN },
  { key: 'tac', label: 'Táctico', color: '#9B7BFF' },
  { key: 'men', label: 'Mental', color: '#FFA94D' },
];

const fmtDT = (iso: string) => new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/El_Salvador' });

export function SpecialistPortal({ token }: { token: string }) {
  const [home, setHome] = useState<SpecialistHome | null | 'denied'>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getSpecialistHome(token)
      .then((r) => setHome(r.ok ? (r.data ?? 'denied') : 'denied'))
      .catch(() => setHome('denied'));
  }, [token]);

  if (home === null) {
    return <Shell><p className="text-sm" style={{ color: '#7BA2B5' }}>Cargando tu equipo…</p></Shell>;
  }
  if (home === 'denied') {
    return (
      <Shell>
        <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,.05)' }}>
          <p className="text-sm font-semibold text-white">Este link no tiene temporadas asignadas.</p>
          <p className="text-[12px] mt-1" style={{ color: '#8aa0b2' }}>Pedile a coordinación que te asigne como especialista o head coach de una temporada.</p>
        </div>
      </Shell>
    );
  }

  const roleColor = ROLE_COLOR[home.me.roleKey] ?? CYAN;

  return (
    <Shell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ ...MONO, color: CYAN }}>The Surf Sequence · Team</p>
          <h1 className="text-white mt-1" style={{ ...DISPLAY, fontSize: 26, textTransform: 'uppercase' }}>{home.me.name}</h1>
          <span className="inline-block mt-1.5 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold" style={{ ...MONO, background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}66` }}>
            {home.me.roleLabel}
          </span>
        </div>
      </div>

      {/* Mis atletas */}
      <p className="text-[10px] uppercase tracking-wider mt-5 mb-2" style={{ ...MONO, color: '#7BA2B5' }}>
        Mis atletas · {home.athletes.length}
      </p>
      <div className="space-y-2.5">
        {home.athletes.map((a) => (
          <div key={`${a.season_id}-${a.student_id}`}>
            <button
              type="button"
              onClick={() => setOpenId(openId === a.student_id ? null : a.student_id)}
              className="w-full text-left rounded-2xl p-3.5 flex items-center gap-3"
              style={{ background: openId === a.student_id ? 'rgba(0,210,255,.08)' : 'rgba(255,255,255,.05)', border: openId === a.student_id ? `1px solid ${CYAN}55` : '1px solid rgba(255,255,255,.08)' }}
            >
              {a.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.photo_url} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" style={{ border: `2px solid ${CYAN}` }} />
              ) : (
                <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-[15px] font-bold" style={{ background: 'rgba(0,210,255,.14)', color: CYAN }}>
                  {a.name.slice(0, 1)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-white truncate" style={DISPLAY}>
                  {a.name}{a.nickname ? <span className="font-normal" style={{ color: '#8aa0b2' }}> · {a.nickname}</span> : null}
                </p>
                <p className="text-[10px] uppercase tracking-wider truncate" style={{ ...MONO, color: GOLD }}>{a.season_title}</p>
                {a.next_event && <p className="text-[10.5px] mt-0.5 truncate" style={{ color: '#9fd7e8' }}>{a.next_event}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-bold" style={{ ...MONO, color: a.position === 'Completed ✓' ? GREEN : CYAN }}>{a.position ?? '—'}</p>
                <p className="text-[13px] mt-1" style={{ color: '#5f7a8c' }}>{openId === a.student_id ? '▴' : '▾'}</p>
              </div>
            </button>
            {openId === a.student_id && (
              <AthletePanel token={token} studentId={a.student_id} roleKey={home.me.roleKey} />
            )}
          </div>
        ))}
        {home.athletes.length === 0 && (
          <p className="text-[12px] rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.05)', color: '#8aa0b2' }}>
            Todavía no tenés atletas asignados. Aparecen acá cuando coordinación te suma a una temporada.
          </p>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: INK, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">{children}</div>
      <p className="text-center text-[9px] pb-6" style={{ ...MONO, color: '#3d5766' }}>THE SURF SEQUENCE® · EVOLVE THROUGH PLAY</p>
    </div>
  );
}

// ─── Panel del atleta: timeline + score + muro + herramientas ───
function AthletePanel({ token, studentId, roleKey }: { token: string; studentId: string; roleKey: string }) {
  const [data, setData] = useState<SpecialistAthlete | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<'plan' | 'muro' | 'tools'>('plan');

  const load = useCallback(() => {
    getSpecialistAthlete(token, studentId)
      .then((r) => { if (r.ok && r.data) setData(r.data); else setErr(r.error ?? 'No se pudo cargar.'); })
      .catch(() => setErr('No se pudo cargar.'));
  }, [token, studentId]);
  useEffect(() => { load(); }, [load]);

  if (err) return <p className="text-[11px] px-3 py-2" style={{ color: '#ffb4a6' }}>{err}</p>;
  if (!data) return <p className="text-[11px] px-3 py-2" style={{ color: '#7BA2B5' }}>Cargando…</p>;

  return (
    <div className="mt-1.5 rounded-2xl p-3 space-y-3" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
      {/* Tabs del panel */}
      <div className="flex gap-1.5">
        {([['plan', '📅 Plan'], ['muro', '💬 Muro'], ['tools', '🛠 Herramientas']] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className="flex-1 rounded-full py-1.5 text-[9.5px] uppercase tracking-wider font-bold"
            style={{ ...MONO, background: tab === id ? GOLD : 'rgba(255,255,255,.06)', color: tab === id ? INK : '#7BA2B5' }}>
            {label}
          </button>
        ))}
        <a
          href={`/equipo/${token}/print/${studentId}`}
          target="_blank" rel="noopener noreferrer"
          className="rounded-full py-1.5 px-3 text-[9.5px] uppercase tracking-wider font-bold"
          style={{ ...MONO, background: 'rgba(255,255,255,.06)', color: CYAN }}
          title="Imprimir el plan + ruta crítica"
        >
          🖨
        </a>
      </div>

      {tab === 'plan' && <PlanTab data={data} />}
      {tab === 'muro' && <WallTab token={token} studentId={studentId} data={data} onPosted={load} />}
      {tab === 'tools' && <ToolsTab token={token} studentId={studentId} data={data} roleKey={roleKey} onChanged={load} />}
    </div>
  );
}

function PlanTab({ data }: { data: SpecialistAthlete }) {
  const tl = data.timeline;
  return (
    <div className="space-y-3">
      {/* Score por pilar */}
      {data.pillars && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(0,210,255,.05)', border: '1px solid rgba(0,210,255,.2)' }}>
          <p className="text-[9px] uppercase tracking-wider mb-2" style={{ ...MONO, color: CYAN }}>Score por pilar · últ. eval {data.pillars.eval_date}</p>
          <div className="grid grid-cols-4 gap-2">
            {PILLAR_META.map((p) => (
              <div key={p.key} className="text-center">
                <p className="text-[13px] font-bold" style={{ ...MONO, color: p.color }}>{data.pillars![p.key] != null ? data.pillars![p.key]!.toFixed(1) : '—'}</p>
                <p className="text-[8px] uppercase tracking-wide mt-0.5" style={{ ...MONO, color: '#7BA2B5' }}>{p.label}</p>
              </div>
            ))}
          </div>
          {data.pillars.global != null && (
            <p className="text-[10px] text-right mt-1.5" style={{ ...MONO, color: CYAN }}>Global {data.pillars.global.toFixed(1)}/5</p>
          )}
        </div>
      )}

      {/* Timeline compacto de la temporada */}
      {tl ? (
        <div className="space-y-1">
          {tl.season && (
            <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>
              {tl.season.title} · {tl.program_title}
            </p>
          )}
          {tl.weeks.map((w) => (
            <div key={w.week} className="rounded-lg px-2.5 py-1.5 grid items-center gap-2" style={{ gridTemplateColumns: '34px 1fr 44px', background: w.current ? 'rgba(255,209,102,.10)' : 'rgba(255,255,255,.04)', border: w.current ? `1px solid ${GOLD}66` : '1px solid transparent' }}>
              <span className="text-[10px] font-bold" style={{ ...MONO, color: w.current ? GOLD : w.days_done >= w.days_total && w.days_total > 0 ? GREEN : '#7BA2B5' }}>
                {w.days_done >= w.days_total && w.days_total > 0 ? '✓' : ''}M{w.week}
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] truncate" style={{ color: '#dce8f0' }}>
                  <span style={{ ...MONO, color: '#5f7a8c' }}>{w.start.slice(5)}</span>
                  {' '}{[w.label, w.type, w.intensity].filter(Boolean).join(' · ') || `Micro ${w.week}`}
                </p>
                {w.events.length > 0 && (
                  <p className="text-[10px] truncate" style={{ color: '#9fd7e8' }}>{w.events.map((e) => `${e.icon} ${e.label}`).join(' · ')}</p>
                )}
              </div>
              <span className="text-[10px] font-bold text-right" style={{ ...MONO, color: '#7BA2B5' }}>{w.days_done}/{w.days_total}</span>
            </div>
          ))}
          {tl.ahead.length > 0 && (
            <p className="text-[10px] pt-1" style={{ color: '#8aa0b2' }}>
              Después: {tl.ahead.map((e) => `${e.icon} ${e.label} (${e.date.slice(5)})`).join(' · ')}
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px]" style={{ color: '#8aa0b2' }}>Sin programa activo — el plan aparece acá cuando se le asigne uno.</p>
      )}

      {/* Citas recientes */}
      {data.appointments.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-wider mb-1" style={{ ...MONO, color: '#7BA2B5' }}>Citas</p>
          <div className="space-y-1">
            {data.appointments.slice(0, 5).map((a) => (
              <p key={a.id} className="text-[10.5px]" style={{ color: '#b8cad8' }}>
                {KIND_META[a.kind]?.icon ?? '📅'} {a.title || KIND_META[a.kind]?.label} · {a.date}{a.time ? ` ${a.time}` : ''}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── F2: muro del equipo ───
function WallTab({ token, studentId, data, onPosted }: { token: string; studentId: string; data: SpecialistAthlete; onPosted: () => void }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const post = async () => {
    setErr(null); setBusy(true);
    const r = await specialistPostWall(token, studentId, body);
    setBusy(false);
    if (!r.ok) { setErr(r.error ?? 'No se pudo publicar.'); return; }
    setBody(''); onPosted();
  };

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Mensaje para el equipo y el atleta…"
          className="flex-1 rounded-xl px-3 py-2 text-[12px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
        <button type="button" disabled={busy || !body.trim()} onClick={post}
          className="rounded-full px-4 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40" style={{ ...MONO, background: CYAN, color: INK }}>
          Enviar
        </button>
      </div>
      {err && <p className="text-[10.5px]" style={{ color: '#ffb4a6' }}>{err}</p>}
      <div className="space-y-1.5">
        {data.wall.map((w) => (
          <div key={w.id} className="rounded-xl px-3 py-2" style={{ background: w.mine ? 'rgba(0,210,255,.08)' : 'rgba(255,255,255,.05)', borderLeft: `3px solid ${w.author.includes('(athlete)') ? GOLD : w.mine ? CYAN : 'rgba(255,255,255,.18)'}` }}>
            <p className="text-[9.5px] uppercase tracking-wide" style={{ ...MONO, color: w.author.includes('(athlete)') ? GOLD : '#7BA2B5' }}>
              {w.author.replace(' (athlete)', ' · Atleta')} · {fmtDT(w.created_at)}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: '#eaf4fa' }}>{w.body}</p>
          </div>
        ))}
        {data.wall.length === 0 && <p className="text-[11px]" style={{ color: '#8aa0b2' }}>Sin mensajes todavía — abrí la conversación del equipo.</p>}
      </div>
    </div>
  );
}

// ─── F3: herramientas por rol ───
function ToolsTab({ token, studentId, data, roleKey, onChanged }: {
  token: string; studentId: string; data: SpecialistAthlete; roleKey: string; onChanged: () => void;
}) {
  const canDiet = roleKey === 'nutricionista' || roleKey === 'head';
  return (
    <div className="space-y-3">
      <TaskCreator token={token} studentId={studentId} roleKey={roleKey} onChanged={onChanged} />
      {data.tasks.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-wider mb-1" style={{ ...MONO, color: '#7BA2B5' }}>Sesiones dejadas</p>
          <div className="space-y-1">
            {data.tasks.slice(0, 6).map((t) => (
              <p key={t.id} className="text-[10.5px]" style={{ color: t.done ? '#5f7a8c' : '#dce8f0', textDecoration: t.done ? 'line-through' : 'none' }}>
                {KIND_META[t.kind]?.icon} {t.title}{t.due_date ? ` · ${t.due_date.slice(5)}` : ''}{t.done ? ' ✓' : ''}
              </p>
            ))}
          </div>
        </div>
      )}
      {canDiet && <DietEditor token={token} studentId={studentId} data={data} onChanged={onChanged} />}
      {!canDiet && data.diet.micro.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,209,102,.06)', border: '1px solid rgba(255,209,102,.25)' }}>
          <p className="text-[9px] uppercase tracking-wider mb-1" style={{ ...MONO, color: GOLD }}>🥗 Dieta (de la nutricionista)</p>
          {data.diet.micro.slice(-2).map((d) => (
            <p key={d.week_number} className="text-[10.5px] mt-1" style={{ color: '#dce8f0' }}><b style={{ color: GOLD }}>M{d.week_number}</b> · {d.body.slice(0, 160)}</p>
          ))}
        </div>
      )}
      <CitaCreator token={token} data={data} onChanged={onChanged} />
    </div>
  );
}

function TaskCreator({ token, studentId, roleKey, onChanged }: { token: string; studentId: string; roleKey: string; onChanged: () => void }) {
  const defaultKind = roleKey === 'psicologo' ? 'mental' : roleKey === 'fisico' ? 'fisico' : roleKey === 'nutricionista' ? 'nutricion' : 'tecnico';
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>(defaultKind);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [video, setVideo] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setMsg(null); setBusy(true);
    const r = await specialistCreateTask(token, studentId, { kind: kind as any, title, body: body || null, video_url: video || null, due_date: due || null });
    setBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'Error'); return; }
    setTitle(''); setBody(''); setVideo(''); setDue(''); setOpen(false);
    setMsg('✓ Sesión enviada al atleta'); setTimeout(() => setMsg(null), 2500);
    onChanged();
  };

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(57,217,138,.05)', border: '1px solid rgba(57,217,138,.25)' }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GREEN }}>📌 Dejar sesión online / tarea</p>
        <span className="text-[11px]" style={{ color: GREEN }}>{open ? '▴' : '+'}</span>
      </button>
      {msg && <p className="text-[10.5px] mt-1" style={{ color: msg.startsWith('✓') ? GREEN : '#ffb4a6' }}>{msg}</p>}
      {open && (
        <div className="mt-2.5 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(KIND_META).filter(([k]) => k !== 'evaluacion' && k !== 'otro').map(([k, m]) => (
              <button key={k} type="button" onClick={() => setKind(k)}
                className="rounded-full px-2.5 py-1 text-[9.5px] font-bold" style={{ ...MONO, background: kind === k ? GREEN : 'rgba(255,255,255,.06)', color: kind === k ? INK : '#7BA2B5' }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ej. Rutina de respiración pre-heat)"
            className="w-full rounded-lg px-3 py-2 text-[12px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Instrucciones…"
            className="w-full rounded-lg px-3 py-2 text-[12px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
          <div className="flex gap-2">
            <input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="Link de video (opcional)"
              className="flex-1 rounded-lg px-3 py-2 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
              className="rounded-lg px-2 py-2 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
          </div>
          <button type="button" disabled={busy || !title.trim()} onClick={save}
            className="w-full rounded-full py-2 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40" style={{ ...MONO, background: GREEN, color: INK }}>
            Enviar al atleta
          </button>
        </div>
      )}
    </div>
  );
}

function DietEditor({ token, studentId, data, onChanged }: { token: string; studentId: string; data: SpecialistAthlete; onChanged: () => void }) {
  const weeks = data.timeline?.weeks ?? [];
  const currentWeek = weeks.find((w) => w.current)?.week ?? weeks[0]?.week ?? 1;
  const [scope, setScope] = useState<'micro' | 'day'>('micro');
  const [week, setWeek] = useState<number>(currentWeek);
  const [date, setDate] = useState(new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10));
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const wMeta = weeks.find((w) => w.week === week);
  const save = async () => {
    setMsg(null); setBusy(true);
    const r = await specialistSaveDiet(token, studentId, { scope, week_number: scope === 'micro' ? week : null, note_date: scope === 'day' ? date : null, body });
    setBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'Error'); return; }
    setBody(''); setMsg('✓ Dieta guardada — el atleta la ve en su día'); setTimeout(() => setMsg(null), 3000);
    onChanged();
  };

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,209,102,.06)', border: '1px solid rgba(255,209,102,.3)' }}>
      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>🥗 Dieta del atleta</p>
      <div className="flex gap-1.5 mt-2">
        {([['micro', 'Por microciclo'], ['day', 'Nota de un día']] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setScope(id)}
            className="rounded-full px-2.5 py-1 text-[9.5px] font-bold" style={{ ...MONO, background: scope === id ? GOLD : 'rgba(255,255,255,.06)', color: scope === id ? INK : '#7BA2B5' }}>
            {label}
          </button>
        ))}
        {scope === 'micro' ? (
          <select value={week} onChange={(e) => setWeek(Number(e.target.value))}
            className="ml-auto rounded-lg px-2 py-1 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }}>
            {weeks.map((w) => <option key={w.week} value={w.week}>M{w.week}{w.current ? ' · actual' : ''}</option>)}
            {weeks.length === 0 && <option value={1}>M1</option>}
          </select>
        ) : (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="ml-auto rounded-lg px-2 py-1 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
        )}
      </div>
      {scope === 'micro' && wMeta && (wMeta.type || wMeta.intensity) && (
        <p className="text-[10px] mt-1.5" style={{ color: '#b8cad8' }}>
          Carga del M{week}: <b style={{ color: GOLD }}>{[wMeta.type, wMeta.intensity].filter(Boolean).join(' · ')}</b>{wMeta.objective ? ` — ${wMeta.objective}` : ''}
        </p>
      )}
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3}
        placeholder={scope === 'micro' ? 'Dieta para todo el microciclo (desayuno, almuerzo, cena, hidratación…)' : 'Nota puntual para ese día (pre-competencia, ajuste, etc.)'}
        className="w-full mt-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
      {msg && <p className="text-[10.5px] mt-1" style={{ color: msg.startsWith('✓') ? GREEN : '#ffb4a6' }}>{msg}</p>}
      <button type="button" disabled={busy || !body.trim()} onClick={save}
        className="w-full mt-2 rounded-full py-2 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40" style={{ ...MONO, background: GOLD, color: INK }}>
        Guardar dieta
      </button>
      {data.diet.micro.length > 0 && (
        <div className="mt-2 space-y-1">
          {data.diet.micro.map((d) => (
            <p key={d.week_number} className="text-[10px]" style={{ color: '#b8cad8' }}><b style={{ color: GOLD }}>M{d.week_number}</b> · {d.body.slice(0, 120)}{d.body.length > 120 ? '…' : ''}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function CitaCreator({ token, data, onChanged }: { token: string; data: SpecialistAthlete; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>('evaluacion');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setMsg(null); setBusy(true);
    const r = await specialistCreateAppointment(token, data.student.id, { kind: kind as any, mode: 'presencial', date, time: time || null, title: null });
    setBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'Error'); return; }
    setDate(''); setTime(''); setOpen(false);
    setMsg('✓ Cita agendada — aparece en el timeline del atleta'); setTimeout(() => setMsg(null), 3000);
    onChanged();
  };

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(0,210,255,.05)', border: '1px solid rgba(0,210,255,.25)' }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>📅 Agendar cita / evaluación</p>
        <span className="text-[11px]" style={{ color: CYAN }}>{open ? '▴' : '+'}</span>
      </button>
      {msg && <p className="text-[10.5px] mt-1" style={{ color: msg.startsWith('✓') ? GREEN : '#ffb4a6' }}>{msg}</p>}
      {open && (
        <div className="mt-2.5 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(KIND_META).map(([k, m]) => (
              <button key={k} type="button" onClick={() => setKind(k)}
                className="rounded-full px-2.5 py-1 text-[9.5px] font-bold" style={{ ...MONO, background: kind === k ? CYAN : 'rgba(255,255,255,.06)', color: kind === k ? INK : '#7BA2B5' }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-lg px-2 py-2 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="rounded-lg px-2 py-2 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
          </div>
          <button type="button" disabled={busy || !date} onClick={save}
            className="w-full rounded-full py-2 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40" style={{ ...MONO, background: CYAN, color: INK }}>
            Agendar
          </button>
        </div>
      )}
    </div>
  );
}
