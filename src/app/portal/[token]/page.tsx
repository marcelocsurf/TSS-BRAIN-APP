import { type BeltLevel } from '@/lib/constants/belts';
import { notFound } from 'next/navigation';
import {
  getStudentPortalData,
  getStudentMaterials,
  getStudentDrillsForSelfTraining,
  getPendingSurveys,
  getSubmittedSurveys,
} from '@/lib/actions/portal';
import { PortalTabs } from './portal-tabs';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function StudentPortalPage({ params }: Props) {
  const { token } = await params;

  // Get comprehensive student data
  const portalData = await getStudentPortalData(token);
  if (!portalData) notFound();

  const { student } = portalData;
  const beltLevel = student.belt_level as BeltLevel;

  // Fetch parallel data — materials use admin access control via student_level_access
  const [materials, drills, pendingSurveys, submittedSurveys] = await Promise.all([
    getStudentMaterials(student.id, beltLevel),
    getStudentDrillsForSelfTraining(beltLevel),
    getPendingSurveys(student.id),
    getSubmittedSurveys(student.id),
  ]);

  return (
    <PortalTabs
      data={{
        ...portalData,
        drills,
        pendingSurveys,
        submittedSurveys,
        materials,
        token,
      }}
    />
  );
}
