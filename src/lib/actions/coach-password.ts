'use server';

// Admin-only: set a coach's password directly (and confirm their email), so a
// coach who can't complete the email activation link can still log in. The
// admin shares the password with the coach, who logs in and can change it later.
// This bypasses the one-time magic link entirely — the reliable fallback.

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from './auth';
import { revalidatePath } from 'next/cache';

export async function setCoachTempPassword(
  coachId: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) return { ok: false, error: 'Only the platform admin can do this.' };

  if (!password || password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, auth_user_id')
    .eq('id', coachId)
    .single();

  if (!coach?.auth_user_id) {
    return { ok: false, error: 'This coach has no auth account yet — resend the invite first.' };
  }

  // Set the password AND confirm the email in one call, so sign-in works
  // immediately (an unconfirmed email blocks password sign-in).
  const { error } = await admin.auth.admin.updateUserById(coach.auth_user_id, {
    password,
    email_confirm: true,
  });
  if (error) return { ok: false, error: error.message };

  await admin.from('coaches').update({ password_set_at: new Date().toISOString() }).eq('id', coachId);

  revalidatePath(`/coaches/${coachId}`);
  return { ok: true };
}
