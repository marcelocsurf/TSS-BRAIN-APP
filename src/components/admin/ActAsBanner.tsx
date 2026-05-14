'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { actAsAcademy } from '@/lib/actions/auth';

// M7 — Sticky banner shown only to platform admin while they're acting-as
// another academy. Clicking Exit clears the cookie and refreshes.
export function ActAsBanner({ academyName }: { academyName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const exit = () => {
    startTransition(async () => {
      await actAsAcademy(null);
      router.push('/academies');
      router.refresh();
    });
  };

  return (
    <div
      className="sticky top-0 z-50 w-full px-4 py-2 text-xs flex items-center justify-between gap-3"
      style={{ background: '#FEF3C7', borderBottom: '1px solid #F59E0B', color: '#78350F' }}
    >
      <span className="font-medium truncate">
        🎭 Acting as <strong>{academyName}</strong> — viewing the app as that academy&apos;s coordinator.
      </span>
      <button
        type="button"
        onClick={exit}
        disabled={pending}
        className="shrink-0 px-3 py-1 text-[11px] font-semibold rounded-md bg-amber-900 text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? 'Exiting…' : 'Exit · Back to admin'}
      </button>
    </div>
  );
}
