// ═══ Página de secuencia en 4 pestañas (Think · Feel · Do · Review) ═══
// Modelo aprobado por Marcelo el 2026-09-09 (ver memoria "curso 4 pestañas").
// Primera secuencia: BB-SEQ-08 Frontside Pumping. Lo que viene de la base
// (lecciones, drills, misiones) se lee en la página; lo que todavía no existe
// como dato (resultado de la misión, criterios aprobados, tablero) vive acá
// como config hasta que se decida moverlo a la base.

export type Command = 'posture' | 'rail' | 'projection' | 'maneuver' | 'closure';

/** Un tramo de la línea sobre la cara desplegada (SVG path en un viewBox 720×300). */
export interface WaveSegment {
  d: string;
  command: Command;
  /** Capa celeste encima: esta posición se sostiene. */
  hold?: boolean;
}

export interface WaveMarker { x: number; y: number; label: 'I' | 'A' | 'B' | 'M' | 'S' }

export interface WaveBoardData {
  segments: WaveSegment[];
  markers: WaveMarker[];
  pocket: { x: number; y: number };
  zoneLabels?: [string, string, string, string];
}

export type BackFoot = 'P1' | 'P2' | 'P3';

export interface Indicator {
  /** Qué se ve cuando salió. */
  ok: string;
  /** Qué se ve cuando faltó — el diagnóstico. */
  no: string;
  /** La instrucción en pocas palabras. */
  fix: string;
  /** Dónde profundizar si el fix no alcanza. */
  step?: { label: string; lessonId: string };
}

export interface SequenceDetail {
  key: string;
  title: string;
  /** El comando del método al que corresponde este paso (da el color). */
  command?: Command;
  /** Cómo se ve cuando se rompe ahí (para elegirlo como foco). */
  symptom: string;
  indicators: Indicator[];
  /** Ir más adentro: la lección del paso y, si existe, su drill / misión general. */
  deeper?: { label: string; lessonId: string; drillId?: string; missionId?: string };
}

export interface SequencePageConfig {
  id: string;
  /** 'loop' (default) = secuencia de maniobra con tablero y pies; 'entry' =
   *  secuencia de entrada (bloques 1-3), sin tablero ni pies. */
  kind?: 'loop' | 'entry' | 'circle';
  /** Círculos de poder como secuencia (2026-09-19): paso → su juego (Do it). */
  games?: Record<string, string>;
  /** Círculos de UN solo paso (Board, Wave · Marcelo 2026-09-21): los elementos
   *  que se pueden planear o romper viven acá, con ids virtuales
   *  ('CIRCLE-BOARD:P1'); stepId es la lección real detrás. */
  elements?: { id: string; title: string; stepId: string }[];
  /** Rótulo de arriba cuando no es "Sequence #n". */
  eyebrow?: string;
  belt: 'white_belt' | 'yellow_belt' | 'blue_belt' | 'purple_belt';
  courseKey: string;
  /** Otros cursos que también abren esta página. Las de entrada (Navigate the
   *  Ocean · Pick Your Line + Pop-Up) son de Yellow y de Blue: Marcelo
   *  2026-09-26 las quiere también en el curso Yellow. Solo la ruta lo lee;
   *  no crea una secuencia nueva en planner, cierre ni Let's Play. */
  alsoCourseKeys?: string[];
  /** Desde esos otros cursos, el botón de Let's Play entrena ESTA secuencia
   *  (curso → id). Let's Play arma BB-NAV/BB-LINE solo para Blue; un alumno
   *  Yellow las entrena dentro de su #6 o su #7 (revisión 2026-09-26). */
  trainAs?: Record<string, string>;
  number: number;
  title: string;
  stepIds: string[];
  /** Agrupa pasos de stepIds que son UN paso con técnicas alternativas (p. ej.
   *  turtle roll / duck dive según la tabla). Si falta, cada id es un paso. */
  stepGroups?: { ids: string[]; title: string; note?: string }[];
  /** Pasos que son de UN lado (p. ej. Turn backside / Turn frontside en White
   *  #4): la página muestra un selector Backside · Frontside que filtra los
   *  pasos y elige el video del lado (videos.ts). Los pasos sin lado quedan. */
  sideOfStep?: Record<string, 'fs' | 'bs'>;
  /** La cadena del cuerpo dentro del paso (Marcelo 2026-09-25, Directional
   *  Turns: "los pasos son postura, look, oblique, hip and rail, the board
   *  changes direction"). Se lista debajo de "The steps that build it";
   *  noteBySide cambia la palabra según el lado elegido (heels · toes). */
  chain?: { title: string; note?: string; noteBySide?: { bs: string; fs: string }; command?: Command }[];
  /** Preparación de cada sesión, fuera de la secuencia (p. ej. Venue Analysis y Warm Up en White #1). */
  prep?: { lessonId: string; label: string; note?: string }[];
  think: {
    whatIs: { headline: string; line: string; where: string; whatFor: string };
    /** Los pies como INDICADOR vivo por secuencia (Marcelo 2026-09-09): el mapa
     *  de la tabla enciende las posiciones recomendadas y apaga las que no
     *  van. `recommended` vacío o ausente = las tres sirven. */
    feet?: { text: string; options: { back: BackFoot; label: string; tradeoff: string; note?: string }[]; rule: string; recommended?: BackFoot[] };
    /** Lección de la que se lee "How your body does it" y "The rules". */
    bodyFromLesson: string;
    /** Si la secuencia abarca varias lecciones, el cuerpo y las reglas de la
     *  línea completa viven acá (markdown) y mandan sobre la lección. */
    bodyMarkdown?: string;
    rulesMarkdown?: string;
    keyWords: { label: string; words: string[] }[];
    board?: WaveBoardData;
  };
  feel: {
    visualize: string;
    /** ids de drills en tierra / agua calma y en surf skate (se leen de la base). */
    land: string[];
    skate: string[];
  };
  do: {
    result: string;
    missionId: string;
    timing: string;
    competence: string;
  };
  /** Los detalles de la secuencia: donde se puede romper. Cada uno es un foco
   *  opcional dentro de la misión, con sus indicadores y a dónde profundizar. */
  details: SequenceDetail[];
  review: { howItFeels: string };
}
