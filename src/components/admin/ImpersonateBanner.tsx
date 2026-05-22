'use client';

import { useTransition } from 'react';
import { LogOut, Eye } from 'lucide-react';
import { endImpersonation } from '@/lib/actions/impersonate';

interface Props {
  kind: 'student' | 'coach' | 'coordinator';
  name: string;
}

export function ImpersonateBanner({ kind, name }: Props) {
  const [pending, startTransition] = useTransition();

  const onExit = () => {
    startTransition(async () => {
      try {
        await endImpersonation();
      } catch {
        // endImpersonation redirects, which throws — that's expected.
      }
    });
  };

  return (
    <div className="bg-amber-400 text-amber-950 px-3 py-2 flex items-center justify-between gap-3 text-xs font-semibold">
      <div className="truncate inline-flex items-center gap-1.5">
        <Eye size={14} strokeWidth={1.75} aria-hidden />
        <span>Viewing as <strong>{name}</strong> ({kind} impersonation)</span>
      </div>
      <button
        type="button"
        onClick={onExit}
        disabled={pending}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-900 text-amber-50 hover:brightness-110 disabled:opacity-50"
      >
        <LogOut size={12} strokeWidth={2} />
        {pending ? 'Exiting…' : 'Exit'}
      </button>
    </div>
  );
}
