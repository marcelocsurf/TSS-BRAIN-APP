'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendPasswordResetEmail } from './email';

// Request a password reset for a coach/coordinator/admin by email.
// Always returns success — we never confirm whether the email exists
// (prevents account enumeration). If the email doesn't map to a coach
// row, we silently no-op.
export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) {
    return { success: false, error: 'Please enter a valid email.' };
  }

  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id, first_name, email')
    .eq('email', normalized)
    .maybeSingle();

  if (!coach) {
    return { success: true };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app';
  // Same redirect the invite flow uses (proven to be in Supabase's
  // allow-list). The callback itself routes to /set-password because
  // we clear password_set_at below.
  const redirectTo = `${appUrl}/auth/callback?next=/`;

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: normalized,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    console.error('[password-reset] generateLink failed', error);
    return { success: false, error: 'Could not generate reset link.' };
  }

  // Clear password_set_at so the callback routes through /set-password
  // even if the user clicks an old session link from another device.
  await admin
    .from('coaches')
    .update({ password_set_at: null })
    .eq('id', coach.id);

  const sendResult = await sendPasswordResetEmail({
    toEmail: coach.email,
    firstName: coach.first_name || 'there',
    resetLink: data.properties.action_link,
  });

  if (!sendResult.success) {
    return { success: false, error: sendResult.error };
  }

  return { success: true };
}
