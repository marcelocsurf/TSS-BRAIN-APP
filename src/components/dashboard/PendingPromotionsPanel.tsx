'use client';

import { useEffect, useState } from 'react';
import { listPendingPromotions, resolvePromotion, type PendingPromotion } from '@/lib/actions/belt-promotions';
import { Award, Check, X } from 'lucide-react';

const BELT_LABEL: Record<string, string> = {
  white_belt: 'White', yellow_belt: 'Yellow', blue_belt: 'Blue',
  purple_belt: 'Purple', brown_belt: 'Brown', black_belt: 'Black',
};
const label = (b: string | null) => (b ? BELT_LABEL[b] ?? b : '—');

// Dashboard panel: belt promotions recommended by a coach who wasn't
// certified high enough to accredit them. An admin / head coach confirms
// (promotes the student) or rejects. Renders nothing when there are none.
export function PendingPromotionsPanel() {
  const [items, setItems] = useState<PendingPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    listPendingPromotions().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const resolve = async (id: string, confirm: boolean) => {
    setBusyId(id);
    const res = await resolvePromotion(id, confirm);
    setBusyId(null);
    if (!res.ok) { alert(res.error || 'Could not update.'); return; }
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading || items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
        <Award size={12} /> Belt promotions to confirm ({items.length})
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Recommended by a coach whose certification is below the target belt. Confirm to promote the student.
      </p>
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">{r.student_name}</p>
              <p className="text-[11px] text-gray-500">
                {label(r.from_belt)} → <span className="font-semibold text-amber-700">{label(r.recommended_belt)}</span>
                {r.recommended_by_name && <> · by {r.recommended_by_name}</>}
                {r.coach_max_belt && <> (cap: {label(r.coach_max_belt)})</>}
              </p>
            </div>
            <button
              onClick={() => resolve(r.id, true)}
              disabled={busyId === r.id}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              <Check size={13} strokeWidth={3} /> Confirm
            </button>
            <button
              onClick={() => resolve(r.id, false)}
              disabled={busyId === r.id}
              className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-50"
            >
              <X size={13} strokeWidth={3} /> Reject
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
