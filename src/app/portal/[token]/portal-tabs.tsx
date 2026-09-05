'use client';

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
import { PROMOTION_COPY, LIGHT_BELTS } from '@/lib/constants/promotion-copy';
import { toElSalvadorDate } from '@/lib/utils/tz';
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
import { LinkedTrainingFlow } from '@/components/sequence/LinkedTrainingFlow';
import { SequenceTrainingFlow } from '@/components/sequence/SequenceTrainingFlow';
import { CustomSessionFlow } from '@/components/portal/CustomSessionFlow';
import { FreeSurfLogger } from '@/components/portal/FreeSurfLogger';
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
import { sequenceLabel } from '@/lib/constants/learning-blocks';
import { OCEAN_LEVEL_INFO, type OceanLevel } from '@/lib/constants/ocean-levels';
import { LineupTab } from '@/components/portal/LineupTab';
import { WaterLevel } from '@/components/portal/WaterLevel';
import { GlossaryTab } from '@/components/portal/GlossaryTab';
import { VideoAnalyzerLauncher } from '@/components/video-analyzer/VideoAnalyzerLauncher';
import { VenueScoutLauncher } from '@/components/venue-scout/VenueScoutLauncher';
import { BreathingLauncher } from '@/components/breathing/BreathingLauncher';
import { LogoutButton } from '@/components/portal/LogoutButton';
import { BELT_MIRROR, cueForSession } from '@/lib/constants/mental-cues';
import {
  createSelfTrainingSession,
  completeSelfTrainingSession,
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
  };
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
  /** La primera secuencia sin lograr y el paso que la frena. */
  /** ¿Sigue pendiente lo que el coach dejó para trabajar? */
  coachFocusState?: { flagged: number; pending: number; clearedByStudent: boolean };
  /** The Lineup: el canal de la comunidad (null si falló la carga). */
  lineup?: import('@/lib/actions/community').LineupData | null;
  nextMove?: {
    sequenceId?: string;
    sequenceOrder: number;
    sequenceName: string;
    stepId: string;
    stepTitle: string;
    stars: number | null;
    official: boolean;
    /** held_back = el paso que detuvo tu último run de la secuencia. */
    source?: 'held_back' | 'weakest';
    selfSequenceRating?: number | null;
    /** Lo que dejaste a medias hace poco y no es el paso de arriba. */
    unfinished?: { stepId: string; stepTitle: string; sequenceId: string; sequenceOrder: number; sequenceName: string; stars: number; date: string } | null;
    /** El detalle más flojo de la última práctica de ese paso. */
    detail?: { text: string; result: 'partial' | 'not_met'; drillTitle: string | null; date: string } | null;
  } | null;
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

// ── Brand v10 type + color helpers (M140 student-home redesign) ──
const F_DISPLAY = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.08 } as const;
const F_LABEL = { fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em' } as const;

// ═══ YOUR NEXT MOVES ═══ (Marcelo 2026-09-04/05)
// Una sola fuente para las dos puertas: en el HOME sale SOLO la primera (lo
// más importante) con "N more waiting in Let's Play"; en LET'S PLAY sale la
// lista completa numerada, con origen, razón y la regla del orden.
// Orden: 1 lo que dejó el coach · 2 el método (el paso que detuvo tu último
// run, o el primero < 4★) · 3 lo que dejaste < 4★ en dos semanas.
type NextMoveRow = { key: string; label: string; title: string; reason: string; detail?: string | null; action: string | null; accent: string; onClick?: () => void };

function nextMoveRows(
  data: PortalData,
  onTrainSequence?: (args: TrainSequenceArgs) => void,
  onOpenStep?: (stepId: string) => void,
): { rows: NextMoveRow[]; coachCleared: boolean } {
  const student = data.student as any;
  const coachFocus: string | null = (data as any).standaloneEvaluation?.focus || student?.next_recommended_focus || null;
  const coachCleared = !!coachFocus && !!(data as any).coachFocusState?.clearedByStudent;
  const rows: NextMoveRow[] = [];
  if (coachFocus && !coachCleared) {
    rows.push({
      key: 'coach', label: 'From your coach', title: coachFocus, accent: BRAND.colors.cyan,
      reason: (data as any).standaloneEvaluation?.note || 'Stays here until you take it to 4★ on your own.',
      action: null,
    });
  }
  const nm = data.nextMove ?? null;
  if (nm) {
    const seq = sequenceLabel(nm.sequenceId ?? null, nm.sequenceOrder, nm.sequenceName);
    rows.push({
      key: 'sequence', label: 'Your sequence', title: nm.stepTitle, accent: BRAND.colors.cyan,
      reason: nm.source === 'held_back'
        ? `Held your last run of ${seq} back${nm.selfSequenceRating != null ? ` · your run ${nm.selfSequenceRating}★` : ''}`
        : `First step below 4★ in ${seq}${nm.stars !== null ? ` · ${nm.stars}★` : ''}${nm.official ? ' · rated by your coach' : ''}`,
      detail: nm.detail ? `Last practice · ${nm.detail.result === 'not_met' ? 'not met' : 'partial'}: ${nm.detail.text}` : null,
      action: 'Practice it →',
      onClick: () => {
        if (nm.sequenceId && onTrainSequence) onTrainSequence({ sequenceId: nm.sequenceId, mode: 'step_focus', focusStepId: nm.stepId });
        else onOpenStep?.(nm.stepId);
      },
    });
    if (nm.unfinished) {
      const u = nm.unfinished;
      rows.push({
        key: 'unfinished', label: 'Unfinished', title: u.stepTitle, accent: '#FFD166',
        reason: `Now at ${u.stars}★ · ${sequenceLabel(u.sequenceId, u.sequenceOrder, u.sequenceName)} · from the last two weeks`,
        action: 'Pick it up →',
        onClick: () => {
          if (onTrainSequence) onTrainSequence({ sequenceId: u.sequenceId, mode: 'step_focus', focusStepId: u.stepId });
          else onOpenStep?.(u.stepId);
        },
      });
    }
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
  const { rows, coachCleared } = nextMoveRows(data, onTrainSequence, onOpenStep);
  if (rows.length === 0 && !coachCleared) return null;
  const rowStyle = { borderTop: '1px solid rgba(255,255,255,.08)' };
  const renderRow = (r: NextMoveRow, idx: number, numbered: boolean) => {
    const inner = (
      <div className="flex items-start gap-3">
        {numbered && (
          <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: r.accent, color: '#061C2B' }} aria-label={`Priority ${idx + 1}`}>
            {idx + 1}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[9px]" style={{ ...F_LABEL, color: r.accent }}>{numbered ? r.label : `Work on this · ${r.label.toLowerCase()}`}</p>
          <p className="text-[15px] font-semibold text-white mt-0.5 leading-snug">{r.title}</p>
          <p className="text-[12px] text-white/60 mt-0.5 leading-snug">{r.reason}</p>
          {r.detail && <p className="text-[12px] mt-1 leading-snug" style={{ color: '#FFD166' }}>{r.detail}</p>}
          {r.action && <p className="text-[12px] mt-1.5 font-semibold" style={{ color: r.accent }}>{r.action}</p>}
        </div>
      </div>
    );
    return r.onClick ? (
      <button key={r.key} type="button" onClick={r.onClick} className="block w-full text-left px-4 py-3.5" style={numbered || idx > 0 ? rowStyle : undefined}>{inner}</button>
    ) : (
      <div key={r.key} className="px-4 py-3.5" style={numbered || idx > 0 ? rowStyle : undefined}>{inner}</div>
    );
  };
  const cleared = coachCleared && (
    <div className="px-4 py-3" style={rowStyle}>
      <p className="text-[9px]" style={{ ...F_LABEL, color: '#06D6A0' }}>You cleared it</p>
      <p className="text-[13.5px] text-white mt-1 leading-snug">You took what your coach left you to 4★ on your own.</p>
      <p className="text-[12px] text-white/60 mt-1 leading-snug">They confirm it next time they see you in the water.</p>
    </div>
  );

  if (mode === 'top') {
    // HOME: una sola cosa. El resto vive en Let's Play.
    const first = rows[0];
    return (
      <>
        {first ? renderRow(first, 0, false) : cleared}
        {first && cleared}
        {rows.length > 1 && (
          <button type="button" onClick={() => onGoTo?.('sequence')} className="block w-full text-left px-4 py-2.5 text-[11.5px]" style={{ ...rowStyle, color: '#8aa0b0' }}>
            {rows.length - 1} more waiting in Let&apos;s Play →
          </button>
        )}
      </>
    );
  }

  // LET'S PLAY: la lista completa, numerada, con la regla.
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0A2438', border: '1px solid rgba(0,210,255,.35)' }}>
      <div className="px-4 pt-3.5 pb-2">
        <p className="text-[9px]" style={{ ...F_LABEL, color: BRAND.colors.cyan }}>Your next moves</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,.55)' }}>{rows.length > 1 ? 'In this order. Tap one to train it.' : 'Tap it to train it.'}</p>
      </div>
      {cleared}
      {rows.map((r, idx) => renderRow(r, idx, true))}
      {rows.length > 0 && (
        <p className="px-4 py-2.5 text-[10.5px] leading-snug" style={{ color: '#8aa0b0', ...rowStyle }}>
          The order: 1 your coach · 2 the method (the step that held your last run back, or the earliest one below 4★) · 3 what you left below 4★ in the last two weeks. Training something else does not change 1 and 2.
        </p>
      )}
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
}: {
  data: PortalData;
  initialTab?: Tab;
  initialSurveyId?: string | null;
  initialDrillId?: string | null;
  initialStepId?: string | null;
}) {
  // Al terminar una Custom Session el Home debe re-leer del servidor
  // (horas, sesiones) — sin esto quedaba viejo hasta recargar.
  const portalRouter = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'home');
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
    if (initialTab || initialSurveyId || initialDrillId || initialStepId) return;
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
  useEffect(() => {
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
  // Let's Play por SECUENCIA (Marcelo 2026-09-04): correr la secuencia
  // completa o trabajar un paso como foco. Se renderiza inline en el tab.
  const [pendingSequence, setPendingSequence] = useState<TrainSequenceArgs | null>(null);

  // Los parámetros de deep-link (?tab=, ?lesson=, ?drill=, ?step=, ?survey=)
  // ya quedaron capturados en estado arriba, así que se limpian de la barra de
  // direcciones. Si no, la URL queda PEGADA: el alumno entra una vez a una
  // lección o a Let's Play por un link y a partir de ahí cada recarga lo
  // devuelve al mismo lugar, aunque haya navegado a Inicio con la barra de
  // abajo (que solo cambia estado y nunca tocó la URL).
  useEffect(() => {
    try {
      if (!window.location.search) return;
      window.history.replaceState(null, '', window.location.pathname);
    } catch { /* la limpieza es cosmética, nunca debe romper el portal */ }
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
  const openStepInPlay = (stepId: string) => {
    // Un flujo abandonado (secuencia o pieza) no puede secuestrar el salto.
    setPendingSequence(null);
    setPendingDrillMissionId(null);
    setDeepStepId(stepId);
    setActiveTab('sequence');
  };

  const handlePracticeDrill = (drillMissionId: string) => {
    setPendingDrillMissionId(drillMissionId);
    // Stay on 'sequence' tab — Let's Play renders LinkedTrainingFlow inline.
    setActiveTab('sequence');
  };

  // M9 — academy branding (falls back to TSS defaults when academy
  // hasn't set logo / colors / tagline / name).
  const brand = resolveAcademyBranding((data as any).academyBranding ?? null);

  return (
    <div className="min-h-screen tss-portal-bg pb-20" style={{ background: '#000' }}>
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
            data={{ ...data, lineupUnreadLive: lineupUnread } as any}
            belt={belt}
            onGoTo={setActiveTab}
            onOpenStep={openStepInPlay}
            onTrainSequence={(a) => { setDeepStepId(null); setPendingDrillMissionId(null); setPendingSequence(a); setActiveTab('sequence'); }}
            onOpenRoadmap={() => setRoadmapOpen(true)}
            onOpenWater={() => setWaterOpen(true)}
          />
        )}
        {activeTab === 'course' && data.courseData && (
          <div className="space-y-4">
            {/* Qué hace falta para la próxima cinta: la evaluación del coach
                dada vuelta. El alumno tenía las estrellas sueltas pero nunca
                la lista completa ni la regla. */}
            <button
              type="button"
              onClick={() => setRoadmapOpen(true)}
              className="block w-full text-left rounded-2xl px-4 py-3.5"
              style={{ background: 'rgba(0,210,255,.08)', border: '1px solid rgba(0,210,255,.28)' }}
            >
              <p className="text-[9px] tracking-[.18em] uppercase" style={{ color: BRAND.colors.cyan }}>
                What it takes
              </p>
              <p className="text-[15px] font-semibold text-white mt-1 leading-snug">
                Everything you need for your next belt
              </p>
              <p className="text-[12px] text-white/60 mt-0.5">
                The same list your coach fills in — sequences, water, course.
              </p>
            </button>
            <CourseTab data={data.courseData} />
            {/* Las presentaciones otorgadas viven en COURSE, no en el Home
                (pedido de Marcelo 2026-08-25). Es el mismo lugar que ya usa
                el coach en su pestaña Cursos. No dibuja nada si no hay. */}
            <StudentPresentations token={data.token} initial={data.homeBundle?.presentations} />
            {/* Glossary — collapsible at the bottom of Course (moved out of the nav) */}
            <details className="rounded-2xl overflow-hidden" style={{ background: '#0F1E33' }}>
              <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <BookOpen size={16} strokeWidth={1.75} className="text-[var(--tss-cyan)]" />
                  Glossary
                </span>
                <ChevronDown size={16} className="text-white/40" />
              </summary>
              <div className="px-3 pb-3 pt-1 border-t border-white/5">
                <GlossaryTab />
              </div>
            </details>
          </div>
        )}
        {activeTab === 'sequence' && (<>
          {/* 0) Secuencia elegida → correrla completa o con un paso como foco.
              Se queda MONTADA (oculta) mientras el alumno ensaya el drill del
              paso: al volver, su plan (seguridad, tiempo, runs, objetivo)
              sigue ahí. */}
          {pendingSequence && (
            <div hidden={!!pendingDrillMissionId}>
              <SequenceTrainingFlow
                key={`${pendingSequence.sequenceId}:${pendingSequence.mode}:${pendingSequence.focusStepId ?? ''}`}
                portalToken={data.token}
                sequenceId={pendingSequence.sequenceId}
                belt={data.courseData?.activeCourseBelt || student.belt_level || 'white'}
                mode={pendingSequence.mode}
                focusStepId={pendingSequence.focusStepId ?? null}
                studentBelt={student.belt_level || 'white_belt'}
                onCancel={() => setPendingSequence(null)}
                onRehearse={(drillId) => handlePracticeDrill(drillId)}
                onDone={() => { setPendingSequence(null); portalRouter.refresh(); }}
              />
            </div>
          )}
          {pendingDrillMissionId ? (
            // 1) Drill picked from MySequenceTab (or "rehearse it on land first")
            //    → run the linked flow inline. "Back to My Sequence" is truthful:
            //    it drops the sequence flow too; "Stay in Train tab" returns to it.
            <LinkedTrainingFlow
              key={pendingDrillMissionId}
              drillMissionId={pendingDrillMissionId}
              portalToken={data.token}
              studentBelt={student.belt_level || 'white_belt'}
              onClearIncoming={() => setPendingDrillMissionId(null)}
              onReturnToSequence={() => { setPendingDrillMissionId(null); setPendingSequence(null); }}
            />
          ) : pendingSequence ? null : showCustomSession ? (
            // 2) Custom Session escape hatch — free-form, doesn't count toward step mastery
            <CustomSessionFlow
              portalToken={data.token}
              onCancel={() => setShowCustomSession(false)}
              onDone={() => { setShowCustomSession(false); portalRouter.refresh(); }}
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
          ) : (
            // 3) Default: pick a drill or mission from your sequence
            <div className="space-y-4">
              <NextMovesBlock
                data={data}
                mode="full"
                onTrainSequence={(args) => { setDeepStepId(null); setPendingSequence(args); }}
                onOpenStep={openStepInPlay}
                onGoTo={setActiveTab}
              />
              <MySequenceTab
                portalToken={data.token}
                belt={data.courseData?.activeCourseBelt || student.belt_level || 'white'}
                onPracticeDrill={handlePracticeDrill}
                onTrainSequence={(args) => { setDeepStepId(null); setPendingSequence(args); }}
                initialStepId={deepStepId}
              />
              <button
                type="button"
                onClick={() => setShowCustomSession(true)}
                className="w-full bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-4 text-left transition-colors"
              >
                <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  <Waves size={14} strokeWidth={1.75} />
                  Custom Session
                </p>
                <p className="text-sm font-semibold text-[var(--tss-navy)] mt-1">
                  Free surf, breathing, fun — anything off-script
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Logged for the record but does NOT count toward step mastery.
                </p>
              </button>

              {/* ── TOOLS — un solo grupo (rediseño Marcelo 2026-09-01) ──
                  Antes eran tres "secciones" huérfanas con una tarjeta cada
                  una y la etiqueta repitiendo el título de la tarjeta. Las
                  tarjetas ya se presentan solas (ícono + título + subtítulo):
                  un encabezado y la grilla alcanzan. */}
              <div>
                <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                  <Video size={14} strokeWidth={1.75} />
                  Tools
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <VideoAnalyzerLauncher
                    scope={`student:${data.token}`}
                    title="Analyze your surfing"
                    subtitle="Load your clip, compare it to the Surf Sequence models, and draw lines & angles frame by frame."
                  />
                  <VenueScoutLauncher variant="light" />
                  <BreathingLauncher variant="light" />
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
        {activeTab === 'sessions' && <SessionsTab data={data} />}
        {activeTab === 'glossary' && <GlossaryTab />}
        {activeTab === 'feedback' && (
          <FeedbackTab
            data={data}
            autoExpandFirst={initialTab === 'feedback'}
            initialSurveyId={initialSurveyId || null}
          />
        )}
        {activeTab === 'my-coach' && data.myCoach && <MyCoachTab data={data} />}

        {/* La guía de requisitos vive sobre cualquier pestaña. */}
        {roadmapOpen && (
          <BeltRoadmap
            token={data.token}
            onClose={() => setRoadmapOpen(false)}
            onOpenStep={openStepInPlay}
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
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 flex flex-col items-center py-2.5 text-[10px] font-semibold transition-colors ${
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
        <p className="text-[10px] text-gray-300">The Surf Sequence -- {BRAND.tagline}</p>
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
}: {
  data: PortalData;
  belt: any;
  onGoTo: (tab: Tab) => void;
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
  // Lo último que el coach le dejó para trabajar. Puede venir de una
  // evaluación suelta desde su ficha o del cierre de un camp.
  const coachFocus: string | null =
    (data as any).standaloneEvaluation?.focus ||
    (student as any).next_recommended_focus ||
    null;
  // La sugerencia del coach se apaga sola cuando el alumno entrena esos pasos
  // y los lleva a 4 por su cuenta.
  const coachFocusDone = !!(data as any).coachFocusState?.clearedByStudent;
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
  const surf = data.surfHours ?? { trainingMinutes: 0, freeSurfMinutes: 0, totalMinutes: 0 };
  const fmtHm = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };
  // Tamaño para la cifra del centro del anillo. Archivo Expanded es ancha
  // (~0.62em por carácter), y el hueco libre dentro del aro son ~81px: a
  // partir de "16h 44m" un tamaño fijo se sale. Se ajusta al largo real.
  const ringFontSize = (label: string) =>
    label.length <= 3 ? '24px'
    : label.length <= 5 ? '20px'
    : label.length <= 7 ? '16px'
    : label.length <= 9 ? '13.5px'
    : '12px';

  // Training tip of the day — rotate based on day of year
  // El cue rota por SESIONES CERRADAS, no por día del calendario: trae un
  // "Today", así que tiene que cambiar cuando el alumno entrena.
  const beltMirror = BELT_MIRROR[beltLevel] ?? BELT_MIRROR.white_belt;
  const sessionCue = cueForSession(beltLevel, totalSessions);

  return (
    <div className="space-y-4">
      {/* ── 📖 ONE WAVE — la compra del libro, adelante y al centro (venta
          web 2026-09-01). Solo si tiene el grant; abre el PDF inline con el
          mismo mecanismo de materiales. Las DEMÁS presentaciones siguen en
          Course (decisión 2026-08-25) — esto es su compra, no la lista. ── */}
      {(() => {
        const bk = ((data as any).homeBundle?.presentations ?? []).find(
          (p: any) => p.id === 'f50677a2-72b1-4abd-9335-fe0c99c80333',
        );
        if (!bk) return null;
        return (
          <a
            href={bk.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden"
            style={{ background: '#0F1E33', border: '1px solid rgba(0,210,255,.25)' }}
          >
            <div className="flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/web/img/one-wave-cover.jpg"
                alt="ONE WAVE"
                className="w-16 h-auto rounded shadow-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] tracking-[.18em] uppercase font-mono" style={{ color: '#5AC3E7' }}>
                  Your book
                </p>
                <p className="text-white font-bold text-[15px] mt-0.5 leading-tight">ONE WAVE</p>
                <p className="text-[11.5px] text-white/55 mt-1 leading-snug">
                  A practical system to train with intention — your copy, on any device.
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold" style={{ color: '#5AC3E7' }}>
                Read →
              </span>
            </div>
          </a>
        );
      })()}
      {/* ── 🏆 Promoción de cinta — celebración 30 días, SIN candados. El copy
          es por cinta (qué dominó / qué desbloquea) desde promotion-copy.ts. ── */}
      {(() => {
        const promotedAt = (student as any).belt_promoted_at as string | null;
        if (!promotedAt) return null;
        const days = (Date.now() - new Date(promotedAt).getTime()) / 86400000;
        if (!(days >= 0 && days <= 30)) return null;
        const d = BELT_DISPLAY[beltLevel];
        const copy = PROMOTION_COPY[beltLevel];
        if (!d || !copy?.next) return null;
        const note = campWithNote?.coach_final_note ?? null;
        const ctaInk = LIGHT_BELTS.includes(beltLevel);
        return (
          <div
            className="relative overflow-hidden rounded-3xl p-5"
            style={{ background: '#0A1628', border: `1px solid ${d.color}77`, boxShadow: `0 6px 30px ${d.color}22` }}
          >
            <div
              className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${d.color}44, transparent 70%)` }}
            />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-2" style={{ color: d.color }}>
              🏆 Belt promotion
            </p>
            <h2
              className="text-[24px] font-extrabold uppercase leading-tight mb-2"
              style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', color: '#F7F9FA' }}
            >
              You’re now a <span style={{ color: d.color }}>{d.en}</span>!
            </h2>
            {copy.mastered && (
              <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: 'rgba(247,249,250,.8)' }}>
                ✓ {copy.mastered}
              </p>
            )}
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'rgba(247,249,250,.8)' }}>
              → {copy.next}
            </p>
            {note && (
              <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: 'rgba(255,255,255,.05)', borderLeft: '3px solid #00D2FF' }}>
                <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: '#00D2FF' }}>From your coach</p>
                <p className="text-[13px] italic leading-relaxed" style={{ color: 'rgba(247,249,250,.9)' }}>{note}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => onGoTo('sequence')}
              className="w-full rounded-full py-3 text-[13px] font-extrabold"
              style={{ background: d.color, color: ctaInk ? '#061C2B' : '#FFFFFF' }}
            >
              See your new sequence →
            </button>
          </div>
        );
      })()}

      {/* ── Dark "cockpit" hero — TSS Ocean Navy, Garmin-style telemetry ── */}
      <div className="rounded-3xl overflow-hidden" style={{ background: '#061C2B' }}>
        {/* Notifications row (TSS wordmark now lives in the shared header on
            every screen, so it isn't repeated here). */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
        >
          <span className="text-[9px]" style={{ ...F_LABEL, color: '#00D2FF' }}>The Surf Sequence · Student portal</span>
          <button type="button" onClick={openInbox}
            aria-label="Notifications" className="relative p-2.5 -m-2.5">
            <Bell size={18} strokeWidth={1.75} style={{ color: unreadMsgs > 0 ? '#00D2FF' : 'rgba(247,249,250,.6)' }} />
            {unreadMsgs > 0 && (
              // Tinta sobre coral (6.3:1) — blanco sobre coral no pasaba AA.
              <span className="absolute -top-1 -right-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ minWidth: 15, height: 15, background: '#FF6B6B', color: '#061C2B', padding: '0 3px' }}>
                {unreadMsgs}
              </span>
            )}
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Identity row: photo + name + belt + streak */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0"
              style={{ border: '2px solid #5AC3E7', background: '#1b3148' }}
            >
              {student.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={26} strokeWidth={1.75} style={{ color: '#8aa0b2' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[21px] truncate" style={{ ...F_DISPLAY, color: '#F7F9FA' }}>
                {student.first_name} {student.last_name}
              </p>
              <span
                className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-[9px]"
                style={{ ...F_LABEL, background: belt?.color || '#E8E8E8', color: ['white_belt'].includes(student.belt_level) ? '#061C2B' : '#fff' }}
              >
                {belt?.en}
              </span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[26px] leading-none" style={{ ...F_DISPLAY, color: '#00D2FF' }}>{streak}</p>
              <p className="text-[8px] mt-1" style={{ ...F_LABEL, color: '#8aa0b2' }}>Day streak</p>
            </div>
          </div>

          {/* Primary ring: total water time + belt progress */}
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="relative shrink-0" style={{ width: 104, height: 104 }}>
              <svg viewBox="0 0 120 120" width="104" height="104">
                {/* El aro es el SPLIT de estas horas, no otro dato: el arco
                    verde son las de Free Surf y el cyan las de Training.
                    Antes dibujaba el progreso de CINTA alrededor de la cifra
                    de horas — por eso parecía un segundo score (Marcelo,
                    2026-08-25). El nivel ya tiene su propia barra al lado. */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="#06D6A0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#00D2FF" strokeWidth="10"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 * (1 - (surf.totalMinutes > 0 ? surf.trainingMinutes / surf.totalMinutes : 0))}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              {/* El texto vive DENTRO del anillo: el hueco libre son ~81px de
                  diámetro, así que un tamaño fijo se desbordaba apenas la cifra
                  crecía ("16h 44m" a 22px no entraba). Se achica sola según el
                  largo y nunca parte en dos líneas. */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-3">
                <p className="font-bold leading-none whitespace-nowrap" style={{
                  fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', color: '#f0f7fa',
                  fontSize: ringFontSize(fmtHm(surf.totalMinutes)),
                }}>
                  {fmtHm(surf.totalMinutes)}
                </p>
                <p className="text-[7.5px] font-mono uppercase tracking-[0.12em] mt-1 whitespace-nowrap" style={{ color: '#8aa0b2' }}>In the water</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#00D2FF' }}>Level progress</p>
              <p className="text-sm font-semibold mt-1" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', color: '#f0f7fa' }}>
                Level {BELT_RANK[beltLevel] ?? 1} of 6
              </p>
              <div className="h-1.5 rounded-full overflow-hidden mt-2 mb-2" style={{ background: '#1f344a' }}>
                <div className="h-full rounded-full" style={{ width: `${((BELT_RANK[beltLevel] ?? 1) / 6) * 100}%`, background: '#00D2FF' }} />
              </div>
              {/* Desglose de LAS MISMAS horas del anillo — un solo lugar
                  para el dato (antes eran dos tarjetas sueltas más abajo). */}
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: '#b8cad8' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#00D2FF', display: 'inline-block' }} />
                  Training <b style={{ color: '#f0f7fa' }}>{fmtHm(surf.trainingMinutes)}</b>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: '#b8cad8' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#06D6A0', display: 'inline-block' }} />
                  Free surf <b style={{ color: '#f0f7fa' }}>{fmtHm(surf.freeSurfMinutes)}</b>
                </span>
              </div>
              {(() => {
                const idx = BELT_HIERARCHY.indexOf(beltLevel);
                const next = idx >= 0 && idx < BELT_HIERARCHY.length - 1 ? BELT_HIERARCHY[idx + 1] : null;
                const nd = next ? BELT_DISPLAY[next] : null;
                return nd ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: nd.color }} />
                    <span className="text-[11px]" style={{ color: '#8aa0b2' }}>Next: {nd.levelName} · {nd.en}</span>
                  </div>
                ) : (
                  <span className="text-[11px]" style={{ color: '#8aa0b2' }}>Top belt reached</span>
                );
              })()}
            </div>
          </div>

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
          {(coachFocus || data.nextMove || sessionCue.cue) && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #5AC3E7' }}
            >
              {/* Una sola cosa en el Home; la lista completa vive en Let's Play. */}
              <NextMovesBlock data={data} mode="top" onTrainSequence={onTrainSequence} onOpenStep={onOpenStep} onGoTo={onGoTo} />

              {sessionCue.cue && (
                <div
                  className="px-4 py-3"
                  style={{
                    borderTop: coachFocus || data.nextMove ? '1px solid rgba(255,255,255,.08)' : undefined,
                  }}
                >
                  <p className="text-sm italic leading-relaxed" style={{ fontFamily: 'var(--font-tagline)', color: '#dbe8f1' }}>
                    {sessionCue.cue}
                  </p>
                  <p className="text-[13px] mt-1.5 leading-snug" style={{ color: '#eaf4fa' }}>
                    <span className="font-mono uppercase text-[8.5px] tracking-wider mr-1.5" style={{ color: '#00D2FF' }}>Today</span>
                    {sessionCue.today}
                  </p>
                  <p className="text-[9.5px] mt-1.5" style={{ color: '#6f8698' }}>From One Wave · Marcelo Castellanos</p>
                </div>
              )}
            </div>
          )}

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
              <p className="text-[9px]" style={{ ...F_LABEL, color: BRAND.colors.cyan }}>
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
                  <button type="button" onClick={() => setInboxOpen(false)} className="text-[11px] font-mono uppercase tracking-wider py-2 pr-3" style={{ color: '#8aa0b2' }}>
                    ← Home
                  </button>
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00D2FF' }}>
                    <Bell size={11} className="inline -mt-0.5" /> Notifications
                  </span>
                  <button type="button" onClick={() => setInboxOpen(false)} aria-label="Close" className="p-2 -m-2" style={{ color: '#8aa0b2' }}>✕</button>
                </div>
                {inboxMsgs.length === 0 && (
                  <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
                    <p className="text-[14px] font-semibold" style={{ color: '#eaf4fa' }}>Nothing new 🤙</p>
                    <p className="text-[11.5px] mt-1" style={{ color: '#8aa0b2' }}>Messages from your coach will land here.</p>
                  </div>
                )}
                {inboxMsgs.map((m: any) => (
                  <div key={m.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
                    <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#7BA2B5' }}>
                      {m.coach_name || 'Your coach'} · {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {m.subject && <p className="text-[14px] font-bold mt-1" style={{ color: '#f4f9fc' }}>{m.subject}</p>}
                    <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed" style={{ color: '#cfdde8' }}>{m.body}</p>
                  </div>
                ))}
                <p className="text-center text-[9px] font-mono uppercase tracking-wider py-2" style={{ color: '#57707f' }}>
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
          {data.flowChannel && data.flowChannel.avg != null && data.flowChannel.count > 0 && (
            <FlowChannelCard flow={data.flowChannel} />
          )}

          {/* Belt journey strip — es también la puerta a "qué me falta": el
              alumno mira su camino y ahí mismo pregunta cómo se avanza. */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button
            type="button"
            onClick={() => onOpenRoadmap?.()}
            className="block w-full text-left p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#8aa0b2' }}>
                Where you are · {beltLevel.replace('_belt', '').toUpperCase()} Belt
              </p>
              <span className="text-[10.5px] font-semibold shrink-0" style={{ color: BRAND.colors.cyan }}>What it takes →</span>
            </div>
            {/* El ESPEJO del nivel: valida dónde está, no motiva. Vivía a mitad
                del Home repitiendo la cinta por tercera vez; su lugar es acá,
                junto al camino. */}
            <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: '#b8cad8' }}>
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
                          border: isCurrent ? '2px solid #5AC3E7' : 'none',
                          opacity: passed ? 1 : 0.4,
                        }}
                      />
                      <span className="text-[8px]" style={{ color: isCurrent ? '#00D2FF' : '#8aa0b2' }}>{d.levelName}</span>
                    </div>
                    {i < BELT_HIERARCHY.length - 1 && (
                      <div className="flex-1 mx-1" style={{ height: 2, background: '#1f344a', marginBottom: 14 }} />
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
            style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#8aa0b2' }}>
                In the water
              </p>
              <p className="text-[12.5px] font-semibold shrink-0" style={{ color: oceanConfirmed ? '#eaf4fa' : '#8aa0b2' }}>
                {oceanConfirmed ? oceanConfirmed.name : 'Your water level →'}
              </p>
            </div>
            {oceanConfirmed && (
              <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: '#6f8698' }}>
                {oceanConfirmed.cleared}
              </p>
            )}
          </button>
          </div>

          {/* Ficha completa al 100% → acceso de consulta al FONDO del cockpit
              (antes quedaba a mitad del Home — revisión). También es HP. */}
          {data.homeBundle?.hpAccess && <AthleteProfileCard token={data.token} placement="bottom" />}
        </div>
      </div>

      {/* Provisional belt notice — set your expectations: the belt from the
          quiz is a starting point your coach confirms in the water. */}
      {(student as any).belt_provisional && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Your belt is provisional.</span>{' '}
            It started from your quiz — your coach will confirm your level after a few sessions in the water.
          </p>
        </div>
      )}

      {/* Free Surf quick-logger */}
      <FreeSurfLogger token={data.token} />

      {/* Latest Session — dark, matches the hero. OJO: fondo oscuro → textos
          CLAROS (antes quedaron en tinta #061C2B y la tarjeta era ilegible). */}
      {latestResult && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#00D2FF' }}>Latest session</p>
            <h3 className="text-base font-bold mt-0.5" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', color: '#F7F9FA' }}>
              {latestResult.mission || latestResult.standalone_sessions?.mission || 'Session'}
            </h3>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'rgba(247,249,250,.55)' }}>Date</span>
              <span className="text-sm" style={{ color: '#F7F9FA' }}>
                {new Date(latestResult.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {latestResult.coaches?.display_name && (
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'rgba(247,249,250,.55)' }}>Coach</span>
                <span className="text-sm font-medium" style={{ color: '#F7F9FA' }}>{latestResult.coaches.display_name}</span>
              </div>
            )}
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs" style={{ color: 'rgba(247,249,250,.55)' }}>Status</span>
              <div className="text-right" style={{ maxWidth: '64%' }}>
                <StatusBadge status={latestResult.status} />
                {statusMeaning(latestResult.status) && (
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(247,249,250,.6)' }}>{statusMeaning(latestResult.status)}</p>
                )}
              </div>
            </div>

            {data.surveyResultIds.includes(latestResult.id) ? (
              latestResult.student_visible_summary && (
                <div className="pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: '#00D2FF' }}>Coach feedback</p>
                  <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'rgba(247,249,250,.85)' }}>
                    {latestResult.student_visible_summary}
                  </p>
                </div>
              )
            ) : (
              latestResult.survey_unlocked && (
                <div className="pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  <button
                    type="button"
                    onClick={() => onGoTo('feedback')}
                    className="w-full text-left rounded-xl p-3 transition-opacity hover:opacity-90"
                    style={{ background: '#122236', borderLeft: '3px solid #FFD166' }}
                  >
                    <p className="text-[9px] font-mono uppercase tracking-wider mb-0.5" style={{ color: '#FFD166' }}>
                      Coach feedback waiting
                    </p>
                    <p className="text-sm font-semibold" style={{ color: '#F7F9FA' }}>
                      Rate your coach to unlock the session feedback →
                    </p>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Next class + My Coach (M140) — first upcoming official service. */}
      {upcomingCamps.length > 0 && (() => {
        const c: any = upcomingCamps[0];
        const startD = new Date((c.start_date ?? '') + 'T00:00:00');
        const endD = new Date(((c.end_date ?? c.start_date) ?? '') + 'T00:00:00');
        const todayD = new Date(); todayD.setHours(0, 0, 0, 0);
        const totalDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / 86400000) + 1);
        const dayNum = todayD >= startD ? Math.min(totalDays, Math.round((todayD.getTime() - startD.getTime()) / 86400000) + 1) : null;
        const certN = c.coach?.certification_level ? String(c.coach.certification_level).replace(/\D/g, '') : null;
        return (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <p className="text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>
              {dayNum
                ? `In progress · Day ${dayNum} of ${totalDays}`
                : `Next class · ${startD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
            </p>
            <p className="mt-1.5 text-lg" style={{ ...F_DISPLAY, color: '#061C2B' }}>{c.camp_name}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {c.scheduled_time && (
                <span className="inline-flex items-center gap-1.5"><Clock size={14} style={{ color: '#0090B0' }} />{c.scheduled_time}</span>
              )}
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} style={{ color: '#0090B0' }} />{totalDays} day{totalDays === 1 ? '' : 's'}</span>
            </div>
            {c.coach && (
              <button type="button" onClick={() => onGoTo('my-coach')} className="mt-3 w-full flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 text-left">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  {c.coach.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.coach.photo_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: '#061C2B' }}>{c.coach.display_name}</p>
                  {certN && <p className="text-[8px] mt-0.5" style={{ ...F_LABEL, color: '#55666E' }}>Level {certN} certified</p>}
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </button>
            )}
          </div>
        );
      })()}

      {/* ARCHIVO — lo de atrás. Eran dos tarjetas blancas del mismo tamaño que
          lo accionable, y partían la pantalla en dos mundos (reporte de
          Marcelo 2026-08-28: "se ve cargada"). Son filas: se abren cuando se
          las busca y mientras tanto no compiten con nada. */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628' }}>
        <details className="group">
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[11px]" style={{ ...F_LABEL, color: '#dbe8f1' }}>
              <ClipboardList size={15} strokeWidth={1.75} style={{ color: '#00D2FF' }} />
              My Sessions
            </span>
            <ChevronDown size={16} style={{ color: '#4e6a80' }} />
          </summary>
          <div className="px-3 pb-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
            <SessionsTab data={data} onDark />
          </div>
        </details>
        <details className="group" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[11px]" style={{ ...F_LABEL, color: '#dbe8f1' }}>
              <MessageCircle size={15} strokeWidth={1.75} style={{ color: '#00D2FF' }} />
              My Feedback
              {(data.pendingSurveys.length + (data.pendingExperience ? 1 : 0)) > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B6B]/15 text-[#FF6B6B] font-bold">{data.pendingSurveys.length + (data.pendingExperience ? 1 : 0)}</span>
              )}
            </span>
            <ChevronDown size={16} style={{ color: '#4e6a80' }} />
          </summary>
          <div className="px-3 pb-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
            <FeedbackTab data={data} onDark />
          </div>
        </details>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Flow Channel card (Canon v8.0 §C.7 / P2)
// ═══════════════════════════════════════
// The flow channel is the learning zone between boredom (too easy) and anxiety
// (too hard); the ideal is the middle, where challenge meets ability. Fed by the
// student's own session ratings (survey_responses.flow_channel, 1-5; 3 = flow).
const FLOW_LABELS = ['Bored', 'Easy', 'Optimal', 'Hard', 'Frustrating'];

// Rediseño 2026-08-25 (idea de Marcelo): tres ZONAS rotuladas en vez de un
// gradiente continuo — se lee de un vistazo y enseña el concepto, no solo lo
// mide. Además arregla una incoherencia vieja: el número mostraba el PROMEDIO
// (1-5) pero el marcador se posicionaba con el conteo de extremos, así que
// podían contradecirse. Ahora TODO sale del promedio.
// Escala 1-5 → 0-100%: la zona óptima (2.5-3.5) es el 25% central.
const ZONE_EASY_END = 37.5, ZONE_OPT_END = 62.5;

function FlowChannelCard({ flow }: { flow?: { avg: number | null; count: number; boredom: number; anxiety: number } }) {
  const hasData = !!flow && flow.avg != null && flow.count > 0;
  const avg = flow?.avg ?? null;
  const label = avg != null ? (FLOW_LABELS[Math.round(avg) - 1] ?? '') : '';
  // Posición del marcador = el mismo promedio que muestra el número.
  const pct = avg != null ? Math.max(2, Math.min(98, ((avg - 1) / 4) * 100)) : 50;
  const zone = avg == null ? 'opt' : pct < ZONE_EASY_END ? 'easy' : pct > ZONE_OPT_END ? 'hard' : 'opt';
  const advice = !hasData
    ? ''
    : zone === 'easy'
    ? 'Too easy lately — raise the challenge.'
    : zone === 'hard'
    ? 'Too hard lately — lower the challenge.'
    : "You're in the learning zone — keep it here.";
  const ZONE_COLOR = { easy: '#3E6C97', opt: '#00D2FF', hard: '#A33F4A' } as const;

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }} aria-label="Flow Channel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ width: 4, height: 18, borderRadius: 3, background: '#00D2FF', display: 'inline-block' }} />
          <span className="font-bold" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', color: '#f4f9fc', fontSize: '20px', letterSpacing: '0.005em' }}>Flow Channel</span>
        </div>
        {hasData && <span className="text-[9px]" style={{ color: '#8aa0b2' }}>from your session ratings</span>}
      </div>

      {!hasData ? (
        <p className="text-[13px] leading-relaxed mt-2" style={{ color: '#dbe8f1' }}>
          Rate your sessions to map where your flow lives.
        </p>
      ) : (
        <>
          {/* Eyebrow + zonas */}
          <p className="text-[9px] uppercase tracking-[0.18em] mt-3 pb-2 mb-3 text-center"
            style={{ fontFamily: 'DM Mono, monospace', color: '#8aa0b2', borderBottom: '1px solid #1f344a' }}>
            Output · Learning zone
          </p>

          <div className="relative">
            <div className="flex rounded-md overflow-hidden" style={{ height: 22 }}>
              <div style={{ width: `${ZONE_EASY_END}%`, background: ZONE_COLOR.easy, opacity: zone === 'easy' ? 1 : 0.45 }} />
              <div style={{ width: `${ZONE_OPT_END - ZONE_EASY_END}%`, background: ZONE_COLOR.opt, opacity: zone === 'opt' ? 1 : 0.45 }} />
              <div style={{ width: `${100 - ZONE_OPT_END}%`, background: ZONE_COLOR.hard, opacity: zone === 'hard' ? 1 : 0.45 }} />
            </div>
            {/* Dónde estás (mismo promedio que el número de abajo) */}
            <div className="absolute" style={{ left: `${pct}%`, top: -4, width: 3, height: 30, borderRadius: 2, background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(255,255,255,.5)' }} />
          </div>

          <div className="flex justify-between mt-1.5">
            <span className="text-[9.5px] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace', color: zone === 'easy' ? '#9fd7e8' : '#7BA2B5' }}>Too easy</span>
            <span className="text-[9.5px] uppercase tracking-wider font-bold" style={{ fontFamily: 'DM Mono, monospace', color: zone === 'opt' ? '#00D2FF' : '#7BA2B5' }}>Optimal learning</span>
            <span className="text-[9.5px] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace', color: zone === 'hard' ? '#E28A93' : '#7BA2B5' }}>Too hard</span>
          </div>

          {/* La doctrina, en las palabras de Marcelo */}
          <p className="text-[12.5px] font-bold mt-3.5 text-center" style={{ color: '#f0f7fa' }}>
            Challenge matched to capability + conditions
          </p>
          <p className="text-[10px] mt-1 text-center" style={{ color: '#8aa0b2' }}>
            Difficult enough to demand attention · possible enough to produce feedback
          </p>

          <div className="flex items-baseline justify-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #1f344a' }}>
            <span className="font-bold" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', color: '#f0f7fa', fontSize: '24px', lineHeight: 1 }}>{avg!.toFixed(1)}</span>
            <span className="font-semibold" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', color: ZONE_COLOR[zone], fontSize: '14px' }}>{label}</span>
            <span className="text-[10px]" style={{ color: '#8aa0b2' }}>· {flow!.count} rating{flow!.count === 1 ? '' : 's'}</span>
          </div>
          <p className="text-[11px] mt-2 text-center" style={{ color: '#dbe8f1' }}>{advice}</p>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 2: SESSIONS (improved with expanded details)
// ═══════════════════════════════════════

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
  ].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
          : session.standalone_sessions?.mission || 'Session';

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
                    <span className="text-[10px] text-gray-500">
                      {new Date(session.created_at).toLocaleDateString('en-US', {
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
                          <span className="text-[10px] text-gray-500">{c.display_name}</span>
                        </>
                      ) : null;
                    })()}
                    {isSelf && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">
                        Self
                      </span>
                    )}
                    {isMultiBlock && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">
                        Plan
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isSelf && !isMultiBlock && <StatusBadge status={session.status} />}
                  {isSelf && session.completed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                      Done
                    </span>
                  )}
                  {isMultiBlock && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
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
                            <p className="text-[11px] text-gray-500 mt-1">{statusMeaning(session.status)}</p>
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
                        <div className="pt-1 text-[11px] text-amber-700 bg-amber-50 rounded-xl p-2 italic">
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
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
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
                  <p className={`text-[10px] ${BELT_TEXT_STYLES[bKey] || 'text-gray-800'} opacity-60`}>
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
                    <span className="text-[11px] text-gray-500 mr-1">({catMats.length})</span>
                    <span className="text-gray-300 text-[10px]">{isCollapsed ? '▼' : '▲'}</span>
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
                  <p className="text-[11px] text-gray-500">
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
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
            <Lock size={18} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-400">{material.title}</p>
            <p className="text-xs text-gray-300 mt-0.5">{material.subtitle}</p>
            <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
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
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-[var(--tss-navy)]">
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
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                {MATERIAL_CATEGORY_LABELS[material.category]}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
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
                        <p className="text-[10px] text-green-600 uppercase tracking-wider font-bold mb-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>
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
                        <p className="text-[10px] text-green-600 uppercase tracking-wider font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
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
}: {
  data: PortalData;
  autoExpandFirst?: boolean;
  initialSurveyId?: string | null;
  /** true = va dentro del bloque de archivo del Home (fondo #0A1628). */
  onDark?: boolean;
}) {
  const { pendingSurveys, submittedSurveys, student, token } = data;
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
      {/* Camp experience survey (Opción A) — one per camp, about the overall
          experience: facilities, equipment, transport, communication, value. */}
      {data.pendingExperience && (
        <div className="space-y-2">
          <div className="bg-cyan-50 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-cyan-900">
                  Your camp experience{data.pendingExperience.campName ? ` · ${data.pendingExperience.campName}` : ''}
                </p>
                <p className="text-[10px] text-cyan-700 mt-0.5">
                  1 minute — facilities, equipment, transport & value
                </p>
              </div>
              <button
                onClick={() => setExpOpen(!expOpen)}
                className="text-xs font-medium text-cyan-700 underline"
              >
                {expOpen ? 'Hide' : 'Give Feedback'}
              </button>
            </div>
          </div>
          {expOpen && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <ExperienceSurveyForm
                token={data.pendingExperience.token}
                onDone={() => setTimeout(() => router.refresh(), 2500)}
              />
            </div>
          )}
        </div>
      )}

      {/* Pending Surveys */}
      {pendingSurveys.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold" style={{ color: onDark ? '#dbe8f1' : 'var(--tss-navy)' }}>
              Pending Feedback
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">
              {pendingSurveys.length}
            </span>
          </div>
          {pendingSurveys.map((result: any) => (
            <div key={result.id} className="space-y-2">
              <div className="bg-amber-50 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {result.standalone_sessions?.mission || 'Session'}
                    </p>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      {surveyDateLabel(
                        (Array.isArray(result.camp_sessions) ? result.camp_sessions[0] : result.camp_sessions)?.session_date,
                        result.created_at,
                      )}
                      {result.coaches?.display_name &&
                        ` - Coach: ${result.coaches.display_name}`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedSurveyId(
                        expandedSurveyId === result.id ? null : result.id
                      )
                    }
                    className="text-xs font-medium text-amber-700 underline"
                  >
                    {expandedSurveyId === result.id ? 'Hide' : 'Give Feedback'}
                  </button>
                </div>
              </div>
              {expandedSurveyId === result.id && (
                <SurveyForm
                  resultId={result.id}
                  token={token}
                  serviceKind={(() => {
                    const ci: any = Array.isArray(result.camp_sessions) ? result.camp_sessions[0] : result.camp_sessions;
                    const inst = ci ? (Array.isArray(ci.camp_instances) ? ci.camp_instances[0] : ci.camp_instances) : null;
                    const tpl = inst ? (Array.isArray(inst.camp_templates) ? inst.camp_templates[0] : inst.camp_templates) : null;
                    return tpl?.service_kind ?? (result.standalone_sessions ? 'surf_lesson' : null);
                  })()}
                  serviceName={(() => {
                    const ci: any = Array.isArray(result.camp_sessions) ? result.camp_sessions[0] : result.camp_sessions;
                    const inst = ci ? (Array.isArray(ci.camp_instances) ? ci.camp_instances[0] : ci.camp_instances) : null;
                    return inst?.camp_name ?? null;
                  })()}
                />
              )}
            </div>
          ))}
        </div>
      )}

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
                    <p className="text-[10px] text-gray-500 mt-0.5">
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
                    <p className="text-[9px] text-gray-400 mt-0.5">You rated</p>
                  </div>
                </div>

                {/* The coach's feedback for YOU — the real value */}
                {coachFeedback ? (
                  <div className="rounded-xl bg-[var(--tss-navy)]/[0.03] border-l-4 border-[var(--tss-cyan)] px-3 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Your coach&apos;s feedback
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {coachFeedback}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">
                    Your coach didn&apos;t leave written feedback for this session.
                  </p>
                )}

                {/* Homework stays student-facing; "what's next" is internal (M135). */}
                {ssr?.homework && (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-0.5">Homework</p>
                      <p className="text-xs text-amber-900 leading-relaxed">{ssr.homework}</p>
                    </div>
                  </div>
                )}

                {survey.open_comment && (
                  <p className="text-[11px] text-gray-400 italic">
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
      className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
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
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize font-medium">
                {coach.role.replace(/_/g, ' ')}
              </span>
              {coach.certification_level && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                  {coach.certification_level}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                Up to {coach.max_belt_permission?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
        {(coach.specialty_area || coach.languages) && (
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
            {coach.specialty_area && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Specialty
                </p>
                <p className="text-sm text-gray-700 mt-0.5">{coach.specialty_area}</p>
              </div>
            )}
            {coach.languages && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
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
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
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
        <p className="text-[11px] text-amber-700 leading-relaxed">
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
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
      {sublabel && <p className="text-[9px] text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

// ═══════════════════════════════════════
// PORTAL ALERTS — compact notification list (new service / coach message /
// session report). Replaces the large hero cards to save vertical space.
// ═══════════════════════════════════════

function PortalAlerts({
  upcomingCamp,
  legacyUpcoming,
  campWithNote,
  latestResult,
  onGoTo,
}: {
  upcomingCamp: any;
  legacyUpcoming: any;
  campWithNote: any;
  latestResult: any;
  onGoTo: (tab: Tab) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);

  const fmtDate = (d: string | null | undefined) =>
    d
      ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : '';

  type Row = {
    key: string;
    Icon: LucideIcon;
    color: string;
    bg: string;
    title: string;
    subtitle: string;
    onClick: () => void;
    expanded?: React.ReactNode;
  };
  const rows: Row[] = [];

  // New / next service
  if (upcomingCamp) {
    const nextDate = upcomingCamp.next_session?.session_date ?? upcomingCamp.start_date;
    const totalDays =
      upcomingCamp.start_date && upcomingCamp.end_date
        ? Math.round(
            (new Date(upcomingCamp.end_date).getTime() - new Date(upcomingCamp.start_date).getTime()) /
              86400000,
          ) + 1
        : 1;
    const day = upcomingCamp.next_session?.day_number ?? 1;
    const dayTag = totalDays > 1 ? ` · Day ${day}/${totalDays}` : '';
    rows.push({
      key: 'next-class',
      Icon: Calendar,
      color: BRAND.colors.cyan,
      bg: 'rgba(90,195,231,0.14)',
      title: `Next class · ${upcomingCamp.camp_name}`,
      subtitle: `${fmtDate(nextDate)}${upcomingCamp.scheduled_time ? ` · ${upcomingCamp.scheduled_time}` : ''}${dayTag}${upcomingCamp.coach?.display_name ? ` · Coach ${upcomingCamp.coach.display_name.split(' ')[0]}` : ''}`,
      onClick: () => onGoTo('sessions'),
    });
  } else if (legacyUpcoming) {
    rows.push({
      key: 'next-legacy',
      Icon: Calendar,
      color: BRAND.colors.cyan,
      bg: 'rgba(90,195,231,0.14)',
      title: 'Upcoming session',
      subtitle: fmtDate(legacyUpcoming.session_date),
      onClick: () => onGoTo('sessions'),
    });
  }

  // Coach message / final note (expandable inline)
  if (campWithNote?.coach_final_note) {
    rows.push({
      key: 'coach-note',
      Icon: MessageCircle,
      color: BRAND.colors.navy,
      bg: 'rgba(10,22,40,0.08)',
      title: 'Message from your coach',
      subtitle: noteOpen ? 'Tap to hide' : `${campWithNote.camp_name} — tap to read`,
      onClick: () => setNoteOpen((o) => !o),
      expanded: noteOpen ? (
        <p className="text-sm text-[var(--tss-navy)] leading-relaxed whitespace-pre-line px-4 pb-3">
          {campWithNote.coach_final_note}
        </p>
      ) : null,
    });
  }

  // New session report (feedback / homework / next focus)
  const lr = latestResult as any;
  // Ping cuando hay contenido que el alumno VE: summary (final eval), homework,
  // o el "Next Focus" del cierre diario (whats_next — student-facing desde
  // 2026-08-09; el coach_feedback diario sigue interno).
  if (lr && (lr.student_visible_summary || lr.homework || lr.whats_next)) {
    rows.push({
      key: 'session-report',
      Icon: ClipboardList,
      color: '#b8860b',
      bg: 'rgba(255,209,102,0.18)',
      title: 'New session report',
      subtitle: 'Feedback & homework ready',
      onClick: () => onGoTo('sessions'),
    });
  }

  if (rows.length === 0) return null;

  return (
    <div>
      <p className="tss-section-label">
        <Bell size={11} strokeWidth={1.75} />
        Notifications
      </p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={r.onClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: r.bg }}
              >
                <r.Icon size={16} strokeWidth={1.9} style={{ color: r.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">{r.title}</p>
                <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
            {r.expanded}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// UPCOMING CAMP CARD — M45 — replaces multi_block UpcomingSessionCard
// for official services programmed by the academy.
// ═══════════════════════════════════════

function UpcomingCampCard({ camp }: { camp: any }) {
  const nextDate = camp.next_session?.session_date ?? camp.start_date;
  const dateLabel = nextDate
    ? new Date(nextDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';
  const dayNumber = camp.next_session?.day_number ?? 1;
  const totalDays = camp.start_date && camp.end_date
    ? Math.round(
        (new Date(camp.end_date).getTime() - new Date(camp.start_date).getTime()) / 86400000
      ) + 1
    : 1;
  const isMultiDay = totalDays > 1;
  const coach = camp.coach;
  // Only show real, coach-defined objectives — never the "Coach will define
  // the focus" placeholder (it reads as broken/unfinished).
  const previewBlocks = (camp.blocks ?? []).filter(
    (b: any) => b.objective_text && b.objective_text.trim(),
  );

  return (
    <div className="bg-[var(--tss-navy)] text-white rounded-2xl p-5 shadow-md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan)]">
          Your next class
        </p>
        {isMultiDay && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-semibold">
            Day {dayNumber} of {totalDays}
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold leading-tight">{camp.camp_name}</h2>
      {camp.template_name && (
        <p className="text-[11px] text-white/70 italic mt-0.5">{camp.template_name}</p>
      )}
      <p className="text-sm text-white/85 mt-2">
        {dateLabel}
        {camp.scheduled_time && ` · ${camp.scheduled_time}`}
      </p>

      {/* Coach profile — who's taking you in the water: photo, name, level */}
      {coach && (
        <div className="mt-3 flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5">
          {coach.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coach.photo_url}
              alt={coach.display_name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              style={{ border: '2px solid var(--tss-cyan, #5AC3E7)' }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold shrink-0"
              style={{ border: '2px solid var(--tss-cyan, #5AC3E7)' }}
            >
              {coach.display_name
                ?.split(' ')
                .map((p: string) => p[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-[var(--tss-cyan)]">
              Your coach
            </p>
            <p className="text-sm font-semibold truncate mt-0.5">{coach.display_name}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {coach.certification_level && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white/85 font-semibold uppercase tracking-wide">
                  {String(coach.certification_level).replace(/_/g, ' ').replace(/\btss\b/i, 'TSS')}
                </span>
              )}
              {coach.max_belt_permission && BELT_DISPLAY[coach.max_belt_permission as BeltLevel] && (
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1"
                  style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      background: BELT_DISPLAY[coach.max_belt_permission as BeltLevel]?.color || '#fff',
                      boxShadow: '0 0 0 1px rgba(255,255,255,.35)',
                    }}
                  />
                  {BELT_DISPLAY[coach.max_belt_permission as BeltLevel]?.en}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* What you'll work on today */}
      {previewBlocks.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan)] mb-1.5">
            What you'll work on
          </p>
          <div className="space-y-1">
            {previewBlocks.slice(0, 3).map((b: any, i: number) => (
              <div key={i} className="text-[12px] text-white/90 bg-white/5 rounded-lg px-2.5 py-1.5">
                {b.step_id && <span className="text-[var(--tss-cyan)] font-mono mr-1.5">{b.step_id}</span>}
                {b.objective_text ?? 'Coach will define the focus'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// UPCOMING SESSION CARD — legacy multi_block_sessions card
// ═══════════════════════════════════════

function UpcomingSessionCard({ upcoming }: { upcoming: UpcomingMultiBlock }) {
  const isInProgress = upcoming.completion_state === 'in_progress';
  const coachRel = Array.isArray(upcoming.coaches) ? upcoming.coaches[0] : upcoming.coaches;
  const coachName = coachRel?.display_name || 'your coach';
  const dateLabel = new Date(upcoming.session_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="rounded-2xl p-4 shadow-sm border-2"
      style={{
        background: isInProgress ? '#ECFDF5' : '#FEF3C7',
        borderColor: isInProgress ? '#10B981' : BRAND.colors.gold,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider"
             style={{ color: isInProgress ? '#047857' : '#92400E' }}>
            {isInProgress
              ? <CircleDot size={13} strokeWidth={2} />
              : <Calendar size={13} strokeWidth={1.75} />}
            {isInProgress ? 'Session in progress' : 'Your next session'}
          </p>
          <p className="text-base font-bold mt-0.5"
             style={{ color: isInProgress ? '#065F46' : '#78350F' }}>
            {dateLabel}
            {upcoming.training_venue ? ` · ${upcoming.training_venue}` : ''}
          </p>
          <p className="text-[11px] mt-0.5"
             style={{ color: isInProgress ? '#047857' : '#92400E' }}>
            Coach: {coachName} · {upcoming.total_planned_minutes} min planned
          </p>
        </div>
      </div>

      {upcoming.blocks.length > 0 && (
        <div className="space-y-1.5 mt-3">
          <p className="text-[10px] font-mono uppercase tracking-wider"
             style={{ color: isInProgress ? '#047857' : '#92400E' }}>
            What you'll work on
          </p>
          {upcoming.blocks.map((b, idx) => (
            <div
              key={b.id}
              className="bg-white rounded-lg p-2.5 flex items-start gap-2"
            >
              <span className="text-[10px] font-mono text-gray-400 w-6 text-center shrink-0 mt-0.5">
                #{idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {b.step_id && (
                    <span className="text-[10px] font-mono text-gray-400 mr-1">
                      {b.step_id}
                    </span>
                  )}
                  {b.drill_id || 'Custom block'}
                </p>
                {b.objective_text && (
                  <p className="flex items-start gap-1.5 text-[11px] text-gray-500 italic mt-0.5">
                    <CornerDownRight size={12} strokeWidth={1.75} className="shrink-0 mt-0.5" />
                    {b.objective_text}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-gray-500 font-medium shrink-0">
                {b.duration_minutes}m
              </span>
            </div>
          ))}
        </div>
      )}

      {upcoming.blocks.length === 0 && (
        <p className="text-[11px] italic mt-2"
           style={{ color: isInProgress ? '#047857' : '#92400E' }}>
          Your coach is still building this session.
        </p>
      )}
    </div>
  );
}
