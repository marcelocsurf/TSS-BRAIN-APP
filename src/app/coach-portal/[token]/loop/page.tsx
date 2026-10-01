// ═══ /coach-portal/[token]/loop — The Infinite Circle, como lo ve el alumno ═══
// Paso 3 de unificar el curso (Marcelo 2026-09-29): la MISMA página del alumno
// (InfiniteCirclePage) en modo coach. Es del curso Blue: hasta su cinta (+ la
// de sus camps).
import { parseFrom, coachBack } from '@/lib/nav/origin';
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { THREE_CIRCLES_LESSON_ID } from '@/lib/constants/learning-blocks';
import { InfiniteCirclePage } from '@/components/portal/sequence-page/InfiniteCirclePage';
import { coachTeachRank } from '@/lib/coach/teach-rank';
import { loadCourseMedia, dedupeVideos } from '@/lib/coach/course-media';
import { INFINITE_CIRCLE_LAMINAS } from '@/lib/sequence-pages/laminas';
import { BELT_RANK } from '@/lib/coach/course-access';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CoachLoopPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams?: Promise<{ from?: string; side?: string }> }) {
  const sp = searchParams ? await searchParams : undefined;
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, course_access_granted, course_access_scope, max_belt_permission').eq('portal_token', token).maybeSingle();
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();
  if (BELT_RANK.blue > await coachTeachRank(admin, coach as any)) notFound();

  const { data: videoRow } = await admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', 'BB-LOOP%').order('created_at', { ascending: false }).limit(1).maybeSingle();

  // Todos los videos (Library + la lección) y las láminas, de la fuente única.
  const media = await loadCourseMedia(admin, ['BB-FND-INF']);
  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/tss/theme.css" />
      <InfiniteCirclePage
        token={token}
        video={videoRow?.file_url ? { url: videoRow.file_url, title: videoRow.title } : null}
        threeCirclesLessonId={THREE_CIRCLES_LESSON_ID}
        loopLessonId={null}
        initialSide={sp?.side === 'bs' || sp?.side === 'fs' ? sp.side : null}
        coach={{ backHref: coachBack(parseFrom(sp?.from, 'coach'), token, { k: 'course', belt: 'blue' }).href, laminas: INFINITE_CIRCLE_LAMINAS, videos: dedupeVideos([...media.libraryVideos('BB-LOOP'), ...media.videosOfLesson('BB-FND-INF')]) }}
      />
    </div>
  );
}
