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
      <h2 className="text-xl font-bold text-[var(--tss-navy)] mb-6">Dashboard</h2>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Active Students" value={studentCount ?? 0} />
        <StatCard label="Sessions Closed" value={sessionCount ?? 0} />
        <StatCard label="Active Camps" value={activeCamps ?? 0} />
        <StatCard label="Pending Surveys" value={pendingSurveys ?? 0} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickAction href="/sessions/new" label="Start Session" desc="6-step coach flow" accent />
        <QuickAction href="/students/new" label="Add Student" desc="Quick registration" />
        <QuickAction href="/camps" label="View Camps" desc="Templates & instances" />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <p className="text-2xl font-bold text-[var(--tss-navy)]">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function QuickAction({ href, label, desc, accent }: { href: string; label: string; desc: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-xl p-4 border transition-colors ${
        accent
          ? 'bg-[var(--tss-navy)] text-white border-transparent hover:opacity-90'
          : 'bg-white border-gray-100 hover:border-[var(--tss-gold)]'
      }`}
    >
      <p className={`font-semibold text-sm ${accent ? 'text-white' : 'text-[var(--tss-navy)]'}`}>{label}</p>
      <p className={`text-xs mt-1 ${accent ? 'text-white/70' : 'text-gray-500'}`}>{desc}</p>
    </Link>
  );
}
