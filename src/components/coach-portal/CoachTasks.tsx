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
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-[#0090B0] mb-3 inline-flex items-center gap-1.5">
        <CheckSquare size={13} /> My tasks {open.length > 0 && <span className="text-gray-400">· {open.length}</span>}
      </p>

      <ul className="space-y-1.5">
        {open.map((t) => (
          <li key={t.id} className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(openId === t.id ? null : t.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
            >
              <span className="w-5 h-5 shrink-0 rounded-md border-2 border-gray-300" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-[#061C2B] truncate">
                  {t.title}
                  {t.recurrence && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#0090B0] bg-[#00D2FF]/10 border border-[#00D2FF]/30 rounded-full px-1.5 py-0.5 align-middle">
                      <Repeat size={9} /> {t.recurrence}
                    </span>
                  )}
                </span>
                {t.description && <span className="block text-[11px] text-gray-500 truncate">{t.description}</span>}
                {t.due_date && (
                  <span className={`block text-[11px] ${isOverdue(t) ? 'text-[#FF6B6B] font-semibold' : 'text-gray-400'}`}>Due {fmtDue(t.due_date)}</span>
                )}
              </span>
              <span className="text-[10px] text-gray-400 shrink-0">{openId === t.id ? 'Close' : 'Open'}</span>
            </button>
            {openId === t.id && t.link_url === 'inventory' && onOpenInventory && (
              <div className="px-3 pt-3">
                <button
                  type="button"
                  onClick={onOpenInventory}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
                  style={{ background: '#00D2FF', color: '#061C2B' }}
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
              <p className="flex-1 text-sm text-gray-400 line-through truncate">{t.title}</p>
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
    <div className="border-t border-gray-100 px-3 py-3 space-y-3">
      {/* The manual — tick the steps as you go */}
      {steps.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 inline-flex items-center gap-1">
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
                    className="mt-0.5 h-4 w-4 rounded accent-[#00D2FF]"
                  />
                  <span className={`text-[13px] leading-snug ${ticks[s] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{s}</span>
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
        className={`w-full rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none ${notDone && !comment.trim() ? 'border border-[#FF6B6B]/60' : 'border border-gray-200'}`}
        style={{ background: '#F7F9FA' }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => { setNotDone(false); onSubmit('done', comment, checklistState); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold disabled:opacity-50" style={{ background: '#06D6A0', color: '#061C2B' }}
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
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold bg-white border border-[#FF6B6B]/50 text-[#FF6B6B] disabled:opacity-50"
        >
          <X size={15} strokeWidth={2.5} /> Not done
        </button>
      </div>
      {notDone && !comment.trim() && (
        <p className="text-[11px] text-red-600">Please write why it was not done — the coordinator sees this.</p>
      )}
    </div>
  );
}
