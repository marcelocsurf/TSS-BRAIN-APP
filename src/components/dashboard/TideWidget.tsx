'use client';

import { useState, useEffect } from 'react';
import { Waves, Target } from 'lucide-react';
import {
  getTidesForDate,
  getMidTideWindows,
  getElSalvadorToday,
  type TideEvent,
  type MidTideWindow,
} from '@/lib/actions/tides';

const NAVY = 'var(--tss-navy, #0a1a2f)';
const CYAN = 'var(--tss-cyan, #5AC3E7)';

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}
function fmt12(t: string) {
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')}${ap}`;
}

// Smooth tide height at minute x by cosine-interpolating between the two
// bracketing extremes (tides move ~sinusoidally between a high and a low).
function heightAt(x: number, pts: { min: number; h: number }[]): number {
  if (pts.length === 0) return 0;
  if (x <= pts[0].min) return pts[0].h;
  if (x >= pts[pts.length - 1].min) return pts[pts.length - 1].h;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (x >= a.min && x <= b.min) {
      const f = (x - a.min) / (b.min - a.min);
      const eased = (1 - Math.cos(f * Math.PI)) / 2; // cosine ease
      return a.h + (b.h - a.h) * eased;
    }
  }
  return pts[pts.length - 1].h;
}

function TideChart({ tides, nowMin }: { tides: TideEvent[]; nowMin: number | null }) {
  const W = 720, H = 180, padT = 34, padB = 26;
  const pts = tides.map((t) => ({ min: toMin(t.event_time), h: t.height_m ?? 0 }));
  const heights = pts.map((p) => p.h);
  const hi = Math.max(...heights, 0.1);
  const lo = Math.min(...heights, 0);
  const span = hi - lo || 1;
  const x = (min: number) => (min / 1440) * W;
  const y = (h: number) => padT + (1 - (h - lo) / span) * (H - padT - padB);

  // Sample the curve every 8 minutes.
  const samples: string[] = [];
  for (let m = 0; m <= 1440; m += 8) {
    samples.push(`${x(m).toFixed(1)},${y(heightAt(m, pts)).toFixed(1)}`);
  }
  const line = `M ${samples.join(' L ')}`;
  const area = `${line} L ${W},${H - padB} L 0,${H - padB} Z`;

  const ticks = [3, 6, 9, 12, 15, 18, 21];
  const tickLabel = (h: number) => (h === 12 ? 'Noon' : h < 12 ? `${h}am` : `${h - 12}pm`);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>
      {/* hour gridlines */}
      {ticks.map((h) => (
        <line key={h} x1={x(h * 60)} y1={padT - 6} x2={x(h * 60)} y2={H - padB}
          stroke="#000" strokeOpacity="0.05" />
      ))}
      {/* area + line */}
      <path d={area} fill={CYAN} fillOpacity="0.12" />
      <path d={line} fill="none" stroke={NAVY} strokeWidth="2" />
      {/* now marker */}
      {nowMin != null && (
        <>
          <line x1={x(nowMin)} y1={padT - 10} x2={x(nowMin)} y2={H - padB}
            stroke={NAVY} strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
          <circle cx={x(nowMin)} cy={y(heightAt(nowMin, pts))} r="4" fill={NAVY} />
          <text x={x(nowMin)} y={padT - 14} textAnchor="middle"
            fontSize="10" fill={NAVY} fillOpacity="0.6" fontFamily="DM Mono, monospace">Now</text>
        </>
      )}
      {/* extreme markers + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <line x1={x(p.min)} y1={y(p.h)} x2={x(p.min)} y2={H - padB} stroke={NAVY} strokeOpacity="0.18" />
          <circle cx={x(p.min)} cy={y(p.h)} r="3" fill={NAVY} />
          <text x={x(p.min)} y={y(p.h) - 14} textAnchor="middle" fontSize="11" fontWeight="600" fill={NAVY}>
            {fmt12(tides[i].event_time)}
          </text>
          <text x={x(p.min)} y={y(p.h) - 2} textAnchor="middle" fontSize="10" fill={NAVY} fillOpacity="0.55">
            {p.h.toFixed(1)}m
          </text>
        </g>
      ))}
      {/* hour axis */}
      {ticks.map((h) => (
        <text key={h} x={x(h * 60)} y={H - 8} textAnchor="middle" fontSize="10"
          fill="#94a3b8" fontFamily="DM Mono, monospace">{tickLabel(h)}</text>
      ))}
    </svg>
  );
}

export function TideWidget({ isAdmin: _isAdmin }: { isAdmin: boolean }) {
  const [date, setDate] = useState<string>('');
  const [today, setToday] = useState<string>('');
  const [tides, setTides] = useState<TideEvent[]>([]);
  const [mids, setMids] = useState<MidTideWindow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getElSalvadorToday().then((d) => { setDate(d); setToday(d); });
  }, []);

  useEffect(() => {
    if (!date) return;
    let active = true;
    setLoading(true);
    Promise.all([getTidesForDate(date), getMidTideWindows(date)]).then(([t, m]) => {
      if (!active) return;
      setTides(t); setMids(m); setLoading(false);
    });
    return () => { active = false; };
  }, [date]);

  // Current minute in El Salvador time (only when viewing today).
  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => {
    if (date !== today || !today) { setNowMin(null); return; }
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/El_Salvador', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    setNowMin(h * 60 + m);
  }, [date, today]);

  const dayLabel = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)] inline-flex items-center gap-1.5">
          <Waves size={15} className="text-[var(--tss-cyan,#5AC3E7)]" />
          Tides · La Libertad
        </h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-200 rounded-lg" />
      </div>

      <div className="p-4">
        {loading ? (
          <p className="text-xs text-gray-400">Loading…</p>
        ) : tides.length === 0 ? (
          <p className="text-xs text-gray-400">No tide data for this day.</p>
        ) : (
          <div className="grid lg:grid-cols-[1fr_240px] gap-4 items-start">
            {/* Chart */}
            <div>
              <p className="text-sm font-semibold text-[var(--tss-navy)] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                {dayLabel}
              </p>
              <TideChart tides={tides} nowMin={nowMin} />
            </div>

            {/* High/low list + mid-tide */}
            <div className="space-y-2">
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-50">
                {tides.map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className={t.event_type === 'high' ? 'text-cyan-600' : 'text-amber-600'}>
                        {t.event_type === 'high' ? '▲' : '▼'}
                      </span>
                      <span className="text-gray-700">{t.event_type === 'high' ? 'High' : 'Low'}</span>
                    </span>
                    <span className="text-gray-500 tabular-nums">{fmt12(t.event_time)}</span>
                    <span className="text-[var(--tss-navy)] font-medium tabular-nums w-12 text-right">
                      {t.height_m != null ? `${t.height_m}m` : '—'}
                    </span>
                  </div>
                ))}
              </div>

              {mids.length > 0 && (
                <div className="rounded-xl bg-[var(--tss-cyan,#5AC3E7)]/10 border-l-4 border-[var(--tss-cyan,#5AC3E7)] px-3 py-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 inline-flex items-center gap-1">
                    <Target size={11} /> Mid-tide (whitewater)
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {mids.map((w, i) => (
                      <span key={i} className="text-xs font-semibold text-[var(--tss-navy)] tabular-nums">
                        {fmt12(w.time)}
                        <span className="text-[10px] font-normal text-gray-400 ml-0.5">
                          {w.direction === 'rising' ? '↑' : '↓'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
