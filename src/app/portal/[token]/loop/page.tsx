// ═══ /portal/[token]/loop — The Infinite Circle, el curso del lenguaje ═══
// Marcelo (2026-09-09): teórico, en dos lados (frontside / backside), con el
// código de colores; se estudia antes de las secuencias #8-#13.
import { parseFrom, studentBack } from '@/lib/nav/origin';
import { getCourseLocks } from '@/lib/portal/course-lock';
import { CourseLockedScreen } from '@/components/portal/CourseLockedScreen';
import { CourseNotOwnedScreen } from '@/components/portal/CourseNotOwnedScreen';
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { COURSES } from '@/lib/constants/courses';
import { THREE_CIRCLES_LESSON_ID } from '@/lib/constants/learning-blocks';
import { InfiniteCirclePage } from '@/components/portal/sequence-page/InfiniteCirclePage';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COURSE_OWNER_IDS = new Set(['3518cc9c-d633-44ff-b32a-bfb86b5ae748', '0f6816db-a637-4af0-86b6-1a1c8227953c']);
/** La lección del curso que este página reemplaza en pantalla (sigue contando para el progreso). */
const LOOP_LESSON_ID = 'BB-FND-INF';

export default async function LoopPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams?: Promise<{ from?: string; side?: string }> }) {
  const { token } = await params;
  const sp = searchParams ? await searchParams : {};
  // De dónde llegó (?from=) y qué lado abrir (?side=), 2026-10-01.
  const parsed = parseFrom(sp.from, 'student');
  const origin = parsed && parsed.k !== 'loop' ? parsed : null;
  const initialSide = sp.side === 'fs' || sp.side === 'bs' ? sp.side : null;
  if (!UUID_RE.test(token)) notFound();
  const admin = createAdminClient();
  const blue = COURSES.find((c) => c.key === 'blue_belt')!;
  const { data: student } = await admin.from('students').select(`id, ${blue.accessColumn}`).eq('portal_token', token).maybeSingle();
  if (!student) notFound();
  const owns = COURSE_OWNER_IDS.has((student as any).id) || !!(student as any)[blue.accessColumn];
  // Sin Blue (p. ej. "Study it" desde el plan de un camp de otra cinta): la
  // pantalla que explica, no la de error (Marcelo 2026-10-01).
  if (!owns) {
    const b = studentBack(origin, token, { k: 'home' });
    return (
      <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
        <CourseNotOwnedScreen
          eyebrow={`Part of the ${blue.label}`}
          title="The Infinite Circle"
          body={`The Infinite Circle opens with the ${blue.label}. The full page unlocks when that course is yours.`}
          backHref={b.href}
          backLabel={origin ? `Back to ${b.label}` : 'Back to your portal'}
        />
      </div>
    );
  }
  if (!COURSE_OWNER_IDS.has((student as any).id)) {
    const lock = (await getCourseLocks((student as any).id))[blue.key];
    if (lock) return <CourseLockedScreen token={token} unlocksOn={lock.unlocksOn} campName={lock.campName} what="The Infinite Circle" />;
  }

  const [{ data: videoRow }, { data: loopLesson }] = await Promise.all([
    // Convención: video en Library (kind video) con título que empieza por "BB-LOOP".
    admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', 'BB-LOOP%').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('lessons').select('id').eq('id', LOOP_LESSON_ID).eq('active', true).maybeSingle(),
  ]);

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      {/* Faltaba (Marcelo 2026-09-24): la clase tss-v10 estaba pero la hoja
          no, así que la pantalla caía en sus propios estilos oscuros en vez
          del molde de arena de v10.1. Es la misma línea que carga /circles. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/tss/theme.css" />
      <InfiniteCirclePage
        back={studentBack(origin, token, { k: 'course' })}
        navTab={origin?.k === 'home' ? 'home' : origin?.k === 'play' || origin?.k === 'plan' ? 'sequence' : 'course'}
        initialSide={initialSide as any}
        token={token}
        video={videoRow?.file_url ? { url: videoRow.file_url, title: videoRow.title } : null}
        threeCirclesLessonId={THREE_CIRCLES_LESSON_ID}
        loopLessonId={loopLesson?.id ?? null}
      />
    </div>
  );
}
