import { redirect } from 'next/navigation';
import { getCurrentCoach } from '@/lib/actions/auth';
import { listDrills } from '@/lib/actions/drill-library';
import { DrillLibraryManager } from '@/components/admin/DrillLibraryManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DrillLibraryPage() {
  const me = await getCurrentCoach();
  if (!me) redirect('/login');
  if (!me.is_platform_admin && me.role !== 'admin') redirect('/dashboard');

  const initial = await listDrills({});

  return (
    <div className="max-w-4xl mx-auto py-2">
      <h1 className="text-2xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
        Drill &amp; Mission Library
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        Create, edit and retire drills &amp; missions. Changes appear instantly in the coach tools and the student sequence. Admin only.
      </p>
      <DrillLibraryManager initial={initial} />
    </div>
  );
}
