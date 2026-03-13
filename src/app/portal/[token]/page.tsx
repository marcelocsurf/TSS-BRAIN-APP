import { createAdminClient } from '@/lib/supabase/admin';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { BRAND } from '@/lib/constants/brand';
import { notFound } from 'next/navigation';
import { SurveyForm } from './survey-form';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function StudentPortalPage({ params }: Props) {
  const { token } = await params;
  const admin = createAdminClient();

  // Get student by portal token
  const { data: student, error: studentErr } = await admin
    .from('students')
    .select('*')
    .eq('portal_token', token)
    .single();

  if (studentErr || !student) notFound();

  // Get latest session results
  const { data: results } = await admin
    .from('student_session_results')
    .select('*, standalone_sessions(*)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Check if latest result has a survey
  const latestResult = results?.[0];
  let hasSurvey = false;
  if (latestResult) {
    const { data: survey } = await admin
      .from('survey_responses')
      .select('id')
      .eq('session_result_id', latestResult.id)
      .single();
    hasSurvey = !!survey;
  }

  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)]">
      {/* Header */}
      <div style={{ background: BRAND.colors.navy }} className="px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">The Surf Sequence</h1>
        <p style={{ color: BRAND.colors.gold }} className="text-xs mt-1">{BRAND.tagline}</p>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Student card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: belt?.color || '#999' }}
            >
              {student.photo_url ? (
                <img src={student.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                `${student.first_name[0]}${student.last_name[0]}`
              )}
            </div>
            <div>
              <p className="font-semibold text-[var(--tss-navy)]">{student.first_name} {student.last_name}</p>
              <p className="text-xs text-gray-500">{belt?.en} — {belt?.levelName}</p>
              <p className="text-xs text-gray-400">Seq {student.current_sequence_number} / Step {student.current_step_order}</p>
            </div>
          </div>
        </div>

        {/* Current homework */}
        {student.last_homework && (
          <div className="bg-amber-50 border-l-3 border-[var(--tss-gold)] rounded-r-xl p-4"
               style={{ borderLeft: `3px solid ${BRAND.colors.gold}` }}>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Your Homework</p>
            <p className="text-sm text-amber-900 font-medium">{student.last_homework}</p>
          </div>
        )}

        {/* Next focus */}
        {student.next_recommended_focus && (
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Next Focus</p>
            <p className="text-sm text-blue-900">{student.next_recommended_focus}</p>
          </div>
        )}

        {/* Session history */}
        {results && results.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Recent Sessions</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {results.map((r: any) => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.standalone_sessions?.mission || 'Session'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}
                        <span className="capitalize">{r.status?.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Focus: {r.focus_rating}/5</p>
                    </div>
                  </div>
                  {r.coach_feedback && (
                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">{r.coach_feedback}</p>
                  )}
                  {r.homework && (
                    <p className="text-xs text-amber-700 mt-1">
                      <span className="font-medium">Homework:</span> {r.homework}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Survey form */}
        {latestResult && latestResult.survey_unlocked && !hasSurvey && (
          <SurveyForm resultId={latestResult.id} studentId={student.id} token={token} />
        )}

        {latestResult && hasSurvey && (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-700 font-medium">Thank you for your feedback!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-xs text-gray-400">The Surf Sequence® · {BRAND.tagline}</p>
      </div>
    </div>
  );
}
