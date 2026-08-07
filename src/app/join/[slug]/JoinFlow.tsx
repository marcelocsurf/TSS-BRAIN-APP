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
  template_name?: string | null;
  video_url?: string | null;
  enrolled: number; capacity: number; full: boolean;
};

const money = (c: number | null) => c == null ? null : `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
const fmtDayShort = (d: string, today: string) => {
  if (d === today) return 'TODAY';
  const dt = new Date(d + 'T00:00:00'), t = new Date(today + 'T00:00:00');
  if (Math.round((dt.getTime() - t.getTime()) / 86400000) === 1) return 'TOMORROW';
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
};

// YouTube (incl. Shorts) y Vimeo → miniatura + reproducción EMBEBIDA, para que
// el cliente nunca salga de la página de la academia.
function videoIds(url: string | null | undefined): { thumb: string | null; embed: string | null } {
  if (!url) return { thumb: null, embed: null };
  const yt = url.match(/(?:youtu\.be\/|\/shorts\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return { thumb: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`, embed: `https://www.youtube.com/embed/${yt[1]}?rel=0&playsinline=1&autoplay=1` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { thumb: null, embed: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  return { thumb: null, embed: null };
}

// Un "tipo de actividad" agrupa todas las fechas del mismo servicio: el cliente
// elige QUÉ quiere hacer y después CUÁNDO (en vez de una lista cronológica
// revuelta de cientos de sesiones).
type Activity = {
  key: string; label: string; color: string | null; price_cents: number | null;
  minutes: number | null; description: string | null; video_url: string | null;
  sessions: Klass[]; openCount: number;
};
function groupActivities(classes: Klass[]): Activity[] {
  const map = new Map<string, Activity>();
  for (const c of classes) {
    const key = c.template_name || (c.name || '').split(' · ')[0].trim() || 'Class';
    const a = map.get(key) ?? {
      key, label: key, color: c.color, price_cents: c.price_cents, minutes: c.minutes,
      description: c.description, video_url: c.video_url ?? null, sessions: [], openCount: 0,
    };
    a.sessions.push(c);
    if (!c.full) a.openCount++;
    if (!a.video_url && c.video_url) a.video_url = c.video_url;
    if (!a.description && c.description) a.description = c.description;
    map.set(key, a);
  }
  return [...map.values()].sort((x, y) => (y.openCount - x.openCount) || x.label.localeCompare(y.label));
}

const WAIVER_TEXT = `I acknowledge that participation in physical activities (surf, yoga, skate, ice bath, jiujitsu and related training) involves inherent risks, including injury. I declare I am physically able to participate, I have disclosed any relevant medical conditions, and I release the academy and The Surf Sequence from liability arising from ordinary negligence, to the maximum extent permitted by law. I consent to receive first aid / emergency care if needed.`;

export function JoinFlow({ slug, classes }: { slug: string; classes: Klass[] }) {
  const [pending, start] = useTransition();
  const [sel, setSel] = useState<Klass | null>(null);
  const [step, setStep] = useState<'list' | 'email' | 'confirm' | 'profile' | 'done'>('list');
  // Menú por actividad + video embebido (nunca sacamos al cliente de la página)
  const [openActivity, setOpenActivity] = useState<string | null>(null);
  const [videoOf, setVideoOf] = useState<Activity | null>(null);
  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
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
    // Las lecciones de surf no se pagan en el mostrador: se cobra por link.
    const payByLink = !free && summary.service_kind === 'surf_lesson';
    return (
      <div className="space-y-3">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl" style={{ background: 'rgba(6,214,160,.15)' }}>✓</div>
          <h2 className="mt-3 text-[22px]" style={{ ...F_DISPLAY, color: '#061C2B' }}>
            {payByLink ? `Spot reserved, ${summary.first_name}!` : `You’re in, ${summary.first_name}!`}
          </h2>
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
          <p className="text-[9px]" style={{ ...F_LABEL, color: '#00D2FF' }}>{payByLink ? 'One more step' : 'Before your class'}</p>
          <p className="text-[13px] mt-1.5 leading-snug" style={{ color: 'rgba(247,249,250,.85)' }}>
            {free
              ? 'Stop by FRONT DESK to pick up your class ticket — you’re all covered.'
              : payByLink
                ? `We’ll send you a payment link${money(summary.amount_cents) ? ` for ${money(summary.amount_cents)}` : ''} to complete your booking. Your spot is on hold until then.`
                : `Stop by FRONT DESK to pay ${money(summary.amount_cents) ?? 'for your spot'} (cash, card, or charge to your room if you’re a hotel guest) and pick up your class ticket.`}
          </p>
          <p className="text-[11px] mt-2" style={{ color: 'rgba(247,249,250,.5)' }}>
            {payByLink
              ? 'Any questions before then, front desk has you covered. Arrive 10 minutes early. 🤙'
              : 'Hand your ticket to the instructor. Arrive 10 minutes early. 🤙'}
          </p>
        </div>
      </div>
    );
  }

  // Ventana de video: se abre SOBRE la página; al cerrar, el cliente sigue
  // exactamente donde estaba (nada de mandarlo a YouTube y perderlo).
  const VideoModal = videoOf && (() => {
    const { embed } = videoIds(videoOf.video_url);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(6,28,43,.88)' }}
        onClick={() => setVideoOf(null)}>
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px]" style={{ ...F_LABEL, color: '#00D2FF' }}>{videoOf.label}</p>
            <button type="button" onClick={() => setVideoOf(null)} className="text-[22px] leading-none px-2" style={{ color: 'rgba(247,249,250,.7)' }} aria-label="Close">×</button>
          </div>
          {embed ? (
            <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '9 / 16', maxHeight: '70vh' }}>
              <iframe src={embed} title={videoOf.label} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen
                className="w-full h-full" style={{ border: 0 }} />
            </div>
          ) : (
            <a href={videoOf.video_url ?? '#'} target="_blank" rel="noreferrer" className="block text-center rounded-2xl py-4 text-[12px]"
              style={{ background: '#0A2438', color: '#00D2FF' }}>Open video ↗</a>
          )}
          <button type="button" onClick={() => setVideoOf(null)}
            className="mt-3 w-full rounded-full py-3 text-[10px]" style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}>
            Back to classes
          </button>
        </div>
      </div>
    );
  })();

  if (step === 'list') {
    const activities = groupActivities(classes);
    return (
      <div className="space-y-2.5">
        {VideoModal}
        <p className="text-[10px] text-gray-400 px-1" style={F_LABEL}>What do you want to do?</p>
        {activities.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No classes scheduled right now — check with front desk.</p>}

        {activities.map((a) => {
          const isOpen = openActivity === a.key;
          const { thumb } = videoIds(a.video_url);
          const next = a.sessions.filter((s) => !s.full);
          return (
            <div key={a.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              style={{ borderLeft: `4px solid ${a.color ?? '#00D2FF'}` }}>
              {/* Cabecera de la actividad: miniatura del video + datos clave */}
              <button type="button" onClick={() => setOpenActivity(isOpen ? null : a.key)} className="w-full text-left flex items-stretch gap-3">
                {thumb ? (
                  <span className="relative shrink-0 w-[92px] h-[92px] bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt="" className="w-full h-full object-cover opacity-90" />
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setVideoOf(a); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setVideoOf(a); } }}
                      className="absolute inset-0 flex items-center justify-center text-[26px] cursor-pointer"
                      style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,.6)' }}
                      aria-label={`Play ${a.label} video`}
                    >▶</span>
                  </span>
                ) : null}
                <span className="flex-1 min-w-0 py-3 pr-3">
                  <span className="block font-bold text-[15px] truncate" style={{ color: '#061C2B' }}>{a.label}</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">
                    {a.minutes ? `${a.minutes} min` : ''}{a.price_cents != null ? ` · ${money(a.price_cents)}` : ''}
                  </span>
                  <span className="block text-[11px] mt-1 font-semibold" style={{ color: next.length ? '#0090B0' : '#c04545' }}>
                    {next.length ? `${next.length} date${next.length === 1 ? '' : 's'} available · ${isOpen ? 'hide' : 'see times'}` : 'Fully booked'}
                  </span>
                </span>
              </button>

              {/* Horarios de ESTA actividad, agrupados por día */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-3 py-3 space-y-2.5">
                  {a.description && (
                    <p className="text-[12px] leading-relaxed text-gray-600 whitespace-pre-line">{a.description}</p>
                  )}
                  {a.video_url && (
                    <button type="button" onClick={() => setVideoOf(a)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full"
                      style={{ background: '#061C2B', color: '#00D2FF' }}>
                      ▶ Watch what it&apos;s like
                    </button>
                  )}
                  {Object.entries(
                    a.sessions.reduce((acc: Record<string, Klass[]>, s) => {
                      (acc[s.date] = acc[s.date] ?? []).push(s); return acc;
                    }, {})
                  ).slice(0, 14).map(([date, list]) => (
                    <div key={date}>
                      <p className="text-[9px] mb-1" style={{ ...F_LABEL, color: '#0090B0' }}>{fmtDayShort(date, today)}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((s) => (
                          <button key={s.id} type="button" disabled={s.full}
                            onClick={() => { setSel(s); setStep('email'); setErr(null); }}
                            className="text-[12px] font-bold px-3 py-2 rounded-xl disabled:opacity-40"
                            style={s.full
                              ? { background: '#fff', border: '1px solid #eee', color: '#999' }
                              : { background: '#fff', border: '1.5px solid #00D2FF', color: '#061C2B' }}>
                            {s.time ? s.time.slice(0, 5) : 'Any time'}
                            <span className="ml-1.5 text-[10px] font-normal text-gray-400">
                              {s.full ? 'full' : `${Math.max(0, s.capacity - s.enrolled)} left`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400">Pick a time to sign up · pay at front desk.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const Header = (
    <div className="rounded-2xl px-4 py-3 mb-3" style={{ background: '#061C2B' }}>
      <p className="text-[9px]" style={{ ...F_LABEL, color: '#00D2FF' }}>{sel!.name} · {fmtDate(sel!.date)}{sel!.time ? ` · ${sel!.time}` : ''}</p>
      <button type="button" onClick={() => { setStep('list'); setErr(null); }} className="text-[10px] mt-1" style={{ color: 'rgba(247,249,250,.5)' }}>← change class or time</button>
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
