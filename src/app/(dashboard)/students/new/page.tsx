'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createLead } from '@/lib/actions/leads';
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
  const [studentType, setStudentType] = useState<'member' | 'dropin'>('member');
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

          <div className="grid grid-cols-2 gap-2">
            {([['member', 'Member', 'Academy · portal + course'], ['dropin', 'Drop-in', 'Single class · waiver only']] as const).map(([val, label, desc]) => (
              <button key={val} type="button" onClick={() => setStudentType(val)}
                className={`text-left rounded-xl border px-3 py-2 transition-colors ${studentType === val ? 'border-[var(--tss-cyan)] bg-cyan-50/40' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="text-sm font-semibold text-[var(--tss-navy)]">{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </button>
            ))}
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
          <p className="text-xs text-gray-500">Send this link to the student to complete their intake (level + details + waiver).</p>
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
