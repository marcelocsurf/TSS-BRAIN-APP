'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// Stamps coaches.password_set_at to now() for the currently-authenticated
// coach. Called by the /set-password page after Supabase confirms the new
// password. Without this stamp the next /auth/callback would loop the
// user back to /set-password.
export async function markCoachPasswordSet(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated.');

  const admin = createAdminClient();
  await admin
    .from('coaches')
    .update({ password_set_at: new Date().toISOString() })
    .eq('auth_user_id', user.id);
}
