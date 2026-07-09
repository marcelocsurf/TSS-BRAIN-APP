'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants/brand';
import type { CoachPortalData, CoachLessonDetail } from '@/lib/actions/coach-portal';
import { getCoachLessonDetail, markCoachLessonRead, submitCoachQuiz } from '@/lib/actions/coach-portal';
import { getServicePlan, type ServicePlanData } from '@/lib/actions/service-planner';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { PendingAssignments } from './PendingAssignments';
import { MethodLauncher } from '@/components/coach-portal/MethodLauncher';
import { CoachPresentations } from '@/components/coach-portal/CoachPresentations';
import { CoachMiniCalendar } from '@/components/coach-portal/CoachMiniCalendar';
import { CoachTasks } from '@/components/coach-portal/CoachTasks';
import { SessionPlanner } from '@/components/coach-portal/SessionPlanner';
import { CampPlanReader } from '@/components/camp/CampPlanReader';
import { IncidentReporter } from '@/components/coach-portal/IncidentReporter';
import { StpPillarReader } from '@/components/coach-portal/StpPillarReader';
import { VideoAnalyzerLauncher } from '@/components/video-analyzer/VideoAnalyzerLauncher';
import { BoardSelectorLauncher } from '@/components/board-selector/BoardSelectorLauncher';
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
  ChevronLeft,
  ArrowRight,
  Lock,
  CalendarDays,
  LifeBuoy,
} from 'lucide-react';

type TabIconComponent = typeof Home;

type Tab = 'home' | 'courses' | 'tools' | 'plan' | 'rating' | 'sell';

// 'rating' is intentionally NOT in the nav — the student rating is unified
// into the home (a featured card that taps through to the detail).
const TABS: { key: Tab; label: string; Icon: TabIconComponent }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'courses', label: 'Courses', Icon: BookOpen },
  { key: 'tools', label: 'Tools', Icon: Wrench },
  { key: 'plan', label: 'Plan', Icon: ClipboardList },
];

export function CoachPortalTabs({
  data,
  initialTab,
}: {
  data: CoachPortalData;
  initialTab?: Tab;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'home');
  const { coach, stats } = data;
  const isSupport = (coach as any).portal_category === 'support';
  const canSell = !!(coach as any).portal_can_sell;

  // Support (non-coaching) members get a trimmed nav: Home + Courses, plus a
  // Sell tab when they're a seller. Coaching keeps the full set.
  const SELL_TAB = { key: 'sell' as Tab, label: 'Sell', Icon: BarChart2 };
  const visibleTabs = isSupport
    ? [
        TABS.find((t) => t.key === 'home')!,
        ...(canSell ? [SELL_TAB] : []),
        TABS.find((t) => t.key === 'courses')!,
      ]
    : TABS;

  return (
    <div className="min-h-screen tss-portal-bg pb-20" style={{ background: '#000' }}>
      <div className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'home' && (
          <div className="rounded-2xl p-3 space-y-4" style={{ background: '#000' }}>
            <PendingAssignments token={coach.portal_token} assignments={data.pendingAssignments} />

            {isSupport ? (
              <SupportHome coach={coach} upcoming={data.upcomingServices} emergencyPlan={data.emergencyPlan} />
            ) : (
              <HomeTab coach={coach} stats={stats} upcoming={data.upcomingServices} emergencyPlan={data.emergencyPlan} students={data.myStudents} boards={data.boards} onGoTo={setActiveTab} coachCourses={data.coachCourses} courseProgress={data.courseProgress} />
            )}
          </div>
        )}
        {activeTab === 'sell' && canSell && (
          <SellTab services={data.academyServices} />
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
        {activeTab === 'plan' && (
          <PlanTab
            upcoming={data.upcomingServices}
            past={data.pastServices}
            token={coach.portal_token}
          />
        )}
        {activeTab === 'rating' && (
          <div className="rounded-2xl p-3" style={{ background: '#000' }}>
            <RatingTab stats={stats} onBack={() => setActiveTab('home')} />
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10" style={{ background: '#0A1628' }}>
        <div className="max-w-lg mx-auto flex">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[var(--tss-cyan,#5AC3E7)]' : 'text-white/40'
                }`}
              >
                <tab.Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={`mb-0.5 transition-colors ${isActive ? 'text-[var(--tss-cyan,#5AC3E7)]' : 'text-white/40'}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center py-4 pb-24">
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

// Trimmed home for support (non-coaching) members: who they are, their tasks,
// their assigned services, and the academy emergency plan. No coaching UI.
function SupportHome({ coach, upcoming, emergencyPlan }: {
  coach: any;
  upcoming: any[];
  emergencyPlan?: {
    emergency_numbers: string | null;
    nearest_hospital: string | null;
    lifeguard_contact: string | null;
    emergency_address: string | null;
    emergency_protocol: string | null;
  } | null;
}) {
  const initials = `${coach.first_name?.[0] || ''}${coach.last_name?.[0] || ''}`.toUpperCase();
  const title = coach.job_title || 'Team member';
  const hasEmergency = !!emergencyPlan && (
    emergencyPlan.emergency_numbers || emergencyPlan.nearest_hospital ||
    emergencyPlan.lifeguard_contact || emergencyPlan.emergency_address || emergencyPlan.emergency_protocol
  );

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
      <CoachTasks token={coach.portal_token} />

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

// Seller "Sell" tab (Fase 2A): sales chart with goal + services calendar with
// real availability. Read-only for now — the reserve/sell flow comes in 2C.
function SellTab({ services }: { services: any[] }) {
  const live = (services ?? []).filter((s) => s.status !== 'cancelled');

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
                <div key={s.id} className="rounded-lg bg-white/[0.04] px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{s.camp_name}</p>
                    <p className="text-[10px] text-white/40" style={{ fontFamily: 'DM Mono, monospace' }}>
                      {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {s.scheduled_time ? ` · ${s.scheduled_time.slice(0, 5)}` : ''}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full shrink-0 ${full ? 'bg-white/10 text-white/50' : 'text-[#0A1628]'}`} style={!full ? { background: '#5AC3E7' } : undefined}>
                    {full ? 'Full' : `${available} of ${cap} free`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] text-white/30 mt-3">Reserving a spot from here comes next — for now this shows live availability so you can sell.</p>
      </div>
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
}: {
  coach: any;
  stats: any;
  upcoming: any[];
  students?: { id: string; name: string }[];
  boards?: { id: string; code: string }[];
  onGoTo?: (tab: Tab) => void;
  coachCourses?: any[];
  courseProgress?: Record<string, { completed: boolean }>;
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
      {/* ── Dark "cockpit" hero — matches the student home ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628' }}>
        <div className="flex items-center justify-end px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <Link
            href={`/coach-portal/${coach.portal_token}/profile`}
            className="text-[10px] font-mono uppercase tracking-wider"
            style={{ color: '#5AC3E7' }}
          >
            Edit profile
          </Link>
        </div>

        <div className="p-4 space-y-4">
          {/* Identity row: photo + name + role/cert + students */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white text-lg font-bold" style={{ border: '2px solid #5AC3E7', background: '#1b3148' }}>
              {coach.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.photo_url} alt={coach.display_name} className="w-full h-full object-cover" />
              ) : (initials || <Waves size={22} strokeWidth={1.75} style={{ color: '#8aa0b2' }} />)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold truncate" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa' }}>{coach.display_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#5AC3E7', border: '1px solid #5b6b7a' }} />
                <span className="text-xs capitalize" style={{ color: '#8aa0b2' }}>
                  {coach.role.replace(/_/g, ' ')}{certLabel ? ` · ${certLabel}` : ''}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#8aa0b2' }}>Students</p>
              <p className="font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa', fontSize: '20px' }}>{stats.studentsWorkedWith}</p>
            </div>
          </div>

          {/* Primary ring: coaching hours + certification progress */}
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#122236' }}>
            <div className="relative shrink-0" style={{ width: 104, height: 104 }}>
              <svg viewBox="0 0 120 120" width="104" height="104">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1f344a" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#5AC3E7" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 * (1 - certRank / 5)}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-bold leading-none" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa', fontSize: '22px' }}>{coachingHours}h</p>
                <p className="text-[8px] font-mono uppercase tracking-wider mt-1" style={{ color: '#8aa0b2' }}>Coached</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: '#5AC3E7' }}>Certification</p>
              <p className="text-sm font-semibold mt-1" style={{ fontFamily: 'var(--font-heading)', color: '#f0f7fa' }}>
                {certRank > 0 ? `Level ${certRank} of 5` : 'Not certified yet'}
              </p>
              <div className="h-1.5 rounded-full overflow-hidden mt-2 mb-2" style={{ background: '#1f344a' }}>
                <div className="h-full rounded-full" style={{ width: `${(certRank / 5) * 100}%`, background: '#5AC3E7' }} />
              </div>
              <span className="text-[11px]" style={{ color: '#8aa0b2' }}>
                {nextCertLabel ? `Next: ${nextCertLabel}` : certRank >= 5 ? 'Top certification reached' : 'Start your certification path'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Your rating from students (unified from the old Rating tab) ── */}
      <button
        onClick={() => onGoTo?.('rating')}
        className="w-full text-center rounded-2xl p-4 border transition-colors hover:border-[var(--tss-cyan)]/40"
        style={{ background: 'linear-gradient(135deg,#0F1E33,#0A1628)', borderColor: 'rgba(90,195,231,.2)' }}
      >
        <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[var(--tss-cyan)]">Your rating from students</div>
        {ratingsCount > 0 ? (
          <>
            <div className="text-4xl font-bold text-white leading-none mt-1.5">
              {avg}<span className="text-base text-white/50">/5</span>
            </div>
            <div className="text-[15px] tracking-[2px] mt-1" style={{ color: '#EAB308' }}>
              {'★'.repeat(fullStars)}<span style={{ color: '#3a4a5e' }}>{'★'.repeat(5 - fullStars)}</span>
            </div>
            <div className="text-[10px] text-white/40 mt-1.5">from {ratingsCount} student {ratingsCount === 1 ? 'survey' : 'surveys'} · tap for detail</div>
          </>
        ) : (
          <div className="text-sm text-white/50 mt-2">No ratings yet — they appear as students fill post-session surveys.</div>
        )}
      </button>

      {/* ── Two big stat cards (Training / Free Surf style) ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Services run', value: stats.totalServicesAsHead.toString(), accent: '#00D2FF' },
          { label: 'Upcoming', value: stats.upcomingServicesCount.toString(), accent: '#5AC3E7' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: '#0F1E33' }}>
            <div className="flex items-center gap-2">
              <span style={{ width: 4, height: 18, borderRadius: 3, background: s.accent, display: 'inline-block' }} />
              <span className="font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#f4f9fc', fontSize: '20px' }}>{s.label}</span>
            </div>
            <p className="font-bold mt-2" style={{ fontFamily: 'var(--font-heading)', color: '#00D2FF', fontSize: '30px', lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Coaching hours + your course progress ── */}
      <div className="rounded-2xl p-4" style={{ background: '#0F1E33' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(90,195,231,.15)' }}>
            <Clock size={20} strokeWidth={1.75} className="text-[var(--tss-cyan)]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40" style={{ fontFamily: 'DM Mono, monospace' }}>Coaching delivered</p>
            <p className="text-2xl font-semibold text-white leading-none mt-0.5">
              {coachingHours}<span className="text-sm text-white/50"> h</span>
            </p>
          </div>
        </div>

        {totalLessons > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/40" style={{ fontFamily: 'DM Mono, monospace' }}>Your course progress</span>
              <span className="text-[11px] font-semibold text-[var(--tss-cyan)]">{completedLessons}/{totalLessons} · {coursePct}%</span>
            </div>
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${coursePct}%`, background: 'var(--tss-cyan,#5AC3E7)' }} />
            </div>
            <button onClick={() => onGoTo?.('courses')} className="text-[11px] text-white/50 hover:text-white mt-2.5 inline-flex items-center gap-1">
              Continue learning <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {profileIncomplete && (
        <Link
          href={`/coach-portal/${coach.portal_token}/profile`}
          className="block rounded-2xl p-4 border border-amber-400/30"
          style={{ background: 'rgba(234,179,8,.1)' }}
        >
          <p className="text-sm font-semibold text-amber-300">Complete your profile</p>
          <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
            Emergency contact, medical info and waiver. Required before teaching official TSS sessions.
          </p>
          <p className="text-[11px] font-mono uppercase tracking-wider text-amber-300 mt-2">Fill it now →</p>
        </Link>
      )}

      {/* ── Your next classes (collapsible dropdown, clickable rows) ── */}
      {upcoming.length > 0 && (
        <details open className="rounded-2xl overflow-hidden" style={{ background: '#0F1E33' }}>
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarDays size={16} strokeWidth={1.75} className="text-[var(--tss-cyan)]" />
              Your next classes
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(90,195,231,.18)', color: '#5AC3E7' }}>{upcoming.length}</span>
            </span>
            <ChevronDown size={16} className="text-white/40" />
          </summary>
          <div className="border-t border-white/5 divide-y divide-white/5">
            {upcoming.slice(0, 5).map((s: any) => {
              const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
              return (
                <button
                  key={s.id}
                  onClick={() => onGoTo?.('plan')}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] text-white truncate">{s.camp_name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>
                      {(tpl?.service_kind?.replace(/_/g, ' ') || 'Service')} · {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-white/30 shrink-0" />
                </button>
              );
            })}
          </div>
        </details>
      )}

      {/* Tasks assigned to me by the coordinator */}
      <CoachTasks token={coach.portal_token} />
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
        className={`w-full text-left rounded-2xl border border-white/10 p-4 transition-all ${
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/25'
        }`}
        style={{ background: '#0F1E33', borderLeft: `4px solid ${accent}` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono text-white/40">
              {c.id} · ~{c.estimated_minutes ?? '?'} min
              {isLocked && ` · locked — finish ${lockedBy} first`}
            </p>
            <p className="text-sm font-medium text-white mt-0.5">{c.title}</p>
          </div>
          <div className="shrink-0 flex items-center">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 rounded-full px-2 py-0.5">
                <CheckCircle2 size={11} strokeWidth={2} />
                Done
              </span>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-400/30 rounded-full px-2 py-0.5">
                <Clock size={11} strokeWidth={2} />
                In progress
              </span>
            ) : isLocked ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                <Lock size={11} strokeWidth={2} />
                Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                Not started
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="rounded-2xl px-4 py-5" style={{ background: '#0A1628' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">
          Coach Courses
        </p>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Your certification path</h2>
        <p className="text-[11px] text-white/50 mt-1 leading-relaxed capitalize">
          {coach.max_belt_permission?.replace(/_/g, ' ')}
          {coach.certification_level ? ` · ${coach.certification_level}` : ''}.
        </p>
        {courses.length > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f344a' }}>
              <div
                className="h-full transition-all"
                style={{
                  width: `${(completedCount / courses.length) * 100}%`,
                  background: BRAND.colors.cyan,
                }}
              />
            </div>
            <p className="text-[10px] text-white/50 mt-1 font-mono">
              {completedCount} / {courses.length} completed
            </p>
          </div>
        )}
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
            render={renderCard}
          />
          <TierGroup
            label="Tier 2 — Pre-Course + Onboarding"
            sub="The gate before water + the 6 onboarding items."
            items={tierPreOnboard}
            render={renderCard}
          />
          <TierGroup
            label="Tier 3 — The 25 Steps"
            sub="One lesson per STP. Tabs: What · Deliver · Errors · Validate · Drill · Mission."
            items={tierStps}
            render={renderCard}
          />
          <TierGroup
            label="Tier 4 — Diagnostics + Evaluation"
            sub="Error taxonomy + the Exit Test evaluation protocol."
            items={tierDiagnostics}
            render={renderCard}
          />
          <TierGroup
            label="Exit Test — Component 1"
            sub="50-question theoretical exam. 80% to pass."
            items={exitTest}
            render={renderCard}
          />
          <TierGroup
            label="Tier 5 — Career"
            sub="The 5-level coach certification ladder + code of conduct."
            items={tierCareer}
            render={renderCard}
          />
          {/* ── YB Coach Course (unlocks after WB Exit Test) ── */}
          <TierGroup
            label="YB Tier 1 — Foundations + Belt Value Shift"
            sub="L1 authorization scope for YB · the mental shift from humility to resilience."
            items={ybFoundations}
            render={renderCard}
          />
          <TierGroup
            label="YB Tier 2 — The 8 YB STPs"
            sub="Sequence 6.0 + 7.0. Each lesson: How to Teach · How to Correct · How to Validate."
            items={ybStps}
            render={renderCard}
          />
          <TierGroup
            label="YB Tier 3 — Complete Ride + Exit Test"
            sub="Coach the 11-stage integration · administer the YB Exit Test with integrity."
            items={ybIntegration}
            render={renderCard}
          />

          {/* ── BB Coach Course (L2 Practitioner · unlocks after YB) ── */}
          <TierGroup
            label="BB Tier 1 — Foundations + Belt Value"
            sub="L2 authorization · the Audit/Refinement stance · frameworks · Compromiso Consciente · Foundation Sequence."
            items={bbFoundations}
            render={renderCard}
          />
          <TierGroup
            label="BB Tier 2 — The 6 Sequences (15 STPs)"
            sub="Seq #8–#13. Each lesson: How to Teach · How to Correct · How to Validate · Coach Cue."
            items={bbSequences}
            render={renderCard}
          />
          <TierGroup
            label="BB Tier 3 — Concepts + Integration"
            sub="The 4 Blue Belt Concepts · coaching the complete Infinite Circle ride."
            items={bbConcepts}
            render={renderCard}
          />
          <TierGroup
            label="BB Tier 4 — Exit Test + Code of Conduct"
            sub="Administer the BB Exit Test (audit the self-evaluation) · 12-question quiz · code of conduct + appendices."
            items={bbExit}
            render={renderCard}
          />

          <TierGroup
            label="Master Manual — Canon Reference"
            sub="Single source of truth. 15 reference lessons (no prerequisites)."
            items={master}
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
}: {
  label: string;
  sub: string;
  items: any[];
  render: (c: any) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider mb-1 px-1" style={{ color: '#5AC3E7' }}>
        {label} ({items.length})
      </p>
      <p className="text-[11px] text-white/40 mb-2 px-1">{sub}</p>
      <div className="space-y-1.5">{items.map(render)}</div>
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
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Your Tools</p>
        <h2 className="text-lg font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Browse by sequence
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Pick a step to see its drills, missions and visual aids.
          {' '}Filtered by your certification (<strong>up to {coach.max_belt_permission?.replace(/_/g, ' ')}</strong>).
        </p>
      </div>

      {/* Problem-solving system — reference PDF */}
      <a
        href="/docs/sistema-resolver-problemas.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl border border-white/10 p-3.5 transition-colors hover:bg-white/[0.06]"
        style={{ background: '#0F1E33' }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: '#5AC3E7', color: '#0A1628' }}>
          <LifeBuoy size={20} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white">Protocolo de Problemas</span>
          <span className="block text-[11px] text-white/50">Guía de referencia — abrir PDF</span>
        </span>
      </a>

      {/* Report an incident */}
      <IncidentReporter token={coach.portal_token} students={students} boards={boards} />

      {/* Emergency plan (collapsible) */}
      <details className="rounded-2xl overflow-hidden border-l-[3px]" style={{ background: '#0F1E33', borderColor: '#E24B4A' }}>
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <span style={{ color: '#E24B4A' }}>🚨</span> Plan de emergencia
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: hasEmergency ? '#5AC3E7' : '#f09595' }}>{hasEmergency ? 'Ver' : 'No definido'}</span>
        </summary>
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          {hasEmergency ? (
            <>
              {emergencyPlan!.emergency_numbers && <EmRow label="Números" value={emergencyPlan!.emergency_numbers} />}
              {emergencyPlan!.nearest_hospital && <EmRow label="Hospital" value={emergencyPlan!.nearest_hospital} />}
              {emergencyPlan!.lifeguard_contact && <EmRow label="Salvavidas" value={emergencyPlan!.lifeguard_contact} />}
              {emergencyPlan!.emergency_address && <EmRow label="Ubicación" value={emergencyPlan!.emergency_address} />}
              {emergencyPlan!.emergency_protocol && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Protocolo</p>
                  <p className="text-sm text-white/80 whitespace-pre-line">{emergencyPlan!.emergency_protocol}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-white/50 italic">
              Tu academia aún no cargó el plan de emergencia. Pedile al coordinador que lo complete.
            </p>
          )}
        </div>
      </details>

      {/* Video Analyzer — draw on a student clip (client-only, lazy) */}
      <VideoAnalyzerLauncher variant="card" />

      {/* Board Selector — recommend board volume/type/fins (client-only, lazy) */}
      <BoardSelectorLauncher variant="card" />

      {sequences.map(([key, g]) => (
        <SequenceGroup key={key} group={g} token={coach.portal_token} />
      ))}

      {stps.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Waves size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No steps available yet.</p>
        </div>
      )}
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
        <div className="text-left">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
            {group.belt === 'yellow' ? 'Yellow Belt' : 'White Belt'}
          </p>
          <p className="text-sm font-bold text-[var(--tss-navy)]">{group.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-gray-400">{group.items.length} STPs</span>
          <ChevronDown size={14} className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="divide-y divide-gray-50">
          {group.items.map((s) => (
            <Link
              key={s.id}
              href={`/coach-portal/${token}/tools/${s.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-gray-400">{s.id}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>
              </div>
              <ArrowRight size={14} className="text-gray-400 shrink-0" />
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
  token,
}: {
  upcoming: any[];
  past: any[];
  token: string;
}) {
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [planData, setPlanData] = useState<ServicePlanData | null>(null);
  const [loading, setLoading] = useState(false);
  // 'read' = the polished day-by-day manual (CampPlanReader). 'run' =
  // the per-day SessionPlanner (live execution). Default to 'read' so
  // the coach lands on the full plan with support material first.
  const [planView, setPlanView] = useState<'read' | 'run'>('read');

  const openPlanner = async (campId: string, dayNumber?: number) => {
    setSelectedCampId(campId);
    setLoading(true);
    setPlanData(null);
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
