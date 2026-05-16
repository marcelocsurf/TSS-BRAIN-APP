'use client';

import { useState } from 'react';
import { archiveCascadeSession } from '@/lib/actions/cascade-sessions';
import { useRouter } from 'next/navigation';

interface Props {
  sessionId: string;
  sessionState: string; // 'in_progress' | 'planned' | 'draft'
}

export function ArchiveSessionButton({ sessionId, sessionState }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const label = sessionState === 'in_progress' ? 'in progress' : sessionState;

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-red-600">Cancel this session?</span>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              await archiveCascadeSession(sessionId);
              router.refresh();
            } catch (e: any) {
              alert(e.message);
              setLoading(false);
              setConfirming(false);
            }
          }}
          disabled={loading}
          className="text-[10px] px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Cancelling…' : 'Yes, cancel'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[10px] px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50"
        >
          Keep
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Cancel ${label} session`}
      className="text-[10px] px-2 py-1 border border-red-200 text-red-400 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      ✕ Cancel
    </button>
  );
}
