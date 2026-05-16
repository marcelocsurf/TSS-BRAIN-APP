export const COURSES = [
  { key: 'white_belt', label: 'White Belt Masterclass', accessColumn: 'course_access_white' as const },
] as const;

export type CourseKey = typeof COURSES[number]['key'];

export function getCourse(key: string) {
  return COURSES.find((c) => c.key === key) ?? null;
}
