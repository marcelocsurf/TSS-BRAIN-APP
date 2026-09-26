'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
  defaultValue: string;
  belt?: string;
  status?: string;
}

export function StudentSearch({ defaultValue, belt, status }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Bug (Marcelo 2026-09-26: "pongo una letra y me la borra"): cada búsqueda
  // hace un push a la URL y la página vuelve del servidor con el q VIEJO; este
  // efecto pisaba lo que el usuario siguió tecleando durante el viaje. Mientras
  // el campo tiene el foco, lo que escribe el usuario manda; la URL solo
  // resincroniza el campo cuando no está escribiendo (p. ej. "Clear all").
  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setValue(defaultValue);
  }, [defaultValue]);

  const navigate = useCallback((newValue: string) => {
    // Preserve ALL existing params (including advanced filters)
    const p = new URLSearchParams(searchParams.toString());
    // Reset page on new search
    p.delete('page');
    if (newValue.trim()) {
      p.set('q', newValue.trim());
    } else {
      p.delete('q');
    }
    // replace, no push: tecleo ≠ historial (antes cada pausa era un "atrás").
    router.replace(`/students${p.toString() ? '?' + p.toString() : ''}`);
  }, [searchParams, router]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(newValue), 400);
  };

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by name..."
        className="w-full md:w-64 px-3 py-2 border border-[var(--tss-gray-200)] rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] focus:border-transparent"
      />
    </div>
  );
}
