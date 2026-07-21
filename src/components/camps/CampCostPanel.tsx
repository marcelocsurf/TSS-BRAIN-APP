import { getCampCostBreakdown } from '@/lib/actions/costs';
import { DollarSign } from 'lucide-react';
import Link from 'next/link';

// Estimated cost vs revenue for one camp (M145 · F1). Server component —
// renders nothing pre-migration or when the engine returns nothing.
export async function CampCostPanel({ campInstanceId }: { campInstanceId: string }) {
  let b;
  try {
    b = await getCampCostBreakdown(campInstanceId);
  } catch {
    return null;
  }
  if (!b) return null;
  if (b.lines.length === 0 && b.totalCents === 0) return null;

  const money = (c: number) => `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const pct = b.marginPct;
  const marginColor = pct == null ? '#6B7280' : pct >= 30 ? '#059669' : pct >= 15 ? '#D97706' : '#DC2626';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tss-navy)]">
          <DollarSign size={15} className="text-[var(--tss-cyan,#5AC3E7)]" /> Cost &amp; margin (estimated)
        </h3>
        <Link href="/costs" className="text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-[var(--tss-navy)]">Rates →</Link>
      </div>
      <p className="text-[10px] text-gray-400 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
        {b.students} students · {b.days} days · {b.transportDays} transport · {b.assistants} assistant{b.assistants === 1 ? '' : 's'}{b.filmers > 0 ? ` · ${b.filmers} filmer` : ''}
      </p>

      {b.matrixMissing && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
          No coach pay rate for “{b.level ?? '?'} · {Math.min(Math.max(b.students, 1), 6)} students” — set it in <Link href="/costs" className="underline">Costs</Link>.
        </p>
      )}

      <div className="divide-y divide-gray-50">
        {b.lines.map((l, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-1.5">
            <p className="text-[12px] text-gray-700 min-w-0 truncate">
              {l.name} <span className="text-gray-400">· {money(l.unit_cents)} × {l.qty_label}</span>
            </p>
            <p className="text-[12px] font-semibold text-[var(--tss-navy)] shrink-0">{money(l.total_cents)}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-[var(--tss-navy)]">Total cost</p>
          <p className="text-[14px] font-bold text-[var(--tss-navy)]">{money(b.totalCents)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-600">Revenue committed <span className="text-gray-400">({money(b.revenueCollectedCents)} collected)</span></p>
          <p className="text-[13px] font-semibold text-emerald-700">{money(b.revenueCommittedCents)}</p>
        </div>
        <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: `${marginColor}12` }}>
          <p className="text-[12px] font-bold" style={{ color: marginColor }}>Margin</p>
          <p className="text-[14px] font-bold" style={{ color: marginColor }}>
            {money(b.marginCents)}{pct != null ? ` · ${pct}%` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
