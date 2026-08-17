'use client';

import { useEffect, useState } from 'react';
import {
  adminListPrograms,
  adminGetProgram,
  adminCreateProgram,
  adminUpdateProgram,
  adminSetProgramActive,
  adminDuplicateProgram,
  adminSaveDay,
  adminDeleteDay,
  adminSaveItem,
  adminDeleteItem,
  adminListVideoLibrary,
  adminSearchStudents,
  adminAssignProgram,
  adminListAssignments,
  adminCancelAssignment,
  adminListHPCoaches,
  adminSetCoachEscalon,
  adminSetAssignmentCoach,
  adminSetCoachSpecialty,
  adminCreateAppointment,
  adminListAppointments,
  adminSetAppointmentStatus,
  type AdminProgramRow,
  type AdminProgramDetail,
  type AdminAssignmentRow,
  type AdminAppointmentRow,
} from '@/lib/actions/program-admin';
import {
  ClipboardList,
  Copy,
  Plus,
  Trash2,
  ChevronLeft,
  Play,
  Users,
  Check,
  X,
} from 'lucide-react';

// ─── Programas · Alto Rendimiento — catálogo, editor y asignaciones ───
// Staff-facing: todo en español. Estructura del editor calcada de la app HP
// (semanas → días → ítems con video, check-in configurable) para que Marcelo
// no tenga que aprender una herramienta nueva.

type Video = { id: string; title: string; pillar: string | null; video_url: string };

export function ProgramasManager() {
  const [view, setView] = useState<'catalogo' | 'editor' | 'asignaciones' | 'coaches' | 'citas'>('catalogo');
  const [programs, setPrograms] = useState<AdminProgramRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const loadCatalog = () => {
    adminListPrograms().then((r) => {
      if (r.ok) setPrograms(r.programs);
      else setMsg(r.error || null);
    });
  };
  useEffect(() => {
    loadCatalog();
    adminListVideoLibrary().then((r) => r.ok && setVideos(r.videos));
  }, []);

  const openEditor = (id: string) => {
    setEditing(id);
    setView('editor');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Programas · Alto Rendimiento
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Mesociclo → microciclos → días → ítems con video. El alumno lo vive en su portal; acá se escribe.
          </p>
        </div>
        <div className="flex gap-2">
          {(['catalogo', 'asignaciones', 'citas', 'coaches'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setView(v); setEditing(null); if (v === 'catalogo') loadCatalog(); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                view === v ? 'bg-[var(--tss-navy)] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {v === 'catalogo' ? 'Catálogo' : v === 'asignaciones' ? 'Asignaciones' : v === 'citas' ? 'Citas' : 'Coaches'}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{msg}</p>
      )}

      {view === 'catalogo' && (
        <Catalogo programs={programs} onChanged={loadCatalog} onEdit={openEditor} setMsg={setMsg} />
      )}
      {view === 'editor' && editing && (
        <Editor
          programId={editing}
          videos={videos}
          onBack={() => { setView('catalogo'); setEditing(null); loadCatalog(); }}
        />
      )}
      {view === 'asignaciones' && <Asignaciones programs={programs} />}
      {view === 'coaches' && <CoachesHP />}
      {view === 'citas' && <Citas />}
    </div>
  );
}

// ─── Coaches · la escalera (E0 / E1) ───

function CoachesHP() {
  const [coaches, setCoaches] = useState<{ id: string; display_name: string; role: string; hp_escalon: number }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => adminListHPCoaches().then((r) => { if (r.ok) setCoaches(r.coaches); else setErr(r.error || null); });
  useEffect(() => { load(); }, []);

  const setEscalon = async (id: string, escalon: number) => {
    setErr(null);
    setBusy(id);
    const r = await adminSetCoachEscalon(id, escalon);
    setBusy(null);
    if (!r.ok) setErr(r.error || null);
    else load();
  };

  return (
    <div className="space-y-3">
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{err}</p>}
      <p className="text-[11px] text-gray-400">
        La escalera se otorga coach por coach, igual que los niveles L1–L5. <b>Escalón 1 · Seguimiento</b>: ve la
        adherencia y los check-ins de los atletas que le asignes — no crea ni edita programas. Los escalones 2 (autor
        de su equipo) y 3 (catálogo global, solo vos) llegan después.
      </p>
      {coaches.map((c) => (
        <div key={c.id} className="rounded-2xl bg-white border border-gray-200 p-3.5 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">{c.display_name}</p>
            <p className="text-[11px] text-gray-400">{c.role}</p>
          </div>
          <span
            className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full ${
              c.hp_escalon >= 1 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {c.hp_escalon >= 1 ? `ESCALÓN ${c.hp_escalon} · SEGUIMIENTO` : 'SIN ESCALÓN'}
          </span>
          <select
            value={(c as any).hp_specialty ?? ''}
            onChange={async (e) => {
              const v = (e.target.value || null) as 'mental' | 'fisico' | null;
              const r = await adminSetCoachSpecialty(c.id, v);
              if (!r.ok) setErr(r.error || null);
              else load();
            }}
            className="rounded-md border border-gray-200 px-1.5 py-1 text-[11px] text-gray-500"
            title="Especialidad (para citas y evaluaciones)"
          >
            <option value="">Coach</option>
            <option value="fisico">Especialista físico</option>
            <option value="mental">Especialista mental</option>
          </select>
          <button
            type="button"
            disabled={busy === c.id}
            onClick={() => setEscalon(c.id, c.hp_escalon >= 1 ? 0 : 1)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold disabled:opacity-40 ${
              c.hp_escalon >= 1 ? 'bg-gray-100 text-gray-600' : 'bg-[var(--tss-navy)] text-white'
            }`}
          >
            {c.hp_escalon >= 1 ? 'Quitar Escalón 1' : 'Otorgar Escalón 1'}
          </button>
        </div>
      ))}
      {coaches.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Sin coaches.</p>}
    </div>
  );
}

// ─── Catálogo ───

function Catalogo({
  programs,
  onChanged,
  onEdit,
  setMsg,
}: {
  programs: AdminProgramRow[];
  onChanged: () => void;
  onEdit: (id: string) => void;
  setMsg: (m: string | null) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newKind, setNewKind] = useState<'template' | 'custom'>('template');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    const r = await adminCreateProgram({ title: newTitle, kind: newKind });
    setBusy(false);
    if (!r.ok) { setMsg(r.error || null); return; }
    setCreating(false);
    setNewTitle('');
    if (r.id) onEdit(r.id);
  };

  return (
    <div className="space-y-3">
      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 py-3.5 text-sm font-semibold text-gray-500 hover:border-[var(--tss-navy)] hover:text-[var(--tss-navy)] flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Nuevo programa
        </button>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nombre del programa (de cara al alumno, en inglés)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2 flex-wrap">
            {(['template', 'custom'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setNewKind(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  newKind === k ? 'bg-[var(--tss-navy)] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {k === 'template' ? 'Plantilla — se asigna muchas veces' : 'A medida — para una persona o equipo'}
              </button>
            ))}
            <div className="flex-1" />
            <button type="button" onClick={() => setCreating(false)} className="text-xs text-gray-400">Cancelar</button>
            <button
              type="button"
              disabled={busy || !newTitle.trim()}
              onClick={create}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--tss-cyan)] text-[var(--tss-navy)] disabled:opacity-40"
            >
              Crear y abrir editor →
            </button>
          </div>
        </div>
      )}

      {programs.map((p) => (
        <div
          key={p.id}
          className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3 flex-wrap"
          style={{ borderLeft: '4px solid #B8862B', opacity: p.active ? 1 : 0.55 }}
        >
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-bold text-[var(--tss-navy)]">
              {p.title}
              {!p.active && <span className="ml-2 text-[10px] font-mono uppercase text-gray-400">inactivo</span>}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {p.kind === 'template' ? 'Plantilla' : 'A medida'} · {p.weeks} microciclo{p.weeks === 1 ? '' : 's'} · {p.days_count} día{p.days_count === 1 ? '' : 's'}
              {p.for_sale && ' · en venta'}
            </p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.active_assignments > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            <Users size={11} className="inline mr-1 -mt-0.5" />
            {p.active_assignments} activo{p.active_assignments === 1 ? '' : 's'}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(p.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--tss-navy)] text-white"
            >
              Editar
            </button>
            <button
              type="button"
              title="Duplicar"
              onClick={async () => {
                const r = await adminDuplicateProgram(p.id);
                if (!r.ok) setMsg(r.error || null);
                else onChanged();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600"
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              onClick={async () => {
                const r = await adminSetProgramActive(p.id, !p.active);
                if (!r.ok) setMsg(r.error || null);
                else { setMsg(null); onChanged(); }
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600"
            >
              {p.active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      ))}

      {programs.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Todavía no hay programas.</p>
      )}
    </div>
  );
}

// ─── Editor ───

function Editor({ programId, videos, onBack }: { programId: string; videos: Video[]; onBack: () => void }) {
  const [detail, setDetail] = useState<AdminProgramDetail | null>(null);
  const [week, setWeek] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(false);

  const load = () => {
    adminGetProgram(programId).then((r) => {
      if (r.ok && r.program) setDetail(r.program);
      else setErr(r.error || null);
    });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [programId]);

  // Si las semanas del programa bajan (guardado en MetaCard), la pestaña
  // seleccionada no puede quedar apuntando a una semana que ya no existe.
  useEffect(() => {
    if (detail && week > detail.weeks) setWeek(detail.weeks);
  }, [detail, week]);

  if (!detail) return <p className="text-sm text-gray-400 py-8 text-center">{err ?? 'Cargando…'}</p>;

  const flash = () => { setSavedTick(true); setTimeout(() => setSavedTick(false), 1800); };
  const weekDays = detail.days.filter((d) => d.week_number === week);
  const nextDayNumber = weekDays.length ? Math.max(...weekDays.map((d) => d.day_number)) + 1 : 1;

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--tss-navy)]">
        <ChevronLeft size={13} /> Volver al catálogo
      </button>

      {detail.active_assignments > 0 && (
        <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">
          ⚠ Este programa tiene {detail.active_assignments} alumno{detail.active_assignments === 1 ? '' : 's'} activo{detail.active_assignments === 1 ? '' : 's'} — los cambios les aplican de inmediato, y borrar días o ítems borra también sus marcas.
        </p>
      )}
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-red-50 border border-red-200 text-red-700">{err}</p>}

      <MetaCard detail={detail} onSaved={() => { load(); flash(); }} setErr={setErr} savedTick={savedTick} />

      {/* Semanas */}
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: detail.weeks }, (_, i) => i + 1).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeek(w)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold ${
              week === w ? 'bg-[var(--tss-navy)] text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            SEMANA {w}
          </button>
        ))}
      </div>

      <MicroLabel
        key={`ml-${week}-${detail.week_labels?.[String(week)] ?? ''}`}
        programId={programId}
        week={week}
        labels={detail.week_labels ?? {}}
        onSaved={() => { load(); flash(); }}
        setErr={setErr}
      />

      {weekDays.map((d) => (
        <DayEditor key={d.id} programId={programId} day={d} videos={videos} onChanged={() => { load(); flash(); }} setErr={setErr} />
      ))}

      <button
        type="button"
        onClick={async () => {
          setErr(null);
          const r = await adminSaveDay(programId, { week_number: week, day_number: nextDayNumber, title: `Day ${nextDayNumber}` });
          if (!r.ok) setErr(r.error || null);
          else load();
        }}
        className="w-full rounded-2xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500 hover:border-[var(--tss-navy)] hover:text-[var(--tss-navy)] flex items-center justify-center gap-2"
      >
        <Plus size={15} /> Agregar día al microciclo {week}
      </button>
    </div>
  );
}

function MetaCard({
  detail,
  onSaved,
  setErr,
  savedTick,
}: {
  detail: AdminProgramDetail;
  onSaved: () => void;
  setErr: (e: string | null) => void;
  savedTick: boolean;
}) {
  const [title, setTitle] = useState(detail.title);
  const [subtitle, setSubtitle] = useState(detail.subtitle ?? '');
  const [kind, setKind] = useState(detail.kind as 'custom' | 'template');
  const [weeks, setWeeks] = useState(detail.weeks);
  const [forSale, setForSale] = useState(detail.for_sale);
  const [ck, setCk] = useState({
    water: detail.checkin_water,
    sleep: detail.checkin_sleep,
    energy: detail.checkin_energy,
    comment: detail.checkin_comment,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setErr(null);
    setBusy(true);
    const r = await adminUpdateProgram(detail.id, {
      title,
      subtitle: subtitle.trim() || null,
      kind,
      weeks,
      for_sale: forSale,
      checkin_water: ck.water,
      checkin_sleep: ck.sleep,
      checkin_energy: ck.energy,
      checkin_comment: ck.comment,
    });
    setBusy(false);
    if (!r.ok) setErr(r.error || null);
    else onSaved();
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${value ? 'bg-[var(--tss-navy)] text-white' : 'bg-gray-100 text-gray-400'}`}
    >
      {value ? '✓ ' : ''}{label}
    </button>
  );

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Nombre (inglés, lo ve el alumno)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Subtítulo</label>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="4 weeks · dryland & paddle" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mt-1" />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs">
          <option value="template">Plantilla</option>
          <option value="custom">A medida</option>
        </select>
        <label className="text-xs text-gray-500 flex items-center gap-1.5">
          Microciclos
          <input
            type="number"
            min={1}
            max={24}
            value={weeks}
            onChange={(e) => setWeeks(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
            className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
          />
        </label>
        <Toggle label="En venta" value={forSale} onChange={setForSale} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 ml-2">Check-in pide:</span>
        <Toggle label="Agua" value={ck.water} onChange={(v) => setCk({ ...ck, water: v })} />
        <Toggle label="Sueño" value={ck.sleep} onChange={(v) => setCk({ ...ck, sleep: v })} />
        <Toggle label="Energía" value={ck.energy} onChange={(v) => setCk({ ...ck, energy: v })} />
        <Toggle label="Comentario" value={ck.comment} onChange={(v) => setCk({ ...ck, comment: v })} />
        <div className="flex-1" />
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-40"
        >
          {savedTick ? <span className="inline-flex items-center gap-1"><Check size={13} /> Guardado</span> : 'Guardar programa'}
        </button>
      </div>
    </div>
  );
}

function DayEditor({
  programId,
  day,
  videos,
  onChanged,
  setErr,
}: {
  programId: string;
  day: AdminProgramDetail['days'][number];
  videos: Video[];
  onChanged: () => void;
  setErr: (e: string | null) => void;
}) {
  const [title, setTitle] = useState(day.title);
  const [focus, setFocus] = useState(day.focus ?? '');
  const [dirty, setDirty] = useState(false);
  const [adding, setAdding] = useState(false);

  const saveDay = async () => {
    setErr(null);
    const r = await adminSaveDay(programId, {
      id: day.id,
      week_number: day.week_number,
      day_number: day.day_number,
      title,
      focus,
    });
    if (!r.ok) setErr(r.error || null);
    else { setDirty(false); onChanged(); }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3" style={{ borderLeft: '3px solid #00A8CC' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan)] font-bold shrink-0">
          Día {day.day_number}
        </span>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          placeholder="Título (inglés)"
          className="flex-1 min-w-[140px] rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm font-semibold"
        />
        <input
          value={focus}
          onChange={(e) => { setFocus(e.target.value); setDirty(true); }}
          placeholder="Foco del día (inglés)"
          className="flex-1 min-w-[140px] rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs"
        />
        {dirty && (
          <button type="button" onClick={saveDay} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--tss-cyan)] text-[var(--tss-navy)]">
            Guardar día
          </button>
        )}
        <button
          type="button"
          title="Eliminar día"
          onClick={async () => {
            if (!window.confirm(`¿Eliminar el Día ${day.day_number} y sus ${day.items.length} ítems? Se borran también las marcas de este día de TODOS los alumnos que lo hicieron — activos y pasados.`)) return;
            const r = await adminDeleteDay(day.id);
            if (!r.ok) setErr(r.error || null);
            else onChanged();
          }}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {day.items.map((it) => (
          <ItemRow key={it.id} dayId={day.id} item={it} videos={videos} onChanged={onChanged} setErr={setErr} />
        ))}
      </div>

      {adding ? (
        <ItemRow
          dayId={day.id}
          item={{ id: '', title: '', detail: null, video_url: null, display_order: (day.items.at(-1)?.display_order ?? 0) + 1 }}
          videos={videos}
          onChanged={() => { setAdding(false); onChanged(); }}
          setErr={setErr}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-xs font-semibold text-[var(--tss-cyan)] flex items-center gap-1">
          <Plus size={13} /> Agregar ítem
        </button>
      )}
    </div>
  );
}

function ItemRow({
  dayId,
  item,
  videos,
  onChanged,
  setErr,
  onCancel,
}: {
  dayId: string;
  item: { id: string; title: string; detail: string | null; video_url: string | null; display_order: number };
  videos: Video[];
  onChanged: () => void;
  setErr: (e: string | null) => void;
  onCancel?: () => void;
}) {
  const isNew = !item.id;
  const [title, setTitle] = useState(item.title);
  const [detail, setDetail] = useState(item.detail ?? '');
  const [videoUrl, setVideoUrl] = useState(item.video_url ?? '');
  const [dirty, setDirty] = useState(isNew);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setErr(null);
    setBusy(true);
    const r = await adminSaveItem(dayId, {
      id: item.id || undefined,
      title,
      detail,
      video_url: videoUrl,
      display_order: item.display_order,
    });
    setBusy(false);
    if (!r.ok) setErr(r.error || null);
    else { setDirty(false); onChanged(); }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {videoUrl ? <Play size={13} className="text-[var(--tss-cyan)] shrink-0" /> : <span className="w-[13px] shrink-0" />}
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          placeholder="Ejercicio (inglés) — p. ej. Goblet squat"
          className="flex-1 min-w-[150px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm"
        />
        <input
          value={detail}
          onChange={(e) => { setDetail(e.target.value); setDirty(true); }}
          placeholder="3×10 · 30s · follow along"
          className="w-40 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value=""
          onChange={(e) => {
            const v = videos.find((x) => x.id === e.target.value);
            if (v) { setVideoUrl(v.video_url); setDirty(true); }
          }}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-500 max-w-[240px]"
        >
          <option value="">🎥 Elegir de tu biblioteca ({videos.length})…</option>
          {videos.map((v) => (
            <option key={v.id} value={v.id}>{v.pillar ? `[${v.pillar}] ` : ''}{v.title}</option>
          ))}
        </select>
        <input
          value={videoUrl}
          onChange={(e) => { setVideoUrl(e.target.value); setDirty(true); }}
          placeholder="o pegá un link de YouTube"
          className="flex-1 min-w-[160px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-mono"
        />
        {dirty && (
          <button
            type="button"
            disabled={busy || !title.trim()}
            onClick={save}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--tss-cyan)] text-[var(--tss-navy)] disabled:opacity-40"
          >
            {isNew ? 'Agregar' : 'Guardar'}
          </button>
        )}
        {isNew && onCancel && (
          <button type="button" onClick={onCancel} className="p-1.5 text-gray-400"><X size={13} /></button>
        )}
        {!isNew && (
          <button
            type="button"
            title="Eliminar ítem"
            onClick={async () => {
              if (!window.confirm(`¿Eliminar «${item.title}»?`)) return;
              const r = await adminDeleteItem(item.id);
              if (!r.ok) setErr(r.error || null);
              else onChanged();
            }}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Asignaciones ───

function Asignaciones({ programs }: { programs: AdminProgramRow[] }) {
  const [rows, setRows] = useState<AdminAssignmentRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; email: string | null; belt_level: string | null }[]>([]);
  const [pickedStudent, setPickedStudent] = useState<{ id: string; name: string } | null>(null);
  const [programId, setProgramId] = useState('');
  const [coachId, setCoachId] = useState('');
  const [e1Coaches, setE1Coaches] = useState<{ id: string; display_name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => adminListAssignments().then((r) => { if (r.ok) setRows(r.assignments); else setErr(r.error || null); });
  useEffect(() => {
    load();
    adminListHPCoaches().then((r) => {
      if (r.ok) setE1Coaches(r.coaches.filter((c) => c.hp_escalon >= 1).map((c) => ({ id: c.id, display_name: c.display_name })));
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !pickedStudent) {
        adminSearchStudents(q).then((r) => {
          if (r.ok) setResults(r.students);
          else setErr(r.error || null); // el fallo silencioso parece "no hay resultados"
        });
      } else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, pickedStudent]);

  const assign = async () => {
    if (!pickedStudent || !programId) return;
    setErr(null);
    setBusy(true);
    const r = await adminAssignProgram(programId, pickedStudent.id, coachId || null);
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setPickedStudent(null);
    setQ('');
    setProgramId('');
    setCoachId('');
    load();
  };

  const activePrograms = programs.filter((p) => p.active);

  return (
    <div className="space-y-4">
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{err}</p>}

      {/* Asignar */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3" style={{ borderLeft: '4px solid #B8862B' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Asignar programa</p>
        <div className="flex gap-2 flex-wrap items-start">
          <div className="relative flex-1 min-w-[200px]">
            <input
              value={pickedStudent ? pickedStudent.name : q}
              onChange={(e) => { setPickedStudent(null); setQ(e.target.value); }}
              placeholder="Buscar alumno por nombre o email…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden">
                {results.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setPickedStudent({ id: s.id, name: s.name }); setResults([]); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <span className="font-semibold text-[var(--tss-navy)]">{s.name}</span>
                    <span className="text-[11px] text-gray-400 ml-2">{s.email ?? ''} {s.belt_level ? `· ${String(s.belt_level).replace('_', ' ')}` : ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm min-w-[180px]"
          >
            <option value="">Elegir programa…</option>
            {activePrograms.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm min-w-[160px]"
            title="Coach de seguimiento (Escalón 1)"
          >
            <option value="">Sin coach de seguimiento</option>
            {e1Coaches.map((c) => (
              <option key={c.id} value={c.id}>{c.display_name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !pickedStudent || !programId}
            onClick={assign}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-40"
          >
            Asignar →
          </button>
        </div>
        <p className="text-[11px] text-gray-400">
          El alumno ve la tarjeta en su Home al instante. Un alumno lleva un programa activo a la vez.
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {rows.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white border border-gray-200 p-3.5 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <p className="text-sm font-semibold text-[var(--tss-navy)]">{a.student_name}</p>
              <p className="text-[11px] text-gray-500">{a.program_title} · desde {a.start_date}</p>
              <select
                value={a.coach_id ?? ''}
                onChange={async (e) => {
                  const v = e.target.value || null;
                  const r = await adminSetAssignmentCoach(a.id, v);
                  if (!r.ok) setErr(r.error || null);
                  else load();
                }}
                className="mt-1 rounded-md border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-500 max-w-[200px]"
                title="Coach de seguimiento"
              >
                <option value="">Sin coach de seguimiento</option>
                {e1Coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.display_name}</option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--tss-navy)]">{a.days_done}/{a.days_total} días</p>
              <p className="text-[10px] text-gray-400">
                {a.last_checkin ? `último check-in ${a.last_checkin}` : 'sin check-ins aún'}
              </p>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--tss-cyan)]"
                style={{ width: `${a.days_total > 0 ? Math.round((a.days_done / a.days_total) * 100) : 0}%` }}
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`¿Cancelar el programa de ${a.student_name}? La tarjeta desaparece de su portal. Sus marcas quedan guardadas mientras no borres esos días del programa.`)) return;
                const r = await adminCancelAssignment(a.id);
                if (!r.ok) setErr(r.error || null);
                else load();
              }}
              className="text-[11px] text-gray-400 hover:text-red-500"
            >
              Cancelar
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No hay asignaciones activas.</p>}
      </div>
    </div>
  );
}

// ─── Citas · atleta ↔ coach o especialista ───

const KIND_OPTS = [
  { key: 'fisico', label: 'Físico' },
  { key: 'mental', label: 'Mental' },
  { key: 'tecnico', label: 'Técnico' },
  { key: 'otro', label: 'Otro' },
] as const;

function Citas() {
  const [rows, setRows] = useState<AdminAppointmentRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<{ id: string; display_name: string; hp_specialty: string | null }[]>([]);
  // formulario
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; email: string | null }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [coachId, setCoachId] = useState('');
  const [kind, setKind] = useState<'fisico' | 'mental' | 'tecnico' | 'otro'>('fisico');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => adminListAppointments().then((r) => { if (r.ok) setRows(r.appointments); else setErr(r.error || null); });
  useEffect(() => {
    load();
    adminListHPCoaches().then((r) => {
      if (r.ok) setCoaches(r.coaches.filter((c) => c.hp_escalon >= 1).map((c) => ({ id: c.id, display_name: c.display_name, hp_specialty: c.hp_specialty })));
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) {
        adminSearchStudents(q).then((r) => {
          if (r.ok) setResults(r.students);
          else setErr(r.error || null);
        });
      } else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const create = async () => {
    if (!picked || !coachId || !date) return;
    setErr(null);
    setBusy(true);
    const r = await adminCreateAppointment({
      studentId: picked.id,
      coachId,
      kind,
      date,
      time: time || null,
      title: title.trim() || null,
    });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setPicked(null); setQ(''); setDate(''); setTime(''); setTitle('');
    load();
  };

  const KIND_LABEL: Record<string, string> = { fisico: 'Físico', mental: 'Mental', tecnico: 'Técnico', otro: 'Otro' };

  return (
    <div className="space-y-4">
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{err}</p>}

      <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3" style={{ borderLeft: '4px solid #B8862B' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Nueva cita</p>
        <div className="flex gap-2 flex-wrap items-start">
          <div className="relative flex-1 min-w-[180px]">
            <input
              value={picked ? picked.name : q}
              onChange={(e) => { setPicked(null); setQ(e.target.value); }}
              placeholder="Alumno…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden">
                {results.map((s) => (
                  <button key={s.id} type="button" onClick={() => { setPicked({ id: s.id, name: s.name }); setResults([]); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                    <span className="font-semibold text-[var(--tss-navy)]">{s.name}</span>
                    <span className="text-[11px] text-gray-400 ml-2">{s.email ?? ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select value={coachId} onChange={(e) => setCoachId(e.target.value)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm min-w-[170px]">
            <option value="">Quién atiende…</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name}{c.hp_specialty ? ` (${c.hp_specialty})` : ''}
              </option>
            ))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value as any)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm">
            {KIND_OPTS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm" aria-label="Fecha" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm" aria-label="Hora" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional, lo ve el alumno — inglés)" className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-2.5 py-2 text-sm" />
          <button type="button" disabled={busy || !picked || !coachId || !date} onClick={create}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-40">
            Crear cita →
          </button>
        </div>
        <p className="text-[11px] text-gray-400">
          La cita aparece al instante en el Home del alumno (en inglés) y en el portal de quien atiende.
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white border border-gray-200 p-3.5 flex items-center gap-3 flex-wrap"
            style={{ opacity: a.status === 'done' ? 0.55 : 1 }}>
            <div className="flex-1 min-w-[180px]">
              <p className="text-sm font-semibold text-[var(--tss-navy)]">
                {a.student_name} <span className="text-gray-300">→</span> {a.coach_name}
              </p>
              <p className="text-[11px] text-gray-500">
                {a.title || KIND_LABEL[a.kind] || a.kind} · {a.appointment_date}{a.appointment_time ? ` · ${a.appointment_time}` : ''}
                {a.status === 'done' && ' · ✓ hecha'}
              </p>
            </div>
            {a.status === 'scheduled' && (
              <>
                <button type="button" onClick={async () => { const r = await adminSetAppointmentStatus(a.id, 'done'); if (!r.ok) setErr(r.error || null); else load(); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                  ✓ Hecha
                </button>
                <button type="button" onClick={async () => { const r = await adminSetAppointmentStatus(a.id, 'cancelled'); if (!r.ok) setErr(r.error || null); else load(); }}
                  className="text-[11px] text-gray-400 hover:text-red-500">
                  Cancelar
                </button>
              </>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Sin citas.</p>}
      </div>
    </div>
  );
}


// ─── Nombre del microciclo (Carga, Descarga, Tapering…) ───

function MicroLabel({
  programId,
  week,
  labels,
  onSaved,
  setErr,
}: {
  programId: string;
  week: number;
  labels: Record<string, string>;
  onSaved: () => void;
  setErr: (e: string | null) => void;
}) {
  const [value, setValue] = useState(labels[String(week)] ?? '');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setErr(null);
    setBusy(true);
    const next = { ...labels };
    if (value.trim()) next[String(week)] = value.trim();
    else delete next[String(week)];
    const r = await adminUpdateProgram(programId, { week_labels: next });
    setBusy(false);
    if (!r.ok) setErr(r.error || null);
    else { setDirty(false); onSaved(); }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 shrink-0">
        Nombre del microciclo {week}
      </span>
      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); setDirty(true); }}
        placeholder="Carga · Descarga · Tapering… (opcional, lo ve el alumno)"
        className="flex-1 min-w-[160px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs"
      />
      {dirty && (
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--tss-cyan)] text-[var(--tss-navy)] disabled:opacity-40"
        >
          Guardar
        </button>
      )}
    </div>
  );
}
