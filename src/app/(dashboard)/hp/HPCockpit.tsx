'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  hpPanel, hpPlanToday, hpLibrary, hpTeam,
  hpListMessages, hpSendMessage,
  hpListSessions, hpCreateSession, hpSetAttendance, hpDeleteSession, hpSyncSessionRoster,
  hpListEvaluations, hpCreateEvaluation,
  hpListDeepEvaluations, hpCreateDeepEvaluation, type HPDeepEvalRow,
  hpAthleteFull, type HPAthleteFull,
  type HPPanelData, type HPPlanRow, type HPLibrary, type HPTeamRow,
  type HPMessageRow, type HPSessionRow, type HPEvalRow,
} from '@/lib/actions/hp-cockpit';
import { adminSearchStudents, adminListAppointments, adminCreateAppointment, adminListHPCoaches, adminSetAppointmentStatus, type AdminAppointmentRow } from '@/lib/actions/program-admin';
import { elSalvadorToday } from '@/lib/utils/tz';
import { LayoutDashboard, ClipboardList, CalendarClock, Star, Mail, Users, Waves, BookOpen } from 'lucide-react';

// ─── El cockpit del head coach — réplica de la app HP dentro de BRAIN ───
//
// TEMA OSCURO EN TODA LA PÁGINA (la app HP es dark navy): acá NO aplica la
// paleta clara del dashboard — todo texto claro sobre #0B1B28, sin mezclar.
// Staff-facing: español. Mobile-first: navegación de abajo como la app HP.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const BG = '#0B1B28';
const CARD = 'rgba(255,255,255,.045)';
const BORDER = 'rgba(255,255,255,.09)';
const CYAN = '#00D2FF';
const GOLD = '#FFD166';
const TXT = '#F0F7FA';
const DIM = '#9DB4C3';
const FAINT = '#6C8494';
const GREEN = '#06D6A0';
const RED = '#FF6B6B';

const card: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14 };
const inp: React.CSSProperties = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: TXT, borderRadius: 10, padding: '8px 10px', fontSize: 13, width: '100%' };

type Tab = 'panel' | 'plan' | 'sesion' | 'citas' | 'eval' | 'msg' | 'equipo';

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number | string; color?: string }> }[] = [
  { key: 'panel', label: 'Panel', icon: LayoutDashboard },
  { key: 'plan', label: 'Plan', icon: ClipboardList },
  { key: 'sesion', label: 'Sesión', icon: Waves },
  { key: 'citas', label: 'Citas', icon: CalendarClock },
  { key: 'eval', label: 'Eval', icon: Star },
  { key: 'msg', label: 'Msg', icon: Mail },
  { key: 'equipo', label: 'Equipo', icon: Users },
];

export function HPCockpit() {
  const [tab, setTab] = useState<Tab>('panel');
  return (
    <div className="min-h-screen -m-4 md:-m-6" style={{ background: BG }}>
      <div className="max-w-2xl mx-auto px-4 pt-4" style={{ paddingBottom: 96 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em]" style={{ ...MONO, color: CYAN }}>The Surf Sequence · Alto Rendimiento</p>
            <h1 className="text-[22px] font-extrabold uppercase" style={{ color: TXT, fontStretch: '125%' }}>
              {TABS.find((t) => t.key === tab)?.label === 'Msg' ? 'Mensajes' : TABS.find((t) => t.key === tab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ border: `1px solid ${GOLD}`, color: GOLD, ...MONO }}>
              HEAD COACH
            </span>
            {/* La nav del cockpit tapa la nav móvil del dashboard (a propósito):
                esta es la salida de vuelta a BRAIN. */}
            <Link href="/dashboard" className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ border: `1px solid ${BORDER}`, color: DIM, ...MONO }}>
              ← BRAIN
            </Link>
          </div>
        </div>

        {tab === 'panel' && <PanelTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'sesion' && <SesionTab />}
        {tab === 'citas' && <CitasTab />}
        {tab === 'eval' && <EvalTab />}
        {tab === 'msg' && <MsgTab />}
        {tab === 'equipo' && <EquipoTab />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(6,20,32,.96)', borderTop: `1px solid ${BORDER}`, backdropFilter: 'blur(8px)' }}>
        <div className="max-w-2xl mx-auto grid grid-cols-7">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.key;
            return (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} className="flex flex-col items-center gap-0.5 py-2.5">
                <Icon size={18} color={on ? CYAN : FAINT} />
                <span className="text-[9px]" style={{ ...MONO, color: on ? CYAN : FAINT }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── PANEL ───

function PanelTab() {
  const [data, setData] = useState<HPPanelData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    hpPanel().then((r) => { if (r.ok && r.data) setData(r.data); else setErr(r.error || null); }).catch(() => {});
  }, []);
  if (err) return <p className="text-[12px]" style={{ color: RED }}>{err}</p>;
  if (!data) return <p className="text-[12px]" style={{ color: FAINT }}>Cargando…</p>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { n: data.athletes_total, l: 'Atletas' },
          { n: data.marked_today, l: 'Marcaron hoy' },
          { n: data.checkins_today, l: 'Check-ins hoy' },
        ].map((x) => (
          <div key={x.l} style={card} className="text-center">
            <p className="text-[24px] font-extrabold" style={{ color: TXT }}>{x.n}</p>
            <p className="text-[9px] uppercase tracking-wider" style={{ ...MONO, color: FAINT }}>{x.l}</p>
          </div>
        ))}
      </div>

      {data.alerts.length > 0 && (
        <div style={{ ...card, borderLeft: `3px solid ${GOLD}` }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>⚠ Sin actividad</p>
          <div className="mt-1.5 space-y-0.5">
            {data.alerts.map((a) => (
              <p key={a.student_id} className="text-[12px]" style={{ color: DIM }}>
                <b style={{ color: TXT }}>{a.name}</b> · {a.days_inactive >= 99 ? 'sin actividad registrada' : `${a.days_inactive} días`}
              </p>
            ))}
          </div>
        </div>
      )}

      <div style={card}>
        <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: CYAN }}>Ranking de la semana</p>
        <div className="mt-1.5 space-y-1">
          {data.ranking_top.map((r) => (
            <div key={r.student_id} className="flex items-center justify-between">
              <p className="text-[12.5px]" style={{ color: r.position <= 3 ? TXT : DIM, fontWeight: r.position <= 3 ? 700 : 400 }}>
                {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `${r.position}.`} {r.name}
              </p>
              <p className="text-[11px]" style={{ ...MONO, color: FAINT }}>{r.points}</p>
            </div>
          ))}
        </div>
      </div>

      {data.next_competitions.length > 0 && (
        <div style={card}>
          <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: GOLD }}>🏆 Próximas competencias</p>
          <div className="mt-1.5 space-y-0.5">
            {data.next_competitions.map((c, i) => (
              <p key={i} className="text-[12px]" style={{ color: DIM }}>
                <b style={{ color: TXT }}>{c.student_name}</b> · {c.name} · {c.comp_date}
                {c.status === 'live' && <b style={{ color: RED }}> · EN CURSO</b>}
              </p>
            ))}
          </div>
        </div>
      )}

      {data.next_appointments.length > 0 && (
        <div style={card}>
          <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: CYAN }}>Próximas citas</p>
          <div className="mt-1.5 space-y-0.5">
            {data.next_appointments.map((a, i) => (
              <p key={i} className="text-[12px]" style={{ color: DIM }}>
                <b style={{ color: TXT }}>{a.student_name}</b> · {a.kind}{a.mode ? ` · ${a.mode}` : ''} · {a.date}{a.time ? ` ${a.time}` : ''} <span style={{ color: FAINT }}>({a.coach_name})</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PLAN (hoy por atleta + Biblioteca) ───

function PlanTab() {
  const [sub, setSub] = useState<'hoy' | 'biblioteca'>('hoy');
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {(['hoy', 'biblioteca'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setSub(k)}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold capitalize"
            style={sub === k ? { background: CYAN, color: '#06202F' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
            {k === 'hoy' ? 'Hoy' : 'Biblioteca'}
          </button>
        ))}
        <Link href="/programas" className="ml-auto px-3.5 py-1.5 rounded-full text-[11px] font-bold"
          style={{ border: `1px solid ${GOLD}`, color: GOLD }}>
          Editor de programas →
        </Link>
      </div>
      {sub === 'hoy' ? <PlanHoy /> : <Biblioteca />}
    </div>
  );
}

function PlanHoy() {
  const [rows, setRows] = useState<HPPlanRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { hpPlanToday().then((r) => { if (r.ok) setRows(r.rows); setLoaded(true); }).catch(() => setLoaded(true)); }, []);
  if (!loaded) return <p className="text-[12px]" style={{ color: FAINT }}>Cargando…</p>;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.student_id} style={card} className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: TXT }}>{r.name}</p>
            <p className="text-[11px]" style={{ color: DIM }}>
              {r.program_title} · <b style={{ color: GOLD }}>{r.position}</b>
              {r.day_title ? ` · ${r.day_title}` : ''}{r.items_count > 0 ? ` · ${r.items_count} ítems` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold" style={{ color: r.done_today ? GREEN : FAINT }}>
              {r.done_today ? '✓ hecho hoy' : 'pendiente'}
            </span>
            {/* Atajo del app viejo (pedido 2026-08-23): del atleta directo al
                editor de SU programa — agregar/quitar sin pasar por el catálogo. */}
            <Link href={`/programas?programa=${r.program_id}`}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-full"
              style={{ border: `1px solid ${CYAN}`, color: CYAN }}>
              ✎ Editar su plan
            </Link>
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="text-[12px] text-center py-4" style={{ color: FAINT }}>Sin atletas con programa activo.</p>}
    </div>
  );
}

function Biblioteca() {
  const [lib, setLib] = useState<HPLibrary | null>(null);
  const [cat, setCat] = useState<'secuencia' | 'drills' | 'misiones' | 'videos'>('secuencia');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { hpLibrary().then((r) => { if (r.ok && r.data) setLib(r.data); }).catch(() => {}); }, []);
  const needle = q.trim().toLowerCase();
  const match = (...vals: (string | null | undefined)[]) =>
    !needle || vals.some((v) => (v ?? '').toLowerCase().includes(needle));

  const counts = lib ? { secuencia: lib.sequences.length, drills: lib.drills.length, misiones: lib.missions.length, videos: lib.videos.length } : null;

  return (
    <div className="space-y-2.5">
      <div className="flex gap-1.5 flex-wrap">
        {(['secuencia', 'drills', 'misiones', 'videos'] as const).map((k) => (
          <button key={k} type="button" onClick={() => { setCat(k); setOpenId(null); }}
            className="px-3 py-1.5 rounded-full text-[10.5px] font-bold capitalize"
            style={cat === k ? { background: CYAN, color: '#06202F' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
            {k} {counts ? counts[k] : ''}
          </button>
        ))}
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar paso, drill, cue o concepto…" aria-label="Buscar en la biblioteca" style={inp} />
      {!lib && <p className="text-[12px]" style={{ color: FAINT }}>Cargando biblioteca…</p>}

      {lib && cat === 'secuencia' && (
        <div className="space-y-1.5">
          {lib.sequences.filter((s) => match(s.sequence_part, s.expectation_standard, s.belt_level, s.pilar_reference)).slice(0, 80).map((s) => (
            <button key={s.id} type="button" onClick={() => setOpenId(openId === s.id ? null : s.id)} className="w-full text-left" style={card}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold" style={{ color: TXT }}>{s.sequence_part || '—'}</p>
                <span className="text-[9.5px] shrink-0" style={{ ...MONO, color: FAINT }}>
                  {(s.belt_level || '').toUpperCase()} · SEQ {s.sequence_number ?? '—'}·{s.step_order ?? '—'}{s.pilar_reference ? ` · ${s.pilar_reference}` : ''}
                </span>
              </div>
              {openId === s.id && s.expectation_standard && (
                <p className="text-[11.5px] mt-1.5 leading-relaxed" style={{ color: DIM }}>{s.expectation_standard}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {lib && cat === 'drills' && (
        <div className="space-y-1.5">
          {lib.drills.filter((d) => match(d.drill_name, d.goal, d.key_cue, d.related_error, d.related_pilar)).slice(0, 80).map((d) => (
            <button key={d.id} type="button" onClick={() => setOpenId(openId === d.id ? null : d.id)} className="w-full text-left" style={card}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold" style={{ color: TXT }}>{d.drill_name}</p>
                <span className="text-[9.5px] shrink-0 uppercase" style={{ ...MONO, color: FAINT }}>
                  {d.related_pilar ?? ''}{d.environment ? ` · ${d.environment}` : ''}
                </span>
              </div>
              {openId === d.id && (
                <div className="mt-1.5 space-y-1 text-[11.5px]" style={{ color: DIM }}>
                  {d.goal && <p>🎯 {d.goal}</p>}
                  {d.key_cue && <p>🗣 <b style={{ color: CYAN }}>{d.key_cue}</b></p>}
                  {d.related_error && <p>✗ Error: {d.related_error}</p>}
                  {d.related_solution && <p>✓ Solución: {d.related_solution}</p>}
                  {d.belt_level_range && <p style={{ color: FAINT }}>Cinturones: {d.belt_level_range}</p>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {lib && cat === 'misiones' && (
        <div className="space-y-1.5">
          {lib.missions.filter((m) => match(m.title, m.success_criteria, m.belt, m.description_md)).slice(0, 80).map((m) => (
            <button key={m.id} type="button" onClick={() => setOpenId(openId === m.id ? null : m.id)} className="w-full text-left" style={card}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold" style={{ color: TXT }}>{m.title}</p>
                <span className="text-[9.5px] shrink-0 uppercase" style={{ ...MONO, color: FAINT }}>
                  {m.type ?? ''}{m.belt ? ` · ${m.belt}` : ''}{m.time_estimate ? ` · ${m.time_estimate}` : ''}
                </span>
              </div>
              {openId === m.id && (
                <div className="mt-1.5 space-y-1 text-[11.5px]" style={{ color: DIM }}>
                  {m.description_md && <p className="whitespace-pre-line">{m.description_md.slice(0, 600)}</p>}
                  {m.success_criteria && <p>✓ <b style={{ color: GREEN }}>Éxito:</b> {m.success_criteria}</p>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {lib && cat === 'videos' && (
        <div className="space-y-1.5">
          {lib.videos.filter((v) => match(v.title, v.pillar)).map((v) => (
            <a key={v.id} href={v.video_url} target="_blank" rel="noreferrer" className="block" style={card}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold" style={{ color: TXT }}>▶ {v.title}</p>
                <span className="text-[9.5px] uppercase shrink-0" style={{ ...MONO, color: FAINT }}>{v.pillar ?? ''}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SESIÓN (presenciales + pasar lista) ───

function SesionTab() {
  const [sessions, setSessions] = useState<HPSessionRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(elSalvadorToday());
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = () => hpListSessions().then((r) => { if (r.ok) setSessions(r.sessions); else setErr(r.error || null); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    setErr(null); setBusy(true);
    const r = await hpCreateSession({ date, title });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setTitle('');
    load();
    if (r.id) setOpenId(r.id);
  };

  return (
    <div className="space-y-3">
      <div style={card} className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: CYAN }}>Nueva sesión presencial</p>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Fecha de la sesión" style={{ ...inp, width: 150, colorScheme: 'dark' }} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Water training · El Zonte…" aria-label="Nombre de la sesión" style={inp} />
        </div>
        <button type="button" disabled={busy || !title.trim() || !date} onClick={create}
          className="w-full rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: CYAN, color: '#06202F', opacity: busy || !title.trim() || !date ? 0.5 : 1 }}>
          {busy ? 'Creando…' : 'Crear y pasar lista →'}
        </button>
        <p className="text-[10px]" style={{ color: FAINT }}>
          La lista nace con TODOS los atletas presentes — solo destildás a los que faltaron. Asistir suma +10 en el ranking.
        </p>
        {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
      </div>

      {sessions.map((s) => (
        <div key={s.id} style={card}>
          <button type="button" onClick={() => setOpenId(openId === s.id ? null : s.id)} className="w-full text-left flex items-center justify-between gap-2">
            <div>
              <p className="text-[13px] font-semibold" style={{ color: TXT }}>{s.title}</p>
              <p className="text-[10.5px]" style={{ color: DIM }}>
                {s.session_date} · {s.attendance.filter((a) => a.present).length}/{s.attendance.length} presentes
              </p>
            </div>
            <span className="text-[10px]" style={{ color: FAINT }}>{openId === s.id ? '▴' : '▾ pasar lista'}</span>
          </button>
          {openId === s.id && (
            <div className="mt-2.5 pt-2.5 space-y-1.5" style={{ borderTop: `1px solid ${BORDER}` }}>
              {s.attendance.map((a) => (
                <AttendanceRow key={a.student_id} sessionId={s.id} row={a} onSaved={load} />
              ))}
              <div className="flex items-center gap-3 mt-1">
                <button type="button" onClick={() => hpSyncSessionRoster(s.id).then(load)}
                  className="text-[10px] font-bold" style={{ color: CYAN }}>
                  ↻ Actualizar lista (atletas nuevos)
                </button>
                <button type="button"
                  onClick={() => { if (confirm(`¿Eliminar la sesión "${s.title}"?`)) hpDeleteSession(s.id).then(load); }}
                  className="text-[10px]" style={{ color: FAINT }}>
                  Eliminar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {sessions.length === 0 && <p className="text-[12px] text-center py-3" style={{ color: FAINT }}>Sin sesiones todavía.</p>}
    </div>
  );
}

function AttendanceRow({ sessionId, row, onSaved }: {
  sessionId: string;
  row: { student_id: string; name: string; present: boolean; note: string | null };
  onSaved: () => void;
}) {
  const [present, setPresent] = useState(row.present);
  const [note, setNote] = useState(row.note ?? '');
  const [editing, setEditing] = useState(false);

  const toggle = async () => {
    const next = !present;
    setPresent(next); // optimista — un tap, cero espera
    try {
      const r = await hpSetAttendance(sessionId, row.student_id, { present: next });
      if (!r.ok) { setPresent(!next); return; }
      onSaved(); // el contador X/Y del header se actualiza
    } catch {
      // sin señal en la playa: revertir para no mentir
      setPresent(!next);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={toggle}
        className="flex-1 text-left flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: present ? 'rgba(6,214,160,.1)' : 'rgba(255,107,107,.08)', border: `1px solid ${present ? 'rgba(6,214,160,.35)' : 'rgba(255,107,107,.3)'}` }}>
        <span className="text-[14px]">{present ? '✅' : '❌'}</span>
        <span className="text-[12.5px] font-medium" style={{ color: TXT }}>{row.name}</span>
        {note && !editing && <span className="text-[10.5px] truncate" style={{ color: DIM }}>· {note}</span>}
      </button>
      <button type="button" onClick={() => setEditing(!editing)} className="text-[10px] px-1.5 shrink-0" style={{ color: FAINT }} aria-label={`Nota para ${row.name}`}>📝</button>
      {editing && (
        <input
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={async () => {
            setEditing(false);
            try {
              const r = await hpSetAttendance(sessionId, row.student_id, { note });
              if (r.ok) onSaved();
            } catch { /* la nota queda local; reintenta al volver la señal */ }
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          placeholder="Nota…"
          aria-label={`Nota de ${row.name}`}
          style={{ ...inp, width: 160 }}
        />
      )}
    </div>
  );
}

// ─── CITAS ───

function CitasTab() {
  const [rows, setRows] = useState<AdminAppointmentRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<{ id: string; display_name: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [coachId, setCoachId] = useState('');
  const [kind, setKind] = useState<'fisico' | 'mental' | 'tecnico' | 'nutricion' | 'evaluacion' | 'otro'>('fisico');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => adminListAppointments().then((r) => { if (r.ok) setRows(r.appointments); else setErr(r.error || null); }).catch(() => {});
  useEffect(() => {
    load();
    adminListHPCoaches().then((r: any) => { if (r.ok) setCoaches((r.coaches ?? []).filter((c: any) => (c.hp_escalon ?? 0) >= 1)); }).catch(() => {});
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) adminSearchStudents(q).then((r) => { if (r.ok) setResults(r.students.map((s: any) => ({ id: s.id, name: s.name }))); });
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const create = async () => {
    if (!picked || !coachId || !date) return;
    setErr(null); setBusy(true);
    const r = await adminCreateAppointment({ studentId: picked.id, coachId, kind, date, time: time || null });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setPicked(null); setQ(''); setDate(''); setTime(''); setCreating(false);
    load();
  };

  return (
    <div className="space-y-3">
      {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
      {!creating ? (
        <button type="button" onClick={() => setCreating(true)}
          className="w-full rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: CYAN, color: '#06202F' }}>
          + Nueva cita
        </button>
      ) : (
        <div style={card} className="space-y-2">
          <div className="relative">
            <input value={picked ? picked.name : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }} placeholder="Atleta…" aria-label="Atleta" style={inp} />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl overflow-hidden" style={{ background: '#12283A', border: `1px solid ${BORDER}` }}>
                {results.map((st) => (
                  <button key={st.id} type="button" onClick={() => { setPicked(st); setResults([]); }}
                    className="w-full text-left px-3 py-2 text-[12.5px]" style={{ color: TXT }}>
                    {st.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select value={coachId} onChange={(e) => setCoachId(e.target.value)} aria-label="Quién atiende" style={{ ...inp, color: coachId ? TXT : FAINT }}>
            <option value="">¿Quién atiende? *</option>
            {coaches.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
          </select>
          <div className="flex gap-1.5 flex-wrap">
            {(['fisico', 'mental', 'tecnico', 'nutricion', 'evaluacion', 'otro'] as const).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} className="px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize"
                style={kind === k ? { background: CYAN, color: '#06202F' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
                {k}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Fecha" style={{ ...inp, colorScheme: 'dark' }} />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Hora" style={{ ...inp, colorScheme: 'dark' }} />
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={busy || !picked || !coachId || !date} onClick={create}
              className="flex-1 rounded-full py-2 text-[11px] font-bold" style={{ background: CYAN, color: '#06202F', opacity: busy || !picked || !coachId || !date ? 0.5 : 1 }}>
              {busy ? 'Creando…' : 'Crear cita'}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="px-3 text-[11px]" style={{ color: FAINT }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {rows.map((a) => (
          <div key={a.id} style={card} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold truncate" style={{ color: TXT }}>{a.student_name}</p>
              <p className="text-[10.5px]" style={{ color: DIM }}>
                {a.title || a.kind}{a.mode ? ` · ${a.mode}` : ''} · {a.appointment_date}{a.appointment_time ? ` · ${a.appointment_time}` : ''} · {a.coach_name}
              </p>
            </div>
            {a.status === 'scheduled' ? (
              <button type="button" onClick={() => adminSetAppointmentStatus(a.id, 'done').then(load)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ border: `1px solid ${GREEN}`, color: GREEN }}>
                Hecha ✓
              </button>
            ) : (
              <span className="text-[10px] shrink-0" style={{ color: FAINT }}>{a.status === 'done' ? 'hecha ✓' : a.status}</span>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="text-[12px] text-center py-3" style={{ color: FAINT }}>Sin citas próximas.</p>}
      </div>
    </div>
  );
}

// ─── EVAL (rápidas por pilar + PROFUNDAS post-competencia) ───

// Catálogo de ítems de la evaluación profunda — calcado de la app HP.
const DEEP_SECTIONS: { key: 'tec' | 'tac' | 'men' | 'fis' | 'com'; label: string; color: string; items: { key: string; label: string }[] }[] = [
  { key: 'tec', label: 'Técnico', color: '#00D2FF', items: [
    { key: 'tec_uso_cara_velocidad', label: 'Uso de cara y velocidad' },
    { key: 'tec_fundamentos', label: 'Fundamentos' },
    { key: 'tec_bottom_turn', label: 'Bottom turn' },
    { key: 'tec_maniobras_principales', label: 'Maniobras principales' },
    { key: 'tec_maniobras_progresivas', label: 'Maniobras progresivas' },
    { key: 'tec_conexion_flow', label: 'Conexión y flow' },
    { key: 'tec_repertorio', label: 'Repertorio' },
    { key: 'tec_momentos_criticos', label: 'Momentos críticos' },
    { key: 'tec_general', label: 'Global técnico' },
  ]},
  { key: 'tac', label: 'Táctico', color: '#06D6A0', items: [
    { key: 'tac_analisis_zona', label: 'Análisis de zona' },
    { key: 'tac_eleccion_tabla', label: 'Elección de tabla' },
    { key: 'tac_manejo_prioridad', label: 'Manejo de prioridad' },
    { key: 'tac_lineup_pos', label: 'Posicionamiento en lineup' },
    { key: 'tac_adaptacion_rival', label: 'Adaptación al rival' },
    { key: 'tac_seleccion_olas', label: 'Selección de olas' },
    { key: 'tac_parte_critica', label: 'Parte crítica del heat' },
    { key: 'tac_general', label: 'Global táctico' },
  ]},
  { key: 'men', label: 'Mental', color: '#FFD166', items: [
    { key: 'men_enfoque', label: 'Enfoque' },
    { key: 'men_the_zone', label: 'The Zone' },
    { key: 'men_mentalidad_ganador', label: 'Mentalidad de ganador' },
    { key: 'men_recuperacion', label: 'Recuperación tras error' },
    { key: 'men_manejo_presion', label: 'Manejo de presión' },
    { key: 'men_lenguaje_corporal', label: 'Lenguaje corporal' },
    { key: 'men_diversion_conexion', label: 'Diversión y conexión' },
    { key: 'men_general', label: 'Global mental' },
  ]},
  { key: 'fis', label: 'Físico', color: '#FF8C42', items: [
    { key: 'fis_remada', label: 'Remada' },
    { key: 'fis_resistencia_olas', label: 'Resistencia entre olas' },
    { key: 'fis_respiracion', label: 'Respiración' },
    { key: 'fis_general', label: 'Global físico' },
  ]},
  { key: 'com', label: 'Competitivo', color: '#FF6B6B', items: [
    { key: 'com_general', label: 'Global competitivo' },
  ]},
];

const DEEP_DIAG_FIELDS: { key: string; label: string }[] = [
  { key: 'what_worked', label: 'Qué funcionó' },
  { key: 'what_failed', label: 'Qué falló' },
  { key: 'critical_error', label: 'Error crítico' },
  { key: 'pattern', label: 'Patrón detectado' },
  { key: 'main_strength', label: 'Fortaleza principal' },
  { key: 'key_limitation', label: 'Limitación clave' },
  { key: 'top_priority', label: 'Prioridad #1' },
  { key: 'concrete_action', label: 'Acción concreta' },
  { key: 'notes', label: 'Notas' },
];

function EvalTab() {
  const [mode, setMode] = useState<'rapidas' | 'profundas'>('rapidas');
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {(['rapidas', 'profundas'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold"
            style={mode === m ? { background: CYAN, color: '#06202F' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
            {m === 'rapidas' ? 'Rápidas · por pilar' : 'Profundas · competencia'}
          </button>
        ))}
      </div>
      {mode === 'rapidas' ? <QuickEvals /> : <DeepEvals />}
    </div>
  );
}

function QuickEvals() {
  const [rows, setRows] = useState<HPEvalRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [pillar, setPillar] = useState<'fisico' | 'tecnico' | 'tactico' | 'mental'>('tecnico');
  const [score, setScore] = useState(7);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => hpListEvaluations().then((r) => { if (r.ok) setRows(r.evaluations); else setErr(r.error || null); }).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) adminSearchStudents(q).then((r) => { if (r.ok) setResults(r.students.map((s: any) => ({ id: s.id, name: s.name }))); });
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const create = async () => {
    if (!picked) return;
    setErr(null); setBusy(true);
    const r = await hpCreateEvaluation({ studentId: picked.id, pillar, score, notes: notes || null });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setPicked(null); setQ(''); setNotes(''); setCreating(false);
    load();
  };

  return (
    <div className="space-y-3">
      {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
      {!creating ? (
        <button type="button" onClick={() => setCreating(true)}
          className="w-full rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: CYAN, color: '#06202F' }}>
          + Evaluar atleta
        </button>
      ) : (
        <div style={card} className="space-y-2">
          <div className="relative">
            <input value={picked ? picked.name : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }} placeholder="Atleta…" aria-label="Atleta" style={inp} />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl overflow-hidden" style={{ background: '#12283A', border: `1px solid ${BORDER}` }}>
                {results.map((st) => (
                  <button key={st.id} type="button" onClick={() => { setPicked(st); setResults([]); }}
                    className="w-full text-left px-3 py-2 text-[12.5px]" style={{ color: TXT }}>
                    {st.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['fisico', 'tecnico', 'tactico', 'mental'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPillar(p)} className="px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize"
                style={pillar === p ? { background: CYAN, color: '#06202F' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: DIM }}>Puntaje</span>
            <input type="range" min={1} max={10} value={score} onChange={(e) => setScore(Number(e.target.value))} className="flex-1" aria-label="Puntaje 1 a 10" />
            <span className="text-[14px] font-bold w-12 text-right" style={{ color: CYAN }}>{score}/10</span>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Nota (opcional)…" aria-label="Nota" style={{ ...inp, resize: 'vertical' }} />
          <div className="flex gap-2">
            <button type="button" disabled={busy || !picked} onClick={create}
              className="flex-1 rounded-full py-2 text-[11px] font-bold" style={{ background: CYAN, color: '#06202F', opacity: busy || !picked ? 0.5 : 1 }}>
              {busy ? 'Guardando…' : 'Guardar evaluación'}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="px-3 text-[11px]" style={{ color: FAINT }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {rows.map((e) => (
          <div key={e.id} style={card}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] font-semibold" style={{ color: TXT }}>{e.student_name}</p>
              <p className="text-[11px]" style={{ ...MONO, color: FAINT }}>{e.eval_date}</p>
            </div>
            <p className="text-[11.5px] mt-0.5" style={{ color: DIM }}>
              <b className="capitalize" style={{ color: GOLD }}>{e.pillar}</b>
              {e.score != null && <> · <b style={{ color: CYAN }}>{e.score}/10</b></>} · {e.coach_name}
              {e.notes && <span style={{ color: FAINT }}> — {e.notes}</span>}
            </p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-[12px] text-center py-3" style={{ color: FAINT }}>Sin evaluaciones todavía.</p>}
      </div>
    </div>
  );
}

// ─── MSG ───

function MsgTab() {
  const [messages, setMessages] = useState<HPMessageRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [target, setTarget] = useState<'all' | 'one'>('all');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => hpListMessages().then((r) => { if (r.ok) setMessages(r.messages); else setErr(r.error || null); }).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) adminSearchStudents(q).then((r) => { if (r.ok) setResults(r.students.map((s: any) => ({ id: s.id, name: s.name }))); });
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const send = async () => {
    setErr(null); setOk(null); setBusy(true);
    const r = await hpSendMessage({ studentId: target === 'all' ? 'all' : (picked?.id ?? ''), subject: subject || null, body });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setOk(`Enviado a ${r.sent} atleta${r.sent === 1 ? '' : 's'} ✓ — les aparece en su portal.`);
    setBody(''); setSubject('');
    load();
  };

  return (
    <div className="space-y-3">
      <div style={card} className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: CYAN }}>Nuevo mensaje</p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setTarget('all')} className="px-3 py-1.5 rounded-full text-[10.5px] font-bold"
            style={target === 'all' ? { background: GOLD, color: '#412402' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
            📣 Todos los atletas
          </button>
          <button type="button" onClick={() => setTarget('one')} className="px-3 py-1.5 rounded-full text-[10.5px] font-bold"
            style={target === 'one' ? { background: GOLD, color: '#412402' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
            Uno solo
          </button>
        </div>
        {target === 'one' && (
          <div className="relative">
            <input value={picked ? picked.name : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }} placeholder="Atleta…" aria-label="Atleta destinatario" style={inp} />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl overflow-hidden" style={{ background: '#12283A', border: `1px solid ${BORDER}` }}>
                {results.map((st) => (
                  <button key={st.id} type="button" onClick={() => { setPicked(st); setResults([]); }}
                    className="w-full text-left px-3 py-2 text-[12.5px]" style={{ color: TXT }}>
                    {st.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto (opcional)" aria-label="Asunto" style={inp} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Escribí tu mensaje (el atleta lo ve tal cual)…" aria-label="Mensaje" style={{ ...inp, resize: 'vertical' }} />
        {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
        {ok && <p className="text-[11px]" style={{ color: GREEN }}>{ok}</p>}
        <button type="button" disabled={busy || !body.trim() || (target === 'one' && !picked)} onClick={send}
          className="w-full rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: CYAN, color: '#06202F', opacity: busy || !body.trim() || (target === 'one' && !picked) ? 0.5 : 1 }}>
          {busy ? 'Enviando…' : 'Enviar →'}
        </button>
      </div>

      <div className="space-y-1.5">
        {messages.map((m) => (
          <div key={m.id} style={card}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-semibold" style={{ color: TXT }}>{m.student_name}</p>
              <span className="text-[9.5px]" style={{ ...MONO, color: m.read_at ? GREEN : FAINT }}>
                {m.read_at ? 'leído ✓' : 'sin leer'}
              </span>
            </div>
            <p className="text-[11.5px] mt-0.5 truncate" style={{ color: DIM }}>{m.subject ? `${m.subject} — ` : ''}{m.body}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-[12px] text-center py-3" style={{ color: FAINT }}>Sin mensajes enviados todavía.</p>}
      </div>
    </div>
  );
}

function DeepEvals() {
  const [rows, setRows] = useState<HPDeepEvalRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [kindFilter, setKindFilter] = useState<'todas' | 'general' | 'competencia'>('todas');
  const load = () => hpListDeepEvaluations().then((r) => { if (r.ok) setRows(r.evaluations); else setErr(r.error || null); }).catch(() => {});
  useEffect(() => { load(); }, []);
  const visible = rows.filter((r) => kindFilter === 'todas' || r.eval_kind === kindFilter);

  const SECTION_CHIP: Record<string, string> = { tec: 'TEC', tac: 'TAC', men: 'MEN', fis: 'FIS', com: 'COM' };

  return (
    <div className="space-y-3">
      {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
      {!creating ? (
        <button type="button" onClick={() => setCreating(true)}
          className="w-full rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: GOLD, color: '#412402' }}>
          + Evaluación profunda de competencia
        </button>
      ) : (
        <DeepEvalForm onDone={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />
      )}

      <div className="flex gap-1.5">
        {(['todas', 'general', 'competencia'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKindFilter(k)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize"
            style={kindFilter === k ? { background: GOLD, color: '#412402' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
            {k === 'todas' ? `Todas ${rows.length}` : k === 'general' ? `Generales ${rows.filter((r) => r.eval_kind === 'general').length}` : `Competencia ${rows.filter((r) => r.eval_kind === 'competencia').length}`}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {visible.map((e) => {
          const open = openId === e.id;
          return (
            <div key={e.id} style={card}>
              <button type="button" onClick={() => setOpenId(open ? null : e.id)} className="w-full text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] font-semibold truncate" style={{ color: TXT }}>{e.student_name}</p>
                  <p className="text-[10px] shrink-0" style={{ ...MONO, color: FAINT }}>{e.eval_date}</p>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: DIM }}>
                  <span className="font-bold uppercase text-[9px] mr-1 px-1.5 py-0.5 rounded" style={{ ...MONO, background: e.eval_kind === 'general' ? 'rgba(0,210,255,.12)' : 'rgba(255,209,102,.12)', color: e.eval_kind === 'general' ? CYAN : GOLD }}>
                    {e.eval_kind === 'general' ? 'General' : 'Competencia'}
                  </span>
                  {e.event_name ?? 'Competencia'}
                  {e.round_reached ? ` · ${e.round_reached}` : ''}
                  {e.final_ranking ? ` · puesto ${e.final_ranking}` : ''}
                </p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {DEEP_SECTIONS.map((sec) => {
                    const avg = e.section_avgs[sec.key];
                    if (avg == null) return null;
                    return (
                      <span key={sec.key} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ ...MONO, border: `1px solid ${sec.color}`, color: sec.color }}>
                        {SECTION_CHIP[sec.key]} {avg.toFixed(1)}/5
                      </span>
                    );
                  })}
                </div>
              </button>

              {open && (
                <div className="mt-2.5 pt-2.5 space-y-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
                  {DEEP_SECTIONS.map((sec) => {
                    const items = sec.items.filter((it) => e.scores[it.key] != null);
                    if (!items.length) return null;
                    return (
                      <div key={sec.key}>
                        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: sec.color }}>{sec.label}</p>
                        <div className="mt-1 space-y-1">
                          {items.map((it) => (
                            <div key={it.key} className="flex items-center gap-2">
                              <p className="text-[11px] w-44 shrink-0 truncate" style={{ color: DIM }}>{it.label}</p>
                              <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                                <div className="h-full rounded-full" style={{ width: `${(e.scores[it.key] / 5) * 100}%`, background: sec.color }} />
                              </div>
                              <p className="text-[10.5px] w-7 text-right" style={{ ...MONO, color: TXT }}>{e.scores[it.key]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {DEEP_DIAG_FIELDS.some((f) => e.diagnostico[f.key]) && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Diagnóstico</p>
                      <div className="mt-1 space-y-1">
                        {DEEP_DIAG_FIELDS.filter((f) => e.diagnostico[f.key]).map((f) => (
                          <p key={f.key} className="text-[11.5px]" style={{ color: DIM }}>
                            <b style={{ color: TXT }}>{f.label}:</b> {e.diagnostico[f.key]}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {visible.length === 0 && <p className="text-[12px] text-center py-3" style={{ color: FAINT }}>Sin evaluaciones de este tipo todavía.</p>}
      </div>
    </div>
  );
}

function DeepEvalForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [kind, setKind] = useState<'general' | 'competencia'>('general');
  const [eventName, setEventName] = useState('');
  const [round, setRound] = useState('');
  const [ranking, setRanking] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [diag, setDiag] = useState<Record<string, string>>({});
  const [openSec, setOpenSec] = useState<string>('tec');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) adminSearchStudents(q).then((r) => { if (r.ok) setResults(r.students.map((s: any) => ({ id: s.id, name: s.name }))); });
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const save = async () => {
    if (!picked) return;
    setErr(null); setBusy(true);
    const r = await hpCreateDeepEvaluation({
      studentId: picked.id, eval_kind: kind, event_name: eventName,
      round_reached: kind === 'competencia' ? (round || null) : null,
      final_ranking: kind === 'competencia' ? (ranking || null) : null,
      scores, diagnostico: diag,
    });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    onDone();
  };

  const secAvg = (prefix: string) => {
    const vals = Object.entries(scores).filter(([k]) => k.startsWith(prefix)).map(([, v]) => v);
    return vals.length ? (vals.reduce((s, x) => s + x, 0) / vals.length).toFixed(1) : null;
  };

  return (
    <div style={card} className="space-y-2.5">
      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Evaluación profunda</p>
      <div className="flex gap-1.5">
        {(['general', 'competencia'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)}
            className="px-3 py-1.5 rounded-full text-[10.5px] font-bold capitalize"
            style={kind === k ? { background: CYAN, color: '#06202F' } : { background: CARD, color: DIM, border: `1px solid ${BORDER}` }}>
            {k === 'general' ? '📋 General (programada)' : '🏆 Post-competencia'}
          </button>
        ))}
      </div>
      <div className="relative">
        <input value={picked ? picked.name : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }} placeholder="Atleta… *" aria-label="Atleta" style={inp} />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl overflow-hidden" style={{ background: '#12283A', border: `1px solid ${BORDER}` }}>
            {results.map((st) => (
              <button key={st.id} type="button" onClick={() => { setPicked(st); setResults([]); }}
                className="w-full text-left px-3 py-2 text-[12.5px]" style={{ color: TXT }}>
                {st.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <input value={eventName} onChange={(e) => setEventName(e.target.value)}
        placeholder={kind === 'general' ? 'Motivo — Evaluación física · agosto *' : 'Evento — Panamericanos 2026 *'}
        aria-label={kind === 'general' ? 'Motivo' : 'Evento'} style={inp} />
      {kind === 'competencia' && (
        <div className="flex gap-2">
          <input value={round} onChange={(e) => setRound(e.target.value)} placeholder="Ronda alcanzada" aria-label="Ronda alcanzada" style={inp} />
          <input value={ranking} onChange={(e) => setRanking(e.target.value)} placeholder="Puesto final" aria-label="Puesto final" style={inp} />
        </div>
      )}

      {DEEP_SECTIONS.map((sec) => {
        const open = openSec === sec.key;
        const avg = secAvg(sec.key + '_');
        return (
          <div key={sec.key} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            <button type="button" onClick={() => setOpenSec(open ? '' : sec.key)}
              className="w-full flex items-center justify-between px-3 py-2" style={{ background: 'rgba(255,255,255,.03)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ ...MONO, color: sec.color }}>{sec.label}</p>
              <p className="text-[10.5px]" style={{ ...MONO, color: avg ? sec.color : FAINT }}>{avg ? `${avg}/5` : open ? '▴' : '▾'}</p>
            </button>
            {open && (
              <div className="px-3 py-2 space-y-2">
                {sec.items.map((it) => (
                  <div key={it.key} className="flex items-center gap-2">
                    <p className="text-[11px] w-40 shrink-0" style={{ color: DIM }}>{it.label}</p>
                    <input type="range" min={1} max={5} step={1}
                      value={scores[it.key] ?? 3}
                      onChange={(e) => setScores((sc) => ({ ...sc, [it.key]: Number(e.target.value) }))}
                      className="flex-1" aria-label={`${it.label} 1 a 5`} />
                    <button type="button"
                      onClick={() => setScores((sc) => { const c = { ...sc }; if (c[it.key] != null) delete c[it.key]; else c[it.key] = 3; return c; })}
                      className="text-[11px] w-9 text-right shrink-0"
                      style={{ ...MONO, color: scores[it.key] != null ? sec.color : FAINT }}
                      title={scores[it.key] != null ? 'Quitar puntaje' : 'Puntuar'}>
                      {scores[it.key] != null ? `${scores[it.key]}/5` : '—'}
                    </button>
                  </div>
                ))}
                <p className="text-[9.5px]" style={{ color: FAINT }}>Tocá el número para incluir/quitar un ítem — solo se guardan los puntuados.</p>
              </div>
            )}
          </div>
        );
      })}

      <div className="rounded-xl px-3 py-2 space-y-1.5" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,209,102,.05)' }}>
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>Diagnóstico</p>
        {DEEP_DIAG_FIELDS.map((f) => (
          <input key={f.key} value={diag[f.key] ?? ''}
            onChange={(e) => setDiag((d) => ({ ...d, [f.key]: e.target.value }))}
            placeholder={f.label + '…'} aria-label={f.label} style={inp} />
        ))}
      </div>

      {err && <p className="text-[11px]" style={{ color: RED }}>{err}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={busy || !picked || !eventName.trim()} onClick={save}
          className="flex-1 rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...MONO, background: GOLD, color: '#412402', opacity: busy || !picked || !eventName.trim() ? 0.5 : 1 }}>
          {busy ? 'Guardando…' : 'Guardar evaluación profunda'}
        </button>
        <button type="button" onClick={onCancel} className="px-3 text-[11px]" style={{ color: FAINT }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── EQUIPO ───

function EquipoTab() {
  const [rows, setRows] = useState<HPTeamRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openProfile, setOpenProfile] = useState<string | null>(null);
  useEffect(() => { hpTeam().then((r) => { if (r.ok) setRows(r.rows); setLoaded(true); }).catch(() => setLoaded(true)); }, []);
  if (!loaded) return <p className="text-[12px]" style={{ color: FAINT }}>Cargando…</p>;
  if (openProfile) return <AthleteProfile studentId={openProfile} onBack={() => setOpenProfile(null)} />;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.student_id} style={card}>
          <div className="flex items-center justify-end gap-2 mb-1 -mt-1">
            <Link href={`/hp/reporte/${r.student_id}`} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ border: `1px solid ${CYAN}`, color: CYAN }}>
              📄 Reporte
            </Link>
          </div>
        <button type="button" onClick={() => setOpenProfile(r.student_id)} className="block w-full text-left">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold truncate" style={{ color: TXT }}>
              {r.ranking_position != null && r.ranking_position <= 3 ? ['🥇', '🥈', '🥉'][r.ranking_position - 1] + ' ' : ''}{r.name}
            </p>
            <span className="text-[10px] font-bold shrink-0" style={{ color: r.active_today ? GREEN : FAINT }}>
              {r.active_today ? '✓ activo hoy' : 'sin actividad hoy'}
            </span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: DIM }}>
            {r.program_title} · <b style={{ color: GOLD }}>{r.position}</b> · {r.adherence_pct}%
            {r.ranking_position != null && <> · rank <b style={{ color: CYAN }}>#{r.ranking_position}</b> ({r.ranking_points} pts)</>}
          </p>
          {(r.next_competition || r.evals_count > 0 || r.last_checkin_date) && (
            <p className="text-[10.5px] mt-0.5" style={{ color: FAINT }}>
              {r.next_competition ? `🏆 ${r.next_competition} · ` : ''}
              {r.evals_count > 0 ? `${r.evals_count} eval${r.evals_count === 1 ? '' : 's'} · ` : ''}
              {r.last_checkin_date ? `último check-in ${r.last_checkin_date}` : 'sin check-ins recientes'}
              {' · '}perfil completo →
            </p>
          )}
        </button>
        </div>
      ))}
      {rows.length === 0 && <p className="text-[12px] text-center py-4" style={{ color: FAINT }}>Sin atletas con programa activo.</p>}
    </div>
  );
}

// ─── PERFIL DEL ATLETA (la vista Equipo de la app HP, completa) ───

const PILLAR_META: Record<string, { label: string; color: string }> = {
  fis: { label: 'Físico', color: '#06D6A0' },
  tec: { label: 'Técnico', color: '#00D2FF' },
  tac: { label: 'Táctico', color: '#8B5CF6' },
  men: { label: 'Mental', color: '#FF8C42' },
  com: { label: 'Competitivo', color: '#FF6B6B' },
};

function AthleteProfile({ studentId, onBack }: { studentId: string; onBack: () => void }) {
  const [d, setD] = useState<HPAthleteFull | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    hpAthleteFull(studentId).then((r) => { if (r.ok && r.data) setD(r.data); else setErr(r.error || null); }).catch(() => {});
  }, [studentId]);
  if (err) return <p className="text-[12px]" style={{ color: RED }}>{err}</p>;
  if (!d) return <p className="text-[12px]" style={{ color: FAINT }}>Cargando perfil…</p>;
  const mins = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
  return (
    <div className="space-y-3">
      <button type="button" onClick={onBack} className="text-[11px]" style={{ ...MONO, color: FAINT }}>← Equipo</button>

      <div style={card}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[18px] font-extrabold uppercase leading-tight" style={{ color: TXT, fontStretch: '125%' }}>
              {d.student.name}
            </p>
            {d.student.nickname && <p className="text-[12px] font-bold" style={{ color: GOLD }}>&ldquo;{d.student.nickname}&rdquo;</p>}
            <p className="text-[11px] mt-0.5" style={{ color: DIM }}>
              {d.student.belt ? `Cinta: ${d.student.belt.replace(/_/g, ' ')}` : ''}
              {d.student.age != null ? ` · ${d.student.age} años` : ''}
              {d.student.stance ? ` · ${d.student.stance}` : ''}
              {d.ranking ? ` · rank #${d.ranking.position}/${d.ranking.total}` : ''}
            </p>
          </div>
          {d.last_eval?.global != null && (
            <div className="text-center shrink-0 rounded-2xl px-3 py-2" style={{ border: `2px solid ${CYAN}` }}>
              <p className="text-[22px] font-extrabold leading-none" style={{ color: CYAN }}>{d.last_eval.global.toFixed(1)}</p>
              <p className="text-[8px] uppercase tracking-wider mt-0.5" style={{ ...MONO, color: FAINT }}>Índice /5</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-2.5 flex-wrap">
          <Link href={`/hp/reporte/${d.student.id}`} className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{ background: CYAN, color: '#06202F' }}>📄 Reporte PDF</Link>
          <Link href={`/students/${d.student.id}`} className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{ border: `1px solid ${BORDER}`, color: DIM }}>Ficha BRAIN →</Link>
          <Link href="/programas" className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{ border: `1px solid ${BORDER}`, color: DIM }}>Editar plan →</Link>
        </div>
      </div>

      {d.last_eval && (
        <div style={card}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Perfil de rendimiento</p>
            <p className="text-[9.5px]" style={{ ...MONO, color: FAINT }}>{d.last_eval.date}</p>
          </div>
          <div className="mt-2 space-y-1.5">
            {d.last_eval.pillars.map((p) => {
              const meta = PILLAR_META[p.key] ?? { label: p.key, color: CYAN };
              return (
                <div key={p.key}>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-semibold" style={{ color: TXT }}>{meta.label}</p>
                    <p className="text-[12px] font-bold" style={{ ...MONO, color: meta.color }}>{p.avg.toFixed(1)}/5</p>
                  </div>
                  <div className="h-[6px] rounded-full overflow-hidden mt-0.5" style={{ background: 'rgba(255,255,255,.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(p.avg / 5) * 100}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {d.profile && (
        <>
          {d.profile.score_capacity != null && (
            <div style={card}>
              <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Capacidad de score</p>
              <p className="text-[9.5px] mt-0.5" style={{ color: FAINT }}>Techo técnico para generar puntuación</p>
              <div className="flex items-center gap-2.5 mt-1.5">
                <p className="text-[24px] font-extrabold" style={{ color: GREEN }}>{d.profile.score_capacity}</p>
                <div className="flex-1 h-[8px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${d.profile.score_capacity * 10}%`, background: GREEN }} />
                </div>
              </div>
              <p className="text-[10px] mt-1" style={{ color: DIM }}>
                {d.profile.score_capacity >= 8 ? 'Alto — puede generar scores premium' : d.profile.score_capacity >= 5 ? 'Medio — scores sólidos con el set correcto' : 'En construcción'}
              </p>
            </div>
          )}

          <div style={card}>
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Datos físicos</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { n: d.student.age != null ? String(d.student.age) : '—', l: 'Edad' },
                { n: d.profile.height_cm != null ? `${d.profile.height_cm}cm` : '—', l: 'Altura' },
                { n: d.profile.weight_kg != null ? `${d.profile.weight_kg}kg` : '—', l: 'Peso' },
                { n: d.profile.bmi != null ? String(d.profile.bmi) : '—', l: 'IMC' },
              ].map((x) => (
                <div key={x.l} className="rounded-xl py-2.5 text-center" style={{ background: 'rgba(255,255,255,.04)' }}>
                  <p className="text-[17px] font-extrabold" style={{ color: TXT }}>{x.n}</p>
                  <p className="text-[8.5px] uppercase tracking-wider" style={{ ...MONO, color: FAINT }}>{x.l}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-2" style={{ color: DIM }}>
              {d.student.stance ? `Posición: ${d.student.stance}` : ''}
              {d.profile.dominant_foot ? ` · Pie: ${d.profile.dominant_foot}` : ''}
              {d.profile.favorite_maneuver ? ` · Maniobra favorita: ${d.profile.favorite_maneuver}` : ''}
              {d.profile.years_surfing != null ? ` · ${d.profile.years_surfing} años surfeando` : ''}
              {d.profile.years_competing != null ? ` · ${d.profile.years_competing} compitiendo` : ''}
            </p>
          </div>

          <div style={{ ...card, borderLeft: d.profile.injury ? `3px solid ${RED}` : undefined }}>
            {d.profile.injury ? (
              <p className="text-[12px]" style={{ color: DIM }}>
                🩹 <b style={{ color: RED }}>Lesión:</b> {d.profile.injury}
                {d.profile.injury_since ? ` (desde ${d.profile.injury_since})` : ''}
              </p>
            ) : (
              <p className="text-[11.5px]" style={{ color: FAINT }}>Sin lesiones registradas.</p>
            )}
          </div>

          <div style={{ ...card, borderLeft: `3px solid ${d.profile.ficha_pct >= 100 ? GREEN : GOLD}` }}>
            <p className="text-[11.5px] font-bold" style={{ color: TXT }}>Ficha técnica · {d.profile.ficha_pct}% completa</p>
            {d.profile.ficha_missing.length > 0 && (
              <p className="text-[10.5px] mt-0.5" style={{ color: DIM }}>Faltan: {d.profile.ficha_missing.join(' · ')}</p>
            )}
            <div className="h-[6px] rounded-full overflow-hidden mt-1.5" style={{ background: 'rgba(255,255,255,.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${d.profile.ficha_pct}%`, background: d.profile.ficha_pct >= 100 ? GREEN : GOLD }} />
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div style={card} className="text-center">
          <p className="text-[17px] font-extrabold" style={{ color: CYAN }}>{mins(d.water.total_minutes)}</p>
          <p className="text-[8.5px] uppercase tracking-wider" style={{ ...MONO, color: FAINT }}>Horas en el agua · total</p>
        </div>
        <div style={card} className="text-center">
          <p className="text-[17px] font-extrabold" style={{ color: TXT }}>{mins(d.water.week_minutes)}</p>
          <p className="text-[8.5px] uppercase tracking-wider" style={{ ...MONO, color: FAINT }}>Esta semana</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { n: d.counts.sessions_attended, l: 'Sesiones' },
          { n: d.counts.evals, l: 'Evaluaciones' },
          { n: d.counts.checkins, l: 'Check-ins' },
        ].map((x) => (
          <div key={x.l} style={card} className="text-center">
            <p className="text-[19px] font-extrabold" style={{ color: CYAN }}>{x.n}</p>
            <p className="text-[8.5px] uppercase tracking-wider" style={{ ...MONO, color: FAINT }}>{x.l}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Promedios check-in · 14 días</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { n: d.habits14.avg_sleep != null ? `${d.habits14.avg_sleep}h` : '—', l: '😴 Sueño' },
            { n: d.habits14.avg_water != null ? `${d.habits14.avg_water}/8` : '—', l: '💧 Agua' },
            { n: d.habits14.avg_energy != null ? `${d.habits14.avg_energy}/4` : '—', l: '⚡ Energía' },
          ].map((x) => (
            <div key={x.l} className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,.04)' }}>
              <p className="text-[15px] font-extrabold" style={{ color: GREEN }}>{x.n}</p>
              <p className="text-[8.5px]" style={{ ...MONO, color: FAINT }}>{x.l}</p>
            </div>
          ))}
        </div>
        {d.habits14.last_nights.length > 0 && (
          <>
            <p className="text-[9px] uppercase tracking-wider mt-2.5" style={{ ...MONO, color: FAINT }}>Últimas noches</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {d.habits14.last_nights.map((n) => (
                <div key={n.date} className="rounded-lg px-2 py-1 text-center" style={{ background: 'rgba(255,255,255,.04)' }}>
                  <p className="text-[11.5px] font-bold" style={{ color: n.sleep != null && n.sleep >= 7 ? GREEN : GOLD }}>{n.sleep != null ? `${n.sleep}h` : '—'}</p>
                  <p className="text-[8px]" style={{ ...MONO, color: FAINT }}>{n.date}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={card}>
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Citas</p>
        {d.appointments.upcoming.length === 0 && <p className="text-[11px] mt-1" style={{ color: FAINT }}>Sin citas próximas{d.appointments.past_count ? ` · ${d.appointments.past_count} pasadas` : ''}.</p>}
        <div className="mt-1 space-y-0.5">
          {d.appointments.upcoming.map((a, i) => (
            <p key={i} className="text-[11.5px]" style={{ color: DIM }}>
              <b style={{ color: TXT }}>{a.title || a.kind}</b>{a.mode ? ` · ${a.mode}` : ''} · {a.date}{a.time ? ` ${a.time}` : ''} <span style={{ color: FAINT }}>({a.coach})</span>
            </p>
          ))}
        </div>
        {d.appointments.upcoming.length > 0 && d.appointments.past_count > 0 && (
          <p className="text-[9.5px] mt-1" style={{ color: FAINT }}>{d.appointments.past_count} citas pasadas</p>
        )}
      </div>

      {d.competitions.length > 0 && (
        <div style={{ ...card, borderLeft: `3px solid ${GOLD}` }}>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: GOLD }}>🏆 Competencias del atleta</p>
          <div className="mt-1 space-y-0.5">
            {d.competitions.map((c) => (
              <p key={c.id} className="text-[11.5px]" style={{ color: DIM }}>
                <b style={{ color: TXT }}>{c.name}</b> · {c.comp_date}
                {c.final_place ? <b style={{ color: GOLD }}> · {c.final_place}</b> : c.status === 'live' ? <b style={{ color: RED }}> · EN CURSO</b> : ` · ${c.status === 'finished' ? 'terminada' : 'programada'}`}
              </p>
            ))}
          </div>
        </div>
      )}

      {d.profile && (d.profile.palmares || d.profile.sponsors || d.profile.goals.short || d.profile.goals.long || d.profile.why_train) && (
        <div style={card}>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: CYAN }}>Carrera y metas</p>
          <div className="mt-1 space-y-1 text-[11.5px]" style={{ color: DIM }}>
            {d.profile.palmares && <p>🏅 <b style={{ color: TXT }}>Palmarés:</b> {d.profile.palmares}</p>}
            {d.profile.sponsors && <p>🤝 <b style={{ color: TXT }}>Sponsors:</b> {d.profile.sponsors}</p>}
            {d.profile.goals.short && <p>🎯 <b style={{ color: TXT }}>Corto plazo:</b> {d.profile.goals.short}</p>}
            {d.profile.goals.mid && <p>🎯 <b style={{ color: TXT }}>Mediano:</b> {d.profile.goals.mid}</p>}
            {d.profile.goals.long && <p>🎯 <b style={{ color: TXT }}>Largo:</b> {d.profile.goals.long}</p>}
            {d.profile.why_train && <p>🔥 <b style={{ color: TXT }}>Por qué entrena:</b> {d.profile.why_train}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
