import {
  getDropdownOptionsBatch,
  getStudentsForCoach,
  getStudentWithCascadeContext,
  getCoachesForAssignment,
} from '@/lib/actions/cascade-sessions';
import { getCurrentCoach } from '@/lib/actions/auth';
import { SessionCascadeForm } from '@/components/session/SessionCascadeForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ student?: string }>;
}

export default async function NewSessionPage({ searchParams }: Props) {
  const params = await searchParams;
  const studentId = params?.student;

  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect('/login');

  const canAssignCoach = currentCoach.role === 'admin' || currentCoach.role === 'coordinator';

  // Load initial data with error safety
  let students: any[] = [];
  let dropdowns: any = {};
  let initialStudent: any = null;
  let coaches: any[] = [];

  try {
    [students, dropdowns, initialStudent, coaches] = await Promise.all([
      getStudentsForCoach().catch(() => []),
      getDropdownOptionsBatch(['training_venue', 'session_type']).catch(() => ({})),
      studentId ? getStudentWithCascadeContext(studentId).catch(() => null) : Promise.resolve(null),
      canAssignCoach ? getCoachesForAssignment().catch(() => []) : Promise.resolve([]),
    ]);
  } catch (err: any) {
    console.error('Session page data load error:', err.message);
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <SessionCascadeForm
        initialStudent={initialStudent}
        students={students}
        venues={dropdowns.training_venue ?? []}
        sessionTypes={dropdowns.session_type ?? []}
        coachId={currentCoach.id}
        coachName={currentCoach.display_name}
        coachRole={currentCoach.role}
        coaches={coaches}
      />
    </div>
  );
}
