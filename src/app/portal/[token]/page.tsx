import { Archivo, IBM_Plex_Mono } from 'next/font/google';
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
import { getCoachSideForStudent } from '@/lib/actions/dual-profile';
import { getNextMove } from '@/lib/actions/sequence';
import { RenewalGate } from './RenewalGate';
import { getMembershipInfo } from '@/lib/actions/memberships';
import { getMyProgram, getMySeason, getMyAppointments, getMyAthleteScores, getMyMessages, getMyTeamWall, getMyTodayExtras } from '@/lib/actions/programs';
import { getMyCompetitions } from '@/lib/actions/competitions';
import { getMyStudentResources } from '@/lib/actions/coach-resources';

// Always fetch fresh data — no caching of student portal

// Brand Manual v10 typefaces — Archivo (wdth axis → Expanded display) +
// IBM Plex Mono labels. Scoped to the student portal via CSS variables.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
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

  // M156 — membresía: solo gatea a MIEMBROS (leads/drop-ins pasan; el waiver,
  // el intake y las encuestas viven fuera de esta puerta o dentro de camps
  // activos, que extienden membresía al inscribirse).
  if ((student as any).lifecycle_status === 'member') {
    const membership = await getMembershipInfo(student.id);
    if (!membership.active) {
      return (
        <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
          <RenewalGate
            token={token}
            firstName={student.first_name || 'surfer'}
            beltLabel={String(student.belt_level || 'surf').replace(/_/g, ' ')}
            endedAt={membership.ends_at}
            alreadyRequested={membership.pending_request}
          />
        </div>
      );
    }
  }

  const coachUnlocked = !!(student as any).coach_profile_unlocked_at;

  // Fetch parallel data — materials use admin access control via student_level_access
  const { getPendingExperienceForStudent } = await import('@/lib/actions/experience-survey');
  // PERF (reporte 2026-08-23: el programa tardaba 40-60s en aparecer): las
  // tarjetas del Home eran autocontenidas y disparaban su server action al
  // montar — Next ejecuta las actions de un cliente EN FILA, así que la cola
  // sumaba todas las latencias. Ahora TODO se lee acá, en paralelo, y las
  // tarjetas reciben `initial` — el Home sale completo de una.
  // ACCESO DE ALTO RENDIMIENTO (Marcelo 2026-08-25): "que de alguna forma se
  // les otorgue high performance access y ahí automáticamente les muestra todo
  // el año". Sin ese permiso, la línea HP no existe para el alumno — y sus
  // OCHO lecturas ni siquiera se disparan. Son 2.765 de 2.786 alumnos activos:
  // el Home de casi todos deja de pagar ocho consultas que nunca dieron nada.
  const hpAccess = (student as any).hp_access === true;
  const noHP = Promise.resolve(null);

  const [materials, drills, drillsMissions, pendingSurveys, submittedSurveys, courseCatalog, myCoach, pendingExperience,
    hbProgram, hbSeason, hbCompetitions, hbAppointments, hbScores, hbMessages, hbTeamWall, hbTodayExtras, hbPresentations] = await Promise.all([
    getStudentMaterials(student.id, beltLevel),
    getStudentDrillsForSelfTraining(beltLevel),
    getDrillsMissionsForBelt(beltLevel),
    getPendingSurveys(student.id),
    getSubmittedSurveys(student.id),
    getCourseCatalog(student.id),
    coachUnlocked ? getMyCoachData(student.id) : Promise.resolve(null),
    getPendingExperienceForStudent(student.id).catch(() => null),
    hpAccess ? getMyProgram(token).catch(() => null) : noHP,
    hpAccess ? getMySeason(token).catch(() => null) : noHP,
    hpAccess ? getMyCompetitions(token).catch(() => null) : noHP,
    hpAccess ? getMyAppointments(token).catch(() => null) : noHP,
    hpAccess ? getMyAthleteScores(token).catch(() => null) : noHP,
    // Los mensajes del coach (campana 🔔) NO son de alto rendimiento: cualquier
    // alumno puede recibir uno. Ese se lee siempre.
    getMyMessages(token).catch(() => null),
    hpAccess ? getMyTeamWall(token).catch(() => null) : noHP,
    hpAccess ? getMyTodayExtras(token).catch(() => null) : noHP,
    getMyStudentResources(token).catch(() => [] as any[]),
  ]);

  // Bundle del Home: valores ya desenvueltos, con la MISMA semántica que cada
  // tarjeta usaba al hacer su propio fetch (ok:false → conservar null/[]).
  const homeBundle = {
    program: hbProgram?.ok ? hbProgram.data : null,
    season: hbSeason?.ok ? hbSeason.data : null,
    competitions: hbCompetitions?.ok && hbCompetitions.data ? hbCompetitions.data : null,
    appointments: hbAppointments?.ok ? hbAppointments.appointments : [],
    scores: hbScores?.ok ? hbScores.data : null,
    messages: hbMessages?.ok ? hbMessages.messages : [],
    teamWall: hbTeamWall?.ok ? hbTeamWall.data : null,
    todayExtras: hbTodayExtras?.ok ? hbTodayExtras.data : null,
    presentations: hbPresentations ?? [],
    hpAccess,
  };

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

  // Los drills vienen EN EL PAQUETE con el curso (Marcelo 2026-08-27). Hasta
  // hoy Let's Play era abierto: se mostraba por cinta, sin mirar si el alumno
  // tenía el curso. Inscribirse a un camp ya otorga el curso automáticamente
  // (auto_on_camp_enrol), así que nadie que esté entrenando pierde nada.
  const hasAnyCourse = ownedCourses.length > 0;

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
      <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      <PortalTabs
        data={{
          ...portalData,
          drills,
          drillsMissions,
          pendingSurveys,
          submittedSurveys,
          pendingExperience,
          homeBundle,
          materials,
          token,
          courseData,
          myCoach,
          coachProfileUnlocked: coachUnlocked,
          coachSide: await getCoachSideForStudent(student.id),
          hasAnyCourse,
          // El próximo movimiento: la primera secuencia sin lograr y el paso
          // que la frena. Sale de las notas que el coach ya puso.
          nextMove: await getNextMove(student.id, activeCourse?.belt ?? 'white'),
        }}
        initialTab={initialTab}
        initialSurveyId={survey || null}
        initialDrillId={drill || null}
        initialStepId={step || null}
      />
      </div>
    </>
  );
}
