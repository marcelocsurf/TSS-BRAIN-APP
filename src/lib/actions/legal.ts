'use server';

// Aceptación de Términos + Privacidad desde el portal del alumno.
// El token del portal es la credencial (misma regla que el resto del portal).
import { createAdminClient } from '@/lib/supabase/admin';
import { consentMeta } from '@/lib/legal/consent-meta';
import { CURRENT_LEGAL_VERSION } from '@/lib/legal/versions';

/** ¿Este alumno tiene que aceptar (o re-aceptar) los términos vigentes? */
export async function needsTermsAcceptance(studentId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select('terms_accepted_at, terms_version')
    .eq('id', studentId)
    .maybeSingle();
  if (!data) return false;
  return !data.terms_accepted_at || data.terms_version !== CURRENT_LEGAL_VERSION;
}

/** Qué más tiene que pedir la puerta, aparte de Términos + Privacidad
 *  (auditoría 2026-09-25): un menor sin tutor registrado → el tutor firma;
 *  una ficha con datos de salud sin consentimiento expreso → se pide ahora. */
export async function termsGateNeeds(studentId: string): Promise<{ minor: boolean; needsGuardian: boolean; needsHealth: boolean }> {
  const admin = createAdminClient();
  const { data: st } = await admin
    .from('students')
    .select('date_of_birth, guardian_name, health_data_consent_at, allergies, injuries, medical_notes, surf_injuries')
    .eq('id', studentId)
    .maybeSingle();
  if (!st) return { minor: false, needsGuardian: false, needsHealth: false };
  let minor = false;
  if ((st as any).date_of_birth) {
    const dob = new Date(`${(st as any).date_of_birth}T12:00:00Z`);
    const now = new Date();
    let age = now.getUTCFullYear() - dob.getUTCFullYear();
    const m = now.getUTCMonth() - dob.getUTCMonth();
    if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1;
    minor = age >= 0 && age < 18;
  }
  const hasHealth = ['allergies', 'injuries', 'medical_notes', 'surf_injuries'].some((k) => String((st as any)[k] ?? '').trim().length > 0);
  return {
    minor,
    needsGuardian: minor && !String((st as any).guardian_name ?? '').trim(),
    needsHealth: hasHealth && !(st as any).health_data_consent_at,
  };
}

export async function acceptTerms(
  token: string,
  extra?: { guardianName?: string | null; healthConsent?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return { ok: false, error: 'Invalid link.' };
  const admin = createAdminClient();
  const { data: st } = await admin.from('students').select('id').eq('portal_token', token).maybeSingle();
  if (!st) return { ok: false, error: 'Invalid link.' };
  // Lo que la puerta pidió se exige también acá (el cliente no decide).
  const needs = await termsGateNeeds(st.id);
  const guardianName = (extra?.guardianName ?? '').trim().slice(0, 120);
  if (needs.needsGuardian && !guardianName) return { ok: false, error: 'A parent or legal guardian must write their full name to accept.' };
  if (needs.needsHealth && !extra?.healthConsent) return { ok: false, error: 'Please confirm the health and safety information box.' };
  const meta = await consentMeta();
  const now = new Date().toISOString();
  const update: Record<string, unknown> = { terms_accepted_at: now, terms_version: CURRENT_LEGAL_VERSION, ...meta };
  if (guardianName) { update.guardian_name = guardianName; update.guardian_relationship = 'parent/guardian'; }
  if (needs.needsHealth && extra?.healthConsent) update.health_data_consent_at = now;
  const { error } = await admin.from('students').update(update).eq('id', st.id);
  if (error) return { ok: false, error: 'Could not save. Try again.' };
  return { ok: true };
}
