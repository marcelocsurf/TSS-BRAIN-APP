// ═══ La estrella EFECTIVA de un paso (Marcelo 2026-09-10) ═══
// Regla "Self-assessment maps, execution owns": la del coach manda; la
// autoevaluación sin ola vale como máximo 3★ para el camino y la propiedad
// de la secuencia — lo tenés en el agua o te lo confirma el coach.
export const ASSESSED_CAP = 3;

export type StarSource = 'executed' | 'assessed';

export function effectiveStars(i: { coach_rating?: number | null; rating?: number | null; self_source?: StarSource | null }): number | null {
  if (i.coach_rating != null) return i.coach_rating;
  if (i.rating == null) return null;
  return i.self_source === 'assessed' ? Math.min(i.rating, ASSESSED_CAP) : i.rating;
}

/** La estrella que sale de marcar indicadores: todos 4★ · alguno a medias 3★ · alguno no 2★. */
export function starsFromCriteria(results: ('met' | 'partial' | 'not_met')[]): number {
  if (!results.length) return 2;
  if (results.some((r) => r === 'not_met')) return 2;
  if (results.some((r) => r === 'partial')) return 3;
  return 4;
}
