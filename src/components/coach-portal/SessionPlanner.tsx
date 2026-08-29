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
  SURF_SPOT_OPTIONS,
} from '@/lib/constants/brand';
import {
  saveServicePlanHeader,
  saveServicePlanBlock,
  deleteServicePlanBlock,
  applyTemplateDayToStudents,
  startServicePlan,
  closeServicePlan,
  saveOfficialStepRatingFromPortal,
  saveStudentInternalNote,
  applyPlanHeaderToWeek,
  applyStudentBoardToWeek,
  type ServicePlanData,
  type ServicePlanStudent,
  type ServicePlanBlock, finalizeStudentEarlyByToken } from '@/lib/actions/service-planner';
import { StarRating } from '@/components/sequence/StarRating';
import {
  Waves,
  ChevronRight,
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
  CalendarClock,
} from 'lucide-react';
import { FinalCampEvaluation } from '@/components/coach-portal/FinalCampEvaluation';
import { WeekPlanBoard } from '@/components/coach-portal/WeekPlanBoard';
import { useRouter } from 'next/navigation';
import { TidePlannerHint } from '@/components/camp/TidePlannerHint';
import {
  listSpacesByToken, listBookingsForDayByToken, createBookingByToken, cancelBookingByToken,
  type AcademySpace, type SpaceBooking,
} from '@/lib/actions/spaces';
import { canCoachBelt, type BeltLevel } from '@/lib/constants/belts';
import { DrillDetailModal } from '@/components/coach-portal/DrillDetailModal';
import { usesBeltEvaluation } from '@/lib/constants/service-kinds';
import { exigeCierreDeDias } from '@/lib/utils/camp-window';
import { sequenceLabel } from '@/lib/constants/learning-blocks';
import { displayDate } from '@/lib/utils/tz';

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

  // Coach-to-coach internal note on a student (not shown to the student).
  const saveInternalNote = (studentId: string, note: string) => {
    startTransition(async () => {
      try {
        await saveStudentInternalNote(token, data.selectedDay.camp_session_id, studentId, note);
        flash('✓ Internal note saved');
      } catch (e: any) {
        alert(e.message || 'Save failed');
      }
    });
  };

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
    // Cierre con seguimiento OBLIGATORIO (pedido de Marcelo 2026-08-09): en
    // servicios de surf cada alumno debe salir con (a) ¿cumplió el objetivo?
    // y (b) QUÉ TRABAJAR PRÓXIMO — ese es el hilo de progresión que ve el
    // alumno, el próximo coach y el host. Per-step STP grading sigue en la
    // Final Evaluation. (Las clases yoga/ice bath usan el cierre liviano y
    // no pasan por acá.)
    const noObjective = students.filter((s) => !(s.blocks[0]?.day_objective_status));
    if (noObjective.length > 0) {
      alert(
        `Set "objective met" for: ${noObjective.map((s) => s.display_name).join(', ')}.\n\nIt takes one tap per student — it becomes their progress record.`
      );
      return;
    }
    const noNext = students.filter((s) => ((s.blocks[0]?.whats_next ?? '').trim().length < 5));
    if (noNext.length > 0) {
      alert(
        `Write "What to work on next" for: ${noNext.map((s) => s.display_name).join(', ')}.\n\nOne specific line per student — the student sees it as their Next Focus and the next coach plans from it.`
      );
      return;
    }
    // Anti copy-paste: el mismo texto pegado a 3+ alumnos no es seguimiento.
    const counts = new Map<string, number>();
    for (const s of students) {
      const t = (s.blocks[0]?.whats_next ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    const copied = Math.max(0, ...counts.values());
    if (copied >= 3) {
      if (
        !confirm(
          `${copied} students have the SAME "what to work on next" text. Personalized focus is what makes the follow-up valuable. Finalize anyway?`
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
        const res = await closeServicePlan(
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
        if (!res?.ok) { alert(res?.error || 'Failed to finalize'); return; }
        setPlan((p) => ({
          ...p,
          completion_state: 'closed',
          closed_at: new Date().toISOString(),
        }));
        setClosedNow((prev) => new Set(prev).add(data.selectedDay.camp_session_id));
        flash('🏁 Day finalized');
        // If this was the last day of a BELT camp, surface the final
        // official evaluation (rate every STP per student → graduation).
        // Simple lessons (surf_lesson / Discover Surfing) close with the
        // per-student general analysis instead — no 25-STP belt eval.
        if (isLastDay && usesBeltEvaluation(data.camp.service_kind)) {
          // Si quedaron días sin cerrar, la evaluación final no abre: el
          // servidor la va a rechazar igual. Se le dice cuáles faltan.
          if (!exigeCierre || otherOpenDays.length === 0) {
            setShowFinalEval(true);
          } else {
            alert(
              `Antes de la evaluación final faltan cerrar: ${otherOpenDays.map(dayLabel).join(', ')}.\n\n` +
                'Sin el cierre del día el alumno se queda sin esa sesión en su bitácora y sin encuesta del coach.',
            );
          }
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

  // M45 — a student counts as "evaluated" once every GRADABLE block (sequence
  // step) has a status set. Non-gradable blocks don't require a status.
  const evaluatedCount = students.filter((s) => {
    const gradable = s.blocks.filter((b) => b.step_id);
    return gradable.length > 0 && gradable.every((b) => b.status);
  }).length;

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
  // 📅 Vista semana (planner tipo Excel) — solo camps multi-día.
  const [showWeek, setShowWeek] = useState(false);
  const router = useRouter();
  // Días cerrados en esta misma pantalla (el fetch inicial no los conoce).
  const [closedNow, setClosedNow] = useState<Set<string>>(() => new Set());
  // Short camp: cerrar UN alumno hoy (evaluación oficial + encuestas del día).
  const [earlyPickerOpen, setEarlyPickerOpen] = useState(false);
  const [earlyStudentId, setEarlyStudentId] = useState<string | null>(null);
  const [earlyBusy, setEarlyBusy] = useState(false);

  // M153 — final evaluation is re-entrant: students already saved + the
  // pending banner that brings the coach back until everyone is evaluated.
  const [finalSaved, setFinalSaved] = useState<Set<string>>(
    () => new Set((data as any).finalEvaluatedIds ?? []),
  );
  // Cerrar TODOS los días es obligatorio para finalizar el camp (Marcelo
  // 2026-08-28). El día cuenta como DADO con el sello de cierre
  // (session_status='completed'), el MISMO criterio que exige el servidor —
  // un plan marcado 'closed' sin ese sello no cuenta, y la pantalla no puede
  // decir "listo" para que el servidor después diga que no.
  // `data` se cargó al abrir el planner y NO se vuelve a leer al cerrar un día
  // (el padre solo refetchea al abrir o al cambiar de día). Sin esto, el día que
  // el coach ACABA de cerrar seguía contando como abierto: al terminar el último
  // día se abría la evaluación final y adentro el pie decía "faltan cerrar Día 5"
  // — el día que acababa de cerrar — y le escondía el botón de finalizar.
  // El candado corre de 2026-08-28 en adelante (camp-window.ts). Los camps de
  // la temporada de pruebas se miden como antes — con el plan cerrado — para
  // que sigan finalizándose igual y nadie herede avisos imposibles de cerrar.
  const exigeCierre = exigeCierreDeDias(data.camp.start_date);
  const dayGiven = (d: {
    camp_session_id: string;
    session_status: string | null;
    completion_state: 'planned' | 'in_progress' | 'closed';
  }) =>
    closedNow.has(d.camp_session_id) ||
    (exigeCierre
      ? d.session_status === 'completed' || d.session_status === 'cancelled'
      : d.completion_state === 'closed');
  const openDays = data.daySummaries.filter((d) => !dayGiven(d));
  const allDaysClosed = data.daySummaries.length > 0 && openDays.length === 0;
  // Los que faltan aparte del día que el coach tiene abierto ahora: al cerrar
  // el último día, `data` todavía no refleja ese cierre.
  const otherOpenDays = openDays.filter(
    (d) => d.camp_session_id !== data.selectedDay.camp_session_id,
  );
  const dayLabel = (d: { day_number: number; session_date: string }) => {
    const [, m, dd] = (d.session_date ?? '').split('-');
    return m && dd ? `Día ${d.day_number} (${dd}/${m})` : `Día ${d.day_number}`;
  };
  // Días sueltos que BLOQUEAN el cierre. No se avisa a mitad de camp (que el
  // día 3 esté abierto el día 1 es lo normal): solo cuando ya toca finalizar
  // — el último día ya está dado, o el camp terminó y quedaron días sin dar.
  const svTodayISO = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
  const lastDaySummary = data.daySummaries.find((d) => d.day_number === lastDayNumber);
  const timeToFinalize =
    (lastDaySummary ? dayGiven(lastDaySummary) : false) ||
    (data.camp.end_date ?? '') < svTodayISO;
  const pendingDaysBlock =
    exigeCierre &&
    usesBeltEvaluation(data.camp.service_kind) &&
    (data.camp as any).status !== 'completed' &&
    timeToFinalize
      ? openDays
      : [];
  const finalPendingCount = students.filter((s) => !finalSaved.has(s.student_id)).length;
  // Con los días cerrados y el camp sin finalizar SIEMPRE hay puerta al cierre.
  // Antes exigía alumnos sin evaluar: el coach que los guardaba uno por uno y
  // salía se quedaba sin banner y sin botón — el camp no se finalizaba nunca y
  // las encuestas no salían.
  const finalEvalPending =
    allDaysClosed &&
    (data.camp as any).status !== 'completed' &&
    usesBeltEvaluation(data.camp.service_kind) &&
    students.length > 0;

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

  // ── LIGHT MODE (M150) — class / trip services carry no TSS curriculum:
  // no venue analysis, no blocks, no per-student evaluation. The whole day
  // sheet is: start time (+ spot for trips), one general note, open, close.
  const isLightService = data.camp.service_kind === 'class' || data.camp.service_kind === 'trip';
  if (isLightService) {
    const isTrip = data.camp.service_kind === 'trip';
    const finalizeLight = () => {
      if (!confirm(isTrip
        ? 'Cerrar el trip?\n\n• Tu nota general le llega a todos los participantes\n• Se les pide evaluar el servicio (guía, transporte, spot)'
        : 'Cerrar la clase?\n\n• Tu nota general (opcional) le llega a todos\n• Se les pide evaluar la experiencia')) return;
      startTransition(async () => {
        try {
          const res = await closeServicePlan(token, data.selectedDay.camp_session_id, [], { generalFeedback: plan.notes_general ?? null });
          if (!res?.ok) { alert(res?.error || 'No se pudo cerrar'); return; }
          setPlan((p) => ({ ...p, completion_state: 'closed' }));
        } catch (e: any) { alert(e.message || 'No se pudo cerrar'); }
      });
    };
    return (
      <div className="space-y-4 pb-32 max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
            {isTrip ? '🚐 Surf trip · guided' : '🧘 Class · no TSS evaluation'}
          </p>
          <p className="text-lg font-bold text-[var(--tss-navy)] mt-1">{data.camp.camp_name}</p>
          <p className="text-[12px] text-gray-500">{students.length} participant{students.length === 1 ? '' : 's'}
            {state === 'closed' ? ' · ✓ cerrado' : state === 'in_progress' ? ' · en curso' : ''}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Hora de inicio</p>
            <input type="time" defaultValue={plan.class_start_time ?? ''} disabled={state === 'closed'}
              onBlur={(e) => commitPlanField('class_start_time', e.target.value || null)}
              className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          {isTrip && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Spot elegido</p>
              <input type="text" defaultValue={plan.surf_venue ?? ''} disabled={state === 'closed'}
                onBlur={(e) => commitPlanField('surf_venue', e.target.value || null)}
                placeholder="Punta Roca, K59…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Nota general {state !== 'closed' ? '· le llega a todos al cerrar' : ''}
            </p>
            <textarea defaultValue={plan.notes_general ?? ''} disabled={state === 'closed'} rows={3}
              onBlur={(e) => commitPlanField('notes_general', e.target.value || null)}
              placeholder={isTrip ? 'Condiciones épicas, surfeamos 2h en Punta Roca…' : 'Gran clase, buena energía…'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">Participants</p>
          <div className="flex flex-wrap gap-1.5">
            {students.map((st) => (
              <span key={st.student_id} className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[var(--tss-navy)]">
                {st.display_name}
              </span>
            ))}
          </div>
        </div>

        {state === 'planned' ? (
          <button type="button" disabled={pending}
            onClick={() => startTransition(async () => {
              try {
                await startServicePlan(token, data.selectedDay.camp_session_id);
                setPlan((p) => ({ ...p, completion_state: 'in_progress' }));
              } catch (e: any) { alert(e.message || 'No se pudo abrir'); }
            })}
            className="w-full py-3.5 rounded-full bg-[#00D2FF] text-[#061C2B] text-[11px] font-mono uppercase tracking-[0.14em] font-semibold disabled:opacity-50">
            {isTrip ? 'Salir al trip →' : 'Abrir la clase →'}
          </button>
        ) : state === 'in_progress' ? (
          <button type="button" disabled={pending} onClick={finalizeLight}
            className="w-full py-3.5 rounded-full bg-[#06D6A0] text-[#061C2B] text-[11px] font-mono uppercase tracking-[0.14em] font-semibold disabled:opacity-50">
            {isTrip ? 'Cerrar el trip ✓' : 'Cerrar la clase ✓'}
          </button>
        ) : (
          <p className="text-center text-[12px] text-gray-400 py-2">✓ Cerrado — los participantes recibieron tu nota y su encuesta.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-32">
      {/* 🔒 Cerrar todos los días es obligatorio para finalizar el camp.
          Aparece cuando ya es hora de cerrar (el último día está dado o el
          camp terminó) y quedaron días sueltos: cada día es un toque para
          ir a darlo. Sin ese cierre el alumno no tiene sesión, ni horas de
          agua, ni encuesta del coach. */}
      {pendingDaysBlock.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3.5">
          <p className="text-[13px] font-bold text-amber-900">
            📌 Faltan cerrar {pendingDaysBlock.length === 1 ? 'un día' : `${pendingDaysBlock.length} días`}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            El camp no se puede finalizar hasta cerrarlos. Sin el cierre del día el alumno se queda sin
            esa sesión en su bitácora y sin encuesta del coach.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {pendingDaysBlock.map((d) => (
              <button
                key={d.camp_session_id}
                type="button"
                onClick={() => onSwitchDay?.(d.day_number)}
                className="rounded-full bg-amber-200 text-amber-900 px-3 py-1.5 text-[11px] font-bold hover:bg-amber-300"
              >
                {dayLabel(d)} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* M153 — the final evaluation stays reachable until EVERY student is
          evaluated (Stanley case: filled 1, closed the app, lost the rest). */}
      {finalEvalPending && !showFinalEval && (
        <button
          type="button"
          onClick={() => setShowFinalEval(true)}
          className="w-full text-left rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3.5 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-[13px] font-bold text-amber-900">
              {finalPendingCount > 0 ? '🏁 Evaluación final pendiente' : '🏁 Falta finalizar el camp'}
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {finalPendingCount > 0
                ? `${finalPendingCount} de ${students.length} alumno${students.length === 1 ? '' : 's'} sin evaluar — tu avance se guarda alumno por alumno.`
                : 'Todos evaluados. Cerrá el camp para que salgan las encuestas y quede el registro oficial.'}
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-bold text-amber-900 bg-amber-200 rounded-full px-3 py-1.5">Continuar →</span>
        </button>
      )}

      {/* 📅 VISTA SEMANA — planear todo el camp de un vistazo (tipo Excel):
          clase, lugar, transporte, espacios y tablas por día. */}
      {data.daySummaries.length > 1 && (data.camp as any).status !== 'completed' && (
        showWeek ? (
          <WeekPlanBoard token={token} campInstanceId={data.camp.id} onClose={() => { setShowWeek(false); router.refresh(); }} />
        ) : (
          <button
            type="button"
            onClick={() => setShowWeek(true)}
            className="w-full text-left rounded-2xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-2 hover:border-[var(--tss-cyan,#5AC3E7)]"
          >
            <div>
              <p className="text-[12px] font-semibold text-gray-700">📅 Vista semana · planear todo el camp</p>
              <p className="text-[10.5px] text-gray-500 mt-0.5">Clase, lugar, transporte, espacios y tablas — día por día, de un vistazo.</p>
            </div>
            <span className="text-[11px] text-[var(--tss-cyan,#5AC3E7)] font-semibold shrink-0">Abrir →</span>
          </button>
        )
      )}

      {/* SHORT CAMP — un alumno termina hoy aunque el grupo siga: cerrarlo,
          hacerle la evaluación oficial y que sus encuestas salgan HOY.
          Solo camps multi-día, a mitad de camp (el último día ya tiene su
          flujo oficial), y EXIGE el día de hoy cerrado — si no, su sesión
          de hoy se perdería en silencio (hallazgo de la revisión). */}
      {!allDaysClosed && !isLastDay && data.daySummaries.length > 1 &&
        (data.camp as any).status !== 'completed' &&
        usesBeltEvaluation(data.camp.service_kind) &&
        students.some((st) => !finalSaved.has(st.student_id)) && (() => {
          const svToday = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
          const todaySummary = data.daySummaries.find((d) => d.session_date === svToday);
          const todayClosed = !todaySummary || todaySummary.completion_state === 'closed';
          return (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
          <button type="button" onClick={() => setEarlyPickerOpen(!earlyPickerOpen)}
            className="w-full text-left flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold text-gray-700">🏁 ¿Un alumno termina HOY su short camp?</p>
            <span className="text-[11px] text-[var(--tss-cyan,#5AC3E7)] font-semibold shrink-0">{earlyPickerOpen ? 'Ocultar' : 'Cerrarlo →'}</span>
          </button>
          {earlyPickerOpen && (
            <div className="mt-2.5 space-y-2">
              {todayClosed ? (
                <p className="text-[10.5px] text-gray-500 leading-snug">
                  Elegí al alumno: hacés su <b>evaluación oficial</b> ahora y sus encuestas le salen hoy — el resto del grupo sigue normal.
                </p>
              ) : (
                <p className="text-[10.5px] text-amber-700 leading-snug">
                  ⚠️ Cerrá el día de HOY primero (evaluación diaria del grupo). Si lo cerrás antes, la sesión de hoy de este alumno no quedaría en su bitácora.
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {students.filter((st) => !finalSaved.has(st.student_id)).map((st) => (
                  <button key={st.student_id} type="button" disabled={!todayClosed}
                    onClick={() => setEarlyStudentId(st.student_id)}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-[var(--tss-cyan,#5AC3E7)] disabled:opacity-40">
                    {st.display_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
          );
        })()}

      {/* Evaluación oficial del alumno de short camp (solo él). */}
      {earlyStudentId && (
        <FinalCampEvaluation
          token={token}
          campInstanceId={data.camp.id}
          earlyMode
          savedIds={Array.from(finalSaved)}
          onStudentSaved={(id: string) => {
            if (earlyBusy) return;
            setEarlyBusy(true);
            finalizeStudentEarlyByToken(token, data.camp.id, id)
              .then((r) => {
                if (!r?.ok) { alert(r?.error || 'No se pudo cerrar al alumno.'); return; }
                setFinalSaved((prev) => new Set(prev).add(id));
                const nm = students.find((st) => st.student_id === id)?.display_name?.split(' ')[0] ?? 'Alumno';
                flash(r.surveyEmailSent
                  ? `🏁 ${nm}: evaluación oficial guardada · encuesta enviada hoy`
                  : `🏁 ${nm}: cerrado y evaluado — sin correo del alumno, compartile la encuesta desde el Front Desk`);
                setEarlyStudentId(null);
                setEarlyPickerOpen(false);
              })
              .catch((e: any) => alert(e?.message || 'No se pudo cerrar al alumno. Revisá y reintentá.'))
              .finally(() => setEarlyBusy(false));
          }}
          campName={data.camp.camp_name}
          students={students.filter((st) => st.student_id === earlyStudentId)}
          stpCatalog={data.graduationCatalog}
          preCourse={data.preCourseByStudent}
          initialRatings={data.coachRatingByStudentStep}
          targetBelt={data.camp.target_belt}
          canAccreditTarget={
            !data.camp.coach_max_belt ||
            !data.camp.target_belt ||
            canCoachBelt(
              data.camp.coach_max_belt as BeltLevel,
              data.camp.target_belt as BeltLevel,
            )
          }
          onCancel={() => setEarlyStudentId(null)}
          onCompleted={() => setEarlyStudentId(null)}
        />
      )}

      {/* M47 — Drill / mission detail popover. */}
      {drillDetail && (
        <DrillDetailModal drill={drillDetail} onClose={() => setDrillDetailId(null)} />
      )}

      {/* M45 — Final official evaluation modal (last day only). */}
      {showFinalEval && (
        <FinalCampEvaluation
          token={token}
          campInstanceId={data.camp.id}
          openDays={exigeCierre ? openDays : []}
          savedIds={Array.from(finalSaved)}
          onStudentSaved={(id: string) => setFinalSaved((prev) => new Set(prev).add(id))}
          campName={data.camp.camp_name}
          students={students}
          stpCatalog={data.graduationCatalog}
          preCourse={data.preCourseByStudent}
          initialRatings={data.coachRatingByStudentStep}
          targetBelt={data.camp.target_belt}
          canAccreditTarget={
            // Policy 2026-07-11: everyone (head coach included) is capped by
            // their own certification; only unset caps or no target skip it.
            !data.camp.coach_max_belt ||
            !data.camp.target_belt ||
            canCoachBelt(
              data.camp.coach_max_belt as BeltLevel,
              data.camp.target_belt as BeltLevel,
            )
          }
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
          {data.daySummaries.length > 1 && (
            <span style={{ color: '#5AC3E7' }}>
              {' '}· Day {data.selectedDay.day_number} of {data.daySummaries.length}
            </span>
          )}
        </p>
        <h2 className="text-base font-bold mt-0.5">{data.camp.camp_name}</h2>
        <p className="text-[11px] opacity-80 mt-0.5">
          {new Date(data.selectedDay.session_date + 'T00:00:00').toLocaleDateString('en-US', {
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
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {data.daySummaries.map((d) => {
            const isActive = d.day_number === data.selectedDay.day_number;
            // Verde = día DADO (sello de cierre). Ámbar = empezado o con el
            // plan cerrado a medias — todavía cuenta como pendiente.
            const stateColor = dayGiven(d)
              ? '#10B981'
              : d.completion_state === 'in_progress' || d.completion_state === 'closed'
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
                  {new Date(d.session_date + 'T00:00:00').toLocaleDateString('en-US', {
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
                                step_ids: (b as any).step_ids ?? null,
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

          {/* 0. CLASS DAY — the real-world logistics: start time, which beach,
              transport. Feeds the coordinator's transport board and the whole
              team's 7-day agenda (photographer, assistants, support). */}
          <Section icon={CalendarClock} title="Class day" subtitle="Start time, beach, and transport — the team plans around this">
            <div className="space-y-3">
              {/* Stacked (not a 2-col grid): the native iOS time picker renders
                  wider than its cell and used to overlap the beach field. */}
              <label className="block min-w-0">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Class starts at</span>
                <input
                  type="time"
                  value={plan.class_start_time ?? ''}
                  onChange={(e) => commitPlanField('class_start_time', e.target.value || null)}
                  className="w-full min-w-0 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Surf spot / beach</span>
                <VenuePicker
                  value={plan.surf_venue}
                  onChange={(v) => commitPlanField('surf_venue', v)}
                />
              </label>

              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Transport needed?</span>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { v: false, label: 'No — on site' },
                    { v: true, label: '🚐 Yes, we need transport' },
                  ] as const).map((opt) => (
                    <button
                      key={String(opt.v)}
                      type="button"
                      onClick={() => commitPlanField('transport_needed', opt.v)}
                      className="py-2 rounded-lg text-xs font-semibold transition-all"
                      style={
                        plan.transport_needed === opt.v
                          ? { background: '#E0F2FE', color: '#075985', boxShadow: 'inset 0 0 0 2px #0284C7' }
                          : { background: '#F3F4F6', color: '#6B7280' }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {plan.transport_needed === true && (
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-sky-50 border border-sky-200 p-3">
                  <label className="block min-w-0">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-sky-700 mb-1">Departure</span>
                    <input
                      type="time"
                      value={plan.transport_depart ?? ''}
                      onChange={(e) => commitPlanField('transport_depart', e.target.value || null)}
                      className="w-full min-w-0 text-sm px-3 py-2 rounded-lg border border-sky-200 bg-white focus:outline-none"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-sky-700 mb-1">Return</span>
                    <input
                      type="time"
                      value={plan.transport_return ?? ''}
                      onChange={(e) => commitPlanField('transport_return', e.target.value || null)}
                      className="w-full min-w-0 text-sm px-3 py-2 rounded-lg border border-sky-200 bg-white focus:outline-none"
                    />
                  </label>
                  <p className="col-span-2 text-[11px] text-sky-700">
                    The coordinator sees this and books the ride — keep the times realistic.
                  </p>
                </div>
              )}

              {/* Tide reference for THIS class day (same data as the coordinator's
                  dashboard widget). Tapping a suggested window fills the start time. */}
              <TidePlannerHint
                date={data.selectedDay.session_date}
                onPickTime={(hhmm) => commitPlanField('class_start_time', hhmm)}
              />
            </div>
          </Section>

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

              {/* Essentials — just the wave size (ft). Wind + everything else
                  live in "Más detalles". */}
              <SelectField
                label="Wave size (ft)"
                value={plan.venue_wave_size}
                options={WAVE_SIZE_OPTIONS}
                onChange={(v) => commitPlanField('venue_wave_size', v)}
              />

              {/* Everything else is optional context — tucked away so the common
                  case is just the go/no-go call + wave size. */}
              <details className="group rounded-lg border border-gray-100 bg-gray-50/60">
                <summary className="cursor-pointer list-none px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <ChevronRight size={13} className="transition-transform group-open:rotate-90" /> Más detalles (opcional)
                </summary>
                <div className="px-3 pb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <SelectField label="Wind" value={plan.venue_wind} options={WIND_OPTIONS} onChange={(v) => commitPlanField('venue_wind', v)} />
                    <SelectField label="Tide" value={plan.venue_tide} options={TIDE_OPTIONS} onChange={(v) => commitPlanField('venue_tide', v)} />
                    <SelectField label="Crowd" value={plan.venue_crowd} options={CROWD_LEVEL_OPTIONS} onChange={(v) => commitPlanField('venue_crowd', v)} />
                    <SelectField label="Water temp" value={plan.venue_water_temp} options={WATER_TEMP_OPTIONS} onChange={(v) => commitPlanField('venue_water_temp', v)} />
                    <SelectField label="Sky" value={plan.venue_sky} options={SKY_OPTIONS} onChange={(v) => commitPlanField('venue_sky', v)} />
                  </div>

                  {/* M48 — Hazards multi-select. Comma-joined string in the existing TEXT column. */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Hazards (tap any that apply)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {HAZARD_OPTIONS.map((h) => {
                        const selected = (plan.venue_hazards ?? '').split(',').map((s) => s.trim()).filter(Boolean);
                        const isOn = selected.includes(h.value);
                        return (
                          <button
                            key={h.value}
                            type="button"
                            onClick={() => {
                              const next = isOn ? selected.filter((v) => v !== h.value) : [...selected, h.value];
                              commitPlanField('venue_hazards', next.length > 0 ? next.join(', ') : null);
                            }}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                              isOn ? 'bg-[var(--tss-navy)] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
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
              </details>
            </div>
          </Section>

          {/* Espacios de la academia — UNA línea plegada (pedido de Marcelo:
              que resuelva sin cargar la vista). Solo se expande si el coach
              la toca; reserva salones/piscina para ESTE día sin salir del
              planner ni WhatsApp. Multi-reserva; editable en Espacios. */}
          <PlannerSpaces
            token={token}
            date={data.selectedDay.session_date}
            defaultStart={(plan.class_start_time ?? data.camp.scheduled_time ?? '09:00').slice(0, 5)}
            title={(data.camp.camp_name ?? '').split(' · ')[0]}
          />

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
            {(plan.warm_up_drill_id || plan.warm_up_custom) && data.daySummaries.length > 1 && (
              <ApplyToWeekButton
                onApply={() => applyPlanHeaderToWeek(token, data.selectedDay.camp_session_id, {
                  warm_up_drill_id: plan.warm_up_drill_id,
                  warm_up_custom: plan.warm_up_custom,
                })}
              />
            )}
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
  {plan.mental_hack && data.daySummaries.length > 1 && (
              <ApplyToWeekButton
                onApply={() => applyPlanHeaderToWeek(token, data.selectedDay.camp_session_id, { mental_hack: plan.mental_hack })}
              />
            )}
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
                    onSaveNote={(note) => saveInternalNote(s.student_id, note)}
                    onAddBlock={() => addStudentBlock(s.student_id)}
                    onRemoveBlock={(orderIndex) => removeStudentBlock(s.student_id, orderIndex)}
                    onShowDrill={(id) => setDrillDetailId(id)}
                    multiDay={data.daySummaries.length > 1}
                    onApplyBoardToWeek={(board) =>
                      applyStudentBoardToWeek(token, data.selectedDay.camp_session_id, s.student_id, board)
                    }
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
            students={students.map((s) => {
              // objective_text is stored as "<block type> · <title>". The
              // water missions are the blocks whose type is "Water Mission";
              // strip the type prefix to get the mission title.
              const strip = (t: string) => t.replace(/^[^·]+·\s*/, '').trim();
              const isWater = (b: ServicePlanBlock) => /water mission|misi[oó]n de agua/i.test(b.objective_text || '');
              let missions = s.blocks
                .filter(isWater)
                .map((b) => strip(b.objective_text || '') || b.water_drill_custom || '')
                .filter(Boolean);
              // Fallback: no labeled water block → show whatever objectives exist.
              if (missions.length === 0) {
                missions = s.blocks
                  .map((b) => (b.objective_text ? strip(b.objective_text) : (b.water_drill_custom || '')))
                  .filter(Boolean)
                  .slice(0, 2);
              }
              return { name: s.display_name, missions };
            })}
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
            {/* iPad (md:): 2 columnas de alumnos — 4-6 evaluaciones de un
                vistazo. Teléfono: columna única, idéntico a siempre. */}
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-start">
              {students.map((s) => (
                <StudentEvalCard
                  key={s.student_id}
                  student={s}
                  isClosed={isClosed}
                  stpLabel={stpLabel}
                  drillTitle={drillTitle}
                  coachRatings={coachRatings[s.student_id] ?? {}}
                  onCommit={(orderIndex, patch) => commitStudentBlock(s.student_id, orderIndex, patch)}
                  onSaveNote={(note) => saveInternalNote(s.student_id, note)}
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

      {/* Sticky footer — sits at the very bottom (the global tab-nav is hidden
          while the planner is open), with iPhone safe-area padding. */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pt-2 z-40 border-t border-gray-200"
        style={{ background: 'white', paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
      >
        <div className="max-w-lg md:max-w-4xl mx-auto flex gap-2">
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

          {/* IN PROGRESS + evaluating → save & leave · edit plan · finalize */}
          {state === 'in_progress' && !editingPlan && (
            <>
              {/* Everything autosaves on blur, so leaving never loses work.
                  This makes that explicit — pause the eval, finish it later
                  (e.g. in the video-analysis session). */}
              {/* Compact on phones: two small secondary actions + the primary
                  Finalize takes the rest of the row (no more 2-line wrapping). */}
              <button
                type="button"
                onClick={() => { flash('✓ Saved — finish it whenever'); onBack(); }}
                disabled={pending}
                className="shrink-0 py-2.5 px-3 text-[12px] font-semibold rounded-xl border inline-flex flex-col items-center gap-0.5 leading-none"
                style={{ borderColor: '#CBD5E1', color: '#475569' }}
                title="Save & finish later"
              >
                <Check size={15} strokeWidth={2} />
                Later
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={pending}
                className="shrink-0 py-2.5 px-3 text-[12px] font-semibold rounded-xl border inline-flex flex-col items-center gap-0.5 leading-none"
                style={{ borderColor: BRAND.colors.navy, color: BRAND.colors.navy }}
                title="Edit plan"
              >
                <Pencil size={15} strokeWidth={1.75} />
                Edit
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
              Finalized{plan.closed_at ? ` · ${displayDate(plan.closed_at)}` : ''}
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
  students,
}: {
  plan: ServicePlanData['plan'];
  warmUpLabel: string | null | undefined;
  mentalLabel: string | null | undefined;
  students: { name: string; missions: string[] }[];
}) {
  const hhmm = (t: string | null) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  };
  const classTime = hhmm(plan.class_start_time);
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
        {/* Class day — the real logistics at a glance (M137). */}
        {(classTime || plan.surf_venue || plan.transport_needed) && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-100 px-2.5 py-2">
            {classTime && (
              <span className="text-[11px] font-semibold text-sky-800 inline-flex items-center gap-1">
                <CalendarClock size={12} /> {classTime}
              </span>
            )}
            {plan.surf_venue && (
              <span className="text-[11px] text-sky-800 inline-flex items-center gap-1">
                <MapPin size={12} /> {plan.surf_venue}
              </span>
            )}
            {plan.transport_needed && (
              <span className="text-[11px] text-sky-800 inline-flex items-center gap-1">
                🚐 {hhmm(plan.transport_depart) ?? '—'} / {hhmm(plan.transport_return) ?? '—'}
                {plan.transport_status === 'cancelled' ? ' (cancelled)' : ''}
              </span>
            )}
          </div>
        )}
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

        {/* Per-student water missions (M137) — so an assembled plan shows what
            each student is set to surf, not just the group read. */}
        {students.some((s) => s.missions.length > 0) && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1 inline-flex items-center gap-1">
              <Users size={11} strokeWidth={1.75} /> Missions per student
            </p>
            <div className="space-y-1">
              {students.map((s, i) => (
                <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1.5">
                  <p className="text-[12px] font-semibold text-[var(--tss-navy)] leading-tight">{s.name}</p>
                  {s.missions.length > 0 ? (
                    s.missions.map((m, j) => (
                      <p key={j} className="text-[11px] text-gray-600 leading-snug">🌊 {m}</p>
                    ))
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">No mission set yet</p>
                  )}
                </div>
              ))}
            </div>
          </div>
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

// M134 — "plan once, use all week": copies the warm-up / mental hack to every
// non-closed day of the camp.
function ApplyToWeekButton({
  onApply,
  label = '📅 Use this for the whole week',
  doneLabel = '✓ Applied to the whole week',
}: {
  onApply: () => Promise<{ ok: boolean; days?: number; skipped?: number; error?: string }>;
  label?: string;
  doneLabel?: string;
}) {
  // 'done' is sticky — reverting the ✓ after a timeout read as "it un-applied
  // itself" to coaches, even though the save had succeeded. The button stays
  // confirmed (and clickable, in case they change the board and re-apply).
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle');
  return (
    <button
      type="button"
      disabled={state === 'saving'}
      onClick={async () => {
        setState('saving');
        try {
          const r = await onApply();
          if (!r.ok) { alert(r.error || 'Could not apply.'); setState('idle'); return; }
          if (r.skipped && r.skipped > 0) {
            alert(`Aplicado a ${r.days} día(s). ${r.skipped} día(s) quedaron sin esa tabla porque ya estaba asignada a otro servicio ese día.`);
          }
          setState('done');
        } catch { setState('idle'); }
      }}
      className="mt-2 w-full py-2 rounded-lg border border-dashed text-[12px] font-semibold transition-colors disabled:opacity-70"
      style={state === 'done'
        ? { borderColor: '#10B981', color: '#047857', background: '#ECFDF5' }
        : { borderColor: '#5AC3E7', color: '#0369A1', background: 'white' }}
    >
      {state === 'done' ? doneLabel : state === 'saving' ? 'Applying…' : label}
    </button>
  );
}

// ─── Form fields ──────────────────────────────────────────────────

// M133 — surf-spot picker: a dropdown of the academy's known spots, plus an
// "Other…" option that reveals a free text input for anything not listed. A
// stored value that isn't in the list is treated as a custom entry.
function VenuePicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const known = (SURF_SPOT_OPTIONS as readonly string[]).includes(value ?? '');
  const [custom, setCustom] = useState(!!value && !known);
  const [text, setText] = useState(value && !known ? value : '');
  useEffect(() => {
    const isKnown = (SURF_SPOT_OPTIONS as readonly string[]).includes(value ?? '');
    setCustom(!!value && !isKnown);
    setText(value && !isKnown ? value : '');
  }, [value]);

  return (
    <div className="space-y-1.5">
      <select
        value={custom ? '__other__' : (value ?? '')}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '__other__') { setCustom(true); onChange(text || null); }
          else { setCustom(false); onChange(v || null); }
        }}
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
      >
        <option value="">—</option>
        {SURF_SPOT_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
        <option value="__other__">Other…</option>
      </select>
      {custom && (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onChange(text.trim() || null)}
          placeholder="Type the spot"
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
        />
      )}
    </div>
  );
}

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

// Estatura y peso son texto libre, y la mayoría de los alumnos son de EE.UU.:
// 1.643 de 2.615 escribieron la estatura en pies. Pegarle "cm" a `6'2''` daba
// «6'2'' cm», y pegarle "kg" a `175` —que son libras— convertía a un surfista
// de 79 kg en uno de 175. El coach elige la tabla con estos dos números, así
// que no podemos afirmar una unidad que el dato no trae.
//
// Regla: si el valor ya se autodescribe, se muestra tal cual. Si es un número
// pelado dentro del rango donde la unidad es inequívoca, se etiqueta. Y si es
// un número pelado ambiguo, se dice la duda en vez de resolverla a la fuerza.
const CARRIES_UNIT = /['"’”]|\bft\b|feet|\bin\b|\bcm\b|\bm\b|\bkg\b|\blbs?\b|pound/i;

// Ojo con el tipo: la columna es texto en la base aunque acá esté declarada
// como número, así que en runtime llega cualquiera de los dos.
function measure(raw: string | number | null | undefined, unit: 'cm' | 'kg'): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (CARRIES_UNIT.test(s)) return s;
  const n = Number(s.replace(',', '.'));
  if (!Number.isFinite(n)) return s;
  if (unit === 'cm') {
    // Un adulto de 120–230 solo puede estar en cm. Fuera de ahí (p. ej. "6"),
    // son pies y mostrarlo con "cm" sería peor que no decir nada.
    return n >= 120 && n <= 230 ? `${s} cm` : s;
  }
  // Nadie que llega a un surf camp pesa más de 120 kg (=265 lb): arriba de eso
  // son libras casi con certeza, pero "casi" no alcanza para un dato de tabla.
  return n <= 120 ? `${s} kg` : `${s} lb?`;
}

function StudentProfilePanel({ student, onSaveNote }: { student: ServicePlanStudent; onSaveNote?: (note: string) => void }) {
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
    profile.age && `${profile.age} yrs`,
    // El coach elige la tabla con estos dos números — no podemos etiquetarlos mal.
    measure(profile.weight, 'kg'),
    measure(profile.height, 'cm'),
    profile.nationality && `🌍 ${profile.nationality}`,
    (profile.goofy_or_regular || profile.stance) &&
      `${profile.goofy_or_regular || profile.stance}`,
    profile.surf_experience_years != null &&
      `${profile.surf_experience_years} yr exp`,
    profile.surf_frequency && `surfs: ${profile.surf_frequency}`,
    profile.swim_level && `swim: ${profile.swim_level}`,
    profile.board_type && `🛹 ${profile.board_type}`,
    profile.favorite_wave_size && `fav wave: ${profile.favorite_wave_size}`,
    // "water comfort" (self-reported ocean_level) — labeled so it never reads
    // as the student's belt/level (they're independent axes).
    profile.ocean_level && `water comfort: ${String(profile.ocean_level).replace(/_/g, ' ')}`,
    profile.learning_profile_primary &&
      `learns: ${profile.learning_profile_primary}`,
    profile.level_quiz_score != null && `level quiz: ${profile.level_quiz_score}/70`,
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

          {/* Media consent — the coach films/photographs, so this must be
              impossible to miss when the student opted out. */}
          {profile.media_release_consent === false && (
            <div className="rounded-md bg-red-50 border border-red-200 p-2">
              <p className="text-[11px] font-semibold text-red-700 inline-flex items-center gap-1">
                <AlertTriangle size={11} strokeWidth={2} />
                No photos / video — student did not authorize media use
              </p>
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
                          ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(rs.date) ? rs.date + 'T00:00:00' : rs.date).toLocaleDateString('en-US', {
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
                        {/* 🎯 Hilo de progresión: el "next focus" que dejó el
                            coach de ESA sesión — plan the day from here. */}
                        {rs.whats_next && (
                          <span className="block text-cyan-700">🎯 {rs.whats_next}</span>
                        )}
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

          {/* Coach notes — Focus/Next are auto-derived (read-only); the
              internal note is editable and coach-only (the student never
              sees it), so the next coach gets real context. */}
          <div className="space-y-2">
            {(profile.current_focus_area || profile.next_recommended_focus) && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
                  Coach notes
                </p>
                {profile.current_focus_area && <ProfileLine label="Focus now" value={profile.current_focus_area} />}
                {profile.next_recommended_focus && <ProfileLine label="Next" value={profile.next_recommended_focus} />}
              </div>
            )}
            {onSaveNote && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
                <TextArea
                  label="Internal note · next coach only (student can't see)"
                  value={profile.coach_notes_general}
                  onBlur={(v) => onSaveNote(v)}
                  placeholder="e.g. Gets frustrated when it gets hard — short wins help. This cue worked: …"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Ficha incompleta: decir POR QUÉ no hay metas/miedos y dar el
              link de intake para resolverlo ahí mismo (coach o recepción). */}
          {goals.length === 0 && !profile.fears_phobias && !(profile as any).intake_completed_at && (
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,209,102,.16)' }}>
              <p className="text-[11px] leading-snug" style={{ color: '#7a5c00' }}>
                <strong>Intake incompleto</strong> — este alumno aún no llenó sus metas, miedos ni info médica. Pedile que complete su intake antes de la sesión (o avisá a recepción).
              </p>
              {(profile as any).intake_url && (
                <button type="button"
                  onClick={() => navigator.clipboard.writeText((profile as any).intake_url).then(() => alert('Link de intake copiado — mandáselo por WhatsApp.')).catch(() => {})}
                  className="mt-1.5 text-[10px] font-bold underline" style={{ color: '#8a6d1c' }}>
                  📋 Copiar link de intake
                </button>
              )}
            </div>
          )}
          {quickFacts.length === 0 && !hasMedical && goals.length === 0 && (profile as any).intake_completed_at && (
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
  onSaveNote,
  multiDay,
  onApplyBoardToWeek,
}: {
  student: ServicePlanStudent;
  stpCatalog: ServicePlanData['stpCatalog'];
  availableDrills: ServicePlanData['availableDrills'];
  availableBoards: ServicePlanData['availableBoards'];
  boardConflictIds: string[];
  onSaveNote: (note: string) => void;
  templateBlocks: ServicePlanData['templatePlan'][number]['blocks'];
  onCommit: (orderIndex: number, patch: Partial<ServicePlanBlock>) => void;
  onAddBlock: () => void;
  onRemoveBlock: (orderIndex: number) => void;
  onShowDrill: (drillId: string) => void;
  multiDay: boolean;
  onApplyBoardToWeek: (board: { board_id: string | null; board_type: string | null; board_size_feet: number | null; board_size_inches: number | null }) => Promise<{ ok: boolean; days?: number; skipped?: number; error?: string }>;
}) {
  const [showFullPlan, setShowFullPlan] = useState(false);
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
      <StudentProfilePanel student={student} onSaveNote={onSaveNote} />

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
                    Usually rides:{' '}
                    <span className="font-semibold text-[var(--tss-navy)]">
                      {ref}
                    </span>
                  </p>
                );
              })()}
            </div>
            {/* M134 — one decision: the student's own board, or one from the
                academy fleet. Sizes come along automatically (intake profile
                for own board, inventory record for academy boards); manual
                tweaks live behind "Adjust manually". */}
            {(() => {
              const p = student.profile;
              const mode = firstBlock.board_id ? 'academy' : firstBlock.board_type ? 'own' : null;
              const conflicts = new Set(boardConflictIds);
              const options = availableBoards
                .filter((b) => b.id === firstBlock.board_id || (b.status !== 'in_repair' && !conflicts.has(b.id)))
                .map((b) => ({
                  value: b.id,
                  label: `${b.code}${b.length_feet ? ` · ${b.length_feet}'${b.length_inches || ''}` : ''}${b.volume_liters ? ` · ${b.volume_liters}L` : ''}`,
                }));
              const picked = availableBoards.find((b) => b.id === firstBlock.board_id);
              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onCommit(firstBlock.order_index, {
                        board_id: null,
                        board_type: p.board_type ?? 'own',
                        board_size_feet: p.board_length_feet ? parseInt(p.board_length_feet, 10) || null : null,
                        board_size_inches: p.board_length_inches ? parseInt(p.board_length_inches, 10) || null : null,
                      })}
                      className="py-2 rounded-lg text-xs font-semibold transition-all"
                      style={mode === 'own'
                        ? { background: '#E0F2FE', color: '#075985', boxShadow: 'inset 0 0 0 2px #0284C7' }
                        : { background: '#F3F4F6', color: '#6B7280' }}
                    >
                      🏄 Tabla propia
                    </button>
                    <div className={mode === 'academy' ? '' : 'opacity-80'}>
                      <SelectField
                        label=""
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
                    </div>
                  </div>
                  {mode === 'academy' && picked && (
                    <p className="text-[10px] text-gray-500">Asignada: <span className="font-semibold">{picked.code}</span>{firstBlock.board_size_feet ? ` · ${firstBlock.board_size_feet}'${firstBlock.board_size_inches ?? ''}` : ''}</p>
                  )}
                  {mode === 'own' && (
                    <p className="text-[10px] text-gray-500">
                      Own board{firstBlock.board_size_feet ? ` · ${firstBlock.board_size_feet}'${firstBlock.board_size_inches ?? ''}` : ''}
                    </p>
                  )}
                  <details className="group">
                    <summary className="cursor-pointer list-none text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <ChevronRight size={11} className="transition-transform group-open:rotate-90" /> Adjust manually
                    </summary>
                    <div className="grid grid-cols-3 gap-2 mt-2">
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
                        onChange={(v) => onCommit(firstBlock.order_index, { board_size_feet: v ? parseInt(v, 10) : null })}
                      />
                      <SelectField
                        label="Inches"
                        value={firstBlock.board_size_inches != null ? String(firstBlock.board_size_inches) : null}
                        options={BOARD_SIZE_INCHES_OPTIONS.map((n) => ({ value: String(n), label: `${n}"` }))}
                        onChange={(v) => onCommit(firstBlock.order_index, { board_size_inches: v ? parseInt(v, 10) : null })}
                      />
                    </div>
                  </details>
                </div>
              );
            })()}
            {/* M136 — assign this board once, reuse it every day of the camp. */}
            {multiDay && (firstBlock.board_type || firstBlock.board_id) && (
              <ApplyToWeekButton
                label="📅 Usar esta tabla toda la semana"
                doneLabel="✓ Tabla aplicada toda la semana"
                onApply={() => onApplyBoardToWeek({
                  board_id: firstBlock.board_id,
                  board_type: firstBlock.board_type,
                  board_size_feet: firstBlock.board_size_feet,
                  board_size_inches: firstBlock.board_size_inches,
                })}
              />
            )}
          </div>
        );
      })()}

      {/* M45/M134 — One BlockEditor per block. After a template lands many
          blocks, the daily view opens with ONLY the water missions (what the
          coach actually adapts per student); "Ver plan completo" expands the
          rest (warm-up, mental, land drills, closing). */}
      {(() => {
        const isWater = (b: ServicePlanBlock) => {
          const tb = templateBlocks.find((t) => t.block_order === b.order_index);
          const label = `${tb?.block_type ?? ''} ${tb?.pilar ?? ''}`.toLowerCase();
          if (label.includes('water') || label.includes('agua')) return true;
          return !!(b.water_drill_id || b.water_drill_custom);
        };
        const waterBlocks = blocks.filter(isWater);
        const collapsible = blocks.length > 2 && waterBlocks.length > 0 && waterBlocks.length < blocks.length;
        const visible = collapsible && !showFullPlan ? waterBlocks : blocks;
        return (
          <>
            {collapsible && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  {showFullPlan ? `Full plan · ${blocks.length} blocks` : `🌊 Water missions · ${waterBlocks.length} of ${blocks.length} blocks`}
                </p>
                <button
                  type="button"
                  onClick={() => setShowFullPlan(!showFullPlan)}
                  className="text-[11px] font-semibold text-[var(--tss-cyan,#0369A1)] underline underline-offset-2"
                >
                  {showFullPlan ? 'Ver solo agua' : 'Ver plan completo'}
                </button>
              </div>
            )}
            <div className="space-y-3">
              {visible.map((b) => (
                <BlockEditor
                  key={b.id ?? `new-${b.order_index}`}
                  block={b}
                  blockNumber={blocks.indexOf(b) + 1}
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
            {(!collapsible || showFullPlan) && (
              <button
                type="button"
                onClick={onAddBlock}
                className="w-full py-2 rounded-lg border-2 border-dashed border-gray-300 text-[12px] text-gray-500 hover:border-[var(--tss-navy)] hover:text-[var(--tss-navy)] transition-colors"
              >
                + Add another block
              </button>
            )}
          </>
        );
      })()}
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
          {/* Agrupado por SECUENCIA con el rótulo de la fuente única. */}
          {groupCatalogBySequence(stpCatalog).map((g) => (
            <optgroup key={g.key} label={g.label}>
              {g.items.map((stp) => (
                <option key={stp.id} value={stp.id}>
                  {stp.id} · {stp.title}
                </option>
              ))}
            </optgroup>
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
  onSaveNote,
}: {
  student: ServicePlanStudent;
  isClosed: boolean;
  stpLabel: (id: string | null) => string | null;
  drillTitle: (id: string | null) => string | null;
  coachRatings: Record<string, number>;
  onCommit: (orderIndex: number, patch: Partial<ServicePlanBlock>) => void;
  onRateStep: (stepId: string, rating: number) => void;
  onShowDrill: (drillId: string) => void;
  onSaveNote: (note: string) => void;
}) {
  const blocks = student.blocks;
  // General per-student analysis lives on block 0. For services with no planned
  // blocks (e.g. a Discover Surfing lesson) there is no block yet, so we default
  // to order 0 — commitStudentBlock creates it on first save.
  const gen = (blocks[0] ?? null) as any;
  const genOrder = blocks[0]?.order_index ?? 0;

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
      </div>

      {/* Profile / bitácora — context while evaluating */}
      <StudentProfilePanel student={student} onSaveNote={onSaveNote} />

      {/* M49 — Session-level Focus + Flow (one per student per day, not
          per block). Saved on block 0 just like the board fields. */}
      {/* Always available — works for belt camps AND simple lessons (Discover
          Surfing) that have no planned blocks. Saved on block 0. */}
      {(
        <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--tss-cyan,#5AC3E7)] font-semibold">
            Session summary — general analysis
          </p>

          {/* Session-level objective completion (one per student, not per block).
              STP star grading moved to the end-of-camp evaluation. */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Did they meet today&apos;s objective?
            </label>
            <div className="grid grid-cols-3 gap-1">
              {([
                { v: 'achieved', label: 'Achieved', bg: '#D1FAE5', fg: '#047857' },
                { v: 'partial', label: 'Partial', bg: '#FEF3C7', fg: '#92400E' },
                { v: 'not_yet', label: 'Not yet', bg: '#FEE2E2', fg: '#991B1B' },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  disabled={isClosed}
                  onClick={() => onCommit(genOrder, { day_objective_status: opt.v } as any)}
                  className="py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-70"
                  style={
                    (gen?.day_objective_status) === opt.v
                      ? { background: opt.bg, color: opt.fg, boxShadow: 'inset 0 0 0 2px ' + opt.fg }
                      : { background: 'white', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

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
                  onClick={() => onCommit(genOrder, { focus_level: n })}
                  className="py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-70"
                  style={
                    gen?.focus_level === n
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
                    onCommit(genOrder, { flow_channel: opt.n })
                  }
                  className="py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-70"
                  style={
                    gen?.flow_channel === opt.n
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

          {/* Internal coach note (M135) — bitácora only, coach + next coach. */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 space-y-2.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 inline-flex items-center gap-1">
              <Lock size={10} /> Internal · not sent to the student
            </p>
            <TextArea
              label="Coach feedback (optional)"
              value={gen?.notes_post ?? ''}
              onBlur={(v) => onCommit(genOrder, { notes_post: v })}
              placeholder="e.g. Great pop-up, much steadier stance today"
              rows={2}
              disabled={isClosed}
            />
          </div>

          {/* SEGUIMIENTO (obligatorio) — esto SÍ lo ve el alumno como su
              "Next Focus" y es el punto de partida del próximo coach. */}
          <div className="rounded-lg bg-cyan-50/60 border border-cyan-200 p-2.5 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-700">
              🎯 Next focus · required — the student sees this
            </p>
            <TextArea
              label="What to work on next *"
              value={gen?.whats_next ?? ''}
              onBlur={(v) => onCommit(genOrder, { whats_next: v } as any)}
              placeholder="e.g. Next session: angle take-offs, look down the line"
              rows={2}
              disabled={isClosed}
            />
            <p className="text-[9px] text-cyan-700/70 italic">
              One specific line for {student.display_name} — what should the next session focus on?
            </p>
          </div>
        </div>
      )}

      {/* Per-step (STP) grading moved to the end-of-camp Final Evaluation —
          the daily flow stays light. BlockEvalSection is no longer rendered here. */}
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

      {/* Evaluation only on GRADABLE blocks (sequence steps). Non-gradable
          blocks (warm-up, free play, etc.) are just executed — no status,
          no stars. */}
      {block.step_id ? (
        <>
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

          {/* M45 — Inline OFFICIAL step rating (TSS cyan) per block. */}
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
        </>
      ) : (
        <p className="text-[10px] text-gray-400 italic">
          Not a sequence step — executed only, no grading.
        </p>
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

// ─── Espacios dentro del planner — UNA línea plegada ─────────────────
// Pedido de Marcelo (2026-08-09): que resuelva la reserva de salones/piscina
// sin cargar la vista. Cerrada = una línea; abierta = chips de espacios +
// hora + reservar (multi-reserva). Usa el sistema de Espacios existente
// (misma tabla + protección anti-choques); editable en la pestaña Espacios.
function plusOneHour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const hh = Math.min((Number.isNaN(h) ? 9 : h) + 1, 23);
  return `${String(hh).padStart(2, '0')}:${String(Number.isNaN(m) ? 0 : m).padStart(2, '0')}`;
}

function PlannerSpaces({ token, date, defaultStart, title }: {
  token: string; date: string; defaultStart: string; title: string;
}) {
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState<AcademySpace[] | null>(null);
  const [bookings, setBookings] = useState<SpaceBooking[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [from, setFrom] = useState(defaultStart || '09:00');
  const [to, setTo] = useState(plusOneHour(defaultStart || '09:00'));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    listSpacesByToken(token).then(setSpaces).catch(() => setSpaces([]));
    listBookingsForDayByToken(token, date).then(setBookings).catch(() => setBookings([]));
  };
  useEffect(() => {
    if (open && spaces === null) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fmtT = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/El_Salvador' });
  const spaceName = (id: string) => spaces?.find((s) => s.id === id)?.name ?? 'Espacio';

  const book = () => {
    if (!sel) { setErr('Elegí un espacio primero.'); return; }
    setBusy(true); setErr(null);
    createBookingByToken(token, { spaceId: sel, date, startTime: from, endTime: to, title })
      .then((r) => {
        setBusy(false);
        if (!r.ok) { setErr(r.error ?? 'No se pudo reservar.'); return; }
        setSel(null);
        load();
      })
      .catch(() => { setBusy(false); setErr('No se pudo reservar.'); });
  };

  const cancel = (id: string) => {
    setBusy(true);
    cancelBookingByToken(token, id).then((r) => {
      setBusy(false);
      if (!r.ok) { setErr(r.error ?? 'No se pudo cancelar.'); return; }
      load();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Línea plegada — cero carga visual hasta que el coach la toca. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-[var(--tss-navy)]">
          🏛 Espacios · Reservar para esta clase
          {bookings && bookings.length > 0 ? ` (${bookings.length})` : ''}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{open ? 'Cerrar' : 'Abrir'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {spaces === null ? (
            <p className="text-[12px] text-gray-400">Cargando espacios…</p>
          ) : spaces.length === 0 ? (
            <p className="text-[12px] text-gray-400">Tu academia aún no tiene espacios configurados.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {spaces.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSel(sel === sp.id ? null : sp.id)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
                    style={sel === sp.id
                      ? { background: '#00D2FF', borderColor: '#00D2FF', color: '#061C2B' }
                      : { background: 'white', borderColor: '#E5E7EB', color: '#55666E' }}
                  >
                    {sp.name}
                  </button>
                ))}
              </div>

              {sel && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[11px] text-gray-500">Desde</label>
                  <input type="time" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white" />
                  <label className="text-[11px] text-gray-500">Hasta</label>
                  <input type="time" value={to} onChange={(e) => setTo(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white" />
                  <button type="button" disabled={busy} onClick={book}
                    className="px-4 py-2 rounded-full text-[12px] font-bold text-white disabled:opacity-50"
                    style={{ background: 'var(--tss-navy, #061C2B)' }}>
                    {busy ? 'Reservando…' : `Reservar ${spaceName(sel)} ✓`}
                  </button>
                </div>
              )}

              {err && <p className="text-[11px] font-semibold text-rose-600">{err}</p>}

              {bookings && bookings.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Reservado para este día</p>
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[12px]"
                      style={{ background: 'rgba(6,214,160,.08)' }}>
                      <span className="min-w-0 truncate text-gray-700">
                        <strong>{spaceName(b.space_id)}</strong> · {fmtT(b.starts_at)}–{fmtT(b.ends_at)}
                        {b.title ? ` · ${b.title}` : ''}{b.coach_name ? ` — ${b.coach_name}` : ''}
                      </span>
                      <button type="button" disabled={busy} onClick={() => cancel(b.id)}
                        className="shrink-0 text-rose-500 font-bold text-[13px] disabled:opacity-40" aria-label="Cancelar reserva">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-gray-400 italic">
                Podés reservar varios espacios a distintas horas. Si uno choca con otra reserva, la app te avisa. Editable también en la pestaña Espacios.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Grupos de secuencia para el select del foco (el catálogo ya viene ordenado
// por secuencia). Pasos sin secuencia caen a "Other".
function groupCatalogBySequence(stps: ServicePlanData['stpCatalog']) {
  const groups: Array<{ key: string; label: string; items: ServicePlanData['stpCatalog'] }> = [];
  for (const stp of stps) {
    const key = stp.wb_sequence_id ?? '_none';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(stp);
    else groups.push({
      key,
      label: stp.wb_sequence_id
        ? sequenceLabel(stp.wb_sequence_id, stp.wb_sequence_order, stp.wb_sequence_name ?? '')
        : 'Other',
      items: [stp],
    });
  }
  return groups;
}
