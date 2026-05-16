import { redirect } from 'next/navigation';
import { getCurrentCoach, isRealPlatformAdmin } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { AddCoachForm } from './add-coach-form';

export default async function AddCoachPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect('/login');
  // Only the platform admin (TSS HQ) can onboard coaches — this guarantees
  // every coach in any academy is vetted against TSS method standards.
  if (!(await isRealPlatformAdmin())) redirect('/coaches');

  // M6 — only platform admin sees the academy picker. Everyone else is
  // implicitly bound to their own academy by the server route.
  const supabase = await createClient();
  const { data: academies } = currentCoach.is_platform_admin
    ? await supabase.from('academies').select('id, name, slug').order('name')
    : { data: null };

  return (
    <AddCoachForm
      academies={academies ?? []}
      defaultAcademyId={currentCoach.academy_id ?? null}
      isPlatformAdmin={!!currentCoach.is_platform_admin}
    />
  );
}
