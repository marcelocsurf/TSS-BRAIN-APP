// Universal entry — server-side gate.
// 1. If an authenticated student session cookie is valid, send them straight
//    to their portal (PWA-on-home-screen experience).
// 2. If a coach/coordinator/admin is logged in, route by role:
//    - admin / coordinator / platform_admin → /dashboard
//    - coach / assistant → their personal /coach-portal/[token]
// 3. Otherwise render the universal entry form (Student tab + Staff tab).

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveStudentPortalToken } from '@/lib/actions/student-pin';
import EntryForm from '@/components/entry/EntryForm';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ kicked?: string }>;
}

export default async function EntryPage({ searchParams }: Props) {
  const params = await searchParams;
  const kicked = params.kicked === '1';

  // Student PWA fast path — cookie persisted on this device.
  if (!kicked) {
    const portalToken = await getActiveStudentPortalToken();
    if (portalToken) redirect(`/portal/${portalToken}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Route by coach role. Coaches/assistants land on their personal portal;
    // admins & coordinators land on the operations dashboard.
    const admin = createAdminClient();
    const { data: coach } = await admin
      .from('coaches')
      .select('role, portal_token, is_platform_admin')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    const role = coach?.role ?? null;
    const isLineCoach = role === 'coach' || role === 'assistant';
    if (isLineCoach && coach?.portal_token && !coach.is_platform_admin) {
      redirect(`/coach-portal/${coach.portal_token}`);
    }
    redirect('/dashboard');
  }

  return <EntryForm kicked={kicked} />;
}
