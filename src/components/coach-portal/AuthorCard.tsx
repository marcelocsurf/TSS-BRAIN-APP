'use client';

import { useEffect, useState } from 'react';
import {
  coachListMyPrograms,
  coachCreateProgram,
  coachGetProgram,
  coachUpdateProgramMeta,
  coachSaveDay,
  coachDeleteDay,
  coachSaveItem,
  coachDeleteItem,
  coachListVideoLibrary,
  coachListBlockTemplates,
  coachInsertBlockTemplate,
  coachAssignProgram,
  getMyHPAthletes,
  type CoachProgramRow,
  type CoachProgramDetail,
} from '@/lib/actions/program-coach';
import { PenLine, ChevronLeft, X } from 'lucide-react';

// ─── Escalón 2: el coach AUTOR — su editor de programas, recortado a su equipo ───
//
// OJO CON EL FONDO: zona BAJA del Home del coach = fondo CLARO (#F2F6F8) —
// paleta clara (tarjeta blanca, acento dorado, texto navy), la misma de
// HPFollowCard y SeasonCoachCard. Autocontenida: null sin Escalón 2.
// El editor calca el del admin (micros → días → ítems con video), con los
// mismos guardarraíles server-side. Asignar = rotar el programa de un atleta
// que YA está a su cargo.

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
  cyan: '#0090B8',
  red: '#C0392B',
  green: '#1F9D6B',
};

const inp = 'w-full rounded-lg px-2.5 py-1.5 text-[12px]';
const inpStyle: React.CSSProperties = { background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, color: C.navy };

export function AuthorCard({ token }: { token: string }) {
  const [programs, setPrograms] = useState<CoachProgramRow[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = () => {
    coachListMyPrograms(token)
      .then((r) => { if (r.ok && r.data) setPrograms(r.data.programs); })
      .catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [token]);

  if (programs === null) return null; // sin Escalón 2 (o cargando): no aparece

  const create = async () => {
    setErr(null); setBusy(true);
    const r = await coachCreateProgram(token, newTitle);
    setBusy(false);
    if (!r.ok) { setErr(r.error || 'No se pudo crear.'); return; }
    setNewTitle(''); setCreating(false);
    load();
    if (r.id) setOpenId(r.id);
  };

  return (
    <>
      <div
        className="rounded-2xl p-4"
        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderLeft: `4px solid ${C.goldStrong}` }}
      >
        <p className="text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1.5" style={{ ...MONO, color: C.goldText }}>
          <PenLine size={11} /> Autor · Escalón 2 — tus programas
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: C.dim }}>
          Creás programas para TU equipo. El catálogo global sigue siendo del head coach.
        </p>

        <div className="mt-3 space-y-2">
          {programs.map((p) => (
            <button key={p.id} type="button" onClick={() => setOpenId(p.id)}
              className="w-full text-left rounded-xl p-3 flex items-center justify-between gap-2"
              style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: C.navy }}>
                  {p.title}
                  {!p.active && <span className="ml-2 text-[9px] font-bold uppercase" style={{ color: C.faint }}>inactivo</span>}
                </p>
                <p className="text-[10.5px] mt-0.5" style={{ color: C.dim }}>
                  {p.weeks} micro{p.weeks === 1 ? '' : 's'} · {p.days_count} día{p.days_count === 1 ? '' : 's'} · {p.active_assignments} atleta{p.active_assignments === 1 ? '' : 's'}
                </p>
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: C.goldStrong }}>Editar →</span>
            </button>
          ))}
          {programs.length === 0 && !creating && (
            <p className="text-[11px]" style={{ color: C.faint }}>Todavía no creaste ningún programa.</p>
          )}
        </div>

        {creating ? (
          <div className="mt-3 flex gap-2">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nombre (inglés — lo ve el atleta)" aria-label="Nombre del programa"
              className={inp} style={inpStyle} />
            <button type="button" disabled={busy || !newTitle.trim()} onClick={create}
              className="px-4 rounded-full text-[11px] font-bold shrink-0"
              style={{ background: C.cyan, color: '#fff', opacity: busy || !newTitle.trim() ? 0.5 : 1 }}>
              Crear
            </button>
            <button type="button" onClick={() => { setCreating(false); setErr(null); }} className="px-2 text-[11px]" style={{ color: C.faint }}>✕</button>
          </div>
        ) : (
          <button type="button" onClick={() => setCreating(true)} className="mt-3 text-[10px] font-bold" style={{ color: C.goldStrong }}>
            + Nuevo programa
          </button>
        )}
        {err && <p className="text-[11px] mt-1.5" style={{ color: C.red }}>{err}</p>}
      </div>

      {openId && (
        <ProgramEditorOverlay token={token} programId={openId}
          onClose={() => { setOpenId(null); load(); }} />
      )}
    </>
  );
}

// ─── Editor a pantalla completa (overlay claro, patrón del visor) ───

function ProgramEditorOverlay({ token, programId, onClose }: { token: string; programId: string; onClose: () => void }) {
  const [p, setP] = useState<CoachProgramDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [videos, setVideos] = useState<{ id: string; title: string; video_url: string }[]>([]);
  const [micro, setMicro] = useState(1);
  const [assigning, setAssigning] = useState(false);

  const load = () => {
    coachGetProgram(token, programId).then((r) => {
      if (r.ok && r.program) setP(r.program);
      else setErr(r.error || 'No se pudo cargar.');
    }).catch(() => {});
  };
  useEffect(() => {
    load();
    coachListVideoLibrary(token).then((r) => { if (r.ok) setVideos(r.videos); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const act = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErr(null);
    const r = await fn();
    if (!r.ok) { setErr(r.error || 'No se pudo guardar.'); return false; }
    load();
    return true;
  };

  if (!p) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: '#F2F6F8' }}>
        <p className="text-[12px]" style={{ color: C.dim }}>{err ?? 'Cargando…'}</p>
        <button type="button" onClick={onClose} className="absolute top-4 right-4" aria-label="Cerrar"><X size={20} color={C.dim} /></button>
      </div>
    );
  }

  const days = p.days.filter((d) => d.week_number === micro);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: '#F2F6F8', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: C.dim }}>
            <ChevronLeft size={14} /> Volver
          </button>
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: C.goldText }}>Editor · tuyo</span>
        </div>
        {err && <p className="text-[11px] rounded-lg px-3 py-2" style={{ background: '#FDF3F2', color: C.red, border: '1px solid #F5C6C0' }}>{err}</p>}

        <MetaEditor token={token} p={p} onSaved={load} setErr={setErr} />

        <div className="rounded-2xl p-3" style={{ background: C.cardBg, border: `1px solid ${C.rowBorder}` }}>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: p.weeks }, (_, i) => i + 1).map((w) => (
              <button key={w} type="button" onClick={() => setMicro(w)}
                className="px-3 py-1.5 rounded-full text-[10px] font-bold"
                style={micro === w
                  ? { background: C.goldStrong, color: '#fff' }
                  : { background: C.rowBg, color: C.dim, border: `1px solid ${C.rowBorder}` }}>
                M{w}
              </button>
            ))}
          </div>
          <MicroLabelInput token={token} p={p} micro={micro} onSaved={load} setErr={setErr} />

          <div className="mt-3 space-y-2">
            {days.map((d) => (
              <DayEditor key={d.id} token={token} programId={p.id} day={d} videos={videos} act={act} />
            ))}
            {days.length === 0 && <p className="text-[11px] text-center py-2" style={{ color: C.faint }}>Sin días en este micro.</p>}
            <NewDayForm token={token} programId={p.id} micro={micro} existing={days.map((d) => d.day_number)} act={act} />
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: C.goldText }}>
              Asignar a un atleta tuyo
            </p>
            <p className="text-[10px]" style={{ color: C.faint }}>{p.active_assignments} activo{p.active_assignments === 1 ? '' : 's'}</p>
          </div>
          {assigning ? (
            <AssignPicker token={token} programId={p.id} onDone={() => { setAssigning(false); load(); }} setErr={setErr} />
          ) : (
            <button type="button" onClick={() => setAssigning(true)} className="mt-2 text-[10px] font-bold" style={{ color: C.goldStrong }}>
              + Elegir atleta (rota su programa actual a este)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaEditor({ token, p, onSaved, setErr }: {
  token: string; p: CoachProgramDetail; onSaved: () => void; setErr: (e: string | null) => void;
}) {
  const [title, setTitle] = useState(p.title);
  const [subtitle, setSubtitle] = useState(p.subtitle ?? '');
  const [weeks, setWeeks] = useState(p.weeks);
  const [ck, setCk] = useState({
    checkin_water: p.checkin_water, checkin_sleep: p.checkin_sleep, checkin_energy: p.checkin_energy,
    checkin_comment: p.checkin_comment, checkin_nutrition: p.checkin_nutrition,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setErr(null); setSaving(true);
    const r = await coachUpdateProgramMeta(token, p.id, { title, subtitle: subtitle || null, weeks, ...ck });
    setSaving(false);
    if (!r.ok) { setErr(r.error || 'No se pudo guardar.'); return; }
    onSaved();
  };

  const Toggle = ({ k, label }: { k: keyof typeof ck; label: string }) => (
    <button type="button" onClick={() => setCk({ ...ck, [k]: !ck[k] })}
      className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
      style={ck[k] ? { background: C.cyan, color: '#fff' } : { background: '#EEF2F6', color: C.dim }}>
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl p-4 space-y-2" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderLeft: `4px solid ${C.goldStrong}` }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Nombre del programa"
        className="w-full rounded-lg px-2.5 py-2 text-[14px] font-bold" style={inpStyle} />
      <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo (inglés, opcional)"
        aria-label="Subtítulo" className={inp} style={inpStyle} />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px]" style={{ color: C.dim }}>Microciclos</span>
        <input type="number" min={1} max={24} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}
          aria-label="Microciclos" className="w-16 rounded-lg px-2 py-1 text-[12px]" style={inpStyle} />
        <span className="text-[10px]" style={{ color: C.faint }}>Check-in:</span>
        <Toggle k="checkin_water" label="Agua" />
        <Toggle k="checkin_sleep" label="Sueño" />
        <Toggle k="checkin_energy" label="Energía" />
        <Toggle k="checkin_comment" label="Comentario" />
        <Toggle k="checkin_nutrition" label="Dieta" />
      </div>
      <button type="button" disabled={saving || !title.trim()} onClick={save}
        className="rounded-full px-4 py-2 text-[11px] font-bold"
        style={{ background: C.navy, color: '#fff', opacity: saving || !title.trim() ? 0.5 : 1 }}>
        {saving ? 'Guardando…' : 'Guardar datos del programa'}
      </button>
    </div>
  );
}

function MicroLabelInput({ token, p, micro, onSaved, setErr }: {
  token: string; p: CoachProgramDetail; micro: number; onSaved: () => void; setErr: (e: string | null) => void;
}) {
  const wm = p.week_meta?.[String(micro)] ?? {};
  const [label, setLabel] = useState(p.week_labels[String(micro)] ?? '');
  const [type, setType] = useState(wm.type ?? '');
  const [intensity, setIntensity] = useState(wm.intensity ?? '');
  const [objective, setObjective] = useState(wm.objective ?? '');
  useEffect(() => {
    const w = p.week_meta?.[String(micro)] ?? {};
    setLabel(p.week_labels[String(micro)] ?? '');
    setType(w.type ?? ''); setIntensity(w.intensity ?? ''); setObjective(w.objective ?? '');
  }, [micro, p.week_labels, p.week_meta]);
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        <input value={label} onChange={(e) => setLabel(e.target.value)}
          placeholder={`Nombre del micro ${micro} (CARGA…)`} aria-label={`Nombre del microciclo ${micro}`}
          className={inp} style={inpStyle} />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label={`Tipo del micro ${micro}`}
          className="rounded-lg px-2 py-1.5 text-[11px]" style={{ ...inpStyle, width: 110, color: type ? C.navy : '#9ca3af' }}>
          <option value="">Tipo…</option>
          {['Load', 'Deload', 'Tapering', 'Competition', 'Recovery'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={intensity} onChange={(e) => setIntensity(e.target.value)} aria-label={`Intensidad del micro ${micro}`}
          className="rounded-lg px-2 py-1.5 text-[11px]" style={{ ...inpStyle, width: 100, color: intensity ? C.navy : '#9ca3af' }}>
          <option value="">Intens…</option>
          {['Low', 'Medium', 'High', 'Peak'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex gap-1.5">
        <input value={objective} onChange={(e) => setObjective(e.target.value)}
          placeholder="Objetivo del micro (inglés — lo ve el atleta)" aria-label={`Objetivo del microciclo ${micro}`}
          className={inp} style={inpStyle} />
        <button type="button"
          onClick={async () => {
            setErr(null);
            const labels = { ...p.week_labels };
            if (label.trim()) labels[String(micro)] = label.trim(); else delete labels[String(micro)];
            const week_meta = { ...(p.week_meta ?? {}) };
            week_meta[String(micro)] = {
              ...(week_meta[String(micro)] ?? {}),
              type: type || null, intensity: intensity || null, objective: objective.trim() || null,
            };
            const r = await coachUpdateProgramMeta(token, p.id, { week_labels: labels, week_meta });
            if (!r.ok) { setErr(r.error || 'No se pudo guardar.'); return; }
            onSaved();
          }}
          className="px-3 rounded-full text-[10px] font-bold shrink-0" style={{ background: C.rowBg, color: C.goldText, border: `1px solid ${C.rowBorder}` }}>
          Guardar
        </button>
      </div>
    </div>
  );
}

function NewDayForm({ token, programId, micro, existing, act }: {
  token: string; programId: string; micro: number; existing: number[];
  act: (fn: () => Promise<{ ok: boolean; error?: string }>) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [focus, setFocus] = useState('');
  const nextNum = existing.length ? Math.max(...existing) + 1 : 1;
  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="text-[10px] font-bold" style={{ color: C.goldStrong }}>+ Agregar día {nextNum}</button>;
  }
  return (
    <div className="rounded-xl p-2.5 space-y-2" style={{ background: '#FFFFFF', border: `1px dashed #CBD5E1` }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Día ${nextNum} — título (inglés)`}
        aria-label="Título del día" className={inp} style={inpStyle} />
      <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Enfoque (inglés, opcional)"
        aria-label="Enfoque del día" className={inp} style={inpStyle} />
      <div className="flex gap-2">
        <button type="button" disabled={!title.trim()}
          onClick={async () => {
            const ok = await act(() => coachSaveDay(token, programId, { week_number: micro, day_number: nextNum, title, focus: focus || null }));
            if (ok) { setTitle(''); setFocus(''); setOpen(false); }
          }}
          className="flex-1 rounded-full py-2 text-[11px] font-bold"
          style={{ background: C.cyan, color: '#fff', opacity: !title.trim() ? 0.5 : 1 }}>
          Guardar día
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 text-[11px]" style={{ color: C.faint }}>Cancelar</button>
      </div>
    </div>
  );
}

function DayEditor({ token, programId, day, videos, act }: {
  token: string; programId: string;
  day: CoachProgramDetail['days'][number];
  videos: { id: string; title: string; video_url: string }[];
  act: (fn: () => Promise<{ ok: boolean; error?: string }>) => Promise<boolean>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [it, setIt] = useState({ title: '', detail: '', video_url: '' });

  return (
    <div className="rounded-xl p-3" style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}` }}>
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full text-left flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-semibold" style={{ color: C.navy }}>
          D{day.day_number} · {day.title}
          <span className="font-normal" style={{ color: C.faint }}> · {day.items.length} ítem{day.items.length === 1 ? '' : 's'}</span>
        </p>
        <span className="text-[10px]" style={{ color: C.faint }}>{expanded ? '▴' : '▾'}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {day.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2 rounded-lg px-2.5 py-2" style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}` }}>
              <div className="min-w-0">
                <p className="text-[12px] font-medium" style={{ color: C.navy }}>{item.title}</p>
                {item.detail && <p className="text-[10.5px]" style={{ color: C.dim }}>{item.detail}</p>}
                {item.video_url && <p className="text-[10px] truncate" style={{ color: C.cyan }}>▶ video</p>}
              </div>
              <button type="button"
                onClick={() => { if (confirm(`¿Eliminar "${item.title}"?`)) act(() => coachDeleteItem(token, programId, item.id)); }}
                className="text-[10px] shrink-0" style={{ color: C.faint }}>✕</button>
            </div>
          ))}

          {addingItem ? (
            <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: '#FFFFFF', border: `1px dashed #CBD5E1` }}>
              <input value={it.title} onChange={(e) => setIt({ ...it, title: e.target.value })} placeholder="Ejercicio (inglés)"
                aria-label="Título del ítem" className={inp} style={inpStyle} />
              <input value={it.detail} onChange={(e) => setIt({ ...it, detail: e.target.value })} placeholder="Detalle — 3×12 / notas (inglés)"
                aria-label="Detalle del ítem" className={inp} style={inpStyle} />
              <select value={it.video_url} onChange={(e) => setIt({ ...it, video_url: e.target.value })}
                aria-label="Video de la biblioteca" className={inp} style={{ ...inpStyle, color: it.video_url ? C.navy : '#9ca3af' }}>
                <option value="">Sin video (o elegí de la biblioteca)</option>
                {videos.map((v) => <option key={v.id} value={v.video_url}>{v.title}</option>)}
              </select>
              <input value={it.video_url} onChange={(e) => setIt({ ...it, video_url: e.target.value })} placeholder="…o pegá un link de video"
                aria-label="Link de video" className={inp} style={inpStyle} />
              <div className="flex gap-2">
                <button type="button" disabled={!it.title.trim() || savingItem}
                  onClick={async () => {
                    setSavingItem(true);
                    const ok = await act(() => coachSaveItem(token, programId, day.id, {
                      title: it.title, detail: it.detail || null, video_url: it.video_url || null,
                      display_order: day.items.length + 1,
                    }));
                    setSavingItem(false);
                    if (ok) { setIt({ title: '', detail: '', video_url: '' }); setAddingItem(false); }
                  }}
                  className="flex-1 rounded-full py-2 text-[11px] font-bold"
                  style={{ background: C.cyan, color: '#fff', opacity: !it.title.trim() || savingItem ? 0.5 : 1 }}>
                  {savingItem ? 'Guardando…' : 'Guardar ítem'}
                </button>
                <button type="button" onClick={() => setAddingItem(false)} className="px-3 text-[11px]" style={{ color: C.faint }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button type="button" onClick={() => setAddingItem(true)} className="text-[10px] font-bold" style={{ color: C.goldStrong }}>+ Ítem</button>
              <CoachBlockPicker token={token} programId={programId} dayId={day.id} act={act} />
              <button type="button"
                onClick={() => { if (confirm(`¿Eliminar el día ${day.day_number} con sus ítems?`)) act(() => coachDeleteDay(token, programId, day.id)); }}
                className="text-[10px]" style={{ color: C.faint }}>Eliminar día</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AssignPicker({ token, programId, onDone, setErr }: {
  token: string; programId: string; onDone: () => void; setErr: (e: string | null) => void;
}) {
  const [athletes, setAthletes] = useState<{ student_id: string; student_name: string; program_title: string }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getMyHPAthletes(token)
      .then((r) => {
        if (r.ok && r.data) {
          setAthletes(r.data.athletes.map((a) => ({ student_id: a.student_id, student_name: a.student_name, program_title: a.program_title })));
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <div className="mt-2 space-y-1.5">
      {athletes.map((a) => (
        <button key={a.student_id} type="button" disabled={busy !== null}
          onClick={async () => {
            if (!confirm(`${a.student_name} está en "${a.program_title}" — ¿rotarlo a este programa? Su historial se conserva.`)) return;
            setErr(null); setBusy(a.student_id);
            const r = await coachAssignProgram(token, programId, a.student_id);
            setBusy(null);
            if (!r.ok) { setErr(r.error || 'No se pudo asignar.'); return; }
            onDone();
          }}
          className="w-full text-left rounded-lg px-3 py-2 flex items-center justify-between"
          style={{ background: C.rowBg, border: `1px solid ${C.rowBorder}`, opacity: busy && busy !== a.student_id ? 0.5 : 1 }}>
          <span className="text-[12px] font-medium" style={{ color: C.navy }}>{a.student_name}</span>
          <span className="text-[10px]" style={{ color: C.faint }}>{busy === a.student_id ? 'Asignando…' : `hoy: ${a.program_title}`}</span>
        </button>
      ))}
      {athletes.length === 0 && <p className="text-[11px]" style={{ color: C.faint }}>No tenés atletas a tu cargo todavía.</p>}
      <button type="button" onClick={onDone} className="text-[10px]" style={{ color: C.faint }}>Cerrar</button>
    </div>
  );
}

// ─── Insertar bloque (plantillas HP) en el día del coach E2 ───
function CoachBlockPicker({ token, programId, dayId, act }: {
  token: string; programId: string; dayId: string;
  act: (fn: () => Promise<{ ok: boolean; error?: string }>) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<{ id: string; title: string; belt: string | null; pillar: string | null; items_count: number }[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && templates.length === 0) {
      coachListBlockTemplates(token).then((r) => { if (r.ok) setTemplates(r.templates); }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[10px] font-bold" style={{ color: C.cyan }}>
        + Insertar bloque
      </button>
    );
  }
  const needle = q.trim().toLowerCase();
  const list = templates.filter((t) => !needle || t.title.toLowerCase().includes(needle) || (t.pillar ?? '').toLowerCase().includes(needle));
  return (
    <div className="w-full rounded-lg p-2 space-y-1.5" style={{ background: C.goldSoft, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar plantilla…" autoFocus
          aria-label="Buscar plantilla" className={inp} style={inpStyle} />
        <button type="button" onClick={() => setOpen(false)} className="text-[11px] px-1" style={{ color: C.faint }}>✕</button>
      </div>
      <div className="max-h-44 overflow-y-auto space-y-1">
        {list.slice(0, 25).map((t) => (
          <button key={t.id} type="button" disabled={busy}
            onClick={async () => {
              setBusy(true);
              const ok = await act(() => coachInsertBlockTemplate(token, programId, dayId, t.id));
              setBusy(false);
              if (ok) setOpen(false);
            }}
            className="w-full text-left rounded-lg px-2.5 py-1.5"
            style={{ background: '#FFFFFF', border: `1px solid ${C.rowBorder}`, opacity: busy ? 0.5 : 1 }}>
            <span className="text-[11.5px] font-medium" style={{ color: C.navy }}>{t.title}</span>
            <span className="text-[9.5px] ml-1.5" style={{ color: C.faint }}>{t.pillar ?? ''} · {t.items_count} ítem{t.items_count === 1 ? '' : 's'}</span>
          </button>
        ))}
        {list.length === 0 && <p className="text-[10.5px] text-center py-1.5" style={{ color: C.faint }}>{templates.length === 0 ? 'Cargando…' : 'Sin resultados.'}</p>}
      </div>
    </div>
  );
}
