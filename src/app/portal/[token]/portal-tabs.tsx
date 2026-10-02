'use client';

import { THREE_CIRCLES_SEQUENCE_ID } from '@/lib/sequence-pages/three-circles';
import { FOCUS_LABELS } from '@/components/portal/close-pickers';
import { ExperienceSurveyForm } from '@/components/survey/ExperienceSurveyForm';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BRAND } from '@/lib/constants/brand';
import { resolveAcademyBranding } from '@/lib/branding';
import type { BeltLevel } from '@/lib/constants/belts';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { BELT_HIERARCHY, BELT_RANK } from '@/lib/constants/belts';
import { WARMUP_OPTIONS, MENTAL_HACK_OPTIONS, SELF_TRAINING_WARMUPS } from '@/lib/constants/brand';
import {
  MATERIAL_CATEGORY_LABELS,
  STUDENT_MATERIALS,
  type BeltMaterial,
} from '@/lib/constants/student-materials';
import { SurveyForm } from './survey-form';
import { SurveySectionHead, SurveyDone } from '@/components/survey/SurveyUi';
import { PROMOTION_COPY, LIGHT_BELTS } from '@/lib/constants/promotion-copy';
import { toElSalvadorDate, elSalvadorToday } from '@/lib/utils/tz';
import { CourseTab } from '@/components/course/CourseTab';

// Fecha de la sesión para las tarjetas de encuesta: usar la fecha REAL de la
// clase (camp_sessions.session_date) y no el created_at (hora UTC del cierre,
// que se corre un día para clases de la tarde). Fallback: created_at en hora SV.
function surveyDateLabel(sessionDate: string | null | undefined, createdAt: string | null | undefined): string {
  const d = sessionDate || toElSalvadorDate(createdAt) || createdAt || '';
  if (!d) return '';
  const iso = d.length <= 10 ? `${d}T00:00:00Z` : d;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
import { MySequenceTab, type TrainSequenceArgs } from '@/components/sequence/MySequenceTab';
import { sequencePageFor } from '@/lib/sequence-pages';
import { topicOpenFor } from '@/lib/sequence-pages/topics';
import { loadPortalState, savePortalState, touchPortalState, loadCustomInProgress, type CustomInProgress } from '@/lib/portal/portal-state';
import { discardSession, getOpenSession, type OpenSession } from '@/lib/actions/lets-play';
import { studentBack, withFrom, type StudentFrom } from '@/lib/nav/origin';
import { leaveTo } from '@/lib/nav/leave';
import { isGoofy } from '@/lib/stance';
import { LinkedTrainingFlow } from '@/components/sequence/LinkedTrainingFlow';
import { SequenceTrainingFlow } from '@/components/sequence/SequenceTrainingFlow';
import { CustomSessionFlow } from '@/components/portal/CustomSessionFlow';
import { MaterialReader } from '@/components/portal/MaterialReader';
import { RenewalGate } from './RenewalGate';
import { FreeSurfLogger } from '@/components/portal/FreeSurfLogger';
import { WaterRing, FlowDial } from '@/components/portal/HomeVisuals';
import { StudentPresentations } from '@/components/portal/StudentPresentations';
import { ProgramCard } from '@/components/portal/ProgramCard';
import { AthleteScoreCard } from '@/components/portal/AthleteScoreCard';
import { TeamWallCard } from '@/components/portal/TeamWallCard';
import { AthleteProfileCard } from '@/components/portal/AthleteProfileCard';
import { AthleteGuide } from '@/components/portal/AthleteGuide';
import { TodayExtras } from '@/components/portal/TodayExtras';
import { CompetitionCard } from '@/components/portal/CompetitionCard';
import { markMyMessagesRead } from '@/lib/actions/programs';

// Marca de módulo: para qué token ya se abrió el buzón en ESTA sesión SPA
// (sobrevive el desmontaje de HomeTab al cambiar de tab).
let inboxReadFor: string | null = null;
import { AppointmentCard } from '@/components/portal/AppointmentCard';
import { SeasonCard } from '@/components/portal/SeasonCard';
import { BeltJourney } from '@/components/portal/BeltJourney';
import { BeltRoadmap } from '@/components/portal/BeltRoadmap';
import { sequenceLabel, sequencePrefix } from '@/lib/constants/learning-blocks';
import { OCEAN_LEVEL_INFO, type OceanLevel } from '@/lib/constants/ocean-levels';
import { LineupTab } from '@/components/portal/LineupTab';
import { WaterLevel } from '@/components/portal/WaterLevel';
import { GlossaryTab } from '@/components/portal/GlossaryTab';
import { VideoAnalyzerLauncher } from '@/components/video-analyzer/VideoAnalyzerLauncher';
import { VenueScoutLauncher } from '@/components/venue-scout/VenueScoutLauncher';
import { LogoutButton } from '@/components/portal/LogoutButton';
import { BELT_MIRROR, cueForSession } from '@/lib/constants/mental-cues';
import {
  createSelfTrainingSession,
  completeSelfTrainingSession,
  touchPortalVisit,
} from '@/lib/actions/portal';
import { RoleSwitch } from '@/components/shared/RoleSwitch';
import {
  Home,
  GraduationCap,
  Megaphone,
  Play,
  ClipboardList,
  MessageCircle,
  ChevronDown,
  BookOpen,
  User,
  Dumbbell,
  Waves,
  Brain,
  ShieldAlert,
  CircleDot,
  Calendar,
  Lock,
  Check,
  CornerDownRight,
  Compass,
  Clock,
  CalendarDays,
  BarChart3,
  Sparkles,
  Bell,
  ChevronRight,
  Video,
  MapPin,
  Wind,
  type LucideIcon,
  Flame,
  ArrowRight,
  ArrowLeft,
  Star,
} from 'lucide-react';

// ─── Types ───

interface UpcomingMultiBlock {
  id: string;
  session_date: string;
  training_venue: string | null;
  completion_state: 'planned' | 'in_progress';
  total_planned_minutes: number;
  coaches?: any;
  blocks: Array<{
    id: string;
    order_index: number;
    step_id: string | null;
    drill_id: string | null;
    duration_minutes: number;
    objective_text: string | null;
  }>;
}

interface ClosedMultiBlock {
  id: string;
  session_date: string;
  training_venue: string | null;
  completion_state: 'closed';
  total_planned_minutes: number;
  total_actual_minutes: number | null;
  general_coach_feedback: string | null;
  general_homework: string | null;
  general_whats_next: string | null;
  closed_at: string | null;
  created_at: string;
  coaches?: any;
}

interface PortalData {
  student: any;
  sessions: any[];
  selfTrainingSessions: any[];
  surveyResultIds: string[];
  hasSurveyEver: boolean;
  totalSessions: number;
  streak: number;
  selfTrainingCount: number;
  totalTrainingMinutes: number;
  drillsPracticed: string[];
  recentDrills: { name: string; date: string; source: 'coach' | 'self' }[];
  surfHours?: { trainingMinutes: number; freeSurfMinutes: number; totalMinutes: number };
  flowChannel?: { avg: number | null; count: number; boredom: number; anxiety: number };
  upcomingMultiBlock?: UpcomingMultiBlock[];
  closedMultiBlock?: ClosedMultiBlock[];
  drills: any[];
  drillsMissions?: any[];
  pendingSurveys: any[];
  pendingExperience?: { token: string; campName: string | null } | null;
  /** Lecturas del Home resueltas server-side (perf 2026-08-23). */
  homeBundle?: {
    program: any; season: any; competitions: any; appointments: any[];
    scores: any; messages: any[]; teamWall: any; todayExtras: any; presentations: any[];
    hpAccess?: boolean;
  };
  submittedSurveys: any[];
  materials: { unlocked: BeltMaterial[]; locked: BeltMaterial[] };
  token: string;
  courseData?: {
    lessons: any[];
    preCourseCompleted: boolean;
    totalCompleted: number;
    totalLessons: number;
    studentId: string;
    studentName: string;
    isOwner: boolean;
    hasAccess: boolean;
    ownedCourses: { key: any; label: string }[];
    activeCourseKey: any;
    portalToken: string;
    activeCourseBelt: string;
    courseLock?: { unlocksOn: string; campName: string | null } | null;
  };
  /** El curso activo está con candado hasta el día antes del camp. */
  courseLocked?: boolean;
  /** Tres Círculos pendientes (Yellow/Blue): el Home los recomienda primero. */
  circlesNext?: { gameId: string; title: string; done: number; total: number } | null;
  myCoach?: {
    coach: {
      id: string;
      display_name: string;
      first_name: string;
      last_name: string | null;
      role: string;
      certification_level: string | null;
      max_belt_permission: string;
      languages: string | null;
      specialty_area: string | null;
      active_status: boolean;
    };
    stats: {
      totalSessions: number;
      totalMinutes: number;
      lastSessionDate: string | null;
      avgRating: number | null;
      ratingsCount: number;
    };
  } | null;
  coachProfileUnlocked?: boolean;
  /** Si esta persona además es coach, el link a su portal de coach. */
  coachSide?: { href: string; name: string } | null;
  /** Los drills vienen con el curso: sin curso, no hay Let's Play. */
  hasAnyCourse?: boolean;
  /** Registro de sesiones, horas y progreso: curso o membresía. El libro solo, no. */
  canTrack?: boolean;
  /** Tiene el libro ONE WAVE otorgado. */
  hasBook?: boolean;
  /** Ya hizo el quiz de nivel (v1 o v2). Si no, el Home lo invita. */
  levelQuizDone?: boolean;
  /** Membresía = la herramienta de entrenamiento. Cada curso trae 12 meses. */
  membership?: { active: boolean; ends_at: string | null; pending_request: boolean };
  /** La primera secuencia sin lograr y el paso que la frena. */
  /** ¿Sigue pendiente lo que el coach dejó para trabajar? */
  /** La tarea que dejó el coach, solo mientras esté pendiente (coach-focus.ts). */
  coachFocus?: { text: string | null; note: string | null; sequence_id: string | null; step_id: string | null; label: string | null; sequence_label?: string | null; step_label?: string | null; set_at: string | null; set_by_name: string | null; text_only: boolean } | null;
  /** Foco ELEGIBLE del coach: secuencia (+ paso) que el Home abre en Let's Play. */
  /** The Lineup: el canal de la comunidad (null si falló la carga). */
  lineup?: import('@/lib/actions/community').LineupData | null;
  /** Tus puntajes por secuencia (2026-09-21): qué vale cada una de tu cinta. */
  sequenceScores?: Awaited<ReturnType<typeof import('@/lib/actions/sequence').getSequenceScores>>;
  nextMove?: {
    sequenceId?: string;
    sequenceOrder: number;
    sequenceName: string;
    stepId: string;
    stepTitle: string;
    stars: number | null;
    official: boolean;
    /** Estrella del coach: cuándo la puso, tu nota, y sesiones tuyas desde entonces. */
    officialAt?: string | null;
    selfStars?: number | null;
    sessionsSince?: number;
    /** held_back = el paso que detuvo tu último run · weakest = el primero
     *  bajo la barra · unrated = el primero sin calificar. */
    source?: 'held_back' | 'weakest' | 'unrated';
    selfSequenceRating?: number | null;
    /** El detalle más flojo de la última práctica de ese paso. */
    detail?: { text: string; result: 'partial' | 'not_met'; drillTitle: string | null; date: string } | null;
    /** Un lado quedó atrás (Marcelo 2026-09-10): el lado flojo es el próximo movimiento. */
    sideAdvice?: { text: string; sequenceId: string; side: 'fs' | 'bs' } | null;
  } | null;
  /** Cintas cuyo CURSO tiene el alumno ('white_belt', 'blue_belt'…). El curso
   *  es aprender; la membresía es entrenar: los links al curso solo salen
   *  para quien lo tiene (doctrina 2026-09-10). */
  ownedBelts?: string[];
  /** El plan guardado antes del agua que todavía no se cerró. */
  openSession?: import('@/lib/actions/lets-play').OpenSession | null;
  /** Tus tareas abiertas (paso + detalle, máximo tres). */
  tasks?: import('@/lib/actions/lets-play').StudentTask[];
}

// Lo que el coach vio al cerrar el día: misma escala que la autoevaluación.
const FOCUS_WORDS = ['Distracted', 'Some', 'Mostly', 'Locked in'];
const FLOW_WORDS = ['Bored', 'Easy', 'Optimal', 'Hard', 'Frustrated'];
function coachSawLine(r: any): string | null {
  const f = r?.coach_focus; const fl = r?.coach_flow;
  const parts: string[] = [];
  if (f !== null && f !== undefined && FOCUS_WORDS[f]) parts.push(`Focus · ${FOCUS_WORDS[f]}`);
  if (fl && FLOW_WORDS[fl - 1]) parts.push(`Flow · ${FLOW_WORDS[fl - 1]}`);
  return parts.length ? parts.join(' · ') : null;
}

// ═══ SESIÓN ABIERTA (Marcelo 2026-09-10) ═══
// El alumno planea, cierra el app, surfea, y vuelve. Esta tarjeta es la
// puerta de vuelta: un toque y va a la evaluación con su plan tal cual.
function OpenSessionCard({ data, onFinish, onDiscard }: { data: PortalData; onFinish: () => void; onDiscard: () => void }) {
  const os = data.openSession;
  if (!os) return null;
  const measure = [os.plannedDuration ? `${os.plannedDuration} min` : null, os.plannedReps ? `${os.plannedReps} ${os.measure === 'waves' ? 'waves' : 'runs'}` : null].filter(Boolean).join(' · ');
  const stale = os.ageHours >= 24;
  const when = os.ageHours < 1 ? 'just now' : os.ageHours < 24 ? `${os.ageHours} h ago` : `${Math.round(os.ageHours / 24)} d ago`;
  // Manual v10.1 (Marcelo 2026-10-01: "que no se vean las letras tipo glow"):
  // la misma tarjeta sand que "From your coach" — tinta sobre crema, etiqueta
  // mono oscura, un solo botón cyan. Nada de texto de color sobre navy.
  const accent = stale ? '#FFD166' : '#06D6A0';
  return (
    <div className="rounded-lg p-4" style={{ background: T_CREAM, color: T_INK, border: `1px solid ${T_BORDER}`, borderTop: `4px solid ${accent}` }}>
      <p style={{ ...T_LABEL, color: creamLabel(accent) }}>{stale ? 'Still open' : 'Your session plan'} · planned {when}</p>
      <p className="text-[22px] font-extrabold leading-tight mt-1" style={{ fontFamily: ARCHIVO, color: T_INK }}>
        {os.sequenceLabel}{os.side && !/frontside|backside/i.test(os.sequenceLabel) ? ` · ${os.side === 'fs' ? 'Frontside' : 'Backside'}` : ''}
      </p>
      <p className="mt-2.5" style={{ ...T_LABEL, color: T_MUTED }}>Objective</p>
      <p className="text-[15px] font-semibold leading-snug mt-0.5" style={{ color: T_INK }}>
        {os.mode === 'step_focus' && os.focusTitle ? `Focus on ${os.focusTitle}` : 'The whole sequence, start to finish'}{os.focusMoment ? ` · ${os.focusMoment}` : ''}
      </p>
      {measure && <p className="text-[14px] mt-0.5" style={{ color: T_MUTED }}>{measure}</p>}
      {os.intention && <p className="text-[14px] mt-1 leading-snug font-semibold" style={{ color: T_INK, fontStyle: 'italic' }}>Your word: {os.intention}</p>}
      <button type="button" onClick={onFinish}
        className="w-full mt-3 min-h-[48px] rounded-[5px] flex items-center justify-center gap-2 px-3 text-[15px] font-black uppercase active:scale-[0.99]"
        style={{ background: BRAND.colors.cyan, color: T_NAVY, letterSpacing: '0.035em', fontFamily: ARCHIVO }}>
        I&apos;m back — finish &amp; evaluate <ArrowRight size={17} className="shrink-0" />
      </button>
      <button type="button" onClick={onDiscard} className="w-full mt-2 min-h-[40px] text-[14px] font-semibold" style={{ color: T_MUTED }}>
        {stale ? 'Close without evaluating' : 'Discard this plan'}
      </button>
    </div>
  );
}

/** La página de la secuencia (Think · Feel · Do · Review) SOLO si el alumno
 *  tiene el curso de esa cinta. */
function seqPageHref(data: PortalData, sequenceId: string | null | undefined, tab?: 'feel'): string | null {
  const cfg = sequencePageFor(sequenceId);
  if (!cfg || !sequenceId) return null;
  const owned = data.ownedBelts ?? [];
  if (!owned.includes(cfg.belt)) return null;
  return `/portal/${data.token}/seq/${sequenceId}${tab ? `?tab=${tab}` : ''}`;
}

// ─── Venue Analysis Constants ───

const VENUE_TYPES = [
  { value: 'beach', label: 'Beach' },
  { value: 'pool', label: 'Pool' },
  { value: 'skatepark', label: 'Skatepark' },
  { value: 'home_gym', label: 'Home / Gym' },
  { value: 'other', label: 'Other' },
];

const WAVE_CONDITIONS = [
  { value: 'flat', label: 'Flat' },
  { value: '1_2ft', label: '1-2 feet' },
  { value: '3_4ft', label: '3-4 feet' },
  { value: '4_6ft', label: '4-6 feet' },
  { value: '6_plus', label: '6+ feet' },
];

const WIND_OPTIONS = [
  { value: 'offshore', label: 'Offshore' },
  { value: 'onshore', label: 'Onshore' },
  { value: 'cross_shore', label: 'Cross-shore' },
  { value: 'none', label: 'None' },
];

const TIDE_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'mid', label: 'Mid' },
  { value: 'high', label: 'High' },
];

const CROWD_OPTIONS = [
  { value: 'empty', label: 'Empty' },
  { value: 'few', label: 'Few people' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'crowded', label: 'Crowded' },
];

// ─── Belt Level Descriptions ───

const BELT_WELCOME: Record<string, string> = {
  white_belt: 'Foundation — Board control, safety, your first waves in whitewater',
  yellow_belt: 'Novice — Green waves, pocket awareness, speed management',
  blue_belt: 'Foundation Rider — Named maneuvers, the Infinite Circle, rail engagement',
  purple_belt: 'Emerging — Linking maneuvers, aerial awareness, flow state',
  brown_belt: 'Pre-Elite — Full repertoire, competition readiness, advanced tactics',
  black_belt: 'Elite — Mastery, innovation, coaching readiness',
};

// ─── Helpers: extract drills and missions from STUDENT_MATERIALS by belt ───

function getDrillsForBelt(beltLevel: BeltLevel): BeltMaterial[] {
  const beltIndex = BELT_HIERARCHY.indexOf(beltLevel);
  return STUDENT_MATERIALS.filter(
    (m) =>
      m.category === 'drill' &&
      BELT_HIERARCHY.indexOf(m.beltLevel as BeltLevel) <= beltIndex
  );
}

function getMissionsForBelt(beltLevel: BeltLevel): BeltMaterial[] {
  const beltIndex = BELT_HIERARCHY.indexOf(beltLevel);
  return STUDENT_MATERIALS.filter(
    (m) =>
      m.category === 'mission' &&
      BELT_HIERARCHY.indexOf(m.beltLevel as BeltLevel) <= beltIndex
  );
}

function getWarmupsForBelt(beltLevel: BeltLevel) {
  return SELF_TRAINING_WARMUPS[beltLevel] || SELF_TRAINING_WARMUPS['white_belt'];
}

type Tab = 'home' | 'course' | 'sequence' | 'lineup' | 'sessions' | 'feedback' | 'glossary' | 'my-coach';
// Pantallas válidas que NO están en la barra de abajo (llegan por link o desde el Home).
const SUB_SCREENS: Tab[] = ['feedback', 'sessions', 'glossary'];

// ── Brand v10 type + color helpers (M140 student-home redesign) ──
const F_DISPLAY = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.08 } as const;
const F_LABEL = { fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' } as const;
// Línea aprobada (TSS_Design_Handoff, 2026-09-14 · mock de Home): navy, tarjetas
// crema, títulos grandes Archivo 900, etiquetas mono, botón cyan.
const H_BIG = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.06 } as const;
const T_CREAM = '#E9E2D2', T_PAPER = '#F7F9FA', T_INK = '#10263B', T_BORDER = '#DCD7C6', T_MUTED = '#55666E', T_NAVY = '#061C2B';
const T_LABEL = { ...F_LABEL, letterSpacing: '0.08em', fontSize: 12 } as const;
const creamLabel = (accent: string) => (accent === '#FFD166' ? '#10263B' : accent === '#06D6A0' ? '#0A7C5D' : '#00A8CC');
const ARCHIVO = 'var(--font-archivo), Archivo, sans-serif';
const T_MONO_SM = { fontFamily: 'var(--font-plex), DM Mono, monospace', fontSize: 13 } as const;
const T_LINK = '#00A8CC';
// Home · diseño A "Clarity" (Marcelo 2026-10-01): tarjetas navy para los datos,
// arena para la acción, filas para el buzón.
const HOME_CARD = '#0C2738';
const HOME_LINE = 'rgba(214,225,231,0.14)';
const HOME_MONO = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontWeight: 500, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' } as const;
// El rótulo sobre arena: el cyan claro no llega al contraste sobre #E9E2D2.
const SAND_LABEL = '#00728A';
const ONE_WAVE_ID = 'f50677a2-72b1-4abd-9335-fe0c99c80333';
// El color de la cinta sobre navy: la negra (#111111) no se ve, va en gris claro.
const onNavyBeltColor = (level: string, color: string | null | undefined) =>
  level === 'black_belt' ? '#C9D6DD' : color || '#00D2FF';
const initialsOf = (name: string | null | undefined) =>
  (name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '·';

/** Una fila de "Also for you": ícono, título, una línea de detalle. */
function HomeRowInner({ icon: Icon, color, bg, title, sub, extra, chevron = true }: {
  icon: LucideIcon; color: string; bg: string; title: React.ReactNode; sub?: React.ReactNode; extra?: React.ReactNode; chevron?: boolean;
}) {
  return (
    <>
      <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: bg, color }}>
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-[15px] font-bold leading-snug" style={{ color: '#F7F9FA' }}>{title}</span>
        {sub && <span className="text-[13px] leading-snug" style={{ color: '#A9BCC7' }}>{sub}</span>}
        {extra}
      </span>
      {/* En una fila que se despliega (<details className="group">) gira al abrir. */}
      {chevron && <ChevronRight size={16} className="shrink-0 transition-transform group-open:rotate-90" style={{ color: '#8FB3C4' }} />}
    </>
  );
}
/** Tarjeta sand del manual v10 con etiqueta mono arriba (mock My Progress 2026-09-15). */
function SandCard({ label, right, children, className = '' }: { label?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg p-4 ${className}`} style={{ background: T_CREAM, border: `1px solid ${T_BORDER}`, color: T_INK }}>
      {(label || right) && (
        <div className="flex items-center justify-between gap-3 mb-2">
          {label && <p style={{ ...T_LABEL, color: T_INK }}>{label}</p>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// ═══ YOUR NEXT MOVES ═══ (Marcelo 2026-09-04/05)
// Una sola fuente para las dos puertas: en el HOME sale SOLO la primera (lo
// más importante) con "N more waiting in Let's Play"; en LET'S PLAY sale la
// lista completa numerada, con origen, razón y la regla del orden.
// Orden: 1 lo que dejó el coach · 2 el método (el paso que detuvo tu último
// run, o el primero < 4★) · 3 lo que dejaste < 4★ en dos semanas.
type NextMoveRow = { key: string; label: string; title: string; reason: string; detail?: string | null; /** Por lado: "Train backside first…" (misma función que Let's Play). */ side?: string | null; action: string | null; accent: string; onClick?: () => void; /** La página de la secuencia (qué necesita). */ pageHref?: string | null };
// "Sequence #1 · Board Control": con la palabra, porque la secuencia se llama
// casi igual que un paso ("Control Your Board") y sin ella parece repetido.
const seqWord = (label: string) => (label.startsWith('#') ? `Sequence ${label}` : label);

function nextMoveRows(
  data: PortalData,
  onTrainSequence?: (args: TrainSequenceArgs) => void,
  onOpenStep?: (stepId: string) => void,
): { rows: NextMoveRow[]; coachCleared: boolean } {
  const coachCleared = false;
  const rows: NextMoveRow[] = [];
  // LA TAREA DEL COACH (Marcelo 2026-09-25): "le aparece, y si la trabaja una
  // vez deja de aparecer como aviso". Primera de la lista mientras esté
  // pendiente; el servidor ya la quitó si registró una sesión sobre ella.
  const cf = data.coachFocus ?? null;
  if (cf && (cf.label || cf.text)) {
    const when = cf.set_at ? new Date(cf.set_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' }) : null;
    const who = cf.set_by_name ? `${cf.set_by_name} left it` : 'Your coach left it';
    if (cf.label) {
      rows.push({
        key: 'coach', label: 'From your coach', accent: '#00D2FF',
        title: cf.label,
        reason: `${who}${when ? ` · ${when}` : ''} · train it once and it clears`,
        // Solo la nota del coach, no la etiqueta otra vez (coach-focus.ts).
        detail: cf.note,
        action: 'Train it →',
        onClick: cf.sequence_id
          ? () => { if (onTrainSequence) onTrainSequence({ sequenceId: cf.sequence_id!, mode: 'step_focus', focusStepId: cf.step_id, intention: cf.note }); else if (cf.step_id) onOpenStep?.(cf.step_id); }
          : () => onOpenStep?.(cf.step_id!),
        pageHref: cf.sequence_id ? seqPageHref(data, cf.sequence_id) : null,
      });
    } else {
      // Solo texto (sin secuencia): una nota para tener en mente, no un botón.
      rows.push({
        key: 'coach', label: 'From your coach', accent: '#00D2FF',
        title: 'A note from your coach',
        reason: `${who}${when ? ` · ${when}` : ''} · a note, not a step — keep it in mind in your next session; it stays until your coach leaves the next one`,
        detail: cf.text,
        action: null,
      });
    }
  }
  // LOS TRES CÍRCULOS (Marcelo 2026-09-17): primer requisito en la ola para
  // Yellow y Blue. Compuerta suave: va antes del camino, no lo bloquea.
  const circlesNext = (data as any).circlesNext as PortalData['circlesNext'];
  if (circlesNext) {
    rows.push({
      key: 'circles', label: 'First on the wave', title: 'The Three Circles', accent: BRAND.colors.cyan,
      reason: `${circlesNext.done} of ${circlesNext.total} games at 4★ · next: ${circlesNext.title}`,
      action: 'Play it →',
      onClick: () => { if (onTrainSequence) onTrainSequence({ sequenceId: THREE_CIRCLES_SEQUENCE_ID, mode: 'step_focus', focusStepId: circlesNext.gameId }); },
      pageHref: `/portal/${data.token}/circles`,
    });
  }
  // TU LISTA (doctrina 2026-09-10): lo que vos te dejaste, antes del camino
  // — quien se dejó una tarea sabe qué hacer. Una sola fila, la más vieja.
  const task = data.tasks?.[0] ?? null;
  if (task) {
    rows.push({
      // step null = la secuencia entera (2026-10-01): se corre completa.
      key: 'task', label: 'Your list', title: task.stepId ? `${task.stepTitle}${task.detail ? ` · ${task.detail}` : ''}` : `${seqWord(task.sequenceLabel)} · ${task.stepTitle.toLowerCase()}`, accent: '#FFD166',
      reason: `You put it on your list${task.stepId ? ` · ${seqWord(task.sequenceLabel)}` : ''}${(data.tasks?.length ?? 0) > 1 ? ` · ${data.tasks!.length} on the list` : ''}`,
      action: 'Train it →',
      onClick: () => {
        if (onTrainSequence) onTrainSequence(task.stepId
          ? { sequenceId: task.sequenceId, mode: 'step_focus', focusStepId: task.stepId, focusMoment: task.detail, intention: task.detail }
          : { sequenceId: task.sequenceId, mode: 'sequence_run' });
        else if (task.stepId) onOpenStep?.(task.stepId);
      },
      pageHref: seqPageHref(data, task.sequenceId),
    });
  }
  // EL CAMINO (doctrina 2026-09-10): una sola sugerencia, siempre la línea
  // completa con un foco — "Run #8 · focus FP1" — nunca un detalle suelto.
  // Es el default para el que no sabe por dónde empezar; el mapa queda libre.
  const nm = data.nextMove ?? null;
  if (nm) {
    // "Run #8" cuando lleva número; si no, el nombre ("Run Navigate the Ocean").
    const pre = sequencePrefix(nm.sequenceId ?? null, nm.sequenceOrder);
    const seqLbl = pre?.startsWith('#') ? pre : nm.sequenceName;
    const seq = seqWord(sequenceLabel(nm.sequenceId ?? null, nm.sequenceOrder, nm.sequenceName));
    const word = nm.detail ? nm.detail.text : null;
    // Marcelo (2026-09-11): "algo súper claro: # de secuencia + nombre, y
    // qué parte de la secuencia lo está deteniendo". Nada más.
    rows.push({
      key: 'sequence', label: 'The path', title: `${seqLbl} · ${nm.sequenceName}`, accent: BRAND.colors.cyan,
      reason: nm.source === 'held_back'
        ? `Holding you back: ${nm.stepTitle}`
        : nm.source === 'unrated'
          ? `Start with: ${nm.stepTitle}`
          : `Work on: ${nm.stepTitle}${nm.stars !== null ? ` · ${nm.stars}★${nm.official ? ` from your coach${nm.officialAt ? `, ${new Date(nm.officialAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' })}` : ''}` : ''}` : ''}`,
      // La estrella oficial manda (Marcelo 2026-09-25: "me puse 5 y no cambia
      // nada"): se dice quién la puso, qué hiciste desde entonces y qué sigue.
      detail: [
        nm.official && nm.source !== 'held_back'
          ? ((nm.sessionsSince ?? 0) > 0
              ? `You trained it ${nm.sessionsSince}× since${nm.selfStars != null ? ` and rate it ${nm.selfStars}★` : ''} — at 4★ it's ready for your coach to confirm.`
              : 'Only your coach can move this star — train it, then ask them to confirm it in the water.')
          : null,
        word ? `Your word: ${word}` : null,
      ].filter(Boolean).join(' · ') || null,
      // El consejo de lados NO va acá (Marcelo 2026-09-10: "no sé a qué se
      // refiere"): mezclaba otras secuencias en la fila del camino. Vive en
      // Let's Play → Where you are / Both sides.
      action: 'Train it →',
      onClick: () => {
        if (nm.sequenceId && onTrainSequence) onTrainSequence({ sequenceId: nm.sequenceId, mode: 'step_focus', focusStepId: nm.stepId, intention: word });
        else onOpenStep?.(nm.stepId);
      },
      pageHref: seqPageHref(data, nm.sequenceId),
    });
  }
  return { rows, coachCleared };
}

function NextMovesBlock({ data, mode, onTrainSequence, onOpenStep, onGoTo }: {
  data: PortalData;
  /** top = solo la primera (Home) · full = la lista numerada (Let's Play). */
  mode: 'top' | 'full';
  onTrainSequence?: (args: TrainSequenceArgs) => void;
  onOpenStep?: (stepId: string) => void;
  onGoTo?: (tab: Tab) => void;
}) {
  const { rows: rawRows, coachCleared } = nextMoveRows(data, onTrainSequence, onOpenStep);
  // La página de la secuencia vuelve adonde se tocó: Home o Let's Play.
  const origin = mode === 'full' ? ({ k: 'play' } as const) : ({ k: 'home' } as const);
  const rows = rawRows.map((r) => (r.pageHref ? { ...r, pageHref: withFrom(r.pageHref, origin) } : r));
  if (rows.length === 0 && !coachCleared) return null;
  const rowStyle = { borderTop: '1px solid rgba(255,255,255,.08)' };
  const renderRow = (r: NextMoveRow, idx: number, numbered: boolean) => {
    const inner = (
      <div className="flex items-start gap-3">
        {numbered && (
          <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: r.accent, color: '#061C2B' }} aria-label={`Priority ${idx + 1}`}>
            {idx + 1}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[12px]" style={{ ...F_LABEL, color: r.accent }}>{numbered ? r.label : 'Next'}</p>
          <p className="text-[15px] font-semibold text-white mt-0.5 leading-snug">{r.title}</p>
          <p className="text-[12px] text-white/80 mt-0.5 leading-snug">{r.reason}</p>
          {r.detail && <p className="text-[12px] mt-1 leading-snug" style={{ color: '#FFD166' }}>{r.detail}</p>}
          {r.side && <p className="text-[12px] mt-1 leading-snug" style={{ color: '#B388FF' }}>Both sides · {r.side}</p>}
          {r.action && <p className="text-[12px] mt-1.5 font-semibold" style={{ color: r.accent }}>{r.action}</p>}
        </div>
      </div>
    );
    return r.onClick ? (
      <div key={r.key} style={numbered || idx > 0 ? rowStyle : undefined}>
        <button type="button" onClick={r.onClick} className="block w-full text-left px-4 pt-3.5 pb-2">{inner}</button>
        {r.pageHref && (
          <a href={r.pageHref} className="block px-4 pb-3 text-[12px]" style={{ color: 'rgba(247,249,250,.75)' }}>
            Open the sequence page →
          </a>
        )}
      </div>
    ) : (
      <div key={r.key} className="px-4 py-3.5" style={numbered || idx > 0 ? rowStyle : undefined}>{inner}</div>
    );
  };
  const cleared = coachCleared && (
    <div className="px-4 py-3" style={rowStyle}>
      <p className="text-[12px]" style={{ ...F_LABEL, color: '#06D6A0' }}>You cleared it</p>
      <p className="text-[13.5px] text-white mt-1 leading-snug">You took what your coach left you to 4★ on your own.</p>
      <p className="text-[12px] text-white/80 mt-1 leading-snug">They confirm it next time they see you in the water.</p>
    </div>
  );

  if (mode === 'top') {
    // HOME: una sola cosa. El resto vive en Let's Play. Tarjeta crema con el
    // botón cyan (línea aprobada 2026-09-14); mismos textos y mismos destinos.
    const first = rows[0];
    const clearedCream = coachCleared && (
      <div className="rounded-[5px] px-3 py-2.5 mt-3 flex items-start gap-2.5" style={{ background: '#DDF0E4' }}>
        <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ background: '#0F8A5F', color: '#fff' }}>✓</span>
        <div>
          <p className="text-[14px] font-bold leading-snug" style={{ color: '#0F6B4A' }}>You cleared it · You took what your coach left you to 4★ on your own.</p>
          <p className="text-[13px] mt-0.5 leading-snug" style={{ color: '#0F6B4A' }}>They confirm it next time they see you in the water.</p>
        </div>
      </div>
    );
    return (
      <>
        <div className="rounded-lg p-4" style={{ background: T_CREAM, color: T_INK, border: `1px solid ${T_BORDER}` }}>
          {first ? (
            <>
              <p style={{ ...T_LABEL, color: creamLabel(first.accent) }}>{first.label}</p>
              <p className="text-[22px] font-extrabold leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', color: T_INK }}>{first.title}</p>
              <p className="text-[15px] mt-1 leading-snug" style={{ color: T_INK }}>{first.reason}</p>
              {first.detail && <p className="text-[14px] mt-1 leading-snug font-semibold" style={{ color: T_INK, fontStyle: 'italic' }}>{first.detail}</p>}
              {first.side && <p className="text-[14px] mt-1 leading-snug" style={{ color: '#7C4DFF' }}>Both sides · {first.side}</p>}
              {first.onClick && first.action && (
                <button type="button" onClick={first.onClick}
                  className="w-full mt-3 min-h-[48px] rounded-[5px] flex items-center justify-center gap-2 text-[17px] font-black uppercase"
                  style={{ background: BRAND.colors.cyan, color: T_NAVY, letterSpacing: '0.035em', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>
                  {first.action.replace(/\s*→\s*$/, '')} <ArrowRight size={18} />
                </button>
              )}
              {first.pageHref && (
                <a href={first.pageHref} className="flex items-center justify-center gap-1.5 mt-2.5 text-[15px] font-bold" style={{ color: T_INK }}>
                  Open the sequence page <ArrowRight size={15} />
                </a>
              )}
            </>
          ) : null}
          {clearedCream}
        </div>
        {(() => {
          // Lo que queda en Let's Play, contado como Let's Play lo muestra:
          // las filas de "Your next moves" (sin la primera) y, aparte, tu lista.
          const remaining = rows.filter((r) => r !== first && r.key !== 'task').length;
          const listWaiting = !!rows.find((r) => r.key === 'task' && r !== first);
          if (!remaining && !listWaiting) return null;
          const text = remaining
            ? `${remaining} more waiting in Let's Play${listWaiting ? ' · plus your list' : ''}`
            : 'Your list is waiting in Let\'s Play';
          return (
            <button type="button" onClick={() => onGoTo?.('sequence')} className="flex items-center gap-3 w-full text-left rounded-lg px-4 py-3 mt-2.5 text-[15px] font-semibold"
              style={{ border: '1px solid rgba(0,210,255,.35)', color: '#F7F9FA' }}>
              <Play size={16} strokeWidth={1.75} /> {text} <ArrowRight size={15} />
            </button>
          );
        })()}
      </>
    );
  }

  // LET'S PLAY: la lista completa, numerada, con la regla. Tarjeta sand con
  // botón cyan por fila (línea aprobada); mismos textos y destinos.
  // Marcelo (2026-09-15, "que no se repita la misma información"): la tarea de
  // tu lista NO va acá — la tarjeta "My list" de abajo es su dueña (Done, hasta
  // tres). Y "You cleared it" es un aviso: vive solo en el Home.
  const fullRows = rows.filter((r) => r.key !== 'task');
  if (fullRows.length === 0) return null;
  return (
    <div>
      <h2 className="text-[26px] mb-2.5" style={{ ...H_BIG, color: '#F8F5EC' }}>Your next moves</h2>
      <div className="rounded-lg overflow-hidden" style={{ background: T_CREAM, color: T_INK, border: `1px solid ${T_BORDER}` }}>
        <div className="px-4 pt-3.5 pb-1">
          <p className="text-[14px]" style={{ color: T_INK }}>{!fullRows.some((r) => r.onClick) ? 'Read it, then pick a sequence below.' : fullRows.length > 1 ? 'In this order. Tap one to train it.' : 'Tap it to train it.'}</p>
        </div>
        {fullRows.map((r, idx) => (
          <div key={r.key} className="px-4 py-3.5" style={{ borderTop: `1px solid ${T_BORDER}` }}>
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-black" style={{ background: T_NAVY, color: BRAND.colors.cyan }} aria-label={`Priority ${idx + 1}`}>{idx + 1}</span>
              <div className="min-w-0 flex-1">
                <p style={{ ...T_LABEL, color: creamLabel(r.accent) }}>{r.label}</p>
                <p className="text-[18px] font-extrabold leading-tight mt-0.5" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', color: T_INK }}>{r.title}</p>
                <p className="text-[14px] mt-0.5 leading-snug" style={{ color: T_INK }}>{r.reason}</p>
                {r.detail && <p className="text-[13px] mt-1 leading-snug font-semibold" style={{ color: T_INK, fontStyle: 'italic' }}>{r.detail}</p>}
                {r.side && <p className="text-[13px] mt-1 leading-snug" style={{ color: '#7C4DFF' }}>Both sides · {r.side}</p>}
                {r.onClick && r.action && (
                  <button type="button" onClick={r.onClick}
                    className="mt-2.5 min-h-[44px] px-5 rounded-[5px] inline-flex items-center gap-2 text-[14px] font-black uppercase"
                    style={{ background: BRAND.colors.cyan, color: T_NAVY, letterSpacing: '0.035em', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>
                    {r.action.replace(/\s*→\s*$/, '')} <ArrowRight size={16} />
                  </button>
                )}
                {r.pageHref && (
                  <a href={r.pageHref} className="inline-flex items-center gap-1.5 mt-2 ml-1 text-[13px] font-bold" style={{ color: T_INK }}>
                    Open the sequence page <ArrowRight size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ALL_TABS: { key: Tab; label: string; icon: LucideIcon; lockedUntilCoachUnlock?: boolean }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'course', label: 'Course', icon: GraduationCap },
  { key: 'sequence', label: "Let's Play", icon: Play },
  // The Lineup: la CUARTA Y ÚLTIMA pestaña (plan 2026-08-14 — con cinco
  // íconos el alumno se pierde; My Coach es un desbloqueo, no cuenta).
  // Solo aparece cuando hay algo publicado: lanzarla vacía es el único
  // riesgo que arruina el proyecto.
  { key: 'lineup', label: 'The Lineup', icon: Megaphone },
  { key: 'my-coach', label: 'My Coach', icon: User, lockedUntilCoachUnlock: true },
];

// ─── Main Portal Tabs Component ───

export function PortalTabs({
  data,
  initialTab,
  initialSurveyId,
  initialDrillId,
  initialStepId,
  initialTrain,
  initialFrom = null,
}: {
  data: PortalData;
  initialTab?: Tab;
  initialSurveyId?: string | null;
  initialDrillId?: string | null;
  initialStepId?: string | null;
  /** Deep-link desde la página de la secuencia: abrir Let's Play con la línea (o el foco) ya elegida. */
  initialTrain?: TrainSequenceArgs | null;
  /** De dónde vino el deep-link (?from=, src/lib/nav/origin.ts): Cancel vuelve ahí. */
  initialFrom?: StudentFrom | null;
}) {
  // Al terminar una Custom Session el Home debe re-leer del servidor
  // (horas, sesiones) — sin esto quedaba viejo hasta recargar.
  const portalRouter = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'home');
  // Si el portal se volvió a montar por un refresh (acción del servidor con
  // revalidatePath + loading.tsx), vuelve a la pestaña donde estaba — no a
  // Home. Se lee en un efecto (no en el estado inicial) para no desincronizar
  // la hidratación con el HTML del servidor.
  const restoredRef = useRef<ReturnType<typeof loadPortalState>>(null);
  useEffect(() => {
    const r = loadPortalState(data.token);
    restoredRef.current = r;
    if (!initialTab && r?.tab && ALL_TABS.some((t) => t.key === r.tab)) setActiveTab(r.tab as Tab);
    const bump = () => touchPortalState(data.token);
    window.addEventListener('pointerdown', bump, { passive: true });
    return () => window.removeEventListener('pointerdown', bump);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { savePortalState(data.token, { tab: activeTab }); }, [activeTab, data.token]);
  // Registro de visita: última vez, última pantalla (seguimiento de regreso).
  useEffect(() => { void touchPortalVisit(data.token, activeTab); }, [activeTab, data.token]);
  // El paso que hay que abrir en Let's Play. Arranca con el del deep-link y
  // también lo setea el Home al tocar "tu próximo movimiento": mandar al
  // alumno por ?tab=sequence&step= no funcionaba con los dos parámetros
  // juntos, y cambiar de pestaña por estado es más directo igual.
  const [deepStepId, setDeepStepId] = useState<string | null>(initialStepId || null);
  // 📖 Manual de uso del portal: se abre solo la primera vez que la persona
  // entra y queda siempre a un toque en el botón del encabezado.
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    // Nunca por encima de un deep-link (encuesta, lección, drill): el alumno
    // vino a algo puntual — la guía queda en el botón 📖.
    if (initialTab || initialSurveyId || initialDrillId || initialStepId || initialTrain || loadPortalState(data.token)) return;
    try { if (!localStorage.getItem('tss_athlete_guide_v1')) setGuideOpen(true); } catch { /* sin localStorage, sin auto-open */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const closeGuide = () => { setGuideOpen(false); try { localStorage.setItem('tss_athlete_guide_v1', '1'); } catch {} };
  const lineupPosts = (data as any).lineup?.posts?.length ?? 0;
  // "Visto" EN ESTA SESIÓN: sin esto, el punto cyan y el buzón del Home
  // seguían gritando "3 new" después de leer todo, hasta la próxima recarga
  // — un badge que miente entrena al alumno a ignorarlo.
  const [lineupSeen, setLineupSeen] = useState(false);
  const lineupUnread = lineupSeen ? 0 : ((data as any).lineup?.unread ?? 0);
  const TABS = useMemo(
    () => ALL_TABS.filter((t) => {
      if (t.lockedUntilCoachUnlock && !data.coachProfileUnlocked) return false;
      if (t.key === 'lineup' && lineupPosts === 0) return false;
      return true;
    }),
    [data.coachProfileUnlocked, lineupPosts]
  );
  // Deep-link a una pestaña que no existe (?tab=lineup con el canal vacío,
  // o el canal falló en cargar): caer al Home, no a un panel en blanco.
  // OJO: Feedback, Sessions y Glossary viven DENTRO del Home (no son
  // pestañas de la barra) pero sí son pantallas válidas: el link del correo
  // (?tab=feedback&survey=) y el botón "Rate your coach" llegan por acá.
  // Sin esta excepción rebotaban al Home (prueba E2E 2026-09-18).
  useEffect(() => {
    if (SUB_SCREENS.includes(activeTab)) return;
    if (!TABS.some((t) => t.key === activeTab)) setActiveTab('home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TABS, activeTab]);
  // Linked Train flow: when student taps "Practice this drill" from My Sequence
  // OR arrives via deep-link from a Course lesson (?drill=X), we store the drill
  // ID and render LinkedTrainingFlow inline within the unified "Let's Play" tab.
  const [pendingDrillMissionId, setPendingDrillMissionId] = useState<string | null>(
    initialDrillId || null
  );
  const [showCustomSession, setShowCustomSession] = useState(false);
  // Custom Session empezada y sin cerrar (vive en el teléfono, 24 h): la tarjeta
  // de Let's Play lo dice y abrirla vuelve a su Finish & Review (Marcelo 2026-10-01).
  const [customOpen, setCustomOpen] = useState<CustomInProgress | null>(null);
  useEffect(() => {
    if (activeTab === 'sequence' && !showCustomSession) setCustomOpen(loadCustomInProgress(data.token));
  }, [activeTab, showCustomSession, data.token]);
  // Let's Play por SECUENCIA (Marcelo 2026-09-04): correr la secuencia
  // completa o trabajar un paso como foco. Se renderiza inline en el tab.
  const [pendingSequence, setPendingSequence] = useState<TrainSequenceArgs | null>(initialTrain ?? null);
  // De dónde arrancó el flujo de Let's Play (Marcelo 2026-10-01: "que pueda
  // regresar a la pantalla que es lógico"): Cancel vuelve ahí, no siempre a
  // la lista. 'step' = el detalle del paso desde el que se tocó Practice.
  type FlowFrom = StudentFrom | { k: 'step'; id: string } | { k: 'roadmap' };
  const [flowFrom, setFlowFrom] = useState<FlowFrom | null>(initialTrain || initialDrillId ? initialFrom : null);
  // De dónde se abrió el detalle de un paso: su "Back" vuelve ahí.
  const [stepFrom, setStepFrom] = useState<'home' | 'play' | 'roadmap'>(initialStepId && initialFrom?.k === 'home' ? 'home' : 'play');
  // El plan guardado antes del agua, VIVO (2026-10-01): al guardarlo se lee de
  // nuevo, así el Home y Let's Play lo muestran sin recargar. Antes quedaba el
  // de la carga de la página (o ninguno) hasta un refresh.
  const [openSessionLive, setOpenSessionLive] = useState<OpenSession | null>(data.openSession ?? null);
  // Cada refresh del servidor manda (también null → null: un plan que se
  // evaluó acá ya no figura abierto aunque el valor no "cambie").
  useEffect(() => { setOpenSessionLive(data.openSession ?? null); }, [data]);
  const liveData = useMemo(() => ({ ...data, openSession: openSessionLive }), [data, openSessionLive]);

  // Los parámetros de deep-link (?tab=, ?lesson=, ?drill=, ?step=, ?survey=)
  // ya quedaron capturados en estado arriba, así que se limpian de la barra de
  // direcciones. Si no, la URL queda PEGADA: el alumno entra una vez a una
  // lección o a Let's Play por un link y a partir de ahí cada recarga lo
  // devuelve al mismo lugar, aunque haya navegado a Inicio con la barra de
  // abajo (que solo cambia estado y nunca tocó la URL).
  //
  // OJO (bug 2026-09-10, "le doy Let's Play desde el curso y me saca del
  // flow"): Next 14.2 parchea window.history.replaceState y trata cualquier
  // llamada externa como una navegación a esa URL. Limpiar la query así
  // disparaba un re-render del servidor SIN los parámetros → loading.tsx →
  // PortalTabs se montaba de nuevo con initialTrain=null y el alumno caía
  // en la lista. Conservar el estado interno de Next (__NA) hace que el
  // parche devuelva el replaceState nativo: la barra se limpia y nada navega.
  useEffect(() => {
    try {
      if (!window.location.search) return;
      const st = (window.history.state && typeof window.history.state === 'object') ? window.history.state : {};
      // Se conserva SOLO ?tab= (y &lesson= dentro del Course): así una recarga
      // o un link compartido vuelven a la misma pantalla, y los parámetros
      // que arman flujos (?seq=, ?step=, ?drill=, ?survey=) se limpian.
      const p = new URLSearchParams(window.location.search);
      const keep = new URLSearchParams();
      const tab = p.get('tab');
      if (tab) keep.set('tab', tab);
      if (tab === 'course' && p.get('lesson')) {
        keep.set('lesson', p.get('lesson')!);
        // De dónde vino la lección (?from=): su Back vuelve ahí (CourseTab).
        if (p.get('from')) keep.set('from', p.get('from')!);
      }
      const q = keep.toString();
      window.history.replaceState({ ...st, __NA: true }, '', `${window.location.pathname}${q ? `?${q}` : ''}`);
    } catch { /* la limpieza es cosmética, nunca debe romper el portal */ }
  }, []);

  // Atrás del teléfono después de cambiar de pestaña por la barra: la pestaña
  // sigue a la URL (revisión 2026-09-25), así no queda una pulsación muerta.
  useEffect(() => {
    const onPop = () => {
      try {
        // Sin ?tab= la entrada es la portada: Home.
        const t = (new URLSearchParams(window.location.search).get('tab') || 'home') as Tab;
        if (t !== 'sequence') releasePlayOnLeave();
        if (TABS.some((x) => x.key === t)) setActiveTab((cur) => (cur === t ? cur : t));
      } catch { /* nada */ }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const { student } = data;
  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];

  // "What it takes": la guía de requisitos hacia la próxima cinta. Se abre
  // desde el camino de cintas del Home y desde el curso; carga sus datos al
  // abrirse, no al montar el portal.
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  // "Your water level": la línea del agua, APARTE de la cinta (Marcelo
  // 2026-08-29). Se abre desde la fila del agua del Home y desde la puerta
  // dentro de What it takes.
  const [waterOpen, setWaterOpen] = useState(false);

  // Abrir UN paso puntual en Let's Play. El estado del deep-link (?step=) ya
  // existía; lo que faltaba era usarlo desde adentro — por eso la tarjeta
  // "Your next move" del Home se veía tocable y no hacía nada.
  // Suelta cualquier flujo a medias de Let's Play (secuencia, pieza, paso
  // abierto, sesión libre): un salto nuevo nunca cae en uno abandonado.
  const resetPlay = () => {
    setPendingSequence(null);
    setPendingDrillMissionId(null);
    setShowCustomSession(false);
    setDeepStepId(null);
    setFlowFrom(null);
    setStepFrom('play');
    flowDoneRef.current = false;
  };
  // Cambiar de pantalla sin recargar, con la URL al día (?tab=). Sin __NA,
  // Next trataría el replaceState como navegación y remontaría el portal.
  // Un flujo que ya terminó (sesión evaluada, pantalla "Session saved").
  const flowDoneRef = useRef(false);
  // Salir de Let's Play (barra, Home, atrás del teléfono) suelta el paso que
  // había llegado de afuera y el flujo ya terminado: al volver, la lista.
  const releasePlayOnLeave = () => {
    setDeepStepId(null);
    setStepFrom('play');
    if (flowDoneRef.current) { flowDoneRef.current = false; setPendingSequence(null); setPendingDrillMissionId(null); setFlowFrom(null); }
  };
  const showTab = (t: Tab) => {
    if (t !== 'sequence') releasePlayOnLeave();
    setActiveTab(t);
    savePortalState(data.token, { tab: t, lesson: null, lessonFrom: null });
    try {
      const st = (window.history.state && typeof window.history.state === 'object') ? window.history.state : {};
      window.history.replaceState({ ...st, __NA: true, tssLesson: null }, '', `${window.location.pathname}?tab=${t}`);
    } catch { /* nada */ }
  };
  // "Read it in My Sessions" (encuesta enviada, Marcelo 2026-10-01): My progress
  // abierto en My Sessions. Sin membresía no hay My progress: va a Sessions.
  const [progressAsk, setProgressAsk] = useState<'sessions' | null>(null);
  const openMySessions = () => {
    if (data.canTrack === false) { showTab('sessions'); return; }
    setProgressAsk('sessions');
    showTab('home');
  };
  const openStepInPlay = (stepId: string, from: 'home' | 'play' | 'roadmap' = 'play') => {
    resetPlay();
    setDeepStepId(stepId);
    setStepFrom(from);
    showTab('sequence');
  };
  // El "Back" del detalle del paso: adonde estaba el alumno al abrirlo.
  const leaveStep = () => {
    setDeepStepId(null);
    const from = stepFrom;
    setStepFrom('play');
    if (from === 'home') showTab('home');
    else if (from === 'roadmap') setRoadmapOpen(true);
  };
  const stepBackLabel = stepFrom === 'home' ? 'Home' : stepFrom === 'roadmap' ? 'What it takes' : "Let's Play";
  // Cancel de un flujo de Let's Play: vuelve adonde arrancó.
  const leaveFlow = () => {
    const f = flowFrom;
    setPendingSequence(null);
    setPendingDrillMissionId(null);
    setFlowFrom(null);
    if (!f || f.k === 'play') return;
    if (f.k === 'home') { showTab('home'); return; }
    if (f.k === 'step') { setDeepStepId(f.id); return; }
    if (f.k === 'roadmap') { setRoadmapOpen(true); return; }
    if (f.k === 'course') { showTab('course'); return; }
    // Otra página (la de la secuencia, los Tres Círculos, una lección): se va,
    // reemplazando esta entrada (el atrás del teléfono no pasa por una lista fantasma).
    leaveTo(studentBack(f, data.token, { k: 'play' }).href);
  };
  const flowBackLabel = !flowFrom || flowFrom.k === 'play' ? "Let's Play"
    : flowFrom.k === 'step' ? 'the step' : flowFrom.k === 'roadmap' ? 'What it takes' : studentBack(flowFrom, data.token, { k: 'play' }).label;
  // La pantalla final de una misión guardada (Marcelo 2026-10-01): vuelve al
  // origen como Cancel, pero Home, Course y Let's Play se recargan (goTab) para
  // ver horas y estrella nuevas. Las páginas de afuera ya cargan de cero.
  const leaveFlowDone = () => {
    const f = flowFrom;
    if (!f || f.k === 'play' || f.k === 'home' || f.k === 'course') { resetPlay(); goTabFresh(!f || f.k === 'play' ? 'sequence' : f.k); return; }
    flowDoneRef.current = false;
    leaveFlow();
  };

  // La sesión abierta (plan guardado antes del agua): cerrarla o descartarla.
  // Ir a una pestaña con datos frescos, SIN router.refresh(): refresh re-pide
  // la página con la URL interna de Next (que puede traer ?seq=… de un
  // deep-link) y el flow arrancaba de nuevo (Marcelo 2026-09-11).
  const goTab = (t: Tab) => {
    if (t !== 'sequence') releasePlayOnLeave();
    setActiveTab(t);
    savePortalState(data.token, { tab: t, lesson: null, lessonFrom: null });
    portalRouter.replace(`${window.location.pathname}?tab=${t}`);
  };
  // Después de GUARDAR una sesión: goTab solo puede salir de la caché de Next
  // (30 s) y el Home mostraba las horas viejas (revisión 2026-10-01). Con la
  // URL ya en ?tab=X, el refresh no reabre ningún ?drill= ni ?seq=.
  const goTabFresh = (t: Tab) => { goTab(t); setTimeout(() => portalRouter.refresh(), 80); };
  const finishOpenSession = (from: 'home' | 'play' = 'home') => {
    const os = openSessionLive;
    if (!os) return;
    resetPlay();
    setFlowFrom({ k: from });
    setPendingSequence({ sequenceId: os.sequenceId, mode: os.mode, focusStepId: os.focusStepId, intention: os.intention, focusMoment: os.focusMoment, sessionId: os.id });
    showTab('sequence');
  };
  // Descartar el plan deja al alumno donde lo tocó (Home o Let's Play).
  const discardOpenSession = async (stay: 'home' | 'sequence' = 'home') => {
    const os = openSessionLive;
    if (!os) return;
    if (!window.confirm('Discard this plan? Nothing gets rated.')) return;
    await discardSession(data.token, os.id);
    setOpenSessionLive(null);
    goTab(stay);
  };
  // Plan guardado (antes del agua): queda atado al flujo y se lee de nuevo.
  const onPlanSaved = async (sessionId: string) => {
    setPendingSequence((p) => (p ? { ...p, sessionId } : p));
    try { setOpenSessionLive(await getOpenSession(data.token)); } catch { /* el refresh del Done lo trae */ }
  };

  const handlePracticeDrill = (drillMissionId: string) => {
    // Desde la lista de Let's Play: Cancel vuelve a la lista (no a un origen viejo).
    if (!pendingSequence) setFlowFrom({ k: 'play' });
    setPendingDrillMissionId(drillMissionId);
    // Stay on 'sequence' tab — Let's Play renders LinkedTrainingFlow inline.
    setActiveTab('sequence');
  };
  // El plan abierto como origen (?from=plan:…): la página de la secuencia dice
  // "‹ Your plan" y vuelve acá con lo ya llenado (Marcelo 2026-10-01).
  const planOrigin: StudentFrom | null = pendingSequence
    ? { k: 'plan', seq: pendingSequence.sequenceId, mode: pendingSequence.mode, ...(pendingSequence.focusStepId ? { focus: pendingSequence.focusStepId } : {}) }
    : null;

  // M9 — academy branding (falls back to TSS defaults when academy
  // hasn't set logo / colors / tagline / name).
  const brand = resolveAcademyBranding((data as any).academyBranding ?? null);

  return (
    <div className="min-h-screen tss-portal-bg pb-20" style={{ background: '#061C2B' }}>
      {/* Header — themed by academy. Slim band: academy logo + tagline on the
          left, The Surf Sequence lineage logo on the right (shown on every
          screen), logout tucked in the corner. */}
      <div style={{ background: brand.primary }} className="px-4 py-3 relative">
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          <button type="button" onClick={() => setGuideOpen(true)} aria-label="How your portal works"
            className="rounded-full w-7 h-7 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.12)' }}>
            <BookOpen size={14} strokeWidth={1.75} style={{ color: '#fff' }} />
          </button>
          <LogoutButton portalToken={data.token} />
        </div>

        {guideOpen && <AthleteGuide onClose={closeGuide} hpAccess={!!data.homeBundle?.hpAccess} />}
        <div className="flex items-center justify-between gap-3 pr-6">
          <div className="flex items-center gap-2.5 min-w-0">
            {brand.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-8 object-contain shrink-0"
              />
            )}
            <p style={{ color: brand.accent }} className="tss-tagline text-xs truncate">
              {brand.tagline}
            </p>
          </div>
          {/* The Surf Sequence lineage logo — always present. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tss-logo-white.png?v=2"
            alt="The Surf Sequence"
            className="h-5 object-contain opacity-90 shrink-0"
          />
        </div>

        {/* Perfil doble: esta persona también trabaja como coach. Las dos caras
            viven separadas a propósito; el interruptor solo salta de una a la
            otra. Va en su propia línea: en la esquina tapaba el logo. */}
        {data.coachSide && (
          <div className="mt-2.5 flex justify-center">
            <RoleSwitch current="athlete" otherHref={data.coachSide.href} accent={brand.accent} />
          </div>
        )}
      </div>

      {/* Tab Content — en tablet/iPad (md:) el lienzo se ensancha para no
          dejar la columna de teléfono flotando en medio de la pantalla. */}
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 py-4">
        {activeTab === 'home' && (
          <HomeTab
            data={{ ...liveData, lineupUnreadLive: lineupUnread } as any}
            belt={belt}
            // Ir a Let's Play desde el Home (Log a session, See your new
            // sequences…) arranca limpio: un flujo abandonado no lo secuestra.
            onGoTo={(t) => { if (t === 'sequence') resetPlay(); showTab(t); }}
            onOpenStep={(id) => openStepInPlay(id, 'home')}
            // "What to train next" abre SIEMPRE el camino: un flujo abandonado
            // (tarea del coach, drill, sesión libre, paso) no lo secuestra.
            onOpenPath={() => { resetPlay(); showTab('sequence'); }}
            onTrainSequence={(a) => { resetPlay(); setFlowFrom({ k: 'home' }); setPendingSequence(a); showTab('sequence'); }}
            onOpenRoadmap={() => setRoadmapOpen(true)}
            onOpenWater={() => setWaterOpen(true)}
            onFinishOpenSession={() => finishOpenSession('home')}
            onDiscardOpenSession={() => discardOpenSession('home')}
            progressAsk={progressAsk}
            onProgressAsked={() => setProgressAsk(null)}
          />
        )}
        {activeTab === 'course' && data.courseData && (
          <div className="space-y-4">
            {/* 'What it takes' vive en My Progress (Your next level); acá repetía (Marcelo 2026-09-16). */}
            <CourseTab
              data={data.courseData}
              // Una lección abierta desde otra pantalla (?from=) vuelve ahí.
              onExit={(f, steps) => {
                if (f.k === 'home') showTab('home');
                else if (f.k === 'play') showTab('sequence');
                else leaveTo(studentBack(f, data.token, { k: 'course' }).href, steps);
              }}
            />
            {/* Las presentaciones otorgadas viven en COURSE, no en el Home
                (pedido de Marcelo 2026-08-25). Es el mismo lugar que ya usa
                el coach en su pestaña Cursos. No dibuja nada si no hay. */}
            <StudentPresentations token={data.token} initial={data.homeBundle?.presentations} />
            {/* El Glosario salió del pie del Course (Marcelo 2026-09-25: "quita el
                glosario también"). Sigue existiendo como subpantalla ?tab=glossary
                por si vuelve. */}
          </div>
        )}
        {activeTab === 'sequence' && (<>
          {/* 0) Secuencia elegida → correrla completa o con un paso como foco.
              "Rehearse it on land first" sale a la página de la secuencia
              (Feel it) y su "‹ Your plan" (o el atrás del teléfono) reabre
              este plan con lo ya llenado: borrador en el teléfono, 30 min
              (Marcelo 2026-10-01). El hidden queda por si una misión se abre
              encima de un plan. */}
          {pendingSequence && (
            <div hidden={!!pendingDrillMissionId}>
              <SequenceTrainingFlow
                key={`${pendingSequence.sequenceId}:${pendingSequence.mode}:${pendingSequence.focusStepId ?? ''}`}
                portalToken={data.token}
                sequenceId={pendingSequence.sequenceId}
                belt={data.courseData?.activeCourseBelt || student.belt_level || 'white'}
                mode={pendingSequence.mode}
                focusStepId={pendingSequence.focusStepId ?? null}
                initialIntention={pendingSequence.intention ?? null}
                initialFocusMoment={pendingSequence.focusMoment ?? null}
                openSession={pendingSequence.sessionId && openSessionLive?.id === pendingSequence.sessionId ? openSessionLive : null}
                goofy={isGoofy(student as any)}
                studentBelt={student.belt_level || 'white_belt'}
                onCancel={leaveFlow}
                backLabel={flowBackLabel}
                onPlanSaved={onPlanSaved}
                onSessionClosed={(id) => {
                  flowDoneRef.current = true;
                  // Evaluada en esta visita: deja de figurar como abierta en el
                  // Home y Let's Play no la vuelve a abrir en la evaluación.
                  setOpenSessionLive((cur) => (cur?.id === id ? null : cur));
                  setPendingSequence((p) => (p && p.sessionId === id ? { ...p, sessionId: null } : p));
                }}
                rehearseHref={(() => { const h = seqPageHref(data, pendingSequence.sequenceId, 'feel'); return h && planOrigin ? withFrom(h, planOrigin) : null; })()}
                planHref={planOrigin ? studentBack(planOrigin, data.token, { k: 'play' }).href : null}
                otherOpenPlan={openSessionLive && openSessionLive.id !== pendingSequence.sessionId ? (openSessionLive.sequenceName || openSessionLive.sequenceLabel || 'another sequence') : null}
                onDone={(next) => {
                  // Marcelo (2026-09-11): "cuando termino me manda otra vez a
                  // iniciar en lugar de Home". router.refresh() re-pedía la
                  // página con la URL interna de Next, que todavía traía
                  // ?seq=… del deep-link → initialTrain → el flow arrancaba de
                  // nuevo. Ahora se navega EXPLÍCITO a la pestaña prometida.
                  setPendingSequence(null);
                  setFlowFrom(null);
                  flowDoneRef.current = false;
                  goTab(next ?? 'sequence');
                  // El plan recién guardado tiene que verse YA en el Home
                  // (Marcelo 2026-09-18: "cierro el plan y no me sale"). La URL
                  // ya quedó en ?tab=… así que el refresh no rearranca el flow.
                  setTimeout(() => portalRouter.refresh(), 80);
                }}
              />
            </div>
          )}
          {pendingDrillMissionId ? (
            // 1) Una misión o drill (desde la lista, un paso, la página de la
            //    secuencia o un link) → el flujo inline. La pantalla final vuelve
            //    al origen ("← Back to <origen>") y ofrece Let's Play aparte.
            <LinkedTrainingFlow
              key={pendingDrillMissionId}
              drillMissionId={pendingDrillMissionId}
              portalToken={data.token}
              studentBelt={student.belt_level || 'white_belt'}
              onClearIncoming={() => { setPendingDrillMissionId(null); if (!pendingSequence) setFlowFrom(null); }}
              onReturnToSequence={() => { resetPlay(); goTabFresh('sequence'); }}
              onDoneBack={pendingSequence ? () => setPendingDrillMissionId(null) : leaveFlowDone}
              // Guardada: salir de Let's Play (barra, atrás) la suelta; con un plan
              // debajo, el plan sigue.
              onSaved={() => { if (!pendingSequence) flowDoneRef.current = true; }}
              // Cancel: el ensayo en tierra abierto DESDE un plan vuelve al plan;
              // una misión abierta desde otra pantalla (la página de la
              // secuencia) vuelve ahí.
              onCancel={pendingSequence ? () => setPendingDrillMissionId(null) : leaveFlow}
              backLabel={pendingSequence ? 'your plan' : flowBackLabel}
            />
          ) : pendingSequence ? null : showCustomSession ? (
            // 2) Custom Session escape hatch — free-form, doesn't count toward step mastery
            <CustomSessionFlow
              portalToken={data.token}
              onCancel={() => setShowCustomSession(false)}
              onDone={() => { setShowCustomSession(false); goTab('sequence'); }}
            />
          ) : !data.hasAnyCourse ? (
            // Los drills vienen EN EL PAQUETE con el curso. Inscribirse a un
            // camp ya lo otorga, así que esto solo aparece para quien nunca
            // compró ni entrenó con nosotros.
            <div className="text-center py-16 px-6">
              <Lock className="mx-auto mb-4 text-[var(--tss-cyan)]" size={56} strokeWidth={1.5} />
              <h2 className="text-xl font-bold mb-2 text-white">Your drills come with your course</h2>
              <p className="text-white/70 mb-2">
                Every level includes its drills and missions. Ask your coach to activate your course
                and they show up here.
              </p>
              <p className="text-sm text-white/40">
                If you are booked on a camp, your course activates when you enrol.
              </p>
            </div>
          ) : data.courseLocked && data.courseData?.courseLock ? (
            // Candado hasta el día antes del camp (Marcelo 2026-09-17).
            <div className="text-center py-16 px-6">
              <Lock className="mx-auto mb-4 text-[var(--tss-cyan)]" size={56} strokeWidth={1.5} />
              <h2 className="text-xl font-bold mb-2 text-white">Let&apos;s Play opens with your course</h2>
              <p className="text-white/70 mb-2">
                Your course unlocks on <strong className="text-white">{new Date(`${data.courseData.courseLock.unlocksOn}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}</strong>, one day before {data.courseData.courseLock.campName ? `your ${data.courseData.courseLock.campName}` : 'your camp'}.
              </p>
              <p className="text-sm text-white/40">Until then, work through the Pre-Course in Course.</p>
            </div>
          ) : data.canTrack === false ? (
            // Curso sí, membresía no (2026-09-08): el curso trae 3 meses de
            // Let's Play; al vencer, acá se renueva. Los drills se siguen
            // VIENDO (son parte del curso) — lo que se cierra es entrenarlos
            // con el sistema y registrar.
            <div className="space-y-4">
              <RenewalGate
                token={data.token}
                firstName={student.first_name || 'surfer'}
                beltLabel={String(student.belt_level || 'surf').replace(/_/g, ' ')}
                endedAt={data.membership?.ends_at ?? null}
                alreadyRequested={!!data.membership?.pending_request}
                inline
              />
              {(data.drillsMissions ?? []).length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: '#0F1E33' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <p className="text-[12px]" style={{ ...F_LABEL, color: '#00D2FF' }}>Your drills and missions</p>
                    <p className="text-[12px] text-white/80 mt-0.5">Part of your course — read them anytime. Train them with the system while your training tool is active.</p>
                  </div>
                  <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
                    {(data.drillsMissions ?? []).map((d: any) => (
                      <li key={d.id} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] px-1.5 py-0.5 rounded font-mono uppercase" style={{ background: d.type === 'mission' ? 'rgba(6,214,160,.15)' : 'rgba(0,210,255,.12)', color: d.type === 'mission' ? '#06D6A0' : '#00D2FF' }}>{d.type}</span>
                          <span className="text-[13px] font-semibold text-white">{d.title}</span>
                          <Lock size={12} className="ml-auto text-white/30" />
                        </div>
                        {d.key_words && <p className="text-[12px] text-white/50 mt-1">{Array.isArray(d.key_words) ? d.key_words.join(' · ') : String(d.key_words)}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // 3) Default: pick a drill or mission from your sequence
            <div className="space-y-4">
              <OpenSessionCard data={liveData} onFinish={() => finishOpenSession('play')} onDiscard={() => discardOpenSession('sequence')} />
              <NextMovesBlock
                data={liveData}
                mode="full"
                onTrainSequence={(args) => { resetPlay(); setFlowFrom({ k: 'play' }); setPendingSequence(args); }}
                onOpenStep={(id) => openStepInPlay(id, 'play')}
                onGoTo={showTab}
              />
              <MySequenceTab
                portalToken={data.token}
                belt={data.courseData?.activeCourseBelt || student.belt_level || 'white'}
                onPracticeDrill={handlePracticeDrill}
                onTrainSequence={(args) => {
                  // "Practice" desde el detalle de un paso: Cancel vuelve a ese paso
                  // (y ese paso conserva su propio origen: la lista o afuera).
                  const fromStep = args.returnStepId ?? null;
                  if (fromStep && !args.returnStepOutside) setStepFrom('play');
                  setDeepStepId(null); setPendingSequence(args);
                  setFlowFrom(fromStep ? { k: 'step', id: fromStep } : { k: 'play' });
                }}
                initialStepId={deepStepId}
                onStepBack={leaveStep}
                stepBackLabel={stepBackLabel}
                ownedBelts={data.ownedBelts ?? []}
                venueDone={(() => { const l = (data.courseData?.lessons ?? []).find((x: any) => x.id === 'ONB-06'); return l ? !!l.completed : null; })()}
              />
              <button
                type="button"
                onClick={() => setShowCustomSession(true)}
                className="w-full rounded-lg p-4 text-left transition-colors"
                style={{ background: T_CREAM, border: customOpen ? `1.5px solid ${T_INK}` : `1px dashed #9AA6AD` }}
              >
                <p className="inline-flex items-center gap-1.5" style={{ ...T_LABEL, color: T_MUTED }}>
                  <Waves size={14} strokeWidth={1.75} />
                  {customOpen ? 'Custom Session in progress' : 'Custom Session'}
                </p>
                <p className="text-[16px] font-bold mt-1" style={{ color: T_INK }}>
                  {customOpen ? (customOpen.focus || 'Your session') : 'Free surf, breathing, fun — anything off-script'}
                </p>
                <p className="text-[13px] mt-1" style={{ color: T_MUTED }}>
                  {customOpen ? 'Tap to finish & review, or discard it.' : 'Logged for the record but does NOT count toward step mastery.'}
                </p>
              </button>

              {/* ── TOOLS — un solo grupo (rediseño Marcelo 2026-09-01) ──
                  Antes eran tres "secciones" huérfanas con una tarjeta cada
                  una y la etiqueta repitiendo el título de la tarjeta. Las
                  tarjetas ya se presentan solas (ícono + título + subtítulo):
                  un encabezado y la grilla alcanzan. */}
              <div>
                <p className="text-[26px] mb-2.5" style={{ ...H_BIG, color: '#F8F5EC' }}>Tools</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <VideoAnalyzerLauncher
                    scope={`student:${data.token}`}
                    title="Analyze your surfing"
                    subtitle="Load your clip, compare it to the Surf Sequence models, and draw lines & angles frame by frame."
                  />
                  <VenueScoutLauncher variant="light" belt={student.belt_level} ocean={(student as any).ocean_level ?? null} />
                  {/* Breathwork: fuera por ahora (Marcelo 2026-09-16, 'no está bien hecha todavía'). */}
                </div>
              </div>
            </div>
          )}
        </>)}
        {activeTab === 'lineup' && (data as any).lineup && (
          <LineupTab
            token={data.token}
            initial={(data as any).lineup}
            onSeen={() => setLineupSeen(true)}
          />
        )}
        {/* Subpantallas fuera de la barra (Marcelo 2026-10-01, continuidad): su
            "← Home", igual que My progress y el buzón. */}
        {SUB_SCREENS.includes(activeTab) && (
          <button type="button" onClick={() => showTab('home')} className="inline-flex items-center gap-2 text-[15px] font-semibold py-2 mb-2" style={{ color: '#00D2FF' }}>
            <ArrowLeft size={18} /> Home
          </button>
        )}
        {activeTab === 'sessions' && <SessionsTab data={data} />}
        {activeTab === 'glossary' && <GlossaryTab />}
        {activeTab === 'feedback' && (
          <FeedbackTab
            data={data}
            autoExpandFirst={initialTab === 'feedback'}
            initialSurveyId={initialSurveyId || null}
            onOpenSessions={openMySessions}
          />
        )}
        {activeTab === 'my-coach' && data.myCoach && <MyCoachTab data={data} />}

        {/* La guía de requisitos vive sobre cualquier pestaña. */}
        {roadmapOpen && (
          <BeltRoadmap
            token={data.token}
            onClose={() => setRoadmapOpen(false)}
            onOpenStep={(id) => openStepInPlay(id, 'roadmap')}
            onTrainSequence={(a) => { setRoadmapOpen(false); resetPlay(); setFlowFrom({ k: 'roadmap' }); setPendingSequence(a); showTab('sequence'); }}
            onOpenWater={() => setWaterOpen(true)}
          />
        )}
        {waterOpen && <WaterLevel token={data.token} onClose={() => setWaterOpen(false)} />}
      </div>

      {/* Bottom Tab Bar — active tab gets a 2px cyan rule on top so the
          state reads instantly without filling the whole tab. */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg md:max-w-3xl mx-auto flex">
          {TABS.map((tab) => {
            // Las subpantallas (Sessions, Feedback, Glossary) cuelgan del Home.
            const isActive = activeTab === tab.key || (tab.key === 'home' && SUB_SCREENS.includes(activeTab));
            return (
              <button
                key={tab.key}
                onClick={() => {
                  // Tocar la pestaña en la que ya estás no cambia nada (si no,
                  // soltaba la lección abierta y la URL quedaba desfasada).
                  if (tab.key === activeTab) return;
                  // La barra cambia de pestaña: la lección abierta se suelta
                  // (antes el Course volvía a la última lección durante 10 min)
                  // y la URL dice en qué pestaña estás.
                  // Recién guardada una sesión (pantalla final): la pestaña se
                  // carga fresca, con las horas y la estrella nuevas (2026-10-01).
                  if (flowDoneRef.current) { goTabFresh(tab.key); return; }
                  showTab(tab.key);
                }}
                className={`relative flex-1 flex flex-col items-center py-2.5 text-[12px] font-semibold transition-colors ${
                  isActive ? 'text-[var(--tss-navy)]' : 'text-gray-400 hover:text-gray-600'
                }`}
                style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                    style={{ background: 'var(--tss-cyan)' }}
                  />
                )}
                <tab.icon
                  size={19}
                  strokeWidth={1.75}
                  className="mb-1"
                  color={isActive ? 'var(--tss-cyan)' : undefined}
                />
                <span className="uppercase">{tab.label}</span>
                {tab.key === 'feedback' && (data.pendingSurveys.length + (data.pendingExperience ? 1 : 0)) > 0 && (
                  <span className="absolute top-1 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
                )}
                {tab.key === 'lineup' && lineupUnread > 0 && (
                  <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full" style={{ background: 'var(--tss-cyan)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 pb-24">
        <p className="text-[12px] text-gray-300">The Surf Sequence -- {BRAND.tagline}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 1: HOME (improved with level card + training tip)
// ═══════════════════════════════════════

function HomeTab({
  data,
  belt,
  onGoTo,
  onOpenStep,
  onTrainSequence,
  onOpenRoadmap,
  onOpenWater,
  onFinishOpenSession,
  onDiscardOpenSession,
  onOpenPath,
  progressAsk,
  onProgressAsked,
}: {
  data: PortalData;
  belt: any;
  onGoTo: (tab: Tab) => void;
  /** Otra pantalla pide My progress abierto en una sección (2026-10-01). */
  progressAsk?: 'sessions' | null;
  onProgressAsked?: () => void;
  /** Let's Play en el camino (sin flujos viejos abiertos). */
  onOpenPath?: () => void;
  /** La sesión abierta (plan guardado antes del agua): cerrarla o descartarla. */
  onFinishOpenSession?: () => void;
  onDiscardOpenSession?: () => void;
  /** Abre un paso puntual en Let's Play. */
  onOpenStep?: (stepId: string) => void;
  /** Arranca el entreno por secuencia con un paso como foco (Let's Play). */
  onTrainSequence?: (args: TrainSequenceArgs) => void;
  /** Abre la guía de requisitos de la próxima cinta. */
  onOpenRoadmap?: () => void;
  /** Abre "Your water level" — la línea del agua, aparte. */
  onOpenWater?: () => void;
}) {
  const { student, sessions, totalSessions, streak, selfTrainingCount, totalTrainingMinutes, drillsPracticed, recentDrills } = data;
  // 🔔 Mensajes del coach unificados en la campana (pedido Marcelo 2026-08-25):
  // badge con no-leídos, tap abre el buzón (con estado vacío — un solo destino,
  // sin sorpresas). La tarjeta suelta del Home se eliminó. inboxReadFor evita
  // el badge fantasma: HomeTab se desmonta al cambiar de tab y el bundle
  // server-side no se refetchea — sin esta marca, lo ya leído volvía a contar.
  const [inboxMsgs, setInboxMsgs] = useState<any[]>(() => {
    const ms = (data as any).homeBundle?.messages ?? [];
    return inboxReadFor === data.token ? ms.map((m: any) => ({ ...m, read: true })) : ms;
  });
  const [inboxOpen, setInboxOpen] = useState(false);
  const unreadMsgs = inboxMsgs.filter((m: any) => !m.read).length;
  const openInbox = () => {
    setInboxOpen(true);
    if (unreadMsgs > 0) {
      inboxReadFor = data.token;
      markMyMessagesRead(data.token)
        .then(() => setInboxMsgs((ms) => ms.map((m: any) => ({ ...m, read: true }))))
        .catch(() => {});
    }
  };
  // Overlay abierto = el Home de atrás no scrollea (mismo patrón que SeasonCard).
  useEffect(() => {
    if (!inboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [inboxOpen]);
  // Nivel de agua CONFIRMADO por un coach. El provisional (el del quiz de
  // ingreso) no se muestra: es lo que el alumno dice de sí mismo.
  const oceanKey = (student as any).ocean_level as OceanLevel | null;
  const oceanConfirmed =
    oceanKey && !(student as any).ocean_level_provisional
      ? OCEAN_LEVEL_INFO[oceanKey] ?? null
      : null;
  const latestResult = sessions[0];
  const trainingHours = Math.round((totalTrainingMinutes / 60) * 10) / 10;
  const beltLevel = student.belt_level as BeltLevel;
  const upcoming = data.upcomingMultiBlock ?? [];
  // M45 — official services (camp_instances) take precedence over legacy
  // multi_block_sessions. If both exist we show the camp card first.
  const upcomingCamps = (data as any).upcomingCamps ?? [];
  // Most recent past camp where the coach left a final-evaluation note.
  const campWithNote = ((data as any).pastCamps ?? []).find((c: any) => c.coach_final_note);
  // Resultado del camp recién cerrado (2026-09-18): 21 días visible en el Home.
  const recentCampResult = ((data as any).pastCamps ?? []).find((c: any) => {
    if (!c.final?.at) return false;
    return Date.now() - new Date(c.final.at).getTime() < 21 * 86400000;
  }) ?? null;
  // ═══ EL HOME EN UNA REGLA (Marcelo 2026-09-26: "que sienta claridad, que es
  // lo que vende el método"). UNA tarjeta de acción, SOLO cuando es seguro:
  //   1 sesión abierta (arriba del nombre, como siempre)
  //   2 la clase con el coach: camp en curso o clase hoy/mañana
  //   3 la tarea del coach (fuera de camp)
  // 2026-09-29 (Marcelo): si nadie le dejó nada, NO adivinamos qué entrenar
  // (el mar cambia el foco): la lista de secuencias vive en Let's Play y el
  // Home muestra sus datos (horas, Flow Channel, secuencias) + "What to train
  // next". Después, filas de una línea que no compiten.
  const campNow: any = upcomingCamps[0] ?? null;
  const campStart = campNow ? new Date((campNow.start_date ?? '') + 'T00:00:00') : null;
  const campEnd = campNow ? new Date(((campNow.last_day ?? campNow.end_date ?? campNow.start_date) ?? '') + 'T00:00:00') : null;
  // Hoy en El Salvador, igual en el servidor (UTC) y en el teléfono (revisión 2026-09-26).
  const today0 = new Date(elSalvadorToday() + 'T00:00:00');
  // Camp corto: cuenta SUS días (3 de un camp de 6), no los del camp.
  const campDays = campNow?.stay_days ?? (campStart && campEnd ? Math.max(1, Math.round((campEnd.getTime() - campStart.getTime()) / 86400000) + 1) : 0);
  const campDayNum = campStart && today0 >= campStart ? Math.min(campDays, Math.round((today0.getTime() - campStart.getTime()) / 86400000) + 1) : null;
  const daysToCamp = campStart ? Math.round((campStart.getTime() - today0.getTime()) / 86400000) : null;
  // La clase manda con el camp en curso o hasta 7 días antes: es la semana en
  // que el alumno llega con el Pre-Course hecho (los 4 clientes del lunes
  // 2026-09-28 abren el portal el sábado con el curso bajo candado y sin otra
  // tarjeta posible). Más lejos, una fila 'Next camp'.
  // Revisión 2026-09-26: un camp con curso bajo candado manda siempre (no hay
  // otra acción posible); un servicio suelto (clase, lesson, trip) solo el
  // día antes y el día, para no tapar una semana la tarea del coach.
  const beltCamp = campNow ? campNow.belt_camp !== false : false;
  const classSoon = !!campNow && (
    campDayNum != null
    || (daysToCamp != null && daysToCamp <= (beltCamp ? 7 : 1))
    || (beltCamp && !!data.courseLocked)
  );
  const coachTask = data.canTrack !== false && !data.courseLocked && data.coachFocus && (data.coachFocus.label || data.coachFocus.text) ? data.coachFocus : null;
  const seqScores = data.canTrack !== false && !data.courseLocked && (data.sequenceScores?.rows?.length ?? 0) > 0 ? data.sequenceScores! : null;
  const seqRows = seqScores ? (seqScores.rows.filter((r) => !r.aside).length ? seqScores.rows.filter((r) => !r.aside) : seqScores.rows) : [];
  const seqOwned = seqRows.filter((r) => r.state === 'owned').length;
  const allOwned = seqRows.length > 0 && seqOwned === seqRows.length;
  const preCourseDone = data.courseData?.preCourseCompleted;
  const courseBeltWord = seqScores ? seqScores.belt.charAt(0).toUpperCase() + seqScores.belt.slice(1) : null;
  const slot: 'class' | 'coach' | null =
    data.openSession ? null
    : classSoon ? 'class' : coachTask ? 'coach' : null;
  const surf = data.surfHours ?? { trainingMinutes: 0, freeSurfMinutes: 0, totalMinutes: 0 };
  const fmtHm = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  // Training tip of the day — rotate based on day of year
  // El cue rota por SESIONES CERRADAS, no por día del calendario: trae un
  // "Today", así que tiene que cambiar cuando el alumno entrena.
  const beltMirror = BELT_MIRROR[beltLevel] ?? BELT_MIRROR.white_belt;
  const sessionCue = cueForSession(beltLevel, totalSessions);

  // Lector del libro dentro del portal (2026-09-08).
  const [reader, setReader] = useState<{ id: string; title: string } | null>(null);
  // MY PROGRESS como pantalla propia (mock 2026-09-15 + "que no se repita la
  // información"): cinta, horas, próxima cinta, flow y camino viven acá, no
  // duplicados en el Home. Se abre desde "View my progress".
  const [progressOpen, setProgressOpen] = useState(false);
  useEffect(() => {
    if (!progressOpen) return;
    document.getElementById('progress-view')?.scrollTo(0, 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [progressOpen]);
  // Abre la sección My Sessions de My progress (una sola versión de este código).
  const openSessionsDetails = () => { const d = document.getElementById('my-sessions') as HTMLDetailsElement | null; if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
  // Pedido desde otra pantalla (la encuesta enviada, 2026-10-01): My progress → My Sessions.
  useEffect(() => {
    if (!progressAsk) return;
    setProgressOpen(true);
    // Sin cleanup a propósito: onProgressAsked cambia la prop y cancelaría el timer.
    setTimeout(() => { openSessionsDetails(); onProgressAsked?.(); }, 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressAsk]);
  return (
    <div className="space-y-4">
      {/* ═══ LO ACCIONABLE PRIMERO (auditoría 2026-09-10): a 360px el botón
          quedaba a 629px de alto, debajo del libro, la racha y las horas. En
          la playa el alumno abre el app para UNA cosa: cerrar la sesión o
          saber qué entrenar. Eso va arriba del nombre. ═══ */}
      {onFinishOpenSession && onDiscardOpenSession && <OpenSessionCard data={data} onFinish={onFinishOpenSession} onDiscard={onDiscardOpenSession} />}

      {/* ── Identidad (diseño A "Clarity", Marcelo 2026-10-01): el aro de la foto
          es el color de la cinta y la cinta es la puerta a My progress. Sin
          "Current level": la pastilla ya lo dice. La campana sigue al lado. ── */}
      <div className="flex items-center gap-3.5">
        <div className="w-[58px] h-[58px] rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ border: `3px solid ${onNavyBeltColor(beltLevel, belt?.color)}`, background: '#10263B' }}>
          {student.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[19px] font-extrabold" style={{ fontFamily: ARCHIVO, color: '#F7F9FA', letterSpacing: '0.02em' }}>
              {`${(student.first_name || '?').slice(0, 1)}${(student.last_name || '').slice(0, 1)}`.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[24px] font-extrabold leading-[1.05]" style={{ fontFamily: ARCHIVO, color: '#F7F9FA', letterSpacing: '-0.01em' }}>
            {student.first_name} {student.last_name}
          </p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => { if (data.canTrack !== false) setProgressOpen(true); }} className="inline-flex items-center rounded-[4px] px-2 py-[3px]"
              style={{ ...HOME_MONO, fontSize: 11, letterSpacing: '0.1em', background: belt?.color || '#E8E8E8', color: LIGHT_BELTS.includes(beltLevel) ? T_NAVY : '#fff' }}>
              {belt?.en}
            </button>
            <span className="text-[14px]" style={{ color: '#C9D6DD' }}>{belt?.levelName ? `${belt.levelName} · ` : ''}Level {BELT_RANK[beltLevel] ?? 1} of 6</span>
            {/* Cinta provisional (del quiz): etiqueta, no caja. El coach la confirma en el agua. */}
            {(student as any).belt_provisional && <span style={{ ...T_LABEL, color: '#D9E4EA', opacity: 0.75 }}>provisional</span>}
          </div>
        </div>
        {data.canTrack !== false && (
          <button type="button" onClick={openInbox} aria-label="Notifications" className="relative p-2.5 -m-2.5 shrink-0 self-start">
            <Bell size={22} strokeWidth={1.75} style={{ color: unreadMsgs > 0 ? '#00D2FF' : '#F7F9FA' }} />
            {unreadMsgs > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full text-[12px] font-bold flex items-center justify-center"
                style={{ minWidth: 15, height: 15, background: '#FF6B6B', color: '#061C2B', padding: '0 3px' }}>
                {unreadMsgs}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ═══ EL AGUA, EN UN CÍRCULO (Marcelo 2026-10-01: "antes era un círculo
          y cambiaba de color según free surf o training… era más visual y
          bonito"). Cyan = training, verde = free surf, el total en el centro.
          Abajo, las secuencias de la cinta. Toda la tarjeta abre My progress. ═══ */}
      {data.canTrack !== false && (() => {
        const bIdx = BELT_HIERARCHY.indexOf(beltLevel);
        const nextBelt = bIdx >= 0 && bIdx < BELT_HIERARCHY.length - 1 ? BELT_DISPLAY[BELT_HIERARCHY[bIdx + 1]] : null;
        const nextWord = nextBelt ? String(nextBelt.en).replace(/ Belt$/, '') : null;
        return (
          <button type="button" onClick={() => setProgressOpen(true)} className="w-full text-left rounded-lg px-3.5 pt-3.5 pb-3 flex flex-col gap-3"
            style={{ background: HOME_CARD, border: `1px solid ${HOME_LINE}`, color: '#F7F9FA' }}>
            <span className="flex items-center gap-[18px] w-full">
              <WaterRing trainingMinutes={surf.trainingMinutes} freeSurfMinutes={surf.freeSurfMinutes} />
              <span className="min-w-0 flex-1 flex flex-col gap-2.5">
                <span style={{ ...HOME_MONO, color: '#8FB3C4' }}>Time in the water</span>
                {surf.totalMinutes > 0 ? (
                  <>
                    <span className="flex items-center gap-2 text-[14px]">
                      <span className="shrink-0" style={{ width: 10, height: 10, borderRadius: 5, background: '#00D2FF' }} />
                      <span className="flex-1" style={{ color: '#C9D6DD' }}>Training</span>
                      <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtHm(surf.trainingMinutes)}</b>
                    </span>
                    <span className="flex items-center gap-2 text-[14px]">
                      <span className="shrink-0" style={{ width: 10, height: 10, borderRadius: 5, background: '#06D6A0' }} />
                      <span className="flex-1" style={{ color: '#C9D6DD' }}>Free surf</span>
                      <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtHm(surf.freeSurfMinutes)}</b>
                    </span>
                  </>
                ) : (
                  <span className="text-[15px] font-bold leading-snug">Your first session starts the count.</span>
                )}
                {streak > 0 && <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: '#A9BCC7' }}><Flame size={13} strokeWidth={1.75} />{streak}-day streak</span>}
              </span>
            </span>
            <span className="flex items-center justify-between gap-3 pt-2.5 text-[13px] w-full" style={{ borderTop: `1px solid ${HOME_LINE}`, color: '#C9D6DD' }}>
              <span className="min-w-0">
                {seqRows.length ? (
                  <><b style={{ color: '#F7F9FA' }}>{seqOwned} / {seqRows.length}</b> sequences{courseBeltWord ? ` · ${courseBeltWord} Belt` : ''}{allOwned ? ' · all yours' : ''}</>
                ) : nextWord ? (
                  <>Next belt · <b style={{ color: '#F7F9FA' }}>{nextWord}</b></>
                ) : 'Top belt reached'}
              </span>
              <span className="shrink-0 inline-flex items-center gap-1 font-semibold" style={{ color: '#00D2FF' }}>My progress <ChevronRight size={14} /></span>
            </span>
          </button>
        );
      })()}

      {/* ═══ LA TARJETA DE ACCIÓN · 1 de 3: LA CLASE (Marcelo 2026-09-26) ═══
          En camp (o con clase mañana) lo primero es la clase con el coach: día,
          qué va a trabajar, qué estudiar. La tarea del coach entra ACÁ como
          línea, sin TRAIN IT: en el camp se entrena con el coach (doctrina
          2026-09-19). Diseño A 2026-10-01: todo sobre la arena, sin caja navy. */}
      {slot === 'class' && (() => {
        const c: any = upcomingCamps[0];
        const startD = new Date((c.start_date ?? '') + 'T00:00:00');
        const endD = new Date(((c.end_date ?? c.start_date) ?? '') + 'T00:00:00');
        const todayD = new Date(elSalvadorToday() + 'T00:00:00');
        const totalDays = c.stay_days ?? Math.max(1, Math.round((endD.getTime() - startD.getTime()) / 86400000) + 1);
        const dayNum = todayD >= startD ? Math.min(totalDays, Math.round((todayD.getTime() - startD.getTime()) / 86400000) + 1) : null;
        const certN = c.coach?.certification_level ? String(c.coach.certification_level).replace(/\D/g, '') : null;
        const plansArr: any[] = Array.isArray(c.plans) ? c.plans : [];
        const topicsArr: any[] = Array.isArray(c.topics) ? c.topics : [];
        const hasPlan = plansArr.length > 0 || topicsArr.length > 0;
        const sd = c.next_session?.session_date as string | undefined;
        const when = (() => {
          if (!sd) return 'Next session';
          const d = new Date(sd + 'T00:00:00');
          const diff = Math.round((d.getTime() - todayD.getTime()) / 86400000);
          return diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' });
        })();
        const many = plansArr.length > 1;
        return (
          <div className="rounded-lg px-4 pt-[18px] pb-4 flex flex-col gap-3" style={{ background: T_CREAM, color: T_INK }}>
            <div className="flex items-center justify-between gap-3">
              <span style={{ ...HOME_MONO, color: SAND_LABEL }}>{dayNum ? (beltCamp ? 'Today · your camp' : 'Today') : 'Next class'}</span>
              <span style={{ ...HOME_MONO, letterSpacing: '0.08em', color: T_MUTED }}>
                {dayNum ? `Day ${dayNum} of ${totalDays}` : startD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            {/* El plan del coach para la próxima sesión, en el idioma del curso
                (Marcelo 2026-09-17): la secuencia y el foco, con Study it y
                Rehearse it para llegar preparado. Solo si el coach ya lo armó. */}
            {/* Con secuencias, el título es lo que va a trabajar y el camp va
                chico arriba; sin secuencias (nada o solo teoría), el camp es el título. */}
            <div className="flex flex-col gap-1">
              {plansArr.length > 0 ? (
                <p className="text-[13px] font-bold" style={{ color: T_MUTED }}>{c.camp_name}</p>
              ) : (
                <p className="text-[23px] font-extrabold leading-[1.12]" style={{ fontFamily: ARCHIVO, letterSpacing: '-0.01em' }}>{c.camp_name}</p>
              )}
              {hasPlan && (
                <p className="text-[13px] font-bold" style={{ color: T_MUTED }}>
                  {when}{c.coach?.display_name ? ` with ${c.coach.display_name}` : ''}{plansArr.length ? ' · you will work on' : ' · theory'}{many ? ` · ${plansArr.length} ${plansArr.every((p: any) => p.kind !== 'tool') ? 'sequences' : 'things'}, one at a time` : ''}
                </p>
              )}
            </div>
            {plansArr.length > 0 && (
              <div className={many ? 'space-y-2.5' : ''}>
                {plansArr.map((pl: any, i: number) => {
                  const isGame = pl.kind === 'game';
                  const isCircle = pl.kind === 'circle';
                  const seqBase = isGame || isCircle ? `/portal/${data.token}/circles` : `/portal/${data.token}/seq/${pl.sequenceId}`;
                  // Desde el Home: el Back de la página vuelve al Home.
                  const seqHref = withFrom(seqBase, { k: 'home' });
                  const rehearseHref = withFrom(`${seqBase}?tab=feel`, { k: 'home' });
                  return (
                    <div key={`${pl.sequenceId}:${i}`} className={many ? 'rounded-[5px] px-3 py-3' : ''} style={many ? { background: T_PAPER, border: `1px solid ${T_BORDER}` } : undefined}>
                      <p className={`${many ? 'text-[19px]' : 'text-[23px]'} font-extrabold leading-[1.12]`} style={{ fontFamily: ARCHIVO, letterSpacing: '-0.01em' }}>
                        {many ? `${i + 1} · ` : ''}{pl.label ?? (pl.kind === 'entry' ? pl.title : `#${pl.number} · ${pl.title}`)}
                      </p>
                      <p className="mt-1 text-[15px] leading-snug">
                        {pl.kind === 'game' ? 'One rule, the wave is the referee. You play it with your coach; your coach stars it. Tonight, learn the rule.' : pl.focus.length > 0 ? <>Your focus: {pl.focus.join(' · ')}</> : pl.kind === 'tool' ? 'All three moments.' : 'The whole sequence, start to finish.'}
                      </p>
                      {pl.notes && <p className="mt-1 text-[14px] italic leading-snug">&ldquo;{pl.notes}&rdquo;</p>}
                      {/* Durante el camp el entreno es CON el coach y lo califica el coach
                          (Marcelo 2026-09-19): el alumno estudia y ensaya en tierra, no
                          registra solo. Por eso el juego no tiene "Play it" acá. */}
                      <div className={`mt-3 grid gap-2 ${isGame || isCircle ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <a href={seqHref} className="min-h-[48px] rounded-[5px] flex items-center justify-center text-[15px] font-black uppercase no-underline" style={{ background: '#00D2FF', color: T_NAVY, fontFamily: ARCHIVO, letterSpacing: '0.04em' }}>Study it</a>
                        {!isGame && !isCircle && <a href={rehearseHref} className="min-h-[48px] rounded-[5px] flex items-center justify-center text-center px-1 text-[13px] font-extrabold uppercase no-underline leading-tight" style={{ color: T_INK, border: `1.5px solid ${T_INK}`, fontFamily: ARCHIVO, letterSpacing: '0.03em' }}>Rehearse it on land</a>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {topicsArr.length > 0 && (
              <div className="pt-2.5" style={{ borderTop: '1px solid #D3CCB9' }}>
                <p style={{ ...HOME_MONO, fontSize: 10.5, letterSpacing: '0.1em', color: T_MUTED }}>Also today · theory</p>
                <div className="mt-1.5 space-y-1.5">
                  {topicsArr.map((t: any) => {
                    // Study it solo si el alumno tiene lo que abre (2026-10-01): sin el
                    // curso, el tema se nombra igual (es la teoría del día), sin botón.
                    const lid = String(t.id).startsWith('lesson:') ? String(t.id).slice(7) : null;
                    const sec = lid ? ((data.courseData?.lessons ?? []).find((l: any) => l.id === lid)?.course_section ?? null) : null;
                    const canStudy = topicOpenFor(String(t.id), { open: data.ownedBelts ?? [], anyCourse: !!data.hasAnyCourse, courseLocked: !!data.courseLocked, lessonSection: sec });
                    return (
                      <div key={t.id} className="flex items-center justify-between gap-3">
                        <p className="text-[15px] font-bold leading-snug">{t.title}</p>
                        {canStudy && <a href={withFrom(`/portal/${data.token}${t.href}`, { k: 'home' })} className="shrink-0 rounded-[5px] px-3 py-1.5 text-[12px] font-black uppercase no-underline" style={{ color: T_INK, border: `1.5px solid ${T_INK}`, fontFamily: ARCHIVO }}>Study it</a>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {coachTask && (
              <div className="pt-2.5" style={{ borderTop: '1px solid #D3CCB9' }}>
                <p style={{ ...HOME_MONO, fontSize: 10.5, letterSpacing: '0.1em', color: T_MUTED }}>From your coach</p>
                <p className="text-[15px] font-bold leading-snug mt-1">{coachTask.label ?? 'A note from your coach'}</p>
                {(coachTask.label ? coachTask.note : coachTask.text) && <p className="text-[14px] mt-0.5 leading-snug italic">{coachTask.label ? coachTask.note : coachTask.text}</p>}
                <p className="text-[13px] mt-1" style={{ color: T_MUTED }}>You work it with your coach in class.</p>
              </div>
            )}
            {preCourseDone === false && data.hasAnyCourse && beltCamp && (
              <button type="button" onClick={() => onGoTo('course')} className="w-full flex items-center justify-between gap-3 rounded-[5px] px-3 py-2.5 text-left" style={{ background: T_PAPER, border: `1px solid ${T_BORDER}` }}>
                <span className="min-w-0">
                  <span style={{ ...HOME_MONO, fontSize: 10.5, letterSpacing: '0.1em', color: SAND_LABEL }}>{campDayNum ? 'Pre-Course · still open' : 'Before day 1'}</span>
                  <span className="block text-[15px] font-bold leading-snug" style={{ color: T_INK }}>Finish the Pre-Course — it is what your camp builds on</span>
                </span>
                <ArrowRight size={16} style={{ color: T_INK }} />
              </button>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: T_MUTED }}>
              {c.scheduled_time && (
                <span className="inline-flex items-center gap-1.5"><Clock size={14} style={{ color: SAND_LABEL }} />{c.scheduled_time}</span>
              )}
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} style={{ color: SAND_LABEL }} />{totalDays} day{totalDays === 1 ? '' : 's'}</span>
            </div>
            {c.coach && (
              <button type="button" onClick={() => { if (data.coachProfileUnlocked) onGoTo('my-coach'); }} className="w-full flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-left" style={{ background: T_PAPER, border: `1px solid ${T_BORDER}`, cursor: data.coachProfileUnlocked ? 'pointer' : 'default' }}>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: T_INK }}>
                  {c.coach.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.coach.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[12px] font-extrabold" style={{ color: T_CREAM }}>{initialsOf(c.coach.display_name)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: T_INK }}>{c.coach.display_name}</p>
                  {certN && <p className="text-[12px] mt-0.5" style={{ ...F_LABEL, color: T_MUTED }}>Level {certN} certified</p>}
                </div>
                {data.coachProfileUnlocked && <ChevronRight size={16} className="shrink-0" style={{ color: T_MUTED }} />}
              </button>
            )}
          </div>
        );
      })()}

      {/* ═══ 2 de 3: LA TAREA DEL COACH (Marcelo 2026-09-25): "le aparece, y
          si la trabaja una vez deja de aparecer". Fuera de camp es LA tarjeta
          mientras esté pendiente; el servidor la quita cuando registra una
          sesión sobre ella. Diseño A: la secuencia chica arriba, el paso
          grande, quién la dejó con sus iniciales. */}
      {slot === 'coach' && coachTask && (() => {
        const cf = coachTask;
        const when = cf.set_at ? new Date(cf.set_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' }) : null;
        const who = cf.set_by_name ? `${cf.set_by_name} left it for you` : 'Your coach left it for you';
        const split = !!(cf.sequence_label && cf.step_label);
        const note = cf.label ? cf.note : cf.text;
        const train = cf.sequence_id
          ? () => { if (onTrainSequence) onTrainSequence({ sequenceId: cf.sequence_id!, mode: 'step_focus', focusStepId: cf.step_id, intention: cf.note }); else onGoTo('sequence'); }
          : cf.step_id ? () => onOpenStep?.(cf.step_id!) : null;
        return (
          <div className="rounded-lg px-4 pt-[18px] pb-4 flex flex-col gap-3" style={{ background: T_CREAM, color: T_INK }}>
            <div className="flex items-center justify-between gap-3">
              <span style={{ ...HOME_MONO, color: SAND_LABEL }}>From your coach</span>
              {when && <span style={{ ...HOME_MONO, letterSpacing: '0.08em', color: T_MUTED }}>{when}</span>}
            </div>
            <div className="flex flex-col gap-1">
              {split && <p className="text-[13px] font-bold" style={{ color: T_MUTED }}>{cf.sequence_label}</p>}
              <p className="text-[23px] font-extrabold leading-[1.12]" style={{ fontFamily: ARCHIVO, letterSpacing: '-0.01em' }}>{split ? cf.step_label : cf.label ?? 'A note from your coach'}</p>
            </div>
            {note && <p className="text-[15px] leading-snug font-semibold italic">{note}</p>}
            <div className="flex items-center gap-2.5 text-[14px]">
              <span className="w-7 h-7 rounded-full grid place-items-center shrink-0 text-[11px] font-extrabold" style={{ background: T_INK, color: T_CREAM }}>{initialsOf(cf.set_by_name)}</span>
              <span>{who}{cf.label ? ' · train it once and it clears' : ' · keep it in mind in your next session'}</span>
            </div>
            {train && (
              <button type="button" onClick={train}
                className="w-full min-h-[52px] rounded-[5px] flex items-center justify-center gap-2.5 text-[17px] font-black uppercase"
                style={{ background: BRAND.colors.cyan, color: T_NAVY, letterSpacing: '0.04em', fontFamily: ARCHIVO }}>
                Train it <ArrowRight size={18} />
              </button>
            )}
            {cf.sequence_id && seqPageHref(data, cf.sequence_id) && (
              <a href={withFrom(seqPageHref(data, cf.sequence_id)!, { k: 'home' })} className="self-center inline-flex items-center gap-1 text-[14px] font-bold no-underline" style={{ color: T_INK }}>
                Open the sequence page <ChevronRight size={15} />
              </a>
            )}
          </div>
        );
      })()}

      {/* ═══ 3 de 3: QUÉ ENTRENAR (Marcelo 2026-09-29): si nadie le dejó nada,
          NO adivinamos qué entrenar (el mar cambia el foco): Let's Play con su
          camino. Diseño A: la misma tarjeta de arena que las otras dos. ═══ */}
      {data.canTrack !== false && data.hasAnyCourse !== false && !data.courseLocked && slot === null && !data.openSession && (
        <div className="rounded-lg px-4 pt-[18px] pb-4 flex flex-col gap-3" style={{ background: T_CREAM, color: T_INK }}>
          <span style={{ ...HOME_MONO, color: SAND_LABEL }}>What to train next</span>
          <p className="text-[23px] font-extrabold leading-[1.12]" style={{ fontFamily: ARCHIVO, letterSpacing: '-0.01em' }}>Pick it by today&apos;s ocean</p>
          <p className="text-[15px] leading-snug">Your path in Let&apos;s Play shows the next sequence and the step holding it back.</p>
          <button type="button" onClick={() => { if (onOpenPath) onOpenPath(); else onGoTo('sequence'); window.scrollTo(0, 0); }}
            className="w-full min-h-[52px] rounded-[5px] flex items-center justify-center gap-2.5 text-[17px] font-black uppercase"
            style={{ background: BRAND.colors.cyan, color: T_NAVY, letterSpacing: '0.04em', fontFamily: ARCHIVO }}>
            Open Let&apos;s Play <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ═══ FLOW CHANNEL COMO DIAL (Marcelo 2026-10-01 eligió la opción 3):
          gris = boredom, verde = el canal, rojo = anxiety; la aguja es su
          promedio. Mismas zonas y frases que My progress. Abre My progress. ═══ */}
      {data.canTrack !== false && (() => {
        const fc = data.flowChannel;
        const n = fc?.count ?? 0;
        const has = !!fc && fc.avg != null && n >= FLOW_MIN_RATINGS;
        return (
          <button type="button" onClick={() => setProgressOpen(true)}
            className="w-full rounded-lg px-3.5 pt-3.5 pb-4 flex flex-col gap-1.5 items-center"
            style={{ background: HOME_CARD, border: `1px solid ${HOME_LINE}`, color: '#F7F9FA' }}>
            <span className="flex items-center justify-between w-full">
              <span style={{ ...HOME_MONO, color: '#8FB3C4' }}>Flow channel</span>
              {has && <span className="text-[12px]" style={{ color: '#8FB3C4' }}>{n} rated sessions</span>}
            </span>
            <FlowDial avg={fc?.avg ?? null} count={n} minRatings={FLOW_MIN_RATINGS} />
          </button>
        );
      })()}

      {/* Log free surf: el registro de dos segundos (2026-09-22) se queda en el
          Home, pero como botón SECUNDARIO: un solo cyan lleno por pantalla, y es
          el de la tarjeta de acción. */}
      {data.canTrack !== false && <FreeSurfLogger token={data.token} variant="secondary" />}

      {/* ═══ ALSO FOR YOU: EL BUZÓN, EN FILAS (regla 2026-08-14: lo que te llegó,
          caduca y se vacía). Diseño A: una fila por cosa, ícono a la izquierda,
          nada del tamaño de la acción. ═══ */}
      {(() => {
        const rows: React.ReactNode[] = [];
        const ROW = 'w-full text-left flex items-center gap-3 min-h-[60px] py-2.5';
        const line = { borderTop: `1px solid ${HOME_LINE}` };
        // Última clase con el coach · solo 7 días (después vive en My progress → My Sessions).
        if (latestResult && Date.now() - effectiveDate(latestResult) <= 7 * 86400000) {
          const when = new Date(effectiveDate(latestResult)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const surveyDone = data.surveyResultIds.includes(latestResult.id);
          const canRate = !surveyDone && !!latestResult.survey_unlocked;
          const openSessions = () => {
            // Sin membresía no existe My progress: su historial es la pantalla de sesiones.
            if (data.canTrack === false) { onGoTo('sessions'); return; }
            setProgressOpen(true);
            setTimeout(openSessionsDetails, 120);
          };
          const saw = coachSawLine(latestResult);
          const meaning = statusMeaning(latestResult.status);
          rows.push(
            <button key="last-class" type="button" onClick={openSessions} className={ROW} style={line}>
              <HomeRowInner icon={Clock} color="#00D2FF" bg="rgba(0,210,255,0.12)"
                title={`Your last class · ${when}${latestResult.coaches?.display_name ? ` · ${latestResult.coaches.display_name}` : ''}`}
                sub={`${latestResult.mission || latestResult.standalone_sessions?.mission || 'Session'}${meaning ? ` · ${meaning}` : ''}`}
                extra={<>
                  {saw && <span className="block text-[13px] leading-snug" style={{ color: '#A9BCC7' }}>Your coach saw: {saw}</span>}
                  {surveyDone && latestResult.student_visible_summary && (
                    <span className="block text-[13.5px] mt-1 leading-snug italic line-clamp-3" style={{ color: '#D9E4EA' }}>“{latestResult.student_visible_summary}”</span>
                  )}
                </>} />
            </button>,
          );
          if (canRate) rows.push(
            <button key="rate" type="button" onClick={() => onGoTo('feedback')} className={ROW} style={line}>
              <HomeRowInner icon={Star} color="#FFD166" bg="rgba(255,209,102,0.14)" title="Rate your coach" sub="Unlock the session feedback" />
            </button>,
          );
        }
        // Promoción de cinta (30 días, 2026-08-09): fila que se despliega.
        (() => {
          const promotedAt = (student as any).belt_promoted_at as string | null;
          if (!promotedAt) return;
          const days = (Date.now() - new Date(promotedAt).getTime()) / 86400000;
          if (!(days >= 0 && days <= 30)) return;
          const d = BELT_DISPLAY[beltLevel];
          const copy = PROMOTION_COPY[beltLevel];
          if (!d || !copy?.next) return;
          // La nota del coach se muestra UNA vez: si el acta del camp (abajo) ya la trae, acá no.
          const note = recentCampResult?.final?.note ? null : (campWithNote?.coach_final_note ?? null);
          rows.push(
            <details key="promotion" className="group" style={line}>
              <summary className={`${ROW} list-none cursor-pointer [&::-webkit-details-marker]:hidden`}>
                <HomeRowInner icon={Sparkles} color={onNavyBeltColor(beltLevel, d.color)} bg="rgba(247,249,250,0.08)" title={`You’re now a ${d.en}!`} sub="Belt promotion · see what comes next" />
              </summary>
              <div className="mb-3 rounded-lg p-4 space-y-2" style={{ background: T_CREAM }}>
                {copy.mastered && <p className="text-[14px] leading-snug" style={{ color: T_INK }}>✓ {copy.mastered}</p>}
                <p className="text-[14px] leading-snug" style={{ color: T_INK }}>→ {copy.next}</p>
                {note && (
                  <div className="rounded-[5px] px-3 py-2" style={{ background: T_PAPER, borderLeft: '3px solid #00D2FF' }}>
                    <p style={{ ...T_LABEL, color: SAND_LABEL }}>From your coach</p>
                    <p className="text-[14px] italic leading-snug mt-0.5" style={{ color: T_INK }}>{note}</p>
                  </div>
                )}
                <button type="button" onClick={() => onGoTo('sequence')} className="w-full min-h-[44px] rounded-[5px] text-[14px] font-black uppercase" style={{ background: T_NAVY, color: '#F7F9FA', fontFamily: ARCHIVO }}>
                  See your new sequences →
                </button>
              </div>
            </details>,
          );
        })();
        // El acta del camp (2026-09-18, 21 días): fila que se despliega.
        if (recentCampResult) {
          const c: any = recentCampResult;
          const f = c.final;
          const m = String(f.summary ?? '').match(/(\d+)\/(\d+) secuencias/);
          const seqLine = m ? `${m[1]} of ${m[2]} sequences are yours` : null;
          const targetBelt = c.template_name ? String(c.template_name).match(/(white|yellow|blue|purple)/i)?.[1] : null;
          const beltLabel = targetBelt ? `${targetBelt.charAt(0).toUpperCase()}${targetBelt.slice(1).toLowerCase()} Belt` : 'the next level';
          rows.push(
            <details key="camp-result" className="group" style={line}>
              <summary className={`${ROW} list-none cursor-pointer [&::-webkit-details-marker]:hidden`}>
                <HomeRowInner icon={Check} color="#06D6A0" bg="rgba(6,214,160,0.14)" title={c.camp_name} sub={`Your camp · ${f.approved ? `Ready for ${beltLabel}` : 'In progress · keep going'}`} />
              </summary>
              <div className="mb-3 rounded-lg p-4 space-y-2" style={{ background: T_CREAM }}>
                {f.approved && <p className="text-[14px] leading-snug" style={{ color: T_INK }}>Recommended by your coach. Your coach confirms the belt with the academy.</p>}
                {seqLine && <p className="text-[14px] leading-snug" style={{ color: T_INK }}>{seqLine}. {f.approved ? '' : 'What you did not show yet is still yours to earn — it lives in your course.'}</p>}
                {f.focus && (
                  <div className="rounded-[5px] px-3 py-2" style={{ background: T_PAPER, borderLeft: '3px solid #00D2FF' }}>
                    <p style={{ ...T_LABEL, color: SAND_LABEL }}>Your next focus</p>
                    <p className="text-[14px] mt-0.5" style={{ color: T_INK }}>{f.focus}</p>
                  </div>
                )}
                {f.note && <p className="text-[14px] whitespace-pre-line leading-snug italic" style={{ color: T_INK }}>{f.note}</p>}
              </div>
            </details>,
          );
        }
        // Próximo camp lejos: una línea, sin plan todavía.
        if (campNow && !classSoon) rows.push(
          <div key="next-camp" className={ROW} style={line}>
            <HomeRowInner icon={CalendarDays} color="#00D2FF" bg="rgba(0,210,255,0.12)" chevron={false}
              title={`${campNow.camp_name}${campNow.coach?.display_name ? ` · with ${campNow.coach.display_name}` : ''}`}
              sub={`Next camp · ${campStart ? campStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}`} />
          </div>,
        );
        // Find your level: invitación al quiz v2 (Marcelo 2026-09-16, caso
        // Gustavo Dias). Con ?t= el resultado se ata a esta ficha y
        // &from=portal lo trae de vuelta.
        if (data.levelQuizDone === false) rows.push(
          <a key="quiz" href={`/quiz-v2.html?t=${encodeURIComponent(data.token)}&from=portal`} className={`${ROW} no-underline`} style={line}>
            <HomeRowInner icon={Compass} color="#00D2FF" bg="rgba(0,210,255,0.12)" title="Find your level" sub="Optional · 3 minutes · ten quick scenes, your coach confirms it in the water" />
          </a>,
        );
        // ONE WAVE: con curso, el libro es una fila (vive también en Course).
        const bk = ((data as any).homeBundle?.presentations ?? []).find((p: any) => p.id === ONE_WAVE_ID);
        if (bk && data.hasAnyCourse) rows.push(
          <button key="book" type="button" onClick={() => setReader({ id: bk.id, title: 'ONE WAVE' })} className={ROW} style={line}>
            <HomeRowInner icon={BookOpen} color="#FFD166" bg="rgba(255,209,102,0.14)" title="ONE WAVE" sub="Your book · read it here" />
          </button>,
        );
        if (rows.length === 0) return null;
        return (
          <div className="flex flex-col">
            <span className="pb-1.5" style={{ ...HOME_MONO, color: '#8FB3C4' }}>Also for you</span>
            <div style={{ borderBottom: `1px solid ${HOME_LINE}` }}>{rows}</div>
          </div>
        );
      })()}

      {/* ── 📖 ONE WAVE sin curso — la compra del libro, adelante y al centro
          (venta web 2026-09-01). Solo si tiene el grant; abre el PDF inline con
          el mismo mecanismo de materiales. ── */}
      {(() => {
        const bk = ((data as any).homeBundle?.presentations ?? []).find((p: any) => p.id === ONE_WAVE_ID);
        if (!bk || data.hasAnyCourse) return null;
        return (
          <button
            type="button"
            onClick={() => setReader({ id: bk.id, title: 'ONE WAVE' })}
            className="block w-full text-left rounded-lg overflow-hidden"
            style={{ background: T_CREAM, border: `1px solid ${T_BORDER}` }}
          >
            <div className="flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/web/img/one-wave-cover.jpg"
                alt="ONE WAVE"
                className="w-[72px] h-auto rounded-[4px] shadow-md shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p style={{ ...T_LABEL, color: T_MUTED }}>Your book</p>
                <p className="text-[22px] font-black leading-tight mt-0.5" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', color: T_INK }}>ONE WAVE</p>
                <p className="text-[14px] mt-1 leading-snug" style={{ color: T_INK }}>
                  A practical system to train with intention — your copy, on any device.
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 text-[15px] font-bold" style={{ color: T_INK }}>
                Read <ArrowRight size={15} />
              </span>
            </div>
          </button>
        );
      })()}
      {reader && (
        <MaterialReader token={data.token} resourceId={reader.id} title={reader.title} onClose={() => setReader(null)} />
      )}
      {/* ── Solo libro / lead sin curso ni membresía: nada de horas ni progreso.
          El Home le dice qué tiene y qué abre lo demás (blueprint 2026-09-04,
          Marcelo 2026-09-08). ── */}
      {data.canTrack === false && slot !== 'class' && (
        <div className="rounded-lg overflow-hidden p-5" style={{ background: '#061C2B', border: '1px solid rgba(0,210,255,.2)' }}>
          {data.hasAnyCourse ? (
            <>
              <p className="text-[12px]" style={{ ...F_LABEL, color: '#FFD166' }}>Membership ended</p>
              <p className="text-white font-bold text-[17px] mt-1 leading-tight">Your course is yours. Let&apos;s Play is waiting.</p>
              <p className="text-[12.5px] mt-2 leading-snug" style={{ color: 'rgba(240,247,250,.7)' }}>
                Lessons and drills stay open. Training sessions, your surf hours and your progress come back the moment you renew the training tool ($99/year).
              </p>
              <button type="button" onClick={() => onGoTo('sequence')}
                className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-semibold" style={{ color: '#00D2FF' }}>
                Renew my membership →
              </button>
            </>
          ) : (
            <>
              <p className="text-[12px]" style={{ ...F_LABEL, color: '#00D2FF' }}>Start here</p>
              <p className="text-white font-bold text-[17px] mt-1 leading-tight">
                {data.hasBook ? 'Read the book, then train with us.' : 'Your training starts with your course.'}
              </p>
              <p className="text-[12.5px] mt-2 leading-snug" style={{ color: 'rgba(240,247,250,.7)' }}>
                Every course includes 1 year of the training tool (a $99 value): drills, missions, session logging and your progress. When you get one, everything opens right here — same portal, same login.
              </p>
              <a href="https://www.thesurfsequence.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-semibold" style={{ color: '#00D2FF' }}>
                See courses and memberships →
              </a>
            </>
          )}
        </div>
      )}
      {/* ── MY PROGRESS: el cockpit de siempre (horas, nivel, camino, agua, HP).
          La identidad y la campana subieron arriba (línea aprobada 2026-09-14). ── */}
      {data.canTrack !== false && (
      <div className="space-y-4">
          {/* ORDEN del Home (pedido Marcelo 2026-08-25): primero lo ACCIONABLE
              de hoy (ficha incompleta, citas, lo que el staff dejó), después
              el plan (año → programa → scores → competencia → muro). Cada
              tarjeta se auto-oculta si no aplica al alumno. Los mensajes del
              coach viven ahora en la campana 🔔 del header. */}
          {/* ═══ LÍNEA DE ALTO RENDIMIENTO ═══
              Solo para quien tiene el ACCESO otorgado (students.hp_access).
              No se deduce de los datos: se da a mano desde la ficha. Para el
              alumno normal —huésped, campista— esto no existe: su idioma es
              cinta, secuencia y next focus, no pilares ni temporadas.
              Antes bastaba con que existiera una ficha HP creada de paso, y
              cuatro personas veían tarjetas vacías. */}
          {/* ═══ QUÉ TRABAJAR ═══ (2026-08-28)
              Eran TRES tarjetas seguidas contestando la misma pregunta —lo que
              dijo el coach, el próximo movimiento y el "today" del cue—, cada
              una con su color. Marcelo: "se ve medio rara, cargada".
              Ahora es UNA sola, con jerarquía: primero lo que dijo una PERSONA,
              después el paso que lo frena (que es el botón para ir a
              practicarlo) y al final la frase de One Wave.
              El alumno la abre muchas veces SOLO, sin el coach al lado: por eso
              esto va arriba de las horas y del camino de cintas. */}
          {/* EL BUZÓN de la comunidad: lo publicado que este alumno todavía
              no vio. Caduca solo — al abrir The Lineup se marca leído y esta
              tarjeta desaparece. Los títulos se ven aunque la membresía haya
              vencido (decisión #5 del plan: mostrar lo que se pierde ES el
              recordatorio de renovación). */}
          {(data as any).lineupUnreadLive > 0 && (
            <button
              type="button"
              onClick={() => onGoTo('lineup')}
              className="block w-full text-left rounded-2xl px-4 py-3.5"
              style={{ background: 'rgba(0,210,255,.08)', border: '1px solid rgba(0,210,255,.28)' }}
            >
              <p className="text-[12px]" style={{ ...F_LABEL, color: BRAND.colors.cyan }}>
                New in The Lineup
              </p>
              {(data as any).lineup.posts
                .filter((p: any) => !p.read)
                .slice(0, 3)
                .map((p: any) => (
                  <p key={p.id} className="text-[13.5px] text-white mt-1 leading-snug truncate">
                    {p.title}
                  </p>
                ))}
              <p className="text-[12px] mt-1.5 font-semibold" style={{ color: BRAND.colors.cyan }}>
                {(data as any).lineupUnreadLive === 1
                  ? 'Open it →'
                  : `${(data as any).lineupUnreadLive} new — open The Lineup →`}
              </p>
            </button>
          )}

          {data.homeBundle?.hpAccess && (
            <>
              <AthleteProfileCard token={data.token} placement="top" />

              {/* EL PROGRAMA ES EL CONTENEDOR (pedido de Marcelo 2026-08-25:
                  "debería de salir solo en TRAINING PROGRAM y ahí adentro que
                  dice ANUAL, ahí sea la forma de ver anual"). El Home tenía
                  una tarjeta por cosa —año, programa, citas, nutrición— y era
                  un muro. Ahora entra todo en el programa: HOY (su día + la
                  comida que le toca + sus citas) · SEMANA · SEASON · YEAR.
                  Afuera quedan solo competencia y el muro del equipo. */}
              <ProgramCard
                token={data.token}
                initial={data.homeBundle?.program}
                season={data.homeBundle?.season}
                appointments={data.homeBundle?.appointments}
                todayExtras={data.homeBundle?.todayExtras}
              />

              {/* Sin programa asignado el año no puede desaparecer: sigue
                  como tarjeta propia hasta que tenga uno. */}
              {!data.homeBundle?.program && data.homeBundle?.season && (
                <SeasonCard token={data.token} initial={data.homeBundle?.season} />
              )}
              {!data.homeBundle?.program && (
                <>
                  <AppointmentCard token={data.token} initial={data.homeBundle?.appointments} />
                  <TodayExtras token={data.token} initial={data.homeBundle?.todayExtras} />
                </>
              )}
              {/* Score por pilar (última evaluación profunda). */}
              <AthleteScoreCard token={data.token} initial={data.homeBundle?.scores} />
              {/* Competencia/ranking — solo con competencia próxima o EQUIPO. */}
              <CompetitionCard token={data.token} initial={data.homeBundle?.competitions} />
              {/* Muro del EQUIPO (staff + atleta) — solo con temporada activa. */}
              <TeamWallCard token={data.token} initial={data.homeBundle?.teamWall} />
            </>
          )}
          {/* 🔔 Buzón: mensajes del coach, abierto desde la campana.
              margin:0 explícito — como hijo del space-y heredaría margen y el
              inset-0 se correría (revisión). */}
          {inboxOpen && (
            <div className="fixed inset-0 z-[100] overflow-y-auto"
              style={{ background: '#061C2B', margin: 0, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setInboxOpen(false)} className="text-[12px] font-mono uppercase tracking-wider py-2 pr-3" style={{ color: '#b3c4d1' }}>
                    ← Home
                  </button>
                  <span className="text-[12px] font-mono uppercase tracking-wider" style={{ color: '#00D2FF' }}>
                    <Bell size={11} className="inline -mt-0.5" /> Notifications
                  </span>
                  <button type="button" onClick={() => setInboxOpen(false)} aria-label="Close" className="p-2 -m-2" style={{ color: '#b3c4d1' }}>✕</button>
                </div>
                {inboxMsgs.length === 0 && (
                  <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
                    <p className="text-[14px] font-semibold" style={{ color: '#eaf4fa' }}>Nothing new 🤙</p>
                    <p className="text-[12.5px] mt-1" style={{ color: '#b3c4d1' }}>Messages from your coach will land here.</p>
                  </div>
                )}
                {inboxMsgs.map((m: any) => (
                  <div key={m.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
                    <p className="text-[12px] font-mono uppercase tracking-wider" style={{ color: '#7BA2B5' }}>
                      {m.coach_name || 'Your coach'} · {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {m.subject && <p className="text-[14px] font-bold mt-1" style={{ color: '#f4f9fc' }}>{m.subject}</p>}
                    <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed" style={{ color: '#cfdde8' }}>{m.body}</p>
                  </div>
                ))}
                <p className="text-center text-[12px] font-mono uppercase tracking-wider py-2" style={{ color: '#57707f' }}>
                  The Surf Sequence · Messages
                </p>
              </div>
            </div>
          )}

          {/* La distinción training/free surf se explica en la lección
              "Free Surfing or Training" (PC-PRE-10), que vive en Course —
              el atajo salía de acá (pedido de Marcelo 2026-08-25) porque
              además era un callejón sin salida: el alumno sin curso comprado
              caía en "Course Access Required". Los dos números de arriba
              siguen enseñando la diferencia todos los días. */}

          {/* Flow Channel — Canon v8.0 §C.7: the zone between boredom (too easy)
              and anxiety (too hard). Fed by the student's session ratings
              (survey_responses.flow_channel, 1-5; 3 = flow).
              Solo aparece cuando tiene qué decir: sin sesiones calificadas era
              la tarjeta más grande y más vacía del Home, y el alumno nuevo
              —que es el que menos tiene— la veía primero. */}
          {progressOpen && (
            <div id="progress-view" className="fixed inset-0 z-[100] overflow-y-auto"
              style={{ background: '#061C2B', margin: 0, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <div className="max-w-lg md:max-w-3xl mx-auto px-4 py-4 space-y-3">
                <button type="button" onClick={() => setProgressOpen(false)} className="inline-flex items-center gap-2 text-[15px] font-semibold py-2" style={{ color: '#00D2FF' }}>
                  <ArrowLeft size={18} /> Home
                </button>
                <h1 className="text-[36px]" style={{ ...H_BIG, color: '#F7F9FA' }}>My progress</h1>
          {/* YOUR LEVEL · TIME IN THE WATER · YOUR NEXT LEVEL (mock My Progress
              2026-09-15). Los MISMOS datos del cockpit viejo: cinta y nivel,
              curso activo, horas con su split training / free surf, la próxima
              cinta. El anillo pasó a ser la barra del split. */}
          {(() => {
            const idx = BELT_HIERARCHY.indexOf(beltLevel);
            const nextB = idx >= 0 && idx < BELT_HIERARCHY.length - 1 ? BELT_HIERARCHY[idx + 1] : null;
            const nd = nextB ? BELT_DISPLAY[nextB] : null;
            const cb = data.courseData?.activeCourseBelt ? String(data.courseData.activeCourseBelt).replace(/_belt$/, '') : null;
            const courseBelt = cb ? BELT_DISPLAY[`${cb}_belt` as BeltLevel] : null;
            return (
              <>
                <SandCard label="Your level">
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-full shrink-0" style={{ background: belt?.color || '#E8E8E8', border: '1px solid rgba(16,38,59,.12)' }} />
                    <div className="min-w-0">
                      <p className="text-[22px] font-black leading-tight" style={{ fontFamily: ARCHIVO, color: T_INK }}>{belt?.en}</p>
                      <p className="mt-0.5" style={{ ...T_MONO_SM, color: T_INK }}>{belt?.levelName ? `${belt.levelName} · ` : ''}Level {BELT_RANK[beltLevel] ?? 1} of 6</p>
                    </div>
                  </div>
                  {courseBelt && <p className="mt-3 pt-3" style={{ ...T_MONO_SM, color: T_INK, borderTop: `1px solid ${T_BORDER}` }}>Current course: {courseBelt.en} · {courseBelt.levelName}</p>}
                  <button type="button" onClick={() => onOpenRoadmap?.()} className="inline-flex items-center gap-1.5 mt-2.5 text-[15px] font-bold" style={{ color: T_LINK }}>What it takes <ArrowRight size={15} /></button>
                </SandCard>
                <SandCard label="Time in the water">
                  {/* El círculo otra vez (Marcelo 2026-10-01): cyan = training,
                      verde = free surf, el total en el centro. Igual que el Home. */}
                  <div className="flex items-center gap-5">
                    <WaterRing trainingMinutes={surf.trainingMinutes} freeSurfMinutes={surf.freeSurfMinutes} size={124} tone="sand" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <p className="text-[13px] inline-flex items-center gap-1.5" style={{ color: T_MUTED }}><span style={{ width: 10, height: 10, borderRadius: 5, background: '#00D2FF', display: 'inline-block' }} />Training</p>
                        <p className="text-[20px] font-black leading-tight" style={{ fontFamily: ARCHIVO, color: T_INK }}>{fmtHm(surf.trainingMinutes)}</p>
                      </div>
                      <div>
                        <p className="text-[13px] inline-flex items-center gap-1.5" style={{ color: T_MUTED }}><span style={{ width: 10, height: 10, borderRadius: 5, background: '#06D6A0', display: 'inline-block' }} />Free surf</p>
                        <p className="text-[20px] font-black leading-tight" style={{ fontFamily: ARCHIVO, color: T_INK }}>{fmtHm(surf.freeSurfMinutes)}</p>
                      </div>
                    </div>
                  </div>
                  {/* La racha vivía en el Home (casilla); acá desde 2026-09-26. */}
                  <p className="text-[13px] mt-3 flex items-center gap-1.5" style={{ color: T_MUTED }}><Flame size={14} strokeWidth={1.75} />Current streak · {streak} {streak === 1 ? 'day' : 'days'}</p>
                  <button type="button" onClick={openSessionsDetails} className="inline-flex items-center gap-1.5 mt-3 text-[15px] font-bold" style={{ color: T_LINK }}>View sessions <ArrowRight size={15} /></button>
                </SandCard>
                <SandCard label="Your next level">
                  {nd ? (
                    <div className="flex items-center gap-3.5">
                      <span className="w-12 h-12 rounded-full shrink-0" style={{ background: nd.color, border: '1px solid rgba(16,38,59,.12)' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[20px] font-black leading-tight" style={{ fontFamily: ARCHIVO, color: T_INK }}>{nd.en}</p>
                        <p className="mt-0.5" style={{ ...T_MONO_SM, color: T_MUTED }}>{nd.levelName}</p>
                      </div>
                      <button type="button" onClick={() => onOpenRoadmap?.()} className="shrink-0 inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: T_LINK }}>See what it takes <ArrowRight size={14} /></button>
                    </div>
                  ) : (
                    <p className="text-[15px] font-bold" style={{ color: T_INK }}>Top belt reached</p>
                  )}
                </SandCard>
              </>
            );
          })()}

          {data.flowChannel && data.flowChannel.avg != null && data.flowChannel.count > 0 && (
            <FlowChannelCard flow={data.flowChannel} />
          )}

          {/* Belt journey strip — es también la puerta a "qué me falta": el
              alumno mira su camino y ahí mismo pregunta cómo se avanza. */}
          <div className="rounded-lg overflow-hidden" style={{ background: T_CREAM, border: `1px solid ${T_BORDER}`, color: T_INK }}>
          <button
            type="button"
            onClick={() => onOpenRoadmap?.()}
            className="block w-full text-left p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p style={{ ...T_LABEL, color: T_INK }}>
                Where you are · {String(data.courseData?.activeCourseBelt || beltLevel).replace('_belt', '').toUpperCase()} Belt{data.courseData?.activeCourseBelt && data.courseData.activeCourseBelt !== beltLevel.replace('_belt', '') ? ` · training` : ''}
              </p>
              <span className="text-[13px] font-bold shrink-0" style={{ color: T_LINK }}>What it takes →</span>
            </div>
            {/* El ESPEJO del nivel: valida dónde está, no motiva. Vivía a mitad
                del Home repitiendo la cinta por tercera vez; su lugar es acá,
                junto al camino. */}
            <p className="text-[14px] leading-relaxed mb-3" style={{ color: T_INK }}>
              {beltMirror}
            </p>
            <div className="flex items-center justify-between">
              {BELT_HIERARCHY.map((b, i) => {
                const d = BELT_DISPLAY[b];
                const isCurrent = b === beltLevel;
                const passed = (BELT_RANK[b] ?? 99) <= (BELT_RANK[beltLevel] ?? 1);
                return (
                  <div key={b} className="flex items-center" style={{ flex: i < BELT_HIERARCHY.length - 1 ? 1 : '0 0 auto' }}>
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className="rounded-full"
                        style={{
                          width: isCurrent ? 20 : 15,
                          height: isCurrent ? 20 : 15,
                          background: d.color,
                          border: isCurrent ? '2px solid #061C2B' : '1px solid rgba(16,38,59,.15)',
                          opacity: passed ? 1 : 0.4,
                        }}
                      />
                      <span className="text-[11px]" style={{ color: isCurrent ? T_INK : T_MUTED, fontWeight: isCurrent ? 700 : 400 }}>{d.levelName}</span>
                    </div>
                    {i < BELT_HIERARCHY.length - 1 && (
                      <div className="flex-1 mx-1" style={{ height: 2, background: T_BORDER, marginBottom: 14 }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* EL NIVEL EN EL AGUA (Marcelo 2026-08-28: "el nivel en el agua en
                base a lo que el coach va validando, y que solo salga si el
                coach lo determina").
                Son dos líneas distintas: la cinta es la técnica, el agua es
                dónde puede entrar solo. Mientras el nivel siga siendo
                PROVISIONAL —el del quiz de ingreso, lo que el alumno dice de
                sí mismo— no se muestra: decirle "sos autónomo" sin que un
                coach lo haya visto en el agua es lo único que acá no se puede
                hacer. */}
          </button>
          {/* La línea del AGUA: su propio botón, hacia su propia vista
              (Marcelo 2026-08-29: "una cosa aparte para saber si eres
              autónomo"). El nivel solo se afirma si el coach lo validó;
              sin validar, la fila igual lleva a la escalera de requisitos. */}
          <button
            type="button"
            onClick={() => onOpenWater?.()}
            className="block w-full text-left px-4 pb-3.5 pt-3"
            style={{ borderTop: `1px solid ${T_BORDER}` }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p style={{ ...T_LABEL, color: T_INK }}>
                In the water
              </p>
              <p className="text-[14px] font-bold shrink-0" style={{ color: oceanConfirmed ? T_INK : T_LINK }}>
                {oceanConfirmed ? oceanConfirmed.name : 'Your water level →'}
              </p>
            </div>
            {oceanConfirmed && (
              <p className="text-[13px] mt-0.5 leading-snug" style={{ color: T_MUTED }}>
                {oceanConfirmed.cleared}
              </p>
            )}
          </button>
          </div>

                {/* Historial (Marcelo 2026-09-15: "My sessions es historial, va con el
                    progreso"): las mismas dos filas que vivían al pie del Home, en sand. */}
                <details id="my-sessions" className="rounded-lg overflow-hidden" style={{ background: T_CREAM, border: `1px solid ${T_BORDER}` }}>
                  <summary className="cursor-pointer list-none px-4 py-3.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2" style={{ ...T_LABEL, color: T_INK }}>
                      <ClipboardList size={16} strokeWidth={1.75} style={{ color: T_LINK }} />
                      My Sessions
                    </span>
                    <ChevronDown size={18} style={{ color: T_MUTED }} />
                  </summary>
                  <div className="px-3 pb-3 pt-1" style={{ borderTop: `1px solid ${T_BORDER}` }}>
                    <SessionsTab data={data} />
                  </div>
                </details>
                <details className="rounded-lg overflow-hidden" style={{ background: T_CREAM, border: `1px solid ${T_BORDER}` }}>
                  <summary className="cursor-pointer list-none px-4 py-3.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2" style={{ ...T_LABEL, color: T_INK }}>
                      <MessageCircle size={16} strokeWidth={1.75} style={{ color: T_LINK }} />
                      My Feedback
                      {(data.pendingSurveys.length + (data.pendingExperience ? 1 : 0)) > 0 && (
                        <span className="text-[12px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#FF6B6B', color: '#fff' }}>{data.pendingSurveys.length + (data.pendingExperience ? 1 : 0)}</span>
                      )}
                    </span>
                    <ChevronDown size={18} style={{ color: T_MUTED }} />
                  </summary>
                  <div className="px-3 pb-3 pt-1" style={{ borderTop: `1px solid ${T_BORDER}` }}>
                    {/* Dentro de My progress el botón solo abre My Sessions, acá arriba. */}
                    <FeedbackTab data={data} onOpenSessions={openSessionsDetails} />
                  </div>
                </details>
                <button type="button" onClick={() => onGoTo('sequence')}
                  className="w-full min-h-[48px] rounded-[5px] flex items-center justify-center gap-2 text-[17px] font-black uppercase"
                  style={{ background: '#00D2FF', color: T_NAVY, letterSpacing: '0.035em', fontFamily: ARCHIVO }}>
                  Log a session <ArrowRight size={18} />
                </button>
                <button type="button" onClick={() => setProgressOpen(false)}
                  className="w-full min-h-[44px] rounded-[5px] text-[15px] font-semibold" style={{ border: '1px solid rgba(0,210,255,.45)', color: '#F7F9FA' }}>
                  Back to Home
                </button>
              </div>
            </div>
          )}
          {/* Ficha completa al 100% → acceso de consulta al FONDO del cockpit
              (antes quedaba a mitad del Home — revisión). También es HP. */}
          {data.homeBundle?.hpAccess && <AthleteProfileCard token={data.token} placement="bottom" />}
      </div>
      )}


    </div>
  );
}

// ═══════════════════════════════════════
// Flow Channel card (Canon v8.0 §C.7 / P2)
// ═══════════════════════════════════════
// The flow channel is the learning zone between boredom (too easy) and anxiety
// (too hard); the ideal is the middle, where challenge meets ability. Fed by the
// student's own session ratings (survey_responses.flow_channel, 1-5; 3 = flow).

// Las zonas (1-5 → 0-100%, el canal es 2.5-3.5) y el dial viven en
// components/portal/HomeVisuals (flowZone, FlowDial): Home y My progress dicen
// lo mismo con el MISMO promedio. Desde 2026-10-01 es un dial (Marcelo eligió
// la opción 3), no las tres casillas del 2026-08-25.
// Home y My progress usan el MISMO umbral (revisión 2026-09-29): con una sola
// calificación el promedio no dice nada.
const FLOW_MIN_RATINGS = 2;

function FlowChannelCard({ flow }: { flow?: { avg: number | null; count: number; boredom: number; anxiety: number } }) {
  const n = flow?.count ?? 0;
  const hasData = !!flow && flow.avg != null && n >= FLOW_MIN_RATINGS;
  // El dial (Marcelo 2026-10-01, opción 3): el mismo del Home, sobre arena.
  // Zonas, número y consejo salen del MISMO promedio; la doctrina abajo.
  return (
    <SandCard label="Flow Channel" right={hasData ? <span className="text-[12px]" style={{ color: T_MUTED }}>{n} rating{n === 1 ? '' : 's'} · from your sessions</span> : undefined}>
      <FlowDial avg={flow?.avg ?? null} count={n} minRatings={FLOW_MIN_RATINGS} tone="sand" />
      {hasData && (
        <>
          {/* La doctrina, en las palabras de Marcelo */}
          <p className="text-[14px] font-bold mt-3.5 text-center" style={{ color: T_INK }}>
            Challenge matched to capability + conditions
          </p>
          <p className="text-[13px] mt-0.5 text-center" style={{ color: T_MUTED }}>
            Difficult enough to demand attention · possible enough to produce feedback
          </p>
        </>
      )}
    </SandCard>
  );
}

// ═══════════════════════════════════════
// TAB 2: SESSIONS (improved with expanded details)
// ═══════════════════════════════════════

// La fecha de la clase (camp_sessions.session_date) manda sobre la del cierre.
function effectiveDate(s: any): number {
  const d = s?.camp_sessions?.session_date ? `${s.camp_sessions.session_date}T12:00:00` : s?.created_at;
  const t = d ? new Date(d).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

function SessionsTab({ data, onDark = false }: { data: PortalData; onDark?: boolean }) {
  const { sessions, selfTrainingSessions, surveyResultIds, hasSurveyEver } = data;
  const closedMultiBlock = data.closedMultiBlock ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge all 3 source types into a unified timeline
  const allSessions = [
    ...sessions.map((s: any) => ({ ...s, _type: 'coach' as const })),
    ...selfTrainingSessions.map((s: any) => ({
      ...s,
      _type: 'self' as const,
      created_at: s.created_at,
    })),
    ...closedMultiBlock.map((m: ClosedMultiBlock) => ({
      ...m,
      _type: 'multi_block' as const,
      created_at: m.closed_at || m.created_at,
    })),
  ].sort((a: any, b: any) => effectiveDate(b) - effectiveDate(a));

  if (allSessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <p className="text-gray-400 text-sm">No sessions yet.</p>
        <p className="text-gray-300 text-xs mt-1">Your session history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold" style={{ color: onDark ? '#dbe8f1' : 'var(--tss-navy)' }}>
        Session History ({allSessions.length})
      </h2>
      {allSessions.map((session: any) => {
        const isExpanded = expandedId === session.id;
        const isSelf = session._type === 'self';
        const isMultiBlock = session._type === 'multi_block';

        const titleText = isSelf
          ? `Self-Training: ${session.drill_name || 'Free session'}`
          : isMultiBlock
          ? `Coach Session · ${session.total_actual_minutes ?? session.total_planned_minutes}min`
          : session.standalone_sessions?.mission || session.mission || 'Session';

        return (
          <div
            key={session.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
              className="w-full px-4 py-3 text-left"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{titleText}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[12px] text-gray-500">
                      {new Date(session.camp_sessions?.session_date ? `${session.camp_sessions.session_date}T12:00:00` : session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {(!isSelf || isMultiBlock) && (() => {
                      const c = Array.isArray(session.coaches) ? session.coaches[0] : session.coaches;
                      return c?.display_name ? (
                        <>
                          <span className="text-gray-300">-</span>
                          <span className="text-[12px] text-gray-500">{c.display_name}</span>
                        </>
                      ) : null;
                    })()}
                    {isSelf && (
                      <span className="text-[12px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">
                        Self
                      </span>
                    )}
                    {isMultiBlock && (
                      <span className="text-[12px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">
                        Plan
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isSelf && !isMultiBlock && <StatusBadge status={session.status} />}
                  {isSelf && session.completed && (
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                      Done
                    </span>
                  )}
                  {isMultiBlock && (
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      Closed
                    </span>
                  )}
                  <span className="text-gray-300 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 border-t border-gray-50 pt-3 space-y-2">
                {isMultiBlock ? (
                  <>
                    {session.training_venue && (
                      <DetailRow label="Venue" value={session.training_venue} />
                    )}
                    {session.total_planned_minutes != null && (
                      <DetailRow
                        label="Planned"
                        value={`${session.total_planned_minutes} min`}
                      />
                    )}
                    {session.total_actual_minutes != null && (
                      <DetailRow
                        label="Actual"
                        value={`${session.total_actual_minutes} min`}
                      />
                    )}
                    {session.general_coach_feedback && (
                      <div className="pt-1">
                        <p className="text-xs text-gray-400 mb-1">Coach feedback</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-2 whitespace-pre-line">
                          {session.general_coach_feedback}
                        </p>
                      </div>
                    )}
                    {session.general_homework && (
                      <div>
                        <p className="text-xs text-amber-700 mt-1">
                          <span className="font-medium">Homework:</span>{' '}
                          {session.general_homework}
                        </p>
                      </div>
                    )}
                    {session.general_whats_next && (
                      <p className="text-xs text-blue-700">
                        <span className="font-medium">Next:</span>{' '}
                        {session.general_whats_next}
                      </p>
                    )}
                  </>
                ) : isSelf ? (
                  <>
                    {/* El cierre de su propia sesión, con las mismas palabras
                        con que lo contestó (Marcelo 2026-09-22): antes el
                        enfoque se guardaba dentro del texto de la nota y el
                        resto no se guardaba, así que acá no había nada. */}
                    {session.intention_text && (
                      <DetailRow label="You planned" value={session.intention_text} />
                    )}
                    {session.mission_completion && (
                      <DetailRow
                        label="Did you meet it?"
                        value={({ yes: 'I met it', partial: 'Partly', no: 'Not that day' } as Record<string, string>)[session.mission_completion] ?? session.mission_completion}
                      />
                    )}
                    {session.focus_rating != null && (
                      <DetailRow label="Focus" value={`${session.focus_rating}/3 · ${FOCUS_LABELS[session.focus_rating] ?? ''}`} />
                    )}
                    {session.flow_channel != null && (
                      <DetailRow label="Flow" value={`${session.flow_channel}/5`} />
                    )}
                    {session.next_intention && (
                      <DetailRow label="Next time" value={session.next_intention} />
                    )}
                    {/* Venue analysis for self-training */}
                    {session.venue_type && (
                      <DetailRow label="Venue" value={session.venue_type} />
                    )}
                    {session.venue_type === 'beach' && (
                      <>
                        {session.wave_conditions && (
                          <DetailRow label="Waves" value={session.wave_conditions} />
                        )}
                        {session.wind && (
                          <DetailRow label="Wind" value={session.wind} />
                        )}
                        {session.tide && (
                          <DetailRow label="Tide" value={session.tide} />
                        )}
                        {session.crowd_level && (
                          <DetailRow label="Crowd" value={session.crowd_level} />
                        )}
                      </>
                    )}
                    {session.safety_check && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Safety Check</span>
                        <span className="text-xs text-green-600 font-medium">Safe zone identified</span>
                      </div>
                    )}
                    {session.warm_up && (
                      <DetailRow label="Warm-up" value={session.warm_up} />
                    )}
                    {session.drill_name && (
                      <DetailRow label="Drill" value={session.drill_name} />
                    )}
                    {session.mental_hack && (
                      <DetailRow label="Mental Hack" value={session.mental_hack} />
                    )}
                    {session.duration_minutes && (
                      <DetailRow
                        label="Duration"
                        value={`${session.duration_minutes} min`}
                      />
                    )}
                    {session.notes && (
                      <div className="pt-1">
                        <p className="text-xs text-gray-400 mb-1">Notes</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-2 whitespace-pre-line">
                          {session.notes}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Coach session expanded details */}
                    {session.coaches?.display_name && (
                      <DetailRow label="Coach" value={session.coaches.display_name} />
                    )}
                    {session.standalone_sessions?.venue && (
                      <DetailRow label="Venue" value={session.standalone_sessions.venue} />
                    )}
                    {session.standalone_sessions?.ocean_conditions && (
                      <DetailRow label="Conditions" value={session.standalone_sessions.ocean_conditions} />
                    )}
                    {session.standalone_sessions?.pilar_id_snapshot && (
                      <DetailRow
                        label="Pilar"
                        value={session.standalone_sessions.pilar_id_snapshot}
                      />
                    )}
                    {session.standalone_sessions?.mission && (
                      <DetailRow label="Mission" value={session.standalone_sessions.mission} />
                    )}
                    {session.status && (
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-xs text-gray-500">Status</span>
                        <div className="text-right max-w-[64%]">
                          <StatusBadge status={session.status} />
                          {statusMeaning(session.status) && (
                            <p className="text-[12px] text-gray-500 mt-1">{statusMeaning(session.status)}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {session.standalone_sessions?.duration_minutes && (
                      <DetailRow
                        label="Duration"
                        value={`${session.standalone_sessions.duration_minutes} min`}
                      />
                    )}
                    {/* Bitácora en el idioma del cierre (2026-09-21): qué se
                        trabajó, la estrella del coach y dónde se rompió. */}
                    {Array.isArray(session.close?.lines) && session.close.lines.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs text-gray-400 mb-1">Your coach&apos;s stars</p>
                        <div className="space-y-1">
                          {session.close.lines.map((l: any, i: number) => (
                            <div key={`${l.plannedId ?? l.label}-${i}`} className="flex items-start justify-between gap-3 rounded-xl px-2.5 py-2" style={{ background: '#F7F9FA', border: '1px solid #DCD7C6' }}>
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold" style={{ color: '#10263B' }}>{l.label}</p>
                                {l.planned && <p className="text-[11px]" style={{ color: '#55666E' }}>Planned: {l.planned}</p>}
                                {l.broke && <p className="text-[11px]" style={{ color: '#7A1F1A' }}>Broke at: {l.broke}</p>}
                              </div>
                              <span className="shrink-0 text-[13px] font-black" style={{ color: '#10263B' }}>{l.star ? `${l.star}★` : '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {coachSawLine(session) && (
                      <DetailRow label="Your coach saw" value={coachSawLine(session)!} />
                    )}
                    {session.focus_rating && (
                      <DetailRow label="Focus" value={`${session.focus_rating}/5`} />
                    )}
                    {(session.frustration_rating !== null && session.frustration_rating !== undefined) && (
                      <DetailRow
                        label="Frustration"
                        value={
                          session.frustration_rating === 0 ? 'No frustration' :
                          session.frustration_rating === 1 ? 'Difficult but achievable' :
                          session.frustration_rating === 2 ? 'Very difficult' :
                          session.frustration_rating === 3 ? 'Total frustration' :
                          `${session.frustration_rating}/3`
                        }
                      />
                    )}
                    {/* Homework */}
                    {session.homework && (
                      <div className="pt-1">
                        <p className="text-xs text-gray-400 mb-1">Homework</p>
                        <div className="text-sm text-amber-800 bg-amber-50 rounded-xl p-2.5" style={{ borderLeft: `2px solid ${BRAND.colors.gold}` }}>
                          {session.homework}
                        </div>
                      </div>
                    )}
                    {/* What's next — the coach's required "what to work on next"
                        from the daily close (whats_next). Antes leía una columna
                        inexistente (next_recommended_focus) y nunca se mostraba. */}
                    {session.whats_next && (
                      <div className="pt-1">
                        <p className="text-xs text-gray-400 mb-1">Next Focus</p>
                        <div className="text-sm text-blue-800 bg-blue-50 rounded-xl p-2.5">
                          {session.whats_next}
                        </div>
                      </div>
                    )}
                    {/* M45 — Per-session survey gate */}
                    {surveyResultIds.includes(session.id) &&
                      session.student_visible_summary && (
                        <div className="pt-1">
                          <p className="text-xs text-gray-400 mb-1">Session Summary</p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-2 whitespace-pre-line">
                            {session.student_visible_summary}
                          </p>
                        </div>
                      )}
                    {!surveyResultIds.includes(session.id) &&
                      session.student_visible_summary && (
                        <div className="pt-1 text-[12px] text-amber-700 bg-amber-50 rounded-xl p-2 italic">
                          Fill the coach survey for this session to unlock the feedback.
                        </div>
                      )}
                    {session.video_link && (
                      <a
                        href={session.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white"
                        style={{ background: BRAND.colors.navy }}
                      >
                        <Play size={14} strokeWidth={1.75} />
                        <span>Watch Video</span>
                      </a>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 3: MATERIALS (improved with welcome section + better formatting)
// ═══════════════════════════════════════

// Belt background styles for section headers
const BELT_BG_STYLES: Record<string, string> = {
  white_belt: 'bg-gray-50 border-gray-200',
  yellow_belt: 'bg-yellow-50 border-yellow-200',
  blue_belt: 'bg-blue-50 border-blue-200',
  purple_belt: 'bg-purple-50 border-purple-200',
  brown_belt: 'bg-amber-50 border-amber-200',
  black_belt: 'bg-gray-900 border-gray-700',
};

const BELT_TEXT_STYLES: Record<string, string> = {
  white_belt: 'text-gray-800',
  yellow_belt: 'text-yellow-900',
  blue_belt: 'text-blue-900',
  purple_belt: 'text-purple-900',
  brown_belt: 'text-amber-900',
  black_belt: 'text-white',
};

// Category display config for improved grouping
const CATEGORY_GROUP_CONFIG: { key: string; label: string; icon: LucideIcon; isSafety?: boolean }[] = [
  { key: 'theory', label: 'Theory & Sequences', icon: BookOpen },
  { key: 'drill', label: 'Drills', icon: Dumbbell },
  { key: 'mission', label: 'Water Missions', icon: Waves },
  { key: 'mental', label: 'Mental Tools', icon: Brain },
  { key: 'safety', label: 'Safety', icon: ShieldAlert, isSafety: true },
];

// Per-category icon for individual material cards (replaces shared emoji map).
const MATERIAL_CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  theory: BookOpen,
  drill: Dumbbell,
  mission: Waves,
  mental: Brain,
  safety: ShieldAlert,
};

function MaterialsTab({
  data,
  belt,
}: {
  data: PortalData;
  belt: any;
}) {
  const { materials, student } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const beltLevel = student.belt_level as BeltLevel;

  // Group materials by belt level
  const groupedUnlocked = groupByBelt(materials.unlocked);
  const groupedLocked = groupByBelt(materials.locked);

  // Determine belt ordering for display
  const beltOrder: BeltLevel[] = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];

  // Count materials
  const totalUnlocked = materials.unlocked.length;
  const totalLocked = materials.locked.length;

  const toggleCategory = (key: string) => {
    const next = new Set(collapsedCategories);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCollapsedCategories(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Training Manual</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {totalUnlocked} sections available &middot; Based on your {belt?.en} level
          {totalLocked > 0 && ` · ${totalLocked} locked`}
        </p>
      </div>

      {/* Welcome Section for current belt */}
      {BELT_WELCOME[beltLevel] && (
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ borderLeft: `3px solid ${belt?.color || '#999'}` }}
        >
          <div className="px-4 py-3 bg-white">
            <p className="text-[12px] text-gray-500 uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
              {belt?.en} — What You Are Working On
            </p>
            <p className="text-sm text-[var(--tss-navy)] font-medium leading-relaxed">
              {BELT_WELCOME[beltLevel]}
            </p>
          </div>
        </div>
      )}

      {/* Unlocked Belt Sections */}
      {beltOrder.map((bKey) => {
        const mats = groupedUnlocked[bKey];
        if (!mats || mats.length === 0) return null;
        const beltInfo = BELT_DISPLAY[bKey];

        // Group by category within the belt
        const byCategory = groupByCategory(mats);

        return (
          <div key={bKey} className="space-y-2">
            {/* Belt Section Header */}
            <div
              className={`rounded-2xl border px-4 py-3 ${BELT_BG_STYLES[bKey] || 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full shrink-0 ring-1 ring-white shadow-sm"
                  style={{ backgroundColor: beltInfo?.color || '#999' }}
                />
                <div>
                  <h3 className={`text-sm font-bold ${BELT_TEXT_STYLES[bKey] || 'text-gray-800'}`}>
                    {beltInfo?.en}
                  </h3>
                  <p className={`text-[12px] ${BELT_TEXT_STYLES[bKey] || 'text-gray-800'} opacity-60`}>
                    {beltInfo?.levelName} &middot; {mats.length} sections
                  </p>
                </div>
              </div>
            </div>

            {/* Category Groups — collapsible */}
            {CATEGORY_GROUP_CONFIG.map(({ key: cat, label: catGroupLabel, icon: catGroupIcon, isSafety }) => {
              const catMats = byCategory[cat];
              if (!catMats || catMats.length === 0) return null;
              const groupKey = `${bKey}-${cat}`;
              const isCollapsed = collapsedCategories.has(groupKey);

              return (
                <div key={cat} className="space-y-1.5">
                  <button
                    onClick={() => toggleCategory(groupKey)}
                    className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
                      isSafety ? 'bg-amber-50 hover:bg-amber-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={isSafety ? 'text-amber-700' : 'text-gray-500'}>
                      {(() => {
                        const CatIcon = catGroupIcon;
                        return <CatIcon size={15} strokeWidth={1.75} />;
                      })()}
                    </span>
                    <span className={`text-xs font-semibold uppercase tracking-wider flex-1 text-left ${
                      isSafety ? 'text-amber-700' : 'text-gray-600'
                    }`}>
                      {catGroupLabel}
                    </span>
                    <span className="text-[12px] text-gray-500 mr-1">({catMats.length})</span>
                    <span className="text-gray-300 text-[12px]">{isCollapsed ? '▼' : '▲'}</span>
                  </button>
                  {!isCollapsed && catMats.map((mat) => (
                    <MaterialCard
                      key={mat.id}
                      material={mat}
                      locked={false}
                      expanded={expandedId === mat.id}
                      onToggle={() => setExpandedId(expandedId === mat.id ? null : mat.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Locked Belt Sections */}
      {beltOrder.map((bKey) => {
        const mats = groupedLocked[bKey];
        if (!mats || mats.length === 0) return null;
        const beltInfo = BELT_DISPLAY[bKey];

        return (
          <div key={`locked-${bKey}`} className="space-y-2">
            {/* Locked Belt Header */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full shrink-0 opacity-50"
                  style={{ backgroundColor: beltInfo?.color || '#999' }}
                />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-400">
                    {beltInfo?.en}
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    {mats.length} sections &middot; Locked
                  </p>
                </div>
                <Lock size={16} strokeWidth={1.75} className="text-gray-400" />
              </div>
            </div>

            {/* Locked material cards (title only) */}
            {mats.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                locked
                expanded={false}
                onToggle={() => {}}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function MaterialCard({
  material,
  locked,
  expanded,
  onToggle,
}: {
  material: BeltMaterial;
  locked: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const beltInfo = BELT_DISPLAY[material.beltLevel];
  const CatIcon = MATERIAL_CATEGORY_ICON_MAP[material.category] ?? BookOpen;

  if (locked) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 opacity-50 cursor-not-allowed shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
            <Lock size={18} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-400">{material.title}</p>
            <p className="text-xs text-gray-300 mt-0.5">{material.subtitle}</p>
            <p className="text-[12px] text-gray-500 mt-1.5 font-medium">
              Ask your coach to unlock {beltInfo?.en} materials
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-3.5 py-3 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-[var(--tss-navy)]">
            <CatIcon size={18} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">{material.title}</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{material.subtitle}</p>
          </div>
          <span className="text-gray-300 text-xs shrink-0 mt-1">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-4 border-t border-gray-50">
          <div className="pt-3">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                {MATERIAL_CATEGORY_LABELS[material.category]}
              </span>
              <span
                className="text-[12px] px-2 py-0.5 rounded-full font-medium text-white"
                style={{ backgroundColor: beltInfo?.color || '#999' }}
              >
                {beltInfo?.en}
              </span>
            </div>

            {/* Content rendered with improved formatting */}
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-gray-700 leading-relaxed font-[system-ui]">
                {material.content.split('\n').map((line, i) => {
                  const trimmed = line.trim();

                  // Style section headers (ALL CAPS lines)
                  if (/^[A-Z][A-Z\s&—:#+\-\/().0-9]+$/.test(trimmed) && trimmed.length > 3) {
                    return (
                      <p key={i} className="font-bold text-[var(--tss-navy)] text-sm mt-4 mb-1.5 pb-1 border-b border-gray-100">
                        {line}
                      </p>
                    );
                  }
                  // Style numbered section headers (e.g., "1. STANCE ANALYSIS")
                  if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
                    return (
                      <p key={i} className="font-semibold text-gray-800 text-sm mt-3 mb-1">
                        {line}
                      </p>
                    );
                  }
                  // Style lettered steps (e.g., "a) From cobra position...")
                  if (/^[a-z]\)\s/.test(trimmed)) {
                    return (
                      <p key={i} className="text-sm text-gray-700 pl-4 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  // Style bullet points
                  if (/^[-•]\s/.test(trimmed)) {
                    return (
                      <p key={i} className="text-sm text-gray-600 pl-3 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  // Style checkmark bullets
                  if (/^[✓✗]\s/.test(trimmed)) {
                    return (
                      <p key={i} className="text-sm text-green-700 pl-3 mb-0.5 font-medium">
                        {line}
                      </p>
                    );
                  }
                  // Style coaching cues (quoted text)
                  if (/^".*"$/.test(trimmed)) {
                    return (
                      <div key={i} className="pl-3 my-1 border-l-2 border-cyan-400">
                        <p className="text-sm text-cyan-800 italic">
                          {line}
                        </p>
                      </div>
                    );
                  }
                  // Style "Coaching cue:" lines
                  if (/^Coaching cue:/i.test(trimmed) || /^COACHING CUES?:/i.test(trimmed) || /^KEY COACHING CUES?:/i.test(trimmed)) {
                    return (
                      <div key={i} className="pl-3 my-1 border-l-2 border-cyan-400 py-0.5">
                        <p className="text-sm text-cyan-800 font-medium">
                          {line}
                        </p>
                      </div>
                    );
                  }
                  // Style "Common error" lines
                  if (/^Common error/i.test(trimmed) || /^COMMON ERRORS?:/i.test(trimmed) || /^COMMON CORRECTIONS?:/i.test(trimmed)) {
                    return (
                      <div key={i} className="bg-amber-50 rounded-lg px-3 py-1.5 mt-2 mb-1 border-l-2 border-amber-400">
                        <p className="text-sm text-amber-800 font-semibold">
                          {line}
                        </p>
                      </div>
                    );
                  }
                  // Style lines starting with "- If" or "- " after common errors (amber context)
                  if (/^- If\s/.test(trimmed) || /^Correction:/i.test(trimmed)) {
                    return (
                      <p key={i} className="text-sm text-amber-700 pl-4 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  // Style STANDARD lines
                  if (/^STANDARD:/.test(trimmed)) {
                    return (
                      <div key={i} className="bg-green-50 rounded-xl px-3 py-2.5 mt-3 border border-green-200">
                        <p className="text-[12px] text-green-600 uppercase tracking-wider font-bold mb-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>
                          Success Criteria
                        </p>
                        <p className="text-sm font-medium text-green-800">
                          {line.replace('STANDARD: ', '')}
                        </p>
                      </div>
                    );
                  }
                  // Style SUCCESS CRITERIA headers
                  if (/^SUCCESS CRITERIA:?$/i.test(trimmed)) {
                    return (
                      <div key={i} className="mt-2">
                        <p className="text-[12px] text-green-600 uppercase tracking-wider font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                          Success Criteria
                        </p>
                      </div>
                    );
                  }
                  // Style KEY SAFETY POINTS headers
                  if (/^KEY SAFETY POINTS:?$/i.test(trimmed) || /^SAFETY:?$/i.test(trimmed)) {
                    return (
                      <div key={i} className="bg-red-50 rounded-lg px-3 py-1.5 mt-2 mb-1 border-l-2 border-red-400">
                        <p className="text-sm text-red-800 font-bold">
                          {line}
                        </p>
                      </div>
                    );
                  }
                  // Style OBJECTIVE / PURPOSE lines
                  if (/^(OBJECTIVE|PURPOSE):/.test(trimmed)) {
                    return (
                      <div key={i} className="bg-blue-50 rounded-lg px-3 py-2 mt-1 mb-2 border-l-2 border-blue-300">
                        <p className="text-sm text-blue-800 font-medium">{line}</p>
                      </div>
                    );
                  }
                  // Style REPETITIONS lines
                  if (/^REPETITIONS:/.test(trimmed)) {
                    return (
                      <p key={i} className="text-sm font-medium text-[var(--tss-navy)] mt-2 bg-gray-50 rounded-lg px-3 py-2">
                        {line}
                      </p>
                    );
                  }
                  // Empty lines = spacing
                  if (trimmed === '') {
                    return <div key={i} className="h-1.5" />;
                  }
                  // Default text
                  return (
                    <p key={i} className="text-sm text-gray-700 mb-0.5">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function groupByBelt(
  materials: BeltMaterial[]
): Record<string, BeltMaterial[]> {
  const grouped: Record<string, BeltMaterial[]> = {};
  for (const mat of materials) {
    if (!grouped[mat.beltLevel]) grouped[mat.beltLevel] = [];
    grouped[mat.beltLevel].push(mat);
  }
  return grouped;
}

function groupByCategory(
  materials: BeltMaterial[]
): Record<string, BeltMaterial[]> {
  const grouped: Record<string, BeltMaterial[]> = {};
  for (const mat of materials) {
    if (!grouped[mat.category]) grouped[mat.category] = [];
    grouped[mat.category].push(mat);
  }
  return grouped;
}


// ═══════════════════════════════════════
// TAB 5: FEEDBACK
// ═══════════════════════════════════════

function FeedbackTab({
  data,
  autoExpandFirst = false,
  initialSurveyId = null,
  onDark = false,
  onOpenSessions,
}: {
  data: PortalData;
  autoExpandFirst?: boolean;
  initialSurveyId?: string | null;
  /** true = va dentro del bloque de archivo del Home (fondo #0A1628). */
  onDark?: boolean;
  /** "Read it in My Sessions →" del Thank you (2026-10-01). */
  onOpenSessions?: () => void;
}) {
  // La encuesta recién enviada (2026-10-01): su "Thank you" queda arriba aunque
  // el refresh la saque de las pendientes (antes desaparecía en un segundo).
  const [sent, setSent] = useState<{ id: string; unlocked: boolean } | null>(null);
  const { pendingSurveys: pendingAll, submittedSurveys, student, token } = data;
  const pendingSurveys = sent ? pendingAll.filter((r: any) => r.id !== sent.id) : pendingAll;
  // El botón de enviar quedaba abajo: el "Thank you" se trae a la vista.
  const sentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (sent) sentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [sent]);
  // Priority: ?survey=X URL param wins (deep-link from email).
  // Then autoExpandFirst (general "open feedback tab from email").
  // Otherwise nothing expanded.
  const initialExpand = (() => {
    if (initialSurveyId && pendingSurveys.some((s: any) => s.id === initialSurveyId)) {
      return initialSurveyId;
    }
    if (autoExpandFirst && pendingSurveys.length > 0) return pendingSurveys[0].id;
    return null;
  })();
  const [expandedSurveyId, setExpandedSurveyId] = useState<string | null>(initialExpand);
  const [expOpen, setExpOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-5">
      {sent && (
        <div ref={sentRef} style={{ scrollMarginTop: 12 }}>
        <SurveyDone title="Thank you" lines={[
          <>Your honest feedback becomes part of your coach&apos;s record.</>,
          <>Your session feedback is now open: read what your coach wrote and what comes next in <b>My Sessions</b>.</>,
          ...(sent.unlocked ? [<>The <b>My Coach</b> tab is open too — rating, certifications and your history together.</>] : []),
        ]}>
          {onOpenSessions && (
            <button type="button" onClick={onOpenSessions} className="mt-4 w-full min-h-[48px] rounded-[5px] text-[15px] font-black uppercase" style={{ background: '#00D2FF', color: '#061C2B', fontFamily: 'var(--font-archivo), Archivo, sans-serif', letterSpacing: '0.035em' }}>Read it in My Sessions →</button>
          )}
        </SurveyDone>
        </div>
      )}
      {/* Dos áreas (Marcelo 2026-09-25): 1 · Método y coach · 2 · Experiencia.
          Con el logo de la academia al lado del nuestro cuando el alumno es de
          una academia (Puro Surf). */}
      {(pendingSurveys.length > 0 || data.pendingExperience) && (() => {
        const academy = (data as any).academyBranding as { name: string | null; logo_url: string | null } | null;
        // v10.1 (Marcelo 2026-09-25): los dos logos del mismo tamaño sobre ink,
        // el texto grande en Archivo sobre sand, los números en Plex.
        return (
          <div className="rounded-lg overflow-hidden" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
            <div className="flex items-center justify-center gap-6 px-5 py-5" style={{ background: '#061C2B' }}>
              {academy?.logo_url && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={academy.logo_url} alt={academy.name ?? ''} className="h-14 w-auto object-contain" />
                  <span className="h-10 w-px" style={{ background: 'rgba(247,249,250,.25)' }} />
                </>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" className="h-14 w-auto object-contain" />
            </div>
            <div className="px-5 py-5">
              <h2 className="m-0 text-[24px]" style={{ ...H_BIG, color: '#10263B' }}>We&apos;d like your opinion in two areas</h2>
              <div className="mt-4 space-y-3">
                {[
                  { n: '1', t: 'Method & coach', d: 'the sessions, what you learned, your coach.' },
                  { n: '2', t: 'Experience', d: `facilities, equipment, transport and value${academy?.name ? ` at ${academy.name}` : ''}.` },
                ].map((r) => (
                  <div key={r.n} className="flex items-start gap-3">
                    <span className="shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center text-[14px] font-black" style={{ background: '#061C2B', color: '#00D2FF', fontFamily: 'var(--font-plex), DM Mono, monospace' }}>{r.n}</span>
                    <p className="m-0 text-[17px] leading-snug" style={{ color: '#10263B' }}>
                      <span className="font-extrabold" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>{r.t}</span>
                      <span> — {r.d}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 1 · Method & coach — una tarjeta por encuesta pendiente (v10.1, Marcelo
          2026-09-25: "más legible, que no se vea hecho con IA"). Con una sola
          pendiente el formulario va abierto; el kit vive en SurveyUi. */}
      {pendingSurveys.length > 0 && (
        <div className="space-y-3">
          {pendingSurveys.map((result: any, idx: number) => {
            const ci: any = Array.isArray(result.camp_sessions) ? result.camp_sessions[0] : result.camp_sessions;
            const inst = ci ? (Array.isArray(ci.camp_instances) ? ci.camp_instances[0] : ci.camp_instances) : null;
            const tpl = inst ? (Array.isArray(inst.camp_templates) ? inst.camp_templates[0] : inst.camp_templates) : null;
            const serviceKind = tpl?.service_kind ?? (result.standalone_sessions ? 'surf_lesson' : null);
            const serviceName = inst?.camp_name ?? null;
            const open = expandedSurveyId === result.id || (pendingSurveys.length === 1 && idx === 0);
            const when = surveyDateLabel(ci?.session_date, result.created_at);
            const coach = result.coaches?.display_name ? `Coach ${result.coaches.display_name}` : null;
            const answerBtn = (
              <button type="button" onClick={() => setExpandedSurveyId(result.id)} className="shrink-0 h-10 px-4 rounded-[5px] text-[13px]" style={{ ...H_BIG, fontWeight: 800, letterSpacing: '0.02em', background: '#00D2FF', color: '#061C2B' }}>Answer →</button>
            );
            return (
              <section key={result.id} className="rounded-lg overflow-hidden" style={{ background: '#F7F9FA', border: '1px solid #DCD7C6' }}>
                <SurveySectionHead
                  kicker="1 · Method & coach"
                  title={result.standalone_sessions?.mission || serviceName || 'Your sessions'}
                  sub={[when, coach].filter(Boolean).join(' · ')}
                  right={open
                    ? (pendingSurveys.length > 1 ? <button type="button" onClick={() => setExpandedSurveyId(null)} className="shrink-0 text-[13px] font-semibold underline" style={{ color: '#55666E' }}>Hide</button> : null)
                    : answerBtn}
                />
                {open && <SurveyForm resultId={result.id} token={token} serviceKind={serviceKind} serviceName={serviceName} onSent={(unlocked) => setSent({ id: result.id, unlocked })} />}
              </section>
            );
          })}
        </div>
      )}

      {/* 2 · Experience — una por camp: instalaciones, equipo, transporte,
          comunicación, value. Abierta de una si no queda nada del área 1. */}
      {data.pendingExperience && (() => {
        const openExp = expOpen || pendingSurveys.length === 0;
        return (
          <section className="rounded-lg overflow-hidden" style={{ background: '#F7F9FA', border: '1px solid #DCD7C6' }}>
            <SurveySectionHead
              kicker="2 · Experience"
              title={data.pendingExperience.campName || 'Your camp experience'}
              sub="One minute — facilities, equipment, transport & value"
              right={openExp ? null : <button type="button" onClick={() => setExpOpen(true)} className="shrink-0 h-10 px-4 rounded-[5px] text-[13px]" style={{ ...H_BIG, fontWeight: 800, letterSpacing: '0.02em', background: '#00D2FF', color: '#061C2B' }}>Answer →</button>}
            />
            {openExp && (
              <div className="px-5 py-5">
                <ExperienceSurveyForm token={data.pendingExperience.token} onDone={() => setTimeout(() => router.refresh(), 2500)} />
              </div>
            )}
          </section>
        );
      })()}

      {/* Past Feedback */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: onDark ? '#dbe8f1' : 'var(--tss-navy)' }}>
          Past Feedback ({submittedSurveys.length})
        </h2>
        {submittedSurveys.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <p className="text-gray-400 text-sm">No feedback submitted yet.</p>
          </div>
        ) : (
          submittedSurveys.map((survey: any) => {
            const ssr = survey.student_session_results;
            const coachName = ssr?.coaches?.display_name;
            const coachFeedback = ssr?.student_visible_summary; // M135 — daily coach_feedback is internal now
            return (
              <div
                key={survey.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3"
              >
                {/* Header: session + the stars you gave */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ssr?.standalone_sessions?.mission || 'Session'}
                    </p>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {surveyDateLabel(
                        (Array.isArray(ssr?.camp_sessions) ? ssr.camp_sessions[0] : ssr?.camp_sessions)?.session_date,
                        ssr?.created_at || survey.created_at,
                      )}
                      {coachName && ` · ${coachName}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm tracking-tight" style={{ color: BRAND.colors.gold }}>
                      {'★'.repeat(survey.coach_rating)}<span className="text-gray-200">{'★'.repeat(5 - survey.coach_rating)}</span>
                    </div>
                    <p className="text-[12px] text-gray-400 mt-0.5">You rated</p>
                  </div>
                </div>

                {/* The coach's feedback for YOU — the real value */}
                {coachFeedback ? (
                  <div className="rounded-xl bg-[var(--tss-navy)]/[0.03] border-l-4 border-[var(--tss-cyan)] px-3 py-2.5">
                    <p className="text-[12px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Your coach&apos;s feedback
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {coachFeedback}
                    </p>
                  </div>
                ) : ssr?.whats_next ? (
                  // Sin resumen escrito, lo que SÍ dejó el coach para vos: el próximo foco.
                  <div className="rounded-xl bg-[var(--tss-navy)]/[0.03] border-l-4 border-[var(--tss-cyan)] px-3 py-2.5">
                    <p className="text-[12px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Next focus · from your coach
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{ssr.whats_next}</p>
                  </div>
                ) : null}

                {/* Homework stays student-facing; "what's next" is internal (M135). */}
                {ssr?.homework && (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                      <p className="text-[12px] font-mono uppercase tracking-wider text-amber-700 mb-0.5">Homework</p>
                      <p className="text-xs text-amber-900 leading-relaxed">{ssr.homework}</p>
                    </div>
                  </div>
                )}

                {survey.open_comment && (
                  <p className="text-[12px] text-gray-400 italic">
                    Your note: &ldquo;{survey.open_comment}&rdquo;
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {pendingSurveys.length === 0 && submittedSurveys.length > 0 && (
        <div className="bg-green-50 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-sm text-green-700 font-medium">
            All feedback submitted. You are up to date!
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════

// Plain-language meaning for each evaluation status, so the label isn't jargon.
const STATUS_MEANING: Record<string, string> = {
  mastered: 'Consistent and automatic, even in real conditions.',
  competent: 'Solid in controlled conditions; next step is real water.',
  partial: 'Getting there — it works some of the time.',
  not_yet: 'Not demonstrated yet — keep practicing.',
  not_achieved: 'Not demonstrated yet — keep practicing.',
};

function statusMeaning(status: string): string | null {
  return STATUS_MEANING[status] ?? null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    mastered: 'bg-green-50 text-green-700',
    competent: 'bg-blue-50 text-blue-700',
    partial: 'bg-amber-50 text-amber-700',
    not_yet: 'bg-gray-50 text-gray-600',
    not_achieved: 'bg-gray-50 text-gray-600',
  };

  return (
    <span
      className={`text-[12px] px-2 py-0.5 rounded-full capitalize font-medium ${
        styles[status] || 'bg-gray-50 text-gray-600'
      }`}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-700 capitalize">{value?.replace(/_/g, ' ')}</span>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 6: MY COACH (visible only after first survey unlocks it)
// ═══════════════════════════════════════

function MyCoachTab({ data }: { data: PortalData }) {
  if (!data.myCoach) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
        <User size={28} strokeWidth={1.75} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">
          No coach data yet. Once you have a closed session with a coach, their
          profile will show here.
        </p>
      </div>
    );
  }

  const { coach, stats } = data.myCoach;
  const initials = `${coach.first_name?.[0] || ''}${coach.last_name?.[0] || ''}`.toUpperCase() || '—';
  const hours = Math.round((stats.totalMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-4">
      {/* Coach card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ring-2 ring-white shadow-md"
            style={{ background: BRAND.colors.navy }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--tss-navy)] text-base truncate">
              {coach.display_name}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize font-medium">
                {coach.role.replace(/_/g, ' ')}
              </span>
              {coach.certification_level && (
                <span className="text-[12px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                  {coach.certification_level}
                </span>
              )}
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                Up to {coach.max_belt_permission?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
        {(coach.specialty_area || coach.languages) && (
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
            {coach.specialty_area && (
              <div>
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">
                  Specialty
                </p>
                <p className="text-sm text-gray-700 mt-0.5">{coach.specialty_area}</p>
              </div>
            )}
            {coach.languages && (
              <div>
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">
                  Languages
                </p>
                <p className="text-sm text-gray-700 mt-0.5">{coach.languages}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats with this student */}
      <div>
        <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
          Your history together
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Sessions" value={stats.totalSessions.toString()} />
          <StatCard label="Hours trained" value={hours > 0 ? hours.toString() : '—'} />
          <StatCard
            label="Last session"
            value={
              stats.lastSessionDate
                ? new Date(stats.lastSessionDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'
            }
          />
          <StatCard
            label="Your rating"
            value={
              stats.avgRating !== null
                ? `${stats.avgRating}/5`
                : '—'
            }
            sublabel={stats.ratingsCount > 0 ? `${stats.ratingsCount} survey${stats.ratingsCount > 1 ? 's' : ''}` : undefined}
          />
        </div>
      </div>

      {/* Hint */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-[12px] text-amber-700 leading-relaxed">
          <strong>How this works:</strong> Your coach earns their reputation
          from your honest feedback. After every session, you&apos;ll get an
          email with a quick survey. The more you submit, the more accurate
          their rating becomes.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
      <p className="text-lg font-bold text-[var(--tss-navy)]">{value}</p>
      <p className="text-[12px] text-gray-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
      {sublabel && <p className="text-[12px] text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

// ═══ 2026-09-26: PortalAlerts, UpcomingCampCard y UpcomingSessionCard vivían acá
// sin montarse en ningún lado (el Home nuevo dibuja la clase arriba con su
// propia tarjeta). Se borraron; están en git si hicieran falta.
