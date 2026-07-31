'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Full access. Can manage everything.' },
  { value: 'coordinator', label: 'Coordinator', desc: 'Manages schedule, assigns coaches, creates students.' },
  { value: 'head_coach', label: 'Head coach', desc: 'Runs their own services, confirms belt promotions up to their cert.' },
  { value: 'coach', label: 'Coach', desc: 'Executes sessions, evaluates students.' },
  { value: 'assistant', label: 'Assistant', desc: 'View-only for assigned sessions. No login in Stage 1.' },
  { value: 'seller', label: 'Vendedor', desc: 'Sells spots from their portal. Reserves; front desk charges.' },
  { value: 'host', label: 'Servicio al cliente', desc: 'Guest services: sells, charges at the desk, chases intake/waivers, sees incidents. No coach assignment.' },
];

const BELT_PERMISSIONS = [
  { value: 'white_belt', label: 'White Belt — Beginner', color: '#E8E8E8' },
  { value: 'yellow_belt', label: 'Yellow Belt — Novice', color: '#F5C518' },
  { value: 'blue_belt', label: 'Blue Belt — Foundation', color: '#1E6FBF' },
  { value: 'purple_belt', label: 'Purple Belt — Emerging', color: '#7B4FBE' },
  { value: 'brown_belt', label: 'Brown Belt — Pre-Elite', color: '#7D4E27' },
  { value: 'black_belt', label: 'Black Belt — Elite', color: '#111111' },
];

const CERT_LEVELS = [
  { value: 'L1', label: 'L1 — Assistant' },
  { value: 'L2', label: 'L2 — Instructor' },
  { value: 'L3', label: 'L3 — Coach' },
  { value: 'L4', label: 'L4 — Senior Coach' },
  { value: 'L5', label: 'L5 — Master / Director' },
];

interface AcademyOption {
  id: string;
  name: string;
  slug: string;
}

interface AddCoachFormProps {
  academies: AcademyOption[];
  defaultAcademyId: string | null;
  isPlatformAdmin: boolean;
}

export function AddCoachForm({ academies, defaultAcademyId, isPlatformAdmin }: AddCoachFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reassigned, setReassigned] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    portal_category: 'coaching',
    job_title: '',
    portal_can_sell: false,
    role: 'coach',
    max_belt_permission: 'yellow_belt',
    certification_level: 'L1',
    specialty_area: '',
    languages: '',
    internal_notes: '',
    academy_id: defaultAcademyId ?? (academies[0]?.id ?? ''),
  });

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.languages) {
      setError('First name, last name, email, phone, and languages are required.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/coaches/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coach');

      setReassigned(!!data.reassigned);
      setEmailSent(data.email_sent !== false); // undefined → assume ok
      setEmailError(data.email_error || '');
      setSuccess(true);
      setTimeout(() => router.push('/coaches'), data.email_sent === false ? 4000 : 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-[var(--tss-success)]">{'\u2713'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--tss-navy)]">
          {reassigned ? 'Coach Reassigned' : 'Coach Created'}
        </h2>
        <p className="text-sm text-[var(--tss-gray-500)] mt-2">
          {reassigned
            ? `${form.first_name} ${form.last_name} was moved here as ${form.role}. Their existing TSS account is preserved.`
            : `${form.first_name} ${form.last_name} has been added as ${form.role}.`}
        </p>
        {!emailSent && (
          <div className="mt-4 mx-auto max-w-md bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
            <p className="text-xs font-semibold text-amber-800">
              \u26a0 Invite email did NOT send
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              The coach record was created. You can re-try sending from the
              Coaches list via the &ldquo;Resend invite&rdquo; button.
            </p>
            {emailError && (
              <p className="text-[10px] text-amber-700 mt-1 font-mono break-all">
                {emailError}
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-[var(--tss-gray-500)] mt-3" style={{ fontFamily: 'var(--font-mono)' }}>
          Redirecting to coaches...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <p className="text-xs tracking-widest text-[var(--tss-gold)] uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>The Surf Sequence</p>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Add Coach</h1>
        <p className="text-sm text-[var(--tss-gray-500)] mt-0.5">Create a new team member with their role and permissions.</p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-[var(--tss-gray-100)] p-5 space-y-4 shadow-sm">
        <p className="text-xs tracking-widest text-[var(--tss-gray-500)] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>Basic Information</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>First Name *</label>
            <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)}
              placeholder="Carlos"
              className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Last Name *</label>
            <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)}
              placeholder="Santamaria"
              className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="coach@purosurf.com"
            className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Phone *</label>
          <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+503 7000 0000"
            className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Languages *</label>
          <input type="text" value={form.languages} onChange={e => set('languages', e.target.value)}
            placeholder="e.g. Spanish, English"
            className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent" />
        </div>
      </div>

      {/* Academy (platform admin only) */}
      {isPlatformAdmin && academies.length > 0 && (
        <div className="bg-white rounded-xl border border-[var(--tss-gray-100)] p-5 space-y-3 shadow-sm">
          <p className="text-xs tracking-widest text-[var(--tss-gray-500)] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>Academy</p>
          <p className="text-xs text-[var(--tss-gray-500)]">
            Which academy does this coach belong to? Only platform admin can pick across academies.
          </p>
          <div className="space-y-1.5">
            {academies.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => set('academy_id', a.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                  form.academy_id === a.id
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white shadow-sm'
                    : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)]'
                }`}
              >
                <span className="text-sm font-semibold">{a.name}</span>
                <span className={`text-[11px] font-mono ${form.academy_id === a.id ? 'text-white/70' : 'text-[var(--tss-gray-500)]'}`}>
                  {a.slug}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Role & Permissions */}
      <div className="bg-white rounded-xl border border-[var(--tss-gray-100)] p-5 space-y-4 shadow-sm">
        <p className="text-xs tracking-widest text-[var(--tss-gray-500)] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>System Role</p>

        {/* Team member type — drives which portal they get */}
        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Team member type *</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { set('portal_category', 'coaching'); if (form.role === 'assistant') set('role', 'coach'); }}
              className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${
                form.portal_category === 'coaching' ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white shadow-sm' : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)]'
              }`}>
              <span className="text-sm font-semibold">Coaching team</span>
              <span className={`text-xs mt-0.5 ${form.portal_category === 'coaching' ? 'text-white/70' : 'text-[var(--tss-gray-500)]'}`}>Coach / coordinator / assistant</span>
            </button>
            <button type="button" onClick={() => { set('portal_category', 'support'); set('role', 'assistant'); }}
              className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${
                form.portal_category === 'support' ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white shadow-sm' : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)]'
              }`}>
              <span className="text-sm font-semibold">Support staff</span>
              <span className={`text-xs mt-0.5 ${form.portal_category === 'support' ? 'text-white/70' : 'text-[var(--tss-gray-500)]'}`}>Photographer, seller, driver…</span>
            </button>
            <button type="button" onClick={() => { set('portal_category', 'manager'); set('role', 'assistant'); }}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-all ${
                form.portal_category === 'manager' ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white shadow-sm' : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)]'
              }`}>
              <span className="block text-sm font-semibold">Manager</span>
              <span className={`text-xs mt-0.5 ${form.portal_category === 'manager' ? 'text-white/70' : 'text-[var(--tss-gray-500)]'}`}>Read-only academy overview</span>
            </button>
          </div>
        </div>

        {form.portal_category === 'support' && (
          <div>
            <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Job title *</label>
            <input type="text" value={form.job_title} onChange={e => set('job_title', e.target.value)}
              placeholder="e.g. Photographer, Videographer, Seller"
              className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent" />
            <p className="text-xs text-[var(--tss-gray-500)] mt-1.5">They get a portal with their tasks + assigned services. Coaching tabs are hidden.</p>

            <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
              <input type="checkbox" checked={form.portal_can_sell} onChange={e => set('portal_can_sell', e.target.checked)} className="mt-0.5" />
              <span>
                <span className="text-sm font-semibold text-[var(--tss-gray-700)]">Seller — can sell services</span>
                <span className="block text-xs text-[var(--tss-gray-500)]">Adds a Sell tab: services calendar with real availability + sales chart.</span>
              </span>
            </label>
          </div>
        )}

        {form.portal_category === 'coaching' && (<>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Role *</label>
          <div className="space-y-2">
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => set('role', r.value)}
                className={`w-full flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${
                  form.role === r.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white shadow-sm'
                    : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)]'
                }`}>
                <span className="text-sm font-semibold">{r.label}</span>
                <span className={`text-xs mt-0.5 ${form.role === r.value ? 'text-white/70' : 'text-[var(--tss-gray-500)]'}`}>{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Maximum Belt Permission *</label>
          <p className="text-xs text-[var(--tss-gray-500)] mb-2">This coach can only coach students up to this belt level.</p>
          <div className="space-y-1.5">
            {BELT_PERMISSIONS.map(b => (
              <button key={b.value} type="button" onClick={() => set('max_belt_permission', b.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${
                  form.max_belt_permission === b.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)]/5'
                    : 'border-[var(--tss-gray-100)] hover:border-[var(--tss-gray-300)]'
                }`}>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: b.color, border: b.value === 'white_belt' ? '1px solid #ddd' : 'none' }} />
                <span className={`text-xs font-medium ${form.max_belt_permission === b.value ? 'text-[var(--tss-navy)]' : 'text-[var(--tss-gray-700)]'}`}>
                  {b.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>TSS Certification Level</label>
          <div className="grid grid-cols-2 gap-2">
            {CERT_LEVELS.map(c => (
              <button key={c.value} type="button" onClick={() => set('certification_level', c.value)}
                className={`px-3 py-2 text-xs rounded-xl border text-left transition-all ${
                  form.certification_level === c.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white shadow-sm'
                    : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)]'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        </>)}
      </div>

      {/* Optional */}
      <div className="bg-white rounded-xl border border-[var(--tss-gray-100)] p-5 space-y-4 shadow-sm">
        <p className="text-xs tracking-widest text-[var(--tss-gray-500)] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>Optional</p>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Specialty Area</label>
          <input type="text" value={form.specialty_area} onChange={e => set('specialty_area', e.target.value)}
            placeholder="e.g. Competition, Beginners, Barrel riding"
            className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-gray-700)] mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Internal Notes</label>
          <textarea value={form.internal_notes} onChange={e => set('internal_notes', e.target.value)}
            placeholder="Notes visible only to admin..."
            rows={3}
            className="w-full px-3 py-2 border border-[var(--tss-gray-200)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent resize-none" />
        </div>
      </div>

      {error && <p className="text-sm text-[var(--tss-danger)] bg-red-50 p-3 rounded-xl">{error}</p>}

      <div className="flex gap-3">
        <button onClick={() => router.push('/coaches')}
          className="flex-1 py-3 border border-[var(--tss-gray-200)] text-[var(--tss-gray-700)] text-sm rounded-xl hover:bg-[var(--tss-gray-50)] transition-all">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 bg-[var(--tss-navy)] text-white text-sm font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-sm">
          {loading ? 'Creating...' : 'Create Coach'}
        </button>
      </div>
    </div>
  );
}
