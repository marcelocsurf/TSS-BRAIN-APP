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
    .select('id, title, description, assignee_coach_id, due_date, status, created_at, done_at, coaches:assignee_coach_id(display_name)')
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (academyId) q = q.eq('academy_id', academyId);
  const { data } = await q;
  return (data ?? []).map((r: any) => ({
    id: r.id, title: r.title, description: r.description, assignee_coach_id: r.assignee_coach_id,
    assignee_name: (Array.isArray(r.coaches) ? r.coaches[0] : r.coaches)?.display_name ?? null,
    due_date: r.due_date, status: r.status, created_at: r.created_at, done_at: r.done_at,
  }));
}

export async function createTask(input: {
  academy_id: string | null;
  title: string;
  description?: string | null;
  assignee_coach_id?: string | null;
  due_date?: string | null;
}): Promise<{ ok: boolean; error?: string; task?: AcademyTask }> {
  const me = await assertManager();
  if (!input.title?.trim()) return { ok: false, error: 'A task title is required.' };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('academy_tasks')
    .insert({
      academy_id: input.academy_id ?? (me as any).academy_id ?? null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      assignee_coach_id: input.assignee_coach_id || null,
      due_date: input.due_date || null,
      created_by: (me as any).id ?? null,
    })
    .select('id, title, description, assignee_coach_id, due_date, status, created_at, done_at, coaches:assignee_coach_id(display_name)')
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
    .select('id, title, description, assignee_coach_id, due_date, status, created_at, done_at')
    .eq('assignee_coach_id', coach.id)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  return (data ?? []).map((r: any) => ({ ...r, assignee_name: null })) as AcademyTask[];
}

export async function completeMyTask(token: string, id: string): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id').eq('portal_token', token).maybeSingle();
  if (!coach) return { ok: false, error: 'Coach not found.' };
  const { error } = await admin
    .from('academy_tasks')
    .update({ status: 'done', done_at: new Date().toISOString(), done_by: coach.id })
    .eq('id', id)
    .eq('assignee_coach_id', coach.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
