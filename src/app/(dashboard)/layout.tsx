import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { CoachRole } from '@/lib/constants/brand';
import { LogoutButton } from '@/components/shared/LogoutButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '\u2302', roles: ['admin', 'coordinator', 'coach', 'assistant'] },
  { href: '/students', label: 'Students', icon: '\u25C9', roles: ['admin', 'coordinator', 'coach', 'assistant'] },
  { href: '/sessions/new', label: 'Session', icon: '\u25B6', roles: ['admin', 'coordinator', 'coach'] },
  { href: '/sessions/drafts', label: 'Drafts', icon: '\u270E', roles: ['admin', 'coordinator', 'coach'] },
  { href: '/camps', label: 'Camps', icon: '\u26FA', roles: ['admin', 'coordinator'] },
  { href: '/coaches', label: 'Coaches', icon: '\u2605', roles: ['admin', 'coordinator'] },
  { href: '/course-codes', label: 'Course Codes', icon: '\u26bf', roles: ['admin', 'coordinator'] },
  { href: '/audit', label: 'Audit', icon: '\u2713', roles: ['admin'] },
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
    .select('display_name, role')
    .eq('auth_user_id', user.id)
    .single();

  if (coachError) {
    console.error('[DashboardLayout] Failed to fetch coach for user', user.id, coachError);
  }

  const role = (coach?.role as CoachRole) || 'assistant';
  const visibleNav = getNavItemsForRole(role);

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20 md:pb-0" style={{ paddingLeft: '0' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-[var(--tss-navy)] text-white z-30" style={{ width: '224px' }}>
        {/* Cyan accent line at top */}
        <div className="h-[3px] bg-[var(--tss-cyan)] w-full shrink-0" />

        <div className="p-4 border-b border-white/10">
          <Image
            src="/tss-logo-white-h.png"
            alt="The Surf Sequence"
            width={160}
            height={45}
            className="opacity-90"
            priority
          />
          <p className="text-xs text-[var(--tss-gold)] mt-2 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
            {coach?.display_name || 'Coach'}
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/8 hover:text-white transition-all border-l-2 border-transparent hover:border-[var(--tss-cyan)]"
            >
              <span className="text-base opacity-70">{item.icon}</span>
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
          <Image
            src="/tss-logo-white-h.png"
            alt="The Surf Sequence"
            width={120}
            height={34}
            className="opacity-90"
            priority
          />
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
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-medium" style={{ fontFamily: 'var(--font-body)' }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
