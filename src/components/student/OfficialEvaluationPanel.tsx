'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/sequence/StarRating';
import { setOfficialStepRating } from '@/lib/actions/evaluations';

// Coach-facing panel on /students/[id]. Lets the coach assign OFFICIAL
// stars (1-5) to any active STP for the student. Persisted in
// student_step_ratings.coach_rating; renders gold in the student portal.
// Loads steps via a tiny inline server action; saves are optimistic.

interface StepRow {
  step_id: string;
  step_title: string | null;
  student_self_rating: number | null;
  coach_rating: number | null;
  coach_rated_at: string | null;
}

interface Props {
  studentId: string;
  coachId: string;
  rows: StepRow[];
}

export function OfficialEvaluationPanel({ studentId, coachId, rows }: Props) {
  const router = useRouter();
  const [local, setLocal] = useState<StepRow[]>(rows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Re-sync if parent passes new rows after refresh
  useEffect(() => setLocal(rows), [rows]);

  const ratedCount = local.filter((r) => r.coach_rating !== null).length;

  const rate = (stepId: string, rating: number | null) => {
    setSavingId(stepId);
    setLocal((prev) =>
      prev.map((r) =>
        r.step_id === stepId
          ? {
              ...r,
              coach_rating: rating,
              coach_rated_at: rating !== null ? new Date().toISOString() : null,
            }
          : r
      )
    );
    startTransition(async () => {
      try {
        await setOfficialStepRating({ studentId, stepId, rating, coachId });
        router.refresh();
      } catch (e: any) {
        setError(e.message || 'Failed to save');
        // Rollback on error
        setLocal(rows);
      } finally {
        setSavingId(null);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500">
          You can re-rate any step at any time. The student sees your stars in gold.
        </p>
        <span className="text-[10px] font-mono text-gray-400">
          {ratedCount}/{local.length} rated
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {local.map((r) => (
          <div
            key={r.step_id}
            className="px-3 py-2.5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-gray-400">{r.step_id}</p>
              <p className="text-sm text-gray-800 truncate">
                {r.step_title || r.step_id}
              </p>
              {r.student_self_rating !== null && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Self-rating: {'★'.repeat(r.student_self_rating)}
                  {'☆'.repeat(5 - r.student_self_rating)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StarRating
                value={r.coach_rating}
                onChange={(n) => rate(r.step_id, n)}
                size="sm"
                variant="official"
              />
              {r.coach_rating !== null && (
                <button
                  type="button"
                  onClick={() => rate(r.step_id, null)}
                  disabled={savingId === r.step_id || pending}
                  className="text-[10px] text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Clear official rating"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {local.length === 0 && (
        <p className="text-sm text-gray-400 italic text-center py-4">
          No steps available for this student&apos;s belt yet.
        </p>
      )}
    </div>
  );
}
