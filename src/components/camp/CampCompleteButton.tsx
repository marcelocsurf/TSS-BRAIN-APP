'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeCamp } from '@/lib/actions/camps';

interface Props {
  campId: string;
}

export function CampCompleteButton({ campId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm('Complete this camp? This will mark the camp as completed for all participants.')) return;
    setLoading(true);
    try {
      await completeCamp(campId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to complete camp');
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={loading}
      className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
    >
      {loading ? 'Completing...' : 'Complete Camp'}
    </button>
  );
}
