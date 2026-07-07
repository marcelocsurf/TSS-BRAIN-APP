'use client';

import { useEffect, useState } from 'react';
import { listCoachResources, createCoachResource, deleteCoachResource, type CoachResource } from '@/lib/actions/coach-resources';
import { Presentation, Upload, Trash2 } from 'lucide-react';

export function PresentationsManager() {
  const [items, setItems] = useState<CoachResource[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => { listCoachResources().then(setItems).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file || !title.trim()) { setError('Add a title and pick a PDF.'); return; }
    setBusy(true); setError(null);
    const fd = new FormData();
    fd.set('file', file); fd.set('title', title); fd.set('description', description);
    const res = await createCoachResource(fd);
    setBusy(false);
    if (!res.ok) { setError(res.error || 'Upload failed.'); return; }
    setTitle(''); setDescription(''); setFile(null);
    load();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? It will disappear from every coach who has it.`)) return;
    const res = await deleteCoachResource(id);
    if (!res.ok) { alert(res.error || 'Delete failed.'); return; }
    load();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>Presentations</h1>
        <p className="text-sm text-gray-500 mt-1">Upload PDF decks, then grant them to specific coaches from each coach&apos;s profile.</p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5"><Upload size={12} /> New presentation</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — e.g. Inclusive Coaching" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-lg px-3 py-4 cursor-pointer hover:border-gray-400">
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Presentation size={18} className="text-gray-400" />
          <span className="text-sm text-gray-600">{file ? file.name : 'Choose a PDF…'}</span>
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={upload} disabled={busy} className="w-full py-2.5 rounded-lg bg-[var(--tss-navy)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
          {busy ? 'Uploading…' : 'Upload presentation'}
        </button>
        <p className="text-[11px] text-gray-400">Export your deck as PDF (PowerPoint/Keynote → Export → PDF), then upload it here.</p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No presentations yet.</p>
        ) : items.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--tss-cyan,#5AC3E7)]/15">
              <Presentation size={16} className="text-[var(--tss-cyan,#5AC3E7)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--tss-navy)] truncate">{r.title}</p>
              {r.description && <p className="text-[11px] text-gray-500 truncate">{r.description}</p>}
            </div>
            <button onClick={() => remove(r.id, r.title)} className="text-red-400 hover:text-red-600 shrink-0" aria-label="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
