'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

// Month selector + CSV export. Owns the URL ?month= search param so
// the page can be deep-linked to any historical month for invoicing.

interface Props {
  yearMonth: string; // 'YYYY-MM'
}

function shiftMonth(ym: string, by: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function BillingMonthClient({ yearMonth }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const goto = (ym: string) => {
    const next = new URLSearchParams(params);
    next.set('month', ym);
    router.push(`/admin/billing?${next.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => goto(shiftMonth(yearMonth, -1))}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} strokeWidth={2} className="text-gray-700" />
      </button>

      <input
        type="month"
        value={yearMonth}
        onChange={(e) => goto(e.target.value)}
        className="px-3 py-1.5 border border-gray-200 rounded-md text-xs"
        style={{ fontFamily: 'DM Mono, monospace' }}
      />

      <button
        type="button"
        onClick={() => goto(shiftMonth(yearMonth, 1))}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={16} strokeWidth={2} className="text-gray-700" />
      </button>

      <a
        href={`/admin/billing/export?month=${yearMonth}`}
        download={`tss-billing-${yearMonth}.csv`}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--tss-navy)] text-white text-xs rounded-md font-semibold hover:brightness-110 transition-all"
      >
        <Download size={12} strokeWidth={2} />
        CSV
      </a>
    </div>
  );
}
