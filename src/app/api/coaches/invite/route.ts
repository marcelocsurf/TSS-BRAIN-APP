import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendCoachInviteEmail } from '@/lib/actions/email';
import { generateCoachInviteLink } from '@/lib/utils/coach-invite-link';

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
      portal_category: rawPortalCategory,
      job_title,
      portal_can_sell,
    } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Support (non-coaching) team members get a trimmed portal; coaching roles
    // keep the full one. Category drives the portal, role drives permissions.
    const portal_category = rawPortalCategory === 'support' ? 'support' : 'coaching';

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

    // Validate the target academy exists + grab its display name for the
    // welcome email.
    const { data: targetAcademy } = await admin
      .from('academies')
      .select('id, name')
      .eq('id', targetAcademyId)
      .single();
    if (!targetAcademy) {
      return NextResponse.json({ error: 'Target academy not found.' }, { status: 400 });
    }

    // If the email already exists, MOVE the existing coach to the
    // target academy + role instead of rejecting. Mirrors the
    // assignCoordinator() behaviour so the admin has a single "add
    // coach" affordance regardless of new-vs-existing.
    const normalizedEmail = email.trim().toLowerCase();
    const { data: existingCoach } = await admin
      .from('coaches')
      .select('id, academy_id, role, password_set_at, auth_user_id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingCoach) {
      // If the coach is currently the assigned_coordinator of some OTHER
      // academy, null that out first — otherwise the partial unique
      // index (uq_academies_coordinator) leaves a stale reference and
      // makes the future assignCoordinator() call on the new academy
      // throw. The admin can re-claim them as coordinator after the
      // move via /academies/[id] if desired.
      await admin
        .from('academies')
        .update({ assigned_coordinator_id: null })
        .eq('assigned_coordinator_id', existingCoach.id)
        .neq('id', targetAcademyId);

      const { error: moveErr } = await admin
        .from('coaches')
        .update({
          academy_id: targetAcademyId,
          role,
          active_status: true,
        })
        .eq('id', existingCoach.id);

      if (moveErr) throw new Error(moveErr.message);

      // If the coach hasn't activated their account yet, regenerate
      // a fresh login link and re-send the welcome email so they can
      // finally log in. Picks 'magiclink' for existing auth users
      // (the 'invite' type FAILS when an auth user already exists)
      // or 'invite' for legacy coaches without an auth row yet.
      let emailResent = false;
      let emailError: string | undefined;
      if (!existingCoach.password_set_at) {
        const appUrlReassign =
          process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app';
        const redirectToReassign = `${appUrlReassign}/auth/callback?next=/`;
        const linkRes = await generateCoachInviteLink({
          admin,
          email: normalizedEmail,
          hasExistingAuthUser: !!existingCoach.auth_user_id,
          redirectTo: redirectToReassign,
          userMetadata: { first_name, last_name, role },
        });
        if (linkRes.hashedToken && linkRes.linkType) {
          // Link the auth user back to the coach row if generateLink
          // ('invite') just created a fresh one and coach.auth_user_id
          // was null.
          if (!existingCoach.auth_user_id && linkRes.user?.id) {
            await admin
              .from('coaches')
              .update({ auth_user_id: linkRes.user.id })
              .eq('id', existingCoach.id);
          }
          const reassignLink =
            `${appUrlReassign}/auth/confirm` +
            `?token_hash=${encodeURIComponent(linkRes.hashedToken)}` +
            `&type=${linkRes.linkType}&next=/set-password`;
          const r = await sendCoachInviteEmail({
            toEmail: normalizedEmail,
            firstName: first_name.trim(),
            role,
            academyName: targetAcademy.name,
            inviteLink: reassignLink,
            isResend: true,
          });
          emailResent = r.success;
          if (!r.success) emailError = r.error;
        } else {
          emailError = linkRes.error ?? 'Could not regenerate invite link.';
        }
      }

      return NextResponse.json({
        success: true,
        email: normalizedEmail,
        coach_id: existingCoach.id,
        academy_id: targetAcademyId,
        reassigned: true,
        previous_academy_id: existingCoach.academy_id,
        previous_role: existingCoach.role,
        email_sent: emailResent,
        email_error: emailError,
      });
    }

    // Create auth user via generateLink — same effect as
    // inviteUserByEmail (creates the row + returns the activation
    // link) but DOES NOT send Supabase's default email. We send our
    // own branded email via Resend right below.
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app';
    const redirectTo = `${appUrl}/auth/callback?next=/`;

    // No coach row exists yet. The helper tries 'invite' first and
    // auto-falls back to 'magiclink' if there's an orphaned auth user.
    const linkRes = await generateCoachInviteLink({
      admin,
      email: normalizedEmail,
      hasExistingAuthUser: false,
      redirectTo,
      userMetadata: { first_name, last_name, role },
    });

    if (!linkRes.hashedToken || !linkRes.linkType || !linkRes.user) {
      throw new Error(linkRes.error ?? 'Could not generate invite link.');
    }

    const authData = { user: linkRes.user };
    // token_hash link → /auth/confirm (server-side verifyOtp). The PKCE
    // action_link silently fails for admin-generated links.
    const inviteLink =
      `${appUrl}/auth/confirm` +
      `?token_hash=${encodeURIComponent(linkRes.hashedToken)}` +
      `&type=${linkRes.linkType}&next=/set-password`;

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
        portal_category,
        job_title: job_title?.trim() || null,
        portal_can_sell: portal_category === 'support' ? !!portal_can_sell : false,
        // Support members exist for the portal (tasks + services), so grant
        // portal access on creation; coaching roles are gated by course grants.
        ...(portal_category === 'support' ? { course_access_granted: true } : {}),
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
      // Rollback only if WE created the auth user. If the helper fell
      // back to 'magiclink' the auth.users row already existed before
      // this request — deleting it could nuke an unrelated account.
      if (linkRes.linkType === 'invite') {
        await admin.auth.admin.deleteUser(authData.user.id);
      }
      throw new Error(coachErr?.message || 'Failed to create coach record');
    }

    // Send our own branded welcome email with the generateLink result.
    // Non-fatal: if email send fails the coach still exists; the admin
    // can resend from /coaches.
    const emailRes = await sendCoachInviteEmail({
      toEmail: email.trim().toLowerCase(),
      firstName: first_name.trim(),
      role,
      academyName: targetAcademy.name,
      inviteLink,
    });

    return NextResponse.json({
      success: true,
      email,
      coach_id: newCoach.id,
      academy_id: targetAcademyId,
      email_sent: emailRes.success,
      email_error: emailRes.success ? undefined : emailRes.error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
