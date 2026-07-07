import { redirect } from 'next/navigation';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { PresentationsManager } from './PresentationsManager';

export default async function PresentationsPage() {
  const me = await getCurrentCoach().catch(() => null);
  const platform = await isRealPlatformAdmin().catch(() => false);
  if (!platform && (me as any)?.role !== 'admin') redirect('/');

  return <PresentationsManager />;
}
