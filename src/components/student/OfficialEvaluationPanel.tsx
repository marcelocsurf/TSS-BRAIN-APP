'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/sequence/StarRating';
import { setOfficialStepRating } from '@/lib/actions/evaluations';
import {
  COURSE_SEQUENCE_ORDER,
  SEQUENCE_PASS_STARS,
  stepKey,
} from '@/lib/constants/learning-blocks';

// Coach-facing panel on /students/[id]. Lets the coach assign OFFICIAL
// stars (1-5) to any active STP for the student. Persisted in
// student_step_ratings.coach_rating; renders gold in the student portal.
// Loads steps via a tiny inline server action; saves are optimistic.

interface StepRow {
  step_id: string;
  step_title: string | null;
  course_section?: string | null;
  step_number?: number | null;
  sequence_id?: string | null;
  sequence_name?: string | null;
  sequence_order?: number | null;
  sequence_step_order?: number | null;
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

  // La misma lectura que ve el alumno: la secuencia vale lo que vale su paso
  // más flojo (canon: 4★ en cada parte). Antes esto era una lista plana de 25
  // pasos de White; un alumno de Blue tiene 55 y el coach no veía el resto.
  const byKey = new Map(
    local
      .filter((r) => r.course_section && r.step_number != null)
      .map((r) => [stepKey(r.course_section!, r.step_number!), r])
  );
  const byId = new Map(local.map((r) => [r.step_id, r]));
  const seqIds: string[] = [];
  for (const r of local) {
    if (r.sequence_id && !seqIds.includes(r.sequence_id)) seqIds.push(r.sequence_id);
  }
  const groups = seqIds
    .map((sid) => {
      const meta = local.find((r) => r.sequence_id === sid)!;
      const order = COURSE_SEQUENCE_ORDER[sid];
      const rows = order
        ? order.map((k) => byKey.get(k)).filter((r): r is StepRow => Boolean(r))
        : local
            .filter((r) => r.sequence_id === sid)
            .sort(
              (a, b) =>
                (a.sequence_step_order ?? a.step_number ?? 0) -
                (b.sequence_step_order ?? b.step_number ?? 0)
            );
      const vals = rows
        .map((r) => r.coach_rating)
        .filter((v): v is number => v !== null);
      const min = vals.length ? Math.min(...vals) : null;
      // El freno es el paso más TEMPRANO de la cadena que no llega a la barra,
      // no el de menos estrellas: si la postura está floja, lo que viene
      // después lo está por consecuencia.
      const weakest =
        rows.find(
          (r) => r.coach_rating !== null && r.coach_rating < SEQUENCE_PASS_STARS
        ) ?? null;
      return {
        id: sid,
        name: meta.sequence_name ?? sid,
        order: meta.sequence_order ?? 99,
        rows,
        min,
        rated: vals.length,
        weakest,
        complete: vals.length === rows.length,
      };
    })
    .filter((g) => g.rows.length > 0)
    .sort((a, b) => a.order - b.order);
  const orphans = local.filter((r) => !r.sequence_id);

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

      {groups.map((g) => (
        <div key={g.id} className="space-y-1.5">
          <div className="flex items-baseline gap-2 px-1">
            <p className="text-[12px] font-semibold text-gray-900">
              {g.order >= 1 && g.order <= 13 ? `Sequence #${g.order}: ` : ''}
              {g.name}
            </p>
            <span className="ml-auto text-[10px] font-mono shrink-0">
              {g.min === null ? (
                <span className="text-gray-400">{g.rated}/{g.rows.length} rated</span>
              ) : g.complete && g.min >= SEQUENCE_PASS_STARS ? (
                <span className="text-emerald-600 font-bold">✓ owned</span>
              ) : (
                <span className="text-amber-700">
                  {g.min}★{g.weakest ? ` · empezar por ${g.weakest.step_title ?? g.weakest.step_id}` : ''}
                  {!g.complete && ` · ${g.rated}/${g.rows.length}`}
                </span>
              )}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {g.rows.map((r) => (
              <StepRowLine
                key={`${g.id}:${r.step_id}`}
                r={r}
                weak={g.weakest?.step_id === r.step_id && (g.min ?? 5) < SEQUENCE_PASS_STARS}
                onRate={rate}
                savingId={savingId}
                pending={pending}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {orphans.map((r) => (
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

/** Una fila calificable. Se extrajo para poder reusarla dentro de cada
 *  secuencia y en los pasos que no pertenecen a ninguna. */
function StepRowLine({
  r,
  weak,
  onRate,
  savingId,
  pending,
}: {
  r: StepRow;
  /** El paso que frena su secuencia: se marca para que el coach lo vea. */
  weak?: boolean;
  onRate: (stepId: string, rating: number | null) => void;
  savingId: string | null;
  pending: boolean;
}) {
  return (
    <div
      className="px-3 py-2.5 flex items-center justify-between gap-3"
      style={weak ? { background: '#FFFBF0', boxShadow: 'inset 3px 0 0 #E0A62B' } : undefined}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono text-gray-400">{r.step_id}</p>
        <p className="text-sm text-gray-800 truncate">{r.step_title || r.step_id}</p>
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
          onChange={(n) => onRate(r.step_id, n)}
          size="sm"
          variant="official"
        />
        {r.coach_rating !== null && (
          <button
            type="button"
            onClick={() => onRate(r.step_id, null)}
            disabled={savingId === r.step_id || pending}
            className="text-[10px] text-gray-400 hover:text-red-600 disabled:opacity-50"
            title="Clear official rating"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
