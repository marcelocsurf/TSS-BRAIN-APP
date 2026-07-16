'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { createNotification } from '@/lib/actions/notifications';
import { revalidatePath } from 'next/cache';

export interface AcademyTask {
  id: string;
  title: string;
  description: string | null;
  assignee_coach_id: string | null;
  assignee_name: string | null;
  due_date: string | null;
  status: string;         // 'open' | 'done'
  created_at: string;
  done_at: string | null;
  done_by_name?: string | null;
  // v2 — standing (recurring) tasks + step-by-step manual
  recurrence?: string | null;     // null | 'weekly' | 'monthly'
  checklist?: string[] | null;    // ordered steps ("the manual")
  link_url?: string | null;       // in-app tool link ('inventory' opens the academy inventory)
}

export interface TaskReport {
  id: string;
  task_id: string;
  task_title?: string | null;
  outcome: string;               // 'done' | 'not_done'
  comment: string | null;
  checklist_state: Record<string, boolean> | null;
  completed_by_name: string | null;
  created_at: string;
}

// Next occurrence for a standing task: weekly +7 days, monthly +1 month —
// anchored on the CURRENT due date when set (keeps the cadence stable even
// if it's completed early/late), else on today.
function nextDueDate(current: string | null, recurrence: string): string {
  const base = current ? new Date(current + 'T00:00:00') : new Date();
  if (recurrence === 'weekly') base.setDate(base.getDate() + 7);
  else base.setMonth(base.getMonth() + 1);
  return base.toISOString().slice(0, 10);
}

async function assertManager() {
  const me = await getCurrentCoach().catch(() => null);
  if (!me || !(await isCoordinatorOrAbove(me.role))) {
    throw new Error('Only a coordinator or admin can manage tasks.');
  }
  return me;
}

// Coaches/staff in the academy that a task can be assigned to.
export async function listTaskAssignees(academyId: string | null): Promise<{ id: string; name: string }[]> {
  await assertManager();
  const admin = createAdminClient();
  let q = admin.from('coaches').select('id, display_name, active_status').order('display_name');
  if (academyId) q = q.eq('academy_id', academyId);
  const { data } = await q;
  return (data ?? []).filter((c: any) => c.active_status !== false).map((c: any) => ({ id: c.id, name: c.display_name || 'Coach' }));
}

export async function listAcademyTasks(academyId: string | null): Promise<AcademyTask[]> {
  await assertManager();
  const admin = createAdminClient();
  let q = admin
    .from('academy_tasks')
    .select('id, title, description, assignee_coach_id, due_date, status, created_at, done_at, recurrence, checklist, link_url, coaches:assignee_coach_id(display_name), done_coach:done_by(display_name)')
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (academyId) q = q.eq('academy_id', academyId);
  const { data } = await q;
  return (data ?? []).map((r: any) => ({
    id: r.id, title: r.title, description: r.description, assignee_coach_id: r.assignee_coach_id,
    assignee_name: (Array.isArray(r.coaches) ? r.coaches[0] : r.coaches)?.display_name ?? null,
    done_by_name: (Array.isArray(r.done_coach) ? r.done_coach[0] : r.done_coach)?.display_name ?? null,
    due_date: r.due_date, status: r.status, created_at: r.created_at, done_at: r.done_at,
    recurrence: r.recurrence ?? null, checklist: r.checklist ?? null, link_url: r.link_url ?? null,
  }));
}

export async function createTask(input: {
  academy_id: string | null;
  title: string;
  description?: string | null;
  assignee_coach_id?: string | null;
  due_date?: string | null;
  recurrence?: string | null;   // null | 'weekly' | 'monthly'
  checklist?: string[] | null;  // manual steps
  link_url?: string | null;     // 'inventory' attaches the academy inventory
}): Promise<{ ok: boolean; error?: string; task?: AcademyTask }> {
  const me = await assertManager();
  if (!input.title?.trim()) return { ok: false, error: 'A task title is required.' };
  const recurrence = input.recurrence === 'weekly' || input.recurrence === 'monthly' ? input.recurrence : null;
  const checklist = (input.checklist ?? []).map((s) => s.trim()).filter(Boolean);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('academy_tasks')
    .insert({
      academy_id: input.academy_id ?? (me as any).academy_id ?? null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      assignee_coach_id: input.assignee_coach_id || null,
      // A standing task always needs a next-occurrence date to cycle on.
      due_date: input.due_date || (recurrence ? new Date().toISOString().slice(0, 10) : null),
      recurrence,
      checklist: checklist.length > 0 ? checklist : null,
      link_url: input.link_url?.trim() || null,
      created_by: (me as any).id ?? null,
    })
    .select('id, title, description, assignee_coach_id, due_date, status, created_at, done_at, recurrence, checklist, link_url, coaches:assignee_coach_id(display_name)')
    .single();
  if (error) return { ok: false, error: error.message };

  // Notify the assignee (best-effort).
  if (input.assignee_coach_id) {
    await createNotification({
      recipientCoachId: input.assignee_coach_id,
      type: 'task',
      title: `New task: ${input.title.trim()}`,
      body: input.due_date ? `Due ${input.due_date}. Open your portal to see it.` : 'Open your portal to see it.',
      link: null,
      metadata: { taskId: data?.id },
    }).catch(() => {});
  }
  revalidatePath('/dashboard');
  const task: AcademyTask = {
    id: data!.id, title: data!.title, description: data!.description, assignee_coach_id: data!.assignee_coach_id,
    assignee_name: (Array.isArray((data as any).coaches) ? (data as any).coaches[0] : (data as any).coaches)?.display_name ?? null,
    due_date: data!.due_date, status: data!.status, created_at: data!.created_at, done_at: data!.done_at,
    recurrence: (data as any).recurrence ?? null, checklist: (data as any).checklist ?? null,
    link_url: (data as any).link_url ?? null,
  };
  return { ok: true, task };
}

export async function updateTask(id: string, patch: {
  title?: string;
  assignee_coach_id?: string | null;
  due_date?: string | null;
}): Promise<{ ok: boolean; error?: string; task?: AcademyTask }> {
  await assertManager();
  const fields: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    if (!patch.title.trim()) return { ok: false, error: 'Title cannot be empty.' };
    fields.title = patch.title.trim();
  }
  if (patch.assignee_coach_id !== undefined) fields.assignee_coach_id = patch.assignee_coach_id || null;
  if (patch.due_date !== undefined) fields.due_date = patch.due_date || null;
  if (Object.keys(fields).length === 0) return { ok: false, error: 'Nothing to update.' };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('academy_tasks')
    .update(fields)
    .eq('id', id)
    .select('id, title, description, assignee_coach_id, due_date, status, created_at, done_at, coaches:assignee_coach_id(display_name)')
    .single();
  if (error) return { ok: false, error: error.message };

  // If the assignee changed to someone new, notify them (best-effort).
  if (patch.assignee_coach_id) {
    await createNotification({
      recipientCoachId: patch.assignee_coach_id,
      type: 'task',
      title: `Task assigned to you: ${data!.title}`,
      body: data!.due_date ? `Due ${data!.due_date}. Open your portal to see it.` : 'Open your portal to see it.',
      link: null,
      metadata: { taskId: id },
    }).catch(() => {});
  }
  revalidatePath('/dashboard');
  const task: AcademyTask = {
    id: data!.id, title: data!.title, description: data!.description, assignee_coach_id: data!.assignee_coach_id,
    assignee_name: (Array.isArray((data as any).coaches) ? (data as any).coaches[0] : (data as any).coaches)?.display_name ?? null,
    due_date: data!.due_date, status: data!.status, created_at: data!.created_at, done_at: data!.done_at,
  };
  return { ok: true, task };
}

export async function setTaskDone(id: string, done: boolean): Promise<{ ok: boolean; error?: string }> {
  const me = await assertManager();
  const admin = createAdminClient();
  const { error } = await admin
    .from('academy_tasks')
    .update({ status: done ? 'done' : 'open', done_at: done ? new Date().toISOString() : null, done_by: done ? ((me as any).id ?? null) : null })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteTask(id: string): Promise<{ ok: boolean; error?: string }> {
  await assertManager();
  const admin = createAdminClient();
  const { error } = await admin.from('academy_tasks').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}

// ── Coach-facing (token-gated) ──────────────────────────────────
export async function getMyTasks(token: string): Promise<AcademyTask[]> {
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id').eq('portal_token', token).maybeSingle();
  if (!coach) return [];
  const { data } = await admin
    .from('academy_tasks')
    .select('id, title, description, assignee_coach_id, due_date, status, created_at, done_at, recurrence, checklist, link_url')
    .eq('assignee_coach_id', coach.id)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  return (data ?? []).map((r: any) => ({ ...r, assignee_name: null })) as AcademyTask[];
}

// The assignee reports the outcome of their task: done (optional comment) or
// not_done (comment REQUIRED — why it didn't happen). Every report is logged
// in task_completions so the coordinator keeps a full history. Standing
// (recurring) tasks re-open themselves with the next occurrence date.
export async function reportMyTask(
  token: string,
  id: string,
  outcome: 'done' | 'not_done',
  comment: string,
  checklistState?: Record<string, boolean> | null,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, display_name').eq('portal_token', token).maybeSingle();
  if (!coach) return { ok: false, error: 'Coach not found.' };
  if (outcome === 'not_done' && !comment.trim()) {
    return { ok: false, error: 'Please explain why the task was not done.' };
  }

  const { data: task } = await admin
    .from('academy_tasks')
    .select('id, title, academy_id, due_date, recurrence, created_by')
    .eq('id', id)
    .eq('assignee_coach_id', coach.id)
    .maybeSingle();
  if (!task) return { ok: false, error: 'Task not found or not assigned to you.' };

  // 1. Log the report (the coordinator's control trail).
  const { error: logErr } = await admin.from('task_completions').insert({
    task_id: task.id,
    academy_id: task.academy_id ?? null,
    outcome,
    comment: comment.trim() || null,
    checklist_state: checklistState ?? null,
    completed_by: coach.id,
  });
  if (logErr) return { ok: false, error: logErr.message };

  // 2. Cycle or close the task itself.
  if (task.recurrence === 'weekly' || task.recurrence === 'monthly') {
    // Standing task: immediately re-open for the next occurrence.
    await admin
      .from('academy_tasks')
      .update({
        status: 'open',
        done_at: null,
        done_by: null,
        due_date: nextDueDate(task.due_date, task.recurrence),
        overdue_emailed_at: null,
      })
      .eq('id', task.id);
  } else if (outcome === 'done') {
    await admin
      .from('academy_tasks')
      .update({ status: 'done', done_at: new Date().toISOString(), done_by: coach.id })
      .eq('id', task.id);
  }
  // one-off + not_done → stays open (it still has to happen).

  // 3. Close the loop with the coordinator who created it.
  if (task.created_by && task.created_by !== coach.id) {
    await createNotification({
      recipientCoachId: task.created_by,
      type: outcome === 'done' ? 'task_done' : 'task_not_done',
      title: outcome === 'done' ? `Task done: ${task.title}` : `Task NOT done: ${task.title}`,
      body:
        outcome === 'done'
          ? `${coach.display_name || 'The assignee'} completed it${comment.trim() ? ` — "${comment.trim()}"` : ''}.`
          : `${coach.display_name || 'The assignee'}: "${comment.trim()}"`,
      link: null,
      metadata: { taskId: id, outcome },
    }).catch(() => {});
  }
  return { ok: true };
}

// Coordinator/admin: full report history of one task (who, when, outcome, why).
export async function listTaskHistory(taskId: string): Promise<TaskReport[]> {
  await assertManager();
  const admin = createAdminClient();
  const { data } = await admin
    .from('task_completions')
    .select('id, task_id, outcome, comment, checklist_state, created_at, coaches:completed_by(display_name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(30);
  return (data ?? []).map((r: any) => ({
    id: r.id, task_id: r.task_id, outcome: r.outcome, comment: r.comment,
    checklist_state: r.checklist_state ?? null,
    completed_by_name: (Array.isArray(r.coaches) ? r.coaches[0] : r.coaches)?.display_name ?? null,
    created_at: r.created_at,
  }));
}

// Coordinator/admin: latest reports across the academy — the "not done +
// why" trail surfaces here for control.
export async function listRecentTaskReports(academyId: string | null, limit = 10): Promise<TaskReport[]> {
  await assertManager();
  const admin = createAdminClient();
  let q = admin
    .from('task_completions')
    .select('id, task_id, outcome, comment, checklist_state, created_at, coaches:completed_by(display_name), academy_tasks:task_id(title)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (academyId) q = q.eq('academy_id', academyId);
  const { data } = await q;
  return (data ?? []).map((r: any) => ({
    id: r.id, task_id: r.task_id, outcome: r.outcome, comment: r.comment,
    checklist_state: r.checklist_state ?? null,
    completed_by_name: (Array.isArray(r.coaches) ? r.coaches[0] : r.coaches)?.display_name ?? null,
    task_title: (Array.isArray(r.academy_tasks) ? r.academy_tasks[0] : r.academy_tasks)?.title ?? null,
    created_at: r.created_at,
  }));
}

export async function completeMyTask(token: string, id: string): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, display_name').eq('portal_token', token).maybeSingle();
  if (!coach) return { ok: false, error: 'Coach not found.' };
  const { data: updated, error } = await admin
    .from('academy_tasks')
    .update({ status: 'done', done_at: new Date().toISOString(), done_by: coach.id })
    .eq('id', id)
    .eq('assignee_coach_id', coach.id)
    .select('title, created_by')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  // Close the loop — tell the coordinator who created it that it's done.
  if (updated?.created_by && updated.created_by !== coach.id) {
    await createNotification({
      recipientCoachId: updated.created_by,
      type: 'task_done',
      title: `Task done: ${updated.title}`,
      body: `${coach.display_name || 'The assignee'} marked it complete.`,
      link: null,
      metadata: { taskId: id },
    }).catch(() => {});
  }
  return { ok: true };
}
