'use client';

// Client flow for the public class QR: pick class → email → (existing:
// confirm / new: profile + waiver) → optional coupon → done. Payment is
// always settled at front desk; a courtesy coupon just skips the charge.

import { useState, useTransition } from 'react';
import { lookupPublicStudent, publicEnroll } from '@/lib/actions/public-classes';

const F_LABEL: React.CSSProperties = { fontFamily: 'var(--font-plex), monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' };
const F_DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.08 };

type Klass = {
  id: string; name: string; date: string; time: string | null; minutes: number | null;
  coach: string | null; color: string | null; price_cents: number | null;
  description: string | null;
  video_url?: string | null;
  enrolled: number; capacity: number; full: boolean;
};

const money = (c: number | null) => c == null ? null : `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

const WAIVER_TEXT = `I acknowledge that participation in physical activities (surf, yoga, skate, ice bath, jiujitsu and related training) involves inherent risks, including injury. I declare I am physically able to participate, I have disclosed any relevant medical conditions, and I release the academy and The Surf Sequence from liability arising from ordinary negligence, to the maximum extent permitted by law. I consent to receive first aid / emergency care if needed.`;

export function JoinFlow({ slug, classes }: { slug: string; classes: Klass[] }) {
  const [pending, start] = useTransition();
  const [sel, setSel] = useState<Klass | null>(null);
  const [step, setStep] = useState<'list' | 'email' | 'confirm' | 'profile' | 'done'>('list');
  const [email, setEmail] = useState('');
  const [known, setKnown] = useState<{ first_name: string; waiver_signed: boolean } | null>(null);
  const [coupon, setCoupon] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [acceptWaiver, setAcceptWaiver] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', emergency_contact_name: '', emergency_contact_phone: '', medical_notes: '' });
  const [summary, setSummary] = useState<any>(null);

  const enroll = (profile: boolean) => {
    setErr(null);
    start(async () => {
      const r = await publicEnroll({
        slug,
        campId: sel!.id,
        email,
        coupon: coupon.trim() || null,
        profile: profile ? form : null,
        accept_waiver: acceptWaiver || !!known?.waiver_signed,
        signed_name: signedName || form.first_name || known?.first_name || null,
      });
      if (!r.ok) { setErr(r.error ?? 'Something went wrong.'); return; }
      setSummary(r.summary);
      setStep('done');
    });
  };

  const CouponField = (
    <div>
      <p className="text-[10px] text-gray-400 mb-1" style={F_LABEL}>Have a code?</p>
      <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Optional coupon code"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" />
    </div>
  );

  if (step === 'done' && summary) {
    const free = summary.sale_type === 'courtesy';
    return (
      <div className="space-y-3">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl" style={{ background: 'rgba(6,214,160,.15)' }}>✓</div>
          <h2 className="mt-3 text-[22px]" style={{ ...F_DISPLAY, color: '#061C2B' }}>You&apos;re in, {summary.first_name}!</h2>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>Your class</p>
          <p className="font-bold text-[15px] mt-1" style={{ color: '#061C2B' }}>{summary.class_name}</p>
          <p className="text-[12px] text-gray-500">{fmtDate(summary.date)}{summary.time ? ` · ${summary.time}` : ''}</p>
          {summary.coupon_applied && (
            <p className="text-[11px] mt-1 font-semibold" style={{ color: '#0090B0' }}>Coupon {summary.coupon_applied} applied ✓</p>
          )}
        </div>
        <div className="rounded-2xl p-4" style={{ background: '#061C2B' }}>
          <p className="text-[9px]" style={{ ...F_LABEL, color: '#00D2FF' }}>Before your class</p>
          <p className="text-[13px] mt-1.5 leading-snug" style={{ color: 'rgba(247,249,250,.85)' }}>
            {free
              ? 'Stop by FRONT DESK to pick up your class ticket — you’re all covered.'
              : `Stop by FRONT DESK to pay ${money(summary.amount_cents) ?? 'for your spot'} (cash, card, or charge to your room if you’re a hotel guest) and pick up your class ticket.`}
          </p>
          <p className="text-[11px] mt-2" style={{ color: 'rgba(247,249,250,.5)' }}>Hand your ticket to the instructor. Arrive 10 minutes early. 🤙</p>
        </div>
      </div>
    );
  }

  if (step === 'list') {
    return (
      <div className="space-y-2.5">
        <p className="text-[10px] text-gray-400 px-1" style={F_LABEL}>Upcoming classes</p>
        {classes.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No classes scheduled right now — check with front desk.</p>}
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4" style={{ borderLeft: `4px solid ${c.color ?? '#00D2FF'}` }}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>{fmtDate(c.date)}{c.time ? ` · ${c.time}` : ''}</p>
                <p className="font-bold text-[15px] mt-0.5 truncate" style={{ color: '#061C2B' }}>{c.name}</p>
                <p className="text-[11px] text-gray-400">
                  {c.minutes ? `${c.minutes} min` : ''}{c.coach ? ` · ${c.coach}` : ''}{c.price_cents != null ? ` · ${money(c.price_cents)}` : ''}
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5"
                style={c.full ? { background: 'rgba(255,107,107,.14)', color: '#c04545' } : { background: 'rgba(0,210,255,.12)', color: '#0090B0' }}>
                {c.full ? 'Full' : `${Math.max(0, c.capacity - c.enrolled)} spots`}
              </span>
            </div>
            {(c as any).video_url && (
              <a href={(c as any).video_url} target="_blank" rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: '#061C2B', color: '#00D2FF' }}>
                ▶ Watch what it&apos;s like
              </a>
            )}
            {c.description && (
              <details className="mt-2 group">
                <summary className="cursor-pointer list-none text-[10px]" style={{ ...F_LABEL, color: '#0090B0' }}>
                  About this class <span className="group-open:hidden">＋</span><span className="hidden group-open:inline">−</span>
                </summary>
                <p className="mt-2 text-[12px] leading-relaxed text-gray-600 whitespace-pre-line">{c.description}</p>
              </details>
            )}
            {!c.full && (
              <button type="button" onClick={() => { setSel(c); setStep('email'); setErr(null); }}
                className="mt-3 w-full rounded-full py-2.5 text-[10px]" style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}>
                Join this class
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  const Header = (
    <div className="rounded-2xl px-4 py-3 mb-3" style={{ background: '#061C2B' }}>
      <p className="text-[9px]" style={{ ...F_LABEL, color: '#00D2FF' }}>{sel!.name} · {fmtDate(sel!.date)}{sel!.time ? ` · ${sel!.time}` : ''}</p>
      <button type="button" onClick={() => { setStep('list'); setErr(null); }} className="text-[10px] mt-1" style={{ color: 'rgba(247,249,250,.5)' }}>← change class</button>
    </div>
  );

  if (step === 'email') {
    return (
      <div>
        {Header}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div>
            <p className="font-bold text-[14px]" style={{ color: '#061C2B' }}>Have you trained with us before?</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Enter your email — if you already have a profile we&apos;ll find you.</p>
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
          {err && <p className="text-[11px] text-red-600">{err}</p>}
          <button type="button" disabled={pending || !email.includes('@')}
            onClick={() => { setErr(null); start(async () => {
              const r = await lookupPublicStudent(slug, email);
              if (r.found) { setKnown({ first_name: r.first_name, waiver_signed: r.waiver_signed }); setStep('confirm'); }
              else { setKnown(null); setStep('profile'); }
            }); }}
            className="w-full rounded-full py-3 text-[10px] disabled:opacity-40" style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}>
            {pending ? 'Checking…' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm' && known) {
    return (
      <div>
        {Header}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-[13px]" style={{ color: '#061C2B' }}>
            <b>✓ Found you, {known.first_name}!</b>{' '}
            {known.waiver_signed ? 'Your waiver is already signed.' : 'One thing missing: your waiver.'}
          </p>
          {!known.waiver_signed && (
            <div className="rounded-xl border border-red-100 p-3" style={{ background: 'rgba(255,107,107,.05)' }}>
              <p className="text-[9px] mb-1.5" style={{ ...F_LABEL, color: '#FF6B6B' }}>Liability waiver · required</p>
              <div className="text-[10px] text-gray-500 max-h-20 overflow-y-auto leading-snug">{WAIVER_TEXT}</div>
              <label className="flex items-start gap-2 mt-2 text-[12px]" style={{ color: '#061C2B' }}>
                <input type="checkbox" checked={acceptWaiver} onChange={(e) => setAcceptWaiver(e.target.checked)} className="mt-0.5 h-4 w-4" />
                I have read and accept the waiver
              </label>
              <input value={signedName} onChange={(e) => setSignedName(e.target.value)} placeholder="Type your full name to sign"
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
          )}
          {CouponField}
          {err && <p className="text-[11px] text-red-600">{err}</p>}
          <button type="button" disabled={pending || (!known.waiver_signed && (!acceptWaiver || !signedName.trim()))}
            onClick={() => enroll(false)}
            className="w-full rounded-full py-3 text-[10px] disabled:opacity-40" style={{ ...F_LABEL, background: '#06D6A0', color: '#061C2B' }}>
            {pending ? 'Saving…' : 'Confirm my spot'}
          </button>
        </div>
      </div>
    );
  }

  // step === 'profile' — first-timer
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div>
      {Header}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
        <p className="font-bold text-[14px]" style={{ color: '#061C2B' }}>Create your profile <span className="text-gray-400 font-normal text-[11px]">· 2 min, one time only</span></p>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.first_name} onChange={set('first_name')} placeholder="First name *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
          <input value={form.last_name} onChange={set('last_name')} placeholder="Last name" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
        </div>
        <input value={form.phone} onChange={set('phone')} placeholder="Phone / WhatsApp" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.emergency_contact_name} onChange={set('emergency_contact_name')} placeholder="Emergency contact *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
          <input value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} placeholder="Their phone *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
        </div>
        <textarea value={form.medical_notes} onChange={set('medical_notes')} rows={2} placeholder="Medical conditions, allergies, injuries… or 'none' *"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-3 space-y-2" style={{ borderTop: '3px solid #FF6B6B' }}>
        <p className="text-[9px]" style={{ ...F_LABEL, color: '#FF6B6B' }}>Liability waiver · required</p>
        <div className="text-[10px] text-gray-500 max-h-24 overflow-y-auto leading-snug bg-gray-50 rounded-xl p-3">{WAIVER_TEXT}</div>
        <label className="flex items-start gap-2 text-[12px]" style={{ color: '#061C2B' }}>
          <input type="checkbox" checked={acceptWaiver} onChange={(e) => setAcceptWaiver(e.target.checked)} className="mt-0.5 h-4 w-4" />
          I have read and accept the waiver
        </label>
        <input value={signedName} onChange={(e) => setSignedName(e.target.value)} placeholder="Type your full name to sign"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
      </div>

      <div className="mt-3 space-y-3">
        {CouponField}
        {err && <p className="text-[11px] text-red-600">{err}</p>}
        <button type="button"
          disabled={pending || !form.first_name.trim() || !form.emergency_contact_name.trim() || !form.emergency_contact_phone.trim() || !form.medical_notes.trim() || !acceptWaiver || !signedName.trim()}
          onClick={() => enroll(true)}
          className="w-full rounded-full py-3.5 text-[10px] disabled:opacity-40" style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}>
          {pending ? 'Saving…' : 'Sign & save my spot'}
        </button>
      </div>
    </div>
  );
}
