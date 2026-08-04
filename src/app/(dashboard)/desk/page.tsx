import { redirect } from 'next/navigation';
import { getCurrentCoach } from '@/lib/actions/auth';

// Mostrador para coordinador/admin desde el dashboard: mismo tablero del
// host (cobrar, mover, cancelar, TRANSFERIR de grupo) con su propio token.
export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';

export default async function DeskRedirect() {
  const me = await getCurrentCoach().catch(() => null);
  if (!me?.id) redirect('/dashboard');
  const admin = createAdminClient();
  const { data } = await admin.from('coaches').select('portal_token').eq('id', me.id).maybeSingle();
  if (!data?.portal_token) redirect('/dashboard');
  redirect(`/front-desk/${data.portal_token}`);
}
