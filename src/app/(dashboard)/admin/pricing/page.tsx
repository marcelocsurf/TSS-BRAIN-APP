import { redirect } from 'next/navigation';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { listCoursePrices, listAcademyCoursePrices } from '@/lib/actions/pricing';
import { listInvoicesForPeriod } from '@/lib/actions/invoices';
import { listAllAcademies } from '@/lib/actions/camps';
import { PricingClient } from './PricingClient';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function AdminPricingPage({ searchParams }: Props) {
  const real = await isRealPlatformAdmin();
  if (!real) redirect('/dashboard');

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getUTCFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getUTCMonth() + 1;

  const [prices, periodInvoices, academies, academyOverrides] = await Promise.all([
    listCoursePrices(),
    listInvoicesForPeriod(year, month),
    listAllAcademies(),
    listAcademyCoursePrices(),
  ]);

  return (
    <PricingClient
      prices={prices}
      invoices={periodInvoices}
      year={year}
      month={month}
      academies={academies}
      academyOverrides={academyOverrides}
    />
  );
}
