import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from '@/lib/actions/auth';
import {
  getAdminDashboardData,
  getCoachDashboardData,
  getCoordinatorDashboardData,
  getAssistantDashboardData,
  getRecentAuditEvents,
  getRecentIncidents,
} from '@/lib/actions/dashboard';
import { getDraftSessions } from '@/lib/actions/cascade-sessions';
import { incidentTypeLabel } from '@/lib/constants/brand';
import { IncidentsPanel } from '@/components/dashboard/IncidentsPanel';
import { TasksPanel } from '@/components/dashboard/TasksPanel';
import { PendingPromotionsPanel } from '@/components/dashboard/PendingPromotionsPanel';
import { TransportPanel } from '@/components/dashboard/TransportPanel';
import { PlatformOverview } from '@/components/dashboard/PlatformOverview';
import { getPlatformOverview } from '@/lib/actions/platform-overview';
import { listAcademyTasks, listTaskAssignees } from '@/lib/actions/tasks';
import { getMyNotifications } from '@/lib/actions/notifications';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { TideWidget } from '@/components/dashboard/TideWidget';
import { VideoAnalyzerLauncher } from '@/components/video-analyzer/VideoAnalyzerLauncher';
import { BoardSelectorLauncher } from '@/components/board-selector/BoardSelectorLauncher';
import { BoardInventoryLauncher } from '@/components/board-inventory/BoardInventoryLauncher';
import { RatioEngineLauncher } from '@/components/ratio-engine/RatioEngineLauncher';
import { CollapsibleAlert } from '@/components/dashboard/CollapsibleAlert';
import { EmergencyPlanButton, type EmergencyPlan } from '@/components/dashboard/EmergencyPlanButton';
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
  LifeBuoy,
  Zap,
  CalendarClock,
  MapPin,
  Ticket,
  DollarSign,
  Receipt,
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
  } catch (e) {
    // Non-blocking for the user, but never silent for us.
    console.error('[dashboard] notifications failed:', e);
  }

  // Incident reports — alert coordinator + admin so a flagged incident
  // never goes unseen. Scoped to the academy in context.
  let incidents: Awaited<ReturnType<typeof getRecentIncidents>> = [];
  if (role === 'admin' || role === 'coordinator') {
    try {
      incidents = await getRecentIncidents(academyId);
    } catch { /* non-blocking */ }
  }

  // Academy setup checklist — nudge to fill emergency plan + board
  // inventory. Shown to coordinators AND admins (both manage academies;
  // safety setup should never depend on which role happens to look).
  let academySetup: { emergencyMissing: boolean; boardsMissing: boolean } | null = null;
  if ((role === 'coordinator' || role === 'admin') && academyId) {
    try {
      const [{ data: aca }, { count: boardCount }] = await Promise.all([
        supabase.from('academies').select('emergency_numbers, nearest_hospital, emergency_address').eq('id', academyId).single(),
        supabase.from('boards').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
      ]);
      academySetup = {
        emergencyMissing: !(aca?.emergency_numbers || aca?.nearest_hospital || aca?.emergency_address),
        boardsMissing: (boardCount ?? 0) === 0,
      };
    } catch { /* non-blocking */ }
  }

  // Emergency plan — quick-access button for anyone working an academy.
  let emergencyPlan: EmergencyPlan | null = null;
  if (academyId) {
    try {
      const { data } = await supabase
        .from('academies')
        .select('emergency_numbers, nearest_hospital, lifeguard_contact, emergency_address, emergency_protocol')
        .eq('id', academyId)
        .single();
      emergencyPlan = data ?? null;
    } catch { /* non-blocking */ }
  }

  // To-do tasks — coordinator + admin manage/assign academy tasks.
  let tasks: Awaited<ReturnType<typeof listAcademyTasks>> = [];
  let taskAssignees: Awaited<ReturnType<typeof listTaskAssignees>> = [];
  if (role === 'admin' || role === 'coordinator') {
    try {
      [tasks, taskAssignees] = await Promise.all([
        listAcademyTasks(academyId),
        listTaskAssignees(academyId),
      ]);
    } catch { /* non-blocking */ }
  }

  // Drafts for coaches/coordinators/admins
  let drafts: any[] = [];
  if (role === 'admin' || role === 'coordinator' || role === 'coach') {
    try {
      drafts = await getDraftSessions();
    } catch { /* non-blocking */ }
  }

  // Platform control tower — admin only, per-academy pulse. Soft-fail.
  let platformOverview: Awaited<ReturnType<typeof getPlatformOverview>> = null;
  if (role === 'admin') {
    try {
      platformOverview = await getPlatformOverview();
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

      {/* Quick-access reference cards — side by side to use the width neatly */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <a
          href="/docs/sistema-resolver-problemas.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-[var(--tss-cyan,#5AC3E7)]/40 bg-[var(--tss-cyan,#5AC3E7)]/10 p-4 hover:bg-[var(--tss-cyan,#5AC3E7)]/15 transition-colors"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tss-navy)] text-white">
            <LifeBuoy size={20} strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--tss-navy)]">Protocolo de Problemas</span>
            <span className="block text-xs text-gray-500">Guía de referencia — abrir PDF</span>
          </span>
        </a>

        {academyId && <EmergencyPlanButton plan={emergencyPlan} />}
      </div>

      {/* Quick actions — the tools the admin reaches for daily, one tap from
          Home instead of hunting the sidebar. */}
      {role === 'admin' && (
        <div className="mb-6">
          <p className="tss-section-label">
            <Zap size={11} strokeWidth={1.75} />
            Quick actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { href: '/spaces', label: 'Espacios', Icon: CalendarClock },
              { href: '/venue-scout', label: 'Venue Scout', Icon: MapPin },
              { href: '/course-codes', label: 'Course Codes', Icon: Ticket },
              { href: '/admin/pricing', label: 'Pricing', Icon: DollarSign },
              { href: '/admin/billing', label: 'Billing', Icon: Receipt },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white px-2 py-3.5 shadow-sm hover:border-[var(--tss-cyan,#5AC3E7)] transition-colors text-center"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--tss-navy)]/5 text-[var(--tss-navy)]">
                  <Icon size={17} strokeWidth={1.75} />
                </span>
                <span className="text-[11px] font-semibold text-[var(--tss-navy)] leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Academy setup checklist — coordinator, until filled */}
      {academySetup && (academySetup.emergencyMissing || academySetup.boardsMissing) && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider inline-flex items-center gap-1.5" style={{ fontFamily: 'DM Mono, monospace' }}>
              <AlertTriangle size={14} strokeWidth={1.75} /> Your academy setup is pending
            </h3>
            <Link href="/my-academy" className="text-xs text-amber-800 font-semibold hover:underline shrink-0">Complete →</Link>
          </div>
          <ul className="space-y-1 text-[13px] text-amber-900">
            {academySetup.emergencyMissing && <li>• Emergency plan (numbers, hospital, meeting point)</li>}
            {academySetup.boardsMissing && <li>• Board inventory</li>}
          </ul>
        </div>
      )}

      {/* Platform control tower — per-academy pulse for the admin. */}
      {platformOverview && <PlatformOverview data={platformOverview} />}

      {/* Incident reports — coordinator + admin. Unread badge + mark-as-read. */}
      <IncidentsPanel incidents={incidents} />

      {/* Belt promotions recommended by under-certified coaches — admin /
          head coach confirms. Self-gates + renders nothing when empty. */}
      <PendingPromotionsPanel />

      {/* Transport board — rides the coaches asked for this week (M133).
          Coordinator marks each one taken/cancelled. Renders nothing if empty. */}
      {(role === 'admin' || role === 'coordinator') && <TransportPanel />}

      {/* To-do list — coordinator + admin create + assign academy tasks. */}
      {(role === 'admin' || role === 'coordinator') && (
        <TasksPanel initialTasks={tasks} assignees={taskAssignees} academyId={academyId} />
      )}

      {/* Quick stats — telemetry strip. Hidden for coordinators, whose own
          dashboard has a richer academy-scoped stats block (no duplication). */}
      {role !== 'coordinator' && (
        <>
          <p className="tss-section-label">
            <BarChart3 size={11} strokeWidth={1.75} />
            Overview
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { label: 'Active Students', value: studentCount ?? 0 },
                { label: 'Sessions Closed', value: sessionCount ?? 0 },
                { label: 'Active Services', value: activeCamps ?? 0 },
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
        </>
      )}

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

      {/* Tides — surfaced high up: whoever schedules/runs sessions needs it
          at a glance alongside today's plan. */}
      {(role === 'admin' || role === 'coordinator' || role === 'coach') && (
        <div className="mb-6">
          <TideWidget isAdmin={role === 'admin'} />
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
                <QuickAction href="/camps" label="View Services" desc="Calendar & templates" accentColor="var(--tss-navy-light)" />
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

  // The admin's own academy — so the inventory tool is reachable from here too.
  const adminMe = await getCurrentCoach();
  const adminAcademyId = adminMe?.academy_id ?? null;

  return (
    <div className="space-y-6">
      {/* Tools — quick client-only utilities (lazy-loaded) */}
      <div className="grid sm:grid-cols-2 gap-3">
        <VideoAnalyzerLauncher variant="card" />
        <BoardSelectorLauncher variant="card" />
        {adminAcademyId && <BoardInventoryLauncher academyId={adminAcademyId} variant="card" />}
      </div>

      {/* System Stats */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>System Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <MiniStat label="Total Students" value={adminData.totalStudents} />
          <MiniStat label="Total Coaches" value={adminData.totalCoaches} />
          <MiniStat label="Total Sessions" value={adminData.totalSessions} />
          <MiniStat label="Total Services" value={adminData.totalCamps} />
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

  // Academy-scoped analytics (same metrics as admin, just this academy).
  const me = await getCurrentCoach();
  let academyAnalytics: Awaited<ReturnType<typeof import('@/lib/actions/analytics').getAcademyAnalytics>> | null = null;
  if (me?.academy_id) {
    try {
      const { getAcademyAnalytics } = await import('@/lib/actions/analytics');
      academyAnalytics = await getAcademyAnalytics(me.academy_id);
    } catch { /* non-blocking */ }
  }

  const { stats } = coordData;

  return (
    <div className="space-y-6">
      {/* ── Today's services ── */}
      <TodayPanel camps={todaysCamps} />

      {/* ── Tools ── */}
      {me?.academy_id && (
        <div className="grid sm:grid-cols-2 gap-3">
          <BoardInventoryLauncher academyId={me.academy_id} variant="card" />
          <BoardSelectorLauncher variant="card" />
          {/* Ratio Decision Engine — Safety Canon coach-to-student ratio by
              conditions; opens in an in-app overlay (X to close, never
              leaves the app). */}
          <div className="sm:col-span-2">
            <RatioEngineLauncher />
          </div>
        </div>
      )}

      {/* ── Mi academia — single stats home (analytics + operational KPIs) ── */}
      {academyAnalytics ? (
        <AcademyAnalyticsPanel data={academyAnalytics} stats={stats} />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat label="Active Students" value={stats.totalStudents} />
          <MiniStat label="Active Coaches" value={stats.totalCoaches} />
          <MiniStat label="Active Services" value={stats.activeCamps} />
          <MiniStat label="Pending Actions" value={stats.pendingActions} accent={stats.pendingActions > 0 ? 'amber' : undefined} />
        </div>
      )}

      {/* Quick Actions block removed — it duplicated the left-side navigation
          (Students / Coaches / Services) and confused the coordinator view. */}

      {/* ── Action items — compact, collapsible notification cards ── */}
      {(coordData.pendingIntake.length > 0 || coordData.noWaiver.length > 0 || coordData.stuckStudents.length > 0) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Needs attention</h3>

          {coordData.pendingIntake.length > 0 && (
            <CollapsibleAlert title="Pending Intake" count={coordData.pendingIntake.length} tone="amber">
              {coordData.pendingIntake.map((s: any) => (
                <Link key={s.id} href={`/students/${s.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-amber-50/30 transition-colors">
                  <p className="text-sm text-gray-700">{s.first_name} {s.last_name}</p>
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">No Intake</span>
                </Link>
              ))}
            </CollapsibleAlert>
          )}

          {coordData.noWaiver.length > 0 && (
            <CollapsibleAlert title="Missing Waiver" count={coordData.noWaiver.length} tone="red">
              {coordData.noWaiver.map((s: any) => (
                <Link key={s.id} href={`/students/${s.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-red-50/30 transition-colors">
                  <p className="text-sm text-gray-700">{s.first_name} {s.last_name}</p>
                  <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">No Waiver</span>
                </Link>
              ))}
            </CollapsibleAlert>
          )}

          {coordData.stuckStudents.length > 0 && (
            <CollapsibleAlert title="No session in 30+ days" count={coordData.stuckStudentsCount} tone="orange">
              {coordData.stuckStudents.map((s: any) => (
                <Link key={s.id} href={`/students/${s.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50/30 transition-colors">
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
            </CollapsibleAlert>
          )}
        </div>
      )}

      {coordData.activeCamps.length > 0 && (
        <CollapsibleAlert title="Active Services" count={coordData.activeCamps.length} tone="gray">
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
        </CollapsibleAlert>
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

// ── Academy analytics panel (coordinator) ─────────────────
const BELT_META: Record<string, { label: string; color: string }> = {
  white_belt: { label: 'White Belt', color: '#D1D5DB' },
  yellow_belt: { label: 'Yellow Belt', color: '#F5C518' },
  blue_belt: { label: 'Blue Belt', color: '#3B82F6' },
  purple_belt: { label: 'Purple Belt', color: '#8B5CF6' },
  brown_belt: { label: 'Brown Belt', color: '#92400E' },
  black_belt: { label: 'Black Belt', color: '#111827' },
};

function AcademyAnalyticsPanel({ data, stats }: { data: any; stats?: any }) {
  const t = data.totals;
  const maxBelt = Math.max(1, ...data.beltDistribution.map((b: any) => b.count));
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--tss-gray-500)] mb-3 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>
        My Academy
      </h3>
      {/* One stats home: academy metrics + operational KPIs (no duplication) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <MiniStat label="Students" value={t.students} />
        <MiniStat label="Active 30d" value={t.active30d} />
        <MiniStat label="Sessions 30d" value={t.sessions30d} />
        {stats && <MiniStat label="Coaches" value={stats.totalCoaches} />}
        {stats && <MiniStat label="Services" value={stats.activeCamps} />}
        {stats && <MiniStat label="Pending" value={stats.pendingActions} accent={stats.pendingActions > 0 ? 'amber' : undefined} />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Belt distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">Belt distribution</p>
          {data.beltDistribution.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.beltDistribution.map((b: any) => {
                const meta = BELT_META[b.belt_level] ?? { label: b.belt_level, color: '#9CA3AF' };
                return (
                  <div key={b.belt_level}>
                    <div className="flex justify-between text-[11px] text-gray-600 mb-0.5">
                      <span>{meta.label}</span><span>{b.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(b.count / maxBelt) * 100}%`, background: meta.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Top active + rating */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Most active (30d)</p>
            <p className="text-[10px] text-gray-400">
              Rating {data.surveyStats.avgRating != null ? `${data.surveyStats.avgRating}★ · ${data.surveyStats.totalResponses}` : '—'}
            </p>
          </div>
          {data.topStudents.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No sessions in the last 30 days.</p>
          ) : (
            <ul className="space-y-1.5">
              {data.topStudents.slice(0, 5).map((s: any, i: number) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate">{i + 1}. {s.name}</span>
                  <span className="font-semibold text-[var(--tss-navy)]">{s.sessions_count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
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
