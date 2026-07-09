'use client';

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
import { CourseTab } from '@/components/course/CourseTab';
import { MySequenceTab } from '@/components/sequence/MySequenceTab';
import { LinkedTrainingFlow } from '@/components/sequence/LinkedTrainingFlow';
import { CustomSessionFlow } from '@/components/portal/CustomSessionFlow';
import { FreeSurfLogger } from '@/components/portal/FreeSurfLogger';
import { BeltJourney } from '@/components/portal/BeltJourney';
import { GlossaryTab } from '@/components/portal/GlossaryTab';
import { VideoAnalyzerLauncher } from '@/components/video-analyzer/VideoAnalyzerLauncher';
import { VenueScoutLauncher } from '@/components/venue-scout/VenueScoutLauncher';
import { BreathingLauncher } from '@/components/breathing/BreathingLauncher';
import { LogoutButton } from '@/components/portal/LogoutButton';
import {
  createSelfTrainingSession,
  completeSelfTrainingSession,
} from '@/lib/actions/portal';
import {
  Home,
  GraduationCap,
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

// ─── Training Tips by Belt ───

// M51 — One Wave mental cues. The old TRAINING_TIPS were technique
// reminders; Marcelo asked for mind-side prompts in the style of his
// "One Wave" book. Same belt-keyed rotation by day-of-year so the
// student gets a different cue each day.
const TRAINING_TIPS: Record<string, string[]> = {
  white_belt: [
    'One wave at a time. The next one does not exist yet.',
    'Breathe before you paddle. The wave is already on its way.',
    'Fear shrinks when you name it. Whisper what scares you, then move.',
    'Curiosity beats performance. Ask the wave a question, do not demand.',
    'Mistakes are data, not verdicts. Read them, then let them go.',
    'Presence is your first technique. Land here before you land on the board.',
  ],
  yellow_belt: [
    'You do not chase the wave — you meet it. Patience is power.',
    'Trust the rep. Your body remembers what your mind forgets.',
    'Speed is calm in motion. Tension steals it; flow returns it.',
    'Pick one cue per wave. Mastery is depth, not breadth.',
    'Read first, react second. The ocean already knows where the line is.',
    'Reset between waves. Each one starts at zero.',
  ],
  blue_belt: [
    'Style is the residue of trust. Stop forcing, start arriving.',
    'Commit fully or do not commit. Half-effort is the most dangerous line.',
    'The wave is the teacher. Your job is to listen.',
    'When in doubt, breathe out. The board will follow your nervous system.',
    'Quiet the inner commentator. Surfing happens before the thought.',
    'You are not behind. You are exactly where the wave needed you.',
  ],
  purple_belt: [
    'Risk is the price of the next door. Pay it on your terms.',
    'A miss is a rehearsal. Make peace with falling and the ceiling lifts.',
    'Confidence is built, not summoned. Stack honest reps.',
    'Read the wave like a sentence. Where is its verb? Surf the verb.',
  ],
  brown_belt: [
    'Pressure is a privilege. It means the moment matters to you.',
    'Discipline is freedom. The drill you skip is the wave you lose.',
    'Surf the surfer. Master your own state before the lineup.',
    'Repetition without intention is decoration. Train with a why.',
  ],
  black_belt: [
    'You are still the student. The day you stop learning is the day you start sliding back.',
    'Teach the way you wish someone had taught you.',
    'Mastery is the courage to do the simple thing one more time.',
    'The ocean did not change. You did. Keep going.',
  ],
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

type Tab = 'home' | 'course' | 'sequence' | 'sessions' | 'feedback' | 'glossary' | 'my-coach';

const ALL_TABS: { key: Tab; label: string; icon: LucideIcon; lockedUntilCoachUnlock?: boolean }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'course', label: 'Course', icon: GraduationCap },
  { key: 'sequence', label: "Let's Play", icon: Play },
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
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'home');
  const TABS = useMemo(
    () => ALL_TABS.filter((t) => !t.lockedUntilCoachUnlock || data.coachProfileUnlocked),
    [data.coachProfileUnlocked]
  );
  // Linked Train flow: when student taps "Practice this drill" from My Sequence
  // OR arrives via deep-link from a Course lesson (?drill=X), we store the drill
  // ID and render LinkedTrainingFlow inline within the unified "Let's Play" tab.
  const [pendingDrillMissionId, setPendingDrillMissionId] = useState<string | null>(
    initialDrillId || null
  );
  const [showCustomSession, setShowCustomSession] = useState(false);
  const { student } = data;
  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];

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
        <div className="absolute top-1.5 right-1.5">
          <LogoutButton portalToken={data.token} />
        </div>
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
      </div>

      {/* Tab Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'home' && <HomeTab data={data} belt={belt} onGoTo={setActiveTab} />}
        {activeTab === 'course' && data.courseData && (
          <div className="space-y-4">
            <CourseTab data={data.courseData} />
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
        {activeTab === 'sequence' && (
          pendingDrillMissionId ? (
            // 1) Drill picked from MySequenceTab → run the linked flow inline
            <LinkedTrainingFlow
              key={pendingDrillMissionId}
              drillMissionId={pendingDrillMissionId}
              studentId={student.id}
              studentBelt={student.belt_level || 'white_belt'}
              onClearIncoming={() => setPendingDrillMissionId(null)}
              onReturnToSequence={() => setPendingDrillMissionId(null)}
            />
          ) : showCustomSession ? (
            // 2) Custom Session escape hatch — free-form, doesn't count toward step mastery
            <CustomSessionFlow
              studentId={student.id}
              onCancel={() => setShowCustomSession(false)}
              onDone={() => setShowCustomSession(false)}
            />
          ) : (
            // 3) Default: pick a drill or mission from your sequence
            <div className="space-y-4">
              <MySequenceTab
                studentId={student.id}
                belt={data.courseData?.activeCourseBelt || student.belt_level || 'white'}
                onPracticeDrill={handlePracticeDrill}
                initialStepId={initialStepId}
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

              {/* Self-analysis: compare your own clip against the TSS model
                  library (draw lines/angles, frame-by-frame). Local only. */}
              <div>
                <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                  <Video size={14} strokeWidth={1.75} />
                  Video Analysis
                </p>
                <VideoAnalyzerLauncher
                  title="Analyze your surfing"
                  subtitle="Load your clip, compare it to the Surf Sequence models, and draw lines & angles frame by frame."
                />
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                  <MapPin size={14} strokeWidth={1.75} />
                  Venue Scout
                </p>
                <VenueScoutLauncher variant="light" />
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                  <Wind size={14} strokeWidth={1.75} />
                  Respiración
                </p>
                <BreathingLauncher variant="light" />
              </div>
            </div>
          )
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
      </div>

      {/* Bottom Tab Bar — active tab gets a 2px cyan rule on top so the
          state reads instantly without filling the whole tab. */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto flex">
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
                {tab.key === 'feedback' && data.pendingSurveys.length > 0 && (
                  <span className="absolute top-1 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
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
}: {
  data: PortalData;
  belt: any;
  onGoTo: (tab: Tab) => void;
}) {
  const { student, sessions, totalSessions, streak, selfTrainingCount, totalTrainingMinutes, drillsPracticed, recentDrills } = data;
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

  // Training tip of the day — rotate based on day of year
  const tips = TRAINING_TIPS[beltLevel] || TRAINING_TIPS['white_belt'];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tipOfDay = tips[dayOfYear % tips.length];

  return (
    <div className="space-y-4">
      {/* ── Dark "cockpit" hero — TSS Ocean Navy, Garmin-style telemetry ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628' }}>
        {/* Notifications row (TSS wordmark now lives in the shared header on
            every screen, so it isn't repeated here). */}
        <div
          className="flex items-center justify-end px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
        >
          <button type="button" onClick={() => onGoTo('feedback')} aria-label="Notifications">
            <Bell size={18} strokeWidth={1.75} style={{ color: '#8aa0b2' }} />
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
              <p className="text-lg font-bold truncate" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa' }}>
                {student.first_name} {student.last_name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-3 h-3 rounded-full" style={{ background: belt?.color || '#E8E8E8', border: '1px solid #5b6b7a' }} />
                <span className="text-xs" style={{ color: '#8aa0b2' }}>{belt?.en} · {belt?.levelName}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#8aa0b2' }}>Streak</p>
              <p className="font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa', fontSize: '20px' }}>
                {streak}<span className="text-[11px] font-mono" style={{ color: '#8aa0b2' }}> d</span>
              </p>
            </div>
          </div>

          {/* Primary ring: total water time + belt progress */}
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#122236' }}>
            <div className="relative shrink-0" style={{ width: 104, height: 104 }}>
              <svg viewBox="0 0 120 120" width="104" height="104">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1f344a" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#5AC3E7" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 * (1 - (BELT_RANK[beltLevel] ?? 1) / 6)}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-bold leading-none" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa', fontSize: '22px' }}>
                  {fmtHm(surf.totalMinutes)}
                </p>
                <p className="text-[8px] font-mono uppercase tracking-wider mt-1" style={{ color: '#8aa0b2' }}>In the water</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#5AC3E7' }}>Level progress</p>
              <p className="text-sm font-semibold mt-1" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa' }}>
                Level {BELT_RANK[beltLevel] ?? 1} of 6
              </p>
              <div className="h-1.5 rounded-full overflow-hidden mt-2 mb-2" style={{ background: '#1f344a' }}>
                <div className="h-full rounded-full" style={{ width: `${((BELT_RANK[beltLevel] ?? 1) / 6) * 100}%`, background: '#5AC3E7' }} />
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

          {/* Training + Free Surf — bold, high-contrast title (Course-style) so
              the name doesn't get lost, with a cyan accent bar. */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Training', value: fmtHm(surf.trainingMinutes), accent: '#00D2FF' },
              { label: 'Free Surf', value: fmtHm(surf.freeSurfMinutes), accent: '#5AC3E7' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4" style={{ background: '#122236' }}>
                <div className="flex items-center gap-2">
                  <span style={{ width: 4, height: 18, borderRadius: 3, background: s.accent, display: 'inline-block' }} />
                  <span className="font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#f4f9fc', fontSize: '20px', letterSpacing: '0.005em' }}>{s.label}</span>
                </div>
                <p className="font-bold mt-2" style={{ fontFamily: 'var(--font-heading)', color: '#00D2FF', fontSize: '30px', lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Flow Channel — Canon v8.0 §C.7: the zone between boredom (too easy)
              and anxiety (too hard). Fed by the student's session ratings
              (survey_responses.flow_channel, 1-5; 3 = flow). */}
          <FlowChannelCard flow={data.flowChannel} />

          {/* Mental cue — inside the dark hero */}
          <div className="rounded-2xl p-4" style={{ background: '#122236', borderLeft: '3px solid #5AC3E7' }}>
            <p className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: '#5AC3E7' }}>
              Mental cue · Belt {beltLevel.replace('_belt', '').toUpperCase()}
            </p>
            <p className="text-sm italic leading-relaxed" style={{ fontFamily: 'var(--font-tagline)', color: '#dbe8f1' }}>
              “{tipOfDay}”
            </p>
          </div>

          {/* Belt journey strip */}
          <div className="rounded-2xl p-4" style={{ background: '#122236' }}>
            <p className="text-[9px] font-mono uppercase tracking-wider mb-3" style={{ color: '#8aa0b2' }}>Your belt journey</p>
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
                      <span className="text-[8px]" style={{ color: isCurrent ? '#5AC3E7' : '#8aa0b2' }}>{d.levelName}</span>
                    </div>
                    {i < BELT_HIERARCHY.length - 1 && (
                      <div className="flex-1 mx-1" style={{ height: 2, background: '#1f344a', marginBottom: 14 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Free Surf quick-logger */}
      <FreeSurfLogger token={data.token} />

      {/* Latest Session — dark, matches the hero */}
      {latestResult && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#5AC3E7' }}>Latest session</p>
            <h3 className="text-base font-bold mt-0.5" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa' }}>
              {latestResult.standalone_sessions?.mission || 'Session'}
            </h3>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: '#8aa0b2' }}>Date</span>
              <span className="text-sm" style={{ color: '#f0f7fa' }}>
                {new Date(latestResult.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {latestResult.coaches?.display_name && (
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#8aa0b2' }}>Coach</span>
                <span className="text-sm font-medium" style={{ color: '#f0f7fa' }}>{latestResult.coaches.display_name}</span>
              </div>
            )}
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs" style={{ color: '#8aa0b2' }}>Status</span>
              <div className="text-right" style={{ maxWidth: '64%' }}>
                <StatusBadge status={latestResult.status} />
                {statusMeaning(latestResult.status) && (
                  <p className="text-[11px] mt-1" style={{ color: '#8aa0b2' }}>{statusMeaning(latestResult.status)}</p>
                )}
              </div>
            </div>

            {data.surveyResultIds.includes(latestResult.id) ? (
              (latestResult.student_visible_summary || latestResult.coach_feedback) && (
                <div className="pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: '#5AC3E7' }}>Coach feedback</p>
                  <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: '#dbe8f1' }}>
                    {latestResult.student_visible_summary || latestResult.coach_feedback}
                  </p>
                </div>
              )
            ) : (
              latestResult.survey_unlocked && (
                <div className="pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <button
                    type="button"
                    onClick={() => onGoTo('feedback')}
                    className="w-full text-left rounded-xl p-3 transition-opacity hover:opacity-90"
                    style={{ background: '#122236', borderLeft: '3px solid #FFD166' }}
                  >
                    <p className="text-[9px] font-mono uppercase tracking-wider mb-0.5" style={{ color: '#FFD166' }}>
                      Coach feedback waiting
                    </p>
                    <p className="text-sm font-semibold" style={{ color: '#f0f7fa' }}>
                      Rate your coach to unlock the session feedback →
                    </p>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Sessions — collapsible at the bottom (moved out of the nav) */}
      <details className="rounded-2xl overflow-hidden" style={{ background: '#0F1E33' }}>
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <ClipboardList size={16} strokeWidth={1.75} className="text-[var(--tss-cyan)]" />
            My Sessions
          </span>
          <ChevronDown size={16} className="text-white/40" />
        </summary>
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          <SessionsTab data={data} />
        </div>
      </details>

      {/* Feedback — collapsible at the bottom (moved out of the nav) */}
      <details className="rounded-2xl overflow-hidden" style={{ background: '#0F1E33' }}>
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <MessageCircle size={16} strokeWidth={1.75} className="text-[var(--tss-cyan)]" />
            Feedback
            {data.pendingSurveys.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">{data.pendingSurveys.length}</span>
            )}
          </span>
          <ChevronDown size={16} className="text-white/40" />
        </summary>
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          <FeedbackTab data={data} />
        </div>
      </details>
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

function FlowChannelCard({ flow }: { flow?: { avg: number | null; count: number; boredom: number; anxiety: number } }) {
  const hasData = !!flow && flow.avg != null && flow.count > 0;
  const avg = flow?.avg ?? null;
  const label = avg != null ? (FLOW_LABELS[Math.round(avg) - 1] ?? '') : '';
  const boredom = flow?.boredom ?? 0;
  const anxiety = flow?.anxiety ?? 0;
  // Lean: -1 = all too-easy (boredom) … 0 = balanced … +1 = all too-hard (anxiety)
  const lean = boredom + anxiety > 0 ? (anxiety - boredom) / (boredom + anxiety) : 0;
  const markerLeft = Math.max(8, Math.min(92, 50 + lean * 40));
  const advice = !hasData
    ? ''
    : lean < -0.15
    ? 'Leaning toward boredom — raise the challenge.'
    : lean > 0.15
    ? 'Leaning toward anxiety — lower the challenge.'
    : "You're in the channel — challenge and ability aligned.";

  const YinYang = (
    <svg width="68" height="68" viewBox="0 0 100 100" aria-hidden="true">
      <defs><clipPath id="fcyy"><circle cx="50" cy="50" r="48" /></clipPath></defs>
      <g clipPath="url(#fcyy)">
        <rect width="100" height="100" fill="#0a2a4a" />
        <path d="M50 2 a48 48 0 0 1 0 96 a24 24 0 0 1 0 -48 a24 24 0 0 0 0 -48" fill="#00D2FF" />
        <circle cx="50" cy="26" r="7.5" fill="#0a2a4a" />
        <circle cx="50" cy="74" r="7.5" fill="#00D2FF" />
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#1f3b57" strokeWidth="2" />
    </svg>
  );

  return (
    <div className="rounded-2xl p-4" style={{ background: '#122236' }} aria-label="Flow Channel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ width: 4, height: 18, borderRadius: 3, background: '#00D2FF', display: 'inline-block' }} />
          <span className="font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#f4f9fc', fontSize: '20px', letterSpacing: '0.005em' }}>Flow Channel</span>
        </div>
        {hasData && <span className="text-[9px]" style={{ color: '#8aa0b2' }}>from your session ratings</span>}
      </div>

      {hasData && (
        <p className="text-[12px] italic mt-2" style={{ color: '#9fb3c2' }}>
          Where challenge meets capability, flow appears.
        </p>
      )}

      <div className="flex items-center gap-4 mt-3">
        {YinYang}
        <div className="flex-1">
          {hasData ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa', fontSize: '28px', lineHeight: 1 }}>{avg!.toFixed(1)}</span>
                <span className="font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#5AC3E7', fontSize: '15px' }}>{label}</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: '#8aa0b2' }}>Flow (3) = challenge and ability in balance</p>
            </>
          ) : (
            <p className="text-[13px] leading-relaxed" style={{ color: '#dbe8f1' }}>
              Rate your sessions to map where your flow lives.
            </p>
          )}
        </div>
      </div>

      {hasData && (
        <>
          <div className="mt-4">
            <div className="relative" style={{ height: 8, borderRadius: 5, background: 'linear-gradient(90deg,#3a4a5e 0%,#00D2FF 50%,#7a4ab0 100%)', opacity: 0.7 }}>
              <div className="absolute" style={{ left: '50%', top: -3, width: 1, height: 14, background: '#cfe8f2', opacity: 0.5 }} />
              <div className="absolute" style={{ left: `${markerLeft}%`, top: -4, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '2px solid #00D2FF', transform: 'translateX(-50%)' }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px]" style={{ color: '#8aa0b2' }}>Bored · too easy</span>
              <span className="text-[10px] font-medium" style={{ color: '#00D2FF' }}>Flow</span>
              <span className="text-[10px]" style={{ color: '#8aa0b2' }}>Anxiety · too hard</span>
            </div>
          </div>
          <p className="text-[11px] mt-3 pt-3" style={{ color: '#dbe8f1', borderTop: '1px solid #1f344a' }}>{advice}</p>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 2: SESSIONS (improved with expanded details)
// ═══════════════════════════════════════

function SessionsTab({ data }: { data: PortalData }) {
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
      <h2 className="text-sm font-semibold text-[var(--tss-navy)]">
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
                    {/* What's next */}
                    {session.next_recommended_focus && (
                      <div className="pt-1">
                        <p className="text-xs text-gray-400 mb-1">Next Focus</p>
                        <div className="text-sm text-blue-800 bg-blue-50 rounded-xl p-2.5">
                          {session.next_recommended_focus}
                        </div>
                      </div>
                    )}
                    {/* M45 — Per-session survey gate */}
                    {surveyResultIds.includes(session.id) &&
                      (session.student_visible_summary || session.coach_feedback) && (
                        <div className="pt-1">
                          <p className="text-xs text-gray-400 mb-1">Session Summary</p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-2 whitespace-pre-line">
                            {session.student_visible_summary || session.coach_feedback}
                          </p>
                        </div>
                      )}
                    {!surveyResultIds.includes(session.id) &&
                      (session.student_visible_summary || session.coach_feedback) && (
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
}: {
  data: PortalData;
  autoExpandFirst?: boolean;
  initialSurveyId?: string | null;
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

  return (
    <div className="space-y-5">
      {/* Pending Surveys */}
      {pendingSurveys.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--tss-navy)]">
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
                      {new Date(result.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
                  studentId={student.id}
                  token={token}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Past Feedback */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--tss-navy)]">
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
            const coachFeedback = ssr?.student_visible_summary || ssr?.coach_feedback;
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
                      {new Date(ssr?.created_at || survey.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
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

                {/* Homework + what's next */}
                {(ssr?.homework || ssr?.whats_next) && (
                  <div className="grid grid-cols-1 gap-2">
                    {ssr?.homework && (
                      <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-0.5">Homework</p>
                        <p className="text-xs text-amber-900 leading-relaxed">{ssr.homework}</p>
                      </div>
                    )}
                    {ssr?.whats_next && (
                      <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-0.5">What&apos;s next</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{ssr.whats_next}</p>
                      </div>
                    )}
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
      subtitle: `${fmtDate(nextDate)}${upcomingCamp.scheduled_time ? ` · ${upcomingCamp.scheduled_time}` : ''}${dayTag}`,
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

  // New session report (feedback / homework)
  const lr = latestResult as any;
  if (lr && (lr.coach_feedback || lr.homework || lr.whats_next || lr.general_whats_next)) {
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

      {/* Coach profile */}
      {coach && (
        <div className="mt-3 flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2">
          {coach.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coach.photo_url}
              alt={coach.display_name}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
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
            <p className="text-sm font-semibold truncate">{coach.display_name}</p>
            <p className="text-[10px] text-white/60 truncate">
              Your coach{coach.certification_level ? ` · ${coach.certification_level}` : ''}
            </p>
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
