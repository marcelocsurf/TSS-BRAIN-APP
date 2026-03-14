import { getStudent } from '@/lib/actions/students';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
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

  const belt = BELT_DISPLAY[student.belt_level];
  const hasLastSession = !!student.last_session_date;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
          style={{ backgroundColor: belt?.color || '#999' }}
        >
          {student.photo_url ? (
            <img src={student.photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            `${student.first_name[0]}${student.last_name?.[0] || ''}`
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--tss-navy)]">
            {student.first_name} {student.last_name}
          </h2>
          <p className="text-sm text-gray-500">
            {belt?.en} — {belt?.levelName}
          </p>
          <p className="text-xs text-gray-400">
            Sequence {student.current_sequence_number} / Step {student.current_step_order}
          </p>
          {(student as any).instagram && (
            <p className="text-xs text-[var(--tss-gold)]">@{(student as any).instagram}</p>
          )}
       {/* Quick actions */}
      <div className="flex gap-2">
        <Link
          href={`/sessions/new?student=${student.id}`}
          className="flex-1 text-center py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90"
        >
          Start Session
        </Link>
        <Link
          href={`/students/${student.id}/history`}
          className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:border-[var(--tss-gold)] hover:text-[var(--tss-navy)]"
        >
          History
        </Link>
        
     
        {!student.email && (
          <span className="px-3 py-2 bg-amber-50 text-amber-600 text-xs rounded-lg flex items-center">
            No email
          </span>
        )}
      </div>

      {/* Last Session Card */}
      <Card title="Last Session">
        {hasLastSession ? (
          <div className="space-y-2">
            <Row label="Date" value={new Date(student.last_session_date!).toLocaleDateString()} />
            <Row label="Mission" value={student.last_session_mission} />
            <Row label="Pilar" value={student.last_session_pilar ? PILAR_LABELS[student.last_session_pilar as Pilar] : '—'} />
            <Row label="Status" value={student.last_session_status} badge />
            <Row label="Homework" value={student.last_homework} highlight />
            <Row label="Next Focus" value={student.next_recommended_focus} highlight />
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">No sessions recorded yet</p>
        )}
      </Card>

      {/* Goals */}
      {((student as any).goal_long_term || (student as any).goal_mid_term || (student as any).goal_short_term) && (
        <Card title="Goals">
          <Row label="Long Term (1-3 years)" value={(student as any).goal_long_term} />
          <Row label="Mid Term (3-6 months)" value={(student as any).goal_mid_term} />
          <Row label="Short Term (1 week - 1 month)" value={(student as any).goal_short_term} />
          <Row label="Biggest Barrier" value={(student as any).biggest_barrier} />
          <Row label="Fears / Phobias" value={(student as any).fears_phobias} />
        </Card>
      )}

      {/* Progression */}
      <Card title="Progression">
        <Row label="Belt" value={`${belt?.en} — ${belt?.levelName}`} />
        <Row label="Sequence" value={`#${student.current_sequence_number}`} />
        <Row label="Step" value={`${student.current_step_order}`} />
        <Row label="Ocean Level" value={student.ocean_level} />
        <Row label="Primary Goal" value={student.primary_goal} />
        {(student as any).evaluation_score !== null && (student as any).evaluation_score !== undefined && (
          <Row label="Initial Eval Score" value={`${(student as any).evaluation_score} pts`} />
        )}
      </Card>

      {/* Surf Profile */}
      {((student as any).surf_experience_years || (student as any).surf_frequency || (student as any).stance || (student as any).board_type || (student as any).favorite_wave_size) && (
        <Card title="Surf Profile">
          <Row label="Stance" value={(student as any).stance} />
          <Row label="Experience" value={(student as any).surf_experience_years} />
          <Row label="Frequency" value={(student as any).surf_frequency} />
          <Row label="Board Type" value={(student as any).board_type} />
          <Row label="Favorite Wave Size" value={(student as any).favorite_wave_size} />
          <Row label="Other Sports" value={(student as any).other_sports} />
          <Row label="Learning Style" value={(student as any).learning_style} />
        </Card>
      )}

      {/* Safety */}
      <Card title="Safety & Medical">
        <Row label="Emergency Contact" value={student.emergency_contact_name} />
        <Row label="Emergency Phone" value={student.emergency_contact_phone} />
        <Row label="Swim Level" value={student.swim_level} />
        <Row label="Allergies" value={student.allergies} />
        <Row label="Injuries" value={student.injuries} />
        <Row label="Medical Notes" value={student.medical_notes} />
        <Row label="Risk Notes" value={student.risk_notes} />
      </Card>

      {/* Contact */}
      <Card title="Contact">
        <Row label="Email" value={student.email} />
        <Row label="Phone" value={student.phone} />
        {(student as any).date_of_birth && (
          <Row label="Date of Birth" value={new Date((student as any).date_of_birth).toLocaleDateString()} />
        )}
        <Row label="Age" value={student.age?.toString()} />
        <Row label="Nationality" value={student.nationality} />
        <Row label="Languages" value={(student as any).languages} />
        <Row label="Instagram" value={(student as any).instagram ? `@${(student as any).instagram}` : null} />
        <Row label="Height" value={(student as any).height} />
        <Row label="Weight" value={(student as any).weight} />
        <Row label="Shirt Size" value={(student as any).shirt_size} />
        <Row label="How did they hear about us" value={(student as any).how_did_you_hear} />
        {(student as any).returning_student && (
          <Row label="Returning Student" value="Yes" />
        )}
        {(student as any).waiver_signed && (
          <Row label="Waiver Signed" value="Yes" />
        )}
      </Card>

      {/* Coach Notes */}
      {student.coach_notes_general && (
        <Card title="Coach Notes">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{student.coach_notes_general}</p>
        </Card>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, badge, highlight }: {
  label: string; value: string | null | undefined; badge?: boolean; highlight?: boolean;
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
      {status?.replace('_', ' ')}
    </span>
  );
}
