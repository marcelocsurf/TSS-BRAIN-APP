import { redirect } from 'next/navigation';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { AddCoachForm } from './add-coach-form';

export default async function AddCoachPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect('/login');
  if (!isCoordinatorOrAbove(currentCoach.role)) redirect('/');

  return <AddCoachForm />;
}
