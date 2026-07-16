'use client';

import { useEffect, useState, useTransition } from 'react';
import { CheckSquare, Check, X, Repeat, ListChecks, Package } from 'lucide-react';
import { getMyTasks, reportMyTask, type AcademyTask } from '@/lib/actions/tasks';

// Tasks the coordinator assigned to this coach. The assignee reports the
// outcome: Done (optional comment) or Not done (comment required — why).
// Tasks with a checklist ("the manual") render tickable steps; whatever was
// ticked is saved with the report so processes stay documented.
function fmtDue(d: string | null) {
  if (!d) return null;
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(t: AcademyTask) {
  if (t.status === 'done' || !t.due_date) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(t.due_date + 'T00:00:00') < today;
}

export function CoachTasks({ token, onOpenInventory }: { token: string; onOpenInventory?: () => void }) {
  const [tasks, setTasks] = useState<AcademyTask[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    getMyTasks(token).then((t) => { if (alive) setTasks(t); }).catch(() => { if (alive) setTasks([]); });
    return () => { alive = false; };
  }, [token]);

  if (!tasks || tasks.length === 0) return null;

  const open = tasks.filter((t) => t.status !== 'done');
  const done = tasks.filter((t) => t.status === 'done');

  function refresh() {
    getMyTasks(token).then(setTasks).catch(() => {});
  }

  return (
    <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-3 inline-flex items-center gap-1.5">
        <CheckSquare size={13} /> My tasks {open.length > 0 && <span className="text-white/40">· {open.length}</span>}
      </p>

      <ul className="space-y-1.5">
        {open.map((t) => (
          <li key={t.id} className="rounded-xl bg-white/[0.04] overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(openId === t.id ? null : t.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
            >
              <span className="w-5 h-5 shrink-0 rounded-md border-2 border-white/30" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-white truncate">
                  {t.title}
                  {t.recurrence && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 rounded-full px-1.5 py-0.5 align-middle">
                      <Repeat size={9} /> {t.recurrence}
                    </span>
                  )}
                </span>
                {t.description && <span className="block text-[11px] text-white/40 truncate">{t.description}</span>}
                {t.due_date && (
                  <span className={`block text-[11px] ${isOverdue(t) ? 'text-red-400 font-semibold' : 'text-white/40'}`}>Due {fmtDue(t.due_date)}</span>
                )}
              </span>
              <span className="text-[10px] text-white/40 shrink-0">{openId === t.id ? 'Close' : 'Open'}</span>
            </button>
            {openId === t.id && t.link_url === 'inventory' && onOpenInventory && (
              <div className="px-3 pt-3">
                <button
                  type="button"
                  onClick={onOpenInventory}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
                  style={{ background: '#5AC3E7', color: '#0A1628' }}
                >
                  <Package size={15} /> Open the academy inventory →
                </button>
              </div>
            )}
            {openId === t.id && (
              <TaskReportForm
                task={t}
                pending={pending}
                onSubmit={(outcome, comment, checklistState) => {
                  start(async () => {
                    const res = await reportMyTask(token, t.id, outcome, comment, checklistState);
                    if (!res.ok) { alert(res.error || 'Could not save.'); return; }
                    setOpenId(null);
                    refresh();
                  });
                }}
              />
            )}
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <div className="mt-2 space-y-1">
          {done.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 px-3 py-1.5">
              <span className="w-5 h-5 shrink-0 rounded-md bg-emerald-500 flex items-center justify-center text-white"><Check size={12} /></span>
              <p className="flex-1 text-sm text-white/40 line-through truncate">{t.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskReportForm({ task, pending, onSubmit }: {
  task: AcademyTask;
  pending: boolean;
  onSubmit: (outcome: 'done' | 'not_done', comment: string, checklistState: Record<string, boolean> | null) => void;
}) {
  const steps = task.checklist ?? [];
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState('');
  const [notDone, setNotDone] = useState(false);

  const checklistState = steps.length > 0
    ? Object.fromEntries(steps.map((s) => [s, !!ticks[s]]))
    : null;

  return (
    <div className="border-t border-white/10 px-3 py-3 space-y-3">
      {/* The manual — tick the steps as you go */}
      {steps.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5 inline-flex items-center gap-1">
            <ListChecks size={11} /> Steps
          </p>
          <ul className="space-y-1">
            {steps.map((s) => (
              <li key={s}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!ticks[s]}
                    onChange={(e) => setTicks((prev) => ({ ...prev, [s]: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded accent-[#5AC3E7]"
                  />
                  <span className={`text-[13px] leading-snug ${ticks[s] ? 'text-white/40 line-through' : 'text-white/85'}`}>{s}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder={notDone ? 'Why was it not done? (required)' : 'Comment (optional)'}
        className={`w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none ${notDone && !comment.trim() ? 'border border-red-400/60' : 'border border-white/15'}`}
        style={{ background: 'rgba(255,255,255,.06)' }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => { setNotDone(false); onSubmit('done', comment, checklistState); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          <Check size={15} strokeWidth={2.5} /> Done
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setNotDone(true);
            if (!comment.trim()) return; // highlight the required reason
            onSubmit('not_done', comment, checklistState);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-red-300 disabled:opacity-50"
        >
          <X size={15} strokeWidth={2.5} /> Not done
        </button>
      </div>
      {notDone && !comment.trim() && (
        <p className="text-[11px] text-red-300">Please write why it was not done — the coordinator sees this.</p>
      )}
    </div>
  );
}
