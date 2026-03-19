import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardHome() {
  const supabase = await createClient();

  // Quick stats
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: sessionCount } = await supabase
    .from('student_session_results')
    .select('*', { count: 'exact', head: true })
    .eq('completion_state', 'closed');

  const { count: activeCamps } = await supabase
    .from('camp_instances')
    .select('*', { count: 'exact', head: true })
    .in('status', ['planned', 'active']);

  const { count: pendingSurveys } = await supabase
    .from('student_session_results')
    .select('*', { count: 'exact', head: true })
    .eq('completion_state', 'closed')
    .eq('survey_unlocked', true);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--tss-navy)] mb-1">Dashboard</h2>
      <p className="text-xs text-[var(--tss-gray-500)] mb-6" style={{ fontFamily: 'var(--font-mono)' }}>Coaching Operating System</p>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Active Students" value={studentCount ?? 0} accent="cyan" />
        <StatCard label="Sessions Closed" value={sessionCount ?? 0} accent="gold" />
        <StatCard label="Active Camps" value={activeCamps ?? 0} accent="navy" />
        <StatCard label="Pending Surveys" value={pendingSurveys ?? 0} accent="warm" />
      </div>

      {/* Quick actions */}
      <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickAction href="/sessions/new" label="Start Session" desc="6-step coach flow" accentColor="var(--tss-cyan)" />
        <QuickAction href="/students/new" label="Add Student" desc="Quick registration" accentColor="var(--tss-gold)" />
        <QuickAction href="/camps" label="View Camps" desc="Templates & instances" accentColor="var(--tss-navy-light)" />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  const borderColors: Record<string, string> = {
    cyan: 'border-t-[var(--tss-cyan)]',
    gold: 'border-t-[var(--tss-gold)]',
    navy: 'border-t-[var(--tss-navy)]',
    warm: 'border-t-[var(--tss-warm)]',
  };

  return (
    <div className={`bg-white rounded-xl p-4 border border-[var(--tss-gray-100)] border-t-[3px] ${borderColors[accent]} shadow-sm`}>
      <p className="text-2xl font-bold text-[var(--tss-navy)]">{value}</p>
      <p className="text-xs text-[var(--tss-gray-500)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{label}</p>
    </div>
  );
}

function QuickAction({ href, label, desc, accentColor }: { href: string; label: string; desc: string; accentColor: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl p-4 bg-white border border-[var(--tss-gray-100)] hover:shadow-md hover:border-[var(--tss-gray-300)] transition-all group"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-8 rounded-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <div>
          <p className="font-semibold text-sm text-[var(--tss-navy)] group-hover:text-[var(--tss-navy-light)]">{label}</p>
          <p className="text-xs text-[var(--tss-gray-500)] mt-0.5">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
