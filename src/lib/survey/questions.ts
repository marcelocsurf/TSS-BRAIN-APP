// Preguntas de la encuesta post-sesión POR SERVICIO — fuente única para los dos
// formularios (portal del alumno y el standalone /feedback). Antes cada servicio
// (Yoga, Ice Bath, etc.) recibía las mismas preguntas de SURF ("safe in the water").
//
// Modelo: reusamos las columnas fijas de survey_responses (sin migración). Cada
// servicio elige QUÉ preguntas hace y con qué texto; una es SIEMPRE coach_rating
// (así el reporte de ratings por coach sigue igual para todos). El slot
// academy_rating se usa como pregunta de INSTALACIONES/lugar donde tiene sentido.
// Cantidad variable: un servicio puede definir menos preguntas.

export type SurveyCol =
  | 'coach_rating'
  | 'q1_clarity'
  | 'q3_homework_clarity'
  | 'q4_session_value'
  | 'academy_rating';

export interface SurveyQuestion { col: SurveyCol; label: string }

export type SurveyKey = 'surf' | 'yoga' | 'icebath' | 'skate' | 'jiujitsu' | 'unatural' | 'trip' | 'class';

export interface SurveySet {
  questions: SurveyQuestion[]; // en orden; incluye coach_rating
  flow: boolean;               // mostrar el selector de "flow channel" (solo surf)
}

export const SURVEY_SETS: Record<SurveyKey, SurveySet> = {
  surf: {
    flow: true,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your coach today?' },
      { col: 'q1_clarity', label: 'Were the instructions and explanations clear and easy to follow?' },
      { col: 'q3_homework_clarity', label: 'Did you feel safe and well looked after in the water?' },
      { col: 'q4_session_value', label: 'Did you learn something and feel you improved?' },
      { col: 'academy_rating', label: 'Would you take another class with this coach?' },
    ],
  },
  yoga: {
    flow: false,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your instructor today?' },
      { col: 'q1_clarity', label: 'Were the instructions and pace clear and easy to follow?' },
      { col: 'q3_homework_clarity', label: 'Did the practice match your level and feel safe on your body?' },
      { col: 'q4_session_value', label: 'Did you leave feeling better — more relaxed and mobile?' },
      { col: 'academy_rating', label: 'How was the space? (cleanliness, ambiance, mats)' },
    ],
  },
  icebath: {
    flow: false,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your guide today?' },
      { col: 'q1_clarity', label: 'Was the breathing and cold-exposure guidance clear?' },
      { col: 'q3_homework_clarity', label: 'Did you feel safe and supported throughout?' },
      { col: 'q4_session_value', label: 'Did you leave feeling the benefits (calm, energized)?' },
      { col: 'academy_rating', label: 'How were the facilities? (tub, space, hygiene)' },
    ],
  },
  skate: {
    flow: false,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your coach today?' },
      { col: 'q1_clarity', label: 'Were the instructions and explanations clear and easy to follow?' },
      { col: 'q3_homework_clarity', label: 'Did you feel safe (gear and environment)?' },
      { col: 'q4_session_value', label: 'Did you learn something and feel you improved?' },
      { col: 'academy_rating', label: 'How was the ramp / skate area?' },
    ],
  },
  jiujitsu: {
    flow: false,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your instructor today?' },
      { col: 'q1_clarity', label: 'Was the technique taught clearly, step by step?' },
      { col: 'q3_homework_clarity', label: 'Did you feel safe in a controlled environment?' },
      { col: 'q4_session_value', label: 'Did you learn something and feel you improved?' },
      { col: 'academy_rating', label: 'How were the mats and training space?' },
    ],
  },
  unatural: {
    flow: false,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your instructor today?' },
      { col: 'q1_clarity', label: 'Were the instructions and pace clear and easy to follow?' },
      { col: 'q3_homework_clarity', label: 'Did the movements match your level and feel safe?' },
      { col: 'q4_session_value', label: 'Did you leave moving and feeling better?' },
      { col: 'academy_rating', label: 'How was the space?' },
    ],
  },
  trip: {
    flow: false,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your guide today?' },
      { col: 'q1_clarity', label: 'Were the plan and logistics clear?' },
      { col: 'q3_homework_clarity', label: 'Did you feel safe and well looked after?' },
      { col: 'q4_session_value', label: 'How was the spot / location?' },
      { col: 'academy_rating', label: 'Would you recommend this trip?' },
    ],
  },
  class: {
    flow: false,
    questions: [
      { col: 'coach_rating', label: 'How would you rate your instructor today?' },
      { col: 'q1_clarity', label: 'Were the instructions and explanations clear and easy to follow?' },
      { col: 'q3_homework_clarity', label: 'Did you feel safe and well looked after?' },
      { col: 'q4_session_value', label: 'Did you learn something and feel you improved?' },
      { col: 'academy_rating', label: 'Would you take another class with this instructor?' },
    ],
  },
};

/** Deriva la clave de encuesta a partir del tipo de servicio y su nombre. */
export function resolveSurveyKey(serviceKind?: string | null, serviceName?: string | null): SurveyKey {
  const n = (serviceName || '').toLowerCase();
  if (/yoga/.test(n)) return 'yoga';
  if (/ice\s*bath|icebath/.test(n)) return 'icebath';
  if (/jiu|jitsu/.test(n)) return 'jiujitsu';
  if (/skate/.test(n)) return 'skate';
  if (/natural/.test(n)) return 'unatural';
  if (serviceKind === 'surf_camp' || serviceKind === 'surf_lesson' || /surf|discover/.test(n)) return 'surf';
  if (serviceKind === 'trip') return 'trip';
  return 'class';
}

export function surveyForService(serviceKind?: string | null, serviceName?: string | null): SurveySet {
  return SURVEY_SETS[resolveSurveyKey(serviceKind, serviceName)];
}
