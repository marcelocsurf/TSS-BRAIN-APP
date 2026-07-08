// Sales/capacity roll-up across the services currently in view. Pure display:
// sums spots opened, sold vs reserved seats, occupancy %, and committed money
// from the participants' own amount_cents. Recalculates as services change.

export function OccupancySummary({ camps }: { camps: any[] }) {
  // Cancelled services don't count toward the plan.
  const live = (camps ?? []).filter((c) => c.status !== 'cancelled');
  if (live.length === 0) return null;

  let spots = 0;
  let sold = 0;       // paid seats
  let reserved = 0;   // enrolled but unpaid
  let soldCents = 0;
  let reservedCents = 0;

  for (const c of live) {
    const cap = c.capacity_override ?? c.camp_templates?.capacity_max ?? 4;
    spots += cap;
    const active = (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    for (const p of active) {
      const paid = p.payment_status === 'paid';
      if (paid) { sold += 1; soldCents += p.amount_cents ?? 0; }
      else { reserved += 1; reservedCents += p.amount_cents ?? 0; }
    }
  }

  const enrolled = sold + reserved;
  const available = Math.max(0, spots - enrolled);
  const occupancy = spots > 0 ? Math.round((enrolled / spots) * 100) : 0;
  const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const stats = [
    { label: 'Spots opened', value: String(spots), accent: '#0A1628' },
    { label: 'Sold', value: String(sold), accent: '#059669' },
    { label: 'Reserved', value: String(reserved), accent: '#D97706' },
    { label: 'Available', value: String(available), accent: '#6B7280' },
  ];

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          Occupancy · {live.length} service{live.length === 1 ? '' : 's'} in view
        </p>
        <p className="text-[11px] font-semibold" style={{ color: occupancy >= 80 ? '#059669' : occupancy >= 40 ? '#D97706' : '#6B7280' }}>
          {occupancy}% full
        </p>
      </div>

      {/* Occupancy bar: sold (green) + reserved (amber) over total spots */}
      <div className="h-2.5 rounded-full overflow-hidden bg-gray-100 flex mb-3">
        <div style={{ width: spots ? `${(sold / spots) * 100}%` : '0%', background: '#059669' }} />
        <div style={{ width: spots ? `${(reserved / spots) * 100}%` : '0%', background: '#F59E0B' }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-xl font-bold leading-none" style={{ color: s.accent }}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1.5" style={{ fontFamily: 'DM Mono, monospace' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {(soldCents > 0 || reservedCents > 0) && (
        <p className="text-[11px] text-gray-500 mt-3">
          <span className="font-semibold text-emerald-700">{money(soldCents)}</span> collected
          {reservedCents > 0 && <> · <span className="font-semibold text-amber-700">{money(reservedCents)}</span> reserved (unpaid)</>}
          {' · '}<span className="text-gray-400">{money(soldCents + reservedCents)} committed</span>
        </p>
      )}
    </div>
  );
}
