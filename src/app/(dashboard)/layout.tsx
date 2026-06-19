import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { CoachRole } from '@/lib/constants/brand';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { getActAsAcademyId, isRealPlatformAdmin } from '@/lib/actions/auth';
import { ActAsBanner } from '@/components/admin/ActAsBanner';
import { AcademySwitcher } from '@/components/admin/AcademySwitcher';
import {
  Home,
  Users,
  Tent,
  Star,
  Ticket,
  Play,
  Pencil,
  Building2,
  Film,
  Video,
  ShieldCheck,
  Receipt,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type NavItem = { href: string; label: string; Icon: LucideIcon; roles: string[] };

const NAV_ITEMS: NavItem[] = [
  // \u2014 Admin + coordinator + coach + assistant \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014
  { href: '/',              label: 'Home',         Icon: Home,        roles: ['admin', 'coordinator', 'coach', 'assistant'] },
  { href: '/students',      label: 'Students',     Icon: Users,       roles: ['admin', 'coordinator', 'coach', 'assistant'] },
  { href: '/camps',         label: 'Services',     Icon: Tent,        roles: ['admin', 'coordinator'] },
  { href: '/coaches',       label: 'Coaches',      Icon: Star,        roles: ['admin', 'coordinator'] },
  { href: '/course-codes',  label: 'Course Codes', Icon: Ticket,      roles: ['admin', 'coordinator'] },
  { href: '/my-academy',    label: 'My Academy',   Icon: Building2,    roles: ['coordinator'] },
  // \u2014 Coach / assistant session workflow \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014
  { href: '/sessions/new',    label: 'Session', Icon: Play,   roles: ['admin', 'coach'] },
  { href: '/sessions/drafts', label: 'Drafts',  Icon: Pencil, roles: ['admin', 'coach'] },
  // \u2014 Admin only \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014
  { href: '/academies',     label: 'Academies', Icon: Building2,   roles: ['admin'] },
  { href: '/admin/billing',   label: 'Billing',   Icon: Receipt,     roles: ['admin'] },
  { href: '/admin/analytics', label: 'Analytics', Icon: BarChart3,   roles: ['admin'] },
  { href: '/content',   label: 'Content',   Icon: Film,        roles: ['admin'] },
  { href: '/admin/video-library', label: 'Video Library', Icon: Video, roles: ['admin'] },
  { href: '/audit',     label: 'Audit',     Icon: ShieldCheck, roles: ['admin'] },
];

function getNavItemsForRole(role: CoachRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: coach, error: coachError } = await supabase
    .from('coaches')
    .select('display_name, role, academy_id')
    .eq('auth_user_id', user.id)
    .single();

  if (coachError) {
    console.error('[DashboardLayout] Failed to fetch coach for user', user.id, coachError);
  }

  // M7 — if the REAL user is platform admin AND they have set an act-as
  // cookie, fetch the academy name and render the banner up top. We
  // intentionally use isRealPlatformAdmin (which ignores the override)
  // so the banner stays visible during act-as mode.
  const [isAdmin, actAsId] = await Promise.all([
    isRealPlatformAdmin(),
    getActAsAcademyId(),
  ]);

  // When acting-as a coordinator, show coordinator nav (not full admin nav)
  const effectiveRole = (isAdmin && actAsId)
    ? 'coordinator'
    : (coach?.role as CoachRole) || 'assistant';
  const visibleNav = getNavItemsForRole(effectiveRole);
  let actAsAcademyName: string | null = null;
  let allAcademies: { id: string; name: string; slug: string }[] = [];
  if (isAdmin) {
    const { data: list } = await supabase
      .from('academies')
      .select('id, name, slug')
      .order('name');
    allAcademies = list ?? [];
    if (actAsId) {
      actAsAcademyName = allAcademies.find((a) => a.id === actAsId)?.name ?? null;
    }
  }

  // Branding academy: the one whose logo should brand the chrome. For an
  // admin acting-as, that's the act-as academy; for a real coordinator,
  // their own academy. The TSS lineage logo stays as the fallback + a
  // small "lineage" line beneath the academy logo.
  const brandingAcademyId = actAsId ?? (!isAdmin ? coach?.academy_id ?? null : null);
  let academyLogoUrl: string | null = null;
  let academyName: string | null = null;
  if (brandingAcademyId) {
    const { data: ac } = await supabase
      .from('academies')
      .select('name, logo_url')
      .eq('id', brandingAcademyId)
      .maybeSingle();
    academyLogoUrl = ac?.logo_url ?? null;
    academyName = ac?.name ?? null;
  }

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20 md:pb-0" style={{ paddingLeft: '0' }}>
      {actAsAcademyName && <ActAsBanner academyName={actAsAcademyName} />}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-[var(--tss-navy)] text-white z-30" style={{ width: '224px' }}>
        {/* Cyan accent line at top */}
        <div className="h-[3px] bg-[var(--tss-cyan)] w-full shrink-0" />

        <div className="p-4 border-b border-white/10">
          {academyLogoUrl ? (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={academyLogoUrl}
                alt={academyName || 'Academy'}
                className="max-h-14 w-auto object-contain"
              />
              <p className="text-[9px] text-white/40 mt-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                Lineage · The Surf Sequence
              </p>
            </div>
          ) : (
            <Image
              src="/tss-logo-white.png?v=2"
              alt="The Surf Sequence"
              width={170}
              height={85}
              className="opacity-95"
              priority
            />
          )}
          <p className="text-xs text-[var(--tss-gold)] mt-2 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
            {coach?.display_name || 'Coach'}
          </p>
        </div>
        {isAdmin && allAcademies.length > 0 && (
          <AcademySwitcher academies={allAcademies} currentActAsId={actAsId} />
        )}
        <nav className="flex-1 p-3 space-y-0.5">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/8 hover:text-white transition-all border-l-2 border-transparent hover:border-[var(--tss-cyan)]"
            >
              <item.Icon size={16} strokeWidth={1.75} className="opacity-70" />
              <span style={{ fontFamily: 'var(--font-body)' }}>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <Link href="/settings" className="text-xs text-white/40 hover:text-white/70 transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>Settings</Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--tss-navy)] text-white">
        {/* Cyan accent line */}
        <div className="h-[2px] bg-[var(--tss-cyan)] w-full" />
        <div className="px-4 py-3 flex items-center justify-between">
          {academyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={academyLogoUrl}
              alt={academyName || 'Academy'}
              className="max-h-9 w-auto object-contain"
            />
          ) : (
            <Image
              src="/tss-logo-white.png?v=2"
              alt="The Surf Sequence"
              width={132}
              height={66}
              className="opacity-95"
              priority
            />
          )}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--tss-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>{coach?.display_name || 'Coach'}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content — offset by sidebar width on desktop */}
      <div className="md:flex md:flex-col" style={{ marginLeft: '0' }}>
        <main className="p-4 md:p-6 max-w-5xl mx-auto w-full md:ml-56">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[var(--tss-gray-200)] flex justify-around py-2.5 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-[var(--tss-gray-500)] hover:text-[var(--tss-navy)] transition-colors"
          >
            <item.Icon size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium" style={{ fontFamily: 'var(--font-body)' }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
