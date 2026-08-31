// Graduation rules per belt — the "complete evaluation" that decides whether
// a student is ready for the next level. Kept deliberately small so the coach
// sees a simple readiness verdict, without losing the canon criteria.
//
// An STP counts as "demonstrated" when rated >= stpThreshold stars.
// Canon rule (Blue Belt and forward): the student must reach stpThreshold on
// EVERY part of the sequence (4★ en cada parte) — requireAllStps = true. A belt
// is earned when: all sequence STPs are demonstrated AND principles met >= minPrinciples.

export interface GraduationRule {
  beltLabel: string;
  // Course sections whose STPs make up the sequence rated in the final
  // evaluation. Yellow Belt sums White + Yellow so all fundamentals are
  // re-confirmed, not just the new YB steps.
  sections: string[];
  stpThreshold: number;   // stars needed for an STP to count as demonstrated
  minStps: number;        // shown in the UI; with requireAllStps it equals the catalog
  // Canon rule: the student must hit stpThreshold on EVERY part of the
  // sequence (4★ in each STP) — not just a subset.
  requireAllStps: boolean;
  principles: string[];   // canon principles to check ([] = none for this belt)
  minPrinciples: number;  // minimum principles embodied
  /** LA REGLA DEL AGUA (doctrina Marcelo 2026-08-31): la cinta exige
   *  autosuficiencia en el agua, confirmada por un coach. */
  waterRule?: { minLabel: string; description: string };
}

// ═══ LA REGLA DEL AGUA — el chequeo único para TODA vía de promoción ═══
// "Solo entra a Foundation quien es autosuficiente para agarrar olas solo:
// salir con su tabla, elegir/posicionarse solo, volver solo." Aplica a Blue
// y superiores. Autosuficiente = ocean semi_autonomous+ (mismo criterio que
// el quiz, isSelfSufficient) y NO provisional: lo confirmó un coach en el
// agua. Devuelve null si no bloquea, o el mensaje del bloqueo.
const WATER_RULE_BELTS = new Set(['blue_belt', 'purple_belt', 'brown_belt', 'black_belt']);
const SELF_SUFFICIENT_LEVELS = new Set(['semi_autonomous', 'autonomous', 'advanced']);

/** ¿El nivel de océano ya es autosuficiente? (sin mirar si está confirmado) */
export function isWaterSelfSufficient(oceanLevel: string | null | undefined): boolean {
  return !!oceanLevel && SELF_SUFFICIENT_LEVELS.has(oceanLevel);
}

export function waterRuleBlocker(
  targetBelt: string,
  oceanLevel: string | null | undefined,
  oceanProvisional: boolean | null | undefined,
): string | null {
  if (!WATER_RULE_BELTS.has(targetBelt)) return null;
  const selfSufficient = !!oceanLevel && SELF_SUFFICIENT_LEVELS.has(oceanLevel);
  if (selfSufficient && oceanProvisional === false) return null;
  return selfSufficient
    ? 'The water rule: their ocean level shows self-sufficiency but no coach has confirmed it in the water yet — confirm it first.'
    : 'The water rule blocks this belt: Foundation and above require water self-sufficiency (Semi-Autonomous or higher, coach-confirmed in the water).';
}

// Keyed by the belt the camp graduates students INTO (template includes_course_key).
export const GRADUATION_RULES: Record<string, GraduationRule> = {
  // White Belt — WB Exit Test: >= 18 of 25 WB STPs.
  white_belt: {
    beltLabel: 'White Belt',
    sections: ['white_belt'],
    stpThreshold: 4,
    minStps: 25,
    requireAllStps: true,
    principles: [],
    minPrinciples: 0,
  },
  // Yellow Belt — full White->Yellow sequence. Verificado contra producción
  // 2026-08-27: son 25 + 10 = 35 pasos activos, no 33. La constante había
  // quedado de cuando Yellow tenía 8.
  yellow_belt: {
    beltLabel: 'Yellow Belt',
    sections: ['white_belt', 'yellow_belt'],
    stpThreshold: 4,
    minStps: 35,
    requireAllStps: true,
    // Los principios del canon salieron de la evaluación (Marcelo 2026-08-27):
    // quedan como INFORMACIÓN en CANON_REFERENCE, no como casillas que el
    // coach marca. No se perdió nada medible: nunca se guardaron — eran
    // estado del navegador que solo abría o cerraba la aprobación.
    principles: [],
    minPrinciples: 0,
  },
  // Blue Belt — full White->Yellow->Blue sequence. Verificado contra
  // producción 2026-08-27: son 25 + 10 + 20 = 55 pasos activos, no 48.
  // Principles
  // are the Blue Belt Exit Test criteria (verbatim from the manual). Canon rule:
  // 4★ in EVERY part of the sequence to advance (requireAllStps).
  blue_belt: {
    beltLabel: 'Blue Belt',
    sections: ['white_belt', 'yellow_belt', 'blue_belt'],
    stpThreshold: 4,
    minStps: 55,
    requireAllStps: true,
    // De los cinco principios de Blue, CUATRO eran lo mismo que el coach ya
    // evalúa en otro lado y los marcaba dos veces:
    //   "Universal Sequence Formula (Seq #10-#13)" = esas cuatro secuencias
    //   "Pump FS y BS (Seq #8, #9)"                = esas dos secuencias
    //   "Demonstrate the 4 BB Concepts"            = el paso BB-CONCEPTS-01
    //   "Verbalize Compromiso Consciente"          = la lección BB-ONB-01
    // El quinto no está en ninguna otra parte y es el que importa: saber decir
    // solo qué etapa falló es la autonomía — el alumno dejando de necesitar
    // que le digan qué pasó. Queda ese, y solo en Blue.
    principles: [
      'Sabe decir por sí mismo qué etapa de la secuencia falló cuando la ejecución no llega',
    ],
    minPrinciples: 1,
    waterRule: {
      minLabel: 'Semi-Autonomous',
      description:
        'Self-sufficient in the water — you get out with your board, choose and position yourself, and get back on your own. Your coach confirms it in the water.',
    },
  },
};

/**
 * El canon como INFORMACIÓN, no como evaluación.
 *
 * Estos principios se marcaban uno por uno al cerrar un camp. Salieron de la
 * evaluación porque en Blue cuatro de cinco repetían algo que el coach ya
 * calificaba, y porque nunca se guardaron: eran estado del navegador. Siguen
 * acá para mostrarlos al alumno y al coach como referencia del nivel.
 */
export const CANON_REFERENCE: Record<string, string[]> = {
  yellow_belt: [
    'Endurance and enjoyment are not opposites',
    'Cobra + Line = TIME',
    'External × Internal = sustained line',
    'Exit with elegance, not with turbulence',
    'Errors are signals, not failures',
  ],
  blue_belt: [
    'Execute the Universal Sequence Formula on at least 4 of 5 attempts per sequence (Seq #10, #11, #12, #13)',
    'Pump effectively on FS and BS (Seq #8, #9) at least 3 of 5 attempts per side',
    'Demonstrate the 4 BB Concepts (Floater, Impulso, Low Finish, BT Concept) in context',
    'Verbalize Compromiso Consciente in your own words',
  ],
};
