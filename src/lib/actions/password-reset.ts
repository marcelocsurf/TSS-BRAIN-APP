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

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: normalized,
  });

  if (error || !data?.properties?.hashed_token) {
    console.error('[password-reset] generateLink failed', error);
    return { success: false, error: 'Could not generate reset link.' };
  }

  // Build the link ourselves using the one-time token_hash → /auth/confirm
  // runs verifyOtp server-side (no PKCE code_verifier needed). This is the
  // documented pattern for admin-generated email links; the PKCE `?code=`
  // action_link silently fails because the browser has no code_verifier.
  const resetLink =
    `${appUrl}/auth/confirm` +
    `?token_hash=${encodeURIComponent(data.properties.hashed_token)}` +
    `&type=recovery&next=/set-password`;

  // Clear password_set_at so /auth/confirm routes through /set-password.
  await admin
    .from('coaches')
    .update({ password_set_at: null })
    .eq('id', coach.id);

  const sendResult = await sendPasswordResetEmail({
    toEmail: coach.email,
    firstName: coach.first_name || 'there',
    resetLink,
  });

  if (!sendResult.success) {
    return { success: false, error: sendResult.error };
  }

  return { success: true };
}
