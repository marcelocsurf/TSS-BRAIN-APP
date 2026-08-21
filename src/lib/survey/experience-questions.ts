// Preguntas de la encuesta de EXPERIENCIA del camp — fuente única para las
// tres superficies (paso 2 de /feedback, /experience/[token] standalone, y la
// tarjeta del portal del alumno). Separada de questions.ts a propósito: esa
// mide la CLASE (coach, claridad, seguridad); esta mide la EXPERIENCIA
// (instalaciones, equipo, transporte, comunicación, value for money).
// Student-facing → SIEMPRE en inglés.

export type ExperienceCol =
  | 'facilities_rating'
  | 'equipment_rating'
  | 'transport_rating'
  | 'communication_rating'
  | 'value_rating';

export interface ExperienceQuestion {
  col: ExperienceCol;
  label: string;
  /** N/A permitido: no todos usan transporte ni equipo de la academia. */
  allowNA?: boolean;
}

export const EXPERIENCE_QUESTIONS: ExperienceQuestion[] = [
  { col: 'facilities_rating', label: 'The academy facilities (spaces, cleanliness, comfort)' },
  { col: 'equipment_rating', label: 'Surf equipment (boards, wetsuits)', allowNA: true },
  { col: 'transport_rating', label: 'Transport during your camp', allowNA: true },
  { col: 'communication_rating', label: 'Communication & clarity (before and during your camp)' },
  { col: 'value_rating', label: 'Value for the money' },
];

export const NPS_LABEL = 'How likely are you to recommend us to a friend?';

/** Etiquetas cortas en ESPAÑOL para reportes staff-facing. */
export const EXPERIENCE_LABELS_ES: Record<ExperienceCol, string> = {
  facilities_rating: 'Instalaciones',
  equipment_rating: 'Equipo de surf',
  transport_rating: 'Transporte',
  communication_rating: 'Comunicación',
  value_rating: 'Value for money',
};

/** Columnas de dimensión en orden de reporte. */
export const DIM_COLS: ExperienceCol[] = [
  'facilities_rating',
  'equipment_rating',
  'transport_rating',
  'communication_rating',
  'value_rating',
];
