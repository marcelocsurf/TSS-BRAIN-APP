'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ToggleCoachStatus({ coachId, isActive, currentUserRole }: {
  coachId: string;
  isActive: boolean;
  currentUserRole: string;
}) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  // Only admin can toggle
  if (currentUserRole !== 'admin') return null;

  const handleToggle = async () => {
    if (!confirm(active
      ? 'Deactivate this coach? They will no longer be able to register sessions.'
      : 'Reactivate this coach?'
    )) return;

    setLoading(true);
    const supabase = createClient();
    await supabase
      .from('coaches')
      .update({ active_status: !active })
      .eq('id', coachId);
    setActive(a => !a);
    setLoading(false);
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
