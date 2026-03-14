import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { EvaluationForm } from './evaluation-form';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoachEvaluatePage({ params }: Props) {
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
      <EvaluationForm
        coachId={coach.id}
        coachName={coach.display_name}
        evaluatorId={currentCoach.id}
      />
    </div>
  );
}
