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
            `${student.first_name[0]}${student.last_name[0]}`
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
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Link
          href={`/sessions/new?student=${student.id}`}
          className="flex-1 text-center py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90"
        >
          Start Session
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

      {/* Progression */}
      <Card title="Progression">
        <Row label="Belt" value={`${belt?.en} — ${belt?.levelName}`} />
        <Row label="Sequence" value={`#${student.current_sequence_number}`} />
        <Row label="Step" value={`${student.current_step_order}`} />
        <Row label="Ocean Level" value={student.ocean_level} />
        <Row label="Goal" value={student.primary_goal} />
      </Card>

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
        <Row label="Age" value={student.age?.toString()} />
        <Row label="Gender" value={student.gender} />
        <Row label="Nationality" value={student.nationality} />
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
