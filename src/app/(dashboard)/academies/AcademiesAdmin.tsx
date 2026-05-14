'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAcademy, assignCoordinator } from './actions';

interface Academy {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  created_at: string;
  assigned_coordinator_id: string | null;
  coordinator_name: string | null;
  coordinator_email: string | null;
  student_count: number;
}

export function AcademiesAdmin({ academies }: { academies: Academy[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Create-academy form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');
  const [createError, setCreateError] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !slug.trim()) {
      setCreateError('Name and slug are required');
      return;
    }
    setCreateError('');
    startTransition(async () => {
      try {
        await createAcademy({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          country: country.trim() || null,
        });
        setName('');
        setSlug('');
        setCountry('');
        setAdding(false);
        router.refresh();
      } catch (e: any) {
        setCreateError(e.message || 'Failed to create academy');
      }
    });
  };

  return (
    <div className="space-y-3">
      {academies.map((a) => (
        <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-base font-bold text-[var(--tss-navy)]">{a.name}</p>
              <p className="text-[11px] text-gray-500 font-mono">
                {a.slug}
                {a.country ? ` · ${a.country}` : ''}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">
              {new Date(a.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-mono">
                Coordinator
              </p>
              {a.coordinator_name ? (
                <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">
                  {a.coordinator_name}{' '}
                  <span className="text-[11px] text-gray-500 font-normal">
                    · {a.coordinator_email}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-amber-700">— No coordinator assigned —</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAssigningTo(a.id)}
              className="text-[11px] px-3 py-1.5 border border-[var(--tss-navy)] text-[var(--tss-navy)] rounded-lg hover:bg-[var(--tss-navy)] hover:text-white transition-colors whitespace-nowrap"
            >
              {a.coordinator_name ? 'Change' : 'Assign'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>👥 {a.student_count} students</span>
          </div>

          {assigningTo === a.id && (
            <AssignCoordinatorForm
              academy={a}
              onClose={() => setAssigningTo(null)}
              onDone={() => {
                setAssigningTo(null);
                router.refresh();
              }}
            />
          )}
        </div>
      ))}

      {adding ? (
        <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--tss-navy)]">New Academy</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Bali Surf School)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="slug (e.g. bali-surf-school)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
          />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country code (e.g. ID, SV, MX)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          {createError && <p className="text-xs text-red-600">{createError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setCreateError('');
              }}
              className="px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={pending || !name.trim() || !slug.trim()}
              className="flex-1 px-3 py-2 text-xs text-white bg-[var(--tss-navy)] rounded-lg disabled:opacity-50"
            >
              {pending ? 'Creating…' : 'Create Academy'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl text-sm text-gray-600"
        >
          + New Academy
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Assign-Coordinator inline form
// ────────────────────────────────────────────────────────────────

function AssignCoordinatorForm({
  academy,
  onClose,
  onDone,
}: {
  academy: Academy;
  onClose: () => void;
  onDone: () => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name and email are required.');
      return;
    }
    if (!email.includes('@')) {
      setError('Invalid email.');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await assignCoordinator({
          academy_id: academy.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          languages: languages.trim() || undefined,
        });
        setSuccess(true);
        setTimeout(onDone, 1200);
      } catch (e: any) {
        setError(e.message || 'Failed to assign coordinator.');
      }
    });
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
        <p className="text-sm font-semibold text-emerald-700">✓ Coordinator assigned</p>
        <p className="text-[11px] text-emerald-700 mt-0.5">Invite email sent to {email}</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-[var(--tss-navy)]">
        Assign coordinator to {academy.name}
      </p>
      <p className="text-[11px] text-gray-600">
        They&apos;ll receive a Supabase invite email. Existing coach? Their record
        will be moved to this academy and promoted to coordinator.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          className="px-2 py-1.5 border border-gray-200 rounded text-xs"
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          className="px-2 py-1.5 border border-gray-200 rounded text-xs"
        />
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@academy.com"
        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="px-2 py-1.5 border border-gray-200 rounded text-xs"
        />
        <input
          type="text"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="Languages (optional)"
          className="px-2 py-1.5 border border-gray-200 rounded text-xs"
        />
      </div>

      {error && <p className="text-[11px] text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1.5 text-[11px] text-gray-600 border border-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="flex-1 px-2.5 py-1.5 text-[11px] text-white bg-[var(--tss-navy)] rounded disabled:opacity-50"
        >
          {pending ? 'Sending invite…' : 'Send invite + Assign'}
        </button>
      </div>
    </div>
  );
}
