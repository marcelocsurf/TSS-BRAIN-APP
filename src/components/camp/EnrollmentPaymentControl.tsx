'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateEnrollmentPayment } from '@/lib/actions/camps';
import { Check, DollarSign, Pencil } from 'lucide-react';

interface Props {
  participantId: string;
  campInstanceId: string;
  studentId: string;
  paymentStatus: string | null;   // 'reserved' | 'paid' | null
  amountCents: number | null;
  currency: string | null;
  isRefresher: boolean;
  saleType?: string | null;       // full | discount | courtesy (M145 · F2)
  discountReason?: string | null;
  listPriceCents?: number | null; // official service price (F2b)
}

// Seat-level sale (M145 · F2): paid/reserved toggle + HOW it was sold — full
// price, discount (with reason) or courtesy — and for how much. Feeds the
// camp's revenue side of cost-vs-income.
export function EnrollmentPaymentControl({
  participantId,
  paymentStatus,
  amountCents,
  saleType = null,
  discountReason = null,
  listPriceCents = null,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>(saleType ?? 'full');
  const [amount, setAmount] = useState(amountCents != null ? String(amountCents / 100) : '');
  const [reason, setReason] = useState(discountReason ?? '');
  // Payment-method picker (front-desk reality: cash, card, transfer, or a
  // hotel room charge with the room number as reference).
  const [payOpen, setPayOpen] = useState(false);
  const [room, setRoom] = useState('');
  const isPaid = paymentStatus === 'paid';

  const markUnpaid = () => {
    startTransition(async () => {
      await updateEnrollmentPayment({ participantId, payment_status: 'reserved' });
      router.refresh();
    });
  };

  const markPaid = (method: string) => {
    startTransition(async () => {
      try {
        const r: any = await updateEnrollmentPayment({ participantId, payment_status: 'paid', payment_method: method });
        if (r && r.success === false) { alert(r.error); return; }
        setPayOpen(false);
        router.refresh();
      } catch (e: any) {
        alert(e?.message || 'Could not mark as paid');
      }
    });
  };

  const saveSale = () => {
    // (courtesy path can also hit the waiver gate — handled below)
    // Full price is the official service price when one is set.
    const amt = type === 'courtesy' ? 0
      : type === 'full' && listPriceCents != null ? listPriceCents
      : Math.round((parseFloat(amount) || 0) * 100);
    startTransition(async () => {
      const r: any = await updateEnrollmentPayment({
        participantId,
        amount_cents: amt,
        sale_type: type as any,
        discount_reason: type === 'full' ? null : reason.trim() || null,
        // A courtesy seat is settled by definition.
        ...(type === 'courtesy' ? { payment_status: 'paid' as const } : {}),
      });
      if (r && r.success === false) { alert(r.error); return; }
      setOpen(false);
      router.refresh();
    });
  };

  const saleChip = () => {
    if (saleType === 'courtesy') return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Courtesy</span>;
    if (saleType === 'discount') return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">Disc.</span>;
    if (saleType === 'full') return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Full</span>;
    return null;
  };

  return (
    <div className="relative shrink-0 flex items-center gap-1">
      {amountCents != null && amountCents > 0 && (
        <span className="text-[10px] font-semibold text-gray-500">${(amountCents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
      )}
      {saleChip()}

      {isPaid ? (
        <button
          type="button"
          onClick={markUnpaid}
          disabled={pending}
          title="Mark as not paid"
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 disabled:opacity-50"
        >
          <Check size={11} /> Paid
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setPayOpen(!payOpen)}
          disabled={pending}
          title="Mark seat as paid"
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
        >
          <DollarSign size={11} /> {pending ? '…' : 'Reserved'}
        </button>
      )}

      {payOpen && !isPaid && (
        <div className="absolute right-0 top-7 z-30 w-52 rounded-xl border border-gray-200 bg-white shadow-lg p-3 space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">How was it paid?</p>
          {([['cash', '💵 Cash'], ['card', '💳 Card'], ['transfer', '🏦 Transfer']] as const).map(([v, l]) => (
            <button key={v} type="button" disabled={pending} onClick={() => markPaid(v)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--tss-navy)] bg-gray-50 hover:bg-gray-100 disabled:opacity-50">
              {l}
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Room #"
              className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
            />
            <button type="button" disabled={pending || !room.trim()} onClick={() => markPaid(`room:${room.trim()}`)}
              className="flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-[var(--tss-navy)] text-white disabled:opacity-40">
              🏨 Charge to room
            </button>
          </div>
          <button type="button" onClick={() => setPayOpen(false)} className="w-full py-1 rounded-lg text-[11px] text-gray-400 hover:bg-gray-50">Cancel</button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1 rounded-md text-gray-300 hover:text-[var(--tss-navy)] hover:bg-gray-100"
        title="Edit sale (amount, discount, courtesy)"
      >
        <Pencil size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-30 w-60 rounded-xl border border-gray-200 bg-white shadow-lg p-3 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Seat sale</p>
          <div className="flex gap-1">
            {([['full', 'Full'], ['discount', 'Discount'], ['courtesy', 'Courtesy']] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setType(v);
                  if (v === 'courtesy') setAmount('0');
                  if (v === 'full' && listPriceCents != null) setAmount(String(listPriceCents / 100));
                }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border ${type === v ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={type === 'courtesy' || (type === 'full' && listPriceCents != null)}
              placeholder="Sold for…"
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          {type === 'discount' && listPriceCents != null && (
            <p className="text-[10px] text-gray-400">List price: ${(listPriceCents / 100).toLocaleString('en-US')}</p>
          )}
          {type !== 'full' && (
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'courtesy' ? 'Why courtesy? (e.g. influencer, staff)' : 'Discount reason (e.g. returning, promo)'}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
            />
          )}
          <div className="flex gap-1.5">
            <button type="button" disabled={pending} onClick={saveSale} className="flex-1 py-1.5 rounded-lg bg-[var(--tss-navy)] text-white text-xs font-bold disabled:opacity-50">
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
