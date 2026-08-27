import { getStudent, checkCoachAccessToStudent } from '@/lib/actions/students';
import { getStudentLevelAccess } from '@/lib/actions/access';
import { getQuizAttempts } from '@/lib/actions/quiz-lead';
import { getStudentVisitStats } from '@/lib/actions/students';
import { PriorVisitsEditor } from '@/components/student/PriorVisitsEditor';
import { getSequenceEvaluationHistory, getOceanLevelHistory } from '@/lib/actions/evaluations';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { OpenAsButton } from '@/components/admin/OpenAsButton';
import { PromoteLeadCard } from '@/components/student/PromoteLeadCard';
import { createClient } from '@/lib/supabase/server';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import { LevelAccessCard } from '@/components/student/LevelAccessCard';
import { PhotoUploader } from '@/components/shared/PhotoUploader';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { ProfileTabs } from '@/components/student/ProfileTabs';
import { CopyIntakeLinkButton } from '@/components/student/CopyIntakeLinkButton';
import { PlanSessionButton } from '@/components/student/PlanSessionButton';
import { SequenceEvaluationPanel } from '@/components/student/SequenceEvaluationPanel';
import { OceanLevelPanel } from '@/components/student/OceanLevelPanel';
import { groupBySequence, sequenceVerdict } from '@/lib/constants/learning-blocks';
import { WaterTestsPanel } from '@/components/student/WaterTestsPanel';
import { SessionHistoryPanel } from '@/components/student/SessionHistoryPanel';
import { CourseProgressPanel } from '@/components/student/CourseProgressPanel';
import { CoursesPanel } from '@/components/student/CoursesPanel';
import { StudentPresentationGrants } from './StudentPresentationGrants';
import { StudentHPPanel } from '@/components/student/StudentHPPanel';
import { StudentActivitySummary } from '@/components/student/StudentActivitySummary';
import { listStudentCourseGrants } from '@/lib/actions/course-grants';
import { getCampNotesForStudent } from '@/lib/actions/camps';
import { PortalActivityPanel } from '@/components/student/PortalActivityPanel';
import { MembershipPanel } from '@/components/student/MembershipPanel';
import { getMembershipInfo } from '@/lib/actions/memberships';
import { LearningProfileCard } from '@/components/student/LearningProfileCard';
import { OfficialEvaluationPanel } from '@/components/student/OfficialEvaluationPanel';
import { ArchiveSessionButton } from '@/components/session/ArchiveSessionButton';
import type { LearningChannel } from '@/lib/constants/learning-profiles';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Hourglass,
  CircleDot,
  Star,
  GraduationCap,
  Waves,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function StudentProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const search = await searchParams;
  const justCreated = search.created === 'true';

  // Time-bounded access check (M3): coach can only see students in their
  // active service window. Coordinator/admin/platform_admin: always allowed
  // (within their academy).
  const access = await checkCoachAccessToStudent(id);
  if (access === 'expired') {
    return (
      <div className="max-w-md mx-auto p-6 text-center mt-8">
        <Hourglass
          size={36}
          strokeWidth={1.75}
          className="mx-auto mb-3 text-[var(--tss-cyan,#5AC3E7)]"
        />
        <h2
          className="text-xl font-bold text-[var(--tss-navy)] mb-2 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Access expired
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You can only view this student during the service window you&apos;re
          assigned to (from the start of the service until 1 day after it
          ends). Ask the coordinator to assign you again or wait for the next
          camp.
        </p>
        <Link
          href="/students"
          className="inline-flex items-center gap-1 mt-4 text-xs text-[var(--tss-navy)] hover:underline"
        >
          <ArrowLeft size={12} strokeWidth={1.75} />
          Back to your students
        </Link>
      </div>
    );
  }
  if (access === 'wrong-academy') {
    notFound();
  }

  let student;
  try {
    student = await getStudent(id);
  } catch {
    notFound();
  }

  const supabase = await createClient();

  // Get coach (may fail if user is not a coach, e.g. admin-only)
  let coach: any = null;
  try {
    coach = await getCurrentCoach();
  } catch {
    // Not a coach — evaluation buttons won't show
  }

  // Final-evaluation camp notes (coach/bitácora only — includes the private note)
  const campNotes = await getCampNotesForStudent(id);

  // Public surf-level quiz history (incl. retakes) tied to this profile.
  const quizAttempts = await getQuizAttempts(id);

  // Relationship / loyalty — visits (trips), total days, first/last seen.
  const visitStats = await getStudentVisitStats(id);

  const [
    levelAccess,
    standaloneResult,
    cascadeResult,
    seqHistory,
    oceanHistory,
    selfTrainingResult,
    stepRatingsResult,
    lessonProgressResult,
    multiBlockResult,
    stpLessonsResult,
    finalQuizResult,
  ] = await Promise.all([
    getStudentLevelAccess(id),
    // Standalone session results
    supabase
      .from('student_session_results')
      .select(`
        id, status, focus_rating, mission,
        coach_feedback, homework, whats_next, created_at, coach_id,
        standalone_sessions(mission, training_venue, session_date, pilar, duration_minutes),
        coaches:coach_id(display_name)
      `)
      .eq('student_id', id)
      .eq('completion_state', 'closed')
      .order('created_at', { ascending: false })
      .limit(50),
    // Cascade session results
    supabase
      .from('cascade_sessions')
      .select(`
        id, mission, pilar_id_snapshot, status,
        session_date, training_venue, total_duration,
        coach_feedback_text, homework_text, homework_cues,
        coaches:coach_id(display_name)
      `)
      .eq('student_id', id)
      .eq('completion_state', 'closed')
      .order('created_at', { ascending: false })
      .limit(50),
    getSequenceEvaluationHistory(id, 10).catch(() => []),
    getOceanLevelHistory(id, 10).catch(() => []),
    // Portal activity: self-training sessions logged by the student alone
    supabase
      .from('self_training_sessions')
      .select(
        'id, drill_name, duration_minutes, execution_rating, mission_completion, intention_text, completed, created_at, linked_step_id, kind'
      )
      .eq('student_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    // Portal activity: student self-ratings of sequence steps + official coach ratings
    supabase
      .from('student_step_ratings')
      .select('step_id, current_rating, coach_rating, coach_rated_at, last_updated')
      .eq('student_id', id)
      .order('current_rating', { ascending: true }),
    // Portal activity: lessons the student completed (with title + section)
    supabase
      .from('lesson_progress')
      .select(
        'lesson_id, completed, completed_at, quiz_score, lessons:lesson_id(title, course_section)'
      )
      .eq('student_id', id)
      .eq('completed', true)
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(20),
    // Multi-block sessions: planned/in-progress (active) + recent closed
    supabase
      .from('multi_block_sessions')
      .select(
        'id, session_date, training_venue, completion_state, total_planned_minutes, total_actual_minutes, general_coach_feedback, general_homework, general_whats_next, created_at, coach_id, coaches:coach_id(display_name)'
      )
      .eq('student_id', id)
      .order('created_at', { ascending: false })
      .limit(30),
    // M4: STP catalog for OfficialEvaluationPanel (rows to rate).
    // Estaba fijado a white_belt: un alumno de Blue tiene 55 pasos y el coach
    // veía 25 en su ficha. Ahora trae las tres cintas y el panel las agrupa
    // por secuencia, la misma lectura que ve el alumno en su portal.
    supabase
      .from('lessons')
      .select(
        'id, title, step_number, course_section, wb_sequence_id, wb_sequence_name, wb_sequence_order, sequence_step_order'
      )
      .in('course_section', ['white_belt', 'yellow_belt', 'blue_belt'])
      .eq('active', true)
      .order('step_number'),
    // Portal activity: course final-exam attempts (belt exit tests)
    supabase
      .from('course_final_quiz_attempts')
      .select('course_key, score, total, passed, created_at')
      .eq('student_id', id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  // Merge and sort all sessions for the unified history
  const standaloneEntries = (standaloneResult.data ?? []).map((r: any) => ({
    id: r.id,
    source: 'standalone' as const,
    date: r.standalone_sessions?.session_date || r.created_at,
    coachName: r.coaches?.display_name || null,
    // Camp/service session results store their focus in `mission`;
    // standalone sessions store it on the joined row.
    mission: r.standalone_sessions?.mission || r.mission || 'Camp session',
    pilar: r.standalone_sessions?.pilar || null,
    status: r.status,
    coachFeedback: r.coach_feedback || null,
    homework: r.homework || null,
    whatsNext: r.whats_next || null,
    duration: r.standalone_sessions?.duration_minutes || null,
    venue: r.standalone_sessions?.training_venue || null,
  }));

  const cascadeEntries = (cascadeResult.data ?? []).map((c: any) => ({
    id: c.id,
    source: 'cascade' as const,
    date: c.session_date || c.created_at,
    coachName: c.coaches?.display_name || null,
    mission: c.mission || null,
    pilar: c.pilar_id_snapshot || null,
    status: c.status || null,
    coachFeedback: c.coach_feedback_text || null,
    homework: [
      c.homework_cues?.length ? c.homework_cues.join(', ') : null,
      c.homework_text,
    ].filter(Boolean).join(' — ') || null,
    whatsNext: null,
    duration: c.total_duration || null,
    venue: c.training_venue || null,
  }));

  // M156 — estado de membresía para el panel del perfil
  const membershipInfo = await getMembershipInfo(student.id);

  // Portal activity — shaped for PortalActivityPanel
  const selfTraining = (selfTrainingResult.data ?? []).map((s: any) => ({
    id: s.id,
    date: s.completed_at || s.created_at,
    drill_name: s.drill_name,
    duration_minutes: s.duration_minutes,
    execution_rating: s.execution_rating,
    mission_completion: s.mission_completion,
    intention_text: s.intention_text,
    completed: !!s.completed,
    linked_step_id: s.linked_step_id,
    kind: (s.kind as 'drill' | 'custom') || 'drill',
  }));
  const stepRatings = (stepRatingsResult.data ?? []) as Array<{
    step_id: string;
    current_rating: number;
    coach_rating: number | null;
    coach_rated_at: string | null;
    last_updated: string;
  }>;

  // La secuencia en la que está trabajando y qué la frena — derivado de las
  // notas del coach, igual que en el portal del alumno y en Let's Play.
  const oceanShort = (student.ocean_level ?? '').replace(/_/g, ' ').toUpperCase();


  // M4: build official-eval rows (lessons catalog + ratings join)
  const stepRatingsMap = new Map(stepRatings.map((r) => [r.step_id, r]));
  const officialEvalRows = (stpLessonsResult?.data ?? []).map((l: any) => {
    const r = stepRatingsMap.get(l.id);
    return {
      step_id: l.id,
      step_title: l.title ?? null,
      course_section: l.course_section ?? null,
      step_number: l.step_number ?? null,
      sequence_id: l.wb_sequence_id ?? null,
      sequence_name: l.wb_sequence_name ?? null,
      sequence_order: l.wb_sequence_order ?? null,
      sequence_step_order: l.sequence_step_order ?? null,
      student_self_rating: r?.current_rating ?? null,
      coach_rating: r?.coach_rating ?? null,
      coach_rated_at: r?.coach_rated_at ?? null,
    };
  });
  const focusSeq = (() => {
    const { groups } = groupBySequence(officialEvalRows as any[]);
    for (const g of groups) {
      const stars = g.rows.map((r: any) => r.coach_rating ?? null);
      const v = sequenceVerdict(stars);
      if (v.state === 'owned') continue;
      const label =
        g.order >= 1 && g.order <= 13 ? `#${g.order} · ${g.name}` : g.name;
      const blocker =
        v.blockerIndex >= 0
          ? `${(g.rows[v.blockerIndex] as any).step_title ?? ''}${v.min != null ? ` · ${v.min}★` : ''}`
          : null;
      return { label, blocker };
    }
    return null;
  })();

  const lessonsCompleted = (lessonProgressResult.data ?? []).map((l: any) => ({
    lesson_id: l.lesson_id,
    lesson_title: l.lessons?.title ?? null,
    course_section: l.lessons?.course_section ?? null,
    completed_at: l.completed_at,
    quiz_score: l.quiz_score,
  }));
  const finalExams = (finalQuizResult?.data ?? []).map((q: any) => ({
    course_key: q.course_key,
    score: q.score,
    total: q.total,
    passed: !!q.passed,
    created_at: q.created_at,
  }));

  // Multi-block sessions: split active (resume) vs closed (history merge)
  const allMultiBlock = (multiBlockResult?.data ?? []) as any[];
  const activeMultiBlock = allMultiBlock.filter((s) => s.completion_state !== 'closed');
  const closedMultiBlock = allMultiBlock.filter((s) => s.completion_state === 'closed');

  const multiBlockEntries = closedMultiBlock.map((m: any) => {
    const coachRel = Array.isArray(m.coaches) ? m.coaches[0] : m.coaches;
    return {
      id: m.id,
      source: 'multi_block' as const,
      date: m.session_date || m.created_at,
      coachName: coachRel?.display_name || null,
      mission: `Multi-block · ${m.total_actual_minutes ?? m.total_planned_minutes}min`,
      pilar: null,
      status: null,
      coachFeedback: m.general_coach_feedback || null,
      homework: m.general_homework || null,
      whatsNext: m.general_whats_next || null,
      duration: m.total_actual_minutes ?? m.total_planned_minutes,
      venue: m.training_venue || null,
    };
  });

  const allSessions = [...standaloneEntries, ...cascadeEntries, ...multiBlockEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Course grants + earmarked (pending) courses for the CoursesPanel
  const courseGrants = await listStudentCourseGrants(id);
  const pendingCourses: string[] = Array.isArray((student as any).pending_courses)
    ? (student as any).pending_courses
    : [];
  const intakeComplete = !!student.waiver_signed && !!student.intake_completed_at;
  const canManageCourses =
    coach?.role === 'coordinator' ||
    coach?.role === 'admin' ||
    !!coach?.is_platform_admin;

  const unlockedKeys = levelAccess.map((a: any) => a.level_key);
  const belt = BELT_DISPLAY[student.belt_level];
  const fullName = `${student.first_name} ${student.last_name}`;

  const hasSafetyData = !!(student.allergies || student.injuries || student.medical_notes);
  const isAdmin = await isRealPlatformAdmin();

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* --- LEAD → MEMBER PROMOTION (only when student is still a Lead) --- */}
      {(student as any).lifecycle_status === 'lead' && (
        <PromoteLeadCard studentId={student.id} />
      )}

      {/* --- SUCCESS BANNER (shown after student creation) --- */}
      {justCreated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
          <p className="text-sm font-semibold text-emerald-700 inline-flex items-center gap-1.5">
            <CheckCircle2 size={15} strokeWidth={2} />
            Student created successfully!
          </p>
          <p className="text-xs text-emerald-700/80">
            Copy the intake link below and send it to the student to complete their profile and sign the waiver.
          </p>
        </div>
      )}

      {/* --- 1. HEADER (always visible) --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            {/* PhotoUploader renders the avatar + change/remove actions. */}
            <PhotoUploader
              entityType="student"
              entityId={student.id}
              currentPhotoUrl={student.photo_url}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2
                className="text-xl font-bold text-[var(--tss-navy)] leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {fullName}
              </h2>
              {isAdmin && <OpenAsButton kind="student" studentId={student.id} />}
            </div>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold"
                style={{ backgroundColor: belt?.color || '#999' }}
              >
                {belt?.en}{belt?.levelName ? ` (${belt.levelName})` : ''}
              </span>
              {/* Critical flags — always visible, whatever tab is open (M138). */}
              {hasSafetyData && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-600 border border-red-200">
                  ⚕️ Médico
                </span>
              )}
              {(student as any).media_release_consent === false && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-600 border border-red-200">
                  🚫 No fotos
                </span>
              )}
              {!student.waiver_signed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  ⚠️ Sin waiver
                </span>
              )}
            </div>
            <p
              className="text-[10px] uppercase tracking-wider text-gray-400 mt-1.5"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {belt?.levelName ?? ''}
            </p>
            {(student as any).created_at && (
              <p className="text-[11px] text-gray-400 mt-1">
                Member since {new Date((student as any).created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={`/sessions/new?student=${student.id}`}
            className="flex-1 min-w-[110px] text-center py-2 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Session
          </Link>
          <PlanSessionButton
            studentId={student.id}
            className="flex-1 min-w-[110px] text-center py-2 bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)] text-sm font-medium rounded-lg hover:bg-[var(--tss-cyan,#5AC3E7)]/25 transition-colors disabled:opacity-50"
          />
          <Link
            href={`/portal/${student.portal_token}`}
            target="_blank"
            className="px-3 py-2 bg-gray-50 text-[var(--tss-navy)] text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Open Portal
          </Link>
          <span className={justCreated ? 'ring-2 ring-emerald-400 ring-offset-1 rounded-lg animate-pulse' : ''}>
            <CopyIntakeLinkButton portalToken={student.portal_token} />
          </span>
          {!student.email && (
            <span className="px-3 py-2 bg-red-50 text-red-500 text-xs font-medium rounded-lg inline-flex items-center gap-1">
              <AlertTriangle size={11} strokeWidth={2} />
              No email
            </span>
          )}
        </div>
      </div>

      {/* Membresía = acceso al portal — visible siempre, no enterrado (pedido Marcelo) */}
      <MembershipPanel studentId={student.id} info={membershipInfo} />

      {/* ── Tabbed body (M138): Bitácora / Progresión / Perfil ── */}
      <ProfileTabs
        bitacora={<>
      {/* Resumen SIEMPRE visible: lo que el alumno registra en su portal —
          nivel claro, horas (misma fórmula que su portal) y timeline unificada. */}
      <StudentActivitySummary
        studentId={student.id}
        beltLabel={belt?.levelName ?? student.belt_level.replace(/_/g, ' ')}
        seqStep={oceanShort}
      />
      {/* --- 2. LAST SESSION (always visible, highlighted) ---
          Use the most recent real session entry (richest: coach feedback,
          mission, what's next). Fall back to the student snapshot only if
          the unified history is empty. */}
      <Card title="Latest Session" highlighted>
        {allSessions.length > 0 ? (
          <div className="space-y-2">
            <Row label="Date" value={new Date(allSessions[0].date).toLocaleDateString()} />
            <Row label="Mission" value={allSessions[0].mission} />
            <Row label="Coach" value={allSessions[0].coachName} />
            <Row label="Status" value={allSessions[0].status} badge />
            <Row label="Coach Feedback" value={allSessions[0].coachFeedback} highlight />
            <Row label="Homework" value={allSessions[0].homework} highlight />
            <Row label="What to Work Next" value={allSessions[0].whatsNext} highlight />
          </div>
        ) : student.last_session_date ? (
          <div className="space-y-2">
            <Row label="Date" value={new Date(student.last_session_date).toLocaleDateString()} />
            <Row label="Mission" value={student.last_session_mission} />
            <Row label="Status" value={student.last_session_status} badge />
            <Row label="Homework" value={student.last_homework} highlight />
            <Row label="What to Work Next" value={student.next_recommended_focus} highlight />
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">No sessions recorded yet</p>
        )}
      </Card>

      {/* --- ACTIVE PLANS (resume CTA, only when there's an unfinished plan) --- */}
      {activeMultiBlock.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-2">
          <p
            className="text-[10px] uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1.5 font-semibold"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            <CircleDot size={12} strokeWidth={2.5} />
            Sessions in progress / planned
          </p>
          {activeMultiBlock.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 bg-white rounded-xl p-3 border border-emerald-100"
            >
              <Link
                href={`/sessions/plan/${s.id}`}
                className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <p className="text-sm font-medium text-emerald-800">
                  {s.completion_state === 'in_progress' ? 'In progress' : 'Planned'} · {s.total_planned_minutes}min
                </p>
                <p className="text-[10px] text-emerald-600">
                  {new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/sessions/plan/${s.id}`}
                  className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-0.5"
                >
                  Resume
                  <ArrowRight size={12} strokeWidth={2} />
                </Link>
                <ArchiveSessionButton sessionId={s.id} sessionState={s.completion_state} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- 6. SESSION HISTORY (collapsible) --- */}
      <CollapsibleSection title={`Session History (${allSessions.length})`} defaultOpen={false}>
        <SessionHistoryPanel sessions={allSessions} />
      </CollapsibleSection>

      {/* --- 3c-bis. CAMP FINAL-EVALUATION NOTES (collapsible) --- */}
      {campNotes.length > 0 && (
        <CollapsibleSection
          title={
            <>
              <Star size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
              Camp Evaluation Notes
            </>
          }
          defaultOpen={false}
        >
          <div className="space-y-4">
            {campNotes.map((n) => (
              <div key={n.camp_instance_id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--tss-navy)]">{n.camp_name || 'Camp'}</p>
                  {n.approved != null && (
                    n.approved ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                        Approved
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                        In progress
                      </span>
                    )
                  )}
                </div>
                {(n.finalized_at || n.created_at) && (
                  <p className="text-[10px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {(n.finalized_at || n.created_at)!.slice(0, 10)}
                  </p>
                )}
                {n.readiness_summary && (
                  <p className="text-[11px] text-gray-600 mb-2">{n.readiness_summary}</p>
                )}
                {n.student_visible_note && (
                  <div className="mb-2 rounded-lg bg-[var(--tss-navy)]/[0.03] border-l-4 border-[var(--tss-cyan,#5AC3E7)] px-3 py-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">Student sees this</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{n.student_visible_note}</p>
                  </div>
                )}
                {n.coach_private_note && (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-0.5">🔒 Private — coach only</p>
                    <p className="text-sm text-amber-900 whitespace-pre-line">{n.coach_private_note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* --- 8. COACH NOTES (collapsible) --- */}
      <CollapsibleSection title="Coach Notes" defaultOpen={false}>
        <div className="space-y-3">
          {student.coach_notes_general ? (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Internal Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                {student.coach_notes_general}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No coach notes yet</p>
          )}
          {student.current_focus_area && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Current Focus Area</p>
              <p className="text-sm text-[var(--tss-navy)] font-medium">{student.current_focus_area}</p>
            </div>
          )}
          <Row label="Primary Goal" value={student.primary_goal} />
        </div>
      </CollapsibleSection>

        </>}
        progresion={<>
      {/* --- 3. PROGRESSION (always visible) --- */}
      <Card title="Progression">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-4 h-4 rounded-full inline-block"
              style={{ backgroundColor: belt?.color || '#999' }}
            />
            <span className="text-sm font-medium text-[var(--tss-navy)]">{belt?.en} — {belt?.levelName}</span>
          </div>
          {/* Antes acá decía "Sequence #1 · Step 1" — un puntero de un modelo
              viejo que nunca se movió: 997 de 1000 alumnos en #1 y los 1000 en
              el paso 1. Peor, contradecía la evaluación real: alguien con 54
              pasos calificados por su coach igual leía "Sequence #1".
              Ahora sale lo que sí sabemos, derivado de esas notas — lo mismo
              que el alumno ve en su portal. */}
          {focusSeq ? (
            <>
              <Row label="Trabajando en" value={focusSeq.label} />
              {focusSeq.blocker && (
                <Row label="La frena" value={focusSeq.blocker} highlight />
              )}
            </>
          ) : (
            <Row label="Trabajando en" value="sin evaluar todavía" />
          )}
          <Row label="En el agua" value={student.ocean_level} />
          <Row label="Progression Status" value={student.progression_status} />
        </div>
      </Card>

      {/* --- 3a. OFFICIAL STEP EVALUATION (coach gives cyan stars per STP) --- */}
      {coach && (() => {
        const ratedCount = officialEvalRows.filter((r: any) => r.coach_rating !== null).length;
        return (
          <CollapsibleSection
            title={
              <>
                <Star size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
                Official Step Evaluation
                {ratedCount > 0 && <span className="text-gray-400 font-normal">· {ratedCount} rated</span>}
              </>
            }
            defaultOpen={false}
          >
            <OfficialEvaluationPanel
              studentId={id}
              coachId={coach.id}
              rows={officialEvalRows}
            />
          </CollapsibleSection>
        );
      })()}

      {/* El panel "Sequence Evaluation" se quitó (2026-08-27). Era de un
          modelo viejo —un puntero "vas en la secuencia N, paso M"— con 4
          evaluaciones en toda la app y el puntero sin moverse: 997 de 1000
          alumnos en #1. Contradecía la evaluación real, que vive en las
          estrellas por paso. Las 4 filas de sequence_evaluations quedan en la
          base como historial. */}

      {/* --- 3c. EL AGUA: nivel + las pruebas que lo respaldan ---
           Estaban en dos secciones separadas y son la misma cosa: una es el
           veredicto y la otra la evidencia. Juntas se entiende de dónde sale
           el nivel; separadas parecían dos evaluaciones distintas. */}
      <CollapsibleSection
        title={
          <>
            <Waves size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
            El agua
            {(student as any).ocean_level_provisional && (
              <span className="inline-flex items-center gap-1 text-amber-700 font-normal">
                · <Hourglass size={11} strokeWidth={1.75} /> Provisional
              </span>
            )}
          </>
        }
        defaultOpen={!!(student as any).ocean_level_provisional}
      >
        <div className="space-y-4">
          <OceanLevelPanel
            studentId={id}
            coachId={coach?.id || ''}
            currentLevel={student.ocean_level}
            history={oceanHistory}
            provisional={!!(student as any).ocean_level_provisional}
          />
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-2">
              Las pruebas que lo respaldan
            </p>
            <WaterTestsPanel
              studentId={id}
              coachId={coach?.id || ''}
              currentLevel={student.ocean_level}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* --- 3d. COURSE PROGRESS (collapsible) --- */}
      <CollapsibleSection
        title={
          <>
            <GraduationCap size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
            White Belt Course Progress
          </>
        }
        defaultOpen={false}
      >
        <CourseProgressPanel
          studentId={id}
          hasAccess={(student as any).course_access_white === true}
        />
      </CollapsibleSection>

      {/* --- COURSES (granted + earmarked + manual grant) --- */}
      <CoursesPanel
        studentId={id}
        grants={courseGrants}
        pendingCourses={pendingCourses}
        intakeComplete={intakeComplete}
        canManage={canManageCourses}
        isPlatformAdmin={!!coach?.is_platform_admin}
        isDirectPurchase={!(student as any).academy_id}
      />

      {/* Alto Rendimiento — el bloque dorado de la ficha (sección 13 de la
          maqueta): programa, temporada, evaluaciones. Solo aparece si el
          alumno tiene algo de la línea HP y quien mira es admin de plataforma. */}
      <StudentHPPanel studentId={id} />

      {/* Presentations — grant decks to this student (admin only; renders
          nothing if there are no presentations or the viewer isn't admin) */}
      <StudentPresentationGrants studentId={id} />

      {/* Level Access */}
      <LevelAccessCard studentId={id} unlockedKeys={unlockedKeys} />

      {/* --- 3·b. SURF-LEVEL QUIZ HISTORY (incl. retakes) --- */}
      {quizAttempts.length > 0 && (
        <Card title={`Surf-Level Quiz · ${quizAttempts.length} ${quizAttempts.length === 1 ? 'attempt' : 'attempts'}`}>
          <div className="space-y-2 pt-2">
            {quizAttempts.map((a, i) => {
              const ab = a.belt ? BELT_DISPLAY[a.belt as keyof typeof BELT_DISPLAY] : null;
              const when = new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              return (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-gray-400 shrink-0">#{a.attempt_number ?? quizAttempts.length - i}</span>
                    <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: ab?.color || '#999' }} />
                    <span className="text-sm font-medium text-[var(--tss-navy)] truncate">{ab?.en ?? a.belt ?? '—'}</span>
                    {a.score != null && <span className="text-xs text-gray-500 shrink-0">{a.score}/70</span>}
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{when}</span>
                </div>
              );
            })}
            {(() => {
              const latest = quizAttempts[0];
              if (!latest?.skillmap?.length) return null;
              return (
                <div className="pt-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">Latest skill breakdown</p>
                  <div className="space-y-1">
                    {latest.skillmap.map((s, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-600 w-28 shrink-0 truncate">{s.name}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, s.pct))}%`, background: 'var(--tss-cyan,#5AC3E7)' }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {/* --- 3e. PORTAL ACTIVITY (what the student did on their own) --- */}
      {(() => {
        const strugglingCount = stepRatings.filter((r) => r.current_rating < 3).length;
        return (
          <CollapsibleSection
            title={
              <>
                <Waves size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
                Portal Activity
                {strugglingCount > 0 && (
                  <span className="text-amber-700 font-normal">· {strugglingCount} struggling</span>
                )}
              </>
            }
            defaultOpen={strugglingCount > 0}
          >
            <PortalActivityPanel
              selfTraining={selfTraining}
              stepRatings={stepRatings}
              lessonsCompleted={lessonsCompleted}
              finalExams={finalExams}
            />
          </CollapsibleSection>
        );
      })()}

        </>}
        perfil={<>
      {/* --- SAFETY & MEDICAL (highlighted if data) --- */}
      <Card title="Safety &amp; Medical" highlighted={hasSafetyData}>
        <div className="space-y-2">
          <Row label="Emergency Contact" value={student.emergency_contact_name} />
          <Row label="Emergency Phone" value={student.emergency_contact_phone} />
          {student.allergies && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-gray-500 shrink-0">Allergies</span>
              <span className="text-sm text-right text-red-600 font-medium">{student.allergies}</span>
            </div>
          )}
          {student.injuries && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-gray-500 shrink-0">Injuries</span>
              <span className="text-sm text-right text-amber-600 font-medium">{student.injuries}</span>
            </div>
          )}
          <Row label="Medical Notes" value={student.medical_notes} />
          <Row label="Swim Level" value={student.swim_level} />
          <Row label="Risk Notes" value={student.risk_notes} />
        </div>
      </Card>

      {/* --- WAIVER STATUS --- */}
      <Card title="Waiver Status">
        {student.waiver_signed ? (
          <div className="flex items-center gap-2 py-1">
            <CheckCircle2 size={20} strokeWidth={1.75} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Waiver signed</p>
              {student.waiver_signed_at && (
                <p className="text-xs text-gray-400">
                  Signed on {new Date(student.waiver_signed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 bg-red-50 rounded-lg px-3">
            <AlertTriangle size={20} strokeWidth={1.75} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-600">Waiver required</p>
              <p className="text-xs text-red-400">Student has not signed the liability waiver</p>
            </div>
          </div>
        )}
      </Card>

      {/* Media-use consent — warn loudly when the student did NOT authorize it */}
      {(student as any).media_release_consent === false ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5">
          <AlertTriangle size={20} strokeWidth={1.75} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">No autoriza uso de fotos ni videos</p>
            <p className="text-xs text-red-500">No publicar ni usar su material (fotos/clips) con fines promocionales.</p>
          </div>
        </div>
      ) : (student as any).media_release_consent === true ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
          <CheckCircle2 size={14} strokeWidth={2} className="text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700">Autoriza uso de fotos y videos (Sección 10)</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
          <CircleDot size={13} strokeWidth={2} className="text-gray-400 shrink-0" />
          <p className="text-xs text-gray-500">Uso de imagen: sin registrar (waiver anterior o sin responder)</p>
        </div>
      )}

      {/* --- LEARNING PROFILE (how this student learns — coach scans before every session) --- */}
      <LearningProfileCard
        studentId={student.id}
        primary={(student as any).learning_profile_primary as LearningChannel | null}
        secondary={(student as any).learning_profile_secondary as LearningChannel | null}
        portalToken={student.portal_token}
        intakeLearningStyle={(student as any).learning_style as string | null}
      />

      {/* --- RELATIONSHIP / VISITS (who is this, at a glance) --- */}
      <Card title="Relationship" highlighted={visitStats.visits > 1}>
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2">
            {visitStats.visits > 1 ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--tss-navy)] bg-[var(--tss-cyan,#5AC3E7)]/15 border border-[var(--tss-cyan,#5AC3E7)]/40 rounded-full px-2.5 py-0.5">
                Returning · Visit #{visitStats.visits}
              </span>
            ) : visitStats.visits === 1 ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                First visit
              </span>
            ) : (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
                No visits yet
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Visits</p>
              <p className="text-xl font-bold text-[var(--tss-navy)]">{visitStats.visits}{visitStats.priorVisits > 0 && <span className="text-[11px] font-normal text-gray-400"> ({visitStats.priorVisits} prior)</span>}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Days trained</p>
              <p className="text-xl font-bold text-[var(--tss-navy)]">{visitStats.totalDays}</p>
            </div>
          </div>
          <Row label="First visit" value={visitStats.firstVisit ? new Date(visitStats.firstVisit).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} />
          <Row label="Last visit" value={visitStats.lastVisit ? `${new Date(visitStats.lastVisit).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}${visitStats.daysSinceLast != null ? ` · ${visitStats.daysSinceLast}d ago` : ''}` : '—'} />
          <PriorVisitsEditor studentId={student.id} initial={visitStats.priorVisits} />
        </div>
      </Card>

      {/* --- 7. PROFILE DETAILS (collapsible, default closed) --- */}
      <CollapsibleSection title="Profile Details" defaultOpen={false}>
        <div className="space-y-2">
          <Row label="Email" value={student.email} />
          <Row label="Phone" value={student.phone} />
          <Row label="Age" value={student.age?.toString()} />
          <Row label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : null} />
          <Row label="Gender" value={student.gender} />
          <Row label="Nationality" value={student.nationality} />
          <Row label="Languages" value={student.languages} />
          <Row label="Instagram" value={student.instagram} />
          <Row label="Height" value={student.height} />
          <Row label="Weight" value={student.weight} />
          <div className="border-t border-gray-50 pt-2 mt-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Surf Profile</p>
            <Row label="Stance" value={student.stance} />
            <Row label="Experience" value={student.surf_experience_years} />
            <Row label="Frequency" value={student.surf_frequency} />
            <Row label="Board Type" value={student.board_type} />
            <Row label="Other Sports" value={student.other_sports} />
            <Row label="Learning Style" value={student.learning_style} />
          </div>
          <div className="border-t border-gray-50 pt-2 mt-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Goals</p>
            <Row label="Short Term" value={student.goal_short_term} />
            <Row label="Mid Term" value={student.goal_mid_term} />
            <Row label="Long Term" value={student.goal_long_term} />
            <Row label="Biggest Barrier" value={student.biggest_barrier} />
            <Row label="Fears" value={student.fears_phobias} />
          </div>
        </div>
      </CollapsibleSection>

        </>}
      />

    </div>
  );
}

function Card({ title, children, highlighted }: { title: string; children: React.ReactNode; highlighted?: boolean }) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
        highlighted
          ? 'border-[var(--tss-cyan,#5AC3E7)]/40 ring-1 ring-[var(--tss-cyan,#5AC3E7)]/20'
          : 'border-gray-100'
      }`}
    >
      <div
        className={`px-4 py-3 ${
          highlighted ? 'bg-[var(--tss-cyan,#5AC3E7)]/8' : ''
        }`}
      >
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">{title}</h3>
      </div>
      <div className="px-4 pb-4 space-y-2 border-t border-gray-100">{children}</div>
    </div>
  );
}

function Row({ label, value, badge, highlight }: {
  label: string;
  value: string | null | undefined;
  badge?: boolean;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 pt-2">
      <span
        className="text-[10px] uppercase tracking-wider text-gray-400 shrink-0"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </span>
      {badge ? (
        <StatusBadge status={value} />
      ) : (
        <span className={`text-sm text-right ${highlight ? 'text-[var(--tss-navy)] font-medium' : 'text-gray-700'}`}>
          {value}
        </span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    mastered: 'bg-emerald-50 text-emerald-700',
    competent: 'bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)]',
    partial: 'bg-amber-50 text-amber-700',
    not_yet: 'bg-gray-50 text-gray-600',
    not_achieved: 'bg-gray-50 text-gray-600',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
