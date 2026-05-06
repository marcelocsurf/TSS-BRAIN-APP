import { createAdminClient } from '@/lib/supabase/admin';

interface Props {
  studentId: string;
  hasAccess: boolean;
}

export async function CourseProgressPanel({ studentId, hasAccess }: Props) {
  if (!hasAccess) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium">No course access</p>
        <p className="text-xs mt-1">
          This student has not been granted access to the TSS White Belt Masterclass.
          Generate a code in Course Codes and share it with them.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();

  // Get all lessons grouped by section
  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, course_section, display_order')
    .eq('active', true)
    .order('display_order', { ascending: true });

  // Get student's progress
  const { data: progress } = await admin
    .from('lesson_progress')
    .select('lesson_id, completed, quiz_score, completed_at, form_response')
    .eq('student_id', studentId);

  const progressMap = new Map<string, any>();
  (progress || []).forEach((p: any) => progressMap.set(p.lesson_id, p));

  // Group by section
  const sections: Record<string, any[]> = {
    pre_course_fundamentals: [],
    pre_course_values: [],
    white_belt: [],
  };

  for (const lesson of lessons || []) {
    if (sections[lesson.course_section]) {
      sections[lesson.course_section].push({
        ...lesson,
        progress: progressMap.get(lesson.id),
      });
    }
  }

  const sectionMeta: Record<string, { title: string; emoji: string }> = {
    pre_course_fundamentals: { title: 'Pre-Course · Fundamentals', emoji: '📖' },
    pre_course_values: { title: 'Pre-Course · Values', emoji: '✨' },
    white_belt: { title: 'White Belt · 24 Steps', emoji: '🤍' },
  };

  // Get student goal & stance from form responses
  const goalResp = progressMap.get('PC-002')?.form_response;
  const stanceResp = progressMap.get('PC-004')?.form_response;

  const totalCount = lessons?.length || 0;
  const completedCount = (progress || []).filter((p: any) => p.completed).length;
  const overallPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Overall progress */}
      <div className="bg-gradient-to-r from-[var(--tss-navy)] to-[#0f2747] text-white rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-wide opacity-80">Overall Progress</span>
          <span className="text-2xl font-bold">{overallPercent}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="h-full bg-[var(--tss-gold,#d4a017)] rounded-full transition-all"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <p className="text-xs opacity-70 mt-2">
          {completedCount} of {totalCount} lessons completed
        </p>
      </div>

      {/* Student goal & stance */}
      {(goalResp?.goal || stanceResp?.stance) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          {goalResp?.goal && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-amber-700 font-medium">
                Personal Goal (PC-002)
              </div>
              <p className="text-sm italic mt-1">"{goalResp.goal}"</p>
            </div>
          )}
          {stanceResp?.stance && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-amber-700 font-medium">
                Stance (PC-004)
              </div>
              <p className="text-sm font-bold mt-1 capitalize">{stanceResp.stance}</p>
            </div>
          )}
        </div>
      )}

      {/* Section breakdown */}
      {Object.entries(sections).map(([key, items]) => {
        if (items.length === 0) return null;
        const sectionDone = items.filter((i) => i.progress?.completed).length;
        const sectionPct = Math.round((sectionDone / items.length) * 100);
        const meta = sectionMeta[key];

        return (
          <div key={key} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 flex justify-between items-center text-xs">
              <span className="font-medium">{meta.emoji} {meta.title}</span>
              <span className="text-gray-500">
                {sectionDone}/{items.length} ({sectionPct}%)
              </span>
            </div>
            <div className="p-2 grid grid-cols-6 sm:grid-cols-8 gap-1">
              {items.map((item) => {
                const done = item.progress?.completed;
                const score = item.progress?.quiz_score;
                return (
                  <div
                    key={item.id}
                    title={`${item.id}: ${item.title}${score !== undefined ? ` (${score}%)` : ''}`}
                    className={`aspect-square rounded text-[9px] font-bold flex items-center justify-center cursor-help ${
                      done
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {item.id.split('-')[1]}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
