'use client';

// ═══ Una secuencia, cuatro pestañas: Think it · Feel it · Do it · Review ═══
// Modelo de Marcelo (2026-09-09): la secuencia es la puerta de entrada y el
// paso es el detalle. Think = teoría en 5 bloques fijos; Feel = drills fuera
// del agua; Do = la misión (resultado, sin conteo) + prueba de competencia
// (el único conteo) + "cuando no sale"; Review = indicadores con espejo,
// fix y "go deeper", common mistakes y how it feels.
//
// Diseño (2026-09-14, línea aprobada · TSS_Design_Handoff + guías de ola):
// fondo navy, tarjetas crema, títulos grandes Archivo, etiquetas mono, botón
// cyan, nav inferior blanca. La ola es el Wave Guide ilustrado con el
// recorrido ORIGINAL de cada secuencia. TODO el contenido (textos, orden,
// links, lógica de Let's Play) es el mismo de antes: solo cambia cómo se ve.
import { useEffect, useRef, useState } from 'react';
import { withFrom, type CoachFrom } from '@/lib/nav/origin';
import { PortalBottomNav, type PortalNavTab } from './PortalBottomNav';
import { ArrowRight, Lock, Play } from 'lucide-react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { WaveGuide, WAVE_KIT_SEQUENCE } from './WaveGuide';
import { COMMAND_COLORS } from '@/lib/sequence-pages/wave-kit';
import { BoardMap } from './BoardMap';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import { SEQUENCE_LAMINAS } from '@/lib/sequence-pages/laminas';
import { hasStanceVideos, resolveSequenceVideo, type SequenceVideos, type Stance } from '@/lib/sequence-pages/videos';
import { ZoomImage } from '@/components/shared/ImageLightbox';
import { ClassDeck, type DeckSlide } from '@/components/coach-portal/ClassDeck';
import { VideoList, VideosDialog, type CourseVideo } from '@/components/coach-portal/VideoEmbed';
import type { Lamina as LaminaT } from '@/lib/sequence-pages/laminas';

// Tokens del paquete (public/tss/tokens.css) + semánticos legibles sobre crema.
/** Una lámina del método: el mapa de la secuencia de una sola mirada. Se
 *  toca y se abre en grande (Marcelo 2026-09-24). Todas miden 1672x941. */
function Lamina({ src, alt }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="m-0 mb-3">
      {/* Se abre adentro del app (ImageLightbox), no en otra pestaña. Solo la
          imagen (Marcelo 2026-09-26: "no le agregues texto a las imágenes"):
          sin pie de foto, tampoco en grande. El alt queda para lectores de pantalla. */}
      <ZoomImage src={src} alt={alt} caption={null} className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #DCD7C6' }} />
    </figure>
  );
}

const NAVY = '#061C2B', INK = '#10263B', CREAM = '#E9E2D2', PAPER = '#F7F9FA', BORDER = '#DCD7C6', CYAN = '#00D2FF', WHITE = '#FFFFFF';
const MUTED = '#55666E', ON_DARK = '#D9E4EA';
const GREEN = '#0F8A5F', GOLD = '#B7791F', VIOLET = '#7C4DFF', RED = '#C62828';
const GOLD_BRIGHT = '#FFDC33', VIOLET_BRIGHT = '#BA69EE', GREEN_BRIGHT = '#06D6A0';
const MONO: React.CSSProperties = { fontFamily: 'var(--tss-mono), var(--font-plex), IBM Plex Mono, monospace', fontSize: 12, fontWeight: 500, letterSpacing: '0.045em', textTransform: 'uppercase' };
const H1: React.CSSProperties = { fontFamily: 'var(--tss-font), var(--font-archivo), Archivo, sans-serif' };

export interface PieceRow { id: string; type: 'drill' | 'mission'; title: string; description_md: string | null; key_words: string[] | null; time_estimate: string | null; reps_recommended: string | null; success_criteria?: string[] | null }
export interface LessonBits { id: string; title: string; whatIs: string; body: string; rules: string; mistakes: string; cue: string }
/** Capa del coach por paso (lessons COACH-STP-xxx): enseñar · corregir · validar. */
export interface CoachStepLayer { stepId: string; title: string; what: string; deliver: string; errors: string; validate: string }

type Tab = 'think' | 'feel' | 'do' | 'review';
const TABS: { key: Tab; label: string; sub: string }[] = [
  { key: 'think', label: 'Think it', sub: 'Understand' },
  { key: 'feel', label: 'Feel it', sub: 'Rehearse' },
  { key: 'do', label: 'Do it', sub: 'Execute' },
  { key: 'review', label: 'Review', sub: 'Check' },
];

export interface SequenceProgress {
  lastRun: number | null;
  /** fs · bs · both · null (Marcelo 2026-09-10). */
  side?: 'fs' | 'bs' | 'both' | null;
  sideRatings?: { fs: number | null; bs: number | null } | null;
  heldBackId: string | null;
  heldBackTitle: string | null;
  ratedSteps: number;
  totalSteps: number;
  minRating: number | null;
  weakestId: string | null;
  weakestTitle: string | null;
  steps: { id: string; title: string; rating: number | null; selfRating?: number | null; coachRating?: number | null }[];
}

export function SequencePage({
  video, videos = null, stance = null, cfg, lessons, pieces, token, canTrack, progress, initialTab = null, flip = false, coach = null, trainAs = null, back = null, navTab = 'course' }: {
  cfg: SequencePageConfig;
  /** El "‹ Back" de arriba: adonde estaba el usuario (?from=, src/lib/nav/origin.ts).
   *  Sin origen: el Course (alumno) o el índice de cursos (coach). */
  back?: { href: string; label: string } | null;
  /** La pestaña que la barra de abajo marca (la del origen). */
  navTab?: PortalNavTab;
  /** Desde otro curso, el botón de Let's Play entrena esta secuencia (Yellow → su #6 o #7). */
  trainAs?: { id: string; number: number; stepIds: string[] } | null;
  lessons: Record<string, LessonBits>;
  pieces: Record<string, PieceRow>;
  token: string;
  canTrack: boolean;
  /** Video de la ejecución (Library → kind video, título que empieza con el id de la secuencia). */
  video?: { url: string; title: string } | null;
  /** General + por lado (videos.ts). El selector Backside · Frontside elige. */
  videos?: SequenceVideos | null;
  /** Goofy · Regular de la ficha (null si no lo sabe): elige el video del stance. */
  stance?: Stance | null;
  /** Lo que Let's Play sabe de esta secuencia para este alumno. */
  progress?: SequenceProgress | null;
  /** ?tab=feel desde Let's Play ("Rehearse it on land first"). */
  initialTab?: Tab | null;
  /** Espejar el tablero según el stance del alumno (goofy frontside / regular backside). */
  flip?: boolean;
  /** Modo coach (Marcelo 2026-09-17): la MISMA página que ve el alumno, más
   *  una capa plegada por paso con cómo lo enseño / corrijo / valido, y un
   *  interruptor "View as student" que la apaga. */
  coach?: {
    layers: CoachStepLayer[];
    backHref: string;
    /** Paso 2 de "una página por secuencia" (2026-09-30): lo que antes solo
     *  tenía Teach it, sobre la página del alumno. Todo se apaga con "View as student". */
    /** Drills, misiones y juegos que el alumno NO ve en su página (solo-coach). */
    extraPieces?: PieceRow[];
    /** TODOS los videos: Library (general, lado, stance) + cada paso + sus drills. */
    allVideos?: CourseVideo[];
    /** Las láminas de la secuencia y de las lecciones de sus pasos. */
    laminas?: LaminaT[];
    /** Las palabras numeradas y el cue que va a escuchar el alumno. */
    sayIt?: { words: string[]; cue: string } | null;
    /** El puente del plan / cierre: el detalle que se abre en Review. */
    focus?: { key: string | null; title: string; from?: string } | null;
    /** Lo de cada paso (por id de lección) para su hoja: láminas y videos. */
    stepMedia?: Record<string, { laminas: LaminaT[]; videos: CourseVideo[] }>;
    /** Para la hoja: la capa y las piezas del "Go deeper" que no es paso de la secuencia. */
    sheetLayers?: CoachStepLayer[];
    sheetPieces?: Record<string, PieceRow>;
    /** Lo que la página lleva al salir a una lección (voz, detalle abierto, su origen). */
    self?: { course?: string; focus?: string; up?: Exclude<CoachFrom, { k: 'seq' }> };
    /** ?sheet= (2026-10-01): la hoja abierta al volver de su lección; null = el coach la cerró. */
    initialSheet?: string | null;
  } | null;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'think');
  // Herramienta de toda cinta (Forward Momentum, kind 'tool'): no es una
  // secuencia — cambian las palabras, y no se entrena en Let's Play.
  const isTool = cfg.kind === 'tool';
  // Backside · Frontside (Marcelo 2026-09-25): un toque, y la página muestra
  // los pasos y el video de ese lado. Se recuerda por secuencia.
  // El valor guardado se lee DESPUÉS de montar: si se leyera al inicializar,
  // el servidor pintaría un lado y el navegador otro (error de hidratación).
  const [side, setSideState] = useState<'bs' | 'fs' | null>(cfg.sideOfStep ? 'bs' : null);
  // El coach que llega del plan con un paso de un lado (?focus) ve ESE lado
  // (sin guardarlo); si no, el que eligió la última vez.
  const focusSide = (() => {
    const fk = coach?.focus?.key;
    const fd = fk ? cfg.details.find((d) => d.key === fk) : null;
    return fd?.deeper?.lessonId && cfg.sideOfStep ? cfg.sideOfStep[fd.deeper.lessonId] ?? null : null;
  })();
  useEffect(() => {
    if (!cfg.sideOfStep) return;
    if (focusSide) { setSideState(focusSide); return; }
    try { const v = window.localStorage.getItem(`tss:side:${cfg.id}`); if (v === 'fs' || v === 'bs') setSideState(v); } catch {}
  }, [cfg.id, cfg.sideOfStep, focusSide]);
  const setSide = (v: 'bs' | 'fs') => { setSideState(v); try { window.localStorage.setItem(`tss:side:${cfg.id}`, v); } catch {} };
  const sideOf = (stepId: string | null | undefined): 'fs' | 'bs' | null => (stepId && cfg.sideOfStep ? cfg.sideOfStep[stepId] ?? null : null);
  const onSide = (stepId: string | null | undefined) => !side || !sideOf(stepId) || sideOf(stepId) === side;
  // Regular · Goofy: automático por la ficha; interruptor solo si hay videos por stance.
  const [stanceSel, setStanceSel] = useState<Stance>(stance ?? 'regular');
  useEffect(() => {
    try { const v = window.localStorage.getItem('tss:stance'); if (v === 'goofy' || v === 'regular') setStanceSel(v); } catch {}
  }, []);
  const setStance = (v: Stance) => { setStanceSel(v); try { window.localStorage.setItem('tss:stance', v); } catch {} };
  // Con un lado elegido y sin video de ese lado, NO se muestra el del otro
  // lado: queda la línea sobre la ola. Sin selector de lado, el general.
  const shownVideo = resolveSequenceVideo(videos, side, hasStanceVideos(videos) ? stanceSel : null) ?? (side ? null : video);
  const [coachOn, setCoachOn] = useState(true);
  const coachLayers = coach && coachOn ? coach.layers : [];
  // La barra del coach: el modo presentación, todos los videos y la hoja de un paso.
  const [deck, setDeck] = useState<{ slides: DeckSlide[]; start: number; title: string } | null>(null);
  const [watching, setWatching] = useState(false);
  const coachLaminas = coach?.laminas ?? [];
  const coachVideos = coach?.allVideos ?? [];
  const coachFocus = coach?.focus ?? null;
  // La hoja de un paso: se abre tocando su chip, o sola si vino del plan (?focus).
  const [sheetKey, setSheetKey] = useState<string | null>(coach?.initialSheet !== undefined ? coach.initialSheet : coach?.focus?.key ?? null);
  // La hoja abierta queda en la URL (Marcelo 2026-10-01): volver de "la lección
  // completa" la reabre. 'none' = la cerró (no vuelve la del ?focus). __NA = sin navegación de Next.
  const openSheet = (k: string | null) => {
    setSheetKey(k);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('sheet', k ?? 'none');
      const st = (window.history.state && typeof window.history.state === 'object') ? window.history.state : {};
      window.history.replaceState({ ...st, __NA: true }, '', `${u.pathname}${u.search}${u.hash}`);
    } catch { /* cosmético */ }
  };
  // Todas las piezas que el coach puede usar (las del alumno + las solo-coach).
  const allPieces: Record<string, PieceRow> = { ...pieces };
  for (const p of coach?.extraPieces ?? []) allPieces[p.id] = p;
  // Las piezas de la hoja de cada paso también cuentan (el deck elige sus misiones de acá).
  for (const p of Object.values(coach?.sheetPieces ?? {})) if (!allPieces[p.id]) allPieces[p.id] = p;
  // Vista del coach (capa encendida): cada drill y misión muestra sus criterios y key words.
  const coachView = !!coach && coachOn;
  // Foco opcional dentro de la misión (Marcelo 2026-09-09): la misión es
  // siempre la línea completa; el detalle se elige, o no.
  const [focus, setFocus] = useState<string | null>(null);
  // En modo coach los links salen al portal del coach (el token es suyo).
  const portal = coach ? `/coach-portal/${token}` : `/portal/${token}`;
  const courseTab = coach ? 'courses' : 'course';
  const body = lessons[cfg.think.bodyFromLesson];
  const order: Tab[] = ['think', 'feel', 'do', 'review'];
  const next = order[order.indexOf(tab) + 1];
  // El coach tiene su barra arriba: al cambiar de pestaña cae en las pestañas, no en el tope.
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const go = (t: Tab) => {
    setTab(t);
    // La pestaña queda en la URL (2026-10-01): volver de una lección o de
    // Let's Play cae en Do it, no en Think it. __NA = sin navegación de Next.
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('tab', t);
      const st = (window.history.state && typeof window.history.state === 'object') ? window.history.state : {};
      window.history.replaceState({ ...st, __NA: true }, '', `${u.pathname}${u.search}${u.hash}`);
    } catch { /* cosmético */ }
    if (coach && tabsRef.current) tabsRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Los links que salen de esta página llevan de dónde salieron: el Back de
  // la lección o el Cancel de Let's Play vuelven acá, a la misma pestaña.
  const parent = navTab === 'home' ? 'home' as const : navTab === 'sequence' ? 'play' as const : undefined;
  const here = (t: Tab = tab) => ({ k: 'seq' as const, id: cfg.id, tab: t, ...(parent ? { parent } : {}) });
  // El coach vuelve a esta página (misma pestaña) desde la lección.
  const lessonHref = (id: string) => withFrom(`${portal}?tab=${courseTab}&lesson=${id}`, coach ? { k: 'seq', id: cfg.id, tab, ...(coach.self ?? {}) } : here());
  const playHref = (q: string) => withFrom(`${portal}?tab=sequence&${q}`, here('do'));
  // Una misión en Let's Play. En una herramienta (Forward Momentum) va por el
  // planner nuevo como secuencia virtual (2026-10-01: antes abría el flujo viejo).
  const missionHref = (mid: string) => (isTool ? playHref(`seq=${cfg.id}&mode=step_focus&focus=${mid}`) : playHref(`drill=${mid}`));
  // Solo la dirección del dibujo cambia con el stance; el nombre de la maniobra no.
  const waveDirection = flip ? 'left' : 'right';
  const stripStep = (t: string) => t.replace(/^\d+ · /, '').replace(/ · .*$/, '');
  const shortLesson = (t: string) => t.replace(/ Operationalized at Blue Belt/, '');
  // Pasos en orden: si la config agrupa técnicas alternativas (turtle/duck), un grupo = un paso.
  const stepGroupsAll: { ids: string[]; title: string; note?: string }[] = cfg.stepGroups ?? cfg.stepIds.map((id) => ({ ids: [id], title: shortLesson(lessons[id]?.title ?? id) }));
  const stepGroups = stepGroupsAll.filter((g) => g.ids.some((id) => onSide(id)));

  // ── El modo presentación (un solo deck, 2026-09-30) ──
  // La secuencia: título → láminas → palabras → la línea en la ola → el cue → la misión.
  // Un cue en letra grande: sin marcas de markdown (citas, listas, títulos, comillas).
  const cleanCue = (md: string) => md.replace(/^>\s*/gm, '').replace(/^\s*[-*]\s+/gm, '').replace(/^#+\s*/gm, '').replace(/[`"“”*_]/g, '').trim();
  const sequenceSlides = (): DeckSlide[] => {
    const words = coach?.sayIt?.words ?? [];
    const cue = cleanCue(coach?.sayIt?.cue ?? '');
    // La misión de la secuencia primero; después las de sus pasos, en orden y del lado elegido.
    const missionIds = [cfg.do?.missionId, ...cfg.details.filter((d) => onSide(d.deeper?.lessonId)).map((d) => d.deeper?.missionId)];
    const missions = [...new Set(missionIds.filter(Boolean) as string[])].map((id) => allPieces[id]).filter((p): p is PieceRow => !!p && p.type === 'mission').slice(0, 3);
    return [
      { kind: 'text', eyebrow: cfg.eyebrow ?? `Sequence #${cfg.number}`, big: cfg.title, small: cfg.think.whatIs.headline },
      ...coachLaminas.map((l): DeckSlide => ({ kind: 'plate', src: l.src, alt: l.alt, from: cfg.title })),
      ...words.map((w, k): DeckSlide => ({ kind: 'text', eyebrow: `${k + 1} of ${words.length}`, big: w })),
      ...(cfg.think.board ? [{ kind: 'node', eyebrow: 'The line you are drawing', small: cfg.think.whatIs.line,
        node: <WaveGuide data={cfg.think.board} title={`${cfg.title} on the wave face`} waveDirection={waveDirection} kitSequence={WAVE_KIT_SEQUENCE[cfg.id]} legendColor="rgba(247,249,250,.8)" /> } as DeckSlide] : []),
      ...(cue ? [{ kind: 'text', eyebrow: 'The cue', big: cue } as DeckSlide] : []),
      ...missions.map((p): DeckSlide => ({ kind: 'text', eyebrow: 'In the water', big: p.title, small: (p.description_md ?? '').replace(/[#*>`]/g, '').split('\n').filter(Boolean)[1] ?? '' })),
    ];
  };
  // Un paso: su nombre → sus láminas → su cue → qué mirar (✓ ✗ fix) → sus videos.
  const stepSlides = (d: SequencePageConfig['details'][number], m: { laminas: LaminaT[]; videos: CourseVideo[] }, stepCue: string): DeckSlide[] => {
    const cue = cleanCue(stepCue);
    return [
      { kind: 'text', eyebrow: cfg.title, big: stripStep(d.title), small: d.symptom ? `Where it breaks: ${d.symptom}` : undefined },
      ...m.laminas.map((l): DeckSlide => ({ kind: 'plate', src: l.src, alt: l.alt, from: stripStep(d.title) })),
      ...(cue ? [{ kind: 'text', eyebrow: 'The cue', big: cue } as DeckSlide] : []),
      ...d.indicators.map((ind, k): DeckSlide => ({ kind: 'check', eyebrow: `Watch for · ${k + 1} of ${d.indicators.length}`, ok: ind.ok, no: ind.no, fix: ind.fix })),
      ...m.videos.map((v): DeckSlide => ({ kind: 'video', eyebrow: v.label ?? v.title, url: v.url, title: v.title })),
    ];
  };

  return (
    <section className="tss" data-screen="sequence">
      <div className="tss-main pb-6">
        <header>
          <div className="tss-brand-row">
            <svg className="tss-logo" viewBox="180 183 960 269" role="img" aria-label="The Surf Sequence — Evolve through play"><image href="/tss/assets/tss-logo-original-white.png" width="1312" height="654" /></svg>
          </div>
          <a className="tss-back" href={back?.href ?? (coach ? coach.backHref : `${portal}?tab=course`)}><Icon name="back" />{back?.label ?? (coach ? 'Courses' : 'Course')}</a>
          {coach && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[5px] px-3 py-2" style={{ background: 'rgba(0,210,255,.12)', border: '1px solid rgba(0,210,255,.45)' }}>
              <span style={{ ...MONO, color: CYAN }}>{coachOn ? 'Coach view · your layer is on' : 'Student view · exactly what they see'}</span>
              <button type="button" onClick={() => setCoachOn((v) => !v)} className="shrink-0 rounded-[5px] px-3 py-1.5 text-[12px] font-bold" style={{ background: coachOn ? '#F7F9FA' : CYAN, color: NAVY }}>
                {coachOn ? 'View as student' : 'Show coach layer'}
              </button>
            </div>
          )}
          {/* La barra del coach: poner las láminas en pantalla y todos los videos. */}
          {coach && coachOn && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => setDeck({ slides: sequenceSlides(), start: 0, title: cfg.title })} className="rounded-[5px] px-3.5 min-h-[40px] text-[13px] font-black uppercase tracking-wide" style={{ background: CYAN, color: NAVY }}>
                Present
              </button>
              {coachVideos.length > 0 && (
                <button type="button" onClick={() => setWatching(true)} className="rounded-[5px] px-3.5 min-h-[40px] text-[13px] font-bold inline-flex items-center gap-1.5" style={{ background: 'transparent', color: PAPER, border: '1px solid rgba(247,249,250,.45)' }}>
                  <Play size={13} /> Videos · {coachVideos.length}
                </button>
              )}
            </div>
          )}
          {/* Elegir el paso (paso 3, 2026-09-30): cada chip abre su hoja. */}
          {coach && coachOn && cfg.details.length > 0 && (
            <div className="mt-2">
              <p className="m-0 mb-1" style={{ ...MONO, color: 'rgba(247,249,250,.7)' }}>Teach a step</p>
              {/* Una sola fila que se desliza: los pasos no empujan el título hacia abajo. */}
              <div className="flex flex-nowrap overflow-x-auto gap-1.5 pb-1 -mx-1 px-1">
                {cfg.details.filter((d) => onSide(d.deeper?.lessonId)).map((d) => (
                  <button key={d.key} type="button" onClick={() => openSheet(d.key)} aria-pressed={sheetKey === d.key}
                    className="shrink-0 whitespace-nowrap inline-flex items-center gap-2 min-h-[40px] px-3 rounded-full text-[13px] font-semibold"
                    style={sheetKey === d.key ? { background: CYAN, color: NAVY } : { background: 'rgba(247,249,250,.08)', color: PAPER, border: '1px solid rgba(247,249,250,.25)' }}>
                    {d.command && <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                    {stripStep(d.title)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mt-2" style={{ ...MONO, color: CYAN }}>{cfg.eyebrow ?? `Sequence #${cfg.number}`}{cfg.alsoCourseKeys?.length ? '' : ` · ${cfg.belt.replace('_belt', ' belt')}`}</p>
          <h1 style={H1}>{cfg.title}</h1>
          <p className="tss-subtitle">{cfg.think.whatIs.headline}</p>
        </header>

        {/* Backside · Frontside: elegí el lado y la página te muestra sus pasos y su video. */}
        {cfg.sideOfStep && side && (
          <div className="mt-3 flex gap-1 p-1 rounded-full" style={{ background: '#0A2532', border: '1px solid rgba(0,210,255,.35)' }}>
            {(['bs', 'fs'] as const).map((v) => (
              <button key={v} type="button" onClick={() => setSide(v)} aria-pressed={side === v}
                className="flex-1 h-11 rounded-full text-[13px] font-black uppercase tracking-wide"
                style={side === v ? { background: '#00D2FF', color: '#061C2B' } : { color: 'rgba(247,249,250,.78)' }}>
                {v === 'bs' ? 'Backside' : 'Frontside'}
              </button>
            ))}
          </div>
        )}
        {hasStanceVideos(videos) && (
          <div className="mt-2 flex items-center justify-end gap-2">
            <span className="text-[11px]" style={{ color: 'rgba(247,249,250,.7)' }}>{stance ? 'Your stance' : 'Your stance?'}</span>
            <div className="flex gap-1 p-0.5 rounded-full" style={{ background: '#0A2532', border: '1px solid rgba(0,210,255,.35)' }}>
              {(['regular', 'goofy'] as const).map((v) => (
                <button key={v} type="button" onClick={() => setStance(v)} aria-pressed={stanceSel === v}
                  className="h-8 px-3 rounded-full text-[11px] font-black uppercase tracking-wide"
                  style={stanceSel === v ? { background: '#00D2FF', color: '#061C2B' } : { color: 'rgba(247,249,250,.78)' }}>
                  {v === 'goofy' ? 'Goofy' : 'Regular'}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Arriba de todo: la ejecución. El video cuando exista; si no, la línea sobre la ola. */}
        <Card className="mt-3">
          {shownVideo ? <SequenceVideo url={shownVideo.url} title={shownVideo.title} /> : cfg.think.board ? (
            <WaveGuide data={cfg.think.board} title={`${cfg.title} on the wave face`} waveDirection={waveDirection} kitSequence={WAVE_KIT_SEQUENCE[cfg.id]} />
          ) : (
            <>
              {/* Sin tablero (secuencias de entrada): antes iba acá "The steps, in
                  order" con las lecciones; se veía duplicado con "The steps that
                  build it" justo debajo (Marcelo 2026-09-17). Queda una sola lista;
                  las lecciones en orden viven en "02 · The steps · what each one is". */}
              <p className="text-[14px] m-0" style={{ color: INK }}>{cfg.think.whatIs.line}</p>
            </>
          )}
          {/* Los pasos del cuerpo, con el color del comando (los mismos de Review). */}
          <h2 className="tss-section-title" style={{ marginTop: 26 }}>{isTool ? 'The three moments' : 'The steps that build it'}</h2>
          <ol className="m-0 p-0 list-none">
            {cfg.details.filter((d) => onSide(d.deeper?.lessonId)).map((d, i) => (
              <li key={d.key} className="flex items-center gap-3 py-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
                <Num n={i + 1} />
                {d.command && <i className="inline-block w-3.5 h-3.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                <span className="text-[15px] font-semibold" style={{ color: INK }}>{stripStep(d.title)}</span>
              </li>
            ))}
          </ol>
          {/* La cadena del cuerpo dentro del paso (p. ej. la rotación del turn):
              postura → look → oblique → hip & rail → la tabla cambia de dirección. */}
          {cfg.chain && cfg.chain.length > 0 && (
            <div className="mt-3 rounded-[5px] px-3 py-2.5" style={{ background: 'rgba(6,28,43,.06)', border: `1px solid ${BORDER}` }}>
              <p className="text-[11px] font-mono uppercase tracking-wider m-0 mb-1.5" style={{ color: MUTED }}>How your body does it{side ? ` · ${side === 'bs' ? 'backside' : 'frontside'}` : ''}</p>
              <ol className="m-0 p-0 list-none">
                {cfg.chain.map((c, i) => (
                  <li key={c.title} className="flex items-start gap-2.5 py-1.5">
                    <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-black" style={{ background: NAVY, color: '#00D2FF' }}>{i + 1}</span>
                    {c.command && <i className="inline-block w-3 h-3 rounded-full shrink-0 mt-1.5" style={{ background: COMMAND_COLORS[c.command] }} />}
                    <span className="text-[14px] leading-snug" style={{ color: INK }}>
                      <b>{c.title}</b>{(c.noteBySide ? (side ? c.noteBySide[side] : `${c.noteBySide.bs} · ${c.noteBySide.fs}`) : c.note) ? <span> — {c.noteBySide ? (side ? c.noteBySide[side] : `${c.noteBySide.bs} · ${c.noteBySide.fs}`) : c.note}</span> : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Card>

        {/* Pestañas */}
        <div ref={tabsRef} className="sticky top-0 z-10 -mx-1 px-1 pt-2 pb-1" style={{ background: NAVY }}>
          <nav className="grid grid-cols-4 gap-1" role="tablist" aria-label="Think it · Feel it · Do it · Review">
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => go(t.key)}
                className="relative min-h-[44px] pt-2 pb-2.5 text-center bg-transparent border-0"
                style={{ color: tab === t.key ? CYAN : '#b9c8d1', fontWeight: tab === t.key ? 700 : 500, fontSize: 15 }}>
                {t.label}
                <span className="hidden sm:block text-[10px] font-normal" style={{ color: '#8fa3ae' }}>{t.sub}</span>
                <span className="absolute left-0 right-0 bottom-0 h-[3px] rounded" style={{ background: tab === t.key ? CYAN : '#35505e' }} />
              </button>
            ))}
          </nav>
        </div>

        {/* ── THINK ── */}
        {tab === 'think' && (
          <div className="mt-3">
            {/* Coach · say it, lo primero de Think: las palabras y el cue a mano. */}
            {coach && coachOn && coach.sayIt && (coach.sayIt.words.length > 0 || coach.sayIt.cue) && (
              <div className="mb-3"><CoachSay words={coach.sayIt.words} cue={coach.sayIt.cue} /></div>
            )}
            {(SEQUENCE_LAMINAS[cfg.id] ?? []).map((l) => (
              <Lamina key={l.src} src={l.src} alt={l.alt} caption={l.caption} />
            ))}
            {cfg.prep && cfg.prep.length > 0 && (
              <Card title="Before you start · every session" color={GOLD_BRIGHT} collapsible defaultOpen={false}>
                {cfg.prep.map((p, i) => (
                  <div key={p.lessonId} className="py-2" style={{ borderTop: i ? `1px solid ${BORDER}` : undefined }}>
                    <Go href={lessonHref(p.lessonId)}>{p.label}</Go>
                    {p.note && <p className="text-[14px] leading-snug mt-0.5 m-0" style={{ color: INK }}>{p.note}</p>}
                  </div>
                ))}
              </Card>
            )}
            <Card title="01 · What it is" collapsible defaultOpen={false}>
              <p className="tss-intro">{cfg.think.whatIs.headline}</p>
              {video && cfg.think.board && <div className="mb-2"><WaveGuide data={cfg.think.board} title={`${cfg.title} on the wave face`} waveDirection={waveDirection} kitSequence={WAVE_KIT_SEQUENCE[cfg.id]} /></div>}
              <Row k="The line">{cfg.think.whatIs.line}</Row>
              <Row k="Where">{cfg.think.whatIs.where}</Row>
              <Row k="What for">{cfg.think.whatIs.whatFor}</Row>
            </Card>
            {cfg.kind === 'entry' && (
              <Card title="02 · The steps · what each one is" collapsible defaultOpen={false}>
                {stepGroups.map((g, i) => (
                  <div key={g.ids.join('+')} className="py-2.5" style={{ borderTop: i ? `1px solid ${BORDER}` : undefined }}>
                    <p className="text-[15px] font-bold m-0" style={{ color: INK }}><span className="mr-2" style={{ ...MONO, fontSize: 13 }}>{String(i + 1).padStart(2, '0')}</span>{g.title}</p>
                    {g.note && <p className="text-[13px] mt-1 mb-0 leading-snug" style={{ color: '#55666E' }}>{g.note}</p>}
                    {g.ids.map((id) => lessons[id] ? (
                      <div key={id} className={g.ids.length > 1 ? 'mt-2 pl-3' : ''} style={g.ids.length > 1 ? { borderLeft: `2px solid ${BORDER}` } : undefined}>
                        {g.ids.length > 1 && <p className="text-[14px] font-bold m-0" style={{ color: INK }}>{lessons[id].title}</p>}
                        {lessons[id].whatIs && <p className="text-[14px] mt-1 mb-0 leading-snug" style={{ color: INK }}>{lessons[id].whatIs.split('\n').find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('>'))?.replace(/\*\*/g, '')}</p>}
                        <Go href={lessonHref(id)} small>Read the full lesson in the course</Go>
                      </div>
                    ) : null)}
                  </div>
                ))}
              </Card>
            )}
            {cfg.think.feet && (
            <Card title="02 · Feet · what changes with the back foot" collapsible defaultOpen={false}>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 rounded-[5px] p-1" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
                  <BoardMap compact active={cfg.think.feet!.recommended?.length ? cfg.think.feet!.recommended : undefined} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-snug m-0" style={{ color: INK }}>{cfg.think.feet.text}</p>
                  <div className="mt-2">
                    {cfg.think.feet.options.map((o) => {
                      const rec = cfg.think.feet!.recommended;
                      const on = !rec?.length || rec.includes(o.back);
                      return (
                        <div key={o.back} className="py-1.5" style={{ borderTop: `1px solid ${BORDER}`, opacity: on ? 1 : 0.5 }}>
                          <span className="font-bold" style={{ ...MONO, fontSize: 13, color: INK }}>{o.label}</span>
                          {rec?.length ? <span className="ml-2" style={{ ...MONO, fontSize: 10, color: on ? GREEN : RED }}>{on ? 'for this sequence' : 'not here'}</span> : null}
                          <p className="text-[13px] leading-snug m-0" style={{ color: MUTED }}>{o.tradeoff}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Callout>{cfg.think.feet.rule}</Callout>
            </Card>
            )}
            <Card title={isTool ? '03 · How your body does it' : '03 · The sequence · how your body does it'} collapsible defaultOpen={false}>
              {(cfg.think.bodyMarkdown ?? body?.body) ? <MarkdownContent markdown={cfg.think.bodyMarkdown ?? body!.body} /> : <p className="m-0" style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card title="04 · The rules that hold it together" collapsible defaultOpen={false}>
              {(cfg.think.rulesMarkdown ?? body?.rules) ? <MarkdownContent markdown={cfg.think.rulesMarkdown ?? body!.rules} /> : <p className="m-0" style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card title="05 · Key words" collapsible defaultOpen={false}>
              {cfg.think.keyWords.map((k) => (
                <div key={k.label} className="py-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <p className="m-0 mb-1" style={{ ...MONO, color: MUTED }}>{k.label}</p>
                  {k.label === 'Method'
                    // Marcelo 2026-09-09: palabra con un punto de color bien marcado delante — sólido, no arcoíris.
                    ? <p className="m-0 flex flex-wrap gap-x-3 gap-y-1.5">{k.words.map((w, i) => { const cs = [COMMAND_COLORS.posture, COMMAND_COLORS.rail, COMMAND_COLORS.projection, COMMAND_COLORS.maneuver, COMMAND_COLORS.posture]; return <span key={`${w}-${i}`} className="inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: INK }}><i className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: cs[i] ?? CYAN, boxShadow: '0 0 0 1px rgba(16,38,59,.15)' }} />{w}</span>; })}</p>
                    : <p className="m-0 flex flex-wrap gap-x-3 gap-y-1.5">{k.words.map((w, i) => <span key={`${w}-${i}`} className="text-[15px] font-bold" style={{ color: INK }}>{w}</span>)}</p>}
                </div>
              ))}
              {cfg.kind !== 'entry' && !isTool && <p className="text-[13px] mt-2 mb-0" style={{ color: MUTED }}>The body words are the method&apos;s formula: posture → rotation on the rail → projection → maneuver → back to posture. Same colours as the line on the wave.</p>}
              <p className="text-[14px] mt-2 mb-0" style={{ color: INK }}>Learn them on land, in the drill, until you can run them without thinking. In the water you carry one: the mission, or the one word that is breaking.</p>
              <details className="tss-accordion mt-3">
                <summary>Go deeper: each step as its own page<Chevron /></summary>
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                  {cfg.stepIds.map((id) => (
                    <a key={id} href={lessonHref(id)} className="text-[13px] font-semibold px-3 py-1.5 rounded-full no-underline" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: INK }}>{shortLesson(lessons[id]?.title ?? id)} →</a>
                  ))}
                </div>
              </details>
            </Card>
          </div>
        )}

        {/* ── FEEL ── */}
        {tab === 'think' && coachLayers.length > 0 && (
          <CoachCard title="Coach · how you teach it" layers={coachLayers} field="deliver" intro="What each step is, and how you deliver it — explain, demonstrate, participate, feedback." />
        )}
        {tab === 'do' && coach && coachOn && (coach.extraPieces?.length ?? 0) > 0 && (
          <section className="tss-card mt-3" style={{ background: NAVY, border: '1px solid rgba(0,210,255,.45)', borderTop: `4px solid ${CYAN}` }}>
            <h2 className="tss-section-title" style={{ color: PAPER, borderColor: 'rgba(255,255,255,.12)' }}>Coach · run it</h2>
            <p className="text-[13px] mt-0 mb-1" style={{ color: ON_DARK }}>Everything else in your catalogue for these steps — variants, the whole-line mission, coach-only drills and games — with their criteria. What is already in Feel it or in a step&apos;s sheet is not repeated.</p>
            {coach.extraPieces!.map((p) => (
              <details key={p.id} className="tss-accordion mt-2" style={{ background: PAPER }}>
                <summary style={{ color: INK }}><span className="flex-1"><span className="block" style={{ ...MONO, fontSize: 10, color: '#0090B0' }}>{p.type === 'mission' ? 'Mission' : (p.type as string) === 'game' ? 'Game' : 'Drill'}</span>{p.title}</span><Chevron /></summary>
                <div className="px-2 pb-2"><Piece p={p} canTrack={false} coachView /></div>
              </details>
            ))}
          </section>
        )}
        {tab === 'do' && coachLayers.length > 0 && (
          <CoachCard title="Coach · how you validate it" layers={coachLayers} field="validate" intro="The criteria of the mission, as you see them in the water." />
        )}
        {tab === 'review' && coachLayers.length > 0 && (
          <CoachCard title="Coach · how you correct it" layers={coachLayers} field="errors" intro="Error → what you see → what you say → what you do." />
        )}
        {tab === 'feel' && (
          <div className="mt-3">
            <Card title="Feel it · out of the water" color={VIOLET_BRIGHT} collapsible defaultOpen={false}>
              <p className="tss-intro">Connect the mechanics to your body before the wave asks for them.</p>
              <p className="text-[14px] m-0" style={{ color: INK }}>Three kinds of rehearsal, from stillness to movement. None of them is a test.</p>
            </Card>
            {/* La visualización de la LÍNEA COMPLETA; cada drill de abajo trae la
                suya propia (Understand · Visualize · Simulate · The cue). El
                rótulo lo dice para que no parezca repetido (Marcelo 2026-09-19). */}
            <Card title={isTool ? 'Visualize · the three moments' : 'Visualize · the whole line'} color={VIOLET_BRIGHT} collapsible defaultOpen={false}>
              <p className="text-[15px] m-0 leading-snug" style={{ color: INK }}>{cfg.feel.visualize}</p>
            </Card>
            {/* Una tarjeta sin piezas (drills apagados o solo-coach) no se dibuja:
                antes quedaba el rótulo vacío (auditoría 2026-09-25, Yellow #6). */}
            {cfg.feel.land.some((id) => pieces[id]) && (
              <Card title="Simulate · land, sand, pool or calm water" color={VIOLET_BRIGHT} collapsible defaultOpen={false}>
                {cfg.feel.land.filter((id) => pieces[id]).map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} coachView={coachView} />)}
              </Card>
            )}
            {cfg.feel.skate.some((id) => pieces[id]) && (
              <Card title="Simulate · surf skate" color={VIOLET_BRIGHT} collapsible defaultOpen={false}>
                {cfg.feel.skate.filter((id) => pieces[id]).map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} coachView={coachView} />)}
              </Card>
            )}
            <p className="text-[13px] px-1 mt-3 mb-0" style={{ color: ON_DARK }}>Each drill closes with one question: ready to take it to the water?</p>
          </div>
        )}

        {/* ── DO ── */}
        {tab === 'do' && (
          <div className="mt-3">
            <Card title="Mission · in the water" color={GREEN_BRIGHT}>
              <p className="tss-intro">{cfg.do.result}</p>
              <Row k="Timing">{cfg.do.timing}</Row>
              <Row k="Plan">You set the time and the number of waves before you paddle out. The plan is yours; it is not graded.</Row>
              {/* Conexión con Let's Play (Marcelo 2026-09-09): la línea completa
                  = sequence_run; el foco elegido = step_focus con su palabra como
                  objetivo de la sesión. La misión sola queda como opción. */}
              {(() => {
                // Let's Play agrupa por wb_sequence_id: el mismo id de la página (BB-SEQ-09…).
                // Una herramienta no está en Let's Play: se registra con su misión.
                const lp = isTool ? null : (trainAs?.id ?? cfg.id);
                const chosen = focus ? cfg.details.find((d) => d.key === focus) : null;
                const focusStep0 = chosen?.deeper?.lessonId ?? null;
                // Desde otro curso, el foco solo si el paso vive en esa secuencia.
                const focusStep = focusStep0 && (!trainAs || trainAs.stepIds.includes(focusStep0)) ? focusStep0 : null;
                const word = chosen ? chosen.title.replace(/^\d+ · /, '') : '';
                if (!canTrack) return <p className="inline-flex items-center gap-2 mt-3 mb-0 text-[13px]" style={{ color: MUTED }}><Lock size={13} /> Training and logging come with your training tool.</p>;
                if (!lp) {
                  // Herramienta: con un momento elegido que tiene su misión, esa; si no, la completa.
                  const own = chosen?.deeper?.missionId && pieces[chosen.deeper.missionId] ? chosen.deeper.missionId : null;
                  const mid = own ?? (pieces[cfg.do.missionId] ? cfg.do.missionId : null);
                  if (!mid) return null;
                  return (
                    <div className="mt-1">
                      <a href={missionHref(mid)} className="tss-primary no-underline">{own ? `Start the mission in Let's Play · ${word}` : isTool ? "Start the mission in Let's Play · all three moments" : "Start the mission in Let's Play"}</a>
                      {own && pieces[cfg.do.missionId] && (
                        <div className="mt-2"><a href={missionHref(cfg.do.missionId)} className="text-[13px] no-underline" style={{ color: MUTED }}>or the complete mission · all three moments</a></div>
                      )}
                    </div>
                  );
                }
                const runHref = playHref(`seq=${lp}&mode=sequence_run`);
                const focusHref = focusStep ? playHref(`seq=${lp}&mode=step_focus&focus=${focusStep}&word=${encodeURIComponent(word)}`) : null;
                return (
                  <div className="mt-1">
                    {focusHref ? (
                      <a href={focusHref} className="tss-primary no-underline" style={chosen?.command ? { background: COMMAND_COLORS[chosen.command], color: chosen.command === 'projection' ? NAVY : WHITE } : undefined}>Train it in Let&apos;s Play · focus: {word}</a>
                    ) : (
                      <a href={runHref} className="tss-primary no-underline">{trainAs ? `Train it in Let’s Play · inside your sequence #${trainAs.number}` : 'Train the whole sequence in Let’s Play'}</a>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {focusHref && <Go href={runHref} small>or the whole sequence, no focus</Go>}
                      {pieces[cfg.do.missionId] && <a href={missionHref(cfg.do.missionId)} className="text-[13px] no-underline" style={{ color: MUTED }}>Log the mission only</a>}
                    </div>
                  </div>
                );
              })()}
            </Card>
            <Card title="Choose a focus · optional" collapsible defaultOpen={false}>
              <p className="text-[14px] mt-0 mb-2" style={{ color: INK }}>{isTool
                ? 'The complete mission is the three moments, on one wave. Right after the pop-up and after a maneuver can also be trained on their own: pick one and its mission is the one you start.'
                : 'The mission is always the whole sequence. These are the steps your body runs; if one of them is breaking, pick it and it rides along as your word for the session. Pick nothing and just surf the line.'}</p>
              <div className="flex flex-wrap gap-2">
                {cfg.details.map((d) => (
                  <button key={d.key} type="button" onClick={() => setFocus(focus === d.key ? null : d.key)} aria-pressed={focus === d.key}
                    className="inline-flex items-center gap-2 text-[13px] px-3 py-2 rounded-full min-h-[40px] border"
                    style={focus === d.key ? { background: CYAN, borderColor: CYAN, color: NAVY, fontWeight: 700 } : { background: WHITE, borderColor: BORDER, color: INK }}>
                    {d.command && <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                    {d.title}
                  </button>
                ))}
              </div>
              {cfg.details.filter((d) => d.key === focus).map((d) => (
                <div key={d.key} className="mt-3 rounded-[5px] p-3" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
                  <p className="text-[13px] mt-0 mb-2" style={{ color: MUTED }}>Where it breaks: {d.symptom}</p>
                  {d.indicators.map((ind, i) => <Indicator key={i} ok={ind.ok} no={ind.no} fix={ind.fix} first={i === 0} />)}
                  {d.deeper && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[13px]">
                      <a href={lessonHref(d.deeper.lessonId)} className="px-3 py-1.5 rounded-full no-underline font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: INK }}>Go deeper → {d.deeper.label}</a>
                      {d.deeper.drillId && pieces[d.deeper.drillId] && <button type="button" onClick={() => go('feel')} className="px-3 py-1.5 rounded-full font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: VIOLET }}>Drill: {pieces[d.deeper.drillId].title} · Feel it</button>}
                      {canTrack && d.deeper.missionId && pieces[d.deeper.missionId] && <a href={missionHref(d.deeper.missionId)} className="px-3 py-1.5 rounded-full no-underline font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: GREEN }}>Mission: {pieces[d.deeper.missionId].title}</a>}
                    </div>
                  )}
                </div>
              ))}
            </Card>
            <WhereYouAre progress={progress} portal={portal} tool={isTool} />
            <Card title="Competence · is it yours yet?" color={GREEN_BRIGHT} collapsible defaultOpen={false}>
              <p className="text-[14px] m-0 leading-snug" style={{ color: INK }}>{cfg.do.competence}</p>
            </Card>
          </div>
        )}

        {/* ── REVIEW ── */}
        {tab === 'review' && (
          <div className="mt-3">
            {coach && coachOn && coachFocus && (
              <div className="rounded-[5px] px-3 py-2.5 mb-3" style={{ background: '#FFF6E0', border: '1.5px solid #E0A62B' }}>
                <p className="m-0 mb-1" style={{ ...MONO, color: '#9A6A12' }}>You came here for{coachFocus.from ? ` · ${coachFocus.from}` : ''}</p>
                <p className="text-[17px] font-extrabold leading-snug m-0" style={{ color: INK }}>{coachFocus.title}</p>
                <p className="text-[13px] mt-1 mb-0" style={{ color: MUTED }}>{coachFocus.key ? 'Open below: what it looks like when it breaks, and the sentence that fixes it.' : isTool ? 'Everything for this tool is below.' : 'Everything for this sequence is below.'}</p>
              </div>
            )}
            <Card title="How you know you have it" color={GREEN_BRIGHT} collapsible defaultOpen={!!(coach && coachOn && coachFocus?.key)}>
              <p className="text-[14px] mt-0 mb-2" style={{ color: INK }}>{isTool ? 'One topic per moment. Open only the one you want to check.' : 'One topic per step of the sequence. Open only the one you want to check.'}</p>
              {cfg.details.map((d) => (
                <details key={d.key} className="tss-accordion" open={!!(coach && coachOn && coachFocus?.key === d.key)}
                  style={coach && coachOn && coachFocus?.key === d.key ? { borderColor: '#E0A62B', borderWidth: 1.5 } : undefined}>
                  <summary>
                    <span className="inline-flex items-center gap-2.5 flex-1">
                      {d.command && <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                      <span>{d.title}</span>
                    </span>
                    <span className="inline-flex items-center gap-2"><span className="text-[12px] font-normal" style={{ color: MUTED }}>{d.indicators.length}</span><Chevron /></span>
                  </summary>
                  <div className="px-3 pb-3">
                    {d.indicators.map((ind, i) => <Indicator key={i} ok={ind.ok} no={ind.no} fix={ind.fix} first={i === 0} />)}
                    {d.deeper && <Go href={lessonHref(d.deeper.lessonId)} small>Go deeper → {d.deeper.label}</Go>}
                  </div>
                </details>
              ))}
            </Card>
            {lessons[cfg.think.bodyFromLesson]?.mistakes && (
              <Card title="Common mistakes" color="#FF6B6B" collapsible defaultOpen={false}>
                {[cfg.think.bodyFromLesson].map((id) => lessons[id]?.mistakes ? (
                  <details key={id} className="tss-accordion">
                    <summary><span className="flex-1">{shortLesson(lessons[id].title)}</span><Chevron /></summary>
                    <div className="px-3 pb-3"><MarkdownContent markdown={lessons[id].mistakes} /></div>
                  </details>
                ) : null)}
              </Card>
            )}
            <WhereYouAre progress={progress} portal={portal} tool={isTool} />
            <Card title="How it feels" color={VIOLET_BRIGHT} collapsible defaultOpen={false}>
              <p className="text-[14px] m-0 leading-snug" style={{ color: INK }}>{cfg.review.howItFeels}</p>
            </Card>
            <Card title="After a session">
              <p className="text-[14px] m-0" style={{ color: INK }}><b>★ 1–5</b> how it went · <b>Focus 0–3</b> · <b>Flow</b> bored → too much. Then, if you want, check the indicators above one by one. The weakest one becomes your next word.</p>
              {canTrack && <Go href={`${portal}?tab=sequence`} small>Open Let&apos;s Play</Go>}
            </Card>
          </div>
        )}

        {next && (
          <button type="button" onClick={() => go(next)} className="tss-primary">
            Next: {TABS.find((t) => t.key === next)?.label} <Icon name="arrow" />
          </button>
        )}
        <p className="text-[12px] mt-6 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: ON_DARK, opacity: .8 }}>
          <span>Colours on the wave</span>
          {(['posture', 'rail', 'projection', 'maneuver', 'closure'] as const).map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5"><i className="inline-block w-2 h-2 rounded-full" style={{ background: COMMAND_COLORS[c] }} />{c}</span>
          ))}
        </p>
      </div>

      {/* Nav inferior blanca: los mismos destinos del portal. */}
      {coach && coachOn && sheetKey && (() => {
        const d = cfg.details.find((x) => x.key === sheetKey);
        if (!d) return null;
        const stepId = d.deeper?.lessonId ?? null;
        const base = (stepId && coach.stepMedia?.[stepId]) || { laminas: [], videos: [] };
        // Una lámina de la secuencia cuyo nombre es el del paso ("Paddle with the
        // correct angle") también es de ese paso.
        const key = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const own = coachLaminas.filter((l) => l.caption && key(l.caption) === key(stripStep(d.title)));
        const m = { videos: base.videos, laminas: [...own, ...base.laminas.filter((l) => !own.some((o) => o.src === l.src))] };
        const layer = stepId ? coach.layers.find((l) => l.stepId === stepId) ?? coach.sheetLayers?.find((l) => l.stepId === stepId) ?? null : null;
        const pieceOf = (id?: string) => (id ? allPieces[id] ?? coach.sheetPieces?.[id] : undefined);
        const stepCue = stepId ? lessons[stepId]?.cue ?? '' : '';
        return (
          <StepSheet
            d={d} laminas={m.laminas} videos={m.videos} layer={layer} cue={stepCue}
            drill={pieceOf(d.deeper?.drillId)}
            // Herramienta: el momento sin misión propia (cuando perdés velocidad) se corre con la completa.
            mission={pieceOf(d.deeper?.missionId ?? (isTool ? cfg.do.missionId : undefined))}
            lessonHref={stepId ? lessonHref(stepId) : null}
            onClose={() => openSheet(null)}
            onPresent={(start) => setDeck({ slides: stepSlides(d, m, stepCue), start, title: stripStep(d.title) })}
          />
        );
      })()}
      {coach && deck && <ClassDeck slides={deck.slides} start={deck.start} title={deck.title} onClose={() => setDeck(null)} />}
      {coach && watching && coachVideos.length > 0 && <VideosDialog title={`${cfg.title} · all videos`} videos={coachVideos} onClose={() => setWatching(false)} />}
      {!coach && <PortalBottomNav portal={portal} active={navTab} />}
    </section>
  );
}

/** "Where you are · from Let's Play" — el mismo bloque en Do y en Review. */
function WhereYouAre({ progress, portal, tool = false }: { progress?: SequenceProgress | null; portal: string; tool?: boolean }) {
  if (!progress || !(progress.ratedSteps > 0 || progress.lastRun !== null)) return null;
  // Una herramienta es UN paso: su estrella, sin "la secuencia vale su paso más flojo".
  if (tool) {
    const st = progress.steps[0];
    if (!st || st.rating === null) return null;
    return (
      <Card title="Where you are" color={GOLD_BRIGHT} collapsible defaultOpen={false}>
        <p className="text-[14px] m-0" style={{ color: INK }}><b>{st.rating}★</b>{st.coachRating != null ? ' from your coach' : ''}{st.selfRating != null && st.coachRating != null && st.selfRating !== st.coachRating ? ` · you ${st.selfRating}★` : ''}. 4★ and up, it is yours.</p>
      </Card>
    );
  }
  return (
    <Card title="Where you are · from Let's Play" color={GOLD_BRIGHT} collapsible defaultOpen={false}>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[14px]" style={{ color: INK }}>
        {progress.minRating !== null && <span><b>{progress.minRating}★</b> the sequence is worth its weakest step</span>}
        {progress.side === 'both' && progress.sideRatings ? (
          <span>frontside <b>{progress.sideRatings.fs ?? '—'}{progress.sideRatings.fs != null ? '★' : ''}</b> · backside <b>{progress.sideRatings.bs ?? '—'}{progress.sideRatings.bs != null ? '★' : ''}</b></span>
        ) : progress.lastRun !== null && <span>last run <b>{progress.lastRun}★</b></span>}
        <span>{progress.ratedSteps}/{progress.totalSteps} steps rated</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {progress.steps.map((st) => (
          <span key={st.id} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: st.rating === null ? MUTED : st.rating >= 4 ? GREEN : GOLD }}>
            {st.title.replace(/ Operationalized at Blue Belt/, '')} {st.rating === null ? '·' : `${st.rating}★`}{st.selfRating != null && st.coachRating != null && st.selfRating !== st.coachRating ? ` · you ${st.selfRating}★` : ''}
          </span>
        ))}
      </div>
      {(progress.heldBackTitle || progress.weakestTitle) && (
        <Callout label="Work on">
          {(() => {
            const w = progress.steps.find((st) => st.id === progress.weakestId);
            const readyish = !progress.heldBackTitle && w && w.coachRating != null && w.coachRating < 4 && (w.selfRating ?? 0) >= 4;
            if (readyish) return `${progress.weakestTitle} is below 4★ from your coach — you rate it ${w!.selfRating}★. Run it again and ask your coach to confirm it.`;
            return `${progress.heldBackTitle ? `${progress.heldBackTitle} held your last run back.` : `${progress.weakestTitle} is the earliest step below 4★.`} Pick it as your focus above and train it.`;
          })()}
        </Callout>
      )}
      <Go href={`${portal}?tab=sequence`} small>See all your sequences in Let&apos;s Play</Go>
    </Card>
  );
}

/** YouTube / Vimeo → iframe; archivo directo → <video>. */
function SequenceVideo({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
  const box = 'relative w-full rounded-[5px] overflow-hidden';
  if (src) return <div className={box} style={{ paddingTop: '56.25%', background: NAVY }}><iframe src={src} title={title} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>;
  return <video src={url} controls playsInline preload="metadata" className="w-full block rounded-[5px]" title={title} />;
}

function Card({ title, color, className = '', children, collapsible = false, defaultOpen = false }: { title?: string; color?: string; className?: string; children: React.ReactNode; /** Plegable: solo el título a la vista, se abre al tocar (Marcelo 2026-09-17: menos scroll). */ collapsible?: boolean; defaultOpen?: boolean }) {
  if (collapsible && title) {
    return (
      <details className={`tss-card group ${className}`} style={color ? { borderTop: `4px solid ${color}` } : undefined} open={defaultOpen}>
        <summary className="list-none cursor-pointer flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <h2 className="tss-section-title m-0" style={{ borderBottom: 'none', paddingBottom: 0 }}>{title}</h2>
          <span aria-hidden className="shrink-0 text-[22px] leading-none transition-transform group-open:rotate-180" style={{ color: INK }}>⌄</span>
        </summary>
        <div className="mt-3">{children}</div>
      </details>
    );
  }
  return (
    <section className={`tss-card ${className}`} style={color ? { borderTop: `4px solid ${color}` } : undefined}>
      {title && <h2 className="tss-section-title">{title}</h2>}
      {children}
    </section>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="py-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
      <p className="m-0 mb-0.5" style={{ ...MONO, color: MUTED }}>{k}</p>
      <p className="text-[14px] leading-snug m-0" style={{ color: INK }}>{children}</p>
    </div>
  );
}

/** La regla / el aviso: caja navy dentro de la tarjeta crema (como "timing" en Three Circles). */
function Callout({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="tss-timing"><div>
      {label && <h3>{label}</h3>}
      <p style={{ color: WHITE, fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{children}</p>
    </div></div>
  );
}

function Indicator({ ok, no, fix, first }: { ok: string; no: string; fix: string; first: boolean }) {
  return (
    <div className="py-2" style={{ borderTop: first ? undefined : `1px solid ${BORDER}` }}>
      <p className="text-[14px] m-0" style={{ color: INK }}><b style={{ color: GREEN }}>✓</b> {ok}</p>
      <p className="text-[14px] mt-1 mb-0" style={{ color: INK }}><b style={{ color: RED }}>✗</b> {no}</p>
      <p className="text-[14px] mt-1 mb-0" style={{ color: INK }}><b style={{ color: GOLD }}>Fix:</b> {fix}</p>
    </div>
  );
}

/** Link sobre crema: tinta, negrita, flecha. */
function Go({ href, children, small = false }: { href: string; children: React.ReactNode; small?: boolean }) {
  return <a href={href} className={`inline-flex items-center gap-1.5 font-bold no-underline ${small ? 'text-[13px] mt-1' : 'text-[15px]'}`} style={{ color: INK }}>{children} <ArrowRight size={small ? 13 : 15} /></a>;
}

function Piece({ p, href = null, canTrack, coachView = false }: { p?: PieceRow; href?: string | null; canTrack: boolean; coachView?: boolean }) {
  if (!p) return null;
  const md = (p.description_md ?? '').trim();
  return (
    <div className="mt-2 rounded-[5px] px-3 py-2.5" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
      <p className="text-[15px] font-bold m-0" style={{ color: INK }}>{p.title}</p>
      {/* Los drills de White/Yellow vienen en markdown (## What you'll train…):
          se renderizan como en el curso, con los temas plegables (el primero
          abierto) para que el alumno vaya directo a lo que busca (Marcelo 2026-09-17). */}
      {md && (md.startsWith('#') || /\n\s*[-*] /.test(md)
        ? <div className="mt-1"><MarkdownContent markdown={md} collapsible /></div>
        : <p className="text-[14px] mt-1 mb-0 leading-snug" style={{ color: INK }}>{md}</p>)}
      <div className="flex items-center gap-3 mt-1.5 text-[12px]" style={{ color: MUTED }}>
        {p.time_estimate && <span>{p.time_estimate}</span>}
        {p.reps_recommended && <span>{p.reps_recommended} reps</span>}
        {/* Los drills son ensayo: se hacen, no se registran (doctrina 2026-09-10). Solo las misiones llevan a Let's Play. */}
        {href ? (canTrack ? <a href={href} className="inline-flex items-center gap-1 font-bold no-underline" style={{ color: INK }}><Play size={12} /> Log it in Let&apos;s Play</a> : <span className="inline-flex items-center gap-1"><Lock size={11} /> with your training tool</span>) : <span>rehearsal · no need to log it</span>}
      </div>
      {/* Solo el coach (2026-10-01, lo que antes daba la STP Library): los
          criterios aprobados y las palabras de la pieza. El alumno no los ve aquí. */}
      {coachView && (p.success_criteria?.length ?? 0) > 0 && (
        <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
          <p className="m-0 mb-1" style={{ ...MONO, fontSize: 10, color: '#0090B0' }}>How you know · criteria</p>
          <ul className="m-0 p-0 list-none space-y-1">
            {p.success_criteria!.map((c, i) => <li key={i} className="flex gap-1.5 text-[13px] leading-snug" style={{ color: INK }}><span style={{ color: GREEN }}>✓</span><span>{c.replace(/^-\s*/, '')}</span></li>)}
          </ul>
        </div>
      )}
      {coachView && (p.key_words?.length ?? 0) > 0 && (
        <p className="text-[12px] mt-1.5 mb-0"><span style={{ color: MUTED }}>Key words · </span><span style={{ ...MONO, fontSize: 11, color: INK, textTransform: 'none' }}>{p.key_words!.join(' · ')}</span></p>
      )}
    </div>
  );
}

/** Número de paso: pastilla navy con cifra cyan (mismo lenguaje que Let's Play y How it works). */
function Num({ n }: { n: number }) {
  return <span className="shrink-0 w-8 h-8 rounded-[5px] inline-flex items-center justify-center font-bold" style={{ ...MONO, fontSize: 13, background: NAVY, color: CYAN }}>{String(n).padStart(2, '0')}</span>;
}

function Chevron() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;
}

function Icon({ name }: { name: 'home' | 'course' | 'play' | 'back' | 'arrow' }) {
  const p: Record<string, React.ReactNode> = {
    home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    course: <><path d="M2 8.5 12 4l10 4.5-10 4.5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
    play: <path d="M7 4.5v15l12-7.5z" />,
    back: <path d="M15 5l-7 7 7 7" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>;
}

/** La hoja de un paso (paso 3, 2026-09-30): el orden de Teach it que Marcelo
 *  aprobó — Say it · Show it · Run it · Watch for — para ESE paso. Abajo en el
 *  teléfono, a la derecha en el iPad. */
function StepSheet({ d, laminas, videos, layer, cue, drill, mission, lessonHref, onClose, onPresent }: {
  d: SequencePageConfig['details'][number];
  laminas: LaminaT[];
  videos: CourseVideo[];
  layer: CoachStepLayer | null;
  cue: string;
  drill?: PieceRow;
  mission?: PieceRow;
  lessonHref: string | null;
  onClose: () => void;
  onPresent: (start: number) => void;
}) {
  useEffect(() => {
    // La página de atrás no se mueve mientras la hoja está abierta.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Con el modo presentación abierto encima, Esc cierra solo ese.
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[role=dialog][aria-label$="on screen"]')) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  const H = ({ n, t }: { n: number; t: string }) => (
    <p className="m-0 mt-4 mb-1.5 flex items-center gap-2" style={{ ...MONO, color: CYAN }}>
      <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-black" style={{ background: CYAN, color: NAVY }}>{n}</span>{t}
    </p>
  );
  const title = d.title.replace(/^\d+ · /, '');
  return (
    <div role="dialog" aria-modal="true" aria-label={`Teach · ${title}`} className="fixed inset-0 z-[240] flex items-end md:items-stretch md:justify-end" style={{ background: 'rgba(6,28,43,.6)', overscrollBehavior: 'contain' }} onClick={onClose}>
      {/* Con la app instalada, respeta la barra de inicio del iPhone y la de estado del iPad. */}
      <div className="w-full md:w-[440px] max-h-[88vh] md:max-h-none overflow-y-auto overscroll-contain rounded-t-[14px] md:rounded-none px-4 pt-3 md:pt-[calc(12px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]" style={{ background: NAVY, borderTop: `4px solid ${CYAN}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="m-0" style={{ ...MONO, color: 'rgba(247,249,250,.65)' }}>Teach this step</p>
            <p className="m-0 mt-0.5 text-[20px] font-extrabold leading-tight inline-flex items-center gap-2" style={{ color: PAPER }}>
              {d.command && <i className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}{title}
            </p>
          </div>
          <button type="button" autoFocus onClick={onClose} aria-label="Close" className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[22px] leading-none" style={{ background: 'rgba(247,249,250,.1)', color: PAPER }}>×</button>
        </div>
        <button type="button" onClick={() => onPresent(0)} className="mt-3 w-full min-h-[44px] rounded-[5px] text-[14px] font-black uppercase tracking-wide" style={{ background: CYAN, color: NAVY }}>
          Present this step
        </button>

        <H n={1} t="Say it" />
        {cue ? <div className="seq-dark"><CoachMd md={cue} /></div> : <p className="text-[13px] m-0" style={{ color: ON_DARK }}>No cue written for this step yet.</p>}
        {layer && (layer.what || layer.deliver) && (
          <details className="tss-accordion mt-2" style={{ background: 'rgba(247,249,250,.06)', borderColor: 'rgba(255,255,255,.14)' }}>
            <summary style={{ color: PAPER }}><span className="flex-1">How you teach it</span><Chevron /></summary>
            <div className="px-3 pb-3 seq-dark"><CoachMd md={[layer.what, layer.deliver].filter(Boolean).join('\n\n')} /></div>
          </details>
        )}

        <H n={2} t="Show it" />
        {laminas.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {laminas.map((l, k) => (
              <button key={l.src} type="button" onClick={() => onPresent(1 + k)} aria-label={`Show on screen: ${l.alt}`} className="shrink-0 rounded-[5px] overflow-hidden" style={{ border: '1px solid rgba(247,249,250,.25)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.src} alt="" className="h-[72px] w-[112px] object-cover" style={{ background: '#000' }} />
              </button>
            ))}
          </div>
        )}
        {videos.length > 0 && <div className="mt-2 rounded-[5px] p-2" style={{ background: PAPER }}><VideoList videos={videos} /></div>}
        {laminas.length === 0 && videos.length === 0 && <p className="text-[13px] m-0" style={{ color: ON_DARK }}>No plate or video for this step yet. The wave drawing and the page still do the job.</p>}

        <H n={3} t="Run it" />
        {drill || mission ? (
          <>
            {/* En el idioma del método (Marcelo 2026-09-30): el drill es Feel it (sin
                ola: en tierra, skate, visualización) y la misión es Do it (en el agua).
                El nombre va en INK: sobre el papel, el blanco de la hoja no se veía. */}
            {drill && <details className="tss-accordion" style={{ background: PAPER }}><summary style={{ color: INK }}><span className="flex-1"><span className="block" style={{ ...MONO, fontSize: 10, color: '#0090B0' }}>Feel it · drill · no wave</span>{drill.title}</span><Chevron /></summary><div className="px-2 pb-2"><Piece p={drill} canTrack={false} coachView /></div></details>}
            {mission && <details className="tss-accordion mt-2" style={{ background: PAPER }}><summary style={{ color: INK }}><span className="flex-1"><span className="block" style={{ ...MONO, fontSize: 10, color: '#0090B0' }}>Do it · mission · in the water</span>{mission.title}</span><Chevron /></summary><div className="px-2 pb-2"><Piece p={mission} canTrack={false} coachView /></div></details>}
          </>
        ) : <p className="text-[13px] m-0" style={{ color: ON_DARK }}>No drill or mission linked to this step. Run the whole line.</p>}
        {lessonHref && <a href={lessonHref} className="inline-flex items-center min-h-[40px] mt-1 text-[13px] font-semibold no-underline" style={{ color: CYAN }}>Open the lesson · {d.deeper?.label ?? title} →</a>}

        <H n={4} t="Watch for" />
        {d.symptom && <p className="text-[13px] m-0 mb-2" style={{ color: ON_DARK }}>Where it breaks: {d.symptom}</p>}
        <div className="rounded-[5px] px-3 pb-2" style={{ background: PAPER }}>
          {d.indicators.map((ind, k) => <Indicator key={k} ok={ind.ok} no={ind.no} fix={ind.fix} first={k === 0} />)}
        </div>
        {layer?.errors && (
          <details className="tss-accordion mt-2" style={{ background: 'rgba(247,249,250,.06)', borderColor: 'rgba(255,255,255,.14)' }}>
            <summary style={{ color: PAPER }}><span className="flex-1">How you correct it</span><Chevron /></summary>
            <div className="px-3 pb-3 seq-dark"><CoachMd md={layer.errors} /></div>
          </details>
        )}
      </div>
    </div>
  );
}

/** Coach · say it: las palabras numeradas y el cue (lo que antes solo tenía Teach it). */
function CoachSay({ words, cue }: { words: string[]; cue: string }) {
  return (
    <section className="tss-card mt-3" style={{ background: NAVY, border: '1px solid rgba(0,210,255,.45)', borderTop: `4px solid ${CYAN}` }}>
      <h2 className="tss-section-title" style={{ color: PAPER, borderColor: 'rgba(255,255,255,.12)' }}>Coach · say it</h2>
      {words.length > 0 && (
        <ol className="m-0 p-0 list-none">
          {words.map((w, i) => (
            <li key={`${w}:${i}`} className="flex items-center gap-2.5 py-1.5">
              <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-black" style={{ background: CYAN, color: NAVY }}>{i + 1}</span>
              <span className="text-[16px] font-bold" style={{ color: PAPER }}>{w}</span>
            </li>
          ))}
        </ol>
      )}
      {cue && (
        <div className="mt-2 seq-dark">
          <p className="m-0 mb-1" style={{ ...MONO, color: CYAN }}>The cue they will hear</p>
          <CoachMd md={cue} />
        </div>
      )}
    </section>
  );
}

/** Capa del coach: una tarjeta ink con un acordeón por paso. */
function CoachCard({ title, layers, field, intro }: { title: string; layers: CoachStepLayer[]; field: 'deliver' | 'validate' | 'errors'; intro: string }) {
  return (
    <section className="tss-card mt-3" style={{ background: NAVY, border: '1px solid rgba(0,210,255,.45)', borderTop: `4px solid ${CYAN}` }}>
      <h2 className="tss-section-title" style={{ color: PAPER, borderColor: 'rgba(255,255,255,.12)' }}>{title}</h2>
      <p className="text-[13px] mt-0 mb-2" style={{ color: ON_DARK }}>{intro}</p>
      {layers.map((l) => {
        const md = field === 'deliver' ? [l.what, l.deliver].filter(Boolean).join('\n\n') : l[field];
        if (!md) return null;
        return (
          <details key={l.stepId} className="tss-accordion" style={{ background: 'rgba(247,249,250,.06)', borderColor: 'rgba(255,255,255,.14)' }}>
            <summary style={{ color: PAPER }}><span className="flex-1">{l.title}</span><Chevron /></summary>
            <div className="px-3 pb-3 seq-dark"><CoachMd md={md} /></div>
          </details>
        );
      })}
    </section>
  );
}

/** Markdown del coach sobre fondo ink. Las tablas "Error → what you see →
 *  what you say → what you do" se muestran como tarjetas por error (en el
 *  teléfono la tabla de 4 columnas no se leía — Marcelo 2026-09-17). */
function CoachMd({ md }: { md: string }) {
  const lines = md.split('\n');
  const out: React.ReactNode[] = [];
  let buf: string[] = [];
  let i = 0, k = 0;
  const flush = () => { if (buf.join('').trim()) out.push(<MarkdownContent key={`m${k++}`} markdown={buf.join('\n')} />); buf = []; };
  const cell = (row: string) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim().replace(/\*\*/g, ''));
  while (i < lines.length) {
    const ln = lines[i];
    if (/^\s*\|/.test(ln) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flush();
      const head = cell(ln); i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(cell(lines[i])); i += 1; }
      out.push(
        <div key={`t${k++}`} className="space-y-2 mt-2">
          {rows.map((r, ri) => (
            <div key={ri} className="rounded-[5px] px-3 py-2.5" style={{ background: 'rgba(247,249,250,.06)', border: '1px solid rgba(255,255,255,.14)' }}>
              <p className="text-[15px] font-bold m-0 leading-snug" style={{ color: CYAN }}>{r[0]}</p>
              {r.slice(1).map((c, ci) => c ? (
                <p key={ci} className="m-0 mt-1.5 text-[14px] leading-snug" style={{ color: PAPER }}>
                  <span className="block text-[10px] uppercase tracking-[0.16em]" style={{ ...MONO, fontSize: 10, color: ON_DARK }}>{head[ci + 1] ?? ''}</span>
                  {c}
                </p>
              ) : null)}
            </div>
          ))}
        </div>
      );
      continue;
    }
    buf.push(ln); i += 1;
  }
  flush();
  return <>{out}</>;
}
