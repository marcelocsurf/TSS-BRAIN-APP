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

  // Academies + currently-assigned coordinator (joined)
  const { data: academies } = await supabase
    .from('academies')
    .select(
      'id, name, slug, country, created_at, assigned_coordinator_id, coaches:assigned_coordinator_id(id, display_name, email)'
    )
    .order('created_at', { ascending: true });

  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  // Per-academy student count (1 query, group manually)
  const { data: studentRows } = await supabase
    .from('students')
    .select('academy_id')
    .not('academy_id', 'is', null);
  const studentsByAcademy: Record<string, number> = {};
  for (const r of studentRows ?? []) {
    const k = r.academy_id as string;
    studentsByAcademy[k] = (studentsByAcademy[k] || 0) + 1;
  }

  const normalized = (academies ?? []).map((a: any) => {
    const co = Array.isArray(a.coaches) ? a.coaches[0] : a.coaches;
    return {
      id: a.id as string,
      name: a.name as string,
      slug: a.slug as string,
      country: (a.country ?? null) as string | null,
      created_at: a.created_at as string,
      assigned_coordinator_id: (a.assigned_coordinator_id ?? null) as string | null,
      coordinator_name: co?.display_name ?? null,
      coordinator_email: co?.email ?? null,
      student_count: studentsByAcademy[a.id] ?? 0,
    };
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-12">
      <div>
        <h1 className="text-xl font-bold text-[var(--tss-navy)]">Academies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform admin view. Create academies and assign a coordinator to each.
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          🏫 {normalized.length} academies · {totalStudents ?? 0} total students
        </p>
      </div>

      <AcademiesAdmin academies={normalized} />
    </div>
  );
}
