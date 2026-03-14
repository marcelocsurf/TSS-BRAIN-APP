import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { CertificationManager } from './certification-manager';
import { ToggleCoachStatus } from './toggle-coach-status';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoachProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from('coach_stats')
    .select('*')
    .eq('id', id)
    .single();

  if (!coach) notFound();

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

  const { data: recentSessions } = await supabase
    .from('standalone_sessions')
    .select('id, session_date, mission, student_id')
    .eq('coach_id', id)
    .order('session_date', { ascending: false })
    .limit(5);

  const currentCoach = await getCurrentCoach();
  const currentCerts = certifications?.map(c => c.certification_key) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/coaches" className="text-gray-400 hover:text-gray-600 text-sm">← Coaches</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono tracking-widest text-[var(--tss-gold)] uppercase mb-1">{coach.role?.replace('_', ' ')}</p>
            <h2 className="text-xl font-bold text-[var(--tss-navy)]">{coach.display_name}</h2>
            <p className="text-sm text-gray-400">Max Belt: {coach.max_belt_permission?.replace('_', ' ')}</p>
          </div>
          <div className="flex gap-2">
            <ToggleCoachStatus
              coachId={id}
              isActive={coach.active_status}
              currentUserRole={currentCoach.role}
            />
            <Link
              href={`/coaches/${id}/evaluate`}
              className="px-3 py-2 bg-[var(--tss-navy)] text-white text-xs rounded-lg hover:opacity-90"
            >
              + Evaluate
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-50">
          {[
            { label: 'Sessions', value: coach.total_sessions || 0 },
            { label: 'Students', value: coach.unique_students || 0 },
            { label: 'Student Rating', value: coach.avg_student_rating ? `${coach.avg_student_rating}/5` : '—' },
            { label: 'Last Session', value: coach.last_session_date ? new Date(coach.last_session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-lg font-bold text-[var(--tss-navy)]">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Certifications</h3>
          <p className="text-xs text-gray-400 mt-0.5">Only you can grant or revoke certifications</p>
        </div>
        <div className="px-5 py-4">
          <CertificationManager
            coachId={id}
            grantedBy={currentCoach.id}
            currentCerts={currentCerts}
          />
        </div>
      </div>

      {/* Evaluation History */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Director Evaluations</h3>
          <Link href={`/coaches/${id}/evaluate`} className="text-xs text-[var(--tss-gold)] hover:underline">+ New</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {evaluations && evaluations.length > 0 ? evaluations.map(ev => (
            <div key={ev.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">{new Date(ev.evaluation_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                {ev.recommended_for_promotion && (
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">⭐ Promotion recommended</span>
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
                    <p className={`text-base font-bold ${
                      s.value >= 8 ? 'text-green-600' :
                      s.value >= 6 ? 'text-[var(--tss-navy)]' :
                      s.value >= 4 ? 'text-amber-500' : 'text-red-500'
                    }`}>{s.value}<span className="text-xs text-gray-300">/10</span></p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              {ev.strengths && <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Strengths:</span> {ev.strengths}</p>}
              {ev.areas_to_improve && <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Improve:</span> {ev.areas_to_improve}</p>}
              {ev.director_notes && (
                <div className="bg-red-50 rounded-lg px-3 py-2 mt-2">
                  <p className="text-xs text-red-400 font-medium mb-0.5">🔒 Director Notes</p>
                  <p className="text-xs text-gray-700">{ev.director_notes}</p>
                </div>
              )}
            </div>
          )) : (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-gray-300 italic">No evaluations yet.</p>
              <Link href={`/coaches/${id}/evaluate`} className="mt-2 inline-block text-xs text-[var(--tss-gold)] hover:underline">
                Record first evaluation →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Recent Sessions</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSessions.map(s => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">{s.mission}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <Link href={`/students/${s.student_id}`} className="text-xs text-gray-400 hover:text-[var(--tss-navy)]">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
