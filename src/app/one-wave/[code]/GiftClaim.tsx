'use client';

import { useState } from 'react';
import { BookOpen, ArrowRight, Mail } from 'lucide-react';
import { redeemBookGift, type GiftState } from '@/lib/actions/book-gift';

// Brand Manual v10 (misma paleta que el portal).
const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };

export function GiftClaim({ code, state }: { code: string; state: GiftState }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await redeemBookGift(code, { firstName, lastName, email });
      if (!r.ok) { setError(r.error); setBusy(false); return; }
      setDone(r.portalUrl);
      // Directo a su portal: el libro está adelante y al centro del Home.
      window.location.href = r.portalUrl;
    } catch {
      setError('Could not open your book. Check your connection and try again.');
      setBusy(false);
    }
  };

  const canSubmit = firstName.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && !busy;

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10" style={{ background: INK }}>
      <div className="w-full max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" className="h-8 mb-6 object-contain" />

        <div className="rounded-2xl overflow-hidden" style={{ background: '#0F1E33', border: `1px solid ${CYAN}40` }}>
          <div className="flex items-center gap-4 p-5" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/web/img/one-wave-cover.jpg" alt="ONE WAVE" className="w-20 h-auto rounded shadow-lg shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px]" style={{ ...F_M, color: CYAN }}>A gift for you</p>
              <p className="text-[24px] mt-1" style={{ ...F_D, color: PAPER }}>One Wave</p>
              <p className="text-[12px] mt-1 leading-snug" style={{ color: 'rgba(247,249,250,.65)' }}>
                The book that opens The Surf Sequence method. By Marcelo Castellanos.
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {state === 'valid' && !done && (
              <>
                <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(247,249,250,.85)' }}>
                  Someone sent you a copy. Tell us who you are and your book opens in your own portal — on any device, whenever you want.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block">
                    <span className="block text-[9px] mb-1" style={{ ...F_M, color: 'rgba(247,249,250,.5)' }}>First name</span>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="Ana"
                      className="w-full px-3 py-2.5 rounded-xl text-[14px] bg-white text-gray-900 border border-transparent focus:outline-none focus:ring-2" style={{ boxShadow: 'none' }} />
                  </label>
                  <label className="block">
                    <span className="block text-[9px] mb-1" style={{ ...F_M, color: 'rgba(247,249,250,.5)' }}>Last name</span>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="García"
                      className="w-full px-3 py-2.5 rounded-xl text-[14px] bg-white text-gray-900 border border-transparent focus:outline-none focus:ring-2" />
                  </label>
                </div>
                <label className="block">
                  <span className="block text-[9px] mb-1" style={{ ...F_M, color: 'rgba(247,249,250,.5)' }}>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" placeholder="ana@email.com"
                    className="w-full px-3 py-2.5 rounded-xl text-[14px] bg-white text-gray-900 border border-transparent focus:outline-none focus:ring-2" />
                  <span className="block text-[11px] mt-1" style={{ color: 'rgba(247,249,250,.5)' }}>
                    <Mail size={11} className="inline mr-1 -mt-0.5" />We email you your portal link so you can come back anytime.
                  </span>
                </label>
                {error && <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: 'rgba(255,107,107,.15)', color: '#FF8A8F' }}>{error}</p>}
                <button type="button" disabled={!canSubmit} onClick={submit}
                  className="w-full h-12 rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.99]"
                  style={{ ...F_M, background: CYAN, color: INK }}>
                  {busy ? 'Opening your book…' : <><BookOpen size={15} /> Open my book <ArrowRight size={14} /></>}
                </button>
              </>
            )}

            {done && (
              <div className="text-center py-2">
                <p className="text-[14px] font-semibold" style={{ color: PAPER }}>Your book is ready.</p>
                <p className="text-[12.5px] mt-1" style={{ color: 'rgba(247,249,250,.65)' }}>Taking you to your portal…</p>
                <a href={done} className="inline-block mt-3 text-[12px] font-semibold underline" style={{ color: CYAN }}>Open it now →</a>
              </div>
            )}

            {state === 'used' && (
              <div className="space-y-3">
                <p className="text-[14px] font-semibold" style={{ color: PAPER }}>This gift link was already used.</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(247,249,250,.65)' }}>
                  If that was you, your portal link is in your email. Lost it? We can send it again.
                </p>
                <a href="/my-portal" className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: CYAN }}>Email me my portal link <ArrowRight size={13} /></a>
              </div>
            )}

            {(state === 'expired' || state === 'not_found') && (
              <div className="space-y-3">
                <p className="text-[14px] font-semibold" style={{ color: PAPER }}>{state === 'expired' ? 'This gift link has expired.' : 'This gift link is not valid.'}</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(247,249,250,.65)' }}>
                  Ask the person who sent it for a new one, or get your copy at thesurfsequence.com.
                </p>
                <a href="https://www.thesurfsequence.com/#libro" className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: CYAN }}>Get ONE WAVE <ArrowRight size={13} /></a>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] mt-5 text-center" style={{ ...F_M, color: 'rgba(247,249,250,.35)' }}>The Surf Sequence · Evolve through play</p>
        <p className="text-[11px] mt-2 text-center" style={{ color: 'rgba(247,249,250,.45)' }}>
          By opening your book you accept our <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms</a> and <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
