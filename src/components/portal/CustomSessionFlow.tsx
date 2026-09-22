'use client';

import { useEffect, useState, useTransition } from 'react';
import { BRAND } from '@/lib/constants/brand';
import {
  createSelfTrainingSession,
  completeSelfTrainingSession,
  getNextIntention,
} from '@/lib/actions/portal';
import { FocusPicker, FlowPicker, OutcomePicker } from '@/components/portal/close-pickers';
import { Clock, CircleDot, Waves, ThumbsUp } from 'lucide-react';

// Custom Session — free-form training that gets logged but does NOT count
// toward step mastery. Lives inside the unified "Let's Play" tab as an
// alternative to the canonical drill picker.

const DURATION_CHIPS = [10, 20, 30, 45, 60, 90, 120];

export function CustomSessionFlow({
  portalToken,
  onCancel,
  onDone,
}: {
  portalToken: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<'plan' | 'in_progress' | 'review' | 'done'>('plan');
  const [focus, setFocus] = useState('');
  const [duration, setDuration] = useState(30);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [focusRating, setFocusRating] = useState<number | null>(null);
  const [flow, setFlow] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<'yes' | 'partial' | 'no' | null>(null);
  const [nextIntention, setNextIntention] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [waterMinutes, setWaterMinutes] = useState(30);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Lo que dejó anotado como "la próxima" la última vez ya viene escrito:
  // así el círculo se cierra sin que tenga que acordarse (Marcelo 2026-09-22).
  useEffect(() => {
    let alive = true;
    getNextIntention(portalToken)
      .then((t) => { if (alive && t) setFocus((f) => { if (f) return f; setPrefilled(true); return t; }); })
      .catch(() => { /* si falla, arranca en blanco */ });
    return () => { alive = false; };
  }, [portalToken]);

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
            onFocus={() => setPrefilled(false)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
          />
          {/* Que no sea silencioso: se ve de dónde salió y que puede cambiarlo. */}
          {prefilled && (
            <p className="text-[11px] text-[#00789A] mt-1.5">
              This is what you wrote last time. Change it if today is different.
            </p>
          )}

          <div className="mt-4">
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              <Clock size={13} strokeWidth={1.75} />
              Duration
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
                const session = await createSelfTrainingSession(portalToken, {
                  warm_up: null,
                  drill_id: null,
                  drill_name: focus.trim(),
                  intention_text: focus.trim(),
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
          <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 mb-1">
            <CircleDot size={13} strokeWidth={2} />
            Custom Session in progress
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
          {/* Lo que te propusiste, arriba de todo: se evalúa contra ESO,
              no contra la memoria (Marcelo 2026-09-22). */}
          <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(0,210,255,.08)', border: '1px solid rgba(0,210,255,.25)' }}>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E]">You set out to</p>
            <p className="text-[15px] font-bold leading-snug mt-0.5" style={{ color: '#061C2B' }}>{focus}</p>
          </div>

          <OutcomePicker value={outcome} onChange={setOutcome} />
          <FocusPicker value={focusRating} onChange={setFocusRating} />
          <FlowPicker flow={flow} onChange={setFlow} />

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              <Waves size={13} strokeWidth={1.75} />
              Total time in the water?
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

          {/* El círculo se cierra acá: lo que escriba vuelve escrito la
              próxima vez que abra una sesión suya. */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              What do you work on next?
            </label>
            <input
              type="text"
              value={nextIntention}
              onChange={(e) => setNextIntention(e.target.value)}
              placeholder="In your own words — it will be waiting for you next session."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <p className="text-[11px] leading-relaxed text-gray-500">
            This session stays in your history and counts your time in the water.
            It does not move any star of the method — those come from the sequences.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          type="button"
          disabled={pending || !outcome}
          onClick={() => {
            if (!sessionId) return;
            startTransition(async () => {
              try {
                await completeSelfTrainingSession(portalToken, sessionId, {
                  notes: notes.trim() || null,
                  totalWaterMinutes: Math.max(duration, waterMinutes),
                  missionCompletion: outcome,
                  focusRating,
                  flowChannel: flow,
                  nextIntention: nextIntention.trim() || null,
                });
                setPhase('done');
              } catch (e: any) {
                setError(e.message || 'Failed to save');
              }
            });
          }}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: BRAND.colors.navy }}
        >
          {pending ? 'Saving…' : !outcome ? 'Did you meet it?' : 'Save Session'}
        </button>
      </div>
    );
  }

  // ── Done ──
  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <ThumbsUp size={32} strokeWidth={1.75} className="mx-auto mb-2 text-[var(--tss-cyan)]" />
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
