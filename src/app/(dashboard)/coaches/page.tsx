import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach, isCoordinatorOrAbove, isRealPlatformAdmin } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ResendInviteButton } from './ResendInviteButton';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  coordinator: 'Coordinator',
  coach: 'Coach',
  assistant: 'Assistant',
};

const BELT_COLORS: Record<string, string> = {
  white_belt: '#E8E8E8',
  yellow_belt: '#F5C518',
  blue_belt: '#1E6FBF',
  purple_belt: '#7B4FBE',
  brown_belt: '#7D4E27',
  black_belt: '#111111',
};

export default async function CoachesPage() {
  const currentCoach = await getCurrentCoach();
  // Coordinators + admins can VIEW the team (profiles, scores, certs) for
  // oversight. Only the platform admin can CREATE coaches (canCreateCoach).
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) {
    redirect('/dashboard');
  }

  // Only platform admin (Marcelo) can create new coaches
  const canCreateCoach = await isRealPlatformAdmin();

  const supabase = await createClient();

  // Defense in depth: also filter by academy on the JS layer so we
  // never depend solely on RLS staying enabled. Mirrors what the
  // students + camps pages already do. Platform admin sees all.
  let query = supabase
    .from('coaches')
    .select('*')
    .order('role', { ascending: true })
    .order('display_name', { ascending: true });
  if (!currentCoach.is_platform_admin && currentCoach.academy_id) {
    query = query.eq('academy_id', currentCoach.academy_id);
  }
  const { data: coaches } = await query;

  const activeCoaches = coaches?.filter(c => c.active_status) || [];
  const inactiveCoaches = coaches?.filter(c => !c.active_status) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p
            className="text-[10px] tracking-[0.22em] text-[var(--tss-cyan,#5AC3E7)] uppercase mb-1 font-semibold"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            The Surf Sequence
          </p>
          <h1
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Team Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCoaches.length} active · {inactiveCoaches.length} inactive
          </p>
        </div>
        {canCreateCoach && (
          <Link
            href="/coaches/new"
            className="px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all shadow-sm"
          >
            + Add Coach
          </Link>
        )}
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(['admin', 'coordinator', 'coach', 'assistant'] as const).map(role => {
          const colors: Record<string, string> = {
            admin: 'var(--tss-danger)',
            coordinator: 'var(--tss-cyan, #5AC3E7)',
            coach: 'var(--tss-success)',
            assistant: 'var(--tss-gray-500)',
          };
          return (
            <div
              key={role}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center border-t-[3px]"
              style={{ borderTopColor: colors[role] }}
            >
              <p className="text-2xl font-bold text-[var(--tss-navy)]">
                {activeCoaches.filter(c => c.role === role).length}
              </p>
              <p
                className="text-[10px] uppercase tracking-wider text-gray-400 mt-1"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {ROLE_LABELS[role]}s
              </p>
            </div>
          );
        })}
      </div>

      {/* Coach Cards */}
      <div className="space-y-3">
        {activeCoaches.map(coach => {
          const beltColor = BELT_COLORS[coach.max_belt_permission] || '#999';
          // Onboarding status — drives the status pill + Resend button.
          //   • activated: password_set_at not null  → "Active"
          //   • invited  : auth_user_id present, no password_set_at  → "Invited"
          //   • no-auth  : auth_user_id null (legacy)  → "No auth"
          const activated = !!coach.password_set_at;
          const hasAuth = !!coach.auth_user_id;
          const onboarding: 'active' | 'invited' | 'no_auth' = activated
            ? 'active'
            : hasAuth
            ? 'invited'
            : 'no_auth';

          return (
            <Link
              key={coach.id}
              href={`/coaches/${coach.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow transition-all overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: beltColor,
                      color: coach.max_belt_permission === 'white_belt' ? '#333' : 'white'
                    }}
                  >
                    {coach.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coach.photo_url} alt="" className="w-10 h-10 object-cover" />
                    ) : (
                      <>{coach.first_name?.[0]}{coach.last_name?.[0]}</>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--tss-navy)]">{coach.display_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        coach.role === 'admin' ? 'bg-red-50 text-[var(--tss-danger)]' :
                        coach.role === 'coordinator' ? 'bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)]' :
                        coach.role === 'coach' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {ROLE_LABELS[coach.role] || coach.role}
                      </span>
                      {/* Onboarding status pill — only Admin sees the
                          "Resend" affordance via canCreateCoach. */}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                          onboarding === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : onboarding === 'invited'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        title={
                          onboarding === 'active'
                            ? 'Account activated · password set'
                            : onboarding === 'invited'
                            ? 'Invite sent · waiting for activation'
                            : 'No auth user — legacy record'
                        }
                      >
                        {onboarding === 'active' ? '● Active' : onboarding === 'invited' ? '○ Invited' : '· No auth'}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-500">Max: {coach.max_belt_permission?.replace('_', ' ')}</span>
                      {coach.certification_level && (
                        <>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-500">{coach.certification_level}</span>
                        </>
                      )}
                      {canCreateCoach && onboarding !== 'active' && coach.email && (
                        <>
                          <span className="text-gray-200">·</span>
                          <ResendInviteButton coachId={coach.id} coachEmail={coach.email} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={1.75} className="text-gray-300 shrink-0" />
              </div>
            </Link>
          );
        })}

        {inactiveCoaches.length > 0 && (
          <div className="pt-4">
            <p
              className="text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-3 font-semibold"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Inactive
            </p>
            {inactiveCoaches.map(coach => (
              <Link
                key={coach.id}
                href={`/coaches/${coach.id}`}
                className="block bg-white rounded-2xl border border-gray-100 opacity-50 hover:opacity-75 transition-opacity mb-2"
              >
                <div className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {coach.first_name?.[0]}{coach.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{coach.display_name}</p>
                    <p className="text-xs text-gray-400">{coach.email}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {coaches?.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500 text-sm">No coaches yet.</p>
          {canCreateCoach && (
            <Link href="/coaches/new" className="mt-3 inline-block px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm rounded-xl hover:brightness-110 transition-all">
              Add First Coach
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
