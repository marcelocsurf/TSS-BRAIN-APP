import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Token-hash confirmation handler — the robust server-side pattern for
// email links generated via admin generateLink(). Unlike the PKCE
// `?code=` flow (which needs a browser-stored code_verifier that does
// NOT exist for admin-generated links), verifyOtp({ token_hash }) sets
// the session purely from the one-time token, server-side via cookies.
//
// Used by: password reset (type=recovery), and any future invite/
// magiclink emails that embed `?token_hash=...&type=...`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as
    | 'recovery'
    | 'invite'
    | 'magiclink'
    | 'email'
    | 'signup'
    | null;
  const next = searchParams.get('next') ?? '/';

  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error && data.user) {
      const admin = createAdminClient();

      // Link auth_user_id to coach record by email (idempotent).
      const { data: coach } = await admin
        .from('coaches')
        .select('id, auth_user_id, password_set_at')
        .eq('email', data.user.email!)
        .single();

      if (coach && !coach.auth_user_id) {
        await admin
          .from('coaches')
          .update({ auth_user_id: data.user.id })
          .eq('id', coach.id);
      }

      // No password yet (fresh invite OR recovery) → force /set-password.
      if (coach && !coach.password_set_at) {
        return NextResponse.redirect(`${origin}/set-password`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`);
}
