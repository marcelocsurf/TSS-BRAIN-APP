'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  BRAND,
  WAVE_SIZE_OPTIONS,
  WIND_OPTIONS,
  TIDE_OPTIONS,
  HAZARD_OPTIONS,
  CROWD_LEVEL_OPTIONS,
  WATER_TEMP_OPTIONS,
  SKY_OPTIONS,
  INCIDENT_TYPE_OPTIONS,
  BOARD_TYPE_OPTIONS,
  BOARD_SIZE_FEET_OPTIONS,
  BOARD_SIZE_INCHES_OPTIONS,
} from '@/lib/constants/brand';
import {
  saveServicePlanHeader,
  saveServicePlanBlock,
  deleteServicePlanBlock,
  applyTemplateDayToStudents,
  startServicePlan,
  closeServicePlan,
  saveOfficialStepRatingFromPortal,
  type ServicePlanData,
  type ServicePlanStudent,
  type ServicePlanBlock,
} from '@/lib/actions/service-planner';
import { StarRating } from '@/components/sequence/StarRating';
import {
  Waves,
  Flame,
  Brain,
  Users,
  NotebookPen,
  Target,
  ClipboardList,
  Lock,
  Check,
  Pencil,
  Flag,
  Wind,
  Moon,
  AlertTriangle,
  ChevronDown,
  MapPin,
  Star,
  User,
  Zap,
  Dumbbell,
  Key,
} from 'lucide-react';
import { FinalCampEvaluation } from '@/components/coach-portal/FinalCampEvaluation';
import { DrillDetailModal } from '@/components/coach-portal/DrillDetailModal';

// Mental hack quick-picks (curated subset of canonical options). Coach
// can also write a custom one. Keys are stored as service_plans.mental_hack.
const MENTAL_HACK_QUICK: { id: string; label: string; Icon: React.ComponentType<any> }[] = [
  { id: 'breathe_reset',     label: 'Breathe + reset', Icon: Wind },
  { id: 'key_words',         label: 'Key words',       Icon: Key },
  { id: 'visualize_success', label: 'Visualize',       Icon: Target },
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

  // M45 — When the coach rates an STP inline at session close, persist
  // to student_step_ratings.coach_rating so it shows up cyan in the
  // student's sequence + portal immediately.
  const rateStepInline = (studentId: string, stepId: string, rating: number) => {
    // Optimistic local update so the cyan stars stay coloured immediately
    // (was previously always rendering null and looked unresponsive).
    setCoachRatings((prev) => {
      const next = { ...prev };
      const stepMap = { ...(next[studentId] ?? {}) };
      stepMap[stepId] = rating;
      next[studentId] = stepMap;
      return next;
    });
    startTransition(async () => {
      try {
        await saveOfficialStepRatingFromPortal(
          token,
          data.selectedDay.camp_session_id,
          studentId,
          stepId,
          rating,
        );
        // Update local stepRatings counts so the UI hint refreshes (only
        // bump on first rating of this step — re-rating shouldn't inflate).
        setStudents((prev) =>
          prev.map((s) => {
            if (s.student_id !== studentId) return s;
            const wasUnrated = !data.coachRatingByStudentStep[studentId]?.[stepId];
            return wasUnrated
              ? {
                  ...s,
                  stepRatings: {
                    ...s.stepRatings,
                    coachRatedCount: s.stepRatings.coachRatedCount + 1,
                  },
                }
              : s;
          }),
        );
        flash('★ Step rated');
      } catch (e: any) {
        alert(e.message || 'Failed to save rating');
      }
    });
  };

  const commitStudentBlock = (
    studentId: string,
    orderIndex: number,
    patch: Partial<ServicePlanBlock>,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.student_id !== studentId) return s;
        const existing = s.blocks.find((b) => b.order_index === orderIndex);
        let nextBlocks: ServicePlanBlock[];
        if (existing) {
          nextBlocks = s.blocks.map((b) =>
            b.order_index === orderIndex ? { ...b, ...patch } : b,
          );
        } else {
          nextBlocks = [
            ...s.blocks,
            {
              id: null,
              order_index: orderIndex,
              step_id: null,
              land_drill_id: null,
              land_drill_custom: null,
              water_drill_id: null,
              water_drill_custom: null,
              objective_text: null,
              notes_pre: null,
              status: null,
              notes_post: null,
              board_type: null,
              board_size_feet: null,
              board_size_inches: null,
              board_id: null,
              focus_level: null,
              flow_channel: null,
              ...patch,
            },
          ].sort((a, b) => a.order_index - b.order_index);
        }
        return { ...s, blocks: nextBlocks };
      }),
    );
    startTransition(async () => {
      try {
        await saveServicePlanBlock(
          token,
          data.selectedDay.camp_session_id,
          studentId,
          orderIndex,
          patch as any,
        );
        const s = students.find((x) => x.student_id === studentId);
        flash(`✓ ${(s?.display_name ?? 'Saved').split(' ')[0]}`);
      } catch (e: any) {
        alert(e.message || 'Save failed');
      }
    });
  };

  // M45 — Add a fresh empty block at the next order_index for one student.
  const addStudentBlock = (studentId: string) => {
    const student = students.find((s) => s.student_id === studentId);
    if (!student) return;
    const nextIdx = student.blocks.length
      ? Math.max(...student.blocks.map((b) => b.order_index)) + 1
      : 0;
    commitStudentBlock(studentId, nextIdx, {});
  };

  // M45 — Remove a block (must keep at least one).
  const removeStudentBlock = (studentId: string, orderIndex: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId
          ? { ...s, blocks: s.blocks.filter((b) => b.order_index !== orderIndex) }
          : s,
      ),
    );
    startTransition(async () => {
      try {
        await deleteServicePlanBlock(
          token,
          data.selectedDay.camp_session_id,
          studentId,
          orderIndex,
        );
        flash('✓ Block removed');
      } catch (e: any) {
        alert(e.message || 'Delete failed');
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
    const unevaluated = students.filter(
      (s) => s.blocks.length === 0 || s.blocks.some((b) => !b.status),
    );
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
        await closeServicePlan(
          token,
          data.selectedDay.camp_session_id,
          incidents
            .filter((i) => i.student_id && i.incident_type && i.incident_description.trim())
            .map((i) => ({
              student_id: i.student_id,
              incident_type: i.incident_type,
              incident_description: i.incident_description.trim(),
              incident_action: i.incident_action.trim() || null,
            })),
        );
        setPlan((p) => ({
          ...p,
          completion_state: 'closed',
          closed_at: new Date().toISOString(),
        }));
        flash('🏁 Day finalized');
        // If this was the last day of the camp, surface the final
        // official evaluation. The coach rates every STP per student
        // before the parent camp_instance flips to 'completed'.
        if (isLastDay) {
          setShowFinalEval(true);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e: any) {
        alert(e.message || 'Failed to finalize');
      }
    });
  };

  const warmupOptions = data.availableDrills.filter(
    (d) => d.block_name?.toLowerCase().includes('warm') || d.step_id === 'STP-002'
  );

  // M45 — a student counts as "evaluated" once every block of theirs
  // has a status set.
  const evaluatedCount = students.filter(
    (s) => s.blocks.length > 0 && s.blocks.every((b) => b.status),
  ).length;

  // When the plan is in_progress the coach can re-open the editable plan
  // view (the plan stays modifiable until finalize).
  const [editingPlan, setEditingPlan] = useState(false);
  const showPlanForm = isPlanning || (state === 'in_progress' && editingPlan);

  // M45 — Final camp evaluation modal. Shown after the coach closes the
  // LAST day of a multi-day camp (or the only day of a 1-day service).
  const lastDayNumber = Math.max(
    ...data.daySummaries.map((d) => d.day_number),
    data.selectedDay.day_number,
  );
  const isLastDay = data.selectedDay.day_number === lastDayNumber;
  const [showFinalEval, setShowFinalEval] = useState(false);

  // M47 — Drill / mission detail modal. Tapping a drill name anywhere in
  // the planner opens this with the full canonical content (description,
  // key words, success criteria) so the coach can refresh how to teach it.
  const [drillDetailId, setDrillDetailId] = useState<string | null>(null);
  const drillDetail = drillDetailId
    ? data.availableDrills.find((d) => d.id === drillDetailId) ?? null
    : null;

  // M50 — Local mirror of the per-(student, step) coach_rating so the
  // cyan stars in the eval card stay coloured after the coach taps them.
  // Initialized from data; updated optimistically when rateStepInline runs.
  const [coachRatings, setCoachRatings] = useState<Record<string, Record<string, number>>>(
    data.coachRatingByStudentStep,
  );

  // M48 — Incident reports filed at close. Optional. If no incidents, the
  // coach just hits finalize and we close without writing anything to the
  // incident_* columns. If yes, each entry maps to one student_session_results
  // row's incident_type / incident_description / incident_action.
  type IncidentDraft = {
    id: string;
    student_id: string;
    incident_type: string;
    incident_description: string;
    incident_action: string;
  };
  const [incidents, setIncidents] = useState<IncidentDraft[]>([]);
  const addIncident = () => {
    setIncidents((prev) => [
      ...prev,
      {
        id: `inc-${Date.now()}-${prev.length}`,
        student_id: students[0]?.student_id ?? '',
        incident_type: 'medical',
        incident_description: '',
        incident_action: '',
      },
    ]);
  };
  const updateIncident = (id: string, patch: Partial<IncidentDraft>) => {
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };
  const removeIncident = (id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4 pb-32">
      {/* M47 — Drill / mission detail popover. */}
      {drillDetail && (
        <DrillDetailModal drill={drillDetail} onClose={() => setDrillDetailId(null)} />
      )}

      {/* M45 — Final official evaluation modal (last day only). */}
      {showFinalEval && (
        <FinalCampEvaluation
          token={token}
          campInstanceId={data.camp.id}
          campName={data.camp.camp_name}
          students={students}
          stpCatalog={data.graduationCatalog}
          initialRatings={data.coachRatingByStudentStep}
          targetBelt={data.camp.target_belt}
          onCancel={() => setShowFinalEval(false)}
          onCompleted={() => {
            setShowFinalEval(false);
            flash('🏁 Camp finalized · official record saved');
            onBack();
          }}
        />
      )}

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
          {/* M45 — Template reference panel for the current day. Shows
              the canonical recipe + lets the coach apply ALL blocks at
              once to every student (replaces existing blocks). Useful
              when a camp was created before its template had content,
              or to reset a day to the template baseline. */}
          {(() => {
            const todayTpl = data.templatePlan.find(
              (d) => d.day_number === data.selectedDay.day_number,
            );
            if (!todayTpl || todayTpl.blocks.length === 0) {
              const allEmpty = students.every((s) => s.blocks.length === 0 || s.blocks.every((b) => !b.step_id && !b.land_drill_id && !b.water_drill_id));
              if (data.templatePlan.length > 0 && allEmpty) {
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-1">
                      Template empty for day {data.selectedDay.day_number}
                    </p>
                    <p className="text-[12px] text-amber-900 leading-snug">
                      Open{' '}
                      <span className="font-mono">/camps/templates</span> as Head
                      Coach to define this day's blocks (STP + drill + mission)
                      so future services arrive pre-planned for every student.
                    </p>
                  </div>
                );
              }
              return null;
            }
            return (
              <Section
                emoji="🧭"
                title={`Template plan · ${todayTpl.blocks.length} block${todayTpl.blocks.length === 1 ? '' : 's'}`}
                subtitle="One tap below applies ALL these blocks to every student. You can then tweak any block per student in the cards below."
              >
                <div className="space-y-2">
                  {todayTpl.blocks.map((b, i) => {
                    const stepTitle = b.step_title || (b.step_id ? data.stpCatalog.find((s) => s.id === b.step_id)?.title : null);
                    const drillTitle = b.drill?.title || b.drill_custom || (b.drill_id ? data.availableDrills.find((d) => d.id === b.drill_id)?.title : null);
                    const missionTitle = b.mission?.title || b.mission_custom || (b.mission_id ? data.availableDrills.find((d) => d.id === b.mission_id)?.title : null);
                    const heading = b.block_type
                      ? String(b.block_type).replace(/_/g, ' ')
                      : b.pilar_part || 'Activity';
                    const edpf = b.explain_md || b.demonstrate_md || b.simulate_md;
                    return (
                      <div key={i} className="rounded-lg border border-gray-200 bg-white p-2 text-[11px] space-y-0.5">
                        <p className="font-mono uppercase tracking-wider text-gray-400">
                          Block {b.block_order}{heading ? ` · ${heading}` : ''}
                        </p>
                        {b.pilar_part && b.pilar_part !== heading && (
                          <p className="text-gray-700">{b.pilar_part}</p>
                        )}
                        {stepTitle && (<p><span className="text-gray-500">Step · </span>{b.step_id} — {stepTitle}</p>)}
                        {missionTitle && (<p><span className="text-gray-500">Mission · </span>{missionTitle}</p>)}
                        {drillTitle && (<p><span className="text-gray-500">Drill · </span>{drillTitle}</p>)}
                        {!stepTitle && !missionTitle && !drillTitle && edpf && (
                          <p className="text-gray-600 leading-snug">{String(edpf).slice(0, 90)}</p>
                        )}
                        {b.mission_time && (<p className="text-gray-400">{b.mission_time} min{b.equipment ? ` · ${b.equipment}` : ''}</p>)}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`Replace every student's blocks for Day ${data.selectedDay.day_number} with the ${todayTpl.blocks.length} template block(s)? Existing per-student tweaks for this day will be lost.`)) return;
                      startTransition(async () => {
                        try {
                          await applyTemplateDayToStudents(
                            token,
                            data.selectedDay.camp_session_id,
                            // M45 template blocks use `block_order`,
                            // applyTemplateDayToStudents expects `order_index`.
                            // Map the field name so multi-block apply seeds
                            // every block (was only seeding 1 because the
                            // missing field defaulted all rows to order 0).
                            todayTpl.blocks.map((b) => {
                              // The coach block model is narrower than the
                              // template's activity taxonomy, so compose a full
                              // objective: "<Activity type> · <content>" — this
                              // way Warm-Up / Venue-Analysis / etc. (no mission)
                              // never apply blank.
                              const typeLabel = b.block_type
                                ? String(b.block_type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                                : null;
                              const content =
                                b.pilar_part ||
                                b.mission_custom ||
                                b.mission?.title ||
                                b.drill_custom ||
                                b.drill?.title ||
                                (b.explain_md ? String(b.explain_md).slice(0, 80) : null) ||
                                b.evaluation_focus ||
                                null;
                              const objective = [typeLabel, content].filter(Boolean).join(' · ') || null;
                              return {
                                order_index: b.block_order,
                                step_id: b.step_id,
                                drill_id: b.drill_id,
                                drill_custom: b.drill_custom,
                                mission_id: b.mission_id,
                                mission_custom: b.mission_custom,
                                objective_text: objective,
                              };
                            })
                          );
                          flash('✓ Day re-seeded · refresh to see');
                          onSwitchDay?.(data.selectedDay.day_number);
                        } catch (e: any) {
                          alert(e.message || 'Apply failed');
                        }
                      });
                    }}
                    disabled={pending}
                    className="w-full py-2 text-[12px] font-semibold rounded-lg text-white"
                    style={{ background: BRAND.colors.navy }}
                  >
                    Apply ALL {todayTpl.blocks.length} blocks to every student
                  </button>
                </div>
              </Section>
            );
          })()}

          {/* 1. VENUE ANALYSIS */}
          <Section icon={Waves} title="1. Venue Analysis" subtitle="Read today's conditions before going in">
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
                <SelectField
                  label="Wave size"
                  value={plan.venue_wave_size}
                  options={WAVE_SIZE_OPTIONS}
                  onChange={(v) => commitPlanField('venue_wave_size', v)}
                />
                <SelectField
                  label="Wind"
                  value={plan.venue_wind}
                  options={WIND_OPTIONS}
                  onChange={(v) => commitPlanField('venue_wind', v)}
                />
                <SelectField
                  label="Tide"
                  value={plan.venue_tide}
                  options={TIDE_OPTIONS}
                  onChange={(v) => commitPlanField('venue_tide', v)}
                />
                <SelectField
                  label="Crowd"
                  value={plan.venue_crowd}
                  options={CROWD_LEVEL_OPTIONS}
                  onChange={(v) => commitPlanField('venue_crowd', v)}
                />
                <SelectField
                  label="Water temp"
                  value={plan.venue_water_temp}
                  options={WATER_TEMP_OPTIONS}
                  onChange={(v) => commitPlanField('venue_water_temp', v)}
                />
                <SelectField
                  label="Sky"
                  value={plan.venue_sky}
                  options={SKY_OPTIONS}
                  onChange={(v) => commitPlanField('venue_sky', v)}
                />
              </div>

              {/* M48 — Hazards multi-select. Toggle on/off chips; stored
                  as a comma-joined string so the existing TEXT column
                  works without schema change. */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Hazards (tap any that apply)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HAZARD_OPTIONS.map((h) => {
                    const selected = (plan.venue_hazards ?? '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const isOn = selected.includes(h.value);
                    return (
                      <button
                        key={h.value}
                        type="button"
                        onClick={() => {
                          const next = isOn
                            ? selected.filter((v) => v !== h.value)
                            : [...selected, h.value];
                          commitPlanField(
                            'venue_hazards',
                            next.length > 0 ? next.join(', ') : null,
                          );
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          isOn
                            ? 'bg-[var(--tss-navy)] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <TextArea
                label="Extra notes (optional)"
                value={plan.venue_analysis}
                onBlur={(v) => commitPlanField('venue_analysis', v)}
                placeholder="Only if there's something the dropdowns above can't capture."
                rows={2}
              />
            </div>
          </Section>

          {/* 2. GROUP WARM-UP */}
          <Section icon={Flame} title="2. Group Warm-Up" subtitle="Pick from your tools or write your own">
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
          <Section icon={Brain} title="3. Mental Hack" subtitle="Get them in the zone">
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
                    <opt.Icon size={16} strokeWidth={1.75} className="mx-auto mb-0.5" />
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
            icon={Users}
            title="4. Per Student"
            subtitle="Plan a different mission for each — sequence, drills, objective"
          >
            <div className="space-y-3">
              {(() => {
                const dayTpl = data.templatePlan.find(
                  (d) => d.day_number === data.selectedDay?.day_number,
                );
                const tplBlocks = dayTpl?.blocks ?? [];
                return students.map((s) => (
                  <StudentPlanCard
                    key={s.student_id}
                    student={s}
                    stpCatalog={data.stpCatalog}
                    availableDrills={data.availableDrills}
                    availableBoards={data.availableBoards}
                    boardConflictIds={data.boardConflictIds}
                    templateBlocks={tplBlocks}
                    onCommit={(orderIndex, patch) => commitStudentBlock(s.student_id, orderIndex, patch)}
                    onAddBlock={() => addStudentBlock(s.student_id)}
                    onRemoveBlock={(orderIndex) => removeStudentBlock(s.student_id, orderIndex)}
                    onShowDrill={(id) => setDrillDetailId(id)}
                  />
                ));
              })()}
            </div>
          </Section>

          {/* 5. GENERAL NOTES */}
          <Section icon={NotebookPen} title="5. General notes (private)">
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
            icon={Target}
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
                  coachRatings={coachRatings[s.student_id] ?? {}}
                  onCommit={(orderIndex, patch) => commitStudentBlock(s.student_id, orderIndex, patch)}
                  onRateStep={(stepId, rating) => rateStepInline(s.student_id, stepId, rating)}
                  onShowDrill={(id) => setDrillDetailId(id)}
                />
              ))}
            </div>
          </Section>

          {/* M48 — Incident report at close. Optional. Default = no
              incidents; coach taps '+ Add incident' to file one per
              affected student. Each incident propagates to
              student_session_results.incident_* on close. */}
          {!isClosed && (
            <Section
              emoji="🚨"
              title="Incidents (optional)"
              subtitle="Anything to log before closing? Broken board, medical, conduct, etc."
            >
              <div className="space-y-2">
                {incidents.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic">
                    No incidents reported. Skip and finalize when ready.
                  </p>
                ) : (
                  incidents.map((inc, idx) => (
                    <div
                      key={inc.id}
                      className="rounded-lg border border-red-200 bg-red-50/50 p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-red-700">
                          Incident #{idx + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeIncident(inc.id)}
                          className="text-[10px] text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
                            Student
                          </label>
                          <select
                            value={inc.student_id}
                            onChange={(e) =>
                              updateIncident(inc.id, { student_id: e.target.value })
                            }
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                          >
                            {students.map((s) => (
                              <option key={s.student_id} value={s.student_id}>
                                {s.display_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <SelectField
                          label="Type"
                          value={inc.incident_type}
                          options={INCIDENT_TYPE_OPTIONS}
                          onChange={(v) =>
                            updateIncident(inc.id, { incident_type: v ?? 'other' })
                          }
                        />
                      </div>
                      <SmallField
                        label="What happened"
                        value={inc.incident_description}
                        onBlur={(v) =>
                          updateIncident(inc.id, { incident_description: v })
                        }
                        placeholder="e.g. Board fin cut on left thigh, ~2cm"
                      />
                      <SmallField
                        label="Action taken"
                        value={inc.incident_action}
                        onBlur={(v) => updateIncident(inc.id, { incident_action: v })}
                        placeholder="e.g. First aid kit, parent contacted, session paused 10 min"
                      />
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={addIncident}
                  className="w-full py-2 rounded-lg border-2 border-dashed border-red-200 text-[12px] text-red-600 hover:border-red-400 transition-colors"
                >
                  + Report an incident
                </button>
              </div>
            </Section>
          )}
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
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-1.5"
              style={{ background: BRAND.colors.navy }}
            >
              <Lock size={14} strokeWidth={1.75} />
              Close the plan → evaluate
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
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-1.5"
              style={{ background: BRAND.colors.navy }}
            >
              <Check size={14} strokeWidth={2} />
              Done editing → back to evaluation
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
                className="py-2.5 px-4 text-sm font-semibold rounded-xl border inline-flex items-center gap-1.5"
                style={{ borderColor: BRAND.colors.navy, color: BRAND.colors.navy }}
              >
                <Pencil size={13} strokeWidth={1.75} />
                Edit plan
              </button>
              <button
                type="button"
                onClick={finalize}
                disabled={pending}
                className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-1.5"
                style={{ background: '#10B981' }}
              >
                <Flag size={14} strokeWidth={1.75} />
                Finalize ({evaluatedCount}/{students.length})
              </button>
            </>
          )}

          {state === 'closed' && (
            <div className="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-700 inline-flex items-center justify-center gap-1.5">
              <Flag size={14} strokeWidth={1.75} />
              Finalized{plan.closed_at ? ` · ${new Date(plan.closed_at).toLocaleDateString()}` : ''}
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
  const conditions: { Icon: React.ComponentType<any>; value: string }[] = [
    plan.venue_wave_size ? { Icon: Waves, value: plan.venue_wave_size } : null,
    plan.venue_wind ? { Icon: Wind, value: plan.venue_wind } : null,
    plan.venue_tide ? { Icon: Moon, value: plan.venue_tide } : null,
    plan.venue_hazards ? { Icon: AlertTriangle, value: plan.venue_hazards } : null,
  ].filter(Boolean) as { Icon: React.ComponentType<any>; value: string }[];

  return (
    <Section icon={ClipboardList} title="Session Plan" subtitle="The plan you set for this class">
      <div className="space-y-2.5">
        <SummaryRow label="Venue call" value={goLabel} />
        {conditions.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Conditions
            </p>
            <div className="flex flex-wrap gap-1">
              {conditions.map((c, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1"
                >
                  <c.Icon size={11} strokeWidth={1.75} />
                  {c.value}
                </span>
              ))}
            </div>
          </div>
        )}
        {plan.venue_analysis && (
          <SummaryRow label="Venue read" value={plan.venue_analysis} />
        )}
        <SummaryRow
          label={<><Flame size={11} strokeWidth={1.75} /> Warm-up</>}
          value={warmUpLabel || '—'}
        />
        <SummaryRow
          label={<><Brain size={11} strokeWidth={1.75} /> Mental hack</>}
          value={mentalLabel || '—'}
        />
        {plan.notes_general && (
          <SummaryRow
            label={<><NotebookPen size={11} strokeWidth={1.75} /> Notes</>}
            value={plan.notes_general}
          />
        )}
      </div>
    </Section>
  );
}

function SummaryRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 inline-flex items-center gap-1">
        {label}
      </p>
      <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────

function Section({
  emoji,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  emoji?: string;
  icon?: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 inline-flex items-center gap-1.5">
          {Icon ? (
            <Icon size={11} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
          ) : null}
          {!Icon && emoji ? <span>{emoji}</span> : null}
          {title}
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

// M45 — Select with a label that matches SmallField visually.
function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string | null;
  options: readonly { value: string; label: string }[];
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white disabled:bg-gray-50"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
      {initials || <Waves size={14} strokeWidth={1.75} />}
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
    profile.ocean_level && `ocean: ${String(profile.ocean_level).replace(/_/g, ' ')}`,
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
        <span className="text-[11px] font-semibold text-[var(--tss-navy)] inline-flex items-center gap-1.5">
          <ClipboardList size={12} strokeWidth={1.75} />
          Profile & bitácora
          {hasMedical && (
            <span className="ml-1 text-[10px] text-red-600 inline-flex items-center gap-0.5">
              <AlertTriangle size={10} strokeWidth={2} />
              medical
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`}
        />
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
            <ProfileLine label={<><MapPin size={11} strokeWidth={1.75} /> Position</>} value={seqPos} />
          )}

          {/* Self-assessment vs coach rating */}
          {hasRatings && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5 inline-flex items-center gap-1">
                <Star size={10} strokeWidth={1.75} className="text-amber-500" />
                Self-assessment
              </p>
              {stepRatings.selfRatedCount > 0 && (
                <ProfileLine
                  label="Self-rated"
                  value={`${stepRatings.selfRatedCount} STPs · avg ${stepRatings.avgSelfRating}/5`}
                />
              )}
              {stepRatings.coachRatedCount > 0 && (
                <ProfileLine
                  label="Coach-rated"
                  value={`${stepRatings.coachRatedCount} STPs · avg ${stepRatings.avgCoachRating}/5`}
                />
              )}
              {stepRatings.selfRatedCount > 0 &&
                stepRatings.coachRatedCount > 0 &&
                stepRatings.avgSelfRating != null &&
                stepRatings.avgCoachRating != null &&
                stepRatings.avgSelfRating - stepRatings.avgCoachRating >= 1 && (
                  <p className="text-[10px] text-amber-700 mt-0.5 inline-flex items-center gap-1">
                    <AlertTriangle size={10} strokeWidth={2} />
                    Self-rates noticeably higher than coach — may be over-estimating.
                  </p>
                )}
            </div>
          )}

          {/* Medical & safety — prominent when present */}
          {(hasMedical || hasEmergency) && (
            <div className="rounded-md bg-red-50 border border-red-200 p-2 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-red-700 inline-flex items-center gap-1">
                <AlertTriangle size={10} strokeWidth={2} />
                Safety
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
                      <span className="shrink-0 text-gray-400">
                        {rs.type === 'coach' ? (
                          <Waves size={11} strokeWidth={1.75} />
                        ) : (
                          <User size={11} strokeWidth={1.75} />
                        )}
                      </span>
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
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5 inline-flex items-center gap-1">
                <Target size={10} strokeWidth={1.75} />
                Goals
              </p>
              {goals.map(([label, value], i) => (
                <ProfileLine key={i} label={label} value={value} />
              ))}
            </div>
          )}

          {/* Watch out */}
          {(profile.fears_phobias || profile.biggest_barrier) && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5 inline-flex items-center gap-1">
                <Zap size={10} strokeWidth={1.75} />
                Watch out
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
  label: React.ReactNode;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex gap-2 text-[11px]">
      <span
        className={`shrink-0 w-20 inline-flex items-center gap-1 ${danger ? 'text-red-500' : 'text-gray-400'}`}
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
  availableBoards,
  boardConflictIds,
  templateBlocks,
  onCommit,
  onAddBlock,
  onRemoveBlock,
  onShowDrill,
}: {
  student: ServicePlanStudent;
  stpCatalog: ServicePlanData['stpCatalog'];
  availableDrills: ServicePlanData['availableDrills'];
  availableBoards: ServicePlanData['availableBoards'];
  boardConflictIds: string[];
  templateBlocks: ServicePlanData['templatePlan'][number]['blocks'];
  onCommit: (orderIndex: number, patch: Partial<ServicePlanBlock>) => void;
  onAddBlock: () => void;
  onRemoveBlock: (orderIndex: number) => void;
  onShowDrill: (drillId: string) => void;
}) {
  const blocks = student.blocks.length > 0
    ? student.blocks
    : [{
        id: null,
        order_index: 0,
        step_id: null,
        land_drill_id: null,
        land_drill_custom: null,
        water_drill_id: null,
        water_drill_custom: null,
        objective_text: null,
        notes_pre: null,
        status: null,
        notes_post: null,
        board_type: null,
        board_size_feet: null,
        board_size_inches: null,
        board_id: null,
        focus_level: null,
        flow_channel: null,
      } as ServicePlanBlock];

  return (
    <div className="bg-gray-50/60 rounded-xl border border-gray-200 p-3 space-y-3">
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

      {/* M49 — Board assignment lives ONCE per student per day. Saved on
          block 0 so it persists even when the coach adds more blocks. */}
      {(() => {
        const firstBlock = blocks[0];
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                Board for today
              </p>
              {/* Reference from intake: the board the student said they
                  usually ride (type + exact size + volume). Blank when
                  they've never surfed / didn't fill it — coach then picks
                  based on level + needs. */}
              {(() => {
                const p = student.profile;
                const feet = p.board_length_feet;
                const inches = p.board_length_inches;
                const size = feet
                  ? `${feet}'${inches && inches !== '0' ? inches + '"' : ''}`
                  : null;
                const vol = p.board_volume_liters
                  ? `${p.board_volume_liters}L`
                  : null;
                const ref = [p.board_type, size, vol].filter(Boolean).join(' · ');
                if (!ref) return null;
                return (
                  <p className="text-[10px] text-gray-400 truncate">
                    Usa normalmente:{' '}
                    <span className="font-semibold text-[var(--tss-navy)]">
                      {ref}
                    </span>
                  </p>
                );
              })()}
            </div>
            {/* Inventory picker — pick a real board from the academy fleet.
                Picking one auto-fills type/size below. Leave on "Manual" to
                set type/size by hand (no inventory). */}
            {availableBoards.length > 0 && (() => {
              const picked = availableBoards.find((b) => b.id === firstBlock.board_id);
              const conflicts = new Set(boardConflictIds);
              const options = availableBoards
                // Date-aware: hide repair boards + boards already booked by
                // another service THAT day. Always keep the current pick.
                .filter((b) => b.id === firstBlock.board_id || (b.status !== 'in_repair' && !conflicts.has(b.id)))
                .map((b) => ({
                  value: b.id,
                  label: `${b.code}${b.length_feet ? ` · ${b.length_feet}'${b.length_inches || ''}` : ''}${b.volume_liters ? ` · ${b.volume_liters}L` : ''}${b.status === 'in_repair' ? ' · (reparación)' : ''}`,
                }));
              return (
                <div>
                  <SelectField
                    label="Tabla del inventario"
                    value={firstBlock.board_id}
                    options={options}
                    onChange={(v) => {
                      const b = availableBoards.find((x) => x.id === v);
                      onCommit(firstBlock.order_index, {
                        board_id: v,
                        board_type: b?.board_type ?? firstBlock.board_type,
                        board_size_feet: b?.length_feet ?? firstBlock.board_size_feet,
                        board_size_inches: b?.length_inches ?? firstBlock.board_size_inches,
                      });
                    }}
                  />
                  {picked && (
                    <p className="text-[10px] text-gray-400 mt-0.5">Asignada: {picked.code}</p>
                  )}
                </div>
              );
            })()}
            <div className="grid grid-cols-3 gap-2">
              <SelectField
                label="Type"
                value={firstBlock.board_type}
                options={BOARD_TYPE_OPTIONS}
                onChange={(v) => onCommit(firstBlock.order_index, { board_type: v })}
              />
              <SelectField
                label="Feet"
                value={firstBlock.board_size_feet != null ? String(firstBlock.board_size_feet) : null}
                options={BOARD_SIZE_FEET_OPTIONS.map((n) => ({ value: String(n), label: `${n}'` }))}
                onChange={(v) =>
                  onCommit(firstBlock.order_index, {
                    board_size_feet: v ? parseInt(v, 10) : null,
                  })
                }
              />
              <SelectField
                label="Inches"
                value={firstBlock.board_size_inches != null ? String(firstBlock.board_size_inches) : null}
                options={BOARD_SIZE_INCHES_OPTIONS.map((n) => ({ value: String(n), label: `${n}"` }))}
                onChange={(v) =>
                  onCommit(firstBlock.order_index, {
                    board_size_inches: v ? parseInt(v, 10) : null,
                  })
                }
              />
            </div>
          </div>
        );
      })()}

      {/* M45 — One BlockEditor per block; coach can add/remove blocks. */}
      <div className="space-y-3">
        {blocks.map((b, i) => (
          <BlockEditor
            key={b.id ?? `new-${b.order_index}`}
            block={b}
            blockNumber={i + 1}
            canRemove={blocks.length > 1}
            stpCatalog={stpCatalog}
            availableDrills={availableDrills}
            templateBlock={templateBlocks.find((tb) => tb.block_order === b.order_index) ?? null}
            onCommit={(patch) => onCommit(b.order_index, patch)}
            onRemove={() => onRemoveBlock(b.order_index)}
            onShowDrill={onShowDrill}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddBlock}
        className="w-full py-2 rounded-lg border-2 border-dashed border-gray-300 text-[12px] text-gray-500 hover:border-[var(--tss-navy)] hover:text-[var(--tss-navy)] transition-colors"
      >
        + Add another block
      </button>
    </div>
  );
}

// M45 — One block's planning editor (Sequence focus + drill + mission +
// objective + board + pre-note). Used inside StudentPlanCard, one per
// block, so a single student can have multiple blocks per day.
function BlockEditor({
  block,
  blockNumber,
  canRemove,
  stpCatalog,
  availableDrills,
  templateBlock,
  onCommit,
  onRemove,
  onShowDrill,
}: {
  block: ServicePlanBlock;
  blockNumber: number;
  canRemove: boolean;
  stpCatalog: ServicePlanData['stpCatalog'];
  availableDrills: ServicePlanData['availableDrills'];
  templateBlock: ServicePlanData['templatePlan'][number]['blocks'][number] | null;
  onCommit: (patch: Partial<ServicePlanBlock>) => void;
  onRemove: () => void;
  onShowDrill: (drillId: string) => void;
}) {
  const [showLandPicker, setShowLandPicker] = useState(false);
  const [showWaterPicker, setShowWaterPicker] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);

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
    <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          Block {blockNumber}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      {/* Read-only plan from the template — the WHAT. The coach reads this
          and evaluates; tweaking is optional under "Adjust". */}
      {templateBlock && (
        <div className="rounded-lg bg-[var(--tss-navy)]/[0.03] border-l-4 border-[var(--tss-cyan)] px-3 py-2 space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">
            {templateBlock.block_type
              ? String(templateBlock.block_type).replace(/_/g, ' ')
              : 'Plan'}
            {templateBlock.mission_time ? ` · ${templateBlock.mission_time} min` : ''}
          </p>
          {templateBlock.pilar_part && (
            <p className="text-[12px] font-medium text-gray-800">{templateBlock.pilar_part}</p>
          )}
          {(templateBlock.step_title || templateBlock.step_id) && (
            <p className="text-[11px] text-gray-600"><span className="text-gray-400">Step · </span>{templateBlock.step_id}{templateBlock.step_title ? ` — ${templateBlock.step_title}` : ''}</p>
          )}
          {(templateBlock.mission?.title || templateBlock.mission_custom) && (
            <p className="text-[11px] text-gray-600"><span className="text-gray-400">Mission · </span>{templateBlock.mission?.title ?? templateBlock.mission_custom}</p>
          )}
          {(templateBlock.drill?.title || templateBlock.drill_custom) && (
            <p className="text-[11px] text-gray-600"><span className="text-gray-400">Drill · </span>{templateBlock.drill?.title ?? templateBlock.drill_custom}</p>
          )}
          {templateBlock.explain_md && (
            <p className="text-[11px] text-gray-600"><span className="text-gray-400">Explain · </span>{templateBlock.explain_md}</p>
          )}
          {templateBlock.demonstrate_md && (
            <p className="text-[11px] text-gray-600"><span className="text-gray-400">Demonstrate · </span>{templateBlock.demonstrate_md}</p>
          )}
          {templateBlock.simulate_md && (
            <p className="text-[11px] text-gray-600"><span className="text-gray-400">Simulate · </span>{templateBlock.simulate_md}</p>
          )}
          {templateBlock.feedback_md && (
            <p className="text-[11px] text-gray-600"><span className="text-gray-400">Feedback · </span>{templateBlock.feedback_md}</p>
          )}
          {templateBlock.equipment && (
            <p className="text-[10px] text-gray-400">{templateBlock.equipment}</p>
          )}
        </div>
      )}

      {/* Optional per-student adjustment — collapsed by default so the
          common case (follow the plan + evaluate) stays clean. */}
      <button
        type="button"
        onClick={() => setShowAdjust((v) => !v)}
        className="text-[10px] text-gray-400 hover:text-[var(--tss-navy)]"
      >
        {showAdjust ? '▴ Hide adjustments' : '▾ Adjust for this student (optional)'}
      </button>

      {showAdjust && (<>

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
        <div className="flex items-center justify-between mb-0.5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">
            Land drill
          </label>
          {block.land_drill_id && (
            <button
              type="button"
              onClick={() => onShowDrill(block.land_drill_id!)}
              className="text-[10px] text-[var(--tss-cyan,#5AC3E7)] font-semibold hover:underline"
            >
              How to teach →
            </button>
          )}
        </div>
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
          <div className="space-y-1.5 bg-gray-50 p-2 rounded-lg border border-gray-200">
            {stepDrills.length > 0 ? (
              stepDrills.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onCommit({ land_drill_id: d.id, land_drill_custom: null });
                    setShowLandPicker(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-white"
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
        <div className="flex items-center justify-between mb-0.5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">
            In-water mission
          </label>
          {block.water_drill_id && (
            <button
              type="button"
              onClick={() => onShowDrill(block.water_drill_id!)}
              className="text-[10px] text-[var(--tss-cyan,#5AC3E7)] font-semibold hover:underline"
            >
              How to teach →
            </button>
          )}
        </div>
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
          <div className="space-y-1.5 bg-gray-50 p-2 rounded-lg border border-gray-200">
            {stepMissions.length > 0 ? (
              stepMissions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onCommit({ water_drill_id: d.id, water_drill_custom: null });
                    setShowWaterPicker(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-white"
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
        label="Objective"
        value={block.objective_text}
        onBlur={(v) => onCommit({ objective_text: v })}
        placeholder="e.g. 3 clean pop-ups landing in FP2"
      />

      {/* M49 — Board assignment moved to the student-level card (one
          board per student per day) so the coach picks it once, not
          per block. */}

      {/* Pre-session note */}
      <TextArea
        label="Pre-block note"
        value={block.notes_pre}
        onBlur={(v) => onCommit({ notes_pre: v })}
        placeholder="What to watch for in this block"
        rows={2}
      />

      </>)}
    </div>
  );
}

// ─── Per-student EVALUATION card ──────────────────────────────────

function StudentEvalCard({
  student,
  isClosed,
  stpLabel,
  drillTitle,
  coachRatings,
  onCommit,
  onRateStep,
  onShowDrill,
}: {
  student: ServicePlanStudent;
  isClosed: boolean;
  stpLabel: (id: string | null) => string | null;
  drillTitle: (id: string | null) => string | null;
  coachRatings: Record<string, number>;
  onCommit: (orderIndex: number, patch: Partial<ServicePlanBlock>) => void;
  onRateStep: (stepId: string, rating: number) => void;
  onShowDrill: (drillId: string) => void;
}) {
  const blocks = student.blocks;
  const allEvaluated = blocks.length > 0 && blocks.every((b) => b.status);

  return (
    <div className="bg-gray-50/60 rounded-xl border border-gray-200 p-3 space-y-2.5">
      {/* Student header + summary pill */}
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
        {blocks.length > 0 && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={
              allEvaluated
                ? { background: '#D1FAE5', color: '#047857' }
                : { background: '#FEF3C7', color: '#92400E' }
            }
          >
            {blocks.filter((b) => b.status).length} / {blocks.length} evaluated
          </span>
        )}
      </div>

      {/* Profile / bitácora — context while evaluating */}
      <StudentProfilePanel student={student} />

      {/* M49 — Session-level Focus + Flow (one per student per day, not
          per block). Saved on block 0 just like the board fields. */}
      {blocks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Focus level — how present were they today?
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={isClosed}
                  onClick={() => onCommit(blocks[0].order_index, { focus_level: n })}
                  className="py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-70"
                  style={
                    blocks[0].focus_level === n
                      ? { background: BRAND.colors.navy, color: 'white' }
                      : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                  }
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-gray-400">Distracted</span>
              <span className="text-[9px] text-gray-400">Locked in</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Flow channel — was the demand right today?
            </label>
            <div className="grid grid-cols-5 gap-1">
              {([
                { n: 1, color: '#3B82F6', label: 'Bored' },
                { n: 2, color: '#06B6D4', label: 'Easy' },
                { n: 3, color: '#10B981', label: 'Optimal' },
                { n: 4, color: '#F59E0B', label: 'Hard' },
                { n: 5, color: '#EF4444', label: 'Frustrated' },
              ] as const).map((opt) => (
                <button
                  key={opt.n}
                  type="button"
                  disabled={isClosed}
                  onClick={() =>
                    onCommit(blocks[0].order_index, { flow_channel: opt.n })
                  }
                  className="py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-70"
                  style={
                    blocks[0].flow_channel === opt.n
                      ? { background: opt.color, color: 'white' }
                      : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-0.5 italic text-center">
              Center is the goal. Extremes mean dial reps + difficulty up or down.
            </p>
          </div>

          {/* Two close fields per student (visible to the student + the next
              coach for continuity). Persisted on block 0 like board/focus. */}
          <TextArea
            label="Coach feedback (what they did well)"
            value={blocks[0].notes_post}
            onBlur={(v) => onCommit(blocks[0].order_index, { notes_post: v })}
            placeholder="e.g. Great pop-up, much steadier stance today"
            rows={3}
            disabled={isClosed}
          />
          <TextArea
            label="What to work on next"
            value={(blocks[0] as any).whats_next ?? ''}
            onBlur={(v) => onCommit(blocks[0].order_index, { whats_next: v } as any)}
            placeholder="e.g. Next session: angle take-offs, look down the line"
            rows={2}
            disabled={isClosed}
          />
        </div>
      )}

      {/* One eval section per block */}
      {blocks.map((block, i) => (
        <BlockEvalSection
          key={block.id ?? `eval-${block.order_index}`}
          block={block}
          blockNumber={i + 1}
          studentFirstName={student.display_name.split(' ')[0]}
          isClosed={isClosed}
          stpLabel={stpLabel}
          drillTitle={drillTitle}
          currentCoachRating={block.step_id ? coachRatings[block.step_id] ?? null : null}
          onCommit={(patch) => onCommit(block.order_index, patch)}
          onRateStep={(rating) => block.step_id && onRateStep(block.step_id, rating)}
          onShowDrill={onShowDrill}
        />
      ))}
    </div>
  );
}

function BlockEvalSection({
  block,
  blockNumber,
  studentFirstName,
  isClosed,
  stpLabel,
  drillTitle,
  currentCoachRating,
  onCommit,
  onRateStep,
  onShowDrill,
}: {
  block: ServicePlanBlock;
  blockNumber: number;
  studentFirstName: string;
  isClosed: boolean;
  stpLabel: (id: string | null) => string | null;
  drillTitle: (id: string | null) => string | null;
  currentCoachRating: number | null;
  onCommit: (patch: Partial<ServicePlanBlock>) => void;
  onRateStep: (rating: number) => void;
  onShowDrill: (drillId: string) => void;
}) {
  const land = block.land_drill_id ? drillTitle(block.land_drill_id) : block.land_drill_custom;
  const water = block.water_drill_id ? drillTitle(block.water_drill_id) : block.water_drill_custom;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          Block {blockNumber}
        </p>
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

      {/* Read-only recap of what was planned */}
      <div className="space-y-1">
        <EvalRow label="Sequence" value={stpLabel(block.step_id) || '—'} />
        <EvalRow
          label={<><Dumbbell size={11} strokeWidth={1.75} /> Land drill</>}
          value={land || '—'}
          onClick={block.land_drill_id ? () => onShowDrill(block.land_drill_id!) : undefined}
        />
        <EvalRow
          label={<><Waves size={11} strokeWidth={1.75} /> Water mission</>}
          value={water || '—'}
          onClick={block.water_drill_id ? () => onShowDrill(block.water_drill_id!) : undefined}
        />
        <EvalRow
          label={<><Target size={11} strokeWidth={1.75} /> Objective</>}
          value={block.objective_text || '—'}
          highlight
        />
        {block.notes_pre && <EvalRow label="Pre-note" value={block.notes_pre} />}
      </div>

      {/* Status buttons */}
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

      {/* M49 — Focus + Flow + Close note moved to the student-level
          eval card (one per session, not per block). */}

      {/* M45 — Inline OFFICIAL step rating (TSS cyan) per block. */}
      {block.step_id && (
        <div className="bg-[var(--tss-cyan,#5AC3E7)]/10 border border-[var(--tss-cyan,#5AC3E7)]/30 rounded-lg p-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">
            Official rating · {block.step_id}
          </label>
          <StarRating
            value={currentCoachRating}
            size="md"
            variant="official"
            readOnly={isClosed}
            onChange={onRateStep}
          />
          <p className="text-[10px] text-gray-500 mt-0.5 italic">
            Rates {studentFirstName}'s {block.step_id} officially in their sequence.
          </p>
        </div>
      )}
    </div>
  );
}

function EvalRow({
  label,
  value,
  highlight,
  onClick,
}: {
  label: React.ReactNode;
  value: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 shrink-0 w-24 pt-0.5 inline-flex items-center gap-1">
        {label}
      </span>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={`flex-1 text-left whitespace-pre-wrap underline decoration-dotted decoration-gray-300 hover:text-[var(--tss-navy)] ${
            highlight ? 'font-semibold text-[var(--tss-navy)]' : 'text-gray-700'
          }`}
        >
          {value}
        </button>
      ) : (
        <span
          className={`flex-1 whitespace-pre-wrap ${
            highlight ? 'font-semibold text-[var(--tss-navy)]' : 'text-gray-700'
          }`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
