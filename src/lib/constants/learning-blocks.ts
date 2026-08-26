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
  /** One line of context, staff-facing. */
  sub: string;
  /** Checkpoints as written in the source document. */
  checkpoints: string[];
}

export const LEARNING_BLOCKS: LearningBlock[] = [
  {
    n: 0,
    es: 'Pre surf — preparación y posicionamiento',
    en: 'Before You Paddle Out',
    sub: 'Leer el lugar, prepararse y llegar al punto donde empieza el surf.',
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
    checkpoints: [
      'Pecho apunta en dirección de la nariz de la tabla',
      'Get low',
      'Knee in (foot on the tip)',
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
  /** Stage name, staff-facing. */
  stage: string;
  /** One or more step keys performed at this stage. */
  steps: string[];
}

export interface BeltSequence {
  id: string;
  /** Student-facing name, English. */
  name: string;
  side: 'fs' | 'bs';
  belt: string;
  stages: SequenceStage[];
}

/**
 * The six Blue Belt sequences, each with a start and an end. A step repeats
 * across sequences on purpose — that is how the method works.
 * Every sequence closes by returning to posture (INFINITE_CIRCLE).
 */
export const BELT_SEQUENCES: BeltSequence[] = [
  {
    id: 'BB-SEQ-PUMP-FS',
    name: 'Frontside Pumping',
    side: 'fs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', steps: ['blue_belt:35'] },
      { stage: 'Postura', steps: ['white_belt:18'] },
      { stage: 'Generar velocidad', steps: ['blue_belt:36'] },
    ],
  },
  {
    id: 'BB-SEQ-PUMP-BS',
    name: 'Backside Pumping',
    side: 'bs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', steps: ['blue_belt:35'] },
      { stage: 'Postura backside', steps: ['blue_belt:38'] },
      { stage: 'Generar velocidad', steps: ['blue_belt:37'] },
    ],
  },
  {
    id: 'BB-SEQ-SNAP-FS',
    name: 'Frontside Snap',
    side: 'fs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', steps: ['blue_belt:35'] },
      { stage: 'Postura', steps: ['white_belt:18'] },
      { stage: 'Bottom turn', steps: ['blue_belt:39'] },
      { stage: 'Proyección', steps: ['blue_belt:40'] },
      { stage: 'Maniobra', steps: ['blue_belt:41'] },
      { stage: 'Cierre', steps: ['blue_belt:42'] },
    ],
  },
  {
    id: 'BB-SEQ-SNAP-BS',
    name: 'Backside Snap',
    side: 'bs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', steps: ['blue_belt:35'] },
      { stage: 'Postura backside', steps: ['blue_belt:38'] },
      { stage: 'Bottom turn', steps: ['blue_belt:396'] },
      { stage: 'Proyección', steps: ['blue_belt:43'] },
      { stage: 'Maniobra', steps: ['blue_belt:44'] },
      { stage: 'Cierre', steps: ['blue_belt:45'] },
    ],
  },
  {
    id: 'BB-SEQ-CUTBACK-FS',
    name: 'Frontside Cutback',
    side: 'fs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', steps: ['blue_belt:35'] },
      { stage: 'Postura', steps: ['white_belt:18'] },
      { stage: 'Bottom turn', steps: ['blue_belt:39'] },
      { stage: 'Proyección', steps: ['blue_belt:40'] },
      { stage: 'Maniobra', steps: ['blue_belt:46'] },
      { stage: 'Cierre', steps: ['blue_belt:47'] },
    ],
  },
  {
    id: 'BB-SEQ-CUTBACK-BS',
    name: 'Backside Cutback',
    side: 'bs',
    belt: 'blue_belt',
    stages: [
      { stage: 'Posición del pie', steps: ['blue_belt:35'] },
      { stage: 'Postura backside', steps: ['blue_belt:38'] },
      { stage: 'Bottom turn', steps: ['blue_belt:396'] },
      { stage: 'Proyección', steps: ['blue_belt:43'] },
      { stage: 'Maniobra', steps: ['blue_belt:48'] },
      { stage: 'Cierre', steps: ['blue_belt:49', 'blue_belt:45'] },
    ],
  },
];

/** key -> the sequences that use it, with the stage it plays there. */
export const STEP_SEQUENCES: Record<
  string,
  { id: string; name: string; side: 'fs' | 'bs'; stage: string }[]
> = (() => {
  const out: Record<
    string,
    { id: string; name: string; side: 'fs' | 'bs'; stage: string }[]
  > = {};
  for (const seq of BELT_SEQUENCES) {
    for (const st of seq.stages) {
      for (const k of st.steps) {
        (out[k] ??= []).push({
          id: seq.id,
          name: seq.name,
          side: seq.side,
          stage: st.stage,
        });
      }
    }
  }
  return out;
})();

export function sequencesFor(
  courseSection: string,
  stepNumber: number | string
): { id: string; name: string; side: 'fs' | 'bs'; stage: string }[] {
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
  const buckets = new Map<string, T[]>();
  for (const r of sortByBlocks(rows)) {
    const b = blockOf(r.course_section, r.step_number);
    const k = b === undefined ? 'x' : b === null ? 'i' : String(b);
    (buckets.get(k) ?? buckets.set(k, []).get(k)!).push(r);
  }
  const out: BlockGroup<T>[] = [];
  for (const b of LEARNING_BLOCKS) {
    const rs = buckets.get(String(b.n));
    if (rs?.length) {
      out.push({
        block: b.n,
        meta: b,
        label: lang === 'en' ? b.en : b.es,
        sub: b.sub,
        rows: rs,
      });
    }
  }
  const integ = buckets.get('i');
  if (integ?.length) {
    out.push({
      block: null,
      label: lang === 'en' ? INTEGRATION_GROUP.en : INTEGRATION_GROUP.es,
      sub: INTEGRATION_GROUP.sub,
      rows: integ,
    });
  }
  const rest = buckets.get('x');
  if (rest?.length) {
    out.push({
      block: null,
      label: lang === 'en' ? 'Other steps' : 'Otros pasos',
      sub: 'Pasos que todavía no están asignados a un bloque.',
      rows: rest,
    });
  }
  return out;
}
