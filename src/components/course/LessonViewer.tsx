'use client';

import { useState, useEffect } from 'react';
import {
  getLessonDetail,
  markVideoWatched,
  markContentRead,
  markLessonComplete,
  saveLessonForm,
} from '@/lib/actions/course';
import { CourseQuiz } from './CourseQuiz';
import { MarkdownContent } from './MarkdownContent';
import {
  BookOpen,
  PlayCircle,
  Brain,
  Dumbbell,
  Waves,
  AlertTriangle,
  ClipboardList,
  Hourglass,
  Clock,
  Check,
  Video,
  Play,
  Footprints,
  CheckCircle2,
} from 'lucide-react';

type IconType = typeof BookOpen;

interface LessonViewerProps {
  lessonId: string;
  studentId: string;
  onBack: () => void;
}

type Section = 'video' | 'theory' | 'drill' | 'mission' | 'errors' | 'quiz' | 'form';

export function LessonViewer({ lessonId, studentId, onBack }: LessonViewerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getLessonDetail(lessonId, studentId).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [lessonId, studentId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <BookOpen
          size={36}
          strokeWidth={1.75}
          className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan,#5AC3E7)]"
        />
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

  const { lesson, quizzes, progress, drillsMissions = [], videos = [] } = data;
  const canonicalDrill = drillsMissions.find((d: any) => d.type === 'drill');
  const canonicalMission = drillsMissions.find((d: any) => d.type === 'mission');
  // Videos come from content_videos table (multi-video). Falls back to the
  // legacy single video_url column if no rows in content_videos (back-compat).
  const lessonVideos: { id?: string; url: string; label: string | null }[] =
    videos.length > 0
      ? videos
      : lesson.video_url
      ? [{ url: lesson.video_url, label: null }]
      : [];

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
            <Hourglass size={28} strokeWidth={1.75} className="text-amber-700 shrink-0 mt-0.5" />
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
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-2">
              <ClipboardList size={14} strokeWidth={1.75} />
              Status
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

  const refreshProgress = async () => {
    const fresh = await getLessonDetail(lessonId, studentId);
    setData(fresh);
  };

  const isFormOrTest = lesson.lesson_type === 'form' || lesson.lesson_type === 'test';
  const cardCls = 'bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-6';

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
            <p className="text-xs text-[var(--tss-cyan,#5AC3E7)] mt-2">
              Pillar: {lesson.pillar}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3 text-[11px] text-white/70">
            <span className="flex items-center gap-1">
              <Clock size={13} strokeWidth={1.75} />
              {lesson.estimated_minutes} min
            </span>
            {progress?.completed && (
              <span className="flex items-center gap-1 text-green-300">
                <CheckCircle2 size={13} strokeWidth={1.75} />
                Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {isFormOrTest ? (
        /* Form / exit-test lessons keep their interactive activity (and the
           exit test's quiz) — those ARE the gate, not a per-lesson quiz. */
        <>
          <div className={cardCls}>
            <FormSection
              lesson={lesson}
              studentId={studentId}
              existingResponse={progress?.form_response}
              isCompleted={progress?.completed}
              onComplete={refreshProgress}
            />
          </div>
          {lesson.lesson_type === 'test' && quizzes && quizzes.length > 0 && (
            <div className={cardCls}>
              <CourseQuiz
                lessonId={lesson.id}
                studentId={studentId}
                quizzes={quizzes}
                existingScore={progress?.quiz_score}
                existingAttempts={progress?.quiz_attempts}
                isCompleted={progress?.completed}
                onComplete={refreshProgress}
              />
            </div>
          )}
        </>
      ) : (
        /* Reading lesson — everything in one scroll: video, theory, drill,
           mission, errors, then a single "Mark as done". */
        <>
          {lessonVideos.length > 0 && (
            <div className={cardCls}>
              <DrillMissionVideos videos={lessonVideos} title={lesson.title} />
            </div>
          )}
          {lesson.description_md && (
            <div className={cardCls}>
              <SectionLabel icon={BookOpen} text="Theory" />
              <div className="prose prose-sm max-w-none"><MarkdownContent markdown={lesson.description_md} /></div>
            </div>
          )}
          {(canonicalDrill || canonicalMission) ? (
            /* Don't load the full drill/mission here — send them to Let's Play
               to actually practice it and follow the flow. */
            <a
              href={`?tab=sequence&drill=${(canonicalDrill || canonicalMission).id}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--tss-navy)] text-white py-4 text-sm font-semibold hover:opacity-90"
            >
              <PlayCircle size={18} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
              Let&apos;s practice drills &amp; missions in Let&apos;s Play →
            </a>
          ) : lesson.drill_md ? (
            <div className={cardCls}>
              <SectionLabel icon={Dumbbell} text="Drill" />
              <div className="prose prose-sm max-w-none"><MarkdownContent markdown={lesson.drill_md} /></div>
            </div>
          ) : null}
          {lesson.errors_md && (
            <div className={cardCls}>
              <SectionLabel icon={AlertTriangle} text="Common errors" />
              <div className="prose prose-sm max-w-none"><MarkdownContent markdown={lesson.errors_md} /></div>
            </div>
          )}
          <MarkDoneButton studentId={studentId} lessonId={lesson.id} completed={!!progress?.completed} onDone={refreshProgress} />
        </>
      )}
    </div>
  );
}

// ─── Unified-view helpers ───

function SectionLabel({ icon: Icon, text }: { icon: IconType; text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">
      <Icon size={13} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
      {text}
    </p>
  );
}

function MarkDoneButton({
  studentId, lessonId, completed, onDone,
}: {
  studentId: string; lessonId: string; completed: boolean; onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const handle = async () => {
    setSaving(true);
    await markLessonComplete(studentId, lessonId);
    await onDone();
    setSaving(false);
  };
  return (
    <button
      onClick={handle}
      disabled={completed || saving}
      className={`w-full py-3.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 ${
        completed ? 'bg-green-100 text-green-700 cursor-default' : 'bg-[var(--tss-navy)] text-white hover:opacity-90'
      }`}
    >
      {completed ? (<><Check size={16} strokeWidth={2} /> Completed</>) : saving ? 'Saving…' : (<><Check size={16} strokeWidth={2} /> Mark as done</>)}
    </button>
  );
}

// ─── Video Section ───

function VideoSection({
  lesson,
  videos,
  progress,
  studentId,
  onWatched,
}: {
  lesson: any;
  videos: { id?: string; url: string; label: string | null }[];
  progress: any;
  studentId: string;
  onWatched: () => void;
}) {
  const [marking, setMarking] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleMarkWatched = async () => {
    setMarking(true);
    await markVideoWatched(studentId, lesson.id);
    await onWatched();
    setMarking(false);
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Video size={48} strokeWidth={1.75} className="mx-auto mb-3 text-gray-300" />
        <h3 className="font-bold text-base mb-2">Video Coming Soon</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          The video for this lesson is being filmed. In the meantime, you can review the theory, drill, and errors below.
        </p>
      </div>
    );
  }

  const current = videos[Math.min(activeIdx, videos.length - 1)];
  const embedUrl = toEmbedUrl(current.url);

  return (
    <div>
      {/* Video selector tabs (only when there's more than 1) */}
      {videos.length > 1 && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {videos.map((v, i) => (
            <button
              key={v.id ?? i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeIdx === i
                  ? 'bg-[var(--tss-navy)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {v.label || `Video ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
        {embedUrl ? (
          <iframe
            key={current.url}
            src={embedUrl}
            title={current.label || lesson.title}
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

      {current.label && (
        <p className="flex items-center gap-1 text-[11px] text-gray-500 italic mb-3">
          <Play size={11} strokeWidth={1.75} />
          {current.label}
        </p>
      )}

      <button
        onClick={handleMarkWatched}
        disabled={progress?.video_watched || marking}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
          progress?.video_watched
            ? 'bg-green-100 text-green-700 cursor-default'
            : 'bg-[var(--tss-navy)] text-white hover:opacity-90'
        }`}
      >
        {progress?.video_watched ? (
          <span className="flex items-center justify-center gap-1.5">
            <Check size={15} strokeWidth={1.75} />
            Marked as watched
          </span>
        ) : marking ? 'Saving...' : 'Mark as watched'}
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
            {alreadyRead ? (
          <span className="flex items-center justify-center gap-1.5">
            <Check size={15} strokeWidth={1.75} />
            Read
          </span>
        ) : marking ? 'Saving...' : 'Mark as read'}
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
          {isCompleted ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check size={15} strokeWidth={1.75} />
              Goal saved
            </span>
          ) : saving ? 'Saving...' : 'Save my goal'}
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
            <Footprints size={24} strokeWidth={1.75} className="mx-auto mb-1" />
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
            <Footprints size={24} strokeWidth={1.75} className="mx-auto mb-1 -scale-x-100" />
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
          {isCompleted ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check size={15} strokeWidth={1.75} />
              {`Saved: ${existingStance}`}
            </span>
          ) : saving ? 'Saving...' : `Confirm: ${stance || '...'}`}
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

function DrillMissionVideos({
  videos,
  title,
}: {
  videos: { id?: string; url: string; label: string | null }[];
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = videos[Math.min(activeIdx, videos.length - 1)];
  const embedUrl = toEmbedUrl(current.url);

  return (
    <div>
      {videos.length > 1 && (
        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
          {videos.map((v, i) => (
            <button
              key={v.id ?? i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1 text-[11px] font-medium rounded-md whitespace-nowrap ${
                activeIdx === i
                  ? 'bg-[var(--tss-navy)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {v.label || `Video ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {embedUrl ? (
          <iframe
            key={current.url}
            src={embedUrl}
            title={current.label || title}
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
      {current.label && videos.length === 1 && (
        <p className="flex items-center gap-1 text-[11px] text-gray-500 italic mt-1.5">
          <Play size={11} strokeWidth={1.75} />
          {current.label}
        </p>
      )}
    </div>
  );
}

function PracticeSection({ item }: { item: any }) {
  const isMission = item.type === 'mission';
  const ctaLabel = isMission ? 'Run this Mission in Let’s Play →' : 'Practice this Drill in Let’s Play →';
  const videos: { id?: string; url: string; label: string | null }[] = item.videos || [];

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

      {videos.length > 0 && <DrillMissionVideos videos={videos} title={item.title} />}

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
        className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-[var(--tss-navy)] text-white text-sm font-semibold text-center hover:opacity-90"
      >
        <PlayCircle size={16} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
        {ctaLabel}
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
  const gd = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  const gdOpen = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (gdOpen) return `https://drive.google.com/file/d/${gdOpen[1]}/preview`;
  return url; // Assume already embed
}
