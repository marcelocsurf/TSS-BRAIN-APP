'use client';

import { useState } from 'react';
import { Package, X } from 'lucide-react';
import { PortalInventory } from '@/components/coach-portal/PortalInventory';

// Opens the general academy inventory (leashes, wax, accessories, etc. — the
// academy_inventory_items list) in a full-screen overlay, so the coordinator
// can check or update counts at any time from the dashboard. Token-gated via
// the coordinator's own portal_token.
export function InventoryLauncher({ token }: { token: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--tss-navy)] text-white flex items-center justify-center shrink-0">
          <Package size={18} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--tss-navy)]">Academy Inventory</p>
          <p className="text-[11px] text-gray-500 leading-snug">Check & update stock counts anytime.</p>
        </div>
      </button>

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
            aria-label="Close inventory"
          >
            <X size={15} /> Close
          </button>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-14">
            <PortalInventory token={token} />
          </div>
        </div>
      )}
    </>
  );
}
