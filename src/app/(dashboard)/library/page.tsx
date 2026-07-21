import { getCurrentCoach, isRealPlatformAdmin } from '@/lib/actions/auth';
import { getLibraryOverview } from '@/lib/actions/coach-resources';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { LibraryManager } from './LibraryManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Admin content library (M142): every presentation, video and link in one
// place, with per-person and bulk access grants for coaches and students.
export default async function LibraryPage() {
  const me = await getCurrentCoach();
  const isPlatform = await isRealPlatformAdmin().catch(() => false);
  if (!me || (!isPlatform && me.role !== 'admin')) redirect('/dashboard');

  const overview = await getLibraryOverview();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Library
        </h2>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          {overview.items.length} item{overview.items.length === 1 ? '' : 's'} · grant access to anyone
        </p>
      </div>

      <LibraryManager initial={overview} />

      {/* Courses live in their own granting system — link, don't duplicate. */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-[var(--tss-navy)]/5 text-[var(--tss-navy)] flex items-center justify-center shrink-0">
          <GraduationCap size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--tss-navy)]">Courses</p>
          <p className="text-[11px] text-gray-500 leading-snug">
            Belt courses have their own access system — grant from a student&apos;s profile (Courses panel) or sell via{' '}
            <Link href="/course-codes" className="underline text-[var(--tss-navy)]">Course Codes</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
