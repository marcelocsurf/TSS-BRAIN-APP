'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Video } from 'lucide-react';
import {
  addModelClip,
  deleteModelClip,
  type ModelClipRow,
} from '@/lib/actions/model-clips';
import { MODEL_CATEGORIES } from '@/lib/constants/model-categories';

export function ModelLibraryManager({ clips }: { clips: ModelClipRow[] }) {
  const router = useRouter();
  const [category, setCategory] = useState(MODEL_CATEGORIES[0].slug);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!file) { setError('Choose a video file.'); return; }
    const fd = new FormData();
    fd.set('category', category);
    fd.set('title', title.trim());
    fd.set('file', file);
    startTransition(async () => {
      const res = await addModelClip(fd);
      if (res.ok) {
        setTitle('');
        setFile(null);
        (document.getElementById('clip-file') as HTMLInputElement | null)?.value &&
          ((document.getElementById('clip-file') as HTMLInputElement).value = '');
        router.refresh();
      } else {
        setError(res.error);
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

  const byCat = MODEL_CATEGORIES.map((c) => ({
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
                  <div key={clip.id} className="px-4 py-2.5 flex items-center gap-3">
                    <Video size={15} className="text-[var(--tss-cyan,#5AC3E7)] shrink-0" strokeWidth={1.9} />
                    <a href={clip.video_url} target="_blank" rel="noreferrer" className="text-sm text-gray-700 truncate flex-1 hover:underline">
                      {clip.title}
                    </a>
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
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
