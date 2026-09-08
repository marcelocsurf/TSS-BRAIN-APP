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

export interface SequencePageConfig {
  id: string;
  belt: 'white_belt' | 'yellow_belt' | 'blue_belt' | 'purple_belt';
  courseKey: string;
  number: number;
  title: string;
  stepIds: string[];
  think: {
    whatIs: { headline: string; line: string; where: string; whatFor: string };
    feet: { text: string; phases: { phase: string; back: BackFoot; note?: string }[] };
    /** Lección de la que se lee "How your body does it" y "The rules". */
    bodyFromLesson: string;
    keyWords: { label: string; words: string[] }[];
    board: WaveBoardData;
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
    whenNot: { symptom: string; label: string; lessonId: string; stepId?: string }[];
  };
  review: {
    groups: { title: string; indicators: Indicator[] }[];
    howItFeels: string;
  };
}
