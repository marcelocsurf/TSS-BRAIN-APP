import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// M6 — Coach invite now supports academy_id scoping.
//
// Rules:
//   - Platform admin (Marcelo) can target ANY academy via the form.
//   - Coordinator/admin (non-platform): the new coach is forced into
//     the inviter's own academy. Any academy_id from the body is
//     ignored for non-platform-admins.
//   - The response includes `coach_id` so the caller can chain follow-up
//     mutations (e.g. assigning this coach as the academy's coordinator).

export async function POST(req: NextRequest) {
  try {
    // Verify current user is admin, coordinator or platform admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: currentCoach } = await supabase
      .from('coaches')
      .select('id, role, academy_id, is_platform_admin')
      .eq('auth_user_id', user.id)
      .single();

    // Only the platform admin (TSS HQ) can onboard coaches. This ensures
    // every coach across all academies is vetted against TSS method
    // standards — academy coordinators cannot add their own coaches.
    if (!currentCoach || !currentCoach.is_platform_admin) {
      return NextResponse.json(
        { error: 'Only the TSS platform administrator can add coaches.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      role,
      max_belt_permission,
      certification_level,
      specialty_area,
      languages,
      internal_notes,
      academy_id: requestedAcademyId,
    } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'coordinator', 'coach', 'assistant'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    // Resolve which academy this new coach belongs to.
    // - Platform admin can pick any academy via the request body.
    // - Everyone else inherits the inviter's academy_id, regardless of
    //   what they sent.
    const targetAcademyId = currentCoach.is_platform_admin
      ? (requestedAcademyId || currentCoach.academy_id)
      : currentCoach.academy_id;

    if (!targetAcademyId) {
      return NextResponse.json(
        { error: 'No academy resolved for the new coach. Platform admin must pick one.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Validate the target academy exists
    const { data: targetAcademy } = await admin
      .from('academies')
      .select('id')
      .eq('id', targetAcademyId)
      .single();
    if (!targetAcademy) {
      return NextResponse.json({ error: 'Target academy not found.' }, { status: 400 });
    }

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

    // Create coach record (now with academy_id)
    const display_name = `${first_name} ${last_name}`;
    const { data: newCoach, error: coachErr } = await admin
      .from('coaches')
      .insert({
        auth_user_id: authData.user.id,
        academy_id: targetAcademyId,
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
      })
      .select('id')
      .single();

    if (coachErr || !newCoach) {
      // Rollback auth user if coach record fails
      await admin.auth.admin.deleteUser(authData.user.id);
      throw new Error(coachErr?.message || 'Failed to create coach record');
    }

    return NextResponse.json({
      success: true,
      email,
      coach_id: newCoach.id,
      academy_id: targetAcademyId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
