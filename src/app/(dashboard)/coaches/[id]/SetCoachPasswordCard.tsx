'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Copy, Check } from 'lucide-react';
import { setCoachTempPassword } from '@/lib/actions/coach-password';

// Admin-only fallback: set a coach's password directly when the email
// activation link won't work. The coach then logs in with email + this password.
export function SetCoachPasswordCard({ coachId }: { coachId: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const suggest = () => {
    // Readable temp password: e.g. "Surf-7421". Admin can also type their own.
    const n = Math.floor(1000 + (Date.now() % 9000));
    setPassword(`Surf-${n}`);
    setDone(false);
    setError('');
  };

  const save = () => {
    setError('');
    if (password.trim().length < 8) { setError('Password must be at least 8 characters.'); return; }
    startTransition(async () => {
      const res = await setCoachTempPassword(coachId, password.trim());
      if (res.ok) { setDone(true); router.refresh(); }
      else setError(res.error);
    });
  };

  const copy = () => {
    navigator.clipboard.writeText(password.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound size={16} className="text-[var(--tss-cyan,#5AC3E7)]" strokeWidth={1.9} />
        <h3 className="text-base font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Set password manually
        </h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Use this if the email activation link won't work. Set a temporary password, share it with the coach,
        and they log in with their email + this password (they can change it later).
      </p>

      <div className="flex gap-2">
        <input
          value={password}
          onChange={(e) => { setPassword(e.target.value); setDone(false); }}
          placeholder="Temporary password"
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
        />
        <button type="button" onClick={suggest} className="px-3 py-2.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0">
          Suggest
        </button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}

      {done ? (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3">
          <p className="text-sm font-semibold text-green-800">Password set ✓</p>
          <p className="text-xs text-green-700 mt-1">Share this with the coach (email + password):</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 text-sm bg-white border border-green-200 rounded-lg px-3 py-2 font-mono text-[var(--tss-navy)]">{password.trim()}</code>
            <button type="button" onClick={copy} className="px-3 py-2 rounded-lg border border-green-200 text-green-700 text-xs font-semibold inline-flex items-center gap-1">
              {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="w-full py-3 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
          style={{ background: 'var(--tss-navy)' }}
        >
          {pending ? 'Setting…' : 'Set password'}
        </button>
      )}
    </div>
  );
}
