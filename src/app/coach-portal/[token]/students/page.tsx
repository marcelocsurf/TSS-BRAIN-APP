import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { listCoachStudents } from '@/lib/actions/coach-students';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CoachStudentsListPage({ params }: Props) {
  const { token } = await params;
  const students = await listCoachStudents(token);

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-20">
      <div className="bg-[var(--tss-navy)] text-white px-4 py-5">
        <Link
          href={`/coach-portal/${token}`}
          className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-2"
        >
          <ArrowLeft size={12} /> Back to portal
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users size={18} strokeWidth={1.75} />
          Your students
        </h1>
        <p className="text-xs text-white/60 mt-1">
          {students.length === 0
            ? 'No students assigned yet.'
            : `${students.length} student${students.length === 1 ? '' : 's'} you can plan sessions for.`}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
        {students.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Once a coordinator schedules you into a camp, your students will show up here.
          </p>
        ) : (
          students.map((s) => {
            const belt = BELT_DISPLAY[s.belt_level as BeltLevel];
            return (
              <Link
                key={s.id}
                href={`/coach-portal/${token}/students/${s.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: belt?.color || '#C8D0DC' }}
              >
                <div
                  className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: belt?.color || '#999' }}
                >
                  {s.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    `${s.first_name[0] ?? ''}${s.last_name?.[0] ?? ''}`.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">
                    {s.first_name} {s.last_name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {belt?.en} ·{' '}
                    {s.last_session_date
                      ? `Last session ${new Date(s.last_session_date).toLocaleDateString()}`
                      : 'No sessions yet'}
                  </p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  {s.has_safety_flag && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-semibold" title="Has medical / safety notes">
                      <AlertTriangle size={10} strokeWidth={2} />
                      Safety note
                    </span>
                  )}
                  {s.waiver_signed ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} strokeWidth={2} />
                      Waiver
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full">
                      <AlertTriangle size={10} strokeWidth={2} />
                      No waiver
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
