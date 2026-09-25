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

/** La nota propia que vale: una AUTOEVALUACIÓN sin ola nunca pasa de 3★
 *  (ASSESSED_CAP) — solo la ejecutada puede llegar a 4★. */
export function selfStarsThatCount(selfStars: number | null | undefined, selfSource?: string | null): number | null {
  if (selfStars == null) return null;
  return selfSource === 'assessed' ? Math.min(selfStars, ASSESSED_CAP) : selfStars;
}

/** La estrella que sale de marcar indicadores: todos 4★ · alguno a medias 3★ · alguno no 2★. */
export function starsFromCriteria(results: ('met' | 'partial' | 'not_met')[]): number {
  if (!results.length) return 2;
  if (results.some((r) => r === 'not_met')) return 2;
  if (results.some((r) => r === 'partial')) return 3;
  return 4;
}

/** Tareas propias abiertas como máximo (doctrina 2026-09-10). */
export const MAX_OPEN_TASKS = 3;

/** Run de la secuencia a 4★+ (Marcelo 2026-09-25): ¿este paso toma la
 *  estrella del run? Sí si no tiene nota propia, si la suya es una
 *  autoevaluación sin ola, o si la ejecutada es igual o más baja. NO si ya
 *  la ejecutó más alto: el run nunca baja un paso. La del coach no entra
 *  acá: no se toca. */
export function takesRunStar(
  existing: { current_rating?: number | null; self_source?: StarSource | string | null } | null | undefined,
  runStar: number,
): boolean {
  if (!existing || existing.current_rating == null) return true;
  if (existing.self_source === 'assessed') return true;
  return existing.current_rating <= runStar;
}
