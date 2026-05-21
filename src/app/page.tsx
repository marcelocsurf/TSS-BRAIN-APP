// Universal entry — server-side gate.
// 1. If an authenticated student session cookie is valid, send them straight
//    to their portal (PWA-on-home-screen experience).
// 2. If a coach/coordinator/admin is logged in, send them to /dashboard.
// 3. Otherwise render the universal entry form (Student tab + Staff tab).

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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
  if (user) redirect('/dashboard');

  return <EntryForm kicked={kicked} />;
}
