'use client';

import { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import BoardSelector from './index';

// One-click launcher: opens the Board Selector in a full-screen overlay.
// Lazy-loaded (nothing downloads until opened), no backend. Drop it in the
// coach Tools tab and the academy dashboard.
export function BoardSelectorLauncher({
  variant = 'card',
  title = 'Board Selector',
  subtitle = 'Recommend board volume, type, dimensions & fins.',
}: {
  variant?: 'card' | 'button';
  title?: string;
  subtitle?: string;
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
            <Calculator size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">{title}</p>
            <p className="text-[11px] text-gray-500 leading-snug">{subtitle}</p>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90"
        >
          <Calculator size={16} strokeWidth={1.75} /> Board Selector
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-[#0A1628] flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 z-[110] inline-flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur"
            style={{ top: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
            aria-label="Close board selector"
          >
            <X size={15} /> Close
          </button>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <BoardSelector />
          </div>
        </div>
      )}
    </>
  );
}
