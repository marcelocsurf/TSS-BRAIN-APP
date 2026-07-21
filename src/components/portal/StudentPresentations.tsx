'use client';

import { useEffect, useState } from 'react';
import { getMyStudentResources, type CoachResource } from '@/lib/actions/coach-resources';
import { Presentation, X } from 'lucide-react';

// Shows the presentations an admin has granted to this student. Each opens as a
// full-screen in-app PDF viewer. Mirrors the coach CoachPresentations, styled
// for the light student portal. Renders nothing when there are none.
export function StudentPresentations({ token }: { token: string }) {
  const [items, setItems] = useState<CoachResource[]>([]);
  const [open, setOpen] = useState<CoachResource | null>(null);

  useEffect(() => {
    getMyStudentResources(token).then(setItems).catch(() => {});
  }, [token]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-wider px-1 text-gray-400">
        Presentations ({items.length})
      </p>
      {items.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => window.open(r.file_url, '_blank', 'noopener')}
          className="w-full text-left rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3 transition-colors hover:border-gray-300 shadow-sm"
          style={{ borderLeft: '4px solid var(--tss-cyan, #5AC3E7)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(90,195,231,.12)' }}>
            <Presentation size={18} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--tss-navy)] truncate">{r.title}</p>
            {r.description && <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{r.description}</p>}
          </div>
        </button>
      ))}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-3 z-[110] inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur"
            style={{ top: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
            aria-label="Close"
          >
            <X size={15} /> Close
          </button>
          <iframe src={open.file_url} title={open.title} className="flex-1 w-full h-full border-0" />
        </div>
      )}
    </div>
  );
}
