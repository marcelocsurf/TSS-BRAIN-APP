'use client';

import { useEffect, useState, useTransition } from 'react';
import { CheckSquare, Check } from 'lucide-react';
import { getMyTasks, completeMyTask, type AcademyTask } from '@/lib/actions/tasks';

// Tasks the coordinator assigned to this coach. Read + mark-done only.
function fmtDue(d: string | null) {
  if (!d) return null;
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(t: AcademyTask) {
  if (t.status === 'done' || !t.due_date) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(t.due_date + 'T00:00:00') < today;
}

export function CoachTasks({ token }: { token: string }) {
  const [tasks, setTasks] = useState<AcademyTask[] | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    getMyTasks(token).then((t) => { if (alive) setTasks(t); }).catch(() => { if (alive) setTasks([]); });
    return () => { alive = false; };
  }, [token]);

  if (!tasks || tasks.length === 0) return null;

  const open = tasks.filter((t) => t.status !== 'done');
  const done = tasks.filter((t) => t.status === 'done');

  function complete(t: AcademyTask) {
    setTasks((prev) => (prev ?? []).map((x) => x.id === t.id ? { ...x, status: 'done' } : x));
    start(async () => { await completeMyTask(token, t.id); });
  }

  return (
    <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-3 inline-flex items-center gap-1.5">
        <CheckSquare size={13} /> My tasks {open.length > 0 && <span className="text-white/40">· {open.length}</span>}
      </p>

      <ul className="space-y-1.5">
        {open.map((t) => (
          <li key={t.id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <button onClick={() => complete(t)} disabled={pending} className="w-5 h-5 shrink-0 rounded-md border-2 border-white/30 hover:border-[#5AC3E7] transition-colors" aria-label="Mark done" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{t.title}</p>
              {t.description && <p className="text-[11px] text-white/40 truncate">{t.description}</p>}
              {t.due_date && (
                <p className={`text-[11px] ${isOverdue(t) ? 'text-red-400 font-semibold' : 'text-white/40'}`}>Due {fmtDue(t.due_date)}</p>
              )}
            </div>
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
