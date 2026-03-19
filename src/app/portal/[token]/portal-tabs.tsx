'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/constants/brand';
import type { BeltLevel } from '@/lib/constants/belts';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { BELT_HIERARCHY, BELT_RANK } from '@/lib/constants/belts';
import { WARMUP_OPTIONS, MENTAL_HACK_OPTIONS } from '@/lib/constants/brand';
import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORY_ICONS,
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
  drills: any[];
  pendingSurveys: any[];
  submittedSurveys: any[];
  materials: { unlocked: BeltMaterial[]; locked: BeltMaterial[] };
  token: string;
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

export function PortalTabs({ data }: { data: PortalData }) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
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
        {activeTab === 'feedback' && <FeedbackTab data={data} />}
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
// TAB 1: HOME
// ═══════════════════════════════════════

function HomeTab({ data, belt }: { data: PortalData; belt: any }) {
  const { student, sessions, totalSessions, streak } = data;
  const latestResult = sessions[0];

  return (
    <div className="space-y-4">
      {/* Student Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
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

      {/* Current Position */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Current Position</p>
            <p className="text-sm font-medium text-[var(--tss-navy)] mt-1">
              Sequence {student.current_sequence_number || '—'} / Step{' '}
              {student.current_step_order || '—'}
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-[var(--tss-navy)]">{totalSessions}</p>
              <p className="text-[10px] text-gray-400">Sessions</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: BRAND.colors.gold }}>
                {streak}
              </p>
              <p className="text-[10px] text-gray-400">Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Homework */}
      {student.last_homework && (
        <div
          className="bg-amber-50 rounded-xl p-4"
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
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wide mb-1">
            Next Focus
          </p>
          <p className="text-sm text-blue-900">{student.next_recommended_focus}</p>
        </div>
      )}

      {/* Latest Session Summary */}
      {latestResult && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
// TAB 2: SESSIONS
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
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
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
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
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
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-line">
                          {session.notes}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {session.standalone_sessions?.pilar_id_snapshot && (
                      <DetailRow
                        label="Pilar"
                        value={session.standalone_sessions.pilar_id_snapshot}
                      />
                    )}
                    {session.focus_rating && (
                      <DetailRow label="Focus" value={`${session.focus_rating}/5`} />
                    )}
                    {session.frustration_rating && (
                      <DetailRow
                        label="Frustration"
                        value={`${session.frustration_rating}/10`}
                      />
                    )}
                    {/* Show summary/feedback if survey ever completed */}
                    {hasSurveyEver &&
                      (session.student_visible_summary || session.coach_feedback) && (
                        <div className="pt-1">
                          <p className="text-xs text-gray-400 mb-1">Session Summary</p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-line">
                            {session.student_visible_summary || session.coach_feedback}
                          </p>
                        </div>
                      )}
                    {session.video_link && (
                      <a
                        href={session.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white"
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
// TAB 3: MATERIALS
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

function MaterialsTab({
  data,
  belt,
}: {
  data: PortalData;
  belt: any;
}) {
  const { materials, student } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group materials by belt level
  const groupedUnlocked = groupByBelt(materials.unlocked);
  const groupedLocked = groupByBelt(materials.locked);

  // Determine belt ordering for display
  const beltOrder: BeltLevel[] = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];

  // Count materials
  const totalUnlocked = materials.unlocked.length;
  const totalLocked = materials.locked.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Training Manual</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {totalUnlocked} sections available &middot; Based on your {belt?.en} level
          {totalLocked > 0 && ` &middot; ${totalLocked} locked`}
        </p>
      </div>

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
              className={`rounded-xl border px-4 py-3 ${BELT_BG_STYLES[bKey] || 'bg-gray-50 border-gray-200'}`}
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

            {/* Category Groups */}
            {(['theory', 'drill', 'mission', 'safety', 'mental'] as const).map((cat) => {
              const catMats = byCategory[cat];
              if (!catMats || catMats.length === 0) return null;
              const catLabel = MATERIAL_CATEGORY_LABELS[cat];
              const catIcon = MATERIAL_CATEGORY_ICONS[cat];

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 pt-1">
                    <span className="text-xs">{catIcon}</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {catLabel}
                    </span>
                    <span className="text-[10px] text-gray-300">({catMats.length})</span>
                  </div>
                  {catMats.map((mat) => (
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
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
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
      <div className="bg-white rounded-xl border border-gray-100 p-3.5 opacity-50 cursor-not-allowed">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0">
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-3.5 py-3 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-base shrink-0">
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

            {/* Content rendered as formatted text */}
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed font-[system-ui]">
                {material.content.split('\n').map((line, i) => {
                  // Style section headers (ALL CAPS lines)
                  if (/^[A-Z][A-Z\s&—:#+\-\/().0-9]+$/.test(line.trim()) && line.trim().length > 3) {
                    return (
                      <p key={i} className="font-bold text-[var(--tss-navy)] text-sm mt-4 mb-1.5">
                        {line}
                      </p>
                    );
                  }
                  // Style numbered section headers (e.g., "1. STANCE ANALYSIS")
                  if (/^\d+\.\s+[A-Z]/.test(line.trim())) {
                    return (
                      <p key={i} className="font-semibold text-gray-800 text-sm mt-3 mb-1">
                        {line}
                      </p>
                    );
                  }
                  // Style lettered steps (e.g., "a) From cobra position...")
                  if (/^[a-z]\)\s/.test(line.trim())) {
                    return (
                      <p key={i} className="text-sm text-gray-700 pl-4 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  // Style bullet points
                  if (/^[-•✓]\s/.test(line.trim()) || /^✓\s/.test(line.trim())) {
                    return (
                      <p key={i} className="text-sm text-gray-600 pl-3 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  // Style coaching cues (quoted or in specific format)
                  if (/^".*"$/.test(line.trim()) || /^Coaching cue:/.test(line.trim())) {
                    return (
                      <p key={i} className="text-sm text-blue-700 italic pl-3 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  // Style STANDARD lines
                  if (/^STANDARD:/.test(line.trim())) {
                    return (
                      <p key={i} className="text-sm font-semibold text-green-800 bg-green-50 rounded-lg px-3 py-2 mt-3">
                        {line}
                      </p>
                    );
                  }
                  // Empty lines = spacing
                  if (line.trim() === '') {
                    return <br key={i} />;
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
// TAB 4: SELF-TRAINING
// ═══════════════════════════════════════

type SelfTrainingStep = 'warmup' | 'drill' | 'duration' | 'mental' | 'timer' | 'done';

function SelfTrainingTab({ data }: { data: PortalData }) {
  const { student, drills } = data;
  const [step, setStep] = useState<SelfTrainingStep>('warmup');
  const [warmUp, setWarmUp] = useState<string | null>(null);
  const [drillId, setDrillId] = useState<string | null>(null);
  const [drillName, setDrillName] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [mentalHack, setMentalHack] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const durations = [15, 20, 30, 45, 60];

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const session = await createSelfTrainingSession(student.id, {
        warm_up: warmUp,
        drill_id: drillId,
        drill_name: drillName,
        mental_hack: mentalHack,
        duration_minutes: duration,
        notes: null,
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
    setStep('warmup');
    setWarmUp(null);
    setDrillId(null);
    setDrillName(null);
    setDuration(30);
    setMentalHack(null);
    setSessionId(null);
    setTimerActive(false);
    setTimeLeft(0);
    setNotes('');
    setError('');
  };

  if (step === 'done') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center space-y-3">
        <p className="text-3xl">🤙</p>
        <p className="text-base font-semibold text-[var(--tss-navy)]">Session Complete!</p>
        <p className="text-sm text-gray-500">Great work. Keep the momentum going.</p>
        <button
          onClick={reset}
          className="mt-4 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: BRAND.colors.navy }}
        >
          Start Another
        </button>
      </div>
    );
  }

  if (step === 'timer') {
    return <TimerView
      timeLeft={timeLeft}
      setTimeLeft={setTimeLeft}
      timerActive={timerActive}
      setTimerActive={setTimerActive}
      warmUp={warmUp}
      drillName={drillName}
      mentalHack={mentalHack}
      duration={duration}
      notes={notes}
      setNotes={setNotes}
      loading={loading}
      onComplete={handleComplete}
    />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--tss-navy)]">Self-Training Builder</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Build your own session and track it
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 justify-center">
        {(['warmup', 'drill', 'duration', 'mental'] as SelfTrainingStep[]).map((s, i) => (
          <div
            key={s}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              (['warmup', 'drill', 'duration', 'mental'] as SelfTrainingStep[]).indexOf(step) >= i
                ? 'bg-[var(--tss-navy)]'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      {/* Step 1: Warm-up */}
      {step === 'warmup' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">1. Pick a warm-up</p>
          <div className="grid grid-cols-1 gap-2">
            {WARMUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setWarmUp(opt.value)}
                className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  warmUp === opt.value
                    ? 'border-[var(--tss-navy)] bg-blue-50 text-[var(--tss-navy)] font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
            className="w-full py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Drill */}
      {step === 'drill' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">2. Pick a drill</p>
          {drills.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {drills.map((drill: any) => (
                <button
                  key={drill.id}
                  onClick={() => {
                    setDrillId(drill.id);
                    setDrillName(drill.name);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-left transition-all ${
                    drillId === drill.id
                      ? 'border-[var(--tss-navy)] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p
                    className={`text-sm ${
                      drillId === drill.id
                        ? 'text-[var(--tss-navy)] font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {drill.name}
                  </p>
                  {drill.goal && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{drill.goal}</p>
                  )}
                </button>
              ))}
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
              setStep('duration');
            }}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            {drillId ? 'Next' : 'Skip (Free Practice)'}
          </button>
          <button
            onClick={() => setStep('warmup')}
            className="w-full py-2 text-xs text-gray-400"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 3: Duration */}
      {step === 'duration' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">3. Set duration</p>
          <div className="flex gap-2 flex-wrap">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 min-w-[60px] py-3 rounded-xl border text-sm font-medium transition-all ${
                  duration === d
                    ? 'border-[var(--tss-navy)] bg-blue-50 text-[var(--tss-navy)]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('mental')}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            Next
          </button>
          <button
            onClick={() => setStep('drill')}
            className="w-full py-2 text-xs text-gray-400"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 4: Mental Hack (optional) */}
      {step === 'mental' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            4. Mental hack <span className="text-gray-400 font-normal">(optional)</span>
          </p>
          <div className="grid grid-cols-1 gap-2">
            {MENTAL_HACK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setMentalHack(mentalHack === opt.value ? null : opt.value)
                }
                className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  mentalHack === opt.value
                    ? 'border-[var(--tss-navy)] bg-blue-50 text-[var(--tss-navy)] font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-bold text-white disabled:opacity-40 transition-opacity"
            style={{ background: BRAND.colors.navy }}
          >
            {loading ? 'Starting...' : 'Start Session'}
          </button>
          <button
            onClick={() => setStep('duration')}
            className="w-full py-2 text-xs text-gray-400"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Timer View ───

function TimerView({
  timeLeft,
  setTimeLeft,
  timerActive,
  setTimerActive,
  warmUp,
  drillName,
  mentalHack,
  duration,
  notes,
  setNotes,
  loading,
  onComplete,
}: {
  timeLeft: number;
  setTimeLeft: (v: number | ((p: number) => number)) => void;
  timerActive: boolean;
  setTimerActive: (v: boolean) => void;
  warmUp: string | null;
  drillName: string | null;
  mentalHack: string | null;
  duration: number;
  notes: string;
  setNotes: (v: string) => void;
  loading: boolean;
  onComplete: () => void;
}) {
  // Timer countdown
  useState(() => {
    // We'll handle the timer with setInterval in an effect-like pattern
  });

  // Use a ref-style approach with useState for the interval
  const [, setTick] = useState(0);

  // Simple interval using useState
  if (timerActive && timeLeft > 0) {
    setTimeout(() => {
      setTimeLeft((p: number) => {
        if (p <= 1) {
          setTimerActive(false);
          return 0;
        }
        return p - 1;
      });
      setTick((t) => t + 1);
    }, 1000);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = timeLeft / (duration * 60);

  return (
    <div className="space-y-4">
      {/* Timer circle */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={BRAND.colors.navy}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-[var(--tss-navy)] tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
        </div>

        {timerActive ? (
          <button
            onClick={() => setTimerActive(false)}
            className="px-6 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600"
          >
            Pause
          </button>
        ) : timeLeft > 0 ? (
          <button
            onClick={() => setTimerActive(true)}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: BRAND.colors.navy }}
          >
            Resume
          </button>
        ) : (
          <p className="text-sm font-semibold" style={{ color: BRAND.colors.gold }}>
            Time is up!
          </p>
        )}
      </div>

      {/* Session checklist */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Session Plan
        </h3>
        {warmUp && warmUp !== 'skip' && (
          <ChecklistItem
            label="Warm-up"
            value={WARMUP_OPTIONS.find((o) => o.value === warmUp)?.label || warmUp}
          />
        )}
        {drillName && <ChecklistItem label="Drill" value={drillName} />}
        {mentalHack && (
          <ChecklistItem
            label="Mental Hack"
            value={
              MENTAL_HACK_OPTIONS.find((o) => o.value === mentalHack)?.label ||
              mentalHack
            }
          />
        )}
        <ChecklistItem label="Duration" value={`${duration} min`} />
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Session notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="How did it go? What did you notice?"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={loading}
        className="w-full py-3 rounded-lg text-sm font-bold text-white disabled:opacity-40 transition-opacity"
        style={{ background: BRAND.colors.navy }}
      >
        {loading ? 'Saving...' : 'Complete Session'}
      </button>
    </div>
  );
}

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

function FeedbackTab({ data }: { data: PortalData }) {
  const { pendingSurveys, submittedSurveys, student, token } = data;
  const [expandedSurveyId, setExpandedSurveyId] = useState<string | null>(null);

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
              <div className="bg-amber-50 rounded-xl p-4">
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
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <p className="text-gray-400 text-sm">No feedback submitted yet.</p>
          </div>
        ) : (
          submittedSurveys.map((survey: any) => (
            <div
              key={survey.id}
              className="bg-white rounded-xl border border-gray-100 p-4"
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
        <div className="bg-green-50 rounded-xl p-4 text-center">
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
