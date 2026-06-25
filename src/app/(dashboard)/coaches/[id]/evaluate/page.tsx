import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { getCurrentCoach as getAuthCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { EvaluationForm } from './evaluation-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoachEvaluatePage({ params }: Props) {
  // Role guard — coordinator or above
  const authCoach = await getAuthCoach();
  if (!authCoach) redirect('/login');
  if (!(await isCoordinatorOrAbove(authCoach.role))) redirect('/dashboard');

  const { id } = await params;
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from('coaches')
    .select('id, display_name, role')
    .eq('id', id)
    .single();

  if (!coach) notFound();

  const currentCoach = await getCurrentCoach();

  return (
    <div className="max-w-xl mx-auto py-6">
      <Link href={`/coaches/${coach.id}`} className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-3">
        <ArrowLeft size={14} strokeWidth={1.75} />
        {coach.display_name}
      </Link>
      <EvaluationForm
        coachId={coach.id}
        coachName={coach.display_name}
        evaluatorId={currentCoach.id}
      />
    </div>
  );
}
