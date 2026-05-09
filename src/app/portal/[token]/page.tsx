import { type BeltLevel } from '@/lib/constants/belts';
import { notFound } from 'next/navigation';
import {
  getStudentPortalData,
  getStudentMaterials,
  getStudentDrillsForSelfTraining,
  getDrillsMissionsForBelt,
  getPendingSurveys,
  getSubmittedSurveys,
  getMyCoachData,
} from '@/lib/actions/portal';
import { getCourseCatalog } from '@/lib/actions/course';
import { PortalTabs } from './portal-tabs';

// Always fetch fresh data — no caching of student portal
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tab?: string; survey?: string; drill?: string }>;
}

export default async function StudentPortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { tab, survey, drill } = await searchParams;

  // Get comprehensive student data
  const portalData = await getStudentPortalData(token);
  if (!portalData) notFound();

  const { student } = portalData;
  const beltLevel = student.belt_level as BeltLevel;

  const coachUnlocked = !!(student as any).coach_profile_unlocked_at;

  // Fetch parallel data — materials use admin access control via student_level_access
  const [materials, drills, drillsMissions, pendingSurveys, submittedSurveys, courseCatalog, myCoach] = await Promise.all([
    getStudentMaterials(student.id, beltLevel),
    getStudentDrillsForSelfTraining(beltLevel),
    getDrillsMissionsForBelt(beltLevel),
    getPendingSurveys(student.id),
    getSubmittedSurveys(student.id),
    getCourseCatalog(student.id),
    coachUnlocked ? getMyCoachData(student.id) : Promise.resolve(null),
  ]);

  // Course owners (TSS founders) bypass the access gate so they can review
  // content without needing a paid course code. Keep in sync with
  // COURSE_OWNER_IDS in src/lib/actions/course.ts.
  const COURSE_OWNER_IDS = new Set<string>([
    '3518cc9c-d633-44ff-b32a-bfb86b5ae748', // Marcelo Castellanos
    '0f6816db-a637-4af0-86b6-1a1c8227953c', // Androide Salvadoreno (review account)
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
  const validTabs = ['home', 'course', 'sequence', 'sessions', 'feedback', 'glossary', 'my-coach'];
  const initialTab = tab && validTabs.includes(tab) ? (tab as any) : undefined;

  return (
    <PortalTabs
      data={{
        ...portalData,
        drills,
        drillsMissions,
        pendingSurveys,
        submittedSurveys,
        materials,
        token,
        courseData,
        myCoach,
        coachProfileUnlocked: coachUnlocked,
      }}
      initialTab={initialTab}
      initialSurveyId={survey || null}
      initialDrillId={drill || null}
    />
  );
}
