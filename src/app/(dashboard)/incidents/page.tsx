import { redirect } from 'next/navigation';
import { getCurrentCoach } from '@/lib/actions/auth';
import { getIncidentsForMonth } from '@/lib/actions/dashboard';
import { IncidentsReport } from './IncidentsReport';

export const dynamic = 'force-dynamic';

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const coach = await getCurrentCoach().catch(() => null);
  const role = coach?.role;
  if (role !== 'admin' && role !== 'coordinator') redirect('/');

  const { month: monthParam } = await searchParams;
  const now = new Date();
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? monthParam
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const academyId = coach?.academy_id ?? null;
  const incidents = await getIncidentsForMonth(academyId, month);

  return <IncidentsReport incidents={incidents} month={month} />;
}
