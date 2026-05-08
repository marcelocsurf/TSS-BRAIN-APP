import { type BeltLevel } from '@/lib/constants/belts';
import { notFound } from 'next/navigation';
import {
  getStudentPortalData,
  getStudentMaterials,
  getStudentDrillsForSelfTraining,
  getPendingSurveys,
  getSubmittedSurveys,
} from '@/lib/actions/portal';
import { getCourseCatalog } from '@/lib/actions/course';
import { PortalTabs } from './portal-tabs';

// Always fetch fresh data — no caching of student portal
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function StudentPortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { tab } = await searchParams;

  // Get comprehensive student data
  const portalData = await getStudentPortalData(token);
  if (!portalData) notFound();

  const { student } = portalData;
  const beltLevel = student.belt_level as BeltLevel;

  // Fetch parallel data — materials use admin access control via student_level_access
  const [materials, drills, pendingSurveys, submittedSurveys, courseCatalog] = await Promise.all([
    getStudentMaterials(student.id, beltLevel),
    getStudentDrillsForSelfTraining(beltLevel),
    getPendingSurveys(student.id),
    getSubmittedSurveys(student.id),
    getCourseCatalog(student.id),
  ]);

  // Course owners (TSS founders) bypass the access gate so they can review
  // content without needing a paid course code. Keep in sync with
  // COURSE_OWNER_IDS in src/lib/actions/course.ts.
  const COURSE_OWNER_IDS = new Set<string>([
    '3518cc9c-d633-44ff-b32a-bfb86b5ae748', // Marcelo Castellanos
  ]);
  const isOwner = COURSE_OWNER_IDS.has(student.id);

  // Build course data
  const courseData = {
    lessons: courseCatalog.lessons,
    preCourseCompleted: courseCatalog.preCourseCompleted,
    totalCompleted: courseCatalog.totalCompleted,
    totalLessons: courseCatalog.totalLessons,
    studentId: student.id,
    studentName: student.first_name || student.display_name || 'student',
    hasAccess: isOwner || student.course_access_white === true,
  };

  // Validate initialTab against allowed tab values
  const validTabs = ['home', 'course', 'sequence', 'sessions', 'self-training', 'feedback'];
  const initialTab = tab && validTabs.includes(tab) ? (tab as any) : undefined;

  return (
    <PortalTabs
      data={{
        ...portalData,
        drills,
        pendingSurveys,
        submittedSurveys,
        materials,
        token,
        courseData,
      }}
      initialTab={initialTab}
    />
  );
}
