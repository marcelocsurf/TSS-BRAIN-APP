'use client';

import { useState, useEffect } from 'react';
import { LessonViewer } from './LessonViewer';
import { sequencePageFor } from '@/lib/sequence-pages';
import { CourseFinalQuiz } from './CourseFinalQuiz';
import { getSectionIntros, type SectionIntro } from '@/lib/actions/section-intros';
import { toEmbedUrl } from '@/lib/utils/video-embed';
import { CourseSwitcher } from './CourseSwitcher';
import { COURSES, SHARED_PRE_COURSE_SECTIONS, type CourseKey } from '@/lib/constants/courses';
import { loadPortalState, savePortalState } from '@/lib/portal/portal-state';
import { BELT_THEMES, type BeltLevel, type BeltTheme } from '@/lib/constants/belt-theme';
import {
  groupByBlocks,
  isMappedToBlocks,
  stepKey,
  THREE_CIRCLES_LESSON_ID,
  COURSE_SEQUENCE_ORDER,
  COURSE_SEQUENCE_STAGE,
  BLUE_COURSE_PRELUDE,
  sequencePrefix,
} from '@/lib/constants/learning-blocks';
import { ConcentricRings } from '@/components/shared/ConcentricRings';
import {
  BookOpen, Compass, Award, Trophy, Lock, Unlock, CheckCircle2,
  PlayCircle, Hourglass, ScrollText, Brain, Waves, Handshake,
  LifeBuoy, Dumbbell, Eye, DoorOpen, Anchor, Rocket, ArrowLeftRight,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

interface LessonRow {
  id: string;
  course_section: string;
  step_number: number;
  title: string;
  subtitle: string | null;
  pillar: string | null;
  estimated_minutes: number;
  lesson_type: 'reading' | 'form' | 'test';
  display_order: number;
  cover_image_url: string | null;
  progress: any | null;
  locked: boolean;
  lockReason: string | null;
  completed: boolean;
  // Phase 1 canon structure
  pc_section_id: string | null;
  pc_section_name: string | null;
  pc_section_order: number | null;
  status_v1: 'PRODUCTIZED' | 'PROPOSED' | null;
  is_test: boolean;
  wb_sequence_id: string | null;
  wb_sequence_name: string | null;
  wb_sequence_order: number | null;
  wb_sequence_promise: string | null;
  /** Cuando el paso viene prestado de otra cinta para completar la secuencia:
   *  el nombre de esa cinta, para rotularlo. */
  borrowedFrom?: string | null;
  sequence_step_order: number | null;
}

interface CourseData {
  lessons: LessonRow[];
  preCourseCompleted: boolean;
  totalCompleted: number;
  totalLessons: number;
  studentId: string;
  studentName: string;
  isOwner: boolean;
  hasAccess: boolean;
  ownedCourses: { key: CourseKey; label: string }[];
  activeCourseKey: CourseKey;
  portalToken: string;
}

// Pre-Course sub-group icon map. Keys are pc_section_id values.
const PC_SECTION_ICON: Record<string, LucideIcon> = {
  // Current canon sub-groups (7 thematic groups)
  'M0-START': Rocket,      // Start Here
  'M0-SAFETY': LifeBuoy,   // Safety
  'M0-ETIQ': Handshake,    // Etiquette
  'M0-OCEAN': Waves,       // Ocean Knowledge
  'M0-EQUIP': Anchor,      // Equipment & Stance
  'M0-VALUES': Brain,      // Values & Mindset
  'M0-SESSION': Dumbbell,  // Session System
  'M0-SAFEOCEAN': LifeBuoy, // Safety & Ocean (grupo de presentación)
  'M0-EQUIPMIND': Anchor,   // Equipment & Mindset (grupo de presentación)
  'YB-FUND': Brain,         // Fundamentals · 3 Circles (Yellow)
  'YB-TOOLS': Dumbbell,     // Tools (Yellow)
  'BB-TOOLS': Dumbbell,     // Tools (Blue)
  // Yellow Belt onboarding sub-groups
  'YB-VALUE': Award,       // Belt Value
  'YB-FOUND': Brain,       // Foundations · Flow Language
  // Blue Belt onboarding sub-groups
  'BB-VALUE': Award,       // Belt Values (accumulated)
  'BB-INF': ArrowLeftRight, // The Infinite Circle
  // Legacy keys (kept for back-compat)
  '0.1': ScrollText,
  '0.2': Brain,
  '0.3': Waves,
  '0.4': Handshake,
  '0.5': LifeBuoy,
  '0.6': Dumbbell,
  '0.7': Eye,
  '0.8': DoorOpen,
};

// White Belt sequence icon map. Sequences are CUMULATIVE: each builds on
// all previous (canon doctrine).
const WB_SEQUENCE_ICON: Record<string, LucideIcon> = {
  'WB-SEQ-1': Anchor,         // Board Control
  'WB-SEQ-2': Waves,          // Sweet Spot
  'WB-SEQ-3': Rocket,         // Pop-Up
  'WB-SEQ-4': ArrowLeftRight, // Directional Turns
  'WB-SEQ-5': Award,          // Independence
  'YB-SEQ-8': Trophy,         // Integration & Certification (Yellow tail)
};

// Cumulative steps mastered after completing each sequence (canon)


const WB_SEQUENCE_CUMULATIVE: Record<string, number> = {
  'WB-SEQ-1': 9,
  'WB-SEQ-2': 14,
  'WB-SEQ-3': 20,
  'WB-SEQ-4': 22,
  'WB-SEQ-5': 25,
};

export function CourseTab({ data }: { data: CourseData }) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [intros, setIntros] = useState<Record<string, SectionIntro>>({});
  useEffect(() => { getSectionIntros().then(setIntros).catch(() => {}); }, []);

  // Deep-link a una lección: ?tab=course&lesson=PC-PRE-10. Lo usa el enlace
  // del Home bajo Training / Free Surf — sin esto el link abría el curso pero
  // dejaba al alumno buscando la clase a mano.
  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get('lesson');
      if (id) { setOpenLessonId(id); return; }
      // Remount por refresh (marcar leída, cambiar de curso…): la lección
      // que estaba abierta vuelve a abrirse sola.
      const restored = loadPortalState(data.portalToken);
      if (restored?.lesson) setOpenLessonId(restored.lesson);
    } catch { /* sin deep link */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { savePortalState(data.portalToken, { lesson: openLessonId }); }, [openLessonId, data.portalToken]);

  // Access gate
  if (!data.hasAccess) {
    return (
      <div className="text-center py-16 px-6">
        <Lock className="mx-auto mb-4 text-[var(--tss-cyan)]" size={56} strokeWidth={1.5} />
        <h2 className="text-xl font-bold mb-2">Course Access Required</h2>
        <p className="text-gray-600 mb-6">
          The Surf Sequence White Belt Masterclass is a paid course. Reach out to your coach to get access.
        </p>
        <p className="text-sm text-gray-400">
          Once you have an access code, your coach will activate the course on your account.
        </p>
      </div>
    );
  }

  // If a lesson is open, show the lesson viewer
  if (openLessonId) {
    return (
      <LessonViewer
        lessonId={openLessonId}
        portalToken={data.portalToken}
        onBack={() => setOpenLessonId(null)}
        onOpenLesson={(id) => setOpenLessonId(id)}
      />
    );
  }

  // The pre-course is shared across every belt course; the rest is scoped
  // to whichever course the student selected in CourseSwitcher.
  const activeCourse =
    COURSES.find((c) => c.key === data.activeCourseKey) ?? COURSES[0];
  // WB/YB/BB courses are [onboarding, belt]; Purple/Brown/Black have a single
  // belt section (no onboarding). Belt is always the last section; onboarding
  // only exists when there are two.
  const beltSection =
    activeCourse.lessonSections[activeCourse.lessonSections.length - 1];
  const onboardingSection =
    activeCourse.lessonSections.length > 1
      ? activeCourse.lessonSections[0]
      : undefined;

  const preCourseLessons = data.lessons.filter((l) =>
    (SHARED_PRE_COURSE_SECTIONS as readonly string[]).includes(l.course_section)
  );
  const onboardingLessons = data.lessons.filter(
    (l) => l.course_section === onboardingSection
  );
  const beltLessons = data.lessons.filter(
    (l) => l.course_section === beltSection
  );
  // Lessons belonging to an earlier course (e.g. wb_onboarding when on YB).
  // Surfaced as a "Prerequisites from White Belt" block so the YB student
  // who already finished WB sees them ✓ Completed, and a YB-direct student
  // can complete them on the spot.
  const sharedOnboardingLessons = data.lessons.filter((l) =>
    activeCourse.sharedLessonSections.includes(l.course_section),
  );

  // Group Pre-Course by pc_section_id (canon v1 uses M0 for all 8)
  const pcSectionsRaw = groupByPcSection(preCourseLessons);
  // Pre-Course en CUATRO grupos (Marcelo 2026-09-10): ocho seguidos se leían
  // como lista de tareas. Es solo presentación; la base no cambia.
  const PRE_GROUPS: { id: string; name: string; members: string[] }[] = [
    { id: 'M0-START', name: 'Start Here', members: ['M0-START'] },
    { id: 'M0-SAFEOCEAN', name: 'Safety & Ocean', members: ['M0-SAFETY', 'M0-OSE', 'M0-ETIQ', 'M0-OCEAN'] },
    { id: 'M0-EQUIPMIND', name: 'Equipment & Mindset', members: ['M0-EQUIP', 'M0-VALUES'] },
    { id: 'M0-SESSION', name: 'Session System · venue read + warm-up, every level', members: ['M0-SESSION'] },
  ];
  const preCovered = new Set(PRE_GROUPS.flatMap((g) => g.members));
  const pcSections = [
    ...PRE_GROUPS.map((g, i) => ({ id: g.id, name: g.name, order: i, lessons: pcSectionsRaw.filter((s) => g.members.includes(s.id)).flatMap((s) => s.lessons) })).filter((g) => g.lessons.length > 0),
    ...pcSectionsRaw.filter((s) => !preCovered.has(s.id)),
  ];

  // Onboarding: when every lesson carries a pc_section_id (e.g. Yellow Belt's
  // Belt Value + Foundations), render as thematic sub-groups. Otherwise fall
  // back to a single legacy block (White has none, Blue's value has none).
  const onboardingGroups =
    onboardingLessons.length > 0 && onboardingLessons.every((l) => l.pc_section_id)
      ? groupByPcSection(onboardingLessons)
      : null;
  // Blue (Marcelo 2026-09-09): The Infinite Circle (the LOOP) va después de
  // los tres círculos y antes de las secuencias, no dentro de "Start Here".
  const loopGroup = activeCourse.key === 'blue_belt' ? onboardingGroups?.find((g) => g.id === 'BB-INF') ?? null : null;
  const startHereGroups = loopGroup ? onboardingGroups!.filter((g) => g.id !== 'BB-INF') : onboardingGroups;

  // Learning Blocks — la estructura del método, la misma que ve el coach al
  // evaluar. Antes esto se agrupaba por wb_sequence_id, que era un tercer
  // agrupamiento distinto del de la evaluación y del de las secuencias reales.
  // Qué secciones puede abrir realmente este alumno con el curso que compró.
  const openableSections = new Set<string>([
    ...(SHARED_PRE_COURSE_SECTIONS as readonly string[]),
    ...activeCourse.lessonSections,
    ...activeCourse.sharedLessonSections,
  ]);

  // Nombre legible de la cinta de la que viene un paso prestado.
  const BELT_OF_SECTION: Record<string, string> = {
    white_belt: 'White Belt',
    yellow_belt: 'Yellow Belt',
    blue_belt: 'Blue Belt',
    purple_belt: 'Purple Belt',
  };

  // Índice de TODAS las lecciones del alumno por su llave estable. Lo usan
  // tanto las secuencias de Blue como las secuencias completadas con pasos
  // prestados de otra cinta.
  const lessonByKey = new Map<string, LessonRow>();
  for (const l of data.lessons) lessonByKey.set(stepKey(l.course_section, l.step_number), l);
  const lessonById = new Map<string, LessonRow>();
  for (const l of data.lessons) lessonById.set(l.id, l);

  // Un paso prestado de una cinta anterior se abre igual: es parte de este
  // curso, y para eso se trajo. El progreso se guarda por lección, así que
  // si ya lo estudió en su cinta viene marcado. La etiqueta dice de dónde viene.
  const resolveSteps = (keys: string[]): LessonRow[] =>
    keys
      .map((k) => (k.startsWith('id:') ? lessonById.get(k.slice(3)) : lessonByKey.get(k)))
      .filter((l): l is LessonRow => Boolean(l))
      .map((l) => {
        const borrowed = !openableSections.has(l.course_section);
        if (!borrowed) return l;
        return { ...l, locked: false, lockReason: null, borrowedFrom: BELT_OF_SECTION[l.course_section] ?? null };
      });

  // TOOLS (Marcelo 2026-09-10): técnicas únicas que sirven en toda cinta —
  // Forward Momentum (la misma lección de White) y Duck Dive. Viven una vez y
  // aparecen en Yellow y Blue apuntando a la misma lección.
  const toolsLessons = resolveSteps(['id:STP-019', 'id:YB-FND-03']);
  type StartGroup = { id: string; name: string; order: number; lessons: LessonRow[] };
  let startGroups: StartGroup[] | null = startHereGroups;
  if (activeCourse.key === 'yellow_belt' && startHereGroups) {
    const value = startHereGroups.find((g) => g.id === 'YB-VALUE');
    const circles = (startHereGroups.find((g) => g.id === 'YB-FOUND')?.lessons ?? []).filter((l) => l.id === THREE_CIRCLES_LESSON_ID);
    startGroups = [
      value ? { ...value, name: 'Belt Value' } : null,
      circles.length ? { id: 'YB-FUND', name: 'Fundamentals · The 3 Circles of Power', order: 2, lessons: circles } : null,
      toolsLessons.length ? { id: 'YB-TOOLS', name: 'Tools · techniques you use at every belt', order: 3, lessons: toolsLessons } : null,
    ].filter((g): g is StartGroup => !!g);
  }
  if (activeCourse.key === 'blue_belt') {
    const value = startHereGroups?.find((g) => g.id === 'BB-VALUE');
    // Los valores se acumulan: el de Yellow viene con vos.
    const prior = resolveSteps(['id:YB-ONB-01']);
    startGroups = [
      value ? { ...value, name: 'Belt Values · what you bring with you', lessons: [...prior, ...value.lessons] } : null,
      toolsLessons.length ? { id: 'BB-TOOLS', name: 'Tools · techniques you use at every belt', order: 2, lessons: toolsLessons } : null,
    ].filter((g): g is StartGroup => !!g);
  }

  // Prólogo de Blue (Marcelo 2026-09-09): el camino del agua antes de los
  // tres círculos — Navigate the Ocean · Catch Waves · Pick Your Line + Pop-Up.
  const bluePrelude =
    activeCourse.key === 'blue_belt'
      ? BLUE_COURSE_PRELUDE.map((g) => ({ ...g, lessons: resolveSteps(g.steps) })).filter((g) => g.lessons.length > 0)
      : [];

  // Blue muestra arriba el mapa de bloques y la clase de los tres círculos,
  // pero sus secuencias van en el MISMO formato que White y Yellow: un
  // acordeón por secuencia con la habilidad que construye, que al abrirlo
  // despliega todos sus pasos, completos de principio a fin.
  const beltUsesBlocks = activeCourse.key === 'blue_belt' && isMappedToBlocks(beltLessons);
  const beltSequences = groupByWbSequence(beltLessons).map((g) => ({
        id: g.id,
        name: g.name,
        order: g.order,
        block: null as number | null,
        subtitle: g.lessons[0]?.wb_sequence_promise || '',
        // Algunas secuencias se completan con pasos prestados de una cinta
        // anterior: la tabla deja a cada paso en una sola secuencia, así que
        // el orden completo vive en COURSE_SEQUENCE_ORDER y se arma acá.
        // Nada se toca en la base — la cinta de origen queda igual.
        lessons: COURSE_SEQUENCE_ORDER[g.id]
          ? COURSE_SEQUENCE_ORDER[g.id]
              .map((k) => lessonByKey.get(k))
              .filter((l): l is LessonRow => Boolean(l))
              .map((l) => {
                // Un paso prestado de una cinta anterior se abre igual: es
                // parte de esta secuencia, y para eso se trajo. Si el alumno
                // ya lo estudió en su cinta, `completed` ya viene marcado —
                // el progreso se guarda por lección, no por curso. La
                // etiqueta dice de dónde viene, así se ve que es nuevo acá
                // pero que ya se vio atrás.
                const borrowed = !openableSections.has(l.course_section);
                if (!borrowed) return l;
                return {
                  ...l,
                  locked: false,
                  lockReason: null,
                  borrowedFrom: BELT_OF_SECTION[l.course_section] ?? null,
                };
              })
          : g.lessons,
      }));

  // Las seis secuencias, completas. Un paso de la secuencia puede vivir en una
  // cinta anterior (la postura es White Belt), así que se resuelven contra
  // TODAS las lecciones del alumno, no solo las de su cinta actual — por eso
  // antes "Frontside Snap" se veía sin su inicio.

  // La clase de los tres círculos ya existe (YB-FND-01, en yb_onboarding, que
  // el curso de Blue ya incluye entre sus secciones compartidas).
  const threeCirclesLesson =
    activeCourse.key === 'blue_belt'
      ? data.lessons.find((l) => l.id === THREE_CIRCLES_LESSON_ID) ?? null
      : null;

  // Siguiente paso = la primera secuencia de la cinta con algún paso sin completar.
  const nextSeqGroup = beltSequences.find((g) => g.lessons.some((l) => !l.completed)) ?? null;
  const nextSeq = nextSeqGroup
    ? {
        prefix: sequencePrefix(nextSeqGroup.id, nextSeqGroup.order),
        name: nextSeqGroup.name,
        subtitle: nextSeqGroup.subtitle || null,
        href: sequencePageFor(nextSeqGroup.id) ? `/portal/${data.portalToken}/seq/${nextSeqGroup.id}` : null,
      }
    : null;
  const beltIndex = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'].indexOf(activeCourse.key);

  const beltLabelShort =
    activeCourse.key === 'yellow_belt' ? 'Yellow Belt'
    : activeCourse.key === 'blue_belt' ? 'Blue Belt'
    : activeCourse.key === 'purple_belt' ? 'Purple Belt'
    : activeCourse.key === 'brown_belt' ? 'Brown Belt'
    : activeCourse.key === 'black_belt' ? 'Black Belt'
    : 'White Belt';

  // Color themes: Pre-Course is its own (teal); the rest follow the active belt.
  const preTheme = BELT_THEMES.pre;
  const whiteTheme = BELT_THEMES.white;
  const beltTheme = BELT_THEMES[beltLevelForCourse(activeCourse.key)];

  const overallPercent =
    data.totalLessons > 0
      ? Math.round((data.totalCompleted / data.totalLessons) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Course switcher — only renders when student owns 2+ courses */}
      <CourseSwitcher
        portalToken={data.portalToken}
        ownedCourses={data.ownedCourses}
        activeCourseKey={data.activeCourseKey}
      />

      {/* Header — v10 (Marcelo 2026-09-11: "más pro, más limpio, que no se vea
          genérico"): sin tarjeta, la tipografía hace el trabajo. Archivo
          Expanded en el título, Plex Mono en etiquetas, Lora SOLO en el tagline,
          cyan como acento y nunca como fondo. */}
      <div className="px-2 pt-2 pb-4 text-white" style={{ borderBottom: '1px solid rgba(247,249,250,.10)' }}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10.5px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#00D2FF' }}>{beltLabelShort} · {({ white_belt: 'Beginner', yellow_belt: 'Novice', blue_belt: 'Foundation', purple_belt: 'Emerging', brown_belt: 'Pre-Elite', black_belt: 'Elite' } as Record<string, string>)[activeCourse.key] ?? ''}</span>
          <span className="text-[10.5px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(247,249,250,.40)' }}>{data.studentName}</span>
        </div>
        {/* El logo oficial (lockup con el tagline adentro), no el nombre en texto
            (Marcelo 2026-09-11: "quizás que sea el logo original"). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/web/img/brand/lockup-wave-white.png" alt="The Surf Sequence — Evolve through play" className="mt-4 h-14 w-auto object-contain object-left" />
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(247,249,250,.10)' }}>
            <div className="h-full transition-all duration-500" style={{ width: `${overallPercent}%`, background: '#00D2FF' }} />
          </div>
          <span className="text-[11px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: 'rgba(247,249,250,.62)' }}>{data.totalCompleted} / {data.totalLessons} · {overallPercent}%</span>
        </div>
        <p className="text-[12px] mt-2" style={{ color: 'rgba(247,249,250,.55)' }}>Think it here. Feel it in the drills. Do it in the water with your coach.</p>
      </div>

      {/* NEXT STEP — el único bloque con fondo claro (arena del manual): la
          primera secuencia de la cinta que no está completa. Marcelo
          2026-09-11: "darle más importancia a los títulos que merecen la
          atención" y los colores del sitio (ink · arena · cyan). */}
      {nextSeq && (
        <div className="mx-2 mt-4 p-5" style={{ background: '#E9E2D2', borderLeft: '4px solid #00D2FF' }}>
          <p className="text-[10.5px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#005F79' }}>Next step</p>
          <h3 className="mt-2 text-[22px] leading-[1.05] uppercase" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, letterSpacing: '-0.02em', color: '#061C2B' }}>
            {nextSeq.prefix ? `${nextSeq.prefix} · ` : ''}{nextSeq.name}
          </h3>
          {nextSeq.subtitle && <p className="mt-1.5 text-[13.5px] leading-snug" style={{ color: '#3E4A50' }}>{nextSeq.subtitle}</p>}
          <div className="flex flex-wrap gap-2 mt-4">
            {nextSeq.href ? (
              <a href={nextSeq.href} className="inline-block px-5 py-3 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', background: '#061C2B', color: '#F7F9FA' }}>Open</a>
            ) : null}
            <a href={`/portal/${data.portalToken}?tab=sequence`} className="inline-block px-5 py-3 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', border: '1px solid #061C2B', color: '#061C2B' }}>Let&apos;s Play</a>
          </div>
        </div>
      )}
      {/* Las seis cintas: hasta la tuya en color pleno, el resto apagadas. */}
      <div className="mx-2 mt-4 flex gap-1">
        {(['#E8ECEF', '#F5C518', '#1E9BE0', '#7B4FBE', '#7D4E27', '#0F1A22'] as const).map((c, i) => (
          <i key={c} className="flex-1 h-1.5 rounded-sm" style={{ background: c, opacity: i <= beltIndex ? 1 : 0.25, boxShadow: c === '#0F1A22' ? 'inset 0 0 0 1px rgba(247,249,250,.25)' : undefined }} />
        ))}
      </div>

      {/* PRE-COURSE — 8 sections */}
      {pcSections.length > 0 && (
        <div className="space-y-3">
          <GroupHeader
            theme={preTheme}
            eyebrow={`${pcSections.length} sections · ${preCourseLessons.length} units`}
            title="Pre-Course"
            subtitle="Doctrinal foundations every student must know before entering the water"
            videoUrl={intros['pre_course']?.video_url}
          />

          {pcSections.map((section) => (
            <SectionBlock
              key={section.id}
              title={section.name}
              subtitle={null}
              Icon={PC_SECTION_ICON[section.id] || BookOpen}
              badge={null}
              lessons={section.lessons}
              onOpenLesson={(id) => setOpenLessonId(id)}
              theme={preTheme}
            />
          ))}
        </div>
      )}

      {/* SHARED ONBOARDING (e.g. WB onboarding shown to YB students) */}
      {sharedOnboardingLessons.length > 0 && activeCourse.key !== 'blue_belt' && (
        <div className="space-y-3 pt-2">
          <GroupHeader
            theme={whiteTheme}
            eyebrow="Carried over · already done if you came up through the belts"
            title="From your previous belts"
            subtitle="Foundations and values from earlier belts (the 3 Circles of Agency, Momentum, and belt values). If you already completed them they're ✓ Completed; if you came in direct you can do them here — they're prerequisites."
          />

          <SectionBlock
            title="Foundations & values (carried over)"
            subtitle="Prerequisites from your earlier belts"
            Icon={Compass}
            badge="Prereqs"
            lessons={sharedOnboardingLessons.sort(
              (a, b) => (a.display_order || 0) - (b.display_order || 0)
            )}
            onOpenLesson={(id) => setOpenLessonId(id)}
            theme={whiteTheme}
          />
        </div>
      )}

      {/* ONBOARDING — Module 1, single block */}
      {onboardingLessons.length > 0 && (
        <div className="space-y-3 pt-2">
          <GroupHeader
            theme={beltTheme}
            eyebrow={`Before the sequences · ${onboardingLessons.length} items`}
            title={`${beltLabelShort} — Start Here`}
            subtitle="What you'll learn, the belt value, and the flow language before you paddle out."
            videoUrl={onboardingSection ? intros[onboardingSection]?.video_url : undefined}
          />

          {startGroups ? (
            startGroups.map((section) => (
              <SectionBlock
                key={section.id}
                title={section.name}
                subtitle={null}
                Icon={PC_SECTION_ICON[section.id] || Compass}
                badge={null}
                lessons={section.lessons}
                onOpenLesson={(id) => setOpenLessonId(id)}
                theme={beltTheme}
                onePageHref={section.id === 'YB-FUND' ? `/portal/${data.portalToken}/circles` : null}
              />
            ))
          ) : (
            <SectionBlock
              title={`${beltLabelShort} Onboarding`}
              subtitle="Bridge between awareness (Pre-Course) and action (Sequences)"
              Icon={Compass}
              badge="Module 1"
              lessons={onboardingLessons.sort(
                (a, b) => (a.display_order || 0) - (b.display_order || 0)
              )}
              onOpenLesson={(id) => setOpenLessonId(id)}
              theme={beltTheme}
            />
          )}
        </div>
      )}

      {/* La clase de los fundamentos, antes de las secuencias. */}
      {threeCirclesLesson && (
        <div className="space-y-3 pt-2">
          <GroupHeader
            theme={beltTheme}
            eyebrow="The fundamentals · body · board · wave"
            title="The Three Circles of Power"
            subtitle="Where the three overlap, you get flow. This is the language everything after the pop-up is built on."
            videoUrl={null}
          />
          <SectionBlock
            title="The Three Circles of Power"
            subtitle="Body · board · wave — understand it and feel it on land. The language starts here."
            Icon={Compass}
            badge={null}
            lessons={[threeCirclesLesson]}
            onOpenLesson={(id) => setOpenLessonId(id)}
            theme={beltTheme}
            onePageHref={`/portal/${data.portalToken}/circles`}
          />
        </div>
      )}

      {/* The Infinite Circle (the LOOP) — después de los tres círculos. */}
      {loopGroup && (
        <div className="space-y-3 pt-2">
          <GroupHeader
            theme={beltTheme}
            eyebrow="The loop · every sequence starts and ends in posture"
            title="The Infinite Circle"
            subtitle="The language of the sequences that follow: posture → rail → projection → maneuver → back to posture."
            videoUrl={null}
          />
          <SectionBlock
            title={loopGroup.name}
            subtitle="Frontside and backside, step by step, with the colour of every action."
            Icon={PC_SECTION_ICON['BB-INF'] || Compass}
            badge={null}
            lessons={loopGroup.lessons}
            onOpenLesson={(id) => setOpenLessonId(id)}
            theme={beltTheme}
            onePageHref={`/portal/${data.portalToken}/loop`}
          />
        </div>
      )}

      {/* PRÓLOGO DE BLUE — el camino del agua, con pasos de White y Yellow. */}
      {bluePrelude.length > 0 && (
        <div className="space-y-3 pt-2">
          <GroupHeader
            theme={beltTheme}
            eyebrow={`${bluePrelude.length} groups · from the water up`}
            title="Getting to the wave"
            subtitle="Out the back, catch the wave, pick the line, stand up. The same steps you learned before, in the order Blue Belt uses them."
            videoUrl={null}
          />
          {bluePrelude.map((g) => (
            <SectionBlock
              key={g.id}
              title={g.name}
              subtitle={g.promise}
              Icon={WB_SEQUENCE_ICON[g.id] || BookOpen}
              badge={null}
              lessons={g.lessons}
              onOpenLesson={(id) => setOpenLessonId(id)}
              theme={beltTheme}
              onePageHref={sequencePageFor(g.id) ? `/portal/${data.portalToken}/seq/${g.id}` : null}
            />
          ))}
        </div>
      )}

      {/* BELT — cumulative sequences */}
      {beltSequences.length > 0 && (
        <div className="space-y-3 pt-2">

          <GroupHeader
            theme={beltTheme}
            eyebrow={`${beltSequences.length} sequences · cumulative`}
            title={beltLabelShort}
            subtitle="Cumulative — each sequence builds on all previous."
            videoUrl={intros[beltSection]?.video_url}
          />

          {beltSequences.map((group) => (
            <SectionBlock
              key={group.id}
              title={
                // "Sequence #3: Pop-Up" · pero "Foundation: The 17 Elements",
                // no "Sequence Foundation: …" — la palabra Sequence solo va
                // delante de un número.
                (() => {
                  const p = sequencePrefix(group.id, group.order);
                  if (!p) return group.name;
                  return p.startsWith('#')
                    ? `Sequence ${p}: ${group.name}`
                    : `${p}: ${group.name}`;
                })()
              }
              subtitle={group.subtitle}
              Icon={WB_SEQUENCE_ICON[group.id] || BookOpen}
              badge={
                WB_SEQUENCE_CUMULATIVE[group.id]
                  ? `${WB_SEQUENCE_CUMULATIVE[group.id]}/25 cumulative`
                  : null
              }
              lessons={group.lessons}
              onOpenLesson={(id) => setOpenLessonId(id)}
              theme={beltTheme}
              onePageHref={sequencePageFor(group.id) ? `/portal/${data.portalToken}/seq/${group.id}` : null}
            />
          ))}
        </div>
      )}

      {/* Empty-state — a course whose belt content isn't published yet. Better
          than a blank section: tell the student it's coming. */}
      {beltSequences.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center">
          <p className="text-sm font-semibold text-[var(--tss-navy)]">{beltLabelShort} content is coming soon</p>
          <p className="text-xs text-gray-500 mt-1">
            The lessons for this belt are being finalized. Your Pre-Course and earlier belts stay available above.
          </p>
        </div>
      )}

      {/* Final quiz — theory exit test. Policy 2026-07-12: studying is free
          (no locked lessons), but ADVANCING requires completing EVERY lesson
          of the course — pre-course (safety included), onboarding, and the
          belt content — before this exam unlocks. Owners bypass for review. */}
      <CourseFinalQuiz
        courseKey={data.activeCourseKey}
        portalToken={data.portalToken}
        label={beltLabelShort}
        locked={
          !data.isOwner &&
          ![...preCourseLessons, ...sharedOnboardingLessons, ...onboardingLessons, ...beltLessons].every(
            (l) => l.completed || l.status_v1 === 'PROPOSED',
          )
        }
      />

      {/* Footer */}
      {data.totalCompleted === data.totalLessons && data.totalLessons > 0 && (
        <div className="rounded-xl p-5 text-center" style={{ background: '#F7F9FA', border: '1.5px solid #00D2FF' }}>
          <Trophy className="mx-auto mb-2 text-[var(--tss-cyan)]" size={36} strokeWidth={1.75} />
          <h3 className="font-bold text-lg text-[var(--tss-navy)] mb-1">{beltLabelShort} Course Complete!</h3>
          <p className="text-sm text-[var(--tss-navy)]/70">
            You finished the theoretical {beltLabelShort} course. Talk to your coach to schedule your in-person evaluation.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ───

function groupByPcSection(lessons: LessonRow[]) {
  const map = new Map<
    string,
    { id: string; name: string; order: number; lessons: LessonRow[] }
  >();
  for (const l of lessons) {
    const id = l.pc_section_id || 'unknown';
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: l.pc_section_name || id,
        order: l.pc_section_order || 99,
        lessons: [],
      });
    }
    map.get(id)!.lessons.push(l);
  }
  return Array.from(map.values())
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      ...s,
      lessons: s.lessons.sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      ),
    }));
}

// Agrupamiento anterior por wb_sequence_id. Sigue vivo como fallback para las
// cintas que todavía no están mapeadas a Learning Blocks (purple/brown/black).
function groupByWbSequence(lessons: LessonRow[]) {
  const map = new Map<
    string,
    { id: string; name: string; order: number; lessons: LessonRow[] }
  >();
  for (const l of lessons) {
    const id = l.wb_sequence_id || 'unassigned';
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: l.wb_sequence_name || id,
        order: l.wb_sequence_order || 99,
        lessons: [],
      });
    }
    map.get(id)!.lessons.push(l);
  }
  return Array.from(map.values())
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      ...c,
      lessons: c.lessons.sort(
        (a, b) =>
          (a.sequence_step_order || a.display_order || 0) -
          (b.sequence_step_order || b.display_order || 0)
      ),
    }));
}

function beltLevelForCourse(key: CourseKey): BeltLevel {
  return key === 'yellow_belt' ? 'yellow'
    : key === 'blue_belt' ? 'blue'
    : key === 'purple_belt' ? 'purple'
    : key === 'brown_belt' ? 'brown'
    : key === 'black_belt' ? 'black'
    : 'white';
}

// ─── Group Header (reads on the dark student dashboard) ───
// Belt-colored rings + eyebrow + left accent, soft-gray title.
function GroupHeader({
  theme,
  eyebrow,
  title,
  subtitle,
  videoUrl,
}: {
  theme: BeltTheme;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  videoUrl?: string | null;
}) {
  const embed = videoUrl ? toEmbedUrl(videoUrl) : null;
  return (
    <div className="px-2 pt-5">
      <div>
        <div className="flex items-baseline justify-between gap-3 pb-2" style={{ borderBottom: `2px solid ${theme.accent}` }}>
          <h3 className="text-[15px] text-white uppercase leading-tight" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h3>
          {eyebrow && <span className="text-[10px] shrink-0" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(247,249,250,.40)' }}>{eyebrow}</span>}
        </div>
        {subtitle && <p className="text-[12px] mt-2" style={{ color: 'rgba(247,249,250,.55)' }}>{subtitle}</p>}
        {embed && (
          <div className="bg-black aspect-video mt-3 rounded-lg overflow-hidden">
            <iframe
              src={embed}
              title={`${title} intro`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section/Chapter Block ───

function SectionBlock({
  title,
  subtitle,
  Icon,
  badge,
  lessons,
  onOpenLesson,
  theme,
  onePageHref,
}: {
  title: string;
  subtitle: string | null;
  Icon: LucideIcon;
  badge: string | null;
  lessons: LessonRow[];
  onOpenLesson: (id: string) => void;
  theme?: BeltTheme;
  /** Piloto 2026-09-09: la secuencia como UNA página (Think · Feel · Do · Review). */
  onePageHref?: string | null;
}) {
  // Only count PRODUCTIZED items toward progress (PROPOSED can't be completed)
  const productized = lessons.filter((l) => l.status_v1 !== 'PROPOSED');
  const completed = productized.filter((l) => l.completed).length;
  const sectionPercent =
    productized.length > 0 ? Math.round((completed / productized.length) * 100) : 0;
  const proposedCount = lessons.length - productized.length;

  // Piloto 2026-09-09 (Marcelo): si la secuencia tiene su página de cuatro
  // pestañas, el clic la abre directo. Las lecciones viven adentro (Think it).
  if (onePageHref) {
    return (
      <a
        href={onePageHref}
        className="block mx-2"
        style={{ borderBottom: '1px solid rgba(247,249,250,.10)' }}
      >
        <div className="py-3.5 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[14.5px] font-medium text-white truncate">{title}</p>
            <p className="text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(247,249,250,.40)' }}>{onePageHref.endsWith('/loop') || onePageHref.endsWith('/circles') ? 'Open' : 'Think · Feel · Do · Review'}</p>
          </div>
          <span className="text-[11px] shrink-0" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', letterSpacing: '0.08em', color: sectionPercent === 100 ? '#00D2FF' : 'rgba(247,249,250,.62)' }}>
            {sectionPercent === 100 ? '✓ Done' : `${completed}/${productized.length}`}
          </span>
          <span className="text-[15px]" style={{ color: '#00D2FF' }}>→</span>
        </div>
      </a>
    );
  }

  return (
    <details
      className="group mx-2"
      style={{ borderBottom: '1px solid rgba(247,249,250,.10)' }}
    >
      <summary className="py-3.5 cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[14.5px] font-medium text-white truncate">
              {title}
              {badge && <span className="ml-2 text-[10px] text-white/50" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}>{badge}</span>}
            </p>
            {subtitle && <p className="text-[10.5px] mt-0.5 truncate" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(247,249,250,.40)' }}>{subtitle}</p>}
          </div>
          <span className="text-[11px] shrink-0" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', letterSpacing: '0.08em', color: sectionPercent === 100 ? '#00D2FF' : 'rgba(247,249,250,.62)' }}>
            {sectionPercent === 100 ? '✓ Done' : `${completed}/${productized.length}`}{proposedCount > 0 && <span className="text-white/40"> +{proposedCount}</span>}
          </span>
          <ChevronDown size={16} className="text-white/40 transition-transform group-open:rotate-180 shrink-0" />
        </div>
      </summary>
      <div className="divide-y divide-white/5 border-t border-white/10 mb-2 rounded-lg" style={{ background: '#0A2A3A' }}>
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onOpen={() => onOpenLesson(lesson.id)} />
        ))}
      </div>
    </details>
  );
}

// ─── Lesson Card ───

function LessonCard({ lesson, onOpen }: { lesson: LessonRow; onOpen: () => void }) {
  const isProposed = lesson.status_v1 === 'PROPOSED';
  const isLocked = lesson.locked && !lesson.completed && !isProposed;
  const isCompleted = lesson.completed;
  const isInProgress =
    lesson.progress &&
    !lesson.completed &&
    (lesson.progress.video_watched ||
      lesson.progress.content_read ||
      lesson.progress.quiz_attempts > 0);

  let StatusIcon: LucideIcon = Unlock;
  let statusText = 'Start';
  let statusColor = 'text-white/50';

  if (isProposed) {
    StatusIcon = Hourglass;
    statusText = 'v1.5';
    statusColor = 'text-white/60';
  } else if (isLocked) {
    StatusIcon = Lock;
    statusText = 'Locked';
    statusColor = 'text-white/40';
  } else if (isCompleted) {
    StatusIcon = CheckCircle2;
    statusText = 'Completed';
    statusColor = 'text-[#00D2FF]';
  } else if (isInProgress) {
    StatusIcon = PlayCircle;
    statusText = 'Continue';
    statusColor = 'text-[var(--tss-cyan)]';
  }

  // Step number badge: PC-015 → 015, STP-001 → 001, PRWB-001 → R-1
  const idParts = lesson.id.split('-');
  const badgeNum = lesson.id.startsWith('PRWB-')
    ? `R-${parseInt(idParts[1], 10)}`
    : idParts[idParts.length - 1];

  return (
    <button
      onClick={isLocked ? undefined : onOpen}
      disabled={isLocked}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
      } ${isProposed ? 'bg-white/5' : ''}`}
    >
      {/* Step number badge */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${
          isProposed
            ? 'bg-white/5 text-white/50 border border-white/30 border-dashed'
            : isCompleted
            ? 'bg-[#00D2FF] text-[#061C2B]'
            : isInProgress
            ? 'bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/60'
            : lesson.is_test
            ? 'bg-white/10 text-[#00D2FF] border border-[#00D2FF]/40'
            : 'bg-white/10 text-white/60'
        }`}
      >
        {badgeNum}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate text-white">{lesson.title}</span>
          {isProposed && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-bold uppercase tracking-wide flex-shrink-0">
              Coming v1.5
            </span>
          )}
          {lesson.is_test && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] font-bold uppercase tracking-wide flex-shrink-0">
              Gate Test
            </span>
          )}
          {/* Paso traído de una cinta anterior para completar esta secuencia.
              Si ya lo estudió allá, además aparece ✓ Completed. */}
          {lesson.borrowedFrom && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-bold uppercase tracking-wide flex-shrink-0">
              From {lesson.borrowedFrom}
            </span>
          )}
        </div>
        <div className="text-[11px] text-white/50 flex items-center gap-2 mt-0.5">
          {lesson.pillar && !isProposed && (
            <span className="truncate">{lesson.pillar}</span>
          )}
          {!isProposed && lesson.lesson_type !== 'reading' && (
            <>
              {lesson.pillar && <span>·</span>}
              <span className="font-medium text-[var(--tss-cyan)]">
                {lesson.lesson_type === 'form' ? 'Goal Setting' : 'Self Test'}
              </span>
            </>
          )}
          {isProposed && (
            <span className="italic text-white/50">
              Canonical content coming in v1.5
            </span>
          )}
        </div>
        {isLocked && lesson.lockReason && (
          <div className="text-[10px] text-white/40 mt-1 italic">{lesson.lockReason}</div>
        )}
      </div>

      {/* Status indicator */}
      <div className={`text-[10px] font-medium flex flex-col items-center gap-0.5 ${statusColor}`}>
        <StatusIcon size={18} strokeWidth={1.75} />
        <span>{statusText}</span>
      </div>
    </button>
  );
}
