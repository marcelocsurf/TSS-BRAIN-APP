'use client';

import { useState } from 'react';
import { LessonViewer } from './LessonViewer';

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
}

// Pre-Course section emoji map (per spec Section C)
const PC_SECTION_EMOJI: Record<string, string> = {
  '0.1': '📜', // TSS Doctrine
  '0.2': '🧠', // Mindset and Learning
  '0.3': '🌊', // D1 Ocean
  '0.4': '🤝', // D2 Etiquette
  '0.5': '🛟', // D3 Equipment
  '0.6': '💪', // D4 Physical
  '0.7': '👀', // Entry Block preview
  '0.8': '🚪', // Readiness Gate
};

// White Belt sequence emoji map (canonical promise text comes from DB
// wb_sequence_promise field per Migration 00020). Sequences are CUMULATIVE:
// each builds on all previous (canon doctrine).
const WB_SEQUENCE_EMOJI: Record<string, string> = {
  'WB-SEQ-1': '🏖', // Board Control
  'WB-SEQ-2': '🌊', // Sweet Spot
  'WB-SEQ-3': '🚀', // Pop-Up
  'WB-SEQ-4': '↔️', // Directional Turns
  'WB-SEQ-5': '🏄', // Independence
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
        <div className="text-6xl mb-4">🔒</div>
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

  // 3-module canonical structure (per WB canon v1):
  //   Module 0: Pre-Course (8 PC-PRE-XX items, value: Conciencia)
  //   Module 1: WB Onboarding (6 ONB-XX items)
  //   Module 2: WB Sequences (25 STPs in 5 cumulative sequences, value: Humildad)
  const preCourseLessons = data.lessons.filter(
    (l) =>
      l.course_section === 'pre_course_fundamentals' ||
      l.course_section === 'pre_course_values'
  );
  const onboardingLessons = data.lessons.filter(
    (l) => l.course_section === 'wb_onboarding'
  );
  const whiteBeltLessons = data.lessons.filter(
    (l) => l.course_section === 'white_belt'
  );

  // Group Pre-Course by pc_section_id (canon v1 uses M0 for all 8)
  const pcSections = groupByPcSection(preCourseLessons);

  // Group White Belt by wb_sequence_id (5 cumulative sequences)
  const wbSequences = groupByWbSequence(whiteBeltLessons);

  const overallPercent =
    data.totalLessons > 0
      ? Math.round((data.totalCompleted / data.totalLessons) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[var(--tss-navy-dark,#0a1628)] text-white rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">TSS Masterclass</h2>
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
          <div className="px-2">
            <h3 className="text-base font-bold text-[var(--tss-navy)] flex items-center gap-2">
              📖 Pre-Course
              <span className="text-[11px] font-normal text-gray-500">
                · 8 sections · {preCourseLessons.length} units
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Doctrinal foundations every student must know before entering the water
            </p>
          </div>

          {pcSections.map((section) => (
            <SectionBlock
              key={section.id}
              title={section.name}
              subtitle={null}
              emoji={PC_SECTION_EMOJI[section.id] || '📘'}
              badge={`Section ${section.id}`}
              lessons={section.lessons}
              onOpenLesson={(id) => setOpenLessonId(id)}
            />
          ))}
        </div>
      )}

      {/* WB ONBOARDING — Module 1, single block */}
      {onboardingLessons.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="px-2">
            <h3 className="text-base font-bold text-[var(--tss-navy)] flex items-center gap-2">
              🧭 WB Onboarding
              <span className="text-[11px] font-normal text-gray-500">
                · Module 1 · {onboardingLessons.length} items
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Conceptual scaffolding before the sequences — your stance, surf identity, the 4 pillars, equipment, venue analysis.
            </p>
          </div>

          <SectionBlock
            title="WB Onboarding"
            subtitle="Bridge between awareness (Pre-Course) and action (Sequences)"
            emoji="🧭"
            badge="Module 1"
            lessons={onboardingLessons.sort(
              (a, b) => (a.display_order || 0) - (b.display_order || 0)
            )}
            onOpenLesson={(id) => setOpenLessonId(id)}
          />
        </div>
      )}

      {/* WHITE BELT — 5 cumulative sequences */}
      {wbSequences.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="px-2">
            <h3 className="text-base font-bold text-[var(--tss-navy)] flex items-center gap-2">
              🤍 White Belt
              <span className="text-[11px] font-normal text-gray-500">
                · 5 sequences · 25 steps · Value: Humildad
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              <strong>Cumulative</strong> — each sequence builds on all previous. Mastery of #5 means mastery of #1–5.
            </p>
          </div>

          {wbSequences.map((sequence) => {
            const emoji = WB_SEQUENCE_EMOJI[sequence.id] || '📘';
            const cumulative = WB_SEQUENCE_CUMULATIVE[sequence.id];
            const promise = sequence.lessons[0]?.wb_sequence_promise || '';
            return (
              <SectionBlock
                key={sequence.id}
                title={`Sequence #${sequence.order}: ${sequence.name}`}
                subtitle={promise}
                emoji={emoji}
                badge={cumulative ? `${cumulative}/25 cumulative` : null}
                lessons={sequence.lessons}
                onOpenLesson={(id) => setOpenLessonId(id)}
              />
            );
          })}
        </div>
      )}

      {/* Footer */}
      {data.totalCompleted === data.totalLessons && data.totalLessons > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-300 rounded-xl p-5 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="font-bold text-lg text-amber-900 mb-1">White Belt Course Complete!</h3>
          <p className="text-sm text-amber-800">
            You finished the theoretical White Belt course. Talk to your TSS coach to schedule your in-person evaluation.
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

// ─── Section/Chapter Block ───

function SectionBlock({
  title,
  subtitle,
  emoji,
  badge,
  lessons,
  onOpenLesson,
}: {
  title: string;
  subtitle: string | null;
  emoji: string;
  badge: string | null;
  lessons: LessonRow[];
  onOpenLesson: (id: string) => void;
}) {
  // Only count PRODUCTIZED items toward progress (PROPOSED can't be completed)
  const productized = lessons.filter((l) => l.status_v1 !== 'PROPOSED');
  const completed = productized.filter((l) => l.completed).length;
  const sectionPercent =
    productized.length > 0 ? Math.round((completed / productized.length) * 100) : 0;
  const proposedCount = lessons.length - productized.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span>{emoji}</span>
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
            <div className="text-xs font-bold text-[var(--tss-navy)]">{sectionPercent}%</div>
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

  let statusIcon = '🔓';
  let statusText = 'Start';
  let statusColor = 'text-gray-500';

  if (isProposed) {
    statusIcon = '⏳';
    statusText = 'v1.5';
    statusColor = 'text-amber-600';
  } else if (isLocked) {
    statusIcon = '🔒';
    statusText = 'Locked';
    statusColor = 'text-gray-400';
  } else if (isCompleted) {
    statusIcon = '✅';
    statusText = 'Completed';
    statusColor = 'text-green-600';
  } else if (isInProgress) {
    statusIcon = '⏯';
    statusText = 'Continue';
    statusColor = 'text-amber-600';
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
        <span className="text-base">{statusIcon}</span>
        <span>{statusText}</span>
      </div>
    </button>
  );
}
