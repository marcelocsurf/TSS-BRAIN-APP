import { notFound } from 'next/navigation';
import { getCoachPortalData } from '@/lib/actions/coach-portal';
import { CoachPortalTabs } from './CoachPortalTabs';
import { BRAND } from '@/lib/constants/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function CoachPortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { tab } = await searchParams;

  const data = await getCoachPortalData(token);
  if (!data) notFound();

  const validTabs = ['home', 'courses', 'tools', 'services', 'rating'];
  const initialTab = tab && validTabs.includes(tab) ? (tab as any) : undefined;

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20">
      <div style={{ background: BRAND.colors.navy }} className="px-4 py-5 text-center">
        <h1 className="text-lg font-bold text-white">The Surf Sequence</h1>
        <p style={{ color: BRAND.colors.gold }} className="text-[10px] mt-0.5 tracking-wide uppercase">
          Coach Portal — {BRAND.tagline}
        </p>
      </div>

      <CoachPortalTabs data={data} initialTab={initialTab} />
    </div>
  );
}
