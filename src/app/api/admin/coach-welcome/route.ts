import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCoachWelcomeEmail } from '@/lib/actions/email';

export const dynamic = 'force-dynamic';

// Envía el correo de bienvenida (credenciales + guía del portal + instalar
// el app) a coaches por email. Protegido por CRON_SECRET — herramienta de
// onboarding del platform admin, se dispara desde producción para usar la
// clave real de Resend.
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured.' }, { status: 500 });
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });

  const { emails, tempPassword, variantOverride } = await req.json().catch(() => ({}));
  if (!Array.isArray(emails) || !emails.length || !tempPassword) {
    return NextResponse.json({ ok: false, error: 'Body: { emails: string[], tempPassword: string }' }, { status: 400 });
  }

  const admin = createAdminClient();
  const results: { email: string; sent: boolean; error?: string }[] = [];
  for (const email of emails) {
    const { data: coach } = await admin
      .from('coaches')
      .select('first_name, email, auth_user_id, role, academies:academy_id(name)')
      .eq('email', String(email).trim().toLowerCase())
      .maybeSingle();
    if (!coach?.email) { results.push({ email, sent: false, error: 'coach not found' }); continue; }
    if (!coach.auth_user_id) { results.push({ email, sent: false, error: 'no auth account — create it first' }); continue; }
    const academy = Array.isArray((coach as any).academies) ? (coach as any).academies[0] : (coach as any).academies;
    const r = await sendCoachWelcomeEmail({
      toEmail: coach.email,
      firstName: coach.first_name || 'Coach',
      academyName: academy?.name ?? 'tu academia',
      tempPassword: String(tempPassword),
      variant: variantOverride === 'host' || variantOverride === 'coach'
        ? variantOverride
        : ((coach as any).role === 'host' ? 'host' : 'coach'),
    });
    results.push({ email, sent: r.success, error: r.error });
  }
  return NextResponse.json({ ok: true, results });
}
