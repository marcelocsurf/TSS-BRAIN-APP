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

      // Link auth_user_id to coach record by email
      const { data: coach } = await admin
        .from('coaches')
        .select('id, auth_user_id')
        .eq('email', data.user.email!)
        .single();

      const isFirstLogin = coach && !coach.auth_user_id;

      if (isFirstLogin) {
        await admin
          .from('coaches')
          .update({ auth_user_id: data.user.id })
          .eq('id', coach.id);

        // First time — send to set password
        return NextResponse.redirect(`${origin}/set-password`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
