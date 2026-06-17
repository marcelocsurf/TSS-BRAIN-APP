import { redirect } from 'next/navigation';
import { getCurrentCoach } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

// Coordinator entry point to manage their own academy (branding, emergency
// plan, board inventory). Resolves the current coach's academy and forwards
// to the shared academy detail page, which already gates admin-only controls.
export default async function MyAcademyPage() {
  const me = await getCurrentCoach();
  if (me?.academy_id) {
    redirect(`/academies/${me.academy_id}`);
  }
  redirect('/dashboard');
}
