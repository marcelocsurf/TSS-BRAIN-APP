import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCoachToolsByStep } from '@/lib/actions/coach-tools';
import { StpToolsClient } from './StpToolsClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string; stepId: string }>;
}

export default async function CoachStpToolsPage({ params }: Props) {
  const { token, stepId } = await params;
  const detail = await getCoachToolsByStep(token, stepId);
  if (!detail) notFound();

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20">
      <div className="bg-[var(--tss-navy)] text-white px-4 py-5">
        <Link
          href={`/coach-portal/${token}?tab=tools`}
          className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-2"
        >
          <ArrowLeft size={12} /> Back to tools
        </Link>
        <p
          className="text-[10px] tracking-[0.2em] uppercase text-white/60 mb-1"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {detail.step.id} · {detail.step.belt === 'yellow' ? 'Yellow Belt' : 'White Belt'}
          {detail.step.pillar ? ` · ${detail.step.pillar}` : ''}
        </p>
        <h1
          className="text-2xl font-bold leading-tight"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          {detail.step.title}
        </h1>
        {detail.step.subtitle && (
          <p className="text-sm text-white/70 italic mt-1">{detail.step.subtitle}</p>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <StpToolsClient detail={detail} />
      </div>
    </div>
  );
}
