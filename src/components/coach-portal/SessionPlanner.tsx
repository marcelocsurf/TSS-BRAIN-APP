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
// SessionPlanner — coach's session-planning UI. Two phases driven by
// service_plans.completion_state:
//
//   planned     → PLANNING MODE: editable form (venue, warm-up, mental
//                 hack, per-student sequence/drills/objective).
//   in_progress → RUN + EVALUATE MODE: read-only recap of the plan, then
//                 per-student evaluation cards (status + close note
//                 against the objective that was set).
//   closed      → read-only summary with every student's result.
//
// All writes autosave on blur.
// ────────────────────────────────────────────────────────────────────

interface SessionPlannerProps {
  data: ServicePlanData;
  token: string;
  onBack: () => void;
  // M45 — when the coach taps a different day in the day picker, the
  // parent re-fetches getServicePlan with that day_number and passes
  // fresh data back via the data prop.
  onSwitchDay?: (dayNumber: number) => void;
}

export function SessionPlanner({ data, token, onBack, onSwitchDay }: SessionPlannerProps) {
  const [plan, setPlan] = useState(data.plan);
  const [students, setStudents] = useState(data.students);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const state = plan.completion_state; // 'planned' | 'in_progress' | 'closed'
  const isPlanning = state === 'planned';
  const isClosed = state === 'closed';

  const flash = (msg: string) => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 1500);
  };

  // ── label helpers ──
  const drillTitle = (id: string | null) =>
    id ? data.availableDrills.find((d) => d.id === id)?.title ?? id : null;
  const stpLabel = (id: string | null) => {
    if (!id) return null;
    const stp = data.stpCatalog.find((s) => s.id === id);
    return stp ? `${stp.id} — ${stp.title}` : id;
  };
  const warmUpLabel = plan.warm_up_drill_id
    ? drillTitle(plan.warm_up_drill_id)
    : plan.warm_up_custom;
  const mentalLabel =
    MENTAL_HACK_QUICK.find((o) => o.id === plan.mental_hack)?.label ??
    plan.mental_hack;

  // ── commit helpers (state + persist delta, no stale reads) ──
  const commitPlanPatch = (patch: Partial<ServicePlanData['plan']>) => {
    setPlan((p) => ({ ...p, ...patch }));
    startTransition(async () => {
      try {
        await saveServicePlanHeader(token, data.selectedDay.camp_session_id, patch as any);
        flash('✓ Saved');
      } catch (e: any) {
        alert(e.message || 'Save failed');
      }
    });
  };
  const commitPlanField = (field: keyof ServicePlanData['plan'], value: any) =>
    commitPlanPatch({ [field]: value } as any);

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
        await saveServicePlanBlock(token, data.selectedDay.camp_session_id, studentId, patch as any);
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
        await startServicePlan(token, data.selectedDay.camp_session_id);
        setPlan((p) => ({
          ...p,
          completion_state: 'in_progress',
          started_at: new Date().toISOString(),
        }));
        flash('🌊 Session started');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e: any) {
        alert(e.message || 'Failed to start');
      }
    });
  };

  // The explicit FINALIZE gate — this is the real close of the cycle.
  // Only here does the data sync to each student's profile + the survey
  // request go out. Deliberate + confirmed + irreversible.
  const finalize = () => {
    const unevaluated = students.filter((s) => !s.block.status);
    if (unevaluated.length > 0) {
      if (
        !confirm(
          `${unevaluated.length} student(s) still have no status. Finalize anyway?`
        )
      ) {
        return;
      }
    }
    if (
      !confirm(
        'Finalize this session?\n\n' +
          '• Each student gets their results in their profile + portal\n' +
          '• Each student receives a coach-rating survey\n' +
          '• The session locks — no more edits\n\n' +
          'Continue?'
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await closeServicePlan(token, data.selectedDay.camp_session_id);
        setPlan((p) => ({
          ...p,
          completion_state: 'closed',
          closed_at: new Date().toISOString(),
        }));
        flash('🏁 Session finalized');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e: any) {
        alert(e.message || 'Failed to finalize');
      }
    });
  };

  const warmupOptions = data.availableDrills.filter(
    (d) => d.block_name?.toLowerCase().includes('warm') || d.step_id === 'STP-002'
  );

  const evaluatedCount = students.filter((s) => s.block.status).length;

  // When the plan is in_progress the coach can re-open the editable plan
  // view (the plan stays modifiable until finalize).
  const [editingPlan, setEditingPlan] = useState(false);
  const showPlanForm = isPlanning || (state === 'in_progress' && editingPlan);

  return (
    <div className="space-y-4 pb-32">
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
      <div className="rounded-2xl p-4 text-white" style={{ background: BRAND.colors.navy }}>
        <p className="text-[10px] font-mono uppercase tracking-wider opacity-80">
          {data.camp.service_kind?.replace(/_/g, ' ') || 'Service'} ·{' '}
          {state === 'planned' ? 'planning' : state === 'in_progress' ? 'in progress' : 'closed'}
        </p>
        <h2 className="text-base font-bold mt-0.5">{data.camp.camp_name}</h2>
        <p className="text-[11px] opacity-80 mt-0.5">
          {new Date(data.selectedDay.session_date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
          {data.camp.scheduled_time ? ` · ${data.camp.scheduled_time}` : ''}
          {data.camp.template_name ? ` · ${data.camp.template_name}` : ''}
        </p>
        <p className="text-[11px] mt-1" style={{ color: BRAND.colors.gold }}>
          {students.length} student{students.length === 1 ? '' : 's'}
          {!isPlanning && ` · ${evaluatedCount}/${students.length} evaluated`}
        </p>
      </div>

      {/* M45 — Day picker. Only shown when the camp has more than one day. */}
      {data.daySummaries.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {data.daySummaries.map((d) => {
            const isActive = d.day_number === data.selectedDay.day_number;
            const stateColor =
              d.completion_state === 'closed'
                ? '#10B981'
                : d.completion_state === 'in_progress'
                ? '#F59E0B'
                : '#9CA3AF';
            return (
              <button
                key={d.camp_session_id}
                type="button"
                onClick={() => onSwitchDay?.(d.day_number)}
                disabled={isActive}
                className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                  isActive
                    ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className="block">Day {d.day_number}</span>
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full ml-1"
                  style={{ background: stateColor }}
                />
                <span className="block text-[9px] opacity-70 mt-0.5">
                  {new Date(d.session_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ════════════ PLANNING MODE ════════════ */}
      {showPlanForm && (
        <>
          {/* 0. TEMPLATE PLAN — the recipe the coordinator pre-built.
              Coach sees it as a reference and can apply each block to all
              students in one tap so they don't replan from scratch. */}
          {data.templatePlan.length > 0 && (
            <TemplatePlanPanel
              templatePlan={data.templatePlan}
              availableDrills={data.availableDrills}
              stpCatalog={data.stpCatalog}
              onApplyToAll={(block) => {
                students.forEach((s) => {
                  commitStudentBlock(s.student_id, {
                    step_id: block.step_id,
                    land_drill_id: block.drill_id,
                    land_drill_custom: block.drill_id ? null : block.drill_custom,
                    water_drill_id: block.mission_id,
                    water_drill_custom: block.mission_id ? null : block.mission_custom,
                  });
                });
              }}
            />
          )}

          {/* 1. VENUE ANALYSIS */}
          <Section emoji="🌊" title="1. Venue Analysis" subtitle="Read today's conditions before going in">
            <div className="space-y-2">
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

              <div className="grid grid-cols-2 gap-2">
                <SmallField label="Wave size" value={plan.venue_wave_size} onBlur={(v) => commitPlanField('venue_wave_size', v)} placeholder="knee · waist · head" />
                <SmallField label="Wind" value={plan.venue_wind} onBlur={(v) => commitPlanField('venue_wind', v)} placeholder="offshore 10 kts" />
                <SmallField label="Tide" value={plan.venue_tide} onBlur={(v) => commitPlanField('venue_tide', v)} placeholder="rising mid" />
                <SmallField label="Hazards" value={plan.venue_hazards} onBlur={(v) => commitPlanField('venue_hazards', v)} placeholder="rocks · current" />
              </div>

              <TextArea
                label="Full read"
                value={plan.venue_analysis}
                onBlur={(v) => commitPlanField('venue_analysis', v)}
                placeholder="What you see — currents, impact zone, where students should enter…"
                rows={3}
              />
            </div>
          </Section>

          {/* 2. GROUP WARM-UP */}
          <Section emoji="🔥" title="2. Group Warm-Up" subtitle="Pick from your tools or write your own">
            <PickerOrCustom
              options={warmupOptions.map((d) => ({
                id: d.id,
                label: d.title,
                sublabel: d.key_words?.join(' · ') ?? '',
              }))}
              selectedId={plan.warm_up_drill_id}
              customValue={plan.warm_up_custom}
              onPick={(id) => commitPlanPatch({ warm_up_drill_id: id, warm_up_custom: null })}
              onCustom={(v) => commitPlanPatch({ warm_up_custom: v, warm_up_drill_id: null })}
              customPlaceholder="e.g. Joint mobility + 10 sand pop-ups"
            />
          </Section>

          {/* 3. MENTAL HACK */}
          <Section emoji="🧠" title="3. Mental Hack" subtitle="Get them in the zone">
            <div className="grid grid-cols-3 gap-2">
              {MENTAL_HACK_QUICK.map((opt) => {
                const isSelected = plan.mental_hack === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
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
                plan.mental_hack && !MENTAL_HACK_QUICK.find((o) => o.id === plan.mental_hack)
                  ? plan.mental_hack
                  : ''
              }
              onBlur={(v) => commitPlanField('mental_hack', v || null)}
              placeholder="Visualization · breath ladder · etc."
            />
          </Section>

          {/* 4. PER-STUDENT PLANNING */}
          <Section
            emoji="👥"
            title="4. Per Student"
            subtitle="Plan a different mission for each — sequence, drills, objective"
          >
            <div className="space-y-3">
              {students.map((s) => (
                <StudentPlanCard
                  key={s.student_id}
                  student={s}
                  stpCatalog={data.stpCatalog}
                  availableDrills={data.availableDrills}
                  onCommit={(patch) => commitStudentBlock(s.student_id, patch)}
                />
              ))}
            </div>
          </Section>

          {/* 5. GENERAL NOTES */}
          <Section emoji="📝" title="5. General notes (private)">
            <TextArea
              label=""
              value={plan.notes_general}
              onBlur={(v) => commitPlanField('notes_general', v)}
              placeholder="Anything else you want to remember about the session…"
              rows={3}
            />
          </Section>
        </>
      )}

      {/* ════════════ RUN + EVALUATE MODE ════════════ */}
      {!showPlanForm && (
        <>
          <GeneralPlanSummary
            plan={plan}
            warmUpLabel={warmUpLabel}
            mentalLabel={mentalLabel}
          />

          <Section
            emoji="🎯"
            title={isClosed ? 'Student results' : 'Evaluate each student'}
            subtitle={
              isClosed
                ? 'How each student did against their objective.'
                : 'Mark each student against the objective you set for them.'
            }
          >
            <div className="space-y-3">
              {students.map((s) => (
                <StudentEvalCard
                  key={s.student_id}
                  student={s}
                  isClosed={isClosed}
                  stpLabel={stpLabel}
                  drillTitle={drillTitle}
                  onCommit={(patch) => commitStudentBlock(s.student_id, patch)}
                />
              ))}
            </div>
          </Section>
        </>
      )}

      {/* Sticky footer */}
      <div
        className="fixed bottom-14 left-0 right-0 px-4 py-2 z-40 border-t border-gray-200"
        style={{ background: 'white' }}
      >
        <div className="max-w-lg mx-auto flex gap-2">
          {/* PLANNING → close the plan (still editable after) */}
          {state === 'planned' && (
            <button
              type="button"
              onClick={start}
              disabled={pending}
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl"
              style={{ background: BRAND.colors.navy }}
            >
              🔒 Close the plan → evaluate
            </button>
          )}

          {/* IN PROGRESS + editing the plan → done editing */}
          {state === 'in_progress' && editingPlan && (
            <button
              type="button"
              onClick={() => {
                setEditingPlan(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl"
              style={{ background: BRAND.colors.navy }}
            >
              ✓ Done editing → back to evaluation
            </button>
          )}

          {/* IN PROGRESS + evaluating → edit plan OR finalize */}
          {state === 'in_progress' && !editingPlan && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={pending}
                className="py-2.5 px-4 text-sm font-semibold rounded-xl border"
                style={{ borderColor: BRAND.colors.navy, color: BRAND.colors.navy }}
              >
                ✏️ Edit plan
              </button>
              <button
                type="button"
                onClick={finalize}
                disabled={pending}
                className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl"
                style={{ background: '#10B981' }}
              >
                🏁 Finalize ({evaluatedCount}/{students.length})
              </button>
            </>
          )}

          {state === 'closed' && (
            <div className="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-700">
              🏁 Finalized{plan.closed_at ? ` · ${new Date(plan.closed_at).toLocaleDateString()}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── General plan summary (read-only recap) ───────────────────────

function GeneralPlanSummary({
  plan,
  warmUpLabel,
  mentalLabel,
}: {
  plan: ServicePlanData['plan'];
  warmUpLabel: string | null | undefined;
  mentalLabel: string | null | undefined;
}) {
  const goLabel =
    plan.venue_go_no_go === 'go'
      ? '✓ Go'
      : plan.venue_go_no_go === 'modified'
      ? '~ Modified'
      : plan.venue_go_no_go === 'no_go'
      ? '✗ No-Go'
      : '—';
  const conditions = [
    plan.venue_wave_size && `🌊 ${plan.venue_wave_size}`,
    plan.venue_wind && `💨 ${plan.venue_wind}`,
    plan.venue_tide && `🌙 ${plan.venue_tide}`,
    plan.venue_hazards && `⚠ ${plan.venue_hazards}`,
  ].filter(Boolean);

  return (
    <Section emoji="📋" title="Session Plan" subtitle="The plan you set for this class">
      <div className="space-y-2.5">
        <SummaryRow label="Venue call" value={goLabel} />
        {conditions.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Conditions
            </p>
            <div className="flex flex-wrap gap-1">
              {conditions.map((c, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {plan.venue_analysis && (
          <SummaryRow label="Venue read" value={plan.venue_analysis} />
        )}
        <SummaryRow label="🔥 Warm-up" value={warmUpLabel || '—'} />
        <SummaryRow label="🧠 Mental hack" value={mentalLabel || '—'} />
        {plan.notes_general && (
          <SummaryRow label="📝 Notes" value={plan.notes_general} />
        )}
      </div>
    </Section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{value}</p>
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
}: {
  options: Array<{ id: string; label: string; sublabel?: string }>;
  selectedId: string | null;
  customValue: string | null;
  onPick: (id: string | null) => void;
  onCustom: (v: string) => void;
  customPlaceholder?: string;
}) {
  return (
    <div className="space-y-2">
      {options.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
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
      />
    </div>
  );
}

// ─── Student profile / bitácora panel (collapsible) ──────────────
//
// Shown at the top of each student card so the coach can review the
// student's level, goals, fears, injuries, medical info and last
// session BEFORE planning their mission.

// Small avatar — photo if available, else initials circle.
function StudentAvatar({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
      />
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
      style={{ background: BRAND.colors.navy }}
    >
      {initials || '🏄'}
    </div>
  );
}

function StudentProfilePanel({ student }: { student: ServicePlanStudent }) {
  const { profile, belt_level: beltLevel, recentSessions, stepRatings } = student;
  const [open, setOpen] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  const hasMedical = !!(
    profile.injuries ||
    profile.allergies ||
    profile.medical_notes ||
    profile.risk_notes
  );

  const quickFacts = [
    beltLevel && `🥋 ${beltLevel.replace(/_/g, ' ')}`,
    profile.ocean_level && `🌊 ${profile.ocean_level}`,
    profile.age && `${profile.age} yrs`,
    profile.weight && `${profile.weight} kg`,
    profile.height && `${profile.height} cm`,
    (profile.goofy_or_regular || profile.stance) &&
      `${profile.goofy_or_regular || profile.stance}`,
    profile.surf_experience_years != null &&
      `${profile.surf_experience_years} yr exp`,
    profile.surf_frequency && `surfs: ${profile.surf_frequency}`,
    profile.swim_level && `swim: ${profile.swim_level}`,
    profile.board_type && `🛹 ${profile.board_type}`,
    profile.favorite_wave_size && `fav wave: ${profile.favorite_wave_size}`,
    profile.ocean_quiz_score != null && `ocean quiz: ${profile.ocean_quiz_score}`,
    profile.learning_profile_primary &&
      `learns: ${profile.learning_profile_primary}`,
  ].filter(Boolean) as string[];

  // Self-assessment summary — ★ the student gave themselves on STPs,
  // plus the official coach rating average (the gap is the signal).
  const hasRatings = stepRatings.selfRatedCount > 0 || stepRatings.coachRatedCount > 0;

  const goals = [
    profile.primary_goal && ['Primary', profile.primary_goal],
    profile.personal_goal && ['Personal', profile.personal_goal],
    profile.goal_short_term && ['Short-term', profile.goal_short_term],
    profile.goal_mid_term && ['Mid-term', profile.goal_mid_term],
    profile.goal_long_term && ['Long-term', profile.goal_long_term],
  ].filter(Boolean) as [string, string][];

  // Sequence position — where the student is in the 25 STPs
  const seqPos =
    profile.current_sequence_number != null || profile.current_step_order != null
      ? [
          profile.current_sequence_number != null &&
            `Sequence ${profile.current_sequence_number}`,
          profile.current_step_order != null &&
            `Step ${profile.current_step_order}`,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  const hasEmergency = !!(
    profile.emergency_contact_name || profile.emergency_contact_phone
  );

  const visibleSessions = showAllDays ? recentSessions : recentSessions.slice(0, 3);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-2.5 py-2 text-left"
      >
        <span className="text-[11px] font-semibold text-[var(--tss-navy)]">
          📋 Profile & bitácora
          {hasMedical && (
            <span className="ml-1.5 text-[10px] text-red-600">⚠ medical</span>
          )}
        </span>
        <span className={`text-gray-400 text-xs transition ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="px-2.5 pb-2.5 space-y-2.5 border-t border-gray-100 pt-2">
          {/* Quick facts */}
          {quickFacts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {quickFacts.map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Sequence position */}
          {seqPos && (
            <ProfileLine label="📍 Position" value={seqPos} />
          )}

          {/* Self-assessment vs coach rating */}
          {hasRatings && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
                ⭐ Self-assessment
              </p>
              {stepRatings.selfRatedCount > 0 && (
                <ProfileLine
                  label="Self-rated"
                  value={`${stepRatings.selfRatedCount} STPs · avg ★${stepRatings.avgSelfRating}`}
                />
              )}
              {stepRatings.coachRatedCount > 0 && (
                <ProfileLine
                  label="Coach-rated"
                  value={`${stepRatings.coachRatedCount} STPs · avg ★${stepRatings.avgCoachRating}`}
                />
              )}
              {stepRatings.selfRatedCount > 0 &&
                stepRatings.coachRatedCount > 0 &&
                stepRatings.avgSelfRating != null &&
                stepRatings.avgCoachRating != null &&
                stepRatings.avgSelfRating - stepRatings.avgCoachRating >= 1 && (
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    ⚠ Self-rates noticeably higher than coach — may be over-estimating.
                  </p>
                )}
            </div>
          )}

          {/* Medical & safety — prominent when present */}
          {(hasMedical || hasEmergency) && (
            <div className="rounded-md bg-red-50 border border-red-200 p-2 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-red-700">
                ⚠ Safety
              </p>
              {profile.injuries && <ProfileLine label="Injuries" value={profile.injuries} danger />}
              {profile.allergies && <ProfileLine label="Allergies" value={profile.allergies} danger />}
              {profile.medical_notes && <ProfileLine label="Medical" value={profile.medical_notes} danger />}
              {profile.risk_notes && <ProfileLine label="Risk" value={profile.risk_notes} danger />}
              {hasEmergency && (
                <ProfileLine
                  label="Emergency"
                  value={[profile.emergency_contact_name, profile.emergency_contact_phone]
                    .filter(Boolean)
                    .join(' · ')}
                  danger
                />
              )}
            </div>
          )}

          {/* Recent training history — coach + self, fold-down for more days */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Recent training
            </p>
            {recentSessions.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">No sessions logged yet.</p>
            ) : (
              <>
                <div className="space-y-1">
                  {visibleSessions.map((rs, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="shrink-0">{rs.type === 'coach' ? '🏄' : '🧍'}</span>
                      <span className="shrink-0 text-gray-400 w-14">
                        {rs.date
                          ? new Date(rs.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                      <span className="flex-1 text-gray-700">
                        {rs.label}
                        <span className="text-gray-400">
                          {' '}· {rs.type === 'coach' ? 'with coach' : 'self'}
                          {rs.status ? ` · ${rs.status}` : ''}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                {recentSessions.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllDays((v) => !v)}
                    className="text-[10px] text-[var(--tss-navy)] hover:underline mt-1"
                  >
                    {showAllDays
                      ? '▴ Show less'
                      : `▾ Show ${recentSessions.length - 3} more`}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Goals */}
          {goals.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
                🎯 Goals
              </p>
              {goals.map(([label, value], i) => (
                <ProfileLine key={i} label={label} value={value} />
              ))}
            </div>
          )}

          {/* Watch out */}
          {(profile.fears_phobias || profile.biggest_barrier) && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
                ⚡ Watch out
              </p>
              {profile.fears_phobias && <ProfileLine label="Fears" value={profile.fears_phobias} />}
              {profile.biggest_barrier && <ProfileLine label="Barrier" value={profile.biggest_barrier} />}
            </div>
          )}

          {/* Coach notes */}
          {(profile.current_focus_area ||
            profile.next_recommended_focus ||
            profile.coach_notes_general) && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
                Coach notes
              </p>
              {profile.current_focus_area && <ProfileLine label="Focus now" value={profile.current_focus_area} />}
              {profile.next_recommended_focus && <ProfileLine label="Next" value={profile.next_recommended_focus} />}
              {profile.coach_notes_general && <ProfileLine label="General" value={profile.coach_notes_general} />}
            </div>
          )}

          {quickFacts.length === 0 && !hasMedical && goals.length === 0 && (
            <p className="text-[11px] text-gray-400 italic">
              No profile data filled in for this student yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileLine({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex gap-2 text-[11px]">
      <span
        className={`shrink-0 w-20 ${danger ? 'text-red-500' : 'text-gray-400'}`}
      >
        {label}
      </span>
      <span className={`flex-1 ${danger ? 'text-red-800' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Per-student PLANNING card ────────────────────────────────────

function StudentPlanCard({
  student,
  stpCatalog,
  availableDrills,
  onCommit,
}: {
  student: ServicePlanStudent;
  stpCatalog: ServicePlanData['stpCatalog'];
  availableDrills: ServicePlanData['availableDrills'];
  onCommit: (patch: Partial<ServicePlanStudent['block']>) => void;
}) {
  const { block } = student;
  const [showLandPicker, setShowLandPicker] = useState(false);
  const [showWaterPicker, setShowWaterPicker] = useState(false);

  const stepDrills = availableDrills.filter(
    (d) => d.type === 'drill' && d.step_id === block.step_id
  );
  const stepMissions = availableDrills.filter(
    (d) => d.type === 'mission' && d.step_id === block.step_id
  );
  const landLabel = block.land_drill_id
    ? availableDrills.find((d) => d.id === block.land_drill_id)?.title
    : null;
  const waterLabel = block.water_drill_id
    ? availableDrills.find((d) => d.id === block.water_drill_id)?.title
    : null;

  return (
    <div className="bg-gray-50/60 rounded-xl border border-gray-200 p-3 space-y-2">
      <div className="flex items-center gap-2 min-w-0">
        <StudentAvatar url={student.photo_url} name={student.display_name} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--tss-navy)] truncate">
            {student.display_name}
          </p>
          <p className="text-[10px] text-gray-500 capitalize">
            {student.belt_level?.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Profile / bitácora — review before planning */}
      <StudentProfilePanel student={student} />

      {/* Sequence focus */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          Sequence focus
        </label>
        <select
          value={block.step_id ?? ''}
          onChange={(e) => onCommit({ step_id: e.target.value || null })}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
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
            onClick={() => setShowLandPicker(true)}
            className="w-full text-left px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50"
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

      {/* Water mission */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          In-water mission
        </label>
        {!showWaterPicker ? (
          <button
            type="button"
            onClick={() => setShowWaterPicker(true)}
            className="w-full text-left px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50"
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
      />

      {/* Pre-session note */}
      <TextArea
        label="Pre-session note"
        value={block.notes_pre}
        onBlur={(v) => onCommit({ notes_pre: v })}
        placeholder="What to watch for with this student today"
        rows={2}
      />
    </div>
  );
}

// ─── Per-student EVALUATION card ──────────────────────────────────

function StudentEvalCard({
  student,
  isClosed,
  stpLabel,
  drillTitle,
  onCommit,
}: {
  student: ServicePlanStudent;
  isClosed: boolean;
  stpLabel: (id: string | null) => string | null;
  drillTitle: (id: string | null) => string | null;
  onCommit: (patch: Partial<ServicePlanStudent['block']>) => void;
}) {
  const { block } = student;
  const land = block.land_drill_id ? drillTitle(block.land_drill_id) : block.land_drill_custom;
  const water = block.water_drill_id ? drillTitle(block.water_drill_id) : block.water_drill_custom;

  return (
    <div className="bg-gray-50/60 rounded-xl border border-gray-200 p-3 space-y-2.5">
      {/* Student header + status pill */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <StudentAvatar url={student.photo_url} name={student.display_name} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--tss-navy)] truncate">
              {student.display_name}
            </p>
            <p className="text-[10px] text-gray-500 capitalize">
              {student.belt_level?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        {block.status && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
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

      {/* Profile / bitácora — context while evaluating */}
      <StudentProfilePanel student={student} />

      {/* The plan that was set — read-only recap */}
      <div className="bg-white rounded-lg border border-gray-100 p-2.5 space-y-1.5">
        <EvalRow label="Sequence" value={stpLabel(block.step_id) || '—'} />
        <EvalRow label="🏋️ Land drill" value={land || '—'} />
        <EvalRow label="🌊 Water mission" value={water || '—'} />
        <EvalRow label="🎯 Objective" value={block.objective_text || '—'} highlight />
        {block.notes_pre && <EvalRow label="Pre-note" value={block.notes_pre} />}
      </div>

      {/* Evaluation controls */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
          Did they hit the objective?
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { v: 'achieved', label: '✓ Achieved', color: '#047857', bg: '#D1FAE5' },
              { v: 'partial', label: '~ Partial', color: '#92400E', bg: '#FEF3C7' },
              { v: 'not_yet', label: '✗ Not yet', color: '#991B1B', bg: '#FEE2E2' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              disabled={isClosed}
              onClick={() => onCommit({ status: opt.v })}
              className="py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-70"
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
        disabled={isClosed}
      />
    </div>
  );
}

// ─── Template Plan reference panel (M44) ─────────────────────────
//
// Shows the day-by-day plan the coordinator built in the template, so
// the coach can see the canonical recipe (STP + drill + mission +
// mental hack) and apply it to all students at once with one tap.
// Per-student overrides still happen in the per-student cards below.

interface TemplatePlanBlock {
  block_order: number;
  step_id: string | null;
  drill_id: string | null;
  drill_custom: string | null;
  mission_id: string | null;
  mission_custom: string | null;
  mental_hack: string | null;
  warm_up: string | null;
  evaluation_focus: string | null;
  mission_time: string | null;
}

function TemplatePlanPanel({
  templatePlan,
  availableDrills,
  stpCatalog,
  onApplyToAll,
}: {
  templatePlan: ServicePlanData['templatePlan'];
  availableDrills: ServicePlanData['availableDrills'];
  stpCatalog: ServicePlanData['stpCatalog'];
  onApplyToAll: (block: TemplatePlanBlock) => void;
}) {
  const [openDay, setOpenDay] = useState<number | null>(
    templatePlan[0]?.day_number ?? null,
  );

  const drillName = (id: string | null) =>
    id ? availableDrills.find((d) => d.id === id)?.title ?? id : null;
  const stpName = (id: string | null) => {
    if (!id) return null;
    const stp = stpCatalog.find((s) => s.id === id);
    return stp ? `${stp.id} — ${stp.title}` : id;
  };

  return (
    <Section
      emoji="🧭"
      title="Template plan"
      subtitle="The recipe your coordinator pre-built. Apply a block to all students with one tap, then tweak per student."
    >
      <div className="space-y-2">
        {templatePlan.map((day) => {
          const isOpen = openDay === day.day_number;
          return (
            <div key={day.day_number} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenDay(isOpen ? null : day.day_number)}
                className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[var(--tss-navy)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {day.day_number}
                  </span>
                  <span className="text-xs font-semibold text-[var(--tss-navy)] truncate">
                    Day {day.day_number}
                  </span>
                  {day.day_goal && (
                    <span className="text-[11px] text-gray-500 truncate">— {day.day_goal}</span>
                  )}
                </div>
                <span className={`text-gray-400 text-xs transition ${isOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="p-2 space-y-2">
                  {day.blocks.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic px-1">No blocks defined.</p>
                  ) : (
                    day.blocks.map((b) => {
                      const stpLabel = stpName(b.step_id);
                      const drillLabel = drillName(b.drill_id) || b.drill_custom;
                      const missionLabel = drillName(b.mission_id) || b.mission_custom;
                      const hasContent = stpLabel || drillLabel || missionLabel;
                      return (
                        <div
                          key={b.block_order}
                          className="rounded-lg border border-gray-200 bg-white p-2 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                              Block {b.block_order}
                            </span>
                            {hasContent && (
                              <button
                                type="button"
                                onClick={() => onApplyToAll(b)}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--tss-navy)] text-white font-semibold hover:brightness-110"
                              >
                                Apply to all students
                              </button>
                            )}
                          </div>
                          {stpLabel && <TplRow label="Step" value={stpLabel} />}
                          {drillLabel && <TplRow label="Drill" value={drillLabel} />}
                          {missionLabel && <TplRow label="Mission" value={missionLabel} />}
                          {b.warm_up && <TplRow label="Warm-up" value={b.warm_up} />}
                          {b.mental_hack && <TplRow label="Mental hack" value={b.mental_hack} />}
                          {b.evaluation_focus && (
                            <TplRow label="Eval focus" value={b.evaluation_focus} />
                          )}
                          {b.mission_time && (
                            <TplRow label="Time" value={`${b.mission_time} min`} />
                          )}
                          {!hasContent && (
                            <p className="text-[11px] text-gray-400 italic">
                              Empty block — nothing pre-defined.
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function TplRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[11px]">
      <span className="text-gray-400 shrink-0 w-20">{label}</span>
      <span className="text-gray-700 flex-1">{value}</span>
    </div>
  );
}

function EvalRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 shrink-0 w-24 pt-0.5">
        {label}
      </span>
      <span
        className={`flex-1 whitespace-pre-wrap ${
          highlight ? 'font-semibold text-[var(--tss-navy)]' : 'text-gray-700'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
