// ═══ Evaluación por detalle — helpers puros (sin 'use server') ═══
// Cada práctica ligada guarda criteria_evaluation: un resultado por criterio
// de éxito de la tarjeta. Este módulo elige el "detalle más flojo" con la
// misma doctrina que el paso más flojo de una secuencia: se arregla el
// PRIMER eslabón que falla (orden de la tarjeta), no el de peor nota.

export type CriterionResultValue = 'met' | 'partial' | 'not_met';
export type CriterionEvaluationItem = {
  criterion_index: number;
  criterion_text: string;
  result: CriterionResultValue;
};

export function pickWeakestCriterion(
  evals: CriterionEvaluationItem[] | null | undefined
): CriterionEvaluationItem | null {
  if (!Array.isArray(evals) || evals.length === 0) return null;
  const sorted = [...evals]
    .filter((c) => c && typeof c.criterion_text === 'string')
    .sort((a, b) => a.criterion_index - b.criterion_index);
  // El PRIMER eslabón que no se logró (partial o not_met), en orden de tarjeta.
  return sorted.find((c) => c.result !== 'met') ?? null;
}

/** Palabra del alumno para el resultado derivado (yes/partial/no). */
export const COMPLETION_LABEL_EN: Record<string, string> = { yes: 'Done', partial: 'Almost', no: 'Not yet' };
