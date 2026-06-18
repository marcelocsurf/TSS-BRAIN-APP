'use client';

import { useState } from 'react';
import { respondToServiceStaffByToken } from '@/lib/actions/service-staff';

const ROLE_LABEL: Record<string, string> = {
  assistant: 'Assistant',
  photographer: 'Photographer',
  filmmaker: 'Filmmaker',
  other: 'Staff',
};

export function RespondClient({
  token,
  row,
}: {
  token: string;
  row: { id: string; role: string; status: string; name: string; camp_name: string; date_range: string };
}) {
  const [done, setDone] = useState<null | 'accepted' | 'declined'>(
    row.status === 'accepted' ? 'accepted' : row.status === 'declined' ? 'declined' : null,
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const respond = async (decision: 'accepted' | 'declined') => {
    setLoading(true);
    setError('');
    const res = await respondToServiceStaffByToken(token, decision, note.trim() || undefined);
    setLoading(false);
    if (res.ok) setDone(decision);
    else setError(res.error || 'Could not record your response.');
  };

  if (done) {
    return (
      <div className="text-center">
        <p className="text-2xl mb-1">{done === 'accepted' ? '✅' : '✖️'}</p>
        <p className="text-sm font-semibold text-[var(--tss-navy)]">
          {done === 'accepted' ? 'You confirmed your participation' : 'You declined the assignment'}
        </p>
        <p className="text-xs text-gray-500 mt-1">{row.camp_name} · {row.date_range}</p>
        <p className="text-[11px] text-gray-400 mt-3">You can close this page. The coordinator was notified.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">
        {ROLE_LABEL[row.role] ?? 'Staff'} · assignment
      </p>
      <h1 className="text-lg font-bold text-[var(--tss-navy)] mt-1 leading-tight">{row.camp_name}</h1>
      <p className="text-sm text-gray-500">{row.date_range}</p>
      <p className="text-xs text-gray-600 mt-3">
        Hi {row.name.split(' ')[0]}, you&apos;ve been assigned as <strong>{(ROLE_LABEL[row.role] ?? 'staff').toLowerCase()}</strong> to this service. Do you confirm?
      </p>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Note (optional)"
        className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-cyan,#5AC3E7)]"
      />
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => respond('declined')}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={() => respond('accepted')}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
          style={{ background: 'var(--tss-navy)' }}
        >
          {loading ? '…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
