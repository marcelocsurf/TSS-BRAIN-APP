import { getStudent } from '@/lib/actions/students';
import { getStudentLevelAccess, grantLevelAccess, revokeLevelAccess } from '@/lib/actions/access';
import { createClient } from '@/lib/supabase/server';
import { BELT_DISPLAY, BELT_HIERARCHY, type BeltLevel } from '@/lib/constants/belts';
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

  // Load level access and session history in parallel
  const supabase = await createClient();
  const [levelAccess, sessionHistory] = await Promise.all([
    getStudentLevelAccess(id),
    supabase
      .from('student_session_results')
      .select(`
        id, status, focus_rating, frustration_rating,
        coach_feedback, homework, whats_next, created_at,
        standalone_sessions(mission, training_venue, session_date, pilar)
      `)
      .eq('student_id', id)
      .eq('completion_state', 'closed')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(r => r.data ?? []),
  ]);

  const belt = BELT_DISPLAY[student.belt_level];
  const unlockedKeys = new Set(levelAccess.map((a: any) => a.level_key));

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── HEADER ── */}
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
          <p className="text-sm text-gray-500">{belt?.en} — {belt?.levelName}</p>
          <p className="text-xs text-gray-400">Seq {student.current_sequence_number} / Step {student.current_step_order}</p>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="flex gap-2">
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

      {/* ── LEVEL ACCESS (Grant / Revoke) ── */}
      <Card title="Level Access">
        <div className="space-y-2">
          {BELT_HIERARCHY.map((beltKey) => {
            const display = BELT_DISPLAY[beltKey];
            const isUnlocked = unlockedKeys.has(beltKey);
            return (
              <div
                key={beltKey}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: display.color }}
                  />
                  <span className="text-sm text-gray-700">
                    {display.en}
                  </span>
                  <span className="text-xs text-gray-400">
                    {display.levelName}
                  </span>
                </div>
                <GrantButton
                  studentId={id}
                  levelKey={beltKey}
                  isUnlocked={isUnlocked}
                />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
          Unlocked levels appear in the student portal library.
        </p>
      </Card>

      {/* ── LAST SESSION ── */}
      <Card title="Last Session">
        {student.last_session_date ? (
          <div className="space-y-2">
            <Row label="Date" value={new Date(student.last_session_date).toLocaleDateString()} />
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

      {/* ── SESSION HISTORY ── */}
      {sessionHistory.length > 0 && (
        <Card title={`Session History (${sessionHistory.length})`}>
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
                          ? new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : new Date(result.created_at).toLocaleDateString()}
                        {session?.training_venue && ` · ${session.training_venue}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={result.status} />
                      <span className="text-xs text-gray-400">
                        Focus {result.focus_rating}/5
                      </span>
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
        </Card>
      )}

      {/* ── PROGRESSION ── */}
      <Card title="Progression">
        <Row label="Belt" value={`${belt?.en} — ${belt?.levelName}`} />
        <Row label="Sequence" value={`#${student.current_sequence_number}`} />
        <Row label="Step" value={`${student.current_step_order}`} />
        <Row label="Ocean Level" value={student.ocean_level} />
        <Row label="Goal" value={student.primary_goal} />
      </Card>

      {/* ── SAFETY ── */}
      <Card title="Safety & Medical">
        <Row label="Emergency Contact" value={student.emergency_contact_name} />
        <Row label="Emergency Phone" value={student.emergency_contact_phone} />
        <Row label="Swim Level" value={student.swim_level} />
        <Row label="Allergies" value={student.allergies} />
        <Row label="Injuries" value={student.injuries} />
        <Row label="Medical Notes" value={student.medical_notes} />
        <Row label="Risk Notes" value={student.risk_notes} />
      </Card>

      {/* ── CONTACT ── */}
      <Card title="Contact">
        <Row label="Email" value={student.email} />
        <Row label="Phone" value={student.phone} />
        <Row label="Age" value={student.age?.toString()} />
        <Row label="Gender" value={student.gender} />
        <Row label="Nationality" value={student.nationality} />
      </Card>

      {/* ── COACH NOTES ── */}
      {student.coach_notes_general && (
        <Card title="Coach Notes">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{student.coach_notes_general}</p>
        </Card>
      )}

    </div>
  );
}

// ── GRANT BUTTON (Client Component) ──
// Separate file would be cleaner but inline keeps the deploy simple
import { useState } from 'react'; // needs 'use client' — see GrantButton below

function GrantButton({
  studentId,
  levelKey,
  isUnlocked,
}: {
  studentId: string;
  levelKey: string;
  isUnlocked: boolean;
}) {
  // Server Actions work directly from Server Components in Next.js 14
  const grant = grantLevelAccess.bind(null, { student_id: studentId, level_key: levelKey });
  const revoke = revokeLevelAccess.bind(null, { student_id: studentId, level_key: levelKey });

  if (isUnlocked) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-600 font-medium">Unlocked</span>
        <form action={revoke}>
          <button
            type="submit"
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
          >
            Revoke
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={grant}>
      <button
        type="submit"
        className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        Grant
      </button>
    </form>
  );
}

// ── SHARED COMPONENTS ──

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
