'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BRAND } from '@/lib/constants/brand';
import type { BeltLevel } from '@/lib/constants/belts';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { BELT_HIERARCHY, BELT_RANK } from '@/lib/constants/belts';
import { WARMUP_OPTIONS, MENTAL_HACK_OPTIONS, SELF_TRAINING_WARMUPS } from '@/lib/constants/brand';
import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORY_ICONS,
  STUDENT_MATERIALS,
  type BeltMaterial,
} from '@/lib/constants/student-materials';
import { SurveyForm } from './survey-form';
import {
  createSelfTrainingSession,
  completeSelfTrainingSession,
} from '@/lib/actions/portal';

// ─── Types ───

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
  drills: any[];
  pendingSurveys: any[];
  submittedSurveys: any[];
  materials: { unlocked: BeltMaterial[]; locked: BeltMaterial[] };
  token: string;
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

const TRAINING_TIPS: Record<string, string[]> = {
  white_belt: [
    'Eyes forward during pop-up — where you look, you go.',
    'Starfish every time — make safe dismounts a reflex.',
    'Find the sweet spot first — check your nose height before every paddle.',
    'One wave, one cue — pick a single focus for each wave.',
    'Commit to a direction BEFORE you catch the wave.',
    'Structure beats bravery — drill the steps until they are automatic.',
  ],
  yellow_belt: [
    'Chase the pocket — meet the wave at its power source.',
    'Angle your nose with the wave for an instant directional takeoff.',
    'Speed 3 then speed 4 — build your paddle progressively.',
    'Read the wave shape — peeling waves are your friend, avoid close-outs.',
    'Compress on landing — the impulse generates your first speed.',
    'Let the kinetic chain flow: eyes, shoulders, hips, board.',
  ],
  blue_belt: [
    'Hold through the bottom turn — patience at the base creates power.',
    'Project to your target — eyes reach the top of the wave before your board does.',
    'Complete the circle — every turn has an entry, apex, and exit.',
    'Rail engagement comes from foot pressure, not body lean.',
    'Speed is earned from the wave, not from fighting it.',
    'The Infinite Circle connects all your maneuvers into continuous flow.',
  ],
  purple_belt: [
    'Link three maneuvers into one continuous line.',
    'Use vertical projection to maximize wave face time.',
    'Aerial awareness starts with reading the lip two seconds ahead.',
  ],
  brown_belt: [
    'Competition readiness means executing under pressure what you drill in calm.',
    'Tactical wave selection separates good surfers from great ones.',
    'Full repertoire means every tool is available — pick the right one for the wave.',
  ],
  black_belt: [
    'Mastery is repeating the fundamentals at the highest level.',
    'Innovate from a foundation of structure — never abandon the system.',
    'Teaching deepens understanding — share what you know.',
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

type Tab = 'home' | 'sessions' | 'materials' | 'self-training' | 'feedback';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'sessions', label: 'Sessions', icon: '📋' },
  { key: 'materials', label: 'Materials', icon: '📚' },
  { key: 'self-training', label: 'Train', icon: '🏄' },
  { key: 'feedback', label: 'Feedback', icon: '💬' },
];

// ─── Main Portal Tabs Component ───

export function PortalTabs({ data, initialTab }: { data: PortalData; initialTab?: Tab }) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'home');
  const { student } = data;
  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20">
      {/* Header */}
      <div style={{ background: BRAND.colors.navy }} className="px-4 py-5 text-center">
        <h1 className="text-lg font-bold text-white">The Surf Sequence</h1>
        <p style={{ color: BRAND.colors.gold }} className="text-[10px] mt-0.5 tracking-wide uppercase">
          {BRAND.tagline}
        </p>
      </div>

      {/* Tab Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'home' && <HomeTab data={data} belt={belt} />}
        {activeTab === 'sessions' && <SessionsTab data={data} />}
        {activeTab === 'materials' && <MaterialsTab data={data} belt={belt} />}
        {activeTab === 'self-training' && <SelfTrainingTab data={data} />}
        {activeTab === 'feedback' && <FeedbackTab data={data} autoExpandFirst={initialTab === 'feedback'} />}
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[var(--tss-navy)]'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-base mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.key === 'feedback' && data.pendingSurveys.length > 0 && (
                <span className="absolute -top-0.5 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
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

function HomeTab({ data, belt }: { data: PortalData; belt: any }) {
  const { student, sessions, totalSessions, streak, selfTrainingCount, totalTrainingMinutes, drillsPracticed, recentDrills } = data;
  const latestResult = sessions[0];
  const trainingHours = Math.round((totalTrainingMinutes / 60) * 10) / 10;
  const beltLevel = student.belt_level as BeltLevel;

  // Training tip of the day — rotate based on day of year
  const tips = TRAINING_TIPS[beltLevel] || TRAINING_TIPS['white_belt'];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tipOfDay = tips[dayOfYear % tips.length];

  return (
    <div className="space-y-4">
      {/* Student Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ring-2 ring-white shadow-md"
            style={{ backgroundColor: belt?.color || '#999' }}
          >
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              `${student.first_name[0]}${student.last_name?.[0] || ''}`
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--tss-navy)] text-base">
              {student.first_name} {student.last_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: belt?.color || '#999' }}
              >
                {belt?.en}
              </span>
              <span className="text-[10px] text-gray-400">{belt?.levelName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Level Card */}
      <div
        className="rounded-2xl border-2 overflow-hidden shadow-sm"
        style={{ borderColor: `${belt?.color || '#999'}40` }}
      >
        <div className="px-4 py-3" style={{ background: `${belt?.color || '#999'}15` }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: belt?.color || '#999' }}
            >
              <span className="text-white text-xs font-bold">{belt?.en?.split(' ')[0]?.[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold" style={{ fontFamily: 'DM Mono, monospace' }}>
                Your Level
              </p>
              <p className="text-sm font-bold text-[var(--tss-navy)]">{belt?.en} — {belt?.levelName}</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-white">
          <p className="text-xs text-gray-600 leading-relaxed">
            {BELT_WELCOME[beltLevel] || 'Keep training and progressing through the system.'}
          </p>
        </div>
      </div>

      {/* Training Tip of the Day */}
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${BRAND.colors.navy}08, ${BRAND.colors.gold}12)`, borderLeft: `3px solid ${BRAND.colors.gold}` }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: BRAND.colors.gold, fontFamily: 'DM Mono, monospace' }}>
          Training Tip of the Day
        </p>
        <p className="text-sm text-[var(--tss-navy)] font-medium leading-relaxed">
          {tipOfDay}
        </p>
      </div>

      {/* Training Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-[var(--tss-navy)]">{totalSessions}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>Total Sessions</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold" style={{ color: BRAND.colors.gold }}>{trainingHours}h</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>Training Hours</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{selfTrainingCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>Self-Training</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold" style={{ color: BRAND.colors.gold }}>{streak}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>Day Streak</p>
        </div>
      </div>

      {/* Current Position */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold" style={{ fontFamily: 'DM Mono, monospace' }}>Current Position</p>
        <p className="text-sm font-medium text-[var(--tss-navy)] mt-1">
          Sequence {student.current_sequence_number || '---'} / Step{' '}
          {student.current_step_order || '---'}
        </p>
        {drillsPracticed.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1.5" style={{ fontFamily: 'DM Mono, monospace' }}>
              Drills Practiced ({drillsPracticed.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {drillsPracticed.slice(0, 6).map((d, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                  {d}
                </span>
              ))}
              {drillsPracticed.length > 6 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-400">
                  +{drillsPracticed.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Drills */}
      {recentDrills.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Recent Drills</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDrills.map((drill, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs shrink-0">{drill.source === 'coach' ? '👨‍🏫' : '🏄'}</span>
                  <p className="text-sm text-gray-700 truncate">{drill.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    drill.source === 'coach' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {drill.source === 'coach' ? 'Coach' : 'Self'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(drill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Homework */}
      {student.last_homework && (
        <div
          className="bg-amber-50 rounded-2xl p-4 shadow-sm"
          style={{ borderLeft: `3px solid ${BRAND.colors.gold}` }}
        >
          <p className="text-[10px] font-semibold text-amber-800 uppercase tracking-wide mb-1">
            Your Homework
          </p>
          <p className="text-sm text-amber-900 font-medium">{student.last_homework}</p>
        </div>
      )}

      {/* Next Focus */}
      {student.next_recommended_focus && (
        <div className="bg-blue-50 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wide mb-1">
            Next Focus
          </p>
          <p className="text-sm text-blue-900">{student.next_recommended_focus}</p>
        </div>
      )}

      {/* Latest Session Summary */}
      {latestResult && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Latest Session</h3>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Mission</span>
              <span className="text-sm text-gray-700 text-right max-w-[65%]">
                {latestResult.standalone_sessions?.mission || '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Date</span>
              <span className="text-sm text-gray-700">
                {new Date(latestResult.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            {latestResult.coaches?.display_name && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Coach</span>
                <span className="text-sm text-gray-700 font-medium">
                  {latestResult.coaches.display_name}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Status</span>
              <StatusBadge status={latestResult.status} />
            </div>

            {/* Summary — show if survey completed */}
            {data.hasSurveyEver && latestResult.student_visible_summary && (
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-1">Session Summary</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {latestResult.student_visible_summary || latestResult.coach_feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 2: SESSIONS (improved with expanded details)
// ═══════════════════════════════════════

function SessionsTab({ data }: { data: PortalData }) {
  const { sessions, selfTrainingSessions, surveyResultIds, hasSurveyEver } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge coach sessions and self-training into a unified timeline
  const allSessions = [
    ...sessions.map((s: any) => ({ ...s, _type: 'coach' as const })),
    ...selfTrainingSessions.map((s: any) => ({
      ...s,
      _type: 'self' as const,
      created_at: s.created_at,
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
                    <p className="text-sm font-medium text-gray-900">
                      {isSelf
                        ? `Self-Training: ${session.drill_name || 'Free session'}`
                        : session.standalone_sessions?.mission || 'Session'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] text-gray-500">
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {!isSelf && session.coaches?.display_name && (
                      <>
                        <span className="text-gray-300">-</span>
                        <span className="text-[10px] text-gray-500">
                          {session.coaches.display_name}
                        </span>
                      </>
                    )}
                    {isSelf && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">
                        Self
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isSelf && <StatusBadge status={session.status} />}
                  {isSelf && session.completed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                      Done
                    </span>
                  )}
                  <span className="text-gray-300 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 border-t border-gray-50 pt-3 space-y-2">
                {isSelf ? (
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
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Status</span>
                        <StatusBadge status={session.status} />
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
                          session.frustration_rating === 0 ? '😎 No frustration' :
                          session.frustration_rating === 1 ? '💪 Difficult but achievable' :
                          session.frustration_rating === 2 ? '😤 Very difficult' :
                          session.frustration_rating === 3 ? '🚫 Total frustration' :
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
                    {/* Show summary/feedback if survey ever completed */}
                    {hasSurveyEver &&
                      (session.student_visible_summary || session.coach_feedback) && (
                        <div className="pt-1">
                          <p className="text-xs text-gray-400 mb-1">Session Summary</p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-2 whitespace-pre-line">
                            {session.student_visible_summary || session.coach_feedback}
                          </p>
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
                        <span>▶</span>
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
const CATEGORY_GROUP_CONFIG: { key: string; label: string; icon: string; isSafety?: boolean }[] = [
  { key: 'theory', label: 'Theory & Sequences', icon: '📖' },
  { key: 'drill', label: 'Drills', icon: '🏋️' },
  { key: 'mission', label: 'Water Missions', icon: '🌊' },
  { key: 'mental', label: 'Mental Tools', icon: '🧠' },
  { key: 'safety', label: 'Safety', icon: '⚠️', isSafety: true },
];

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
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
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
                    <span className="text-sm">{catGroupIcon}</span>
                    <span className={`text-xs font-semibold uppercase tracking-wider flex-1 text-left ${
                      isSafety ? 'text-amber-700' : 'text-gray-600'
                    }`}>
                      {catGroupLabel}
                    </span>
                    <span className="text-[10px] text-gray-400 mr-1">({catMats.length})</span>
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
                  <p className="text-[10px] text-gray-400">
                    {mats.length} sections &middot; Locked
                  </p>
                </div>
                <span className="text-base">🔒</span>
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
  const catIcon = MATERIAL_CATEGORY_ICONS[material.category];

  if (locked) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 opacity-50 cursor-not-allowed shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base shrink-0">
            🔒
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-400">{material.title}</p>
            <p className="text-xs text-gray-300 mt-0.5">{material.subtitle}</p>
            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
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
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-base shrink-0">
            {catIcon}
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
// TAB 4: SELF-TRAINING (with venue analysis step 0)
// ═══════════════════════════════════════

type SelfTrainingStep = 'venue' | 'warmup' | 'drill' | 'mission' | 'duration' | 'mental' | 'review' | 'timer' | 'done';

const STEP_LABELS: { key: SelfTrainingStep; label: string; icon: string }[] = [
  { key: 'venue', label: 'Venue', icon: '📍' },
  { key: 'warmup', label: 'Warm-up', icon: '🏋️' },
  { key: 'drill', label: 'Drill', icon: '🎯' },
  { key: 'mission', label: 'Mission', icon: '🌊' },
  { key: 'duration', label: 'Duration', icon: '⏱️' },
  { key: 'mental', label: 'Mental', icon: '🧠' },
];

function SelfTrainingTab({ data }: { data: PortalData }) {
  const { student, drills } = data;
  const beltLevel = student.belt_level as BeltLevel;
  const [step, setStep] = useState<SelfTrainingStep>('venue');

  // Venue analysis state
  const [venueType, setVenueType] = useState<string | null>(null);
  const [waveConditions, setWaveConditions] = useState<string | null>(null);
  const [wind, setWind] = useState<string | null>(null);
  const [tide, setTide] = useState<string | null>(null);
  const [crowdLevel, setCrowdLevel] = useState<string | null>(null);
  const [safetyCheck, setSafetyCheck] = useState(false);
  const [venueNotes, setVenueNotes] = useState('');

  // Existing state
  const [warmUp, setWarmUp] = useState<string | null>(null);
  const [drillId, setDrillId] = useState<string | null>(null);
  const [drillName, setDrillName] = useState<string | null>(null);
  const [missionName, setMissionName] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [mentalHack, setMentalHack] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const durations = [15, 20, 30, 45, 60];
  const warmupOptions = getWarmupsForBelt(beltLevel);
  const materialDrills = getDrillsForBelt(beltLevel);
  const materialMissions = getMissionsForBelt(beltLevel);

  const builderSteps: SelfTrainingStep[] = ['venue', 'warmup', 'drill', 'mission', 'duration', 'mental'];
  const currentStepIndex = builderSteps.indexOf(step);

  // Get display labels for selected items
  const warmUpLabel = warmUp === 'skip' ? null : warmupOptions.find((o) => o.value === warmUp)?.label || warmUp;
  const mentalHackLabel = MENTAL_HACK_OPTIONS.find((o) => o.value === mentalHack)?.label || mentalHack;
  const venueLabel = VENUE_TYPES.find(v => v.value === venueType)?.label || venueType;
  const waveLabel = WAVE_CONDITIONS.find(w => w.value === waveConditions)?.label || waveConditions;
  const windLabel = WIND_OPTIONS.find(w => w.value === wind)?.label || wind;
  const tideLabel = TIDE_OPTIONS.find(t => t.value === tide)?.label || tide;
  const crowdLabel = CROWD_OPTIONS.find(c => c.value === crowdLevel)?.label || crowdLevel;
  const isBeach = venueType === 'beach';

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const session = await createSelfTrainingSession(student.id, {
        warm_up: warmUp,
        drill_id: drillId,
        drill_name: drillName || missionName,
        mental_hack: mentalHack,
        duration_minutes: duration,
        notes: missionName ? `Mission: ${missionName}` : null,
        venue_type: venueType,
        wave_conditions: isBeach ? waveConditions : null,
        wind: isBeach ? wind : null,
        tide: isBeach ? tide : null,
        crowd_level: isBeach ? crowdLevel : null,
        safety_check: safetyCheck,
        venue_notes: venueNotes || null,
      });
      setSessionId(session.id);
      setTimeLeft(duration * 60);
      setTimerActive(true);
      setStep('timer');
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await completeSelfTrainingSession(sessionId, notes || undefined);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Failed to complete session');
    }
    setLoading(false);
  };

  const reset = () => {
    setStep('venue');
    setVenueType(null);
    setWaveConditions(null);
    setWind(null);
    setTide(null);
    setCrowdLevel(null);
    setSafetyCheck(false);
    setVenueNotes('');
    setWarmUp(null);
    setDrillId(null);
    setDrillName(null);
    setMissionName(null);
    setDuration(30);
    setMentalHack(null);
    setSessionId(null);
    setTimerActive(false);
    setTimeLeft(0);
    setNotes('');
    setError('');
  };

  // ─── Done Screen ───
  if (step === 'done') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl" style={{ background: `${BRAND.colors.gold}20` }}>
            🤙
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--tss-navy)]">Session Complete!</p>
            <p className="text-sm text-gray-500 mt-1">Great work. Keep the momentum going.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left">
            {venueType && (
              <div className="flex items-center gap-2">
                <span className="text-xs">📍</span>
                <span className="text-xs text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Venue:</span>
                <span className="text-xs text-gray-700">{venueLabel}{isBeach && waveLabel ? ` — ${waveLabel}` : ''}</span>
              </div>
            )}
            {warmUp && warmUp !== 'skip' && (
              <div className="flex items-center gap-2">
                <span className="text-xs">🏋️</span>
                <span className="text-xs text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Warm-up:</span>
                <span className="text-xs text-gray-700">{warmUpLabel}</span>
              </div>
            )}
            {drillName && (
              <div className="flex items-center gap-2">
                <span className="text-xs">🎯</span>
                <span className="text-xs text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Drill:</span>
                <span className="text-xs text-gray-700">{drillName}</span>
              </div>
            )}
            {missionName && (
              <div className="flex items-center gap-2">
                <span className="text-xs">🌊</span>
                <span className="text-xs text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Mission:</span>
                <span className="text-xs text-gray-700">{missionName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs">⏱️</span>
              <span className="text-xs text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Duration:</span>
              <span className="text-xs text-gray-700">{duration} min</span>
            </div>
            {safetyCheck && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600">✓</span>
                <span className="text-xs text-green-700 font-medium">Safe zone identified</span>
              </div>
            )}
          </div>
          <button
            onClick={reset}
            className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-sm"
            style={{ background: BRAND.colors.navy }}
          >
            Start Another Session
          </button>
        </div>
      </div>
    );
  }

  // ─── Timer Screen ───
  if (step === 'timer') {
    return (
      <ProfessionalTimerView
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        timerActive={timerActive}
        setTimerActive={setTimerActive}
        warmUp={warmUp}
        warmUpLabel={warmUpLabel || null}
        drillName={drillName}
        missionName={missionName}
        mentalHack={mentalHack}
        mentalHackLabel={mentalHackLabel || null}
        duration={duration}
        notes={notes}
        setNotes={setNotes}
        loading={loading}
        onComplete={handleComplete}
        venueType={venueType}
        venueLabel={venueLabel || null}
        waveLabel={isBeach ? waveLabel || null : null}
        windLabel={isBeach ? windLabel || null : null}
        tideLabel={isBeach ? tideLabel || null : null}
        safetyCheck={safetyCheck}
      />
    );
  }

  // ─── Plan Review Screen (improved with venue analysis) ───
  if (step === 'review') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Session Plan Review</h2>
          <p className="text-xs text-gray-400 mt-0.5">Review your plan before starting</p>
        </div>

        <div className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden" style={{ borderColor: `${BRAND.colors.navy}30` }}>
          {/* Header */}
          <div className="px-5 py-4" style={{ background: BRAND.colors.navy }}>
            <p className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>
              Your Session Plan
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: BRAND.colors.gold }}>
              {BELT_DISPLAY[beltLevel]?.en} Level
            </p>
          </div>

          {/* Plan Items */}
          <div className="p-5 space-y-4">
            {/* Venue Analysis Summary */}
            {venueType && (
              <div>
                <PlanReviewRow icon="📍" label="Venue" value={venueLabel || '---'} />
                {isBeach && (
                  <div className="ml-10 mt-1 space-y-1">
                    {waveLabel && (
                      <p className="text-xs text-gray-500"><span className="text-gray-400">Waves:</span> {waveLabel}</p>
                    )}
                    {windLabel && (
                      <p className="text-xs text-gray-500"><span className="text-gray-400">Wind:</span> {windLabel}</p>
                    )}
                    {tideLabel && (
                      <p className="text-xs text-gray-500"><span className="text-gray-400">Tide:</span> {tideLabel}</p>
                    )}
                    {crowdLabel && (
                      <p className="text-xs text-gray-500"><span className="text-gray-400">Crowd:</span> {crowdLabel}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {safetyCheck && (
              <div className="flex items-center gap-3">
                <span className="text-base">🛡️</span>
                <div className="flex-1">
                  <p className="text-[10px] text-green-600 uppercase tracking-wide font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>Safety Check</p>
                  <p className="text-sm font-medium text-green-700">Safe zone identified</p>
                </div>
                <span className="text-green-600 text-sm">✓</span>
              </div>
            )}
            {warmUp && warmUp !== 'skip' && (
              <PlanReviewRow icon="🏋️" label="Warm-up" value={warmUpLabel || '---'} />
            )}
            {drillName && (
              <PlanReviewRow icon="🎯" label="Drill" value={drillName} />
            )}
            {missionName && (
              <PlanReviewRow icon="🌊" label="Mission" value={missionName} />
            )}
            <PlanReviewRow icon="🧠" label="Mental Hack" value={mentalHackLabel || 'None'} />
            <PlanReviewRow icon="⏱️" label="Duration" value={`${duration} min`} />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all shadow-sm"
          style={{ background: BRAND.colors.navy }}
        >
          {loading ? 'Starting...' : 'Start Session'}
        </button>
        <button
          onClick={() => setStep('mental')}
          className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Edit Plan
        </button>
      </div>
    );
  }

  // ─── Builder Steps ───
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Self-Training Builder</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Build your own session and track it
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((s, i) => (
            <div key={s.key} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full h-1.5 rounded-full transition-colors ${
                  currentStepIndex >= i ? 'bg-[var(--tss-navy)]' : 'bg-gray-100'
                }`}
              />
              <span className={`text-[9px] mt-1 ${
                currentStepIndex >= i ? 'text-[var(--tss-navy)] font-medium' : 'text-gray-300'
              }`}>
                {s.icon}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      {/* Step 0: Venue Analysis */}
      {step === 'venue' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <p className="text-sm font-medium text-[var(--tss-navy)]">0. Venue Analysis</p>
          </div>

          {/* Teaching tip */}
          <div className="rounded-xl p-3 border-l-2 border-cyan-400 bg-cyan-50">
            <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider mb-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>Canon Teaching</p>
            <p className="text-xs text-cyan-800 leading-relaxed">
              Venue analysis is done EVERY session. Read the ocean before entering. Identify safe zones, currents, and hazards.
            </p>
          </div>

          <p className="text-xs text-gray-500 font-medium">Before you start, read your environment</p>

          {/* Venue type */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5" style={{ fontFamily: 'DM Mono, monospace' }}>Venue Type</p>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_TYPES.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVenueType(v.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                    venueType === v.value
                      ? 'border-[var(--tss-navy)] bg-blue-50 text-[var(--tss-navy)] font-medium shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Beach-specific conditions */}
          {venueType === 'beach' && (
            <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>Ocean Conditions</p>

              {/* Wave conditions */}
              <div>
                <p className="text-[10px] text-gray-500 mb-1.5 font-medium">Wave Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {WAVE_CONDITIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setWaveConditions(w.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        waveConditions === w.value
                          ? 'border-[var(--tss-navy)] bg-blue-100 text-[var(--tss-navy)] font-medium'
                          : 'border-gray-200 text-gray-500 bg-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wind */}
              <div>
                <p className="text-[10px] text-gray-500 mb-1.5 font-medium">Wind</p>
                <div className="flex flex-wrap gap-1.5">
                  {WIND_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setWind(w.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        wind === w.value
                          ? 'border-[var(--tss-navy)] bg-blue-100 text-[var(--tss-navy)] font-medium'
                          : 'border-gray-200 text-gray-500 bg-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tide */}
              <div>
                <p className="text-[10px] text-gray-500 mb-1.5 font-medium">Tide</p>
                <div className="flex flex-wrap gap-1.5">
                  {TIDE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTide(t.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        tide === t.value
                          ? 'border-[var(--tss-navy)] bg-blue-100 text-[var(--tss-navy)] font-medium'
                          : 'border-gray-200 text-gray-500 bg-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crowd level */}
              <div>
                <p className="text-[10px] text-gray-500 mb-1.5 font-medium">Crowd Level</p>
                <div className="flex flex-wrap gap-1.5">
                  {CROWD_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCrowdLevel(c.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        crowdLevel === c.value
                          ? 'border-[var(--tss-navy)] bg-blue-100 text-[var(--tss-navy)] font-medium'
                          : 'border-gray-200 text-gray-500 bg-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Safety check */}
          <label className="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none
            ${safetyCheck ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}
          ">
            <input
              type="checkbox"
              checked={safetyCheck}
              onChange={(e) => setSafetyCheck(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-200"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">I have identified the safe zone</p>
              <p className="text-[10px] text-gray-400">Required before every session</p>
            </div>
          </label>

          {/* Venue notes */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5" style={{ fontFamily: 'DM Mono, monospace' }}>
              Notes <span className="normal-case font-normal">(optional)</span>
            </p>
            <textarea
              value={venueNotes}
              onChange={(e) => setVenueNotes(e.target.value)}
              rows={2}
              placeholder="Any observations about the environment..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
            />
          </div>

          <button
            onClick={() => setStep('warmup')}
            disabled={!venueType}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity shadow-sm"
            style={{ background: BRAND.colors.navy }}
          >
            Next: Pick a Warm-up
          </button>
        </div>
      )}

      {/* Step 1: Warm-up */}
      {step === 'warmup' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🏋️</span>
            <p className="text-sm font-medium text-[var(--tss-navy)]">1. Pick a warm-up</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {warmupOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setWarmUp(opt.value)}
                className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  warmUp === opt.value
                    ? 'border-[var(--tss-navy)] bg-blue-50 text-[var(--tss-navy)] font-medium shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => setWarmUp('skip')}
              className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                warmUp === 'skip'
                  ? 'border-gray-400 bg-gray-50 text-gray-600 font-medium'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              Skip warm-up
            </button>
          </div>
          <button
            onClick={() => setStep('drill')}
            disabled={!warmUp}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity shadow-sm"
            style={{ background: BRAND.colors.navy }}
          >
            Next: Pick a Drill
          </button>
          <button
            onClick={() => setStep('venue')}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 2: Drill */}
      {step === 'drill' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <p className="text-sm font-medium text-[var(--tss-navy)]">2. Pick a drill</p>
          </div>
          {materialDrills.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {materialDrills.map((drill) => {
                const beltInfo = BELT_DISPLAY[drill.beltLevel];
                return (
                  <button
                    key={drill.id}
                    onClick={() => {
                      setDrillId(drill.id);
                      setDrillName(drill.title);
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-left transition-all ${
                      drillId === drill.id
                        ? 'border-[var(--tss-navy)] bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          drillId === drill.id ? 'text-[var(--tss-navy)] font-medium' : 'text-gray-700'
                        }`}>
                          {drill.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{drill.subtitle}</p>
                      </div>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white shrink-0 mt-0.5"
                        style={{ backgroundColor: beltInfo?.color || '#999' }}
                      >
                        {beltInfo?.en?.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400">No drills available for your level yet.</p>
            </div>
          )}
          <button
            onClick={() => {
              if (!drillId) {
                setDrillName('Free practice');
              }
              setStep('mission');
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity shadow-sm"
            style={{ background: BRAND.colors.navy }}
          >
            {drillId ? 'Next: Pick a Mission' : 'Skip (Free Practice)'}
          </button>
          <button
            onClick={() => setStep('warmup')}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 3: Mission */}
      {step === 'mission' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🌊</span>
            <p className="text-sm font-medium text-[var(--tss-navy)]">3. Pick a mission <span className="text-gray-400 font-normal">(optional)</span></p>
          </div>
          {materialMissions.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {materialMissions.map((mission) => {
                const beltInfo = BELT_DISPLAY[mission.beltLevel];
                return (
                  <button
                    key={mission.id}
                    onClick={() => setMissionName(missionName === mission.title ? null : mission.title)}
                    className={`w-full px-4 py-3 rounded-xl border text-left transition-all ${
                      missionName === mission.title
                        ? 'border-[var(--tss-navy)] bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          missionName === mission.title ? 'text-[var(--tss-navy)] font-medium' : 'text-gray-700'
                        }`}>
                          {mission.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{mission.subtitle}</p>
                      </div>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white shrink-0 mt-0.5"
                        style={{ backgroundColor: beltInfo?.color || '#999' }}
                      >
                        {beltInfo?.en?.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400">No missions available for your level yet.</p>
            </div>
          )}
          <button
            onClick={() => setStep('duration')}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity shadow-sm"
            style={{ background: BRAND.colors.navy }}
          >
            {missionName ? 'Next: Set Duration' : 'Skip Mission'}
          </button>
          <button
            onClick={() => setStep('drill')}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 4: Duration */}
      {step === 'duration' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">⏱️</span>
            <p className="text-sm font-medium text-[var(--tss-navy)]">4. Set duration</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 min-w-[60px] py-3 rounded-xl border text-sm font-medium transition-all ${
                  duration === d
                    ? 'border-[var(--tss-navy)] bg-blue-50 text-[var(--tss-navy)] shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('mental')}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity shadow-sm"
            style={{ background: BRAND.colors.navy }}
          >
            Next: Mental Hack
          </button>
          <button
            onClick={() => setStep('mission')}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 5: Mental Hack (optional) */}
      {step === 'mental' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🧠</span>
            <p className="text-sm font-medium text-[var(--tss-navy)]">
              5. Mental hack <span className="text-gray-400 font-normal">(optional)</span>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {MENTAL_HACK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setMentalHack(mentalHack === opt.value ? null : opt.value)
                }
                className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  mentalHack === opt.value
                    ? 'border-[var(--tss-navy)] bg-blue-50 text-[var(--tss-navy)] font-medium shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('review')}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-opacity shadow-sm"
            style={{ background: BRAND.colors.navy }}
          >
            Review Session Plan
          </button>
          <button
            onClick={() => setStep('duration')}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Plan Review Row ───

function PlanReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base">{icon}</span>
      <div className="flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
        <p className="text-sm font-medium text-[var(--tss-navy)]">{value}</p>
      </div>
    </div>
  );
}

// ─── Professional Timer View (updated with venue info) ───

function ProfessionalTimerView({
  timeLeft,
  setTimeLeft,
  timerActive,
  setTimerActive,
  warmUp,
  warmUpLabel,
  drillName,
  missionName,
  mentalHack,
  mentalHackLabel,
  duration,
  notes,
  setNotes,
  loading,
  onComplete,
  venueType,
  venueLabel,
  waveLabel,
  windLabel,
  tideLabel,
  safetyCheck,
}: {
  timeLeft: number;
  setTimeLeft: (v: number | ((p: number) => number)) => void;
  timerActive: boolean;
  setTimerActive: (v: boolean) => void;
  warmUp: string | null;
  warmUpLabel: string | null;
  drillName: string | null;
  missionName: string | null;
  mentalHack: string | null;
  mentalHackLabel: string | null;
  duration: number;
  notes: string;
  setNotes: (v: string) => void;
  loading: boolean;
  onComplete: () => void;
  venueType?: string | null;
  venueLabel?: string | null;
  waveLabel?: string | null;
  windLabel?: string | null;
  tideLabel?: string | null;
  safetyCheck?: boolean;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((p: number) => {
          if (p <= 1) {
            setTimerActive(false);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, timeLeft > 0]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const totalSeconds = duration * 60;
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="space-y-4">
      {/* Timer Circle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
        <div className="relative w-44 h-44 mx-auto mb-5">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="6" />
            {/* Gold progress circle */}
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={timeLeft === 0 ? BRAND.colors.gold : BRAND.colors.navy}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - progress)}`}
              className="transition-all duration-1000 ease-linear"
            />
            {/* Inner decorative circle */}
            <circle cx="60" cy="60" r="46" fill="none" stroke="#f9fafb" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-[var(--tss-navy)] tabular-nums tracking-tight" style={{ fontFamily: 'DM Mono, monospace' }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-gray-400 mt-1">
              {timeLeft === 0 ? 'COMPLETE' : timerActive ? 'IN PROGRESS' : 'PAUSED'}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          {timerActive ? (
            <button
              onClick={() => setTimerActive(false)}
              className="px-8 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
            >
              Pause
            </button>
          ) : timeLeft > 0 ? (
            <button
              onClick={() => setTimerActive(true)}
              className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors"
              style={{ background: BRAND.colors.navy }}
            >
              Resume
            </button>
          ) : (
            <p className="text-base font-bold" style={{ color: BRAND.colors.gold }}>
              Time is up!
            </p>
          )}
        </div>
      </div>

      {/* Session Plan Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>
          Session Plan
        </h3>
        {venueType && (
          <PlanChecklistItem icon="📍" label="Venue" value={`${venueLabel || venueType}${waveLabel ? ` — ${waveLabel}` : ''}${windLabel ? ` / ${windLabel}` : ''}${tideLabel ? ` / ${tideLabel}` : ''}`} />
        )}
        {safetyCheck && (
          <PlanChecklistItem icon="🛡️" label="Safety" value="Safe zone identified" />
        )}
        {warmUp && warmUp !== 'skip' && (
          <PlanChecklistItem icon="🏋️" label="Warm-up" value={warmUpLabel || warmUp} />
        )}
        {drillName && <PlanChecklistItem icon="🎯" label="Drill" value={drillName} />}
        {missionName && <PlanChecklistItem icon="🌊" label="Mission" value={missionName} />}
        {mentalHack && (
          <PlanChecklistItem icon="🧠" label="Mental Hack" value={mentalHackLabel || mentalHack} />
        )}
        <PlanChecklistItem icon="⏱️" label="Duration" value={`${duration} min`} />
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>
          Session notes <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="How did it go? What did you notice?"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
        />
      </div>

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all shadow-sm"
        style={{ background: BRAND.colors.navy }}
      >
        {loading ? 'Saving...' : 'Complete Session'}
      </button>
    </div>
  );
}

function PlanChecklistItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
        <span className="text-xs">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
        <p className="text-sm text-gray-700 truncate">{value}</p>
      </div>
      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <span className="text-green-600 text-[10px]">✓</span>
      </div>
    </div>
  );
}

// ChecklistItem kept for backward compatibility
function ChecklistItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <span className="text-green-600 text-[10px]">✓</span>
      </div>
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 5: FEEDBACK
// ═══════════════════════════════════════

function FeedbackTab({ data, autoExpandFirst = false }: { data: PortalData; autoExpandFirst?: boolean }) {
  const { pendingSurveys, submittedSurveys, student, token } = data;
  const [expandedSurveyId, setExpandedSurveyId] = useState<string | null>(
    autoExpandFirst && pendingSurveys.length > 0 ? pendingSurveys[0].id : null
  );

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
          submittedSurveys.map((survey: any) => (
            <div
              key={survey.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {survey.student_session_results?.standalone_sessions?.mission ||
                      'Session'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(
                      survey.student_session_results?.created_at || survey.created_at
                    ).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Rating:</span>
                  <span className="text-sm font-semibold text-[var(--tss-navy)]">
                    {survey.coach_rating}/5
                  </span>
                </div>
              </div>
              {(survey.q2_feedback || survey.open_comment) && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  {survey.q2_feedback && (
                    <p className="text-xs text-gray-600">{survey.q2_feedback}</p>
                  )}
                  {survey.open_comment && (
                    <p className="text-xs text-gray-500 mt-1">{survey.open_comment}</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <span className="text-[10px]">✓</span>
                <span className="text-[10px] font-medium">Submitted</span>
              </div>
            </div>
          ))
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
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-700 capitalize">{value?.replace(/_/g, ' ')}</span>
    </div>
  );
}
