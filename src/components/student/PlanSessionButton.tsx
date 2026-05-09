'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMultiBlockSession } from '@/lib/actions/multi-block-sessions';

interface Props {
  studentId: string;
  className?: string;
}

export function PlanSessionButton({ studentId, className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const create = () =>
    startTransition(async () => {
      try {
        const { id } = await createMultiBlockSession({ studentId });
        router.push(`/sessions/plan/${id}`);
      } catch (e: any) {
        alert(e.message || 'Failed to create session plan');
      }
    });

  return (
    <button
      type="button"
      disabled={pending}
      onClick={create}
      className={
        className ||
        'px-3 py-2 bg-amber-50 text-amber-700 text-xs rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50'
      }
    >
      {pending ? 'Creating…' : '+ Plan Session'}
    </button>
  );
}
