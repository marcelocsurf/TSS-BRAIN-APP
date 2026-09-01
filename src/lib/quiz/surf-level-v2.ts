// ═══ MOTOR V2 DEL QUIZ DE NIVEL — la copia de AUTORIDAD (server-side) ═══
//
// Espejo EXACTO de compute() en public/quiz-v2.html (el quiz oficial desde
// 2026-09-01, "la película de la sesión"). El cliente manda RESPUESTAS
// (índices 0-3 de cada escena); el servidor recalcula todo — el mismo
// invariante del v1: lo que calcule el navegador no se usa jamás.
//
// Estructura: 10 escenas — Q0-Q4 = EL MAR (/50) · Q5-Q9 = LA OLA (/50).
// Cada opción puntúa 0/3/7/10 por índice (0→0, 1→3, 2→7, 3→10) en TODAS
// las escenas — verificado contra el HTML; si alguna escena cambiara su
// escalera, este mapa deja de ser válido y hay que portarla.
//
// PUERTAS (doctrina Marcelo 2026-08-31):
//  · Foundation (Blue) = AUTOSUFICIENCIA: las 4 del agua (Q1 rompiente con
//    tabla, Q2 etiqueta, Q3 elegir ola, Q4 volver solo) en 7+ Y saber
//    AGARRAR la ola (Q5 take-off) en 7+. La conexión NO define Foundation —
//    es lo que Foundation construye.
//  · Emerging (Purple) exige conexión (Q6) y dibujar líneas (Q8) en 7+.
//  · Pre-Elite (Brown) exige rango de condiciones (Q9) en 7+.
// Propiedad: el mínimo honesto de autosuficiencia (5×7 + 7) = 42 = el piso
// exacto de la banda Foundation.

export const V2_PHASES = [
  'Reading the day',
  'Getting out',
  'The lineup',
  'Choosing your wave',
  'On your own',
  'The take-off',
  'Connection with your board',
  'Speed',
  'Drawing your lines',
  'Conditions',
] as const;

export const V2_LEVELS = [
  { name: 'Beginner', belt: 'white_belt', min: 0 },
  { name: 'Novice', belt: 'yellow_belt', min: 15 },
  { name: 'Foundation', belt: 'blue_belt', min: 42 },
  { name: 'Emerging', belt: 'purple_belt', min: 64 },
  { name: 'Pre-Elite', belt: 'brown_belt', min: 86 },
  { name: 'Elite', belt: 'black_belt', min: 97 },
] as const;

const OPT_SCORE = [0, 3, 7, 10] as const;

export interface V2Result {
  score: number;
  mar: number;
  ola: number;
  belt: string;
  levelName: string;
  cappedBy: 'water' | 'evidence' | null;
  cappedGaps: string[];
  uncappedName: string;
  /** Mapa por escena para la ficha del coach (pct 0-100 por fase). */
  skillmap: { name: string; pct: number }[];
  /** Océano DERIVADO de las 4 escenas del agua (Q1-Q4), conservador y
   *  siempre provisional: min(4)≥10 → autonomous · ≥7 → semi_autonomous ·
   *  ≥3 → supervised · si no → beginner. El coach lo confirma en el agua. */
  oceanLevel: 'beginner' | 'supervised' | 'semi_autonomous' | 'autonomous';
}

/** true si el array trae 10 índices válidos (0-3). */
export function isValidV2Answers(a: unknown): a is number[] {
  return (
    Array.isArray(a) &&
    a.length === 10 &&
    a.every((x) => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x <= 3)
  );
}

export function computeV2(answers: number[]): V2Result {
  const raw = (i: number) => {
    const a = answers[i];
    return typeof a === 'number' && a >= 0 && a <= 3 ? OPT_SCORE[a] : 0;
  };
  const mar = raw(0) + raw(1) + raw(2) + raw(3) + raw(4);
  const ola = raw(5) + raw(6) + raw(7) + raw(8) + raw(9);
  const score = mar + ola;

  let lv: (typeof V2_LEVELS)[number] = V2_LEVELS[0];
  for (let i = V2_LEVELS.length - 1; i >= 0; i--) {
    if (score >= V2_LEVELS[i].min) { lv = V2_LEVELS[i]; break; }
  }
  const uncapped = lv;
  let cappedBy: 'water' | 'evidence' | null = null;
  let cappedGaps: string[] = [];
  const gapNames = (idx: number[]) => idx.filter((i) => raw(i) < 7).map((i) => V2_PHASES[i]);

  // Evidencia técnica (el score no compra el nivel) — mismo orden que el HTML.
  if (V2_LEVELS.indexOf(lv) >= 4 && raw(9) < 7) { lv = V2_LEVELS[3]; cappedBy = 'evidence'; cappedGaps = gapNames([9]); }
  if (V2_LEVELS.indexOf(lv) >= 3 && (raw(6) < 7 || raw(8) < 7)) { lv = V2_LEVELS[2]; cappedBy = 'evidence'; cappedGaps = gapNames([6, 8]); }
  if (V2_LEVELS.indexOf(lv) >= 2 && raw(5) < 7) { lv = V2_LEVELS[1]; cappedBy = 'evidence'; cappedGaps = gapNames([5]); }
  // LA REGLA DEL AGUA — la última palabra, como en el HTML.
  if (V2_LEVELS.indexOf(lv) >= 2 && (raw(1) < 7 || raw(2) < 7 || raw(3) < 7 || raw(4) < 7)) {
    lv = V2_LEVELS[1]; cappedBy = 'water'; cappedGaps = gapNames([1, 2, 3, 4]);
  }

  const waterMin = Math.min(raw(1), raw(2), raw(3), raw(4));
  const oceanLevel =
    waterMin >= 10 ? 'autonomous' :
    waterMin >= 7 ? 'semi_autonomous' :
    waterMin >= 3 ? 'supervised' : 'beginner';

  return {
    score,
    mar,
    ola,
    belt: lv.belt,
    levelName: lv.name,
    cappedBy,
    cappedGaps,
    uncappedName: uncapped.name,
    skillmap: V2_PHASES.map((name, i) => ({ name, pct: raw(i) * 10 })),
    oceanLevel,
  };
}
