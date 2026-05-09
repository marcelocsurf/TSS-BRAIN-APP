'use client';

interface SelfTraining {
  id: string;
  date: string;
  drill_name: string | null;
  duration_minutes: number | null;
  execution_rating: number | null;
  mission_completion: string | null;
  intention_text: string | null;
  completed: boolean;
  linked_step_id: string | null;
}

interface StepRating {
  step_id: string;
  current_rating: number;
  last_updated: string;
}

interface LessonCompleted {
  lesson_id: string;
  lesson_title: string | null;
  course_section: string | null;
  completed_at: string | null;
  quiz_score: number | null;
}

interface Props {
  selfTraining: SelfTraining[];
  stepRatings: StepRating[];
  lessonsCompleted: LessonCompleted[];
}

export function PortalActivityPanel({ selfTraining, stepRatings, lessonsCompleted }: Props) {
  const completedSelf = selfTraining.filter((s) => s.completed);
  const totalSelfMinutes = completedSelf.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  const sortedRatings = [...stepRatings].sort((a, b) => a.current_rating - b.current_rating);
  const struggling = sortedRatings.filter((r) => r.current_rating < 3);

  const recentSelf = completedSelf.slice(0, 5);
  const recentLessons = lessonsCompleted.slice(0, 5);

  const isEmpty =
    selfTraining.length === 0 &&
    stepRatings.length === 0 &&
    lessonsCompleted.length === 0;

  if (isEmpty) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No portal activity yet — student hasn&apos;t logged self-training,
        sequence ratings, or completed lessons.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Self-trainings"
          value={completedSelf.length.toString()}
          sublabel={totalSelfMinutes > 0 ? `${totalSelfMinutes} min total` : undefined}
        />
        <Stat
          label="Lessons done"
          value={lessonsCompleted.length.toString()}
          sublabel={
            recentLessons[0]?.completed_at
              ? `Last: ${new Date(recentLessons[0].completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : undefined
          }
        />
        <Stat
          label="Self-ratings"
          value={stepRatings.length.toString()}
          sublabel={
            struggling.length > 0
              ? `${struggling.length} struggling`
              : stepRatings.length > 0
              ? 'all OK'
              : undefined
          }
          highlighted={struggling.length > 0}
        />
      </div>

      {/* Struggling steps — coach attention */}
      {struggling.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-red-600 uppercase mb-1.5">
            &#9888; Steps student is struggling with (rating &lt; 3)
          </p>
          <div className="space-y-1">
            {struggling.map((r) => (
              <div
                key={r.step_id}
                className="flex items-center justify-between bg-red-50 rounded px-3 py-1.5"
              >
                <span className="text-sm font-medium text-red-700">{r.step_id}</span>
                <div className="flex items-center gap-2">
                  <RatingStars rating={r.current_rating} />
                  <span className="text-[10px] text-red-500">
                    {new Date(r.last_updated).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent self-training */}
      {recentSelf.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">
            Recent self-training
          </p>
          <div className="space-y-1">
            {recentSelf.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border border-gray-100 rounded px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">
                    {s.drill_name || s.linked_step_id || 'Untitled drill'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(s.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {s.duration_minutes ? ` · ${s.duration_minutes}min` : ''}
                    {s.mission_completion ? ` · ${s.mission_completion}` : ''}
                  </p>
                  {s.intention_text && (
                    <p className="text-[10px] text-gray-500 italic mt-0.5 truncate">
                      &ldquo;{s.intention_text}&rdquo;
                    </p>
                  )}
                </div>
                {s.execution_rating != null && (
                  <div className="shrink-0 ml-2">
                    <RatingStars rating={s.execution_rating} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent lessons completed */}
      {recentLessons.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5">
            Recent lessons completed
          </p>
          <div className="space-y-1">
            {recentLessons.map((l) => (
              <div
                key={l.lesson_id}
                className="flex items-center justify-between border border-gray-100 rounded px-3 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">
                    {l.lesson_title || l.lesson_id}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {l.course_section ? `${l.course_section} · ` : ''}
                    {l.completed_at
                      ? new Date(l.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </p>
                </div>
                {l.quiz_score != null && (
                  <span className="text-[10px] text-gray-500 ml-2">
                    Quiz: {l.quiz_score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All ratings (collapsed) */}
      {sortedRatings.length > 0 && (
        <details className="border border-gray-100 rounded">
          <summary className="text-[10px] font-semibold text-gray-500 uppercase cursor-pointer px-3 py-2">
            All sequence self-ratings ({sortedRatings.length})
          </summary>
          <div className="px-3 pb-3 grid grid-cols-2 gap-1">
            {sortedRatings.map((r) => (
              <div
                key={r.step_id}
                className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"
              >
                <span className="text-xs text-gray-700">{r.step_id}</span>
                <RatingStars rating={r.current_rating} />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sublabel,
  highlighted,
}: {
  label: string;
  value: string;
  sublabel?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-2.5 text-center ${
        highlighted ? 'bg-red-50' : 'bg-gray-50'
      }`}
    >
      <p
        className={`text-lg font-bold ${
          highlighted ? 'text-red-600' : 'text-[var(--tss-navy)]'
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-gray-500 uppercase">{label}</p>
      {sublabel && (
        <p className="text-[9px] text-gray-400 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-xs">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rating ? 'text-amber-400' : 'text-gray-200'}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
}
