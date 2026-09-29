// ═══ /coach-portal/[token]/course — el curso del alumno, a mano del coach ═══
// Marcelo 2026-09-29: "que el coach tenga a mano los cursos y, si quiere
// enseñar algo, que pueda elegir la filmina". Mismo orden que el curso del
// alumno, hasta la cinta del coach (+ la de sus camps), con cada lámina lista
// para ponerla en pantalla.
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { coachTeachRank } from '@/lib/coach/teach-rank';
import { buildCoachCourseMap } from '@/lib/coach/course-map';
import { CoachCourseBrowser } from '@/components/coach-portal/CoachCourseBrowser';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CoachCoursePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, course_access_granted, course_access_scope, max_belt_permission').eq('portal_token', token).maybeSingle();
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();
  const tabs = await buildCoachCourseMap(admin, await coachTeachRank(admin, coach as any));
  return (
    <div className={`${archivo.variable} ${plexMono.variable}`}>
      <CoachCourseBrowser token={token} tabs={tabs} />
    </div>
  );
}
