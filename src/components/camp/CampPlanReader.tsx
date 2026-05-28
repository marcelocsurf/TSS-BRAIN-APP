'use client';

// CampPlanReader — the polished "Read the Plan" view for the coach.
//
// Renders the camp_template structure (6 days × N blocks) with a
// Summary / Detail toggle. Summary = day cards collapsed (goal +
// venue + block titles). Detail = each block expanded with drill +
// mission full body + linked STP + meta chips.
//
// Reuses MarkdownContent for drill/mission body. Does NOT fetch its
// own data — receives the already-resolved templatePlan from
// getServicePlan() / getCustomizedPlan().

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  Compass,
  Target,
  Sparkles,
  Repeat,
  Brain,
  ListChecks,
} from 'lucide-react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { StpMediaGrid } from '@/components/coach-portal/StpMediaGrid';
import {
  ACTIVITY_TYPES,
  WARMUP_SUBTYPES,
  MENTAL_SUBTYPES,
} from '@/lib/constants/brand';
import type { ServicePlanData } from '@/lib/actions/service-planner';

type Block = ServicePlanData['templatePlan'][number]['blocks'][number];
type Day = ServicePlanData['templatePlan'][number];

interface Props {
  /** Camp instance ID — used to deep-link to per-day session pages */
  instanceId: string;
  /** Coach portal token — for inline links to /coach-portal/[token]/tools/[stepId] */
  coachToken?: string | null;
  /** Already-resolved plan (drill + mission detail included). */
  templatePlan: ServicePlanData['templatePlan'];
  templateMeta: ServicePlanData['templateMeta'];
}

type Mode = 'summary' | 'detail';

export function CampPlanReader({
  instanceId,
  coachToken,
  templatePlan,
  templateMeta,
}: Props) {
  const [mode, setMode] = useState<Mode>('summary');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleDay = (n: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  if (!templateMeta.id || templatePlan.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center text-sm text-gray-400 italic">
        No plan attached to this service — pick a template at creation time, or
        ask the admin to seed the days.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Header: template name + summary/detail toggle ── */}
      <div className="bg-[var(--tss-navy)] text-white rounded-2xl p-5 shadow-md">
        <p
          className="text-[10px] uppercase tracking-[0.2em] text-[var(--tss-cyan)] font-bold"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          The Plan
        </p>
        <h2
          className="text-xl mt-1 leading-tight"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          {templateMeta.name}
          {templateMeta.duration_days && (
            <span className="text-white/55 font-normal text-base ml-2">
              · {templateMeta.duration_days} days
            </span>
          )}
        </h2>

        {/* Mode toggle */}
        <div className="mt-4 inline-flex rounded-lg border border-white/20 overflow-hidden">
          {(['summary', 'detail'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                if (m === 'detail') {
                  // Expand every day so the coach reads top-to-bottom.
                  setExpanded(new Set(templatePlan.map((d) => d.day_number)));
                } else {
                  setExpanded(new Set());
                }
              }}
              className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors ${
                mode === m
                  ? 'bg-[var(--tss-cyan)] text-[var(--tss-navy)]'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day cards ── */}
      <div className="space-y-2">
        {templatePlan.map((d) => {
          const isOpen = expanded.has(d.day_number);
          return (
            <div
              key={d.day_number}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Day header — always visible */}
              <button
                type="button"
                onClick={() => toggleDay(d.day_number)}
                className="w-full flex items-start justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[10px] uppercase tracking-wider text-[var(--tss-cyan)] font-bold"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    Day {d.day_number}
                  </p>
                  <h3
                    className="text-base text-[var(--tss-navy)] mt-0.5 leading-snug"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    {d.day_goal || 'No goal set'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-gray-500" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {d.venue_default && (
                      <span className="inline-flex items-center gap-1 uppercase tracking-wider">
                        <Compass size={10} strokeWidth={1.75} />
                        {d.venue_default}
                      </span>
                    )}
                    <span className="uppercase tracking-wider">
                      {d.blocks.length} block{d.blocks.length === 1 ? '' : 's'}
                    </span>
                    {d.media && d.media.length > 0 && (
                      <span className="uppercase tracking-wider text-[var(--tss-cyan)]">
                        · {d.media.length} support
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-gray-400 mt-1">
                  {isOpen ? (
                    <ChevronDown size={16} strokeWidth={2} />
                  ) : (
                    <ChevronRight size={16} strokeWidth={2} />
                  )}
                </span>
              </button>

              {/* Day body — visible in detail mode or when expanded */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/30">
                  {/* M77 — per-day support material (PPT / video / image / diagram) */}
                  {d.media && d.media.length > 0 && (
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2"
                        style={{ fontFamily: 'DM Mono, monospace' }}
                      >
                        Support material
                      </p>
                      <StpMediaGrid media={d.media} />
                    </div>
                  )}

                  {d.evaluation_focus && (
                    <div className="bg-white border-l-4 border-[var(--tss-cyan)] rounded-r-lg px-3 py-2">
                      <p
                        className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold"
                        style={{ fontFamily: 'DM Mono, monospace' }}
                      >
                        Evaluation focus
                      </p>
                      <p className="text-sm text-[var(--tss-navy)] mt-0.5">
                        {d.evaluation_focus}
                      </p>
                    </div>
                  )}

                  {d.blocks.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No blocks defined for this day yet.</p>
                  ) : (
                    d.blocks.map((b) => (
                      <BlockCard key={b.block_order} block={b} coachToken={coachToken} />
                    ))
                  )}

                  {d.day_notes && (
                    <div className="text-[11px] text-gray-500 italic border-t border-gray-200 pt-2">
                      {d.day_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── A single block (Activity), rendered with type-specific visuals ──
function BlockCard({ block, coachToken }: { block: Block; coachToken?: string | null }) {
  const activityType =
    ACTIVITY_TYPES.find((t) => t.value === block.block_type) ??
    ACTIVITY_TYPES.find((t) => t.value === 'custom')!;

  // Resolve sub-type label (Warm-Up / Mental).
  const subtypeLabel = (() => {
    if (!block.activity_subtype) return null;
    if (activityType.value === 'warm_up') {
      return WARMUP_SUBTYPES.find((s) => s.value === block.activity_subtype)?.label ?? null;
    }
    if (activityType.value === 'mental') {
      return MENTAL_SUBTYPES.find((s) => s.value === block.activity_subtype)?.label ?? null;
    }
    return block.activity_subtype;
  })();

  // Land Drill is the only type that uses the EDPF stack.
  const isLandDrill = activityType.value === 'land_drill';
  const hasEdpf = isLandDrill && (
    block.explain_md || block.demonstrate_md || block.simulate_md || block.feedback_md
  );

  // Water Games shows the mission body. Other types use pilar_part /
  // mission_custom as their freeform body.
  const isWaterGames =
    activityType.value === 'water_mission' || activityType.value === 'mission';

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 border-l-4"
      style={{ borderLeftColor: activityType.color }}
    >
      {/* Header — order + activity type label + sub-type chip */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className="text-[9px] uppercase tracking-wider"
            style={{ fontFamily: 'DM Mono, monospace', color: activityType.color }}
          >
            Block {block.block_order} · {activityType.label}
            {subtypeLabel ? ` · ${subtypeLabel}` : ''}
          </p>
          {block.pilar_part && (
            <p
              className="text-sm text-[var(--tss-navy)] mt-0.5"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              {block.pilar_part}
            </p>
          )}
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1.5">
        {block.mission_time && (
          <Chip icon={<Target size={11} strokeWidth={1.75} />}>{block.mission_time} min</Chip>
        )}
        {block.repetitions_default != null && (
          <Chip icon={<Repeat size={11} strokeWidth={1.75} />}>{block.repetitions_default}× reps</Chip>
        )}
        {block.equipment && (
          <Chip icon={<Sparkles size={11} strokeWidth={1.75} />}>{block.equipment}</Chip>
        )}
      </div>

      {/* Free-form body / description for non-EDPF, non-Water-Games types */}
      {!hasEdpf && !isWaterGames && block.mission_custom && (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{block.mission_custom}</p>
      )}

      {/* Land Drill EDPF stack — 4 sections */}
      {hasEdpf && (
        <div className="space-y-2">
          {block.explain_md && (
            <EdpfSection label="Explain" body={block.explain_md} />
          )}
          {block.demonstrate_md && (
            <EdpfSection label="Demonstrate" body={block.demonstrate_md} />
          )}
          {block.simulate_md && (
            <EdpfSection label="Simulate / Participate" body={block.simulate_md} />
          )}
          {block.feedback_md && (
            <EdpfSection label="Feedback (cues)" body={block.feedback_md} />
          )}
        </div>
      )}

      {/* Canonical drill body — for Land Drill, shown after EDPF */}
      {(block.drill || block.drill_custom) && (
        <Section title="Drill" titleColor="text-amber-700">
          {block.drill ? (
            <DrillMissionBody item={block.drill} />
          ) : (
            <p className="text-sm text-gray-700">{block.drill_custom}</p>
          )}
        </Section>
      )}

      {/* Mission body — Water Games */}
      {(block.mission || block.mission_custom) && isWaterGames && (
        <Section title="Mission" titleColor="text-emerald-700">
          {block.mission ? (
            <DrillMissionBody item={block.mission} />
          ) : (
            <p className="text-sm text-gray-700">{block.mission_custom}</p>
          )}
        </Section>
      )}

      {/* Get-in-STP sequence chain */}
      {block.step_ids && block.step_ids.length > 0 && (
        <div className="bg-cyan-50 rounded-lg px-3 py-2">
          <p
            className="text-[9px] uppercase tracking-wider text-cyan-700 font-bold"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            STP sequence
          </p>
          <p className="text-xs text-cyan-900 mt-0.5">
            {block.step_ids.join(' → ')}
          </p>
        </div>
      )}

      {/* Linked STP — deep link to coach Tools tab */}
      {block.step_id && coachToken && (
        <Link
          href={`/coach-portal/${coachToken}/tools/${block.step_id}`}
          className="inline-flex items-center gap-1 text-[11px] text-[var(--tss-cyan)] hover:underline"
        >
          <ListChecks size={11} strokeWidth={1.75} />
          {block.step_id}{block.step_title ? ` · ${block.step_title}` : ''} →
        </Link>
      )}

      {/* Per-block evaluation focus */}
      {block.evaluation_focus && (
        <div className="text-[11px] text-gray-600 border-t border-gray-100 pt-2">
          <span className="font-semibold uppercase tracking-wider text-gray-400 text-[9px]" style={{ fontFamily: 'DM Mono, monospace' }}>
            Eval focus:
          </span>{' '}
          {block.evaluation_focus}
        </div>
      )}
    </div>
  );
}

// One EDPF phase rendered as a small stacked section inside Land Drill.
function EdpfSection({ label, body }: { label: string; body: string }) {
  return (
    <div className="border-l-2 border-amber-300 pl-3">
      <p
        className="text-[9px] uppercase tracking-wider text-amber-700 font-bold mb-0.5"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </p>
      <p className="text-[12px] text-gray-700 leading-snug whitespace-pre-wrap">{body}</p>
    </div>
  );
}

function Section({ title, titleColor, children }: { title: string; titleColor: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className={`text-[10px] uppercase tracking-wider font-bold ${titleColor} mb-1`}
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function DrillMissionBody({
  item,
}: {
  item: {
    title: string;
    description_md: string | null;
    key_words: string[] | null;
    success_criteria: string[] | null;
    time_estimate: string | null;
  };
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[var(--tss-navy)]">
        {item.title}
        {item.time_estimate && (
          <span className="ml-2 text-[10px] text-gray-400 font-normal" style={{ fontFamily: 'DM Mono, monospace' }}>
            · {item.time_estimate}
          </span>
        )}
      </p>
      {item.description_md && <MarkdownContent markdown={item.description_md} />}
      {item.key_words && item.key_words.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.key_words.map((k, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
            >
              {k}
            </span>
          ))}
        </div>
      )}
      {item.success_criteria && item.success_criteria.length > 0 && (
        <ul className="space-y-0.5 text-[12px] text-gray-700 mt-1">
          {item.success_criteria.map((c, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
      style={{ fontFamily: 'DM Mono, monospace' }}
    >
      {icon}
      {children}
    </span>
  );
}
