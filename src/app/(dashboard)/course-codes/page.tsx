import { redirect } from 'next/navigation';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listAccessCodesForAcademy, getCodeUsageByAcademy } from '@/lib/actions/course';
import { getCourseGrantBillingByAcademy } from '@/lib/actions/course-grants';
import { CourseCodesClient } from './course-codes-client';

export const dynamic = 'force-dynamic';

export default async function CourseCodesPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect('/login');

  const allowed = await isCoordinatorOrAbove(currentCoach.role);
  if (!allowed) redirect('/dashboard');

  const isPlatformAdmin = !!currentCoach.is_platform_admin;

  const [codes, usage, grantBilling] = await Promise.all([
    listAccessCodesForAcademy(),
    isPlatformAdmin ? getCodeUsageByAcademy() : Promise.resolve([]),
    isPlatformAdmin ? getCourseGrantBillingByAcademy() : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Course Access Codes
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Vouchers de un solo uso para vender o regalar el <strong>curso online</strong> (Masterclass)
          a personas fuera de un camp. Quien lo canjea crea su cuenta y obtiene el curso al instante;
          cada canje queda contado en facturación a tu academia.
        </p>
      </div>

      <CourseCodesClient
        initialCodes={codes}
        isPlatformAdmin={isPlatformAdmin}
        initialUsage={usage}
        grantBilling={grantBilling}
      />
    </div>
  );
}
