'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCoachActiveStatus } from '@/lib/actions/coach-admin';

export function ToggleCoachStatus({ coachId, isActive, currentUserRole }: {
  coachId: string;
  isActive: boolean;
  currentUserRole: string;
}) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Only admin can toggle
  if (currentUserRole !== 'admin') return null;

  const handleToggle = async () => {
    if (!confirm(active
      ? 'Deactivate this coach? They will no longer be able to register sessions.'
      : 'Reactivate this coach?'
    )) return;

    setLoading(true);
    const res = await setCoachActiveStatus(coachId, !active);
    setLoading(false);
    if (!res.ok) {
      alert(res.error || 'Could not update status.');
      return;
    }
    setActive(a => !a);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all disabled:opacity-50 ${
        active
          ? 'border-red-200 text-red-500 hover:bg-red-50'
          : 'border-green-200 text-green-600 hover:bg-green-50'
      }`}
    >
      {loading ? '...' : active ? 'Deactivate Coach' : 'Reactivate Coach'}
    </button>
  );
}
