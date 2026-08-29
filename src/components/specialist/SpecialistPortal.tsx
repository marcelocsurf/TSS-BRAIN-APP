'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getSpecialistHome, getSpecialistAthlete, specialistPostWall, specialistSaveDiet, specialistCreateTask,
  specialistCreateAppointment,
  type SpecialistHome, type SpecialistAthlete,
} from '@/lib/actions/specialist';
import { SpecialistGuide } from '@/components/specialist/SpecialistGuide';


// ═══ PORTAL DEL EQUIPO HP — Brand v10 (ink #061C2B · cyan #00D2FF · gold #FFD166) ═══
// Staff-facing → español. Cada especialista ve SUS atletas y sus herramientas.

// GREEN = Foam #06D6A0, el verde de éxito del canon v10 (#39D98A era ajeno a la paleta).
const INK = '#061C2B', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
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
  // 📖 Manual de uso: se abre solo la primera vez y queda en el botón del header.
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    if (!home || home === 'denied') return;
    try { if (!localStorage.getItem('tss_equipo_guide_v1')) setGuideOpen(true); } catch { /* sin localStorage, sin auto-open */ }
  }, [home]);
  const closeGuide = () => { setGuideOpen(false); try { localStorage.setItem('tss_equipo_guide_v1', '1'); } catch {} };

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
        <button type="button" onClick={() => setGuideOpen(true)} aria-label="Guía de uso"
          className="shrink-0 rounded-full w-9 h-9 flex items-center justify-center text-[15px]"
          style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)' }}>
          📖
        </button>
      </div>
      {guideOpen && <SpecialistGuide roleKey={home.me.roleKey} onClose={closeGuide} />}

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

  if (err) return <p className="text-[11px] px-3 py-2" style={{ color: '#FF6B6B' }}>{err}</p>;
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

      {tab === 'plan' && <PlanTab data={data} token={token} onChanged={load} />}
      {tab === 'muro' && <WallTab token={token} studentId={studentId} data={data} onPosted={load} />}
      {tab === 'tools' && <ToolsTab token={token} studentId={studentId} data={data} roleKey={roleKey} onChanged={load} />}
    </div>
  );
}

// Colores de fase — mismos que la tarjeta "My year" del atleta.
const PHASE_INK: Record<string, string> = {
  general: '#00A8CC', especifica: '#00D2FF', precompetitiva: '#FFA94D',
  competitiva: '#FFD166', transicion: '#64748B', recuperacion: '#39D98A',
};

// ─── EL AÑO COMPLETO del atleta, en una agenda (pedido Marcelo 2026-08-25:
// "que el especialista pueda ver todo el año como un calendario donde salen
// todas las tareas, entrenos, carga, responsabilidades y eventos, y así
// pueda adaptarse y planificar con visión global, no perdido"). Une lo que
// ya existe disperso: fases, microciclos con su carga, competencias,
// evaluaciones, citas de TODO el equipo y tareas de cualquier especialista.
function YearAgenda({ data }: { data: SpecialistAthlete }) {
  const tl = data.timeline;
  if (!tl) return null;
  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);

  type Item = { date: string; icon: string; label: string; sub?: string | null; gold?: boolean; mine?: boolean };
  const items: Item[] = [];

  // Inicio de cada fase — el marco del año.
  for (const f of tl.phases) {
    items.push({ date: f.start, icon: '🚩', label: `Fase: ${f.name}`, sub: f.objective, gold: true });
  }
  // Eventos por semana (competencias 🏆, evaluaciones, viajes, picos ▲).
  for (const w of tl.weeks) {
    for (const e of w.events) items.push({ date: e.date, icon: e.icon, label: e.label, sub: `M${w.week}` });
  }
  for (const e of tl.ahead) items.push({ date: e.date, icon: e.icon, label: e.label });
  // Citas de TODO el equipo (no solo las mías).
  for (const a of data.appointments) {
    const meta = KIND_META[a.kind] ?? KIND_META.otro;
    items.push({ date: a.date, icon: meta.icon, label: a.title || meta.label, sub: a.time ? a.time.slice(0, 5) : null });
  }
  // Tareas/sesiones online — con quién las dejó y si ya están hechas.
  for (const t of data.tasks) {
    if (!t.due_date) continue;
    const meta = KIND_META[t.kind] ?? KIND_META.otro;
    items.push({ date: t.due_date, icon: t.done ? '✓' : meta.icon, label: t.title, sub: t.mine ? 'tuya' : null, mine: t.mine });
  }
  items.sort((a, b) => a.date.localeCompare(b.date));

  const startMs = Date.parse(`${tl.season?.start ?? today}T12:00:00Z`);
  const endMs = Date.parse(`${tl.season?.end ?? today}T12:00:00Z`);
  const span = Math.max(1, endMs - startMs);
  const pct = (d: string) => Math.max(0, Math.min(100, ((Date.parse(`${d}T12:00:00Z`) - startMs) / span) * 100));

  const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
      <p className="text-[9px] uppercase tracking-wider mb-2" style={{ ...MONO, color: GOLD }}>
        🗓 Su año completo {tl.season ? `· ${tl.season.start.slice(5)} → ${tl.season.end.slice(5)}` : ''}
      </p>

      {/* Franja de fases con la marca de HOY */}
      {tl.phases.length > 0 && (
        <div className="relative rounded-md overflow-hidden mb-1" style={{ height: 16, background: 'rgba(255,255,255,.06)' }}>
          {tl.phases.map((f) => {
            const l = pct(f.start), r = pct(f.end);
            const c = PHASE_INK[f.color_key] ?? '#00A8CC';
            return (
              <div key={f.id} title={`${f.name} · ${f.start} → ${f.end}`} className="absolute top-0 bottom-0"
                style={{ left: `${l}%`, width: `${Math.max(r - l, 1.5)}%`, background: `${c}${f.state === 'done' ? '33' : '66'}`, borderLeft: `2px solid ${c}` }} />
            );
          })}
          <div className="absolute top-0 bottom-0" style={{ left: `${pct(today)}%`, width: 2, background: '#fff' }} />
        </div>
      )}
      <p className="text-[8px] mb-2.5" style={{ ...MONO, color: '#5f7a8c' }}>
        {tl.phases.map((f) => f.name).join(' · ') || 'Sin fases cargadas'}
      </p>

      {/* La agenda: todo lo del atleta, en orden */}
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {items.map((it, i) => {
          const past = it.date < today;
          return (
            <div key={i} className="flex items-baseline gap-2" style={{ opacity: past ? 0.45 : 1 }}>
              <span className="text-[9.5px] shrink-0 w-14" style={{ ...MONO, color: '#7BA2B5' }}>{fmt(it.date)}</span>
              <span className="text-[11.5px] min-w-0 flex-1 truncate" style={{ color: it.gold ? GOLD : it.mine ? GREEN : '#dce8f0' }}>
                {it.icon} {it.label}
                {it.sub ? <span style={{ color: '#7BA2B5' }}> · {it.sub}</span> : null}
              </span>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-[11px]" style={{ color: '#7BA2B5' }}>Todavía no hay nada agendado en su año.</p>
        )}
      </div>
      <p className="text-[8.5px] mt-2 pt-2" style={{ ...MONO, color: '#4a6272', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        🚩 fase · 🏆 competencia · ▲ pico · 📋 evaluación · lo tuyo en verde
      </p>
    </div>
  );
}

function PlanTab({ data, token, onChanged }: { data: SpecialistAthlete; token: string; onChanged: () => void }) {
  const tl = data.timeline;
  return (
    <div className="space-y-3">
      {/* La visión global primero: el año entero antes del detalle semanal. */}
      <YearAgenda data={data} />
      {/* El detalle: el programa día por día, con lo agendado de cada día y
          "+ agendar acá" (pedido de Marcelo 2026-08-25). */}
      <DayByDay data={data} token={token} onChanged={onChanged} />
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
      {err && <p className="text-[10.5px]" style={{ color: '#FF6B6B' }}>{err}</p>}
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
      {msg && <p className="text-[10.5px] mt-1" style={{ color: msg.startsWith('✓') ? GREEN : '#FF6B6B' }}>{msg}</p>}
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

  // Los días del microciclo elegido, con lo que ya está escrito en cada uno.
  // Antes había un <input type="date"> a ciegas: no se veía qué días ya
  // tenían ajuste ni cuáles faltaban (pedido de Marcelo 2026-08-25: "que la
  // nutricionista pueda ver y ajustar día a día").
  const dayNote = (d: string) => data.diet.day.find((x) => x.note_date === d)?.body ?? null;
  const microDays = wMeta
    ? Array.from({ length: Math.round((Date.parse(`${wMeta.end}T12:00:00Z`) - Date.parse(`${wMeta.start}T12:00:00Z`)) / 86400000) + 1 },
        (_, i) => new Date(Date.parse(`${wMeta.start}T12:00:00Z`) + i * 86400000).toISOString().slice(0, 10))
    : [];
  const todaySV = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);

  // Al elegir un día con nota, se precarga para AJUSTARLA (antes solo se
  // podía apilar una nueva encima sin ver la anterior).
  const pickDay = (d: string) => { setDate(d); setBody(dayNote(d) ?? ''); };

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
          <input type="date" value={date} onChange={(e) => pickDay(e.target.value)}
            className="ml-auto rounded-lg px-2 py-1 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
        )}
      </div>

      {/* LA SEMANA DÍA POR DÍA — verde = ya tiene ajuste escrito. */}
      {scope === 'day' && microDays.length > 0 && (
        <>
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
            {microDays.map((d) => {
              const has = !!dayNote(d);
              const sel = d === date;
              return (
                <button key={d} type="button" onClick={() => pickDay(d)}
                  className="shrink-0 rounded-lg px-2 py-1.5 text-center"
                  style={{
                    minWidth: 46,
                    background: sel ? GOLD : has ? 'rgba(57,217,138,.14)' : 'rgba(255,255,255,.05)',
                    border: `1px solid ${sel ? GOLD : has ? 'rgba(57,217,138,.45)' : 'rgba(255,255,255,.12)'}`,
                  }}>
                  <p className="text-[8.5px] uppercase" style={{ ...MONO, color: sel ? INK : '#7BA2B5' }}>
                    {new Date(`${d}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'short', timeZone: 'UTC' })}
                  </p>
                  <p className="text-[12px] font-bold" style={{ color: sel ? INK : has ? GREEN : '#eaf4fa' }}>
                    {Number(d.slice(8, 10))}
                  </p>
                  <p className="text-[8px]" style={{ color: sel ? INK : has ? GREEN : '#4a6272' }}>
                    {has ? '✓' : d === todaySV ? 'hoy' : '·'}
                  </p>
                </button>
              );
            })}
          </div>
          {/* La base del micro, para ajustar SOBRE ella y no a ciegas. */}
          {(() => {
            const base = data.diet.micro.find((m) => m.week_number === week)?.body;
            return base ? (
              <p className="text-[10px] mt-1 rounded-lg px-2 py-1.5" style={{ background: 'rgba(255,255,255,.04)', color: '#b8cad8' }}>
                <b style={{ color: GOLD }}>Base del M{week}:</b> {base.slice(0, 160)}{base.length > 160 ? '…' : ''}
              </p>
            ) : (
              <p className="text-[10px] mt-1" style={{ color: '#7BA2B5' }}>
                Este microciclo todavía no tiene base. El ajuste del día es lo único que va a ver.
              </p>
            );
          })()}
        </>
      )}
      {scope === 'micro' && wMeta && (wMeta.type || wMeta.intensity) && (
        <p className="text-[10px] mt-1.5" style={{ color: '#b8cad8' }}>
          Carga del M{week}: <b style={{ color: GOLD }}>{[wMeta.type, wMeta.intensity].filter(Boolean).join(' · ')}</b>{wMeta.objective ? ` — ${wMeta.objective}` : ''}
        </p>
      )}
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3}
        placeholder={scope === 'micro' ? 'Base del microciclo: qué come todos los días (desayuno, almuerzo, cena, hidratación…)' : 'Ajuste solo para ese día — el atleta ve la base del micro Y esto (víspera de competencia, día libre, viaje…)'}
        className="w-full mt-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
      {msg && <p className="text-[10.5px] mt-1" style={{ color: msg.startsWith('✓') ? GREEN : '#FF6B6B' }}>{msg}</p>}
      <button type="button" disabled={busy || !body.trim()} onClick={save}
        className="w-full mt-2 rounded-full py-2 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40" style={{ ...MONO, background: GOLD, color: INK }}>
        {scope === 'micro' ? 'Guardar base del microciclo' : dayNote(date) ? 'Actualizar el ajuste de ese día' : 'Guardar ajuste de ese día'}
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
  // Online/presencial + dónde (link de Zoom o lugar) + qué van a trabajar:
  // la cita le llegaba al atleta sin decirle a dónde ir (pedido Marcelo).
  const [mode, setMode] = useState<'online' | 'presencial'>('presencial');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setMsg(null); setBusy(true);
    const r = await specialistCreateAppointment(token, data.student.id, {
      kind: kind as any, mode, date, time: time || null, title: null,
      location: location || null, notes: notes || null,
    });
    setBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'Error'); return; }
    setDate(''); setTime(''); setLocation(''); setNotes(''); setOpen(false);
    setMsg('✓ Cita agendada — aparece en el timeline del atleta'); setTimeout(() => setMsg(null), 3000);
    onChanged();
  };

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(0,210,255,.05)', border: '1px solid rgba(0,210,255,.25)' }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>📅 Agendar cita / evaluación</p>
        <span className="text-[11px]" style={{ color: CYAN }}>{open ? '▴' : '+'}</span>
      </button>
      {msg && <p className="text-[10.5px] mt-1" style={{ color: msg.startsWith('✓') ? GREEN : '#FF6B6B' }}>{msg}</p>}
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
          <div className="flex gap-1.5">
            {(['presencial', 'online'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className="flex-1 rounded-full py-1.5 text-[9.5px] font-bold uppercase"
                style={{ ...MONO, background: mode === m ? CYAN : 'rgba(255,255,255,.06)', color: mode === m ? INK : '#7BA2B5' }}>
                {m === 'online' ? '💻 Online' : '📍 Presencial'}
              </button>
            ))}
          </div>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder={mode === 'online' ? 'Link de Zoom / Meet…' : '📍 Dónde se encuentran…'}
            className="w-full rounded-lg px-2 py-2 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Qué van a trabajar (opcional)…"
            className="w-full rounded-lg px-2 py-2 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
          <button type="button" disabled={busy || !date} onClick={save}
            className="w-full rounded-full py-2 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40" style={{ ...MONO, background: CYAN, color: INK }}>
            Agendar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DÍA POR DÍA del programa (pedido Marcelo 2026-08-25: "el especialista
// no ve el programa día por día ni puede agregar una actividad parada en un
// día concreto viendo lo que ya existe"). Semana elegible, y en cada día:
// los ítems del programa + las citas y tareas de ESA fecha + "+ Agendar acá".
function DayByDay({ data, token, onChanged }: { data: SpecialistAthlete; token: string; onChanged: () => void }) {
  const prog = data.program;
  const [week, setWeek] = useState<number>(prog?.currentWeek ?? 1);
  const [schedFor, setSchedFor] = useState<string | null>(null); // date del día abierto
  if (!prog || prog.days.length === 0) return null;

  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
  const weeks = Array.from({ length: prog.weeks }, (_, i) => i + 1);
  const days = prog.days.filter((d) => d.week === week);
  const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
      <p className="text-[9px] uppercase tracking-wider mb-2" style={{ ...MONO, color: GOLD }}>
        📋 Día por día · {prog.title}
      </p>

      {/* Selector de semana — la del día actual del atleta marcada. */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {weeks.map((w) => (
          <button key={w} type="button" onClick={() => { setWeek(w); setSchedFor(null); }}
            className="shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold"
            style={{ ...MONO, background: week === w ? GOLD : 'rgba(255,255,255,.06)', color: week === w ? INK : w === prog.currentWeek ? GOLD : '#7BA2B5', border: w === prog.currentWeek ? `1px solid ${GOLD}` : '1px solid transparent' }}>
            M{w}
          </button>
        ))}
      </div>

      <div className="mt-2 space-y-2">
        {days.map((d) => {
          const appts = data.appointments.filter((a) => a.date === d.date);
          const tasks = data.tasks.filter((t) => t.due_date === d.date);
          const isPast = d.date < today;
          const isToday = d.date === today;
          return (
            <div key={d.id} className="rounded-lg p-2.5"
              style={{ background: isToday ? 'rgba(255,209,102,.08)' : 'rgba(255,255,255,.04)', border: isToday ? '1px solid rgba(255,209,102,.4)' : '1px solid rgba(255,255,255,.08)' }}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-bold" style={{ color: d.done ? GREEN : '#eaf4fa' }}>
                  {d.done ? '✓ ' : ''}{d.name || `Día ${d.day_number}`}
                  <span className="font-normal" style={{ color: '#7BA2B5' }}> · {fmt(d.date)}{isToday ? ' · HOY' : ''}</span>
                </p>
                {!isPast && (
                  <button type="button" onClick={() => setSchedFor(schedFor === d.date ? null : d.date)}
                    className="shrink-0 text-[9.5px] font-bold" style={{ ...MONO, color: CYAN }}>
                    {schedFor === d.date ? '▴ cerrar' : '+ Agendar acá'}
                  </button>
                )}
              </div>

              {/* Lo que el programa ya le pide ese día. */}
              {d.items.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {d.items.map((it, i) => (
                    <p key={i} className="text-[10.5px] leading-snug" style={{ color: '#b8cad8' }}>
                      • {it.title}
                      {(it.duration_minutes || it.pillar) && (
                        <span style={{ color: '#7BA2B5' }}>
                          {it.duration_minutes ? ` · ⏱ ${it.duration_minutes}min` : ''}{it.pillar ? ` · ${it.pillar}` : ''}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              )}

              {/* Lo ya agendado ese día por el equipo — se ve ANTES de sumar. */}
              {(appts.length > 0 || tasks.length > 0) && (
                <div className="mt-1.5 pt-1.5 space-y-0.5" style={{ borderTop: '1px dashed rgba(255,255,255,.12)' }}>
                  {appts.map((a) => {
                    const m = KIND_META[a.kind] ?? { icon: '📌', label: a.kind };
                    return (
                      <p key={a.id} className="text-[10.5px]" style={{ color: CYAN }}>
                        {m.icon} {a.title || m.label}{a.time ? ` · ${a.time.slice(0, 5)}` : ''}
                      </p>
                    );
                  })}
                  {tasks.map((t) => (
                    <p key={t.id} className="text-[10.5px]" style={{ color: t.done ? GREEN : '#dce8f0' }}>
                      {t.done ? '✓' : '📌'} {t.title}{t.mine ? ' · tuya' : ''}
                    </p>
                  ))}
                </div>
              )}

              {schedFor === d.date && (
                <div className="mt-2">
                  <InlineCita token={token} studentId={data.student.id} date={d.date}
                    onDone={() => { setSchedFor(null); onChanged(); }} />
                </div>
              )}
            </div>
          );
        })}
        {days.length === 0 && (
          <p className="text-[10.5px]" style={{ color: '#7BA2B5' }}>Esta semana no tiene días cargados.</p>
        )}
      </div>
    </div>
  );
}

// Mini-form de cita anclado a UNA fecha: el especialista agenda parado en el
// día, viendo lo que ese día ya tiene. La fecha no se edita — es la del día.
function InlineCita({ token, studentId, date, onDone }: { token: string; studentId: string; date: string; onDone: () => void }) {
  const [kind, setKind] = useState('evaluacion');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState<'online' | 'presencial'>('presencial');
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setMsg(null); setBusy(true);
    const r = await specialistCreateAppointment(token, studentId, {
      kind: kind as any, mode, date, time: time || null, title: null,
      location: location || null, notes: null,
    });
    setBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'Error'); return; }
    onDone();
  };

  return (
    <div className="rounded-lg p-2" style={{ background: 'rgba(0,210,255,.06)', border: '1px solid rgba(0,210,255,.25)' }}>
      <div className="flex gap-1 flex-wrap">
        {Object.entries(KIND_META).map(([k, m]) => (
          <button key={k} type="button" onClick={() => setKind(k)}
            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ ...MONO, background: kind === k ? CYAN : 'rgba(255,255,255,.06)', color: kind === k ? INK : '#7BA2B5' }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
          className="rounded-lg px-2 py-1.5 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
        {(['presencial', 'online'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className="rounded-full px-2.5 py-1 text-[9px] font-bold"
            style={{ ...MONO, background: mode === m ? CYAN : 'rgba(255,255,255,.06)', color: mode === m ? INK : '#7BA2B5' }}>
            {m === 'presencial' ? '📍' : '💻'} {m}
          </button>
        ))}
      </div>
      <input value={location} onChange={(e) => setLocation(e.target.value)}
        placeholder={mode === 'online' ? 'Link de Zoom/Meet' : 'Dónde se encuentran'}
        className="w-full mt-1.5 rounded-lg px-2 py-1.5 text-[11px]" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: '#eaf4fa' }} />
      {msg && <p className="text-[10px] mt-1" style={{ color: '#FF6B6B' }}>{msg}</p>}
      <button type="button" disabled={busy} onClick={save}
        className="w-full mt-1.5 rounded-full py-1.5 text-[9.5px] font-bold uppercase tracking-wider disabled:opacity-40"
        style={{ ...MONO, background: CYAN, color: INK }}>
        {busy ? 'Agendando…' : `Agendar el ${date.slice(8, 10)}/${date.slice(5, 7)}`}
      </button>
    </div>
  );
}
