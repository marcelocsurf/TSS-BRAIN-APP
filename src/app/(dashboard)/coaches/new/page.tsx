'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { value: 'junior_coach', label: 'Junior Coach' },
  { value: 'assistant_coach', label: 'Assistant Coach' },
  { value: 'coach', label: 'Coach' },
  { value: 'senior_coach', label: 'Senior Coach' },
  { value: 'head_coach', label: 'Head Coach' },
  { value: 'holistic_coach', label: 'Holistic Coach' },
];

const BELT_PERMISSIONS = [
  { value: 'white_belt', label: 'White Belt — Beginner', color: '#E8E8E8' },
  { value: 'yellow_belt', label: 'Yellow Belt — Novice', color: '#F5C518' },
  { value: 'blue_belt', label: 'Blue Belt — Foundation', color: '#1E6FBF' },
  { value: 'purple_belt', label: 'Purple Belt — Emerging', color: '#7B4FBE' },
  { value: 'brown_belt', label: 'Brown Belt — Pre-Elite', color: '#7D4E27' },
  { value: 'black_belt', label: 'Black Belt — Elite', color: '#111111' },
];

export default function AddCoachPage() {
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
    specialty_area: '',
    languages: '',
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      setError('First name, last name and email are required.');
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
      if (!res.ok) throw new Error(data.error || 'Failed to invite coach');

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
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">Invitation Sent</h2>
        <p className="text-sm text-gray-500 mt-2">
          {form.first_name} will receive an email to set up their password and access TSS Brain.
        </p>
        <p className="text-xs text-gray-400 mt-1">Redirecting to coaches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <p className="text-xs font-mono tracking-widest text-[var(--tss-gold)] uppercase mb-1">TSS Brain · Director</p>
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Add Coach</h1>
        <p className="text-sm text-gray-400 mt-0.5">An invitation email will be sent to set up their access.</p>
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+503 7000 0000"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-xs font-mono tracking-widest text-gray-400 uppercase">Role & Permissions</p>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Role *</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => set('role', r.value)}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                  form.role === r.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}>
                {r.label}
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Languages</label>
          <input type="text" value={form.languages} onChange={e => set('languages', e.target.value)}
            placeholder="e.g. Spanish, English"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
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
          {loading ? 'Sending Invitation...' : 'Send Invitation'}
        </button>
      </div>
    </div>
  );
}
