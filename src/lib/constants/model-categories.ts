// ═══ CATEGORÍAS DE LA BIBLIOTECA DE MODELOS ═══
// Lista CERRADA por cinta (decisión de Marcelo, 2026-08-26: "creo que debería
// ser por cinta y ahí que salga la secuencia").
//
// Por qué cerrada: cuando era texto libre, once clips terminaron en nueve
// categorías — "blue-belt-and-purple-belt", "blue-belt-purple-belt" y
// "blue-belt-to-purple-belt" eran lo mismo escrito tres veces, más dos con
// errores de tipeo ("whoite", "betl") y una llamada "prueba". Con una lista
// cerrada eso no puede volver a pasar.
//
// Las SECUENCIAS de cada cinta no se escriben acá: salen de la tabla
// `sequences`, la misma fuente que usa el resto de la app, así que no pueden
// desincronizarse del canon.

export const MODEL_BELTS: { slug: string; name: string }[] = [
  { slug: 'all', name: 'All levels' },
  { slug: 'white', name: 'Beginner · White Belt' },
  { slug: 'yellow', name: 'Novice · Yellow Belt' },
  { slug: 'blue', name: 'Foundation · Blue Belt' },
  { slug: 'purple', name: 'Emerging · Purple Belt' },
  { slug: 'brown', name: 'Pre-Elite · Brown Belt' },
  { slug: 'black', name: 'Elite · Black Belt' },
];

/** Slug de cinta → belt_level de la tabla `sequences`. */
export const BELT_LEVEL_OF: Record<string, string | null> = {
  all: null,
  white: 'white_belt',
  yellow: 'yellow_belt',
  blue: 'blue_belt',
  purple: 'purple_belt',
  brown: 'brown_belt',
  black: 'black_belt',
};

// Las categorías viejas escritas a mano, mapeadas a su cinta. Se conserva para
// que los clips que ya existen se agrupen bien AUNQUE la columna `belt`
// todavía no esté puesta — el coach ve la biblioteca ordenada desde ya.
export const LEGACY_CATEGORY_BELT: Record<string, { belt: string; sequence?: string }> = {
  'all-levels': { belt: 'all' },
  'from-whoite-belt-to-blue-belt': { belt: 'white' },
  'white-belt-sequence-2': { belt: 'white', sequence: '2' },
  'white-belt-and-yellow-betl-foam-board-little-green-wave': { belt: 'yellow' },
  'yellow-belt-to-blue-belt': { belt: 'blue' },
  'blue-belt-and-purple-belt': { belt: 'purple' },
  'blue-belt-purple-belt': { belt: 'purple' },
  'blue-belt-to-purple-belt': { belt: 'purple' },
};

/** La cinta de un clip: la columna nueva si está, si no la categoría vieja. */
export function beltOf(row: { belt?: string | null; category?: string | null }): string {
  if (row.belt && MODEL_BELTS.some((b) => b.slug === row.belt)) return row.belt;
  return LEGACY_CATEGORY_BELT[row.category ?? '']?.belt ?? 'all';
}

/** La secuencia de un clip, si tiene. */
export function sequenceOf(row: { sequence_number?: string | null; category?: string | null }): string | null {
  return row.sequence_number ?? LEGACY_CATEGORY_BELT[row.category ?? '']?.sequence ?? null;
}

// Compatibilidad: el nombre viejo sigue exportado para no romper imports.
export const MODEL_CATEGORIES = MODEL_BELTS;
