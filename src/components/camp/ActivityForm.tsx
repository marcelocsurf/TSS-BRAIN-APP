'use client';

// ActivityForm — M78 Activity taxonomy.
//
// Renders a type-specific sub-form per Activity (template block). The
// outer card lives inside TemplateBuilderForm; this component only
// owns the fields that change per type. Common meta (block_order,
// mission_time, equipment) is delegated up.
//
// Every sub-form reads/writes the same TemplateBlockInput shape so the
// underlying DB model stays single.

import type { TemplateBlockInput } from '@/lib/actions/camps';
import type { TemplateCatalog } from '@/lib/actions/template-catalog';
import { StepDrillPicker } from '@/components/shared/StepDrillPicker';
import {
  ACTIVITY_TYPES,
  WARMUP_SUBTYPES,
  MENTAL_SUBTYPES,
  EQUIPMENT_OPTIONS,
  MISSION_TIME_OPTIONS,
  type ActivityType,
} from '@/lib/constants/brand';

interface Props {
  block: TemplateBlockInput;
  catalog: TemplateCatalog | null;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}

/**
 * Map legacy/unknown block_type values to a known ActivityType so the
 * picker shows something sensible. Pre-M78 rows use 'mission' →
 * water_mission. Anything else falls back to 'custom'.
 */
function normalizeType(block_type: string | null | undefined): ActivityType {
  if (!block_type) return 'custom';
  const known = ACTIVITY_TYPES.find((t) => t.value === block_type);
  if (known) return known.value as ActivityType;
  return 'custom';
}

export function ActivityForm({ block, catalog, onChange }: Props) {
  const type = normalizeType(block.block_type);

  return (
    <div className="space-y-3">
      {/* ── Type selector + color stripe ── */}
      <TypeSelector type={type} onChange={(t) => onChange({ block_type: t })} />

      {/* ── Type-specific body ── */}
      {type === 'water_mission' || type === 'mission' ? (
        <WaterMissionFields block={block} catalog={catalog} onChange={onChange} />
      ) : type === 'land_drill' ? (
        <LandDrillFields block={block} catalog={catalog} onChange={onChange} />
      ) : type === 'warm_up' ? (
        <WarmUpFields block={block} onChange={onChange} />
      ) : type === 'venue_analysis' ? (
        <VenueAnalysisFields block={block} onChange={onChange} />
      ) : type === 'mental' ? (
        <MentalFields block={block} onChange={onChange} />
      ) : type === 'get_in_stp' ? (
        <GetInStpFields block={block} catalog={catalog} onChange={onChange} />
      ) : type === 'theory' ? (
        <TheoryFields block={block} onChange={onChange} />
      ) : type === 'evaluation' ? (
        <EvaluationFields block={block} onChange={onChange} />
      ) : type === 'free_practice' ? (
        <FreePracticeFields block={block} onChange={onChange} />
      ) : (
        <CustomFields block={block} onChange={onChange} />
      )}

      {/* ── Shared meta (time + reps + equipment + eval focus) ── */}
      <MetaFields block={block} type={type} onChange={onChange} />
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function TypeSelector({
  type,
  onChange,
}: {
  type: ActivityType;
  onChange: (t: string) => void;
}) {
  const current = ACTIVITY_TYPES.find((t) => t.value === type) ?? ACTIVITY_TYPES[0];
  // Hide the legacy 'mission' alias from the picker — keep water_mission
  // as the canonical option. Rows already stored as 'mission' map to it.
  const options = ACTIVITY_TYPES.filter((t) => t.value !== 'mission');

  return (
    <div className="space-y-1">
      <label
        className="block text-[10px] font-medium text-gray-500"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Activity Type
      </label>
      <div className="flex items-stretch gap-2">
        <div
          className="w-1 rounded-full"
          style={{ backgroundColor: current.color }}
          aria-hidden
        />
        <select
          value={type}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[10px] text-gray-400 leading-snug pl-3">
        {current.description}
      </p>
    </div>
  );
}

function WaterMissionFields({
  block,
  catalog,
  onChange,
}: {
  block: TemplateBlockInput;
  catalog: TemplateCatalog | null;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  return (
    <div>
      {catalog ? (
        <StepDrillPicker
          value={{
            step_id: block.step_id ?? null,
            // No drill slot for Water Games — pass nulls so the picker
            // never renders the drill UI even by accident.
            drill_id: null,
            drill_custom: null,
            mission_id: block.mission_id ?? null,
            mission_custom: block.mission_custom ?? null,
          }}
          stps={catalog.stps}
          drills={catalog.drills}
          missions={catalog.missions}
          slots="mission_only"
          onChange={(patch) => {
            // Auto-populate from the canonical mission: eval focus
            // (success_criteria), time_estimate, reps_recommended.
            const extra: Partial<TemplateBlockInput> = {};
            if ('mission_id' in patch && patch.mission_id && catalog) {
              const m = catalog.missions.find((x) => x.id === patch.mission_id);
              if (m) {
                if (!block.evaluation_focus && m.success_criteria && m.success_criteria.length > 0) {
                  extra.evaluation_focus = m.success_criteria.join(' · ');
                }
                if (!block.mission_time || block.mission_time === '15') {
                  const t = parseTimeEstimate(m.time_estimate);
                  if (t) extra.mission_time = t;
                }
                if (block.repetitions_default == null) {
                  const r = parseReps(m.reps_recommended);
                  if (r != null) extra.repetitions_default = r;
                }
              }
            }
            onChange({ ...patch, ...extra });
          }}
        />
      ) : (
        <p className="text-[11px] text-gray-400 italic">Loading sequence catalog…</p>
      )}
    </div>
  );
}

function LandDrillFields({
  block,
  catalog,
  onChange,
}: {
  block: TemplateBlockInput;
  catalog: TemplateCatalog | null;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  // When the STP changes, auto-fill EDPF fields that are still empty.
  // When a canonical drill is picked, its body and time/reps refine the
  // STP-level defaults. Manual edits are never overwritten.
  const onPick = (patch: Partial<TemplateBlockInput>) => {
    const extra: Partial<TemplateBlockInput> = {};

    // STP picked → seed EDPF fields from the lesson body. Feedback is
    // built from positive coach cues aggregated across all drills of
    // this STP (per canon: "Errors are signals, not failures" — give
    // cues, not error lists). The errors_md field is NOT used here.
    if ('step_id' in patch && patch.step_id && catalog) {
      const stp = catalog.stps.find((s) => s.id === patch.step_id);
      if (stp) {
        if (!block.explain_md && stp.description_md) {
          extra.explain_md = summarize(stp.description_md, 280);
        }
        if (!block.demonstrate_md && stp.video_url) {
          extra.demonstrate_md = `Demo video: ${stp.video_url}`;
        }
        if (!block.simulate_md && stp.drill_md) {
          extra.simulate_md = summarize(stp.drill_md, 280);
        }
        if (!block.feedback_md) {
          // Aggregate top-N key_words across ALL drills of this STP.
          const drills = catalog.drills.filter((d) => d.step_id === patch.step_id);
          const cues = uniqueCues(drills);
          if (cues.length > 0) {
            extra.feedback_md = formatCues(cues.slice(0, 5));
          }
        }
      }
    }

    // Canonical drill picked → its description refines Simulate. Its
    // own key_words refine Feedback (more focused than the aggregate).
    // Time + reps also seed.
    if ('drill_id' in patch && patch.drill_id && catalog) {
      const drill = catalog.drills.find((d) => d.id === patch.drill_id);
      if (drill) {
        if (drill.description_md) {
          extra.simulate_md = summarize(drill.description_md, 320);
        }
        if (drill.key_words && drill.key_words.length > 0) {
          // Override the STP-aggregated cues with the drill-specific
          // ones — these are the cues the coach repeats during this
          // exact drill.
          extra.feedback_md = formatCues(drill.key_words);
        }
        if (!block.mission_time || block.mission_time === '15') {
          const t = parseTimeEstimate(drill.time_estimate);
          if (t) extra.mission_time = t;
        }
        if (block.repetitions_default == null) {
          const r = parseReps(drill.reps_recommended);
          if (r != null) extra.repetitions_default = r;
        }
      }
    }

    onChange({ ...patch, ...extra });
  };

  return (
    <div className="space-y-3">
      {/* STP + drill picker only — Land Drill has no water mission slot. */}
      {catalog ? (
        <StepDrillPicker
          value={{
            step_id: block.step_id ?? null,
            drill_id: block.drill_id ?? null,
            drill_custom: block.drill_custom ?? null,
            mission_id: null,
            mission_custom: null,
          }}
          stps={catalog.stps}
          drills={catalog.drills}
          missions={catalog.missions}
          slots="drill_only"
          onChange={onPick}
        />
      ) : (
        <p className="text-[11px] text-gray-400 italic">Loading sequence catalog…</p>
      )}

      {/* EDPF — 4 sub-fields per Canon §A.6 */}
      <div className="space-y-2 border-l-2 border-amber-300 pl-3">
        <p
          className="text-[10px] uppercase tracking-wider text-amber-700 font-bold"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          EDPF Flow
        </p>
        <EdpfArea
          label="Explain"
          hint="What the coach will say (≤30s). Auto-filled from the STP theory when you pick a step — edit freely."
          value={block.explain_md ?? ''}
          onChange={(v) => onChange({ explain_md: v })}
        />
        <EdpfArea
          label="Demonstrate"
          hint="Physical demo + optional reference video URL"
          value={block.demonstrate_md ?? ''}
          onChange={(v) => onChange({ demonstrate_md: v })}
        />
        <EdpfArea
          label="Simulate / Participate"
          hint="Out-of-water practice (skate, mat, chalk line, gym). Auto-filled from the STP drill body."
          value={block.simulate_md ?? ''}
          onChange={(v) => onChange({ simulate_md: v })}
        />
        <EdpfArea
          label="Feedback"
          hint="Key cues + positive corrections to repeat during the drill (not error lists). Auto-filled from the drill's key_words when picked."
          value={block.feedback_md ?? ''}
          onChange={(v) => onChange({ feedback_md: v })}
        />
      </div>
    </div>
  );
}

/**
 * Tight summary helper for auto-populating EDPF text from a markdown
 * body. Strips heading hashes, collapses whitespace, and truncates to
 * `max` chars at a word boundary.
 */
function summarize(md: string, max: number): string {
  const cleaned = md
    .replace(/^#+\s+/gm, '') // headings
    .replace(/[*_`>]/g, '') // basic md noise
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

/**
 * Parse a canonical drill/mission `time_estimate` text ("15 min",
 * "20-30 min", "30") into the closest MISSION_TIME_OPTIONS value.
 * Returns null when nothing parseable is found.
 */
function parseTimeEstimate(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  // MISSION_TIME_OPTIONS values: 10, 15, 20, 30, 45, 60.
  const options = [10, 15, 20, 30, 45, 60];
  const closest = options.reduce((best, cur) =>
    Math.abs(cur - n) < Math.abs(best - n) ? cur : best,
  );
  return String(closest);
}

/**
 * Parse a `reps_recommended` text ("8 reps", "5-8", "10x") into the
 * first integer. Returns null when nothing parseable is found.
 */
function parseReps(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Aggregate unique key_words across a set of drills, preserving the
 * first-seen order. Drives the STP-level default for Land Drill's
 * Feedback field (cues, not errors).
 */
function uniqueCues(drills: { key_words: string[] | null }[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const d of drills) {
    for (const k of d.key_words ?? []) {
      const trimmed = k.trim();
      if (!trimmed) continue;
      const lower = trimmed.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      out.push(trimmed);
    }
  }
  return out;
}

/**
 * Render a list of cues as a single bullet line suitable for the
 * Feedback textarea. Reads as actionable coach prompts.
 */
function formatCues(cues: string[]): string {
  return cues.map((c) => `• ${c}`).join('\n');
}

// Default time (minutes) when a sub-typed routine is picked. Lets the
// admin land on a sensible duration without typing.
const SUBTYPE_DEFAULT_TIME: Record<string, string> = {
  // Warm-Up
  head_to_toe: '10',
  kids: '10',
  specific: '15',
  flow_motion: '10',
  // Mental
  bhastrika: '5',
  box_breathing: '5',
  visualization: '5',
  key_words: '5',
  focus_stamp: '5',
};

function EdpfArea({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="block text-[10px] font-semibold text-amber-700 mb-0.5"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
        placeholder={hint}
      />
    </div>
  );
}

function WarmUpFields({
  block,
  onChange,
}: {
  block: TemplateBlockInput;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  const pickSubtype = (v: string) => {
    const patch: Partial<TemplateBlockInput> = { activity_subtype: v || null };
    // Seed default time when sub-type chosen and admin hasn't set one.
    const def = SUBTYPE_DEFAULT_TIME[v];
    if (def && (!block.mission_time || block.mission_time === '15')) {
      patch.mission_time = def;
    }
    onChange(patch);
  };
  return (
    <div>
      <label
        className="block text-[10px] text-gray-500 mb-0.5"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Warm-Up Type
      </label>
      <select
        value={block.activity_subtype ?? ''}
        onChange={(e) => pickSubtype(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
      >
        <option value="">Pick a sub-type…</option>
        {WARMUP_SUBTYPES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {block.activity_subtype === 'custom' && (
        <input
          type="text"
          value={block.pilar_part ?? ''}
          onChange={(e) => onChange({ pilar_part: e.target.value || null })}
          placeholder="Custom warm-up description"
          className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
        />
      )}
    </div>
  );
}

function MentalFields({
  block,
  onChange,
}: {
  block: TemplateBlockInput;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  const pickSubtype = (v: string) => {
    const patch: Partial<TemplateBlockInput> = { activity_subtype: v || null };
    const def = SUBTYPE_DEFAULT_TIME[v];
    if (def && (!block.mission_time || block.mission_time === '15')) {
      patch.mission_time = def;
    }
    onChange(patch);
  };
  return (
    <div>
      <label
        className="block text-[10px] text-gray-500 mb-0.5"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Mental Activity
      </label>
      <select
        value={block.activity_subtype ?? ''}
        onChange={(e) => pickSubtype(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
      >
        <option value="">Pick a sub-type…</option>
        {MENTAL_SUBTYPES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {block.activity_subtype === 'custom' && (
        <input
          type="text"
          value={block.pilar_part ?? ''}
          onChange={(e) => onChange({ pilar_part: e.target.value || null })}
          placeholder="Custom mental cue / routine"
          className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
        />
      )}
    </div>
  );
}

function VenueAnalysisFields({
  block,
  onChange,
}: {
  block: TemplateBlockInput;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  return (
    <div className="space-y-2">
      <label
        className="block text-[10px] text-gray-500"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Variant
      </label>
      <select
        value={block.activity_subtype ?? 'group'}
        onChange={(e) => onChange({ activity_subtype: e.target.value })}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
      >
        <option value="group">Group-led (coach guides)</option>
        <option value="student_led">Student-led (each writes own plan)</option>
        <option value="quick_check">Quick check (one minute)</option>
      </select>
      <textarea
        value={block.pilar_part ?? ''}
        onChange={(e) => onChange({ pilar_part: e.target.value || null })}
        rows={2}
        placeholder="Today's go/no-go question (optional)"
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
      />
    </div>
  );
}

function GetInStpFields({
  block,
  catalog,
  onChange,
}: {
  block: TemplateBlockInput;
  catalog: TemplateCatalog | null;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  const selected = block.step_ids ?? [];
  const stps = catalog?.stps ?? [];

  const toggle = (stpId: string) => {
    const next = selected.includes(stpId)
      ? selected.filter((id) => id !== stpId)
      : [...selected, stpId];
    onChange({ step_ids: next.length > 0 ? next : null });
  };

  return (
    <div className="space-y-3">
      {/* Activity title + description */}
      <div className="space-y-2">
        <input
          type="text"
          value={block.pilar_part ?? ''}
          onChange={(e) => onChange({ pilar_part: e.target.value || null })}
          placeholder="Activity title (e.g. Full pop-up chain)"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
        />
        <textarea
          value={block.mission_custom ?? ''}
          onChange={(e) => onChange({ mission_custom: e.target.value || null })}
          rows={3}
          placeholder="What will the students do? What is this activity about?"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
        />
      </div>

      <div>
        <label
          className="block text-[10px] text-gray-500 mb-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Pick one or more STPs in sequence
        </label>
        {stps.length === 0 ? (
          <p className="text-[11px] text-gray-400 italic">Loading STPs…</p>
        ) : (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
            {stps.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className="rounded border-gray-300"
                />
                <span className="font-mono text-[10px] text-gray-500">{s.id}</span>
                <span className="flex-1 text-gray-700 truncate">{s.title}</span>
              </label>
            ))}
          </div>
        )}
        {selected.length > 0 && (
          <p className="text-[10px] text-cyan-700 mt-1">
            Selected sequence: {selected.join(' → ')}
          </p>
        )}
      </div>
    </div>
  );
}

function TheoryFields({
  block,
  onChange,
}: {
  block: TemplateBlockInput;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={block.pilar_part ?? ''}
        onChange={(e) => onChange({ pilar_part: e.target.value || null })}
        placeholder="Theory topic (e.g. Parts of a Wave · Etiquette)"
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
      />
      <textarea
        value={block.mission_custom ?? ''}
        onChange={(e) => onChange({ mission_custom: e.target.value || null })}
        rows={3}
        placeholder="Description / key points to cover"
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
      />
    </div>
  );
}

function EvaluationFields({
  block,
  onChange,
}: {
  block: TemplateBlockInput;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={block.pilar_part ?? ''}
        onChange={(e) => onChange({ pilar_part: e.target.value || null })}
        placeholder="Evaluation focus (e.g. 25-STP self-eval)"
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
      />
      <p className="text-[10px] text-gray-400 leading-snug">
        On Day 6 use this for the final coach evaluation that links to
        /camps/[id]/evaluate. The camp is marked Completed once every
        student has an evaluation.
      </p>
    </div>
  );
}

function FreePracticeFields({
  block,
  onChange,
}: {
  block: TemplateBlockInput;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  return (
    <textarea
      value={block.pilar_part ?? ''}
      onChange={(e) => onChange({ pilar_part: e.target.value || null })}
      rows={2}
      placeholder="Optional guideline for free practice"
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
    />
  );
}

function CustomFields({
  block,
  onChange,
}: {
  block: TemplateBlockInput;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={block.pilar_part ?? ''}
        onChange={(e) => onChange({ pilar_part: e.target.value || null })}
        placeholder="Activity title"
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
      />
      <textarea
        value={block.mission_custom ?? ''}
        onChange={(e) => onChange({ mission_custom: e.target.value || null })}
        rows={3}
        placeholder="Free-form description"
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
      />
    </div>
  );
}

// Activity types where capturing an "evaluation focus" makes pedagogical
// sense. Warm-Up / Mental / Theory / Free Practice / Venue Analysis are
// supportive routines, not directly evaluable.
const TYPES_WITH_EVAL_FOCUS: ActivityType[] = [
  'water_mission',
  'mission', // legacy
  'land_drill',
  'get_in_stp',
  'evaluation',
  'custom',
];

function MetaFields({
  block,
  type,
  onChange,
}: {
  block: TemplateBlockInput;
  type: ActivityType;
  onChange: (patch: Partial<TemplateBlockInput>) => void;
}) {
  const showEvalFocus = TYPES_WITH_EVAL_FOCUS.includes(type);

  return (
    <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
      <div>
        <label
          className="block text-[10px] text-gray-500 mb-0.5"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Time
        </label>
        <select
          value={block.mission_time || '15'}
          onChange={(e) => onChange({ mission_time: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
        >
          {MISSION_TIME_OPTIONS.map((mt) => (
            <option key={mt.value} value={mt.value}>
              {mt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="block text-[10px] text-gray-500 mb-0.5"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Repetitions
        </label>
        <input
          type="number"
          min={0}
          value={block.repetitions_default ?? ''}
          onChange={(e) =>
            onChange({
              repetitions_default: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder="0"
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
        />
      </div>

      <div className="col-span-2">
        <label
          className="block text-[10px] text-gray-500 mb-0.5"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Equipment
        </label>
        <input
          type="text"
          list="equipment-options"
          value={block.equipment ?? ''}
          onChange={(e) => onChange({ equipment: e.target.value || null })}
          placeholder="Surf board · Mat · Chalk line… (comma-separated)"
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
        />
        <datalist id="equipment-options">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <option key={eq.value} value={eq.label} />
          ))}
        </datalist>
      </div>

      {showEvalFocus && (
        <div className="col-span-2">
          <label
            className="block text-[10px] text-gray-500 mb-0.5"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Evaluation Focus
          </label>
          <input
            type="text"
            value={block.evaluation_focus ?? ''}
            onChange={(e) => onChange({ evaluation_focus: e.target.value || null })}
            placeholder="What to evaluate / observe"
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
          />
        </div>
      )}
    </div>
  );
}
