'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { listCoachStps, type StpSummary } from '@/lib/actions/coach-tools';
import { getAcceptedAssistantCampIds } from '@/lib/actions/service-staff';
import { revalidatePath } from 'next/cache';

// Coach reports an incident (general or student-specific) from their portal.
// Token-gated like the rest of the coach portal. Lands in session_incidents
// so the coordinator + admin see it on their dashboard.
export async function reportIncident(input: {
  token: string;
  incident_type: string;
  student_id?: string | null;
  student_name?: string | null;
  board_id?: string | null;       // optional: a board that was damaged
  description: string;
  action_taken?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, academy_id')
    .eq('portal_token', input.token)
    .single();
  if (!coach) throw new Error('Coach not found.');
  if (!input.incident_type) throw new Error('Incident type is required.');
  if (!input.description?.trim()) throw new Error('A short description is required.');

  const { error } = await admin.from('session_incidents').insert({
    academy_id: coach.academy_id ?? null,
    coach_id: coach.id,
    student_id: input.student_id || null,
    student_name: input.student_name?.trim() || null,
    incident_type: input.incident_type,
    description: input.description.trim(),
    action_taken: input.action_taken?.trim() || null,
  });
  if (error) throw new Error(error.message);

  // A damaged board goes to the repair shelf so it stops being offered.
  if (input.board_id) {
    await admin.from('boards').update({ status: 'in_repair' }).eq('id', input.board_id);
  }

  revalidatePath('/dashboard');
}

// Coach Portal — public route accessed via /coach-portal/[token].
// Mirrors the student portal pattern. No auth required at the route level;
// the portal_token is the access credential. Coach gets the link from
// their academy coordinator.

export interface CoachPortalData {
  coach: {
    id: string;
    first_name: string;
    last_name: string | null;
    display_name: string;
    email: string | null;
    role: string;
    certification_level: string | null;
    max_belt_permission: string;
    languages: string | null;
    specialty_area: string | null;
    portal_token: string;
    photo_url: string | null;
    intake_completed_at: string | null;
    waiver_signed: boolean;
  };
  stats: {
    totalServicesAsHead: number;
    upcomingServicesCount: number;
    studentsWorkedWith: number;
    avgRating: number | null;
    ratingsCount: number;
    coachingHours: number;
  };
  upcomingServices: any[];
  pendingAssignments: any[];
  pastServices: any[];
  coachCourses: any[];  // lessons WHERE course_section LIKE 'coach_%'
  courseProgress: Record<string, { completed: boolean; completed_at: string | null; started: boolean }>;
  availableDrills: any[];  // drills_missions filtered by max_belt_permission
  stps: StpSummary[];  // STPs grouped by sequence for the Tools tab browser
  academyBranding: {
    name: string | null;
    logo_url: string | null;
    primary_color: string | null;
    accent_color: string | null;
    tagline: string | null;
  } | null;
  myStudents: { id: string; name: string }[];
  boards: { id: string; code: string }[];
  emergencyPlan: {
    emergency_numbers: string | null;
    nearest_hospital: string | null;
    lifeguard_contact: string | null;
    emergency_address: string | null;
    emergency_protocol: string | null;
  } | null;
}

export async function getCoachPortalData(token: string): Promise<CoachPortalData | null> {
  const admin = createAdminClient();

  // 1. Resolve coach by token
  const { data: coach } = await admin
    .from('coaches')
    .select(
      'id, first_name, last_name, display_name, email, role, certification_level, max_belt_permission, languages, specialty_area, portal_token, academy_id, course_access_granted, photo_url, intake_completed_at, waiver_signed'
    )
    .eq('portal_token', token)
    .single();

  if (!coach) return null;
  // Gate: coach needs explicit access granted by platform admin
  if (!coach.course_access_granted) return null;

  const today = new Date().toISOString().slice(0, 10);

  // Services where this coach is an accepted assistant (read-only access).
  const assistantCampIds = await getAcceptedAssistantCampIds(coach.id);
  const svcOr = `coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}${
    assistantCampIds.length ? `,id.in.(${assistantCampIds.join(',')})` : ''
  }`;

  // 2. Pull everything in parallel
  const [
    upcomingResult,
    pastResult,
    { count: totalServicesAsHead },
    surveysResult,
    coachCoursesResult,
    drillsResult,
  ] = await Promise.all([
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status, scheduled_time, head_coach_id, head_coach_status, camp_templates:template_id(service_kind, template_name, capacity_max)')
      .or(svcOr)
      .in('status', ['planned', 'active'])
      .gte('end_date', today)
      .order('start_date'),
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status')
      .or(svcOr)
      .lt('end_date', today)
      .order('end_date', { ascending: false })
      .limit(10),
    admin
      .from('camp_instances')
      .select('id', { count: 'exact', head: true })
      .eq('head_coach_id', coach.id),
    admin
      .from('survey_responses')
      .select('coach_rating, student_session_results!inner(coach_id)')
      .eq('student_session_results.coach_id', coach.id),
    admin
      .from('lessons')
      .select('id, title, course_section, step_number, display_order, lesson_type, estimated_minutes, prerequisites')
      .like('course_section', 'coach_%')
      .eq('active', true)
      .order('display_order'),
    admin
      .from('drills_missions')
      .select('id, step_id, title, type, time_estimate, key_words, block_name, belt, description_md, success_criteria, reps_recommended')
      .eq('active', true)
      .order('belt')
      .order('display_order'),
  ]);

  // 3. Derive stats
  const studentsWorkedWith = new Set<string>();
  // (cheap-ish — pull distinct students from student_session_results for this coach)
  const { data: distinctStudents } = await admin
    .from('student_session_results')
    .select('student_id, camp_session_id, standalone_session_id, cascade_session_id, multi_block_session_id, duration_minutes')
    .eq('coach_id', coach.id);
  for (const r of distinctStudents ?? []) studentsWorkedWith.add(r.student_id);

  // Coaching hours — sum durations once per distinct session (a group class
  // has many student rows but is one coaching session, so we dedupe by the
  // session key to avoid multiplying by headcount).
  const seenSessions = new Set<string>();
  let coachingMinutes = 0;
  for (const r of distinctStudents ?? []) {
    const mins = (r as any).duration_minutes;
    if (!mins) continue;
    const key =
      (r as any).camp_session_id || (r as any).standalone_session_id ||
      (r as any).cascade_session_id || (r as any).multi_block_session_id;
    if (key) {
      if (seenSessions.has(key)) continue;
      seenSessions.add(key);
    }
    coachingMinutes += mins;
  }
  const coachingHours = Math.round((coachingMinutes / 60) * 10) / 10;

  const surveys = (surveysResult.data ?? []) as any[];
  const ratings = surveys.map((s) => s.coach_rating).filter((n: number) => n > 0);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  // 4. Filter drills by coach's belt permission (max_belt_permission >= drill.belt)
  // Order is white < yellow < blue < purple < brown < black. drills_missions.belt
  // uses short values ('white','yellow'); max_belt_permission is enum
  // ('white_belt','yellow_belt'...). Normalize.
  const beltRank: Record<string, number> = {
    white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6,
  };
  const myBeltShort = (coach.max_belt_permission || '').replace('_belt', '');
  const myRank = beltRank[myBeltShort] ?? 6;
  const availableDrills = (drillsResult.data ?? []).filter((d: any) => {
    const r = beltRank[d.belt] ?? 1;
    return r <= myRank;
  });

  // 4b. Enrich upcoming + past with participant counts (one query)
  const allCampIds = [
    ...(upcomingResult.data ?? []).map((s: any) => s.id),
    ...(pastResult.data ?? []).map((s: any) => s.id),
  ];
  const participantCounts: Record<string, number> = {};
  const myStudentsMap = new Map<string, string>(); // id → display name
  if (allCampIds.length > 0) {
    const { data: pCounts } = await admin
      .from('camp_participants')
      .select('camp_instance_id, student_id, students:student_id(first_name, last_name)')
      .in('camp_instance_id', allCampIds)
      .eq('enrollment_status', 'active');
    for (const p of pCounts ?? []) {
      participantCounts[p.camp_instance_id] =
        (participantCounts[p.camp_instance_id] || 0) + 1;
      const stu: any = Array.isArray((p as any).students) ? (p as any).students[0] : (p as any).students;
      if ((p as any).student_id && stu) {
        myStudentsMap.set((p as any).student_id, `${stu.first_name ?? ''} ${stu.last_name ?? ''}`.trim());
      }
    }
  }
  const enrich = (s: any) => ({ ...s, participant_count: participantCounts[s.id] || 0 });
  const upcomingEnriched = (upcomingResult.data ?? []).map(enrich);
  const pastEnriched = (pastResult.data ?? []).map(enrich);

  // Course progress map (coach_lesson_progress for this coach).
  // "started" = the coach opened the lesson but hasn't completed it yet.
  // We mark started when there's a row + content_read/video_watched/quiz_attempts
  // signal, even if completed=false.
  const { data: progressRows } = await admin
    .from('coach_lesson_progress')
    .select('lesson_id, completed, completed_at, started_at, video_watched, content_read, quiz_attempts')
    .eq('coach_id', coach.id);
  const courseProgress: Record<string, {
    completed: boolean;
    completed_at: string | null;
    started: boolean;
  }> = {};
  for (const r of progressRows ?? []) {
    const interacted =
      !!r.video_watched ||
      !!r.content_read ||
      (r.quiz_attempts ?? 0) > 0 ||
      !!r.started_at;
    courseProgress[r.lesson_id] = {
      completed: !!r.completed,
      completed_at: r.completed_at,
      started: !r.completed && interacted,
    };
  }

  // M9 — coach portal also themed by academy.
  let academyBranding: CoachPortalData['academyBranding'] = null;
  let emergencyPlan: CoachPortalData['emergencyPlan'] = null;
  let boards: CoachPortalData['boards'] = [];
  if (coach.academy_id) {
    const { data: boardRows } = await admin
      .from('boards')
      .select('id, code')
      .eq('academy_id', coach.academy_id)
      .neq('status', 'retired')
      .order('code');
    boards = (boardRows ?? []) as any[];
  }
  if (coach.academy_id) {
    const { data: aca } = await admin
      .from('academies')
      .select('name, logo_url, primary_color, accent_color, tagline, emergency_numbers, nearest_hospital, lifeguard_contact, emergency_address, emergency_protocol')
      .eq('id', coach.academy_id)
      .single();
    if (aca) {
      academyBranding = {
        name: aca.name, logo_url: aca.logo_url, primary_color: aca.primary_color,
        accent_color: aca.accent_color, tagline: aca.tagline,
      };
      emergencyPlan = {
        emergency_numbers: aca.emergency_numbers ?? null,
        nearest_hospital: aca.nearest_hospital ?? null,
        lifeguard_contact: aca.lifeguard_contact ?? null,
        emergency_address: aca.emergency_address ?? null,
        emergency_protocol: aca.emergency_protocol ?? null,
      };
    }
  }

  return {
    coach,
    stats: {
      totalServicesAsHead: totalServicesAsHead ?? 0,
      upcomingServicesCount: (upcomingResult.data ?? []).length,
      studentsWorkedWith: studentsWorkedWith.size,
      avgRating,
      ratingsCount: ratings.length,
      coachingHours,
    },
    upcomingServices: upcomingEnriched,
    pendingAssignments: upcomingEnriched.filter(
      (s: any) => s.head_coach_id === coach.id && s.head_coach_status === 'pending',
    ),
    pastServices: pastEnriched,
    coachCourses: coachCoursesResult.data ?? [],
    courseProgress,
    availableDrills,
    stps: await listCoachStps(token),
    myStudents: Array.from(myStudentsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    boards,
    academyBranding,
    emergencyPlan,
  };
}

// ─── Coach Lesson detail (lazy-loaded on click) ────────────────
//
// Returns the full markdown body + video URL + any attached content
// videos for a single coach lesson. Used by CoursesTab when a coach
// clicks into a course to read it. Also reads any existing
// coach_lesson_progress row for this coach+lesson pair so the UI can
// show "read / not read" state.

export interface CoachLessonDetail {
  lesson: {
    id: string;
    title: string;
    subtitle: string | null;
    description_md: string | null;
    video_url: string | null;
    cover_image_url: string | null;
    estimated_minutes: number | null;
    prerequisites: string[];
    display_order: number;
    lesson_type: string;
    // Coach STP pillar columns (null on non-STP lessons)
    coach_what_md: string | null;
    coach_deliver_md: string | null;
    coach_errors_md: string | null;
    coach_validate_md: string | null;
    linked_step_id: string | null;
  };
  videos: { id: string; title: string | null; url: string; provider: string; display_order: number }[];
  progress: {
    completed: boolean;
    completed_at: string | null;
    quiz_score: number | null;
    quiz_attempts: number;
  } | null;
  quizzes: { id: string; question: string; options: { text: string; correct: boolean }[]; display_order: number }[];
  // The drill + mission for the linked STP (pulled from drills_missions)
  linkedDrill: LinkedTool | null;
  linkedMission: LinkedTool | null;
}

export interface LinkedTool {
  id: string;
  title: string;
  key_words: string[] | null;
  time_estimate: string | null;
  block_name: string | null;
  description_md: string | null;
  success_criteria: string[] | null;
  reps_recommended: string | null;
}

export async function getCoachLessonDetail(
  token: string,
  lessonId: string
): Promise<CoachLessonDetail | null> {
  const admin = createAdminClient();

  // Resolve coach by token to scope progress lookup
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) return null;

  const { data: lesson } = await admin
    .from('lessons')
    .select(
      'id, title, subtitle, description_md, video_url, cover_image_url, estimated_minutes, prerequisites, display_order, lesson_type, coach_what_md, coach_deliver_md, coach_errors_md, coach_validate_md, linked_step_id'
    )
    .eq('id', lessonId)
    .eq('active', true)
    .single();
  if (!lesson) return null;

  const { data: videos } = await admin
    .from('content_videos')
    .select('id, title, url, provider, display_order')
    .eq('content_type', 'lesson')
    .eq('content_id', lessonId)
    .order('display_order');

  // Touch a coach_lesson_progress row on first open so the coach's Courses
  // list can show "In progress" for lessons they've started reading but
  // haven't marked as read. The upsert is a no-op for rows that already
  // exist (so completed lessons stay completed).
  await admin
    .from('coach_lesson_progress')
    .upsert(
      {
        coach_id: coach.id,
        lesson_id: lessonId,
        started_at: new Date().toISOString(),
      },
      { onConflict: 'coach_id,lesson_id', ignoreDuplicates: true },
    );

  const { data: progress } = await admin
    .from('coach_lesson_progress')
    .select('completed, completed_at, quiz_score, quiz_attempts')
    .eq('coach_id', coach.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  const { data: quizzes } = await admin
    .from('lesson_quizzes')
    .select('id, question, options, display_order')
    .eq('lesson_id', lessonId)
    .order('display_order');

  // For STP lessons, pull the linked drill + mission from drills_missions
  let linkedDrill: CoachLessonDetail['linkedDrill'] = null;
  let linkedMission: CoachLessonDetail['linkedMission'] = null;
  if (lesson.linked_step_id) {
    const { data: dm } = await admin
      .from('drills_missions')
      .select('id, title, type, key_words, time_estimate, block_name, description_md, success_criteria, reps_recommended')
      .eq('step_id', lesson.linked_step_id)
      .eq('active', true);
    for (const row of dm ?? []) {
      const item: LinkedTool = {
        id: row.id,
        title: row.title,
        key_words: row.key_words,
        time_estimate: row.time_estimate,
        block_name: row.block_name,
        description_md: row.description_md,
        success_criteria: row.success_criteria,
        reps_recommended: row.reps_recommended,
      };
      if (row.type === 'drill' && !linkedDrill) linkedDrill = item;
      if (row.type === 'mission' && !linkedMission) linkedMission = item;
    }
  }

  return {
    lesson: {
      ...lesson,
      prerequisites: (lesson.prerequisites ?? []) as string[],
    },
    videos: videos ?? [],
    progress: progress ?? null,
    quizzes: (quizzes ?? []) as any[],
    linkedDrill,
    linkedMission,
  };
}

// Score + persist a coach quiz attempt. Returns the score and a per-question
// correctness map so the UI can show which they got wrong.
export async function submitCoachQuiz(
  token: string,
  lessonId: string,
  answers: Record<string, number>  // questionId → chosen option index
): Promise<{
  score: number;       // 0-100 percentage
  passed: boolean;     // >= 80%
  correctById: Record<string, { correctIdx: number; gotIt: boolean }>;
  attempts: number;
}> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: quizzes } = await admin
    .from('lesson_quizzes')
    .select('id, options')
    .eq('lesson_id', lessonId)
    .order('display_order');
  if (!quizzes || quizzes.length === 0) {
    throw new Error('No quiz questions for this lesson.');
  }

  let correctCount = 0;
  const correctById: Record<string, { correctIdx: number; gotIt: boolean }> = {};
  for (const q of quizzes as any[]) {
    const correctIdx = (q.options as any[]).findIndex((o) => o.correct);
    const chosen = answers[q.id];
    const gotIt = chosen === correctIdx;
    if (gotIt) correctCount++;
    correctById[q.id] = { correctIdx, gotIt };
  }
  const score = Math.round((correctCount / quizzes.length) * 100);
  const passed = score >= 80;

  // Upsert progress with score + attempts++
  const { data: prev } = await admin
    .from('coach_lesson_progress')
    .select('quiz_attempts, quiz_score')
    .eq('coach_id', coach.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  const attempts = (prev?.quiz_attempts ?? 0) + 1;
  // Keep the best score
  const bestScore = Math.max(prev?.quiz_score ?? 0, score);

  await admin.from('coach_lesson_progress').upsert(
    {
      coach_id: coach.id,
      lesson_id: lessonId,
      quiz_score: bestScore,
      quiz_attempts: attempts,
      completed: passed || ((prev as any)?.completed ?? false),
      completed_at: passed ? new Date().toISOString() : (prev as any)?.completed_at ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'coach_id,lesson_id' }
  );

  return { score, passed, correctById, attempts };
}

// Mark a coach lesson as read. Upserts into coach_lesson_progress.
export async function markCoachLessonRead(token: string, lessonId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { error } = await admin
    .from('coach_lesson_progress')
    .upsert(
      {
        coach_id: coach.id,
        lesson_id: lessonId,
        content_read: true,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'coach_id,lesson_id' }
    );
  if (error) throw new Error(error.message);
}
