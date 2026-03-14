import { getStudent } from '@/lib/actions/students';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import { InternalNotesCard } from './internal-notes';
import { IntakeStatusCard } from './intake-status';
import Link from 'next/link';
import { PhotoUpload } from './photo-upload';
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
  const isArchived = student.status === 'archived';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Archived banner */}
      {isArchived && (
        <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-gray-500 font-medium">This student is archived</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <PhotoUpload
          entityId={student.id}
          entityType="student"
          currentPhotoUrl={student.photo_url}
          displayName={`${student.first_name} ${student.last_name}`}
          avatarColor={belt?.color || '#999'}
        />
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
          {student.instagram && (
            <p className="text-xs text-[var(--tss-gold)]">@{student.instagram}</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Link
          href={`/students/${student.id}/edit`}
          className="flex-1 text-center py-2 border border-[var(--tss-navy)] text-[var(--tss-navy)] text-sm rounded-lg hover:bg-[var(--tss-navy)] hover:text-white transition-colors"
        >
          Edit
        </Link>
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

      {/* Intake status + link */}
      <IntakeStatusCard
        portalToken={student.portal_token}
        intakeCompletedAt={student.intake_completed_at}
      />

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
      {(student.goal_long_term || student.goal_mid_term || student.goal_short_term) && (
        <Card title="Goals">
          <Row label="Long Term (1-3 years)" value={student.goal_long_term} />
          <Row label="Mid Term (3-6 months)" value={student.goal_mid_term} />
          <Row label="Short Term (1 week - 1 month)" value={student.goal_short_term} />
          <Row label="Biggest Barrier" value={student.biggest_barrier} />
          <Row label="Fears / Phobias" value={student.fears_phobias} />
        </Card>
      )}

      {/* Progression */}
      <Card title="Progression">
        <Row label="Belt" value={`${belt?.en} — ${belt?.levelName}`} />
        <Row label="Sequence" value={`#${student.current_sequence_number}`} />
        <Row label="Step" value={`${student.current_step_order}`} />
        <Row label="Ocean Level" value={student.ocean_level} />
        <Row label="Primary Goal" value={student.primary_goal} />
      </Card>

      {/* Surf Profile */}
      {(student.surf_experience_years || student.surf_frequency || student.stance || student.board_type) && (
        <Card title="Surf Profile">
          <Row label="Stance" value={student.stance} />
          <Row label="Experience" value={student.surf_experience_years} />
          <Row label="Frequency" value={student.surf_frequency} />
          <Row label="Board Type" value={student.board_type} />
          <Row label="Other Sports" value={student.other_sports} />
          <Row label="Learning Style" value={student.learning_style} />
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

      {/* Contact & Personal */}
      <Card title="Contact & Personal">
        <Row label="Email" value={student.email} />
        <Row label="Phone" value={student.phone} />
        {student.date_of_birth && (
          <Row label="Date of Birth" value={new Date(student.date_of_birth).toLocaleDateString()} />
        )}
        <Row label="Age" value={student.age?.toString()} />
        <Row label="Nationality" value={student.nationality} />
        <Row label="Languages" value={student.languages} />
        <Row label="Instagram" value={student.instagram ? `@${student.instagram}` : null} />
        <Row label="Height" value={student.height} />
        <Row label="Weight" value={student.weight} />
        <Row label="Shirt Size" value={student.shirt_size} />
        <Row label="How did they hear about us" value={student.how_did_you_hear} />
        {student.returning_student && (
          <Row label="Returning Student" value="Yes" />
        )}
        {student.waiver_signed && (
          <Row label="Waiver Signed" value="Yes" />
        )}
      </Card>

      {/* Internal Coach Notes — client component, never visible to student */}
      <InternalNotesCard studentId={student.id} notes={student.coach_notes_general} />
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
