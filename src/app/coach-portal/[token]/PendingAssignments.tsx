'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { respondToAssignment } from '@/lib/actions/camps';
import { CalendarClock, Check, X } from 'lucide-react';

interface Assignment {
  id: string;
  camp_name: string;
  start_date: string;
  end_date: string;
  scheduled_time?: string | null;
}

export function PendingAssignments({
  token,
  assignments,
}: {
  token: string;
  assignments: Assignment[];
}) {
  if (!assignments || assignments.length === 0) return null;
  return (
    <div className="space-y-3 mb-5">
      {assignments.map((a) => (
        <AssignmentCard key={a.id} token={token} assignment={a} />
      ))}
    </div>
  );
}

function AssignmentCard({ token, assignment }: { token: string; assignment: Assignment }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | 'accepted' | 'rejected'>(null);

  const dateRange =
    assignment.start_date === assignment.end_date
      ? assignment.start_date
      : `${assignment.start_date} → ${assignment.end_date}`;

  const respond = (response: 'accepted' | 'rejected') => {
    setError('');
    startTransition(async () => {
      try {
        await respondToAssignment({
          token,
          campInstanceId: assignment.id,
          response,
          note: response === 'rejected' ? note : null,
        });
        setDone(response);
        router.refresh();
      } catch (e: any) {
        setError(e?.message || 'Could not send your response.');
      }
    });
  };

  if (done) {
    return (
      <div
        className={`rounded-2xl border p-4 ${
          done === 'accepted'
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-rose-50 border-rose-200'
        }`}
      >
        <p className="text-sm font-semibold text-[var(--tss-navy)]">
          {done === 'accepted' ? 'Accepted ✓' : 'Declined'} — {assignment.camp_name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Your coordinator has been notified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-2.5 mb-3">
        <CalendarClock size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700">
            New service — please confirm
          </p>
          <p className="text-sm font-bold text-[var(--tss-navy)] truncate">{assignment.camp_name}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {dateRange}
            {assignment.scheduled_time ? ` · ${assignment.scheduled_time}` : ''}
          </p>
        </div>
      </div>

      {mode === 'rejecting' ? (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason (optional) — e.g. I'm not available that week"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => respond('rejected')}
              disabled={pending}
              className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {pending ? 'Sending…' : 'Confirm decline'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('idle'); setError(''); }}
              className="px-3 py-2.5 text-sm text-gray-500"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => respond('accepted')}
            disabled={pending}
            className="flex-1 py-2.5 bg-[var(--tss-navy)] text-white rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Check size={16} /> {pending ? 'Sending…' : 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => setMode('rejecting')}
            disabled={pending}
            className="flex-1 py-2.5 border border-rose-300 text-rose-700 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <X size={16} /> Decline
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
