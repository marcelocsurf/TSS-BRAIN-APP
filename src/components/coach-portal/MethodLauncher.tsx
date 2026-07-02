'use client';

import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

// Opens the static "The Surf Sequence Method" page (public/method.html) in a
// full-screen in-app overlay (iframe). Coach-facing reference.
export function MethodLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl p-4 flex items-center gap-3 border border-white/10 hover:border-[var(--tss-cyan)]/40 transition-colors"
        style={{ background: '#0F1E33' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(90,195,231,.15)' }}>
          <BookOpen size={18} strokeWidth={1.75} className="text-[var(--tss-cyan)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">The Surf Sequence Method</p>
          <p className="text-[11px] text-white/50 leading-snug">Read the full method — doctrine & structure.</p>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-white flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 z-[110] inline-flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur"
            style={{ top: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
            aria-label="Close"
          >
            <X size={15} /> Close
          </button>
          <iframe src="/method.html" title="The Surf Sequence Method" className="flex-1 w-full h-full border-0" />
        </div>
      )}
    </>
  );
}
