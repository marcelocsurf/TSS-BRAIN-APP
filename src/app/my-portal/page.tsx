'use client';

// Public page: a student on any device gets back into their portal with just
// their email — we send them their magic portal link. No passwords, ever.

import { useState } from 'react';
import { requestPortalLink } from '@/lib/actions/portal-access';
import { Waves, MailCheck } from 'lucide-react';

export default function MyPortalPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      await requestPortalLink(email);
    } catch {
      /* neutral — the page never reveals errors */
    }
    setBusy(false);
    setSent(true);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: '#0A1628' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(90,195,231,.15)', border: '1px solid rgba(90,195,231,.35)' }}
          >
            <Waves size={26} strokeWidth={1.75} style={{ color: '#5AC3E7' }} />
          </div>
          <h1
            className="text-xl font-bold text-white mt-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            The Surf Sequence
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8aa0b2' }}>
            Student portal access
          </p>
        </div>

        {sent ? (
          <div className="rounded-2xl p-5 text-center" style={{ background: '#0F1E33', border: '1px solid rgba(255,255,255,.08)' }}>
            <MailCheck size={28} strokeWidth={1.75} className="mx-auto" style={{ color: '#34D399' }} />
            <p className="text-sm font-semibold text-white mt-3">Check your inbox</p>
            <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: '#8aa0b2' }}>
              If <span className="text-white/90">{email.trim()}</span> is registered with us, your portal link is on its way. Check spam too.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 text-[12px] font-semibold"
              style={{ color: '#5AC3E7' }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: '#0F1E33', border: '1px solid rgba(255,255,255,.08)' }}
          >
            <p className="text-[13px] leading-relaxed" style={{ color: '#8aa0b2' }}>
              Enter the email you registered with and we&apos;ll send you your personal portal link. No password needed.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)' }}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl py-3 text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: '#5AC3E7', color: '#0A1628' }}
            >
              {busy ? 'Sending…' : 'Email me my portal link'}
            </button>
          </form>
        )}

        <p className="text-center text-[11px] mt-5" style={{ color: '#54677a' }}>
          Coaches sign in at{' '}
          <a href="/login" className="underline" style={{ color: '#8aa0b2' }}>
            the coach login
          </a>
          .
        </p>
      </div>
    </div>
  );
}
