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
import { getMyNotifications } from '@/lib/actions/notifications';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import Link from 'next/link';
import {
  UserPlus,
  GraduationCap,
  Tent,
  ClipboardList,
  Users,
  AlertTriangle,
  CircleDot,
  CalendarDays,
  Clock,
  Waves,
  BarChart3,
} from 'lucide-react';

export default async function DashboardHome() {
  const supabase = await createClient();
  const coach = await getCurrentCoach();
  const role = coach?.role || 'assistant';

  // Quick stats — scoped to the academy in context. getCurrentCoach()
  // honors the act-as cookie, so a platform admin viewing an academy
  // sees that academy's numbers; a real platform admin with no academy
  // context sees platform-wide totals. RLS lets the admin see everything,
  // so this app-level filter is what keeps the overview tenant-correct.
  const academyId = coach?.academy_id ?? null;

  let studentQ = supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  if (academyId) studentQ = studentQ.eq('academy_id', academyId);
  const { count: studentCount } = await studentQ;

  let sessionQ = academyId
    ? supabase
        .from('student_session_results')
        .select('*, students!inner(academy_id)', { count: 'exact', head: true })
        .eq('completion_state', 'closed')
        .eq('students.academy_id', academyId)
    : supabase
        .from('student_session_results')
        .select('*', { count: 'exact', head: true })
        .eq('completion_state', 'closed');
  const { count: sessionCount } = await sessionQ;

  let campsQ = supabase
    .from('camp_instances')
    .select('*', { count: 'exact', head: true })
    .in('status', ['planned', 'active']);
  if (academyId) campsQ = campsQ.eq('academy_id', academyId);
  const { count: activeCamps } = await campsQ;

  let surveyQ = academyId
    ? supabase
        .from('student_session_results')
        .select('*, students!inner(academy_id)', { count: 'exact', head: true })
        .eq('completion_state', 'closed')
        .eq('survey_unlocked', true)
        .eq('students.academy_id', academyId)
    : supabase
        .from('student_session_results')
        .select('*', { count: 'exact', head: true })
        .eq('completion_state', 'closed')
        .eq('survey_unlocked', true);
  const { count: pendingSurveys } = await surveyQ;

  // In-app notifications (assignment responses, etc.)
  let notifications: Awaited<ReturnType<typeof getMyNotifications>> = [];
  try {
    notifications = await getMyNotifications();
  } catch { /* non-blocking */ }

  // Drafts for coaches/coordinators/admins
  let drafts: any[] = [];
  if (role === 'admin' || role === 'coordinator' || role === 'coach') {
    try {
      drafts = await getDraftSessions();
    } catch { /* non-blocking */ }
  }

  return (
    <div>
      <h2
        className="text-2xl font-bold text-[var(--tss-navy)] mb-1 leading-tight"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Dashboard
      </h2>
      <p
        className="text-[10px] uppercase tracking-wider text-gray-400 mb-6"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {role === 'admin' && 'System Overview'}
        {role === 'coordinator' && 'Coordination Hub'}
        {role === 'coach' && 'Coaching Operating System'}
        {role === 'assistant' && 'Safety Reference'}
      </p>

      <NotificationsPanel notifications={notifications} />

      {/* Quick stats — telemetry strip with consistent Lora numerals */}
      <p className="tss-section-label">
        <BarChart3 size={11} strokeWidth={1.75} />
        Overview
      </p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Active Students', value: studentCount ?? 0 },
            { label: 'Sessions Closed', value: sessionCount ?? 0 },
            { label: 'Active Camps', value: activeCamps ?? 0 },
            { label: 'Pending Surveys', value: pendingSurveys ?? 0 },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`px-4 py-5 text-center ${
                i > 0 ? 'border-l border-gray-100' : ''
              } ${i >= 2 ? 'border-t md:border-t-0 border-gray-100' : ''}`}
            >
              <p className="tss-stat-number">{s.value}</p>
              <p
                className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-2"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Drafts (coaches/coordinators/admins) */}
      {drafts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>
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

      {/* Quick actions — only for non-coordinator roles. Coordinator has
          its own Quick Actions block inside CoordinatorDashboard above. */}
      {role !== 'coordinator' && (
        <>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider mt-8" style={{ fontFamily: 'DM Mono, monospace' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(role === 'admin' || role === 'coach') && (
              <QuickAction href="/sessions/new" label="Start Session" desc="6-step coach flow" accentColor="var(--tss-cyan)" />
            )}
            {role === 'admin' && (
              <>
                <QuickAction href="/students/new" label="Add Student" desc="Quick registration" accentColor="var(--tss-gold)" />
                <QuickAction href="/camps" label="View Camps" desc="Templates & instances" accentColor="var(--tss-navy-light)" />
                <QuickAction href="/coaches/new" label="Create Coach" desc="Add team member" accentColor="var(--tss-cyan)" />
                <QuickAction href="/audit" label="View Audit" desc="System audit log" accentColor="var(--tss-warm)" />
                <QuickAction href="/admin/pricing" label="Pricing & Invoices" desc="Set course prices, generate monthly invoices" accentColor="var(--tss-gold)" />
              </>
            )}
            {role === 'coach' && (
              <QuickAction href="/students" label="My Students" desc="View student list" accentColor="var(--tss-gold)" />
            )}
            {role === 'assistant' && (
              <QuickAction href="/students" label="View Students" desc="Safety & contact info" accentColor="var(--tss-cyan)" />
            )}
          </div>
        </>
      )}
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
        <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>System Stats</h3>
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
            <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Recent Audit</h3>
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

  // Today panel — pull today's services so the coordinator opens the
  // dashboard and instantly sees what's running. Soft-fail if the query
  // blows up so the rest of the dashboard keeps working.
  const { listTodaysCamps } = await import('@/lib/actions/camps');
  let todaysCamps: any[] = [];
  try {
    todaysCamps = (await listTodaysCamps()) as any[];
  } catch {
    todaysCamps = [];
  }

  const { stats } = coordData;

  return (
    <div className="space-y-6">
      {/* ── Today's services ── */}
      <TodayPanel camps={todaysCamps} />

      {/* ── Stats at a glance ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Active Students" value={stats.totalStudents} />
        <MiniStat label="Active Coaches" value={stats.totalCoaches} />
        <MiniStat label="Active Camps" value={stats.activeCamps} />
        <MiniStat
          label="Pending Actions"
          value={stats.pendingActions}
          accent={stats.pendingActions > 0 ? 'amber' : undefined}
        />
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Link
            href="/students/new"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:border-[var(--tss-navy)] transition-colors"
          >
            <UserPlus size={22} strokeWidth={1.75} className="mx-auto mb-1 text-[var(--tss-cyan,#5AC3E7)]" />
            <p className="text-xs font-medium text-gray-700">New Student</p>
          </Link>
          {/* Coordinator does NOT create coaches — only the TSS head coach
              (platform admin) assigns them. Card omitted on purpose. */}
          <Link
            href="/camps/new"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:border-[var(--tss-navy)] transition-colors"
          >
            <Tent size={22} strokeWidth={1.75} className="mx-auto mb-1 text-[var(--tss-cyan,#5AC3E7)]" />
            <p className="text-xs font-medium text-gray-700">New Camp</p>
          </Link>
          <Link
            href="/students"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:border-[var(--tss-navy)] transition-colors"
          >
            <ClipboardList size={22} strokeWidth={1.75} className="mx-auto mb-1 text-[var(--tss-cyan,#5AC3E7)]" />
            <p className="text-xs font-medium text-gray-700">All Students</p>
          </Link>
          <Link
            href="/coaches"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:border-[var(--tss-navy)] transition-colors"
          >
            <Users size={22} strokeWidth={1.75} className="mx-auto mb-1 text-[var(--tss-cyan,#5AC3E7)]" />
            <p className="text-xs font-medium text-gray-700">All Coaches</p>
          </Link>
          <Link
            href="/camps"
            className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:border-[var(--tss-navy)] transition-colors"
          >
            <Tent size={22} strokeWidth={1.75} className="mx-auto mb-1 text-[var(--tss-cyan,#5AC3E7)]" />
            <p className="text-xs font-medium text-gray-700">All Camps</p>
          </Link>
        </div>
      </div>

      {/* ── Student Pipeline — needs action ── */}
      {coordData.pendingIntake.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Pending Intake ({coordData.pendingIntake.length})</h3>
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
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Missing Waiver ({coordData.noWaiver.length})</h3>
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

      {/* ── Stuck students — no recent session ── */}
      {coordData.stuckStudents.length > 0 && (
        <div>
          <h3
            className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider inline-flex items-center gap-1.5"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            <AlertTriangle size={14} strokeWidth={1.75} className="text-amber-600" />
            No session in 30+ days ({coordData.stuckStudentsCount})
          </h3>
          <div className="bg-white rounded-xl border border-orange-100 divide-y divide-gray-50 overflow-hidden">
            {coordData.stuckStudents.map((s: any) => (
              <Link
                key={s.id}
                href={`/students/${s.id}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50/30 transition-colors"
              >
                <div>
                  <p className="text-sm text-gray-700">{s.first_name} {s.last_name}</p>
                  <p className="text-[10px] text-gray-400">
                    {s.last_session_date
                      ? `Last session: ${new Date(s.last_session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Never had an in-person session'}
                  </p>
                </div>
                <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full capitalize">
                  {s.belt_level?.replace('_belt', '') ?? '—'}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">
            These students haven&apos;t had a coach-led session in over 30 days. Consider following up or re-engaging.
          </p>
        </div>
      )}

      {coordData.activeCamps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Active Camps</h3>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {coordData.activeCamps.map((c: any) => {
              const coachRel = Array.isArray(c.coaches) ? c.coaches[0] : c.coaches;
              return (
                <Link key={c.id} href={`/camps/${c.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{c.camp_name}</p>
                    <p className="text-[10px] text-gray-400">
                      {c.start_date} - {c.end_date}
                      {coachRel?.display_name ? ` · ${coachRel.display_name}` : ''}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize shrink-0 ml-2 ${
                    c.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {c.status}
                  </span>
                </Link>
              );
            })}
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
        <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>My Overview</h3>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="My Students" value={coachData.myStudentCount} />
          <MiniStat label="Draft Sessions" value={coachData.draftCount} />
        </div>
      </div>

      {/* My Next Classes (M3) — upcoming + active services assigned to me */}
      {coachData.upcomingServices && coachData.upcomingServices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>
            ▶ My Next Classes ({coachData.upcomingServices.length})
          </h3>
          <div className="space-y-2">
            {coachData.upcomingServices.map((s: any) => {
              const isActive = s.status === 'active';
              const date = new Date(s.start_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const startsToday = date.toDateString() === today.toDateString();
              return (
                <Link
                  key={s.id}
                  href={`/camps/${s.id}`}
                  className={`block rounded-xl border p-3 hover:opacity-90 transition ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-200'
                      : startsToday
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className="text-[10px] font-mono uppercase tracking-wider inline-flex items-center gap-1"
                      style={{ color: isActive ? '#047857' : startsToday ? '#92400E' : '#9CA3AF' }}
                    >
                      {isActive ? (
                        <><CircleDot size={11} strokeWidth={2.5} /> In progress</>
                      ) : startsToday ? (
                        <><CalendarDays size={11} strokeWidth={2} /> Today</>
                      ) : (
                        <><Clock size={11} strokeWidth={2} /> Upcoming</>
                      )}
                      {s.service_kind ? ` · ${s.service_kind.replace(/_/g, ' ')}` : ''}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {s.participant_count}/{s.capacity_max ?? '?'} students
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[var(--tss-navy)]">{s.camp_name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(s.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {s.start_date !== s.end_date && ` → ${new Date(s.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    {s.scheduled_time ? ` · ${s.scheduled_time}` : ''}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {coachData.recentSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Recent Sessions</h3>
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

      {/* Empty state when nothing scheduled */}
      {(!coachData.upcomingServices || coachData.upcomingServices.length === 0) &&
       coachData.recentSessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No upcoming classes assigned yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">
            When a coordinator assigns you to a service, it shows up here.
          </p>
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
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Medical Alerts</h3>
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
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Emergency Contacts</h3>
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

function StatCard({ label, value }: { label: string; value: number; accent?: string }) {
  // Accent prop kept for backwards-compat; ignored. All cards render
  // the same editorial-telemetry pattern now (Lora numeral + mono label).
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
      <p className="tss-stat-number">{value}</p>
      <p
        className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-2"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'amber';
}) {
  const isAmber = accent === 'amber';
  return (
    <div
      className={`rounded-2xl p-4 border shadow-sm text-center ${
        isAmber ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'
      }`}
    >
      <p
        className={`tss-stat-number ${isAmber ? '!text-amber-700' : ''}`}
        style={isAmber ? { color: '#b45309' } : undefined}
      >
        {value}
      </p>
      <p
        className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-2"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </p>
    </div>
  );
}

function QuickAction({ href, label, desc, accentColor }: { href: string; label: string; desc: string; accentColor: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl p-4 bg-white border border-gray-100 shadow-sm hover:shadow hover:border-gray-300 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-8 rounded-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <div>
          <p className="font-semibold text-sm text-[var(--tss-navy)] group-hover:text-[var(--tss-navy-light)]">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

// ── Today panel ───────────────────────────
// Coordinator's "what's happening right now" — list of every camp /
// lesson scheduled for today, with status pill + scheduled_time + a
// click-through to the detail page. Reuses the ServiceCard's palette
// so cards look identical to the calendar.

function TodayPanel({ camps }: { camps: any[] }) {
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (!camps || camps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <h3
            className="text-base font-bold text-[var(--tss-navy)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Today
          </h3>
          <span
            className="text-[10px] uppercase tracking-wider text-gray-400"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {todayLabel}
          </span>
        </div>
        <p className="text-sm text-gray-400 italic">No services scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-base font-bold text-[var(--tss-navy)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Today · {camps.length} service{camps.length !== 1 ? 's' : ''}
        </h3>
        <span
          className="text-[10px] uppercase tracking-wider text-gray-400"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {todayLabel}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {camps.map((c: any) => {
          const cardColor = c.camp_templates?.card_color || '#F3F4F6';
          const accent = c.camp_templates?.accent_color || '#9CA3AF';
          const capacity = c.capacity_override ?? c.camp_templates?.capacity_max ?? 4;
          const enrolled = (c.camp_participants ?? []).filter(
            (p: any) => p.enrollment_status === 'active',
          ).length;
          const coachName =
            c.head_coach?.display_name ?? c.coaches?.display_name ?? null;
          return (
            <Link
              key={c.id}
              href={`/camps/${c.id}`}
              className="block rounded-xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-all"
              style={{
                backgroundColor: cardColor,
                borderLeft: `4px solid ${accent}`,
              }}
            >
              <div className="p-3">
                <p
                  className="text-[9px] uppercase tracking-wider text-black/55 truncate"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {c.camp_templates?.level_name ?? 'Custom'} ·{' '}
                  {c.camp_templates?.service_kind === 'surf_camp'
                    ? 'CAMP'
                    : c.camp_templates?.service_kind === 'surf_lesson'
                    ? 'LESSON'
                    : 'CUSTOM'}
                </p>
                <p className="text-sm font-semibold text-black/85 leading-snug mt-0.5 truncate">
                  {c.camp_name}
                </p>
                {c.scheduled_time && (
                  <p
                    className="text-[10px] text-black/65 mt-0.5"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {c.scheduled_time}
                  </p>
                )}
                <p
                  className="text-[10px] text-black/55 mt-1"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {enrolled}/{capacity} enrolled
                  {coachName ? ` · ${coachName}` : ''}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
