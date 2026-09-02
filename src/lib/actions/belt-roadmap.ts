'use server';

// ═══ QUÉ LE FALTA AL ALUMNO PARA SU PRÓXIMA CINTA ═══
//
// Pedido de Marcelo (2026-08-28): "que el alumno pueda ver realmente cuáles
// son todos los requisitos que debe cumplir para aprobar… debería de ser toda
// la info que se llena en la evaluación de nivel que hace el coach, pero como
// si fuera una guía".
//
// El alumno YA tenía las piezas sueltas —sus estrellas en el curso, el próximo
// movimiento en el Home— pero nunca la REGLA (4★ en cada parte de cada
// secuencia) ni la lista completa ni cuánto le falta. Y lo del agua no existía
// para él: vivía solo del lado del coach.
//
// Esto no inventa ni pide nada nuevo: es la evaluación del coach dada vuelta.
// Misma fuente, mismo umbral, mismas secciones acumulativas.

import { createAdminClient } from '@/lib/supabase/admin';
import { getMySequence } from '@/lib/actions/sequence';
import { getCourseCatalog } from '@/lib/actions/course';
import { GRADUATION_RULES, isWaterSelfSufficient } from '@/lib/constants/graduation';
import { type BeltLevel } from '@/lib/constants/belts';

export interface RoadmapSequence {
  id: string;
  order: number;
  name: string;
  belt: string;
  /** owned = lograda · working = hay un paso por debajo del umbral ·
   *  partial/unrated = todavía sin ver. */
  state: 'owned' | 'working' | 'partial' | 'unrated';
  /** El paso que la frena y sus estrellas. */
  weakestStepId: string | null;
  weakestTitle: string | null;
  minRating: number | null;
  totalSteps: number;
}

export interface BeltRoadmap {
  studentFirstName: string;
  currentBelt: string;
  /** La cinta que se está persiguiendo. Igual a currentBelt cuando su próxima
   *  cinta todavía no tiene requisitos publicados. */
  targetBelt: string;
  targetBeltLabel: string;
  /** true = no hay regla publicada para la próxima cinta; se muestra el
   *  estándar de la que ya tiene. */
  targetIsCurrent: boolean;
  passStars: number;
  sequences: RoadmapSequence[];
  sequencesOwned: number;
  /** Lo que el coach todavía no vio: pendiente, no reprobado. */
  sequencesUnseen: number;
  // El AGUA tiene su propia vista (getWaterLevel) — pero desde LA REGLA DEL
  // AGUA (2026-08-31) también es un REQUISITO de Blue+: autosuficiencia
  // confirmada por el coach. Cuando la cinta perseguida la exige, va como
  // línea propia con su estado.
  waterRule: {
    minLabel: string;
    description: string;
    /** El nivel de océano ya es autosuficiente (semi_autonomous+). */
    reached: boolean;
    /** Un coach lo confirmó en el agua (no provisional). */
    confirmed: boolean;
  } | null;
  // ── Curso ──
  preCourseCompleted: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
  // ── Autonomía (solo la cinta que la pide) ──
  autonomyPrinciples: string[];
  // ── Lo último que le dijo su coach ──
  coachFocus: string | null;
  /** Las cintas desde las que se puede mirar el camino. `key` es la cinta que
   *  se TIENE; `leadsTo` la que se persigue desde ahí. */
  availableBelts: Array<{ key: string; label: string; leadsTo: string }>;
  /** La cinta que se está mirando COMO PUNTO DE PARTIDA. */
  fromBelt: string;
  /** La cinta que él tiene de verdad (para marcarla entre las demás). */
  ownBelt: string;
}

/** Rótulo para las cintas que no tienen regla publicada. */
const BELT_LABEL: Record<string, string> = {
  purple_belt: 'Purple Belt',
  brown_belt: 'Brown Belt',
  black_belt: 'Black Belt',
};

const BELT_ORDER: BeltLevel[] = [
  'white_belt',
  'yellow_belt',
  'blue_belt',
  'purple_belt',
  'brown_belt',
  'black_belt',
];

/** La cinta siguiente a la que ya tiene. null si ya está en la última. */
function nextBelt(belt: string): string | null {
  const i = BELT_ORDER.indexOf(belt as BeltLevel);
  if (i < 0) return BELT_ORDER[1];
  return BELT_ORDER[i + 1] ?? null;
}

/**
 * El camino a la próxima cinta, leído con el token del portal (el token ES el
 * auth, igual que el resto de las acciones del portal).
 *
 * Invariante #2: estados esperables se DEVUELVEN, no se lanzan.
 */
export async function getBeltRoadmap(
  token: string,
  /** Mirar los requisitos de OTRA cinta (Marcelo 2026-08-28: "si pongo en
   *  white que salga ese, si pongo blue que salga ese"). Sin esto, la que le
   *  toca. */
  fromBeltOverride?: string,
): Promise<{ ok: true; data: BeltRoadmap } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: 'Missing token.' };
  const admin = createAdminClient();

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, belt_level, next_recommended_focus, ocean_level, ocean_level_provisional')
    .eq('portal_token', token)
    .maybeSingle();
  if (!student) return { ok: false, error: 'Student not found.' };

  const ownBelt = (student as any).belt_level || 'white_belt';
  // Se elige la cinta que se TIENE y la guía muestra a dónde lleva (Marcelo
  // 2026-08-28: "el white es your road to yellow, y yellow your road to blue").
  // Un valor inventado nunca pasa de acá.
  const fromBelt =
    fromBeltOverride && BELT_ORDER.includes(fromBeltOverride as BeltLevel)
      ? fromBeltOverride
      : ownBelt;
  const candidate = nextBelt(fromBelt);
  // Solo White, Yellow y Blue tienen requisitos publicados. Desde Blue en
  // adelante se muestra el estándar de la cinta que ya tiene — decir "todavía
  // no está publicado" es más honesto que inventar una regla.
  const targetBelt =
    candidate && GRADUATION_RULES[candidate] ? candidate : fromBelt;
  const rule = GRADUATION_RULES[targetBelt] ?? GRADUATION_RULES.blue_belt;
  // Desde dónde se puede mirar: las cintas cuyo siguiente escalón tiene
  // requisitos, más la propia (para que siempre encuentre la suya).
  const fromOptions = Array.from(
    new Set([
      ...BELT_ORDER.filter((b) => {
        const nx = nextBelt(b);
        return !!(nx && GRADUATION_RULES[nx]);
      }),
      ownBelt,
    ]),
  ).sort((a, b) => BELT_ORDER.indexOf(a as BeltLevel) - BELT_ORDER.indexOf(b as BeltLevel));

  // Las secuencias, con el MISMO corte acumulativo que usa la evaluación del
  // coach: getMySequence(belt) trae White→…→belt.
  let sequences: RoadmapSequence[] = [];
  try {
    const seq = await getMySequence(token, targetBelt);
    sequences = seq.sequences.map((s) => ({
      id: s.id,
      order: s.order,
      name: s.name,
      belt: s.belt,
      state: s.state,
      weakestStepId: s.weakestStepId,
      weakestTitle: s.weakestTitle,
      minRating: s.minRating,
      totalSteps: s.items.length,
    }));
  } catch {
    // Sin secuencias la guía igual sirve: el agua y el curso se muestran.
    sequences = [];
  }

  // El curso. No bloquea la cinta (decisión de Marcelo): se ve como requisito
  // visible, no como candado.
  //
  // Se cuentan SOLO las lecciones de las cintas que entran en esta evaluación
  // (rule.sections), no el catálogo entero. La pestaña Course dice "0 de 198"
  // porque cuenta todo lo que existe; acá 198 sería una montaña que ni siquiera
  // se le pide. El pre-curso sí sale del catálogo: es la misma puerta que abre
  // las secuencias.
  let preCourseCompleted = false;
  let lessonsCompleted = 0;
  let lessonsTotal = 0;
  try {
    const cat = await getCourseCatalog(token);
    preCourseCompleted = !!cat.preCourseCompleted;
    const mine = (cat.lessons ?? []).filter((l: any) =>
      rule.sections.includes(l.course_section),
    );
    lessonsTotal = mine.length;
    lessonsCompleted = mine.filter((l: any) => l.completed).length;
  } catch {
    /* el curso es informativo: si falla, la guía sigue */
  }

  return {
    ok: true,
    data: {
      studentFirstName: (student as any).first_name ?? 'there',
      currentBelt: ownBelt,
      targetBelt,
      targetBeltLabel: rule.beltLabel,
      // true = desde esta cinta no hay camino publicado hacia arriba.
      targetIsCurrent: targetBelt === fromBelt,
      fromBelt,
      ownBelt,
      availableBelts: fromOptions.map((b) => {
        const nx = nextBelt(b);
        return {
          key: b,
          label: GRADUATION_RULES[b]?.beltLabel ?? BELT_LABEL[b] ?? b,
          leadsTo:
            nx && GRADUATION_RULES[nx]
              ? GRADUATION_RULES[nx].beltLabel
              : (GRADUATION_RULES[b]?.beltLabel ?? BELT_LABEL[b] ?? b),
        };
      }),
      passStars: rule.stpThreshold,
      sequences,
      sequencesOwned: sequences.filter((s) => s.state === 'owned').length,
      sequencesUnseen: sequences.filter(
        (s) => s.state === 'unrated' || s.state === 'partial',
      ).length,
      preCourseCompleted,
      lessonsCompleted,
      lessonsTotal,
      autonomyPrinciples: rule.principles,
      waterRule: rule.waterRule
        ? {
            minLabel: rule.waterRule.minLabel,
            description: rule.waterRule.description,
            reached: isWaterSelfSufficient((student as any).ocean_level),
            confirmed:
              isWaterSelfSufficient((student as any).ocean_level) &&
              (student as any).ocean_level_provisional === false,
          }
        : null,
      coachFocus: (student as any).next_recommended_focus || null,
    },
  };
}
