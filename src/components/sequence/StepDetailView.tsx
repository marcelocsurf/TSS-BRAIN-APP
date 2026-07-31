'use client';

import { useState, useEffect } from 'react';
import { getStepDetail, updateStepRating } from '@/lib/actions/sequence';
import { StarRating } from './StarRating';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { Dumbbell, Waves, Target, BookOpen, Check, PenLine } from 'lucide-react';

// Brand Manual v10
const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };

interface Props {
  stepId: string;
  studentId: string;
  onBack: () => void;
  onRatingChange?: () => void;
  onPracticeDrill?: (drillMissionId: string) => void;
}

export function StepDetailView({ stepId, studentId, onBack, onRatingChange, onPracticeDrill }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingRating, setSavingRating] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStepDetail(studentId, stepId).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [stepId, studentId]);

  const handleRate = async (rating: number) => {
    setSavingRating(true);
    await updateStepRating(studentId, stepId, rating);
    // Re-fetch
    const fresh = await getStepDetail(studentId, stepId);
    setData(fresh);
    setSavingRating(false);
    onRatingChange?.();
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Target size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan)]" />
        <p className="text-gray-500 text-sm">Loading step...</p>
      </div>
    );
  }

  if (!data || !data.lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Step not found</p>
        <button onClick={onBack} className="mt-4 text-sm underline">← Back</button>
      </div>
    );
  }

  const { lesson, drill, mission, rating, ratingCount, lastRated, sessionHistory } = data;

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-3"
        >
          ← Back to My Sequence
        </button>

        <div className="text-white rounded-2xl p-5" style={{ background: INK, borderLeft: `4px solid ${CYAN}` }}>
          <div className="text-[9px]" style={{ ...F_M, color: CYAN }}>{stepId}</div>
          <h1 className="text-[20px] mt-1.5" style={F_D}>{lesson.title}</h1>
          {lesson.subtitle && (
            <p className="text-sm mt-1.5" style={{ color: 'rgba(247,249,250,.7)' }}>{lesson.subtitle}</p>
          )}
          {lesson.pillar && (
            <p className="text-[9px] mt-2.5" style={{ ...F_M, color: GOLD }}>Pillar · {lesson.pillar}</p>
          )}
        </div>
      </div>

      {/* Self-rating */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-1.5 text-[9px] mb-2" style={{ ...F_M, color: '#0090B0' }}>
          <Target size={12} strokeWidth={1.75} />
          Your self-evaluation
        </div>
        <h3 className="text-[15px] mb-3" style={{ ...F_D, color: INK }}>
          How well do you execute this step?
        </h3>

        <StarRating
          value={rating}
          onChange={handleRate}
          size="lg"
          showLabel
          readOnly={savingRating}
        />

        {lastRated && (
          <div className="text-[11px] text-gray-400 mt-3">
            Updated {ratingCount} {ratingCount === 1 ? 'time' : 'times'} · Last: {new Date(lastRated).toLocaleDateString()}
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl text-[11px] leading-snug" style={{ background: 'rgba(255,209,102,.16)', color: '#7a5c00' }}>
          <strong>Be honest.</strong> Your rating reflects your real execution today. As you practice and improve, update it. Your coach validates in person.
        </div>
      </div>

      {/* Pedagogy doctrine note (when both drill + mission available) */}
      {drill && mission && (
        <div className="rounded-2xl p-3.5 text-[11.5px] leading-relaxed" style={{ background: 'rgba(0,210,255,.07)', border: '1px solid rgba(0,210,255,.3)', color: INK }}>
          <strong>Drill</strong> = how the skill is trained (on land or calm water).
          <br />
          <strong>Mission</strong> = how the learning is applied (in real water conditions).
          <br />
          Choose the practice that fits today&apos;s session.
        </div>
      )}

      {/* DRILL card */}
      {drill && (
        <DrillOrMissionCard
          item={drill}
          onPractice={onPracticeDrill}
        />
      )}

      {/* MISSION card */}
      {mission && (
        <DrillOrMissionCard
          item={mission}
          onPractice={onPracticeDrill}
        />
      )}

      {/* Session history */}
      {sessionHistory && sessionHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-1.5 text-[9px] mb-2" style={{ ...F_M, color: '#0090B0' }}>
            <Waves size={12} strokeWidth={1.75} />
            Recent practice sessions
          </div>
          <div className="space-y-2">
            {sessionHistory.map((s: any) => (
              <div key={s.id} className="pl-3 py-1" style={{ borderLeft: `3px solid ${CYAN}66` }}>
                <div className="text-xs text-gray-500">
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  {s.duration_minutes ? `${s.duration_minutes} min` : 'Duration not set'}
                  {s.execution_rating && ` · Rated ${s.execution_rating}/5`}
                  {s.mission_completion && ` · ${s.mission_completion}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theory link */}
      <div className="rounded-2xl p-4 text-center" style={{ background: INK }}>
        <div className="inline-flex items-center gap-1.5 text-[10px]" style={{ ...F_M, color: CYAN }}>
          <BookOpen size={12} strokeWidth={1.75} />
          Review the theory
        </div>
        <div className="text-[11px] mt-1" style={{ color: 'rgba(247,249,250,.65)' }}>
          Course tab → {stepId} in your belt section
        </div>
      </div>
    </div>
  );
}

// ─── DrillOrMissionCard — renders a single drill OR mission with Practice button ───

function DrillOrMissionCard({
  item,
  onPractice,
}: {
  item: any;
  onPractice?: (drillMissionId: string) => void;
}) {
  const isDrill = item.type === 'drill';
  const TypeIcon = isDrill ? Dumbbell : Waves;
  const typeLabel = isDrill ? 'Drill — training mechanic' : 'Mission — water application';
  const accentHex = isDrill ? GOLD : CYAN;
  const accentText = isDrill ? '#7a5c00' : '#0090B0';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: `2px solid ${accentHex}55` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[9px]" style={{ ...F_M, color: accentText }}>
            <TypeIcon size={12} strokeWidth={1.75} />
            {isDrill ? 'Drill' : 'Mission'}
          </div>
          <h3 className="text-[16px] mt-1" style={{ ...F_D, color: INK }}>{item.title}</h3>
          <div className="text-xs text-gray-500 mt-1">{typeLabel}</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl p-2.5 text-center" style={{ background: PAPER }}>
          <div className="text-[8px] text-gray-400" style={F_M}>Time</div>
          <div className="text-sm font-bold mt-0.5" style={{ color: INK }}>{item.time_estimate || '—'}</div>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: PAPER }}>
          <div className="text-[8px] text-gray-400" style={F_M}>Reps</div>
          <div className="text-sm font-bold mt-0.5" style={{ color: INK }}>{item.reps_recommended || '—'}</div>
        </div>
      </div>

      {/* 5 Key Words — only on drill (canonical chain) */}
      {isDrill && item.key_words && item.key_words.length > 0 && (
        <div className="mb-4">
          <div className="text-[9px] text-gray-400 mb-2" style={F_M}>
            5 key words · canonical chain
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.key_words.map((kw: string, i: number) => (
              <span
                key={i}
                className="px-2.5 py-1 text-[11px] font-bold rounded-full" style={{ background: INK, color: CYAN }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description / Procedure */}
      {item.description_md && (
        <div className="mt-4">
          <div className="text-[9px] text-gray-400 mb-2" style={F_M}>
            {isDrill ? 'Procedure' : 'What to do in the water'}
          </div>
          <div className="prose prose-sm max-w-none">
            <MarkdownContent markdown={item.description_md} />
          </div>
        </div>
      )}

      {/* Success criteria */}
      {item.success_criteria && item.success_criteria.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl" style={{ background: 'rgba(6,214,160,.08)', border: '1px solid rgba(6,214,160,.35)' }}>
          <div className="flex items-center gap-1.5 text-[9px] mb-2" style={{ ...F_M, color: '#0a7c5d' }}>
            <Check size={12} strokeWidth={2} />
            Success criteria
          </div>
          <ul className="space-y-1">
            {item.success_criteria.map((sc: string, i: number) => (
              <li key={i} className="text-xs flex gap-2" style={{ color: '#085041' }}>
                <span className="font-bold">{i + 1}.</span>
                <span>{sc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practice button */}
      <button
        onClick={() => onPractice?.(item.id)}
        disabled={!onPractice}
        className="mt-5 w-full rounded-full py-3.5 text-[11px] transition-all active:scale-[0.98] disabled:opacity-40"
        style={{ ...F_M, background: onPractice ? accentHex : '#e5e7eb', color: INK, fontWeight: 700 }}
      >
        <span className="inline-flex items-center gap-1.5">
          <PenLine size={14} strokeWidth={1.75} />
          Practice this {isDrill ? 'drill' : 'mission'} →
        </span>
      </button>
    </div>
  );
}
