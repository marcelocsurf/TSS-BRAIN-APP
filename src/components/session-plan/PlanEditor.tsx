'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants/brand';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { OCEAN_LEVEL_INFO, type OceanLevel } from '@/lib/constants/ocean-levels';
import {
  updateMultiBlockSession,
  updateBlock,
  reorderBlock,
  deleteBlock,
  startMultiBlockSession,
  closeBlock,
  closeMultiBlockSession,
  planNextSession,
  type BlockStatus,
} from '@/lib/actions/multi-block-sessions';
import { AddBlockModal } from './AddBlockModal';

interface Block {
  id: string;
  order_index: number;
  step_id: string | null;
  drill_id: string | null;
  duration_minutes: number;
  objective_text: string | null;
  status: BlockStatus | null;
  coach_notes: string | null;
}

interface Session {
  id: string;
  student_id: string;
  session_date: string;
  training_venue: string | null;
  warm_up: string | null;
  mental_hack: string | null;
  notes_general: string | null;
  total_planned_minutes: number;
  total_actual_minutes: number | null;
  completion_state: 'planned' | 'in_progress' | 'closed';
  general_coach_feedback: string | null;
  general_homework: string | null;
  general_whats_next: string | null;
  closed_at: string | null;
  students: {
    id: string;
    first_name: string;
    last_name: string | null;
    belt_level: BeltLevel;
    ocean_level: OceanLevel | null;
    photo_url: string | null;
    portal_token: string;
  };
  coaches?: { display_name: string } | null;
}

interface Props {
  session: Session;
  blocks: Block[];
}

export function PlanEditor({ session: initialSession, blocks: initialBlocks }: Props) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [showAdd, setShowAdd] = useState(false);
  const [showPlanNext, setShowPlanNext] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const refresh = () => router.refresh();

  const isPlanned = session.completion_state === 'planned';
  const isRunning = session.completion_state === 'in_progress';
  const isClosed = session.completion_state === 'closed';

  const student = session.students;
  const belt = BELT_DISPLAY[student.belt_level];
  const ocean = student.ocean_level ? OCEAN_LEVEL_INFO[student.ocean_level] : null;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-32">
      {/* ── Header card ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: belt?.color || '#999' }}
          >
            {student.photo_url ? (
              <img src={student.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              `${student.first_name[0]}${student.last_name?.[0] || ''}`
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--tss-navy)] truncate">
              {student.first_name} {student.last_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: belt?.color }}
              >
                {belt?.en}
              </span>
              {ocean && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Ocean: {ocean.short}
                </span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isClosed
                    ? 'bg-gray-100 text-gray-600'
                    : isRunning
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {session.completion_state.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Session header fields (date, venue) ── */}
      {!isClosed && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <FieldRow
            label="Date"
            value={session.session_date}
            type="date"
            onChange={(v) => {
              setSession((s) => ({ ...s, session_date: v }));
              startTransition(() =>
                updateMultiBlockSession(session.id, { session_date: v }).catch((e) =>
                  setError(e.message)
                )
              );
            }}
            disabled={pending}
          />
          <FieldRow
            label="Venue"
            value={session.training_venue || ''}
            placeholder="e.g. Punta Roca"
            onChange={(v) => {
              setSession((s) => ({ ...s, training_venue: v }));
              startTransition(() =>
                updateMultiBlockSession(session.id, { training_venue: v }).catch((e) =>
                  setError(e.message)
                )
              );
            }}
            disabled={pending}
          />
        </div>
      )}

      {/* ── Plan blocks ── */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
              🎯 Session Plan
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''} ·{' '}
              <strong>{session.total_planned_minutes} min planned</strong>
              {isClosed && session.total_actual_minutes != null && (
                <> · {session.total_actual_minutes} min actual</>
              )}
            </p>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {blocks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No blocks yet. Tap <strong>+ Add Block</strong> to build the plan.
            </p>
          ) : (
            blocks.map((b, idx) => (
              <BlockCard
                key={b.id}
                block={b}
                index={idx}
                isFirst={idx === 0}
                isLast={idx === blocks.length - 1}
                editable={isPlanned}
                runnable={isRunning}
                readOnly={isClosed}
                pending={pending}
                onSave={(patch) => {
                  setBlocks((bs) => bs.map((x) => (x.id === b.id ? { ...x, ...patch } : x)));
                  startTransition(() =>
                    updateBlock(b.id, patch).then(refresh).catch((e) => setError(e.message))
                  );
                }}
                onReorder={(dir) => {
                  startTransition(() =>
                    reorderBlock(b.id, dir).then(refresh).catch((e) => setError(e.message))
                  );
                }}
                onDelete={() => {
                  if (!confirm('Delete this block?')) return;
                  startTransition(() =>
                    deleteBlock(b.id).then(refresh).catch((e) => setError(e.message))
                  );
                }}
                onScore={(status, notes) => {
                  setBlocks((bs) =>
                    bs.map((x) =>
                      x.id === b.id ? { ...x, status, coach_notes: notes ?? null } : x
                    )
                  );
                  startTransition(() =>
                    closeBlock({ blockId: b.id, status, coachNotes: notes }).then(refresh).catch((e) =>
                      setError(e.message)
                    )
                  );
                }}
              />
            ))
          )}
          {isPlanned && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl text-sm text-gray-600"
            >
              + Add Block
            </button>
          )}
        </div>
      </div>

      {/* ── Common (warm-up + mental hack) ── */}
      {!isClosed && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
            🌊 Common (whole session)
          </h3>
          <FieldRow
            label="Warm-up"
            value={session.warm_up || ''}
            placeholder="e.g. Zen Swing, Head-to-toe"
            onChange={(v) => {
              setSession((s) => ({ ...s, warm_up: v }));
              startTransition(() =>
                updateMultiBlockSession(session.id, { warm_up: v }).catch((e) =>
                  setError(e.message)
                )
              );
            }}
            disabled={pending}
          />
          <FieldRow
            label="Mental hack"
            value={session.mental_hack || ''}
            placeholder="e.g. Box breath x3 before each wave"
            onChange={(v) => {
              setSession((s) => ({ ...s, mental_hack: v }));
              startTransition(() =>
                updateMultiBlockSession(session.id, { mental_hack: v }).catch((e) =>
                  setError(e.message)
                )
              );
            }}
            disabled={pending}
          />
        </div>
      )}

      {/* ── Closed-state report ── */}
      {isClosed && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">📋 Final Report</h3>
          <ReportRow label="Coach feedback" value={session.general_coach_feedback} />
          <ReportRow label="Homework" value={session.general_homework} />
          <ReportRow label="What's next" value={session.general_whats_next} />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      {/* ── Sticky footer CTA ── */}
      {!isClosed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-30">
          <div className="max-w-2xl mx-auto">
            {isPlanned ? (
              <button
                type="button"
                disabled={pending || blocks.length === 0}
                onClick={() =>
                  startTransition(() =>
                    startMultiBlockSession(session.id).then(() => {
                      setSession((s) => ({ ...s, completion_state: 'in_progress' }));
                      refresh();
                    }).catch((e) => setError(e.message))
                  )
                }
                className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                style={{ background: BRAND.colors.navy }}
              >
                {blocks.length === 0
                  ? 'Add at least one block to start'
                  : `Start Session · ${session.total_planned_minutes}min`}
              </button>
            ) : (
              <CloseSessionButton
                session={session}
                blocks={blocks}
                pending={pending}
                onClose={(payload) => {
                  startTransition(() =>
                    closeMultiBlockSession(payload).then(() => {
                      setSession((s) => ({ ...s, completion_state: 'closed' }));
                      refresh();
                      // G3 Continuity: prompt to plan the next session
                      setShowPlanNext(true);
                    }).catch((e) => setError(e.message))
                  );
                }}
              />
            )}
          </div>
        </div>
      )}

      <AddBlockModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={() => {
          setShowAdd(false);
          refresh();
        }}
        multiBlockSessionId={session.id}
        studentId={student.id}
        beltLevel={student.belt_level}
      />

      <PlanNextModal
        open={showPlanNext}
        currentSessionId={session.id}
        studentName={student.first_name}
        currentDate={session.session_date}
        hasBlocks={blocks.length > 0}
        hasCommon={!!(session.warm_up || session.mental_hack)}
        onSkip={() => setShowPlanNext(false)}
        onCreated={(newId) => {
          setShowPlanNext(false);
          router.push(`/sessions/plan/${newId}`);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PLAN NEXT MODAL — G3 Continuity. Appears right after close.
// ─────────────────────────────────────────────────────────────

function PlanNextModal({
  open,
  currentSessionId,
  studentName,
  currentDate,
  hasBlocks,
  hasCommon,
  onSkip,
  onCreated,
}: {
  open: boolean;
  currentSessionId: string;
  studentName: string;
  currentDate: string;
  hasBlocks: boolean;
  hasCommon: boolean;
  onSkip: () => void;
  onCreated: (newId: string) => void;
}) {
  // Default next date: 7 days after the current session
  const defaultNext = (() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  })();

  const [nextDate, setNextDate] = useState(defaultNext);
  const [copyBlocks, setCopyBlocks] = useState(hasBlocks);
  const [copyCommon, setCopyCommon] = useState(hasCommon);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 text-center">
          <p className="text-2xl mb-1">🤙</p>
          <h2 className="text-sm font-semibold text-[var(--tss-navy)]">
            Session closed. Plan the next one?
          </h2>
          <p className="text-[11px] text-gray-500 mt-1">
            Pre-load a session for {studentName} so they see what's coming.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              📅 Date
            </label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          {hasBlocks && (
            <label className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={copyBlocks}
                onChange={(e) => setCopyBlocks(e.target.checked)}
                className="mt-0.5"
              />
              <div className="text-[12px] text-gray-700">
                <p className="font-medium">Copy the same blocks</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Reuse the drills + missions you ran today as the starting
                  point for next session. You can edit them after.
                </p>
              </div>
            </label>
          )}

          {hasCommon && (
            <label className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={copyCommon}
                onChange={(e) => setCopyCommon(e.target.checked)}
                className="mt-0.5"
              />
              <div className="text-[12px] text-gray-700">
                <p className="font-medium">Copy warm-up & mental hack</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Use the same common setup as today's session.
                </p>
              </div>
            </label>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3 flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600"
          >
            Skip
          </button>
          <button
            type="button"
            disabled={pending || !nextDate}
            onClick={() =>
              startTransition(async () => {
                try {
                  const { id } = await planNextSession({
                    currentSessionId,
                    sessionDate: nextDate,
                    copyBlocks,
                    copyCommon,
                  });
                  onCreated(id);
                } catch (e: any) {
                  setError(e.message || 'Failed to plan next session');
                }
              })
            }
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: BRAND.colors.navy }}
          >
            {pending ? 'Creating…' : 'Plan Next Session →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function FieldRow({
  label,
  value,
  type = 'text',
  placeholder,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  type?: 'text' | 'date';
  placeholder?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50"
      />
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BLOCK CARD — handles all 3 modes (planned editable, running scoreable, closed read-only)
// ─────────────────────────────────────────────────────────────

function BlockCard({
  block,
  index,
  isFirst,
  isLast,
  editable,
  runnable,
  readOnly,
  pending,
  onSave,
  onReorder,
  onDelete,
  onScore,
}: {
  block: Block;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  editable: boolean;
  runnable: boolean;
  readOnly: boolean;
  pending: boolean;
  onSave: (patch: Partial<Block>) => void;
  onReorder: (dir: 'up' | 'down') => void;
  onDelete: () => void;
  onScore: (status: BlockStatus, notes?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [duration, setDuration] = useState(block.duration_minutes);
  const [objective, setObjective] = useState(block.objective_text || '');
  const [notes, setNotes] = useState(block.coach_notes || '');

  const statusBg =
    block.status === 'achieved'
      ? 'bg-emerald-50 border-emerald-200'
      : block.status === 'partial'
      ? 'bg-amber-50 border-amber-200'
      : block.status === 'not_yet'
      ? 'bg-rose-50 border-rose-200'
      : 'bg-white border-gray-100';

  return (
    <div className={`rounded-xl border ${statusBg} overflow-hidden`}>
      {/* Top row */}
      <div className="flex items-center gap-2 p-3">
        <span className="text-[10px] font-mono text-gray-400 w-6 text-center shrink-0">
          #{index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 truncate">
            {block.step_id ? <span className="text-[10px] font-mono text-gray-400 mr-1">{block.step_id}</span> : null}
            {block.drill_id || 'Custom block'}
          </p>
          {block.objective_text && (
            <p className="text-[11px] text-gray-500 italic truncate">
              ⮕ {block.objective_text}
            </p>
          )}
        </div>
        <span className="text-[11px] text-gray-500 shrink-0 font-medium">
          {block.duration_minutes}m
        </span>
        {editable && (
          <div className="flex items-center gap-0.5 shrink-0">
            <IconBtn disabled={isFirst || pending} onClick={() => onReorder('up')}>↑</IconBtn>
            <IconBtn disabled={isLast || pending} onClick={() => onReorder('down')}>↓</IconBtn>
            <IconBtn disabled={pending} onClick={() => setExpanded((e) => !e)}>✎</IconBtn>
            <IconBtn disabled={pending} onClick={onDelete}>×</IconBtn>
          </div>
        )}
        {(runnable || readOnly) && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-[10px] font-mono text-gray-400 hover:text-gray-700 px-2"
          >
            {expanded ? 'hide' : runnable ? 'score' : 'detail'}
          </button>
        )}
      </div>

      {/* Edit panel (planned mode) */}
      {editable && expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
          <div>
            <p className="text-[10px] font-mono text-gray-400 mt-2 mb-1">Duration (min)</p>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setDuration(m);
                    onSave({ duration_minutes: m });
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                    duration === m ? 'border-transparent text-white' : 'border-gray-200 text-gray-600'
                  }`}
                  style={duration === m ? { background: BRAND.colors.navy } : {}}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-gray-400 mb-1">Objective</p>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onBlur={() => onSave({ objective_text: objective })}
              rows={2}
              placeholder="What does the student need to do today?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
            />
          </div>
        </div>
      )}

      {/* Scoring panel (running mode) */}
      {runnable && expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
          <p className="text-[10px] font-mono text-gray-400 mt-2">Score this block</p>
          <div className="grid grid-cols-3 gap-2">
            <ScoreBtn
              label="✓ Got it"
              tone="emerald"
              active={block.status === 'achieved'}
              onClick={() => onScore('achieved', notes)}
              disabled={pending}
            />
            <ScoreBtn
              label="◐ Half"
              tone="amber"
              active={block.status === 'partial'}
              onClick={() => onScore('partial', notes)}
              disabled={pending}
            />
            <ScoreBtn
              label="✗ Not yet"
              tone="rose"
              active={block.status === 'not_yet'}
              onClick={() => onScore('not_yet', notes)}
              disabled={pending}
            />
          </div>
          <div>
            <p className="text-[10px] font-mono text-gray-400 mb-1 mt-2">Notes (optional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => block.status && onScore(block.status, notes)}
              rows={2}
              placeholder="What did you observe?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
            />
          </div>
        </div>
      )}

      {/* Read-only detail (closed mode) */}
      {readOnly && expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100 text-xs text-gray-700">
          {block.objective_text && (
            <div>
              <p className="text-[10px] font-mono text-gray-400 mt-2">Objective</p>
              <p>{block.objective_text}</p>
            </div>
          )}
          {block.coach_notes && (
            <div>
              <p className="text-[10px] font-mono text-gray-400">Notes</p>
              <p className="whitespace-pre-wrap">{block.coach_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 text-sm"
    >
      {children}
    </button>
  );
}

function ScoreBtn({
  label,
  tone,
  active,
  onClick,
  disabled,
}: {
  label: string;
  tone: 'emerald' | 'amber' | 'rose';
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const toneClasses = {
    emerald: active ? 'bg-emerald-500 text-white' : 'border border-emerald-200 text-emerald-700',
    amber: active ? 'bg-amber-500 text-white' : 'border border-amber-200 text-amber-700',
    rose: active ? 'bg-rose-500 text-white' : 'border border-rose-200 text-rose-700',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`py-3 rounded-lg text-sm font-medium ${toneClasses} disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// CLOSE SESSION — sticky footer button + inline expansion
// ─────────────────────────────────────────────────────────────

function CloseSessionButton({
  session,
  blocks,
  pending,
  onClose,
}: {
  session: Session;
  blocks: Block[];
  pending: boolean;
  onClose: (payload: {
    multiBlockSessionId: string;
    generalCoachFeedback?: string;
    generalHomework?: string;
    generalWhatsNext?: string;
    totalActualMinutes?: number;
  }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState('');
  const [homework, setHomework] = useState('');
  const [whatsNext, setWhatsNext] = useState('');
  const [actualMin, setActualMin] = useState<string>(String(session.total_planned_minutes));

  const allScored = blocks.length > 0 && blocks.every((b) => b.status);

  if (!showForm) {
    return (
      <button
        type="button"
        disabled={!allScored || pending}
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
        style={{ background: BRAND.colors.navy }}
      >
        {!allScored
          ? `Score all blocks first (${blocks.filter((b) => b.status).length}/${blocks.length})`
          : 'Close Session'}
      </button>
    );
  }

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
      <textarea
        rows={2}
        placeholder="General coach feedback (optional)"
        value={coachFeedback}
        onChange={(e) => setCoachFeedback(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
      />
      <textarea
        rows={2}
        placeholder="Homework — what to practice between now and next session"
        value={homework}
        onChange={(e) => setHomework(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
      />
      <textarea
        rows={2}
        placeholder="What's next — focus for next session"
        value={whatsNext}
        onChange={(e) => setWhatsNext(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
      />
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500">Actual duration</span>
        <input
          type="number"
          min={1}
          max={300}
          value={actualMin}
          onChange={(e) => setActualMin(e.target.value)}
          className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm"
        />
        <span className="text-[11px] text-gray-500">min</span>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            onClose({
              multiBlockSessionId: session.id,
              generalCoachFeedback: coachFeedback,
              generalHomework: homework,
              generalWhatsNext: whatsNext,
              totalActualMinutes: actualMin ? parseInt(actualMin, 10) : undefined,
            })
          }
          className="flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: BRAND.colors.navy }}
        >
          {pending ? 'Closing…' : 'Confirm Close'}
        </button>
      </div>
    </div>
  );
}
