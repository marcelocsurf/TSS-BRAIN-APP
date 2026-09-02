'use client';

import { useState, useEffect } from 'react';
import { LessonViewer } from './LessonViewer';
import { CourseFinalQuiz } from './CourseFinalQuiz';
import { getSectionIntros, type SectionIntro } from '@/lib/actions/section-intros';
import { toEmbedUrl } from '@/lib/utils/video-embed';
import { CourseSwitcher } from './CourseSwitcher';
import { COURSES, SHARED_PRE_COURSE_SECTIONS, type CourseKey } from '@/lib/constants/courses';
import { BELT_THEMES, type BeltLevel, type BeltTheme } from '@/lib/constants/belt-theme';
import {
  groupByBlocks,
  isMappedToBlocks,
  stepKey,
  PRIOR_PATH_BLOCKS,
  THREE_CIRCLES_LESSON_ID,
  COURSE_SEQUENCE_ORDER,
  COURSE_SEQUENCE_STAGE,
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
  'M0-SESSION': Dumbbell,  // Session Basics
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
      if (id) setOpenLessonId(id);
    } catch { /* sin deep link */ }
  }, []);

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
  const pcSections = groupByPcSection(preCourseLessons);

  // Onboarding: when every lesson carries a pc_section_id (e.g. Yellow Belt's
  // Belt Value + Foundations), render as thematic sub-groups. Otherwise fall
  // back to a single legacy block (White has none, Blue's value has none).
  const onboardingGroups =
    onboardingLessons.length > 0 && onboardingLessons.every((l) => l.pc_section_id)
      ? groupByPcSection(onboardingLessons)
      : null;

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

      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[var(--tss-navy-dark,#0a1628)] text-white rounded-xl p-5 shadow-lg">
        {/* The Surf Sequence logo — prominent on the course screen */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tss-logo-white.png?v=2"
          alt="The Surf Sequence"
          className="h-9 mb-3 object-contain"
        />
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">The Surf Sequence Method</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
            {overallPercent}% complete
          </span>
        </div>
        <p className="text-xs text-white/70 mb-3">
          Welcome, {data.studentName}. THINK it here, in the lessons. FEEL it in the drills. DO it in the missions.
        </p>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[var(--tss-gold,#d4a017)] transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-white/60 mt-2">
          {data.totalCompleted} of {data.totalLessons} lessons completed
        </p>
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
      {sharedOnboardingLessons.length > 0 && (
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

          {onboardingGroups ? (
            onboardingGroups.map((section) => (
              <SectionBlock
                key={section.id}
                title={section.name}
                subtitle={null}
                Icon={PC_SECTION_ICON[section.id] || Compass}
                badge={null}
                lessons={section.lessons}
                onOpenLesson={(id) => setOpenLessonId(id)}
                theme={beltTheme}
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

      {/* El recorrido que ya trae de White y Yellow. Solo el mapa: título y
          cuántos pasos. No hay lecciones adentro, así que no cuenta para el
          progreso ni para el examen final. */}
      {beltUsesBlocks && (
        <div className="rounded-xl border border-white/10 px-4 py-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            The road so far · from White and Yellow
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
            {PRIOR_PATH_BLOCKS.map((b) => (
              <span key={b.n} className="flex items-baseline gap-2 text-[12.5px] text-white/70">
                <span
                  className="font-mono text-[10px] shrink-0"
                  style={{ color: beltTheme.bright }}
                >
                  {b.n}
                </span>
                {b.en}
                <span className="font-mono text-[10px] text-white/35">{b.count}</span>
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-white/40">
            The Three Circles switch on after the pop-up. Everything before that is
            diagnosed with the Block System.
          </p>
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
            subtitle={threeCirclesLesson.subtitle}
            Icon={Compass}
            badge={null}
            lessons={[threeCirclesLesson]}
            onOpenLesson={(id) => setOpenLessonId(id)}
            theme={beltTheme}
          />
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
        <div className="bg-gradient-to-r from-cyan-50 to-sky-100 border border-cyan-300 rounded-xl p-5 text-center">
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
    <div className="px-2">
      <div
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{ background: '#0F1E33', borderLeft: `4px solid ${theme.accent}` }}
      >
        <div className="p-4">
          {eyebrow && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-block w-4 h-0.5" style={{ background: theme.bright }} />
              <span
                className="text-[10px] tracking-[0.14em] uppercase font-medium"
                style={{ color: theme.bright, fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', letterSpacing: '0.14em' }}
              >
                {eyebrow}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <ConcentricRings color={theme.bright} />
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          {subtitle && <p className="text-[11px] text-white/55 mt-1">{subtitle}</p>}
        </div>
        {embed && (
          <div className="bg-black aspect-video border-t border-white/10">
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
}: {
  title: string;
  subtitle: string | null;
  Icon: LucideIcon;
  badge: string | null;
  lessons: LessonRow[];
  onOpenLesson: (id: string) => void;
  theme?: BeltTheme;
}) {
  // Only count PRODUCTIZED items toward progress (PROPOSED can't be completed)
  const productized = lessons.filter((l) => l.status_v1 !== 'PROPOSED');
  const completed = productized.filter((l) => l.completed).length;
  const sectionPercent =
    productized.length > 0 ? Math.round((completed / productized.length) * 100) : 0;
  const proposedCount = lessons.length - productized.length;

  return (
    <details
      className="group rounded-xl overflow-hidden border border-white/10"
      style={{ background: '#0F1E33', borderLeft: theme ? `4px solid ${theme.accent}` : undefined }}
    >
      <summary className="px-4 py-3 cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm flex items-center gap-2 text-white">
              <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: theme ? theme.bright : 'var(--tss-cyan)' }} />
              <span className="truncate">{title}</span>
              {badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono flex-shrink-0">
                  {badge}
                </span>
              )}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-white/40 mt-0.5 italic">"{subtitle}"</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold" style={{ color: theme ? theme.bright : 'var(--tss-cyan)' }}>{sectionPercent}%</div>
              <div className="text-[10px] text-white/40">
                {completed}/{productized.length}
                {proposedCount > 0 && (<span className="text-amber-400"> +{proposedCount}↗</span>)}
              </div>
            </div>
            <ChevronDown size={16} className="text-white/40 transition-transform group-open:rotate-180" />
          </div>
        </div>
      </summary>
      <div className="divide-y divide-white/5 border-t border-white/10">
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
    statusColor = 'text-amber-300';
  } else if (isLocked) {
    StatusIcon = Lock;
    statusText = 'Locked';
    statusColor = 'text-white/40';
  } else if (isCompleted) {
    StatusIcon = CheckCircle2;
    statusText = 'Completed';
    statusColor = 'text-green-400';
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
      } ${isProposed ? 'bg-amber-500/10' : ''}`}
    >
      {/* Step number badge */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${
          isProposed
            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 border-dashed'
            : isCompleted
            ? 'bg-green-500/20 text-green-300'
            : isInProgress
            ? 'bg-amber-500/20 text-amber-300'
            : lesson.is_test
            ? 'bg-purple-500/20 text-purple-300'
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
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wide flex-shrink-0">
              Coming v1.5
            </span>
          )}
          {lesson.is_test && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase tracking-wide flex-shrink-0">
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
            <span className="italic text-amber-300">
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
