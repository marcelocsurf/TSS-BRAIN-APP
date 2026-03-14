import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

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
  const supabase = await createClient();

  const { data: coaches } = await supabase
    .from('coaches')
    .select('*')
    .order('role', { ascending: true })
    .order('display_name', { ascending: true });

  const activeCoaches = coaches?.filter(c => c.active_status) || [];
  const inactiveCoaches = coaches?.filter(c => !c.active_status) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-mono tracking-widest text-[var(--tss-gold)] uppercase mb-1">TSS Brain · Admin</p>
          <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Team Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">{activeCoaches.length} active · {inactiveCoaches.length} inactive</p>
        </div>
        <Link
          href="/coaches/new"
          className="px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90"
        >
          + Add Coach
        </Link>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(['admin', 'coordinator', 'coach', 'assistant'] as const).map(role => (
          <div key={role} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-[var(--tss-navy)]">
              {activeCoaches.filter(c => c.role === role).length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[role]}s</p>
          </div>
        ))}
      </div>

      {/* Coach Cards */}
      <div className="space-y-3">
        {activeCoaches.map(coach => {
          const beltColor = BELT_COLORS[coach.max_belt_permission] || '#999';

          return (
            <Link
              key={coach.id}
              href={`/coaches/${coach.id}`}
              className="block bg-white rounded-xl border border-gray-100 hover:border-[var(--tss-gold)] transition-colors overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      backgroundColor: beltColor,
                      color: coach.max_belt_permission === 'white_belt' ? '#333' : 'white'
                    }}
                  >
                    {coach.first_name?.[0]}{coach.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--tss-navy)]">{coach.display_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        coach.role === 'admin' ? 'bg-red-50 text-red-600' :
                        coach.role === 'coordinator' ? 'bg-amber-50 text-amber-600' :
                        coach.role === 'coach' ? 'bg-green-50 text-green-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {ROLE_LABELS[coach.role] || coach.role}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">Max: {coach.max_belt_permission?.replace('_', ' ')}</span>
                      {coach.certification_level && (
                        <>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-400">{coach.certification_level}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-300">→</span>
              </div>
            </Link>
          );
        })}

        {inactiveCoaches.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-mono tracking-widest text-gray-300 uppercase mb-3">Inactive</p>
            {inactiveCoaches.map(coach => (
              <Link
                key={coach.id}
                href={`/coaches/${coach.id}`}
                className="block bg-white rounded-xl border border-gray-100 opacity-50 hover:opacity-75 transition-opacity mb-2"
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
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No coaches yet.</p>
          <Link href="/coaches/new" className="mt-3 inline-block px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg">
            Add First Coach
          </Link>
        </div>
      )}
    </div>
  );
}
