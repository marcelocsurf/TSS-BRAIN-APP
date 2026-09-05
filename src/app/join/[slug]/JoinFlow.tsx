'use client';

// Client flow for the public class QR: pick class → email → (existing:
// confirm / new: profile + waiver) → optional coupon → done. Payment is
// always settled at front desk; a courtesy coupon just skips the charge.

import { ConsentBoxes } from '@/components/legal/ConsentBoxes';
import { useState, useEffect, useTransition } from 'react';
import { lookupPublicStudent, publicEnroll, publicAddCompanion, type PublicPerson } from '@/lib/actions/public-classes';
import { suggestCorrectedEmail } from '@/lib/utils/email-typo';
import { dobError, dobMaxAttr } from '@/lib/utils/dob';

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

// Mandatorios del mostrador (2026-08-18): talla e idioma en cada perfil nuevo.
const SHIRT_SIZES = ['Kids 6', 'Kids 8', 'Kids 10', 'Kids 12', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const LANGUAGES = ['English', 'Español', 'Português', 'Français', 'Deutsch', 'Italiano', 'Other'];

const WAIVER_TEXT = `I acknowledge that participation in physical activities (surf, yoga, skate, ice bath, jiujitsu and related training) involves inherent risks, including injury. I declare I am physically able to participate, I have disclosed any relevant medical conditions, and I release the academy and The Surf Sequence from liability arising from ordinary negligence, to the maximum extent permitted by law. I consent to receive first aid / emergency care if needed.`;

export function JoinFlow({ slug, classes }: { slug: string; classes: Klass[] }) {
  const [pending, start] = useTransition();
  const [sel, setSel] = useState<Klass | null>(null);
  const [step, setStep] = useState<'list' | 'email' | 'who' | 'confirm' | 'profile' | 'done'>('list');
  // Menú por actividad + video embebido (nunca sacamos al cliente de la página)
  const [openActivity, setOpenActivity] = useState<string | null>(null);
  const [videoOf, setVideoOf] = useState<Activity | null>(null);
  const [videoRatio, setVideoRatio] = useState<'landscape' | 'portrait'>('landscape');
  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
  const [email, setEmail] = useState('');
  const emailSuggestion = suggestCorrectedEmail(email);
  // Link directo a UNA clase (?class=<campId>) — Cony manda el link por
  // WhatsApp y el cliente cae con la clase ya elegida, listo para su email.
  const [deadLink, setDeadLink] = useState(false);
  useEffect(() => {
    try {
      const cid = new URLSearchParams(window.location.search).get('class');
      if (!cid) return;
      const k = classes.find((c) => c.id === cid);
      if (k) { setSel(k); setStep('email'); }
      // Antes fallaba en silencio: si la clase del link ya no está (llena/
      // cancelada/pasada) el cliente caía en la lista sin ninguna explicación.
      else setDeadLink(true);
    } catch { /* sin deep link */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Un mismo correo puede tener varias personas (familias). `people` son todas
  // las registradas con ese email; `known` es la elegida para esta reserva.
  const [people, setPeople] = useState<PublicPerson[]>([]);
  const [known, setKnown] = useState<PublicPerson | null>(null);
  // "+ Someone else" en un email familiar: el profile crea a ESA persona nueva
  // (sin el flag, el server encontraba al familiar viejo y lo inscribía a él).
  const [newPerson, setNewPerson] = useState(false);
  // Nombre del adulto que firma cuando quien reserva es menor de edad.
  const [guardianName, setGuardianName] = useState('');
  const [coupon, setCoupon] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [acceptWaiver, setAcceptWaiver] = useState(false);
  const [signedName, setSignedName] = useState('');
  // Consentimientos legales (2026-09-05): salud + términos obligatorios, imagen opt-in.
  const [acceptHealth, setAcceptHealth] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [mediaOk, setMediaOk] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', emergency_contact_name: '', emergency_contact_phone: '', medical_notes: '', date_of_birth: '', guardian_name: '', guardian_phone: '', shirt_size: '', languages: '' });
  // Familia: acompañantes agregados después de reservar
  const [companion, setCompanion] = useState({ first_name: '', last_name: '', date_of_birth: '', medical_notes: '', shirt_size: '' });
  const [added, setAdded] = useState<string[]>([]);
  const [showCompanion, setShowCompanion] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  // Edad para adaptar el waiver: un menor NO firma — firma su adulto.
  const ageOf = (dob: string): number | null => {
    if (!dob) return null;
    const d = new Date(dob + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return null;
    const n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    const m = n.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
    return a;
  };
  const dobMsg = dobError(form.date_of_birth);
  // Con una fecha imposible no clasificamos nada: el aviso manda hasta que
  // la corrijan (si no, un año futuro daría edad negativa = "menor").
  const myAge = dobMsg ? null : ageOf(form.date_of_birth);
  const isMinor = myAge != null && myAge < 18;
  const tooYoung = myAge != null && myAge < 7;

  // Al abrir un video, medir su miniatura real: maxresdefault conserva la
  // proporción original (1280×720 horizontal · 1080×1920 en Shorts verticales).
  useEffect(() => {
    if (!videoOf?.video_url) return;
    setVideoRatio('landscape');
    const m = videoOf.video_url.match(/(?:youtu\.be\/|\/shorts\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{6,})/);
    if (!m) return;
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalHeight > probe.naturalWidth) setVideoRatio('portrait');
    };
    probe.src = `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg`;
  }, [videoOf]);

  const enroll = (profile: boolean) => {
    setErr(null);
    start(async () => {
      const r = await publicEnroll({
        slug,
        campId: sel!.id,
        email,
        studentId: profile ? null : (known?.id ?? null),
        force_new_person: profile ? newPerson : false,
        guardian_name: (profile ? form.guardian_name : guardianName).trim() || null,
        coupon: coupon.trim() || null,
        profile: profile ? form : null,
        accept_waiver: acceptWaiver || !!known?.waiver_signed,
        signed_name: signedName || form.first_name || known?.first_name || null,
        health_consent: acceptHealth,
        accept_terms: acceptTerms,
        media_consent: mediaOk,
      });
      if (!r.ok) { setErr(r.error ?? 'Something went wrong.'); return; }
      setSummary({ ...r.summary, camp_id: sel!.id });
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
          {/* Venue-aware farewell: yoga ≠ "in the water" */}
          <p className="mt-1 text-[13px] font-semibold" style={{ color: '#0090B0' }}>
            {(() => {
              const n = (summary.class_name || '').toLowerCase();
              if (/yoga/.test(n)) return 'See you in the yoga studio 🧘';
              if (/jiu|jitsu|bjj/.test(n)) return 'See you on the mat 🥋';
              if (/skate/.test(n)) return 'See you at the skate ramp 🛹';
              if (/ice/.test(n)) return 'See you at the ice bath ❄️';
              return 'See you at the academy 🌊';
            })()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>Your class</p>
          <p className="font-bold text-[15px] mt-1" style={{ color: '#061C2B' }}>{summary.class_name}</p>
          <p className="text-[12px] text-gray-500">{fmtDate(summary.date)}{summary.time ? ` · ${summary.time}` : ''}</p>
          {summary.coupon_applied && (
            <p className="text-[11px] mt-1 font-semibold" style={{ color: '#0090B0' }}>Coupon {summary.coupon_applied} applied ✓</p>
          )}
        </div>
        {/* Familia: sumar acompañantes reusando contacto y adulto responsable */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>Bringing family or friends?</p>
          {added.length > 0 && (
            <ul className="mt-2 space-y-1">
              {added.map((n) => (
                <li key={n} className="text-[13px]" style={{ color: '#061C2B' }}>✓ {n} — spot saved</li>
              ))}
            </ul>
          )}
          {!showCompanion ? (
            <button type="button" onClick={() => setShowCompanion(true)}
              className="mt-2 w-full rounded-full py-2.5 text-[10px]" style={{ ...F_LABEL, background: '#06D6A0', color: '#061C2B' }}>
              + Add another person
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={companion.first_name} onChange={(e) => setCompanion({ ...companion, first_name: e.target.value })}
                  placeholder="First name *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                <input value={companion.last_name} onChange={(e) => setCompanion({ ...companion, last_name: e.target.value })}
                  placeholder="Last name *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
              </div>
              <select value={companion.shirt_size} onChange={(e) => setCompanion({ ...companion, shirt_size: e.target.value })}
                aria-label="Their t-shirt size"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                style={{ color: companion.shirt_size ? '#061C2B' : '#9ca3af' }}>
                <option value="" disabled>Their t-shirt size *</option>
                {SHIRT_SIZES.map((sz) => <option key={sz} value={sz}>{sz}</option>)}
              </select>
              <label className="flex flex-col justify-center px-3 py-1 border border-gray-200 rounded-xl">
                <span className="text-[9px] text-gray-400" style={F_LABEL}>Date of birth *</span>
                <input type="date" max={dobMaxAttr()} value={companion.date_of_birth} onChange={(e) => setCompanion({ ...companion, date_of_birth: e.target.value })}
                  className="text-sm outline-none bg-transparent" />
              </label>
              <input value={companion.medical_notes} onChange={(e) => setCompanion({ ...companion, medical_notes: e.target.value })}
                placeholder="Medical conditions or 'none'" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
              <p className="text-[11px] text-gray-500 leading-snug">
                You sign the waiver for them as {ageOf(companion.date_of_birth) != null && ageOf(companion.date_of_birth)! < 18 ? 'their parent or guardian' : 'the person booking'}. Same contact and emergency details as yours.
              </p>
              {err && <p className="text-[11px] text-red-600">{err}</p>}
              <div className="flex gap-2">
                <button type="button" disabled={pending || !companion.first_name.trim() || !companion.last_name.trim() || !companion.shirt_size || !companion.date_of_birth}
                  onClick={() => start(async () => {
                    setErr(null);
                    const dobMsg = dobError(companion.date_of_birth);
                    if (dobMsg) { setErr(dobMsg); return; }
                    const r = await publicAddCompanion({
                      slug, campId: sel?.id ?? summary.camp_id, bookerEmail: email,
                      first_name: companion.first_name, last_name: companion.last_name,
                      date_of_birth: companion.date_of_birth, medical_notes: companion.medical_notes,
                      shirt_size: companion.shirt_size,
                      // Idioma del booker si acaba de crear su perfil; si ya
                      // existía, el server hereda el guardado en su ficha.
                      languages: form.languages || null,
                    });
                    if (!r.ok) { setErr(r.error ?? 'Could not add them.'); return; }
                    setAdded((a) => [...a, [companion.first_name, companion.last_name].filter(Boolean).join(' ')]);
                    setCompanion({ first_name: '', last_name: '', date_of_birth: '', medical_notes: '', shirt_size: '' });
                    setShowCompanion(false);
                  })}
                  className="flex-1 rounded-full py-2.5 text-[10px] disabled:opacity-40" style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}>
                  {pending ? 'Saving…' : 'Save their spot'}
                </button>
                <button type="button" onClick={() => { setShowCompanion(false); setErr(null); }}
                  className="px-4 rounded-full text-[10px]" style={{ ...F_LABEL, color: '#6B7A82' }}>Cancel</button>
              </div>
            </div>
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
        {summary.booking_id && (
          <a href={`/booking/${summary.booking_id}`}
            className="block text-center text-[11px] py-2.5 rounded-full border" style={{ borderColor: 'rgba(0,210,255,.5)', color: '#0090B0' }}>
            Plans changed? Move or cancel your booking here — also in your email ✉️
          </a>
        )}
      </div>
    );
  }

  // Ventana de video: se abre SOBRE la página; al cerrar, el cliente sigue
  // exactamente donde estaba (nada de mandarlo a YouTube y perderlo).
  const VideoModal = videoOf && (() => {
    const { embed } = videoIds(videoOf.video_url);
    // La forma del marco sigue al video real (medida con la miniatura de
    // máxima resolución): horizontal 16:9, vertical 9:16 — sin franjas negras.
    const ratio = videoRatio === 'portrait' ? '9 / 16' : '16 / 9';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(6,28,43,.92)' }}
        onClick={() => setVideoOf(null)}>
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px]" style={{ ...F_LABEL, color: '#00D2FF' }}>{videoOf.label}</p>
            <button type="button" onClick={() => setVideoOf(null)} className="text-[26px] leading-none px-2" style={{ color: 'rgba(247,249,250,.75)' }} aria-label="Close">×</button>
          </div>
          {embed ? (
            <div className="rounded-2xl overflow-hidden bg-black mx-auto"
              style={{ aspectRatio: ratio, maxHeight: '68vh', width: videoRatio === 'portrait' ? 'auto' : '100%', height: videoRatio === 'portrait' ? '68vh' : 'auto' }}>
              <iframe src={embed} title={videoOf.label} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
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
        {deadLink && (
          <div className="rounded-2xl px-4 py-3 text-[12px] font-medium"
            style={{ background: 'rgba(255,209,102,.18)', color: '#7a5c00' }}>
            That class isn’t available anymore — pick another time below.
          </div>
        )}
        <p className="text-[10px] text-gray-400 px-1" style={F_LABEL}>What do you want to do?</p>
        {activities.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No classes scheduled right now — check with front desk.</p>}

        {activities.map((a) => {
          const isOpen = openActivity === a.key;
          const { thumb } = videoIds(a.video_url);
          const next = a.sessions.filter((s) => !s.full);
          return (
            <div key={a.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              style={{ borderLeft: `4px solid ${a.color ?? '#00D2FF'}` }}>
              {/* Portada ancha: video como imagen de la actividad; sin video,
                  el color de la actividad con su ícono — nunca una tarjeta vacía. */}
              <button type="button" onClick={() => setOpenActivity(isOpen ? null : a.key)} className="w-full text-left block">
                <span className="relative block h-[104px]" style={{ background: a.color && a.color !== '#F7F9FA' ? a.color : '#0F6E56' }}>
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <span className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(6,28,43,.15) 30%, rgba(6,28,43,.78) 100%)' }} />
                  {a.price_cents != null && (
                    <span className="absolute top-2 right-2 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: '#FFD166', color: '#412402' }}>{money(a.price_cents)}</span>
                  )}
                  {a.video_url && (
                    <span
                      role="button" tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setVideoOf(a); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setVideoOf(a); } }}
                      className="absolute inset-0 flex items-center justify-center text-[34px] cursor-pointer"
                      style={{ color: 'rgba(255,255,255,.92)', textShadow: '0 2px 12px rgba(0,0,0,.5)' }}
                      aria-label={`Play ${a.label} video`}
                    >▶</span>
                  )}
                  <span className="absolute left-3 bottom-2 right-3 block font-bold text-[17px] truncate" style={{ color: '#fff' }}>{a.label}</span>
                </span>
                <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="text-[11.5px] text-gray-500">
                    {a.minutes ? `${a.minutes} min` : ''}{next.length ? ` · ${next.length} date${next.length === 1 ? '' : 's'}` : ''}
                  </span>
                  <span className="text-[11.5px] font-bold px-3 py-1.5 rounded-full shrink-0"
                    style={next.length
                      ? { border: '1.5px solid #00D2FF', color: '#061C2B' }
                      : { border: '1px solid #eee', color: '#c04545' }}>
                    {next.length ? (isOpen ? 'Hide times' : 'See times') : 'Fully booked'}
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
                            className="text-[13px] font-bold px-3.5 py-2.5 rounded-xl disabled:opacity-40"
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
          {/* Un dominio mal tipeado crea un perfil nuevo y parte el historial
              en dos (le pasó a dos alumnos reales). Se sugiere, nunca se
              corrige solo — el correo es de quien lo escribe. */}
          {emailSuggestion && (
            <button type="button" onClick={() => setEmail(emailSuggestion)}
              className="w-full text-left rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,209,102,.18)', border: '1px solid rgba(255,209,102,.5)' }}>
              <span className="block text-[11.5px]" style={{ color: '#7a5c00' }}>
                Did you mean <strong>{emailSuggestion}</strong>?
              </span>
              <span className="block text-[10px] mt-0.5" style={{ color: '#a08030' }}>
                Tap to use it — a typo here creates a second profile and splits your progress.
              </span>
            </button>
          )}
          {err && <p className="text-[11px] text-red-600">{err}</p>}
          <button type="button" disabled={pending || !email.includes('@')}
            onClick={() => { setErr(null); setNewPerson(false); start(async () => {
              const r = await lookupPublicStudent(slug, email);
              if (!r.found) { setPeople([]); setKnown(null); setStep('profile'); return; }
              setPeople(r.people);
              // Familias: si el correo tiene más de una persona, preguntamos
              // quién reserva en vez de asumir (antes la mamá entraba como su hija).
              if (r.people.length > 1) { setKnown(null); setStep('who'); }
              else { setKnown(r.people[0]); setStep('confirm'); }
            }); }}
            className="w-full rounded-full py-3 text-[10px] disabled:opacity-40" style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}>
            {pending ? 'Checking…' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  // Varias personas con el mismo correo (familias) → ¿quién reserva?
  if (step === 'who') {
    return (
      <div>
        {Header}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div>
            <p className="font-bold text-[14px]" style={{ color: '#061C2B' }}>Who&apos;s taking this class?</p>
            <p className="text-[11px] text-gray-400 mt-0.5">This email has more than one person registered.</p>
          </div>
          <div className="space-y-2">
            {people.map((p) => (
              <button key={p.id} type="button"
                onClick={() => { setKnown(p); setSignedName(''); setGuardianName(''); setErr(null); setStep('confirm'); }}
                className="w-full text-left px-3.5 py-3 rounded-xl border border-gray-200 hover:border-[#00D2FF] transition-colors">
                <span className="text-[14px] font-semibold" style={{ color: '#061C2B' }}>
                  {p.first_name}{p.last_name ? ` ${p.last_name}` : ''}
                </span>
                <span className="block text-[11px] text-gray-400 mt-0.5">
                  {p.is_minor ? 'Minor · a parent signs' : 'Adult'}
                  {p.waiver_signed ? ' · waiver ✓' : ' · waiver pending'}
                </span>
              </button>
            ))}
            <button type="button" onClick={() => { setKnown(null); setErr(null); setNewPerson(true); setStep('profile'); }}
              className="w-full text-left px-3.5 py-3 rounded-xl border border-dashed border-gray-300 text-[13px] text-gray-500">
              + Someone else (add a new person)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm' && known) {
    // Un menor no firma su propia exención: firma su adulto responsable.
    const needsGuardian = known.is_minor && !known.waiver_signed;
    return (
      <div>
        {Header}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-[13px]" style={{ color: '#061C2B' }}>
            <b>✓ Found you, {known.first_name}!</b>{' '}
            {known.waiver_signed ? 'Your waiver is already signed.' : 'One thing missing: the waiver.'}
          </p>
          {people.length > 1 && (
            <button type="button" onClick={() => setStep('who')} className="text-[11px]" style={{ color: '#0090B0' }}>
              ← Not you? Pick another person
            </button>
          )}
          {!known.waiver_signed && (
            <div className="rounded-xl border border-red-100 p-3" style={{ background: 'rgba(255,107,107,.05)' }}>
              <p className="text-[9px] mb-1.5" style={{ ...F_LABEL, color: '#FF6B6B' }}>Liability waiver · required</p>
              {needsGuardian && (
                <p className="text-[11px] mb-1.5" style={{ color: '#061C2B' }}>
                  <b>{known.first_name} is a minor</b> — a parent or legal guardian signs for them.
                </p>
              )}
              <div className="text-[10px] text-gray-500 max-h-20 overflow-y-auto leading-snug">{WAIVER_TEXT}</div>
              <label className="flex items-start gap-2 mt-2 text-[12px]" style={{ color: '#061C2B' }}>
                <input type="checkbox" checked={acceptWaiver} onChange={(e) => setAcceptWaiver(e.target.checked)} className="mt-0.5 h-4 w-4" />
                {needsGuardian
                  ? `I am ${known.first_name}'s parent / legal guardian and I accept the waiver`
                  : 'I have read and accept the waiver'}
              </label>
              {needsGuardian ? (
                <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Parent / guardian full name to sign *"
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              ) : (
                <input value={signedName} onChange={(e) => setSignedName(e.target.value)} placeholder="Type your full name to sign"
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              )}
              <div className="mt-3">
                <ConsentBoxes health={acceptHealth} onHealth={setAcceptHealth} terms={acceptTerms} onTerms={setAcceptTerms}
                  media={mediaOk} onMedia={setMediaOk} minor={needsGuardian} forName={known.first_name} />
              </div>
            </div>
          )}
          {CouponField}
          {err && <p className="text-[11px] text-red-600">{err}</p>}
          <button type="button"
            disabled={pending || (!known.waiver_signed && (!acceptWaiver || !acceptHealth || !acceptTerms || !(needsGuardian ? guardianName : signedName).trim()))}
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
          <input value={form.last_name} onChange={set('last_name')} placeholder="Last name *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.shirt_size} onChange={(e) => setForm((f) => ({ ...f, shirt_size: e.target.value }))}
            aria-label="T-shirt size"
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
            style={{ color: form.shirt_size ? '#061C2B' : '#9ca3af' }}>
            <option value="" disabled>T-shirt size *</option>
            {SHIRT_SIZES.map((sz) => <option key={sz} value={sz}>{sz}</option>)}
          </select>
          <select value={form.languages} onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
            aria-label="Preferred language"
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
            style={{ color: form.languages ? '#061C2B' : '#9ca3af' }}>
            <option value="" disabled>Preferred language *</option>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.phone} onChange={set('phone')} placeholder="Your phone / WhatsApp" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
          <label className="flex flex-col justify-center px-3 py-1 border border-gray-200 rounded-xl">
            <span className="text-[9px] text-gray-400" style={F_LABEL}>Date of birth *</span>
            <input type="date" max={dobMaxAttr()} value={form.date_of_birth} onChange={set('date_of_birth')} className="text-sm outline-none bg-transparent" />
          </label>
        </div>
        {/* Año mal tipeado: sin este aviso el alumno queda con edad negativa
            y el sistema lo trata como menor de edad. */}
        {dobMsg && (
          <p className="text-[12px] rounded-xl px-3 py-2" style={{ background: 'rgba(255,209,102,.18)', color: '#7a5c00' }}>
            {dobMsg}
          </p>
        )}
        {tooYoung && (
          <p className="text-[12px] rounded-xl px-3 py-2" style={{ background: 'rgba(255,209,102,.18)', color: '#7a5c00' }}>
            For surfers under 7 we set everything up in person — please stop by front desk. 🤙
          </p>
        )}
        {isMinor && !tooYoung && (
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(0,210,255,.07)', border: '1px solid rgba(0,210,255,.35)' }}>
            <p className="text-[11px] font-bold" style={{ color: '#0090B0' }}>
              {form.first_name || 'This surfer'} is under 18 — a parent or legal guardian signs.
            </p>
            <input value={form.guardian_name} onChange={set('guardian_name')} placeholder="Parent / guardian full name *"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" />
            <input value={form.guardian_phone} onChange={set('guardian_phone')} placeholder="Guardian phone"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <input value={form.emergency_contact_name} onChange={set('emergency_contact_name')} placeholder="Emergency contact *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
          <input value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} placeholder="Emergency contact's phone *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
        </div>
        <textarea value={form.medical_notes} onChange={set('medical_notes')} rows={2} placeholder="Medical conditions, allergies, injuries… or 'none' *"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-3 space-y-2" style={{ borderTop: '3px solid #FF6B6B' }}>
        <p className="text-[9px]" style={{ ...F_LABEL, color: '#FF6B6B' }}>Liability waiver · required</p>
        <div className="text-[10px] text-gray-500 max-h-24 overflow-y-auto leading-snug bg-gray-50 rounded-xl p-3">{WAIVER_TEXT}</div>
        {isMinor && !tooYoung && (
          <p className="text-[11px] leading-snug rounded-lg px-2.5 py-2" style={{ background: 'rgba(0,210,255,.07)', color: '#0F5A6B' }}>
            I am the parent or legal guardian of <strong>{[form.first_name, form.last_name].filter(Boolean).join(' ') || 'this minor'}</strong>, and I accept this waiver on their behalf.
          </p>
        )}
        <label className="flex items-start gap-2 text-[12px]" style={{ color: '#061C2B' }}>
          <input type="checkbox" checked={acceptWaiver} onChange={(e) => setAcceptWaiver(e.target.checked)} className="mt-0.5 h-4 w-4" />
          {isMinor && !tooYoung ? 'I have read and accept the waiver as their guardian' : 'I have read and accept the waiver'}
        </label>
        <input value={signedName} onChange={(e) => setSignedName(e.target.value)}
          placeholder={isMinor && !tooYoung ? 'Guardian: type your full name to sign' : 'Type your full name to sign'}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
        <ConsentBoxes health={acceptHealth} onHealth={setAcceptHealth} terms={acceptTerms} onTerms={setAcceptTerms}
          media={mediaOk} onMedia={setMediaOk} minor={isMinor && !tooYoung} forName={[form.first_name, form.last_name].filter(Boolean).join(' ') || null} />
      </div>

      <div className="mt-3 space-y-3">
        {CouponField}
        {err && <p className="text-[11px] text-red-600">{err}</p>}
        <button type="button"
          disabled={pending || tooYoung || !!dobMsg || !form.first_name.trim() || !form.last_name.trim() || !form.shirt_size || !form.languages || !form.date_of_birth || (isMinor && !form.guardian_name.trim()) || !form.emergency_contact_name.trim() || !form.emergency_contact_phone.trim() || !form.medical_notes.trim() || !acceptWaiver || !acceptHealth || !acceptTerms || !signedName.trim()}
          onClick={() => enroll(true)}
          className="w-full rounded-full py-3.5 text-[10px] disabled:opacity-40" style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}>
          {pending ? 'Saving…' : 'Sign & save my spot'}
        </button>
      </div>
    </div>
  );
}
