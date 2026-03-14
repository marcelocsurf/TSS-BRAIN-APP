import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Verify current user is holistic_coach
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: currentCoach } = await supabase
      .from('coaches')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (currentCoach?.role !== 'holistic_coach') {
      return NextResponse.json({ error: 'Only the director can invite coaches.' }, { status: 403 });
    }

    const body = await req.json();
    const { first_name, last_name, email, phone, role, max_belt_permission, specialty_area, languages } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check if email already exists in coaches
    const { data: existingCoach } = await admin
      .from('coaches')
      .select('id')
      .eq('email', email)
      .single();

    if (existingCoach) {
      return NextResponse.json({ error: 'A coach with this email already exists.' }, { status: 400 });
    }

    // Create auth user and send invite email
    const { data: authData, error: authErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name,
        last_name,
        role: 'coach',
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    });

    if (authErr) throw new Error(authErr.message);

    // Create coach record
    const display_name = `${first_name} ${last_name}`;
    const { error: coachErr } = await admin.from('coaches').insert({
      auth_user_id: authData.user.id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      display_name,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      role,
      max_belt_permission,
      specialty_area: specialty_area?.trim() || null,
      languages: languages?.trim() || null,
      active_status: true,
      certification_level: 'none',
    });

    if (coachErr) {
      // Rollback auth user if coach record fails
      await admin.auth.admin.deleteUser(authData.user.id);
      throw new Error(coachErr.message);
    }

    return NextResponse.json({ success: true, email });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
