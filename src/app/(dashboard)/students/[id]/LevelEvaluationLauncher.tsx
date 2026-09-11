'use client';
// ═══ Evaluación de nivel desde la ficha (Marcelo 2026-09-10) ═══
// El mismo componente del cierre de camp (FinalCampEvaluation) con un solo
// alumno y sin camp: nivel por secuencia, autonomía en el agua, foco y cinta.
import { useState } from 'react';
import { FinalCampEvaluation } from '@/components/coach-portal/FinalCampEvaluation';
import { closeStandaloneEvaluation } from '@/lib/actions/standalone-evaluation';
import { BELT_RANK, canCoachBelt, type BeltLevel } from '@/lib/constants/belts';

const ORDER: BeltLevel[] = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];

export function LevelEvaluationLauncher({ student, rows, coach }: {
  student: { id: string; first_name: string | null; last_name: string | null; photo_url: string | null; belt_level: string };
  rows: Array<{ step_id: string; step_title: string | null; course_section: string | null; step_number: number | null; sequence_id: string | null; sequence_name: string | null; sequence_order: number | null; sequence_step_order: number | null; coach_rating: number | null }>;
  coach: { id: string; role: string | null; max_belt_permission: string | null };
}) {
  const [open, setOpen] = useState(false);
  const cur = (student.belt_level as BeltLevel) in BELT_RANK ? (student.belt_level as BeltLevel) : 'white_belt';
  const target = ORDER[Math.min(ORDER.indexOf(cur) + 1, ORDER.length - 1)];
  const canAccredit = coach.role === 'admin' || canCoachBelt(((coach.max_belt_permission as BeltLevel) || 'black_belt'), target);
  const name = `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || 'Student';
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50/40 px-4 py-3 text-left hover:bg-cyan-50">
        <p className="text-sm font-semibold text-[var(--tss-navy)]">Level evaluation →</p>
        <p className="text-[11px] text-gray-500 mt-0.5">The same end-of-camp evaluation, without a camp: sequences with the official star, water autonomy, focus and belt ({target.replace('_belt', '')} if approved).</p>
      </button>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-2">
      <FinalCampEvaluation
        token=""
        campInstanceId=""
        campName="Level evaluation"
        students={[{ student_id: student.id, display_name: name, photo_url: student.photo_url, belt_level: student.belt_level, blocks: [], profile: {}, recentSessions: [], stepRatings: { selfRatedCount: 0, coachRatedCount: 0 } } as any]}
        stpCatalog={rows.map((r) => ({
          id: r.step_id, title: r.step_title ?? r.step_id, pillar: null, display_order: r.step_number ?? 0, course_section: r.course_section ?? '',
          step_number: r.step_number, wb_sequence_id: r.sequence_id, wb_sequence_name: r.sequence_name, wb_sequence_order: r.sequence_order, sequence_step_order: r.sequence_step_order,
        })) as any}
        initialRatings={{ [student.id]: Object.fromEntries(rows.filter((r) => r.coach_rating != null).map((r) => [r.step_id, r.coach_rating as number])) } as any}
        targetBelt={target}
        canAccreditTarget={canAccredit}
        onCancel={() => setOpen(false)}
        onCompleted={() => { setOpen(false); window.location.reload(); }}
        onStudentSaved={() => { setOpen(false); window.location.reload(); }}
        submitStandalone={(ratings, results, promotions) => closeStandaloneEvaluation(student.id, ratings, results, promotions)}
      />
    </div>
  );
}
