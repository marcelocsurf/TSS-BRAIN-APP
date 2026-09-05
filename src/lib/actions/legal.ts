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

export async function acceptTerms(token: string): Promise<{ ok: boolean; error?: string }> {
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return { ok: false, error: 'Invalid link.' };
  const admin = createAdminClient();
  const { data: st } = await admin.from('students').select('id').eq('portal_token', token).maybeSingle();
  if (!st) return { ok: false, error: 'Invalid link.' };
  const meta = await consentMeta();
  const { error } = await admin
    .from('students')
    .update({ terms_accepted_at: new Date().toISOString(), terms_version: CURRENT_LEGAL_VERSION, ...meta })
    .eq('id', st.id);
  if (error) return { ok: false, error: 'Could not save. Try again.' };
  return { ok: true };
}
