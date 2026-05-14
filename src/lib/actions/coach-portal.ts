'use server';

import { createAdminClient } from '@/lib/supabase/admin';

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
  };
  stats: {
    totalServicesAsHead: number;
    upcomingServicesCount: number;
    studentsWorkedWith: number;
    avgRating: number | null;
    ratingsCount: number;
  };
  upcomingServices: any[];
  pastServices: any[];
  coachCourses: any[];  // lessons WHERE course_section LIKE 'coach_%'
  courseProgress: Record<string, { completed: boolean; completed_at: string | null }>;
  availableDrills: any[];  // drills_missions filtered by max_belt_permission
  academyBranding: {
    name: string | null;
    logo_url: string | null;
    primary_color: string | null;
    accent_color: string | null;
    tagline: string | null;
  } | null;
}

export async function getCoachPortalData(token: string): Promise<CoachPortalData | null> {
  const admin = createAdminClient();

  // 1. Resolve coach by token
  const { data: coach } = await admin
    .from('coaches')
    .select(
      'id, first_name, last_name, display_name, email, role, certification_level, max_belt_permission, languages, specialty_area, portal_token, academy_id'
    )
    .eq('portal_token', token)
    .single();

  if (!coach) return null;

  const today = new Date().toISOString().slice(0, 10);

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
      .select('id, camp_name, start_date, end_date, status, scheduled_time, camp_templates:template_id(service_kind, template_name, capacity_max)')
      .or(`coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}`)
      .in('status', ['planned', 'active'])
      .gte('end_date', today)
      .order('start_date'),
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status')
      .or(`coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}`)
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
      .select('id, step_id, title, type, time_estimate, key_words, block_name, belt')
      .eq('active', true)
      .order('belt')
      .order('display_order'),
  ]);

  // 3. Derive stats
  const studentsWorkedWith = new Set<string>();
  // (cheap-ish — pull distinct students from student_session_results for this coach)
  const { data: distinctStudents } = await admin
    .from('student_session_results')
    .select('student_id')
    .eq('coach_id', coach.id);
  for (const r of distinctStudents ?? []) studentsWorkedWith.add(r.student_id);

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

  // Course progress map (coach_lesson_progress for this coach)
  const { data: progressRows } = await admin
    .from('coach_lesson_progress')
    .select('lesson_id, completed, completed_at')
    .eq('coach_id', coach.id);
  const courseProgress: Record<string, { completed: boolean; completed_at: string | null }> = {};
  for (const r of progressRows ?? []) {
    courseProgress[r.lesson_id] = {
      completed: !!r.completed,
      completed_at: r.completed_at,
    };
  }

  // M9 — coach portal also themed by academy.
  let academyBranding: CoachPortalData['academyBranding'] = null;
  if (coach.academy_id) {
    const { data: aca } = await admin
      .from('academies')
      .select('name, logo_url, primary_color, accent_color, tagline')
      .eq('id', coach.academy_id)
      .single();
    academyBranding = aca ?? null;
  }

  return {
    coach,
    stats: {
      totalServicesAsHead: totalServicesAsHead ?? 0,
      upcomingServicesCount: (upcomingResult.data ?? []).length,
      studentsWorkedWith: studentsWorkedWith.size,
      avgRating,
      ratingsCount: ratings.length,
    },
    upcomingServices: upcomingResult.data ?? [],
    pastServices: pastResult.data ?? [],
    coachCourses: coachCoursesResult.data ?? [],
    courseProgress,
    availableDrills,
    academyBranding,
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
  };
  videos: { id: string; title: string | null; url: string; provider: string; display_order: number }[];
  progress: {
    completed: boolean;
    completed_at: string | null;
    quiz_score: number | null;
    quiz_attempts: number;
  } | null;
  quizzes: { id: string; question: string; options: { text: string; correct: boolean }[]; display_order: number }[];
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
      'id, title, subtitle, description_md, video_url, cover_image_url, estimated_minutes, prerequisites, display_order, lesson_type'
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

  return {
    lesson: {
      ...lesson,
      prerequisites: (lesson.prerequisites ?? []) as string[],
    },
    videos: videos ?? [],
    progress: progress ?? null,
    quizzes: (quizzes ?? []) as any[],
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
