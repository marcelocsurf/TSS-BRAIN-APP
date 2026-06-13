'use client';

import { useEffect, useState } from 'react';
import { Waves, Target } from 'lucide-react';
import { getTidesForDate, getMidTideWindows, type TideEvent, type MidTideWindow } from '@/lib/actions/tides';

function fmt12(t: string) {
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')}${ap}`;
}

// Compact tide reference shown while planning a service, so the coordinator
// can pick a time that lines up with the right tide. Reacts to the date.
export function TidePlannerHint({
  date,
  onPickTime,
}: {
  date: string;
  onPickTime?: (hhmm: string) => void;
}) {
  const [tides, setTides] = useState<TideEvent[]>([]);
  const [mids, setMids] = useState<MidTideWindow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!date) { setTides([]); setMids([]); setLoaded(false); return; }
    let active = true;
    Promise.all([getTidesForDate(date), getMidTideWindows(date)]).then(([t, m]) => {
      if (!active) return;
      setTides(t); setMids(m); setLoaded(true);
    });
    return () => { active = false; };
  }, [date]);

  if (!date || !loaded) return null;
  if (tides.length === 0) {
    return (
      <p className="text-[11px] text-gray-400 italic">No tide data for this date.</p>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-3 space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 inline-flex items-center gap-1">
        <Waves size={12} className="text-[var(--tss-cyan,#5AC3E7)]" /> Tides · La Libertad
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tides.map((t, i) => (
          <span key={i}
            className={`text-[11px] px-2 py-0.5 rounded-md border tabular-nums ${
              t.event_type === 'high'
                ? 'bg-white border-cyan-200 text-cyan-800'
                : 'bg-white border-amber-200 text-amber-800'
            }`}>
            {t.event_type === 'high' ? '▲' : '▼'} {fmt12(t.event_time)}
            {t.height_m != null && <span className="opacity-50"> · {t.height_m}m</span>}
          </span>
        ))}
      </div>
      {mids.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 inline-flex items-center gap-1">
            <Target size={11} /> Mid-tide:
          </span>
          {mids.map((w, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPickTime?.(w.time)}
              title="Use this time for the service"
              className="text-[11px] font-semibold text-[var(--tss-navy)] tabular-nums px-2 py-0.5 rounded-md border border-cyan-200 bg-white hover:bg-cyan-100 transition-colors"
            >
              {fmt12(w.time)} {w.direction === 'rising' ? '↑' : '↓'}
            </button>
          ))}
        </div>
      )}
      <p className="text-[10px] text-gray-400">
        Tap a mid-tide time to set it as the service time (ideal for whitewater / Discover Surfing).
      </p>
    </div>
  );
}
