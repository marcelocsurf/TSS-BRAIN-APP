import { getStudent, checkCoachAccessToStudent } from '@/lib/actions/students';
import { getStudentLevelAccess } from '@/lib/actions/access';
import { getSequenceEvaluationHistory, getOceanLevelHistory } from '@/lib/actions/evaluations';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { createClient } from '@/lib/supabase/server';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import { LevelAccessCard } from '@/components/student/LevelAccessCard';
import { ProfilePhoto } from '@/components/shared/ProfilePhoto';
import { PhotoUploader } from '@/components/shared/PhotoUploader';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { CopyIntakeLinkButton } from '@/components/student/CopyIntakeLinkButton';
import { PlanSessionButton } from '@/components/student/PlanSessionButton';
import { SequenceEvaluationPanel } from '@/components/student/SequenceEvaluationPanel';
import { OceanLevelPanel } from '@/components/student/OceanLevelPanel';
import { SessionHistoryPanel } from '@/components/student/SessionHistoryPanel';
import { CourseProgressPanel } from '@/components/student/CourseProgressPanel';
import { CoursesPanel } from '@/components/student/CoursesPanel';
import { listStudentCourseGrants } from '@/lib/actions/course-grants';
import { PortalActivityPanel } from '@/components/student/PortalActivityPanel';
import { LearningProfileCard } from '@/components/student/LearningProfileCard';
import { OfficialEvaluationPanel } from '@/components/student/OfficialEvaluationPanel';
import { ArchiveSessionButton } from '@/components/session/ArchiveSessionButton';
import type { LearningChannel } from '@/lib/constants/learning-profiles';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
        <p className="text-3xl mb-3">⏳</p>
        <h2 className="text-lg font-bold text-[var(--tss-navy)] mb-2">Access expired</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You can only view this student during the service window you&apos;re
          assigned to (from the start of the service until 1 day after it
          ends). Ask the coordinator to assign you again or wait for the next
          camp.
        </p>
        <Link
          href="/students"
          className="inline-block mt-4 text-xs text-blue-600 underline"
        >
          ← Back to your students
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
  ] = await Promise.all([
    getStudentLevelAccess(id),
    // Standalone session results
    supabase
      .from('student_session_results')
      .select(`
        id, status, focus_rating,
        coach_feedback, homework, whats_next, created_at, coach_id,
        standalone_sessions(mission, training_venue, session_date, pilar, duration_minutes),
        coaches:coach_id(display_name)
      `)
      .eq('student_id', id)
      .eq('completion_state', 'closed')
      .not('standalone_session_id', 'is', null)
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
        'id, drill_name, duration_minutes, execution_rating, mission_completion, intention_text, completed, completed_at, created_at, linked_step_id, kind'
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
    // M4: STP catalog for OfficialEvaluationPanel (rows to rate)
    supabase
      .from('lessons')
      .select('id, title, step_number')
      .eq('course_section', 'white_belt')
      .eq('active', true)
      .order('step_number'),
  ]);

  // Merge and sort all sessions for the unified history
  const standaloneEntries = (standaloneResult.data ?? []).map((r: any) => ({
    id: r.id,
    source: 'standalone' as const,
    date: r.standalone_sessions?.session_date || r.created_at,
    coachName: r.coaches?.display_name || null,
    mission: r.standalone_sessions?.mission || null,
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

  // M4: build official-eval rows (lessons catalog + ratings join)
  const stepRatingsMap = new Map(stepRatings.map((r) => [r.step_id, r]));
  const officialEvalRows = (stpLessonsResult?.data ?? []).map((l: any) => {
    const r = stepRatingsMap.get(l.id);
    return {
      step_id: l.id,
      step_title: l.title ?? null,
      student_self_rating: r?.current_rating ?? null,
      coach_rating: r?.coach_rating ?? null,
      coach_rated_at: r?.coach_rated_at ?? null,
    };
  });
  const lessonsCompleted = (lessonProgressResult.data ?? []).map((l: any) => ({
    lesson_id: l.lesson_id,
    lesson_title: l.lessons?.title ?? null,
    course_section: l.lessons?.course_section ?? null,
    completed_at: l.completed_at,
    quiz_score: l.quiz_score,
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

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* --- SUCCESS BANNER (shown after student creation) --- */}
      {justCreated && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-green-700">
            Student created successfully!
          </p>
          <p className="text-xs text-green-600">
            Copy the intake link below and send it to the student to complete their profile and sign the waiver.
          </p>
        </div>
      )}

      {/* --- 1. HEADER (always visible) --- */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            {/* PhotoUploader already renders the avatar with change/remove
                actions. The standalone ProfilePhoto above it duplicated
                the image — removed. */}
            <PhotoUploader
              entityType="student"
              entityId={student.id}
              currentPhotoUrl={student.photo_url}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--tss-navy)]">
              {fullName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: belt?.color || '#999' }}
              >
                {belt?.en}
              </span>
              {student.waiver_signed ? (
                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                  Waiver &#10003;
                </span>
              ) : (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                  &#9888; No waiver
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Seq {student.current_sequence_number} / Step {student.current_step_order}
            </p>
          </div>
        </div>
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={`/sessions/new?student=${student.id}`}
            className="flex-1 min-w-[110px] text-center py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90"
          >
            Start Session
          </Link>
          <PlanSessionButton studentId={student.id} className="flex-1 min-w-[110px] text-center py-2 bg-emerald-50 text-emerald-700 text-sm rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50" />
          <Link
            href={`/portal/${student.portal_token}`}
            target="_blank"
            className="px-3 py-2 bg-amber-50 text-amber-700 text-xs rounded-lg hover:bg-amber-100 transition-colors"
          >
            Open Portal
          </Link>
          <span className={justCreated ? 'ring-2 ring-green-400 ring-offset-1 rounded-lg animate-pulse' : ''}>
            <CopyIntakeLinkButton portalToken={student.portal_token} />
          </span>
          {!student.email && (
            <span className="px-3 py-2 bg-red-50 text-red-500 text-xs rounded-lg flex items-center">
              No email
            </span>
          )}
        </div>
      </div>

      {/* --- LEARNING PROFILE (how this student learns — coach scans before every session) --- */}
      <LearningProfileCard
        studentId={student.id}
        primary={(student as any).learning_profile_primary as LearningChannel | null}
        secondary={(student as any).learning_profile_secondary as LearningChannel | null}
        portalToken={student.portal_token}
      />

      {/* --- ACTIVE PLANS (resume CTA, only when there's an unfinished plan) --- */}
      {activeMultiBlock.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700">
            🟢 Sessions in progress / planned
          </p>
          {activeMultiBlock.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 bg-white rounded-lg p-3"
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
                <Link href={`/sessions/plan/${s.id}`} className="text-xs text-emerald-600 font-medium">
                  Resume →
                </Link>
                <ArchiveSessionButton sessionId={s.id} sessionState={s.completion_state} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- 2. LAST SESSION (always visible, highlighted) --- */}
      <Card title="Last Session" highlighted>
        {student.last_session_date ? (
          <div className="space-y-2">
            <Row label="Date" value={new Date(student.last_session_date).toLocaleDateString()} />
            <Row label="Mission" value={student.last_session_mission} />
            <Row label="Pilar" value={student.last_session_pilar ? PILAR_LABELS[student.last_session_pilar as Pilar] : null} />
            <Row label="Status" value={student.last_session_status} badge />
            <Row label="Homework" value={student.last_homework} highlight />
            <Row label="Next Focus" value={student.next_recommended_focus} highlight />
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">No sessions recorded yet</p>
        )}
      </Card>

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
          <Row label="Sequence" value={`#${student.current_sequence_number}`} />
          <Row label="Step" value={`${student.current_step_order}`} />
          <Row label="Ocean Level" value={student.ocean_level} />
          <Row label="Progression Status" value={student.progression_status} />
        </div>
      </Card>

      {/* --- 3a. OFFICIAL STEP EVALUATION (coach gives gold stars per STP) --- */}
      {coach && (
        <CollapsibleSection
          title={`⭐ Official Step Evaluation${
            officialEvalRows.filter((r: any) => r.coach_rating !== null).length > 0
              ? ` · ${officialEvalRows.filter((r: any) => r.coach_rating !== null).length} rated`
              : ''
          }`}
          defaultOpen={false}
        >
          <OfficialEvaluationPanel
            studentId={id}
            coachId={coach.id}
            rows={officialEvalRows}
          />
        </CollapsibleSection>
      )}

      {/* --- 3b. SEQUENCE EVALUATION (collapsible) --- */}
      <CollapsibleSection title="Sequence Evaluation" defaultOpen={false}>
        <SequenceEvaluationPanel
          studentId={id}
          coachId={coach?.id || ''}
          currentSequence={student.current_sequence_number}
          currentStep={student.current_step_order}
          history={seqHistory}
        />
      </CollapsibleSection>

      {/* --- 3c. OCEAN LEVEL EVALUATION (collapsible) --- */}
      <CollapsibleSection
        title={`Ocean Level${(student as any).ocean_level_provisional ? ' · ⏳ Provisional' : ''}`}
        defaultOpen={!!(student as any).ocean_level_provisional}
      >
        <OceanLevelPanel
          studentId={id}
          coachId={coach?.id || ''}
          currentLevel={student.ocean_level}
          history={oceanHistory}
          provisional={!!(student as any).ocean_level_provisional}
        />
      </CollapsibleSection>

      {/* --- 3d. COURSE PROGRESS (collapsible) --- */}
      <CollapsibleSection title="🎓 White Belt Course Progress" defaultOpen={false}>
        <CourseProgressPanel
          studentId={id}
          hasAccess={(student as any).course_access_white === true}
        />
      </CollapsibleSection>

      {/* --- 3e. PORTAL ACTIVITY (what the student did on their own) --- */}
      <CollapsibleSection
        title={`🌊 Portal Activity${
          stepRatings.filter((r) => r.current_rating < 3).length > 0
            ? ` · ${stepRatings.filter((r) => r.current_rating < 3).length} struggling`
            : ''
        }`}
        defaultOpen={stepRatings.filter((r) => r.current_rating < 3).length > 0}
      >
        <PortalActivityPanel
          selfTraining={selfTraining}
          stepRatings={stepRatings}
          lessonsCompleted={lessonsCompleted}
        />
      </CollapsibleSection>

      {/* --- COURSES (granted + earmarked + manual grant) --- */}
      <CoursesPanel
        studentId={id}
        grants={courseGrants}
        pendingCourses={pendingCourses}
        intakeComplete={intakeComplete}
        canManage={canManageCourses}
      />

      {/* Level Access */}
      <LevelAccessCard studentId={id} unlockedKeys={unlockedKeys} />

      {/* --- 4. SAFETY & MEDICAL (always visible, highlighted if data) --- */}
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

      {/* --- 5. WAIVER STATUS (visible) --- */}
      <Card title="Waiver Status">
        {student.waiver_signed ? (
          <div className="flex items-center gap-2 py-1">
            <span className="text-green-600 text-lg">&#10003;</span>
            <div>
              <p className="text-sm font-medium text-green-700">Waiver signed</p>
              {student.waiver_signed_at && (
                <p className="text-xs text-gray-400">
                  Signed on {new Date(student.waiver_signed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 bg-red-50 rounded-lg px-3">
            <span className="text-red-500 text-lg">&#9888;</span>
            <div>
              <p className="text-sm font-medium text-red-600">Waiver required</p>
              <p className="text-xs text-red-400">Student has not signed the liability waiver</p>
            </div>
          </div>
        )}
      </Card>

      {/* --- 6. SESSION HISTORY (collapsible) --- */}
      <CollapsibleSection title={`Session History (${allSessions.length})`} defaultOpen={false}>
        <SessionHistoryPanel sessions={allSessions} />
      </CollapsibleSection>

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

    </div>
  );
}

function Card({ title, children, highlighted }: { title: string; children: React.ReactNode; highlighted?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${
      highlighted ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
    }`}>
      <div className={`px-4 py-3 border-b ${highlighted ? 'border-amber-100 bg-amber-50/30' : 'border-gray-50'}`}>
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
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
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
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
    mastered: 'bg-green-50 text-green-700',
    competent: 'bg-blue-50 text-blue-700',
    partial: 'bg-amber-50 text-amber-700',
    not_yet: 'bg-gray-50 text-gray-600',
    not_achieved: 'bg-gray-50 text-gray-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
