'use client';

import { useState, useEffect } from 'react';
import { Waves, ArrowUp, ArrowDown, Target } from 'lucide-react';
import {
  getTidesForDate,
  getMidTideWindows,
  getElSalvadorToday,
  type TideEvent,
  type MidTideWindow,
} from '@/lib/actions/tides';

export function TideWidget({ isAdmin: _isAdmin }: { isAdmin: boolean }) {
  const [date, setDate] = useState<string>('');
  const [tides, setTides] = useState<TideEvent[]>([]);
  const [mids, setMids] = useState<MidTideWindow[]>([]);
  const [loading, setLoading] = useState(false);

  // Default to "today" in El Salvador time.
  useEffect(() => {
    getElSalvadorToday().then(setDate);
  }, []);

  useEffect(() => {
    if (!date) return;
    let active = true;
    setLoading(true);
    Promise.all([getTidesForDate(date), getMidTideWindows(date)]).then(([t, m]) => {
      if (!active) return;
      setTides(t);
      setMids(m);
      setLoading(false);
    });
    return () => { active = false; };
  }, [date]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)] inline-flex items-center gap-1.5">
          <Waves size={15} className="text-[var(--tss-cyan,#5AC3E7)]" />
          Tides · La Libertad
        </h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-200 rounded-lg"
        />
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-xs text-gray-400">Loading…</p>
        ) : tides.length === 0 ? (
          <p className="text-xs text-gray-400">No tide data for this day.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {tides.map((t, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
                    t.event_type === 'high'
                      ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {t.event_type === 'high' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {t.event_time}
                  {t.height_m != null && <span className="opacity-60">· {t.height_m}m</span>}
                </span>
              ))}
            </div>

            {mids.length > 0 && (
              <div className="bg-[var(--tss-cyan,#5AC3E7)]/8 border-l-4 border-[var(--tss-cyan,#5AC3E7)] rounded-r-lg px-3 py-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 inline-flex items-center gap-1">
                  <Target size={11} /> Mid-tide windows
                </p>
                <div className="flex flex-wrap gap-2">
                  {mids.map((w, i) => (
                    <span key={i} className="text-xs font-semibold text-[var(--tss-navy)]">
                      {w.time}
                      <span className="text-[10px] font-normal text-gray-500 ml-0.5">
                        ({w.direction === 'rising' ? '↑' : '↓'})
                      </span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Suggested time for Discover Surfing / whitewater lessons.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
