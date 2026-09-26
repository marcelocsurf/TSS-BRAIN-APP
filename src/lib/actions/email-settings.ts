'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { resetEmailSwitchCache } from '@/lib/email-switch';

export type EmailSettingRow = { kind: string; enabled: boolean; label: string; audience: 'student' | 'coach' | 'staff' | 'lead'; updated_at: string };

export async function listEmailSettings(): Promise<EmailSettingRow[]> {
  if (!(await isRealPlatformAdmin())) return [];
  const admin = createAdminClient();
  const { data } = await admin.from('email_settings').select('*').order('audience').order('kind');
  return (data ?? []) as EmailSettingRow[];
}

export async function setEmailEnabled(kind: string, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  if (!(await isRealPlatformAdmin())) return { ok: false, error: 'Solo admin.' };
  const admin = createAdminClient();
  const { error } = await admin.from('email_settings').update({ enabled, updated_at: new Date().toISOString() }).eq('kind', kind);
  if (error) return { ok: false, error: error.message };
  resetEmailSwitchCache();
  return { ok: true };
}

// ═══ Vista previa del correo de cierre de camp (Marcelo 2026-09-26) ═══
// "Que el equipo de la academia vea qué les llega a los clientes." Manda el
// MISMO correo que closeCampFinal, con Puro Surf y la persona de prueba
// (Androide), a la dirección que se escriba. Solo platform admin; desde
// producción, porque el remitente verificado vive en Vercel.
export async function sendSurveyPreviewEmail(to: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isRealPlatformAdmin())) return { ok: false, error: 'Solo platform admin.' };
  const email = (to || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Escribí un correo válido.' };
  const admin = createAdminClient();
  const { data: acad } = await admin.from('academies').select('name, logo_url').ilike('name', 'Puro Surf%').maybeSingle();
  const { data: stu } = await admin.from('students').select('first_name, portal_token, course_access_white, course_access_yellow').eq('id', '0f6816db-a637-4af0-86b6-1a1c8227953c').maybeSingle();
  const { data: res } = await admin.from('student_session_results').select('id, feedback_token').eq('id', '9a420405-e71b-42ce-b12c-174ec39fe2d4').maybeSingle();
  const { sendCoachSurveyEmail } = await import('@/lib/actions/email');
  const r = await sendCoachSurveyEmail({
    studentName: stu?.first_name ?? 'Androide',
    studentEmail: email,
    portalToken: stu?.portal_token ?? null,
    coachName: 'Marcelo Castellanos',
    serviceName: 'Surf Camp Foundation · Yellow Belt',
    academyName: acad?.name ?? 'Puro Surf Performance Academy',
    academyLogoUrl: acad?.logo_url ?? null,
    nextFocusLabel: '#13 Backside Cutback',
    nextFocusNote: 'Hold the rotation through the whole turn: eyes stay on the section until the board is back under you.',
    sessionResultId: res?.id,
    feedbackToken: res?.feedback_token ?? undefined,
    studentHasCourseAccess: !!stu?.course_access_white || !!stu?.course_access_yellow,
  });
  return r.success ? { ok: true } : { ok: false, error: r.error || 'No salió.' };
}
