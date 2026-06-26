'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  listDrills, createDrill, updateDrill, retireDrill, restoreDrill, getStepOptions,
  type DrillRow,
} from '@/lib/actions/drill-library';

const BELTS = ['white', 'yellow', 'blue', 'purple', 'brown', 'black'];
const TYPE_COLORS: Record<string, string> = {
  drill: 'bg-amber-50 text-amber-700',
  mission: 'bg-blue-50 text-blue-700',
};

const empty = {
  title: '', type: 'drill' as 'drill' | 'mission', belt: 'white', step_id: '',
  time_estimate: '', reps_recommended: '', key_words: '', description_md: '',
  success_criteria: '', block_number: '', block_name: '', student_visible: true,
};

export function DrillLibraryManager({ initial }: { initial: DrillRow[] }) {
  const [rows, setRows] = useState<DrillRow[]>(initial);
  const [belt, setBelt] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [includeRetired, setIncludeRetired] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Editor state
  const [editing, setEditing] = useState<null | 'new' | string>(null);
  const [form, setForm] = useState({ ...empty });
  const [steps, setSteps] = useState<{ id: string; title: string }[]>([]);

  const reload = () => {
    startTransition(async () => {
      try { setRows(await listDrills({ belt: belt || undefined, type: type || undefined, q: q || undefined, includeRetired })); }
      catch (e: any) { setError(e.message); }
    });
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [belt, type, includeRetired]);

  // Load step options whenever the form belt changes
  useEffect(() => {
    if (editing === null) return;
    getStepOptions(form.belt).then(setSteps).catch(() => setSteps([]));
  }, [form.belt, editing]);

  const openNew = () => { setForm({ ...empty, belt: belt || 'white' }); setEditing('new'); setError(''); };
  const openEdit = (d: DrillRow) => {
    setForm({
      title: d.title || '', type: d.type, belt: d.belt, step_id: d.step_id || '',
      time_estimate: d.time_estimate?.toString() || '', reps_recommended: d.reps_recommended?.toString() || '',
      key_words: d.key_words || '', description_md: d.description_md || '', success_criteria: d.success_criteria || '',
      block_number: d.block_number?.toString() || '', block_name: d.block_name || '', student_visible: d.student_visible,
    });
    setEditing(d.id); setError('');
  };

  const save = () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    const payload = {
      title: form.title, type: form.type, belt: form.belt,
      step_id: form.step_id || null,
      time_estimate: form.time_estimate ? parseInt(form.time_estimate, 10) : null,
      reps_recommended: form.reps_recommended ? parseInt(form.reps_recommended, 10) : null,
      key_words: form.key_words || null, description_md: form.description_md || null,
      success_criteria: form.success_criteria || null,
      block_number: form.block_number ? parseInt(form.block_number, 10) : null,
      block_name: form.block_name || null, student_visible: form.student_visible,
    };
    startTransition(async () => {
      try {
        if (editing === 'new') await createDrill(payload);
        else if (editing) await updateDrill(editing, payload);
        setEditing(null);
        reload();
      } catch (e: any) { setError(e.message || 'Could not save.'); }
    });
  };

  const retire = (d: DrillRow) => {
    if (!confirm(`Retire "${d.title}"? It will disappear from coach tools and the student sequence (reversible).`)) return;
    startTransition(async () => { try { await retireDrill(d.id); reload(); } catch (e: any) { setError(e.message); } });
  };
  const restore = (d: DrillRow) => {
    startTransition(async () => { try { await restoreDrill(d.id); reload(); } catch (e: any) { setError(e.message); } });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={belt} onChange={(e) => setBelt(e.target.value)} className={sel}>
          <option value="">All belts</option>
          {BELTS.map((b) => <option key={b} value={b} className="capitalize">{b}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={sel}>
          <option value="">All types</option>
          <option value="drill">Drill</option>
          <option value="mission">Mission</option>
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && reload()} placeholder="Search title / step…" className={`${inp} flex-1 min-w-[140px]`} />
        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          <input type="checkbox" checked={includeRetired} onChange={(e) => setIncludeRetired(e.target.checked)} /> Show retired
        </label>
        <button onClick={openNew} className="px-3.5 py-2 bg-[var(--tss-navy)] text-white rounded-lg text-sm font-semibold hover:opacity-90">
          + New
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}

      {/* Editor */}
      {editing !== null && (
        <div className="bg-white border-2 border-[var(--tss-navy)]/20 rounded-xl p-4 space-y-3">
          <p className="text-sm font-bold text-[var(--tss-navy)]">{editing === 'new' ? 'New drill / mission' : 'Edit drill / mission'}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Field label="Type"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className={sel}><option value="drill">Drill (land)</option><option value="mission">Mission (water)</option></select></Field>
            <Field label="Belt"><select value={form.belt} onChange={(e) => setForm({ ...form, belt: e.target.value, step_id: '' })} className={sel}>{BELTS.map((b) => <option key={b} value={b} className="capitalize">{b}</option>)}</select></Field>
            <Field label="Sequence step">
              <select value={form.step_id} onChange={(e) => setForm({ ...form, step_id: e.target.value })} className={sel}>
                <option value="">— No step (not gradable)</option>
                {steps.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.title}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} placeholder="e.g. Pop-up to feet" /></Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Field label="Time (min)"><input value={form.time_estimate} onChange={(e) => setForm({ ...form, time_estimate: e.target.value })} inputMode="numeric" className={inp} /></Field>
            <Field label="Reps"><input value={form.reps_recommended} onChange={(e) => setForm({ ...form, reps_recommended: e.target.value })} inputMode="numeric" className={inp} /></Field>
            <Field label="Block #"><input value={form.block_number} onChange={(e) => setForm({ ...form, block_number: e.target.value })} inputMode="numeric" className={inp} /></Field>
            <Field label="Block name"><input value={form.block_name} onChange={(e) => setForm({ ...form, block_name: e.target.value })} className={inp} /></Field>
          </div>
          <Field label="Keywords (optional)"><input value={form.key_words} onChange={(e) => setForm({ ...form, key_words: e.target.value })} className={inp} placeholder="comma, separated" /></Field>
          <Field label="Description (markdown — same format as the app)">
            <textarea value={form.description_md} onChange={(e) => setForm({ ...form, description_md: e.target.value })} rows={5} className={`${inp} resize-y`} placeholder="What it is, how to do it. Supports **bold**, ==highlight==, bullets, > [!CUE] callouts…" />
          </Field>
          <Field label="Success criteria (one per line)">
            <textarea value={form.success_criteria} onChange={(e) => setForm({ ...form, success_criteria: e.target.value })} rows={3} className={`${inp} resize-y`} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.student_visible} onChange={(e) => setForm({ ...form, student_visible: e.target.checked })} />
            Visible to students <span className="text-xs text-gray-400">(off = coach-only, hidden from the student app)</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditing(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={pending} className="flex-[2] py-2.5 bg-[var(--tss-navy)] text-white rounded-lg text-sm font-bold disabled:opacity-50">
              {pending ? 'Saving…' : 'Save — appears everywhere instantly'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400 italic p-4">No drills match.</p>
        ) : rows.map((d) => (
          <div key={d.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${!d.active ? 'opacity-50' : ''}`}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--tss-navy)] truncate">
                {d.title}
                {!d.student_visible && <span className="ml-2 text-[10px] text-gray-400">· coach-only</span>}
                {!d.active && <span className="ml-2 text-[10px] text-red-400">· retired</span>}
              </p>
              <p className="text-[11px] text-gray-500">
                {[d.step_id, d.time_estimate ? `${d.time_estimate} min` : null, d.reps_recommended ? `${d.reps_recommended} reps` : null].filter(Boolean).join(' · ') || 'no step'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_COLORS[d.type]}`}>{d.type}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{d.belt}</span>
              <button onClick={() => openEdit(d)} className="text-[12px] text-[var(--tss-cyan)] hover:underline">Edit</button>
              {d.active
                ? <button onClick={() => retire(d)} className="text-[12px] text-gray-400 hover:text-red-500">Retire</button>
                : <button onClick={() => restore(d)} className="text-[12px] text-emerald-600 hover:underline">Restore</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = 'w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm';
const sel = 'px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white';
