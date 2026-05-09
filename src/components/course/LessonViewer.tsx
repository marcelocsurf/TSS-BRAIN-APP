'use client';

import { useState, useEffect } from 'react';
import {
  getLessonDetail,
  markVideoWatched,
  markContentRead,
  saveLessonForm,
} from '@/lib/actions/course';
import { CourseQuiz } from './CourseQuiz';
import { MarkdownContent } from './MarkdownContent';

interface LessonViewerProps {
  lessonId: string;
  studentId: string;
  onBack: () => void;
}

type Section = 'video' | 'theory' | 'drill' | 'mission' | 'errors' | 'quiz' | 'form';

export function LessonViewer({ lessonId, studentId, onBack }: LessonViewerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('video');

  useEffect(() => {
    let mounted = true;
    getLessonDetail(lessonId, studentId).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
        // Pick initial section: video if available, else theory
        if (res?.lesson) {
          if (res.lesson.lesson_type === 'form' || res.lesson.lesson_type === 'test') {
            setActiveSection('form');
          } else if (res.lesson.video_url) {
            setActiveSection('video');
          } else {
            setActiveSection('theory');
          }
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [lessonId, studentId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-pulse text-4xl mb-2">📖</div>
        <p className="text-gray-500 text-sm">Loading lesson...</p>
      </div>
    );
  }

  if (!data || !data.lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Lesson not found</p>
        <button onClick={onBack} className="mt-4 text-sm underline">
          ← Back to course
        </button>
      </div>
    );
  }

  const { lesson, quizzes, progress, drillsMissions = [] } = data;
  const canonicalDrill = drillsMissions.find((d: any) => d.type === 'drill');
  const canonicalMission = drillsMissions.find((d: any) => d.type === 'mission');

  // PROPOSED items have no canonical content yet — show v1.5 placeholder
  if (lesson.status_v1 === 'PROPOSED') {
    return (
      <div className="space-y-4 pb-8">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          ← Back to course
        </button>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">⏳</span>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">
                {lesson.id} · Section {lesson.pc_section_id || '—'}
                {lesson.is_test && ' · Gate Test'}
              </div>
              <h1 className="text-xl font-bold text-amber-900">{lesson.title}</h1>
              {lesson.pc_section_name && (
                <p className="text-sm text-amber-700 mt-1">{lesson.pc_section_name}</p>
              )}
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 mt-4">
            <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-2">
              📝 Status
            </div>
            <p className="text-sm text-amber-900 font-semibold mb-2">
              Coming in v1.5
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Marcelo will release the full canonical content
              {lesson.is_test
                ? ' — including test specifications, evaluation rubric, accepted formats, and retake policy —'
                : ' — including description, key concepts, coach cue, common errors, drill, and success indicators —'}
              {' '}as part of the next update. The TSS canon prioritizes precision over speed: pedagogical content is only published once it is doctrinally complete.
            </p>
          </div>

          <button
            onClick={onBack}
            className="mt-4 w-full py-3 rounded-lg bg-amber-200 hover:bg-amber-300 transition-colors text-sm font-bold text-amber-900"
          >
            ← Back to {lesson.pc_section_name || 'course'}
          </button>
        </div>
      </div>
    );
  }

  // Build available sections based on lesson content
  const availableSections: { key: Section; label: string; icon: string }[] = [];

  if (lesson.lesson_type === 'form' || lesson.lesson_type === 'test') {
    availableSections.push({ key: 'form', label: 'Activity', icon: '📝' });
  } else {
    availableSections.push({ key: 'video', label: 'Video', icon: '▶️' });
    if (lesson.description_md) availableSections.push({ key: 'theory', label: 'Theory', icon: '📖' });
    // Drill: canonical drills_missions row preferred, fallback to lesson.drill_md
    if (canonicalDrill || lesson.drill_md) availableSections.push({ key: 'drill', label: 'Drill', icon: '🏋️' });
    // Mission: only when there's a canonical mission for this step
    if (canonicalMission) availableSections.push({ key: 'mission', label: 'Mission', icon: '🌊' });
    if (lesson.errors_md) availableSections.push({ key: 'errors', label: 'Errors', icon: '⚠️' });
    if (quizzes && quizzes.length > 0) availableSections.push({ key: 'quiz', label: 'Quiz', icon: '🧠' });
  }

  const currentSectionIdx = availableSections.findIndex((s) => s.key === activeSection);
  const isLastSection = currentSectionIdx === availableSections.length - 1;
  const nextSection = !isLastSection ? availableSections[currentSectionIdx + 1] : null;

  const refreshProgress = async () => {
    const fresh = await getLessonDetail(lessonId, studentId);
    setData(fresh);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-3"
        >
          ← Back to course
        </button>
        <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[var(--tss-navy-dark,#0a1628)] text-white rounded-xl p-5">
          <div className="text-xs text-white/60 mb-1">{lesson.id}</div>
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          {lesson.subtitle && (
            <p className="text-sm text-white/80 mt-1 italic">{lesson.subtitle}</p>
          )}
          {lesson.pillar && (
            <p className="text-xs text-[var(--tss-gold,#d4a017)] mt-2">
              Pillar: {lesson.pillar}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3 text-[11px] text-white/70">
            <span>⏱ {lesson.estimated_minutes} min</span>
            {progress?.completed && <span className="text-green-300">✓ Completed</span>}
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {availableSections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-all whitespace-nowrap ${
              activeSection === s.key
                ? 'bg-white shadow-sm text-[var(--tss-navy)]'
                : 'text-gray-600'
            }`}
          >
            <span className="mr-1">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 min-h-[300px]">
        {activeSection === 'video' && (
          <VideoSection lesson={lesson} progress={progress} studentId={studentId} onWatched={refreshProgress} />
        )}
        {activeSection === 'theory' && (
          <ContentSection
            content={lesson.description_md}
            studentId={studentId}
            lessonId={lesson.id}
            alreadyRead={progress?.content_read}
            onRead={refreshProgress}
          />
        )}
        {activeSection === 'drill' && canonicalDrill && (
          <PracticeSection item={canonicalDrill} />
        )}
        {activeSection === 'drill' && !canonicalDrill && lesson.drill_md && (
          <ContentSection content={lesson.drill_md} studentId={studentId} lessonId={lesson.id} alreadyRead={progress?.content_read} onRead={refreshProgress} hideMarkRead />
        )}
        {activeSection === 'mission' && canonicalMission && (
          <PracticeSection item={canonicalMission} />
        )}
        {activeSection === 'errors' && (
          <ContentSection content={lesson.errors_md} studentId={studentId} lessonId={lesson.id} alreadyRead={progress?.content_read} onRead={refreshProgress} hideMarkRead />
        )}
        {activeSection === 'quiz' && (
          <CourseQuiz
            lessonId={lesson.id}
            studentId={studentId}
            quizzes={quizzes}
            existingScore={progress?.quiz_score}
            existingAttempts={progress?.quiz_attempts}
            isCompleted={progress?.completed}
            onComplete={refreshProgress}
          />
        )}
        {activeSection === 'form' && (
          <FormSection
            lesson={lesson}
            studentId={studentId}
            existingResponse={progress?.form_response}
            isCompleted={progress?.completed}
            onComplete={refreshProgress}
          />
        )}
      </div>

      {/* Next section button */}
      {nextSection && (
        <button
          onClick={() => setActiveSection(nextSection.key)}
          className="w-full bg-[var(--tss-navy)] text-white rounded-lg py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Next: {nextSection.icon} {nextSection.label} →
        </button>
      )}
    </div>
  );
}

// ─── Video Section ───

function VideoSection({
  lesson,
  progress,
  studentId,
  onWatched,
}: {
  lesson: any;
  progress: any;
  studentId: string;
  onWatched: () => void;
}) {
  const [marking, setMarking] = useState(false);

  const handleMarkWatched = async () => {
    setMarking(true);
    await markVideoWatched(studentId, lesson.id);
    await onWatched();
    setMarking(false);
  };

  // Convert YouTube URL to embed format
  const embedUrl = lesson.video_url ? toEmbedUrl(lesson.video_url) : null;

  if (!lesson.video_url) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">📹</div>
        <h3 className="font-bold text-base mb-2">Video Coming Soon</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          The video for this lesson is being filmed. In the meantime, you can review the theory, drill, and errors below.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm">
            Invalid video URL
          </div>
        )}
      </div>

      <button
        onClick={handleMarkWatched}
        disabled={progress?.video_watched || marking}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
          progress?.video_watched
            ? 'bg-green-100 text-green-700 cursor-default'
            : 'bg-[var(--tss-navy)] text-white hover:opacity-90'
        }`}
      >
        {progress?.video_watched ? '✓ Marked as watched' : marking ? 'Saving...' : 'Mark as watched'}
      </button>
    </div>
  );
}

// ─── Generic Content Section (Theory, Drill, Errors) ───

function ContentSection({
  content,
  studentId,
  lessonId,
  alreadyRead,
  onRead,
  hideMarkRead,
}: {
  content: string | null;
  studentId: string;
  lessonId: string;
  alreadyRead: boolean;
  onRead: () => void;
  hideMarkRead?: boolean;
}) {
  const [marking, setMarking] = useState(false);

  const handleMarkRead = async () => {
    setMarking(true);
    await markContentRead(studentId, lessonId);
    await onRead();
    setMarking(false);
  };

  if (!content) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        No content available for this section.
      </div>
    );
  }

  return (
    <div>
      <div className="prose prose-sm max-w-none">
        <MarkdownContent markdown={content} />
      </div>

      {!hideMarkRead && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleMarkRead}
            disabled={alreadyRead || marking}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              alreadyRead
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-[var(--tss-navy)] text-white hover:opacity-90'
            }`}
          >
            {alreadyRead ? '✓ Read' : marking ? 'Saving...' : 'Mark as read'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Form Section (PC-002 Set Goal, PC-004 Goofy/Regular) ───

function FormSection({
  lesson,
  studentId,
  existingResponse,
  isCompleted,
  onComplete,
}: {
  lesson: any;
  studentId: string;
  existingResponse: any;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  // ONB-06: Venue Analysis + Set Goal (text input). v5 canon ID — replaces
  // legacy PC-002 which no longer exists post-COMPLETE-PACKAGE import.
  if (lesson.id === 'ONB-06' || lesson.id === 'PC-002') {
    return (
      <SetGoalForm
        lesson={lesson}
        studentId={studentId}
        existingGoal={existingResponse?.goal}
        isCompleted={isCompleted}
        onComplete={onComplete}
      />
    );
  }

  // ONB-01: Goofy or Regular (selection). v5 canon ID — replaces legacy PC-004.
  if (lesson.id === 'ONB-01' || lesson.id === 'PC-004') {
    return (
      <GoofyOrRegularForm
        lesson={lesson}
        studentId={studentId}
        existingStance={existingResponse?.stance}
        isCompleted={isCompleted}
        onComplete={onComplete}
      />
    );
  }

  // Default: just show content
  return <ContentSection content={lesson.description_md} studentId={studentId} lessonId={lesson.id} alreadyRead={isCompleted} onRead={onComplete} />;
}

function SetGoalForm({
  lesson,
  studentId,
  existingGoal,
  isCompleted,
  onComplete,
}: {
  lesson: any;
  studentId: string;
  existingGoal?: string;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [goal, setGoal] = useState(existingGoal || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!goal.trim() || goal.length < 20) {
      alert('Please write at least one full sentence about your goal (min 20 characters).');
      return;
    }
    setSaving(true);
    await saveLessonForm(studentId, lesson.id, { goal });
    await onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <MarkdownContent markdown={lesson.description_md} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-bold text-sm mb-2">Your Goal</h4>
        <p className="text-xs text-gray-600 mb-3">
          Write your personal goal as clearly as possible. Be specific. This will be visible to your TSS coach.
        </p>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={5}
          placeholder="In 6 months I want to..."
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          disabled={isCompleted}
        />
        <div className="text-[10px] text-gray-400 mt-1">{goal.length} / 500 characters</div>

        <button
          onClick={handleSave}
          disabled={saving || isCompleted || goal.length < 20}
          className={`mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isCompleted
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-[var(--tss-navy)] text-white hover:opacity-90 disabled:opacity-50'
          }`}
        >
          {isCompleted ? '✓ Goal saved' : saving ? 'Saving...' : 'Save my goal'}
        </button>
      </div>
    </div>
  );
}

function GoofyOrRegularForm({
  lesson,
  studentId,
  existingStance,
  isCompleted,
  onComplete,
}: {
  lesson: any;
  studentId: string;
  existingStance?: string;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [stance, setStance] = useState<string>(existingStance || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!stance) return;
    setSaving(true);
    await saveLessonForm(studentId, lesson.id, { stance });
    await onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <MarkdownContent markdown={lesson.description_md} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-sm mb-3">Which foot leads?</h4>
        <p className="text-xs text-gray-600 mb-4">
          After doing the physical test described above, select your stance:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setStance('regular')}
            disabled={isCompleted}
            className={`p-4 rounded-lg border-2 transition-all ${
              stance === 'regular'
                ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">🦶</div>
            <div className="font-bold text-sm">Regular</div>
            <div className="text-[10px] mt-1 opacity-80">Left foot forward</div>
          </button>

          <button
            onClick={() => setStance('goofy')}
            disabled={isCompleted}
            className={`p-4 rounded-lg border-2 transition-all ${
              stance === 'goofy'
                ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">🦶</div>
            <div className="font-bold text-sm">Goofy</div>
            <div className="text-[10px] mt-1 opacity-80">Right foot forward</div>
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || isCompleted || !stance}
          className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isCompleted
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-[var(--tss-navy)] text-white hover:opacity-90 disabled:opacity-50'
          }`}
        >
          {isCompleted ? `✓ Saved: ${existingStance}` : saving ? 'Saving...' : `Confirm: ${stance || '...'}`}
        </button>
      </div>
    </div>
  );
}

// ─── Practice Section (renders canonical drill or mission for an STP) ───
//
// Used when the lesson is an STP-XXX and we have its drills_missions row.
// Shows 5 KEY WORDS, time/reps, description, success criteria, and a CTA
// that deep-links to Let's Play with this drill auto-selected so the
// student can run the linked training flow without leaving the portal.

function PracticeSection({ item }: { item: any }) {
  const isMission = item.type === 'mission';
  const ctaLabel = isMission ? 'Run this Mission in Let’s Play →' : 'Practice this Drill in Let’s Play →';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          {item.id}
          {item.time_estimate ? ` · ${item.time_estimate}` : ''}
          {item.reps_recommended ? ` · ${item.reps_recommended}` : ''}
        </p>
        <h3 className="text-base font-bold text-[var(--tss-navy)] mt-1">
          {item.title}
        </h3>
      </div>

      {item.key_words && item.key_words.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700">
            5 Key Words
          </p>
          <p className="text-sm font-bold text-amber-900 mt-1 tracking-wide">
            {item.key_words.join(' · ')}
          </p>
        </div>
      )}

      {item.description_md && (
        <div className="prose prose-sm max-w-none">
          <MarkdownContent markdown={item.description_md} />
        </div>
      )}

      {item.success_criteria && item.success_criteria.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700">
            How you know you got it
          </p>
          <ul className="text-xs text-emerald-900 mt-1 space-y-1">
            {item.success_criteria.map((c: string, i: number) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={`?tab=sequence&drill=${item.id}`}
        className="block w-full py-3 rounded-xl bg-[var(--tss-navy)] text-white text-sm font-semibold text-center hover:opacity-90"
      >
        ▶️ {ctaLabel}
      </a>
    </div>
  );
}

// ─── Helpers ───

function toEmbedUrl(url: string): string | null {
  // YouTube watch URL
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url; // Assume already embed
}
