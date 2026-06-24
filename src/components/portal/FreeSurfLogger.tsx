'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants/brand';
import { logFreeSurf } from '@/lib/actions/portal';
import { Waves, Clock, ThumbsUp } from 'lucide-react';

// Free Surf quick-logger — for days the student surfed without a mission.
// All logged time counts toward "Free Surfing" in the bitácora.

const MINUTE_CHIPS = [30, 60, 120, 240, 480];

export function FreeSurfLogger({ token }: { token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(60);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-2xl text-white text-sm font-semibold shadow-sm inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
        style={{ background: BRAND.colors.navy }}
      >
        <Waves size={16} strokeWidth={1.75} />
        Registrar Free Surf
      </button>
    );
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
        <ThumbsUp size={24} strokeWidth={1.75} className="mx-auto mb-1 text-[var(--tss-cyan)]" />
        <p className="text-sm font-semibold text-[var(--tss-navy)]">Free surf logged!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tss-navy)]">
          <Waves size={15} strokeWidth={1.75} />
          Log Free Surf
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-[var(--tss-navy)]"
        >
          Cancel
        </button>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          <Clock size={13} strokeWidth={1.75} />
          Time in the water
        </label>
        <div className="grid grid-cols-5 gap-2">
          {MINUTE_CHIPS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={`py-2 rounded-lg text-xs font-medium border ${
                minutes === m ? 'border-transparent text-white' : 'border-gray-200 text-gray-600'
              }`}
              style={minutes === m ? { background: BRAND.colors.navy } : {}}
            >
              {m >= 60 ? `${m / 60}h` : `${m}m`}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={minutes}
          onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          placeholder="Minutes"
        />
        <p className="mt-1 text-[10px] text-gray-400">Type any amount in minutes — e.g. 480 for an 8-hour day.</p>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Conditions, who you surfed with, how it felt…"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError('');
          startTransition(async () => {
            try {
              await logFreeSurf(token, minutes, date || undefined, notes || undefined);
              setDone(true);
              router.refresh();
            } catch (e: any) {
              setError(e.message || 'Failed to save');
            }
          });
        }}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
        style={{ background: BRAND.colors.navy }}
      >
        {pending ? 'Saving…' : `Log ${minutes}m Free Surf`}
      </button>
    </div>
  );
}
