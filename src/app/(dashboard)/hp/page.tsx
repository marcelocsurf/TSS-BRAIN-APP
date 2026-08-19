import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { HPCockpit } from './HPCockpit';

// ─── Modo HP: la app de Alto Rendimiento completa, dentro de BRAIN ───
// Solo el admin de plataforma (Marcelo, head coach). Página aparte del resto
// del dashboard: tema oscuro de la app HP, navegación de abajo, mobile-first.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HPPage() {
  const ok = await isRealPlatformAdmin().catch(() => false);
  if (!ok) redirect('/dashboard');
  return <HPCockpit />;
}
