import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const TSS_CERTIFICATIONS = [
  // External prerequisites
  { key: 'lifeguard', name: 'Lifeguard Certification', category: 'external', color: '#E53E3E' },
  { key: 'isa_level_1', name: 'ISA Level 1', category: 'external', color: '#DD6B20' },
  { key: 'isa_level_2', name: 'ISA Level 2', category: 'external', color: '#D69E2E' },
  // TSS Internal
  { key: 'tss_level_1', name: 'TSS Foundation Coach', category: 'tss', color: '#2B6CB0', desc: 'White & Yellow Belt' },
  { key: 'tss_level_2', name: 'TSS Practitioner Coach', category: 'tss', color: '#2C7A7B', desc: 'Through Blue Belt' },
  { key: 'tss_level_3', name: 'TSS Advanced Coach', category: 'tss', color: '#6B46C1', desc: 'Through Brown Belt' },
  { key: 'tss_level_4', name: 'TSS Master Coach', category: 'tss', color: '#744210', desc: 'All Belt Levels' },
  { key: 'tss_level_5', name: 'TSS Coach Educator', category: 'tss', color: '#1A1A1A', desc: 'Formation Authority' },
];

const ROLE_LABELS: Record<string, string> = {
  holistic_coach: 'Holistic Coach',
  head_coach: 'Head Coach',
  senior_coach: 'Senior Coach',
  coach: 'Coach',
  assistant_coach: 'Assistant Coach',
  junior_coach: 'Junior Coach',
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
    .from('coach_stats')
    .select('*')
    .order('created_at', { ascending: true });

  const { data: certifications } = await supabase
    .from('coach_certifications')
    .select('*')
    .eq('is_active', true);

  const { data: latestEvals } = await supabase
    .from('coach_evaluations')
    .select('*')
    .order('created_at', { ascending: false });

  // Group certifications by coach
  const certsByCoach: Record<string, string[]> = {};
  certifications?.forEach(c => {
    if (!certsByCoach[c.coach_id]) certsByCoach[c.coach_id] = [];
    certsByCoach[c.coach_id].push(c.certification_key);
  });

  // Latest eval per coach
  const evalByCoach: Record<string, any> = {};
  latestEvals?.forEach(e => {
    if (!evalByCoach[e.coach_id]) evalByCoach[e.coach_id] = e;
  });

  const activeCoaches = coaches?.filter(c => c.active_status) || [];
  const totalSessions = coaches?.reduce((sum, c) => sum + (c.total_sessions || 0), 0) || 0;
  const avgRating = coaches && coaches.filter(c => c.avg_student_rating).length > 0
    ? (coaches.reduce((sum, c) => sum + (parseFloat(c.avg_student_rating) || 0), 0) / coaches.filter(c => c.avg_student_rating).length).toFixed(1)
    : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-mono tracking-widest text-[var(--tss-gold)] uppercase mb-1">TSS Brain · Director View</p>
          <h1 className="text-2xl font-bold text-[var(--tss-navy)]">Coach Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Certifications · Performance · Director Evaluations</p>
        </div>
        <Link
          href="/coaches/new"
          className="px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90"
        >
          + Add Coach
        </Link>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Coaches', value: activeCoaches.length },
          { label: 'Total Sessions', value: totalSessions },
          { label: 'Avg Student Rating', value: avgRating ? `${avgRating}/5` : '—' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-[var(--tss-navy)]">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coach Cards */}
      <div className="space-y-4">
        {coaches?.map(coach => {
          const coachCerts = certsByCoach[coach.id] || [];
          const latestEval = evalByCoach[coach.id];
          const beltColor = BELT_COLORS[coach.max_belt_permission] || '#999';

          return (
            <div key={coach.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Coach Header */}
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
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
                      <span className="text-xs text-gray-400">{ROLE_LABELS[coach.role] || coach.role}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">Max: {coach.max_belt_permission?.replace('_', ' ')}</span>
                      {!coach.active_status && (
                        <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/coaches/${coach.id}`}
                  className="text-xs text-gray-400 hover:text-[var(--tss-navy)] border border-gray-200 px-3 py-1.5 rounded-lg hover:border-[var(--tss-gold)]"
                >
                  View Profile →
                </Link>
              </div>

              {/* Stats Row */}
              <div className="px-5 py-3 border-b border-gray-50 grid grid-cols-4 gap-4">
                <Stat label="Sessions" value={coach.total_sessions || 0} />
                <Stat label="Students" value={coach.unique_students || 0} />
                <Stat label="Student Rating" value={coach.avg_student_rating ? `${coach.avg_student_rating}/5` : '—'} />
                <Stat label="Last Session" value={coach.last_session_date ? new Date(coach.last_session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} />
              </div>

              {/* Certifications */}
              <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {TSS_CERTIFICATIONS.map(cert => {
                    const hasIt = coachCerts.includes(cert.key);
                    return (
                      <span
                        key={cert.key}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${
                          hasIt
                            ? 'text-white border-transparent'
                            : 'text-gray-300 border-gray-100 bg-gray-50'
                        }`}
                        style={hasIt ? { backgroundColor: cert.color, borderColor: cert.color } : {}}
                        title={cert.desc || cert.name}
                      >
                        {hasIt ? '✓ ' : ''}{cert.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Latest Director Evaluation */}
              <div className="px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">Director Evaluation</p>
                  <Link
                    href={`/coaches/${coach.id}/evaluate`}
                    className="text-xs text-[var(--tss-gold)] hover:underline"
                  >
                    + New Evaluation
                  </Link>
                </div>
                {latestEval ? (
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'Technical', value: latestEval.technical_score },
                      { label: 'Methodology', value: latestEval.methodology_score },
                      { label: 'Communication', value: latestEval.communication_score },
                      { label: 'Consistency', value: latestEval.consistency_score },
                      { label: 'Overall', value: latestEval.overall_score },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <div className={`text-lg font-bold ${
                          s.value >= 8 ? 'text-green-600' :
                          s.value >= 6 ? 'text-[var(--tss-navy)]' :
                          s.value >= 4 ? 'text-amber-500' : 'text-red-500'
                        }`}>{s.value}<span className="text-xs text-gray-300">/10</span></div>
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 italic">No evaluation recorded yet.</p>
                )}
                {latestEval?.recommended_for_promotion && (
                  <div className="mt-2 bg-[var(--tss-gold)]/10 rounded-lg px-3 py-1.5">
                    <p className="text-xs font-medium text-[var(--tss-navy)]">⭐ Recommended for promotion</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[var(--tss-navy)]">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}
