'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  coachId: string;
  currentAccess: boolean;
}

export function ToggleCourseAccess({ coachId, currentAccess }: Props) {
  const [granted, setGranted] = useState(currentAccess);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const res = await fetch(`/api/coaches/${coachId}/course-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant: !granted }),
    });
    if (res.ok) {
      setGranted(!granted);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-700">Coach Portal Access</span>
        <span className="text-[10px] text-gray-400">
          {granted ? 'Coach can access their courses & tools' : 'No portal course access yet'}
        </span>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
          granted ? 'bg-emerald-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            granted ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-xs font-medium ${granted ? 'text-emerald-600' : 'text-gray-400'}`}>
        {loading ? '…' : granted ? 'Granted' : 'Blocked'}
      </span>
    </div>
  );
}
