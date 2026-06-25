'use client';

import { useState, useTransition } from 'react';
import { setStudentPriorVisits } from '@/lib/actions/students';

// Small inline editor for visits that happened before the app existed.
export function PriorVisitsEditor({ studentId, initial }: { studentId: string; initial: number }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const save = () => {
    setSaved(false);
    start(async () => {
      const r = await setStudentPriorVisits(studentId, value);
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    });
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs text-gray-500 flex-1">Prior visits (before the app)</span>
      <input
        type="number"
        min={0}
        max={99}
        value={value}
        onChange={(e) => setValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right"
      />
      <button
        type="button"
        onClick={save}
        disabled={pending || value === initial}
        className="text-xs px-2.5 py-1 rounded-lg bg-[var(--tss-navy)] text-white disabled:opacity-40"
      >
        {pending ? '…' : saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
