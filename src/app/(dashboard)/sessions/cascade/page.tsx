import {
  getDropdownOptionsBatch,
  getStudentsForCoach,
  getStudentWithCascadeContext,
  getCoachesForAssignment,
} from '@/lib/actions/cascade-sessions';
import { getCurrentCoach } from '@/lib/actions/auth';
import { SessionCascadeForm } from '@/components/session/SessionCascadeForm';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ student?: string }>;
}

export default async function NewSessionPage({ searchParams }: Props) {
  const params = await searchParams;
  const studentId = params?.student;

  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect('/login');

  const canAssignCoach = currentCoach.role === 'admin' || currentCoach.role === 'coordinator';

  // Load initial data in parallel
  const [students, dropdowns, initialStudent, coaches] = await Promise.all([
    getStudentsForCoach(),
    getDropdownOptionsBatch(['training_venue', 'session_type']),
    studentId ? getStudentWithCascadeContext(studentId) : Promise.resolve(null),
    canAssignCoach ? getCoachesForAssignment() : Promise.resolve([]),
  ]);

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
