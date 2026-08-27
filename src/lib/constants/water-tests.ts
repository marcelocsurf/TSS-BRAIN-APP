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
  /** Unidad de lo que se mide. */
  unit: 'min' | 'm' | null;
}

export const WATER_TESTS: WaterTest[] = [
  {
    key: 'float',
    name: 'Flotar sin tabla',
    proves: 'Que no entra en pánico si pierde la tabla.',
    unit: 'min',
  },
  {
    key: 'swim',
    name: 'Nadar sin tabla',
    proves: 'Que vuelve solo si se revienta el leash.',
    unit: 'm',
  },
  {
    key: 'board_recovery',
    name: 'Recuperar la tabla y subirse donde no toca fondo',
    proves: 'El modo de falla que pasa siempre.',
    unit: null,
  },
  {
    key: 'turtle_roll',
    name: 'Turtle roll bajo espuma',
    proves: 'Que puede salir cuando entra serie.',
    unit: null,
  },
  {
    key: 'paddle',
    name: 'Remada sostenida',
    proves: 'Que aguanta la corriente y vuelve.',
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
