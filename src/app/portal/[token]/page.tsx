import { createAdminClient } from '@/lib/supabase/admin';
import { BELT_HIERARCHY, type BeltLevel } from '@/lib/constants/belts';
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

  // Compute unlocked levels: everything at or below current belt
  const beltIndex = BELT_HIERARCHY.indexOf(beltLevel);
  const unlockedLevels = BELT_HIERARCHY.slice(0, beltIndex + 1);

  // Fetch parallel data
  const [materials, drills, pendingSurveys, submittedSurveys] = await Promise.all([
    getStudentMaterials(beltLevel, unlockedLevels),
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
