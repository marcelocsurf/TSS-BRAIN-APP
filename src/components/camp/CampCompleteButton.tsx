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
  const [confirming, setConfirming] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeCamp(campId);
      setConfirming(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to complete camp');
    }
    setLoading(false);
  };

  if (confirming) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-[5px] p-4 space-y-3">
        <p className="text-sm text-amber-800 font-medium text-center">
          Are you sure? This will mark the camp as completed.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Completing...' : 'Yes, Complete'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex-1 py-2.5 bg-[#F7F9FA] text-[#55666E] border border-[#DCD7C6] rounded-lg text-sm font-medium hover:bg-[#F7F9FA] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-full py-3 bg-green-600 text-white rounded-[5px] text-sm font-medium hover:bg-green-700 transition-all"
    >
      Complete Camp
    </button>
  );
}
