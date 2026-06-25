import { redirect } from 'next/navigation';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listCampTemplates } from '@/lib/actions/camps';
import { getCoachesForAssignment } from '@/lib/actions/cascade-sessions';
import { WeekTemplateEditor } from '@/components/camp/WeekTemplateEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewWeekTemplatePage() {
  const me = await getCurrentCoach();
  if (!me || !(await isCoordinatorOrAbove(me.role))) redirect('/dashboard');

  const [campTemplates, coaches] = await Promise.all([
    listCampTemplates(),
    getCoachesForAssignment(),
  ]);

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <Link href="/camps/week-templates" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-3">
          <ArrowLeft size={14} strokeWidth={1.75} />
          Week Templates
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            New Week Template
          </h2>
          <p className="text-xs text-gray-500 mt-1">Define the weekly rhythm you stamp on any week.</p>
        </div>
        <Link href="/camps/week-templates" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
      </div>

      <WeekTemplateEditor
        mode="create"
        campTemplates={campTemplates as any}
        coaches={coaches as any}
      />
    </div>
  );
}
