'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setOfficialStepRating } from '@/lib/actions/evaluations';
import { SequenceEvaluation } from '@/components/evaluation/SequenceEvaluation';
import { closeStudentEvaluation } from '@/lib/actions/student-evaluation';

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
  // Cada evaluación tiene que dejar el "qué trabajar después". Acá no había
  // ningún cierre: el coach ponía estrellas y se iba, sin que quedara una
  // palabra. Es lo que el alumno ve y con lo que el próximo coach planea.
  const [focus, setFocus] = useState('');
  const [visibleNote, setVisibleNote] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);

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

      {/* La MISMA evaluación que al cerrar un camp. Esta es la otra puerta:
          se corre en cualquier momento, sobre todos los requisitos de la cinta
          en la que está el alumno. */}
      <SequenceEvaluation
        rows={local.map((r) => ({
          step_id: r.step_id,
          step_title: r.step_title,
          course_section: r.course_section,
          step_number: r.step_number,
          sequence_id: r.sequence_id,
          sequence_name: r.sequence_name,
          sequence_order: r.sequence_order,
          sequence_step_order: r.sequence_step_order,
        }))}
        ratings={Object.fromEntries(local.map((r) => [r.step_id, r.coach_rating]))}
        onRate={(changes) => changes.forEach((c) => rate(c.stepId, c.stars))}
        studentId={studentId}
        onFocusSaved={(_stepId, f) => { if (f) setFocus(f); }}
      />

      {/* Cerrar la evaluación. Lo mismo que se pide al cerrar un camp: un
          comentario obligatorio y dos opcionales. */}
      <div className="rounded-xl border border-gray-200 p-3.5 space-y-2.5" style={{ background: '#FBF2DF' }}>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-800">
            🎯 Qué trabajar después · obligatorio
          </label>
          <p className="text-[11px] text-gray-500 mb-1">El alumno lo ve en su portal, y el próximo coach planea con eso.</p>
          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            rows={2}
            placeholder="Una línea concreta — p. ej. Bottom turn frontside: sostener el hold antes de proyectar."
            className="w-full px-2.5 py-2 border border-amber-200 rounded-lg text-[13px] bg-white"
          />
        </div>
        <details>
          <summary className="text-[11px] text-gray-500 cursor-pointer">+ Notas opcionales</summary>
          <div className="mt-2 space-y-2">
            <textarea
              value={visibleNote}
              onChange={(e) => setVisibleNote(e.target.value)}
              rows={2}
              placeholder="Nota para el alumno (la ve en su portal)"
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
            />
            <textarea
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              rows={2}
              placeholder="Nota interna del coach (el alumno NO la ve)"
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
            />
          </div>
        </details>
        <button
          type="button"
          disabled={closing || focus.trim().length < 5}
          onClick={() => {
            setClosing(true);
            setError('');
            closeStudentEvaluation({
              studentId,
              coachId,
              nextFocus: focus,
              studentVisibleNote: visibleNote,
              coachPrivateNote: privateNote,
              readinessSummary: `${ratedCount}/${local.length} pasos evaluados`,
            })
              .then((r) => {
                if (r.ok) { setClosed(true); router.refresh(); }
                else setError(r.error);
              })
              .finally(() => setClosing(false));
          }}
          className="w-full h-10 rounded-lg text-[13px] font-bold text-white disabled:opacity-50"
          style={{ background: '#0B2030' }}
        >
          {closed ? '✓ Evaluación guardada' : closing ? 'Guardando…' : 'Cerrar evaluación'}
        </button>
      </div>

      {local.length === 0 && (
        <p className="text-sm text-gray-400 italic text-center py-4">
          No steps available for this student&apos;s belt yet.
        </p>
      )}
    </div>
  );
}
