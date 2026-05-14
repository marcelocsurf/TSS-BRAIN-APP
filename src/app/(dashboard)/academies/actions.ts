'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { getCurrentCoach } from '@/lib/actions/auth';

export async function createAcademy(input: {
  name: string;
  slug: string;
  country: string | null;
}) {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) {
    throw new Error('Only the platform admin can create academies.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('academies').insert({
    name: input.name,
    slug: input.slug,
    country: input.country,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/academies');
}

// M6 — Invite a coordinator for an academy.
// Creates a Supabase auth user, sends invite email, creates a coaches
// row with academy_id + role='coordinator', and points
// academies.assigned_coordinator_id at that coach.
//
// Only platform admin can call this — they're the ones provisioning
// new academies and assigning coordinators to them.
export async function assignCoordinator(input: {
  academy_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  languages?: string;
}) {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) {
    throw new Error('Only the platform admin can assign coordinators.');
  }

  if (!input.first_name?.trim() || !input.last_name?.trim() || !input.email?.trim()) {
    throw new Error('First name, last name and email are required.');
  }
  if (!input.email.includes('@')) {
    throw new Error('Invalid email.');
  }

  const admin = createAdminClient();

  // Make sure academy exists and capture current coordinator (if any)
  const { data: academy } = await admin
    .from('academies')
    .select('id, name, assigned_coordinator_id')
    .eq('id', input.academy_id)
    .single();
  if (!academy) throw new Error('Academy not found.');

  // Email must be unique across coaches
  const { data: existingCoach } = await admin
    .from('coaches')
    .select('id, academy_id')
    .eq('email', input.email.trim().toLowerCase())
    .maybeSingle();

  let coachId: string;

  if (existingCoach) {
    // Re-use the existing coach record. Move them into this academy and
    // upgrade their role to coordinator. (This handles the case where
    // Marcelo wants to promote an existing coach to be coordinator of a
    // new academy.)
    const { error: updErr } = await admin
      .from('coaches')
      .update({
        academy_id: input.academy_id,
        role: 'coordinator',
      })
      .eq('id', existingCoach.id);
    if (updErr) throw new Error(updErr.message);
    coachId = existingCoach.id;
  } else {
    // Invite a brand-new coach.
    const { data: authData, error: authErr } = await admin.auth.admin.inviteUserByEmail(
      input.email.trim().toLowerCase(),
      {
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          role: 'coordinator',
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app'}/auth/callback?next=/`,
      }
    );
    if (authErr) throw new Error(authErr.message);

    const display_name = `${input.first_name.trim()} ${input.last_name.trim()}`;
    const { data: newCoach, error: coachErr } = await admin
      .from('coaches')
      .insert({
        auth_user_id: authData.user.id,
        academy_id: input.academy_id,
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        display_name,
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        role: 'coordinator',
        max_belt_permission: 'black_belt',
        languages: input.languages?.trim() || null,
        active_status: true,
        certification_level: 'L3',
      })
      .select('id')
      .single();

    if (coachErr || !newCoach) {
      // Rollback auth user
      await admin.auth.admin.deleteUser(authData.user.id);
      throw new Error(coachErr?.message || 'Failed to create coordinator coach record.');
    }
    coachId = newCoach.id;
  }

  // If this academy already had a coordinator, demote that one (set their
  // role to 'coach') before swapping, otherwise the partial unique index
  // would be fine but we want a clean state — only one assigned_coordinator
  // per academy.
  if (academy.assigned_coordinator_id && academy.assigned_coordinator_id !== coachId) {
    await admin
      .from('coaches')
      .update({ role: 'coach' })
      .eq('id', academy.assigned_coordinator_id);
  }

  // Point academy at the new coordinator
  const { error: academyErr } = await admin
    .from('academies')
    .update({ assigned_coordinator_id: coachId })
    .eq('id', input.academy_id);
  if (academyErr) throw new Error(academyErr.message);

  revalidatePath('/academies');
  return { success: true, coach_id: coachId };
}

// M8 — Branding editor. Updates the 4 brand columns on academies.
// NULL means "fall back to TSS default". Hex colors validated by the
// CHECK constraint on the column.
export async function updateAcademyBranding(input: {
  academy_id: string;
  name?: string;
  country?: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  tagline: string | null;
}) {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) {
    throw new Error('Only the platform admin can edit academy branding.');
  }

  const admin = createAdminClient();
  const update: Record<string, any> = {
    logo_url: input.logo_url?.trim() || null,
    primary_color: input.primary_color?.trim() || null,
    accent_color: input.accent_color?.trim() || null,
    tagline: input.tagline?.trim() || null,
  };
  if (input.name !== undefined) update.name = input.name.trim();
  if (input.country !== undefined) update.country = input.country?.trim() || null;

  const { error } = await admin
    .from('academies')
    .update(update)
    .eq('id', input.academy_id);
  if (error) throw new Error(error.message);

  revalidatePath('/academies');
  revalidatePath(`/academies/${input.academy_id}`);
}

// M8 — Delete academy. Only allowed when no students / coaches / camps
// exist for the academy. Refuses with a friendly error otherwise.
export async function deleteAcademy(academyId: string) {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) {
    throw new Error('Only the platform admin can delete academies.');
  }

  const admin = createAdminClient();

  const [{ count: studentCount }, { count: coachCount }, { count: campCount }] =
    await Promise.all([
      admin.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
      admin.from('coaches').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
      admin.from('camp_instances').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
    ]);

  if ((studentCount ?? 0) + (coachCount ?? 0) + (campCount ?? 0) > 0) {
    throw new Error(
      `Cannot delete academy: it still has ${studentCount ?? 0} students, ${coachCount ?? 0} coaches, ${campCount ?? 0} services. Reassign or delete those first.`
    );
  }

  // Clear coordinator link first (FK ON DELETE SET NULL would also work,
  // but explicit is clearer).
  await admin
    .from('academies')
    .update({ assigned_coordinator_id: null })
    .eq('id', academyId);

  const { error } = await admin.from('academies').delete().eq('id', academyId);
  if (error) throw new Error(error.message);

  revalidatePath('/academies');
}
