'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import {
  startStudentImpersonation,
  startCoachImpersonation,
} from '@/lib/actions/impersonate';

type Props =
  | { kind: 'student'; studentId: string; label?: string }
  | { kind: 'coach'; coachId: string; label?: string };

export function OpenAsButton(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      try {
        const url =
          props.kind === 'student'
            ? await startStudentImpersonation(props.studentId)
            : await startCoachImpersonation(props.coachId);
        router.push(url);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Could not open impersonation.');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
    >
      <Eye size={14} strokeWidth={1.75} />
      {pending ? 'Opening…' : props.label ?? (props.kind === 'student' ? 'Open as student' : 'Open as coach')}
    </button>
  );
}
