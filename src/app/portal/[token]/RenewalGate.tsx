'use client';

import { useState, useTransition } from 'react';
import { requestMembershipRenewal } from '@/lib/actions/memberships';

// M156 — Membership expired: the student's data is safe, the portal asks to
// renew. Student-facing copy in ENGLISH (brand rule). The student REQUESTS;
// the academy confirms the payment (Phase 1 — no online payments yet).

import { MEMBERSHIP_MONTHS, MEMBERSHIP_PLANS } from '@/lib/constants/membership';

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

export function RenewalGate({ token, firstName, beltLabel, endedAt, alreadyRequested, inline = false }: {
  token: string;
  firstName: string;
  beltLabel: string;
  endedAt: string | null;
  alreadyRequested: boolean;
  /** Dentro de la pestaña Let's Play (2026-09-08): sin pantalla completa ni logo. */
  inline?: boolean;
}) {
  const months = MEMBERSHIP_MONTHS;
  const [sent, setSent] = useState(alreadyRequested);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => start(async () => {
    setErr(null);
    const res = await requestMembershipRenewal(token, months);
    if (!res.ok) { setErr(res.error || 'Something went wrong — try again.'); return; }
    setSent(true);
  });

  return (
    <div style={{ background: INK, minHeight: inline ? undefined : '100vh', borderRadius: inline ? 24 : undefined }} className={`flex items-center justify-center px-5 ${inline ? 'py-8' : 'py-10'}`}>
      <div className="w-full max-w-md text-center">
        {!inline && (
        <img src="/venue-scout/tss-wave.png" alt="The Surf Sequence" className="h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 22px rgba(0,210,255,.35))' }} />
        )}
        <p style={{ ...F_M, color: CYAN }} className="text-[9px] mt-5">The Surf Sequence · Membership</p>
        <h1 style={{ ...F_D, color: PAPER }} className={`${inline ? 'text-[24px]' : 'text-[30px]'} mt-2 leading-tight`}>
          {sent ? 'Request sent' : inline ? `Keep training, ${firstName}` : `Welcome back, ${firstName}`}
        </h1>

        {sent ? (
          <>
            <p className="text-[15px] mt-4" style={{ color: 'rgba(247,249,250,.75)' }}>
              The academy will confirm your payment and your access will unlock right away.
              Pay at the front desk or ask your coach — we&apos;ll take care of the rest. 🤙
            </p>
            <p style={{ ...F_M, color: 'rgba(247,249,250,.4)' }} className="text-[9px] mt-6">
              Your progress is safe — nothing gets deleted, ever.
            </p>
          </>
        ) : (
          <>
            <p className="text-[14.5px] mt-3" style={{ color: 'rgba(247,249,250,.75)' }}>
              {inline ? "Let's Play, your session log and your progress are your training tool. Every course includes a year of it; after that it renews. " : ''}Your training tool {endedAt ? `ended on ${new Date(endedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : 'has ended'}.
              Your <strong style={{ color: GOLD }}>{beltLabel}</strong> journey, courses and logbook are saved and waiting for you.
            </p>
            <div className="rounded-2xl px-4 py-4 mt-7 flex items-center justify-between" style={{ background: 'rgba(0,210,255,.12)', border: `2px solid ${CYAN}` }}>
              <span className="text-left">
                <span className="block text-[15px] font-bold" style={{ color: PAPER }}>Training tool · {MEMBERSHIP_PLANS[0].label}</span>
                <span style={{ ...F_M, color: GOLD }} className="text-[8px]">Let&apos;s Play · sessions · hours · progress</span>
              </span>
              <span style={{ ...F_D, color: CYAN }} className="text-[22px]">${MEMBERSHIP_PLANS[0].price}</span>
            </div>
            {err && <p className="text-[12px] mt-3" style={{ color: '#FF6B6B' }}>{err}</p>}
            <button onClick={submit} disabled={pending}
              className="w-full mt-5 py-4 rounded-full text-[12px] font-bold disabled:opacity-50"
              style={{ background: GREEN, color: INK, ...F_M }}>
              {pending ? 'Sending…' : 'Renew for a year →'}
            </button>
            <p className="text-[11.5px] mt-4" style={{ color: 'rgba(247,249,250,.45)' }}>
              Pay at the academy (cash or card) — your access unlocks the moment they confirm.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
