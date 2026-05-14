'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAcademy } from './actions';

interface Academy {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  created_at: string;
}

export function AcademiesAdmin({ academies }: { academies: Academy[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await createAcademy({ name: name.trim(), slug: slug.trim().toLowerCase(), country: country.trim() || null });
        setName('');
        setSlug('');
        setCountry('');
        setAdding(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message || 'Failed to create academy');
      }
    });
  };

  return (
    <div className="space-y-3">
      {academies.map((a) => (
        <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-base font-bold text-[var(--tss-navy)]">{a.name}</p>
              <p className="text-[11px] text-gray-500 font-mono">
                {a.slug}
                {a.country ? ` · ${a.country}` : ''}
              </p>
            </div>
            <span className="text-[10px] text-gray-400">
              Created {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
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
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAdding(false); setError(''); }}
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
