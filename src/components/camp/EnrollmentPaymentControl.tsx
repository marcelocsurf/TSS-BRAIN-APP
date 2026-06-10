'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateEnrollmentPayment, getSuggestedEnrollmentPrice } from '@/lib/actions/camps';
import { DollarSign, Check } from 'lucide-react';

interface Props {
  participantId: string;
  campInstanceId: string;
  studentId: string;
  paymentStatus: string | null;   // 'reserved' | 'paid' | null
  amountCents: number | null;
  currency: string | null;
  isRefresher: boolean;
}

const METHODS = ['cash', 'transfer', 'card', 'other'] as const;

function fmt(cents: number | null, currency: string) {
  if (cents == null) return '—';
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export function EnrollmentPaymentControl({
  participantId,
  campInstanceId,
  studentId,
  paymentStatus,
  amountCents,
  currency,
  isRefresher,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState(amountCents != null ? (amountCents / 100).toFixed(2) : '');
  const [method, setMethod] = useState<string>('cash');
  const [error, setError] = useState('');
  const cur = currency || 'USD';

  const isPaid = paymentStatus === 'paid';

  const openPanel = async () => {
    setOpen(true);
    setError('');
    if (!amount) {
      // Pre-fill suggested price (refresher = 50%).
      try {
        const sug = await getSuggestedEnrollmentPrice(campInstanceId, studentId);
        if (sug.amount_cents != null) setAmount((sug.amount_cents / 100).toFixed(2));
      } catch { /* ignore */ }
    }
  };

  const markPaid = () => {
    setError('');
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents < 0) {
      setError('Enter a valid amount.');
      return;
    }
    startTransition(async () => {
      try {
        await updateEnrollmentPayment({
          participantId,
          payment_status: 'paid',
          amount_cents: cents,
          payment_method: method,
        });
        setOpen(false);
        router.refresh();
      } catch (e: any) {
        setError(e?.message || 'Could not save.');
      }
    });
  };

  const reopenAsReserved = () => {
    startTransition(async () => {
      await updateEnrollmentPayment({ participantId, payment_status: 'reserved' });
      router.refresh();
    });
  };

  return (
    <div className="shrink-0 text-right">
      {isPaid ? (
        <button
          type="button"
          onClick={reopenAsReserved}
          disabled={pending}
          title="Mark as unpaid"
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <Check size={11} /> Paid · {fmt(amountCents, cur)}
        </button>
      ) : open ? (
        <div className="flex flex-col items-end gap-1.5 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500">{cur}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="0.00"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-1.5 py-1 border border-gray-300 rounded text-xs capitalize"
            >
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {isRefresher && (
            <span className="text-[9px] text-amber-700">Refresher · 50% suggested</span>
          )}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={markPaid}
              disabled={pending}
              className="text-[11px] px-2.5 py-1 bg-[var(--tss-navy)] text-white rounded disabled:opacity-50"
            >
              {pending ? '…' : 'Mark paid'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[11px] px-1.5 text-gray-500">
              Cancel
            </button>
          </div>
          {error && <span className="text-[10px] text-red-600">{error}</span>}
        </div>
      ) : (
        <button
          type="button"
          onClick={openPanel}
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
        >
          <DollarSign size={11} /> Reserved{isRefresher ? ' · refresher' : ''}
        </button>
      )}
    </div>
  );
}
