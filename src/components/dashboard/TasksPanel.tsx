'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus, Check, Trash2, RotateCcw, ChevronDown, ChevronRight, Pencil, Repeat, ListChecks, History, BarChart3, ChevronLeft } from 'lucide-react';
import { createTask, updateTask, setTaskDone, deleteTask, listTaskHistory, monthlyTaskReport, dailyTaskBoard, type AcademyTask, type TaskReport, type MonthlyTaskSummary, type DailyBoardTask, type DailyBoardCompletion } from '@/lib/actions/tasks';

// Standard recurring academy chores — one tap pre-fills the title.
const PRESETS = [
  'Board inventory count',
  'Board cleaning & maintenance',
  'Wetsuit / lycra check',
  'First-aid kit check',
  'Leash & fin inspection',
];

function fmtDue(d: string | null) {
  if (!d) return null;
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(t: AcademyTask) {
  if (t.status === 'done' || !t.due_date) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(t.due_date + 'T00:00:00') < today;
}

export function TasksPanel({ initialTasks, assignees, academyId }: {
  initialTasks: AcademyTask[];
  assignees: { id: string; name: string }[];
  academyId: string | null;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<AcademyTask[]>(initialTasks);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [due, setDue] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [recDays, setRecDays] = useState<number[]>([]);
  const DOW = [
    { iso: 1, l: 'Mon' }, { iso: 2, l: 'Tue' }, { iso: 3, l: 'Wed' }, { iso: 4, l: 'Thu' },
    { iso: 5, l: 'Fri' }, { iso: 6, l: 'Sat' }, { iso: 7, l: 'Sun' },
  ];
  const [checklistText, setChecklistText] = useState('');
  const [attachTool, setAttachTool] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<TaskReport[]>([]);
  const [pending, start] = useTransition();

  function toggleHistory(taskId: string) {
    if (historyId === taskId) { setHistoryId(null); return; }
    setHistoryId(taskId);
    setHistory([]);
    start(async () => {
      try { setHistory(await listTaskHistory(taskId)); } catch { /* soft */ }
    });
  }

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const overdueCount = openTasks.filter(isOverdue).length;

  function submit() {
    setErr(null);
    if (!title.trim()) { setErr('Add a task title.'); return; }
    start(async () => {
      const res = await createTask({
        academy_id: academyId, title, assignee_coach_id: assignee || null, due_date: due || null,
        recurrence: recurrence || null,
        recurrence_days: recurrence === 'daily' ? recDays : null,
        checklist: checklistText.split('\n').map((s) => s.trim()).filter(Boolean),
        link_url: attachTool || null,
      });
      if (!res.ok || !res.task) { setErr(res.error || 'Could not create the task.'); return; }
      // Add it to the list immediately so a second task can be added right away.
      setTasks((prev) => [res.task!, ...prev]);
      setTitle(''); setAssignee(''); setDue(''); setRecurrence(''); setChecklistText(''); setAttachTool(''); setShowForm(false);
      router.refresh();
    });
  }

  function saveEdit(id: string, patch: { title: string; assignee_coach_id: string | null; due_date: string | null }) {
    setErr(null);
    if (!patch.title.trim()) { setErr('Title cannot be empty.'); return; }
    start(async () => {
      const res = await updateTask(id, patch);
      if (!res.ok || !res.task) { setErr(res.error || 'Could not update the task.'); return; }
      setTasks((prev) => prev.map((t) => (t.id === id ? res.task! : t)));
      setEditingId(null);
      router.refresh();
    });
  }

  function toggle(t: AcademyTask) {
    const done = t.status !== 'done';
    setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, status: done ? 'done' : 'open' } : x));
    start(async () => { await setTaskDone(t.id, done); router.refresh(); });
  }
  function remove(t: AcademyTask) {
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    start(async () => { await deleteTask(t.id); router.refresh(); });
  }

  return (
    <div className="mb-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tss-navy)]">
          <ClipboardList size={16} strokeWidth={1.75} />
          To-do list
          {openTasks.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{openTasks.length}</span>
          )}
          {overdueCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{overdueCount} overdue</span>
          )}
        </span>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* Create */}
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tss-navy)] hover:underline mb-3">
              <Plus size={14} /> New task
            </button>
          ) : (
            <div className="mb-4 rounded-xl border border-gray-200 p-3 space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p} onClick={() => setTitle(p)} className="text-[11px] px-2 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50">
                    {p}
                  </button>
                ))}
              </div>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title…"
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
              />
              <div className="flex gap-2 flex-wrap">
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 flex-1 min-w-[140px]">
                  <option value="">Assign to… (optional)</option>
                  {assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 text-gray-700" />
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-700">
                  <option value="">One-time</option>
                  <option value="daily">🔁 Daily (pick days)</option>
                  <option value="weekly">🔁 Weekly (standing)</option>
                  <option value="monthly">🔁 Monthly (standing)</option>
                </select>
                {recurrence === 'daily' && (
                  <div className="flex gap-1 flex-wrap items-center">
                    {DOW.map((d) => (
                      <button key={d.iso} type="button"
                        onClick={() => setRecDays((ds) => ds.includes(d.iso) ? ds.filter((x) => x !== d.iso) : [...ds, d.iso].sort())}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold border"
                        style={recDays.includes(d.iso)
                          ? { background: 'var(--tss-navy)', color: '#fff', borderColor: 'var(--tss-navy)' }
                          : { background: '#fff', color: '#6B7A82', borderColor: '#E2E8F0' }}>
                        {d.l}
                      </button>
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">{recDays.length === 0 ? 'No days = every day' : `${recDays.length} day${recDays.length === 1 ? '' : 's'}/week`}</span>
                  </div>
                )}
                <select value={attachTool} onChange={(e) => setAttachTool(e.target.value)} className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-700">
                  <option value="">No tool attached</option>
                  <option value="inventory">📦 Opens the academy inventory</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Steps / manual (optional — one step per line). The assignee ticks them off when doing the task.
                </label>
                <textarea
                  value={checklistText}
                  onChange={(e) => setChecklistText(e.target.value)}
                  rows={3}
                  placeholder={'1. Check leashes\n2. Check fins\n3. Report any damage'}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
                />
              </div>
              {err && <p className="text-xs text-red-600">{err}</p>}
              <div className="flex gap-2">
                <button onClick={submit} disabled={pending} className="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--tss-navy)] text-white disabled:opacity-50">
                  {pending ? 'Saving…' : 'Create task'}
                </button>
                <button onClick={() => { setShowForm(false); setErr(null); }} className="text-xs px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          )}

          {/* Open tasks */}
          {openTasks.length === 0 && doneTasks.length === 0 ? (
            <p className="text-[13px] text-gray-400">No tasks yet. Create one above.</p>
          ) : (
            <ul className="space-y-1.5">
              {openTasks.map((t) => (
                editingId === t.id ? (
                  <li key={t.id}>
                    <TaskEditForm task={t} assignees={assignees} pending={pending} onCancel={() => { setEditingId(null); setErr(null); }} onSave={(patch) => saveEdit(t.id, patch)} />
                  </li>
                ) : (
                  <li key={t.id} className="rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                      <button onClick={() => toggle(t)} className="w-5 h-5 shrink-0 rounded-md border-2 border-gray-300 hover:border-emerald-500 transition-colors" aria-label="Mark done" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">
                          {t.title}
                          {t.recurrence === 'daily' && (t as any).recurrence_days?.length ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-semibold">
                              <Repeat size={9} /> {((t as any).recurrence_days as number[]).map((n) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][n - 1]).join(' ')}
                            </span>
                          ) : t.recurrence && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-1.5 py-0.5 align-middle">
                              <Repeat size={9} /> {t.recurrence}
                            </span>
                          )}
                          {(t.checklist?.length ?? 0) > 0 && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-1.5 py-0.5 align-middle">
                              <ListChecks size={9} /> {t.checklist!.length} steps
                            </span>
                          )}
                          {t.link_url === 'inventory' && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 align-middle">
                              📦 inventory
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 flex gap-2 flex-wrap">
                          {t.assignee_name ? <span>{t.assignee_name}</span> : <span className="italic">Unassigned</span>}
                          {t.due_date && <span className={isOverdue(t) ? 'text-red-500 font-semibold' : ''}>Due {fmtDue(t.due_date)}</span>}
                        </p>
                      </div>
                      <button onClick={() => toggleHistory(t.id)} className={`p-1 transition-colors shrink-0 ${historyId === t.id ? 'text-[var(--tss-navy)]' : 'text-gray-300 hover:text-[var(--tss-navy)]'}`} aria-label="History"><History size={14} /></button>
                      <button onClick={() => { setEditingId(t.id); setErr(null); }} className="p-1 text-gray-300 hover:text-[var(--tss-navy)] transition-colors shrink-0" aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => remove(t)} className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0" aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                    {historyId === t.id && (
                      <div className="border-t border-gray-100 bg-gray-50/60 px-3 py-2">
                        {history.length === 0 ? (
                          <p className="text-[11px] text-gray-400 italic">{pending ? 'Loading…' : 'No reports yet for this task.'}</p>
                        ) : (
                          <ul className="space-y-1">
                            {history.map((h) => (
                              <li key={h.id} className="text-[11px]">
                                <span className={h.outcome === 'done' ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                                  {h.outcome === 'done' ? '✓ Done' : '✗ Not done'}
                                </span>{' '}
                                <span className="text-gray-500">
                                  · {h.completed_by_name || '—'} · {fmtDue(h.created_at.slice(0, 10))}
                                </span>
                                {h.comment && <span className="text-gray-600"> — “{h.comment}”</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                )
              ))}
            </ul>
          )}

          <DailyBoard academyId={academyId} />

          <MonthlyReport academyId={academyId} />

          {/* Done tasks */}
          {doneTasks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-300 mb-1">Done ({doneTasks.length})</p>
              {doneTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2.5 list-none px-3 py-1.5">
                  <button onClick={() => toggle(t)} className="w-5 h-5 shrink-0 rounded-md bg-emerald-500 flex items-center justify-center text-white" aria-label="Reopen"><Check size={12} /></button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 line-through truncate">{t.title}</p>
                    {(t.done_by_name || t.done_at) && (
                      <p className="text-[10px] text-emerald-600/70">
                        ✓ {t.done_by_name || 'Done'}{t.done_at ? ` · ${fmtDue(t.done_at.slice(0, 10))}` : ''}
                      </p>
                    )}
                  </div>
                  <button onClick={() => toggle(t)} className="p-1 text-gray-300 hover:text-gray-500" aria-label="Reopen"><RotateCcw size={13} /></button>
                  <button onClick={() => remove(t)} className="p-1 text-gray-300 hover:text-red-500" aria-label="Delete"><Trash2 size={13} /></button>
                </li>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tablero LIVE del día: qué toca hoy, quién, y el hilo de reportes con
// comentarios — se refresca solo cada 30 s mientras está abierto. ───
function DailyBoard({ academyId }: { academyId: string | null }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10));
  const [tasks, setTasks] = useState<DailyBoardTask[]>([]);
  const [comps, setComps] = useState<DailyBoardCompletion[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    let alive = true;
    const load = async () => {
      try {
        const r = await dailyTaskBoard(academyId, date);
        if (alive && r.ok) {
          setTasks(r.tasks); setComps(r.completions);
          setUpdatedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
        }
      } catch { /* el próximo tick reintenta */ }
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(iv); };
  }, [open, date, academyId]);

  const shiftDay = (delta: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };
  const pend = tasks.filter((t) => !t.done_today && t.status !== 'done');
  const DOWL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tss-navy)] hover:underline"
      >
        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
        Today · live board {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-gray-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => shiftDay(-1)} className="p-1 text-gray-400 hover:text-[var(--tss-navy)]" aria-label="Previous day"><ChevronLeft size={14} /></button>
            <div className="text-center">
              <p className="text-xs font-semibold text-[var(--tss-navy)]">
                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              {updatedAt && <p className="text-[9px] text-gray-400">auto-refresh 30s · updated {updatedAt}</p>}
            </div>
            <button onClick={() => shiftDay(1)} className="p-1 text-gray-400 hover:text-[var(--tss-navy)]" aria-label="Next day"><ChevronRight size={14} /></button>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Due this day · {pend.length} pending</p>
          <div className="space-y-1 mb-3">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5"
                style={{ background: t.done_today ? '#ECFDF5' : t.overdue ? '#FEF2F2' : '#F8FAFC' }}>
                <p className="text-[12px] truncate" style={{ textDecoration: t.done_today ? 'line-through' : 'none', color: '#0C2231' }}>
                  {t.done_today ? '✅ ' : t.overdue ? '⚠ ' : '⬜ '}{t.title}
                  {t.recurrence === 'daily' && t.recurrence_days?.length ? (
                    <span className="text-[9px] text-cyan-700 ml-1">({t.recurrence_days.map((n) => DOWL[n - 1]).join(' ')})</span>
                  ) : null}
                </p>
                <p className="text-[10.5px] shrink-0 text-gray-500">
                  {t.assignee_name ?? 'Unassigned'}{t.overdue && !t.done_today ? ` · overdue ${t.due_date}` : ''}
                </p>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-[11px] text-gray-400">Nothing due this day.</p>}
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Reported · {comps.length}</p>
          <div className="space-y-1">
            {comps.map((c, i) => (
              <div key={i} className="rounded-lg px-2.5 py-1.5" style={{ background: c.outcome === 'done' ? '#ECFDF5' : '#FFF7ED' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium truncate" style={{ color: '#0C2231' }}>
                    {c.outcome === 'done' ? '✅' : '❌'} {c.task_title}
                  </p>
                  <p className="text-[10px] shrink-0 text-gray-400">
                    {new Date(c.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · {c.completed_by_name ?? '—'}
                  </p>
                </div>
                {c.comment && <p className="text-[11px] italic text-gray-500 mt-0.5">&ldquo;{c.comment}&rdquo;</p>}
              </div>
            ))}
            {comps.length === 0 && <p className="text-[11px] text-gray-400">No reports yet this day.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// The month in one view: every report logged by the team, by person and by
// task — the coordinator's compliance report. Loads on demand.
function MonthlyReport({ academyId }: { academyId: string | null }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<MonthlyTaskSummary | null>(null);
  const [pending, start] = useTransition();

  function load(m: string) {
    setMonth(m);
    start(async () => {
      try { setData(await monthlyTaskReport(academyId, m)); } catch { setData(null); }
    });
  }
  function shift(delta: number) {
    const d = new Date(month + '-01T00:00:00');
    d.setMonth(d.getMonth() + delta);
    load(d.toISOString().slice(0, 7));
  }
  const monthLabel = new Date(month + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const rate = data && data.total > 0 ? Math.round((100 * data.done) / data.total) : null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={() => { if (!open && !data) load(month); setOpen((o) => !o); }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tss-navy)] hover:underline"
      >
        <BarChart3 size={13} /> Monthly report {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-gray-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => shift(-1)} className="p-1 text-gray-400 hover:text-[var(--tss-navy)]" aria-label="Previous month"><ChevronLeft size={14} /></button>
            <p className="text-xs font-semibold text-[var(--tss-navy)]">{monthLabel}</p>
            <button onClick={() => shift(1)} className="p-1 text-gray-400 hover:text-[var(--tss-navy)]" aria-label="Next month"><ChevronRight size={14} /></button>
          </div>
          {pending ? (
            <p className="text-[11px] text-gray-400 italic">Loading…</p>
          ) : !data || data.total === 0 ? (
            <p className="text-[11px] text-gray-400">No task reports logged this month.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg bg-gray-50 px-2 py-1.5 text-center">
                  <p className="text-lg font-extrabold text-[var(--tss-navy)] leading-none">{data.total}</p>
                  <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-1">reports</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-2 py-1.5 text-center">
                  <p className="text-lg font-extrabold text-emerald-600 leading-none">{data.done}</p>
                  <p className="text-[9px] uppercase tracking-wide text-emerald-600/70 mt-1">done</p>
                </div>
                <div className="rounded-lg bg-red-50 px-2 py-1.5 text-center">
                  <p className="text-lg font-extrabold text-red-600 leading-none">{data.notDone}</p>
                  <p className="text-[9px] uppercase tracking-wide text-red-500/70 mt-1">not done</p>
                </div>
              </div>
              {rate !== null && (
                <p className="text-[11px] text-gray-500 mb-3">Completion rate: <strong className={rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}>{rate}%</strong></p>
              )}
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-300 mb-1">By person</p>
              <ul className="space-y-0.5 mb-3">
                {data.byPerson.map((p) => (
                  <li key={p.name} className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="font-mono text-[11px]">
                      <span className="text-emerald-600">{p.done} ✓</span>
                      {p.notDone > 0 && <span className="text-red-500"> · {p.notDone} ✗</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-300 mb-1">By task</p>
              <ul className="space-y-1">
                {data.byTask.map((t) => (
                  <li key={t.title} className="text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 truncate">{t.title}</span>
                      <span className="font-mono text-[11px] shrink-0 ml-2">
                        <span className="text-emerald-600">{t.done} ✓</span>
                        {t.notDone > 0 && <span className="text-red-500"> · {t.notDone} ✗</span>}
                      </span>
                    </div>
                    {t.notDoneComments.length > 0 && (
                      <p className="text-[10px] text-red-400 italic truncate">“{t.notDoneComments[t.notDoneComments.length - 1]}”</p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TaskEditForm({ task, assignees, pending, onSave, onCancel }: {
  task: AcademyTask;
  assignees: { id: string; name: string }[];
  pending: boolean;
  onSave: (patch: { title: string; assignee_coach_id: string | null; due_date: string | null }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee_coach_id ?? '');
  const [due, setDue] = useState(task.due_date ?? '');

  return (
    <div className="rounded-xl border border-[var(--tss-cyan,#5AC3E7)] bg-cyan-50/30 p-3 space-y-2.5">
      <input
        value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title…"
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)]"
      />
      <div className="flex gap-2 flex-wrap">
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 flex-1 min-w-[140px]">
          <option value="">Unassigned</option>
          {assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 text-gray-700" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ title, assignee_coach_id: assignee || null, due_date: due || null })} disabled={pending} className="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--tss-navy)] text-white disabled:opacity-50">
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        <button onClick={onCancel} className="text-xs px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Cancel</button>
      </div>
    </div>
  );
}
