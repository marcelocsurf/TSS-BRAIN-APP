'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from './auth';
import { revalidatePath } from 'next/cache';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

// Internal helper — insert a notification for a coach. Never throws into
// the caller's main flow (notifications are best-effort).
export async function createNotification(input: {
  recipientCoachId: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from('notifications').insert({
      recipient_coach_id: input.recipientCoachId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      metadata: input.metadata ?? null,
    });
  } catch (err) {
    console.error('[createNotification] failed', err);
  }
}

// For the dashboard coach (admin/coordinator/coach logged in via session).
export async function getMyNotifications(): Promise<AppNotification[]> {
  const me = await getCurrentCoach();
  if (!me) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('notifications')
    .select('id, type, title, body, link, read_at, created_at')
    .eq('recipient_coach_id', me.id)
    .order('created_at', { ascending: false })
    .limit(30);
  return (data ?? []) as AppNotification[];
}

export async function getUnreadCount(): Promise<number> {
  const me = await getCurrentCoach();
  if (!me) return 0;
  const admin = createAdminClient();
  const { count } = await admin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_coach_id', me.id)
    .is('read_at', null);
  return count ?? 0;
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  const me = await getCurrentCoach();
  if (!me) return;
  const admin = createAdminClient();
  let q = admin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_coach_id', me.id)
    .is('read_at', null);
  if (ids && ids.length) q = q.in('id', ids);
  await q;
  revalidatePath('/dashboard');
}
