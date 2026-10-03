// ═══ FUNDAMENTOS · las estrellas de técnica, aparte de las secuencias (Marcelo 2026-10-02/03) ═══
//
// Una secuencia (#1–#13) se evalúa por su paso más flojo. Los FUNDAMENTOS son
// otra lente sobre las mismas estrellas: la técnica en sí, agrupada como la
// enseña el método — los Tres Círculos (cuerpo · tabla · ola), el Infinite
// Circle y las herramientas. Cada fundamento apunta a UN paso por lado y la
// estrella es la de ese paso (student_step_ratings.coach_rating): acá no se
// inventa una "estrella del fundamento" ni se promedia nada.
//
// Decisiones de Marcelo (2026-10-02/03), no se rediscuten acá:
//  · Compresión · extensión es del Círculo 1 y tiene paso propio (FND-CE).
//    Forward Momentum (STP-019) es SOLO la herramienta.
//  · El Círculo 3 se evalúa en tres cosas con paso propio (FND-WAVE-*).
//    Leer las etapas de la ola (STP-033) es entendimiento, no un fundamento.
//  · Posición de pies = una estrella (STP-035); P1 · P2 · P3 y el pie de
//    adelante son texto por ahora (el diagrama del pie de adelante es otro
//    proyecto).
//  · Infinite Circle con los nombres de hoy (Cruz, Tapaloco, Granada, Choke):
//    renombrar es otro proyecto.
//  · Pump y bottom turn NO son fundamentos: viven dentro de las secuencias.
//
// Los pasos FND-* (migración 00227) tienen course_section 'fundamentals', que
// NO está en GRADUATION_RULES.sections: nunca entran en el catálogo de la
// cinta, en la aprobación (4★ en cada paso del catálogo) ni en los conteos
// del camino (What it takes). student_step_ratings no tiene FK a lessons,
// así que se califican como cualquier paso; arrancan vacíos.
//
// Los ids van escritos a mano acá (no se importan las páginas, que son puro
// texto y engordarían lo que carga el teléfono); las pruebas de
// src/test/pure.test.ts garantizan que coinciden con circles-seq,
// infinite-circle y tools-seq. Puro: sin base, sin React.

import type { Command } from '@/lib/sequence-pages/types';
import { COMMAND_COLORS, HOLD_COLOR, POCKET_COLOR } from '@/lib/sequence-pages/wave-kit';
import { selfStarsThatCount } from '@/lib/stars';

export type Bilingual = { en: string; es: string };
export type FundamentalGroupKey = 'body' | 'board' | 'wave' | 'loop' | 'tools';
/** 'one' = una sola estrella (sin lado). */
export type FundamentalSide = 'fs' | 'bs' | 'one';

export interface FundamentalStar {
  stepId: string;
  side: FundamentalSide;
  /** La palabra del método de ese lado cuando no es la del ítem (Cruz, Choke, Hold Rotation…). */
  label?: string;
  /** Declarado: la MISMA estrella vive en otro ítem de esta lista (hoy ninguna). */
  sharedWith?: Bilingual;
}

export interface FundamentalItem {
  key: string;
  name: Bilingual;
  /** El comando del método (da el color del punto). */
  command: Command;
  /** Capa celeste: esta posición se sostiene. */
  hold?: boolean;
  /** El color del pocket (manual v10.1) en vez del comando. */
  pocket?: boolean;
  stars: FundamentalStar[];
  /** Partes sin estrella propia, solo texto (P1 · P2 · P3 · pie de adelante). */
  textParts?: Bilingual[];
  /** Nota corta al lado del nombre (la cinta, "toda cinta"). */
  note?: Bilingual;
}

export interface FundamentalGroup {
  key: FundamentalGroupKey;
  label: Bilingual;
  items: FundamentalItem[];
}

export const FUNDAMENTALS: readonly FundamentalGroup[] = [
  {
    key: 'body',
    label: { en: 'Circle 1 · Body', es: 'Círculo 1 · Cuerpo' },
    items: [
      {
        key: 'posture', name: { en: 'Posture', es: 'Postura' }, command: 'posture',
        stars: [
          { stepId: 'STP-018', side: 'fs' },
          { stepId: 'STP-038', side: 'bs', label: 'BS Body Mechanics' },
        ],
      },
      {
        key: 'rotation', name: { en: 'Rotation · the rail', es: 'Rotación · el riel' }, command: 'rail',
        stars: [
          { stepId: 'STP-022', side: 'fs', label: 'Turn Frontside' },
          { stepId: 'STP-021', side: 'bs', label: 'Turn Backside' },
        ],
      },
      {
        key: 'compression', name: { en: 'Compression · extension', es: 'Compresión · extensión' }, command: 'projection',
        stars: [{ stepId: 'FND-CE', side: 'one' }],
      },
      {
        key: 'hold', name: { en: 'Hold', es: 'Hold' }, command: 'rail', hold: true,
        stars: [
          { stepId: 'STP-047', side: 'fs' },
          { stepId: 'STP-049', side: 'bs', label: 'Hold Rotation' },
        ],
      },
    ],
  },
  {
    key: 'board',
    label: { en: 'Circle 2 · Board', es: 'Círculo 2 · Tabla' },
    items: [
      {
        key: 'feet', name: { en: 'Foot position', es: 'Posición de los pies' }, command: 'posture',
        stars: [{ stepId: 'STP-035', side: 'one' }],
        textParts: [
          { en: 'P1 · tail', es: 'P1 · cola' },
          { en: 'P2 · neutral', es: 'P2 · neutro' },
          { en: 'P3 · forward', es: 'P3 · adelante' },
          { en: 'front foot centred', es: 'pie de adelante centrado' },
        ],
      },
    ],
  },
  {
    key: 'wave',
    label: { en: 'Circle 3 · Wave', es: 'Círculo 3 · Ola' },
    items: [
      { key: 'energy', name: { en: 'Use the wave’s energy', es: 'Usar la energía de la ola' }, command: 'projection', stars: [{ stepId: 'FND-WAVE-ENERGY', side: 'one' }] },
      { key: 'flat', name: { en: 'Keep the energy · never the flat', es: 'Mantener la energía · nunca el flat' }, command: 'projection', stars: [{ stepId: 'FND-WAVE-FLAT', side: 'one' }] },
      { key: 'pocket', name: { en: 'Surf the pocket', es: 'Surfear el pocket' }, command: 'projection', pocket: true, stars: [{ stepId: 'FND-WAVE-POCKET', side: 'one' }] },
    ],
  },
  {
    key: 'loop',
    label: { en: 'The Infinite Circle', es: 'Infinite Circle' },
    items: [
      {
        key: 'projection', name: { en: 'Projection', es: 'Proyección' }, command: 'projection',
        stars: [
          { stepId: 'STP-040', side: 'fs' },
          { stepId: 'STP-043', side: 'bs', label: 'Choke' },
        ],
      },
      {
        key: 'railchange', name: { en: 'Rail change', es: 'Cambio de riel' }, command: 'maneuver',
        stars: [
          { stepId: 'STP-041', side: 'fs', label: 'Cruz' },
          { stepId: 'STP-044', side: 'bs', label: 'Tapaloco' },
        ],
      },
      {
        key: 'closure', name: { en: 'Closure', es: 'Cierre' }, command: 'closure',
        stars: [
          { stepId: 'STP-042', side: 'fs', label: 'Grenade' },
          { stepId: 'STP-045', side: 'bs', label: 'Elbow' },
        ],
      },
    ],
  },
  {
    key: 'tools',
    label: { en: 'Tools', es: 'Herramientas' },
    items: [
      { key: 'momentum', name: { en: 'Forward Momentum', es: 'Forward Momentum' }, command: 'projection', note: { en: 'every belt', es: 'toda cinta' }, stars: [{ stepId: 'STP-019', side: 'one' }] },
      { key: 'touch', name: { en: 'Touch the board', es: 'Tocar la tabla' }, command: 'posture', note: { en: 'Purple Belt', es: 'Púrpura' }, stars: [{ stepId: 'STP-052', side: 'one', label: 'Hips Go Down' }] },
    ],
  },
];

/** Todos los pasos de los fundamentos, sin repetir (la consulta del portal). */
export const FUNDAMENTAL_STEP_IDS: readonly string[] = Array.from(
  new Set(FUNDAMENTALS.flatMap((g) => g.items.flatMap((i) => i.stars.map((s) => s.stepId)))),
);

const FUNDAMENTAL_STEP_SET = new Set(FUNDAMENTAL_STEP_IDS);
/** ¿Este paso es un fundamento? (p. ej. para dejarlo fuera de un guardia de aprobación) */
export function isFundamentalStep(stepId: string | null | undefined): boolean {
  return !!stepId && FUNDAMENTAL_STEP_SET.has(stepId);
}

/** El color del punto del método: pocket > hold > comando. */
export function fundamentalDotColor(item: Pick<FundamentalItem, 'command' | 'hold' | 'pocket'>): string {
  if (item.pocket) return POCKET_COLOR;
  if (item.hold) return HOLD_COLOR;
  return COMMAND_COLORS[item.command];
}

// ─── La vista: grupos → ítems → lados con su estrella ───

export interface FundamentalStarView extends FundamentalStar {
  /** La estrella del coach de ESE paso, tal cual (null = sin nota). */
  coach: number | null;
  /** La del alumno, si se pidió: una autoevaluación sin ola vale 3★ como máximo. */
  self: number | null;
}
export interface FundamentalItemView extends Omit<FundamentalItem, 'stars'> {
  sides: FundamentalStarView[];
  /** Lados con nota del coach / lados en total. */
  rated: number;
  total: number;
}
export interface FundamentalGroupView {
  key: FundamentalGroupKey;
  label: Bilingual;
  items: FundamentalItemView[];
  rated: number;
  total: number;
}
export interface FundamentalsView {
  groups: FundamentalGroupView[];
  rated: number;
  total: number;
}

export type FundamentalCoachStars = Readonly<Record<string, number | null | undefined>>;
export type FundamentalSelfStars = Readonly<Record<string, { stars: number | null | undefined; source?: string | null } | null | undefined>>;

/** Arma la vista a partir de las estrellas por paso. No inventa ninguna
 *  estrella a nivel de fundamento ni modifica lo que recibe.
 *  `hideEmpty`: deja fuera los grupos sin ninguna nota del coach (el alumno
 *  de White no ve el Infinite Circle vacío). Un paso compartido entre dos
 *  ítems del MISMO grupo cuenta una sola vez. */
export function fundamentalsView(
  coachStars: FundamentalCoachStars,
  opts: { self?: FundamentalSelfStars; hideEmpty?: boolean } = {},
): FundamentalsView {
  const coachOf = (id: string): number | null => {
    const v = coachStars[id];
    return typeof v === 'number' && v > 0 ? v : null;
  };
  const selfOf = (id: string): number | null => {
    const s = opts.self?.[id];
    return s ? selfStarsThatCount(s.stars ?? null, s.source ?? null) : null;
  };
  const groups: FundamentalGroupView[] = FUNDAMENTALS.map((g) => {
    const seen = new Set<string>();
    let rated = 0;
    let total = 0;
    const items: FundamentalItemView[] = g.items.map((item) => {
      const { stars, ...rest } = item;
      const sides: FundamentalStarView[] = stars.map((s) => ({ ...s, coach: coachOf(s.stepId), self: selfOf(s.stepId) }));
      const itemRated = sides.filter((s) => s.coach !== null).length;
      for (const s of sides) {
        if (seen.has(s.stepId)) continue;
        seen.add(s.stepId);
        total += 1;
        if (s.coach !== null) rated += 1;
      }
      return { ...rest, sides, rated: itemRated, total: sides.length };
    });
    return { key: g.key, label: g.label, items, rated, total };
  });
  const kept = opts.hideEmpty ? groups.filter((g) => g.rated > 0) : groups;
  return {
    groups: kept,
    rated: groups.reduce((n, g) => n + g.rated, 0),
    total: groups.reduce((n, g) => n + g.total, 0),
  };
}
