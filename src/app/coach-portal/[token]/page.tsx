import { notFound, redirect } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { getCoachPortalData } from '@/lib/actions/coach-portal';
import { CoachPortalTabs } from './CoachPortalTabs';
import { getStudentSideForCoach } from '@/lib/actions/dual-profile';
import { resolveAcademyBranding } from '@/lib/branding';
import { Lock } from 'lucide-react';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { getActiveStudentOrCoachImpersonation } from '@/lib/actions/impersonate';
import { ImpersonateBanner } from '@/components/admin/ImpersonateBanner';

// Brand Manual v10 typefaces — Archivo (variable, wdth axis for Expanded
// display) + IBM Plex Mono for labels/data. Scoped to the coach portal.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function CoachPortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { tab } = await searchParams;

  // Managers have their own read-only portal — send them there even if they
  // were given (or bookmarked) the coach-portal form of their link.
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const { data: who } = await createAdminClient()
      .from('coaches').select('portal_category').eq('portal_token', token).maybeSingle();
    if ((who as any)?.portal_category === 'manager') redirect(`/manager-portal/${token}`);
  } catch (e) {
    if ((e as any)?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
  }

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
          {/* Escape hatch — without this, a signed-in account with no portal
              access is a dead end (the root route keeps sending it back here). */}
          <div className="mt-5">
            <LogoutButton
              label="Sign out and use another account"
              className="inline-block rounded-xl bg-[var(--tss-navy)] px-4 py-2.5 text-sm font-semibold text-white"
            />
          </div>
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

  // La ruta es la misma para todo el equipo, pero la etiqueta no puede serlo:
  // un host leyendo "Coach Portal" arriba de su propio nombre no entiende
  // en qué portal está. Cada rol ve el suyo.
  const role = (data.coach as any).role as string | null;
  const portalCategory = (data.coach as any).portal_category as string | null;
  // Implementación oficial 2026-08-21: host y support SON el Front Desk.
  const portalLabel =
    role === 'host' ? 'Front Desk'
    : role === 'seller' ? 'Portal de ventas'
    : portalCategory === 'support' ? 'Front Desk · Operaciones'
    : 'Coach Portal';

  return (
    <div className={`min-h-screen tss-portal-bg pb-20 ${archivo.variable} ${plexMono.variable}`}>
      {isImpersonatingThisCoach && impersonation && (
        <ImpersonateBanner kind="coach" name={impersonation.name} />
      )}
      {/* Slim header — academy logo + tagline left, TSS lineage logo right */}
      <div style={{ background: brand.primary }} className="px-4 py-3 relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {brand.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoUrl} alt={brand.name} className="h-8 object-contain shrink-0" />
            )}
            <div className="min-w-0">
              <p style={{ color: brand.accent }} className="tss-tagline text-xs truncate">{brand.tagline}</p>
              <p style={{ color: brand.accent, fontFamily: 'DM Mono, monospace' }} className="text-[8px] tracking-[0.25em] uppercase opacity-70">{portalLabel}</p>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" className="h-5 object-contain opacity-90 shrink-0" />
        </div>
      </div>

      <CoachPortalTabs
        data={data}
        initialTab={initialTab}
        studentSide={await getStudentSideForCoach(data.coach.id)}
      />
    </div>
  );
}
