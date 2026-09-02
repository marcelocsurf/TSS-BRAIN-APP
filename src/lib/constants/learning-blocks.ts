// Learning Blocks — the single structure the whole app speaks.
//
// Source: Marcelo Castellanos, "Original 2023", section LEARNING BLOCKS.
// The blocks are numbered 0..7 in that document and THERE IS NO BLOCK 4 —
// the original jumps from 3 to 5. That gap is deliberate here, not a bug.
//
// Nothing in this file is invented: every block name and every checkpoint is
// copied from the source document, and every step key resolves to a real row
// in `lessons` (course_section + step_number).
//
// This is a plain module on purpose — it is imported by server actions,
// client components and route handlers alike, so it must NOT be 'use server'
// (those files can only export async functions).

export interface LearningBlock {
  /** Number as written in the source document. 4 does not exist. */
  n: number;
  /** Staff-facing name, in the language the document uses. */
  es: string;
  /** Student-facing name, English — brand voice. */
  en: string;
  /** One line of context, staff-facing (Spanish). */
  sub: string;
  /** Same line, student-facing (English) — the student's app is in English. */
  subEn: string;
  /** Checkpoints as written in the source document. */
  checkpoints: string[];
}

export const LEARNING_BLOCKS: LearningBlock[] = [
  {
    n: 0,
    es: 'Pre surf — preparación y posicionamiento',
    en: 'Before You Paddle Out',
    sub: 'Leer el lugar, prepararse y llegar al punto donde empieza el surf.',
    subEn: 'Read the spot, get your body ready, and reach the place where surfing starts.',
    checkpoints: [
      'Venue analysis',
      'Set goals',
      'Strategy / safety',
      'Hidratación',
      'Warm up — intro y rutina',
      'Simulation — intro y cómo hacerla',
      'Go out walking — sand bottom o reef',
      'Sweet spot to paddle — qué es, qué significa y cómo encontrarlo',
      'Paddling and turning',
      'Duck dive o turtle roll',
    ],
  },
  {
    n: 1,
    es: 'La entrada a la ola',
    en: 'Catching the Wave',
    sub: 'A la ola o a la espuma: ángulo, remada y la línea que elijo.',
    subEn: 'Green wave or whitewater: your angle, your paddle, and the line you pick.',
    checkpoints: [
      'Ángulo de remada',
      'Remada de flecha + presión en el pecho',
      'Cobra + ángulo donde quiero ir',
    ],
  },
  {
    n: 2,
    es: 'Pop up',
    en: 'Pop Up',
    sub: 'De prono a parado, con los pies donde tienen que ir.',
    subEn: 'From lying down to standing, with your feet where they belong.',
    checkpoints: [
      'Ninja pop up',
      'Regular pop up',
      'Pro pop up',
      'Posición de los pies en la tabla',
      'Impulse — opcional',
    ],
  },
  {
    n: 3,
    es: 'Power posture',
    en: 'Power Posture',
    sub: 'Donde todo empieza. Ocho chequeos, no uno.',
    subEn: 'Where everything starts. Eight checkpoints, not one.',
    checkpoints: [
      'Pecho apunta en dirección de la nariz de la tabla',
      'Get low',
      'Front foot centered, toes across the board · back knee to the nose (no weight on the back foot)',
      'Weight front foot',
      'Scapula active',
      'Front hand reach and cross',
      'Activate hands, arms, core',
      'Shoulders on top of your front foot o más adelante',
    ],
  },
  {
    n: 5,
    es: 'Rotación con oblicuo y mirada',
    en: 'Rotation — the Bottom Turn',
    sub: 'Partiendo de postura. Frontside y backside.',
    subEn: 'Starting from your stance. Frontside and backside.',
    checkpoints: [
      'Partiendo de postura',
      'Peso en pie delantero',
      'Ver en la dirección donde quiero cruzar',
      'Usar mi oblicuo',
      'Mantener la posición',
      'En espuma: la energía me empujará en algún momento',
      'En la ola: continuar',
      'FS · codo y antebrazo, mano a ras de agua · palma hacia abajo · hold',
      'BS · brazo de enfrente a la altura del hombro · punta de los dedos a ras de agua · hold',
    ],
  },
  {
    n: 6,
    es: 'Proyección',
    en: 'Projection',
    sub: 'Adds more angle and speed.',
    subEn: 'Adds more angle and speed.',
    checkpoints: [
      'FS · Hips up and forward',
      'FS · Touch water + tirar balón por atrás',
      'FS · Scapula locked, chest out apuntando a donde quiero ir',
      'FS · Peso en el pie de adelante',
      'BS · Look at the target',
      'BS · Estirar pierna delantera',
      'BS · Choke — apuntar con el pecho donde quiero ir',
    ],
  },
  {
    n: 7,
    es: 'Maniobras',
    en: 'Maneuvers',
    sub: 'El dibujo en la cara de la ola — y cómo termina la ola.',
    subEn: 'The line you draw on the wave — and how the ride ends.',
    checkpoints: [
      'FS · Cruz de cristo — pecho alineado con la cadera o más adelante',
      'FS · Ver sobre el hombro y activar oblicuo',
      'FS · Tirar granada',
      'FS · Tapaloco',
      'FS · Postura',
      'BS · Tapaloco',
      'BS · Codazo',
      'BS · Touch the board',
      'BS · Impulse',
      'BS · Postura',
      'Novice · Desmontar',
      'Novice · Caída de estrella',
    ],
  },
];

/** The numbers in order. 4 is absent because the source document has no block 4. */
export const BLOCK_NUMBERS = LEARNING_BLOCKS.map((b) => b.n);

/**
 * The integration modules. These are NOT learning blocks — they are the
 * modules and certifications that close a belt, plus the two pumping patterns
 * (which the source document defines as a pattern spanning blocks, not as a
 * block member: "el pumping está compuesto por Postura + Proyección + Cruz +
 * Vuelta a postura").
 */
export const INTEGRATION_GROUP = {
  es: 'Integración y certificación',
  en: 'Integration & Certification',
  sub: 'Módulos que cierran la cinta. No son un bloque de aprendizaje.',
  subEn: 'The modules that close the belt. These are not learning blocks.',
} as const;

// ---------------------------------------------------------------------------
// Step → block
// ---------------------------------------------------------------------------

/** Stable key for a lesson: `course_section:step_number`. Unique across the
 *  belt sections (white/yellow/blue) — verified against production. */
export function stepKey(courseSection: string, stepNumber: number | string): string {
  return `${courseSection}:${stepNumber}`;
}

/**
 * Canonical order. Each block lists its steps in the order they happen in the
 * water. A step appears exactly once here; sequences below may reuse it.
 * `null` = integration module, rendered after every block.
 */
export const BLOCK_STEPS: { block: number | null; steps: string[] }[] = [
  {
    block: 0,
    steps: [
      'white_belt:1',   // Venue Analysis
      'white_belt:2',   // Warm Up
      'white_belt:3',   // Grab Board
      'white_belt:4',   // Walk Out
      'white_belt:5',   // Put Board in the Water
      'white_belt:6',   // Control Your Board
      'white_belt:7',   // Go Through Whitewater Standing
      'white_belt:8',   // Turn Around Safely
      'white_belt:9',   // Walk Back to the Sand
      'white_belt:10',  // Get on Your Board / Find Sweet Spot
      'white_belt:25',  // Turn Left and Right Lying on Board
      'white_belt:23',  // Paddle Out
      'white_belt:24',  // Turtle Roll
    ],
  },
  {
    block: 1,
    steps: [
      'yellow_belt:29', // Paddle with the Correct Angle
      'yellow_belt:27', // Paddling Speeds 1-2-3-4
      'white_belt:11',  // Get Aligned with the White Water
      'white_belt:12',  // Paddle to Catch White Water
      'yellow_belt:28', // Chase the Pocket
      'yellow_belt:32', // Out from the Shoulder
      'yellow_belt:33', // Reading Wave Stages 1-4 in the Lineup
      'white_belt:13',  // Cobra + Turn Left and Right
      'white_belt:15',  // Cobra Pick Line
      'yellow_belt:34', // Cobra + Pick Line
    ],
  },
  {
    block: 2,
    steps: [
      'white_belt:16',  // Pop-Up
      'yellow_belt:30', // Pop Up + Foot Position 1 or 2
      'white_belt:17',  // Feet Position Center #2
      'white_belt:19',  // Impulse - Forward Momentum
    ],
  },
  {
    block: 3,
    steps: [
      'white_belt:18',  // Power Stance / Posture
      'blue_belt:35',   // Foot Position 1 (FP1) Operationalized at Blue Belt
      'yellow_belt:31', // Go Up and Down
    ],
  },
  {
    block: 5,
    steps: [
      'white_belt:22',  // Turn Frontside
      'white_belt:21',  // Turn Backside
      'blue_belt:38',   // BS Body Mechanics
      'blue_belt:39',   // Bottom Turn Medium - Frontside
      'blue_belt:396',  // Bottom Turn Medium - Backside
      'blue_belt:47',   // Hold
      'blue_belt:49',   // Hold Rotation
    ],
  },
  {
    block: 6,
    steps: [
      'blue_belt:40',   // Projection
      'blue_belt:43',   // Choke (BS Projection)
    ],
  },
  {
    block: 7,
    steps: [
      'blue_belt:41',   // Cruz Snap
      'blue_belt:42',   // Grenade
      'blue_belt:46',   // Cruz Cutback
      'blue_belt:44',   // Tapaloco Snap
      'blue_belt:45',   // Elbow (BS Closure)
      'blue_belt:48',   // Tapaloco Cutback
      'white_belt:14',  // Prone Dismount
      'white_belt:20',  // Starfish Dismount
    ],
  },
  {
    block: null,
    steps: [
      'blue_belt:36',   // Pump Frontside
      'blue_belt:37',   // Pump Backside
      'blue_belt:500',  // Blue Belt Foundation Sequence (17 elements)
      'yellow_belt:700',// Module 7 - The Complete Ride
      'blue_belt:590',  // The Four Blue Belt Concepts
      'blue_belt:600',  // The Complete Blue Belt Ride (Integration Module)
      'yellow_belt:800',// Yellow Belt Certification - Path to Blue
      'blue_belt:800',  // Blue Belt Self-Evaluation - Path to Purple
    ],
  },
];

/** key -> { block, position } for O(1) lookup and stable sorting. */
export const STEP_PLACEMENT: Record<string, { block: number | null; pos: number }> =
  (() => {
    const out: Record<string, { block: number | null; pos: number }> = {};
    let pos = 0;
    for (const g of BLOCK_STEPS) {
      for (const k of g.steps) out[k] = { block: g.block, pos: pos++ };
    }
    return out;
  })();

/** Where a step sits in the canonical order. Unmapped steps sort last, keeping
 *  their relative order — a step added to `lessons` still shows up. */
export function stepRank(courseSection: string, stepNumber: number | string): number {
  const p = STEP_PLACEMENT[stepKey(courseSection, stepNumber)];
  return p ? p.pos : Number.MAX_SAFE_INTEGER;
}

/** Block a step belongs to; null = integration module; undefined = unmapped. */
export function blockOf(
  courseSection: string,
  stepNumber: number | string
): number | null | undefined {
  return STEP_PLACEMENT[stepKey(courseSection, stepNumber)]?.block;
}

export function blockMeta(n: number): LearningBlock | undefined {
  return LEARNING_BLOCKS.find((b) => b.n === n);
}

// ---------------------------------------------------------------------------
// The infinite circle + the six Blue Belt sequences
// ---------------------------------------------------------------------------

/**
 * The closing concept, verbatim from the source document: every sequence ends
 * by returning to posture. This is why a sequence has a start and an end.
 */
export const INFINITE_CIRCLE = [
  'Postura',
  'Rotación',
  'Proyección',
  'Maniobra',
  'Impulse · pump',
  'Vuelta a postura',
] as const;

/** Source document, verbatim. */
export const PUMPING_PATTERN = 'Postura + Proyección + Cruz + Vuelta a postura';

/** Los tres círculos de poder — the fundamentals, not a block. */
export const THREE_CIRCLES: { name: string; detail: string }[] = [
  {
    name: 'Conectar con la tabla',
    detail: 'Que se convierta en una extensión de tu cuerpo.',
  },
  {
    name: 'Conectar con el cuerpo',
    detail: 'Los movimientos biomecánicos — cruzar de derecha a izquierda.',
  },
  {
    name: 'La ola y su energía',
    detail:
      'Cómo dibujar en la cara de la ola; manejar las fuerzas externas —ola, viento— y las internas —comprimir y estirar—.',
  },
];

export interface SequenceStage {
  /** Stage name, staff-facing (Spanish). */
  stage: string;
  /** Same stage, student-facing (English). */
  stageEn: string;
  /** One or more step keys performed at this stage. */
  steps: string[];
}

export interface BeltSequence {
  id: string;
  /** Número de secuencia del método, continuo desde White Belt:
   *  White #1-#5, Yellow #6-#7, Blue #8-#13. */
  number: number;
  /** Student-facing name, English. */
  name: string;
  side: 'fs' | 'bs';
  belt: string;
  stages: SequenceStage[];
}

/**
 * Nota de método (Marcelo 2026-08-27): el "turn" y el "bottom turn" son la
 * MISMA acción — una rotación simple que nace de la postura. "Bottom turn" es
 * el nombre que se le da cuando esa rotación dibuja la U. Por eso la rotación
 * no lleva un paso propio en la secuencia: el bottom turn ya es ese paso, y
 * lo que le sigue es la proyección.
 *
 * The six Blue Belt sequences, each with a start and an end. A step repeats
 * across sequences on purpose — that is how the method works.
 * Every sequence closes by returning to posture (INFINITE_CIRCLE).
 *
 * Los números son continuos desde White Belt (#1-#5) y Yellow (#6-#7): Blue
 * es #8 a #13. Un paso de la secuencia puede vivir en una cinta anterior — la
 * postura es White Belt — y por eso la cadena se resuelve contra todas las
 * lecciones del alumno, no solo las de su cinta.
 */
export const BELT_SEQUENCES: BeltSequence[] = [
  {
    id: 'BB-SEQ-PUMP-FS',
    number: 8,
    name: 'Frontside Pumping',
    side: 'fs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', stageEn: 'Foot position', steps: ['blue_belt:35'] },
      { stage: 'Postura', stageEn: 'Stance', steps: ['white_belt:18'] },
      { stage: 'Generar velocidad', stageEn: 'Generate speed', steps: ['blue_belt:36'] },
    ],
  },
  {
    id: 'BB-SEQ-PUMP-BS',
    number: 9,
    name: 'Backside Pumping',
    side: 'bs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', stageEn: 'Foot position', steps: ['blue_belt:35'] },
      { stage: 'Postura', stageEn: 'Stance', steps: ['white_belt:18'] },
      // BS Body Mechanics es CÓMO se genera la fuerza para bombear backside
      // —pecho abierto, ojos sobre el hombro—, no la postura. Su propio
      // subtítulo en la base dice "Sequence #9 · Step 2": es de acá y de
      // ninguna otra secuencia.
      { stage: 'Mecánica backside', stageEn: 'Backside mechanics', steps: ['blue_belt:38'] },
      { stage: 'Generar velocidad', stageEn: 'Generate speed', steps: ['blue_belt:37'] },
    ],
  },
  {
    id: 'BB-SEQ-SNAP-FS',
    number: 10,
    name: 'Frontside Snap',
    side: 'fs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', stageEn: 'Foot position', steps: ['blue_belt:35'] },
      { stage: 'Postura', stageEn: 'Stance', steps: ['white_belt:18'] },
      { stage: 'Bottom turn', stageEn: 'Bottom turn', steps: ['blue_belt:39'] },
      { stage: 'Proyección', stageEn: 'Projection', steps: ['blue_belt:40'] },
      { stage: 'Maniobra', stageEn: 'Maneuver', steps: ['blue_belt:41'] },
      { stage: 'Cierre', stageEn: 'Closure', steps: ['blue_belt:42'] },
    ],
  },
  {
    id: 'BB-SEQ-SNAP-BS',
    number: 11,
    name: 'Backside Snap',
    side: 'bs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', stageEn: 'Foot position', steps: ['blue_belt:35'] },
      { stage: 'Postura', stageEn: 'Stance', steps: ['white_belt:18'] },
      { stage: 'Bottom turn', stageEn: 'Bottom turn', steps: ['blue_belt:396'] },
      { stage: 'Proyección', stageEn: 'Projection', steps: ['blue_belt:43'] },
      { stage: 'Maniobra', stageEn: 'Maneuver', steps: ['blue_belt:44'] },
      { stage: 'Cierre', stageEn: 'Closure', steps: ['blue_belt:45'] },
    ],
  },
  {
    id: 'BB-SEQ-CUTBACK-FS',
    number: 12,
    name: 'Frontside Cutback',
    side: 'fs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', stageEn: 'Foot position', steps: ['blue_belt:35'] },
      { stage: 'Postura', stageEn: 'Stance', steps: ['white_belt:18'] },
      { stage: 'Bottom turn', stageEn: 'Bottom turn', steps: ['blue_belt:39'] },
      { stage: 'Proyección', stageEn: 'Projection', steps: ['blue_belt:40'] },
      { stage: 'Maniobra', stageEn: 'Maneuver', steps: ['blue_belt:46'] },
      { stage: 'Cierre', stageEn: 'Closure', steps: ['blue_belt:47'] },
    ],
  },
  {
    id: 'BB-SEQ-CUTBACK-BS',
    number: 13,
    name: 'Backside Cutback',
    side: 'bs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', stageEn: 'Foot position', steps: ['blue_belt:35'] },
      { stage: 'Postura', stageEn: 'Stance', steps: ['white_belt:18'] },
      { stage: 'Bottom turn', stageEn: 'Bottom turn', steps: ['blue_belt:396'] },
      { stage: 'Proyección', stageEn: 'Projection', steps: ['blue_belt:43'] },
      { stage: 'Maniobra', stageEn: 'Maneuver', steps: ['blue_belt:48'] },
      { stage: 'Cierre', stageEn: 'Closure', steps: ['blue_belt:49', 'blue_belt:45'] },
    ],
  },
];

/** key -> the sequences that use it, with the stage it plays there. */
export const STEP_SEQUENCES: Record<
  string,
  { id: string; number: number; name: string; side: 'fs' | 'bs'; stage: string; stageEn: string }[]
> = (() => {
  const out: Record<
    string,
    { id: string; number: number; name: string; side: 'fs' | 'bs'; stage: string; stageEn: string }[]
  > = {};
  for (const seq of BELT_SEQUENCES) {
    for (const st of seq.stages) {
      for (const k of st.steps) {
        (out[k] ??= []).push({
          id: seq.id,
          number: seq.number,
          name: seq.name,
          side: seq.side,
          stage: st.stage,
          stageEn: st.stageEn,
        });
      }
    }
  }
  return out;
})();

export function sequencesFor(
  courseSection: string,
  stepNumber: number | string
): { id: string; number: number; name: string; side: 'fs' | 'bs'; stage: string; stageEn: string }[] {
  return STEP_SEQUENCES[stepKey(courseSection, stepNumber)] ?? [];
}

// ---------------------------------------------------------------------------
// Sorting + grouping helpers — used by every surface so they all agree.
// ---------------------------------------------------------------------------

export interface BlockGroupable {
  course_section: string;
  step_number: number | string;
}

/** Sort any list of lessons into the canonical Learning Blocks order. */
export function sortByBlocks<T extends BlockGroupable>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      stepRank(a.course_section, a.step_number) -
      stepRank(b.course_section, b.step_number)
  );
}

export interface BlockGroup<T> {
  /** Unique React key. Integration and unmapped both carry block === null,
   *  so the block number alone is not unique. */
  key: string;
  block: number | null;
  /** undefined for the integration group. */
  meta?: LearningBlock;
  label: string;
  sub: string;
  rows: T[];
}

/** Group lessons under their block, in canonical order. Blocks with no rows
 *  are dropped. Unmapped rows land in a final group with block `undefined`. */
export function groupByBlocks<T extends BlockGroupable>(
  rows: T[],
  lang: 'es' | 'en' = 'es'
): BlockGroup<T>[] {
  const known = new Set(LEARNING_BLOCKS.map((b) => b.n));
  const buckets = new Map<string, T[]>();
  for (const r of sortByBlocks(rows)) {
    const b = blockOf(r.course_section, r.step_number);
    // Un número de bloque sin entrada en LEARNING_BLOCKS no tiene nombre ni
    // orden: se trata como no mapeado en vez de desaparecer de la pantalla.
    const k = b === undefined || (b !== null && !known.has(b)) ? 'x' : b === null ? 'i' : String(b);
    (buckets.get(k) ?? buckets.set(k, []).get(k)!).push(r);
  }
  const out: BlockGroup<T>[] = [];
  for (const b of LEARNING_BLOCKS) {
    const rs = buckets.get(String(b.n));
    if (rs?.length) {
      out.push({
        key: `b${b.n}`,
        block: b.n,
        meta: b,
        label: lang === 'en' ? b.en : b.es,
        sub: lang === 'en' ? b.subEn : b.sub,
        rows: rs,
      });
    }
  }
  const integ = buckets.get('i');
  if (integ?.length) {
    out.push({
      key: 'integration',
      block: null,
      label: lang === 'en' ? INTEGRATION_GROUP.en : INTEGRATION_GROUP.es,
      sub: lang === 'en' ? INTEGRATION_GROUP.subEn : INTEGRATION_GROUP.sub,
      rows: integ,
    });
  }
  const rest = buckets.get('x');
  if (rest?.length) {
    out.push({
      key: 'unmapped',
      block: null,
      label: lang === 'en' ? 'Other steps' : 'Otros pasos',
      sub:
        lang === 'en'
          ? 'Steps that are not assigned to a block yet.'
          : 'Pasos que todavía no están asignados a un bloque.',
      rows: rest,
    });
  }
  return out;
}

/** True cuando NINGUNA de las filas cae en un bloque conocido — el caso de
 *  purple/brown/black y de los cursos de coach, que todavía no están mapeados.
 *  Las superficies la usan para no colapsar un curso entero en "Other steps". */
export function isMappedToBlocks<T extends BlockGroupable>(rows: T[]): boolean {
  return rows.some((r) => blockOf(r.course_section, r.step_number) !== undefined);
}

/**
 * El mapa del recorrido que el alumno de Blue Belt ya trae de White y Yellow:
 * los tres primeros bloques. Se muestra solo como recordatorio —título y
 * cuántos pasos tiene— sin lecciones adentro, así que no cuenta para el
 * progreso ni para el examen final del curso.
 */
export const PRIOR_PATH_BLOCKS: { n: number; en: string; es: string; count: number }[] =
  [0, 1, 2].map((n) => {
    const meta = LEARNING_BLOCKS.find((b) => b.n === n)!;
    const grp = BLOCK_STEPS.find((g) => g.block === n);
    return { n, en: meta.en, es: meta.es, count: grp ? grp.steps.length : 0 };
  });

/** La lección que enseña los tres círculos. Vive en yb_onboarding y el curso
 *  de Blue ya la incluye entre sus secciones compartidas. */
export const THREE_CIRCLES_LESSON_ID = 'YB-FND-01';

/**
 * Secuencias del curso que se completan con pasos PRESTADOS de otra cinta.
 *
 * La tabla `lessons` deja a cada paso en una sola secuencia (`wb_sequence_id`),
 * así que no se puede poner "Get on Your Board" en la secuencia 2 de White Y
 * en la 6 de Yellow al mismo tiempo. Esto lo resuelve en pantalla: define el
 * orden completo de la secuencia y el curso la arma con esos pasos, vengan de
 * donde vengan. Ninguna fila se toca, así que White queda igual.
 *
 * Clave: wb_sequence_id. Valor: los pasos en orden, con la llave estable
 * `course_section:step_number`.
 */
export const COURSE_SEQUENCE_ORDER: Record<string, string[]> = {
  // Yellow Belt · Secuencia 6 — "Reading & Earning the Wave".
  // Marcelo (2026-08-27): que cierre completa, para que un Yellow Belt no se
  // pierda nada de lo importante. Arranca subiéndose a la tabla y pasando la
  // espuma, y termina desmontando por el hombro.
  // Blue Belt · las seis secuencias #8-#13, completas de principio a fin.
  // Cada una arranca en la posición del pie y la postura —que viven en White—
  // y cierra volviendo a ella (el círculo infinito del método).
  'BB-SEQ-08': ['blue_belt:35', 'white_belt:18', 'blue_belt:36'],
  'BB-SEQ-09': ['blue_belt:35', 'white_belt:18', 'blue_belt:38', 'blue_belt:37'],
  'BB-SEQ-10': ['blue_belt:35', 'white_belt:18', 'blue_belt:39', 'blue_belt:40', 'blue_belt:41', 'blue_belt:42'],
  'BB-SEQ-11': ['blue_belt:35', 'white_belt:18', 'blue_belt:396', 'blue_belt:43', 'blue_belt:44', 'blue_belt:45'],
  'BB-SEQ-12': ['blue_belt:35', 'white_belt:18', 'blue_belt:39', 'blue_belt:40', 'blue_belt:46', 'blue_belt:47'],
  'BB-SEQ-13': ['blue_belt:35', 'white_belt:18', 'blue_belt:396', 'blue_belt:43', 'blue_belt:48', 'blue_belt:49', 'blue_belt:45'],

  'YB-SEQ-6.0': [
    'white_belt:10',  // Get on Your Board / Find Sweet Spot   ← prestado de White
    'white_belt:24',  // Turtle Roll                           ← prestado de White
    'yellow_belt:27', // Paddling Speeds 1-2-3-4
    'yellow_belt:33', // Reading Wave Stages 1-4 in the Lineup
    'yellow_belt:28', // Chase the Pocket
    'yellow_belt:29', // Paddle with the Correct Angle
    'yellow_belt:34', // Cobra + Pick Line
    'yellow_belt:32', // Out from the Shoulder  ← el cierre: desmontar al costado
  ],
};

/** La etapa que juega cada paso dentro de una secuencia del curso, para
 *  rotularla en la lista: "Foot position", "Bottom turn", "Closure"… */
export const COURSE_SEQUENCE_STAGE: Record<string, Record<string, string>> = (() => {
  const out: Record<string, Record<string, string>> = {};
  const bySeqId: Record<string, string> = {
    'BB-SEQ-08': 'BB-SEQ-PUMP-FS',
    'BB-SEQ-09': 'BB-SEQ-PUMP-BS',
    'BB-SEQ-10': 'BB-SEQ-SNAP-FS',
    'BB-SEQ-11': 'BB-SEQ-SNAP-BS',
    'BB-SEQ-12': 'BB-SEQ-CUTBACK-FS',
    'BB-SEQ-13': 'BB-SEQ-CUTBACK-BS',
  };
  for (const [courseSeq, defId] of Object.entries(bySeqId)) {
    const def = BELT_SEQUENCES.find((s) => s.id === defId);
    if (!def) continue;
    const m: Record<string, string> = {};
    for (const st of def.stages) for (const k of st.steps) m[k] = st.stageEn;
    out[courseSeq] = m;
  }
  return out;
})();

/**
 * Estrellas que necesita CADA paso de una secuencia para darla por lograda.
 * Es la regla del canon: 4★ en cada parte de la secuencia, no un promedio.
 * El promedio miente — un snap con bottom turn 5★ y proyección 2★ promedia
 * 3.5 y no funciona. El paso más débil no miente nunca.
 */
export const SEQUENCE_PASS_STARS = 4;

// ---------------------------------------------------------------------------
// Agrupar un catálogo de pasos en las secuencias del método.
// Lo usan las DOS puertas de la evaluación oficial: el cierre de un camp y la
// ficha del alumno. Es la misma evaluación — cerrar un camp es solo uno de los
// momentos en que se corre.
// ---------------------------------------------------------------------------

export interface SequenceGroupable {
  step_id: string;
  course_section?: string | null;
  step_number?: number | null;
  sequence_id?: string | null;
  sequence_name?: string | null;
  sequence_order?: number | null;
  sequence_step_order?: number | null;
}

export interface SequenceGroup<T> {
  id: string;
  name: string;
  order: number;
  rows: T[];
}

/**
 * Agrupa por secuencia, respetando COURSE_SEQUENCE_ORDER cuando la secuencia
 * se completa con pasos de una cinta anterior. Los pasos sin secuencia salen
 * aparte en `orphans` — no se pierden.
 */
export function groupBySequence<T extends SequenceGroupable>(
  rows: T[]
): { groups: SequenceGroup<T>[]; orphans: T[] } {
  const byKey = new Map<string, T>();
  for (const r of rows) {
    if (r.course_section && r.step_number != null) {
      byKey.set(stepKey(r.course_section, r.step_number), r);
    }
  }
  const seen: string[] = [];
  for (const r of rows) {
    if (r.sequence_id && !seen.includes(r.sequence_id)) seen.push(r.sequence_id);
  }
  const groups = seen
    .map((sid) => {
      const meta = rows.find((r) => r.sequence_id === sid)!;
      const order = COURSE_SEQUENCE_ORDER[sid];
      const list = order
        ? order.map((k) => byKey.get(k)).filter((r): r is T => Boolean(r))
        : rows
            .filter((r) => r.sequence_id === sid)
            .sort(
              (a, b) =>
                (a.sequence_step_order ?? a.step_number ?? 0) -
                (b.sequence_step_order ?? b.step_number ?? 0)
            );
      return {
        id: sid,
        name: meta.sequence_name ?? sid,
        order: meta.sequence_order ?? 99,
        rows: list,
      };
    })
    .filter((g) => g.rows.length > 0)
    .sort((a, b) => a.order - b.order);
  return { groups, orphans: rows.filter((r) => !r.sequence_id) };
}

/** El estado de una secuencia a partir de las notas de sus pasos. */
export function sequenceVerdict(stars: (number | null)[]): {
  state: 'owned' | 'working' | 'partial' | 'unrated';
  min: number | null;
  /** Índice del paso más TEMPRANO que no llega a la barra. -1 si ninguno. */
  blockerIndex: number;
} {
  const rated = stars.filter((v): v is number => v !== null);
  const min = rated.length ? Math.min(...rated) : null;
  const blockerIndex = stars.findIndex(
    (v) => v !== null && v < SEQUENCE_PASS_STARS
  );
  const state =
    rated.length === 0
      ? 'unrated'
      : rated.length < stars.length
        ? 'partial'
        : min! >= SEQUENCE_PASS_STARS
          ? 'owned'
          : 'working';
  return { state, min, blockerIndex };
}

// ═══ QUÉ SECUENCIAS LLEVAN NÚMERO ═══
//
// Los escalones numerados del método son del #1 al #13. Tres secuencias NO
// son escalones y por eso su número quedaba raro: dos se mostraban como "#14"
// (una de Yellow y otra de Blue — dos cosas distintas con el mismo número) y
// la base de Blue como "#0".
//
//   BB-SEQ-FOUND     los 17 elementos que se tienen ANTES de las maniobras
//   BB-SEQ-CONCEPTS  los cuatro conceptos + la ola completa, al CERRAR Blue
//   YB-SEQ-8         la ola completa + la certificación, al CERRAR Yellow
//
// La regla "solo del 1 al 13 lleva número" ya vivía copiada en cuatro
// pantallas y faltaba en la quinta (la guía del alumno), que es donde se vio
// el problema. Acá, una sola vez.

export type SequenceRole = 'foundation' | 'closing';

export const SEQUENCE_ROLE: Record<string, SequenceRole> = {
  'BB-SEQ-FOUND': 'foundation',   // los 17 elementos, antes de las maniobras
  'YB-SEQ-8': 'closing',          // la ola completa + certificación de Yellow
  'BB-SEQ-CONCEPTS': 'closing',   // los cuatro conceptos + la ola completa
  'BB-SEQ-EXIT': 'closing',       // auto-evaluación + certificación de Blue
};

const SEQUENCE_ROLE_LABEL: Record<SequenceRole, string> = {
  foundation: 'Foundation',
  closing: 'Closing',
};

/** El rótulo de la secuencia: "#8", "Foundation", "Closing" — o null. */
export function sequencePrefix(
  id: string | null | undefined,
  order: number | null | undefined,
): string | null {
  const role = id ? SEQUENCE_ROLE[id] : undefined;
  if (role) return SEQUENCE_ROLE_LABEL[role];
  if (order != null && order >= 1 && order <= 13) return `#${order}`;
  return null;
}

/** "#8 · Frontside Pumping" — o solo el nombre cuando no lleva rótulo. */
export function sequenceLabel(
  id: string | null | undefined,
  order: number | null | undefined,
  name: string,
): string {
  const p = sequencePrefix(id, order);
  return p ? `${p} · ${name}` : name;
}
