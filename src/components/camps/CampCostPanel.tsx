import { getCampCostBreakdown } from '@/lib/actions/costs';
import { DollarSign } from 'lucide-react';
import Link from 'next/link';

// Cost vs revenue for one camp (M145). F2 adds the REAL column — only days
// actually delivered (closed plans) count — plus the seat sale mix.
// Server component — renders nothing pre-migration or when the engine
// returns nothing.
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
  const started = b.deliveredDays > 0;
  const mixChips: Array<[string, number, string]> = [
    ['Full', b.saleMix.full, 'bg-gray-100 text-gray-600 border-gray-200'],
    ['Discount', b.saleMix.discount, 'bg-sky-50 text-sky-700 border-sky-200'],
    ['Courtesy', b.saleMix.courtesy, 'bg-purple-50 text-purple-700 border-purple-200'],
    ['No sale type', b.saleMix.unset, 'bg-amber-50 text-amber-700 border-amber-200'],
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tss-navy)]">
          <DollarSign size={15} className="text-[var(--tss-cyan,#5AC3E7)]" /> Cost &amp; margin
        </h3>
        <Link href="/costs" className="text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-[var(--tss-navy)]">Rates →</Link>
      </div>
      <p className="text-[10px] text-gray-400 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
        {b.students} students · {b.days} days ({b.deliveredDays} delivered) · {b.transportDays} transport ({b.realTransportDays} real) · {b.assistants} assistant{b.assistants === 1 ? '' : 's'}{b.filmers > 0 ? ` · ${b.filmers} filmer` : ''}
      </p>

      {b.matrixMissing && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
          No coach pay rate for “{b.level ?? '?'} · {Math.min(Math.max(b.students, 1), 6)} students” — set it in <Link href="/costs" className="underline">Costs</Link>.
        </p>
      )}

      <div className="flex items-center justify-end gap-4 text-[9px] font-mono uppercase tracking-wider text-gray-400 pb-1">
        <span className="w-14 text-right">Estimated</span>
        <span className="w-14 text-right">Real</span>
      </div>
      <div className="divide-y divide-gray-50">
        {b.lines.map((l, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-1.5">
            <p className="text-[12px] text-gray-700 min-w-0 truncate">
              {l.name} <span className="text-gray-400">· {money(l.unit_cents)} × {l.qty_label}</span>
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <p className="w-14 text-right text-[12px] font-semibold text-[var(--tss-navy)]">{money(l.total_cents)}</p>
              <p className={`w-14 text-right text-[12px] ${started ? 'font-semibold text-gray-700' : 'text-gray-300'}`}>{money(l.real_total_cents)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-bold text-[var(--tss-navy)]">Total cost</p>
          <div className="flex items-center gap-4 shrink-0">
            <p className="w-14 text-right text-[14px] font-bold text-[var(--tss-navy)]">{money(b.totalCents)}</p>
            <p className={`w-14 text-right text-[14px] font-bold ${started ? 'text-gray-700' : 'text-gray-300'}`}>{money(b.realTotalCents)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-600">Revenue committed <span className="text-gray-400">({money(b.revenueCollectedCents)} collected)</span></p>
          <p className="text-[13px] font-semibold text-emerald-700">{money(b.revenueCommittedCents)}</p>
        </div>
        <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: `${marginColor}12` }}>
          <p className="text-[12px] font-bold" style={{ color: marginColor }}>Margin (estimated)</p>
          <p className="text-[14px] font-bold" style={{ color: marginColor }}>
            {money(b.marginCents)}{pct != null ? ` · ${pct}%` : ''}
          </p>
        </div>
        {started && (
          <div className="flex items-center justify-between px-2.5">
            <p className="text-[11px] text-gray-500">Margin real (to date)</p>
            <p className={`text-[12px] font-semibold ${b.realMarginCents >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{money(b.realMarginCents)}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {mixChips.filter(([, n]) => n > 0).map(([label, n, cls]) => (
          <span key={label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{n} {label}</span>
        ))}
      </div>
    </div>
  );
}
