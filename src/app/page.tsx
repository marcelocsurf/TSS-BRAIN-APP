// Universal entry — server-side gate.
// If a coach/coordinator/admin is already authenticated, send them to /dashboard.
// Otherwise render the universal entry form (Student tab + Staff tab).

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EntryForm from '@/components/entry/EntryForm';

export const dynamic = 'force-dynamic';

export default async function EntryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <EntryForm />;
}
