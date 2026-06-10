'use client';

import { useState, useTransition } from 'react';
import {
  LEARNING_PROFILES,
  LEARNING_CHANNELS,
  type LearningChannel,
} from '@/lib/constants/learning-profiles';
import { setStudentLearningProfile } from '@/lib/actions/students';
import { Brain } from 'lucide-react';

interface Props {
  studentId: string;
  primary: LearningChannel | null;
  secondary: LearningChannel | null;
  portalToken: string;
  /** The raw "How do you learn best?" answer captured during intake. */
  intakeLearningStyle?: string | null;
}

// Map the simple intake answer to a VAKR channel so the coach gets a
// useful provisional read before any formal quiz is recorded.
function channelFromIntake(style: string | null | undefined): LearningChannel | null {
  if (!style) return null;
  const s = style.toLowerCase();
  if (s.includes('watch') || s.includes('visual')) return 'V';
  if (s.includes('doing') || s.includes('kinesthetic')) return 'K';
  if (s.includes('hearing') || s.includes('explanation')) return 'A';
  return null;
}

// Coach-facing card on /students/[id]. Shows the student's VAKR learning
// profile + tips so the coach can scan it before every session.
// If profile is not set, shows an empty state with a "Set manually" form
// (Marcelo records the result the student told him from the GitHub Pages
// quiz: https://marcelocsurf.github.io/learning-quiz/).

export function LearningProfileCard({ studentId, primary, secondary, portalToken, intakeLearningStyle }: Props) {
  const [editing, setEditing] = useState(false);
  const [pickPrimary, setPickPrimary] = useState<LearningChannel | null>(primary);
  const [pickSecondary, setPickSecondary] = useState<LearningChannel | null>(secondary);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const save = () => {
    if (!pickPrimary) {
      setError('Pick a primary channel');
      return;
    }
    if (pickSecondary && pickPrimary === pickSecondary) {
      setError('Secondary must be different from primary');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await setStudentLearningProfile({
          studentId,
          primary: pickPrimary,
          secondary: pickSecondary,
        });
        setEditing(false);
      } catch (e: any) {
        setError(e.message || 'Failed to save');
      }
    });
  };

  const clear = () => {
    startTransition(async () => {
      try {
        await setStudentLearningProfile({
          studentId,
          primary: null,
          secondary: null,
          scores: null,
        });
        setPickPrimary(null);
        setPickSecondary(null);
        setEditing(false);
      } catch (e: any) {
        setError(e.message || 'Failed to clear');
      }
    });
  };

  // ── Provisional state — no formal profile yet, but intake captured a hint ──
  const intakeChannel = channelFromIntake(intakeLearningStyle);
  if (!primary && !editing && intakeChannel) {
    const ip = LEARNING_PROFILES[intakeChannel];
    return (
      <div className={`rounded-xl border ${ip.border} ${ip.bg} p-4`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-2xl shrink-0">{ip.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 inline-flex items-center gap-1">
                <Brain size={10} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
                How they learn
              </p>
              <p className="text-base font-bold truncate" style={{ color: ip.color }}>
                {ip.name}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                From intake — tap <strong>Set</strong> to confirm or refine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs px-2.5 py-1 rounded-lg bg-[var(--tss-navy)] text-white shrink-0"
          >
            Set
          </button>
        </div>

        <p className="text-[12px] text-gray-700 leading-relaxed mb-3">
          {ip.description}
        </p>

        <div className="bg-white/60 rounded-lg p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">
            Coach — how to teach this student
          </p>
          <ul className="space-y-1">
            {ip.coachTips.map((tip, i) => (
              <li key={i} className="text-[12px] text-gray-700 leading-snug">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ── Empty state — nothing from intake either ──
  if (!primary && !editing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)] inline-flex items-center gap-1.5">
            <Brain size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
            How they learn
          </h3>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs px-2.5 py-1 rounded-lg bg-[var(--tss-navy)] text-white"
          >
            Set
          </button>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          No learning profile yet. It appears automatically once the student
          answers &ldquo;how I learn best&rdquo; in their intake — or tap{' '}
          <strong>Set</strong> to record it manually.
        </p>
      </div>
    );
  }

  // ── Edit state ──
  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)] inline-flex items-center gap-1.5">
            <Brain size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
            Set Learning Profile
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setPickPrimary(primary);
              setPickSecondary(secondary);
              setError('');
            }}
            className="text-xs text-gray-500"
          >
            Cancel
          </button>
        </div>

        <ChannelPicker
          label="Primary channel"
          value={pickPrimary}
          onChange={setPickPrimary}
        />
        <ChannelPicker
          label="Secondary channel (optional)"
          value={pickSecondary}
          onChange={setPickSecondary}
          excludeChannel={pickPrimary || undefined}
        />

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <div className="flex gap-2">
          {primary && (
            <button
              type="button"
              onClick={clear}
              disabled={pending}
              className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={pending || !pickPrimary}
            className="flex-1 py-2 text-xs text-white bg-[var(--tss-navy)] rounded-lg disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    );
  }

  // ── View state ──
  const p = primary ? LEARNING_PROFILES[primary] : null;
  const s = secondary ? LEARNING_PROFILES[secondary] : null;
  if (!p) return null;

  return (
    <div className={`rounded-xl border ${p.border} ${p.bg} p-4`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-2xl shrink-0">{p.icon}</span>
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 inline-flex items-center gap-1">
              <Brain size={10} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
              How they learn
            </p>
            <p
              className="text-base font-bold truncate"
              style={{ color: p.color }}
            >
              {p.name}
            </p>
            {s && (
              <p className="text-[11px] text-gray-600 mt-0.5">
                Secondary: <span className="font-medium">{s.icon} {s.shortName}</span>
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[10px] text-gray-500 hover:text-gray-800 shrink-0"
        >
          Edit
        </button>
      </div>

      <p className="text-[12px] text-gray-700 leading-relaxed mb-3">
        {p.description}
      </p>

      <div className="bg-white/60 rounded-lg p-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Coach — how to teach this student
        </p>
        <ul className="space-y-1">
          {p.coachTips.map((tip, i) => (
            <li key={i} className="text-[12px] text-gray-700 leading-snug">
              • {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ───────────────────────────────────────

function ChannelPicker({
  label,
  value,
  onChange,
  excludeChannel,
}: {
  label: string;
  value: LearningChannel | null;
  onChange: (v: LearningChannel | null) => void;
  excludeChannel?: LearningChannel;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {LEARNING_CHANNELS.map((ch) => {
          const info = LEARNING_PROFILES[ch];
          const isExcluded = excludeChannel === ch;
          const selected = value === ch;
          return (
            <button
              key={ch}
              type="button"
              disabled={isExcluded}
              onClick={() => onChange(selected ? null : ch)}
              className={`text-left p-2.5 rounded-lg border transition ${
                isExcluded
                  ? 'opacity-30 border-gray-200 bg-gray-50'
                  : selected
                  ? 'border-transparent text-white'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={selected && !isExcluded ? { background: info.color } : {}}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{info.icon}</span>
                <span className="text-xs font-medium">{info.shortName}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
