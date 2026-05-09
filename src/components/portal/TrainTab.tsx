'use client';

import { useState, useTransition } from 'react';
import { BRAND } from '@/lib/constants/brand';
import type { BeltLevel } from '@/lib/constants/belts';
import { LinkedTrainingFlow } from '@/components/sequence/LinkedTrainingFlow';
import {
  createSelfTrainingSession,
  completeSelfTrainingSession,
} from '@/lib/actions/portal';

// New Train Tab — replaces the old "free builder".
//
// Flow (per Marcelo's spec):
//   1. Default screen = drill picker (mandatory). Student MUST pick a canonical
//      drill or mission from drills_missions before training. This closes the
//      loop with My Sequence + Track A's struggling-step signals.
//   2. Alternative entrypoint = "Custom Session" — free-form training that gets
//      logged for completeness but does NOT count toward step mastery.
//   3. If a drill is picked (here OR via Sequence tab's "Practice this drill"),
//      delegate to LinkedTrainingFlow (which handles intent → in-progress →
//      criteria_evaluation as before).

interface DrillMission {
  id: string;
  step_id: string | null;
  title: string;
  type: 'drill' | 'mission';
  time_estimate: string | null;
  key_words: string[] | null;
  block_name: string | null;
}

interface TrainTabProps {
  studentId: string;
  beltLevel: BeltLevel;
  drillsMissions: DrillMission[];
  incomingDrillMissionId?: string | null;
  onClearIncoming?: () => void;
  onReturnToSequence?: () => void;
}

export function TrainTab({
  studentId,
  beltLevel,
  drillsMissions,
  incomingDrillMissionId,
  onClearIncoming,
  onReturnToSequence,
}: TrainTabProps) {
  const [pickedDrillId, setPickedDrillId] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);

  // Active drill = one passed in from Sequence tab OR one picked in this tab.
  const activeDrillId = incomingDrillMissionId || pickedDrillId;

  // ── Mode A: drill picked → delegate to LinkedTrainingFlow ──
  if (activeDrillId) {
    return (
      <LinkedTrainingFlow
        drillMissionId={activeDrillId}
        studentId={studentId}
        studentBelt={beltLevel}
        onClearIncoming={() => {
          setPickedDrillId(null);
          onClearIncoming?.();
        }}
        onReturnToSequence={
          onReturnToSequence ||
          (() => {
            setPickedDrillId(null);
          })
        }
      />
    );
  }

  // ── Mode B: custom session ──
  if (customMode) {
    return (
      <CustomSessionFlow
        studentId={studentId}
        onCancel={() => setCustomMode(false)}
        onDone={() => setCustomMode(false)}
      />
    );
  }

  // ── Mode C (default): drill picker ──
  return (
    <TrainPicker
      drillsMissions={drillsMissions}
      onPickDrill={(id) => setPickedDrillId(id)}
      onCustomSession={() => setCustomMode(true)}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// TRAIN PICKER — default screen
// ═══════════════════════════════════════════════════════════════

function TrainPicker({
  drillsMissions,
  onPickDrill,
  onCustomSession,
}: {
  drillsMissions: DrillMission[];
  onPickDrill: (id: string) => void;
  onCustomSession: () => void;
}) {
  const drills = drillsMissions.filter((d) => d.type === 'drill');
  const missions = drillsMissions.filter((d) => d.type === 'mission');

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
          🏄 Train
        </p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">
          Pick a drill or mission to practice
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Each drill is tied to a specific step in your sequence. Practicing
          one updates your self-rating for that step. If you want to do free
          surf or work on something not on the list, tap{' '}
          <strong>Custom Session</strong> below.
        </p>
      </div>

      {/* Custom Session entrypoint — placed on top so it's discoverable */}
      <button
        type="button"
        onClick={onCustomSession}
        className="w-full bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-4 text-left transition-colors"
      >
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          🏖 Custom Session
        </p>
        <p className="text-sm font-semibold text-[var(--tss-navy)] mt-1">
          Free surf, breathing, fun — anything off-script
        </p>
        <p className="text-[11px] text-gray-500 mt-1">
          Logged for the record but does NOT count toward step mastery.
        </p>
      </button>

      {/* Drills */}
      {drills.length > 0 && (
        <DrillGroup
          label="Drills"
          icon="🔧"
          subtitle="Train the technique on land or in shallow water"
          items={drills}
          onPick={onPickDrill}
          accent="amber"
        />
      )}

      {/* Missions */}
      {missions.length > 0 && (
        <DrillGroup
          label="Missions"
          icon="🌊"
          subtitle="Apply the learning in the water with a specific objective"
          items={missions}
          onPick={onPickDrill}
          accent="blue"
        />
      )}

      {drills.length === 0 && missions.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400">
            No drills or missions available for your belt yet.
          </p>
          <p className="text-xs text-gray-300 mt-2">
            Use Custom Session above to log your training in the meantime.
          </p>
        </div>
      )}
    </div>
  );
}

function DrillGroup({
  label,
  icon,
  subtitle,
  items,
  onPick,
  accent,
}: {
  label: string;
  icon: string;
  subtitle: string;
  items: DrillMission[];
  onPick: (id: string) => void;
  accent: 'amber' | 'blue';
}) {
  const accentClasses =
    accent === 'amber'
      ? 'bg-amber-50/60 hover:bg-amber-100 border-amber-100'
      : 'bg-blue-50/60 hover:bg-blue-100 border-blue-100';

  return (
    <div>
      <div className="px-1 mb-2">
        <h3 className="text-sm font-bold text-[var(--tss-navy)]">
          {icon} {label}
        </h3>
        <p className="text-[11px] text-gray-500">{subtitle}</p>
      </div>
      <div className="space-y-1.5">
        {items.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onPick(d.id)}
            className={`w-full text-left rounded-xl border ${accentClasses} p-3 transition-colors`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-gray-400 truncate">
                  {d.id}
                  {d.step_id ? ` · ${d.step_id}` : ''}
                  {d.block_name ? ` · ${d.block_name}` : ''}
                </p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {d.title}
                </p>
                {d.key_words && d.key_words.length > 0 && (
                  <p className="text-[11px] text-gray-500 italic mt-1 truncate">
                    {d.key_words.join(' · ')}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                {d.time_estimate && (
                  <span className="text-[10px] text-gray-500">{d.time_estimate}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM SESSION FLOW — free-form training
// ═══════════════════════════════════════════════════════════════

const DURATION_CHIPS = [10, 20, 30, 45, 60];

function CustomSessionFlow({
  studentId,
  onCancel,
  onDone,
}: {
  studentId: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<'plan' | 'in_progress' | 'review' | 'done'>('plan');
  const [focus, setFocus] = useState('');
  const [duration, setDuration] = useState(30);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [focusRating, setFocusRating] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // ── Plan phase ──
  if (phase === 'plan') {
    return (
      <div className="space-y-4 pb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-[var(--tss-navy)]"
            >
              ← Back
            </button>
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              Custom Session
            </span>
          </div>

          <h2 className="text-base font-bold text-[var(--tss-navy)] mb-2">
            What do you want to work on?
          </h2>
          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            Free surf, breathing, fun, a specific feeling — write it in your
            own words. This session does NOT count toward your step ratings,
            but it stays in your history.
          </p>

          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. Free surf with friends. Or: long paddle conditioning. Or: just have fun."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
          />

          <div className="mt-4">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              ⏱ Duration
            </label>
            <div className="grid grid-cols-5 gap-2">
              {DURATION_CHIPS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  className={`py-2 rounded-lg text-xs font-medium border ${
                    duration === m
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600'
                  }`}
                  style={duration === m ? { background: BRAND.colors.navy } : {}}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          type="button"
          disabled={pending || !focus.trim()}
          onClick={() => {
            startTransition(async () => {
              try {
                const session = await createSelfTrainingSession(studentId, {
                  warm_up: null,
                  drill_id: null,
                  drill_name: focus.trim(),
                  mental_hack: null,
                  duration_minutes: duration,
                  notes: null,
                  kind: 'custom',
                });
                setSessionId(session.id);
                setPhase('in_progress');
              } catch (e: any) {
                setError(e.message || 'Failed to start');
              }
            });
          }}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: BRAND.colors.navy }}
        >
          {pending
            ? 'Starting…'
            : !focus.trim()
            ? 'Tell us what you want to work on'
            : `Start Session · ${duration}m`}
        </button>
      </div>
    );
  }

  // ── In-progress phase ──
  if (phase === 'in_progress') {
    return (
      <div className="space-y-4 pb-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 mb-1">
            🟢 Custom Session in progress
          </p>
          <p className="text-base font-bold text-emerald-900 mt-1">{focus}</p>
          <p className="text-[11px] text-emerald-700 mt-2">
            Planned: {duration} min
          </p>
          <p className="text-[10px] text-emerald-600 italic mt-3">
            Tap "Finish" below when you&apos;re done in the water.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPhase('review')}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold"
          style={{ background: BRAND.colors.navy }}
        >
          Finish & Review →
        </button>
      </div>
    );
  }

  // ── Review phase (rating + notes) ──
  if (phase === 'review') {
    return (
      <div className="space-y-4 pb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              How did it feel?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 1, label: '😣 Off' },
                { value: 2, label: '😐 OK' },
                { value: 3, label: '🤩 Locked in' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFocusRating(opt.value)}
                  className={`py-3 rounded-lg text-xs font-medium border ${
                    focusRating === opt.value
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600'
                  }`}
                  style={focusRating === opt.value ? { background: BRAND.colors.navy } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth remembering from today?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!sessionId) return;
            const fullNotes = focusRating
              ? `[focus ${focusRating}/3] ${notes.trim()}`.trim()
              : notes.trim();
            startTransition(async () => {
              try {
                await completeSelfTrainingSession(sessionId, fullNotes || undefined);
                setPhase('done');
              } catch (e: any) {
                setError(e.message || 'Failed to save');
              }
            });
          }}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: BRAND.colors.navy }}
        >
          {pending ? 'Saving…' : 'Save Session'}
        </button>
      </div>
    );
  }

  // ── Done ──
  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <p className="text-3xl mb-2">🤙</p>
        <p className="text-sm font-semibold text-[var(--tss-navy)]">Session logged</p>
        <p className="text-[11px] text-gray-500 mt-1">
          Custom sessions appear in your history but don&apos;t count toward
          step mastery. To progress through your sequence, pick a drill from
          the list.
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold"
        style={{ background: BRAND.colors.navy }}
      >
        Back to Train
      </button>
    </div>
  );
}
