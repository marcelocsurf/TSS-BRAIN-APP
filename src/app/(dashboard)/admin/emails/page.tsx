import { redirect } from 'next/navigation';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { listEmailSettings } from '@/lib/actions/email-settings';
import { EmailSwitches } from './EmailSwitches';

export const dynamic = 'force-dynamic';

// ═══ /admin/emails — el interruptor por correo (Marcelo 2026-09-10) ═══
// Etapa de prueba: los correos nuevos al alumno nacen apagados y se prenden
// acá, uno por uno, cuando Marcelo diga.
export default async function AdminEmailsPage() {
  if (!(await isRealPlatformAdmin())) redirect('/dashboard');
  const rows = await listEmailSettings();
  return <EmailSwitches rows={rows} />;
}
