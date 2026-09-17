// ═══ Evaluación del director al coach · v2, acorde al método (Marcelo 2026-09-17) ═══
// Cinco dimensiones, escala 0–3 (la misma que usa el alumno). De acá sale la
// recomendación de nivel. Las evaluaciones v1 (4 notas 1–10) quedan en el
// historial tal cual.
export interface CoachEvalDimension {
  key: 'eye_score' | 'delivery_score' | 'cues_score' | 'safety_score' | 'plan_score';
  title: string;
  what: string;
  /** Qué se ve en cada nivel, 0 → 3. */
  levels: [string, string, string, string];
}

export const COACH_EVAL_DIMENSIONS: CoachEvalDimension[] = [
  {
    key: 'eye_score',
    title: "Coach's eye",
    what: 'Sees the step that stops the sequence and names it: Board · Body · Wave.',
    levels: [
      'Does not see it.',
      'Sees something is off, cannot name the step.',
      'Names the step; sometimes the wrong circle.',
      'Names the step and the circle every time, from the first wave.',
    ],
  },
  {
    key: 'delivery_score',
    title: 'Delivery',
    what: 'Explains, demonstrates, simulates, corrects. One thing at a time, never overloading.',
    levels: [
      'Talks; no demonstration.',
      'Explains and demonstrates, but corrects many things at once.',
      'One correction at a time; the simulation is missing.',
      'Explain → demonstrate → simulate → correct. One thing at a time.',
    ],
  },
  {
    key: 'cues_score',
    title: 'Commands and cues',
    what: "The method's words, at the right moment, in the wave.",
    levels: [
      'Own words; no cues.',
      'Knows the cues, uses them late.',
      'Right cue, sometimes the wrong moment.',
      'Right cue, right moment; the student hears it in the wave.',
    ],
  },
  {
    key: 'safety_score',
    title: 'Safety and ocean',
    what: 'Venue check, go / no-go call, keeps the whole group in sight.',
    levels: [
      'No venue read.',
      'Reads the venue; no clear go / no-go.',
      'Clear call; loses sight of the group at times.',
      'Venue check, clear call, the whole group in sight all session.',
    ],
  },
  {
    key: 'plan_score',
    title: 'Plan and record',
    what: 'Arrives with the simple plan; closes every student with a next focus.',
    levels: [
      'No plan, no closing.',
      'Plan made on the spot; closes late or not at all.',
      'Plan the day before; closing incomplete.',
      'Plan the day before; every student closed with a next focus.',
    ],
  },
];

export const COACH_EVAL_MAX = 3 * COACH_EVAL_DIMENSIONS.length; // 15

export const COACH_EVAL_BELTS: { value: string; label: string }[] = [
  { value: 'white_belt', label: 'White · Beginner' },
  { value: 'yellow_belt', label: 'Yellow · Novice' },
  { value: 'blue_belt', label: 'Blue · Foundation' },
  { value: 'purple_belt', label: 'Purple · Emerging' },
  { value: 'brown_belt', label: 'Brown · Pre-Elite' },
  { value: 'black_belt', label: 'Black · Elite' },
];
