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
import { coachTeachRank } from '@/lib/coach/teach-rank';
import { sequencePageRank, BELT_RANK } from '@/lib/coach/course-access';
import { entryPageForCourse } from '@/lib/sequence-pages/bb-entry';
import { SequencePage, type LessonBits, type PieceRow, type CoachStepLayer } from '@/components/portal/sequence-page/SequencePage';
import { pickSequenceVideos, resolveSequenceVideo } from '@/lib/sequence-pages/videos';
import { loadCourseMedia } from '@/lib/coach/course-media';
import { detailForFocus } from '@/lib/sequence-pages/focus';

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
/** Igual que en Teach it: corta también en '### ' (el cue de la #8 sigue con "### Drill 1"). */
function sectionTight(md: string | null | undefined, heading: string): string {
  if (!md) return '';
  const m = md.match(new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^#{2,3} |\\Z)`, 'm'));
  return (m?.[1] ?? '').trim();
}

export default async function CoachSequencePageRoute({ params, searchParams }: { params: Promise<{ token: string; seqId: string }>; searchParams?: Promise<{ tab?: string; course?: string; focus?: string; from?: string }> }) {
  const { token, seqId } = await params;
  const sp = searchParams ? await searchParams : {};
  // Con ?focus (el puente del plan / cierre) la página abre en Review.
  const initialTab = sp.tab === 'feel' || sp.tab === 'do' || sp.tab === 'review' || sp.tab === 'think' ? sp.tab : sp.focus ? 'review' : null;
  const cfg = sequencePageFor(seqId);
  if (!cfg || !UUID_RE.test(token)) notFound();

  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, course_access_granted, course_access_scope, max_belt_permission').eq('portal_token', token).maybeSingle();
  // Alcance sin cursos (2026-09-26): el material del método tampoco se abre.
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();
  // Hasta su cinta (+ la de sus camps), 2026-09-29.
  const rank = await coachTeachRank(admin, coach as any);
  if (sequencePageRank(cfg) > rank) notFound();
  // Una página de entrada de Blue vista desde Yellow (?course=yellow_belt, o un
  // coach que llega solo hasta Yellow) habla con la voz de Yellow, como la ve
  // el alumno de Yellow (entryPageForCourse).
  const beltRank = (k: string) => BELT_RANK[k.replace(/_belt$/, '')] ?? 6;
  const viewKey = sp.course && (cfg.alsoCourseKeys ?? []).includes(sp.course) ? sp.course
    : beltRank(cfg.courseKey) > rank ? ((cfg.alsoCourseKeys ?? []).find((k) => beltRank(k) <= rank) ?? cfg.courseKey)
    : cfg.courseKey;
  const pageCfg = viewKey !== cfg.courseKey ? entryPageForCourse(cfg, viewKey) : cfg;

  // Los juegos, drills y misiones que la config nombra por id (como Teach it).
  const playIds = [
    ...((cfg as any).play ?? []),
    ...(((cfg as any).think?.moves ?? []).flatMap((m: any) => m.play ?? [])),
    ...(((cfg as any).feel?.land ?? [])),
    ...(((cfg as any).feel?.skate ?? [])),
    ...((cfg as any).do?.missionId ? [(cfg as any).do.missionId] : []),
  ].filter(Boolean) as string[];
  const PIECE = 'id, type, title, description_md, key_words, time_estimate, reps_recommended, student_visible, coach_visible';
  // La hoja de cada paso lee también la lección, el drill y la misión de su
  // "Go deeper", aunque no sea un paso de esta secuencia (Grenade → STP-042 en la #12).
  const sheetIds = [...new Set([...cfg.stepIds, ...cfg.details.map((d) => d.deeper?.lessonId).filter(Boolean) as string[]])];
  const sheetPieceIds = [...new Set(cfg.details.flatMap((d) => [d.deeper?.drillId, d.deeper?.missionId]).filter(Boolean) as string[])];
  const [{ data: lessonRows }, { data: pieceRows }, { data: playRows }, { data: videoRows }, { data: coachRows }, { data: sheetRows }, media] = await Promise.all([
    admin.from('lessons').select('id, title, description_md').in('id', sheetIds),
    admin.from('drills_missions').select(PIECE).eq('active', true).in('step_id', cfg.stepIds),
    playIds.length ? admin.from('drills_missions').select(PIECE).eq('active', true).in('id', playIds) : Promise.resolve({ data: [] as any[] }),
    // Igual que la ruta del alumno (limit 6): "View as student" elige el mismo video.
    // La lista completa del coach sale de course-media (videosOfPage).
    admin.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).ilike('title', `${cfg.id}%`).order('created_at', { ascending: false }).limit(6),
    admin.from('lessons').select('id, linked_step_id, coach_what_md, coach_deliver_md, coach_errors_md, coach_validate_md').eq('active', true).like('id', 'COACH-%').in('linked_step_id', sheetIds),
    sheetPieceIds.length ? admin.from('drills_missions').select(PIECE).eq('active', true).in('id', sheetPieceIds) : Promise.resolve({ data: [] as any[] }),
    // Los pasos y las lecciones de "Go deeper" de cada detalle (la hoja del paso).
    loadCourseMedia(admin, sheetIds),
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
      // Corta en '### ' también: en los pasos de Blue el cue sigue con "### Drill 1".
      // En White y Yellow el cue del paso son sus 5 palabras (`DEPTH · PAUSE · …`).
      cue: sectionTight(l.description_md, 'The cue you will hear') || (section(l.description_md, 'The 5 words of this step').match(/`([^`]+)`/)?.[1] ?? ''),
    };
  }
  // "View as student" = EXACTAMENTE lo que ve el alumno: en su página solo lo
  // student_visible (como la ruta del alumno). Lo solo-coach va aparte, a
  // "Coach · run it" (antes se mezclaba en la vista del alumno).
  const pieces: Record<string, PieceRow> = {};
  for (const p of (pieceRows ?? []) as any[]) if (p.student_visible) pieces[p.id] = p as PieceRow;
  const seenExtra = new Set<string>();
  // coach_visible = false es "solo directorio" en /drill-library: no se usa en clase.
  const extraPieces: PieceRow[] = [...((pieceRows ?? []) as any[]).filter((p) => p.coach_visible !== false), ...((playRows ?? []) as any[])]
    .filter((p) => !pieces[p.id] && (seenExtra.has(p.id) ? false : (seenExtra.add(p.id), true)))
    .map((p) => p as PieceRow);
  // Los drills / misiones del "Go deeper" de cada detalle, solo para su hoja
  // (no entran en "Coach · run it" ni en el deck de la secuencia).
  const sheetPieces: Record<string, PieceRow> = {};
  for (const p of (sheetRows ?? []) as any[]) if (p.coach_visible !== false) sheetPieces[p.id] = p as PieceRow;

  // Coach · say it: las palabras numeradas y el cue de la lección del cuerpo.
  const bodyLessonId = (cfg as any).think?.bodyFromLesson ?? cfg.stepIds[cfg.stepIds.length - 1];
  const cue = sectionTight(((lessonRows ?? []) as any[]).find((l) => l.id === bodyLessonId)?.description_md, 'The cue you will hear');
  const words: string[] = (pageCfg as any).think?.keyWords?.[0]?.words ?? [];

  // El puente del plan / cierre (?focus=paso|elemento&from=…).
  const stepTitle = sp.focus ? (((lessonRows ?? []) as any[]).find((l) => l.id === sp.focus)?.title ?? null) : null;
  const match = sp.focus ? detailForFocus(cfg, sp.focus, stepTitle) : null;
  const focus = match?.title ? { key: match.key, title: match.title, from: sp.from || undefined } : null;
  // Lo de cada paso para su hoja (Show it): sus láminas y sus videos.
  const stepMedia: Record<string, { laminas: ReturnType<typeof media.laminasOfLesson>; videos: ReturnType<typeof media.videosOfLesson> }> = {};
  for (const id of sheetIds) {
    stepMedia[id] = { laminas: media.laminasOfLesson(id), videos: media.videosOfLesson(id) };
  }
  // Volver al índice, en la cinta desde la que se mira.
  const backBelt = viewKey.replace(/_belt$/, '');

  const byStep = new Map((coachRows ?? []).map((c: any) => [c.linked_step_id as string, c]));
  const layerOf = (id: string): CoachStepLayer => {
    const c = byStep.get(id)!;
    return { stepId: id, title: lessons[id]?.title ?? id, what: c.coach_what_md ?? '', deliver: c.coach_deliver_md ?? '', errors: c.coach_errors_md ?? '', validate: c.coach_validate_md ?? '' };
  };
  // Las tarjetas de la página: los pasos de la secuencia. La hoja: también los de "Go deeper".
  const layers: CoachStepLayer[] = cfg.stepIds.filter((id) => byStep.has(id)).map(layerOf);
  const sheetLayers: CoachStepLayer[] = sheetIds.filter((id) => !cfg.stepIds.includes(id) && byStep.has(id)).map(layerOf);

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/tss/theme.css" />
      <SequencePage
        cfg={pageCfg} lessons={lessons} pieces={pieces} token={token} canTrack={false}
        video={resolveSequenceVideo(videos, null, null)} videos={videos} stance={null}
        progress={null} initialTab={initialTab} flip={sequenceSide(cfg.id) === 'bs'}
        coach={{
          layers, backHref: `/coach-portal/${token}/course?belt=${backBelt}`,
          extraPieces, allVideos: media.videosOfPage(cfg), laminas: media.laminasOfPage(cfg),
          sayIt: { words, cue }, focus, stepMedia, sheetLayers, sheetPieces,
        }}
      />
    </div>
  );
}
