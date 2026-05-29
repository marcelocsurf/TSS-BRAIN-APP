'use client';

import { useState, useTransition } from 'react';

// Small inline button shown on the /coaches list next to coaches that
// haven't activated their account yet. Calls /api/coaches/resend-invite
// and surfaces success/failure inline so the admin gets immediate
// feedback without a page refresh.

interface Props {
  coachId: string;
  coachEmail: string;
}

export function ResendInviteButton({ coachId, coachEmail }: Props) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const res = await fetch('/api/coaches/resend-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coach_id: coachId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to resend');
        }
        setStatus('ok');
        setTimeout(() => setStatus('idle'), 3000);
      } catch (err: any) {
        setStatus('err');
        setErrMsg(err.message || 'Failed to resend');
        setTimeout(() => setStatus('idle'), 4000);
      }
    });
  };

  if (status === 'ok') {
    return (
      <span
        className="text-[10px] text-emerald-700 font-mono"
        title={`Re-sent to ${coachEmail}`}
      >
        ✓ Sent
      </span>
    );
  }

  if (status === 'err') {
    return (
      <span className="text-[10px] text-red-600 font-mono" title={errMsg}>
        Failed
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-[10px] text-[var(--tss-cyan,#5AC3E7)] hover:text-[var(--tss-navy)] font-mono uppercase tracking-wider disabled:opacity-50"
      title={`Resend invite to ${coachEmail}`}
    >
      {pending ? '…' : 'Resend invite'}
    </button>
  );
}
