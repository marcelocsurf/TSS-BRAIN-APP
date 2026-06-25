'use client';

import { useState } from 'react';
import { Warehouse, X } from 'lucide-react';
import { BoardInventoryManager } from './BoardInventoryManager';

// Opens the Board Inventory & Rentals manager in a full-screen overlay.
// Separate concern from the Board Selector (which only recommends specs).
export function BoardInventoryLauncher({
  academyId,
  variant = 'card',
}: {
  academyId: string;
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
            <Warehouse size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--tss-navy)]">Board Inventory & Rentals</p>
            <p className="text-[11px] text-gray-500 leading-snug">Manage boards, statuses & rent to walk-ins.</p>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90"
        >
          <Warehouse size={16} strokeWidth={1.75} /> Inventory
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
            aria-label="Close board inventory"
          >
            <X size={15} /> Close
          </button>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <BoardInventoryManager academyId={academyId} />
          </div>
        </div>
      )}
    </>
  );
}
