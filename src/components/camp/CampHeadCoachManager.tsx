'use client';

// Lets the coordinator change/assign the head coach on an existing
// camp_instance. Mirrors the UX of CampStudentManager (click to open,
// pick from a list, close).

import { useState, useEffect, useTransition } from 'react';
import { getCoachesForAssignment, type CoachForAssignment } from '@/lib/actions/cascade-sessions';
import { updateCampHeadCoach } from '@/lib/actions/camps';
import { useRouter } from 'next/navigation';

interface Props {
  campInstanceId: string;
  currentHeadCoachId: string | null;
  currentHeadCoachName: string | null;
}

export function CampHeadCoachManager({
  campInstanceId,
  currentHeadCoachId,
  currentHeadCoachName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coaches, setCoaches] = useState<CoachForAssignment[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open && coaches.length === 0) {
      getCoachesForAssignment().then(setCoaches).catch(() => {});
    }
  }, [open, coaches.length]);

  const handlePick = (coachId: string | null) => {
    startTransition(async () => {
      try {
        await updateCampHeadCoach(campInstanceId, coachId);
        setOpen(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="mt-3 flex items-start gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] uppercase tracking-wider text-gray-400"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Head Coach
        </span>
        <span className="text-sm font-medium text-[var(--tss-navy)]">
          {currentHeadCoachName || 'Not assigned'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[11px] px-2.5 py-1 bg-[var(--tss-navy)] text-white rounded-md hover:opacity-90 transition-opacity"
      >
        {open ? 'Close' : currentHeadCoachId ? 'Change' : 'Assign'}
      </button>

      {open && (
        <div className="w-full mt-2 bg-white rounded-xl border border-gray-100 p-3 space-y-1.5 max-h-72 overflow-y-auto">
          <p
            className="text-[10px] uppercase tracking-wider text-gray-400 mb-1"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Pick a coach
          </p>
          {currentHeadCoachId && (
            <button
              type="button"
              onClick={() => handlePick(null)}
              disabled={pending}
              className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
            >
              Unassign current head coach
            </button>
          )}
          {coaches.length === 0 && (
            <p className="text-xs text-gray-400 italic py-2">Loading…</p>
          )}
          {coaches.map((c) => {
            const isCurrent = c.id === currentHeadCoachId;
            return (
              <button
                key={c.id}
                type="button"
                disabled={isCurrent || pending}
                onClick={() => handlePick(c.id)}
                className={`w-full text-left flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-emerald-50 cursor-default'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {c.display_name}
                  </p>
                  <p
                    className="text-[10px] text-gray-400 uppercase tracking-wider"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {c.role}
                    {c.max_belt_permission ? ` · up to ${c.max_belt_permission.replace(/_/g, ' ')}` : ''}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-semibold text-emerald-700">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
