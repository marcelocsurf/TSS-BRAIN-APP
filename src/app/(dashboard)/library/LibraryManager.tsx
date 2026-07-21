'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  createCoachResource,
  createLinkResource,
  deleteCoachResource,
  setResourceActive,
  setCoachResourceGrant,
  setStudentResourceGrant,
  grantResourceToAll,
  type LibraryOverview,
  type LibraryItem,
} from '@/lib/actions/coach-resources';
import { Presentation, Video, Link2, Plus, Trash2, Archive, ArchiveRestore, ExternalLink, Users, ChevronDown, Search, Check } from 'lucide-react';

// Admin Library manager (M142). Everything client-side works against the
// existing resource + grant actions; the page reloads data via router refresh
// patterns kept simple — we mutate local state optimistically.

const KIND_META: Record<string, { label: string; Icon: any; tint: string }> = {
  pdf: { label: 'Presentation', Icon: Presentation, tint: '#0090B0' },
  video: { label: 'Video', Icon: Video, tint: '#7C3AED' },
  link: { label: 'Link', Icon: Link2, tint: '#059669' },
};

export function LibraryManager({ initial }: { initial: LibraryOverview }) {
  const [items, setItems] = useState<LibraryItem[]>(initial.items);
  const [showAdd, setShowAdd] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-3">
      {/* ── Add new ── */}
      {showAdd ? (
        <AddItemPanel
          pending={pending}
          onCancel={() => setShowAdd(false)}
          onAddPdf={(fd) =>
            start(async () => {
              const r = await createCoachResource(fd);
              if (!r.ok) { alert(r.error || 'Could not upload.'); return; }
              window.location.reload();
            })
          }
          onAddLink={(input) =>
            start(async () => {
              const r = await createLinkResource(input);
              if (!r.ok) { alert(r.error || 'Could not add.'); return; }
              window.location.reload();
            })
          }
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 py-3.5 text-sm font-semibold text-gray-500 hover:border-[var(--tss-navy)] hover:text-[var(--tss-navy)] transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <Plus size={16} /> Add to the library — PDF, video or link
        </button>
      )}

      {/* ── Items ── */}
      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Nothing in the library yet — add your first item above.</p>
      )}
      {items.map((it) => (
        <ItemCard
          key={it.id}
          item={it}
          roster={initial}
          onLocal={(patch) => setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, ...patch } : x)))}
          onRemove={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
        />
      ))}
    </div>
  );
}

function AddItemPanel({ pending, onAddPdf, onAddLink, onCancel }: {
  pending: boolean;
  onAddPdf: (fd: FormData) => void;
  onAddLink: (input: { title: string; description?: string | null; kind: 'video' | 'link'; url: string }) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<'pdf' | 'video' | 'link'>('pdf');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const submit = () => {
    if (mode === 'pdf') {
      if (!file || !title.trim()) { alert('A PDF file and a title are required.'); return; }
      const fd = new FormData();
      fd.set('file', file);
      fd.set('title', title);
      fd.set('description', description);
      onAddPdf(fd);
    } else {
      onAddLink({ title, description, kind: mode, url });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--tss-navy)]">New library item</p>
        <button type="button" onClick={onCancel} className="text-xs text-gray-400 hover:text-[var(--tss-navy)]">Cancel</button>
      </div>
      <div className="flex gap-1.5">
        {(['pdf', 'video', 'link'] as const).map((m) => {
          const meta = KIND_META[m];
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all inline-flex items-center justify-center gap-1.5 ${
                mode === m ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              <meta.Icon size={13} /> {meta.label}
            </button>
          );
        })}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      {mode === 'pdf' ? (
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm text-gray-600" />
      ) : (
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={mode === 'video' ? 'Video URL (YouTube, Vimeo, Drive…)' : 'https://…'} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      )}
      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="w-full py-2.5 rounded-xl bg-[var(--tss-navy)] text-white text-sm font-semibold disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Add to library'}
      </button>
    </div>
  );
}

function ItemCard({ item, roster, onLocal, onRemove }: {
  item: LibraryItem;
  roster: LibraryOverview;
  onLocal: (patch: Partial<LibraryItem>) => void;
  onRemove: () => void;
}) {
  const [showGrants, setShowGrants] = useState(false);
  const [pending, start] = useTransition();
  const meta = KIND_META[item.kind] ?? KIND_META.link;

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${item.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
      <div className="p-4 flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.tint}14`, color: meta.tint }}>
          <meta.Icon size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">{item.title}</p>
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${meta.tint}14`, color: meta.tint }}>{meta.label}</span>
            {!item.active && <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Archived</span>}
          </div>
          {item.description && <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{item.description}</p>}
          <p className="text-[11px] text-gray-400 mt-1">
            <Users size={11} className="inline -mt-0.5 mr-1" />
            {item.coachIds.length} coach{item.coachIds.length === 1 ? '' : 'es'} · {item.studentIds.length} student{item.studentIds.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.open_url && (
            <a href={item.open_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100" title="Open">
              <ExternalLink size={15} />
            </a>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => {
              const r = await setResourceActive(item.id, !item.active);
              if (!r.ok) { alert(r.error); return; }
              onLocal({ active: !item.active });
            })}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
            title={item.active ? 'Archive' : 'Restore'}
          >
            {item.active ? <Archive size={15} /> : <ArchiveRestore size={15} />}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete "${item.title}"? This removes the file and every grant.`)) return;
              start(async () => {
                const r = await deleteCoachResource(item.id);
                if (!r.ok) { alert(r.error); return; }
                onRemove();
              });
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowGrants(!showGrants)}
        className="w-full px-4 py-2.5 border-t border-gray-50 flex items-center justify-between text-[11px] font-semibold text-[var(--tss-navy)]"
      >
        <span>Manage access</span>
        <ChevronDown size={14} className={`text-gray-400 transition ${showGrants ? 'rotate-180' : ''}`} />
      </button>

      {showGrants && (
        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-4 border-t border-gray-50 pt-3">
          <GrantColumn
            label="Coaches"
            people={roster.coaches}
            grantedIds={item.coachIds}
            onToggle={(id, on) => start(async () => {
              const r = await setCoachResourceGrant(id, item.id, on);
              if (!r.ok) { alert(r.error); return; }
              onLocal({ coachIds: on ? [...item.coachIds, id] : item.coachIds.filter((x) => x !== id) });
            })}
            onAll={() => start(async () => {
              const r = await grantResourceToAll(item.id, 'coaches');
              if (!r.ok) { alert(r.error); return; }
              onLocal({ coachIds: roster.coaches.map((c) => c.id) });
            })}
            pending={pending}
          />
          <GrantColumn
            label="Students"
            people={roster.students}
            grantedIds={item.studentIds}
            onToggle={(id, on) => start(async () => {
              const r = await setStudentResourceGrant(id, item.id, on);
              if (!r.ok) { alert(r.error); return; }
              onLocal({ studentIds: on ? [...item.studentIds, id] : item.studentIds.filter((x) => x !== id) });
            })}
            onAll={() => start(async () => {
              const r = await grantResourceToAll(item.id, 'students');
              if (!r.ok) { alert(r.error); return; }
              onLocal({ studentIds: roster.students.map((s) => s.id) });
            })}
            pending={pending}
          />
        </div>
      )}
    </div>
  );
}

function GrantColumn({ label, people, grantedIds, onToggle, onAll, pending }: {
  label: string;
  people: { id: string; name: string }[];
  grantedIds: string[];
  onToggle: (id: string, on: boolean) => void;
  onAll: () => void;
  pending: boolean;
}) {
  const [q, setQ] = useState('');
  const granted = new Set(grantedIds);
  const filtered = useMemo(
    () => people.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    [people, q],
  );
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{label} · {grantedIds.length}/{people.length}</p>
        <button type="button" disabled={pending} onClick={onAll} className="text-[10px] font-semibold text-[var(--tss-navy)] underline underline-offset-2 disabled:opacity-50">
          Grant all
        </button>
      </div>
      <div className="relative mb-1.5">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${label.toLowerCase()}…`} className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
      </div>
      <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
        {filtered.map((p) => {
          const on = granted.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              disabled={pending}
              onClick={() => onToggle(p.id, !on)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${on ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${on ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}`}>
                {on && <Check size={11} strokeWidth={3} />}
              </span>
              <span className="truncate">{p.name}</span>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-[11px] text-gray-400 px-2 py-2">No matches.</p>}
      </div>
    </div>
  );
}
