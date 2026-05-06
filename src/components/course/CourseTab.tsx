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

const SECTION_LABELS: Record<string, { title: string; emoji: string; description: string }> = {
  pre_course_fundamentals: {
    title: 'Pre-Course · Fundamentals',
    emoji: '📖',
    description: 'Doctrinal foundations every student must know before entering the water',
  },
  pre_course_values: {
    title: 'Pre-Course · TSS Values',
    emoji: '✨',
    description: 'The seven values that guide every belt of your TSS journey',
  },
  white_belt: {
    title: 'White Belt · 24 Steps',
    emoji: '🤍',
    description: 'The foundation belt — board control, safety, and your first waves',
  },
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

  // Group lessons by section (preserving display order)
  const grouped: Record<string, LessonRow[]> = {};
  for (const l of data.lessons) {
    if (!grouped[l.course_section]) grouped[l.course_section] = [];
    grouped[l.course_section].push(l);
  }

  const overallPercent = data.totalLessons > 0
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

      {/* Sections */}
      {Object.entries(grouped).map(([section, lessons]) => (
        <SectionBlock
          key={section}
          section={section}
          lessons={lessons}
          onOpenLesson={(id) => setOpenLessonId(id)}
        />
      ))}

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

function SectionBlock({
  section,
  lessons,
  onOpenLesson,
}: {
  section: string;
  lessons: LessonRow[];
  onOpenLesson: (id: string) => void;
}) {
  const meta = SECTION_LABELS[section] || { title: section, emoji: '📘', description: '' };
  const completed = lessons.filter((l) => l.completed).length;
  const sectionPercent = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span>{meta.emoji}</span>
              {meta.title}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{meta.description}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-[var(--tss-navy)]">{sectionPercent}%</div>
            <div className="text-[10px] text-gray-400">{completed}/{lessons.length}</div>
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

function LessonCard({ lesson, onOpen }: { lesson: LessonRow; onOpen: () => void }) {
  const isLocked = lesson.locked && !lesson.completed;
  const isCompleted = lesson.completed;
  const isInProgress = lesson.progress && !lesson.completed && (
    lesson.progress.video_watched || lesson.progress.content_read || lesson.progress.quiz_attempts > 0
  );

  let statusIcon = '🔓';
  let statusText = 'Start';
  let statusColor = 'text-gray-500';

  if (isLocked) {
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

  return (
    <button
      onClick={isLocked ? undefined : onOpen}
      disabled={isLocked}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
      }`}
    >
      {/* Step number badge */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
        isCompleted ? 'bg-green-100 text-green-700' :
        isInProgress ? 'bg-amber-100 text-amber-700' :
        'bg-gray-100 text-gray-600'
      }`}>
        {lesson.id.split('-')[1]}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{lesson.title}</div>
        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
          <span>{lesson.estimated_minutes} min</span>
          {lesson.pillar && (
            <>
              <span>·</span>
              <span className="truncate">{lesson.pillar}</span>
            </>
          )}
          {lesson.lesson_type !== 'reading' && (
            <>
              <span>·</span>
              <span className="font-medium text-[var(--tss-navy)]">
                {lesson.lesson_type === 'form' ? 'Goal Setting' : 'Self Test'}
              </span>
            </>
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
