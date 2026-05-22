'use client';

// Lets the coordinator set / edit start + end time on an existing
// camp_instance. Stored as scheduled_time TEXT in "HH:MM - HH:MM" or
// "HH:MM" form so coach/student portals (which already read this
// field) keep rendering it without changes.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { updateCampSchedule } from '@/lib/actions/camps';

interface Props {
  campInstanceId: string;
  currentScheduledTime: string | null;
}

// "08:00 - 09:30" → { start: "08:00", end: "09:30" }
// "08:00"         → { start: "08:00", end: "" }
// null            → { start: "", end: "" }
function parse(t: string | null): { start: string; end: string } {
  if (!t) return { start: '', end: '' };
  const match = t.match(/^(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?$/);
  if (!match) return { start: t, end: '' };
  return { start: match[1], end: match[2] ?? '' };
}

export function CampScheduleManager({
  campInstanceId,
  currentScheduledTime,
}: Props) {
  const router = useRouter();
  const initial = parse(currentScheduledTime);
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const next = start ? (end ? `${start} - ${end}` : start) : null;
    startTransition(async () => {
      try {
        await updateCampSchedule(campInstanceId, next);
        setOpen(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const clear = () => {
    startTransition(async () => {
      try {
        await updateCampSchedule(campInstanceId, null);
        setStart('');
        setEnd('');
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
          className="text-[10px] uppercase tracking-wider text-gray-400 inline-flex items-center gap-1"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          <Clock size={11} strokeWidth={2} />
          Schedule
        </span>
        <span className="text-sm font-medium text-[var(--tss-navy)]">
          {currentScheduledTime || 'No time set'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[11px] px-2.5 py-1 bg-[var(--tss-navy)] text-white rounded-md hover:opacity-90 transition-opacity"
      >
        {open ? 'Close' : currentScheduledTime ? 'Change' : 'Set time'}
      </button>

      {open && (
        <div className="w-full mt-2 bg-white rounded-xl border border-gray-100 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <label
              className="text-[10px] uppercase tracking-wider text-gray-500"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Start
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
            <span className="text-xs text-gray-400">to</span>
            <label className="sr-only">End</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending || !start}
              className="flex-1 px-3 py-1.5 bg-[var(--tss-navy)] text-white text-xs rounded-md disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
            {currentScheduledTime && (
              <button
                type="button"
                onClick={clear}
                disabled={pending}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 italic">
            For multi-day camps this is the daily meeting time. For lessons,
            it&apos;s the full lesson slot.
          </p>
        </div>
      )}
    </div>
  );
}
