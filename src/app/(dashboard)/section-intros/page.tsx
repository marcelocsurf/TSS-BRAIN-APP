import { redirect } from 'next/navigation';
import { getCurrentCoach } from '@/lib/actions/auth';
import { getSectionIntros } from '@/lib/actions/section-intros';
import { SectionIntroManager } from '@/components/admin/SectionIntroManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SectionIntrosPage() {
  const me = await getCurrentCoach();
  if (!me) redirect('/login');
  if (!me.is_platform_admin && me.role !== 'admin') redirect('/dashboard');

  const intros = await getSectionIntros();

  return (
    <div className="max-w-2xl mx-auto py-2">
      <h1 className="text-2xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
        Section intro videos
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        Paste a YouTube, Vimeo or Google Drive link. It shows under that section&apos;s header in the student course. Admin only.
      </p>
      <SectionIntroManager initial={intros} />
    </div>
  );
}
