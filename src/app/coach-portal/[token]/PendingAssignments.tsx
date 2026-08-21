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
  // SV hoy — si el servicio ya pasó, igual se puede aceptar (historial).
  const svToday = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
  const alreadyPast = assignment.end_date < svToday;

  const respond = (response: 'accepted' | 'rejected') => {
    setError('');
    startTransition(async () => {
      try {
        const res = await respondToAssignment({
          token,
          campInstanceId: assignment.id,
          response,
          note: response === 'rejected' ? note : null,
        });
        if (!res?.success) {
          setError(res?.error || 'Could not send your response.');
          return;
        }
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
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4" style={{ borderLeft: '4px solid #00D2FF' }}>
      <div className="flex items-start gap-2.5 mb-3">
        <CalendarClock size={18} className="shrink-0 mt-0.5" style={{ color: '#0090B0' }} />
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#0090B0]">
            New service — please confirm
          </p>
          <p className="text-sm font-bold text-[var(--tss-navy)] truncate">{assignment.camp_name}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {dateRange}
            {assignment.scheduled_time ? ` · ${assignment.scheduled_time}` : ''}
          </p>
          {alreadyPast && (
            <p className="text-[11px] text-amber-700 mt-1">
              This service already ran — accept it if you coached it, so your record and payroll stay right.
            </p>
          )}
        </div>
      </div>

      {mode === 'rejecting' ? (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason (optional) — e.g. I'm not available that week"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => respond('rejected')}
              disabled={pending}
              className="flex-1 py-2.5 text-white rounded-full text-sm font-bold disabled:opacity-50" style={{ background: '#FF6B6B' }}
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
            className="flex-1 py-2.5 rounded-full text-sm font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ background: '#00D2FF', color: '#061C2B' }}
          >
            <Check size={16} /> {pending ? 'Sending…' : 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => setMode('rejecting')}
            disabled={pending}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-gray-50 disabled:opacity-50"
          >
            <X size={16} /> Decline
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
