'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { finalizeParticipant, reopenParticipant } from '@/lib/actions/camps';
import { CheckCircle2, LogOut, RotateCcw } from 'lucide-react';

// Lets a coach close out a single student early (short camp or early departure).
// Finalizing records the departure date and links to the closing evaluation.
export function FinalizeParticipantControl({
  participantId,
  campId,
  studentName,
  finalizedAt,
  departedOn,
}: {
  participantId: string;
  campId: string;
  studentName: string;
  finalizedAt: string | null;
  departedOn: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const finalize = async () => {
    setBusy(true);
    const res = await finalizeParticipant(participantId, campId, date);
    setBusy(false);
    if (!res.ok) { alert(res.error || 'Could not finalize.'); return; }
    setOpen(false);
    router.refresh();
  };

  const reopen = async () => {
    if (!confirm(`Reopen ${studentName}? They will be active in the camp again.`)) return;
    setBusy(true);
    const res = await reopenParticipant(participantId, campId);
    setBusy(false);
    if (!res.ok) { alert(res.error || 'Could not reopen.'); return; }
    router.refresh();
  };

  if (finalizedAt) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
          <CheckCircle2 size={11} strokeWidth={2} />
          Finished{departedOn ? ` · ${departedOn}` : ''}
        </span>
        <button onClick={reopen} disabled={busy} title="Reopen" className="text-gray-300 hover:text-gray-600">
          <RotateCcw size={13} />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--tss-navy)] border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-50"
      >
        <LogOut size={11} strokeWidth={2} /> Finalize
      </button>
    );
  }

  return (
    <div className="shrink-0 flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="text-[11px] border border-gray-200 rounded px-1 py-0.5"
        title="Departure date"
      />
      <Link
        href={`/camps/${campId}/evaluate`}
        className="text-[10px] text-[var(--tss-cyan,#5AC3E7)] hover:underline"
        title="Do the closing evaluation"
      >
        Evaluate
      </Link>
      <button onClick={finalize} disabled={busy} className="text-[10px] font-semibold text-white bg-[var(--tss-navy)] rounded px-2 py-1 disabled:opacity-50">
        {busy ? '…' : 'Finish'}
      </button>
      <button onClick={() => setOpen(false)} className="text-[10px] text-gray-400">✕</button>
    </div>
  );
}
