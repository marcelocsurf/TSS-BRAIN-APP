// Shared helper used by /api/coaches/invite and /api/coaches/resend-invite.
//
// Supabase's `auth.admin.generateLink({ type: 'invite' })` is the
// "invite NEW user" call — it FAILS when the auth user already exists.
// For a coach who was already invited once (auth_user_id present) but
// never activated their password, we must use `type: 'magiclink'`
// instead to mint a fresh one-time login URL.
//
// Strategy:
//   - If the caller KNOWS an auth user exists, jump straight to magiclink
//   - Otherwise try 'invite' first
//   - If 'invite' fails with a "user already exists" error, fall back
//     to 'magiclink' automatically — covers legacy / orphan auth rows
//
// In both cases /auth/callback resolves to /set-password whenever
// password_set_at IS NULL, so the user lands in the same place.

import type { SupabaseClient } from '@supabase/supabase-js';

interface Args {
  /** Service-role client. */
  admin: SupabaseClient;
  /** Lower-cased email. */
  email: string;
  /** Whether an auth.users row already exists for this email. */
  hasExistingAuthUser: boolean;
  /** Where to land after the auth code is exchanged. */
  redirectTo: string;
  /** Optional user metadata to set on first create (only used for invite). */
  userMetadata?: Record<string, unknown>;
}

interface Result {
  user: { id: string; email?: string | null } | null;
  inviteLink: string | null;
  /** The one-time token_hash — used to build a /auth/confirm URL that
   * verifies server-side (the PKCE action_link silently fails for
   * admin-generated links). */
  hashedToken: string | null;
  /** Which link type Supabase actually generated. */
  linkType: 'invite' | 'magiclink' | null;
  error: string | null;
}

async function generateMagic(
  admin: SupabaseClient,
  email: string,
  redirectTo: string,
): Promise<Result> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  });
  if (error || !data?.properties?.action_link) {
    return {
      user: null,
      inviteLink: null,
      hashedToken: null,
      linkType: null,
      error: error?.message ?? 'magiclink failed',
    };
  }
  return {
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    inviteLink: data.properties.action_link,
    hashedToken: data.properties.hashed_token ?? null,
    linkType: 'magiclink',
    error: null,
  };
}

export async function generateCoachInviteLink({
  admin,
  email,
  hasExistingAuthUser,
  redirectTo,
  userMetadata,
}: Args): Promise<Result> {
  if (hasExistingAuthUser) {
    return generateMagic(admin, email, redirectTo);
  }

  // Try 'invite' first — creates the auth row AND returns the
  // activation link in one shot.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      data: userMetadata,
      redirectTo,
    },
  });

  if (!error && data?.user && data?.properties?.action_link) {
    return {
      user: { id: data.user.id, email: data.user.email },
      inviteLink: data.properties.action_link,
      hashedToken: data.properties.hashed_token ?? null,
      linkType: 'invite',
      error: null,
    };
  }

  // Defensive fallback: auth user might exist orphaned (no matching
  // coach row). Supabase returns various error messages here depending
  // on version — match the common ones.
  const msg = (error?.message ?? '').toLowerCase();
  if (
    msg.includes('already') ||
    msg.includes('registered') ||
    msg.includes('exists')
  ) {
    return generateMagic(admin, email, redirectTo);
  }

  return {
    user: null,
    inviteLink: null,
    hashedToken: null,
    linkType: null,
    error: error?.message ?? 'Could not generate invite link.',
  };
}
