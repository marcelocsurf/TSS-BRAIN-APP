'use client';

import { useState, useEffect } from 'react';
import { getMySequence, type SequenceData, type SequenceItem } from '@/lib/actions/sequence';
import { StarRating } from './StarRating';
import { StepDetailView } from './StepDetailView';
import { Dumbbell, Waves, Target } from 'lucide-react';
import { BELT_THEMES, beltLevelFromString, type BeltTheme } from '@/lib/constants/belt-theme';
import { ConcentricRings } from '@/components/shared/ConcentricRings';

// Brand Manual v10
const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05 };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' };

interface Props {
  studentId: string;
  belt?: string;
  onPracticeDrill?: (drillMissionId: string) => void;
  initialStepId?: string | null;
}

export function MySequenceTab({ studentId, belt = 'white', onPracticeDrill, initialStepId }: Props) {
  const [data, setData] = useState<SequenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openStepId, setOpenStepId] = useState<string | null>(initialStepId || null);

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

  const theme = BELT_THEMES[beltLevelFromString(data.belt)];

  return (
    <div className="space-y-5">
      {/* Header — belt-colored rings + accent line, matching the course view */}
      <div className="text-white rounded-2xl p-5 shadow-lg border-l-4" style={{ background: INK, borderColor: theme.accent }}>
        {/* The Surf Sequence logo — prominent on the sequence screen */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tss-logo-white.png?v=2"
          alt="The Surf Sequence"
          className="h-9 mb-3 object-contain"
        />
        <div className="flex items-center justify-between mb-2">
          <h2 className="inline-flex items-center gap-2.5 text-[20px]" style={F_D}>
            <ConcentricRings color={theme.bright} size={22} />
            My Sequence
          </h2>
          <span className="text-[9px] px-2.5 py-1 rounded-full" style={{ ...F_M, background: theme.tint, color: theme.ink }}>
            {data.belt} Belt
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[9px]" style={{ ...F_M, color: 'rgba(247,249,250,.6)' }}>Overall execution</span>
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
              className="h-full transition-all duration-500"
              style={{ width: `${overallPct}%`, background: theme.bright }}
            />
          </div>
          <p className="text-[11px] text-white/60 mt-2">
            {/* La validación OFICIAL del coach manda; el auto-rating complementa. */}
            {data.coachRatedSteps > 0 ? (
              <>
                <span style={{ color: '#00D2FF' }}>★ {data.coachRatedSteps} of {data.totalSteps} validated by your coach</span>
                {data.selfRatedSteps > 0 && <> · {data.selfRatedSteps} self-rated</>}
              </>
            ) : (
              <>{data.ratedSteps} of {data.totalSteps} steps self-rated</>
            )}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl p-3.5" style={{ background: '#0A2438', border: '1px solid rgba(0,210,255,.35)' }}>
        <p className="text-[9px] mb-1" style={{ ...F_M, color: CYAN }}>How it works</p>
        <p className="text-[12px] leading-snug" style={{ color: 'rgba(247,249,250,.85)' }}>
          Tap a step → practice its drill or mission → rate yourself honestly. Your coach validates in the water.
        </p>
      </div>

      {/* Blocks — en tablet (md:) van en 2 columnas: la secuencia completa
          (25-48 pasos) entra de un vistazo en vez de scroll infinito. */}
      <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-start">
      {data.blocks.map((block) => (
        <BlockSection
          key={block.block_number}
          blockNumber={block.block_number}
          blockName={block.block_name}
          items={block.items}
          onOpenStep={(id) => setOpenStepId(id)}
          theme={theme}
        />
      ))}
      </div>
    </div>
  );
}

function BlockSection({
  blockNumber,
  blockName,
  items,
  onOpenStep,
  theme,
}: {
  blockNumber: number;
  blockName: string;
  items: SequenceItem[];
  onOpenStep: (id: string) => void;
  theme: BeltTheme;
}) {
  const ratedCount = items.filter((i) => i.rating !== null).length;
  const avgRating = ratedCount > 0
    ? items.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedCount
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ borderLeft: `4px solid ${theme.accent}` }}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between" style={{ background: theme.tint }}>
        <div>
          <div className="text-[8px]" style={{ ...F_M, color: theme.ink }}>
            Block {blockNumber}
          </div>
          <div className="text-[13px] mt-0.5" style={{ ...F_D, color: INK }}>{blockName}</div>
        </div>
        <div className="text-right text-xs">
          {avgRating !== null ? (
            <>
              <div className="font-bold" style={{ color: theme.ink }}>{avgRating.toFixed(1)}/5</div>
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
            <span className="text-[9px] text-gray-400" style={F_M}>{item.step_id}</span>
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
