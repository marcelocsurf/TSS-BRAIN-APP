'use client';

import { useState, useTransition } from 'react';
import { requestMembershipRenewal } from '@/lib/actions/memberships';

// M156 — Membership expired: the student's data is safe, the portal asks to
// renew. Student-facing copy in ENGLISH (brand rule). The student REQUESTS;
// the academy confirms the payment (Phase 1 — no online payments yet).

const PLANS = [
  { months: 1, price: '9.99', label: '1 month', tag: null },
  { months: 6, price: '49.99', label: '6 months', tag: 'MOST POPULAR' },
  { months: 12, price: '99.90', label: '12 months', tag: 'BEST VALUE' },
] as const;

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

export function RenewalGate({ token, firstName, beltLabel, endedAt, alreadyRequested }: {
  token: string;
  firstName: string;
  beltLabel: string;
  endedAt: string | null;
  alreadyRequested: boolean;
}) {
  const [months, setMonths] = useState<number>(6);
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
    <div style={{ background: INK, minHeight: '100vh' }} className="flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md text-center">
        <img src="/venue-scout/tss-wave.png" alt="The Surf Sequence" className="h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 22px rgba(0,210,255,.35))' }} />
        <p style={{ ...F_M, color: CYAN }} className="text-[9px] mt-5">The Surf Sequence · Membership</p>
        <h1 style={{ ...F_D, color: PAPER }} className="text-[30px] mt-2 leading-tight">
          {sent ? 'Request sent' : `Welcome back, ${firstName}`}
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
              Your membership {endedAt ? `ended on ${new Date(endedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : 'has ended'}.
              Your <strong style={{ color: GOLD }}>{beltLabel}</strong> journey, courses and logbook are saved and waiting for you.
            </p>
            <div className="grid gap-2.5 mt-7">
              {PLANS.map((p) => (
                <button key={p.months} onClick={() => setMonths(p.months)}
                  className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                  style={months === p.months
                    ? { background: 'rgba(0,210,255,.12)', border: `2px solid ${CYAN}` }
                    : { background: '#0A2438', border: '1px solid rgba(247,249,250,.12)' }}>
                  <span className="text-left">
                    <span className="block text-[15px] font-bold" style={{ color: PAPER }}>{p.label}</span>
                    {p.tag && <span style={{ ...F_M, color: GOLD }} className="text-[8px]">{p.tag}</span>}
                  </span>
                  <span style={{ ...F_D, color: months === p.months ? CYAN : PAPER }} className="text-[22px]">${p.price}</span>
                </button>
              ))}
            </div>
            {err && <p className="text-[12px] mt-3" style={{ color: '#FF6B6B' }}>{err}</p>}
            <button onClick={submit} disabled={pending}
              className="w-full mt-5 py-4 rounded-full text-[12px] font-bold disabled:opacity-50"
              style={{ background: GREEN, color: INK, ...F_M }}>
              {pending ? 'Sending…' : 'Renew my membership →'}
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
