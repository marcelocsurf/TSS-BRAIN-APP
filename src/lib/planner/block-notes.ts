// ═══ notes_pre: la nota del coach vs. las marcas del planner ═══
//
// service_plan_blocks.notes_pre lleva DOS cosas distintas:
//   1. la nota que el coach le escribe al alumno (el alumno la ve, entre
//      comillas, en "Next class"), y
//   2. marcas internas que el planner se deja a sí mismo para saber de dónde
//      vino la misión de ese bloque ("Set at the close of day 3.").
//
// Estaban escritas a mano en cada lugar, con expresiones distintas, y se
// desincronizaron: el alumno terminó viendo «Added by the coach.» como si se
// lo hubiera escrito su coach, y el planner dejó de reconocer dos marcas que
// él mismo escribe. Una sola lista, un solo lugar.

/** Toda marca interna que el planner escribe en notes_pre. */
const INTERNAL_NOTE =
  /^(set at the close of day\b|moved on at the close of day\b|carried over from day\b|added at the close\b|added by the coach\b)/i;

/** Las marcas que deja el CIERRE de la sesión anterior, con su día. */
const FROM_CLOSE =
  /^(?:set at the close of day|moved on at the close of day|carried over from day)\s+(\d+)/i;

/** true si el texto es una marca del planner y no una nota para el alumno. */
export function isInternalBlockNote(note: string | null | undefined): boolean {
  return INTERNAL_NOTE.test((note ?? '').trim());
}

/** La nota tal como la puede ver el alumno, o null si es una marca interna. */
export function studentBlockNote(note: string | null | undefined): string | null {
  const t = (note ?? '').trim();
  return t && !isInternalBlockNote(t) ? t : null;
}

/**
 * Si la misión de este bloque la dejó el cierre de una sesión anterior,
 * devuelve ese día (como texto) o null cuando la marca no lo dice.
 * Devuelve undefined si no viene de ningún cierre.
 */
export function carriedFromClose(note: string | null | undefined): { day: string | null } | undefined {
  const m = (note ?? '').trim().match(FROM_CLOSE);
  if (!m) return undefined;
  return { day: m[1] ?? null };
}
