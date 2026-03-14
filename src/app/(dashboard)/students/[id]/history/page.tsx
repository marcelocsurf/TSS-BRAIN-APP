import { createClient } from '@/lib/supabase/server';
import { getStudent } from '@/lib/actions/students';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VideoLinkEditor } from './video-link-editor';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentHistoryPage({ params }: Props) {
  const { id } = await params;

  let student;
  try {
    student = await getStudent(id);
  } catch {
    notFound();
  }

  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from('student_session_results')
    .select(`
      *,
      standalone_sessions (
        session_date,
        training_venue,
        ocean_conditions,
        mission,
        pilar,
        duration_minutes,
        session_type
      ),
      camp_sessions (
        session_date,
        day_number,
        camp_instances (
          camp_name
        )
      )
    `)
    .eq('student_id', id)
    .order('created_at', { ascending: false });

  const belt = BELT_DISPLAY[student.belt_level];

  const totalSessions = sessions?.length || 0;
  const mastered = sessions?.filter(s => s.status === 'mastered').length || 0;
  const avgFocus = sessions && sessions.filter(s => s.focus_rating).length > 0
    ? (sessions.reduce((sum, s) => sum + (s.focus_rating || 0), 0) / sessions.filter(s => s.focus_rating).length).toFixed(1)
    : '—';
  const avgFrustration = sessions && sessions.filter(s => s.frustration_rating).length > 0
    ? (sessions.reduce((sum, s) => sum + (s.frustration_rating || 0), 0) / sessions.filter(s => s.frustration_rating).length).toFixed(1)
    : '—';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/students/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </Link>
        <div>
          <h2 className="text-lg font-bold text-[var(--tss-navy)]">
            {student.first_name} {student.last_name}
          </h2>
          <p className="text-xs text-gray-400">{belt?.en} — Session History</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: totalSessions },
          { label: 'Mastered', value: mastered },
          { label: 'Avg Focus', value: avgFocus },
          { label: 'Avg Frustration', value: avgFrustration },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xl font-bold text-[var(--tss-navy)]">{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Session list */}
      {totalSessions === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm">No sessions recorded yet.</p>
          <Link
            href={`/sessions/new?student=${id}`}
            className="mt-3 inline-block px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg"
          >
            Start First Session
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions!.map((session) => {
            const ss = session.standalone_sessions as any;
            const cs = session.camp_sessions as any;
            const date = ss?.session_date || cs?.session_date;
            const mission = ss?.mission || '—';
            const venue = ss?.training_venue || (cs ? `Camp: ${cs.camp_instances?.camp_name} Day ${cs.day_number}` : '—');
            const pilar = ss?.pilar;
            const duration = ss?.duration_minutes;

            return (
              <div key={session.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Session header */}
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--tss-navy)]">
                      {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : new Date(session.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">{venue}{duration ? ` · ${duration} min` : ''}</p>
                  </div>
                  <StatusBadge status={session.status} />
                </div>

                {/* Session body */}
                <div className="px-4 py-3 space-y-2">
                  <Row label="Mission" value={mission} />
                  {pilar && <Row label="Pilar" value={PILAR_LABELS[pilar as Pilar]} />}
                  <div className="flex gap-4">
                    {session.focus_rating && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Focus</span>
                        <span className="text-xs font-medium text-[var(--tss-navy)]">{session.focus_rating}/5</span>
                      </div>
                    )}
                    {session.frustration_rating && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Frustration</span>
                        <span className="text-xs font-medium text-[var(--tss-navy)]">{session.frustration_rating}/10</span>
                      </div>
                    )}
                  </div>
                  {session.coach_feedback && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Feedback</p>
                      <p className="text-sm text-gray-700">{session.coach_feedback}</p>
                    </div>
                  )}
                  {(session as any).internal_notes && (
                    <div className="bg-red-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-500 font-medium mb-0.5">🔒 Internal Notes</p>
                      <p className="text-sm text-gray-700">{(session as any).internal_notes}</p>
                    </div>
                  )}
                  {session.homework && (
                    <div className="bg-amber-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-amber-600 font-medium mb-0.5">Homework</p>
                      <p className="text-sm text-amber-800">{session.homework}</p>
                    </div>
                  )}
                  {session.whats_next && (
                    <Row label="Next Focus" value={session.whats_next} highlight />
                  )}

                  {/* Video link editor */}
                  <VideoLinkEditor
                    sessionResultId={session.id}
                    currentLink={(session as any).video_link || ''}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: {
  label: string; value: string | null | undefined; highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-sm text-right ${highlight ? 'text-[var(--tss-navy)] font-medium' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    mastered: 'bg-green-50 text-green-700',
    competent: 'bg-blue-50 text-blue-700',
    partial: 'bg-amber-50 text-amber-700',
    not_yet: 'bg-gray-50 text-gray-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
