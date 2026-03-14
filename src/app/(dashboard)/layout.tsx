import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/students', label: 'Students', icon: '◉' },
  { href: '/sessions/new', label: 'Session', icon: '▶' },
  { href: '/camps', label: 'Camps', icon: '⛺' },
  { href: '/coaches', label: 'Coaches', icon: '★' },
  { href: '/audit', label: 'Audit', icon: '✓' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: coach } = await supabase
    .from('coaches')
    .select('display_name, role')
    .eq('auth_user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20 md:pb-0" style={{ paddingLeft: '0' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-[var(--tss-navy)] text-white z-30" style={{ width: '224px' }}>
        <div className="p-4 border-b border-white/10">
          <h1 className="text-lg font-bold">TSS Brain</h1>
          <p className="text-xs text-[var(--tss-gold)]">{coach?.display_name || 'Coach'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/settings" className="text-xs text-white/50 hover:text-white/80">Settings</Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--tss-navy)] text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">TSS Brain</h1>
        <span className="text-xs text-[var(--tss-gold)]">{coach?.display_name || 'Coach'}</span>
      </header>

      {/* Main content — offset by sidebar width on desktop */}
      <div className="md:flex md:flex-col" style={{ marginLeft: '0' }}>
        <main className="p-4 md:p-6 max-w-5xl mx-auto w-full md:ml-56">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-2 z-40">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-[var(--tss-navy)] transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
