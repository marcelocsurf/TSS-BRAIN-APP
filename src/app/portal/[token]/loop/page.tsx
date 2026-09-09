// ═══ /portal/[token]/loop — The Infinite Circle, el curso del lenguaje ═══
// Marcelo (2026-09-09): teórico, en dos lados (frontside / backside), con el
// código de colores; se estudia antes de las secuencias #8-#13.
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

export default async function LoopPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();
  const admin = createAdminClient();
  const blue = COURSES.find((c) => c.key === 'blue_belt')!;
  const { data: student } = await admin.from('students').select(`id, ${blue.accessColumn}`).eq('portal_token', token).maybeSingle();
  if (!student) notFound();
  const owns = COURSE_OWNER_IDS.has((student as any).id) || !!(student as any)[blue.accessColumn];
  if (!owns) notFound();

  const [{ data: videoRow }, { data: loopLesson }] = await Promise.all([
    // Convención: video en Library (kind video) con título que empieza por "BB-LOOP".
    admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', 'BB-LOOP%').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('lessons').select('id').eq('id', LOOP_LESSON_ID).eq('active', true).maybeSingle(),
  ]);

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      <InfiniteCirclePage
        token={token}
        video={videoRow?.file_url ? { url: videoRow.file_url, title: videoRow.title } : null}
        threeCirclesLessonId={THREE_CIRCLES_LESSON_ID}
        loopLessonId={loopLesson?.id ?? null}
      />
    </div>
  );
}
