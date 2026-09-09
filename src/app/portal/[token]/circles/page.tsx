// ═══ /portal/[token]/circles — The Three Circles of Power (fundamentos) ═══
// Marcelo (2026-09-09): Think + Feel, sin Do; la ola lleva juego; colores del
// lenguaje desde acá. Lo ve quien tiene Yellow o Blue (la lección YB-FND-01
// vive en yb_onboarding, compartida con Blue).
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStudentAccess } from '@/lib/portal/access';
import { THREE_CIRCLES_LESSON_ID } from '@/lib/constants/learning-blocks';
import { CIRCLES } from '@/lib/sequence-pages/three-circles';
import { ThreeCirclesPage } from '@/components/portal/sequence-page/ThreeCirclesPage';
import type { PieceRow } from '@/components/portal/sequence-page/SequencePage';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COURSE_OWNER_IDS = new Set(['3518cc9c-d633-44ff-b32a-bfb86b5ae748', '0f6816db-a637-4af0-86b6-1a1c8227953c']);

export default async function CirclesPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();
  const admin = createAdminClient();
  const { data: student } = await admin.from('students').select('id, course_access_yellow, course_access_blue').eq('portal_token', token).maybeSingle();
  if (!student) notFound();
  const owns = COURSE_OWNER_IDS.has(student.id) || !!(student as any).course_access_yellow || !!(student as any).course_access_blue;
  if (!owns) notFound();

  const drillIds = CIRCLES.flatMap((c) => [...(c.feel ?? []), ...(c.moves ?? []).flatMap((m) => m.feel)]);
  const [{ data: pieceRows }, access, { data: videoRow }] = await Promise.all([
    admin.from('drills_missions').select('id, type, title, description_md, key_words, time_estimate, reps_recommended').eq('active', true).in('id', drillIds),
    getStudentAccess(student.id),
    admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', 'YB-CIRCLES%').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const pieces: Record<string, PieceRow> = {};
  for (const p of pieceRows ?? []) pieces[p.id] = p as PieceRow;

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      <ThreeCirclesPage token={token} pieces={pieces} canTrack={access.canTrack} video={videoRow?.file_url ? { url: videoRow.file_url, title: videoRow.title } : null} lessonId={THREE_CIRCLES_LESSON_ID} />
    </div>
  );
}
