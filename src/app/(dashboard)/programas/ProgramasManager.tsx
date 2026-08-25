'use client';

import { useEffect, useState } from 'react';
import {
  adminListBlockTemplates, adminInsertBlockTemplate, type BlockTemplateRow, type WeekMeta,
} from '@/lib/actions/program-admin';
import { hpLibrary, type HPLibrary } from '@/lib/actions/hp-cockpit';
import { BELT_HIERARCHY, getBeltLabel } from '@/lib/constants/belts';
import {
  adminListCompetitions, adminCreateCompetition, adminGetCompetition, adminUpdateCompetition,
  adminDeleteCompetition, adminAddHeat, adminDeleteHeat, adminAddWave, adminDeleteWave,
  adminUpdateHeatOutcome, adminGetWeeklyRanking,
  type AdminCompetitionRow, type AdminCompetitionDetail,
} from '@/lib/actions/competitions';
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
  adminListSeasons,
  adminGetSeason,
  adminCreateSeason,
  adminUpdateSeason,
  adminSaveSeasonPhase,
  adminDeleteSeasonPhase,
  adminSaveSeasonEvent,
  adminDeleteSeasonEvent,
  adminSetSeasonSpecialist,
  type AdminSeasonRow,
  type AdminSeasonDetail,
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

export function ProgramasManager({ initialProgramId }: { initialProgramId?: string | null } = {}) {
  // Deep-link del cockpit: arranca directo en el editor del programa pedido.
  const [view, setView] = useState<'catalogo' | 'editor' | 'asignaciones' | 'coaches' | 'citas' | 'temporadas' | 'competencias'>(initialProgramId ? 'editor' : 'catalogo');
  const [programs, setPrograms] = useState<AdminProgramRow[]>([]);
  const [editing, setEditing] = useState<string | null>(initialProgramId ?? null);
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
          {(['catalogo', 'temporadas', 'competencias', 'asignaciones', 'citas', 'coaches'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setView(v); setEditing(null); if (v === 'catalogo') loadCatalog(); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                view === v ? 'bg-[var(--tss-navy)] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {v === 'catalogo' ? 'Catálogo' : v === 'temporadas' ? 'Temporadas' : v === 'competencias' ? 'Competencias' : v === 'asignaciones' ? 'Asignaciones' : v === 'citas' ? 'Citas' : 'Coaches'}
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
      {view === 'temporadas' && <Temporadas />}
      {view === 'competencias' && <Competencias />}
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
  const [newWeeks, setNewWeeks] = useState(4);
  const [newBelt, setNewBelt] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    const r = await adminCreateProgram({ title: newTitle, kind: newKind, weeks: newWeeks, targetBelt: newBelt || null });
    setBusy(false);
    if (!r.ok) { setMsg(r.error || null); return; }
    setCreating(false);
    setNewTitle(''); setNewWeeks(4); setNewBelt('');
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
          {/* Semanas y cinta objetivo: antes las semanas se fijaban en 4 sin
              preguntar y la cinta no tenía dónde guardarse (las 199 plantillas
              HP sí la traen). Pedido de Marcelo 2026-08-25. */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-[11px] text-gray-500">
              Microciclos
              <input type="number" min={1} max={24} value={newWeeks}
                onChange={(e) => setNewWeeks(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                className="ml-1.5 w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm" />
            </label>
            <label className="text-[11px] text-gray-500">
              Cinta objetivo
              <select value={newBelt} onChange={(e) => setNewBelt(e.target.value)}
                className="ml-1.5 rounded-lg border border-gray-300 px-2 py-1 text-xs">
                <option value="">— cualquiera —</option>
                {BELT_PERMISSIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </label>
          </div>
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

      <MatrizPeriodizacion
        key={`mx-${programId}`}
        programId={programId}
        weeks={detail.weeks}
        meta={detail.week_meta ?? {}}
        labels={detail.week_labels ?? {}}
        onSaved={() => { load(); flash(); }}
        onJump={(w) => setWeek(w)}
        setErr={setErr}
      />

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

// ─── MATRIZ de periodización (calca la matriz de la app HP) ───
// Columnas = microciclos; filas = fase macro, mesociclo, tipo, intensidad,
// objetivo y % + objetivo por pilar. Todo vive en programs.week_meta (jsonb).
const MX_PHASES = [
  { key: '', label: '—' },
  { key: 'general', label: 'Prep. General' },
  { key: 'especifica', label: 'Prep. Específica' },
  { key: 'competitiva', label: 'Competitiva' },
  { key: 'transicion', label: 'Transición' },
];
const MX_TYPES = ['', 'Load', 'Deload', 'Tapering', 'Competition', 'Recovery'];
const MX_INTENSITIES = ['', 'Low', 'Medium', 'High', 'Peak'];
const MX_PILLARS: { key: string; label: string; color: string }[] = [
  { key: 'fisico', label: 'Físico', color: '#E07A2F' },
  { key: 'tecnico', label: 'Técnico', color: '#0090B8' },
  { key: 'tactico', label: 'Táctico', color: '#1F9D6B' },
  { key: 'mental', label: 'Mental', color: '#8B5CF6' },
  { key: 'equipment', label: 'Equipment', color: '#B8862B' },
  { key: 'surf', label: 'Surf sessions', color: '#00A8CC' },
];

function MatrizPeriodizacion({ programId, weeks, meta, labels, onSaved, onJump, setErr }: {
  programId: string;
  weeks: number;
  meta: Record<string, WeekMeta>;
  labels: Record<string, string>;
  onSaved: () => void;
  onJump: (w: number) => void;
  setErr: (e: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mx, setMx] = useState<Record<string, WeekMeta>>(() => JSON.parse(JSON.stringify(meta ?? {})));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Re-sincronizar desde el server SOLO si no hay ediciones sin guardar —
  // cambiar los microciclos en MetaCard ya no destruye lo escrito acá.
  useEffect(() => {
    if (!dirty) setMx(JSON.parse(JSON.stringify(meta ?? {})));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  const upd = (w: number, patch: Partial<WeekMeta>) => {
    setMx((m) => ({ ...m, [String(w)]: { ...(m[String(w)] ?? {}), ...patch } }));
    setDirty(true);
  };
  const updPillar = (w: number, pillar: string, patch: { pct?: number | null; obj?: string | null }) => {
    setMx((m) => {
      const wm = m[String(w)] ?? {};
      const pillars = { ...(wm.pillars ?? {}) };
      pillars[pillar] = { ...(pillars[pillar] ?? {}), ...patch };
      return { ...m, [String(w)]: { ...wm, pillars } };
    });
    setDirty(true);
  };
  const totalOf = (w: number) =>
    MX_PILLARS.reduce((sum, p) => sum + (Number(mx[String(w)]?.pillars?.[p.key]?.pct) || 0), 0);

  const save = async () => {
    setErr(null); setSaving(true);
    const r = await adminUpdateProgram(programId, { week_meta: mx });
    setSaving(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setDirty(false);
    onSaved();
  };

  const selCls = 'w-full rounded-md border border-gray-200 px-1.5 py-1 text-[11px] bg-white';
  const inpCls = 'w-full rounded-md border border-gray-200 px-1.5 py-1 text-[11px] bg-white';
  const cellW = { minWidth: 148 } as React.CSSProperties;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden" style={{ borderLeft: '4px solid #B8862B' }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: '#8E6614' }}>
          📊 Matriz de periodización · {weeks} microciclo{weeks === 1 ? '' : 's'}
        </p>
        <span className="text-xs text-gray-400">{open ? '▴ cerrar' : '▾ abrir'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="border-collapse" style={{ minWidth: weeks * 148 + 130 }}>
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white text-left text-[9px] font-mono uppercase tracking-wider text-gray-400 px-2 py-2" style={{ minWidth: 130 }}>Semana</th>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                    <th key={w} className="text-center px-2 py-2" style={cellW}>
                      <span className="text-[11px] font-mono font-bold" style={{ color: '#8B5CF6' }}>M{String(w).padStart(2, '0')}</span>
                      {labels[String(w)] && <span className="block text-[9px] text-gray-400">{labels[String(w)]}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="sticky left-0 bg-white text-[9px] font-mono uppercase text-gray-500 px-2 py-1.5">Fase macro</td>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                    <td key={w} className="px-1.5 py-1.5" style={cellW}>
                      <select value={mx[String(w)]?.phase ?? ''} onChange={(e) => upd(w, { phase: e.target.value || null })}
                        className={selCls} aria-label={`Fase del micro ${w}`}>
                        {MX_PHASES.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="sticky left-0 bg-white text-[9px] font-mono uppercase text-gray-500 px-2 py-1.5">Mesociclo</td>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                    <td key={w} className="px-1.5 py-1.5" style={cellW}>
                      <input value={mx[String(w)]?.mesocycle ?? ''} onChange={(e) => upd(w, { mesocycle: e.target.value || null })}
                        placeholder="Base 1…" className={inpCls} aria-label={`Mesociclo del micro ${w}`} />
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="sticky left-0 bg-white text-[9px] font-mono uppercase text-gray-500 px-2 py-1.5">Tipo de micro</td>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                    <td key={w} className="px-1.5 py-1.5" style={cellW}>
                      <select value={mx[String(w)]?.type ?? ''} onChange={(e) => upd(w, { type: e.target.value || null })}
                        className={selCls} aria-label={`Tipo del micro ${w}`}>
                        {MX_TYPES.map((t) => <option key={t} value={t}>{t || '—'}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="sticky left-0 bg-white text-[9px] font-mono uppercase text-gray-500 px-2 py-1.5">Intensidad</td>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                    <td key={w} className="px-1.5 py-1.5" style={cellW}>
                      <select value={mx[String(w)]?.intensity ?? ''} onChange={(e) => upd(w, { intensity: e.target.value || null })}
                        className={selCls} aria-label={`Intensidad del micro ${w}`}>
                        {MX_INTENSITIES.map((t) => <option key={t} value={t}>{t || '—'}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="sticky left-0 bg-white text-[9px] font-mono uppercase text-gray-500 px-2 py-1.5">Objetivo (inglés)</td>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                    <td key={w} className="px-1.5 py-1.5" style={cellW}>
                      <input value={mx[String(w)]?.objective ?? ''} onChange={(e) => upd(w, { objective: e.target.value || null })}
                        placeholder="Build paddle base…" className={inpCls} aria-label={`Objetivo del micro ${w}`} />
                    </td>
                  ))}
                </tr>
                {MX_PILLARS.map((pl) => (
                  <tr key={pl.key} className="border-t border-gray-100">
                    <td className="sticky left-0 bg-white text-[9px] font-mono uppercase px-2 py-1.5" style={{ color: pl.color, borderLeft: `3px solid ${pl.color}` }}>{pl.label}</td>
                    {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                      <td key={w} className="px-1.5 py-1.5" style={cellW}>
                        <div className="flex items-center gap-1">
                          <input type="number" min={0} max={100}
                            value={mx[String(w)]?.pillars?.[pl.key]?.pct ?? ''}
                            onChange={(e) => updPillar(w, pl.key, { pct: e.target.value === '' ? null : Math.max(0, Math.min(100, Number(e.target.value))) })}
                            className="w-14 rounded-md border border-gray-200 px-1.5 py-1 text-[11px] bg-white" aria-label={`% ${pl.label} micro ${w}`} />
                          <span className="text-[10px]" style={{ color: pl.color }}>%</span>
                        </div>
                        <input value={mx[String(w)]?.pillars?.[pl.key]?.obj ?? ''}
                          onChange={(e) => updPillar(w, pl.key, { obj: e.target.value || null })}
                          placeholder="Objetivo del pilar" className="mt-1 w-full rounded-md border border-gray-100 px-1.5 py-0.5 text-[10px] bg-gray-50" aria-label={`Objetivo ${pl.label} micro ${w}`} />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200">
                  <td className="sticky left-0 bg-white text-[9px] font-mono uppercase font-bold text-gray-600 px-2 py-2">Total %</td>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => {
                    const t = totalOf(w);
                    return (
                      <td key={w} className="text-center px-1.5 py-2" style={cellW}>
                        <span className="text-[12px] font-bold" style={{ color: t === 100 ? '#1F9D6B' : t > 100 ? '#C0392B' : '#55707F' }}>{t}%</span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="sticky left-0 bg-white text-[9px] font-mono uppercase text-gray-500 px-2 py-2">Detalle semanal</td>
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                    <td key={w} className="text-center px-1.5 py-2" style={cellW}>
                      <button type="button"
                        onClick={() => { onJump(w); setOpen(false); }}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold w-full"
                        style={{ background: '#E0F7FF', color: '#0369A1' }}>
                        📅 Editar días →
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[10px] text-gray-400">El atleta ve tipo, intensidad y objetivo de su micro en el visor. El % por pilar es tu brújula de planificación.</p>
            <button type="button" disabled={!dirty || saving} onClick={save}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-40 shrink-0">
              {saving ? 'Guardando…' : dirty ? 'Guardar matriz' : 'Sin cambios'}
            </button>
          </div>
        </div>
      )}
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
    nutrition: (detail as any).checkin_nutrition ?? false,
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
      checkin_nutrition: ck.nutrition,
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
        <Toggle label="Dieta" value={ck.nutrition} onChange={(v) => setCk({ ...ck, nutrition: v })} />
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

      {adding && (
        <ItemRow
          dayId={day.id}
          item={{ id: '', title: '', detail: null, video_url: null, display_order: (day.items.at(-1)?.display_order ?? 0) + 1 }}
          videos={videos}
          onChanged={() => { setAdding(false); onChanged(); }}
          setErr={setErr}
          onCancel={() => setAdding(false)}
        />
      )}
      <div className="flex items-center gap-3 flex-wrap">
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="text-xs font-semibold text-[var(--tss-cyan)] flex items-center gap-1">
            <Plus size={13} /> Agregar ítem
          </button>
        )}
        <LibraryPicker dayId={day.id} nextOrder={(day.items.at(-1)?.display_order ?? 0) + 1} onInserted={onChanged} setErr={setErr} />
      </div>
    </div>
  );
}

// ─── Biblioteca en el editor: plantillas HP + drills + misiones, directo al día ───
// Lo mismo que ofrecía la app HP al armar un programa: elegís de la biblioteca
// y cae como ítem(s) del día. Drills y misiones se convierten en UN ítem
// (título + detalle compuesto); las plantillas insertan su bloque completo.
function LibraryPicker({ dayId, nextOrder, onInserted, setErr }: {
  dayId: string; nextOrder: number; onInserted: () => void; setErr: (e: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  // 'secuencia' agregada (pedido Marcelo 2026-08-25): hpLibrary YA descargaba
  // las 439 secuencias — el picker simplemente nunca las dibujaba.
  const [cat, setCat] = useState<'plantillas' | 'secuencia' | 'drills' | 'misiones'>('plantillas');
  const [templates, setTemplates] = useState<BlockTemplateRow[]>([]);
  const [lib, setLib] = useState<HPLibrary | null>(null);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (templates.length === 0) {
      adminListBlockTemplates().then((r) => { if (r.ok) setTemplates(r.templates); else setErr(r.error || null); });
    }
    if (!lib) {
      hpLibrary().then((r) => { if (r.ok && r.data) setLib(r.data); else setErr(r.error || null); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#8E6614' }}>
        <Plus size={13} /> Insertar de la Biblioteca (plantillas · drills · misiones)
      </button>
    );
  }

  const needle = q.trim().toLowerCase();
  const hit = (...vals: (string | null | undefined)[]) =>
    !needle || vals.some((v) => (v ?? '').toLowerCase().includes(needle));

  // El ítem ahora guarda de dónde salió (paso, drill/misión, pilar) en vez de
  // perderlo: antes el ítem quedaba huérfano de la biblioteca canónica.
  const insertItem = async (
    title: string,
    detail: string | null,
    meta?: { step_id?: string | null; drill_id?: string | null; pillar?: string | null; duration_minutes?: number | null },
  ) => {
    setErr(null); setBusy(true);
    const r = await adminSaveItem(dayId, {
      title, detail, video_url: null, display_order: nextOrder,
      step_id: meta?.step_id ?? null,
      drill_id: meta?.drill_id ?? null,
      pillar: meta?.pillar ?? null,
      duration_minutes: meta?.duration_minutes ?? null,
    });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setOpen(false); onInserted();
  };

  // "45 min" / "10-15 min" / "1 h" → minutos. EXIGE la unidad: sin ella,
  // "1 session" o "3 sets" se convertían en 1 y 3 minutos (revisión).
  const parseMinutes = (t?: string | null): number | null => {
    if (!t) return null;
    const h = t.match(/(\d+(?:[.,]\d+)?)\s*(?:h\b|hs\b|hora)/i);
    if (h) return Math.round(parseFloat(h[1].replace(',', '.')) * 60);
    const m = t.match(/(\d+)\s*(?:m\b|min|minuto)/i);
    if (m) {
      const n = Number(m[1]);
      return n > 0 && n <= 600 ? n : null;
    }
    return null;
  };

  const counts = {
    plantillas: templates.length,
    secuencia: lib?.sequences.length ?? 0,
    drills: lib?.drills.length ?? 0,
    misiones: lib?.missions.length ?? 0,
  };

  return (
    <div className="w-full rounded-xl p-2.5 space-y-1.5" style={{ background: '#FDF8EC', border: '1px solid #F0C36D' }}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['plantillas', 'secuencia', 'drills', 'misiones'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setCat(k)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize"
            style={cat === k ? { background: '#B8862B', color: '#fff' } : { background: '#fff', color: '#8E6614', border: '1px solid #F0C36D' }}>
            {k} {counts[k] || ''}
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar… (o STP-035)" autoFocus
          className="flex-1 min-w-[140px] rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs bg-white" aria-label="Buscar en la biblioteca" />
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-400 px-1">✕</button>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-1">
        {cat === 'plantillas' && templates
          .filter((t) => hit(t.title, t.pillar))
          .slice(0, 30)
          .map((t) => (
            <button key={t.id} type="button" disabled={busy}
              onClick={async () => {
                setErr(null); setBusy(true);
                const r = await adminInsertBlockTemplate(dayId, t.id);
                setBusy(false);
                if (!r.ok) { setErr(r.error || null); return; }
                setOpen(false); onInserted();
              }}
              className="w-full text-left rounded-lg px-2.5 py-1.5 bg-white border border-gray-200 hover:border-[#B8862B] disabled:opacity-50">
              <span className="text-[12px] font-medium text-[var(--tss-navy)]">{t.title}</span>
              <span className="text-[10px] text-gray-400 ml-2">{t.pillar ?? ''}{t.belt && t.belt !== 'all' ? ` · ${t.belt}` : ''} · {t.items_count} ítem{t.items_count === 1 ? '' : 's'}</span>
            </button>
          ))}

        {/* SECUENCIA — el método por pasos, buscable por STP y por cinta. */}
        {cat === 'secuencia' && (lib?.sequences ?? [])
          .filter((s) => hit(s.sequence_part, s.expectation_standard, s.belt_level, s.id))
          .slice(0, 40)
          .map((s) => (
            <button key={s.id} type="button" disabled={busy}
              onClick={() => insertItem(
                s.sequence_part || 'Paso de la secuencia',
                s.expectation_standard || null,
                { pillar: 'tecnico' },
              )}
              className="w-full text-left rounded-lg px-2.5 py-1.5 bg-white border border-gray-200 hover:border-[#B8862B] disabled:opacity-50">
              <span className="text-[12px] font-medium text-[var(--tss-navy)]">{s.sequence_part || '—'}</span>
              <span className="text-[10px] text-gray-400 ml-2 uppercase">{s.belt_level ?? ''}{s.step_order != null ? ` · paso ${s.step_order}` : ''}</span>
              {s.expectation_standard && <span className="block text-[10px] text-gray-400 truncate">{s.expectation_standard}</span>}
            </button>
          ))}

        {cat === 'drills' && (lib?.drills ?? [])
          .filter((d) => hit(d.drill_name, d.goal, d.key_cue, d.related_pilar, d.id))
          .slice(0, 30)
          .map((d) => (
            <button key={d.id} type="button" disabled={busy}
              onClick={() => insertItem(
                d.drill_name,
                [d.goal, d.key_cue ? `Cue: ${d.key_cue}` : null].filter(Boolean).join(String.fromCharCode(10)) || null,
                { drill_id: d.id, pillar: PILLAR_MAP[(d.related_pilar ?? '').toLowerCase()] ?? null },
              )}
              className="w-full text-left rounded-lg px-2.5 py-1.5 bg-white border border-gray-200 hover:border-[#B8862B] disabled:opacity-50">
              <span className="text-[12px] font-medium text-[var(--tss-navy)]">{d.drill_name}</span>
              <span className="text-[10px] text-gray-400 ml-2 uppercase">{d.related_pilar ?? ''}{d.environment ? ` · ${d.environment}` : ''}</span>
              {d.goal && <span className="block text-[10px] text-gray-400 truncate">{d.goal}</span>}
            </button>
          ))}

        {/* MISIONES — las únicas que traen el paso (step_id) del método. */}
        {cat === 'misiones' && (lib?.missions ?? [])
          .filter((m) => hit(m.title, m.success_criteria, m.belt, (m as any).step_id, m.id))
          .slice(0, 30)
          .map((m) => (
            <button key={m.id} type="button" disabled={busy}
              onClick={() => insertItem(
                m.title,
                [m.description_md, m.success_criteria ? `Success: ${m.success_criteria}` : null]
                  .filter(Boolean).join(String.fromCharCode(10, 10)) || null,
                { drill_id: m.id, step_id: (m as any).step_id ?? null, duration_minutes: parseMinutes(m.time_estimate) },
              )}
              className="w-full text-left rounded-lg px-2.5 py-1.5 bg-white border border-gray-200 hover:border-[#B8862B] disabled:opacity-50">
              <span className="text-[12px] font-medium text-[var(--tss-navy)]">{m.title}</span>
              <span className="text-[10px] text-gray-400 ml-2 uppercase">
                {(m as any).step_id ? <b style={{ color: '#8E6614' }}>{(m as any).step_id}</b> : null}
                {m.type ? ` · ${m.type}` : ''}{m.belt ? ` · ${m.belt}` : ''}{m.time_estimate ? ` · ${m.time_estimate}` : ''}
              </span>
            </button>
          ))}

        {((cat === 'plantillas' && templates.length === 0) || (cat !== 'plantillas' && !lib)) && (
          <p className="text-[11px] text-gray-400 text-center py-2">Cargando…</p>
        )}
      </div>
      <p className="text-[10px] text-gray-400">Plantillas insertan su bloque completo · drills y misiones caen como UN ítem editable.</p>
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
  item: { id: string; title: string; detail: string | null; video_url: string | null; display_order: number; duration_minutes?: number | null; step_id?: string | null; drill_id?: string | null; pillar?: string | null };
  videos: Video[];
  onChanged: () => void;
  setErr: (e: string | null) => void;
  onCancel?: () => void;
}) {
  const isNew = !item.id;
  const [title, setTitle] = useState(item.title);
  const [detail, setDetail] = useState(item.detail ?? '');
  const [videoUrl, setVideoUrl] = useState(item.video_url ?? '');
  // Estructura del ítem (migración 00167): dosis, paso y pilar.
  const [mins, setMins] = useState(item.duration_minutes != null ? String(item.duration_minutes) : '');
  const [stepId, setStepId] = useState(item.step_id ?? '');
  const [pillar, setPillar] = useState(item.pillar ?? '');
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
      duration_minutes: mins ? Number(mins) : null,
      step_id: stepId || null,
      drill_id: item.drill_id ?? null,
      pillar: pillar || null,
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
          placeholder="3×10 · follow along"
          className="w-40 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs"
        />
      </div>

      {/* Dosis · paso · pilar — la estructura que le faltaba al programa HP.
          Con minutos se puede sumar tiempo; con el paso el ítem se ata a la
          progresión de cinta; con el pilar el % de la matriz se vuelve
          contrastable (migración 00167). */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number" min={0} max={600}
          value={mins}
          onChange={(e) => { setMins(e.target.value); setDirty(true); }}
          placeholder="min"
          aria-label="Duración en minutos"
          className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs"
        />
        <input
          value={stepId}
          onChange={(e) => { setStepId(e.target.value.toUpperCase()); setDirty(true); }}
          placeholder="STP-035"
          aria-label="Paso de la secuencia"
          className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-mono"
        />
        <select
          value={pillar}
          onChange={(e) => { setPillar(e.target.value); setDirty(true); }}
          aria-label="Pilar"
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-600"
        >
          <option value="">Pilar…</option>
          {['fisico', 'tecnico', 'tactico', 'mental', 'equipment', 'surf'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {item.drill_id && (
          <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-gray-100 text-gray-500" title="Drill/misión de origen">
            {item.drill_id}
          </span>
        )}
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
                {a.title || KIND_LABEL[a.kind] || a.kind} · {a.appointment_date}{a.appointment_time ? ` · ${a.appointment_time}` : ''}{a.mode ? ` · ${a.mode}` : ''}
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


// ─── Temporadas · el Plan Anual (macrociclo, fases, eventos, especialistas) ───

// drills.related_pilar viene en inglés/enum; program_items.pillar usa el
// vocabulario de la matriz de periodización. Traducción para que el ítem
// insertado desde la biblioteca herede su pilar.
const BELT_PERMISSIONS = BELT_HIERARCHY.map((b) => ({ value: b, label: getBeltLabel(b, 'en') }));

const PILLAR_MAP: Record<string, string> = {
  technical: 'tecnico', tecnico: 'tecnico',
  tactical: 'tactico', tactico: 'tactico',
  mental: 'mental',
  physical: 'fisico', fisico: 'fisico', 'físico': 'fisico',
  equipment: 'equipment', surf: 'surf',
};

const PHASE_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  general:        { bg: 'rgba(0,168,204,.10)', border: '#00A8CC', text: '#006C8C', label: 'Prep. General' },
  especifica:     { bg: 'rgba(0,168,204,.28)', border: '#0090B8', text: '#006C8C', label: 'Prep. Específica' },
  precompetitiva: { bg: 'rgba(217,119,6,.14)', border: '#D97706', text: '#92580A', label: 'Precompetitiva' },
  competitiva:    { bg: 'rgba(184,134,43,.15)', border: '#B8862B', text: '#8E6614', label: 'Competitiva' },
  transicion:     { bg: 'rgba(100,116,139,.10)', border: '#94A3B8', text: '#64748B', label: 'Transición' },
  recuperacion:   { bg: 'rgba(22,163,74,.12)', border: '#16A34A', text: '#166534', label: 'Recuperación' },
};
const EVENT_ICON: Record<string, string> = { camp: '🌊', nacional: '⭐', internacional: '🏆', viaje: '✈️', medico: '🩺', otro: '📍' };

function pctBetween(date: string, start: string, end: string): number {
  const d = Date.parse(date), a = Date.parse(start), b = Date.parse(end);
  if (!(b > a)) return 0;
  return Math.max(0, Math.min(100, ((d - a) / (b - a)) * 100));
}

function Temporadas() {
  const [rows, setRows] = useState<AdminSeasonRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // crear
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; email: string | null }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => adminListSeasons().then((r) => { if (r.ok) setRows(r.seasons); else setErr(r.error || null); });
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) {
        adminSearchStudents(q).then((r) => { if (r.ok) setResults(r.students); else setErr(r.error || null); });
      } else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const create = async () => {
    if (!picked || !title.trim() || !start || !end) return;
    setErr(null);
    setBusy(true);
    const r = await adminCreateSeason({ studentId: picked.id, title, startDate: start, endDate: end });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setPicked(null); setQ(''); setTitle(''); setStart(''); setEnd('');
    load();
    if (r.id) setOpenId(r.id);
  };

  if (openId) return <SeasonEditor seasonId={openId} onBack={() => { setOpenId(null); load(); }} />;

  return (
    <div className="space-y-4">
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{err}</p>}

      {/* 📖 Manual del PLAN ANUAL — cómo armar el año de un atleta */}
      <details className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <summary className="cursor-pointer px-4 py-3 text-[12px] font-semibold text-[var(--tss-navy)] hover:bg-gray-50">
          📖 Cómo armar el AÑO de un atleta (plan anual)
        </summary>
        <div className="px-4 pb-4 space-y-2 text-[12px] leading-relaxed text-gray-600 border-t border-gray-100 pt-3">
          <p><b className="text-[var(--tss-navy)]">1 · Creá la temporada</b> — atleta + título + fechas del año completo (ej. 5 ene → 20 dic). Una sola activa por atleta.</p>
          <p><b className="text-[var(--tss-navy)]">2 · Pintá las fases</b> — General → Específica → Precompetitiva → Competitiva → Transición (+ Recuperación si hay lesión/reposo). A cada fase escribile su <b>objetivo</b> en inglés: el atleta lo lee tal cual en su portal (&quot;Build the training habit…&quot;). La franja anual de arriba se va pintando sola.</p>
          <p><b className="text-[var(--tss-navy)]">3 · Agregá los eventos</b> — competencias, camps y <b>viajes con fecha de fin</b> (quedan como rango ✈️). Marcá <b>&quot;el pico&quot;</b> en LA competencia objetivo: eso activa el contador &quot;N days to peak&quot; del atleta.</p>
          <p className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-800">⚠ La competencia pico va acá como evento <b>y también</b> en la pestaña Competencias si vas a cargarle heats — usá el <b>mismo nombre y fecha</b> en ambas para que las vistas la muestren una sola vez.</p>
          <p><b className="text-[var(--tss-navy)]">4 · Los programas de 24 microciclos van DENTRO de las fases</b> — asignalos uno tras otro a lo largo del año; el tope de 24 es a propósito (el detalle día a día lejano es ficción).</p>
          <p><b className="text-[var(--tss-navy)]">Qué ve cada quien</b> — Atleta: tarjeta 🗓 <b>My year</b> en su Home (franja de 12 meses, fases, ▲ pico, viajes, YOU en el hoy + &quot;The road&quot;). Especialistas: el mismo año en /equipo y en el <b>plan imprimible</b> (franja + ruta crítica). Coach: contador de días al pico.</p>
        </div>
      </details>

      <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3" style={{ borderLeft: '4px solid #B8862B' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Nueva temporada (macrociclo)</p>
        <div className="flex gap-2 flex-wrap items-start">
          <div className="relative flex-1 min-w-[180px]">
            <input value={picked ? picked.name : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }}
              placeholder="Atleta…" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden">
                {results.map((st) => (
                  <button key={st.id} type="button" onClick={() => { setPicked({ id: st.id, name: st.name }); setResults([]); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                    <span className="font-semibold text-[var(--tss-navy)]">{st.name}</span>
                    <span className="text-[11px] text-gray-400 ml-2">{st.email ?? ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre (inglés, lo ve el atleta) — Road to Centroamericanos"
            className="flex-1 min-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm" aria-label="Inicio" />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm" aria-label="Fin" />
          <button type="button" disabled={busy || !picked || !title.trim() || !start || !end} onClick={create}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-40">
            Crear →
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((sn) => (
          <div key={sn.id}
            className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3 flex-wrap hover:border-gray-300"
            style={{ borderLeft: '4px solid #B8862B', opacity: sn.active ? 1 : 0.55 }}>
            <button type="button" onClick={() => setOpenId(sn.id)} className="flex-1 min-w-[200px] text-left">
              <p className="text-sm font-bold text-[var(--tss-navy)]">{sn.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {sn.student_name} · {sn.start_date} → {sn.end_date}
                {sn.head_coach_name ? ` · head coach: ${sn.head_coach_name}` : ' · sin head coach'}
              </p>
            </button>
            <span className="text-[11px] text-gray-400">
              {sn.phases_count} fase{sn.phases_count === 1 ? '' : 's'} · {sn.events_count} evento{sn.events_count === 1 ? '' : 's'} · {sn.specialists_count} especialista{sn.specialists_count === 1 ? '' : 's'}
            </span>
            {/* Rollover de macrociclo: sin este botón, "desactivala primero"
                (adminCreateSeason) era una instrucción imposible de seguir. */}
            <button type="button"
              onClick={async () => {
                setErr(null);
                const r = await adminUpdateSeason(sn.id, { active: !sn.active });
                if (!r.ok) { setErr(r.error || null); return; }
                load();
              }}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold border"
              style={sn.active
                ? { borderColor: '#E2E8F0', color: '#94A3B8' }
                : { borderColor: '#B8862B', color: '#8E6614', background: '#FDF8EC' }}>
              {sn.active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Sin temporadas todavía.</p>}
      </div>
    </div>
  );
}

function SeasonEditor({ seasonId, onBack }: { seasonId: string; onBack: () => void }) {
  const [sn, setSn] = useState<AdminSeasonDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [e1, setE1] = useState<{ id: string; display_name: string; hp_specialty: string | null }[]>([]);
  const [objective, setObjective] = useState('');
  const [headCoach, setHeadCoach] = useState('');
  const [dirtyMeta, setDirtyMeta] = useState(false);

  const load = () => adminGetSeason(seasonId).then((r) => {
    if (r.ok && r.season) {
      setSn(r.season);
      setObjective(r.season.objective ?? '');
      setHeadCoach(r.season.head_coach_id ?? '');
    } else setErr(r.error || null);
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
    adminListHPCoaches().then((r) => {
      if (r.ok) setE1(r.coaches.filter((c) => c.hp_escalon >= 1).map((c) => ({ id: c.id, display_name: c.display_name, hp_specialty: c.hp_specialty })));
    });
  }, [seasonId]);

  if (!sn) return <p className="text-sm text-gray-400 py-8 text-center">{err ?? 'Cargando…'}</p>;

  const saveMeta = async () => {
    setErr(null);
    const r = await adminUpdateSeason(seasonId, { objective: objective.trim() || null, head_coach_id: headCoach || null });
    if (!r.ok) setErr(r.error || null);
    else { setDirtyMeta(false); load(); }
  };

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--tss-navy)]">
        <ChevronLeft size={13} /> Volver a temporadas
      </button>
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{err}</p>}

      <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-bold text-[var(--tss-navy)]">{sn.title}</p>
            <p className="text-[11px] text-gray-500">{sn.student_name} · {sn.start_date} → {sn.end_date}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Objetivo del macro (inglés, lo ve el atleta)</label>
            <input value={objective} onChange={(e) => { setObjective(e.target.value); setDirtyMeta(true); }}
              placeholder="Gold at Centroamericanos · peak AUG 8"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Head coach (monitorea cargas y calibra)</label>
            <select value={headCoach} onChange={(e) => { setHeadCoach(e.target.value); setDirtyMeta(true); }}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm mt-1">
              <option value="">Sin head coach designado (vos)</option>
              {e1.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
          </div>
        </div>
        {dirtyMeta && (
          <button type="button" onClick={saveMeta} className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white">
            Guardar
          </button>
        )}
      </div>

      {/* Franja anual */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">Franja anual</p>
        <div className="relative h-12 rounded-lg overflow-hidden" style={{ background: '#F1F5F9' }}>
          {sn.phases.map((f) => {
            const c = PHASE_COLORS[f.color_key] ?? PHASE_COLORS.general;
            const left = pctBetween(f.start_date, sn.start_date, sn.end_date);
            const right = pctBetween(f.end_date, sn.start_date, sn.end_date);
            return (
              <div key={f.id} title={`${f.name} · ${f.start_date} → ${f.end_date}`}
                className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden"
                style={{ left: `${left}%`, width: `${Math.max(right - left, 2)}%`, background: c.bg, borderLeft: `2px solid ${c.border}` }}>
                <span className="text-[9px] font-mono font-bold uppercase truncate px-1" style={{ color: c.text }}>{f.name}</span>
              </div>
            );
          })}
          {sn.events.map((ev) => (
            <div key={ev.id} title={`${ev.name} · ${ev.event_date}`}
              className="absolute top-0 bottom-0" style={{ left: `${pctBetween(ev.event_date, sn.start_date, sn.end_date)}%` }}>
              <div className="w-[2px] h-full" style={{ background: ev.is_peak ? '#B8862B' : '#94A3B8' }} />
              <span className="absolute -top-0.5 -translate-x-1/2 text-[11px]">{EVENT_ICON[ev.kind] ?? '📍'}</span>
            </div>
          ))}
        </div>
        {sn.phases.length === 0 && <p className="text-[11px] text-gray-400 mt-2">Agregá fases abajo para ver la franja.</p>}
      </div>

      <SeasonPhases seasonId={seasonId} phases={sn.phases} onChanged={load} setErr={setErr} />
      <SeasonEvents seasonId={seasonId} events={sn.events} onChanged={load} setErr={setErr} />

      {/* Especialistas */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          Especialistas con acceso al plan (agendan sesiones y dejan aportes)
        </p>
        {e1.map((c) => {
          const on = sn.specialists.some((x) => x.coach_id === c.id);
          return (
            <div key={c.id} className="flex items-center gap-2">
              <button type="button"
                onClick={async () => {
                  const r = await adminSetSeasonSpecialist(seasonId, c.id, !on);
                  if (!r.ok) setErr(r.error || null);
                  else load();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${on ? 'bg-[var(--tss-navy)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {on ? '✓ ' : ''}{c.display_name}
              </button>
              {c.hp_specialty && <span className="text-[10px] font-mono uppercase text-amber-700">{c.hp_specialty}</span>}
            </div>
          );
        })}
        {e1.length === 0 && <p className="text-[11px] text-gray-400">Ningún coach con Escalón 1 todavía — otorgalo en la pestaña Coaches.</p>}
      </div>
    </div>
  );
}

const COLOR_OPTS = ['general', 'especifica', 'precompetitiva', 'competitiva', 'transicion', 'recuperacion'] as const;
const KIND_EVENT_OPTS = ['camp', 'nacional', 'internacional', 'viaje', 'medico', 'otro'] as const;

function SeasonPhases({ seasonId, phases, onChanged, setErr }: {
  seasonId: string;
  phases: AdminSeasonDetail['phases'];
  onChanged: () => void;
  setErr: (e: string | null) => void;
}) {
  const [name, setName] = useState('');
  const [colorKey, setColorKey] = useState<string>('general');
  const [ps, setPs] = useState('');
  const [pe, setPe] = useState('');
  const [obj, setObj] = useState('');

  const add = async () => {
    if (!name.trim() || !ps || !pe) return;
    setErr(null);
    const r = await adminSaveSeasonPhase(seasonId, { name, objective: obj, start_date: ps, end_date: pe, color_key: colorKey });
    if (!r.ok) setErr(r.error || null);
    else { setName(''); setObj(''); setPs(''); setPe(''); onChanged(); }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Fases del macro</p>
      {phases.map((f) => {
        const c = PHASE_COLORS[f.color_key] ?? PHASE_COLORS.general;
        return (
          <div key={f.id} className="flex items-center gap-2 flex-wrap rounded-xl border border-gray-100 p-2.5" style={{ borderLeft: `3px solid ${c.border}` }}>
            <span className="text-xs font-bold" style={{ color: c.text }}>{f.name}</span>
            <span className="text-[11px] text-gray-500">{f.start_date} → {f.end_date}</span>
            {f.objective && <span className="text-[11px] text-gray-400">· {f.objective}</span>}
            <div className="flex-1" />
            <button type="button" onClick={async () => {
              if (!window.confirm(`¿Eliminar la fase «${f.name}»?`)) return;
              const r = await adminDeleteSeasonPhase(f.id);
              if (!r.ok) setErr(r.error || null); else onChanged();
            }} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
        );
      })}
      <div className="flex gap-2 flex-wrap items-center pt-1">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (General Prep…)" className="flex-1 min-w-[140px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs" />
        <select value={colorKey} onChange={(e) => setColorKey(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs">
          {COLOR_OPTS.map((k) => <option key={k} value={k}>{PHASE_COLORS[k].label}</option>)}
        </select>
        <input type="date" value={ps} onChange={(e) => setPs(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs" aria-label="Inicio de fase" />
        <input type="date" value={pe} onChange={(e) => setPe(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs" aria-label="Fin de fase" />
        <input value={obj} onChange={(e) => setObj(e.target.value)} placeholder="Objetivo (opcional)" className="flex-1 min-w-[120px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs" />
        <button type="button" disabled={!name.trim() || !ps || !pe} onClick={add}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--tss-cyan)] text-[var(--tss-navy)] disabled:opacity-40">
          + Fase
        </button>
      </div>
    </div>
  );
}

function SeasonEvents({ seasonId, events, onChanged, setErr }: {
  seasonId: string;
  events: AdminSeasonDetail['events'];
  onChanged: () => void;
  setErr: (e: string | null) => void;
}) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<string>('nacional');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState(''); // opcional: viajes/camps con rango
  const [notes, setNotes] = useState('');
  const [peak, setPeak] = useState(false);

  const add = async () => {
    if (!name.trim() || !date) return;
    setErr(null);
    const r = await adminSaveSeasonEvent(seasonId, { name, kind, event_date: date, end_date: endDate || null, notes: notes || null, is_peak: peak });
    if (!r.ok) setErr(r.error || null);
    else { setName(''); setDate(''); setEndDate(''); setNotes(''); setPeak(false); onChanged(); }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Eventos y competencias</p>
      {events.map((ev) => (
        <div key={ev.id} className="flex items-center gap-2 flex-wrap rounded-xl border border-gray-100 p-2.5"
          style={{ borderLeft: `3px solid ${ev.is_peak ? '#B8862B' : '#CBD5E1'}` }}>
          <span className="text-sm">{EVENT_ICON[ev.kind] ?? '📍'}</span>
          <span className="text-xs font-bold text-[var(--tss-navy)]">{ev.name}</span>
          <span className="text-[11px] text-gray-500">{ev.event_date}{ev.end_date ? ` → ${ev.end_date}` : ''}</span>
          {ev.notes && <span className="text-[11px] text-gray-400">· {ev.notes}</span>}
          {ev.is_peak && <span className="text-[10px] font-mono font-bold text-amber-700">EL PICO</span>}
          <div className="flex-1" />
          <button type="button" onClick={async () => {
            if (!window.confirm(`¿Eliminar «${ev.name}»?`)) return;
            const r = await adminDeleteSeasonEvent(ev.id);
            if (!r.ok) setErr(r.error || null); else onChanged();
          }} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
        </div>
      ))}
      <div className="flex gap-2 flex-wrap items-center pt-1">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (inglés) — Centroamericanos" className="flex-1 min-w-[160px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs" />
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs">
          {KIND_EVENT_OPTS.map((k) => <option key={k} value={k}>{EVENT_ICON[k]} {k}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs" aria-label="Fecha del evento" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs" aria-label="Fin (opcional — viajes/camps)" title="Fin (opcional — viajes/camps de varios días)" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" className="flex-1 min-w-[110px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs" />
        <label className="text-[11px] text-gray-500 flex items-center gap-1">
          <input type="checkbox" checked={peak} onChange={(e) => setPeak(e.target.checked)} /> el pico
        </label>
        <button type="button" disabled={!name.trim() || !date} onClick={add}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--tss-cyan)] text-[var(--tss-navy)] disabled:opacity-40">
          + Evento
        </button>
      </div>
    </div>
  );
}


// ─── Ola 2: Competencias por atleta + ranking semanal (paridad app HP) ───

function Competencias() {
  const [rows, setRows] = useState<AdminCompetitionRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // crear
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; email: string | null }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  // ranking
  const [ranking, setRanking] = useState<Awaited<ReturnType<typeof adminGetWeeklyRanking>> | null>(null);

  const load = () => {
    adminListCompetitions().then((r) => { if (r.ok) setRows(r.competitions); else setErr(r.error || null); });
    adminGetWeeklyRanking().then((r) => { if (r.ok) setRanking(r); });
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2 && !picked) {
        adminSearchStudents(q).then((r) => { if (r.ok) setResults(r.students); else setErr(r.error || null); });
      } else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q, picked]);

  const create = async () => {
    if (!picked || !name.trim() || !date) return;
    setErr(null); setBusy(true);
    const r = await adminCreateCompetition({ studentId: picked.id, name, compDate: date, location: location || null, category: category || null });
    setBusy(false);
    if (!r.ok) { setErr(r.error || null); return; }
    setPicked(null); setQ(''); setName(''); setDate(''); setLocation(''); setCategory('');
    load();
    if (r.id) setOpenId(r.id);
  };

  if (openId) return <CompetenciaEditor compId={openId} onBack={() => { setOpenId(null); load(); }} />;

  const STATUS_LABEL: Record<string, { t: string; c: string; bg: string }> = {
    scheduled: { t: 'Programada', c: '#8E6614', bg: '#FDF8EC' },
    live: { t: 'EN CURSO', c: '#fff', bg: '#C0392B' },
    finished: { t: 'Finalizada', c: '#55707F', bg: '#EEF2F6' },
  };

  return (
    <div className="space-y-4">
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{err}</p>}

      <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3" style={{ borderLeft: '4px solid #B8862B' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Nueva competencia (bitácora del atleta)</p>
        <div className="flex gap-2 flex-wrap items-start">
          <div className="relative flex-1 min-w-[160px]">
            <input value={picked ? picked.name : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }}
              placeholder="Atleta…" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden">
                {results.map((st) => (
                  <button key={st.id} type="button" onClick={() => { setPicked({ id: st.id, name: st.name }); setResults([]); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                    <span className="font-semibold text-[var(--tss-navy)]">{st.name}</span>
                    <span className="text-[11px] text-gray-400 ml-2">{st.email ?? ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del evento"
            className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm" aria-label="Fecha" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lugar"
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoría"
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button type="button" disabled={busy || !picked || !name.trim() || !date} onClick={create}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-40">
            Crear →
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((c) => {
          const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.scheduled;
          return (
            <button key={c.id} type="button" onClick={() => setOpenId(c.id)}
              className="w-full text-left rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3 flex-wrap hover:border-gray-300"
              style={{ borderLeft: '4px solid #B8862B' }}>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-bold text-[var(--tss-navy)]">{c.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {c.student_name} · {c.comp_date}
                  {c.location ? ` · ${c.location}` : ''}{c.category ? ` · ${c.category}` : ''}
                </p>
              </div>
              <span className="text-[11px] text-gray-400">{c.heats_count} heat{c.heats_count === 1 ? '' : 's'}</span>
              {c.final_place && <span className="text-[11px] font-bold" style={{ color: '#B8862B' }}>{c.final_place}</span>}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ color: st.c, background: st.bg }}>{st.t}</span>
            </button>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Sin competencias todavía.</p>}
      </div>

      {ranking?.current && (
        <div className="rounded-2xl bg-white border border-gray-200 p-4" style={{ borderLeft: '4px solid #B8862B' }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              Ranking semanal · {ranking.current.week_start} → {ranking.current.week_end} (en vivo)
            </p>
            <button type="button" onClick={() => adminGetWeeklyRanking().then((r) => { if (r.ok) setRanking(r); })}
              className="text-[10px] font-bold" style={{ color: '#0090B8' }}>↻ Recalcular</button>
          </div>
          <div className="mt-2 grid md:grid-cols-2 gap-x-8 gap-y-0.5">
            {ranking.current.rows.map((r) => (
              <div key={r.student_id} className="flex items-center justify-between py-0.5" style={{ borderBottom: '1px solid #F8FAFC' }}>
                <p className="text-[12px]" style={{ color: '#0C2231', fontWeight: r.position <= 3 ? 700 : 400 }}>
                  {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `${r.position}.`} {r.name}
                </p>
                <p className="text-[11px] font-mono text-gray-400">{r.points}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Puntos por día: día marcado 30 · check-in 10 · sueño ≤20 · dieta 15 · agua ≤10 · energía ≤5 (fórmula HP). El snapshot de cada semana se guarda solo al cerrar el lunes.
          </p>
          {ranking.last_snapshot && (
            <p className="text-[10px] text-gray-400 mt-1">
              Semana pasada ({ranking.last_snapshot.week_start}): {ranking.last_snapshot.rows.slice(0, 3).map((r) => `${r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'} ${r.name} (${r.points})`).join(' · ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CompetenciaEditor({ compId, onBack }: { compId: string; onBack: () => void }) {
  const [comp, setComp] = useState<AdminCompetitionDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [newRound, setNewRound] = useState('');
  const [newHeatNum, setNewHeatNum] = useState(1);
  const [addingHeat, setAddingHeat] = useState(false);
  const [waveInputs, setWaveInputs] = useState<Record<string, string>>({});
  const [finalPlace, setFinalPlace] = useState('');
  const [finalNotes, setFinalNotes] = useState('');

  const load = () => adminGetCompetition(compId).then((r) => {
    if (r.ok && r.competition) {
      setComp(r.competition);
      setFinalPlace(r.competition.final_place ?? '');
      setFinalNotes(r.competition.final_notes ?? '');
      setNewHeatNum(r.competition.heats.reduce((m, h) => Math.max(m, h.heat_number), 0) + 1);
    } else setErr(r.error || null);
  });
  useEffect(() => { load(); }, [compId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!comp) return <p className="text-sm text-gray-400 py-6 text-center">{err ?? 'Cargando…'}</p>;

  const act = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErr(null);
    const r = await fn();
    if (!r.ok) { setErr(r.error || null); return; }
    load();
  };

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="text-xs text-gray-500">← Volver a competencias</button>
      {err && <p className="text-xs rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">{err}</p>}

      <div className="rounded-2xl bg-white border border-gray-200 p-4" style={{ borderLeft: '4px solid #B8862B' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-base font-bold text-[var(--tss-navy)]">{comp.name}</p>
            <p className="text-[11.5px] text-gray-500 mt-0.5">
              {comp.student_name} · {comp.comp_date}
              {comp.location ? ` · ${comp.location}` : ''}{comp.category ? ` · ${comp.category}` : ''}
            </p>
          </div>
          <div className="flex gap-1.5">
            {(['scheduled', 'live', 'finished'] as const).map((st) => (
              <button key={st} type="button"
                onClick={() => act(() => adminUpdateCompetition(comp.id, { status: st }))}
                className="px-3 py-1.5 rounded-full text-[10px] font-bold border"
                style={comp.status === st
                  ? { background: '#0C2231', color: '#fff', borderColor: '#0C2231' }
                  : { borderColor: '#E2E8F0', color: '#55707F' }}>
                {st === 'scheduled' ? 'Programada' : st === 'live' ? 'En curso' : 'Finalizada'}
              </button>
            ))}
          </div>
        </div>

        {comp.status === 'finished' && (
          <div className="mt-3 pt-3 flex gap-2 flex-wrap items-center" style={{ borderTop: '1px solid #F1F5F9' }}>
            <input value={finalPlace} onChange={(e) => setFinalPlace(e.target.value)} placeholder="Resultado final — 3er lugar / Semifinal…"
              className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)} placeholder="Nota final (inglés — la ve el atleta)"
              className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <button type="button"
              onClick={() => act(() => adminUpdateCompetition(comp.id, { final_place: finalPlace || null, final_notes: finalNotes || null }))}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white">Guardar resultado</button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {comp.heats.map((h) => {
          const prep: any = h.prep ?? {};
          return (
            <div key={h.id} className="rounded-2xl bg-white border border-gray-200 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-bold text-[var(--tss-navy)]">
                  Heat {h.heat_number}{h.round_name ? ` · ${h.round_name}` : ''}
                </p>
                <div className="flex items-center gap-2">
                  {h.status === 'done' && h.passed != null && (
                    <span className="text-[11px] font-bold" style={{ color: h.passed ? '#1F9D6B' : '#C0392B' }}>
                      {h.passed ? 'PASÓ ✓' : 'ELIMINADO'}
                    </span>
                  )}
                  {h.waves.length === 0 && (
                    <button type="button"
                      onClick={() => { if (confirm(`¿Eliminar el Heat ${h.heat_number}? Si el atleta ya hizo su preparación, se pierde.`)) act(() => adminDeleteHeat(h.id)); }}
                      className="text-[10px] text-gray-400 hover:text-red-500">Eliminar</button>
                  )}
                </div>
              </div>

              {(prep.checks?.length || prep.strategy || prep.mantra || prep.lineup) ? (
                <p className="text-[11px] text-gray-500 mt-1">
                  Prep del atleta: {prep.checks?.length ?? 0}/6 checks
                  {prep.lineup ? ` · lineup ${prep.lineup}` : ''}
                  {prep.strategy ? ` · estrategia ${prep.strategy}` : ''}
                  {prep.mantra ? ` · «${prep.mantra}»` : ''}
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">El atleta todavía no hizo su preparación.</p>
              )}

              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {h.waves.map((w) => (
                  <button key={w.id} type="button" title="Borrar ola"
                    onClick={() => { if (confirm(`¿Borrar la ola ${w.wave_number} (${w.score})?`)) act(() => adminDeleteWave(w.id)); }}
                    className="px-2 py-1 rounded-lg text-[12px] font-mono font-bold border"
                    style={{ borderColor: '#BAE6FD', background: '#F0F9FF', color: '#0369A1' }}>
                    {w.score.toFixed(2)}
                  </button>
                ))}
                <input value={waveInputs[h.id] ?? ''} inputMode="decimal"
                  onChange={(e) => setWaveInputs({ ...waveInputs, [h.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = parseFloat((waveInputs[h.id] ?? '').replace(',', '.'));
                      if (!Number.isNaN(v)) { act(() => adminAddWave(h.id, v)); setWaveInputs({ ...waveInputs, [h.id]: '' }); }
                    }
                  }}
                  placeholder="ola…" aria-label="Puntaje de la ola"
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-[12px]" />
                <button type="button"
                  onClick={() => {
                    const v = parseFloat((waveInputs[h.id] ?? '').replace(',', '.'));
                    if (!Number.isNaN(v)) { act(() => adminAddWave(h.id, v)); setWaveInputs({ ...waveInputs, [h.id]: '' }); }
                  }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border" style={{ borderColor: '#B8862B', color: '#8E6614' }}>
                  + Ola
                </button>
                {h.waves.length > 0 && (
                  <span className="text-[11.5px] ml-1 text-gray-500">
                    Total (2 mejores): <b style={{ color: '#B8862B' }}>{h.heat_total.toFixed(2)}</b>
                  </span>
                )}
              </div>

              <HeatOutcome heat={h} onSave={(patch) => act(() => adminUpdateHeatOutcome(h.id, patch))} />
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white border border-dashed border-gray-300 p-4 flex items-center gap-2 flex-wrap">
        <p className="text-[11px] text-gray-500">Agregar heat:</p>
        <input type="number" min={1} max={99} value={newHeatNum} onChange={(e) => setNewHeatNum(Number(e.target.value))}
          className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm" aria-label="Número de heat" />
        <input value={newRound} onChange={(e) => setNewRound(e.target.value)} placeholder="Ronda (Round 1 / Semifinal…)"
          className="flex-1 min-w-[160px] rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
        <button type="button" disabled={addingHeat}
          onClick={async () => { setAddingHeat(true); await act(() => adminAddHeat(comp.id, { heatNumber: newHeatNum, roundName: newRound || null })); setAddingHeat(false); }}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-50">{addingHeat ? '…' : '+ Heat'}</button>
      </div>
    </div>
  );
}

function HeatOutcome({ heat, onSave }: {
  heat: { id: string; status: string; passed: boolean | null; what_worked: string | null; what_to_improve: string | null };
  onSave: (patch: { passed?: boolean | null; what_worked?: string | null; what_to_improve?: string | null; status?: 'upcoming' | 'done' }) => void;
}) {
  const [openForm, setOpenForm] = useState(false);
  const [passed, setPassed] = useState<boolean>(heat.passed ?? true);
  const [worked, setWorked] = useState(heat.what_worked ?? '');
  const [improve, setImprove] = useState(heat.what_to_improve ?? '');

  if (heat.status === 'done' && !openForm) {
    return (
      <div className="mt-2 text-[11.5px] text-gray-500">
        {heat.what_worked && <p>✓ Funcionó: {heat.what_worked}</p>}
        {heat.what_to_improve && <p>→ Mejorar: {heat.what_to_improve}</p>}
        <button type="button" onClick={() => setOpenForm(true)} className="text-[10px] font-bold mt-1" style={{ color: '#0090B8' }}>Editar resultado</button>
      </div>
    );
  }
  if (!openForm) {
    return (
      <button type="button" onClick={() => setOpenForm(true)} className="mt-2 text-[10px] font-bold" style={{ color: '#8E6614' }}>
        + Cerrar heat (pasó / no pasó + aprendizajes)
      </button>
    );
  }
  return (
    <div className="mt-2.5 pt-2.5 space-y-2" style={{ borderTop: '1px solid #F1F5F9' }}>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setPassed(true)}
          className="px-3 py-1.5 rounded-full text-[10px] font-bold border"
          style={passed ? { background: '#1F9D6B', color: '#fff', borderColor: '#1F9D6B' } : { borderColor: '#E2E8F0', color: '#55707F' }}>
          Pasó ✓
        </button>
        <button type="button" onClick={() => setPassed(false)}
          className="px-3 py-1.5 rounded-full text-[10px] font-bold border"
          style={!passed ? { background: '#C0392B', color: '#fff', borderColor: '#C0392B' } : { borderColor: '#E2E8F0', color: '#55707F' }}>
          No pasó
        </button>
      </div>
      <input value={worked} onChange={(e) => setWorked(e.target.value)} placeholder="Qué funcionó (inglés — lo ve el atleta)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="Qué mejorar (inglés — lo ve el atleta)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button type="button"
          onClick={() => { onSave({ passed, what_worked: worked || null, what_to_improve: improve || null, status: 'done' }); setOpenForm(false); }}
          className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--tss-navy)] text-white">Guardar resultado</button>
        <button type="button" onClick={() => setOpenForm(false)} className="px-3 text-xs text-gray-400">Cancelar</button>
      </div>
    </div>
  );
}
