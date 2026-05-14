'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants/brand';
import type { CoachPortalData, CoachLessonDetail } from '@/lib/actions/coach-portal';
import { getCoachLessonDetail, markCoachLessonRead } from '@/lib/actions/coach-portal';
import { MarkdownContent } from '@/components/course/MarkdownContent';

type Tab = 'home' | 'courses' | 'tools' | 'services' | 'rating';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'courses', label: 'Courses', icon: '🎓' },
  { key: 'tools', label: 'Tools', icon: '🛠' },
  { key: 'services', label: 'Services', icon: '📋' },
  { key: 'rating', label: 'Rating', icon: '⭐' },
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
        {activeTab === 'services' && <ServicesTab upcoming={data.upcomingServices} past={data.pastServices} />}
        {activeTab === 'rating' && <RatingTab stats={stats} />}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
                activeTab === tab.key ? 'text-[var(--tss-navy)]' : 'text-gray-400'
              }`}
            >
              <span className="text-base mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
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
            {initials || '🏄'}
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
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
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
                progress: { completed: true, completed_at: new Date().toISOString() },
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
            <div className="animate-pulse text-4xl mb-2">📖</div>
            <p className="text-gray-500 text-sm">Loading lesson…</p>
          </div>
        )}

        {!loading && detail && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                {detail.lesson.id} · ~{detail.lesson.estimated_minutes ?? '?'} min
              </p>
              <h2 className="text-base font-bold text-[var(--tss-navy)] mt-0.5">
                {detail.lesson.title}
              </h2>
              {detail.lesson.subtitle && (
                <p className="text-[11px] text-gray-500 italic mt-1">{detail.lesson.subtitle}</p>
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

            {/* Body */}
            {detail.lesson.description_md ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <MarkdownContent markdown={detail.lesson.description_md} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-500 italic">
                No content for this lesson yet.
              </div>
            )}

            {/* Mark as read */}
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
              {isCompleted ? '✓ Completed' : pending ? 'Saving…' : 'Mark as read'}
            </button>
          </>
        )}
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────
  const completedCount = courses.filter((c) => completedSet.has(c.id)).length;
  return (
    <div className="space-y-3 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
          🎓 Coach Courses
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
                  background: BRAND.colors.gold,
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
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm text-gray-500">No coach courses published yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => {
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
                      {isLocked && ` · 🔒 finish ${lockedBy} first`}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{c.title}</p>
                  </div>
                  {!isLocked && (
                    <span className="text-gray-400 shrink-0 text-sm">›</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
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

function ToolsTab({ drills, coach }: { drills: any[]; coach: any }) {
  const drillItems = drills.filter((d) => d.type === 'drill');
  const missionItems = drills.filter((d) => d.type === 'mission');

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">🛠 Your Tools</p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">
          Drills + missions you can teach
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Filtered by your certification (<strong>up to {coach.max_belt_permission?.replace(/_/g, ' ')}</strong>).
          {' '}{drillItems.length} drills, {missionItems.length} missions available.
        </p>
      </div>

      {drillItems.length > 0 && (
        <ToolGroup label="🔧 Drills" items={drillItems} accent="amber" />
      )}
      {missionItems.length > 0 && (
        <ToolGroup label="🌊 Missions" items={missionItems} accent="blue" />
      )}

      {drills.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">🏄</p>
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
          <div key={d.id} className={`rounded-xl border ${bg} p-3`}>
            <p className="text-[10px] font-mono text-gray-400">
              {d.id} · {d.step_id} · {d.belt} {d.block_name ? `· ${d.block_name}` : ''}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{d.title}</p>
            {d.key_words && d.key_words.length > 0 && (
              <p className="text-[11px] text-gray-500 italic mt-1 truncate">{d.key_words.join(' · ')}</p>
            )}
            {d.time_estimate && (
              <p className="text-[10px] text-gray-400 mt-0.5">⏱ {d.time_estimate}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesTab({ upcoming, past }: { upcoming: any[]; past: any[] }) {
  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">📋 Services</p>
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
          <p className="text-3xl mb-2">🌊</p>
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
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">⭐ Your rating</p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">From your students</h2>
      </div>

      {stats.ratingsCount > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-5xl font-bold text-[var(--tss-navy)]">{stats.avgRating}</p>
          <p className="text-xs text-gray-500 mt-1">out of 5 · across {stats.ratingsCount} surveys</p>
          <p className="text-[11px] text-gray-400 italic mt-3">
            Reputation builds from honest feedback. Keep closing sessions and asking your students for the survey.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">📊</p>
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
