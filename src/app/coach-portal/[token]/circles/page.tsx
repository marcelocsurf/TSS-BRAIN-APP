// ═══ /coach-portal/[token]/circles — The Three Circles, como los ve el alumno ═══
// Paso 3 de unificar el curso (Marcelo 2026-09-29): la MISMA página del alumno
// (ThreeCirclesPage) en modo coach — mismas láminas, drills y juegos, con
// "Teach it" por círculo. Hasta su cinta (+ la de sus camps): los Tres
// Círculos son del curso Yellow.
import { parseFrom, coachBack } from '@/lib/nav/origin';
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { THREE_CIRCLES_LESSON_ID } from '@/lib/constants/learning-blocks';
import { CIRCLES, MOVE_LESSON_IDS } from '@/lib/sequence-pages/three-circles';
import { SEQUENCE_PAGES } from '@/lib/sequence-pages';
import { ThreeCirclesPage } from '@/components/portal/sequence-page/ThreeCirclesPage';
import type { PieceRow } from '@/components/portal/sequence-page/SequencePage';
import { coachTeachRank } from '@/lib/coach/teach-rank';
import { loadCourseMedia } from '@/lib/coach/course-media';
import { movementVideos, threeCirclesVideos } from '@/lib/coach/course-map';
import { THREE_CIRCLES_LAMINAS } from '@/lib/sequence-pages/laminas';
import { sequencePageRank } from '@/lib/coach/course-access';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CoachCirclesPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams?: Promise<{ from?: string }> }) {
  const sp = searchParams ? await searchParams : undefined;
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, course_access_granted, course_access_scope, max_belt_permission').eq('portal_token', token).maybeSingle();
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();
  if (sequencePageRank(SEQUENCE_PAGES['CIRCLE-BODY']) > await coachTeachRank(admin, coach as any)) notFound();

  // El coach ve también lo de su catálogo (activo), no solo lo visible al alumno.
  const drillIds = CIRCLES.flatMap((c) => [...(c.feel ?? []), ...(c.play ?? []), ...(c.moves ?? []).flatMap((m) => [...m.feel, ...(m.play ?? [])])]);
  const [{ data: pieceRows }, { data: videoRow }] = await Promise.all([
    admin.from('drills_missions').select('id, type, title, description_md, key_words, time_estimate, reps_recommended').eq('active', true).in('id', drillIds),
    admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', 'YB-CIRCLES%').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const pieces: Record<string, PieceRow> = {};
  for (const p of pieceRows ?? []) pieces[p.id] = p as PieceRow;

  // Todos los videos (Library + la lección + cada movimiento) y las láminas, de la fuente única.
  const media = await loadCourseMedia(admin, [THREE_CIRCLES_LESSON_ID, ...MOVE_LESSON_IDS]);
  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/tss/theme.css" />
      <ThreeCirclesPage
        token={token}
        pieces={pieces}
        canTrack={false}
        video={videoRow?.file_url ? { url: videoRow.file_url, title: videoRow.title } : null}
        lessonId={THREE_CIRCLES_LESSON_ID}
        moveVideos={movementVideos(media)}
        coach={{ backHref: coachBack(parseFrom(sp?.from, 'coach'), token, { k: 'course', belt: 'yellow' }).href, laminas: THREE_CIRCLES_LAMINAS, videos: threeCirclesVideos(media) }}
      />
    </div>
  );
}
