'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants/brand';
import type { CoachPortalData, CoachLessonDetail } from '@/lib/actions/coach-portal';
import { getCoachLessonDetail, markCoachLessonRead, submitCoachQuiz } from '@/lib/actions/coach-portal';
import { getServicePlan, type ServicePlanData } from '@/lib/actions/service-planner';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { SessionPlanner } from '@/components/coach-portal/SessionPlanner';
import { StpPillarReader } from '@/components/coach-portal/StpPillarReader';
import {
  Home,
  BookOpen,
  Wrench,
  ClipboardList,
  Star,
  Trophy,
  BarChart2,
  Clock,
  RotateCcw,
  CheckCircle2,
  Waves,
  Dumbbell,
  Check,
  ChevronDown,
  ArrowRight,
  Lock,
} from 'lucide-react';

type TabIconComponent = typeof Home;

type Tab = 'home' | 'courses' | 'tools' | 'plan' | 'rating';

const TABS: { key: Tab; label: string; Icon: TabIconComponent }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'courses', label: 'Courses', Icon: BookOpen },
  { key: 'tools', label: 'Tools', Icon: Wrench },
  { key: 'plan', label: 'Plan', Icon: ClipboardList },
  { key: 'rating', label: 'Rating', Icon: Star },
];

export function CoachPortalTabs({
  data,
  initialTab,
}: {
  data: CoachPortalData;
  initialTab?: Tab;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'home');
  const { coach, stats } = data;

  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'home' && <HomeTab coach={coach} stats={stats} upcoming={data.upcomingServices} />}
        {activeTab === 'courses' && (
          <CoursesTab
            courses={data.coachCourses}
            progress={data.courseProgress}
            coach={coach}
            token={coach.portal_token}
          />
        )}
        {activeTab === 'tools' && <ToolsTab drills={data.availableDrills} coach={coach} />}
        {activeTab === 'plan' && (
          <PlanTab
            upcoming={data.upcomingServices}
            past={data.pastServices}
            token={coach.portal_token}
          />
        )}
        {activeTab === 'rating' && <RatingTab stats={stats} />}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[var(--tss-navy)]' : 'text-gray-400'
                }`}
              >
                <tab.Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={`mb-0.5 transition-colors ${isActive ? 'text-[var(--tss-cyan,#5AC3E7)]' : 'text-gray-400'}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center py-4 pb-24">
        <p className="text-[10px] text-gray-300">The Surf Sequence -- {BRAND.tagline}</p>
      </div>
    </>
  );
}

// ───────────────────────────────────────

function HomeTab({
  coach,
  stats,
  upcoming,
}: {
  coach: any;
  stats: any;
  upcoming: any[];
}) {
  const initials = `${coach.first_name?.[0] || ''}${coach.last_name?.[0] || ''}`.toUpperCase();
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ background: BRAND.colors.navy }}
          >
            {initials || <Waves size={18} strokeWidth={1.75} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--tss-navy)] text-base truncate">{coach.display_name}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                {coach.role.replace(/_/g, ' ')}
              </span>
              {coach.certification_level && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  {coach.certification_level}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                Up to {coach.max_belt_permission?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Services run" value={stats.totalServicesAsHead.toString()} />
        <Stat label="Upcoming" value={stats.upcomingServicesCount.toString()} />
        <Stat label="Students worked with" value={stats.studentsWorkedWith.toString()} />
        <Stat
          label="Avg rating"
          value={stats.avgRating !== null ? `${stats.avgRating}/5` : '—'}
          sublabel={stats.ratingsCount > 0 ? `${stats.ratingsCount} survey${stats.ratingsCount > 1 ? 's' : ''}` : 'no surveys yet'}
        />
      </div>

      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1.5">
            Your next classes
          </p>
          <div className="space-y-1.5">
            {upcoming.slice(0, 3).map((s: any) => {
              const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3">
                  <p className="text-[10px] font-mono text-gray-400">
                    {tpl?.service_kind?.replace(/_/g, ' ') || ''} · {s.status}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{s.camp_name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(s.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesTab({
  courses,
  progress,
  coach,
  token,
}: {
  courses: any[];
  progress: Record<string, { completed: boolean; completed_at: string | null }>;
  coach: any;
  token: string;
}) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CoachLessonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [readState, setReadState] = useState(progress);

  // Determine which lessons are gated. A lesson is locked when its
  // prerequisites array contains an ID that isn't completed yet.
  const completedSet = new Set(
    Object.entries(readState)
      .filter(([, v]) => v.completed)
      .map(([k]) => k)
  );

  const openLesson = async (lessonId: string) => {
    setOpenLessonId(lessonId);
    setLoading(true);
    setDetail(null);
    try {
      const d = await getCoachLessonDetail(token, lessonId);
      setDetail(d);
    } catch (e) {
      setDetail(null);
    }
    setLoading(false);
  };

  const closeLesson = () => {
    setOpenLessonId(null);
    setDetail(null);
  };

  const markRead = () => {
    if (!openLessonId) return;
    startTransition(async () => {
      try {
        await markCoachLessonRead(token, openLessonId);
        setReadState((prev) => ({
          ...prev,
          [openLessonId]: { completed: true, completed_at: new Date().toISOString() },
        }));
        // Also reflect in local detail state
        setDetail((d) =>
          d
            ? {
                ...d,
                progress: {
                  completed: true,
                  completed_at: new Date().toISOString(),
                  quiz_score: d.progress?.quiz_score ?? null,
                  quiz_attempts: d.progress?.quiz_attempts ?? 0,
                },
              }
            : d
        );
      } catch (e: any) {
        alert(e.message || 'Failed to mark as read');
      }
    });
  };

  // ── Reader view ─────────────────────────────────────────────
  if (openLessonId) {
    const isCompleted = !!detail?.progress?.completed;

    return (
      <div className="space-y-3 pb-4">
        <button
          type="button"
          onClick={closeLesson}
          className="text-[12px] text-[var(--tss-navy)] hover:underline"
        >
          ← Back to courses
        </button>

        {loading && (
          <div className="text-center py-16">
            <BookOpen size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan,#5AC3E7)]" />
            <p className="text-gray-500 text-sm">Loading lesson…</p>
          </div>
        )}

        {!loading && detail && (
          <>
            <div className="bg-gradient-to-br from-[var(--tss-navy)] to-[#0a1628] text-white rounded-xl px-5 py-5">
              <p className="text-[10px] font-mono text-white/50 mb-1 uppercase tracking-wider">
                {detail.lesson.id} · ~{detail.lesson.estimated_minutes ?? '?'} min
              </p>
              <h2 className="text-xl font-bold leading-tight">
                {detail.lesson.title}
              </h2>
              {detail.lesson.subtitle && (
                <p className="text-sm text-white/70 italic mt-1.5">{detail.lesson.subtitle}</p>
              )}
            </div>

            {/* Videos (if any have been attached via /content admin) */}
            {detail.videos.length > 0 && (
              <div className="space-y-2">
                {detail.videos.map((v) => (
                  <div key={v.id} className="bg-black rounded-xl overflow-hidden aspect-video">
                    <iframe
                      src={embedUrlFor(v.provider, v.url)}
                      title={v.title || 'Coach video'}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Body — STP lessons get pillar tabs, others plain markdown */}
            {detail.lesson.coach_what_md ? (
              <StpPillarReader detail={detail} />
            ) : detail.lesson.description_md ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-6">
                <MarkdownContent markdown={detail.lesson.description_md} />
              </div>
            ) : detail.lesson.lesson_type === 'test' ? null : (
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-6 text-sm text-gray-500 italic">
                No content for this lesson yet.
              </div>
            )}

            {/* Quiz (when lesson_type === 'test' with questions attached) */}
            {/* Padding wrapper for markdown content */}
            {detail.lesson.lesson_type === 'test' && detail.quizzes.length > 0 ? (
              <CoachQuizSection
                token={token}
                lessonId={openLessonId}
                quizzes={detail.quizzes}
                existingScore={detail.progress?.quiz_score ?? null}
                existingAttempts={detail.progress?.quiz_attempts ?? 0}
                onPassed={() => {
                  setReadState((p) => ({
                    ...p,
                    [openLessonId]: { completed: true, completed_at: new Date().toISOString() },
                  }));
                  setDetail((d) =>
                    d ? { ...d, progress: { ...(d.progress ?? { quiz_score: null, quiz_attempts: 0 }), completed: true, completed_at: new Date().toISOString() } } : d
                  );
                }}
              />
            ) : (
              /* Mark as read (for reading-type lessons) */
              <button
                type="button"
                onClick={markRead}
                disabled={pending || isCompleted}
                className={`w-full py-3 text-sm font-semibold rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'text-white hover:brightness-110'
                }`}
                style={isCompleted ? {} : { background: BRAND.colors.navy }}
              >
                {isCompleted ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Check size={15} strokeWidth={1.75} />
                    Completed
                  </span>
                ) : pending ? 'Saving…' : 'Mark as read'}
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  // ── List view (grouped into the 5 tiers) ──────────────────
  const completedCount = courses.filter((c) => completedSet.has(c.id)).length;

  // The restructured coach_wb course groups by ID prefix into 5 tiers.
  const byPrefix = (prefix: string) => courses.filter((c) => c.id.startsWith(prefix));
  const tierFoundations = byPrefix('COACH-FOUND-');
  const tierPreOnboard = courses.filter(
    (c) => c.id === 'COACH-PC-VERIFY' || c.id === 'COACH-OB-DELIVERY'
  );
  const tierStps = byPrefix('COACH-STP-');
  const tierDiagnostics = byPrefix('COACH-DIAG-');
  const tierCareer = byPrefix('COACH-CAREER-');
  const exitTest = courses.filter((c) => c.id === 'COACH-WB-EXIT-TEST');
  const master = courses.filter((c) => c.course_section === 'coach_wb_master');

  const renderCard = (c: any) => {
    const isCompleted = completedSet.has(c.id);
    const prereqs: string[] = c.prerequisites ?? [];
    const lockedBy = prereqs.find((id) => !completedSet.has(id));
    const isLocked = !!lockedBy;
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => !isLocked && openLesson(c.id)}
        disabled={isLocked}
        className={`w-full text-left bg-white rounded-xl border p-3 transition-all ${
          isLocked
            ? 'border-gray-100 opacity-60 cursor-not-allowed'
            : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono text-gray-400">
              {c.id} · ~{c.estimated_minutes ?? '?'} min
              {isCompleted && ' · ✓ done'}
              {isLocked && ` · locked — finish ${lockedBy} first`}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{c.title}</p>
          </div>
          {!isLocked && <span className="text-gray-400 shrink-0 text-sm">›</span>}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">
          Coach Courses
        </p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">Your certification path</h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          {coach.max_belt_permission?.replace(/_/g, ' ')}
          {coach.certification_level ? ` · ${coach.certification_level}` : ''}.
        </p>
        {courses.length > 0 && (
          <div className="mt-3">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(completedCount / courses.length) * 100}%`,
                  background: BRAND.colors.cyan,
                }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 font-mono">
              {completedCount} / {courses.length} completed
            </p>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <BookOpen size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No coach courses published yet.</p>
        </div>
      ) : (
        <>
          <TierGroup
            label="Tier 1 — Foundations"
            sub="The TSS method, architecture, and coaching framework."
            items={tierFoundations}
            render={renderCard}
          />
          <TierGroup
            label="Tier 2 — Pre-Course + Onboarding"
            sub="The gate before water + the 6 onboarding items."
            items={tierPreOnboard}
            render={renderCard}
          />
          <TierGroup
            label="Tier 3 — The 25 Steps"
            sub="One lesson per STP. Tabs: What · Deliver · Errors · Validate · Drill · Mission."
            items={tierStps}
            render={renderCard}
          />
          <TierGroup
            label="Tier 4 — Diagnostics + Evaluation"
            sub="Error taxonomy + the Exit Test evaluation protocol."
            items={tierDiagnostics}
            render={renderCard}
          />
          <TierGroup
            label="Exit Test — Component 1"
            sub="50-question theoretical exam. 80% to pass."
            items={exitTest}
            render={renderCard}
          />
          <TierGroup
            label="Tier 5 — Career"
            sub="The 5-level coach certification ladder + code of conduct."
            items={tierCareer}
            render={renderCard}
          />
          <TierGroup
            label="Master Manual — Canon Reference"
            sub="Single source of truth. 15 reference lessons (no prerequisites)."
            items={master}
            render={renderCard}
          />
        </>
      )}
    </div>
  );
}

function TierGroup({
  label,
  sub,
  items,
  render,
}: {
  label: string;
  sub: string;
  items: any[];
  render: (c: any) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1 px-1">
        {label} ({items.length})
      </p>
      <p className="text-[11px] text-gray-400 mb-2 px-1">{sub}</p>
      <div className="space-y-1.5">{items.map(render)}</div>
    </div>
  );
}

// Convert a YouTube/Vimeo watch URL to an embed URL.
function embedUrlFor(provider: string, url: string): string {
  if (provider === 'youtube') {
    // Accept full URL, short youtu.be, or already-embed
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  }
  if (provider === 'vimeo') {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : url;
  }
  return url;
}

// ─── Quiz section for test-type coach lessons ───────────────────
//
// Renders all questions, lets the coach pick answers, submits to server,
// shows per-question correctness + final score with pass/fail banner.
// Pass threshold: 80%. Retake = clears local state, server keeps best score.

interface CoachQuizSectionProps {
  token: string;
  lessonId: string;
  quizzes: { id: string; question: string; options: { text: string; correct: boolean }[]; display_order: number }[];
  existingScore: number | null;
  existingAttempts: number;
  onPassed: () => void;
}

function CoachQuizSection({
  token,
  lessonId,
  quizzes,
  existingScore,
  existingAttempts,
  onPassed,
}: CoachQuizSectionProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correctById: Record<string, { correctIdx: number; gotIt: boolean }>;
  } | null>(null);

  const allAnswered = quizzes.every((q) => answers[q.id] !== undefined);

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await submitCoachQuiz(token, lessonId, answers);
      setResult({ score: r.score, passed: r.passed, correctById: r.correctById });
      if (r.passed) onPassed();
    } catch (e: any) {
      alert(e.message || 'Failed to submit quiz');
    }
    setSubmitting(false);
  };

  const retake = () => {
    setAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Result view ──
  if (result) {
    return (
      <div className="space-y-3">
        <div
          className={`rounded-2xl p-5 text-center ${
            result.passed
              ? 'bg-emerald-50 border-2 border-emerald-300'
              : 'bg-amber-50 border-2 border-amber-300'
          }`}
        >
          {result.passed
            ? <Trophy size={36} strokeWidth={1.75} className="mx-auto mb-1 text-emerald-700" />
            : <BookOpen size={36} strokeWidth={1.75} className="mx-auto mb-1 text-amber-700" />
          }
          <p className="text-2xl font-bold" style={{ color: result.passed ? '#047857' : '#92400E' }}>
            {result.score}%
          </p>
          <p
            className="text-sm font-semibold mt-1"
            style={{ color: result.passed ? '#047857' : '#92400E' }}
          >
            {result.passed ? 'Passed — 80%+ required' : 'Not yet — 80%+ required to pass'}
          </p>
          <p className="text-[11px] text-gray-500 mt-2">
            Attempt #{existingAttempts + 1}
            {existingScore !== null && ` · Best score so far: ${Math.max(existingScore, result.score)}%`}
          </p>
        </div>

        {/* Per-question review */}
        <div className="space-y-2">
          {quizzes.map((q, idx) => {
            const r = result.correctById[q.id];
            const chosen = answers[q.id];
            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-3 ${
                  r?.gotIt ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                <p className="text-[10px] font-mono text-gray-400 mb-1">
                  Q{idx + 1} {r?.gotIt ? '· ✓' : '· ✗'}
                </p>
                <p className="text-sm text-gray-800">{q.question}</p>
                <div className="mt-2 space-y-1">
                  {q.options.map((o, oIdx) => {
                    const isChosen = chosen === oIdx;
                    const isCorrect = oIdx === r?.correctIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`text-[11px] px-2 py-1 rounded ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-900'
                            : isChosen
                            ? 'bg-red-50 text-red-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {isCorrect && '✓ '}
                        {!isCorrect && isChosen && '✗ '}
                        {o.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {!result.passed && (
          <button
            type="button"
            onClick={retake}
            className="w-full py-3 text-white text-sm font-semibold rounded-xl"
            style={{ background: BRAND.colors.navy }}
          >
            Retake the test
          </button>
        )}
      </div>
    );
  }

  // ── Quiz form ──
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          {quizzes.length} questions · 80% to pass
        </p>
        {existingAttempts > 0 && existingScore !== null && (
          <p className="text-[11px] text-gray-500 mt-1">
            Previous best: <strong>{existingScore}%</strong> ({existingAttempts} attempt{existingAttempts > 1 ? 's' : ''})
          </p>
        )}
      </div>

      <div className="space-y-3">
        {quizzes.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-3">
            <p className="text-[10px] font-mono text-gray-400 mb-1">Q{idx + 1}</p>
            <p className="text-sm text-gray-800 leading-relaxed">{q.question}</p>
            <div className="mt-3 space-y-1.5">
              {q.options.map((o, oIdx) => {
                const chosen = answers[q.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oIdx }))}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-[12px] transition-colors ${
                      chosen
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {o.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!allAnswered || submitting}
        className="w-full py-3 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
        style={{ background: BRAND.colors.navy }}
      >
        {submitting
          ? 'Scoring…'
          : allAnswered
          ? 'Submit answers'
          : `Answer all ${quizzes.length} questions first (${Object.keys(answers).length} / ${quizzes.length})`}
      </button>
    </div>
  );
}

function ToolsTab({ drills, coach }: { drills: any[]; coach: any }) {
  const drillItems = drills.filter((d) => d.type === 'drill');
  const missionItems = drills.filter((d) => d.type === 'mission');

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Your Tools</p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">
          Drills + missions you can teach
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Filtered by your certification (<strong>up to {coach.max_belt_permission?.replace(/_/g, ' ')}</strong>).
          {' '}{drillItems.length} drills, {missionItems.length} missions available.
        </p>
      </div>

      {drillItems.length > 0 && (
        <ToolGroup label="Drills" items={drillItems} accent="amber" />
      )}
      {missionItems.length > 0 && (
        <ToolGroup label="Missions" items={missionItems} accent="blue" />
      )}

      {drills.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No drills available at your level yet.</p>
        </div>
      )}
    </div>
  );
}

function ToolGroup({ label, items, accent }: { label: string; items: any[]; accent: 'amber' | 'blue' }) {
  const bg = accent === 'amber' ? 'bg-amber-50/60 border-amber-100' : 'bg-blue-50/60 border-blue-100';
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 px-1">
        {label} ({items.length})
      </p>
      <div className="space-y-1.5">
        {items.map((d) => (
          <ToolCard key={d.id} d={d} bg={bg} />
        ))}
      </div>
    </div>
  );
}

// Expandable tool card — tap to reveal key words + timing detail.
function ToolCard({ d, bg }: { d: any; bg: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={`w-full text-left rounded-xl border ${bg} p-3 transition-all hover:shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-gray-400">
            {d.id} · {d.step_id} · {d.belt} {d.block_name ? `· ${d.block_name}` : ''}
          </p>
          <p className="text-sm font-medium text-gray-800 mt-0.5">{d.title}</p>
          {!open && d.key_words && d.key_words.length > 0 && (
            <p className="text-[11px] text-gray-500 italic mt-1 truncate">
              {d.key_words.join(' · ')}
            </p>
          )}
        </div>
        <span className={`text-gray-400 shrink-0 text-xs transition ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </div>

      {open && (
        <div className="mt-2 pt-2 border-t border-gray-200/70 space-y-2">
          <div className="flex flex-wrap gap-3">
            {d.time_estimate && (
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <Clock size={11} strokeWidth={1.75} /> {d.time_estimate}
              </p>
            )}
            {d.reps_recommended && (
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <RotateCcw size={11} strokeWidth={1.75} /> {d.reps_recommended}
              </p>
            )}
          </div>
          {d.description_md && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                How it works
              </p>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {d.description_md}
              </p>
            </div>
          )}
          {d.success_criteria && d.success_criteria.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Success criteria
              </p>
              <ul className="space-y-0.5">
                {d.success_criteria.map((c: string, i: number) => (
                  <li key={i} className="text-[13px] text-gray-700 flex gap-1.5">
                    <CheckCircle2 size={13} strokeWidth={1.75} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {d.key_words && d.key_words.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Key words
              </p>
              <div className="flex flex-wrap gap-1">
                {d.key_words.map((k: string, i: number) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-[10px] text-gray-400 italic">
            {d.type === 'mission'
              ? 'Use this as an in-water mission when planning a session.'
              : 'Use this as a dry-land drill when planning a session.'}
          </p>
        </div>
      )}
    </button>
  );
}

// ─── New "Plan" tab (replaces the old "Services" tab) ───────────────
// Lists upcoming + past services. Click → open the planner inline.

function PlanTab({
  upcoming,
  past,
  token,
}: {
  upcoming: any[];
  past: any[];
  token: string;
}) {
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [planData, setPlanData] = useState<ServicePlanData | null>(null);
  const [loading, setLoading] = useState(false);

  const openPlanner = async (campId: string, dayNumber?: number) => {
    setSelectedCampId(campId);
    setLoading(true);
    setPlanData(null);
    try {
      const d = await getServicePlan(token, campId, dayNumber);
      setPlanData(d);
    } catch (e) {
      setPlanData(null);
    }
    setLoading(false);
  };

  const close = () => {
    setSelectedCampId(null);
    setPlanData(null);
  };

  // M45 — reload the planner for a different day without leaving the screen.
  const switchDay = async (dayNumber: number) => {
    if (!selectedCampId) return;
    setLoading(true);
    try {
      const d = await getServicePlan(token, selectedCampId, dayNumber);
      setPlanData(d);
    } catch {
      /* keep prior data */
    }
    setLoading(false);
  };

  if (selectedCampId) {
    if (loading) {
      return (
        <div className="text-center py-16">
          <ClipboardList size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan,#5AC3E7)]" />
          <p className="text-gray-500 text-sm">Loading planner…</p>
        </div>
      );
    }
    if (!planData) {
      return (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500">Couldn&apos;t load this service.</p>
          <button onClick={close} className="text-[12px] text-[var(--tss-navy)] hover:underline mt-2">
            ← Back
          </button>
        </div>
      );
    }
    return <SessionPlanner data={planData} token={token} onBack={close} onSwitchDay={switchDay} />;
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">
          Plan the Session
        </p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">
          Your assigned classes
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Tap a class to plan the venue read, warm-up, mental hack, and per-student
          drills + missions.
        </p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 mb-1.5">
            Upcoming + active ({upcoming.length})
          </p>
          <div className="space-y-1.5">
            {upcoming.map((s: any) => {
              const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => openPlanner(s.id)}
                  className="w-full text-left bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono text-emerald-700">
                        {tpl?.service_kind?.replace(/_/g, ' ') || s.status}
                        {' · '}
                        {s.participant_count ?? 0} student{s.participant_count === 1 ? '' : 's'}
                      </p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{s.camp_name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {new Date(s.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {s.start_date !== s.end_date && ` → ${new Date(s.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        {s.scheduled_time ? ` · ${s.scheduled_time}` : ''}
                      </p>
                    </div>
                    <span className="text-emerald-700 shrink-0 text-sm">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
            Past ({past.length})
          </p>
          <div className="space-y-1.5">
            {past.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => openPlanner(s.id)}
                className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-300 transition-colors"
              >
                <p className="text-sm font-medium text-gray-700">{s.camp_name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(s.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {s.start_date !== s.end_date && ` → ${new Date(s.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No services assigned yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">
            When the coordinator assigns you to a class, it&apos;ll show up here.
          </p>
        </div>
      )}
    </div>
  );
}

function ServicesTab({ upcoming, past }: { upcoming: any[]; past: any[] }) {
  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Services</p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">All services you&apos;ve led</h2>
      </div>

      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 mb-1.5">
            Upcoming + active ({upcoming.length})
          </p>
          <div className="space-y-1.5">
            {upcoming.map((s: any) => {
              const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
              return (
                <div key={s.id} className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                  <p className="text-[10px] font-mono text-emerald-700">
                    {tpl?.service_kind?.replace(/_/g, ' ') || s.status}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{s.camp_name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(s.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {s.start_date !== s.end_date && ` → ${new Date(s.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
            Past ({past.length})
          </p>
          <div className="space-y-1.5">
            {past.map((s: any) => (
              <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-700">{s.camp_name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(s.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {s.start_date !== s.end_date && ` → ${new Date(s.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No services yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">When the coordinator assigns you, they appear here.</p>
        </div>
      )}
    </div>
  );
}

function RatingTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Your Rating</p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">From your students</h2>
      </div>

      {stats.ratingsCount > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <Star size={28} strokeWidth={1.75} className="mx-auto mb-2 text-[var(--tss-cyan,#5AC3E7)]" />
          <p className="text-5xl font-bold text-[var(--tss-navy)]">{stats.avgRating}</p>
          <p className="text-xs text-gray-500 mt-1">out of 5 · across {stats.ratingsCount} surveys</p>
          <p className="text-[11px] text-gray-400 italic mt-3">
            Reputation builds from honest feedback. Keep closing sessions and asking your students for the survey.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <BarChart2 size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No ratings yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Close sessions and have students fill the post-session survey to start building your rating.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
      <p className="text-lg font-bold text-[var(--tss-navy)]">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
      {sublabel && <p className="text-[9px] text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}
