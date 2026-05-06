import { redirect } from 'next/navigation';
import { getCurrentCoach, isAdmin, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listAccessCodes } from '@/lib/actions/course';
import { CourseCodesClient } from './course-codes-client';

export const dynamic = 'force-dynamic';

export default async function CourseCodesPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect('/login');

  const allowed = await isCoordinatorOrAbove(currentCoach.role);
  if (!allowed) redirect('/');

  const codes = await listAccessCodes();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Course Access Codes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Generate single-use codes to give students access to the TSS White Belt Masterclass.
        </p>
      </div>

      <CourseCodesClient initialCodes={codes} />
    </div>
  );
}
