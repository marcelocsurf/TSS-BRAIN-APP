'use server';
// ═══ Un solo "inscribir" avisa al alumno (Marcelo 2026-09-10) ═══
// Todas las puertas de inscripción llaman acá al final. Si el correo está
// apagado o el alumno no tiene email, no pasa nada: la inscripción nunca
// depende del correo.
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEnrolledEmail } from '@/lib/actions/email';

export async function notifyEnrolled(studentId: string, campInstanceId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const [{ data: st }, { data: camp }] = await Promise.all([
      admin.from('students').select('email, first_name, portal_token, academy_id').eq('id', studentId).maybeSingle(),
      admin.from('camp_instances').select('camp_name, start_date, scheduled_time').eq('id', campInstanceId).maybeSingle(),
    ]);
    if (!st?.email || !st.portal_token || !camp) return;
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
    const dateLabel = new Date(`${camp.start_date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
    await sendWelcomeEnrolledEmail({
      toEmail: st.email,
      firstName: st.first_name || 'surfer',
      campName: String(camp.camp_name ?? 'your session').replace(/ · \d{4}-\d{2}-\d{2}$/, ''),
      dateLabel,
      timeLabel: camp.scheduled_time ? String(camp.scheduled_time).slice(0, 5) : null,
      portalUrl: `${base}/portal/${st.portal_token}`,
      termsUrl: `${base}/legal/terms`,
      privacyUrl: `${base}/legal/privacy`,
      academyId: st.academy_id ?? null,
    });
  } catch (e) {
    console.error('[enrollment] welcome email failed', e);
  }
}
