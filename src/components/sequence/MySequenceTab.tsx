'use client';

import { useState, useEffect } from 'react';
import { getMySequence, type SequenceData, type SequenceItem } from '@/lib/actions/sequence';
import { StarRating } from './StarRating';
import { StepDetailView } from './StepDetailView';
import { Dumbbell, Waves, Target } from 'lucide-react';

interface Props {
  studentId: string;
  belt?: string;
  onPracticeDrill?: (drillMissionId: string) => void;
}

export function MySequenceTab({ studentId, belt = 'white', onPracticeDrill }: Props) {
  const [data, setData] = useState<SequenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openStepId, setOpenStepId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMySequence(studentId, belt).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [studentId, belt]);

  const refresh = async () => {
    const res = await getMySequence(studentId, belt);
    setData(res);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Target size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan)]" />
        <p className="text-gray-500 text-sm">Loading your sequence...</p>
      </div>
    );
  }

  if (!data) return null;

  // If a step is open, show detail
  if (openStepId) {
    return (
      <StepDetailView
        stepId={openStepId}
        studentId={studentId}
        onBack={() => {
          setOpenStepId(null);
          refresh();
        }}
        onRatingChange={refresh}
        onPracticeDrill={onPracticeDrill}
      />
    );
  }

  const overallPct = data.overallRating !== null
    ? Math.round((data.overallRating / 5) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[var(--tss-navy-dark,#0a1628)] text-white rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold">
            <Target size={18} strokeWidth={1.75} />
            My Sequence
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 capitalize">
            {data.belt} Belt
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-white/70">Overall execution</span>
            {data.overallRating !== null ? (
              <span className="text-lg font-bold">
                {data.overallRating.toFixed(1)}<span className="text-xs opacity-70">/5</span>
              </span>
            ) : (
              <span className="text-xs text-white/60">Not rated yet</span>
            )}
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-[11px] text-white/60 mt-2">
            {data.ratedSteps} of {data.totalSteps} steps self-rated
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <strong>How to use:</strong> Tap a step to see its drill or mission. Self-rate your execution honestly (1-5). Practice the drill in Train tab. Your rating updates as you progress.
      </div>

      {/* Blocks */}
      {data.blocks.map((block) => (
        <BlockSection
          key={block.block_number}
          blockNumber={block.block_number}
          blockName={block.block_name}
          items={block.items}
          onOpenStep={(id) => setOpenStepId(id)}
        />
      ))}
    </div>
  );
}

function BlockSection({
  blockNumber,
  blockName,
  items,
  onOpenStep,
}: {
  blockNumber: number;
  blockName: string;
  items: SequenceItem[];
  onOpenStep: (id: string) => void;
}) {
  const ratedCount = items.filter((i) => i.rating !== null).length;
  const avgRating = ratedCount > 0
    ? items.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedCount
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
            Block {blockNumber}
          </div>
          <div className="font-bold text-sm">{blockName}</div>
        </div>
        <div className="text-right text-xs">
          {avgRating !== null ? (
            <>
              <div className="font-bold text-[var(--tss-navy)]">{avgRating.toFixed(1)}/5</div>
              <div className="text-[10px] text-gray-400">{ratedCount}/{items.length} rated</div>
            </>
          ) : (
            <div className="text-gray-400 text-[10px]">Not rated</div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <StepRow key={item.step_id} item={item} onOpen={() => onOpenStep(item.step_id)} />
        ))}
      </div>
    </div>
  );
}

function StepRow({ item, onOpen }: { item: SequenceItem; onOpen: () => void }) {
  const hasDrill = !!item.drill;
  const hasMission = !!item.mission;
  const hasSubtitle = hasDrill || hasMission;

  return (
    <button
      onClick={onOpen}
      className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400">{item.step_id}</span>
          </div>
          <div className="font-medium text-sm mt-0.5 truncate">
            {item.step_title}
          </div>
          {hasSubtitle && (
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
              {hasDrill && (
                <span className="inline-flex items-center gap-1">
                  <Dumbbell size={12} strokeWidth={1.75} />
                  Drill
                </span>
              )}
              {hasMission && (
                <span className="inline-flex items-center gap-1">
                  <Waves size={12} strokeWidth={1.75} />
                  Mission
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
          {item.coach_rating != null ? (
            // M4: Coach official rating overrides self-rating visually (gold)
            <>
              <StarRating value={item.coach_rating} size="sm" readOnly variant="official" />
              <div className="text-[9px] text-[var(--tss-cyan,#5AC3E7)] font-bold uppercase tracking-wider">
                Official {item.coach_rating}/5
              </div>
              {item.rating !== null && item.rating !== item.coach_rating && (
                <div className="text-[9px] text-gray-400">self: {item.rating}/5</div>
              )}
            </>
          ) : (
            <>
              <StarRating value={item.rating} size="sm" readOnly />
              {item.rating !== null && (
                <div className="text-[10px] text-gray-400">{item.rating}/5</div>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}
