import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from '@/lib/actions/auth';
import { AcademiesAdmin } from './AcademiesAdmin';

export const dynamic = 'force-dynamic';

export default async function AcademiesPage() {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: academies } = await supabase
    .from('academies')
    .select('id, name, slug, country, created_at')
    .order('created_at', { ascending: true });

  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-12">
      <div>
        <h1 className="text-xl font-bold text-[var(--tss-navy)]">Academies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform admin view. Create new academies and see what&apos;s where.
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          🏫 {(academies ?? []).length} academies · {totalStudents ?? 0} total students
        </p>
      </div>

      <AcademiesAdmin academies={academies ?? []} />
    </div>
  );
}
