'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { studentIdFromPortalToken } from '@/lib/portal/student-token';

const PASS_PCT = 0.8;

export interface FinalQuizQuestion { id: string; question: string; options: string[] }

// Public read for the token-based portal. Strips the correct flag — grading is
// server-side only.
export async function getFinalQuiz(courseKey: string): Promise<{ questions: FinalQuizQuestion[]; total: number }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('course_final_quiz')
    .select('id, question, options')
    .eq('course_key', courseKey)
    .order('display_order');
  const questions = (data ?? []).map((q: any) => ({
    id: q.id,
    question: q.question,
    options: (q.options as any[]).map((o) => o.text as string),
  }));
  return { questions, total: questions.length };
}

export async function getFinalQuizResult(portalToken: string, courseKey: string) {
  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from('course_final_quiz_attempts')
    .select('score, total, passed, created_at')
    .eq('student_id', studentId).eq('course_key', courseKey)
    .order('created_at', { ascending: false })
    .limit(1).maybeSingle();
  return data ?? null;
}

export async function submitFinalQuiz(
  portalToken: string,
  courseKey: string,
  answers: Record<string, number>,
): Promise<{ ok: boolean; score: number; total: number; passed: boolean; correct: Record<string, number> }> {
  const studentId = await studentIdFromPortalToken(portalToken);
  if (!studentId) return { ok: false, score: 0, total: 0, passed: false, correct: {} };
  const admin = createAdminClient();
  const { data } = await admin
    .from('course_final_quiz')
    .select('id, options')
    .eq('course_key', courseKey)
    .order('display_order');
  const questions = data ?? [];

  let score = 0;
  const correct: Record<string, number> = {};
  for (const q of questions) {
    const opts = (q as any).options as any[];
    const correctIdx = opts.findIndex((o) => o.correct === true);
    correct[(q as any).id] = correctIdx;
    if (answers[(q as any).id] === correctIdx) score += 1;
  }
  const total = questions.length;
  const passed = total > 0 && score / total >= PASS_PCT;

  await admin.from('course_final_quiz_attempts').insert({
    student_id: studentId, course_key: courseKey, score, total, passed,
  });

  return { ok: true, score, total, passed, correct };
}
