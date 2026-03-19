// src/lib/constants/cascade.ts
// Configuration for the 22-step cascade session flow.

import type { BeltLevel, CascadeStepConfig } from '@/types/session';

// ─── 22-Step Configuration ───

export const CASCADE_STEPS: CascadeStepConfig[] = [
  // MOMENT 1: CONTEXT (Steps 1-5)
  { id: 1,  key: 'student',             label: 'Student',             moment: 'context' },
  { id: 2,  key: 'venue',               label: 'Training Venue',      moment: 'context' },
  { id: 3,  key: 'ocean',               label: 'Ocean Conditions',    moment: 'context', skippable: true },
  { id: 4,  key: 'session_type',        label: 'Session Type',        moment: 'context' },
  { id: 5,  key: 'date',                label: 'Date',                moment: 'context' },

  // MOMENT 2: PLANNING (Steps 6-13)
  { id: 6,  key: 'pilar_part',          label: 'Pilar Part',          moment: 'planning' },
  { id: 7,  key: 'mission',             label: 'Mission',             moment: 'planning' },
  { id: 8,  key: 'drill',               label: 'Drill',               moment: 'planning' },
  { id: 9,  key: 'warm_up',             label: 'Warm-up',             moment: 'planning' },
  { id: 10, key: 'simulation',          label: 'Simulation',          moment: 'planning' },
  { id: 11, key: 'mental_hack',         label: 'Mental Hack',         moment: 'planning' },
  { id: 12, key: 'mission_time',        label: 'Mission Time',        moment: 'planning' },
  { id: 13, key: 'repetitions',         label: 'Repetitions',         moment: 'planning' },

  // MOMENT 3: CLOSE (Steps 14-22)
  { id: 14, key: 'status',              label: 'Session Status',      moment: 'close' },
  { id: 15, key: 'focus',               label: 'Focus Rating',        moment: 'close' },
  { id: 16, key: 'progressive_ratings', label: 'Progressive Ratings', moment: 'close' },
  { id: 17, key: 'coach_feedback',      label: 'Coach Feedback',      moment: 'close' },
  { id: 18, key: 'achieved',            label: 'Achieved',            moment: 'close' },
  { id: 19, key: 'whats_next',          label: "What's Next",         moment: 'close' },
  { id: 20, key: 'homework',            label: 'Homework',            moment: 'close' },
  { id: 21, key: 'total_duration',      label: 'Total Duration',      moment: 'close' },
  { id: 22, key: 'incident_close',      label: 'Close & Incident',    moment: 'close' },
];

// ─── Moment Labels ───

export const MOMENT_LABELS = {
  context:  'Context',
  planning: 'Planning',
  close:    'Close',
} as const;

export const MOMENT_RANGES = {
  context:  { start: 1, end: 5 },
  planning: { start: 6, end: 13 },
  close:    { start: 14, end: 22 },
} as const;

// ─── Belt Ordering ───

export const BELT_ORDER: Record<BeltLevel, number> = {
  white_belt:  0,
  yellow_belt: 1,
  blue_belt:   2,
  purple_belt: 3,
  brown_belt:  4,
  black_belt:  5,
};

// ─── Belt Range Check ───

export function isBeltInRange(
  studentBelt: BeltLevel,
  minBelt: BeltLevel,
  maxBelt: BeltLevel
): boolean {
  const studentOrder = BELT_ORDER[studentBelt];
  return studentOrder >= BELT_ORDER[minBelt] && studentOrder <= BELT_ORDER[maxBelt];
}

// ─── Water Venue Check ───

export const WATER_VENUES = new Set([
  'beachbreak',
  'pointbreak',
  'reefbreak',
  'white_water',
  'training_pool',
]);

export function isWaterVenue(venue: string): boolean {
  return WATER_VENUES.has(venue);
}

// ─── Rating Scales by Belt ───
// Maps which rating scale columns to show for each belt level.

export function getRatingColumnsForBelt(belt: BeltLevel): string[] {
  const order = BELT_ORDER[belt];
  const scales: string[] = [];

  // Focus: all belts (handled separately in Step 15)

  // Frustration: White + Yellow only
  if (order <= 1) scales.push('frustration_rating');

  // Composure: Blue+
  if (order >= 2) scales.push('composure_rating');

  // Control: Blue only
  if (order === 2) scales.push('control_rating');

  // Autonomy: Blue+
  if (order >= 2) scales.push('autonomy_rating');

  // Linking: Blue only
  if (order === 2) scales.push('linking_rating');

  // Commitment: Purple+
  if (order >= 3) scales.push('commitment_rating');

  // Variety: Purple+
  if (order >= 3) scales.push('variety_rating');

  // Precision: Brown+
  if (order >= 4) scales.push('precision_rating');

  // Knowledge: Black only
  if (order === 5) scales.push('knowledge_rating');

  // Integration: Black only
  if (order === 5) scales.push('integration_rating');

  return scales;
}

// ─── Initial Form State ───

export const INITIAL_CASCADE_STATE = {
  currentStep: 1,
  isSubmitting: false,
  student: null,
  oceanRiskState: null,
  isWaterVenue: true,
  student_id: null,
  training_venue: null,
  ocean_conditions: null,
  session_type: 'training',
  session_date: new Date().toISOString().split('T')[0],
  pilar_part_id: null,
  pilar_id_snapshot: null,
  mission: null,
  drill_id: null,
  warm_up: null,
  simulation: null,
  mental_hack: null,
  mission_time: null,
  repetitions: null,
  status: null,
  focus_rating: null,
  frustration_rating: null,
  composure_rating: null,
  control_rating: null,
  autonomy_rating: null,
  linking_rating: null,
  commitment_rating: null,
  variety_rating: null,
  precision_rating: null,
  knowledge_rating: null,
  integration_rating: null,
  coach_feedback_quick: null,
  coach_feedback_text: null,
  achieved: null,
  whats_next_pilar_part_id: null,
  homework_cues: [],
  homework_text: null,
  total_duration: null,
  incident_report: false,
  incident_type: null,
  incident_description: null,
  incident_action_taken: null,
};
