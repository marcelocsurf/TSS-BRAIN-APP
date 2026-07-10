import { type BeltLevel } from '@/lib/constants/belts';
import { notFound, redirect } from 'next/navigation';
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
import { validateStudentSession } from '@/lib/actions/student-pin';
import { getActiveStudentOrCoachImpersonation } from '@/lib/actions/impersonate';
import { ImpersonateBanner } from '@/components/admin/ImpersonateBanner';
import { PortalTabs } from './portal-tabs';

// Always fetch fresh data — no caching of student portal
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tab?: string; survey?: string; drill?: string; step?: string }>;
}

export default async function StudentPortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { tab, survey, drill, step } = await searchParams;

  // Skip the anti-sharing check when an admin is impersonating — they
  // legitimately have multiple "sessions" open across alumnos.
  const impersonation = await getActiveStudentOrCoachImpersonation();
  const isImpersonatingThisStudent =
    impersonation?.kind === 'student' && impersonation.portal_token === token;

  if (!isImpersonatingThisStudent) {
    const sessionState = await validateStudentSession(token);
    if (sessionState.status === 'kicked') {
      redirect('/?kicked=1');
    }
  }

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

  // M49 — Build the list of courses this student owns and resolve the
  // currently active one. Course owners (TSS founders) see every
  // course so they can review content; everyone else sees the courses
  // for which their access flag is true.
  const { COURSES } = await import('@/lib/constants/courses');
  const ownedCourses = COURSES.filter((c) =>
    isOwner ? true : !!(student as any)[c.accessColumn],
  );
  // Default to the white belt course; fall back to the first owned one
  // if the stored active_course_key is stale (e.g. course was revoked).
  const storedActive = (student as any).active_course_key as string | undefined;
  const activeCourse =
    ownedCourses.find((c) => c.key === storedActive) ?? ownedCourses[0] ?? null;

  // Build course data
  const courseData = {
    lessons: courseCatalog.lessons,
    preCourseCompleted: courseCatalog.preCourseCompleted,
    totalCompleted: courseCatalog.totalCompleted,
    totalLessons: courseCatalog.totalLessons,
    studentId: student.id,
    studentName: student.first_name || student.display_name || 'student',
    isOwner,
    hasAccess: isOwner || ownedCourses.length > 0,
    // M49 — multi-course wiring
    ownedCourses: ownedCourses.map((c) => ({ key: c.key, label: c.label })),
    activeCourseKey: activeCourse?.key ?? 'white_belt',
    portalToken: token,
    activeCourseBelt: activeCourse?.belt ?? 'white',
  };

  // Validate initialTab against allowed tab values
  const validTabs = ['home', 'course', 'sequence', 'sessions', 'feedback', 'glossary', 'my-coach'];
  const initialTab = tab && validTabs.includes(tab) ? (tab as any) : undefined;

  return (
    <>
      {isImpersonatingThisStudent && impersonation && (
        <ImpersonateBanner kind="student" name={impersonation.name} />
      )}
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
        initialStepId={step || null}
      />
    </>
  );
}
