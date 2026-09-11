'use client';
import { useState } from 'react';
import { adminSetStudentBelt } from '@/lib/actions/belt-override';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

export function BeltOverride({ studentId, current }: { studentId: string; current: string }) {
  const [open, setOpen] = useState(false);
  const [belt, setBelt] = useState(current);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">Change belt</button>;
  }
  return (
    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2 max-w-md">
      <p className="text-[11px] text-amber-800">Manual override: skips the water rule and the certification cap. Logged in the internal notes.</p>
      <select value={belt} onChange={(e) => setBelt(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white">
        {(Object.keys(BELT_DISPLAY) as BeltLevel[]).map((k) => <option key={k} value={k}>{BELT_DISPLAY[k].en} — {BELT_DISPLAY[k].levelName}</option>)}
      </select>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white" />
      <div className="flex gap-2">
        <button type="button" disabled={busy || belt === current}
          onClick={async () => {
            if (!confirm(`Change the belt to ${BELT_DISPLAY[belt as BeltLevel]?.en}?`)) return;
            setBusy(true);
            const r = await adminSetStudentBelt(studentId, belt, reason);
            setBusy(false);
            if (!r.ok) { alert(r.error ?? 'Could not save.'); return; }
            setOpen(false);
            window.location.reload();
          }}
          className="h-9 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#061C2B' }}>{busy ? 'Saving…' : 'Save belt'}</button>
        <button type="button" onClick={() => setOpen(false)} className="h-9 px-3 rounded-lg text-sm text-gray-600">Cancel</button>
      </div>
    </div>
  );
}
