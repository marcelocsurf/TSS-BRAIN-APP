import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCoachProfileByToken } from '@/lib/actions/coach-intake';
import { CoachProfileForm } from './CoachProfileForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CoachProfilePage({ params }: Props) {
  const { token } = await params;
  const coach = await getCoachProfileByToken(token);
  if (!coach) notFound();

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-12">
      <div className="bg-[var(--tss-navy)] text-white px-4 py-5">
        <Link
          href={`/coach-portal/${token}`}
          className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-2"
        >
          <ArrowLeft size={12} /> Back to portal
        </Link>
        <h1 className="text-xl font-bold">Your coach profile</h1>
        <p className="text-xs text-white/60 mt-1">
          {coach.intake_completed_at
            ? 'Update your details whenever they change.'
            : 'Complete this profile so the academy has your safety info on file.'}
        </p>
      </div>
      <div className="max-w-lg mx-auto px-4 py-5">
        <CoachProfileForm token={token} initial={coach} />
      </div>
    </div>
  );
}
