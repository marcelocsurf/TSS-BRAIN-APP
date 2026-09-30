// ═══ Los medios del curso, de una sola fuente (2026-09-30) ═══
// Videos y láminas de lecciones, pasos, drills y secuencias. Los usan el índice
// del coach (course-map.ts) y la página de la secuencia del coach (seq): antes
// cada uno armaba lo suyo, con límites distintos (6 / 12) y se perdían videos.
//   · lección/paso: content_videos.lesson_id + lessons.video_url + content_videos.step_id
//     + los videos de sus drills/misiones (content_videos.drill_mission_id)
//   · secuencia: Library (coach_resources kind video, título que empieza por el id),
//     el general primero, + lo de cada paso
//   · láminas: SEQUENCE_LAMINAS + las de las lecciones de sus pasos (sin repetir)

import type { createAdminClient } from '@/lib/supabase/admin';
import { SEQUENCE_LAMINAS, laminasInMarkdown, type Lamina } from '@/lib/sequence-pages/laminas';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import type { CourseVideo } from '@/components/coach-portal/VideoEmbed';

const isVideo = (m: string | null | undefined) => !m || m === 'video';
export function dedupeVideos(vs: CourseVideo[]): CourseVideo[] {
  const seen = new Set<string>();
  return vs.filter((v) => (seen.has(v.url) ? false : (seen.add(v.url), true)));
}
export function dedupeLaminas(ls: Lamina[]): Lamina[] {
  const seen = new Set<string>();
  return ls.filter((l) => (seen.has(l.src) ? false : (seen.add(l.src), true)));
}

export interface CourseMedia {
  videosOfLesson: (id: string) => CourseVideo[];
  laminasOfLesson: (id: string) => Lamina[];
  libraryVideos: (prefix: string) => CourseVideo[];
  videosOfPage: (cfg: Pick<SequencePageConfig, 'id' | 'stepIds'>) => CourseVideo[];
  laminasOfPage: (cfg: Pick<SequencePageConfig, 'id' | 'stepIds'>) => Lamina[];
}

/** Carga todo de una vez para esos ids (lecciones y pasos) y devuelve los armadores. */
export async function loadCourseMedia(db: ReturnType<typeof createAdminClient>, lessonIds: string[]): Promise<CourseMedia> {
  const ids = Array.from(new Set(lessonIds.filter(Boolean)));
  const [{ data: lessons }, { data: lessonCv }, { data: stepCv }, { data: drills }, { data: resources }] = await Promise.all([
    db.from('lessons').select('id, title, video_url, description_md').in('id', ids),
    db.from('content_videos').select('lesson_id, url, label, media_type, display_order').in('lesson_id', ids).order('display_order'),
    db.from('content_videos').select('step_id, url, label, media_type, display_order').in('step_id', ids).order('display_order'),
    db.from('drills_missions').select('id, step_id, title').eq('active', true).in('step_id', ids),
    db.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).order('created_at', { ascending: false }),
  ]);
  const drillIds = ((drills ?? []) as any[]).map((d) => d.id as string);
  const { data: drillCv } = drillIds.length
    ? await db.from('content_videos').select('drill_mission_id, url, label, media_type, display_order').in('drill_mission_id', drillIds).order('display_order')
    : { data: [] as any[] };

  const lessonById = new Map(((lessons ?? []) as any[]).map((l) => [l.id as string, l]));
  const drillsByStep = new Map<string, any[]>();
  for (const d of (drills ?? []) as any[]) drillsByStep.set(d.step_id, [...(drillsByStep.get(d.step_id) ?? []), d]);

  const videosOfLesson = (id: string): CourseVideo[] => {
    const l = lessonById.get(id);
    const t = (l?.title as string) ?? id;
    const out: CourseVideo[] = [];
    for (const v of (lessonCv ?? []) as any[]) if (v.lesson_id === id && isVideo(v.media_type)) out.push({ url: v.url, title: t, label: v.label || t });
    if (l?.video_url) out.push({ url: l.video_url, title: t, label: t });
    for (const v of (stepCv ?? []) as any[]) if (v.step_id === id && isVideo(v.media_type)) out.push({ url: v.url, title: t, label: v.label || t });
    for (const d of drillsByStep.get(id) ?? []) {
      for (const v of (drillCv ?? []) as any[]) if (v.drill_mission_id === d.id && isVideo(v.media_type)) out.push({ url: v.url, title: d.title, label: v.label || d.title });
    }
    return dedupeVideos(out);
  };
  const libraryVideos = (prefix: string): CourseVideo[] => ((resources ?? []) as any[])
    .filter((r) => r.file_url && String(r.title).toUpperCase().startsWith(prefix.toUpperCase()))
    .map((r) => {
      const label = String(r.title).slice(prefix.length).replace(/^[\s·\-–—:]+/, '').trim();
      return { url: r.file_url as string, title: r.title as string, label: label || 'Video' };
    })
    .sort((a, b) => Number(/\b(BS|FS|backside|frontside|goofy|regular)\b/i.test(a.label ?? '')) - Number(/\b(BS|FS|backside|frontside|goofy|regular)\b/i.test(b.label ?? '')));
  const videosOfPage = (cfg: Pick<SequencePageConfig, 'id' | 'stepIds'>) => dedupeVideos([...libraryVideos(cfg.id), ...cfg.stepIds.flatMap(videosOfLesson)]);
  const laminasOfPage = (cfg: Pick<SequencePageConfig, 'id' | 'stepIds'>) => dedupeLaminas([
    ...(SEQUENCE_LAMINAS[cfg.id] ?? []),
    ...cfg.stepIds.flatMap((id) => laminasInMarkdown(lessonById.get(id)?.description_md)),
  ]);
  const laminasOfLesson = (id: string) => laminasInMarkdown(lessonById.get(id)?.description_md);
  return { videosOfLesson, laminasOfLesson, libraryVideos, videosOfPage, laminasOfPage };
}
