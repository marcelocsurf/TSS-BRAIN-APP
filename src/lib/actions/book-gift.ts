'use server';

// ═══ LINK DE REGALO DEL LIBRO ONE WAVE ═══
//
// Marcelo (2026-09-05): poder generar un link, pasarlo por WhatsApp, y que la
// persona viva el proceso "como si lo hubiera comprado": pone su nombre y su
// email y entra a su portal con el libro. Sirve para regalar accesos y probar
// el circuito antes de conectar el cobro.
//
// El código vive en access_codes con product_type 'one_wave' (se genera en
// /course-codes del dashboard). Es de UN solo uso. El otorgamiento es el
// MISMO motor que la compra real (grantBookAccess): crea o encuentra al
// alumno por email, otorga el recurso y manda el email con su link de portal.

import { createAdminClient } from '@/lib/supabase/admin';
import { grantBookAccess } from './book-purchase';

const norm = (c: string) => String(c ?? '').toUpperCase().trim();

export type GiftState = 'valid' | 'used' | 'expired' | 'not_found';

export async function validateBookGift(code: string): Promise<GiftState> {
  try {
    const c = norm(code);
    if (!c || c.length > 40) return 'not_found';
    const admin = createAdminClient();
    const { data } = await admin
      .from('access_codes')
      .select('code, product_type, used_by, expires_at')
      .eq('code', c)
      .maybeSingle();
    if (!data || data.product_type !== 'one_wave') return 'not_found';
    if (data.used_by) return 'used';
    if (data.expires_at && new Date(data.expires_at) < new Date()) return 'expired';
    return 'valid';
  } catch {
    return 'not_found';
  }
}

export async function redeemBookGift(
  code: string,
  profile: { firstName: string; lastName?: string; email: string }
): Promise<{ ok: true; portalUrl: string } | { ok: false; error: string }> {
  try {
    const firstName = String(profile.firstName ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);
    const lastName = String(profile.lastName ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);
    const email = String(profile.email ?? '').trim().toLowerCase();
    if (!firstName) return { ok: false, error: 'Tell us your first name.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { ok: false, error: 'That email does not look right.' };

    const state = await validateBookGift(code);
    if (state === 'used') return { ok: false, error: 'This gift link was already used.' };
    if (state === 'expired') return { ok: false, error: 'This gift link has expired.' };
    if (state !== 'valid') return { ok: false, error: 'This gift link is not valid.' };

    const r = await grantBookAccess({ email, name: `${firstName} ${lastName}`.trim(), source: `gift:${norm(code)}` });
    if (!r.ok || !r.portal_url) return { ok: false, error: 'Could not open your book. Try again in a minute.' };

    // Un solo uso: se marca con el alumno que lo canjeó. Si dos personas
    // abren el mismo link al mismo tiempo, el libro igual se otorgó (es un
    // regalo): el segundo intento del mismo link ya lo ve usado.
    const admin = createAdminClient();
    await admin
      .from('access_codes')
      .update({ used_by: r.student_id ?? null, used_at: new Date().toISOString() })
      .eq('code', norm(code))
      .is('used_by', null);

    return { ok: true, portalUrl: r.portal_url };
  } catch (e) {
    console.error('[book-gift] redeem failed', e);
    return { ok: false, error: 'Could not open your book. Try again in a minute.' };
  }
}
