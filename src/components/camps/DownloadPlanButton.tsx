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
        className="inline-flex items-center gap-2 px-3 py-2.5 border border-[#DCD7C6] text-sm rounded-[5px] hover:bg-[#F7F9FA] text-[#10263B] transition-all"
      >
        <Download size={15} strokeWidth={1.9} /> Download plan
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 w-60 bg-[#F7F9FA] border border-[#DCD7C6] rounded-lg shadow-lg overflow-hidden">
            <a
              href="/camps/export?format=json"
              className="block px-4 py-3 hover:bg-[#F7F9FA] border-b border-[#DCD7C6]"
              onClick={() => setOpen(false)}
            >
              <p className="text-sm font-semibold text-[var(--tss-navy)]">Full backup (JSON)</p>
              <p className="text-[11px] text-[#55666E] mt-0.5">Complete snapshot — camps, students, sessions, plans, blocks.</p>
            </a>
            <a
              href="/camps/export?format=csv"
              className="block px-4 py-3 hover:bg-[#F7F9FA]"
              onClick={() => setOpen(false)}
            >
              <p className="text-sm font-semibold text-[var(--tss-navy)]">Schedule (CSV)</p>
              <p className="text-[11px] text-[#55666E] mt-0.5">Readable overview — one row per camp. Opens in Excel/Sheets.</p>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
