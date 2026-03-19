import { getStudent } from '@/lib/actions/students';
import { getStudentLevelAccess } from '@/lib/actions/access';
import { createClient } from '@/lib/supabase/server';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import { LevelAccessCard } from '@/components/student/LevelAccessCard';
import { ProfilePhoto } from '@/components/shared/ProfilePhoto';
import { PhotoUploader } from '@/components/shared/PhotoUploader';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentProfilePage({ params }: Props) {
  const { id } = await params;

  let student;
  try {
    student = await getStudent(id);
  } catch {
    notFound();
  }

  const supabase = await createClient();
  const [levelAccess, sessionResult] = await Promise.all([
    getStudentLevelAccess(id),
    supabase
      .from('student_session_results')
      .select(`
        id, status, focus_rating,
        coach_feedback, homework, whats_next, created_at,
        standalone_sessions(mission, training_venue, session_date, pilar)
      `)
      .eq('student_id', id)
      .eq('completion_state', 'closed')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const sessionHistory = sessionResult.data ?? [];
  const unlockedKeys = levelAccess.map((a: any) => a.level_key);
  const belt = BELT_DISPLAY[student.belt_level];
  const fullName = `${student.first_name} ${student.last_name}`;

  const hasSafetyData = !!(student.allergies || student.injuries || student.medical_notes);

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ─── 1. HEADER (always visible) ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <ProfilePhoto
              photoUrl={student.photo_url}
              name={fullName}
              size="lg"
            />
            <PhotoUploader
              entityType="student"
              entityId={student.id}
              currentPhotoUrl={student.photo_url}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--tss-navy)]">
              {fullName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: belt?.color || '#999' }}
              >
                {belt?.en}
              </span>
              {student.waiver_signed ? (
                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                  Waiver &#10003;
                </span>
              ) : (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                  &#9888; No waiver
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Seq {student.current_sequence_number} / Step {student.current_step_order}
            </p>
          </div>
        </div>
        {/* Quick actions */}
        <div className="flex gap-2 mt-4">
          <Link
            href={`/sessions/new?student=${student.id}`}
            className="flex-1 text-center py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90"
          >
            Start Session
          </Link>
          <Link
            href={`/portal/${student.portal_token}`}
            target="_blank"
            className="px-3 py-2 bg-amber-50 text-amber-700 text-xs rounded-lg hover:bg-amber-100 transition-colors"
          >
            Open Portal
          </Link>
          {!student.email && (
            <span className="px-3 py-2 bg-red-50 text-red-500 text-xs rounded-lg flex items-center">
              No email
            </span>
          )}
        </div>
      </div>

      {/* ─── 2. LAST SESSION (always visible, highlighted) ─── */}
      <Card title="Last Session" highlighted>
        {student.last_session_date ? (
          <div className="space-y-2">
            <Row label="Date" value={new Date(student.last_session_date).toLocaleDateString()} />
            <Row label="Mission" value={student.last_session_mission} />
            <Row label="Pilar" value={student.last_session_pilar ? PILAR_LABELS[student.last_session_pilar as Pilar] : null} />
            <Row label="Status" value={student.last_session_status} badge />
            <Row label="Homework" value={student.last_homework} highlight />
            <Row label="Next Focus" value={student.next_recommended_focus} highlight />
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">No sessions recorded yet</p>
        )}
      </Card>

      {/* ─── 3. PROGRESSION (always visible) ─── */}
      <Card title="Progression">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-4 h-4 rounded-full inline-block"
              style={{ backgroundColor: belt?.color || '#999' }}
            />
            <span className="text-sm font-medium text-[var(--tss-navy)]">{belt?.en} — {belt?.levelName}</span>
          </div>
          <Row label="Sequence" value={`#${student.current_sequence_number}`} />
          <Row label="Step" value={`${student.current_step_order}`} />
          <Row label="Ocean Level" value={student.ocean_level} />
          <Row label="Progression Status" value={student.progression_status} />
        </div>
      </Card>

      {/* Level Access */}
      <LevelAccessCard studentId={id} unlockedKeys={unlockedKeys} />

      {/* ─── 4. SAFETY & MEDICAL (always visible, highlighted if data) ─── */}
      <Card title="Safety &amp; Medical" highlighted={hasSafetyData}>
        <div className="space-y-2">
          <Row label="Emergency Contact" value={student.emergency_contact_name} />
          <Row label="Emergency Phone" value={student.emergency_contact_phone} />
          {student.allergies && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-gray-500 shrink-0">Allergies</span>
              <span className="text-sm text-right text-red-600 font-medium">{student.allergies}</span>
            </div>
          )}
          {student.injuries && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-gray-500 shrink-0">Injuries</span>
              <span className="text-sm text-right text-amber-600 font-medium">{student.injuries}</span>
            </div>
          )}
          <Row label="Medical Notes" value={student.medical_notes} />
          <Row label="Swim Level" value={student.swim_level} />
          <Row label="Risk Notes" value={student.risk_notes} />
        </div>
      </Card>

      {/* ─── 5. WAIVER STATUS (visible) ─── */}
      <Card title="Waiver Status">
        {student.waiver_signed ? (
          <div className="flex items-center gap-2 py-1">
            <span className="text-green-600 text-lg">&#10003;</span>
            <div>
              <p className="text-sm font-medium text-green-700">Waiver signed</p>
              {student.waiver_signed_at && (
                <p className="text-xs text-gray-400">
                  Signed on {new Date(student.waiver_signed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 bg-red-50 rounded-lg px-3">
            <span className="text-red-500 text-lg">&#9888;</span>
            <div>
              <p className="text-sm font-medium text-red-600">Waiver required</p>
              <p className="text-xs text-red-400">Student has not signed the liability waiver</p>
            </div>
          </div>
        )}
      </Card>

      {/* ─── 6. SESSION HISTORY (collapsible, default closed) ─── */}
      <CollapsibleSection title={`Session History (${sessionHistory.length})`} defaultOpen={false}>
        {sessionHistory.length > 0 ? (
          <div className="space-y-3">
            {sessionHistory.map((result: any) => {
              const session = result.standalone_sessions;
              return (
                <div key={result.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {session?.mission || 'Session'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {session?.session_date
                          ? new Date(session.session_date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })
                          : new Date(result.created_at).toLocaleDateString()}
                        {session?.training_venue && ` \u00b7 ${session.training_venue}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={result.status} />
                      {session?.pilar && (
                        <span className="text-[10px] text-gray-400">
                          {PILAR_LABELS[session.pilar as Pilar] || session.pilar}
                        </span>
                      )}
                    </div>
                  </div>
                  {result.coach_feedback && (
                    <p className="text-xs text-gray-600 mt-1.5 bg-gray-50 rounded p-2 leading-relaxed">
                      {result.coach_feedback}
                    </p>
                  )}
                  {result.homework && (
                    <p className="text-xs text-amber-700 mt-1">
                      <span className="font-medium">HW:</span> {result.homework}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">No closed sessions yet</p>
        )}
      </CollapsibleSection>

      {/* ─── 7. PROFILE DETAILS (collapsible, default closed) ─── */}
      <CollapsibleSection title="Profile Details" defaultOpen={false}>
        <div className="space-y-2">
          <Row label="Email" value={student.email} />
          <Row label="Phone" value={student.phone} />
          <Row label="Age" value={student.age?.toString()} />
          <Row label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : null} />
          <Row label="Gender" value={student.gender} />
          <Row label="Nationality" value={student.nationality} />
          <Row label="Languages" value={student.languages} />
          <Row label="Instagram" value={student.instagram} />
          <Row label="Height" value={student.height} />
          <Row label="Weight" value={student.weight} />
          <div className="border-t border-gray-50 pt-2 mt-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Surf Profile</p>
            <Row label="Stance" value={student.stance} />
            <Row label="Experience" value={student.surf_experience_years} />
            <Row label="Frequency" value={student.surf_frequency} />
            <Row label="Board Type" value={student.board_type} />
            <Row label="Other Sports" value={student.other_sports} />
            <Row label="Learning Style" value={student.learning_style} />
          </div>
          <div className="border-t border-gray-50 pt-2 mt-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Goals</p>
            <Row label="Short Term" value={student.goal_short_term} />
            <Row label="Mid Term" value={student.goal_mid_term} />
            <Row label="Long Term" value={student.goal_long_term} />
            <Row label="Biggest Barrier" value={student.biggest_barrier} />
            <Row label="Fears" value={student.fears_phobias} />
          </div>
        </div>
      </CollapsibleSection>

      {/* ─── 8. COACH NOTES (collapsible) ─── */}
      <CollapsibleSection title="Coach Notes" defaultOpen={false}>
        <div className="space-y-3">
          {student.coach_notes_general ? (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Internal Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                {student.coach_notes_general}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No coach notes yet</p>
          )}
          {student.current_focus_area && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Current Focus Area</p>
              <p className="text-sm text-[var(--tss-navy)] font-medium">{student.current_focus_area}</p>
            </div>
          )}
          <Row label="Primary Goal" value={student.primary_goal} />
        </div>
      </CollapsibleSection>

    </div>
  );
}

function Card({ title, children, highlighted }: { title: string; children: React.ReactNode; highlighted?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${
      highlighted ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
    }`}>
      <div className={`px-4 py-3 border-b ${highlighted ? 'border-amber-100 bg-amber-50/30' : 'border-gray-50'}`}>
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, badge, highlight }: {
  label: string;
  value: string | null | undefined;
  badge?: boolean;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      {badge ? (
        <StatusBadge status={value} />
      ) : (
        <span className={`text-sm text-right ${highlight ? 'text-[var(--tss-navy)] font-medium' : 'text-gray-700'}`}>
          {value}
        </span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    mastered: 'bg-green-50 text-green-700',
    competent: 'bg-blue-50 text-blue-700',
    partial: 'bg-amber-50 text-amber-700',
    not_yet: 'bg-gray-50 text-gray-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
