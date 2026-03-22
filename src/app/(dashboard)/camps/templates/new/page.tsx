import { TemplateBuilderForm } from '@/components/camp/TemplateBuilderForm';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NewCampTemplatePage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) redirect('/');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--tss-navy)]">Create Camp Template</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Define the day-by-day structure for a new camp program.
          </p>
        </div>
        <Link href="/camps/templates" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
      </div>

      <TemplateBuilderForm mode="create" />
    </div>
  );
}
