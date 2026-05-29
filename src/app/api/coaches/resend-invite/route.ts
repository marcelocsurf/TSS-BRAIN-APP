import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendCoachInviteEmail } from '@/lib/actions/email';

// Re-issues the magic link for a coach that hasn't activated yet and
// re-sends the branded invite email. Only the platform admin can call
// this. Idempotent — produces a fresh, single-use link each call.

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentCoach } = await supabase
      .from('coaches')
      .select('is_platform_admin')
      .eq('auth_user_id', user.id)
      .single();
    if (!currentCoach?.is_platform_admin) {
      return NextResponse.json(
        { error: 'Only the TSS platform administrator can resend invites.' },
        { status: 403 },
      );
    }

    const { coach_id } = await req.json();
    if (!coach_id) {
      return NextResponse.json({ error: 'Missing coach_id.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: coach, error: coachErr } = await admin
      .from('coaches')
      .select('id, email, first_name, role, academy_id, password_set_at, academies(name)')
      .eq('id', coach_id)
      .single();
    if (coachErr || !coach) {
      return NextResponse.json({ error: 'Coach not found.' }, { status: 404 });
    }

    // Don't regenerate an invite link if the coach has already activated
    // their account — that would let anyone with admin access reset
    // their password silently. They should use the password-reset flow
    // instead.
    if (coach.password_set_at) {
      return NextResponse.json(
        {
          error:
            'This coach has already activated their account. Use the password reset flow if they forgot their password.',
        },
        { status: 400 },
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app';
    const redirectTo = `${appUrl}/auth/callback?next=/`;

    const { data: linkData, error: linkErr } =
      await admin.auth.admin.generateLink({
        type: 'invite',
        email: coach.email,
        options: { redirectTo },
      });

    if (linkErr || !linkData?.properties?.action_link) {
      return NextResponse.json(
        { error: linkErr?.message || 'Could not regenerate invite link.' },
        { status: 500 },
      );
    }

    const academyName = Array.isArray(coach.academies)
      ? (coach.academies[0] as any)?.name ?? 'your academy'
      : (coach.academies as any)?.name ?? 'your academy';

    const emailRes = await sendCoachInviteEmail({
      toEmail: coach.email,
      firstName: coach.first_name ?? 'there',
      role: coach.role as any,
      academyName,
      inviteLink: linkData.properties.action_link,
      isResend: true,
    });

    return NextResponse.json({
      success: emailRes.success,
      error: emailRes.error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
