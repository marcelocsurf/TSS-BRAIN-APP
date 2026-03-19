import {
  getDropdownOptionsBatch,
  getStudentsForCoach,
  getStudentWithCascadeContext,
} from '@/lib/actions/cascade-sessions';
import { SessionCascadeForm } from '@/components/session/SessionCascadeForm';

interface Props {
  searchParams: Promise<{ student?: string }>;
}

export default async function NewSessionPage({ searchParams }: Props) {
  const params = await searchParams;
  const studentId = params?.student;

  // Load initial data in parallel
  const [students, dropdowns, initialStudent] = await Promise.all([
    getStudentsForCoach(),
    getDropdownOptionsBatch(['training_venue', 'session_type']),
    studentId ? getStudentWithCascadeContext(studentId) : Promise.resolve(null),
  ]);

  return (
    <div className="max-w-lg mx-auto pb-24">
      <SessionCascadeForm
        initialStudent={initialStudent}
        students={students}
        venues={dropdowns.training_venue ?? []}
        sessionTypes={dropdowns.session_type ?? []}
      />
    </div>
  );
}
