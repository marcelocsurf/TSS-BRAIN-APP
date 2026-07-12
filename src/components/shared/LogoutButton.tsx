'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton({
  className,
  label = 'Logout',
}: {
  className?: string;
  label?: string;
} = {}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ??
        'text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer'
      }
    >
      {label}
    </button>
  );
}
