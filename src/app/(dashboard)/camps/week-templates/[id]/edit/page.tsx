import { redirect, notFound } from 'next/navigation';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listCampTemplates } from '@/lib/actions/camps';
import { getCoachesForAssignment } from '@/lib/actions/cascade-sessions';
import { getWeekTemplate } from '@/lib/actions/week-templates';
import { WeekTemplateEditor } from '@/components/camp/WeekTemplateEditor';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditWeekTemplatePage({ params }: Props) {
  const { id } = await params;
  const me = await getCurrentCoach();
  if (!me || !(await isCoordinatorOrAbove(me.role))) redirect('/dashboard');

  const [wt, campTemplates, coaches] = await Promise.all([
    getWeekTemplate(id),
    listCampTemplates(),
    getCoachesForAssignment(),
  ]);

  if (!wt) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Edit Week Template
          </h2>
          <p className="text-xs text-gray-500 mt-1">{wt.name}</p>
        </div>
        <Link href="/camps/week-templates" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
      </div>

      <WeekTemplateEditor
        mode="edit"
        initial={wt}
        campTemplates={campTemplates as any}
        coaches={coaches as any}
      />
    </div>
  );
}
