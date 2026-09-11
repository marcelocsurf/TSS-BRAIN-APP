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
  const chosen = services.find((x) => x.id === serviceId) ?? null;
  const studentType: 'member' | 'dropin' = chosen && chosen.days < 2 ? 'dropin' : 'member';
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
        setCreatedUrl(res.leadFormUrl);
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
      <Link href="/students" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--tss-navy)]">
        <ArrowLeft size={12} /> Students
      </Link>

      <HowToAddStudent />

      {!createdUrl ? (
        <form onSubmit={(e) => submit(e)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>New student</h2>
            <p className="text-xs text-gray-500 mt-1">Create the minimal profile and send the link. Level, medical info and goals are filled once in the intake.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />
          </div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]" />

          <div>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]">
              <option value="">Service · none yet (interested, not sold)</option>
              {services.map((sv) => (
                <option key={sv.id} value={sv.id}>{sv.name}{sv.start === 'por confirmar' ? '' : ` · ${sv.days === 1 ? sv.start : `${sv.start} → ${sv.end}`}`}</option>
              ))}
            </select>
            <p className="text-[12px] text-gray-500 mt-1.5">
              {chosen
                ? (chosen.start === 'por confirmar'
                  ? 'Wants a camp, level not known yet → member, enrolled as "level to confirm". The intake asks everything; assign the real camp once the quiz is in.'
                  : chosen.days < 2
                  ? 'One-day service → drop-in. The intake asks profile + waiver only.'
                  : `${chosen.days}-day service → member. The intake asks profile + waiver + level quiz + goals.`)
                : 'No service yet → member without enrollment. Enroll later from Services.'}
            </p>
          </div>

          {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 text-white text-sm font-semibold rounded-xl disabled:opacity-50" style={{ background: 'var(--tss-navy)' }}>
            {loading ? 'Creating…' : 'Create & get link'}
          </button>
        </form>
      ) : (
        <div ref={successRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 text-center">
          <p className="text-2xl">✅</p>
          <p className="text-sm font-semibold text-[var(--tss-navy)]">Profile created</p>
          {enrollNote && <p className={`text-xs font-medium ${enrollNote.startsWith('Enrolled') ? 'text-emerald-700' : 'text-amber-700'}`}>{enrollNote}</p>}
          <p className="text-xs text-gray-500">Send this ONE link to the student. The intake asks exactly what their service needs.</p>
          {emailSent && (
            <p className="text-xs text-emerald-700 font-medium">✓ We also emailed the link to {email}.</p>
          )}
          <code className="block text-[11px] text-gray-600 break-all bg-gray-50 px-3 py-2 rounded-lg">{fullUrl}</code>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700">
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent('Complete your intake here: ' + fullUrl)}`} target="_blank" className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white text-center" style={{ background: '#25D366' }}>
              WhatsApp
            </a>
          </div>
          <div className="flex gap-2 pt-1">
            <a href={fullUrl} target="_blank" className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 text-center">Open intake</a>
            <Link href="/students" className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[var(--tss-navy)] text-white text-center">View students</Link>
          </div>
        </div>
      )}
    </div>
  );
}
