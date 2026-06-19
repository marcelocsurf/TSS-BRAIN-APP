import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCurrentCoach } from '@/lib/actions/auth';
import { listModelClips } from '@/lib/actions/model-clips';
import { ModelLibraryManager } from '@/components/video-analyzer/ModelLibraryManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Admin: manage the Video Analyzer model clip library (the pre-recorded
// example clips students/coaches compare against).
export default async function VideoLibraryPage() {
  const me = await getCurrentCoach();
  if (!me?.is_platform_admin) redirect('/dashboard');

  const clips = await listModelClips();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--tss-navy)]">
        <ArrowLeft size={12} /> Dashboard
      </Link>
      <div>
        <h1 className="text-xl font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Video Analyzer — Model Library
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload the pre-recorded example clips. They appear in the Video Analyzer for coaches and students to compare against.
        </p>
      </div>
      <ModelLibraryManager clips={clips} />
    </div>
  );
}
