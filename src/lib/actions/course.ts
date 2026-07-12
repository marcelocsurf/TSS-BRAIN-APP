'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

// ─── Types ───

export type LessonRow = {
  id: string;
  // M49 — yb_onboarding + yellow_belt added so the Course tab can
  // render Yellow Belt content with the same layout as White Belt.
  course_section:
    | 'pre_course_fundamentals'
    | 'pre_course_values'
    | 'wb_onboarding'
    | 'white_belt'
    | 'yb_onboarding'
    | 'yellow_belt';
  step_number: number;
  title: string;
  subtitle: string | null;
  pillar: string | null;
  description_md: string | null;
  drill_md: string | null;
  errors_md: string | null;
  video_url: string | null;
  cover_image_url: string | null;
  estimated_minutes: number;
  prerequisites: string[];
  lesson_type: 'reading' | 'form' | 'test';
  display_order: number;
  // Phase 1 canon structure (00018):
  pc_section_id: string | null;
  pc_section_name: string | null;
  pc_section_order: number | null;
  status_v1: 'PRODUCTIZED' | 'PROPOSED' | null;
  is_test: boolean;
  wb_sequence_id: string | null;
  wb_sequence_name: string | null;
  wb_sequence_order: number | null;
  wb_sequence_promise: string | null;
  sequence_step_order: number | null;
};

export type QuizQuestion = {
  id: string;
  lesson_id: string;
  question: string;
  options: { text: string; correct: boolean }[];
  display_order: number;
};

export type LessonProgress = {
  student_id: string;
  lesson_id: string;
  video_watched: boolean;
  content_read: boolean;
  quiz_score: number | null;
  quiz_attempts: number;
  form_response: any;
  completed: boolean;
  completed_at: string | null;
};

// Course owners — bypass gate logic so they can review all content freely
// without having to "complete" each lesson. Add student IDs here as needed.
const COURSE_OWNER_IDS = new Set<string>([
  '3518cc9c-d633-44ff-b32a-bfb86b5ae748', // Marcelo Castellanos (TSS founder)
  '0f6816db-a637-4af0-86b6-1a1c8227953c', // Androide Salvadoreno (test/review account)
]);

// ─── Get all lessons for a section ───

export async function getCourseCatalog(studentId: string) {
  const admin = createAdminClient();

  const isOwner = COURSE_OWNER_IDS.has(studentId);

  // Get all lessons
  const { data: lessons } = await admin
    .from('lessons')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  // Get student progress for all lessons
  const { data: progress } = await admin
    .from('lesson_progress')
    .select('*')
    .eq('student_id', studentId);

  const progressMap = new Map<string, LessonProgress>();
  (progress || []).forEach((p: any) => progressMap.set(p.lesson_id, p));

  // Per canon v1: WB Sequences unlock only after BOTH Module 0 (Pre-Course)
  // AND Module 1 (WB Onboarding) are completed. PROPOSED items are placeholders
  // and cannot be completed — they don't count toward gate.
  const moduleZeroAndOneLessons = (lessons || []).filter(
    (l: any) =>
      (l.course_section === 'pre_course_fundamentals' ||
       l.course_section === 'pre_course_values' ||
       l.course_section === 'wb_onboarding') &&
      l.status_v1 !== 'PROPOSED'
  );
  // Owners always see preCourseCompleted = true so the entire WB unlocks.
  const preCourseCompleted = isOwner || (
    moduleZeroAndOneLessons.length > 0 &&
    moduleZeroAndOneLessons.every((l: any) => progressMap.get(l.id)?.completed)
  );

  // Build response with lock state
  const enriched = (lessons || []).map((lesson: any, idx: number) => {
    const lessonProgress = progressMap.get(lesson.id);

    // Lock logic — policy 2026-07-12 (Marcelo): STUDY IS FREE. Nothing in an
    // owned course is locked for reading; students explore whenever they
    // want. The requirement moved to ADVANCEMENT: the belt final exam stays
    // locked until every lesson (pre-course + onboarding + belt, safety
    // included) is completed with its quizzes.
    let locked = false;
    let lockReason: string | null = null;

    // Check prerequisites (skipped for owners)
    if (lesson.prerequisites && lesson.prerequisites.length > 0 && !isOwner) {
      const prereqsMet = lesson.prerequisites.every((prereqId: string) =>
        progressMap.get(prereqId)?.completed
      );
      if (!prereqsMet && !locked) {
        locked = true;
        lockReason = `Complete previous lessons first`;
      }
    }

    // PROPOSED items (Coming in v1.5) are not "locked" but cannot be opened
    // for completion. They have no canonical content yet.
    if (lesson.status_v1 === 'PROPOSED') {
      locked = false; // override: not locked, just not completable
    }

    return {
      ...lesson,
      progress: lessonProgress || null,
      locked,
      lockReason,
      completed: lessonProgress?.completed || false,
    };
  });

  return {
    lessons: enriched,
    preCourseCompleted,
    totalCompleted: (progress || []).filter((p: any) => p.completed).length,
    totalLessons: (lessons || []).length,
  };
}

// ─── Get a single lesson with quizzes ───

export async function getLessonDetail(lessonId: string, studentId: string) {
  const admin = createAdminClient();

  const { data: lesson, error: lessonErr } = await admin
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .eq('active', true)
    .single();

  if (lessonErr || !lesson) return null;

  const { data: quizzes } = await admin
    .from('lesson_quizzes')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('display_order', { ascending: true });

  const { data: progress } = await admin
    .from('lesson_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  // For STP-XXX lessons, also pull the canonical drills + missions for this
  // step so the LessonViewer can offer "Practice this in Let's Play →" CTAs.
  // Each drill/mission also gets its own videos[] (from content_videos).
  let drillsMissions: any[] = [];
  if (lessonId.startsWith('STP-')) {
    const { data } = await admin
      .from('drills_missions')
      .select('id, step_id, title, type, time_estimate, key_words, success_criteria, reps_recommended, description_md')
      .eq('step_id', lessonId)
      .eq('active', true)
      .order('type');
    drillsMissions = data || [];
    const dmIds = drillsMissions.map((d: any) => d.id);
    if (dmIds.length > 0) {
      const { data: dmVideos } = await admin
        .from('content_videos')
        .select('id, drill_mission_id, url, label, display_order')
        .in('drill_mission_id', dmIds)
        .order('display_order');
      const byDm = new Map<string, any[]>();
      for (const v of dmVideos || []) {
        const arr = byDm.get(v.drill_mission_id) ?? [];
        arr.push(v);
        byDm.set(v.drill_mission_id, arr);
      }
      drillsMissions = drillsMissions.map((d: any) => ({
        ...d,
        videos: byDm.get(d.id) ?? [],
      }));
    }
  }

  // Multi-video support (content_videos table). Returns ordered list of
  // {url, label} per lesson; LessonViewer renders them as tabs.
  const { data: videos } = await admin
    .from('content_videos')
    .select('id, url, label, display_order')
    .eq('lesson_id', lessonId)
    .order('display_order');

  return {
    lesson,
    quizzes: quizzes || [],
    progress: progress || null,
    drillsMissions,
    videos: videos || [],
  };
}

// ─── Mark video as watched ───

export async function markVideoWatched(studentId: string, lessonId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from('lesson_progress')
    .upsert({
      student_id: studentId,
      lesson_id: lessonId,
      video_watched: true,
    }, { onConflict: 'student_id,lesson_id' });

  if (!error) revalidatePath('/portal/[token]', 'layout');
  return { ok: !error, error: error?.message };
}

// ─── Mark content as read ───

export async function markContentRead(studentId: string, lessonId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from('lesson_progress')
    .upsert({
      student_id: studentId,
      lesson_id: lessonId,
      content_read: true,
    }, { onConflict: 'student_id,lesson_id' });

  if (!error) revalidatePath('/portal/[token]', 'layout');
  return { ok: !error, error: error?.message };
}

// ─── Mark a lesson complete (manual "Mark as done") ───
// Replaces quiz-pass as the completion path for reading lessons. Mirrors the
// same belt/pre-course rollups submitQuiz runs, so graduation gating is intact.
const BELT_COMPLETION_COLUMN: Record<string, string> = {
  white_belt: 'white_belt_completed_at',
  blue_belt: 'blue_belt_completed_at',
};

export async function markLessonComplete(studentId: string, lessonId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from('lesson_progress')
    .upsert({
      student_id: studentId,
      lesson_id: lessonId,
      content_read: true,
      video_watched: true,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'student_id,lesson_id' });
  if (error) return { ok: false, error: error.message };

  const { data: lesson } = await admin
    .from('lessons')
    .select('course_section')
    .eq('id', lessonId)
    .single();
  const section = lesson?.course_section;

  // Pre-course rollup
  if (section === 'pre_course_fundamentals' || section === 'pre_course_values') {
    const { data: done } = await admin.rpc('student_pre_course_complete', { p_student_id: studentId });
    if (done === true) {
      await admin.from('students').update({ pre_course_completed_at: new Date().toISOString() }).eq('id', studentId);
    }
  }

  // Belt rollup (white / blue have a completion column)
  const col = section ? BELT_COMPLETION_COLUMN[section] : undefined;
  if (col) {
    const { data: beltLessons } = await admin
      .from('lessons').select('id').eq('course_section', section).eq('active', true);
    const { data: completed } = await admin
      .from('lesson_progress').select('lesson_id')
      .eq('student_id', studentId).eq('completed', true)
      .in('lesson_id', (beltLessons || []).map((l: any) => l.id));
    if (beltLessons && completed && completed.length >= beltLessons.length) {
      await admin.from('students').update({ [col]: new Date().toISOString() }).eq('id', studentId);
    }
  }

  revalidatePath('/portal/[token]', 'layout');
  return { ok: true };
}

// ─── Submit quiz answers ───

export async function submitQuiz(
  studentId: string,
  lessonId: string,
  answers: { quizId: string; selectedIndex: number }[]
) {
  const admin = createAdminClient();

  // Get all quiz questions for this lesson
  const { data: quizzes } = await admin
    .from('lesson_quizzes')
    .select('*')
    .eq('lesson_id', lessonId);

  if (!quizzes || quizzes.length === 0) {
    return { ok: false, error: 'No quiz found for this lesson' };
  }

  // Calculate score
  let correctCount = 0;
  const results: any[] = [];
  for (const quiz of quizzes) {
    const userAnswer = answers.find((a) => a.quizId === quiz.id);
    if (!userAnswer) continue;

    const options = quiz.options as { text: string; correct: boolean }[];
    const selected = options[userAnswer.selectedIndex];
    const isCorrect = selected?.correct === true;

    if (isCorrect) correctCount++;

    results.push({
      quizId: quiz.id,
      question: quiz.question,
      selectedIndex: userAnswer.selectedIndex,
      isCorrect,
      correctIndex: options.findIndex((o) => o.correct),
    });
  }

  const score = Math.round((correctCount / quizzes.length) * 100);
  const passed = score >= 80;

  // Get current progress to increment attempts
  const { data: existingProgress } = await admin
    .from('lesson_progress')
    .select('quiz_attempts')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  const newAttempts = (existingProgress?.quiz_attempts || 0) + 1;

  // Update progress
  const { error } = await admin
    .from('lesson_progress')
    .upsert({
      student_id: studentId,
      lesson_id: lessonId,
      quiz_score: score,
      quiz_attempts: newAttempts,
      completed: passed,
      completed_at: passed ? new Date().toISOString() : null,
    }, { onConflict: 'student_id,lesson_id' });

  if (error) return { ok: false, error: error.message };

  // Check if pre-course just completed
  if (passed) {
    const { data: lesson } = await admin
      .from('lessons')
      .select('course_section')
      .eq('id', lessonId)
      .single();

    if (lesson && (lesson.course_section === 'pre_course_fundamentals' ||
                   lesson.course_section === 'pre_course_values')) {
      // Check if all pre-course is now complete
      const { data: preCourseCheck } = await admin.rpc('student_pre_course_complete', {
        p_student_id: studentId,
      });

      if (preCourseCheck === true) {
        await admin
          .from('students')
          .update({ pre_course_completed_at: new Date().toISOString() })
          .eq('id', studentId);
      }
    }

    // Check if white belt just completed
    if (lesson?.course_section === 'white_belt') {
      const { data: wbLessons } = await admin
        .from('lessons')
        .select('id')
        .eq('course_section', 'white_belt')
        .eq('active', true);

      const { data: wbCompleted } = await admin
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', studentId)
        .eq('completed', true)
        .in('lesson_id', (wbLessons || []).map((l: any) => l.id));

      if (wbLessons && wbCompleted && wbCompleted.length >= wbLessons.length) {
        await admin
          .from('students')
          .update({ white_belt_completed_at: new Date().toISOString() })
          .eq('id', studentId);
      }
    }
  }

  revalidatePath('/portal/[token]', 'layout');
  return {
    ok: true,
    score,
    passed,
    correctCount,
    total: quizzes.length,
    results,
  };
}

// ─── Save form response (Set Goal, Goofy/Regular) ───

export async function saveLessonForm(
  studentId: string,
  lessonId: string,
  formData: any
) {
  const admin = createAdminClient();

  // For form-type lessons, save the response and mark as completed
  const { error } = await admin
    .from('lesson_progress')
    .upsert({
      student_id: studentId,
      lesson_id: lessonId,
      form_response: formData,
      content_read: true,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'student_id,lesson_id' });

  if (error) return { ok: false, error: error.message };

  // If this is PC-002 Set Goal, also update student's personal_goal field
  if (lessonId === 'PC-002' && formData?.goal) {
    await admin
      .from('students')
      .update({ personal_goal: formData.goal })
      .eq('id', studentId);
  }

  // If this is PC-004 Goofy or Regular, save to student profile
  if (lessonId === 'PC-004' && formData?.stance) {
    await admin
      .from('students')
      .update({ goofy_or_regular: formData.stance })
      .eq('id', studentId);
  }

  revalidatePath('/portal/[token]', 'layout');
  return { ok: true };
}

// ─── ACCESS CODES ───

// Generate a single-use access code (admin only)
export async function generateAccessCode(
  productType: string = 'white_belt',
  notes?: string
) {
  const admin = createAdminClient();

  // Use the database function to generate unique code
  const { data: codeData, error: codeErr } = await admin.rpc('generate_access_code', {
    p_product_type: productType,
  });

  if (codeErr || !codeData) {
    return { ok: false, error: codeErr?.message || 'Failed to generate code' };
  }

  const newCode = codeData as string;

  // Insert into access_codes
  const { error: insertErr } = await admin
    .from('access_codes')
    .insert({
      code: newCode,
      product_type: productType,
      notes: notes || null,
    });

  if (insertErr) {
    return { ok: false, error: insertErr.message };
  }

  return { ok: true, code: newCode };
}

// Validate and consume an access code (during signup/intake)
export async function consumeAccessCode(code: string, studentId: string) {
  const admin = createAdminClient();

  // Check if code exists and is not used
  const { data: codeRow } = await admin
    .from('access_codes')
    .select('*')
    .eq('code', code)
    .single();

  if (!codeRow) return { ok: false, error: 'Invalid code' };
  if (codeRow.used_by) return { ok: false, error: 'Code already used' };
  if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
    return { ok: false, error: 'Code expired' };
  }

  // Mark code as used and grant course access
  const { error: updateCodeErr } = await admin
    .from('access_codes')
    .update({
      used_by: studentId,
      used_at: new Date().toISOString(),
    })
    .eq('code', code);

  if (updateCodeErr) return { ok: false, error: updateCodeErr.message };

  // Grant course access to student
  await admin
    .from('students')
    .update({
      course_access_white: true,
      signup_code: code,
    })
    .eq('id', studentId);

  return { ok: true };
}

// List all access codes (admin)
export async function listAccessCodes() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('access_codes')
    .select('*, students:used_by(first_name, last_name, email)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return [];
  return data || [];
}

// ─── BATCH GENERATION ───

// Generate multiple codes at once for a batch
export async function generateAccessCodeBatch(
  count: number,
  productType: string = 'white_belt',
  batchLabel: string,
  notes?: string,
  expiresInDays?: number | null,
): Promise<{ ok: true; codes: string[] } | { ok: false; error: string }> {
  if (count < 1 || count > 50) {
    return { ok: false, error: 'Count must be between 1 and 50' };
  }

  const coach = await getCurrentCoach();
  if (!coach) return { ok: false, error: 'Not authenticated' };

  const admin = createAdminClient();
  const generatedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const { data: codeData, error: codeErr } = await admin.rpc('generate_access_code', {
      p_product_type: productType,
    });

    if (codeErr || !codeData) {
      return { ok: false, error: codeErr?.message || 'Failed to generate code' };
    }

    generatedCodes.push(codeData as string);
  }

  const expiresAt =
    expiresInDays && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
      : null;

  const rows = generatedCodes.map((code) => ({
    code,
    product_type: productType,
    batch_label: batchLabel || null,
    notes: notes || null,
    academy_id: coach.academy_id || null,
    created_by: coach.id,
    expires_at: expiresAt,
  }));

  const { error: insertErr } = await admin.from('access_codes').insert(rows);

  if (insertErr) return { ok: false, error: insertErr.message };

  revalidatePath('/course-codes');
  return { ok: true, codes: generatedCodes };
}

// List codes filtered by academy (or all for platform_admin)
export async function listAccessCodesForAcademy() {
  const coach = await getCurrentCoach();
  if (!coach) return [];

  const admin = createAdminClient();

  let query = admin
    .from('access_codes')
    .select('*, students:used_by(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  // Platform admins (not acting-as) see all; everyone else scoped to academy
  if (!coach.is_platform_admin && coach.academy_id) {
    query = query.eq('academy_id', coach.academy_id);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

// Usage summary by academy (platform_admin only)
export async function getCodeUsageByAcademy(): Promise<
  {
    academy_id: string;
    academy_name: string;
    total_generated: number;
    total_redeemed: number;
    this_month_generated: number;
    this_month_redeemed: number;
  }[]
> {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) return [];

  const admin = createAdminClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: codes } = await admin
    .from('access_codes')
    .select('academy_id, used_by, created_at');

  const { data: academies } = await admin
    .from('academies')
    .select('id, name');

  if (!codes || !academies) return [];

  const academyMap = new Map<string, string>(
    academies.map((a: { id: string; name: string }) => [a.id, a.name])
  );

  const byAcademy = new Map<
    string,
    { total: number; redeemed: number; thisMonthTotal: number; thisMonthRedeemed: number }
  >();

  for (const c of codes) {
    if (!c.academy_id) continue;
    const entry = byAcademy.get(c.academy_id) ?? {
      total: 0,
      redeemed: 0,
      thisMonthTotal: 0,
      thisMonthRedeemed: 0,
    };
    entry.total++;
    if (c.used_by) entry.redeemed++;
    if (c.created_at >= monthStart) {
      entry.thisMonthTotal++;
      if (c.used_by) entry.thisMonthRedeemed++;
    }
    byAcademy.set(c.academy_id, entry);
  }

  return Array.from(byAcademy.entries()).map(([academy_id, stats]) => ({
    academy_id,
    academy_name: academyMap.get(academy_id) ?? 'Unknown',
    total_generated: stats.total,
    total_redeemed: stats.redeemed,
    this_month_generated: stats.thisMonthTotal,
    this_month_redeemed: stats.thisMonthRedeemed,
  }));
}

// ─── PUBLIC ACTIVATE FLOW ───

// Validate a code without consuming it (step 1 of /activate)
export async function validateAccessCode(
  code: string
): Promise<{ ok: true; productType: string } | { ok: false; error: string }> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('access_codes')
    .select('code, product_type, used_by, expires_at')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle();

  if (error) return { ok: false, error: 'Could not validate code' };
  if (!data) return { ok: false, error: 'Code not found' };
  if (data.used_by) return { ok: false, error: 'This code has already been used' };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, error: 'This code has expired' };
  }

  return { ok: true, productType: data.product_type };
}

// Redeem a code and create a student account (step 2 of /activate)
export async function redeemCodeAndCreateStudent(
  code: string,
  profile: {
    firstName: string;
    lastName: string;
    email?: string;
    country?: string;
    dob?: string;
  }
): Promise<{ ok: true; portalToken: string } | { ok: false; error: string }> {
  const admin = createAdminClient();

  // Re-validate the code
  const { data: codeRow } = await admin
    .from('access_codes')
    .select('code, product_type, used_by, expires_at, academy_id')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle();

  if (!codeRow) return { ok: false, error: 'Code not found' };
  if (codeRow.used_by) return { ok: false, error: 'Code already used' };
  if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
    return { ok: false, error: 'Code expired' };
  }

  // Derive age from date of birth (students table has `age`, not `dob`)
  let age: number | null = null;
  if (profile.dob) {
    const birth = new Date(profile.dob);
    if (!isNaN(birth.getTime())) {
      const now = new Date();
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      if (age < 0 || age > 120) age = null;
    }
  }

  // Create student record. The students table uses `nationality` (not
  // `country`) and `age` (not a DOB column). The course is queued in
  // pending_courses — it activates automatically the moment the student
  // completes the intake ficha + signs the waiver (submitBasicIntake →
  // activatePendingCoursesForStudent). Access codes no longer bypass the
  // waiver gate.
  const { data: newStudent, error: studentErr } = await admin
    .from('students')
    .insert({
      first_name: profile.firstName.trim(),
      last_name: profile.lastName.trim(),
      email: profile.email?.trim() || null,
      nationality: profile.country?.trim() || null,
      age,
      belt_level: 'white_belt',
      academy_id: codeRow.academy_id || null,
      course_access_white: false,
      pending_courses: [codeRow.product_type],
      signup_code: code.toUpperCase().trim(),
    })
    .select('id, portal_token')
    .single();

  if (studentErr || !newStudent) {
    return { ok: false, error: studentErr?.message || 'Failed to create student' };
  }

  // Mark the code consumed (but do NOT grant access yet — that happens on
  // waiver signature via the pending_courses activation).
  const { error: updateCodeErr } = await admin
    .from('access_codes')
    .update({ used_by: newStudent.id, used_at: new Date().toISOString() })
    .eq('code', code.toUpperCase().trim());
  if (updateCodeErr) {
    await admin.from('students').delete().eq('id', newStudent.id);
    return { ok: false, error: updateCodeErr.message };
  }

  return { ok: true, portalToken: newStudent.portal_token as string };
}
