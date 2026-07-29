'use client';

import { useEffect, useState, useTransition } from 'react';
import { listMyPendingPromotions, resolvePromotionByToken, type PortalPendingPromotion } from '@/lib/actions/belt-promotions';

// #12a — El head coach confirma promociones de cinta desde SU portal.
// La autoridad es del rol; el tope lo pone su certificación (política 2026-07-11).
const BELT_LABEL: Record<string, string> = {
  white_belt: 'White', yellow_belt: 'Yellow', blue_belt: 'Blue',
  purple_belt: 'Purple', brown_belt: 'Brown', black_belt: 'Black',
};

export function PendingPromotions({ token }: { token: string }) {
  const [rows, setRows] = useState<PortalPendingPromotion[] | null>(null);
  const [pending, start] = useTransition();
  const load = () => listMyPendingPromotions(token).then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

  if (!rows || rows.length === 0) return null;

  const act = (id: string, confirm: boolean) => start(async () => {
    const res = await resolvePromotionByToken(token, id, confirm);
    if (!res.ok) { alert(res.error || 'No se pudo.'); return; }
    load();
  });

  return (
    <div className="rounded-2xl border-2 border-[#FFD166] bg-[#FFD166]/10 p-4">
      <p className="text-[13px] font-bold text-[#7a5c00]">🏅 Promociones de cinta por confirmar ({rows.length})</p>
      <div className="mt-2 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl bg-white border border-[#FFD166]/60 px-3 py-2.5">
            <p className="text-[13px] font-bold text-[#061C2B]">{r.student_name}</p>
            <p className="text-[11px] text-gray-500">
              {BELT_LABEL[r.from_belt ?? ''] ?? '—'} → <strong>{BELT_LABEL[r.recommended_belt] ?? r.recommended_belt}</strong>
              {r.camp_name ? ` · ${r.camp_name}` : ''}
            </p>
            <div className="flex gap-1.5 mt-2">
              {r.can_confirm ? (
                <button onClick={() => act(r.id, true)} disabled={pending}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-500 text-white disabled:opacity-50">
                  ✓ Confirmar promoción
                </button>
              ) : (
                <span className="text-[10px] text-amber-700 py-1.5">Tu certificación no cubre esta cinta — la confirma un coach certificado o el coordinador.</span>
              )}
              <button onClick={() => act(r.id, false)} disabled={pending}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-red-600 disabled:opacity-50">
                ✗ Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
