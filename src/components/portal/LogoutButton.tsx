'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { logoutStudent } from '@/lib/actions/student-pin';

export function LogoutButton({ portalToken }: { portalToken: string }) {
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      try {
        await logoutStudent(portalToken);
      } catch {
        // logoutStudent redirects to '/' via Next's redirect() which throws —
        // that's expected. Swallow silently.
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-white/60 hover:text-white px-2 py-1 disabled:opacity-50"
      aria-label="Log out"
    >
      <LogOut size={13} strokeWidth={1.75} />
      {pending ? 'Signing out…' : 'Log out'}
    </button>
  );
}
