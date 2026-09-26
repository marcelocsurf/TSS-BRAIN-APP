// ═══ /coach-portal/[token]/seq/[seqId] — la secuencia COMO LA VE EL ALUMNO, con la capa del coach ═══
// Marcelo (2026-09-17): el coach ve exactamente la página del alumno (Think ·
// Feel · Do · Review) más una capa plegada por paso — cómo lo enseño, cómo lo
// corrijo, cómo lo valido — que sale de las lecciones COACH-STP-xxx. Un
// interruptor la apaga para mostrar la página limpia en la playa.
import { sequenceSide } from '@/lib/constants/learning-blocks';
import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { sequencePageFor } from '@/lib/sequence-pages';
import { SequencePage, type LessonBits, type PieceRow, type CoachStepLayer } from '@/components/portal/sequence-page/SequencePage';
import { pickSequenceVideos, resolveSequenceVideo } from '@/lib/sequence-pages/videos';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function section(md: string | null | undefined, heading: string): string {
  if (!md) return '';
  const re = new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^## |\\Z)`, 'm');
  const m = md.match(re);
  return (m?.[1] ?? '').trim();
}

export default async function CoachSequencePageRoute({ params, searchParams }: { params: Promise<{ token: string; seqId: string }>; searchParams?: Promise<{ tab?: string }> }) {
  const { token, seqId } = await params;
  const sp = searchParams ? await searchParams : {};
  const initialTab = sp.tab === 'feel' || sp.tab === 'do' || sp.tab === 'review' || sp.tab === 'think' ? sp.tab : null;
  const cfg = sequencePageFor(seqId);
  if (!cfg || !UUID_RE.test(token)) notFound();

  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, course_access_granted, course_access_scope').eq('portal_token', token).maybeSingle();
  // Alcance sin cursos (2026-09-26): el material del método tampoco se abre.
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();

  const [{ data: lessonRows }, { data: pieceRows }, { data: videoRows }, { data: coachRows }] = await Promise.all([
    admin.from('lessons').select('id, title, description_md').in('id', cfg.stepIds),
    // El coach ve también lo que está en su catálogo (coach_visible), no solo lo del alumno.
    admin.from('drills_missions').select('id, type, title, description_md, key_words, time_estimate, reps_recommended').eq('active', true).in('step_id', cfg.stepIds),
    admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', `${cfg.id}%`).order('created_at', { ascending: false }).limit(6),
    admin.from('lessons').select('id, linked_step_id, coach_what_md, coach_deliver_md, coach_errors_md, coach_validate_md').eq('active', true).like('id', 'COACH-%').in('linked_step_id', cfg.stepIds),
  ]);

  const videos = pickSequenceVideos(videoRows as any, cfg.id);
  const lessons: Record<string, LessonBits> = {};
  for (const l of lessonRows ?? []) {
    const bodyFull = section(l.description_md, 'How your body does it');
    const cut = bodyFull.indexOf('**The rules that hold it together**');
    lessons[l.id] = {
      id: l.id, title: l.title,
      whatIs: section(l.description_md, 'What it is'),
      body: cut >= 0 ? bodyFull.slice(0, cut).trim() : bodyFull,
      rules: cut >= 0 ? bodyFull.slice(cut + '**The rules that hold it together**'.length).trim() : '',
      mistakes: section(l.description_md, 'Common mistakes'),
      cue: section(l.description_md, 'The cue you will hear'),
    };
  }
  const pieces: Record<string, PieceRow> = {};
  for (const p of pieceRows ?? []) pieces[p.id] = p as PieceRow;

  const byStep = new Map((coachRows ?? []).map((c: any) => [c.linked_step_id as string, c]));
  const layers: CoachStepLayer[] = cfg.stepIds.filter((id) => byStep.has(id)).map((id) => {
    const c = byStep.get(id)!;
    return { stepId: id, title: lessons[id]?.title ?? id, what: c.coach_what_md ?? '', deliver: c.coach_deliver_md ?? '', errors: c.coach_errors_md ?? '', validate: c.coach_validate_md ?? '' };
  });

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/tss/theme.css" />
      <SequencePage
        cfg={cfg} lessons={lessons} pieces={pieces} token={token} canTrack={false}
        video={resolveSequenceVideo(videos, null, null)} videos={videos} stance={null}
        progress={null} initialTab={initialTab} flip={sequenceSide(cfg.id) === 'bs'}
        coach={{ layers, backHref: `/coach-portal/${token}?tab=courses` }}
      />
    </div>
  );
}
