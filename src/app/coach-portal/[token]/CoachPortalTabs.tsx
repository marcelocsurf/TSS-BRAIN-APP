'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BRAND } from '@/lib/constants/brand';
import type { CoachPortalData, CoachLessonDetail } from '@/lib/actions/coach-portal';
import { getCoachLessonDetail, markCoachLessonRead, submitCoachQuiz } from '@/lib/actions/coach-portal';
import { sellerSearchStudents, sellerReserveSpot, sellerMySales, type SellerSale } from '@/lib/actions/seller';
import { getServicePlan, type ServicePlanData } from '@/lib/actions/service-planner';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { PendingAssignments } from './PendingAssignments';
import { PendingStaffInvites } from './PendingStaffInvites';
import { CoachGuide } from './CoachGuide';
import { MethodLauncher } from '@/components/coach-portal/MethodLauncher';
import { CoachPresentations } from '@/components/coach-portal/CoachPresentations';
import { CoachMiniCalendar } from '@/components/coach-portal/CoachMiniCalendar';
import { CoachTasks } from '@/components/coach-portal/CoachTasks';
import { PortalSpaces } from '@/components/coach-portal/PortalSpaces';
import { SellerPortal } from '@/components/seller/SellerPortal';
import { HostPortal } from '@/components/host/HostPortal';
import { StaffWaiverCard } from '@/components/coach-portal/StaffWaiverCard';
import { PendingPromotions } from '@/components/coach-portal/PendingPromotions';
import { PortalInventory } from '@/components/coach-portal/PortalInventory';
import { SessionPlanner } from '@/components/coach-portal/SessionPlanner';
import { CampPlanReader } from '@/components/camp/CampPlanReader';
import { IncidentReporter } from '@/components/coach-portal/IncidentReporter';
import { StpPillarReader } from '@/components/coach-portal/StpPillarReader';
import { VideoAnalyzerLauncher } from '@/components/video-analyzer/VideoAnalyzerLauncher';
import { BoardSelectorLauncher } from '@/components/board-selector/BoardSelectorLauncher';
import { VenueScoutLauncher } from '@/components/venue-scout/VenueScoutLauncher';
import { BreathingLauncher } from '@/components/breathing/BreathingLauncher';
import {
  Home,
  BookOpen,
  Wrench,
  ClipboardList,
  Star,
  Trophy,
  BarChart2,
  Clock,
  RotateCcw,
  CheckCircle2,
  Waves,
  Dumbbell,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  ChevronLeft,
  ArrowRight,
  Lock,
  CalendarDays,
  LifeBuoy,
  ShieldAlert,
  Sunrise,
  MapPin,
  Truck,
  Award,
  Users,
} from 'lucide-react';

type TabIconComponent = typeof Home;

type Tab = 'home' | 'courses' | 'tools' | 'plan' | 'rating' | 'sell' | 'spaces' | 'inventory';

// 'rating' is intentionally NOT in the nav — the student rating is unified
// into the home (a featured card that taps through to the detail).
// ── Brand Manual v10 type helpers (Archivo Expanded display · Plex Mono labels) ──
const F_DISPLAY: React.CSSProperties = {
  fontFamily: 'var(--font-archivo), system-ui, sans-serif',
  fontStretch: '125%' as any,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 1.05,
};
const F_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-plex), monospace',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
};
// 'HH:MM' → '6:30 AM'
function t12(t: string | null): string | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

const TABS: { key: Tab; label: string; Icon: TabIconComponent }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'courses', label: 'Courses', Icon: BookOpen },
  { key: 'tools', label: 'Tools', Icon: Wrench },
  { key: 'plan', label: 'Plan', Icon: ClipboardList },
  { key: 'spaces', label: 'Espacios', Icon: CalendarDays },
];

export function CoachPortalTabs({
  data,
  initialTab,
}: {
  data: CoachPortalData;
  initialTab?: Tab;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'home');
  // When a class is open in the planner we switch to a focused, light-themed
  // full-screen mode: light background (not the dark portal shell) + the global
  // tab-nav hidden, so the planner isn't a light screen floating on black with
  // two stacked bottom bars.
  const [plannerOpen, setPlannerOpen] = useState(false);
  // Guía rápida integrada: se abre sola la primera vez, después queda en su botón.
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem('tss_coach_guide_v1')) setGuideOpen(true); } catch {}
  }, []);
  const closeGuide = () => { setGuideOpen(false); try { localStorage.setItem('tss_coach_guide_v1', '1'); } catch {} };
  const { coach, stats } = data;
  const isSupport = (coach as any).portal_category === 'support';
  const isSeller = (coach as any).role === 'seller';
  const canSell = !!(coach as any).portal_can_sell || isSeller;

  // Rol seller: su propia casa — 3 pestañas, cero ruido de coaching.
  if ((coach as any).role === 'host') {
    return <HostPortal token={coach.portal_token} hostName={coach.display_name || 'Host'} services={data.academyServices} hostId={coach.id} academyId={(coach as any).academy_id} />;
  }
  if (isSeller) {
    return <SellerPortal token={coach.portal_token} sellerName={coach.display_name || 'Seller'} services={data.academyServices} />;
  }

  // Support (non-coaching) members get an operations-focused nav: Home
  // (schedule + tasks), Espacios (they prepare/clean the rooms), Courses,
  // plus a Sell tab when they're a seller. Coaching keeps the full set.
  const SELL_TAB = { key: 'sell' as Tab, label: 'Sell', Icon: BarChart2 };
  const visibleTabs = isSupport
    ? [
        TABS.find((t) => t.key === 'home')!,
        TABS.find((t) => t.key === 'spaces')!,
        { key: 'inventory' as Tab, label: 'Inventory', Icon: Wrench },
        ...(canSell ? [SELL_TAB] : []),
        TABS.find((t) => t.key === 'courses')!,
      ]
    : TABS;

  return (
    <div
      className={`min-h-screen tss-portal-bg ${plannerOpen ? '' : 'pb-20'}`}
      style={plannerOpen ? undefined : { background: ['home', 'tools', 'courses'].includes(activeTab) && !isSupport ? '#F7F9FA' : '#000' }}
    >
      <div className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'home' && (
          <div className="rounded-2xl p-3 space-y-4" style={{ background: isSupport ? '#000' : 'transparent' }}>
            {!(coach as any).waiver_signed && <StaffWaiverCard token={coach.portal_token} />}
            <PendingPromotions token={coach.portal_token} />
            {/* Manual de uso, abierto directo en el capítulo de este rol */}
            <div className="flex gap-2">
              <button type="button" onClick={() => setGuideOpen(true)}
                className="flex-1 text-center text-[11px] font-mono uppercase tracking-[0.14em] font-semibold px-3 py-2.5 rounded-full"
                style={{ background: '#00D2FF', color: '#061C2B' }}>
                📖 Guía rápida
              </button>
              <a href={`/manual/index.html?role=${isSupport ? 'support' : 'coach'}`} target="_blank" rel="noreferrer"
                className="flex-1 text-center text-[11px] font-mono uppercase tracking-[0.14em] font-semibold px-3 py-2.5 rounded-full border border-[var(--tss-cyan,#5AC3E7)]/40 text-[var(--tss-cyan,#5AC3E7)] hover:bg-[var(--tss-cyan,#5AC3E7)]/10">
                📘 Cómo usar el app
              </a>
              {canSell && (
                <a href="/manual/index.html?role=seller" target="_blank" rel="noreferrer"
                  className="flex-1 text-center text-[11px] font-mono uppercase tracking-[0.14em] font-semibold px-3 py-2.5 rounded-full border border-[#FFD166]/50 text-[#FFD166] hover:bg-[#FFD166]/10">
                  📘 Manual del seller
                </a>
              )}
            </div>
            <PendingAssignments token={coach.portal_token} assignments={data.pendingAssignments} />
            <PendingStaffInvites invites={(data as any).pendingStaffInvites ?? []} />

            {isSupport ? (
              <SupportHome coach={coach} upcoming={data.upcomingServices} schedule={(data as any).academySchedule ?? []} emergencyPlan={data.emergencyPlan} onGoTo={setActiveTab} />
            ) : (
              <HomeTab coach={coach} stats={stats} upcoming={data.upcomingServices} emergencyPlan={data.emergencyPlan} students={data.myStudents} boards={data.boards} onGoTo={setActiveTab} coachCourses={data.coachCourses} courseProgress={data.courseProgress} todayLogistics={(data as any).todayLogistics ?? null} />
            )}
          </div>
        )}
        {activeTab === 'sell' && canSell && (
          <SellTab services={data.academyServices} token={coach.portal_token} />
        )}
        {activeTab === 'courses' && (
          <CoursesTab
            courses={data.coachCourses}
            progress={data.courseProgress}
            coach={coach}
            token={coach.portal_token}
          />
        )}
        {activeTab === 'tools' && <ToolsTab stps={data.stps} coach={coach} emergencyPlan={data.emergencyPlan} students={data.myStudents} boards={data.boards} />}
        {activeTab === 'spaces' && <PortalSpaces token={coach.portal_token} coachId={coach.id} />}
        {activeTab === 'inventory' && (
          <div className="rounded-2xl p-3" style={{ background: '#000' }}>
            <PortalInventory token={coach.portal_token} />
          </div>
        )}
        {activeTab === 'plan' && (
          <PlanTab
            upcoming={data.upcomingServices}
            past={data.pastServices}
            unclosed={(data as any).unclosedPast ?? []}
            token={coach.portal_token}
            onOpenChange={setPlannerOpen}
          />
        )}
        {activeTab === 'rating' && (
          <div className="rounded-2xl p-3" style={{ background: '#000' }}>
            <RatingTab stats={stats} onBack={() => setActiveTab('home')} />
          </div>
        )}
      </div>
      {guideOpen && <CoachGuide onClose={closeGuide} />}

      {/* Bottom nav — hidden while the planner is open (focused mode). */}
      {!plannerOpen && (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10" style={{ background: '#061C2B' }}>
        <div className="max-w-lg mx-auto flex">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#00D2FF]' : 'text-white/40'
                }`}
              >
                <tab.Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={`mb-0.5 transition-colors ${isActive ? 'text-[#00D2FF]' : 'text-white/40'}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      )}

      <div className={`text-center py-4 ${plannerOpen ? 'hidden' : 'pb-24'}`}>
        <p className="text-[10px] text-white/30">The Surf Sequence -- {BRAND.tagline}</p>
      </div>
    </div>
  );
}

// ───────────────────────────────────────

function EmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-white/80 flex-1 whitespace-pre-line">{value}</span>
    </div>
  );
}

// Same row, dark-on-white — used inside the white Tools cards.
function EmRowLight({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-gray-700 flex-1 whitespace-pre-line">{value}</span>
    </div>
  );
}

// Operations home for support (non-coaching) members — customer service,
// space prep, coffee, reception. The goal: the WHOLE team knows what's
// happening. Identity + their tasks + the academy's 7-day schedule (time,
// group, coach, headcount) + space bookings shortcut + emergency plan.
function SupportHome({ coach, upcoming, schedule, emergencyPlan, onGoTo }: {
  coach: any;
  upcoming: any[];
  schedule: any[];
  emergencyPlan?: {
    emergency_numbers: string | null;
    nearest_hospital: string | null;
    lifeguard_contact: string | null;
    emergency_address: string | null;
    emergency_protocol: string | null;
  } | null;
  onGoTo?: (tab: Tab) => void;
}) {
  const initials = `${coach.first_name?.[0] || ''}${coach.last_name?.[0] || ''}`.toUpperCase();
  const title = coach.job_title || 'Team member';
  const hasEmergency = !!emergencyPlan && (
    emergencyPlan.emergency_numbers || emergencyPlan.nearest_hospital ||
    emergencyPlan.lifeguard_contact || emergencyPlan.emergency_address || emergencyPlan.emergency_protocol
  );

  // Group the academy schedule by day (Today / Tomorrow / weekday) so the
  // team can prep per group — a camp spanning several days appears on each
  // day it runs within the next week.
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days: Array<{ key: string; label: string; items: any[] }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    const key = dayKey(d);
    const items = schedule.filter((s) => s.start_date <= key && key <= (s.end_date || s.start_date));
    if (items.length === 0) continue;
    const label =
      i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    items.sort((a, b) => (a.scheduled_time || '99').localeCompare(b.scheduled_time || '99'));
    days.push({ key, label, items });
  }

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div className="rounded-2xl border border-white/10 p-4 flex items-center gap-3" style={{ background: '#0F1E33' }}>
        {coach.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coach.photo_url} alt={coach.display_name} className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: '#5AC3E7', color: '#0A1628' }}>{initials}</div>
        )}
        <div className="min-w-0">
          <p className="text-white font-semibold text-lg leading-tight truncate">{coach.display_name}</p>
          <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">{title}</p>
        </div>
      </div>

      {/* My tasks */}
      <CoachTasks token={coach.portal_token} onOpenInventory={onGoTo ? () => onGoTo('inventory') : undefined} />

      {/* Academy schedule — the operational picture: every group running in
          the next 7 days with time, coach, and headcount, so reception /
          coffee / cleaning can prepare for each one. */}
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-3 inline-flex items-center gap-1.5">
          <CalendarDays size={13} /> Academy schedule · next 7 days
        </p>
        {days.length === 0 ? (
          <p className="text-[13px] text-white/40">Nothing scheduled this week.</p>
        ) : (
          <div className="space-y-3">
            {days.map((d) => (
              <div key={d.key}>
                <p className={`text-[10px] font-mono uppercase tracking-wider mb-1.5 ${d.label === 'Today' ? 'text-[var(--tss-cyan,#5AC3E7)]' : 'text-white/40'}`}>
                  {d.label}
                </p>
                <div className="space-y-1.5">
                  {d.items.map((s: any) => {
                    // Class-day logistics the coach planned for THIS date (M133):
                    // real start time, beach, transport times.
                    const dl = (s.day_logistics ?? []).find((x: any) => x.session_date === d.key);
                    return (
                      <div key={`${d.key}-${s.id}`} className="rounded-lg bg-white/[0.04] px-3 py-2.5 flex items-center gap-3">
                        <span className="text-[12px] font-bold shrink-0 tabular-nums" style={{ color: '#5AC3E7', fontFamily: 'DM Mono, monospace' }}>
                          {dl?.class_start_time ? dl.class_start_time.slice(0, 5) : s.scheduled_time ? s.scheduled_time.slice(0, 5) : '—'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-white font-medium truncate">{s.camp_name}</span>
                          <span className="block text-[10px] text-white/40 truncate">
                            {s.coach_name ? `Coach ${s.coach_name}` : 'No coach assigned'}
                            {s.template_name ? ` · ${s.template_name}` : ''}
                          </span>
                          {dl && (dl.surf_venue || dl.transport_needed) && (
                            <span className="block text-[10px] truncate" style={{ color: '#5AC3E7' }}>
                              {dl.surf_venue ? `🏖 ${dl.surf_venue}` : ''}
                              {dl.transport_needed
                                ? `${dl.surf_venue ? ' · ' : ''}🚐 out ${dl.transport_depart?.slice(0, 5) ?? '—'} / back ${dl.transport_return?.slice(0, 5) ?? '—'}${dl.transport_status === 'cancelled' ? ' (cancelled)' : ''}`
                                : ''}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: 'rgba(90,195,231,.12)', color: '#5AC3E7' }}>
                          {s.students} student{s.students === 1 ? '' : 's'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Space bookings shortcut — they prepare and clean the rooms */}
      {onGoTo && (
        <button
          type="button"
          onClick={() => onGoTo('spaces')}
          className="w-full text-left rounded-2xl border border-white/10 p-4 flex items-center justify-between gap-3 hover:border-[var(--tss-cyan)]/40 transition-colors"
          style={{ background: '#0F1E33' }}
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white">Espacios — room bookings</span>
            <span className="block text-[11px] text-white/50">See which spaces are reserved today, to prepare and clean them.</span>
          </span>
          <span className="text-[var(--tss-cyan,#5AC3E7)] text-lg shrink-0">→</span>
        </button>
      )}

      {/* My services */}
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-3 inline-flex items-center gap-1.5">
          <CalendarDays size={13} /> My services {upcoming.length > 0 && <span className="text-white/40">· {upcoming.length}</span>}
        </p>
        {upcoming.length === 0 ? (
          <p className="text-[13px] text-white/40">No upcoming services assigned.</p>
        ) : (
          <div className="space-y-1.5">
            {upcoming.map((s: any) => (
              <div key={s.id} className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                <p className="text-sm text-white font-medium">{s.camp_name}</p>
                <p className="text-[10px] text-white/40" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {s.scheduled_time ? ` · ${s.scheduled_time.slice(0, 5)}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency plan */}
      {hasEmergency && emergencyPlan && (
        <details className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
          <summary className="text-sm font-semibold text-white cursor-pointer">Emergency plan</summary>
          <div className="mt-3 space-y-2">
            {emergencyPlan.emergency_numbers && <EmRow label="Numbers" value={emergencyPlan.emergency_numbers} />}
            {emergencyPlan.nearest_hospital && <EmRow label="Hospital" value={emergencyPlan.nearest_hospital} />}
            {emergencyPlan.lifeguard_contact && <EmRow label="Lifeguard" value={emergencyPlan.lifeguard_contact} />}
            {emergencyPlan.emergency_address && <EmRow label="Meeting pt" value={emergencyPlan.emergency_address} />}
            {emergencyPlan.emergency_protocol && <EmRow label="Protocol" value={emergencyPlan.emergency_protocol} />}
          </div>
        </details>
      )}
    </div>
  );
}

// Seller "Sell" tab: goal chart (2A) + selling decks (2B) + reserve-a-spot
// flow (2C) + the seller's own sales log (2D). Sellers reserve; the
// coordinator confirms payment.
function SellTab({ services, token }: { services: any[]; token: string }) {
  const live = (services ?? []).filter((s) => s.status !== 'cancelled');
  const router = useRouter();
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [sales, setSales] = useState<SellerSale[] | null>(null);
  useEffect(() => { sellerMySales(token).then(setSales).catch(() => setSales([])); }, [token]);

  // Per-service unit price = what's actually being charged there; fall back to
  // the academy-wide average, then to $99, so the goal is never zero.
  const allAmounts: number[] = [];
  for (const s of live) for (const p of s.camp_participants ?? []) if (p.amount_cents > 0) allAmounts.push(p.amount_cents);
  const globalAvg = allAmounts.length ? Math.round(allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length) : 9900;

  let spots = 0, sold = 0, reserved = 0, committedCents = 0, metaCents = 0;
  const rows = live.map((s) => {
    const cap = s.capacity_override ?? s.camp_templates?.capacity_max ?? 4;
    const active = (s.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    const paid = active.filter((p: any) => p.payment_status === 'paid');
    const svcAmounts = active.filter((p: any) => p.amount_cents > 0).map((p: any) => p.amount_cents);
    const unit = svcAmounts.length ? Math.round(svcAmounts.reduce((a: number, b: number) => a + b, 0) / svcAmounts.length) : globalAvg;
    const svcCommitted = active.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
    spots += cap; sold += paid.length; reserved += active.length - paid.length;
    committedCents += svcCommitted; metaCents += cap * unit;
    return { s, cap, enrolled: active.length, available: Math.max(0, cap - active.length), unit };
  });
  const enrolled = sold + reserved;
  const available = Math.max(0, spots - enrolled);
  const goalPct = metaCents ? Math.min(100, Math.round((committedCents / metaCents) * 100)) : 0;
  const money = (c: number) => `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div className="rounded-2xl p-3 space-y-4" style={{ background: '#000' }}>
      {/* Sales goal */}
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">Sales goal</p>
          <p className="text-[11px] text-white/60">{goalPct}% of {money(metaCents)}</p>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-white/10 mb-1">
          <div style={{ width: `${goalPct}%`, background: '#5AC3E7', height: '100%' }} />
        </div>
        <p className="text-[12px] text-white/70">
          <span className="font-semibold text-white">{money(committedCents)}</span> committed · goal {money(metaCents)} if fully sold
        </p>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { l: 'Spots', v: spots },
            { l: 'Sold', v: sold },
            { l: 'Reserved', v: reserved },
            { l: 'Available', v: available },
          ].map((x) => (
            <div key={x.l} className="rounded-xl bg-white/[0.04] px-2 py-2 text-center">
              <p className="text-lg font-bold text-white leading-none">{x.v}</p>
              <p className="text-[8px] uppercase tracking-wider text-white/40 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>{x.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services with real availability */}
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-3 inline-flex items-center gap-1.5">
          <CalendarDays size={13} /> Services available {rows.length > 0 && <span className="text-white/40">· {rows.length}</span>}
        </p>
        {rows.length === 0 ? (
          <p className="text-[13px] text-white/40">No upcoming services programmed.</p>
        ) : (
          <div className="space-y-1.5">
            {rows.map(({ s, cap, available }) => {
              const full = available === 0;
              return (
                <div key={s.id} className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{s.camp_name}</p>
                      <p className="text-[10px] text-white/40" style={{ fontFamily: 'DM Mono, monospace' }}>
                        {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {s.scheduled_time ? ` · ${s.scheduled_time.slice(0, 5)}` : ''}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {s.sales_deck_url && (
                          <a href={s.sales_deck_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border border-[#5AC3E7]/50 text-[#5AC3E7] hover:bg-[#5AC3E7]/10">
                            📽 Selling deck →
                          </a>
                        )}
                        {!full && (
                          <button onClick={() => setReservingId(reservingId === s.id ? null : s.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${reservingId === s.id ? 'bg-white/15 text-white' : 'text-[#0A1628]'}`}
                            style={reservingId === s.id ? undefined : { background: '#06D6A0' }}>
                            {reservingId === s.id ? '× Close' : '+ Reserve a spot'}
                          </button>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full shrink-0 ${full ? 'bg-white/10 text-white/50' : 'text-[#0A1628]'}`} style={!full ? { background: '#5AC3E7' } : undefined}>
                      {full ? 'Full' : `${available} of ${cap} free`}
                    </span>
                  </div>
                  {reservingId === s.id && (
                    <ReserveForm token={token} campId={s.id}
                      onDone={() => { setReservingId(null); sellerMySales(token).then(setSales).catch(() => {}); router.refresh(); }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] text-white/30 mt-3">You reserve, the coordinator confirms the payment.</p>
      </div>

      {/* 2D — My sales (form component below) */}
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-3">
          My sales {sales && sales.length > 0 && <span className="text-white/40">· {sales.length}</span>}
        </p>
        {!sales ? (
          <p className="text-[12px] text-white/40">Loading…</p>
        ) : sales.length === 0 ? (
          <p className="text-[13px] text-white/40">No reservations yet — your sales will show up here with their payment status.</p>
        ) : (
          <div className="space-y-1.5">
            {sales.map((v) => (
              <div key={v.id} className="rounded-lg bg-white/[0.04] px-3 py-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">{v.student_name}</p>
                  <p className="text-[10px] text-white/40 truncate" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {v.camp_name}{v.start_date ? ` · ${new Date(v.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${v.enrollment_status !== 'active' ? 'bg-white/10 text-white/40' : v.payment_status === 'paid' ? 'bg-[#06D6A0]/20 text-[#06D6A0]' : 'bg-[#FFD166]/15 text-[#FFD166]'}`}>
                  {v.enrollment_status !== 'active' ? v.enrollment_status : v.payment_status === 'paid' ? `Paid${v.amount_cents ? ' $' + Math.round(v.amount_cents / 100) : ''}` : 'Payment pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 2C — inline reserve form: existing client (search) or a new one (name +
// contact). The reservation lands as payment-pending with sold_by set.
function ReserveForm({ token, campId, onDone }: { token: string; campId: string; onDone: () => void }) {
  const [mode, setMode] = useState<'search' | 'new'>('search');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; email: string | null }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [first, setFirst] = useState(''); const [last, setLast] = useState('');
  const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode !== 'search' || q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => { sellerSearchStudents(token, q).then(setResults).catch(() => {}); }, 350);
    return () => clearTimeout(t);
  }, [q, mode, token]);

  const submit = async () => {
    setBusy(true); setMsg(null);
    const res = await sellerReserveSpot(token, campId,
      picked ? { studentId: picked.id, note } : { firstName: first, lastName: last, email, phone, note });
    setBusy(false);
    if (!res.ok) { setMsg(res.error || 'Could not reserve.'); return; }
    setMsg(null);
    onDone();
  };

  const inp = 'w-full text-[13px] px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#5AC3E7]';
  return (
    <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
      <div className="flex gap-1.5">
        {(['search', 'new'] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setPicked(null); setMsg(null); }}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${mode === m ? 'text-[#0A1628]' : 'text-white/50 border border-white/15'}`}
            style={mode === m ? { background: '#5AC3E7' } : undefined}>
            {m === 'search' ? 'Existing client' : 'New client'}
          </button>
        ))}
      </div>
      {mode === 'search' ? (
        picked ? (
          <div className="flex items-center justify-between rounded-lg bg-[#5AC3E7]/10 border border-[#5AC3E7]/40 px-3 py-2">
            <p className="text-[13px] text-white font-medium">{picked.name}</p>
            <button onClick={() => setPicked(null)} className="text-white/50 text-xs">change</button>
          </div>
        ) : (
          <>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className={inp} />
            {results.length > 0 && (
              <div className="rounded-lg overflow-hidden border border-white/10 divide-y divide-white/5">
                {results.map((r) => (
                  <button key={r.id} onClick={() => setPicked(r)} className="w-full text-left px-3 py-2 bg-white/[0.04] hover:bg-white/[0.09]">
                    <p className="text-[13px] text-white">{r.name}</p>
                    {r.email && <p className="text-[10px] text-white/40">{r.email}</p>}
                  </button>
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name *" className={inp} />
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inp} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" className={inp} />
          </div>
        </>
      )}
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the coordinator (optional)" className={inp} />
      {msg && <p className="text-[11px] text-[#FF6B6B]">{msg}</p>}
      <button onClick={submit} disabled={busy || (mode === 'search' ? !picked : !first.trim())}
        className="w-full py-2.5 rounded-full text-[12px] font-bold text-[#0A1628] disabled:opacity-40"
        style={{ background: '#06D6A0' }}>
        {busy ? 'Reserving…' : 'Reserve — coordinator confirms payment'}
      </button>
    </div>
  );
}


function HomeTab({
  coach,
  stats,
  upcoming,
  emergencyPlan,
  students,
  boards,
  onGoTo,
  coachCourses = [],
  courseProgress = {},
  todayLogistics = null,
}: {
  coach: any;
  stats: any;
  upcoming: any[];
  students?: { id: string; name: string }[];
  boards?: { id: string; code: string }[];
  onGoTo?: (tab: Tab) => void;
  coachCourses?: any[];
  courseProgress?: Record<string, { completed: boolean }>;
  todayLogistics?: any;
  emergencyPlan?: {
    emergency_numbers: string | null;
    nearest_hospital: string | null;
    lifeguard_contact: string | null;
    emergency_address: string | null;
    emergency_protocol: string | null;
  } | null;
}) {
  const initials = `${coach.first_name?.[0] || ''}${coach.last_name?.[0] || ''}`.toUpperCase();
  const profileIncomplete = !coach.intake_completed_at;
  const ratingsCount = stats.ratingsCount ?? 0;
  const avg = stats.avgRating;
  const fullStars = avg ? Math.round(avg) : 0;
  const coachingHours = stats.coachingHours ?? 0;
  const totalLessons = coachCourses.length;
  const completedLessons = coachCourses.filter((l: any) => courseProgress[l.id]?.completed).length;
  const coursePct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Certification progression (L1–L5) — drives the hero ring, mirroring the
  // student home's belt-progress ring.
  const CERT_LABELS: Record<string, string> = {
    tss_level_1: 'L1 Foundation', tss_level_2: 'L2 Practitioner', tss_level_3: 'L3 Advanced',
    tss_level_4: 'L4 Master', tss_level_5: 'L5 Educator',
  };
  const certRank = coach.certification_level ? (parseInt(String(coach.certification_level).replace(/\D/g, ''), 10) || 0) : 0;
  const certLabel = coach.certification_level ? (CERT_LABELS[coach.certification_level] || coach.certification_level) : null;
  const nextCertLabel = certRank >= 1 && certRank < 5 ? CERT_LABELS[`tss_level_${certRank + 1}`] : null;

  return (
    <div className="space-y-4">
      {/* ── INK HERO — Brand Manual v10 (Archivo Expanded · Plex Mono · #00D2FF) ── */}
      <div className="rounded-3xl overflow-hidden" style={{ background: '#061C2B' }}>
        <div className="px-5 pt-5 pb-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px]" style={{ ...F_LABEL, color: '#00D2FF' }}>Here and now · Coach portal</p>
            <Link
              href={`/coach-portal/${coach.portal_token}/profile`}
              className="text-[10px] hover:opacity-80"
              style={{ ...F_LABEL, color: 'rgba(247,249,250,.55)' }}
            >
              Edit profile
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white text-lg font-bold" style={{ boxShadow: '0 0 0 2px rgba(0,210,255,.4)', background: '#0d2a3f' }}>
              {coach.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.photo_url} alt={coach.display_name} className="w-full h-full object-cover" />
              ) : (initials || <Waves size={22} strokeWidth={1.75} style={{ color: '#8aa0b2' }} />)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl truncate" style={{ ...F_DISPLAY, color: '#F7F9FA' }}>{coach.display_name}</h1>
              <span className="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px]" style={{ ...F_LABEL, background: 'rgba(0,210,255,.15)', color: '#00D2FF' }}>
                {coach.role.replace(/_/g, ' ')}{certRank > 0 ? ` · L${certRank}` : ''}
              </span>
            </div>
          </div>

          {/* Certification card */}
          <div className="mt-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award size={16} className="shrink-0" style={{ color: '#00D2FF' }} />
                <span className="text-base whitespace-nowrap" style={{ ...F_DISPLAY, color: '#F7F9FA' }}>
                  {certRank > 0 ? `Level ${certRank} of 5` : 'Not certified'}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px]" style={{ ...F_LABEL, color: 'rgba(247,249,250,.7)' }}>
                <Clock size={13} /> {coachingHours}h coached
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
              <div className="h-full rounded-full" style={{ width: `${(certRank / 5) * 100}%`, background: '#00D2FF' }} />
            </div>
            <p className="mt-2 text-[10px]" style={{ ...F_LABEL, color: 'rgba(247,249,250,.55)' }}>
              {nextCertLabel ? `Next: ${nextCertLabel}` : certRank >= 5 ? 'Top certification reached' : 'Start your certification path'}
            </p>
          </div>
        </div>
      </div>

      {/* ── TODAY — the class running now, with its class-day logistics ── */}
      {todayLogistics && (
        <div className="rounded-3xl bg-white p-5" style={{ boxShadow: '0 10px 30px rgba(6,28,43,.06), inset 0 0 0 1px rgba(6,28,43,.05)' }}>
          <p className="text-[10px]" style={{ ...F_LABEL, color: '#00A8CC' }}>
            Today{todayLogistics.day_number ? ` · Day ${todayLogistics.day_number}${todayLogistics.total_days ? ` of ${todayLogistics.total_days}` : ''}` : ''}
          </p>
          <h2 className="mt-1.5 text-xl" style={{ ...F_DISPLAY, color: '#061C2B' }}>{todayLogistics.camp_name || 'Your class'}</h2>

          <div className="mt-4 space-y-2.5">
            {t12(todayLogistics.class_start_time) && (
              <div className="flex items-center gap-2.5 text-sm" style={{ color: '#55666E' }}>
                <Sunrise size={16} style={{ color: '#00A8CC' }} /> {t12(todayLogistics.class_start_time)} start
              </div>
            )}
            {todayLogistics.surf_venue && (
              <div className="flex items-center gap-2.5 text-sm" style={{ color: '#55666E' }}>
                <MapPin size={16} style={{ color: '#00A8CC' }} /> {todayLogistics.surf_venue}
              </div>
            )}
            {t12(todayLogistics.transport_depart) && (
              <div className="flex items-center gap-2.5 text-sm" style={{ color: '#55666E' }}>
                <Truck size={16} style={{ color: '#00A8CC' }} /> Van departs {t12(todayLogistics.transport_depart)}
              </div>
            )}
            <div className="flex items-center gap-2.5 text-[10px]" style={{ ...F_LABEL, color: '#55666E' }}>
              <Users size={15} style={{ color: '#00A8CC' }} /> {todayLogistics.students} student{todayLogistics.students === 1 ? '' : 's'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onGoTo?.('plan')}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs transition-opacity hover:opacity-90"
            style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}
          >
            <ClipboardList size={16} /> Plan the session
          </button>
        </div>
      )}

      {/* ── QUICK STATS — 4 tiles ── */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: 'Services run', value: stats.totalServicesAsHead.toString(), onClick: undefined },
          { label: 'Upcoming', value: stats.upcomingServicesCount.toString(), onClick: undefined },
          { label: 'Students', value: String(stats.studentsWorkedWith ?? 0), onClick: undefined },
          { label: 'Rating', value: ratingsCount > 0 ? `${avg}★` : '—', onClick: () => onGoTo?.('rating') },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            disabled={!t.onClick}
            className="rounded-2xl bg-white px-2 py-3 text-center disabled:cursor-default"
            style={{ boxShadow: '0 2px 8px rgba(6,28,43,.04), inset 0 0 0 1px rgba(6,28,43,.05)' }}
          >
            <p className="text-xl leading-none" style={{ ...F_DISPLAY, color: '#061C2B' }}>{t.value}</p>
            <p className="mt-1.5 text-[8px] leading-tight" style={{ ...F_LABEL, letterSpacing: '0.12em', color: '#55666E' }}>{t.label}</p>
          </button>
        ))}
      </div>

      {/* ── Your course progress (coach certification study) ── */}
      {totalLessons > 0 && (
        <div className="rounded-3xl bg-white p-4" style={{ boxShadow: 'inset 0 0 0 1px rgba(6,28,43,.05)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px]" style={{ ...F_LABEL, color: '#55666E' }}>Your course progress</span>
            <span className="text-[11px] font-semibold" style={{ color: '#00A8CC' }}>{completedLessons}/{totalLessons} · {coursePct}%</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(6,28,43,.07)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${coursePct}%`, background: '#00D2FF' }} />
          </div>
          <button onClick={() => onGoTo?.('courses')} className="text-[11px] mt-2.5 inline-flex items-center gap-1 hover:opacity-80" style={{ color: '#00A8CC' }}>
            Continue learning <ChevronRight size={13} />
          </button>
        </div>
      )}

      {profileIncomplete && (
        <Link
          href={`/coach-portal/${coach.portal_token}/profile`}
          className="block rounded-3xl p-4 bg-amber-50"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(217,119,6,.25)' }}
        >
          <p className="text-sm font-semibold text-amber-800">Complete your profile</p>
          <p className="text-xs text-amber-700/90 mt-0.5 leading-relaxed">
            Emergency contact, medical info and waiver. Required before teaching official sessions.
          </p>
          <p className="text-[10px] mt-2" style={{ ...F_LABEL, color: '#B45309' }}>Fill it now →</p>
        </Link>
      )}

      {/* ── Your next classes ── */}
      {upcoming.length > 0 && (
        <details open className="rounded-3xl overflow-hidden bg-white" style={{ boxShadow: 'inset 0 0 0 1px rgba(6,28,43,.05)' }}>
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#061C2B' }}>
              <CalendarDays size={16} strokeWidth={1.75} style={{ color: '#00A8CC' }} />
              Your next classes
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,210,255,.12)', color: '#00A8CC' }}>{upcoming.length}</span>
            </span>
            <ChevronDown size={16} style={{ color: '#9aa7ad' }} />
          </summary>
          <div style={{ borderTop: '1px solid rgba(6,28,43,.06)' }}>
            {upcoming.slice(0, 5).map((s: any) => {
              const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
              return (
                <button
                  key={s.id}
                  onClick={() => onGoTo?.('plan')}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors hover:bg-[rgba(6,28,43,.03)]"
                  style={{ borderBottom: '1px solid rgba(6,28,43,.04)' }}
                >
                  <div className="min-w-0">
                    <p className="text-[15px] truncate" style={{ color: '#061C2B' }}>{s.camp_name}</p>
                    <p className="text-[10px] mt-0.5" style={{ ...F_LABEL, letterSpacing: '0.12em', color: '#55666E' }}>
                      {(tpl?.service_kind?.replace(/_/g, ' ') || 'Service')} · {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={15} className="shrink-0" style={{ color: '#9aa7ad' }} />
                </button>
              );
            })}
          </div>
        </details>
      )}

      {/* Tasks assigned to me by the coordinator */}
      <CoachTasks token={coach.portal_token} onOpenInventory={onGoTo ? () => onGoTo('inventory') : undefined} />
    </div>
  );
}

function CoursesTab({
  courses,
  progress,
  coach,
  token,
}: {
  courses: any[];
  progress: Record<string, { completed: boolean; completed_at: string | null; started: boolean }>;
  coach: any;
  token: string;
}) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CoachLessonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [readState, setReadState] = useState(progress);

  // Determine which lessons are gated. A lesson is locked when its
  // prerequisites array contains an ID that isn't completed yet.
  const completedSet = new Set(
    Object.entries(readState)
      .filter(([, v]) => v.completed)
      .map(([k]) => k)
  );

  const openLesson = async (lessonId: string) => {
    setOpenLessonId(lessonId);
    setLoading(true);
    setDetail(null);
    try {
      const d = await getCoachLessonDetail(token, lessonId);
      setDetail(d);
    } catch (e) {
      setDetail(null);
    }
    setLoading(false);
  };

  const closeLesson = () => {
    setOpenLessonId(null);
    setDetail(null);
  };

  const markRead = () => {
    if (!openLessonId) return;
    startTransition(async () => {
      try {
        await markCoachLessonRead(token, openLessonId);
        setReadState((prev) => ({
          ...prev,
          [openLessonId]: { completed: true, completed_at: new Date().toISOString(), started: false },
        }));
        // Also reflect in local detail state
        setDetail((d) =>
          d
            ? {
                ...d,
                progress: {
                  completed: true,
                  completed_at: new Date().toISOString(),
                  quiz_score: d.progress?.quiz_score ?? null,
                  quiz_attempts: d.progress?.quiz_attempts ?? 0,
                },
              }
            : d
        );
      } catch (e: any) {
        alert(e.message || 'Failed to mark as read');
      }
    });
  };

  // ── Reader view ─────────────────────────────────────────────
  if (openLessonId) {
    const isCompleted = !!detail?.progress?.completed;

    return (
      <div className="space-y-3 pb-4">
        <button
          type="button"
          onClick={closeLesson}
          className="text-[12px] text-[var(--tss-cyan,#5AC3E7)] hover:underline"
        >
          ← Back to courses
        </button>

        {loading && (
          <div className="text-center py-16">
            <BookOpen size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan,#5AC3E7)]" />
            <p className="text-white/50 text-sm">Loading lesson…</p>
          </div>
        )}

        {!loading && detail && (
          <>
            <div className="bg-[var(--tss-navy)] text-white rounded-2xl px-5 py-6 shadow-md">
              <p className="text-[10px] font-mono text-white/50 mb-1 uppercase tracking-wider">
                {detail.lesson.id} · ~{detail.lesson.estimated_minutes ?? '?'} min
              </p>
              <h2
                className="text-2xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {detail.lesson.title}
              </h2>
              {detail.lesson.subtitle && (
                <p className="text-sm text-white/70 italic mt-1.5">{detail.lesson.subtitle}</p>
              )}
            </div>

            {/* Body — STP-structured lessons get the pillar tab reader
                (Video · What · Deliver · Errors · Validate · Drill · Mission · Quiz),
                everything else falls back to plain markdown. */}
            {detail.lesson.coach_what_md ? (
              <StpPillarReader
                detail={detail}
                videos={detail.videos}
                hasQuiz={detail.quizzes.length > 0}
                embedUrlFor={embedUrlFor}
                quizSlot={
                  detail.quizzes.length > 0 ? (
                    <CoachQuizSection
                      token={token}
                      lessonId={openLessonId}
                      quizzes={detail.quizzes}
                      existingScore={detail.progress?.quiz_score ?? null}
                      existingAttempts={detail.progress?.quiz_attempts ?? 0}
                      onPassed={() => {
                        setReadState((p) => ({
                          ...p,
                          [openLessonId]: { completed: true, completed_at: new Date().toISOString(), started: false },
                        }));
                        setDetail((d) =>
                          d ? { ...d, progress: { ...(d.progress ?? { quiz_score: null, quiz_attempts: 0 }), completed: true, completed_at: new Date().toISOString() } } : d
                        );
                      }}
                    />
                  ) : null
                }
              />
            ) : (
              <>
                {/* Plain-markdown lessons keep videos inline above the body */}
                {detail.videos.length > 0 && (
                  <div className="space-y-2">
                    {detail.videos.map((v) => (
                      <div key={v.id} className="bg-black rounded-2xl overflow-hidden aspect-video">
                        <iframe
                          src={embedUrlFor(v.provider, v.url)}
                          title={v.title || 'Coach video'}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                )}
                {detail.lesson.description_md ? (
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-6">
                    <MarkdownContent markdown={detail.lesson.description_md} />
                  </div>
                ) : detail.lesson.lesson_type === 'test' ? null : (
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-6 text-sm text-gray-500 italic">
                    No content for this lesson yet.
                  </div>
                )}
              </>
            )}

            {/* Quiz for non-STP lessons (test type with questions) renders
                outside the pillar reader, keeping the legacy behaviour for
                Foundations / Pre-Course / Career test lessons. */}
            {!detail.lesson.coach_what_md && detail.lesson.lesson_type === 'test' && detail.quizzes.length > 0 ? (
              <CoachQuizSection
                token={token}
                lessonId={openLessonId}
                quizzes={detail.quizzes}
                existingScore={detail.progress?.quiz_score ?? null}
                existingAttempts={detail.progress?.quiz_attempts ?? 0}
                onPassed={() => {
                  setReadState((p) => ({
                    ...p,
                    [openLessonId]: { completed: true, completed_at: new Date().toISOString(), started: false },
                  }));
                  setDetail((d) =>
                    d ? { ...d, progress: { ...(d.progress ?? { quiz_score: null, quiz_attempts: 0 }), completed: true, completed_at: new Date().toISOString() } } : d
                  );
                }}
              />
            ) : (
              /* Mark as read for any lesson that isn't already completed
                 via a quiz pass. STP lessons with a quiz inside the pillar
                 reader handle completion through onPassed instead. */
              (!detail.lesson.coach_what_md || detail.quizzes.length === 0) && (
                <button
                  type="button"
                  onClick={markRead}
                  disabled={pending || isCompleted}
                  className={`w-full py-3 text-sm font-semibold rounded-xl transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'text-white hover:brightness-110'
                  }`}
                  style={isCompleted ? {} : { background: BRAND.colors.navy }}
                >
                  {isCompleted ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check size={15} strokeWidth={1.75} />
                      Completed
                    </span>
                  ) : pending ? 'Saving…' : 'Mark as read'}
                </button>
              )
            )}
          </>
        )}
      </div>
    );
  }

  // ── List view (grouped into the 5 tiers) ──────────────────
  const completedCount = courses.filter((c) => completedSet.has(c.id)).length;

  // The restructured coach_wb course groups by ID prefix into 5 tiers.
  const byPrefix = (prefix: string) => courses.filter((c) => c.id.startsWith(prefix));
  const tierFoundations = byPrefix('COACH-FOUND-');
  const tierPreOnboard = courses.filter(
    (c) => c.id === 'COACH-PC-VERIFY' || c.id === 'COACH-OB-DELIVERY'
  );
  // WB tier 3 = only the 25 WB STPs (001..025). YB STPs (027..034)
  // belong to their own YB tier even though they share the COACH-STP- prefix.
  const tierStps = courses.filter(
    (c) => c.course_section === 'coach_wb' && /^COACH-STP-0(0[1-9]|1\d|2[0-5])$/.test(c.id)
  );
  const tierDiagnostics = byPrefix('COACH-DIAG-');
  const tierCareer = byPrefix('COACH-CAREER-');
  // Safety Canon certification module — required for L1 + annual renewal.
  const tierSafety = byPrefix('COACH-SAFETY-');
  const exitTest = courses.filter((c) => c.id === 'COACH-WB-EXIT-TEST');
  const master = courses.filter((c) => c.course_section === 'coach_wb_master');

  // YB Coach Course tiers (course_section = 'coach_yb').
  const ybCourses = courses.filter((c) => c.course_section === 'coach_yb');
  const ybFoundations = ybCourses.filter(
    (c) => c.id === 'COACH-YB-FOUND-01' || c.id === 'COACH-YB-ONB-01',
  );
  const ybStps = ybCourses.filter((c) => /^COACH-STP-0(2[7-9]|3[0-4])$/.test(c.id));
  const ybIntegration = ybCourses.filter(
    (c) => c.id === 'COACH-YB-MOD-7' || c.id === 'COACH-YB-MOD-8',
  );

  // BB Coach Course tiers (course_section = 'coach_bb').
  const bbCourses = courses.filter((c) => c.course_section === 'coach_bb');
  const bbFoundations = bbCourses.filter((c) =>
    ['COACH-BB-FOUND-01', 'COACH-BB-FRAME-01', 'COACH-BB-ONB-01', 'COACH-BB-FOUNDSEQ-01'].includes(c.id),
  );
  const bbSequences = bbCourses.filter((c) => /^COACH-BB-SEQ\d+$/.test(c.id));
  const bbConcepts = bbCourses.filter((c) =>
    ['COACH-BB-CONCEPTS-01', 'COACH-BB-INTEGRATION-01'].includes(c.id),
  );
  const bbExit = bbCourses.filter((c) =>
    ['COACH-BB-EXIT-01', 'COACH-BB-CONDUCT-01'].includes(c.id),
  );

  const doneIn = (arr: any[]) => arr.filter((c) => completedSet.has(c.id)).length;

  const renderCard = (c: any) => {
    const isCompleted = completedSet.has(c.id);
    const isInProgress = !isCompleted && !!progress[c.id]?.started;
    const prereqs: string[] = c.prerequisites ?? [];
    const lockedBy = prereqs.find((id) => !completedSet.has(id));
    const isLocked = !!lockedBy;
    // Content-category background:
    //   value  → rose      (Belt Values doctrine)
    //   method → cyan/gray (methodology · framework · pedagogy · career)
    //   yb     → electric yellow (YB belt content)
    //   wb     → white     (WB belt content, default)
    const title = (c.title || '').toLowerCase();
    const pillar = (c.pillar || '').toLowerCase();
    const id: string = c.id || '';
    const isValue =
      title.includes('belt value') ||
      title.includes('values doctrine') ||
      pillar.includes('belt value') ||
      pillar.includes('values');
    const isMethod =
      !isValue && (
        id.startsWith('COACH-FOUND-') ||
        id.startsWith('COACH-DIAG-') ||
        id.startsWith('COACH-CAREER-') ||
        id === 'COACH-PC-VERIFY' ||
        id === 'COACH-OB-DELIVERY'
      );
    const isYb = !isValue && !isMethod && c.course_section === 'coach_yb';
    const isBb = !isValue && !isMethod && c.course_section === 'coach_bb';
    // Category color kept as a left-accent on the dark card (signals content type).
    const accent = isValue ? '#EC4899' : isMethod ? '#5AC3E7' : isYb ? '#FACC15' : isBb ? '#3B82F6' : '#94A3B8';
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => !isLocked && openLesson(c.id)}
        disabled={isLocked}
        className={`w-full text-left rounded-xl border border-gray-100 bg-white p-3.5 transition-all shadow-sm ${
          isLocked ? 'opacity-45 cursor-not-allowed' : 'hover:border-[#00D2FF]/40'
        }`}
        style={{ borderLeft: `3px solid ${isCompleted ? '#06D6A0' : isInProgress ? '#00D2FF' : accent}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 flex items-center gap-2.5">
            {isCompleted ? (
              <CheckCircle2 size={17} strokeWidth={2} className="shrink-0" style={{ color: '#06D6A0' }} />
            ) : isLocked ? (
              <Lock size={15} strokeWidth={2} className="shrink-0 text-gray-400" />
            ) : (
              <span className="shrink-0 w-[15px] h-[15px] rounded-full border-2" style={{ borderColor: isInProgress ? '#00D2FF' : '#CBD5E1', background: isInProgress ? 'rgba(0,210,255,.25)' : 'transparent' }} />
            )}
            <span className="min-w-0">
              <span className="block text-[9px]" style={{ ...F_LABEL, color: '#0090B0' }}>
                {c.id} · ~{c.estimated_minutes ?? '?'} min
              </span>
              <span className="block text-[13px] font-medium truncate mt-0.5" style={{ color: '#061C2B' }}>{c.title}</span>
              {isLocked && (
                <span className="block text-[10px] text-gray-400 mt-0.5">Finish {lockedBy} first</span>
              )}
            </span>
          </div>
          <ChevronRight size={15} className="text-gray-300 shrink-0" />
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      <p className="text-[10px] px-1" style={{ ...F_LABEL, color: '#55666E' }}>Your certification path</p>

      {/* Progress hero (M141) — overall count + continue-where-you-left-off. */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-5">
        <p className="text-[9px] mb-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>
          Coach course · {coach.max_belt_permission?.replace(/_/g, ' ')}
          {coach.certification_level ? ` · ${coach.certification_level}` : ''}
        </p>
        <h2 className="text-[21px]" style={{ ...F_DISPLAY, color: '#061C2B' }}>
          {completedCount} of {courses.length} lessons
        </h2>
        {courses.length > 0 && (
          <div className="h-1.5 rounded-full overflow-hidden mt-3" style={{ background: 'rgba(6,28,43,.08)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(completedCount / courses.length) * 100}%`, background: '#00D2FF' }} />
          </div>
        )}
        {(() => {
          const next = courses.find((c: any) =>
            !completedSet.has(c.id) && !((c.prerequisites ?? []) as string[]).some((pid) => !completedSet.has(pid))
          );
          if (!next) return null;
          return (
            <button
              type="button"
              onClick={() => openLesson(next.id)}
              className="mt-4 w-full rounded-full py-3 text-[10px] tracking-[0.16em]"
              style={{ ...F_LABEL, background: '#00D2FF', color: '#061C2B' }}
            >
              Continue · {next.id} {String(next.title || '').slice(0, 26)}
            </button>
          );
        })()}
      </div>

      {/* The Surf Sequence Method — first item in Courses (reference doctrine) */}
      <MethodLauncher />

      {/* Presentations granted to this coach (admin-controlled) */}
      <CoachPresentations token={token} />

      {courses.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: '#0F1E33' }}>
          <BookOpen size={36} strokeWidth={1.5} className="mx-auto mb-2 text-white/30" />
          <p className="text-sm text-white/50">No coach courses published yet.</p>
        </div>
      ) : (
        <>
          <TierGroup
            label="Tier 1 — Foundations"
            sub="The TSS method, architecture, and coaching framework."
            items={tierFoundations}
            done={doneIn(tierFoundations)}
            render={renderCard}
          />
          <TierGroup
            label="Tier 2 — Pre-Course + Onboarding"
            sub="The gate before water + the 6 onboarding items."
            items={tierPreOnboard}
            done={doneIn(tierPreOnboard)}
            render={renderCard}
          />
          <TierGroup
            label="Tier 3 — The 25 Steps"
            sub="One lesson per STP. Tabs: What · Deliver · Errors · Validate · Drill · Mission."
            items={tierStps}
            done={doneIn(tierStps)}
            render={renderCard}
          />
          <TierGroup
            label="Tier 4 — Diagnostics + Evaluation"
            sub="Error taxonomy + the Exit Test evaluation protocol."
            items={tierDiagnostics}
            done={doneIn(tierDiagnostics)}
            render={renderCard}
          />
          <TierGroup
            label="Exit Test — Component 1"
            sub="50-question theoretical exam. 80% to pass."
            items={exitTest}
            done={doneIn(exitTest)}
            render={renderCard}
          />
          <TierGroup
            label="Tier 5 — Career"
            sub="The 5-level coach certification ladder + code of conduct."
            items={tierCareer}
            done={doneIn(tierCareer)}
            render={renderCard}
          />
          <TierGroup
            label="Safety Canon — Certification Module"
            sub="The governing safety doctrine. Required for L1 certification · final exam 80% · annual renewal."
            accent="#FF6B6B"
            items={tierSafety}
            done={doneIn(tierSafety)}
            render={renderCard}
          />
          {/* ── YB Coach Course (unlocks after WB Exit Test) ── */}
          <TierGroup
            label="YB Tier 1 — Foundations + Belt Value Shift"
            sub="L1 authorization scope for YB · the mental shift from humility to resilience."
            items={ybFoundations}
            done={doneIn(ybFoundations)}
            render={renderCard}
          />
          <TierGroup
            label="YB Tier 2 — The 8 YB STPs"
            sub="Sequence 6.0 + 7.0. Each lesson: How to Teach · How to Correct · How to Validate."
            items={ybStps}
            done={doneIn(ybStps)}
            render={renderCard}
          />
          <TierGroup
            label="YB Tier 3 — Complete Ride + Exit Test"
            sub="Coach the 11-stage integration · administer the YB Exit Test with integrity."
            items={ybIntegration}
            done={doneIn(ybIntegration)}
            render={renderCard}
          />

          {/* ── BB Coach Course (L2 Practitioner · unlocks after YB) ── */}
          <TierGroup
            label="BB Tier 1 — Foundations + Belt Value"
            sub="L2 authorization · the Audit/Refinement stance · frameworks · Compromiso Consciente · Foundation Sequence."
            items={bbFoundations}
            done={doneIn(bbFoundations)}
            render={renderCard}
          />
          <TierGroup
            label="BB Tier 2 — The 6 Sequences (15 STPs)"
            sub="Seq #8–#13. Each lesson: How to Teach · How to Correct · How to Validate · Coach Cue."
            items={bbSequences}
            done={doneIn(bbSequences)}
            render={renderCard}
          />
          <TierGroup
            label="BB Tier 3 — Concepts + Integration"
            sub="The 4 Blue Belt Concepts · coaching the complete Infinite Circle ride."
            items={bbConcepts}
            done={doneIn(bbConcepts)}
            render={renderCard}
          />
          <TierGroup
            label="BB Tier 4 — Exit Test + Code of Conduct"
            sub="Administer the BB Exit Test (audit the self-evaluation) · 12-question quiz · code of conduct + appendices."
            items={bbExit}
            done={doneIn(bbExit)}
            render={renderCard}
          />

          <TierGroup
            label="Master Manual — Canon Reference"
            sub="Single source of truth. 15 reference lessons (no prerequisites)."
            items={master}
            done={doneIn(master)}
            render={renderCard}
          />
        </>
      )}
    </div>
  );
}

function TierGroup({
  label,
  sub,
  items,
  render,
  done = 0,
  accent,
}: {
  label: string;
  sub: string;
  items: any[];
  render: (c: any) => React.ReactNode;
  done?: number;
  accent?: string; // e.g. coral for the Safety tier
}) {
  // Open by default only when the tier is in progress — finished and
  // untouched tiers stay folded so the path reads at a glance (M141).
  const inProgress = done > 0 && done < items.length;
  const [open, setOpen] = useState(inProgress);
  if (items.length === 0) return null;
  const complete = done === items.length;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={accent ? { borderTop: `3px solid ${accent}` } : undefined}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left">
        <span className="min-w-0">
          <span className="block text-[11px] truncate" style={{ ...F_LABEL, color: accent ?? '#061C2B', letterSpacing: '0.12em' }}>{label}</span>
          {open && <span className="block text-[11px] text-gray-500 mt-1 normal-case tracking-normal" style={{ fontFamily: 'inherit' }}>{sub}</span>}
        </span>
        <span className="shrink-0 inline-flex items-center gap-2">
          <span className="text-[10px]" style={{ ...F_LABEL, color: complete ? '#06D6A0' : done > 0 ? '#0090B0' : '#9CA3AF' }}>
            {complete ? '✓ ' : ''}{done}/{items.length}
          </span>
          <ChevronDown size={14} className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && <div className="px-3 pb-3 space-y-1.5">{items.map(render)}</div>}
    </div>
  );
}

// Convert a YouTube/Vimeo watch URL to an embed URL.
function embedUrlFor(provider: string, url: string): string {
  if (provider === 'youtube') {
    // Accept full URL, short youtu.be, or already-embed
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  }
  if (provider === 'vimeo') {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : url;
  }
  // Google Drive shareable link → embeddable preview iframe.
  const gd = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  const gdOpen = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (gdOpen) return `https://drive.google.com/file/d/${gdOpen[1]}/preview`;
  return url;
}

// ─── Quiz section for test-type coach lessons ───────────────────
//
// Renders all questions, lets the coach pick answers, submits to server,
// shows per-question correctness + final score with pass/fail banner.
// Pass threshold: 80%. Retake = clears local state, server keeps best score.

interface CoachQuizSectionProps {
  token: string;
  lessonId: string;
  quizzes: { id: string; question: string; options: { text: string; correct: boolean }[]; display_order: number }[];
  existingScore: number | null;
  existingAttempts: number;
  onPassed: () => void;
}

function CoachQuizSection({
  token,
  lessonId,
  quizzes,
  existingScore,
  existingAttempts,
  onPassed,
}: CoachQuizSectionProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correctById: Record<string, { correctIdx: number; gotIt: boolean }>;
  } | null>(null);

  const allAnswered = quizzes.every((q) => answers[q.id] !== undefined);

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await submitCoachQuiz(token, lessonId, answers);
      setResult({ score: r.score, passed: r.passed, correctById: r.correctById });
      if (r.passed) onPassed();
    } catch (e: any) {
      alert(e.message || 'Failed to submit quiz');
    }
    setSubmitting(false);
  };

  const retake = () => {
    setAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Result view ──
  if (result) {
    return (
      <div className="space-y-3">
        <div
          className={`rounded-2xl p-5 text-center ${
            result.passed
              ? 'bg-emerald-50 border-2 border-emerald-300'
              : 'bg-amber-50 border-2 border-amber-300'
          }`}
        >
          {result.passed
            ? <Trophy size={36} strokeWidth={1.75} className="mx-auto mb-1 text-emerald-700" />
            : <BookOpen size={36} strokeWidth={1.75} className="mx-auto mb-1 text-amber-700" />
          }
          <p className="text-2xl font-bold" style={{ color: result.passed ? '#047857' : '#92400E' }}>
            {result.score}%
          </p>
          <p
            className="text-sm font-semibold mt-1"
            style={{ color: result.passed ? '#047857' : '#92400E' }}
          >
            {result.passed ? 'Passed — 80%+ required' : 'Not yet — 80%+ required to pass'}
          </p>
          <p className="text-[11px] text-gray-500 mt-2">
            Attempt #{existingAttempts + 1}
            {existingScore !== null && ` · Best score so far: ${Math.max(existingScore, result.score)}%`}
          </p>
        </div>

        {/* Per-question review */}
        <div className="space-y-2">
          {quizzes.map((q, idx) => {
            const r = result.correctById[q.id];
            const chosen = answers[q.id];
            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm ${
                  r?.gotIt ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                <p className="text-[10px] font-mono text-gray-400 mb-1">
                  Q{idx + 1} {r?.gotIt ? '· ✓' : '· ✗'}
                </p>
                <p className="text-sm text-gray-800">{q.question}</p>
                <div className="mt-2 space-y-1">
                  {q.options.map((o, oIdx) => {
                    const isChosen = chosen === oIdx;
                    const isCorrect = oIdx === r?.correctIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`text-[11px] px-2 py-1 rounded ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-900'
                            : isChosen
                            ? 'bg-red-50 text-red-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {isCorrect && '✓ '}
                        {!isCorrect && isChosen && '✗ '}
                        {o.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {!result.passed && (
          <button
            type="button"
            onClick={retake}
            className="w-full py-3 text-white text-sm font-semibold rounded-xl"
            style={{ background: BRAND.colors.navy }}
          >
            Retake the test
          </button>
        )}
      </div>
    );
  }

  // ── Quiz form ──
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          {quizzes.length} questions · 80% to pass
        </p>
        {existingAttempts > 0 && existingScore !== null && (
          <p className="text-[11px] text-gray-500 mt-1">
            Previous best: <strong>{existingScore}%</strong> ({existingAttempts} attempt{existingAttempts > 1 ? 's' : ''})
          </p>
        )}
      </div>

      <div className="space-y-3">
        {quizzes.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <p className="text-[10px] font-mono text-gray-400 mb-1">Q{idx + 1}</p>
            <p className="text-sm text-gray-800 leading-relaxed">{q.question}</p>
            <div className="mt-3 space-y-1.5">
              {q.options.map((o, oIdx) => {
                const chosen = answers[q.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oIdx }))}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-[12px] transition-colors ${
                      chosen
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {o.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!allAnswered || submitting}
        className="w-full py-3 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
        style={{ background: BRAND.colors.navy }}
      >
        {submitting
          ? 'Scoring…'
          : allAnswered
          ? 'Submit answers'
          : `Answer all ${quizzes.length} questions first (${Object.keys(answers).length} / ${quizzes.length})`}
      </button>
    </div>
  );
}

function ToolsTab({ stps, coach, emergencyPlan, students, boards }: {
  stps: any[];
  coach: any;
  emergencyPlan?: {
    emergency_numbers: string | null;
    nearest_hospital: string | null;
    lifeguard_contact: string | null;
    emergency_address: string | null;
    emergency_protocol: string | null;
  } | null;
  students?: { id: string; name: string }[];
  boards?: { id: string; code: string }[];
}) {
  const hasEmergency = !!emergencyPlan && (
    emergencyPlan.emergency_numbers || emergencyPlan.nearest_hospital ||
    emergencyPlan.lifeguard_contact || emergencyPlan.emergency_address ||
    emergencyPlan.emergency_protocol
  );
  // Group STPs by sequence (using wb_sequence_* data from lessons).
  // STPs without sequence info fall into an "Other" bucket at the end.
  const groups = new Map<string, { name: string; belt: 'white' | 'yellow'; order: number; items: any[] }>();
  for (const s of stps) {
    const key = s.sequence_id ?? `_${s.belt}_unsequenced`;
    const name = s.sequence_name ?? (s.belt === 'yellow' ? 'Yellow Belt' : 'White Belt');
    if (!groups.has(key)) {
      groups.set(key, { name, belt: s.belt, order: s.sequence_order ?? 999, items: [] });
    }
    groups.get(key)!.items.push(s);
  }
  const sequences = Array.from(groups.entries())
    .sort(([, a], [, b]) => {
      if (a.belt !== b.belt) return a.belt === 'white' ? -1 : 1;
      return a.order - b.order;
    });

  return (
    <div className="space-y-4 pb-4">
      <p className="text-[10px] px-1" style={{ ...F_LABEL, color: '#55666E' }}>Your tools · Coaching toolkit</p>

      {/* ── STP LIBRARY (hero) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-5">
        <p className="text-[9px] mb-1.5" style={{ ...F_LABEL, color: '#0090B0' }}>STP Library</p>
        <h2 className="text-lg" style={{ ...F_DISPLAY, color: '#061C2B' }}>Browse by sequence</h2>
        <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
          Pick a step to see its drills, missions and visual aids.
          {' '}Filtered by your certification (<strong>up to {coach.max_belt_permission?.replace(/_/g, ' ')}</strong>).
        </p>
      </div>

      {sequences.map(([key, g]) => (
        <SequenceGroup key={key} group={g} token={coach.portal_token} />
      ))}

      {stps.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No steps available yet.</p>
        </div>
      )}

      {/* ── FIELD TOOLS ── */}
      <p className="text-[10px] px-1 pt-2" style={{ ...F_LABEL, color: '#55666E' }}>Field tools</p>
      <VideoAnalyzerLauncher variant="card" />
      <BoardSelectorLauncher variant="card" />
      <VenueScoutLauncher variant="light" />
      <BreathingLauncher variant="light" />

      {/* ── SAFETY ── */}
      <p className="text-[10px] px-1 pt-2" style={{ ...F_LABEL, color: '#FF6B6B' }}>Safety</p>

      {/* Emergency plan — coral-bordered, English copy (brand rule) */}
      <details className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1.5px solid rgba(255,107,107,.55)' }}>
        <summary className="cursor-pointer list-none p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,107,107,.12)' }}>
            <LifeBuoy size={18} strokeWidth={1.75} style={{ color: '#FF6B6B' }} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm" style={{ ...F_DISPLAY, color: '#061C2B' }}>Emergency plan</span>
            <span className="block text-[11px] text-gray-500 leading-snug">Numbers, hospital, protocol</span>
          </span>
          <span className="text-[9px] shrink-0" style={{ ...F_LABEL, color: hasEmergency ? '#0090B0' : '#FF6B6B' }}>{hasEmergency ? 'View' : 'Not set'}</span>
        </summary>
        <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
          {hasEmergency ? (
            <>
              {emergencyPlan!.emergency_numbers && <EmRowLight label="Numbers" value={emergencyPlan!.emergency_numbers} />}
              {emergencyPlan!.nearest_hospital && <EmRowLight label="Hospital" value={emergencyPlan!.nearest_hospital} />}
              {emergencyPlan!.lifeguard_contact && <EmRowLight label="Lifeguard" value={emergencyPlan!.lifeguard_contact} />}
              {emergencyPlan!.emergency_address && <EmRowLight label="Location" value={emergencyPlan!.emergency_address} />}
              {emergencyPlan!.emergency_protocol && <EmRowLight label="Protocol" value={emergencyPlan!.emergency_protocol} />}
            </>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Your academy hasn&apos;t set the emergency plan yet — ask your coordinator to complete it.
            </p>
          )}
        </div>
      </details>

      {/* Report an incident */}
      <IncidentReporter token={coach.portal_token} students={students} boards={boards} />

      {/* Problem Protocol — reference PDF */}
      <a
        href="/docs/sistema-resolver-problemas.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 hover:shadow-md transition-shadow flex items-center gap-3"
      >
        <FileText size={18} strokeWidth={1.75} className="shrink-0" style={{ color: '#061C2B' }} />
        <span className="min-w-0 flex-1 text-sm font-semibold truncate" style={{ color: '#061C2B' }}>Problem Protocol — reference guide</span>
        <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600" style={{ ...F_LABEL }}>PDF</span>
        <ChevronRight size={15} className="text-gray-300 shrink-0" />
      </a>
    </div>
  );
}

function SequenceGroup({
  group,
  token,
}: {
  group: { name: string; belt: 'white' | 'yellow'; items: any[] };
  token: string;
}) {
  const [open, setOpen] = useState(true);
  const beltAccent = group.belt === 'yellow' ? 'border-l-amber-300' : 'border-l-sky-300';
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 border-l-4 ${beltAccent}`}
      >
        <div className="text-left min-w-0">
          <p className="text-[8px]" style={{ ...F_LABEL, color: '#9CA3AF' }}>
            {group.belt === 'yellow' ? 'Yellow Belt' : 'White Belt'} · {group.items.length} steps
          </p>
          <p className="text-[13px] mt-0.5 truncate" style={{ ...F_LABEL, color: '#061C2B', letterSpacing: '0.1em' }}>{group.name}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="divide-y divide-gray-50">
          {group.items.map((s) => (
            <Link
              key={s.id}
              href={`/coach-portal/${token}/tools/${s.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div className="min-w-0 flex items-baseline gap-2">
                <span className="text-[10px] shrink-0" style={{ ...F_LABEL, color: '#0090B0' }}>{s.id}</span>
                <span className="text-sm font-medium truncate" style={{ color: '#061C2B' }}>{s.title}</span>
              </div>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolGroup({ label, items, accent }: { label: string; items: any[]; accent: 'amber' | 'blue' }) {
  const bg = accent === 'amber' ? 'bg-amber-50/60 border-amber-100' : 'bg-blue-50/60 border-blue-100';
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 px-1">
        {label} ({items.length})
      </p>
      <div className="space-y-1.5">
        {items.map((d) => (
          <ToolCard key={d.id} d={d} bg={bg} />
        ))}
      </div>
    </div>
  );
}

// Expandable tool card — tap to reveal key words + timing detail.
function ToolCard({ d, bg }: { d: any; bg: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={`w-full text-left rounded-2xl border ${bg} p-4 shadow-sm transition-all hover:shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-gray-400">
            {d.id} · {d.step_id} · {d.belt} {d.block_name ? `· ${d.block_name}` : ''}
          </p>
          <p className="text-sm font-medium text-gray-800 mt-0.5">{d.title}</p>
          {!open && d.key_words && d.key_words.length > 0 && (
            <p className="text-[11px] text-gray-500 italic mt-1 truncate">
              {d.key_words.join(' · ')}
            </p>
          )}
        </div>
        <span className={`text-gray-400 shrink-0 text-xs transition ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </div>

      {open && (
        <div className="mt-2 pt-2 border-t border-gray-200/70 space-y-2">
          <div className="flex flex-wrap gap-3">
            {d.time_estimate && (
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <Clock size={11} strokeWidth={1.75} /> {d.time_estimate}
              </p>
            )}
            {d.reps_recommended && (
              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                <RotateCcw size={11} strokeWidth={1.75} /> {d.reps_recommended}
              </p>
            )}
          </div>
          {d.description_md && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                How it works
              </p>
              <MarkdownContent markdown={d.description_md} />
            </div>
          )}
          {d.success_criteria && d.success_criteria.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Success criteria
              </p>
              <ul className="space-y-0.5">
                {d.success_criteria.map((c: string, i: number) => (
                  <li key={i} className="text-[13px] text-gray-700 flex gap-1.5">
                    <CheckCircle2 size={13} strokeWidth={1.75} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {d.key_words && d.key_words.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Key words
              </p>
              <div className="flex flex-wrap gap-1">
                {d.key_words.map((k: string, i: number) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-[10px] text-gray-400 italic">
            {d.type === 'mission'
              ? 'Use this as an in-water mission when planning a session.'
              : 'Use this as a dry-land drill when planning a session.'}
          </p>
        </div>
      )}
    </button>
  );
}

// ─── New "Plan" tab (replaces the old "Services" tab) ───────────────
// Lists upcoming + past services. Click → open the planner inline.

function PlanTab({
  upcoming,
  past,
  unclosed = [],
  token,
  onOpenChange,
}: {
  upcoming: any[];
  past: any[];
  unclosed?: { camp_id: string; camp_name: string; day_number: number; date: string }[];
  token: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  // Tell the shell to switch to focused mode while a class is open.
  useEffect(() => {
    onOpenChange?.(!!selectedCampId);
    return () => onOpenChange?.(false);
  }, [selectedCampId, onOpenChange]);
  const [planData, setPlanData] = useState<ServicePlanData | null>(null);
  const [loading, setLoading] = useState(false);
  // 'read' = the polished day-by-day manual (CampPlanReader). 'run' =
  // the per-day SessionPlanner (live execution). Default to 'read' so
  // the coach lands on the full plan with support material first.
  const [planView, setPlanView] = useState<'read' | 'run'>('read');

  const openPlanner = async (campId: string, dayNumber?: number, view?: 'read' | 'run') => {
    setSelectedCampId(campId);
    setLoading(true);
    setPlanData(null);
    setPlanView(view ?? 'read');
    try {
      const d = await getServicePlan(token, campId, dayNumber);
      setPlanData(d);
    } catch (e) {
      setPlanData(null);
    }
    setLoading(false);
  };

  const close = () => {
    setSelectedCampId(null);
    setPlanData(null);
    setPlanView('read');
  };

  // M45 — reload the planner for a different day without leaving the screen.
  const switchDay = async (dayNumber: number) => {
    if (!selectedCampId) return;
    setLoading(true);
    try {
      const d = await getServicePlan(token, selectedCampId, dayNumber);
      setPlanData(d);
    } catch {
      /* keep prior data */
    }
    setLoading(false);
  };

  if (selectedCampId) {
    if (loading) {
      return (
        <div className="text-center py-16">
          <ClipboardList size={36} strokeWidth={1.75} className="animate-pulse mx-auto mb-2 text-[var(--tss-cyan,#5AC3E7)]" />
          <p className="text-gray-500 text-sm">Loading planner…</p>
        </div>
      );
    }
    if (!planData) {
      return (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500">Couldn&apos;t load this service.</p>
          <button onClick={close} className="text-[12px] text-[var(--tss-navy)] hover:underline mt-2">
            ← Back
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {/* Mode toggle: Read the Plan (manual) ↔ Run the Session (live editor) */}
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={close}
            className="text-[12px] text-[var(--tss-navy)] hover:underline"
          >
            ← Back to services
          </button>
          {planData.readOnly ? (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 px-3 py-1" style={{ fontFamily: 'DM Mono, monospace' }}>
              View only · Assistant
            </span>
          ) : (
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              {(['read', 'run'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPlanView(v)}
                  className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                    planView === v
                      ? 'bg-[var(--tss-navy)] text-white'
                      : 'bg-white text-gray-500 hover:text-gray-800'
                  }`}
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {v === 'read' ? 'Read the Plan' : 'Run the Session'}
                </button>
              ))}
            </div>
          )}
        </div>

        {planView === 'read' || planData.readOnly ? (
          <CampPlanReader
            instanceId={selectedCampId}
            coachToken={token}
            templatePlan={planData.templatePlan}
            templateMeta={planData.templateMeta}
          />
        ) : (
          <SessionPlanner data={planData} token={token} onBack={close} onSwitchDay={switchDay} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">
          Plan the Session
        </p>
        <h2 className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Your assigned classes
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Tap a class to plan the venue read, warm-up, mental hack, and per-student
          drills + missions.
        </p>
      </div>

      {/* Días pasados SIN CIERRE — un toque abre el planner en ese día.
          El cierre es requisito para liberar el pago (candado de nómina). */}
      {unclosed.length > 0 && (
        <div className="rounded-2xl border p-4" style={{ background: 'rgba(255,209,102,.14)', borderColor: 'rgba(255,209,102,.6)' }}>
          <p className="text-[10px] font-mono uppercase tracking-wider font-semibold mb-2" style={{ color: '#7a5c00' }}>
            ⚠ Needs closing ({unclosed.length}) — required to release your pay
          </p>
          <div className="space-y-1.5">
            {unclosed.map((u) => (
              <button
                key={`${u.camp_id}-${u.day_number}`}
                type="button"
                onClick={() => openPlanner(u.camp_id, u.day_number, 'run')}
                className="w-full text-left bg-white border rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 hover:border-amber-400 transition-colors"
                style={{ borderColor: 'rgba(255,209,102,.7)' }}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-gray-800 truncate">{(u.camp_name ?? '').split(' · ')[0]}</span>
                  <span className="block text-[10.5px] text-gray-500">
                    {new Date(u.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · Day {u.day_number}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] font-bold rounded-full px-2.5 py-1" style={{ background: '#FFD166', color: '#061C2B' }}>
                  Close now →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <CoachMiniCalendar services={upcoming} onOpen={openPlanner} token={token} />
      )}

      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 mb-1.5">
            Upcoming + active ({upcoming.length})
          </p>
          {(() => {
            // Agenda view: group upcoming services by their start day, ordered,
            // with friendly Today / Tomorrow / weekday headers.
            const byDay = new Map<string, any[]>();
            for (const s of upcoming) {
              const k = s.start_date as string;
              if (!byDay.has(k)) byDay.set(k, []);
              byDay.get(k)!.push(s);
            }
            const days = Array.from(byDay.keys()).sort();
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const dayLabel = (k: string) => {
              const d = new Date(k + 'T00:00:00');
              const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
              if (diff === 0) return 'Today';
              if (diff === 1) return 'Tomorrow';
              return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            };
            const fmtTime = (t?: string | null) => {
              if (!t) return '';
              const [h, m] = t.split(':');
              const hr = parseInt(h, 10); if (Number.isNaN(hr)) return t;
              return `${hr % 12 || 12}:${m ?? '00'} ${hr >= 12 ? 'PM' : 'AM'}`;
            };
            return (
              <div className="space-y-4">
                {days.map((k) => (
                  <div key={k}>
                    <p className="text-[11px] font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                      <CalendarDays size={12} strokeWidth={2} /> {dayLabel(k)}
                    </p>
                    <div className="space-y-1.5">
                      {byDay.get(k)!.map((s: any) => {
                        const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => openPlanner(s.id)}
                            className="w-full text-left bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 hover:border-emerald-300 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold text-gray-800">
                                  {s.scheduled_time ? `${fmtTime(s.scheduled_time)} · ` : ''}{s.camp_name}
                                </p>
                                <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                                  {tpl?.service_kind?.replace(/_/g, ' ') || s.status}
                                  {' · '}
                                  {s.participant_count ?? 0} student{s.participant_count === 1 ? '' : 's'}
                                  {s.start_date !== s.end_date ? ` · until ${new Date(s.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                                </p>
                              </div>
                              <span className="text-emerald-700 shrink-0 text-sm">→</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {past.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
            <ChevronRight size={12} className="transition-transform group-open:rotate-90" />
            Past ({past.length})
          </summary>
          <div className="space-y-1.5">
            {past.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => openPlanner(s.id)}
                className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-colors"
              >
                <p className="text-sm font-medium text-gray-700">{s.camp_name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {s.start_date !== s.end_date && ` → ${new Date(s.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              </button>
            ))}
          </div>
        </details>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No services assigned yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">
            When the coordinator assigns you to a class, it&apos;ll show up here.
          </p>
        </div>
      )}
    </div>
  );
}

function ServicesTab({ upcoming, past }: { upcoming: any[]; past: any[] }) {
  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Services</p>
        <h2 className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>All services you&apos;ve led</h2>
      </div>

      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 mb-1.5">
            Upcoming + active ({upcoming.length})
          </p>
          <div className="space-y-1.5">
            {upcoming.map((s: any) => {
              const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
              return (
                <div key={s.id} className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                  <p className="text-[10px] font-mono text-emerald-700">
                    {tpl?.service_kind?.replace(/_/g, ' ') || s.status}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{s.camp_name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {s.start_date !== s.end_date && ` → ${new Date(s.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
            <ChevronRight size={12} className="transition-transform group-open:rotate-90" />
            Past ({past.length})
          </summary>
          <div className="space-y-1.5">
            {past.map((s: any) => (
              <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-sm font-medium text-gray-700">{s.camp_name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {s.start_date !== s.end_date && ` → ${new Date(s.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No services yet.</p>
          <p className="text-[11px] text-gray-400 mt-1">When the coordinator assigns you, they appear here.</p>
        </div>
      )}
    </div>
  );
}

function RatingTab({ stats, onBack }: { stats: any; onBack?: () => void }) {
  return (
    <div className="space-y-4 pb-4">
      {onBack && (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[12px] text-white/60 hover:text-white">
          <ChevronLeft size={15} /> Back to home
        </button>
      )}
      <div className="rounded-2xl px-4 py-5" style={{ background: '#0F1E33' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Your Rating</p>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>From your students</h2>
      </div>

      {stats.ratingsCount > 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: '#0F1E33' }}>
          <p className="text-5xl font-bold text-white">{stats.avgRating}</p>
          <p className="text-[15px] tracking-[2px] mt-1" style={{ color: '#EAB308' }}>
            {'★'.repeat(Math.round(stats.avgRating))}<span style={{ color: '#3a4a5e' }}>{'★'.repeat(5 - Math.round(stats.avgRating))}</span>
          </p>
          <p className="text-xs text-white/50 mt-2">out of 5 · across {stats.ratingsCount} surveys</p>
          <p className="text-[11px] text-white/40 italic mt-3">
            Reputation builds from honest feedback. Keep closing sessions and asking your students for the survey.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-8 text-center" style={{ background: '#0F1E33' }}>
          <BarChart2 size={36} strokeWidth={1.5} className="mx-auto mb-2 text-white/20" />
          <p className="text-sm text-white/50">No ratings yet.</p>
          <p className="text-[11px] text-white/40 mt-1">
            Close sessions and have students fill the post-session survey to start building your rating.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
      <p className="tss-stat-number">{value}</p>
      <p
        className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-2"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </p>
      {sublabel && <p className="text-[9px] text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}
