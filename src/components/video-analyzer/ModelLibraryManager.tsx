'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Video, Pencil, Check, X } from 'lucide-react';
import {
  createModelUploadUrl,
  finalizeModelClip,
  deleteModelClip,
  updateModelClip,
  type ModelClipRow,
} from '@/lib/actions/model-clips';
import { MODEL_CATEGORIES } from '@/lib/constants/model-categories';
import { createClient } from '@/lib/supabase/client';

export function ModelLibraryManager({ clips }: { clips: ModelClipRow[] }) {
  const router = useRouter();
  const [category, setCategory] = useState(MODEL_CATEGORIES[0]?.slug ?? '__custom__');
  const [customName, setCustomName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  // Edición en línea de un clip ya subido (metadatos, no el archivo).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eCat, setECat] = useState('');
  const [eNewCat, setENewCat] = useState('');

  const saveEdit = (id: string) => {
    setError('');
    const catName = eCat === '__new__' ? eNewCat.trim() : eCat;
    if (!eTitle.trim()) { setError('El título no puede quedar vacío.'); return; }
    if (!catName) { setError('Elegí o escribí una categoría.'); return; }
    startTransition(async () => {
      const r = await updateModelClip(id, {
        title: eTitle,
        description: eDesc,
        categoryName: catName,
      });
      if (!r.ok) { setError(r.error); return; }
      setEditingId(null);
      router.refresh();
    });
  };

  const isCustom = category === '__custom__';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isCustom && !customName.trim()) { setError('Name the custom category (e.g. Sequence 4).'); return; }
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!file) { setError('Choose a video file.'); return; }
    const theFile = file;
    startTransition(async () => {
      try {
        const ext = theFile.name.split('.').pop() || 'mp4';
        // 1) get a signed upload URL (admin-gated)
        const up = await createModelUploadUrl(isCustom ? '__custom__' : category, isCustom ? customName.trim() : '', ext);
        if (!up.ok) { setError(up.error); return; }

        // 2) upload the video straight to Storage (no server-action size limit)
        const supabase = createClient();
        const { error: upErr } = await supabase.storage
          .from('tss-library')
          .uploadToSignedUrl(up.path, up.token, theFile, { contentType: theFile.type || 'video/mp4' });
        if (upErr) { setError(upErr.message); return; }

        // 3) record the clip row
        const fin = await finalizeModelClip({
          category: up.category,
          categoryName: up.categoryName,
          title: title.trim(),
          description: description.trim(),
          path: up.path,
        });
        if (!fin.ok) { setError(fin.error); return; }

        setTitle('');
        setDescription('');
        setCustomName('');
        setFile(null);
        const input = document.getElementById('clip-file') as HTMLInputElement | null;
        if (input) input.value = '';
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Upload failed. Please try again.');
      }
    });
  };

  const remove = (id: string) => {
    if (!confirm('Delete this model clip?')) return;
    startTransition(async () => {
      const res = await deleteModelClip(id);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  };

  // Fixed categories first, then any custom ones present in the clips.
  const order: { slug: string; name: string }[] = [...MODEL_CATEGORIES];
  for (const cl of clips) {
    if (!order.some((c) => c.slug === cl.category)) {
      order.push({ slug: cl.category, name: cl.category_name });
    }
  }
  const byCat = order.map((c) => ({
    ...c,
    items: clips.filter((cl) => cl.category === c.slug),
  }));

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Add a model clip
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Short (5–12s) H.264 .mp4, 720p, compressed. Shows in the Video Analyzer for everyone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
            >
              {MODEL_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
              <option value="__custom__">Custom…</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Take Off — front view"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
            />
          </div>
        </div>

        {isCustom && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom category name</label>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Sequence 4"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Details (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What to look at in this clip — key points, what the student should notice."
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Video file</label>
          <input
            id="clip-file"
            type="file"
            accept="video/mp4,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--tss-navy)] file:text-white"
          />
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
          style={{ background: 'var(--tss-navy)' }}
        >
          <Upload size={16} strokeWidth={1.9} />
          {pending ? 'Uploading…' : 'Upload clip'}
        </button>
      </form>

      {/* Existing clips by category */}
      <div className="space-y-4">
        {byCat.map((c) => (
          <div key={c.slug} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>{c.name}</h3>
              <span className="text-[10px] font-mono text-gray-400">{c.items.length}</span>
            </div>
            {c.items.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 italic">No clips yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {c.items.map((clip) => (
                  editingId === clip.id ? (
                    /* Editar sin volver a subir el video: título, detalle y
                       categoría (reclasificar). Pedido de Marcelo 2026-08-25 —
                       antes la única salida era borrar y re-subir. */
                    <div key={clip.id} className="px-4 py-3 space-y-2 bg-gray-50/60">
                      <input
                        value={eTitle}
                        onChange={(e) => setETitle(e.target.value)}
                        placeholder="Título del clip"
                        aria-label="Título del clip"
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                      />
                      <input
                        value={eDesc}
                        onChange={(e) => setEDesc(e.target.value)}
                        placeholder="Detalle (opcional)"
                        aria-label="Detalle del clip"
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={eCat}
                          onChange={(e) => setECat(e.target.value)}
                          aria-label="Categoría"
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs bg-white max-w-[220px]"
                        >
                          {/* Categorías que YA existen — reclasificar sin
                              inventar variantes nuevas del mismo nombre. */}
                          {byCat.map((x) => <option key={x.slug} value={x.name}>{x.name}</option>)}
                          <option value="__new__">+ Categoría nueva…</option>
                        </select>
                        {eCat === '__new__' && (
                          <input
                            value={eNewCat}
                            onChange={(e) => setENewCat(e.target.value)}
                            placeholder="Nombre de la categoría nueva"
                            aria-label="Categoría nueva"
                            className="flex-1 min-w-[160px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                          />
                        )}
                        <div className="flex-1" />
                        <button type="button" onClick={() => setEditingId(null)} disabled={pending}
                          className="text-gray-400 hover:text-gray-600 px-2 py-1" aria-label="Cancelar">
                          <X size={15} strokeWidth={1.9} />
                        </button>
                        <button type="button" onClick={() => saveEdit(clip.id)} disabled={pending}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold bg-[var(--tss-navy)] text-white disabled:opacity-50">
                          <Check size={13} strokeWidth={2.2} /> Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                  <div key={clip.id} className="px-4 py-2.5 flex items-center gap-3">
                    <Video size={15} className="text-[var(--tss-cyan,#5AC3E7)] shrink-0" strokeWidth={1.9} />
                    <div className="flex-1 min-w-0">
                      <a href={clip.video_url} target="_blank" rel="noreferrer" className="text-sm text-gray-700 truncate block hover:underline">
                        {clip.title}
                      </a>
                      {clip.description && (
                        <p className="text-[11px] text-gray-400 truncate">{clip.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(clip.id);
                        setETitle(clip.title);
                        setEDesc(clip.description ?? '');
                        setECat(c.name);
                        setENewCat('');
                        setError('');
                      }}
                      disabled={pending}
                      className="text-gray-400 hover:text-[var(--tss-navy)] disabled:opacity-50"
                      aria-label="Editar clip"
                    >
                      <Pencil size={14} strokeWidth={1.9} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(clip.id)}
                      disabled={pending}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete clip"
                    >
                      <Trash2 size={15} strokeWidth={1.9} />
                    </button>
                  </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
