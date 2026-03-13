import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuditDashboardPage() {
  const supabase = await createClient();

  // Check role — holistic_coach only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: coach } = await supabase.from('coaches').select('role').eq('auth_user_id', user.id).single();
  if (coach?.role !== 'holistic_coach') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Access restricted to Holistic Coach.</p>
      </div>
    );
  }

  // ── SESSION METRICS ──
  const { count: totalClosed } = await supabase
    .from('student_session_results')
    .select('*', { count: 'exact', head: true })
    .eq('completion_state', 'closed');

  const { count: totalSurveyCompleted } = await supabase
    .from('student_session_results')
    .select('*', { count: 'exact', head: true })
    .eq('completion_state', 'survey_completed');

  // Average ratings
  const { data: avgData } = await supabase
    .from('student_session_results')
    .select('focus_rating, frustration_rating')
    .not('focus_rating', 'is', null);

  const avgFocus = avgData && avgData.length > 0
    ? (avgData.reduce((sum: number, r: any) => sum + (r.focus_rating || 0), 0) / avgData.length).toFixed(1)
    : '—';
  const avgFrustration = avgData && avgData.length > 0
    ? (avgData.reduce((sum: number, r: any) => sum + (r.frustration_rating || 0), 0) / avgData.length).toFixed(1)
    : '—';

  // ── COMPLIANCE FLAGS ──
  const { count: noEmail } = await supabase
    .from('student_session_results')
    .select('*', { count: 'exact', head: true })
    .eq('email_sent', false)
    .eq('completion_state', 'closed');

  const { count: pendingSurveys } = await supabase
    .from('student_session_results')
    .select('*', { count: 'exact', head: true })
    .eq('survey_unlocked', true)
    .eq('completion_state', 'closed');

  // Students with no sessions in 14+ days
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const { data: inactiveStudents } = await supabase
    .from('students')
    .select('id, first_name, last_name, last_session_date')
    .eq('status', 'active')
    .or(`last_session_date.is.null,last_session_date.lt.${twoWeeksAgo.toISOString()}`);

  // Ocean overrides
  const { count: overrides } = await supabase
    .from('audit_log')
    .select('*', { count: 'exact', head: true })
    .ilike('note', '%override%');

  // ── CAMP PROGRESS ──
  const { data: activeCamps } = await supabase
    .from('camp_instances')
    .select('id, camp_name, status, camp_templates(duration_days)')
    .in('status', ['planned', 'active']);

  // Per camp: count completed sessions
  const campProgress = [];
  for (const camp of activeCamps || []) {
    const { count: completedDays } = await supabase
      .from('camp_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('camp_instance_id', camp.id)
      .eq('session_status', 'completed');
    campProgress.push({
      ...camp,
      completedDays: completedDays || 0,
      totalDays: (camp as any).camp_templates?.duration_days || 0,
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-[var(--tss-navy)]">Audit Dashboard</h2>

      {/* Session Metrics */}
      <Section title="Session Metrics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Sessions Closed" value={totalClosed ?? 0} />
          <Stat label="Surveys Done" value={totalSurveyCompleted ?? 0} />
          <Stat label="Avg Focus" value={avgFocus} />
          <Stat label="Avg Frustration" value={avgFrustration} />
        </div>
      </Section>

      {/* Compliance Flags */}
      <Section title="Compliance Flags">
        <div className="space-y-2">
          <Flag label="Sessions without email sent" value={noEmail ?? 0} severity={noEmail && noEmail > 0 ? 'warn' : 'ok'} />
          <Flag label="Pending surveys (closed but no response)" value={pendingSurveys ?? 0} severity={pendingSurveys && pendingSurveys > 3 ? 'warn' : 'ok'} />
          <Flag label="Ocean rule overrides logged" value={overrides ?? 0} severity={overrides && overrides > 0 ? 'info' : 'ok'} />
          <Flag
            label="Students inactive 14+ days"
            value={inactiveStudents?.length ?? 0}
            severity={inactiveStudents && inactiveStudents.length > 0 ? 'warn' : 'ok'}
          />
        </div>
        {inactiveStudents && inactiveStudents.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            {inactiveStudents.slice(0, 5).map((s: any) => (
              <p key={s.id}>{s.first_name} {s.last_name} — last: {s.last_session_date ? new Date(s.last_session_date).toLocaleDateString() : 'never'}</p>
            ))}
          </div>
        )}
      </Section>

      {/* Camp Progress */}
      <Section title="Camp Progress">
        {campProgress.length === 0 ? (
          <p className="text-sm text-gray-400">No active camps.</p>
        ) : (
          <div className="space-y-2">
            {campProgress.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.camp_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{c.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--tss-navy)]">{c.completedDays}/{c.totalDays}</p>
                  <p className="text-[10px] text-gray-400">days completed</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xl font-bold text-[var(--tss-navy)]">{value}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function Flag({ label, value, severity }: { label: string; value: number; severity: 'ok' | 'warn' | 'info' }) {
  const colors = {
    ok: 'bg-green-50 text-green-700',
    warn: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[severity]}`}>
        {value}
      </span>
    </div>
  );
}
