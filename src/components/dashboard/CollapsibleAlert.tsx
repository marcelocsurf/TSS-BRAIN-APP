'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Compact, notification-style section for the coordinator dashboard. Shows a
// title + count chip collapsed by default; click to expand the list. Keeps the
// dashboard short when there are many pending items.
export function CollapsibleAlert({
  title,
  count,
  tone = 'amber',
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  tone?: 'amber' | 'red' | 'orange' | 'gray';
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tones: Record<string, { chip: string; border: string; dot: string }> = {
    amber: { chip: 'bg-amber-50 text-amber-700', border: 'border-amber-100', dot: 'bg-amber-400' },
    red: { chip: 'bg-red-50 text-red-600', border: 'border-red-100', dot: 'bg-red-400' },
    orange: { chip: 'bg-orange-50 text-orange-600', border: 'border-orange-100', dot: 'bg-orange-400' },
    gray: { chip: 'bg-gray-100 text-gray-600', border: 'border-gray-100', dot: 'bg-gray-400' },
  };
  const t = tones[tone] ?? tones.amber;

  return (
    <div className={`bg-white rounded-xl border ${t.border} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/60 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${t.dot}`} />
          <span className="text-sm font-semibold text-[var(--tss-navy)]">{title}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.chip}`}>{count}</span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-t border-gray-50 divide-y divide-gray-50">{children}</div>}
    </div>
  );
}
