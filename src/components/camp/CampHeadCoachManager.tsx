'use client';

// Lets the coordinator change/assign the head coach on an existing
// camp_instance. Mirrors the UX of CampStudentManager (click to open,
// pick from a list, close).

import { useState, useEffect, useTransition } from 'react';
import { getCoachesForAssignment, type CoachForAssignment } from '@/lib/actions/cascade-sessions';
import { updateCampHeadCoach } from '@/lib/actions/camps';
import { useRouter } from 'next/navigation';
import { coachClearance, type CoachClearance } from '@/lib/constants/coach-clearance';
import type { BeltLevel } from '@/lib/constants/belts';

interface Props {
  campInstanceId: string;
  currentHeadCoachId: string | null;
  currentHeadCoachName: string | null;
  currentStatus?: string | null;
  responseNote?: string | null;
  /** Cinta que exige la plantilla del servicio (null = sin nivel, p. ej. yoga). */
  campBelt?: BeltLevel | null;
  currentHeadCoachMaxBelt?: string | null;
}

export function CampHeadCoachManager({
  campInstanceId,
  currentHeadCoachId,
  currentHeadCoachName,
  currentStatus,
  responseNote,
  campBelt = null,
  currentHeadCoachMaxBelt = null,
}: Props) {
  const currentClearance: CoachClearance = currentHeadCoachId ? coachClearance(currentHeadCoachMaxBelt, campBelt) : { ok: true };
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
          className="text-[10px] uppercase tracking-wider text-[#55666E]"
          style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
        >
          Head Coach
        </span>
        <span className="text-sm font-medium text-[var(--tss-navy)]">
          {currentHeadCoachName || 'Not assigned'}
        </span>
        {currentHeadCoachId && currentStatus && (
          <StatusChip status={currentStatus} />
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[11px] px-2.5 py-1 bg-[var(--tss-navy)] text-white rounded-md hover:opacity-90 transition-opacity"
      >
        {open ? 'Close' : currentHeadCoachId ? 'Change' : 'Assign'}
      </button>

      {open && (
        <div className="w-full mt-2 bg-[#F7F9FA] rounded-lg border border-[#DCD7C6] p-3 space-y-1.5 max-h-72 overflow-y-auto">
          <p
            className="text-[10px] uppercase tracking-wider text-[#55666E] mb-1"
            style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
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
            <p className="text-xs text-[#55666E] italic py-2">Loading…</p>
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
                    : 'hover:bg-[#F7F9FA]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#10263B] truncate">
                    {c.display_name}
                  </p>
                  <p
                    className="text-[10px] text-[#55666E] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
                  >
                    {c.role}
                    {c.max_belt_permission ? ` · up to ${c.max_belt_permission.replace(/_/g, ' ')}` : ''}
                  </p>
                  {(() => { const cl = coachClearance(c.max_belt_permission, campBelt); return cl.ok ? null : (
                    <p className="text-[10px] text-amber-700 font-semibold">Not cleared for {cl.campLevel}</p>
                  ); })()}
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

      {!currentClearance.ok && (
        <p className="w-full text-[11px] text-amber-800 mt-1 rounded-[5px] px-2.5 py-2" style={{ background: '#FFF8E7', border: '1px solid #F1E3B8' }}>
          ⚠ {currentClearance.note}
        </p>
      )}

      {currentStatus === 'rejected' && responseNote && (
        <p className="w-full text-[11px] text-rose-600 mt-1">
          Declined: {responseNote}
        </p>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending confirmation', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    accepted: { label: 'Accepted ✓', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Declined', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  const s = map[status];
  if (!s) return null;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}
