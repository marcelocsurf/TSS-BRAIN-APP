'use client';

import { useState, useTransition } from 'react';
import { BRAND } from '@/lib/constants/brand';
import {
  createSelfTrainingSession,
  completeSelfTrainingSession,
} from '@/lib/actions/portal';

// Custom Session — free-form training that gets logged but does NOT count
// toward step mastery. Lives inside the unified "Let's Play" tab as an
// alternative to the canonical drill picker.

const DURATION_CHIPS = [10, 20, 30, 45, 60, 90, 120];

export function CustomSessionFlow({
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
  const [waterMinutes, setWaterMinutes] = useState(30);
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
          onClick={() => {
            setWaterMinutes((w) => (w < duration ? duration : w));
            setPhase('review');
          }}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold"
          style={{ background: BRAND.colors.navy }}
        >
          Finish & Review →
        </button>
      </div>
    );
  }

  // ── Review phase ──
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
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              🌊 Total time in the water?
            </label>
            <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
              Your mission was {duration}m. If you stayed longer, the extra
              time counts as free surfing.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {DURATION_CHIPS.filter((m) => m >= duration).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setWaterMinutes(m)}
                  className={`py-2 rounded-lg text-xs font-medium border ${
                    waterMinutes === m
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600'
                  }`}
                  style={waterMinutes === m ? { background: BRAND.colors.navy } : {}}
                >
                  {m}m
                </button>
              ))}
            </div>
            <input
              type="number"
              min={duration}
              value={waterMinutes}
              onChange={(e) =>
                setWaterMinutes(Math.max(duration, parseInt(e.target.value, 10) || duration))
              }
              className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder={`Minutes (min ${duration})`}
            />
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
                await completeSelfTrainingSession(
                  sessionId,
                  fullNotes || undefined,
                  Math.max(duration, waterMinutes)
                );
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
        Back to Let&apos;s Play
      </button>
    </div>
  );
}
