import { TemplateBuilderForm } from '@/components/camp/TemplateBuilderForm';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewCampTemplatePage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) redirect('/dashboard');

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/camps/templates" className="text-sm text-[#55666E] hover:text-[#10263B] inline-flex items-center gap-1 mb-3">
        <ArrowLeft size={14} strokeWidth={1.75} />
        Templates
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Create Template
          </h2>
          <p className="text-xs text-[#55666E] mt-1">
            Define the day-by-day structure for a new camp program.
          </p>
        </div>
        <Link href="/camps/templates" className="text-sm text-[#55666E] hover:text-[#10263B]">
          Cancel
        </Link>
      </div>

      <TemplateBuilderForm mode="create" />
    </div>
  );
}
