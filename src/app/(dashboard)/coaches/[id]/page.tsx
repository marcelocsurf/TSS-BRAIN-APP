import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from '@/lib/actions/sessions';
import {
  getCoachStats,
  getCoachRatingStats,
  getCoachStudentFeedback,
  getCoachTeachingResources,
  getCoachRecentSessions,
  getCoachServices,
} from '@/lib/actions/coach-dashboard';
import { CertificationManager } from './certification-manager';
import { ToggleCoachStatus } from './toggle-coach-status';
import { EditCoachForm } from './EditCoachForm';
import { PresentationGrants } from './PresentationGrants';
import { ToggleCourseAccess } from './toggle-course-access';
import { SetCoachPasswordCard } from './SetCoachPasswordCard';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { OpenAsButton } from '@/components/admin/OpenAsButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, ArrowLeft, ArrowRight, ExternalLink, Phone, Languages, ShieldAlert, HeartPulse, Briefcase, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  coordinator: 'Coordinator',
  coach: 'Coach',
  assistant: 'Assistant',
};

const CERT_LEVEL_LABELS: Record<string, string> = {
  tss_level_1: 'L1 Foundation',
  tss_level_2: 'L2 Practitioner',
  tss_level_3: 'L3 Advanced',
  tss_level_4: 'L4 Master',
  tss_level_5: 'L5 Educator',
};

function formatCertKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoachProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', id)
    .single();

  if (!coach) notFound();

  const { data: academies } = await supabase
    .from('academies')
    .select('id, name')
    .order('name');

  const { data: certifications } = await supabase
    .from('coach_certifications')
    .select('certification_key')
    .eq('coach_id', id)
    .eq('is_active', true);

  const { data: evaluations } = await supabase
    .from('coach_evaluations')
    .select('*')
    .eq('coach_id', id)
    .order('created_at', { ascending: false });

  let currentCoach: any;
  try {
    currentCoach = await getCurrentCoach();
  } catch {
    currentCoach = { id: '', display_name: 'Unknown', role: 'assistant' };
  }
  const currentCerts = certifications?.map(c => c.certification_key) || [];
  const currentUserIsAdmin = currentCoach?.role === 'admin';
  const isPlatformAdmin = await isRealPlatformAdmin();

  // Fetch dashboard data in parallel
  const [stats, ratingStats, feedback, resources, recentSessions, services] = await Promise.all([
    getCoachStats(id),
    getCoachRatingStats(id),
    getCoachStudentFeedback(id),
    getCoachTeachingResources(id),
    getCoachRecentSessions(id),
    getCoachServices(id),
  ]);

  // Per-dimension averages across all surveys — so the profile shows at a
  // glance where the coach is strong/weak, not just the overall number.
  const dimAvg = (() => {
    const pick = (key: 'feedback_clarity' | 'safety' | 'improvement_value' | 'recommend') => {
      const vals = feedback.map((f: any) => f[key]).filter((v: any) => v != null) as number[];
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };
    const recommendVals = feedback.map((f: any) => f.recommend).filter((v: any) => v != null) as number[];
    const recommendPct = recommendVals.length
      ? Math.round((recommendVals.filter((v) => v >= 4).length / recommendVals.length) * 100)
      : null;
    return {
      clarity: pick('feedback_clarity'),
      safety: pick('safety'),
      improvement: pick('improvement_value'),
      recommendPct,
    };
  })();

  // Onboarding completeness — show admin if the coach finished their ficha.
  const intakeDone = !!coach.intake_completed_at;

  // Emergency contact + medical info are sensitive — admin / coordinator only.
  const canSeePrivate =
    currentCoach?.role === 'admin' ||
    currentCoach?.role === 'coordinator' ||
    isPlatformAdmin;

  const initial = (coach.display_name || 'C').charAt(0).toUpperCase();
  const certLevelLabel = coach.certification_level
    ? CERT_LEVEL_LABELS[coach.certification_level] || coach.certification_level
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back Link */}
      <div className="flex items-center gap-3">
        <Link
          href="/coaches"
          className="text-gray-400 hover:text-gray-600 text-sm inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Coaches
        </Link>
      </div>

      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar — real photo if the coach uploaded one, else initials */}
            {coach.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coach.photo_url}
                alt={coach.display_name || 'Coach'}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[var(--tss-navy)] flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-[var(--tss-cyan,#5AC3E7)]">{initial}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest text-[var(--tss-cyan,#5AC3E7)] uppercase px-2 py-0.5 bg-[var(--tss-cyan,#5AC3E7)]/10 rounded">
                  {ROLE_LABELS[coach.role] || coach.role}
                </span>
                {certLevelLabel && (
                  <span className="text-[10px] font-mono tracking-widest text-[var(--tss-navy)] uppercase px-2 py-0.5 bg-[var(--tss-navy)]/10 rounded">
                    {certLevelLabel}
                  </span>
                )}
              </div>
              <h2
                className="text-xl font-bold text-[var(--tss-navy)] leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {coach.display_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">
                  Max Belt: {coach.max_belt_permission?.replace('_', ' ')}
                </span>
              </div>
              {coach.email && (
                <p className="text-xs text-gray-300 mt-1">{coach.email}</p>
              )}
              {coach.created_at && (
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Member since {new Date(coach.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(currentUserIsAdmin || isPlatformAdmin) && (
              <EditCoachForm coach={coach} academies={academies || []} />
            )}
            <ToggleCoachStatus
              coachId={id}
              isActive={coach.active_status}
              currentUserRole={currentCoach.role}
            />
            {(coach as any).role !== 'seller' && (
              <Link
                href={`/coaches/${id}/evaluate`}
                className="px-3 py-2 bg-[var(--tss-navy)] text-white text-xs rounded-lg hover:opacity-90"
              >
                + Evaluate
              </Link>
            )}
            {coach.portal_token && (
              <Link
                href={coach.portal_category === 'manager' ? `/manager-portal/${coach.portal_token}` : `/coach-portal/${coach.portal_token}`}
                target="_blank"
                className="px-3 py-2 bg-gray-50 text-[var(--tss-navy)] text-xs font-medium rounded-lg hover:bg-gray-100 inline-flex items-center gap-1"
                title="Open this person's personal portal in a new tab"
              >
                {coach.portal_category === 'manager' ? 'Open Manager Portal' : 'Open Coach Portal'}
                <ExternalLink size={11} strokeWidth={1.75} />
              </Link>
            )}
            {isPlatformAdmin && (
              <OpenAsButton kind="coach" coachId={id} />
            )}
          </div>
        </div>
        {coach.portal_token && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              {coach.portal_category === 'manager' ? 'Manager Portal Link' : 'Coach Portal Link'}
            </p>
            <code className="text-[10px] text-gray-600 break-all block bg-gray-50 px-2 py-1.5 rounded">
              {coach.portal_category === 'manager' ? '/manager-portal/' : '/coach-portal/'}{coach.portal_token}
            </code>
            <p className="text-[9px] text-gray-400 italic mt-1">
              {coach.portal_category === 'manager'
                ? 'Share with the manager — read-only academy overview (sales, services, incidents, inventory).'
                : 'Share with the coach so they can access their personal portal (courses + tools + their stats).'}
            </p>
          </div>
        )}

        {/* Course access toggle — only platform admin */}
        {isPlatformAdmin && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <ToggleCourseAccess
              coachId={id}
              currentAccess={!!coach.course_access_granted}
            />
          </div>
        )}
      </div>

      {/* STATS GRID — un vendedor se mide en ventas, no en sesiones (M158/#13) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {((coach as any).role === 'seller'
          ? await (async () => {
              const { createAdminClient } = await import('@/lib/supabase/admin');
              const adminC = createAdminClient();
              const monthStart = new Date().toISOString().slice(0, 7) + '-01';
              const { data: sales } = await adminC
                .from('camp_participants')
                .select('payment_status, enrollment_status, amount_cents, reserved_at')
                .eq('sold_by', coach.id);
              const rows = (sales ?? []).filter((r: any) => r.enrollment_status === 'active');
              const month = rows.filter((r: any) => (r.reserved_at ?? '') >= monthStart);
              const paid = rows.filter((r: any) => r.payment_status === 'paid');
              const conv = rows.length ? Math.round((100 * paid.length) / rows.length) : 0;
              const usd = paid.reduce((a: number, r: any) => a + (r.amount_cents || 0), 0);
              return [
                { label: 'Reservas del mes', value: month.length },
                { label: 'Confirmadas (total)', value: paid.length },
                { label: 'Conversión', value: `${conv}%` },
                { label: 'USD confirmado', value: `$${Math.round(usd / 100)}` },
              ];
            })()
          : [
          { label: 'Total Sessions', value: stats.total_sessions },
          { label: 'Total Hours', value: stats.total_hours },
          { label: 'Unique Students', value: stats.unique_students },
          { label: 'This Month', value: stats.sessions_this_month },
        ]).map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-[var(--tss-navy)]">{stat.value}</p>
            <p
              className="text-[10px] uppercase tracking-wider text-gray-400 mt-1"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ONBOARDING STATUS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        {intakeDone ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={13} strokeWidth={2} /> Profile complete
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <AlertTriangle size={13} strokeWidth={2} /> Profile pending
          </span>
        )}
        {coach.waiver_signed ? (
          <span className="text-[11px] text-gray-500">Waiver signed{coach.waiver_signed_at ? ` · ${String(coach.waiver_signed_at).slice(0, 10)}` : ''}</span>
        ) : (
          <span className="text-[11px] text-amber-700">Waiver not signed</span>
        )}
        {!intakeDone && coach.portal_token && (
          <Link
            href={`/coach-portal/${coach.portal_token}/profile`}
            target="_blank"
            className="ml-auto text-[11px] text-[var(--tss-navy)] hover:underline"
          >
            Open coach profile form →
          </Link>
        )}
      </div>

      {/* CONTACT + EMERGENCY */}
      {(coach.phone || coach.languages || coach.emergency_contact_name || coach.emergency_contact_phone) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">Contact</p>
            <div className="space-y-1.5 text-sm text-gray-700">
              {coach.phone && <p className="flex items-center gap-2"><Phone size={13} className="text-gray-400" /> {coach.phone}</p>}
              {coach.languages && <p className="flex items-center gap-2"><Languages size={13} className="text-gray-400" /> {coach.languages}</p>}
              {coach.email && <p className="flex items-center gap-2"><ExternalLink size={13} className="text-gray-400" /> {coach.email}</p>}
              {!coach.phone && !coach.languages && <p className="text-gray-400 italic text-xs">No contact info.</p>}
            </div>
          </div>
          {canSeePrivate && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1.5"><ShieldAlert size={12} /> Emergency contact</p>
              {coach.emergency_contact_name || coach.emergency_contact_phone ? (
                <div className="text-sm text-[var(--tss-navy)]">
                  <p className="font-semibold">{coach.emergency_contact_name || '—'}</p>
                  <p className="text-gray-700">{coach.emergency_contact_phone || '—'}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic text-xs">Not on file — ask the coach to complete their profile.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* MEDICAL / SAFETY — admin/coordinator only */}
      {canSeePrivate && (coach.allergies || coach.injuries || coach.medical_notes) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5"><HeartPulse size={12} /> Medical / Safety</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {coach.allergies && <div><p className="text-[10px] uppercase tracking-wider text-gray-400">Allergies</p><p className="text-gray-700">{coach.allergies}</p></div>}
            {coach.injuries && <div><p className="text-[10px] uppercase tracking-wider text-gray-400">Injuries</p><p className="text-gray-700">{coach.injuries}</p></div>}
            {coach.medical_notes && <div><p className="text-[10px] uppercase tracking-wider text-gray-400">Medical notes</p><p className="text-gray-700">{coach.medical_notes}</p></div>}
          </div>
        </div>
      )}

      {/* PROFESSIONAL BACKGROUND */}
      {(coach.years_coaching != null || coach.years_surfing != null || coach.specialty_area || coach.other_certifications || coach.bio_short) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5"><Briefcase size={12} /> Background</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {coach.years_coaching != null && <span className="text-[11px] bg-gray-50 px-2 py-1 rounded-full text-gray-700">{coach.years_coaching} yrs coaching</span>}
            {coach.years_surfing != null && <span className="text-[11px] bg-gray-50 px-2 py-1 rounded-full text-gray-700">{coach.years_surfing} yrs surfing</span>}
            {coach.specialty_area && <span className="text-[11px] bg-gray-50 px-2 py-1 rounded-full text-gray-700">{coach.specialty_area}</span>}
          </div>
          {coach.other_certifications && <p className="text-[12px] text-gray-600"><span className="text-gray-400">Other certifications:</span> {coach.other_certifications}</p>}
          {coach.bio_short && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{coach.bio_short}</p>}
        </div>
      )}

      {/* SERVICES LED */}
      {services.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[var(--tss-navy)] flex items-center gap-1.5"><Calendar size={14} /> Services led ({services.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {services.slice(0, 12).map((s) => (
              <Link key={s.id} href={`/camps/${s.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">{s.camp_name || s.template_name || 'Service'}</p>
                  <p className="text-[11px] text-gray-400">
                    {s.start_date ? String(s.start_date).slice(0, 10) : '—'}
                    {' · '}{s.participant_count} student{s.participant_count === 1 ? '' : 's'}
                    {' · '}{s.role === 'head_coach' ? 'Head coach' : 'Coach'}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 shrink-0">{s.status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* STAR RATING SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Student Ratings</h3>
        </div>
        <div className="px-5 py-4">
          {ratingStats.total_ratings > 0 ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Big number + stars */}
              <div className="flex flex-col items-center justify-center min-w-[120px]">
                <p className="text-4xl font-bold text-[var(--tss-navy)]">
                  {ratingStats.avg_rating.toFixed(1)}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={18}
                      strokeWidth={1.75}
                      className={
                        star <= Math.round(ratingStats.avg_rating)
                          ? 'fill-[var(--tss-cyan,#5AC3E7)] text-[var(--tss-cyan,#5AC3E7)]'
                          : 'text-gray-200'
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {ratingStats.total_ratings} review{ratingStats.total_ratings !== 1 ? 's' : ''}
                </p>
              </div>
              {/* Right: Distribution bars */}
              <div className="flex-1 space-y-1.5">
                {[
                  { stars: 5, count: ratingStats.five_star },
                  { stars: 4, count: ratingStats.four_star },
                  { stars: 3, count: ratingStats.three_star },
                  { stars: 2, count: ratingStats.two_star },
                  { stars: 1, count: ratingStats.one_star },
                ].map(row => {
                  const pct = ratingStats.total_ratings > 0
                    ? (row.count / ratingStats.total_ratings) * 100
                    : 0;
                  return (
                    <div key={row.stars} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8 text-right inline-flex items-center justify-end gap-0.5">
                        {row.stars}
                        <Star size={10} strokeWidth={2} className="fill-[var(--tss-cyan,#5AC3E7)] text-[var(--tss-cyan,#5AC3E7)]" />
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[var(--tss-cyan,#5AC3E7)] h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6">{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-300 italic text-center py-4">No ratings yet.</p>
          )}

          {/* Per-dimension averages — quick read of strengths/weaknesses */}
          {ratingStats.total_ratings > 0 && (dimAvg.safety != null || dimAvg.clarity != null || dimAvg.improvement != null || dimAvg.recommendPct != null) && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-gray-50 pt-4">
              {[
                { label: 'Safety in the water', value: dimAvg.safety != null ? `${dimAvg.safety.toFixed(1)}/5` : '—' },
                { label: 'Clarity', value: dimAvg.clarity != null ? `${dimAvg.clarity.toFixed(1)}/5` : '—' },
                { label: 'Learned / progressed', value: dimAvg.improvement != null ? `${dimAvg.improvement.toFixed(1)}/5` : '—' },
                { label: 'Would repeat', value: dimAvg.recommendPct != null ? `${dimAvg.recommendPct}%` : '—' },
              ].map((d) => (
                <div key={d.label} className="rounded-xl bg-gray-50 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold leading-none text-[var(--tss-navy)]">{d.value}</p>
                  <p className="mt-1.5 text-[9px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>{d.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STUDENT FEEDBACK SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Student Feedback</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {feedback.length > 0 ? (
            feedback.map((fb, idx) => (
              <div key={idx} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={12}
                          strokeWidth={1.75}
                          className={
                            star <= (fb.coach_rating || 0)
                              ? 'fill-[var(--tss-cyan,#5AC3E7)] text-[var(--tss-cyan,#5AC3E7)]'
                              : 'text-gray-200'
                          }
                        />
                      ))}
                    </div>
                    {fb.student_first_name && (
                      <span className="text-xs font-medium text-gray-600">
                        {fb.student_first_name}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-300">
                    {new Date(fb.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                  Coach overall · {fb.coach_rating || 0}/5
                </p>
                {/* What the student actually rated — context for the stars */}
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {fb.feedback_clarity != null && (
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">Clarity {fb.feedback_clarity}/5</span>
                  )}
                  {fb.safety != null && (
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">Safety {fb.safety}/5</span>
                  )}
                  {fb.improvement_value != null && (
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">Learned/improved {fb.improvement_value}/5</span>
                  )}
                  {fb.recommend != null && (
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">Would repeat {fb.recommend}/5</span>
                  )}
                  {fb.flow_channel != null && (
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                      Class felt: {['Bored', 'Easy', 'Optimal', 'Hard', 'Frustrating'][fb.flow_channel - 1] ?? fb.flow_channel}
                    </span>
                  )}
                </div>
                {fb.open_comment && (
                  <p className="text-xs text-gray-600 italic">“{fb.open_comment}”</p>
                )}
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-gray-300 italic">No feedback yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* TEACHING RESOURCES SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Teaching Resources</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Available based on certification level
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {resources.length > 0 ? (
            resources.map((res, idx) => (
              <div key={idx} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--tss-navy)]">{res.name}</p>
                  <p className="text-xs text-gray-400">{res.description}</p>
                </div>
                {res.url && res.url !== '#' ? (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--tss-cyan,#5AC3E7)] hover:underline flex-shrink-0"
                  >
                    <span className="inline-flex items-center gap-0.5">Open <ArrowRight size={11} strokeWidth={1.75} /></span>
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-300 flex-shrink-0">Coming soon</span>
                )}
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-gray-300 italic">No resources available.</p>
            </div>
          )}
        </div>
      </div>

      {/* CERTIFICATIONS SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Certifications</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {currentUserIsAdmin
              ? 'Only admin can grant or revoke certifications'
              : 'Active certifications for this coach'}
          </p>
        </div>
        <div className="px-5 py-4">
          {currentUserIsAdmin ? (
            <CertificationManager
              coachId={id}
              grantedBy={currentCoach.id}
              currentCerts={currentCerts}
            />
          ) : (
            <div>
              {currentCerts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentCerts.map(cert => (
                    <span
                      key={cert}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[var(--tss-navy)]/20 bg-[var(--tss-navy)]/5 text-sm text-[var(--tss-navy)] font-medium"
                    >
                      {formatCertKey(cert)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-300 italic text-center py-2">
                  No certifications yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EVALUATION HISTORY */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Director Evaluations</h3>
          <Link
            href={`/coaches/${id}/evaluate`}
            className="text-xs text-[var(--tss-cyan,#5AC3E7)] hover:underline"
          >
            + New
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {evaluations && evaluations.length > 0 ? (
            evaluations.map(ev => (
              <div key={ev.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400">
                    {new Date(ev.evaluation_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {ev.recommended_for_promotion && (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                      Promotion recommended
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[
                    { label: 'Technical', value: ev.technical_score },
                    { label: 'Methodology', value: ev.methodology_score },
                    { label: 'Communication', value: ev.communication_score },
                    { label: 'Consistency', value: ev.consistency_score },
                    { label: 'Overall', value: ev.overall_score },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p
                        className={`text-base font-bold ${
                          s.value >= 8
                            ? 'text-green-600'
                            : s.value >= 6
                              ? 'text-[var(--tss-navy)]'
                              : s.value >= 4
                                ? 'text-amber-500'
                                : 'text-red-500'
                        }`}
                      >
                        {s.value}
                        <span className="text-xs text-gray-300">/10</span>
                      </p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                {ev.strengths && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Strengths:</span> {ev.strengths}
                  </p>
                )}
                {ev.areas_to_improve && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Improve:</span> {ev.areas_to_improve}
                  </p>
                )}
                {ev.director_notes && (
                  <div className="bg-red-50 rounded-lg px-3 py-2 mt-2">
                    <p className="text-xs text-red-400 font-medium mb-0.5">Director Notes</p>
                    <p className="text-xs text-gray-700">{ev.director_notes}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-gray-300 italic">No evaluations yet.</p>
              <Link
                href={`/coaches/${id}/evaluate`}
                className="mt-2 inline-block text-xs text-[var(--tss-cyan,#5AC3E7)] hover:underline"
              >
                <span className="inline-flex items-center gap-0.5">Record first evaluation <ArrowRight size={11} strokeWidth={1.75} /></span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* RECENT SESSIONS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Recent Sessions</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {recentSessions.length > 0 ? (
            recentSessions.map(s => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700">
                      {s.student_name || 'Unknown Student'}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        s.source === 'cascade'
                          ? 'bg-blue-50 text-blue-500'
                          : s.source === 'camp'
                            ? 'bg-cyan-50 text-cyan-600'
                            : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {s.source === 'cascade' ? 'Cascade' : s.source === 'camp' ? 'Camp' : 'Standalone'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">
                      {new Date(s.session_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {s.pilar && (
                      <>
                        <span className="text-gray-200">&middot;</span>
                        <span className="text-xs text-gray-400">{s.pilar}</span>
                      </>
                    )}
                    {s.status && (
                      <>
                        <span className="text-gray-200">&middot;</span>
                        <span className="text-xs text-gray-400">{s.status}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-gray-300 italic">No sessions recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ ADMIN ACTIONS (utilities, kept at the bottom) ═══ */}

      {/* Admin: set a password manually when the email link won't work */}
      {isPlatformAdmin && <SetCoachPasswordCard coachId={id} />}

      {/* Admin: grant presentations that unlock in this coach's course */}
      {(currentUserIsAdmin || isPlatformAdmin) && <PresentationGrants coachId={id} />}
    </div>
  );
}
