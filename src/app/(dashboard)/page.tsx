import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from '@/lib/actions/auth';
import {
  getAdminDashboardData,
  getCoachDashboardData,
  getCoordinatorDashboardData,
  getAssistantDashboardData,
  getRecentAuditEvents,
} from '@/lib/actions/dashboard';
import { getDraftSessions } from '@/lib/actions/cascade-sessions';
import Link from 'next/link';

export default async function DashboardHome() {
  const supabase = await createClient();
  const coach = await getCurrentCoach();
  const role = coach?.role || 'assistant';

  // Quick stats (shared across roles)
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

  // Drafts for coaches/coordinators/admins
  let drafts: any[] = [];
  if (role === 'admin' || role === 'coordinator' || role === 'coach') {
    try {
      drafts = await getDraftSessions();
    } catch { /* non-blocking */ }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--tss-navy)] mb-1">Dashboard</h2>
      <p className="text-xs text-[var(--tss-gray-500)] mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
        {role === 'admin' && 'System Overview'}
        {role === 'coordinator' && 'Coordination Hub'}
        {role === 'coach' && 'Coaching Operating System'}
        {role === 'assistant' && 'Safety Reference'}
      </p>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Active Students" value={studentCount ?? 0} accent="cyan" />
        <StatCard label="Sessions Closed" value={sessionCount ?? 0} accent="gold" />
        <StatCard label="Active Camps" value={activeCamps ?? 0} accent="navy" />
        <StatCard label="Pending Surveys" value={pendingSurveys ?? 0} accent="warm" />
      </div>

      {/* Pending Drafts (coaches/coordinators/admins) */}
      {drafts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
              Pending Drafts ({drafts.length})
            </h3>
            <Link href="/sessions/drafts" className="text-xs text-[var(--tss-cyan)] hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {drafts.slice(0, 4).map((draft) => (
              <Link
                key={draft.id}
                href={`/sessions/new?student=${draft.student_id}&draft=${draft.id}`}
                className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 hover:bg-amber-100/60 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--tss-navy)]">{draft.student_name}</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    {draft.mission || 'No mission set'} &middot; {new Date(draft.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-amber-700 group-hover:text-[var(--tss-navy)] transition-colors">
                  Resume &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Role-specific content */}
      {role === 'admin' && <AdminDashboard />}
      {role === 'coordinator' && <CoordinatorDashboard />}
      {role === 'coach' && coach && <CoachDashboard coachId={coach.id} />}
      {role === 'assistant' && <AssistantDashboard />}

      {/* Quick actions */}
      <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider mt-8" style={{ fontFamily: 'var(--font-mono)' }}>Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(role === 'admin' || role === 'coordinator' || role === 'coach') && (
          <QuickAction href="/sessions/new" label="Start Session" desc="6-step coach flow" accentColor="var(--tss-cyan)" />
        )}
        {(role === 'admin' || role === 'coordinator') && (
          <QuickAction href="/students/new" label="Add Student" desc="Quick registration" accentColor="var(--tss-gold)" />
        )}
        {(role === 'admin' || role === 'coordinator') && (
          <QuickAction href="/camps" label="View Camps" desc="Templates & instances" accentColor="var(--tss-navy-light)" />
        )}
        {role === 'admin' && (
          <>
            <QuickAction href="/coaches/new" label="Create Coach" desc="Add team member" accentColor="var(--tss-cyan)" />
            <QuickAction href="/audit" label="View Audit" desc="System audit log" accentColor="var(--tss-warm)" />
          </>
        )}
        {role === 'coach' && (
          <QuickAction href="/students" label="My Students" desc="View student list" accentColor="var(--tss-gold)" />
        )}
        {role === 'assistant' && (
          <QuickAction href="/students" label="View Students" desc="Safety & contact info" accentColor="var(--tss-cyan)" />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════

async function AdminDashboard() {
  let adminData;
  let auditEvents: any[] = [];
  try {
    [adminData, auditEvents] = await Promise.all([
      getAdminDashboardData(),
      getRecentAuditEvents(5),
    ]);
  } catch {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>System Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <MiniStat label="Total Students" value={adminData.totalStudents} />
          <MiniStat label="Total Coaches" value={adminData.totalCoaches} />
          <MiniStat label="Total Sessions" value={adminData.totalSessions} />
          <MiniStat label="Total Camps" value={adminData.totalCamps} />
          <MiniStat label="Active Camps" value={adminData.activeCamps} />
        </div>
      </div>

      {/* Recent Audit Events */}
      {auditEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Recent Audit</h3>
            <Link href="/audit" className="text-xs text-[var(--tss-cyan)] hover:underline">View All</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {auditEvents.map((evt: any) => (
              <div key={evt.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-700">{evt.event_type?.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{evt.actor_name || 'System'}</p>
                </div>
                <span className="text-[10px] text-gray-300">
                  {new Date(evt.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// COORDINATOR DASHBOARD
// ═══════════════════════════════════════

async function CoordinatorDashboard() {
  let coordData;
  try {
    coordData = await getCoordinatorDashboardData();
  } catch {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Student Pipeline */}
      {coordData.pendingIntake.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Pending Intake ({coordData.pendingIntake.length})</h3>
          <div className="bg-white rounded-xl border border-amber-100 divide-y divide-gray-50 overflow-hidden">
            {coordData.pendingIntake.map((s: any) => (
              <Link key={s.id} href={`/students/${s.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-amber-50/30 transition-colors">
                <p className="text-sm text-gray-700">{s.first_name} {s.last_name}</p>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">No Intake</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {coordData.noWaiver.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Missing Waiver ({coordData.noWaiver.length})</h3>
          <div className="bg-white rounded-xl border border-red-100 divide-y divide-gray-50 overflow-hidden">
            {coordData.noWaiver.map((s: any) => (
              <Link key={s.id} href={`/students/${s.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-red-50/30 transition-colors">
                <p className="text-sm text-gray-700">{s.first_name} {s.last_name}</p>
                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">No Waiver</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {coordData.activeCamps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Active Camps</h3>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {coordData.activeCamps.map((c: any) => (
              <Link key={c.id} href={`/camps/${c.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm text-gray-700">{c.camp_name}</p>
                  <p className="text-[10px] text-gray-400">{c.start_date} - {c.end_date}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                  c.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// COACH DASHBOARD
// ═══════════════════════════════════════

async function CoachDashboard({ coachId }: { coachId: string }) {
  let coachData;
  try {
    coachData = await getCoachDashboardData(coachId);
  } catch {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Coach Stats */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>My Overview</h3>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="My Students" value={coachData.myStudentCount} />
          <MiniStat label="Draft Sessions" value={coachData.draftCount} />
        </div>
      </div>

      {/* Recent Sessions */}
      {coachData.recentSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Recent Sessions</h3>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {coachData.recentSessions.map((s: any) => (
              <div key={s.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {s.students?.first_name} {s.students?.last_name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.mission || 'No mission'}</p>
                </div>
                <span className="text-[10px] text-gray-300">
                  {s.session_date ? new Date(s.session_date).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// ASSISTANT DASHBOARD
// ═══════════════════════════════════════

async function AssistantDashboard() {
  let assistantData;
  try {
    assistantData = await getAssistantDashboardData();
  } catch {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Medical Alerts */}
      {assistantData.medicalAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Medical Alerts</h3>
          <div className="bg-white rounded-xl border border-red-100 divide-y divide-gray-50 overflow-hidden">
            {assistantData.medicalAlerts.map((s: any) => (
              <Link key={s.id} href={`/students/${s.id}`} className="block px-4 py-2.5 hover:bg-red-50/30 transition-colors">
                <p className="text-sm font-medium text-gray-700">{s.first_name} {s.last_name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {s.allergies && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Allergies: {s.allergies}</span>}
                  {s.injuries && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">Injuries: {s.injuries}</span>}
                  {s.medical_notes && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Medical notes</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {assistantData.emergencyContacts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Emergency Contacts</h3>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {assistantData.emergencyContacts.map((s: any) => (
              <div key={s.id} className="px-4 py-2.5 flex items-center justify-between">
                <p className="text-sm text-gray-700">{s.first_name} {s.last_name}</p>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{s.emergency_contact_name}</p>
                  <p className="text-[10px] text-gray-400">{s.emergency_contact_phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════

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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <p className="text-lg font-bold text-[var(--tss-navy)]">{value}</p>
      <p className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>{label}</p>
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
