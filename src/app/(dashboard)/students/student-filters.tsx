'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

// ── Filter option definitions ──

const AGE_RANGE_OPTIONS = [
  { value: '', label: 'All Ages' },
  { value: 'junior', label: 'Junior (8-14)' },
  { value: 'teen', label: 'Teen (14-18)' },
  { value: 'young_adult', label: 'Young Adult (18-30)' },
  { value: 'adult', label: 'Adult (30+)' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const LANGUAGE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Other', label: 'Other' },
];

const STANCE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'regular', label: 'Regular' },
  { value: 'goofy', label: 'Goofy' },
];

const RETURNING_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Returning' },
  { value: 'false', label: 'New' },
];

const WAIVER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'signed', label: 'Signed' },
  { value: 'pending', label: 'Pending' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const OCEAN_LEVEL_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'supervised', label: 'Supervised' },
  { value: 'autonomous', label: 'Autonomous' },
  { value: 'advanced', label: 'Advanced' },
];

// Keys that are advanced filter params (not belt/q/page)
const ADVANCED_KEYS = [
  'age_range', 'gender', 'language', 'nationality',
  'stance', 'returning', 'waiver', 'status', 'ocean_level',
] as const;

type AdvancedKey = (typeof ADVANCED_KEYS)[number];

export function StudentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => {
    // Auto-open if any advanced filter is active
    return ADVANCED_KEYS.some((k) => searchParams.get(k));
  });

  // Count active advanced filters
  const activeCount = ADVANCED_KEYS.filter((k) => searchParams.get(k)).length;

  const updateParam = useCallback(
    (key: AdvancedKey, value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (value) {
        p.set(key, value);
      } else {
        p.delete(key);
      }
      // Reset to page 1 on filter change
      p.delete('page');
      router.push(`/students?${p.toString()}`);
    },
    [searchParams, router]
  );

  const clearAll = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    ADVANCED_KEYS.forEach((k) => p.delete(k));
    p.delete('page');
    router.push(`/students${p.toString() ? '?' + p.toString() : ''}`);
  }, [searchParams, router]);

  const currentValue = (key: AdvancedKey) => searchParams.get(key) || '';

  return (
    <div className="mb-4">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--tss-gray-200)] bg-white text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)] transition-all"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-[var(--tss-cyan)] text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Filter panel */}
      {open && (
        <div className="mt-3 p-4 bg-white border border-[var(--tss-gray-100)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-mono)' }}>
              ADVANCED FILTERS
            </p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] text-[var(--tss-cyan)] hover:underline"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FilterSelect
              label="Age Range"
              value={currentValue('age_range')}
              options={AGE_RANGE_OPTIONS}
              onChange={(v) => updateParam('age_range', v)}
            />
            <FilterSelect
              label="Gender"
              value={currentValue('gender')}
              options={GENDER_OPTIONS}
              onChange={(v) => updateParam('gender', v)}
            />
            <FilterSelect
              label="Language"
              value={currentValue('language')}
              options={LANGUAGE_OPTIONS}
              onChange={(v) => updateParam('language', v)}
            />
            <FilterInput
              label="Country / Nationality"
              value={currentValue('nationality')}
              placeholder="e.g. Brazil, USA..."
              onChange={(v) => updateParam('nationality', v)}
            />
            <FilterSelect
              label="Stance"
              value={currentValue('stance')}
              options={STANCE_OPTIONS}
              onChange={(v) => updateParam('stance', v)}
            />
            <FilterSelect
              label="Returning Student"
              value={currentValue('returning')}
              options={RETURNING_OPTIONS}
              onChange={(v) => updateParam('returning', v)}
            />
            <FilterSelect
              label="Waiver Status"
              value={currentValue('waiver')}
              options={WAIVER_OPTIONS}
              onChange={(v) => updateParam('waiver', v)}
            />
            <FilterSelect
              label="Status"
              value={currentValue('status')}
              options={STATUS_OPTIONS}
              onChange={(v) => updateParam('status', v)}
            />
            <FilterSelect
              label="Ocean Level"
              value={currentValue('ocean_level')}
              options={OCEAN_LEVEL_OPTIONS}
              onChange={(v) => updateParam('ocean_level', v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="block text-[10px] text-[var(--tss-gray-500)] mb-1 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-2.5 py-1.5 text-xs border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent transition-all ${
          value
            ? 'border-[var(--tss-cyan)] text-[var(--tss-navy)]'
            : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)]'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (newValue: string) => {
    setLocal(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(newValue), 500);
  };

  return (
    <div>
      <label
        className="block text-[10px] text-[var(--tss-gray-500)] mb-1 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </label>
      <input
        type="text"
        value={local}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full px-2.5 py-1.5 text-xs border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent transition-all ${
          local
            ? 'border-[var(--tss-cyan)] text-[var(--tss-navy)]'
            : 'border-[var(--tss-gray-200)] text-[var(--tss-gray-700)]'
        }`}
      />
    </div>
  );
}
