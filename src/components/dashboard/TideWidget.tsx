'use client';

import { useState, useEffect, useTransition } from 'react';
import { Waves, ArrowUp, ArrowDown, Target, Upload } from 'lucide-react';
import {
  getTidesForDate,
  getMidTideWindows,
  importTides,
  getTideDataRange,
  type TideEvent,
  type MidTideWindow,
} from '@/lib/actions/tides';

function todayStr() {
  // Local date in YYYY-MM-DD without timezone surprises.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TideWidget({ isAdmin }: { isAdmin: boolean }) {
  const [date, setDate] = useState(todayStr());
  const [tides, setTides] = useState<TideEvent[]>([]);
  const [mids, setMids] = useState<MidTideWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<{ min: string | null; max: string | null; count: number } | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    getTideDataRange().then(setRange);
  }, []);

  const hasData = range && range.count > 0;

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

      {!hasData ? (
        <div className="p-4 text-center space-y-2">
          <p className="text-xs text-gray-500">No tide data loaded yet.</p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowImport((s) => !s)}
              className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg"
            >
              <Upload size={13} /> Import tide table
            </button>
          )}
        </div>
      ) : (
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
                    <Target size={11} /> Mid-tide windows (whitewater)
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

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowImport((s) => !s)}
              className="text-[10px] text-gray-400 hover:text-[var(--tss-navy)]"
            >
              {range?.min && range?.max ? `Data: ${range.min} → ${range.max} (${range.count} events) · ` : ''}
              Import / update table
            </button>
          )}
        </div>
      )}

      {showImport && isAdmin && <ImportPanel onDone={() => { setShowImport(false); getTideDataRange().then(setRange); setDate((d) => d); }} />}
    </div>
  );
}

function ImportPanel({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState('');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const run = () => {
    setResult(null);
    startTransition(async () => {
      try {
        const r = await importTides(text);
        setResult(`Imported ${r.imported}${r.skipped ? `, skipped ${r.skipped}` : ''}${r.errors.length ? ` · ${r.errors.length} errors` : ''}.`);
        if (r.imported > 0) setTimeout(onDone, 1200);
      } catch (e: any) {
        setResult(e?.message || 'Import failed.');
      }
    });
  };

  return (
    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-2">
      <p className="text-[11px] text-gray-600 leading-relaxed">
        Paste one tide per line: <code className="bg-white px-1 rounded">YYYY-MM-DD, HH:MM, high|low, height_m</code>
        <br />Example: <code className="bg-white px-1 rounded">2026-06-15, 03:24, high, 1.8</code>
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={"2026-06-15, 03:24, high, 1.8\n2026-06-15, 09:41, low, 0.3\n2026-06-15, 15:52, high, 1.7\n2026-06-15, 22:10, low, 0.4"}
        className="w-full text-xs font-mono px-2 py-2 border border-gray-300 rounded-lg"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={pending || !text.trim()}
          className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg disabled:opacity-50"
        >
          {pending ? 'Importing…' : 'Import'}
        </button>
        {result && <span className="text-[11px] text-gray-600">{result}</span>}
      </div>
    </div>
  );
}
