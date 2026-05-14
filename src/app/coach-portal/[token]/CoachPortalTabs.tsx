'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants/brand';
import type { CoachPortalData } from '@/lib/actions/coach-portal';

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
        {activeTab === 'courses' && <CoursesTab courses={data.coachCourses} coach={coach} />}
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

function CoursesTab({ courses, coach }: { courses: any[]; coach: any }) {
  return (
    <div className="space-y-3 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">🎓 Coach Courses</p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">
          Your certification path
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Lessons available to your level: <strong>{coach.max_belt_permission?.replace(/_/g, ' ')}</strong>
          {coach.certification_level ? ` · ${coach.certification_level}` : ''}.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm text-gray-500">No coach courses published yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Marcelo will publish coach-level content soon. Stay tuned.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-[10px] font-mono text-gray-400">{c.id} · {c.course_section}</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{c.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
