'use client';

import { useState, useTransition, useEffect } from 'react';
import { BRAND } from '@/lib/constants/brand';
import {
  saveServicePlanHeader,
  saveServicePlanBlock,
  startServicePlan,
  closeServicePlan,
  type ServicePlanData,
  type ServicePlanStudent,
} from '@/lib/actions/service-planner';

// Mental hack quick-picks (curated subset of canonical options). Coach
// can also write a custom one. Keys are stored as service_plans.mental_hack.
const MENTAL_HACK_QUICK = [
  { id: 'breathe_reset',     label: 'Breathe + reset', emoji: '🌬' },
  { id: 'key_words',         label: 'Key words',       emoji: '🔑' },
  { id: 'visualize_success', label: 'Visualize',       emoji: '🎯' },
];

// ────────────────────────────────────────────────────────────────────
// SessionPlanner — coach's session-planning UI in the coach portal.
//
// Layout (top → bottom):
//   1. Class header (camp_name, date, template)
//   2. Venue Analysis (conditions + go/no-go)
//   3. Group Warm-Up (pick from drills OR custom)
//   4. Mental Hack (3 options + custom)
//   5. Per-student cards (sequence focus + land drill + water drill + objective)
//   6. Sticky bottom bar: Start / Close session
//
// All writes are autosaved on blur to keep UX friction-free.
// ────────────────────────────────────────────────────────────────────

interface SessionPlannerProps {
  data: ServicePlanData;
  token: string;
  onBack: () => void;
}

export function SessionPlanner({ data, token, onBack }: SessionPlannerProps) {
  const [plan, setPlan] = useState(data.plan);
  const [students, setStudents] = useState(data.students);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const isClosed = plan.completion_state === 'closed';

  // Auto-save helpers — small debounce visual feedback
  const flash = (msg: string) => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 1500);
  };

  // Commit a plan-header patch: update local state AND persist the delta.
  // Sends only the changed fields — avoids the stale-state trap of reading
  // `plan` after an async setState.
  const commitPlanPatch = (patch: Partial<ServicePlanData['plan']>) => {
    setPlan((p) => ({ ...p, ...patch }));
    startTransition(async () => {
      try {
        await saveServicePlanHeader(token, data.camp.id, patch as any);
        flash('✓ Saved');
      } catch (e: any) {
        alert(e.message || 'Save failed');
      }
    });
  };
  const commitPlanField = (field: keyof ServicePlanData['plan'], value: any) =>
    commitPlanPatch({ [field]: value } as any);

  // Commit a per-student block patch: update local state AND persist the
  // exact patch (the delta) — never the whole block object.
  const commitStudentBlock = (
    studentId: string,
    patch: Partial<ServicePlanStudent['block']>
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId ? { ...s, block: { ...s.block, ...patch } } : s
      )
    );
    startTransition(async () => {
      try {
        await saveServicePlanBlock(token, data.camp.id, studentId, patch as any);
        const s = students.find((x) => x.student_id === studentId);
        flash(`✓ ${(s?.display_name ?? 'Saved').split(' ')[0]}`);
      } catch (e: any) {
        alert(e.message || 'Save failed');
      }
    });
  };

  const start = () => {
    startTransition(async () => {
      try {
        await startServicePlan(token, data.camp.id);
        setPlan((p) => ({
          ...p,
          completion_state: 'in_progress',
          started_at: new Date().toISOString(),
        }));
        flash('🌊 Session started');
      } catch (e: any) {
        alert(e.message || 'Failed to start');
      }
    });
  };

  const close = () => {
    if (!confirm('Close this session? All blocks should have a status (✓ / ~ / ✗).')) return;
    startTransition(async () => {
      try {
        await closeServicePlan(token, data.camp.id);
        setPlan((p) => ({
          ...p,
          completion_state: 'closed',
          closed_at: new Date().toISOString(),
        }));
        flash('✓ Session closed');
      } catch (e: any) {
        alert(e.message || 'Failed to close');
      }
    });
  };

  // Filter drills by type for the pickers
  const warmupOptions = data.availableDrills.filter(
    (d) => d.block_name?.toLowerCase().includes('warm') || d.step_id === 'STP-002'
  );

  return (
    <div className="space-y-4 pb-32">
      {/* Sticky save toast */}
      {savedFlash && (
        <div
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-lg"
          style={{ background: BRAND.colors.navy, color: 'white' }}
        >
          {savedFlash}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-[12px] text-[var(--tss-navy)] hover:underline"
      >
        ← Back to my classes
      </button>

      {/* Header */}
      <div
        className="rounded-2xl p-4 text-white"
        style={{ background: BRAND.colors.navy }}
      >
        <p className="text-[10px] font-mono uppercase tracking-wider opacity-80">
          {data.camp.service_kind?.replace(/_/g, ' ') || 'Service'} ·{' '}
          {plan.completion_state}
        </p>
        <h2 className="text-base font-bold mt-0.5">{data.camp.camp_name}</h2>
        <p className="text-[11px] opacity-80 mt-0.5">
          {new Date(data.camp.start_date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
          {data.camp.scheduled_time ? ` · ${data.camp.scheduled_time}` : ''}
          {data.camp.template_name ? ` · ${data.camp.template_name}` : ''}
        </p>
        <p className="text-[11px] mt-1" style={{ color: BRAND.colors.gold }}>
          {students.length} student{students.length === 1 ? '' : 's'} enrolled
        </p>
      </div>

      {/* 1. VENUE ANALYSIS */}
      <Section
        emoji="🌊"
        title="1. Venue Analysis"
        subtitle="Read today's conditions before going in"
      >
        <div className="space-y-2">
          {/* Go / Modified / No-Go */}
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { v: 'go', label: '✓ Go', bg: '#D1FAE5', fg: '#047857' },
                { v: 'modified', label: '~ Modified', bg: '#FEF3C7', fg: '#92400E' },
                { v: 'no_go', label: '✗ No-Go', bg: '#FEE2E2', fg: '#991B1B' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                disabled={isClosed}
                onClick={() => commitPlanField('venue_go_no_go', opt.v)}
                className="py-2 rounded-lg text-xs font-semibold transition-all"
                style={
                  plan.venue_go_no_go === opt.v
                    ? { background: opt.bg, color: opt.fg, boxShadow: 'inset 0 0 0 2px ' + opt.fg }
                    : { background: '#F3F4F6', color: '#6B7280' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Conditions grid */}
          <div className="grid grid-cols-2 gap-2">
            <SmallField
              label="Wave size"
              value={plan.venue_wave_size}
              onBlur={(v) => commitPlanField('venue_wave_size', v)}
              placeholder="knee · waist · head"
              disabled={isClosed}
            />
            <SmallField
              label="Wind"
              value={plan.venue_wind}
              onBlur={(v) => commitPlanField('venue_wind', v)}
              placeholder="offshore 10 kts"
              disabled={isClosed}
            />
            <SmallField
              label="Tide"
              value={plan.venue_tide}
              onBlur={(v) => commitPlanField('venue_tide', v)}
              placeholder="rising mid"
              disabled={isClosed}
            />
            <SmallField
              label="Hazards"
              value={plan.venue_hazards}
              onBlur={(v) => commitPlanField('venue_hazards', v)}
              placeholder="rocks · current"
              disabled={isClosed}
            />
          </div>

          <TextArea
            label="Full read"
            value={plan.venue_analysis}
            onBlur={(v) => commitPlanField('venue_analysis', v)}
            placeholder="What you see — currents, impact zone, where students should enter…"
            disabled={isClosed}
            rows={3}
          />
        </div>
      </Section>

      {/* 2. GROUP WARM-UP */}
      <Section
        emoji="🔥"
        title="2. Group Warm-Up"
        subtitle="Pick from your tools or write your own"
      >
        <PickerOrCustom
          options={warmupOptions.map((d) => ({
            id: d.id,
            label: d.title,
            sublabel: d.key_words?.join(' · ') ?? '',
          }))}
          selectedId={plan.warm_up_drill_id}
          customValue={plan.warm_up_custom}
          onPick={(id) =>
            commitPlanPatch({ warm_up_drill_id: id, warm_up_custom: null })
          }
          onCustom={(v) =>
            commitPlanPatch({ warm_up_custom: v, warm_up_drill_id: null })
          }
          customPlaceholder="e.g. Joint mobility + 10 sand pop-ups"
          disabled={isClosed}
        />
      </Section>

      {/* 3. MENTAL HACK */}
      <Section
        emoji="🧠"
        title="3. Mental Hack"
        subtitle="Get them in the zone"
      >
        <div className="grid grid-cols-3 gap-2">
          {MENTAL_HACK_QUICK.map((opt) => {
            const isSelected = plan.mental_hack === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isClosed}
                onClick={() => commitPlanField('mental_hack', opt.id)}
                className="py-3 rounded-xl text-xs font-medium transition-all border"
                style={
                  isSelected
                    ? { background: BRAND.colors.navy, color: 'white', borderColor: BRAND.colors.navy }
                    : { background: 'white', color: '#374151', borderColor: '#E5E7EB' }
                }
              >
                <div className="text-base mb-0.5">{opt.emoji}</div>
                <div>{opt.label}</div>
              </button>
            );
          })}
        </div>
        <SmallField
          label="Or custom"
          value={
            plan.mental_hack &&
            !MENTAL_HACK_QUICK.find((o) => o.id === plan.mental_hack)
              ? plan.mental_hack
              : ''
          }
          onBlur={(v) => commitPlanField('mental_hack', v || null)}
          placeholder="Visualization · breath ladder · etc."
          disabled={isClosed}
        />
      </Section>

      {/* 4. STUDENT BLOCKS */}
      <Section
        emoji="👥"
        title="4. Per Student"
        subtitle="Plan a different mission for each — sequence, drills, objective"
      >
        <div className="space-y-3">
          {students.map((s) => (
            <StudentCard
              key={s.student_id}
              student={s}
              isClosed={isClosed}
              stpCatalog={data.stpCatalog}
              availableDrills={data.availableDrills}
              onCommit={(patch) => commitStudentBlock(s.student_id, patch)}
            />
          ))}
        </div>
      </Section>

      {/* 5. NOTES + LIFECYCLE */}
      <Section emoji="📝" title="5. General notes (private)">
        <TextArea
          label=""
          value={plan.notes_general}
          onBlur={(v) => commitPlanField('notes_general', v)}
          placeholder="Anything else you want to remember about the session…"
          disabled={isClosed}
          rows={3}
        />
      </Section>

      {/* Sticky footer with lifecycle buttons */}
      <div
        className="fixed bottom-14 left-0 right-0 px-4 py-2 z-40 border-t border-gray-200"
        style={{ background: 'white' }}
      >
        <div className="max-w-lg mx-auto flex gap-2">
          {plan.completion_state === 'planned' && (
            <button
              type="button"
              onClick={start}
              disabled={pending}
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl"
              style={{ background: BRAND.colors.navy }}
            >
              🌊 Start session
            </button>
          )}
          {plan.completion_state === 'in_progress' && (
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl"
              style={{ background: '#10B981' }}
            >
              ✓ Close session
            </button>
          )}
          {plan.completion_state === 'closed' && (
            <div className="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-700">
              ✓ Closed{plan.closed_at ? ` · ${new Date(plan.closed_at).toLocaleTimeString()}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────

function Section({
  emoji,
  title,
  subtitle,
  children,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          {emoji} {title}
        </p>
        {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Form fields ──────────────────────────────────────────────────

function SmallField({
  label,
  value,
  onBlur,
  placeholder,
  disabled,
}: {
  label: string;
  value: string | null;
  onBlur: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState(value ?? '');
  useEffect(() => setLocal(value ?? ''), [value]);
  return (
    <div>
      {label && (
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          {label}
        </label>
      )}
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== (value ?? '') && onBlur(local)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs disabled:bg-gray-50"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onBlur,
  placeholder,
  disabled,
  rows = 2,
}: {
  label?: string;
  value: string | null;
  onBlur: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  const [local, setLocal] = useState(value ?? '');
  useEffect(() => setLocal(value ?? ''), [value]);
  return (
    <div>
      {label && (
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          {label}
        </label>
      )}
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== (value ?? '') && onBlur(local)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs resize-none disabled:bg-gray-50"
      />
    </div>
  );
}

// ─── Picker with custom write-in fallback ──────────────────────────

function PickerOrCustom({
  options,
  selectedId,
  customValue,
  onPick,
  onCustom,
  customPlaceholder,
  disabled,
}: {
  options: Array<{ id: string; label: string; sublabel?: string }>;
  selectedId: string | null;
  customValue: string | null;
  onPick: (id: string | null) => void;
  onCustom: (v: string) => void;
  customPlaceholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {options.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              onClick={() => onPick(selectedId === o.id ? null : o.id)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-[12px] transition-colors ${
                selectedId === o.id
                  ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{o.label}</div>
              {o.sublabel && (
                <div
                  className={`text-[10px] mt-0.5 ${
                    selectedId === o.id ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {o.sublabel}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      <SmallField
        label="Or write your own"
        value={customValue}
        onBlur={onCustom}
        placeholder={customPlaceholder}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Per-student card ─────────────────────────────────────────────

function StudentCard({
  student,
  isClosed,
  stpCatalog,
  availableDrills,
  onCommit,
}: {
  student: ServicePlanStudent;
  isClosed: boolean;
  stpCatalog: ServicePlanData['stpCatalog'];
  availableDrills: ServicePlanData['availableDrills'];
  onCommit: (patch: Partial<ServicePlanStudent['block']>) => void;
}) {
  const { block } = student;
  const [showLandPicker, setShowLandPicker] = useState(false);
  const [showWaterPicker, setShowWaterPicker] = useState(false);

  // When a step is picked, filter drills/missions by step_id
  const stepDrills = availableDrills.filter(
    (d) => d.type === 'drill' && d.step_id === block.step_id
  );
  const stepMissions = availableDrills.filter(
    (d) => d.type === 'mission' && d.step_id === block.step_id
  );

  // Find display labels for selected drill ids
  const landLabel = block.land_drill_id
    ? availableDrills.find((d) => d.id === block.land_drill_id)?.title
    : null;
  const waterLabel = block.water_drill_id
    ? availableDrills.find((d) => d.id === block.water_drill_id)?.title
    : null;

  return (
    <div className="bg-gray-50/60 rounded-xl border border-gray-200 p-3 space-y-2">
      {/* Student header + status pill */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--tss-navy)] truncate">
            {student.display_name}
          </p>
          <p className="text-[10px] text-gray-500 capitalize">
            {student.belt_level?.replace(/_/g, ' ')}
          </p>
        </div>
        {block.status && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={
              block.status === 'achieved'
                ? { background: '#D1FAE5', color: '#047857' }
                : block.status === 'partial'
                ? { background: '#FEF3C7', color: '#92400E' }
                : { background: '#FEE2E2', color: '#991B1B' }
            }
          >
            {block.status === 'achieved' ? '✓ Achieved' : block.status === 'partial' ? '~ Partial' : '✗ Not yet'}
          </span>
        )}
      </div>

      {/* Sequence focus picker */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          Sequence focus
        </label>
        <select
          value={block.step_id ?? ''}
          onChange={(e) => onCommit({ step_id: e.target.value || null })}
          disabled={isClosed}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs disabled:bg-gray-50"
        >
          <option value="">— pick a step —</option>
          {stpCatalog.map((stp) => (
            <option key={stp.id} value={stp.id}>
              {stp.id} · {stp.title}
            </option>
          ))}
        </select>
      </div>

      {/* Land drill */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          Land drill
        </label>
        {!showLandPicker ? (
          <button
            type="button"
            disabled={isClosed}
            onClick={() => setShowLandPicker(true)}
            className="w-full text-left px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50 disabled:bg-gray-50"
          >
            {landLabel || block.land_drill_custom || (
              <span className="text-gray-400 italic">— tap to pick —</span>
            )}
          </button>
        ) : (
          <div className="space-y-1.5 bg-white p-2 rounded-lg border border-gray-200">
            {stepDrills.length > 0 ? (
              stepDrills.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onCommit({ land_drill_id: d.id, land_drill_custom: null });
                    setShowLandPicker(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-gray-50"
                >
                  <strong>{d.id}</strong> · {d.title}
                </button>
              ))
            ) : (
              <p className="text-[10px] text-gray-400 italic">No drills indexed for this step. Use custom below.</p>
            )}
            <SmallField
              label=""
              value={block.land_drill_custom}
              onBlur={(v) => {
                onCommit({ land_drill_custom: v, land_drill_id: null });
                setShowLandPicker(false);
              }}
              placeholder="Or write your own land drill"
            />
            <button
              type="button"
              onClick={() => setShowLandPicker(false)}
              className="text-[10px] text-gray-500 hover:text-gray-700"
            >
              cancel
            </button>
          </div>
        )}
      </div>

      {/* Water drill / mission */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          In-water mission
        </label>
        {!showWaterPicker ? (
          <button
            type="button"
            disabled={isClosed}
            onClick={() => setShowWaterPicker(true)}
            className="w-full text-left px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50 disabled:bg-gray-50"
          >
            {waterLabel || block.water_drill_custom || (
              <span className="text-gray-400 italic">— tap to pick —</span>
            )}
          </button>
        ) : (
          <div className="space-y-1.5 bg-white p-2 rounded-lg border border-gray-200">
            {stepMissions.length > 0 ? (
              stepMissions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onCommit({ water_drill_id: d.id, water_drill_custom: null });
                    setShowWaterPicker(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-gray-50"
                >
                  <strong>{d.id}</strong> · {d.title}
                </button>
              ))
            ) : (
              <p className="text-[10px] text-gray-400 italic">No missions indexed for this step. Use custom below.</p>
            )}
            <SmallField
              label=""
              value={block.water_drill_custom}
              onBlur={(v) => {
                onCommit({ water_drill_custom: v, water_drill_id: null });
                setShowWaterPicker(false);
              }}
              placeholder="Or write your own water mission"
            />
            <button
              type="button"
              onClick={() => setShowWaterPicker(false)}
              className="text-[10px] text-gray-500 hover:text-gray-700"
            >
              cancel
            </button>
          </div>
        )}
      </div>

      {/* Objective */}
      <SmallField
        label="Objective today"
        value={block.objective_text}
        onBlur={(v) => onCommit({ objective_text: v })}
        placeholder="e.g. 3 clean pop-ups landing in FP2"
        disabled={isClosed}
      />

      {/* Pre notes (only before close) */}
      {!isClosed && (
        <TextArea
          label="Pre-session note"
          value={block.notes_pre}
          onBlur={(v) => onCommit({ notes_pre: v })}
          placeholder="What to watch for with this student today"
          rows={2}
        />
      )}

      {/* Close evaluation — only in progress or closed */}
      {(block.notes_pre || isClosed) && (
        <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
              Status at close
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { v: 'achieved', label: '✓', color: '#047857', bg: '#D1FAE5' },
                  { v: 'partial', label: '~', color: '#92400E', bg: '#FEF3C7' },
                  { v: 'not_yet', label: '✗', color: '#991B1B', bg: '#FEE2E2' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => onCommit({ status: opt.v })}
                  className="py-1 rounded text-xs font-bold transition-all"
                  style={
                    block.status === opt.v
                      ? { background: opt.bg, color: opt.color, boxShadow: 'inset 0 0 0 2px ' + opt.color }
                      : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <TextArea
            label="Close note (visible to student)"
            value={block.notes_post}
            onBlur={(v) => onCommit({ notes_post: v })}
            placeholder="What they did well · what to work on next"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
