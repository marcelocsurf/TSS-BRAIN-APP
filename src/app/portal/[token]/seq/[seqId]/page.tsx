// ═══ /portal/[token]/seq/[seqId] — la secuencia en cuatro pestañas ═══
// Piloto (Marcelo 2026-09-09): solo las secuencias registradas en
// src/lib/sequence-pages. Lee lecciones y piezas de la base; la config trae
// lo que todavía no existe como dato (resultado, criterios aprobados, tablero).
import { sequenceSide } from '@/lib/constants/learning-blocks';
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { COURSES } from '@/lib/constants/courses';
import { sequencePageFor } from '@/lib/sequence-pages';
import { getStudentAccess } from '@/lib/portal/access';
import { SequencePage, type LessonBits, type PieceRow } from '@/components/portal/sequence-page/SequencePage';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

export default async function SequencePageRoute({ params, searchParams }: { params: Promise<{ token: string; seqId: string }>; searchParams?: Promise<{ tab?: string }> }) {
  const { token, seqId } = await params;
  const sp = searchParams ? await searchParams : {};
  const initialTab = sp.tab === 'feel' || sp.tab === 'do' || sp.tab === 'review' || sp.tab === 'think' ? sp.tab : null;
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

  const [{ data: lessonRows }, { data: pieceRows }, access, { data: videoRow }, { data: seqRating }, { data: stepRatings }] = await Promise.all([
    admin.from('lessons').select('id, title, description_md').in('id', cfg.stepIds),
    admin.from('drills_missions').select('id, type, title, description_md, key_words, time_estimate, reps_recommended').eq('active', true).in('step_id', cfg.stepIds),
    getStudentAccess((student as any).id),
    // Convención (2026-09-09): el video de la secuencia se sube en Library
    // (Admin → kind "video") con un título que empieza por el id, p. ej.
    // "BB-SEQ-08 · Frontside Pumping". No necesita grant: el curso ya gatea.
    admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', `${cfg.id}%`).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    // Lo que Let's Play sabe de esta secuencia (Marcelo 2026-09-09: "que se
    // comunique lo de los cursos con lo que sale en la secuencia").
    admin.from('student_sequence_ratings').select('current_rating, held_back_step_id, rating_fs, rating_bs').eq('student_id', (student as any).id).eq('sequence_id', cfg.id).maybeSingle(),
    admin.from('student_step_ratings').select('step_id, current_rating, coach_rating').eq('student_id', (student as any).id).in('step_id', cfg.stepIds),
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

  // Progreso: estrella por paso (la del coach manda), el paso más flojo en
  // el orden de la cadena, y la nota del último run de la secuencia.
  const ratingByStep = new Map<string, number>();
  for (const r of stepRatings ?? []) {
    const v = (r as any).coach_rating ?? (r as any).current_rating;
    if (v != null) ratingByStep.set((r as any).step_id, Number(v));
  }
  const rated = cfg.stepIds.filter((id) => ratingByStep.has(id));
  const weakestId = cfg.stepIds.find((id) => ratingByStep.has(id) && ratingByStep.get(id)! < 4) ?? null;
  const progress = {
    lastRun: (seqRating as any)?.current_rating ?? null,
    side: sequenceSide(cfg.id),
    sideRatings: sequenceSide(cfg.id) === 'both' ? { fs: (seqRating as any)?.rating_fs ?? null, bs: (seqRating as any)?.rating_bs ?? null } : null,
    heldBackId: (seqRating as any)?.held_back_step_id ?? null,
    heldBackTitle: (seqRating as any)?.held_back_step_id ? (lessons[(seqRating as any).held_back_step_id]?.title ?? null) : null,
    ratedSteps: rated.length,
    totalSteps: cfg.stepIds.length,
    minRating: rated.length ? Math.min(...rated.map((id) => ratingByStep.get(id)!)) : null,
    weakestId,
    weakestTitle: weakestId ? (lessons[weakestId]?.title ?? null) : null,
    steps: cfg.stepIds.map((id) => ({ id, title: lessons[id]?.title ?? id, rating: ratingByStep.get(id) ?? null })),
  };

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      <SequencePage cfg={cfg} lessons={lessons} pieces={pieces} token={token} canTrack={access.canTrack} video={videoRow?.file_url ? { url: videoRow.file_url, title: videoRow.title } : null} progress={progress} initialTab={initialTab} />
    </div>
  );
}
