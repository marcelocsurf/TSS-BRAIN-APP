'use client';

// Invitaciones de STAFF (asistente / filmer / fotógrafo) pendientes, en el
// Home del portal — antes solo llegaban por email y nadie las respondía:
// el coach vive en el app, no en su correo. Espejo de PendingAssignments.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { respondToServiceStaffByToken } from '@/lib/actions/service-staff';
import { HandHelping, Check, X } from 'lucide-react';

export interface StaffInvite {
  id: string;
  role: string;
  response_token: string;
  camp_name: string;
  start_date: string;
  end_date: string;
  scheduled_time?: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  assistant: 'Assistant',
  photographer: 'Photographer',
  filmmaker: 'Filmmaker',
  other: 'Staff',
};

export function PendingStaffInvites({ invites }: { invites: StaffInvite[] }) {
  if (!invites || invites.length === 0) return null;
  return (
    <div className="space-y-3 mb-5">
      {invites.map((i) => (
        <InviteCard key={i.id} invite={i} />
      ))}
    </div>
  );
}

function InviteCard({ invite }: { invite: StaffInvite }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | 'accepted' | 'declined'>(null);

  const dateRange =
    invite.start_date === invite.end_date
      ? invite.start_date
      : `${invite.start_date} → ${invite.end_date}`;

  const respond = (decision: 'accepted' | 'declined') => {
    setError('');
    startTransition(async () => {
      const r = await respondToServiceStaffByToken(
        invite.response_token,
        decision,
        decision === 'declined' ? note : undefined,
      );
      if (!r.ok) { setError(r.error || 'Could not send your response.'); return; }
      setDone(decision);
      router.refresh();
    });
  };

  if (done) {
    return (
      <div className={`rounded-2xl border p-4 ${done === 'accepted' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <p className="text-sm font-semibold text-[var(--tss-navy)]">
          {done === 'accepted' ? 'Accepted ✓' : 'Declined'} — {invite.camp_name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Your coordinator has been notified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4" style={{ borderLeft: '4px solid #FFD166' }}>
      <div className="flex items-start gap-2.5 mb-3">
        <HandHelping size={18} className="shrink-0 mt-0.5" style={{ color: '#B8860B' }} />
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em]" style={{ color: '#B8860B' }}>
            {ROLE_LABEL[invite.role] ?? 'Staff'} invite — please confirm
          </p>
          <p className="text-sm font-bold text-[var(--tss-navy)] truncate">{invite.camp_name}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {dateRange}
            {invite.scheduled_time ? ` · ${String(invite.scheduled_time).slice(0, 5)}` : ''}
          </p>
        </div>
      </div>

      {mode === 'rejecting' ? (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason (optional) — e.g. I'm not available that day"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/50"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => respond('declined')} disabled={pending}
              className="flex-1 py-2.5 text-white rounded-full text-sm font-bold disabled:opacity-50" style={{ background: '#FF6B6B' }}>
              {pending ? 'Sending…' : 'Confirm decline'}
            </button>
            <button type="button" onClick={() => { setMode('idle'); setError(''); }} className="px-3 py-2.5 text-sm text-gray-500">
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => respond('accepted')} disabled={pending}
            className="flex-1 py-2.5 rounded-full text-sm font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ background: '#00D2FF', color: '#061C2B' }}>
            <Check size={16} /> {pending ? 'Sending…' : 'Accept'}
          </button>
          <button type="button" onClick={() => setMode('rejecting')} disabled={pending}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-gray-50 disabled:opacity-50">
            <X size={16} /> Decline
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
