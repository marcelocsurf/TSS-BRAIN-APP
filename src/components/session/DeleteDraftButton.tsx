'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDraftSession } from '@/lib/actions/cascade-sessions';

interface Props {
  draftId: string;
}

export function DeleteDraftButton({ draftId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteDraftSession(draftId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete draft');
    }
    setLoading(false);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1.5 bg-red-500 text-white text-[10px] rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="px-2 py-1.5 bg-gray-100 text-gray-500 text-[10px] rounded-lg hover:bg-gray-200 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="px-2.5 py-1.5 text-red-400 text-xs hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      Delete
    </button>
  );
}
