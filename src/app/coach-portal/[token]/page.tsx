import { notFound } from 'next/navigation';
import { getCoachPortalData } from '@/lib/actions/coach-portal';
import { CoachPortalTabs } from './CoachPortalTabs';
import { resolveAcademyBranding } from '@/lib/branding';
import { Lock } from 'lucide-react';
import { getActiveStudentOrCoachImpersonation } from '@/lib/actions/impersonate';
import { ImpersonateBanner } from '@/components/admin/ImpersonateBanner';

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
  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--tss-gray-50)] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm">
          <Lock size={36} strokeWidth={1.75} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-lg font-bold text-[var(--tss-navy)] mb-2">Access not enabled</h1>
          <p className="text-sm text-gray-500">
            Your portal access has not been activated yet. Contact your academy administrator to enable it.
          </p>
        </div>
      </div>
    );
  }

  const validTabs = ['home', 'courses', 'tools', 'services', 'rating'];
  const initialTab = tab && validTabs.includes(tab) ? (tab as any) : undefined;

  // M9 — academy branding fallback
  const brand = resolveAcademyBranding(data.academyBranding);

  const impersonation = await getActiveStudentOrCoachImpersonation();
  const isImpersonatingThisCoach =
    impersonation?.kind === 'coach' && impersonation.portal_token === token;

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20">
      {isImpersonatingThisCoach && impersonation && (
        <ImpersonateBanner kind="coach" name={impersonation.name} />
      )}
      <div style={{ background: brand.primary }} className="px-4 py-6 text-center">
        {brand.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="h-12 mx-auto mb-3 object-contain"
          />
        )}
        <h1
          className="text-2xl font-bold text-white leading-tight"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          {brand.name}
        </h1>
        <p
          style={{ color: brand.accent, fontFamily: 'DM Mono, monospace' }}
          className="text-[10px] mt-1.5 tracking-[0.2em] uppercase"
        >
          Coach Portal — {brand.tagline}
        </p>
      </div>

      <CoachPortalTabs data={data} initialTab={initialTab} />
    </div>
  );
}
