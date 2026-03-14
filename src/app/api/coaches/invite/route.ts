import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Verify current user is admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: currentCoach } = await supabase
      .from('coaches')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (currentCoach?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can add coaches.' }, { status: 403 });
    }

    const body = await req.json();
    const { first_name, last_name, email, phone, role, max_belt_permission, certification_level, specialty_area, languages, internal_notes } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'coordinator', 'coach', 'assistant'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check if email already exists in coaches
    const { data: existingCoach } = await admin
      .from('coaches')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existingCoach) {
      return NextResponse.json({ error: 'A coach with this email already exists.' }, { status: 400 });
    }

    // Create auth user and send invite email
    const { data: authData, error: authErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name,
        last_name,
        role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app'}/auth/callback?next=/`,
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
      max_belt_permission: max_belt_permission || 'yellow_belt',
      specialty_area: specialty_area?.trim() || null,
      languages: languages?.trim() || null,
      internal_notes: internal_notes?.trim() || null,
      active_status: true,
      certification_level: certification_level || 'L1',
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
