'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createLead } from '@/lib/actions/leads';
import { listCampsInRange, addStudentToCamp, getHoldingCamp } from '@/lib/actions/camps';
import { ArrowLeft } from 'lucide-react';
import { HowToAddStudent } from '@/components/students/HowToAddStudent';

// Phase 5 — single onboarding funnel. Creating a student is now create-minimal
// (name + contact + type); ALL the real data (level quiz, basics, medical,
// goals) is captured ONCE in the intake link. No duplicate questionnaire.

export default function AddStudentPage() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  // El servicio decide (Marcelo 2026-09-11): 1 día = drop-in, 2+ días =
  // member. Sin servicio (lead que todavía no compró) = member sin inscribir.
  const [services, setServices] = useState<{ id: string; name: string; start: string; end: string; days: number }[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [enrollNote, setEnrollNote] = useState<string | null>(null);
  // Tres puertas (Marcelo 2026-09-17): clase de un día · camp · alumno que
  // vuelve. La puerta decide qué pide el link (?basic=1 / ?full=1) y filtra
  // la lista de servicios para no mostrar yoga, skate y jiujitsu a un camper.
  const [kind, setKind] = useState<'camp' | 'class' | 'returning'>('camp');
  const chosen = services.find((x) => x.id === serviceId) ?? null;
  const visibleServices = services.filter((sv) => (kind === 'class' ? sv.days < 2 : sv.days >= 2));
  const studentType: 'member' | 'dropin' = kind === 'class' ? 'dropin' : 'member';
  useEffect(() => {
    const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
    const horizon = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
    Promise.all([listCampsInRange(today, horizon), getHoldingCamp()]).then(([rows, holding]: [any[], any]) => {
      const list = rows.filter((r) => r.status !== 'completed' && !r.is_holding).map((r) => {
        const a = Date.parse(`${r.start_date}T00:00:00Z`); const b = Date.parse(`${r.end_date}T00:00:00Z`);
        const days = Number.isFinite(a) && Number.isFinite(b) ? Math.round((b - a) / 86_400_000) + 1 : 1;
        return { id: r.id, name: r.camp_name, start: r.start_date, end: r.end_date, days };
      });
      // "Quiere camp, nivel por confirmar" va primero: queda inscrito y se asigna después.
      if (holding) list.unshift({ id: holding.id, name: holding.camp_name, start: 'por confirmar', end: '', days: 6 });
      setServices(list);
    }).catch(() => setServices([]));
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  // When the link is ready, scroll the success card into view so it's never
  // hidden below the fold (the form swaps out and it can look like nothing
  // happened, especially on tablet).
  useEffect(() => {
    if (createdUrl) successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [createdUrl]);

  const submit = async (e: React.FormEvent, allowDuplicate = false) => {
    e.preventDefault();
    setError('');
    if (!first.trim() || !last.trim()) { setError('First and last name required.'); return; }
    setLoading(true);
    try {
      const res = await createLead({
        first_name: first,
        last_name: last,
        phone: phone || null,
        email: email || null,
        student_type: studentType,
        allowDuplicate,
      });
      if (res.ok) {
        // Perfil creado. Si eligió servicio, lo inscribe ahí mismo: vendido =
        // perfil + inscripción + UN link, sin pasar por Services.
        if (chosen) {
          try {
            const en: any = await addStudentToCamp(chosen.id, res.studentId, { allowStarted: true });
            if (en?.success) setEnrollNote(`Enrolled in ${chosen.name}.`);
            else if (en?.full) setEnrollNote(`Profile created, but ${chosen.name} is full (${en.full.act}/${en.full.cap}). Enroll from Services.`);
            else setEnrollNote(`Profile created, but could not enroll: ${en?.error ?? 'unknown error'}. Enroll from Services.`);
          } catch (e: any) {
            setEnrollNote(`Profile created, but could not enroll: ${e?.message ?? 'error'}. Enroll from Services.`);
          }
        }
        // El link lleva la puerta elegida: la clase pide ficha + waiver; el camp pide todo.
        const url = res.leadFormUrl ? `${res.leadFormUrl}${res.leadFormUrl.includes('?') ? '&' : '?'}${kind === 'class' ? 'basic=1' : 'full=1'}` : res.leadFormUrl;
        setCreatedUrl(url);
        setEmailSent(!!res.emailSent);
      } else if (res.duplicate) {
        const d = res.duplicate;
        if (confirm(`Someone with that ${d.matched_on === 'email' ? 'email' : 'phone'} already exists (${d.first_name} ${d.last_name}). Create anyway?`)) {
          await submit(e, true);
          return;
        }
        setError('Cancelled — that contact already exists.');
      } else {
        setError(res.error || 'Could not create the student. Please try again.');
      }
    } catch (err: any) {
      // Always surface SOMETHING so a failure never looks like a silent freeze.
      console.error('createLead failed:', err);
      setError('Could not create the student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fullUrl = createdUrl ? (createdUrl.startsWith('http') ? createdUrl : `${window.location.origin}${createdUrl}`) : '';

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Link href="/students" className="inline-flex items-center gap-1 text-xs text-[#55666E] hover:text-[var(--tss-navy)]">
        <ArrowLeft size={12} /> Students
      </Link>

      <HowToAddStudent />

      {!createdUrl ? (
        <form onSubmit={(e) => submit(e)} className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>New student</h2>
            <p className="text-xs text-[#55666E] mt-1">Create the minimal profile and send the link. Level, medical info and goals are filled once in the intake.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" className="px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className="px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />
          </div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" className="w-full px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] mb-1.5" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: '#55666E' }}>What are they coming for?</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['camp', 'Camp', 'Profile + waiver + level quiz + goals'],
                ['class', 'One class', 'Profile + waiver only'],
                ['returning', 'Returning', 'Already has a profile'],
              ] as const).map(([k, label, sub]) => (
                <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setServiceId(''); }}
                  className="rounded-[5px] px-2 py-2.5 text-left border"
                  style={kind === k ? { background: '#061C2B', borderColor: '#061C2B', color: '#F7F9FA' } : { background: '#F7F9FA', borderColor: '#DCD7C6', color: '#10263B' }}>
                  <span className="block text-[13px] font-bold">{label}</span>
                  <span className="block text-[10.5px] leading-tight mt-0.5" style={{ opacity: .8 }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {kind === 'returning' ? (
            <div className="rounded-[5px] p-3" style={{ background: '#F7F9FA', border: '1px solid #DCD7C6' }}>
              <p className="text-[13px] text-[#10263B]">A returning student already has a profile and a link. Do not create a second one: find them in Students, enroll them in their camp, and send them their same link. It asks only what is missing (Welcome back).</p>
              <Link href="/students" className="inline-block mt-2 text-[13px] font-bold" style={{ color: '#00A8CC' }}>Find them in Students →</Link>
            </div>
          ) : (
            <div>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-[#F7F9FA] focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]">
                <option value="">{kind === 'camp' ? 'Camp · dates not set yet (enroll later)' : 'Class · not booked yet'}</option>
                {visibleServices.map((sv) => (
                  <option key={sv.id} value={sv.id}>{sv.name}{sv.start === 'por confirmar' ? '' : ` · ${sv.days === 1 ? sv.start : `${sv.start} → ${sv.end}`}`}</option>
                ))}
              </select>
              <p className="text-[12px] text-[#55666E] mt-1.5">
                {kind === 'camp'
                  ? (chosen
                    ? (chosen.start === 'por confirmar'
                      ? 'Enrolled as "level to confirm"; assign the real camp once the quiz is in. The link asks everything.'
                      : `Enrolled in ${chosen.name}. The link asks everything: profile, waiver, level quiz and goals.`)
                    : 'The link asks everything: profile, waiver, level quiz and goals. Enroll them in the camp from Services when the dates are set.')
                  : (chosen
                    ? `Enrolled in ${chosen.name}. The link asks profile + waiver only.`
                    : 'The link asks profile + waiver only. Book the class from Services.')}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-[5px]">{error}</p>}
          <button type="submit" disabled={loading || kind === 'returning'} className="w-full py-3 text-white text-sm font-semibold rounded-[5px] disabled:opacity-50" style={{ background: 'var(--tss-navy)' }}>
            {loading ? 'Creating…' : 'Create & get link'}
          </button>
        </form>
      ) : (
        <div ref={successRef} className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] shadow-sm p-5 space-y-3 text-center">
          <p className="text-2xl">✅</p>
          <p className="text-sm font-semibold text-[var(--tss-navy)]">Profile created</p>
          {enrollNote && <p className={`text-xs font-medium ${enrollNote.startsWith('Enrolled') ? 'text-emerald-700' : 'text-amber-700'}`}>{enrollNote}</p>}
          <p className="text-xs text-[#55666E]">Send this ONE link to the student. {kind === 'class' ? 'It asks profile + waiver only.' : 'It asks profile, waiver, level quiz and goals.'}</p>
          {emailSent && (
            <p className="text-xs text-emerald-700 font-medium">✓ We also emailed the link to {email}.</p>
          )}
          <code className="block text-[11px] text-[#55666E] break-all bg-[#F7F9FA] px-3 py-2 rounded-lg">{fullUrl}</code>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 py-2.5 text-sm font-semibold rounded-[5px] border border-[#DCD7C6] text-[#10263B]">
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent('Complete your intake here: ' + fullUrl)}`} target="_blank" className="flex-1 py-2.5 text-sm font-semibold rounded-[5px] text-white text-center" style={{ background: '#25D366' }}>
              WhatsApp
            </a>
          </div>
          <div className="flex gap-2 pt-1">
            <a href={fullUrl} target="_blank" className="flex-1 py-2.5 text-sm font-semibold rounded-[5px] border border-[#DCD7C6] text-[#10263B] text-center">Open intake</a>
            <Link href="/students" className="flex-1 py-2.5 text-sm font-semibold rounded-[5px] bg-[var(--tss-navy)] text-white text-center">View students</Link>
          </div>
        </div>
      )}
    </div>
  );
}
