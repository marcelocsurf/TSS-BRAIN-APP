'use server';

// M49 — Student picks which course they are currently studying from
// the dropdown above the Course tab. The selection persists on
// `students.active_course_key` so it survives across devices and
// drives Course tab + My Sequence + Let's Play filtering.

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { COURSES, type CourseKey } from '@/lib/constants/courses';

export async function setActiveCourseKey(
  portalToken: string,
  nextCourseKey: CourseKey,
): Promise<void> {
  if (!COURSES.find((c) => c.key === nextCourseKey)) {
    throw new Error(`Unknown course key: ${nextCourseKey}`);
  }

  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, course_access_white, course_access_yellow')
    .eq('portal_token', portalToken)
    .single();
  if (!student) throw new Error('Student not found.');

  // Refuse to switch into a course the student doesn't own. This is
  // belt-and-suspenders — the dropdown only lists owned courses, but
  // a hand-crafted request shouldn't be able to bypass the gate.
  const course = COURSES.find((c) => c.key === nextCourseKey)!;
  const owned = !!(student as any)[course.accessColumn];
  if (!owned) {
    throw new Error('This course is not unlocked for this student.');
  }

  const { error } = await admin
    .from('students')
    .update({ active_course_key: nextCourseKey })
    .eq('id', student.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/portal/${portalToken}`);
}
