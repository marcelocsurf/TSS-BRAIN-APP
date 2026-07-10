'use server';

// Achievements / Recognitions engine (v1). Everything is DERIVED from data
// that already exists — no new tables. Given a student, it computes their
// stats and returns the full badge catalog with earned/locked + progress,
// plus their current belt "certificate". Read-only.

import { createAdminClient } from '@/lib/supabase/admin';
import { BELT_RANK, BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

export interface Achievement {
  id: string;
  category: 'belt' | 'course' | 'sessions' | 'water' | 'streak' | 'lessons' | 'steps';
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  progress?: { current: number; target: number };
}

export interface AchievementsData {
  earnedCount: number;
  totalCount: number;
  belt: { key: string; label: string; rank: number } | null;
  achievements: Achievement[];
  // A few not-yet-earned goals with the most progress — the "keep going" row.
  nextUp: Achievement[];
}

const BELTS: BeltLevel[] = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];
const BELT_ICON: Record<string, string> = {
  white_belt: '🤍', yellow_belt: '💛', blue_belt: '💙',
  purple_belt: '💜', brown_belt: '🤎', black_belt: '🖤',
};

// longest run of consecutive calendar days present in a set of yyyy-mm-dd strings
function longestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0;
  const sorted = [...dates].sort();
  let best = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    const cur = new Date(sorted[i] + 'T00:00:00');
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) { run++; best = Math.max(best, run); }
    else if (diff > 1) { run = 1; }
  }
  return best;
}

export async function getStudentAchievements(portalToken: string): Promise<AchievementsData | null> {
  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, belt_level')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (!student) return null;
  const sid = student.id;

  // Pull the signals in parallel. Everything is guarded to empty on error.
  const [progressRes, quizRes, ratingsRes, sessionsRes, selfRes, lessonsRes] = await Promise.all([
    admin.from('lesson_progress').select('lesson_id, completed, completed_at').eq('student_id', sid),
    admin.from('course_final_quiz_attempts').select('course_key, passed').eq('student_id', sid),
    admin.from('student_step_ratings').select('step_id, coach_rating, current_rating').eq('student_id', sid),
    admin.from('student_session_results').select('created_at, duration_minutes').eq('student_id', sid),
    admin.from('self_training_sessions').select('session_date, duration_minutes, total_water_minutes').eq('student_id', sid),
    admin.from('lessons').select('id, course_section').eq('active', true),
  ]);

  const progress = progressRes.data ?? [];
  const completedIds = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.lesson_id));
  const lessonsCompleted = completedIds.size;

  // Section completion: a course_section is "complete" when every active
  // lesson in it is completed.
  const sectionTotal: Record<string, number> = {};
  const sectionOf: Record<string, string> = {};
  for (const l of (lessonsRes.data ?? []) as any[]) {
    sectionTotal[l.course_section] = (sectionTotal[l.course_section] || 0) + 1;
    sectionOf[l.id] = l.course_section;
  }
  const sectionDone: Record<string, number> = {};
  for (const id of completedIds) {
    const sec = sectionOf[id as string];
    if (sec) sectionDone[sec] = (sectionDone[sec] || 0) + 1;
  }
  const sectionComplete = (sec: string) => (sectionTotal[sec] ?? 0) > 0 && (sectionDone[sec] ?? 0) >= sectionTotal[sec];

  const passedCourses = new Set(
    (quizRes.data ?? []).filter((q: any) => q.passed).map((q: any) => q.course_key),
  );

  const stepsMastered = (ratingsRes.data ?? []).filter(
    (r: any) => (r.coach_rating ?? 0) >= 4 || (r.current_rating ?? 0) >= 4,
  ).length;

  const coachSessions = sessionsRes.data ?? [];
  const selfSessions = selfRes.data ?? [];
  const sessionsCount = coachSessions.length + selfSessions.length;

  let waterMinutes = 0;
  for (const s of coachSessions as any[]) waterMinutes += s.duration_minutes || 0;
  for (const s of selfSessions as any[]) waterMinutes += s.total_water_minutes || s.duration_minutes || 0;
  const waterHours = Math.floor(waterMinutes / 60);

  const dates = new Set<string>();
  for (const s of coachSessions as any[]) if (s.created_at) dates.add(String(s.created_at).slice(0, 10));
  for (const s of selfSessions as any[]) if (s.session_date) dates.add(String(s.session_date).slice(0, 10));
  const streak = longestStreak(dates);

  const beltRank = student.belt_level ? BELT_RANK[student.belt_level as BeltLevel] ?? 0 : 0;

  // ── Build the catalog ──────────────────────────────────────
  const A: Achievement[] = [];

  // Belts earned (one per belt up to the current rank)
  for (const b of BELTS) {
    const rank = BELT_RANK[b];
    A.push({
      id: `belt-${b}`, category: 'belt', icon: BELT_ICON[b],
      title: `${BELT_DISPLAY[b]?.en ?? b}`,
      description: `Earn your ${BELT_DISPLAY[b]?.en ?? b}.`,
      earned: beltRank >= rank,
    });
  }

  // Course completions (belt masterclasses that have content)
  const courseSections: Array<[string, string]> = [
    ['white_belt', 'White Belt Course'], ['yellow_belt', 'Yellow Belt Course'],
    ['blue_belt', 'Blue Belt Course'], ['purple_belt', 'Purple Belt Course'],
  ];
  for (const [sec, title] of courseSections) {
    A.push({
      id: `course-${sec}`, category: 'course', icon: '📘',
      title, description: `Complete every lesson of the ${title}.`,
      earned: sectionComplete(sec),
      progress: { current: sectionDone[sec] ?? 0, target: sectionTotal[sec] ?? 0 },
    });
  }
  // Exit tests passed
  for (const [key, name] of [['white_belt', 'White'], ['yellow_belt', 'Yellow'], ['blue_belt', 'Blue']]) {
    A.push({
      id: `exit-${key}`, category: 'course', icon: '🎓',
      title: `${name} Belt Certified`, description: `Pass the ${name} Belt exit test.`,
      earned: passedCourses.has(key),
    });
  }

  const tier = (id: string, cat: Achievement['category'], icon: string, title: string, desc: string, current: number, target: number) =>
    A.push({ id, category: cat, icon, title, description: desc, earned: current >= target, progress: { current: Math.min(current, target), target } });

  // Sessions
  tier('sess-1', 'sessions', '🌊', 'First Wave', 'Log your first session.', sessionsCount, 1);
  tier('sess-10', 'sessions', '🏄', 'Getting Consistent', 'Log 10 sessions.', sessionsCount, 10);
  tier('sess-25', 'sessions', '🏄', 'Committed', 'Log 25 sessions.', sessionsCount, 25);
  tier('sess-50', 'sessions', '🏆', 'Veteran', 'Log 50 sessions.', sessionsCount, 50);
  // Water hours
  tier('water-1', 'water', '⏱️', 'First Hour', 'Reach 1 hour in the water.', waterHours, 1);
  tier('water-10', 'water', '🌊', '10 Hours', 'Reach 10 hours in the water.', waterHours, 10);
  tier('water-25', 'water', '🌊', '25 Hours', 'Reach 25 hours in the water.', waterHours, 25);
  tier('water-50', 'water', '🔱', '50 Hours', 'Reach 50 hours in the water.', waterHours, 50);
  // Streak
  tier('streak-3', 'streak', '🔥', 'On a Roll', 'Train 3 days in a row.', streak, 3);
  tier('streak-7', 'streak', '🔥', 'Weekly Warrior', 'Train 7 days in a row.', streak, 7);
  tier('streak-30', 'streak', '⚡', 'Unstoppable', 'Train 30 days in a row.', streak, 30);
  // Lessons
  tier('less-10', 'lessons', '📖', 'Student', 'Complete 10 lessons.', lessonsCompleted, 10);
  tier('less-50', 'lessons', '📚', 'Scholar', 'Complete 50 lessons.', lessonsCompleted, 50);
  tier('less-100', 'lessons', '📚', 'Devoted', 'Complete 100 lessons.', lessonsCompleted, 100);
  // Steps mastered
  tier('step-5', 'steps', '🎯', 'Skill Builder', 'Master 5 steps (4★+).', stepsMastered, 5);
  tier('step-10', 'steps', '🎯', 'Technician', 'Master 10 steps (4★+).', stepsMastered, 10);
  tier('step-25', 'steps', '🥇', 'Sequence Master', 'Master 25 steps (4★+).', stepsMastered, 25);

  const earned = A.filter((a) => a.earned);
  const nextUp = A
    .filter((a) => !a.earned && a.progress && a.progress.target > 0)
    .sort((x, y) => (y.progress!.current / y.progress!.target) - (x.progress!.current / x.progress!.target))
    .slice(0, 3);

  return {
    earnedCount: earned.length,
    totalCount: A.length,
    belt: student.belt_level
      ? { key: student.belt_level, label: BELT_DISPLAY[student.belt_level as BeltLevel]?.en ?? student.belt_level, rank: beltRank }
      : null,
    achievements: A,
    nextUp,
  };
}
