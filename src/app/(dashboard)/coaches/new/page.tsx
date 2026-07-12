import { redirect } from 'next/navigation';
import { getCurrentCoach, isRealPlatformAdmin } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { AddCoachForm } from './add-coach-form';

interface Props {
  searchParams: Promise<{ academy_id?: string }>;
}

export default async function AddCoachPage({ searchParams }: Props) {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect('/login');
  // Only the platform admin (TSS HQ) can onboard coaches — this guarantees
  // every coach in any academy is vetted against TSS method standards.
  if (!(await isRealPlatformAdmin())) redirect('/coaches');

  // Pre-fill the academy picker when the admin lands here from an
  // academy detail page (?academy_id=...). Falls back to the admin's
  // own academy_id otherwise.
  const { academy_id: queryAcademyId } = await searchParams;

  // M6 — only platform admin sees the academy picker. Everyone else is
  // implicitly bound to their own academy by the server route.
  const supabase = await createClient();
  const { data: academies } = currentCoach.is_platform_admin
    ? await supabase.from('academies').select('id, name, slug').is('archived_at', null).order('name')
    : { data: null };

  return (
    <AddCoachForm
      academies={academies ?? []}
      defaultAcademyId={queryAcademyId ?? currentCoach.academy_id ?? null}
      isPlatformAdmin={!!currentCoach.is_platform_admin}
    />
  );
}
