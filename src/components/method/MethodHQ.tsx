'use client';

// ═══ EL MÉTODO — tablero + área (bóveda y guía) ═══
//
// Dos niveles: el TABLERO (7 áreas con su % desarrollado — responde "qué
// falta" de un vistazo) y el ÁREA (checklist de desarrollo arriba, bóveda
// de documentos abajo). Staff-facing → español, tema claro del dashboard.

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass, Palette, Award, Briefcase, TrendingUp, Wrench, Scale,
  FileText, Image as ImageIcon, Link2, StickyNote, BookOpen,
  Trash2, ExternalLink, ChevronLeft, Check, Circle, CircleDot, Paperclip,
  type LucideIcon,
} from 'lucide-react';
import { METHOD_AREAS, type MethodArea } from '@/lib/constants/method';
import {
  createMethodFileDoc,
  createMethodEntry,
  deleteMethodDoc,
  getMethodDocUrl,
  setMethodTaskStatus,
  attachDocToTask,
  createMethodTask,
  deleteMethodTask,
  type MethodHQData,
  type MethodDoc,
  type MethodTask,
} from '@/lib/actions/method';

const AREA_ICONS: Record<MethodArea['icon'], LucideIcon> = {
  Compass, Palette, Award, Briefcase, TrendingUp, Wrench, Scale,
};

const KIND_META: Record<MethodDoc['kind'], { label: string; Icon: LucideIcon }> = {
  pdf: { label: 'PDF', Icon: FileText },
  image: { label: 'Imagen', Icon: ImageIcon },
  link: { label: 'Link', Icon: Link2 },
  note: { label: 'Nota', Icon: StickyNote },
  resource: { label: 'Biblioteca', Icon: BookOpen },
};

const STATUS_META = {
  pending: { label: 'Pendiente', Icon: Circle, color: '#9aa7ad', bg: 'rgba(154,167,173,.12)' },
  in_progress: { label: 'En proceso', Icon: CircleDot, color: '#0090B0', bg: 'rgba(0,210,255,.12)' },
  done: { label: 'Hecho', Icon: Check, color: '#0a7c5d', bg: 'rgba(6,214,160,.14)' },
} as const;

const NEXT_STATUS: Record<MethodTask['status'], MethodTask['status']> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

export function MethodHQ({ initial }: { initial: MethodHQData }) {
  const router = useRouter();
  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const byArea = useMemo(() => {
    const t = new Map<string, MethodTask[]>();
    const d = new Map<string, MethodDoc[]>();
    for (const a of METHOD_AREAS) { t.set(a.key, []); d.set(a.key, []); }
    for (const task of initial.tasks) t.get(task.area)?.push(task);
    for (const doc of initial.docs) d.get(doc.area)?.push(doc);
    return { t, d };
  }, [initial]);

  const area = METHOD_AREAS.find((a) => a.key === areaKey) ?? null;

  if (!area) {
    return (
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {METHOD_AREAS.map((a) => {
          const tasks = byArea.t.get(a.key) ?? [];
          const docs = byArea.d.get(a.key) ?? [];
          const done = tasks.filter((x) => x.status === 'done').length;
          const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          const missing = tasks.length - done;
          const Icon = AREA_ICONS[a.icon];
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => setAreaKey(a.key)}
              className="text-left rounded-2xl border border-gray-200 bg-white p-4 hover:border-[var(--tss-cyan)] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,210,255,.10)' }}>
                  <Icon size={17} style={{ color: '#0090B0' }} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[var(--tss-navy)] leading-tight">{a.label}</p>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{a.blurb}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="font-semibold" style={{ color: pct === 100 ? '#0a7c5d' : '#0090B0' }}>
                  {pct}% desarrollado
                </span>
                <span className="text-gray-400">
                  {missing > 0 ? `${missing} por hacer` : 'completo ✓'} · {docs.length} doc{docs.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-1.5 w-full rounded-full h-1.5 overflow-hidden bg-gray-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#06D6A0' : '#00D2FF' }} />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  const tasks = byArea.t.get(area.key) ?? [];
  const docs = byArea.d.get(area.key) ?? [];
  const AreaIcon = AREA_ICONS[area.icon];

  return (
    <div className="mt-5 space-y-4">
      <button
        type="button"
        onClick={() => setAreaKey(null)}
        className="inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-[var(--tss-navy)]"
      >
        <ChevronLeft size={14} /> Todas las áreas
      </button>

      <div className="flex items-center gap-2.5">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,210,255,.10)' }}>
          <AreaIcon size={19} style={{ color: '#0090B0' }} />
        </span>
        <div>
          <h2 className="text-[17px] font-bold text-[var(--tss-navy)] leading-tight">{area.label}</h2>
          <p className="text-[12px] text-gray-500">{area.blurb}</p>
        </div>
      </div>

      <TaskList
        area={area.key}
        tasks={tasks}
        docs={docs}
        busy={pending}
        run={(fn) => startTransition(async () => { await fn(); router.refresh(); })}
      />

      <DocVault
        area={area.key}
        docs={docs}
        resources={initial.libraryResources}
        busy={pending}
        run={(fn) => startTransition(async () => { await fn(); router.refresh(); })}
      />
    </div>
  );
}

// ── La guía: checklist de desarrollo ────────────────────────────

function TaskList({
  area, tasks, docs, busy, run,
}: {
  area: string;
  tasks: MethodTask[];
  docs: MethodDoc[];
  busy: boolean;
  run: (fn: () => Promise<unknown>) => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const [attaching, setAttaching] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-[var(--tss-navy)]">La guía — qué debería existir acá</h3>
        <span className="text-[11px] text-gray-400">
          {tasks.filter((t) => t.status === 'done').length}/{tasks.length} hecho
        </span>
      </header>
      <div>
        {tasks.map((t) => {
          const meta = STATUS_META[t.status];
          const attached = t.doc_id ? docs.find((d) => d.id === t.doc_id) ?? null : null;
          return (
            <div key={t.id} className="px-4 py-2.5 border-b border-gray-50 flex items-start gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => setMethodTaskStatus(t.id, NEXT_STATUS[t.status]))}
                className="shrink-0 mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold disabled:opacity-50"
                style={{ background: meta.bg, color: meta.color }}
                title="Tocar para cambiar el estado"
              >
                <meta.Icon size={11} strokeWidth={2.5} /> {meta.label}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] leading-snug ${t.status === 'done' ? 'text-gray-400' : 'text-[var(--tss-navy)] font-medium'}`}>
                  {t.title}
                </p>
                {t.detail && <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{t.detail}</p>}
                {attached && (
                  <p className="text-[11px] mt-0.5 inline-flex items-center gap-1" style={{ color: '#0090B0' }}>
                    <Paperclip size={10} /> {attached.title}
                  </p>
                )}
                {attaching === t.id && (
                  <select
                    autoFocus
                    className="mt-1.5 w-full max-w-xs px-2 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white"
                    defaultValue={t.doc_id ?? ''}
                    onChange={(e) => {
                      const v = e.target.value || null;
                      setAttaching(null);
                      run(() => attachDocToTask(t.id, v));
                    }}
                    onBlur={() => setAttaching(null)}
                  >
                    <option value="">— sin documento —</option>
                    {docs.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Adjuntar documento"
                  title="Adjuntar documento del área"
                  onClick={() => setAttaching(attaching === t.id ? null : t.id)}
                  className="p-1.5 text-gray-300 hover:text-[#0090B0]"
                >
                  <Paperclip size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Borrar tarea"
                  onClick={() => {
                    if (confirm(`¿Borrar "${t.title}" del checklist?`)) run(() => deleteMethodTask(t.id));
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <p className="px-4 py-5 text-[12px] text-gray-400">Sin ítems todavía — agregá el primero abajo.</p>
        )}
      </div>
      <form
        className="px-4 py-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const title = newTitle.trim();
          if (!title) return;
          setNewTitle('');
          run(() => createMethodTask({ area, title }));
        }}
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Agregar algo que esta área necesita…"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[13px]"
        />
        <button
          type="submit"
          disabled={busy || !newTitle.trim()}
          className="shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--tss-navy, #0A1628)' }}
        >
          Agregar
        </button>
      </form>
    </section>
  );
}

// ── La bóveda: documentos del área ──────────────────────────────

function DocVault({
  area, docs, resources, busy, run,
}: {
  area: string;
  docs: MethodDoc[];
  resources: { id: string; title: string }[];
  busy: boolean;
  run: (fn: () => Promise<unknown>) => void;
}) {
  const [mode, setMode] = useState<'file' | 'link' | 'note' | 'resource' | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [openingId, setOpeningId] = useState<string | null>(null);

  const reset = () => {
    setMode(null); setTitle(''); setUrl(''); setNotes(''); setResourceId(''); setFile(null); setError('');
  };

  const submit = () => {
    setError('');
    if (mode === 'file') {
      if (!file || !title.trim()) { setError('Falta el archivo o el título.'); return; }
      const fd = new FormData();
      fd.set('file', file);
      fd.set('area', area);
      fd.set('title', title.trim());
      if (notes.trim()) fd.set('notes', notes.trim());
      run(async () => {
        const r = await createMethodFileDoc(fd);
        if (!r.ok) setError(r.error || 'No se pudo subir.'); else reset();
      });
      return;
    }
    if (!mode) return;
    run(async () => {
      const r = await createMethodEntry({
        area,
        title: title.trim(),
        kind: mode,
        url: url.trim() || null,
        notes: notes.trim() || null,
        resourceId: resourceId || null,
      });
      if (!r.ok) setError(r.error || 'No se pudo guardar.'); else reset();
    });
  };

  const openDoc = async (d: MethodDoc) => {
    setOpeningId(d.id);
    const r = await getMethodDocUrl(d.id).catch(() => null);
    setOpeningId(null);
    if (r && r.ok) window.open(r.url, '_blank', 'noopener');
    else if (r && !r.ok) alert(r.error);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold text-[var(--tss-navy)]">La bóveda — documentos</h3>
        {!mode && (
          <div className="flex gap-1.5">
            {(['file', 'link', 'note', 'resource'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold border border-gray-200 text-gray-600 hover:border-[var(--tss-cyan)] hover:text-[#0090B0]"
              >
                + {m === 'file' ? 'Archivo' : m === 'link' ? 'Link' : m === 'note' ? 'Nota' : 'De la biblioteca'}
              </button>
            ))}
          </div>
        )}
      </header>

      {mode && (
        <div className="px-4 py-3 border-b border-gray-100 space-y-2 bg-gray-50/60">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
          />
          {mode === 'file' && (
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-[12px]"
            />
          )}
          {mode === 'link' && (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…  o  /ruta-del-app (ej. /reports)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
            />
          )}
          {mode === 'resource' && (
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
            >
              <option value="">— elegí el recurso de la biblioteca —</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          )}
          {(mode === 'note' || mode === 'file' || mode === 'link') && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={mode === 'note' ? 'El contenido de la nota…' : 'Notas (opcional)'}
              rows={mode === 'note' ? 4 : 2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
            />
          )}
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="rounded-full px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--tss-navy, #0A1628)' }}
            >
              {busy ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" onClick={reset} className="px-3 py-2 text-[12px] text-gray-500">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div>
        {docs.map((d) => {
          const meta = KIND_META[d.kind];
          return (
            <div key={d.id} className="px-4 py-2.5 border-b border-gray-50 flex items-start gap-3">
              <meta.Icon size={15} className="shrink-0 mt-0.5" style={{ color: '#0090B0' }} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--tss-navy)] leading-snug">{d.title}</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">
                  {meta.label}
                  {d.kind === 'resource' && d.resource_title ? ` · ${d.resource_title}` : ''}
                  {d.kind === 'link' && d.url ? ` · ${d.url.slice(0, 60)}` : ''}
                </p>
                {d.kind === 'note' && d.notes && (
                  <p className="text-[12px] text-gray-600 mt-1 leading-snug whitespace-pre-line">{d.notes}</p>
                )}
                {d.kind !== 'note' && d.notes && (
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{d.notes}</p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-1">
                {d.kind !== 'note' && (
                  <button
                    type="button"
                    aria-label="Abrir"
                    disabled={openingId === d.id}
                    onClick={() => openDoc(d)}
                    className="p-1.5 text-gray-400 hover:text-[#0090B0] disabled:opacity-40"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Borrar"
                  onClick={() => {
                    if (confirm(`¿Borrar "${d.title}" de la bóveda?${d.kind === 'pdf' || d.kind === 'image' ? ' El archivo se elimina del storage.' : ''}`)) {
                      run(() => deleteMethodDoc(d.id));
                    }
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {docs.length === 0 && (
          <p className="px-4 py-5 text-[12px] text-gray-400">
            Sin documentos todavía. Subí un archivo, pegá un link, dejá una nota o
            enlazá algo que ya viva en la biblioteca.
          </p>
        )}
      </div>
    </section>
  );
}
