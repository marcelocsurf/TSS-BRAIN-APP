import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { sequencePageFor, SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';
import { detailForFocus } from '@/lib/sequence-pages/focus';
import { coachTeachRank } from '@/lib/coach/teach-rank';
import { sequencePageRank } from '@/lib/coach/course-access';
import { boardFlip } from '@/lib/stance';
import { sequenceSide } from '@/lib/constants/learning-blocks';
import { TeachKit, type TeachPiece, type TeachLayer } from '@/components/coach-portal/TeachKit';

// ═══ "Teach it" · el material del coach para dar ESA clase ═══
// Mismo dato que la página de la secuencia; otra puerta y otro orden: qué
// digo, qué muestro, qué les pongo a hacer, qué vigilo (Marcelo 2026-09-24).

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '600', '700', '800', '900'], variable: '--font-archivo', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-plex', display: 'swap' });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const dynamic = 'force-dynamic';

/** Una sección "## Título" del markdown de una lección, cortada en el
 *  siguiente encabezado de cualquier nivel: el comando de la #8 vive en
 *  "## The cue you will hear" y abajo, en "### Drill 1", siguen los drills;
 *  sin este corte el comando se los tragaba. */
function section(md: string | null | undefined, heading: string): string {
  if (!md) return '';
  const m = md.match(new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^#{2,3} |\\Z)`, 'm'));
  return (m?.[1] ?? '').trim();
}

export default async function CoachTeachPage({ params, searchParams }: {
  params: Promise<{ token: string; seqId: string }>;
  searchParams?: Promise<{ focus?: string; from?: string }>;
}) {
  const { token, seqId } = await params;
  const sp = searchParams ? await searchParams : {};
  const cfg = sequencePageFor(seqId) ?? SEQUENCE_PAGES[seqId];
  if (!cfg || !UUID_RE.test(token)) notFound();

  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, course_access_granted, course_access_scope, max_belt_permission')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach || !coach.course_access_granted || (coach as any).course_access_scope === 'none') notFound();
  // Hasta su cinta (+ la de sus camps), 2026-09-29.
  if (sequencePageRank(cfg) > await coachTeachRank(admin, coach as any)) notFound();

  // Los juegos de una secuencia 'circle' viven en su config (play), no por paso.
  const playIds = [
    ...((cfg as any).play ?? []),
    ...(((cfg as any).think?.moves ?? []).flatMap((m: any) => m.play ?? [])),
    ...(((cfg as any).feel?.land ?? [])),
    ...(((cfg as any).feel?.skate ?? [])),
    ...((cfg as any).do?.missionId ? [(cfg as any).do.missionId] : []),
  ].filter(Boolean) as string[];

  const [{ data: byStepRows }, { data: byIdRows }, { data: videoRows }, { data: coachRows }, { data: lessonRows }] = await Promise.all([
    admin.from('drills_missions')
      .select('id, type, title, description_md, key_words, time_estimate, reps_recommended')
      .eq('active', true).eq('coach_visible', true).in('step_id', cfg.stepIds),
    playIds.length
      ? admin.from('drills_missions')
          .select('id, type, title, description_md, key_words, time_estimate, reps_recommended')
          .eq('active', true).in('id', playIds)
      : Promise.resolve({ data: [] as any[] }),
    // Convención: el video de la secuencia se sube en Library con un título
    // que empieza por el id ("BB-SEQ-08 · Frontside Pumping").
    admin.from('coach_resources')
      .select('title, file_url').eq('kind', 'video').eq('active', true)
      .ilike('title', `${cfg.id}%`).order('created_at', { ascending: false }).limit(12),
    admin.from('lessons')
      .select('id, linked_step_id, coach_what_md, coach_deliver_md, coach_errors_md, coach_validate_md')
      .eq('active', true).like('id', 'COACH-%').in('linked_step_id', cfg.stepIds),
    admin.from('lessons').select('id, title, description_md').in('id', cfg.stepIds),
  ]);

  // Todos los videos de la secuencia (Marcelo 2026-09-29: "que tenga todo el
  // material"): antes solo el más nuevo (Directional Turns tiene 4). El general
  // primero; la etiqueta es lo que sigue al id en el título de Library.
  const videos = ((videoRows ?? []) as any[])
    .filter((r) => r.file_url)
    .map((r) => {
      const label = String(r.title).slice(cfg.id.length).replace(/^[\s·\-–—:]+/, '').trim();
      return { url: r.file_url as string, title: r.title as string, label: label || 'Video' };
    })
    .sort((a, b) => Number(/\b(BS|FS|backside|frontside|goofy|regular)\b/i.test(a.label)) - Number(/\b(BS|FS|backside|frontside|goofy|regular)\b/i.test(b.label)));

  const seen = new Set<string>();
  const pieces: TeachPiece[] = [...(byStepRows ?? []), ...(byIdRows ?? [])]
    .filter((p: any) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .map((p: any) => ({
      id: p.id, type: p.type, title: p.title, description_md: p.description_md,
      key_words: p.key_words, time_estimate: p.time_estimate, reps_recommended: p.reps_recommended,
    }));

  const titles = new Map((lessonRows ?? []).map((l: any) => [l.id as string, l.title as string]));
  const layers: TeachLayer[] = (coachRows ?? []).map((c: any) => ({
    stepId: c.linked_step_id,
    title: titles.get(c.linked_step_id) ?? c.linked_step_id,
    what: c.coach_what_md ?? '', deliver: c.coach_deliver_md ?? '',
    errors: c.coach_errors_md ?? '', validate: c.coach_validate_md ?? '',
  }));

  // El comando se dice una sola vez: el de la lección del cuerpo de la secuencia.
  const bodyLessonId = (cfg as any).think?.bodyFromLesson ?? cfg.stepIds[cfg.stepIds.length - 1];
  const cue = section((lessonRows ?? []).find((l: any) => l.id === bodyLessonId)?.description_md, 'The cue you will hear');

  // El coach no tiene postura guardada (la ficha de coaches no la lleva), así
  // que la ola va en su orientación canónica, igual que en la página del curso.
  const waveDirection: 'left' | 'right' = boardFlip(sequenceSide(cfg.id), false) ? 'left' : 'right';

  // El puente: el coach llega desde un veredicto ("lo frenó la rotación") y
  // el ?focus trae el id del momento. Se traduce al título con la misma
  // fuente que usa el plan, para que diga exactamente lo que él ya leyó.
  // detailForFocus (2026-09-30): busca el detalle por el paso o el elemento;
  // elementTitle solo traducía círculos y el puente llegaba vacío en 14 de 19.
  const stepTitle = sp.focus ? (((lessonRows ?? []) as any[]).find((l) => l.id === sp.focus)?.title ?? null) : null;
  const match = sp.focus ? detailForFocus(cfg, sp.focus, stepTitle) : null;
  const focusTitle = match?.title ?? (sp.focus ? elementTitle(cfg, sp.focus, stepTitle) : null);
  const focus = focusTitle ? { title: focusTitle, from: sp.from || undefined, key: match?.key ?? null } : null;

  return (
    <div className={`tss-v10 ${archivo.variable} ${plexMono.variable}`}>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/tss/theme.css" />
      <TeachKit cfg={cfg} videos={videos}
        pieces={pieces} layers={layers} cue={cue} token={token} waveDirection={waveDirection} focus={focus} />
    </div>
  );
}
