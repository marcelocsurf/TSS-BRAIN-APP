'use client';

import { useState } from 'react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import type { CoachLessonDetail } from '@/lib/actions/coach-portal';
import { BookOpen, Video, AlertTriangle, CheckCircle2, Dumbbell, Waves, Clock, RotateCcw } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────
// StpPillarReader — the coach's STP lesson reader, sectioned into
// pillar tabs that mirror the student portal's Theory/Drill/Mission
// layout. Used when a coach lesson has structured coach_* columns
// (the 25 COACH-STP-XXX lessons).
//
// Pillars (per TSS Coach Manual Part VI doctrine):
//   📘 What     — what you teach the student
//   🎬 Deliver  — EDPF delivery for this step
//   ⚠ Errors   — common errors + corrections + verbal cues
//   ✅ Validate — mastery criteria, when to promote
//   🏋️ Drill    — the dry-land practice (from drills_missions)
//   🌊 Mission  — the in-water application (from drills_missions)
// ────────────────────────────────────────────────────────────────────

type Pillar = 'what' | 'deliver' | 'errors' | 'validate' | 'drill' | 'mission';

type PillarIcon = React.ComponentType<any>;

const PILLARS: { key: Pillar; Icon: PillarIcon; label: string }[] = [
  { key: 'what',     Icon: BookOpen,      label: 'What' },
  { key: 'deliver',  Icon: Video,         label: 'Deliver' },
  { key: 'errors',   Icon: AlertTriangle, label: 'Errors' },
  { key: 'validate', Icon: CheckCircle2,  label: 'Validate' },
  { key: 'drill',    Icon: Dumbbell,      label: 'Drill' },
  { key: 'mission',  Icon: Waves,         label: 'Mission' },
];

export function StpPillarReader({ detail }: { detail: CoachLessonDetail }) {
  const [active, setActive] = useState<Pillar>('what');
  const { lesson, linkedDrill, linkedMission } = detail;

  return (
    <div className="space-y-3">
      {/* Pillar tab bar — horizontal scroll on mobile */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {PILLARS.map((p) => {
          const isActive = active === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setActive(p.key)}
              className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                isActive
                  ? 'bg-white text-[var(--tss-navy)] border border-gray-300 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <p.Icon size={13} strokeWidth={1.75} className={isActive ? 'text-[var(--tss-cyan,#5AC3E7)]' : ''} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pillar content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        {active === 'what' && (
          <PillarBody
            md={lesson.coach_what_md}
            empty="No 'what you teach' content for this step."
          />
        )}
        {active === 'deliver' && (
          <PillarBody
            md={lesson.coach_deliver_md}
            empty="No EDPF delivery content for this step."
            intro="How you teach it — Explain · Demonstrate · Participate · Feedback"
          />
        )}
        {active === 'errors' && (
          <PillarBody
            md={lesson.coach_errors_md}
            empty="No error/correction content for this step."
            intro="Common errors, corrections, and the verbal cues to use mid-wave"
          />
        )}
        {active === 'validate' && (
          <PillarBody
            md={lesson.coach_validate_md}
            empty="No mastery-criteria content for this step."
            intro="When the student is ready to move to the next step"
          />
        )}
        {active === 'drill' && (
          <LinkedToolBody
            kind="Drill"
            Icon={Dumbbell}
            tool={linkedDrill}
            empty="No drill indexed for this step yet."
          />
        )}
        {active === 'mission' && (
          <LinkedToolBody
            kind="Mission"
            Icon={Waves}
            tool={linkedMission}
            empty="No mission indexed for this step yet."
          />
        )}
      </div>
    </div>
  );
}

function PillarBody({
  md,
  empty,
  intro,
}: {
  md: string | null;
  empty: string;
  intro?: string;
}) {
  if (!md) {
    return <p className="text-sm text-gray-400 italic">{empty}</p>;
  }
  return (
    <div>
      {intro && (
        <p className="text-[11px] text-gray-500 italic mb-3 pb-2 border-b border-gray-100">
          {intro}
        </p>
      )}
      <MarkdownContent markdown={md} />
    </div>
  );
}

function LinkedToolBody({
  kind,
  Icon,
  tool,
  empty,
}: {
  kind: string;
  Icon: React.ComponentType<any>;
  tool: CoachLessonDetail['linkedDrill'];
  empty: string;
}) {
  if (!tool) {
    return <p className="text-sm text-gray-400 italic">{empty}</p>;
  }
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 inline-flex items-center gap-1">
        <Icon size={11} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
        {kind} · {tool.id}
        {tool.block_name ? ` · ${tool.block_name}` : ''}
      </p>
      <p className="text-base font-bold text-[var(--tss-navy)] mt-0.5">{tool.title}</p>
      <div className="flex flex-wrap gap-3 mt-1">
        {tool.time_estimate && (
          <p className="text-[11px] text-gray-500 inline-flex items-center gap-1">
            <Clock size={11} strokeWidth={1.75} />
            {tool.time_estimate}
          </p>
        )}
        {tool.reps_recommended && (
          <p className="text-[11px] text-gray-500 inline-flex items-center gap-1">
            <RotateCcw size={11} strokeWidth={1.75} />
            {tool.reps_recommended}
          </p>
        )}
      </div>

      {tool.description_md && (
        <div className="mt-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
            How it works
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {tool.description_md}
          </p>
        </div>
      )}

      {tool.success_criteria && tool.success_criteria.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
            Success criteria
          </p>
          <ul className="space-y-1">
            {tool.success_criteria.map((c, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool.key_words && tool.key_words.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
            Key words
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tool.key_words.map((k, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
      {!tool.description_md && (!tool.success_criteria || tool.success_criteria.length === 0) && (
        <p className="text-[11px] text-gray-400 italic mt-3">
          No detailed content has been added for this {kind.toLowerCase()} yet.
        </p>
      )}
    </div>
  );
}
