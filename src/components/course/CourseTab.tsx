'use client';

import { useState } from 'react';
import { LessonViewer } from './LessonViewer';
import { CourseSwitcher } from './CourseSwitcher';
import { COURSES, SHARED_PRE_COURSE_SECTIONS, type CourseKey } from '@/lib/constants/courses';
import { BELT_THEMES, type BeltLevel, type BeltTheme } from '@/lib/constants/belt-theme';
import { ConcentricRings } from '@/components/shared/ConcentricRings';
import {
  BookOpen, Compass, Award, Trophy, Lock, Unlock, CheckCircle2,
  PlayCircle, Hourglass, ScrollText, Brain, Waves, Handshake,
  LifeBuoy, Dumbbell, Eye, DoorOpen, Anchor, Rocket, ArrowLeftRight,
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
  sequence_step_order: number | null;
}

interface CourseData {
  lessons: LessonRow[];
  preCourseCompleted: boolean;
  totalCompleted: number;
  totalLessons: number;
  studentId: string;
  studentName: string;
  hasAccess: boolean;
  ownedCourses: { key: CourseKey; label: string }[];
  activeCourseKey: CourseKey;
  portalToken: string;
}

// Pre-Course section icon map (per spec Section C)
const PC_SECTION_ICON: Record<string, LucideIcon> = {
  '0.1': ScrollText, // TSS Doctrine
  '0.2': Brain,      // Mindset and Learning
  '0.3': Waves,      // D1 Ocean
  '0.4': Handshake,  // D2 Etiquette
  '0.5': LifeBuoy,   // D3 Equipment
  '0.6': Dumbbell,   // D4 Physical
  '0.7': Eye,        // Entry Block preview
  '0.8': DoorOpen,   // Readiness Gate
};

// White Belt sequence icon map. Sequences are CUMULATIVE: each builds on
// all previous (canon doctrine).
const WB_SEQUENCE_ICON: Record<string, LucideIcon> = {
  'WB-SEQ-1': Anchor,         // Board Control
  'WB-SEQ-2': Waves,          // Sweet Spot
  'WB-SEQ-3': Rocket,         // Pop-Up
  'WB-SEQ-4': ArrowLeftRight, // Directional Turns
  'WB-SEQ-5': Award,          // Independence
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

  // Access gate
  if (!data.hasAccess) {
    return (
      <div className="text-center py-16 px-6">
        <Lock className="mx-auto mb-4 text-[var(--tss-cyan)]" size={56} strokeWidth={1.5} />
        <h2 className="text-xl font-bold mb-2">Course Access Required</h2>
        <p className="text-gray-600 mb-6">
          The TSS White Belt Masterclass is a paid course. Reach out to your TSS coach to get access.
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
        studentId={data.studentId}
        onBack={() => setOpenLessonId(null)}
      />
    );
  }

  // The pre-course is shared across every belt course; the rest is scoped
  // to whichever course the student selected in CourseSwitcher.
  const activeCourse =
    COURSES.find((c) => c.key === data.activeCourseKey) ?? COURSES[0];
  const onboardingSection = activeCourse.lessonSections[0];
  const beltSection = activeCourse.lessonSections[1];

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

  // Group belt lessons by wb_sequence_id (5 cumulative sequences for WB,
  // and the YB sequences for the yellow course — same column reused).
  const beltSequences = groupByWbSequence(beltLessons);

  const beltLabelShort =
    activeCourse.key === 'yellow_belt' ? 'Yellow Belt'
    : activeCourse.key === 'blue_belt' ? 'Blue Belt'
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">The Surf Sequence Method</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
            {overallPercent}% complete
          </span>
        </div>
        <p className="text-xs text-white/70 mb-3">
          Welcome, {data.studentName}. Your structured path to mastery starts here.
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
            eyebrow={`8 sections · ${preCourseLessons.length} units`}
            title="Pre-Course"
            subtitle="Doctrinal foundations every student must know before entering the water"
          />

          {pcSections.map((section) => (
            <SectionBlock
              key={section.id}
              title={section.name}
              subtitle={null}
              Icon={PC_SECTION_ICON[section.id] || BookOpen}
              badge={`Section ${section.id}`}
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
            eyebrow="Shared · already done if you came through WB"
            title="Prerequisites from White Belt"
            subtitle="The 6 White Belt onboarding concepts carry over to Yellow Belt. If you finished them at WB they're already ✓ Completed; if you came in direct you can do them now."
          />

          <SectionBlock
            title="White Belt Onboarding (carried over)"
            subtitle="Foundations shared between WB and YB"
            Icon={Compass}
            badge="Shared"
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
            eyebrow={`Module 1 · ${onboardingLessons.length} items`}
            title={`${beltLabelShort} Onboarding`}
            subtitle="Conceptual scaffolding before the sequences."
          />

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
          />

          {beltSequences.map((sequence) => {
            const SeqIcon = WB_SEQUENCE_ICON[sequence.id] || BookOpen;
            const cumulative = WB_SEQUENCE_CUMULATIVE[sequence.id];
            const promise = sequence.lessons[0]?.wb_sequence_promise || '';
            return (
              <SectionBlock
                key={sequence.id}
                title={`Sequence #${sequence.order}: ${sequence.name}`}
                subtitle={promise}
                Icon={SeqIcon}
                badge={cumulative ? `${cumulative}/25 cumulative` : null}
                lessons={sequence.lessons}
                onOpenLesson={(id) => setOpenLessonId(id)}
                theme={beltTheme}
              />
            );
          })}
        </div>
      )}

      {/* Footer */}
      {data.totalCompleted === data.totalLessons && data.totalLessons > 0 && (
        <div className="bg-gradient-to-r from-cyan-50 to-sky-100 border border-cyan-300 rounded-xl p-5 text-center">
          <Trophy className="mx-auto mb-2 text-[var(--tss-cyan)]" size={36} strokeWidth={1.75} />
          <h3 className="font-bold text-lg text-[var(--tss-navy)] mb-1">{beltLabelShort} Course Complete!</h3>
          <p className="text-sm text-[var(--tss-navy)]/70">
            You finished the theoretical {beltLabelShort} course. Talk to your TSS coach to schedule your in-person evaluation.
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
  return key === 'yellow_belt' ? 'yellow' : key === 'blue_belt' ? 'blue' : 'white';
}

// ─── Group Header (reads on the dark student dashboard) ───
// Belt-colored rings + eyebrow + left accent, soft-gray title.
function GroupHeader({
  theme,
  eyebrow,
  title,
  subtitle,
}: {
  theme: BeltTheme;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
}) {
  return (
    <div className="px-2">
      <div className="pl-3 border-l-4" style={{ borderColor: theme.accent }}>
        {eyebrow && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-block w-4 h-0.5" style={{ background: theme.accent }} />
            <span
              className="text-[10px] tracking-[0.14em] uppercase font-medium"
              style={{ color: theme.bright, fontFamily: 'DM Mono, monospace' }}
            >
              {eyebrow}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <ConcentricRings color={theme.bright} />
          <h3 className="text-lg font-bold text-gray-200">{title}</h3>
        </div>
        {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
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
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      style={theme ? { borderLeft: `4px solid ${theme.accent}` } : undefined}
    >
      <div
        className="px-4 py-3 border-b border-gray-200"
        style={{ background: theme ? theme.tint : '#f9fafb' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: theme ? theme.ink : 'var(--tss-cyan)' }} />
              <span className="truncate">{title}</span>
              {badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono flex-shrink-0">
                  {badge}
                </span>
              )}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-gray-500 mt-0.5 italic">"{subtitle}"</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-bold" style={{ color: theme ? theme.ink : 'var(--tss-navy)' }}>{sectionPercent}%</div>
            <div className="text-[10px] text-gray-400">
              {completed}/{productized.length}
              {proposedCount > 0 && (
                <span className="text-amber-600"> +{proposedCount}↗</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onOpen={() => onOpenLesson(lesson.id)} />
        ))}
      </div>
    </div>
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
  let statusColor = 'text-gray-500';

  if (isProposed) {
    StatusIcon = Hourglass;
    statusText = 'v1.5';
    statusColor = 'text-amber-600';
  } else if (isLocked) {
    StatusIcon = Lock;
    statusText = 'Locked';
    statusColor = 'text-gray-400';
  } else if (isCompleted) {
    StatusIcon = CheckCircle2;
    statusText = 'Completed';
    statusColor = 'text-green-600';
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
        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
      } ${isProposed ? 'bg-amber-50/30' : ''}`}
    >
      {/* Step number badge */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${
          isProposed
            ? 'bg-amber-100 text-amber-700 border border-amber-300 border-dashed'
            : isCompleted
            ? 'bg-green-100 text-green-700'
            : isInProgress
            ? 'bg-amber-100 text-amber-700'
            : lesson.is_test
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {badgeNum}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{lesson.title}</span>
          {isProposed && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wide flex-shrink-0">
              Coming v1.5
            </span>
          )}
          {lesson.is_test && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold uppercase tracking-wide flex-shrink-0">
              Gate Test
            </span>
          )}
        </div>
        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
          {!isProposed && <span>{lesson.estimated_minutes} min</span>}
          {lesson.pillar && !isProposed && (
            <>
              {!isProposed && <span>·</span>}
              <span className="truncate">{lesson.pillar}</span>
            </>
          )}
          {!isProposed && lesson.lesson_type !== 'reading' && (
            <>
              <span>·</span>
              <span className="font-medium text-[var(--tss-navy)]">
                {lesson.lesson_type === 'form' ? 'Goal Setting' : 'Self Test'}
              </span>
            </>
          )}
          {isProposed && (
            <span className="italic text-amber-700">
              Canonical content coming in v1.5
            </span>
          )}
        </div>
        {isLocked && lesson.lockReason && (
          <div className="text-[10px] text-gray-400 mt-1 italic">{lesson.lockReason}</div>
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
