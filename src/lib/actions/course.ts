'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// ─── Types ───

export type LessonRow = {
  id: string;
  course_section: 'pre_course_fundamentals' | 'pre_course_values' | 'white_belt';
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

// ─── Get all lessons for a section ───

export async function getCourseCatalog(studentId: string) {
  const admin = createAdminClient();

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

  // Determine if pre-course is complete
  const preCourseLessons = (lessons || []).filter(
    (l: any) => l.course_section === 'pre_course_fundamentals' ||
                l.course_section === 'pre_course_values'
  );
  const preCourseCompleted = preCourseLessons.length > 0 &&
    preCourseLessons.every((l: any) => progressMap.get(l.id)?.completed);

  // Build response with lock state
  const enriched = (lessons || []).map((lesson: any, idx: number) => {
    const lessonProgress = progressMap.get(lesson.id);

    // Lock logic
    let locked = false;
    let lockReason: string | null = null;

    // White belt is locked until pre-course is complete
    if (lesson.course_section === 'white_belt' && !preCourseCompleted) {
      locked = true;
      lockReason = 'Complete the Pre-Course first to unlock White Belt lessons';
    }

    // Check prerequisites
    if (lesson.prerequisites && lesson.prerequisites.length > 0) {
      const prereqsMet = lesson.prerequisites.every((prereqId: string) =>
        progressMap.get(prereqId)?.completed
      );
      if (!prereqsMet && !locked) {
        locked = true;
        lockReason = `Complete previous lessons first`;
      }
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

  return {
    lesson,
    quizzes: quizzes || [],
    progress: progress || null,
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

  return { ok: !error, error: error?.message };
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
