// Each TSS course the academy can grant a student. Add new entries here
// when a new belt course goes live.
//
// `key`           — stable id used in DB + URLs (matches lessons.course_section
//                   prefix and the short belt value used in drills_missions.belt).
// `label`         — what the student / coordinator sees in the picker.
// `belt`          — short belt key for drills_missions.belt filtering
//                   (matches `levelNameToBelt` mapping in lib/utils/belts.ts).
// `accessColumn`  — boolean column on students that gates access.
// `lessonSections`— the lessons.course_section values that belong to this
//                   course. Pre-course sections are shared and surfaced for
//                   every owned course, so they are NOT listed here.
// `sharedLessonSections` (optional) — sections owned by an earlier course
//                   that should ALSO appear in this course's onboarding
//                   block, rendered with their current completion state.
//                   For yellow_belt we surface wb_onboarding so a student
//                   coming from WB sees "Prerequisites from White Belt"
//                   already marked completed.
export const COURSES = [
  {
    key: 'white_belt',
    label: 'White Belt Masterclass',
    belt: 'white' as const,
    accessColumn: 'course_access_white' as const,
    lessonSections: ['wb_onboarding', 'white_belt'] as const,
    sharedLessonSections: [] as readonly string[],
  },
  {
    key: 'yellow_belt',
    label: 'Yellow Belt Masterclass',
    belt: 'yellow' as const,
    accessColumn: 'course_access_yellow' as const,
    lessonSections: ['yb_onboarding', 'yellow_belt'] as const,
    sharedLessonSections: ['wb_onboarding'] as readonly string[],
  },
  {
    key: 'blue_belt',
    label: 'Blue Belt Masterclass',
    belt: 'blue' as const,
    accessColumn: 'course_access_blue' as const,
    lessonSections: ['bb_onboarding', 'blue_belt'] as const,
    sharedLessonSections: ['wb_onboarding', 'yb_onboarding'] as readonly string[],
  },
  {
    key: 'purple_belt',
    label: 'Purple Belt Masterclass',
    belt: 'purple' as const,
    accessColumn: 'course_access_purple' as const,
    lessonSections: ['purple_belt'] as const,
    sharedLessonSections: [] as readonly string[],
  },
  {
    key: 'brown_belt',
    label: 'Brown Belt Masterclass',
    belt: 'brown' as const,
    accessColumn: 'course_access_brown' as const,
    lessonSections: ['brown_belt'] as const,
    sharedLessonSections: [] as readonly string[],
  },
  {
    key: 'black_belt',
    label: 'Black Belt Masterclass',
    belt: 'black' as const,
    accessColumn: 'course_access_black' as const,
    lessonSections: ['black_belt'] as const,
    sharedLessonSections: [] as readonly string[],
  },
] as const;

export type CourseKey = typeof COURSES[number]['key'];

export function getCourse(key: string) {
  return COURSES.find((c) => c.key === key) ?? null;
}

// The pre-course is shared across every belt course — the same 8
// fundamentals + values items appear above any belt-specific content
// regardless of which course the student is currently viewing.
export const SHARED_PRE_COURSE_SECTIONS = [
  'pre_course_fundamentals',
  'pre_course_values',
] as const;
