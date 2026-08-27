'use server';

// Admin-only: set a coach's password directly (and confirm their email), so a
// coach who can't complete the email activation link can still log in. The
// admin shares the password with the coach, who logs in and can change it later.
// This bypasses the one-time magic link entirely — the reliable fallback.

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from './auth';
import { revalidatePath } from 'next/cache';

export async function setCoachTempPassword(
  coachId: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) return { ok: false, error: 'Only the platform admin can do this.' };

  if (!password || password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, auth_user_id, email, first_name, last_name, role')
    .eq('id', coachId)
    .single();

  if (!coach) return { ok: false, error: 'Coach not found.' };

  let authUserId = coach.auth_user_id as string | null;

  // Sin cuenta de auth todavía: se crea acá mismo con esa contraseña.
  // Antes esto devolvía "resend the invite first", que era un callejón sin
  // salida: reenviar la invitación es justo lo que el admin está evitando
  // cuando decide poner la contraseña a mano (coach que no puede completar el
  // link del correo, o alta hecha directo en la base). Además obligaba a
  // mandarle un correo a la persona solo para poder darle acceso.
  if (!authUserId) {
    const email = (coach.email ?? '').trim().toLowerCase();
    if (!email) return { ok: false, error: 'This coach has no email — add one first.' };

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: coach.first_name,
        last_name: coach.last_name,
        role: coach.role,
      },
    });

    if (created?.user?.id) {
      authUserId = created.user.id;
    } else {
      // El correo ya existe en auth pero quedó huérfano (sin fila de coach
      // enlazada). Se busca y se enlaza en vez de fallar.
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users?.find(
        (u: any) => (u.email ?? '').toLowerCase() === email
      );
      if (!found) return { ok: false, error: createErr?.message ?? 'Could not create the account.' };
      const { error: updErr } = await admin.auth.admin.updateUserById(found.id, {
        password,
        email_confirm: true,
      });
      if (updErr) return { ok: false, error: updErr.message };
      authUserId = found.id;
    }

    const { error: linkErr } = await admin
      .from('coaches')
      .update({ auth_user_id: authUserId })
      .eq('id', coachId);
    if (linkErr) return { ok: false, error: linkErr.message };
  } else {
    // Set the password AND confirm the email in one call, so sign-in works
    // immediately (an unconfirmed email blocks password sign-in).
    const { error } = await admin.auth.admin.updateUserById(authUserId, {
      password,
      email_confirm: true,
    });
    if (error) return { ok: false, error: error.message };
  }

  await admin.from('coaches').update({ password_set_at: new Date().toISOString() }).eq('id', coachId);

  revalidatePath(`/coaches/${coachId}`);
  return { ok: true };
}
