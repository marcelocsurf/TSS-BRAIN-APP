'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Full access. Can manage everything.' },
  { value: 'coordinator', label: 'Coordinator', desc: 'Manages schedule, assigns coaches, creates students.' },
  { value: 'coach', label: 'Coach', desc: 'Executes sessions, evaluates students.' },
  { value: 'assistant', label: 'Assistant', desc: 'View-only for assigned sessions. No login in Stage 1.' },
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

export function AddCoachForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'coach',
    max_belt_permission: 'yellow_belt',
    certification_level: 'L1',
    specialty_area: '',
    languages: '',
    internal_notes: '',
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

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

      setSuccess(true);
      setTimeout(() => router.push('/coaches'), 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{'\u2713'}</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">Coach Created</h2>
        <p className="text-sm text-gray-500 mt-2">
          {form.first_name} {form.last_name} has been added as {form.role}.
        </p>
        <p className="text-xs text-gray-400 mt-1">Redirecting to coaches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <p className="text-xs font-mono tracking-widest text-[var(--tss-gold)] uppercase mb-1">TSS Brain · Admin</p>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Add Coach</h1>
        <p className="text-sm text-gray-400 mt-0.5">Create a new team member with their role and permissions.</p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-xs font-mono tracking-widest text-gray-400 uppercase">Basic Information</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
            <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)}
              placeholder="Carlos"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
            <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)}
              placeholder="Santamaria"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="coach@purosurf.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
          <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+503 7000 0000"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Languages *</label>
          <input type="text" value={form.languages} onChange={e => set('languages', e.target.value)}
            placeholder="e.g. Spanish, English"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-xs font-mono tracking-widest text-gray-400 uppercase">System Role</p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Role *</label>
          <div className="space-y-2">
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => set('role', r.value)}
                className={`w-full flex flex-col items-start px-4 py-3 rounded-lg border text-left transition-all ${
                  form.role === r.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}>
                <span className="text-sm font-semibold">{r.label}</span>
                <span className={`text-xs mt-0.5 ${form.role === r.value ? 'text-white/70' : 'text-gray-400'}`}>{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Maximum Belt Permission *</label>
          <p className="text-xs text-gray-400 mb-2">This coach can only coach students up to this belt level.</p>
          <div className="space-y-1.5">
            {BELT_PERMISSIONS.map(b => (
              <button key={b.value} type="button" onClick={() => set('max_belt_permission', b.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                  form.max_belt_permission === b.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)]/5'
                    : 'border-gray-100 hover:border-gray-300'
                }`}>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: b.color, border: b.value === 'white_belt' ? '1px solid #ddd' : 'none' }} />
                <span className={`text-xs font-medium ${form.max_belt_permission === b.value ? 'text-[var(--tss-navy)]' : 'text-gray-600'}`}>
                  {b.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">TSS Certification Level</label>
          <div className="grid grid-cols-2 gap-2">
            {CERT_LEVELS.map(c => (
              <button key={c.value} type="button" onClick={() => set('certification_level', c.value)}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                  form.certification_level === c.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-xs font-mono tracking-widest text-gray-400 uppercase">Optional</p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Specialty Area</label>
          <input type="text" value={form.specialty_area} onChange={e => set('specialty_area', e.target.value)}
            placeholder="e.g. Competition, Beginners, Barrel riding"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Internal Notes</label>
          <textarea value={form.internal_notes} onChange={e => set('internal_notes', e.target.value)}
            placeholder="Notes visible only to admin..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button onClick={() => router.push('/coaches')}
          className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 bg-[var(--tss-navy)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Coach'}
        </button>
      </div>
    </div>
  );
}
