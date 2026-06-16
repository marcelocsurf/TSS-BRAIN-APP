'use client';

import { useState } from 'react';
import { Video, X } from 'lucide-react';
import VideoAnalyzer from './index';

// Reusable launcher: a button that opens the (client-only, lazy-loaded)
// video analyzer in a full-screen overlay. Konva only downloads when the
// overlay is first opened, so this adds nothing to the host page's bundle
// until used. Drop it in the coach portal Tools tab and the admin dashboard.
export function VideoAnalyzerLauncher({
  variant = 'card',
}: {
  variant?: 'card' | 'button';
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === 'card' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--tss-navy)] text-white flex items-center justify-center shrink-0">
            <Video size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">Video Analyzer</p>
            <p className="text-[11px] text-gray-500 leading-snug">
              Draw on a student clip — angles, lines, frame-by-frame.
            </p>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90"
        >
          <Video size={16} strokeWidth={1.75} /> Video Analyzer
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-[#0B1B2B] flex flex-col"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Floating close — no full header bar, so the analyzer gets the
              full height (matters on iPad landscape). */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 z-[110] inline-flex items-center gap-1 rounded-lg bg-black/50 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur"
            style={{ top: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
            aria-label="Close video analyzer"
          >
            <X size={15} /> Close
          </button>
          <div className="flex-1 min-h-0">
            <VideoAnalyzer />
          </div>
        </div>
      )}
    </>
  );
}
