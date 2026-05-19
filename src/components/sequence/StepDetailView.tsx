'use client';

import { useState, useEffect } from 'react';
import { getStepDetail, updateStepRating } from '@/lib/actions/sequence';
import { StarRating } from './StarRating';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { Dumbbell, Waves, Target, BookOpen, Check, PenLine } from 'lucide-react';

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

        <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[var(--tss-navy-dark,#0a1628)] text-white rounded-xl p-5">
          <div className="text-xs text-white/60 mb-1">{stepId}</div>
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          {lesson.subtitle && (
            <p className="text-sm text-white/80 mt-1 italic">{lesson.subtitle}</p>
          )}
          {lesson.pillar && (
            <p className="text-xs text-amber-300 mt-2">Pillar: {lesson.pillar}</p>
          )}
        </div>
      </div>

      {/* Self-rating */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
          <Target size={13} strokeWidth={1.75} />
          Your Self-Evaluation
        </div>
        <h3 className="font-bold text-sm mb-3">
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

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
          <strong>Be honest.</strong> Your rating reflects your real execution today. As you practice and improve, update it. Your coach will review and validate during in-person sessions.
        </div>
      </div>

      {/* Pedagogy doctrine note (when both drill + mission available) */}
      {drill && mission && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900">
          <strong>Drill</strong> = how the skill is trained (on land or calm water).
          <br />
          <strong>Mission</strong> = how the learning is applied (in real water conditions).
          <br />
          Choose the practice that fits today's session.
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
            <Waves size={13} strokeWidth={1.75} />
            Recent Practice Sessions
          </div>
          <div className="space-y-2">
            {sessionHistory.map((s: any) => (
              <div key={s.id} className="border-l-4 border-blue-200 pl-3 py-1">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-700">
          <BookOpen size={13} strokeWidth={1.75} />
          Want to review the theory of this step?
        </div>
        <div className="text-[11px] text-blue-600 mt-1">
          Go to <strong>Course tab</strong> → find {stepId} in White Belt section
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
  const accent = isDrill ? 'amber' : 'blue';

  return (
    <div
      className="bg-white rounded-xl shadow-sm border-2 p-5"
      style={{
        borderColor: isDrill ? '#fde68a' : '#bfdbfe', // amber-200 / blue-200
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${
              isDrill ? 'text-amber-700' : 'text-blue-700'
            }`}
          >
            <TypeIcon size={13} strokeWidth={1.75} />
            {isDrill ? 'DRILL' : 'MISSION'}
          </div>
          <h3 className="font-bold text-base mt-0.5">{item.title}</h3>
          <div className="text-xs text-gray-500 mt-0.5">{typeLabel}</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-[10px] uppercase text-gray-500">Time</div>
          <div className="text-sm font-bold">{item.time_estimate || '—'}</div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-[10px] uppercase text-gray-500">Reps</div>
          <div className="text-sm font-bold">{item.reps_recommended || '—'}</div>
        </div>
      </div>

      {/* 5 Key Words — only on drill (canonical chain) */}
      {isDrill && item.key_words && item.key_words.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
            5 Key Words (canonical chain)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.key_words.map((kw: string, i: number) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-[var(--tss-navy)] text-white text-[11px] font-bold rounded-full"
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
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
            {isDrill ? 'Procedure' : 'What to do in the water'}
          </div>
          <div className="prose prose-sm max-w-none">
            <MarkdownContent markdown={item.description_md} />
          </div>
        </div>
      )}

      {/* Success criteria */}
      {item.success_criteria && item.success_criteria.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-green-700 font-bold mb-2">
            <Check size={13} strokeWidth={2} />
            Success Criteria
          </div>
          <ul className="space-y-1">
            {item.success_criteria.map((sc: string, i: number) => (
              <li key={i} className="text-xs text-green-800 flex gap-2">
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
        className={`mt-5 w-full rounded-lg py-3 text-sm font-bold transition-colors ${
          onPractice
            ? isDrill
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <PenLine size={15} strokeWidth={1.75} />
          Practice this {isDrill ? 'drill' : 'mission'} →
        </span>
      </button>
    </div>
  );
}
