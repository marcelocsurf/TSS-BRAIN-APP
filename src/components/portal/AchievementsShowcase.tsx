'use client';

import { useEffect, useState } from 'react';
import { getStudentAchievements, type AchievementsData, type Achievement } from '@/lib/actions/achievements';
import { Trophy } from 'lucide-react';

const BELT_ACCENT: Record<string, string> = {
  white_belt: '#94A3B8', yellow_belt: '#EAB308', blue_belt: '#3B82F6',
  purple_belt: '#9333EA', brown_belt: '#92400E', black_belt: '#334155',
};

// Portal Home: a trophy case that fills up as the student progresses. Belt
// certificate on top, earned badges grid, and a "keep going" progress row.
// Everything is derived — renders nothing until data loads.
export function AchievementsShowcase({ token }: { token: string }) {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getStudentAchievements(token).then(setData).catch(() => {});
  }, [token]);

  if (!data) return null;
  const earned = data.achievements.filter((a) => a.earned);
  const accent = data.belt ? BELT_ACCENT[data.belt.key] ?? '#5AC3E7' : '#5AC3E7';
  const shown = showAll ? earned : earned.slice(0, 8);

  return (
    <div className="space-y-3">
      {/* Belt certificate */}
      {data.belt && (
        <div
          className="rounded-2xl p-4 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, #0A1628 130%)` }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">Current level</p>
          <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-heading)' }}>{data.belt.label}</p>
          <p className="text-[12px] text-white/70 mt-1">
            {data.earnedCount} of {data.totalCount} recognitions earned
          </p>
          <Trophy className="absolute -right-2 -bottom-2 text-white/10" size={92} strokeWidth={1.25} />
        </div>
      )}

      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <Trophy size={12} /> Recognitions ({earned.length})
          </p>
          <div className="grid grid-cols-4 gap-3">
            {shown.map((a) => (
              <div key={a.id} className="flex flex-col items-center text-center gap-1" title={a.description}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gray-50 border border-gray-100">
                  {a.icon}
                </div>
                <span className="text-[10px] leading-tight text-gray-600 line-clamp-2">{a.title}</span>
              </div>
            ))}
          </div>
          {earned.length > 8 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-[11px] font-semibold text-[var(--tss-cyan,#0891b2)]"
            >
              {showAll ? 'Show less' : `Show all ${earned.length}`}
            </button>
          )}
        </div>
      )}

      {/* Keep going — next up with progress */}
      {data.nextUp.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-3">Keep going</p>
          <div className="space-y-3">
            {data.nextUp.map((a) => (
              <NextRow key={a.id} a={a} accent={accent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NextRow({ a, accent }: { a: Achievement; accent: string }) {
  const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gray-50 border border-gray-100 opacity-60 shrink-0">
        {a.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-medium text-[var(--tss-navy)] truncate">{a.title}</span>
          {a.progress && (
            <span className="text-[10px] text-gray-400 shrink-0">{a.progress.current}/{a.progress.target}</span>
          )}
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>
    </div>
  );
}
