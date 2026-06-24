'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

// Lets a coordinator/admin download their academy's full camp planning as a
// backup. JSON = faithful nested snapshot (restore if something breaks); CSV =
// readable schedule overview. Both hit GET /camps/export (role + academy scoped).
export function DownloadPlanButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 text-gray-700 transition-all"
      >
        <Download size={15} strokeWidth={1.9} /> Download plan
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 w-60 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
            <a
              href="/camps/export?format=json"
              className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50"
              onClick={() => setOpen(false)}
            >
              <p className="text-sm font-semibold text-[var(--tss-navy)]">Full backup (JSON)</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Complete snapshot — camps, students, sessions, plans, blocks.</p>
            </a>
            <a
              href="/camps/export?format=csv"
              className="block px-4 py-3 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <p className="text-sm font-semibold text-[var(--tss-navy)]">Schedule (CSV)</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Readable overview — one row per camp. Opens in Excel/Sheets.</p>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
