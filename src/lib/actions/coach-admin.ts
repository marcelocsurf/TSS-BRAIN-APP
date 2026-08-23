'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

// Only an admin (role 'admin') or the real platform admin may manage staff.
async function assertAdmin() {
  const me = await getCurrentCoach().catch(() => null);
  const platform = await isRealPlatformAdmin().catch(() => false);
  if (!platform && (me as any)?.role !== 'admin') {
    throw new Error('Only an admin can manage staff.');
  }
}

// SECURITY: an academy admin may only manage coaches of THEIR OWN academy.
// The real platform admin bypasses. Throws if the target belongs elsewhere.
async function assertCanManageCoach(coachId: string) {
  await assertAdmin();
  if (await isRealPlatformAdmin().catch(() => false)) return;
  const me = await getCurrentCoach().catch(() => null);
  const admin = createAdminClient();
  const { data: target } = await admin
    .from('coaches')
    .select('academy_id')
    .eq('id', coachId)
    .maybeSingle();
  if (!target || (target as any).academy_id !== (me as any)?.academy_id) {
    throw new Error('You can only manage staff of your own academy.');
  }
}

// Edit a coach/assistant's identity (name, email, role). Uses the admin client
// so it bypasses RLS, and keeps the auth account email in sync when one exists.
export async function updateCoachIdentity(
  coachId: string,
  input: { first_name: string; last_name: string; email: string; role?: string; academy_id?: string; portal_can_coordinate?: boolean; portal_can_manage_boards?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  await assertCanManageCoach(coachId);
  const admin = createAdminClient();

  const first = (input.first_name || '').trim();
  const last = (input.last_name || '').trim();
  const email = (input.email || '').trim().toLowerCase();
  const display = `${first} ${last}`.trim();

  if (!first) return { ok: false, error: 'First name is required.' };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Please enter a valid email.' };

  const patch: Record<string, any> = {
    first_name: first,
    last_name: last,
    display_name: display,
  };
  if (email) patch.email = email;
  if (input.role) patch.role = input.role;
  if (input.academy_id) patch.academy_id = input.academy_id;
  // Modo cobertura del host (migración 00156). Si la columna aún no
  // existe, se reintenta sin ella para no bloquear la edición de identidad.
  if (typeof input.portal_can_coordinate === 'boolean') patch.portal_can_coordinate = input.portal_can_coordinate;
  if (typeof input.portal_can_manage_boards === 'boolean') patch.portal_can_manage_boards = input.portal_can_manage_boards;

  let { error } = await admin.from('coaches').update(patch).eq('id', coachId);
  if (error && /portal_can_coordinate|portal_can_manage_boards/.test(error.message)) {
    delete patch.portal_can_coordinate;
    delete patch.portal_can_manage_boards;
    ({ error } = await admin.from('coaches').update(patch).eq('id', coachId));
  }
  if (error) return { ok: false, error: error.message };

  // Keep the login account's email aligned with the coaches row.
  if (email) {
    const { data: c } = await admin
      .from('coaches')
      .select('auth_user_id')
      .eq('id', coachId)
      .maybeSingle();
    if (c?.auth_user_id) {
      await admin.auth.admin.updateUserById(c.auth_user_id, { email }).catch(() => {});
    }
  }

  revalidatePath(`/coaches/${coachId}`);
  revalidatePath('/coaches');
  return { ok: true };
}

// Deactivate / reactivate a coach (soft — always safe, keeps their history).
export async function setCoachActiveStatus(
  coachId: string,
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await assertCanManageCoach(coachId);
  const admin = createAdminClient();
  const { error } = await admin
    .from('coaches')
    .update({ active_status: active })
    .eq('id', coachId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/coaches/${coachId}`);
  revalidatePath('/coaches');
  return { ok: true };
}

// Permanently delete a coach + their login account. Refuses (with a helpful
// message) when the database blocks it because the coach has linked records
// (sessions, camps, evaluations) — in that case the admin should deactivate.
export async function deleteCoach(
  coachId: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertCanManageCoach(coachId);
  const admin = createAdminClient();

  const { data: c } = await admin
    .from('coaches')
    .select('auth_user_id')
    .eq('id', coachId)
    .maybeSingle();

  const { error } = await admin.from('coaches').delete().eq('id', coachId);
  if (error) {
    return {
      ok: false,
      error:
        'Could not delete — this person has linked records (sessions, camps or evaluations). Deactivate them instead to keep the history intact.',
    };
  }

  if (c?.auth_user_id) {
    await admin.auth.admin.deleteUser(c.auth_user_id).catch(() => {});
  }

  revalidatePath('/coaches');
  return { ok: true };
}
