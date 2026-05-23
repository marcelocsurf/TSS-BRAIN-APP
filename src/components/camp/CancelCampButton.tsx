'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { cancelCampInstance } from '@/lib/actions/camps';

export function CancelCampButton({
  campInstanceId,
  campName,
}: {
  campInstanceId: string;
  campName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const cancel = () => {
    if (
      !confirm(
        `Cancel "${campName}"? It disappears from the calendar but enrolment and evaluation history are preserved.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await cancelCampInstance(campInstanceId);
        router.push('/camps');
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={pending}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      <Trash2 size={12} strokeWidth={1.75} />
      {pending ? 'Cancelling…' : 'Cancel service'}
    </button>
  );
}
