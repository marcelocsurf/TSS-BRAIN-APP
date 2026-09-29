// ═══ El curso del alumno, del lado del coach (Marcelo 2026-09-29) ═══
// "Lo que quiero es que el coach tenga a mano los cursos y, si quiere enseñar
// algo, que pueda elegir la filmina." Un mapa del curso en el MISMO orden que
// lo ve el alumno (CourseTab: Pre-Course en 4 grupos · Start Here · Tres
// Círculos · Infinite Circle · Tools · Going out · secuencias), por cinta y
// hasta la cinta del coach (+ la de sus camps). Cada fila trae sus láminas.
// Lee los mismos registros que el alumno: lessons, SEQUENCE_PAGES y laminas.ts.

import type { createAdminClient } from '@/lib/supabase/admin';
import { SEQUENCE_PAGES } from '@/lib/sequence-pages';
import { SEQUENCE_LAMINAS, THREE_CIRCLES_LAMINAS, INFINITE_CIRCLE_LAMINAS, laminasInMarkdown, type Lamina } from '@/lib/sequence-pages/laminas';
import { THREE_CIRCLES_LESSON_ID } from '@/lib/constants/learning-blocks';
import { BELT_RANK, sequencePageRank } from './course-access';
import type { CourseVideo } from '@/components/coach-portal/VideoEmbed';

// Cada fila trae también TODOS sus videos (Marcelo 2026-09-29: "que tenga todo
// el material del curso"): los de la lección, el de la secuencia en Library
// (general, por lado y stance), los de cada paso y los de sus drills/misiones.
export type CourseItem =
  | { kind: 'lesson'; id: string; title: string; laminas: Lamina[]; videos: CourseVideo[] }
  | { kind: 'page'; id: string; title: string; eyebrow: string; laminas: Lamina[]; videos: CourseVideo[] }
  | { kind: 'circles'; id: 'circles'; title: string; laminas: Lamina[]; videos: CourseVideo[] }
  | { kind: 'loop'; id: 'loop'; title: string; laminas: Lamina[]; videos: CourseVideo[] };

export interface CourseGroup { title: string; items: CourseItem[] }
export interface CourseTabMap { key: 'pre' | 'white' | 'yellow' | 'blue'; label: string; groups: CourseGroup[] }

// Los mismos grupos del Pre-Course que dibuja CourseTab (PRE_GROUPS).
const PRE_GROUPS: { title: string; members: string[] }[] = [
  { title: 'Start Here', members: ['M0-START'] },
  { title: 'Safety & Ocean', members: ['M0-SAFETY', 'M0-OSE', 'M0-ETIQ', 'M0-OCEAN'] },
  { title: 'Equipment & Mindset', members: ['M0-EQUIP', 'M0-VALUES'] },
  { title: 'Session System · venue read + warm-up, every level', members: ['M0-SESSION'] },
];
const TOOLS = ['STP-019', 'YB-FND-03'];
const LOOP_LESSON_ID = 'BB-FND-INF';

function pagesOf(courseKey: string, filter: (id: string) => boolean = () => true) {
  return Object.values(SEQUENCE_PAGES)
    .filter((c) => c.kind !== 'circle' && c.courseKey === courseKey && filter(c.id))
    .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
}
const isVideo = (m: string | null | undefined) => !m || m === 'video';
function dedupe(vs: CourseVideo[]): CourseVideo[] {
  const seen = new Set<string>();
  return vs.filter((v) => (seen.has(v.url) ? false : (seen.add(v.url), true)));
}

export async function buildCoachCourseMap(db: ReturnType<typeof createAdminClient>, rank: number): Promise<CourseTabMap[]> {
  const { data } = await db
    .from('lessons')
    .select('id, title, course_section, pc_section_id, display_order, description_md, video_url')
    .eq('active', true)
    .in('course_section', ['pre_course_fundamentals', 'pre_course_values', 'wb_onboarding', 'yb_onboarding', 'bb_onboarding', 'white_belt', 'yellow_belt'])
    .order('display_order');
  const rows = (data ?? []) as any[];
  const byId = new Map(rows.map((r) => [r.id as string, r]));

  // ── Videos: una consulta por fuente, después se reparten por fila ──
  const pageSteps = Object.values(SEQUENCE_PAGES).flatMap((c) => c.stepIds);
  const stepIds = Array.from(new Set([...rows.map((r) => r.id as string), ...pageSteps, THREE_CIRCLES_LESSON_ID, LOOP_LESSON_ID]));
  const [{ data: stepLessons }, { data: lessonCv }, { data: stepCv }, { data: drills }, { data: resources }] = await Promise.all([
    db.from('lessons').select('id, title, video_url').in('id', stepIds),
    db.from('content_videos').select('lesson_id, url, label, media_type, display_order').in('lesson_id', stepIds).order('display_order'),
    db.from('content_videos').select('step_id, url, label, media_type, display_order').in('step_id', stepIds).order('display_order'),
    db.from('drills_missions').select('id, step_id, title').eq('active', true).in('step_id', stepIds),
    db.from('coach_resources').select('title, file_url').eq('kind', 'video').eq('active', true).order('created_at', { ascending: false }),
  ]);
  const drillIds = ((drills ?? []) as any[]).map((d) => d.id as string);
  const { data: drillCv } = drillIds.length
    ? await db.from('content_videos').select('drill_mission_id, url, label, media_type, display_order').in('drill_mission_id', drillIds).order('display_order')
    : { data: [] as any[] };
  const titleOf = new Map(((stepLessons ?? []) as any[]).map((l) => [l.id as string, l.title as string]));
  const ownUrl = new Map(((stepLessons ?? []) as any[]).filter((l) => l.video_url).map((l) => [l.id as string, l.video_url as string]));
  const drillsByStep = new Map<string, any[]>();
  for (const d of (drills ?? []) as any[]) drillsByStep.set(d.step_id, [...(drillsByStep.get(d.step_id) ?? []), d]);

  /** Los videos de una lección o paso: los suyos, su video_url, los del paso y los de sus drills. */
  const videosOfLesson = (id: string): CourseVideo[] => {
    const t = titleOf.get(id) ?? id;
    const out: CourseVideo[] = [];
    for (const v of (lessonCv ?? []) as any[]) if (v.lesson_id === id && isVideo(v.media_type)) out.push({ url: v.url, title: t, label: v.label || t });
    const own = ownUrl.get(id); if (own) out.push({ url: own, title: t, label: t });
    for (const v of (stepCv ?? []) as any[]) if (v.step_id === id && isVideo(v.media_type)) out.push({ url: v.url, title: t, label: v.label || t });
    for (const d of drillsByStep.get(id) ?? []) {
      for (const v of (drillCv ?? []) as any[]) if (v.drill_mission_id === d.id && isVideo(v.media_type)) out.push({ url: v.url, title: d.title, label: v.label || d.title });
    }
    return dedupe(out);
  };
  /** Los videos de Library cuyo título empieza por el prefijo (id de la secuencia). El general primero. */
  const libraryVideos = (prefix: string): CourseVideo[] => ((resources ?? []) as any[])
    .filter((r) => r.file_url && String(r.title).toUpperCase().startsWith(prefix.toUpperCase()))
    .map((r) => {
      const label = String(r.title).slice(prefix.length).replace(/^[\s·\-–—:]+/, '').trim();
      return { url: r.file_url as string, title: r.title as string, label: label || 'Video' };
    })
    .sort((a, b) => Number(/\b(BS|FS|backside|frontside|goofy|regular)\b/i.test(a.label ?? '')) - Number(/\b(BS|FS|backside|frontside|goofy|regular)\b/i.test(b.label ?? '')));

  const pageItem = (c: (typeof SEQUENCE_PAGES)[string]): CourseItem => ({
    kind: 'page', id: c.id, title: c.title,
    eyebrow: c.eyebrow ?? `Sequence #${c.number}`,
    laminas: SEQUENCE_LAMINAS[c.id] ?? [],
    videos: dedupe([...libraryVideos(c.id), ...c.stepIds.flatMap(videosOfLesson)]),
  });
  const lesson = (id: string): CourseItem | null => {
    const r = byId.get(id);
    return r ? { kind: 'lesson', id: r.id, title: r.title, laminas: laminasInMarkdown(r.description_md), videos: videosOfLesson(r.id) } : null;
  };
  const lessonsIn = (pred: (r: any) => boolean) => rows.filter(pred).map((r) => lesson(r.id)!).filter(Boolean);
  const tools = TOOLS.map(lesson).filter(Boolean) as CourseItem[];
  const circles: CourseItem = { kind: 'circles', id: 'circles', title: 'The Three Circles of Power', laminas: THREE_CIRCLES_LAMINAS, videos: dedupe([...libraryVideos('YB-CIRCLES'), ...videosOfLesson(THREE_CIRCLES_LESSON_ID)]) };
  const loop: CourseItem = { kind: 'loop', id: 'loop', title: 'The Infinite Circle', laminas: INFINITE_CIRCLE_LAMINAS, videos: dedupe([...libraryVideos('BB-LOOP'), ...videosOfLesson(LOOP_LESSON_ID)]) };
  const nonEmpty = (gs: CourseGroup[]) => gs.filter((g) => g.items.length > 0);

  const tabs: CourseTabMap[] = [];

  // Pre-Course: lo mismo para todas las cintas.
  const pre = rows.filter((r) => r.course_section === 'pre_course_fundamentals' || r.course_section === 'pre_course_values');
  tabs.push({
    key: 'pre', label: 'Pre-Course',
    groups: nonEmpty([
      ...PRE_GROUPS.map((g) => ({ title: g.title, items: pre.filter((r) => g.members.includes(r.pc_section_id)).map((r) => lesson(r.id)!) })),
      { title: 'More', items: pre.filter((r) => !PRE_GROUPS.some((g) => g.members.includes(r.pc_section_id))).map((r) => lesson(r.id)!) },
    ]),
  });

  if (rank >= BELT_RANK.white) {
    tabs.push({
      key: 'white', label: 'White',
      groups: nonEmpty([
        { title: 'Start Here', items: lessonsIn((r) => r.course_section === 'wb_onboarding') },
        { title: 'Sequences', items: pagesOf('white_belt').filter((c) => sequencePageRank(c) <= rank).map(pageItem) },
        { title: 'Tools · techniques you use at every belt', items: tools.filter((t) => t.id === 'STP-019') },
      ]),
    });
  }
  if (rank >= BELT_RANK.yellow) {
    const ybStart = lessonsIn((r) => r.course_section === 'yb_onboarding' && r.id !== THREE_CIRCLES_LESSON_ID && !TOOLS.includes(r.id));
    // Mismo orden que el bloque "Going out" del alumno (BLUE_COURSE_PRELUDE sin Catch Waves).
    const entry = ['BB-NAV', 'BB-LINE'].map((id) => SEQUENCE_PAGES[id]).filter((c) => c && (c.alsoCourseKeys ?? []).includes('yellow_belt')).map(pageItem);
    tabs.push({
      key: 'yellow', label: 'Yellow',
      groups: nonEmpty([
        { title: 'Start Here', items: ybStart },
        { title: 'Fundamentals', items: [circles] },
        { title: 'Tools · techniques you use at every belt', items: tools },
        { title: 'Going out, picking your line', items: entry },
        { title: 'Sequences', items: pagesOf('yellow_belt').map(pageItem) },
        { title: 'Integration & Certification', items: lessonsIn((r) => r.course_section === 'yellow_belt' && String(r.id).startsWith('YB-MOD')) },
      ]),
    });
  }
  if (rank >= BELT_RANK.blue) {
    // Blue arrastra el valor de Yellow (YB-ONB-01) al frente de su Start Here, como el alumno.
    const bbStart = [lesson('YB-ONB-01'), ...lessonsIn((r) => r.course_section === 'bb_onboarding' && r.id !== LOOP_LESSON_ID)].filter(Boolean) as CourseItem[];
    const prelude = ['BB-NAV', 'BB-CATCH', 'BB-LINE'].map((id) => SEQUENCE_PAGES[id]).filter(Boolean).map(pageItem);
    tabs.push({
      key: 'blue', label: 'Blue',
      groups: nonEmpty([
        { title: 'Start Here', items: bbStart },
        { title: 'Tools · techniques you use at every belt', items: tools },
        { title: 'Fundamentals', items: [circles, loop] },
        { title: 'Going out, catching the wave, picking your line', items: prelude },
        { title: 'Sequences', items: pagesOf('blue_belt', (id) => !['BB-NAV', 'BB-CATCH', 'BB-LINE'].includes(id)).map(pageItem) },
      ]),
    });
  }
  return tabs;
}
