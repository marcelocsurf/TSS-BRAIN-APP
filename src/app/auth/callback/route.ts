import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const admin = createAdminClient();

      // Link auth_user_id to coach record by email (idempotent — usually
      // the invite endpoint already set it).
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

      // If the coach has never set a password — first invite OR a password
      // recovery — force them through /set-password before anywhere else.
      if (coach && !coach.password_set_at) {
        return NextResponse.redirect(`${origin}/set-password`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
