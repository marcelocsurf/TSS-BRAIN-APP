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
import { LessonFigure } from './LessonFigure';
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
  portalToken: string;
  onBack: () => void;
  // Lets a lesson jump to another lesson (e.g. a sequence step pointing to
  // its canonical Pre-Course version). Optional — falls back to no banner.
  onOpenLesson?: (id: string) => void;
}

// A few sequence steps share their content with a canonical Pre-Course
// lesson (single source of truth). When the student opens the sequence
// version, we surface a banner that jumps to the shared Pre-Course lesson.
const SEQUENCE_TO_INTRO: Record<string, { id: string; label: string }> = {
  'STP-001': { id: 'ONB-06', label: 'Venue Analysis' },
  'STP-002': { id: 'PC-WARMUP', label: 'Warm Up' },
};

type Section = 'video' | 'theory' | 'drill' | 'mission' | 'errors' | 'quiz' | 'form';

export function LessonViewer({ lessonId, portalToken, onBack, onOpenLesson }: LessonViewerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getLessonDetail(lessonId, portalToken)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      // Si la lectura falla, se muestra el aviso — no se queda girando.
      .catch(() => {
        if (mounted) {
          setData(null);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [lessonId, portalToken]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <BookOpen
          size={36}
          strokeWidth={1.75}
          className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan,#00D2FF)]"
        />
        <p className="text-[#55666E] text-sm">Loading lesson...</p>
      </div>
    );
  }

  // Sin lección (o sin permiso para leerla): se avisa, no se rompe.
  if (!data || !data.lesson) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-[#55666E] text-sm">This lesson is not available.</p>
        <button type="button" onClick={onBack} className="text-xs font-semibold text-[var(--tss-cyan,#00D2FF)]">
          ← Back to the course
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
          className="text-[12px] uppercase tracking-wider flex items-center gap-1" style={{ fontFamily: 'var(--font-plex)', color: 'rgba(247,249,250,.75)' }}
        >
          ← Back to course
        </button>

        <div className="bg-[#E9E2D2] border border-[#DCD7C6] rounded-lg p-6">
          <div className="flex items-start gap-3 mb-3">
            <Hourglass size={28} strokeWidth={1.75} className="text-[#55666E] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-[#55666E] font-bold mb-1">
                {lesson.pc_section_name || 'Coming soon'}
                {lesson.is_test && ' · Gate Test'}
              </div>
              <h1 className="text-xl font-bold text-[#10263B]">{lesson.title}</h1>
              {lesson.pc_section_name && (
                <p className="text-sm text-[#55666E] mt-1">{lesson.pc_section_name}</p>
              )}
            </div>
          </div>

          <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-lg p-4 mt-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#55666E] font-bold mb-2">
              <ClipboardList size={14} strokeWidth={1.75} />
              Status
            </div>
            <p className="text-sm text-[#10263B] font-semibold mb-2">
              Coming in v1.5
            </p>
            <p className="text-xs text-[#10263B] leading-relaxed">
              Marcelo will release the full canonical content
              {lesson.is_test
                ? ' — including test specifications, evaluation rubric, accepted formats, and retake policy —'
                : ' — including description, key concepts, coach cue, common errors, drill, and success indicators —'}
              {' '}as part of the next update. The Surf Sequence canon prioritizes precision over speed: pedagogical content is only published once it is doctrinally complete.
            </p>
          </div>

          <button
            onClick={onBack}
            className="mt-4 w-full py-3 rounded-[5px] bg-[var(--tss-navy)] text-white text-sm font-bold"
          >
            ← Back to {lesson.pc_section_name || 'course'}
          </button>
        </div>
      </div>
    );
  }

  const refreshProgress = async () => {
    const fresh = await getLessonDetail(lessonId, portalToken);
    setData(fresh);
  };

  const isFormOrTest = lesson.lesson_type === 'form' || lesson.lesson_type === 'test';
  // v10.1 documento: tarjeta sand sobre papel, radio 8 px (Marcelo 2026-09-17).
  const cardCls = 'rounded-lg border border-[#DCD7C6] bg-[#E9E2D2] px-5 py-6';

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-[12px] uppercase tracking-wider flex items-center gap-1 mb-3" style={{ fontFamily: 'var(--font-plex)', color: 'rgba(247,249,250,.75)' }}
        >
          ← Back to course
        </button>
        <div className="text-white rounded-lg p-5" style={{ background: '#061C2B', border: '1px solid rgba(0,210,255,.25)' }}>
          {/* El código interno de la lección (VAL-001, PC-PRE-07…) no se le
              muestra al alumno: no significa nada para él. Los coaches sí lo
              ven, en su propio portal. */}
          {lesson.pc_section_name && (
            <div className="text-[11px] uppercase tracking-[0.18em] mb-1.5" style={{ fontFamily: 'var(--font-plex)', color: '#00D2FF' }}>{lesson.pc_section_name}</div>
          )}
          <h1 className="text-[24px] font-black uppercase leading-tight" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900 }}>{lesson.title}</h1>
          {lesson.subtitle && (
            <p className="text-[14px] mt-1.5" style={{ color: 'rgba(247,249,250,.8)' }}>{lesson.subtitle}</p>
          )}
          {lesson.pillar && (
            <p className="text-xs text-[var(--tss-cyan,#00D2FF)] mt-2">
              Pillar: {lesson.pillar}
            </p>
          )}
          {progress?.completed && (
            <div className="flex items-center gap-3 mt-3 text-[11px] text-white/70">
              <span className="flex items-center gap-1 text-[#39D98A]">
                <CheckCircle2 size={13} strokeWidth={1.75} />
                Completed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sequence step → shared Pre-Course lesson (single source of truth) */}
      {onOpenLesson && SEQUENCE_TO_INTRO[lesson.id] && (
        <button
          onClick={() => onOpenLesson(SEQUENCE_TO_INTRO[lesson.id].id)}
          className="w-full flex items-center gap-3 rounded-lg border border-[#DCD7C6] bg-[#E9E2D2] px-4 py-3 text-left"
        >
          <BookOpen size={18} strokeWidth={1.75} className="flex-shrink-0 text-[var(--tss-navy)]" />
          <span className="flex-1 text-sm text-[var(--tss-navy)]">
            This is the same lesson as{' '}
            <span className="font-bold">{SEQUENCE_TO_INTRO[lesson.id].label}</span> in your Pre-Course.
            <span className="block text-xs text-[#55666E]">Open the full Pre-Course version →</span>
          </span>
        </button>
      )}

      {isFormOrTest ? (
        /* Form / exit-test lessons keep their interactive activity (and the
           exit test's quiz) — those ARE the gate, not a per-lesson quiz.
           Still show the lesson video on top when one is set. */
        <>
          {lessonVideos.length > 0 && (
            <div className={cardCls}>
              <DrillMissionVideos videos={lessonVideos} title={lesson.title} />
            </div>
          )}
          <div className={cardCls}>
            <FormSection
              lesson={lesson}
              portalToken={portalToken}
              existingResponse={progress?.form_response}
              isCompleted={progress?.completed}
              onComplete={refreshProgress}
            />
          </div>
          {lesson.lesson_type === 'test' && quizzes && quizzes.length > 0 && (
            <div className={cardCls}>
              <CourseQuiz
                lessonId={lesson.id}
                portalToken={portalToken}
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
        /* Reading lesson — mismo molde que la página de secuencia (Marcelo
           2026-09-17): WATCH (video) · THINK (teoría, temas plegables si es
           larga) · DO (Let's Play o el drill, solo si la lección lo tiene) ·
           REVIEW (errores comunes, plegado) · "Mark as done". Las lecciones
           puramente informativas del Pre-Course no muestran DO. */
        <>
          {lessonVideos.length > 0 && (
            <div className={cardCls}>
              <SectionLabel icon={PlayCircle} text="Watch" />
              <DrillMissionVideos videos={lessonVideos} title={lesson.title} />
            </div>
          )}
          {lesson.description_md && (
            <div className={cardCls}>
              <SectionLabel icon={BookOpen} text="Think" />
              {/* Lámina dibujada en código para esta lección (Paddling angle, wave stages). */}
              <LessonFigure lessonId={lesson.id} />
              <div className="prose prose-sm max-w-none"><MarkdownContent markdown={lesson.description_md} collapsible /></div>
            </div>
          )}
          {(canonicalDrill || canonicalMission) ? (
            /* Don't load the full drill/mission here — send them to Let's Play
               to actually practice it and follow the flow. */
            <div className={cardCls}>
              <SectionLabel icon={Dumbbell} text="Do" />
              <a
                href={`?tab=sequence&step=${(canonicalDrill || canonicalMission).step_id || lesson.id}`}
                className="flex items-center justify-center gap-2 w-full rounded-[5px] bg-[var(--tss-navy)] text-white py-4 text-sm font-bold hover:opacity-90"
              >
                <PlayCircle size={18} strokeWidth={1.75} className="text-[#00D2FF]" />
                Let&apos;s practice drills &amp; missions in Let&apos;s Play →
              </a>
            </div>
          ) : lesson.drill_md ? (
            <div className={cardCls}>
              <SectionLabel icon={Dumbbell} text="Do" />
              <div className="prose prose-sm max-w-none"><MarkdownContent markdown={lesson.drill_md} /></div>
            </div>
          ) : null}
          {lesson.errors_md && (
            <details className={`group ${cardCls}`}>
              <summary className="list-none cursor-pointer flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#55666E] font-mono"><AlertTriangle size={13} strokeWidth={1.75} className="text-[#00D2FF]" />Review</span>
                  <span className="block text-[18px] font-black uppercase leading-tight mt-1 text-[#10263B]" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>Common errors</span>
                </span>
                <span aria-hidden className="text-[#10263B] text-[20px] transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="prose prose-sm max-w-none mt-3"><MarkdownContent markdown={lesson.errors_md} /></div>
            </details>
          )}
          <MarkDoneButton portalToken={portalToken} lessonId={lesson.id} completed={!!progress?.completed} onDone={refreshProgress} />
        </>
      )}
    </div>
  );
}

// ─── Unified-view helpers ───

function SectionLabel({ icon: Icon, text }: { icon: IconType; text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#55666E] mb-2" style={{ fontFamily: 'var(--font-plex)' }}>
      <Icon size={13} strokeWidth={1.75} className="text-[var(--tss-cyan,#00D2FF)]" />
      {text}
    </p>
  );
}

function MarkDoneButton({
  portalToken, lessonId, completed, onDone,
}: {
  portalToken: string; lessonId: string; completed: boolean; onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const handle = async () => {
    setSaving(true);
    await markLessonComplete(portalToken, lessonId);
    await onDone();
    setSaving(false);
  };
  return (
    <button
      onClick={handle}
      disabled={completed || saving}
      className={`w-full py-3.5 rounded-[5px] text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 ${
        completed ? 'bg-[#DCEFE3] text-[#1B5E3A] cursor-default' : 'bg-[var(--tss-navy)] text-white hover:opacity-90'
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
  portalToken,
  onWatched,
}: {
  lesson: any;
  videos: { id?: string; url: string; label: string | null }[];
  progress: any;
  portalToken: string;
  onWatched: () => void;
}) {
  const [marking, setMarking] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleMarkWatched = async () => {
    setMarking(true);
    await markVideoWatched(portalToken, lesson.id);
    await onWatched();
    setMarking(false);
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Video size={48} strokeWidth={1.75} className="mx-auto mb-3 text-[#B8C7D1]" />
        <h3 className="font-bold text-base mb-2">Video Coming Soon</h3>
        <p className="text-sm text-[#55666E] max-w-sm mx-auto">
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
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] whitespace-nowrap transition-colors ${
                activeIdx === i
                  ? 'bg-[var(--tss-navy)] text-white'
                  : 'bg-[#F7F9FA] text-[#55666E] border border-[#DCD7C6]'
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
        <p className="flex items-center gap-1 text-[11px] text-[#55666E] italic mb-3">
          <Play size={11} strokeWidth={1.75} />
          {current.label}
        </p>
      )}

      <button
        onClick={handleMarkWatched}
        disabled={progress?.video_watched || marking}
        className={`w-full py-2.5 rounded-[5px] text-sm font-bold transition-colors ${
          progress?.video_watched
            ? 'bg-[#DCEFE3] text-[#1B5E3A] cursor-default'
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
  portalToken,
  lessonId,
  alreadyRead,
  onRead,
  hideMarkRead,
}: {
  content: string | null;
  portalToken: string;
  lessonId: string;
  alreadyRead: boolean;
  onRead: () => void;
  hideMarkRead?: boolean;
}) {
  const [marking, setMarking] = useState(false);

  const handleMarkRead = async () => {
    setMarking(true);
    await markContentRead(portalToken, lessonId);
    await onRead();
    setMarking(false);
  };

  if (!content) {
    return (
      <div className="text-center py-8 text-sm text-[#55666E]">
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
        <div className="mt-6 pt-4 border-t border-[#DCD7C6]">
          <button
            onClick={handleMarkRead}
            disabled={alreadyRead || marking}
            className={`w-full py-2.5 rounded-[5px] text-sm font-bold transition-colors ${
              alreadyRead
                ? 'bg-[#DCEFE3] text-[#1B5E3A] cursor-default'
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
  portalToken,
  existingResponse,
  isCompleted,
  onComplete,
}: {
  lesson: any;
  portalToken: string;
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
        portalToken={portalToken}
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
        portalToken={portalToken}
        existingStance={existingResponse?.stance}
        isCompleted={isCompleted}
        onComplete={onComplete}
      />
    );
  }

  // Default: just show content
  return <ContentSection content={lesson.description_md} portalToken={portalToken} lessonId={lesson.id} alreadyRead={isCompleted} onRead={onComplete} />;
}

function SetGoalForm({
  lesson,
  portalToken,
  existingGoal,
  isCompleted,
  onComplete,
}: {
  lesson: any;
  portalToken: string;
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
    await saveLessonForm(portalToken, lesson.id, { goal });
    await onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <MarkdownContent markdown={lesson.description_md} />
      </div>

      <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-lg p-4">
        <h4 className="font-bold text-sm mb-2">Your Goal</h4>
        <p className="text-xs text-[#55666E] mb-3">
          Write your personal goal as clearly as possible. Be specific. This will be visible to your coach.
        </p>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={5}
          placeholder="In 6 months I want to..."
          className="w-full px-3 py-2 border border-[#DCD7C6] bg-[#F7F9FA] rounded-[5px] text-sm text-[#10263B]"
          disabled={isCompleted}
        />
        <div className="text-[10px] text-[#55666E] mt-1">{goal.length} / 500 characters</div>

        <button
          onClick={handleSave}
          disabled={saving || isCompleted || goal.length < 20}
          className={`mt-3 w-full py-2.5 rounded-[5px] text-sm font-bold transition-colors ${
            isCompleted
              ? 'bg-[#DCEFE3] text-[#1B5E3A] cursor-default'
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
  portalToken,
  existingStance,
  isCompleted,
  onComplete,
}: {
  lesson: any;
  portalToken: string;
  existingStance?: string;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [stance, setStance] = useState<string>(existingStance || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!stance) return;
    setSaving(true);
    await saveLessonForm(portalToken, lesson.id, { stance });
    await onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <MarkdownContent markdown={lesson.description_md} />
      </div>

      <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-lg p-4">
        <h4 className="font-bold text-sm mb-3">Which foot leads?</h4>
        <p className="text-xs text-[#55666E] mb-4">
          After doing the physical test described above, select your stance:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setStance('regular')}
            disabled={isCompleted}
            className={`p-4 rounded-[5px] border-2 transition-all ${
              stance === 'regular'
                ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                : 'border-[#DCD7C6] bg-[#F7F9FA]'
            }`}
          >
            <Footprints size={24} strokeWidth={1.75} className="mx-auto mb-1" />
            <div className="font-bold text-sm">Regular</div>
            <div className="text-[10px] mt-1 opacity-80">Left foot forward</div>
          </button>

          <button
            onClick={() => setStance('goofy')}
            disabled={isCompleted}
            className={`p-4 rounded-[5px] border-2 transition-all ${
              stance === 'goofy'
                ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                : 'border-[#DCD7C6] bg-[#F7F9FA]'
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
          className={`mt-4 w-full py-2.5 rounded-[5px] text-sm font-bold transition-colors ${
            isCompleted
              ? 'bg-[#DCEFE3] text-[#1B5E3A] cursor-default'
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
              className={`px-3 py-1 text-[11px] font-bold rounded-[5px] whitespace-nowrap ${
                activeIdx === i
                  ? 'bg-[var(--tss-navy)] text-white'
                  : 'bg-[#F7F9FA] text-[#55666E] border border-[#DCD7C6]'
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
        <p className="flex items-center gap-1 text-[11px] text-[#55666E] italic mt-1.5">
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
        <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-[#55666E]">
          {item.id}
          {item.time_estimate ? ` · ${item.time_estimate}` : ''}
          {item.reps_recommended ? ` · ${item.reps_recommended}` : ''}
        </p>
        <h3 className="text-[18px] font-black uppercase text-[var(--tss-navy)] mt-1 leading-tight" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900 }}>
          {item.title}
        </h3>
      </div>

      {videos.length > 0 && <DrillMissionVideos videos={videos} title={item.title} />}

      {item.key_words && item.key_words.length > 0 && (
        <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-[#55666E]">
            5 Key Words
          </p>
          <p className="text-sm font-bold text-[#10263B] mt-1 tracking-wide">
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
        <div className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-[#55666E]">
            How you know you got it
          </p>
          <ul className="text-xs text-[#10263B] mt-1 space-y-1">
            {item.success_criteria.map((c: string, i: number) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Los drills son ensayo: se hacen, no se registran (doctrina 2026-09-10). */}
      {isMission ? (
        <a
          href={`?tab=sequence&drill=${item.id}`}
          className="flex items-center justify-center gap-1.5 w-full py-3 rounded-[5px] bg-[var(--tss-navy)] text-white text-sm font-bold text-center hover:opacity-90"
        >
          <PlayCircle size={16} strokeWidth={1.75} className="text-[var(--tss-cyan,#00D2FF)]" />
          {ctaLabel}
        </a>
      ) : (
        <p className="text-[11px] text-[#55666E] leading-snug">Rehearsal: do it as many times as you need, on land or on the skate. No need to log it — what you log is the mission, in the water.</p>
      )}
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
