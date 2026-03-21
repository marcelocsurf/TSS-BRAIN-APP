import { getCampDetail, getCampEvaluations, getScheduledEvaluations } from '@/lib/actions/camps';
import { getCurrentCoach } from '@/lib/actions/auth';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { CampStudentManager } from '@/components/camp/CampStudentManager';
import { ScheduledEvaluationsPanel } from '@/components/camp/ScheduledEvaluationsPanel';
import { CampCompleteButton } from '@/components/camp/CampCompleteButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampDetailPage({ params }: Props) {
  const { id } = await params;
  let camp;
  let evaluations: any[] = [];
  let scheduledEvals: any[] = [];
  try {
    camp = await getCampDetail(id);
    evaluations = await getCampEvaluations(id);
    try {
      scheduledEvals = await getScheduledEvaluations(id);
    } catch { /* table may not exist yet */ }
  } catch { notFound(); }

  const { instance, participants, sessions } = camp;
  if (!instance) notFound();

  const coach = await getCurrentCoach();
  const headCoach = (instance as any).head_coach;
  const creatorCoach = (instance as any).coaches;
  const evaluatedCount = evaluations.length;
  const totalStudents = participants.length;
  const totalDays = sessions.length;

  // Check if all final evaluations are submitted for all students
  const allFinalEvalsDone = totalStudents > 0 && evaluatedCount >= totalStudents;
  const campNotCompleted = instance.status !== 'completed';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--tss-navy)]">{instance.camp_name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {(instance as any).camp_templates?.template_name}
            </p>
          </div>
          <CampStatusBadge status={instance.status} />
        </div>

        {/* Head Coach prominently */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Head Coach:</span>
          <span className="text-sm font-medium text-[var(--tss-navy)]">
            {headCoach?.display_name || creatorCoach?.display_name || 'Not assigned'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
          <span>{instance.start_date} &rarr; {instance.end_date}</span>
          <span className="capitalize">{instance.modality}</span>
          {creatorCoach?.display_name && headCoach?.display_name !== creatorCoach?.display_name && (
            <span>Created by: {creatorCoach.display_name}</span>
          )}
        </div>
      </div>

      {/* Final Evaluations CTA */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Final Evaluations</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {evaluatedCount} of {totalStudents} students evaluated
            </p>
          </div>
          <Link
            href={`/camps/${id}/evaluate`}
            className="px-4 py-2 bg-[var(--tss-navy)] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            {evaluatedCount === 0 ? 'Start Evaluations' : evaluatedCount < totalStudents ? 'Continue Evaluations' : 'View Evaluations'}
          </Link>
        </div>
        {totalStudents > 0 && (
          <div className="mt-2 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all"
              style={{ width: `${(evaluatedCount / totalStudents) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Scheduled Evaluations */}
      {coach && totalStudents > 0 && (
        <ScheduledEvaluationsPanel
          campInstanceId={id}
          coachId={coach.id}
          participants={participants.map((p: any) => ({
            students: {
              id: p.students?.id,
              first_name: p.students?.first_name,
              last_name: p.students?.last_name,
            },
          }))}
          scheduledEvals={scheduledEvals}
          totalDays={totalDays}
        />
      )}

      {/* Camp Completion */}
      {allFinalEvalsDone && campNotCompleted && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 space-y-3">
          <div className="text-center">
            <p className="text-sm font-medium text-green-700">
              All {totalStudents} students have been evaluated.
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Ready to mark this camp as completed.
            </p>
          </div>
          <CampCompleteButton campId={id} />
        </div>
      )}

      {instance.status === 'completed' && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm font-medium text-gray-600">This camp has been completed.</p>
        </div>
      )}

      {/* Participants with belt levels */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
            Enrolled Students ({participants.length})
          </h3>
        </div>

        {participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map((p: any) => {
              const belt = BELT_DISPLAY[p.students?.belt_level as BeltLevel];
              return (
                <Link
                  key={p.id}
                  href={`/students/${p.students?.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: belt?.color || '#999' }}
                  >
                    {p.students?.first_name?.[0]}{p.students?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {p.students?.first_name} {p.students?.last_name}
                    </p>
                    <p className="text-[10px] text-gray-400">{belt?.en} — {belt?.levelName}</p>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: belt?.color || '#999' }}
                  >
                    {belt?.en}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-3">No students enrolled</p>
        )}

        {/* Add/Remove students */}
        <CampStudentManager
          campInstanceId={id}
          currentParticipantIds={participants.map((p: any) => p.students?.id).filter(Boolean)}
        />
      </div>

      {/* Day schedule with session blocks */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Schedule</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {sessions.map((s: any) => {
            const isCompleted = s.session_status === 'completed';
            const isActive = s.session_status === 'active';
            return (
              <Link key={s.id} href={`/camps/${id}/day/${s.day_number}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted ? 'bg-green-100 text-green-700' :
                    isActive ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {s.day_number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Day {s.day_number}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {s.camp_template_days?.day_goal?.slice(0, 60)}
                    </p>
                    {s.camp_template_days?.evaluation_focus && (
                      <p className="text-[10px] text-purple-500 mt-0.5">
                        Focus: {s.camp_template_days.evaluation_focus.slice(0, 40)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    isCompleted ? 'bg-green-50 text-green-600' :
                    isActive ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {s.session_status}
                  </span>
                  {s.session_date && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.session_date}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CampStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    planned: 'bg-blue-50 text-blue-700',
    active: 'bg-green-50 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    draft: 'bg-gray-50 text-gray-500',
    cancelled: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-gray-50'}`}>
      {status}
    </span>
  );
}
