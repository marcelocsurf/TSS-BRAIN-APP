'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateEnrollmentPayment } from '@/lib/actions/camps';
import { Check, DollarSign } from 'lucide-react';

interface Props {
  participantId: string;
  campInstanceId: string;
  studentId: string;
  paymentStatus: string | null;   // 'reserved' | 'paid' | null
  amountCents: number | null;
  currency: string | null;
  isRefresher: boolean;
}

// Seat-level confirmation. Just reserved ↔ paid — no amount entry. The
// academy's real billing comes from course-access grants (automatic on
// enrolment), not from this toggle. This is only the seller's "did they
// confirm/pay the seat" flag.
export function EnrollmentPaymentControl({
  participantId,
  paymentStatus,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isPaid = paymentStatus === 'paid';

  const toggle = (next: 'paid' | 'reserved') => {
    startTransition(async () => {
      await updateEnrollmentPayment({ participantId, payment_status: next });
      router.refresh();
    });
  };

  if (isPaid) {
    return (
      <button
        type="button"
        onClick={() => toggle('reserved')}
        disabled={pending}
        title="Mark as not paid"
        className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 disabled:opacity-50"
      >
        <Check size={11} /> Paid
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle('paid')}
      disabled={pending}
      title="Mark seat as paid"
      className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
    >
      <DollarSign size={11} /> {pending ? '…' : 'Reserved'}
    </button>
  );
}
