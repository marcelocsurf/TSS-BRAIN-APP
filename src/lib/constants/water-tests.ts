// ═══ PRUEBAS DE AGUA ═══
//
// Cómo se GANA el nivel de océano. Hasta ahora `students.ocean_level` salía
// del quiz de intake —lo que el alumno dice de sí mismo— y del ojo del coach;
// y `students.swim_level` es auto-declarado y nadie lo verifica nunca.
//
// No se califican con estrellas: se pasan o no. Flotaste tres minutos o no.
// La técnica es gradual; esto es binario, porque es seguridad.
//
// Cada prueba prueba un MODO DE FALLA real, no una marca de gimnasio.
//
// ⚠ LOS NÚMEROS SON PROVISIONALES. La estructura no cambia cuando cambien.
// El criterio para fijarlos, acordado con Marcelo (2026-08-27):
//   · el tiempo de flote tiene que ser MAYOR al que tarda un coach o un
//     salvavidas en llegar a alguien en el peor día del spot, con margen;
//   · la distancia a nadar es la del pico a la orilla en su spot real,
//     no 100 m porque suena redondo.
// Cuando tenga esos dos datos de El Zonte, se ajustan acá y nada más.

import type { OceanLevel } from './ocean-levels';

export interface WaterTest {
  key: 'float' | 'swim' | 'board_recovery' | 'turtle_roll' | 'paddle';
  /** Nombre corto, de cara al coach. */
  name: string;
  /** Qué demuestra de verdad — el modo de falla que cubre. */
  proves: string;
  /** Lo mismo en inglés: lo que ve el ALUMNO en su portal. */
  nameEn: string;
  provesEn: string;
  /** Unidad de lo que se mide. */
  unit: 'min' | 'm' | null;
}

export const WATER_TESTS: WaterTest[] = [
  {
    key: 'float',
    name: 'Flotar sin tabla',
    proves: 'Que no entra en pánico si pierde la tabla.',
    nameEn: 'Float without your board',
    provesEn: "You don't panic when your board is gone.",
    unit: 'min',
  },
  {
    key: 'swim',
    name: 'Nadar sin tabla',
    proves: 'Que vuelve solo si se revienta el leash.',
    nameEn: 'Swim without your board',
    provesEn: 'You get yourself back in if the leash snaps.',
    unit: 'm',
  },
  {
    key: 'board_recovery',
    name: 'Recuperar la tabla y subirse donde no toca fondo',
    proves: 'El modo de falla que pasa siempre.',
    nameEn: 'Get your board back where you cannot stand',
    provesEn: 'The one that happens to everybody, every session.',
    unit: null,
  },
  {
    key: 'turtle_roll',
    name: 'Turtle roll bajo espuma',
    proves: 'Que puede salir cuando entra serie.',
    nameEn: 'Turtle roll under whitewater',
    provesEn: 'You can get out when a set comes through.',
    unit: null,
  },
  {
    key: 'paddle',
    name: 'Remada sostenida',
    proves: 'Que aguanta la corriente y vuelve.',
    nameEn: 'Sustained paddling',
    provesEn: 'You can hold against the current and come back.',
    unit: 'min',
  },
];

export interface LevelRequirement {
  test: WaterTest['key'];
  /** Marca provisional. null = solo pasa/no pasa, sin medida. */
  target: number | null;
}

/**
 * Qué hay que pasar para cada nivel de océano. Es ACUMULATIVO: para llegar a
 * `autonomous` hay que tener también lo de `semi_autonomous`.
 *
 * Las marcas salen de lo que el propio nivel promete en ocean-levels.ts:
 *   supervised       espuma hasta la cintura, coach al lado
 *   semi_autonomous  entra solo cintura-pecho en spots conocidos + turtle roll
 *   autonomous       hasta la cabeza, spots conocidos, solo
 *   advanced         overhead y condiciones complejas, solo
 */
export const LEVEL_REQUIREMENTS: Partial<Record<OceanLevel, LevelRequirement[]>> = {
  supervised: [
    { test: 'float', target: 1 },
    { test: 'board_recovery', target: null },
  ],
  semi_autonomous: [
    { test: 'float', target: 3 },
    { test: 'swim', target: 25 },
    { test: 'turtle_roll', target: null },
  ],
  autonomous: [
    { test: 'float', target: 6 },
    { test: 'swim', target: 100 },
    { test: 'paddle', target: 5 },
  ],
  advanced: [
    { test: 'float', target: 10 },
    { test: 'swim', target: 200 },
    { test: 'paddle', target: 10 },
  ],
};

// ═══ LA FLOTADA LARGA ═══
// Marca de honor, idea de Marcelo (2026-08-28): "poner 15+ flotando como una
// opción avanzada súper". No la pide NINGÚN nivel — el nivel más alto pide 10.
// Es lo que se busca cuando ya no queda nada que probar: quince minutos en el
// agua sin tabla y sin apuro.
//
// No necesita tabla nueva: es un resultado de `float` con measured >= 15.
export const LONG_FLOAT_MINUTES = 15;
export const LONG_FLOAT_LABEL_EN = 'The long float — 15+ minutes';
export const LONG_FLOAT_LABEL_ES = 'La flotada larga — 15+ minutos';

/** ¿Este resultado de flote alcanza la marca de honor? */
export function isLongFloat(testKey: string, measured: number | null | undefined): boolean {
  return testKey === 'float' && (measured ?? 0) >= LONG_FLOAT_MINUTES;
}

// ═══ CUÁNDO UNA PRUEBA CUENTA COMO PASADA ═══
//
// Esta regla vivía copiada en la ficha del coach y en earnedOceanLevel, y la
// guía del alumno nació con una TERCERA versión más floja: miraba solo
// `passed` sin el nivel ni la marca. Como las marcas crecen (flotar 1 → 3 → 6
// → 10), la prueba del nivel de abajo daba por cumplida la de arriba: el coach
// veía el requisito en rojo y el alumno el mismo requisito en verde, en la
// sección que es de SEGURIDAD. Una sola regla, acá.
//
// Se llavea por (prueba, NIVEL) porque la misma prueba se toma en varios
// niveles con marcas distintas, y el historial no se pisa.

export interface WaterTestResultRow {
  test_key: string;
  target_level: string;
  passed: boolean;
  measured: number | null;
}

/** El último resultado de cada (prueba, nivel). Las filas llegan de la más nueva a la más vieja. */
export function lastByTestAndLevel<T extends WaterTestResultRow>(rows: T[]): Map<string, T> {
  const last = new Map<string, T>();
  for (const r of rows ?? []) {
    const k = `${r.test_key}:${r.target_level}`;
    if (!last.has(k)) last.set(k, r);
  }
  return last;
}

/** ¿Cumplió este requisito? Pasó la prueba DE ESE NIVEL y llegó a su marca. */
export function meetsRequirement(
  last: Map<string, WaterTestResultRow>,
  level: string,
  req: LevelRequirement,
): boolean {
  const r = last.get(`${req.test}:${level}`);
  if (!r || !r.passed) return false;
  if (req.target === null) return true;
  return r.measured != null && Number(r.measured) >= req.target;
}

export function testByKey(key: string): WaterTest | undefined {
  return WATER_TESTS.find((t) => t.key === key);
}

/** El texto que ve el coach: "Flotar sin tabla · 3 min". */
export function requirementLabel(r: LevelRequirement): string {
  const t = testByKey(r.test);
  if (!t) return r.test;
  if (r.target === null || !t.unit) return t.name;
  return `${t.name} · ${r.target} ${t.unit}`;
}
