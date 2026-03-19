'use client';

import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
  defaultValue: string;
  belt?: string;
  status?: string;
}

export function StudentSearch({ defaultValue, belt, status }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const navigate = useCallback((newValue: string) => {
    const p = new URLSearchParams();
    if (belt) p.set('belt', belt);
    if (status) p.set('status', status);
    if (newValue.trim()) p.set('q', newValue.trim());
    router.push(`/students${p.toString() ? '?' + p.toString() : ''}`);
  }, [belt, status, router]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(newValue), 400);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by name..."
        className="w-full md:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
      />
    </div>
  );
}
