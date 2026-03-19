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

  const { data: student, error: studentErr } = await admin
    .from('students')
    .select('*')
    .eq('portal_token', token)
    .single();

  if (studentErr || !student) notFound();

  const { data: results } = await admin
    .from('student_session_results')
    .select('*, standalone_sessions(*), coaches:coach_id(display_name)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const latestResult = results?.[0];

  // Check if latest session has a survey
  let hasSurvey = false;
  if (latestResult) {
    const { data: survey } = await admin
      .from('survey_responses')
      .select('id')
      .eq('session_result_id', latestResult.id)
      .single();
    hasSurvey = !!survey;
  }

  // Check if student has EVER completed a survey
  const { data: anySurvey } = await admin
    .from('survey_responses')
    .select('id')
    .eq('student_id', student.id)
    .limit(1)
    .maybeSingle();

  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];
  // Unlock if: latest session survey done OR any previous survey done
  const surveyCompleted = hasSurvey || !!anySurvey;

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
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ backgroundColor: belt?.color || '#999' }}
            >
              {student.photo_url ? (
                <img src={student.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                `${student.first_name[0]}${student.last_name?.[0] || ''}`
              )}
            </div>
            <div>
              <p className="font-semibold text-[var(--tss-navy)]">{student.first_name} {student.last_name}</p>
              <p className="text-xs text-gray-500">{belt?.en} — {belt?.levelName}</p>
              <p className="text-xs text-gray-400">Seq {student.current_sequence_number} / Step {student.current_step_order}</p>
            </div>
          </div>
        </div>

        {/* Always visible: Homework */}
        {student.last_homework && (
          <div className="bg-amber-50 rounded-xl p-4" style={{ borderLeft: `3px solid ${BRAND.colors.gold}` }}>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Your Homework</p>
            <p className="text-sm text-amber-900 font-medium">{student.last_homework}</p>
          </div>
        )}

        {/* Always visible: Next Focus */}
        {student.next_recommended_focus && (
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Next Focus</p>
            <p className="text-sm text-blue-900">{student.next_recommended_focus}</p>
          </div>
        )}

        {/* Latest session — basic info always visible */}
        {latestResult && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Latest Session</h3>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Mission</span>
                <span className="text-sm text-gray-700 text-right max-w-[65%]">
                  {(latestResult as any).standalone_sessions?.mission || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Date</span>
                <span className="text-sm text-gray-700">
                  {new Date(latestResult.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {/* Coach name */}
              {(latestResult as any).coaches?.display_name && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Coach</span>
                  <span className="text-sm text-gray-700 font-medium">
                    {(latestResult as any).coaches.display_name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                  latestResult.status === 'mastered' ? 'bg-green-50 text-green-700' :
                  latestResult.status === 'competent' ? 'bg-blue-50 text-blue-700' :
                  latestResult.status === 'partial' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {latestResult.status?.replace('_', ' ')}
                </span>
              </div>

              {/* LOCKED: Session summary — unlocked after survey */}
              {surveyCompleted ? (
                <>
                  {/* Student-visible summary (primary), fallback to coach_feedback for backward compat */}
                  {(latestResult.student_visible_summary || latestResult.coach_feedback) && (
                    <div className="pt-2 border-t border-gray-50">
                      <p className="text-xs text-gray-400 mb-1">Session Summary</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {latestResult.student_visible_summary || latestResult.coach_feedback}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-4 pt-1">
                    {latestResult.focus_rating && (
                      <div>
                        <span className="text-xs text-gray-400">Focus </span>
                        <span className="text-xs font-medium text-[var(--tss-navy)]">{latestResult.focus_rating}/5</span>
                      </div>
                    )}
                    {latestResult.frustration_rating && (
                      <div>
                        <span className="text-xs text-gray-400">Frustration </span>
                        <span className="text-xs font-medium text-[var(--tss-navy)]">{latestResult.frustration_rating}/10</span>
                      </div>
                    )}
                  </div>
                  {/* Video link — always shows when available */}
                  {(latestResult as any).video_link && (
                    <div className="pt-2 border-t border-gray-50">
                      <a
                        href={(latestResult as any).video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ background: BRAND.colors.navy }}
                      >
                        <span>▶</span>
                        <span>Watch Session Video</span>
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="pt-2 border-t border-gray-50">
                  <div className="bg-gray-50 rounded-lg px-3 py-3 text-center">
                    <p className="text-xs text-gray-500">Complete the feedback below to unlock your full coach report{(latestResult as any).video_link ? ' and session video' : ''}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Survey */}
        {latestResult && latestResult.survey_unlocked && !hasSurvey && (
          <SurveyForm resultId={latestResult.id} studentId={student.id} token={token} />
        )}

        {latestResult && hasSurvey && (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-700 font-medium">Feedback submitted — thank you!</p>
          </div>
        )}

        {/* Previous sessions — unlocked after survey */}
        {surveyCompleted && results && results.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Previous Sessions</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {results.slice(1).map((r: any) => (
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
                        {r.coaches?.display_name && ` · Coach: ${r.coaches.display_name}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">Focus: {r.focus_rating}/5</span>
                  </div>
                  {/* Show student_visible_summary if available, fallback to coach_feedback */}
                  {(r.student_visible_summary || r.coach_feedback) && (
                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2 whitespace-pre-line">
                      {r.student_visible_summary || r.coach_feedback}
                    </p>
                  )}
                  {r.video_link && (
                    <a
                      href={r.video_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--tss-navy)]"
                    >
                      Watch Video
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="text-center py-8">
        <p className="text-xs text-gray-400">The Surf Sequence -- {BRAND.tagline}</p>
      </div>
    </div>
  );
}
