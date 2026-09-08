// ═══ /portal/[token]/seq/[seqId] — la secuencia en cuatro pestañas ═══
// Piloto (Marcelo 2026-09-09): solo las secuencias registradas en
// src/lib/sequence-pages. Lee lecciones y piezas de la base; la config trae
// lo que todavía no existe como dato (resultado, criterios aprobados, tablero).
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { COURSES } from '@/lib/constants/courses';
import { sequencePageFor } from '@/lib/sequence-pages';
import { getStudentAccess } from '@/lib/portal/access';
import { SequencePage, type LessonBits, type PieceRow } from '@/components/portal/sequence-page/SequencePage';

export const dynamic = 'force-dynamic';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mismos dueños que el resto del portal (course.ts / portal page).
const COURSE_OWNER_IDS = new Set(['3518cc9c-d633-44ff-b32a-bfb86b5ae748', '0f6816db-a637-4af0-86b6-1a1c8227953c']);

/** Texto de una sección "## Heading" hasta el siguiente "## ". */
function section(md: string | null | undefined, heading: string): string {
  if (!md) return '';
  const re = new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^## |\\Z)`, 'm');
  const m = md.match(re);
  return (m?.[1] ?? '').trim();
}

export default async function SequencePageRoute({ params }: { params: Promise<{ token: string; seqId: string }> }) {
  const { token, seqId } = await params;
  const cfg = sequencePageFor(seqId);
  if (!cfg || !UUID_RE.test(token)) notFound();

  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, first_name, ' + COURSES.map((c) => c.accessColumn).join(', '))
    .eq('portal_token', token)
    .maybeSingle();
  if (!student) notFound();

  // El curso es para siempre: quien tiene el curso de esta cinta ve la página.
  const course = COURSES.find((c) => c.key === cfg.courseKey);
  const owns = COURSE_OWNER_IDS.has((student as any).id) || !!(course && (student as any)[course.accessColumn]);
  if (!owns) notFound();

  const [{ data: lessonRows }, { data: pieceRows }, access] = await Promise.all([
    admin.from('lessons').select('id, title, description_md').in('id', cfg.stepIds),
    admin.from('drills_missions').select('id, type, title, description_md, key_words, time_estimate, reps_recommended').eq('active', true).in('step_id', cfg.stepIds),
    getStudentAccess((student as any).id),
  ]);

  const lessons: Record<string, LessonBits> = {};
  for (const l of lessonRows ?? []) {
    const bodyFull = section(l.description_md, 'How your body does it');
    // "The rules that hold it together" vive como negrita dentro del cuerpo.
    const cut = bodyFull.indexOf('**The rules that hold it together**');
    lessons[l.id] = {
      id: l.id,
      title: l.title,
      whatIs: section(l.description_md, 'What it is'),
      body: cut >= 0 ? bodyFull.slice(0, cut).trim() : bodyFull,
      rules: cut >= 0 ? bodyFull.slice(cut + '**The rules that hold it together**'.length).trim() : '',
      mistakes: section(l.description_md, 'Common mistakes'),
      cue: section(l.description_md, 'The cue you will hear'),
    };
  }
  const pieces: Record<string, PieceRow> = {};
  for (const p of pieceRows ?? []) pieces[p.id] = p as PieceRow;

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      <SequencePage cfg={cfg} lessons={lessons} pieces={pieces} token={token} canTrack={access.canTrack} />
    </div>
  );
}
