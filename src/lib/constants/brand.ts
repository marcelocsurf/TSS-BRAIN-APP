// Brand Manual v4.2 Ch. 7 — Voice & Language
// Updated for Session Cascade v2 — March 2026

export const BRAND = {
  name: 'The Surf Sequence',
  abbreviation: 'TSS',
  tagline: 'Evolve through play',
  appName: 'TSS Brain',

  colors: {
    navy: '#1A1A2E',
    gold: '#D4A843',
    white: '#FFFFFF',
  },

  vocabulary: [
    'Mission', 'Session', 'Level', 'Belt', 'Coach',
    'Methodology', 'Evolve', 'Progression', 'Certification',
    'System', 'Holistic', 'Structured', 'Scientific',
  ] as const,

  forbidden: [
    'Surf School', 'Stoke', 'Shred', 'Gnarly',
    'Lifestyle Brand', 'Fun in the Sun', 'Overpromise',
  ] as const,
} as const;

// ═══════════════════════════════════════
// PILARS
// ═══════════════════════════════════════

export type Pilar = 'technical' | 'physical' | 'tactical' | 'mental';

export const PILARS: Pilar[] = ['technical', 'physical', 'tactical', 'mental'];

export const PILAR_LABELS: Record<Pilar, string> = {
  technical: 'Technical (TÉC)',
  physical: 'Physical (FÍS)',
  tactical: 'Tactical (TÁC)',
  mental: 'Mental (MEN)',
};

// ═══════════════════════════════════════
// SESSION STATUS
// ═══════════════════════════════════════

export type SessionStatus = 'not_yet' | 'partial' | 'competent' | 'mastered';

export const SESSION_STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: 'not_yet', label: 'Not Yet' },
  { value: 'partial', label: 'Partial' },
  { value: 'competent', label: 'Competent' },
  { value: 'mastered', label: 'Mastered' },
];

// ═══════════════════════════════════════
// SYSTEM ROLES — Stage 1
// ═══════════════════════════════════════

export type CoachRole = 'admin' | 'coordinator' | 'coach' | 'assistant';

export const COACH_ROLE_RANK: Record<CoachRole, number> = {
  assistant: 1,
  coach: 2,
  coordinator: 3,
  admin: 4,
};

export const COACH_ROLE_LABELS: Record<CoachRole, string> = {
  admin: 'Admin',
  coordinator: 'Coordinator',
  coach: 'Coach',
  assistant: 'Assistant',
};

// ═══════════════════════════════════════
// OCEAN CONDITIONS
// ═══════════════════════════════════════

export type OceanCondition = 'flat' | '1_2ft' | '3_4ft' | '4_6ft' | '6_plus';

export const OCEAN_CONDITIONS: { value: OceanCondition; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: '1_2ft', label: '1-2 ft' },
  { value: '3_4ft', label: '3-4 ft' },
  { value: '4_6ft', label: '4-6 ft' },
  { value: '6_plus', label: '6+ ft' },
];

export type RiskState = 'safe' | 'alert' | 'blocked';
export type CompletionState = 'draft' | 'in_progress' | 'closed' | 'survey_completed';

// ═══════════════════════════════════════
// TRAINING VENUE — Section 6.1
// ═══════════════════════════════════════

export const TRAINING_VENUES = [
  { value: 'Beachbreak', label: 'Beachbreak', isWater: true },
  { value: 'Pointbreak', label: 'Pointbreak', isWater: true },
  { value: 'Reefbreak', label: 'Reefbreak', isWater: true },
  { value: 'White water', label: 'White water', isWater: true },
  { value: 'Training pool', label: 'Training pool', isWater: true },
  { value: 'Surf skate', label: 'Surf skate', isWater: false },
  { value: 'Gym', label: 'Gym', isWater: false },
  { value: 'Tatami', label: 'Tatami', isWater: false },
  { value: 'Video Analysis Room', label: 'Video Analysis', isWater: false },
] as const;

export type TrainingVenue = typeof TRAINING_VENUES[number]['value'];

// ═══════════════════════════════════════
// WARM-UP — Section 6.3
// ═══════════════════════════════════════

export const WARMUP_OPTIONS = [
  { value: 'head_to_toe', label: 'Head to toe dynamic warm-up' },
  { value: 'unnatural_animal', label: 'Unnatural animal (for kids)' },
  { value: 'specific', label: 'Specific warm-up' },
  { value: 'flow_motion', label: 'Flow motion simulation' },
] as const;

// Belt-specific warm-up options for self-training
// Each belt inherits all warm-ups from lower belts
export const SELF_TRAINING_WARMUPS: Record<string, { value: string; label: string }[]> = {
  white_belt: [
    { value: 'head_to_toe', label: 'Head to toe dynamic warm-up' },
    { value: 'board_handling_circuit', label: 'Board Handling Circuit' },
    { value: 'cobra_direction', label: 'Cobra + Direction Choice drill' },
  ],
  yellow_belt: [
    { value: 'head_to_toe', label: 'Head to toe dynamic warm-up' },
    { value: 'board_handling_circuit', label: 'Board Handling Circuit' },
    { value: 'cobra_direction', label: 'Cobra + Direction Choice drill' },
    { value: 'popup_transitions', label: 'Pop-Up with Transitions' },
    { value: 'rotation_chain', label: 'Rotation Kinetic Chain' },
    { value: 'wave_simulation', label: 'Wave Simulation' },
  ],
  blue_belt: [
    { value: 'head_to_toe', label: 'Head to toe dynamic warm-up' },
    { value: 'board_handling_circuit', label: 'Board Handling Circuit' },
    { value: 'cobra_direction', label: 'Cobra + Direction Choice drill' },
    { value: 'popup_transitions', label: 'Pop-Up with Transitions' },
    { value: 'rotation_chain', label: 'Rotation Kinetic Chain' },
    { value: 'wave_simulation', label: 'Wave Simulation' },
    { value: 'stance_rotation', label: 'Stance + Rotation' },
    { value: 'bottom_turn_projection', label: 'Bottom Turn + Projection' },
    { value: 'rail_transition', label: 'Rail Transition Full Sequence' },
  ],
  purple_belt: [
    { value: 'head_to_toe', label: 'Head to toe dynamic warm-up' },
    { value: 'board_handling_circuit', label: 'Board Handling Circuit' },
    { value: 'popup_transitions', label: 'Pop-Up with Transitions' },
    { value: 'rotation_chain', label: 'Rotation Kinetic Chain' },
    { value: 'wave_simulation', label: 'Wave Simulation' },
    { value: 'stance_rotation', label: 'Stance + Rotation' },
    { value: 'bottom_turn_projection', label: 'Bottom Turn + Projection' },
    { value: 'rail_transition', label: 'Rail Transition Full Sequence' },
  ],
  brown_belt: [
    { value: 'head_to_toe', label: 'Head to toe dynamic warm-up' },
    { value: 'rotation_chain', label: 'Rotation Kinetic Chain' },
    { value: 'wave_simulation', label: 'Wave Simulation' },
    { value: 'stance_rotation', label: 'Stance + Rotation' },
    { value: 'bottom_turn_projection', label: 'Bottom Turn + Projection' },
    { value: 'rail_transition', label: 'Rail Transition Full Sequence' },
  ],
  black_belt: [
    { value: 'head_to_toe', label: 'Head to toe dynamic warm-up' },
    { value: 'rotation_chain', label: 'Rotation Kinetic Chain' },
    { value: 'stance_rotation', label: 'Stance + Rotation' },
    { value: 'bottom_turn_projection', label: 'Bottom Turn + Projection' },
    { value: 'rail_transition', label: 'Rail Transition Full Sequence' },
  ],
};

// ═══════════════════════════════════════
// SIMULATION — Section 6.4
// ═══════════════════════════════════════

export const SIMULATION_OPTIONS = [
  { value: 'surf_skate', label: 'Surf skate' },
  { value: 'flow_motion', label: 'Flow motion' },
  { value: 'visualization', label: 'Visualization' },
  { value: 'finger_surfing', label: 'Finger surfing the waves' },
] as const;

// ═══════════════════════════════════════
// MENTAL HACK — Section 6.5
// ═══════════════════════════════════════

export const MENTAL_HACK_OPTIONS = [
  { value: 'key_words', label: 'Key words' },
  { value: 'do_with_intention', label: 'Do it with intention' },
  { value: 'breathe_reset', label: 'Breathe and reset' },
  { value: 'positive_self_talk', label: 'Positive self-talk' },
  { value: 'visualize_success', label: 'Visualize success' },
  { value: 'process_over_outcome', label: 'Process over outcome' },
  { value: 'one_wave', label: 'One wave at a time' },
] as const;

// ═══════════════════════════════════════
// MISSION TIME — Section 4.2 Step 12
// ═══════════════════════════════════════

export const MISSION_TIME_OPTIONS = [
  { value: '10', label: '10 min' },
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
] as const;

// ═══════════════════════════════════════
// TOTAL DURATION — Section 4.2 Step 21
// ═══════════════════════════════════════

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
] as const;

// ═══════════════════════════════════════
// FRUSTRATION DESCRIPTORS — Section 6.7
// ═══════════════════════════════════════

export const FRUSTRATION_DESCRIPTORS: Record<number, string> = {
  1: 'Boring / too easy',
  5: 'It was fun',
  6: 'Fully immersed',
  7: 'Challenging but manageable',
  8: 'Getting hard',
  9: 'Really hard',
  10: 'Maximum difficulty',
};

// ═══════════════════════════════════════
// COACH FEEDBACK QUICK — Section 6.8
// ═══════════════════════════════════════

export const COACH_FEEDBACK_QUICK = [
  'Not collaborating',
  'Good effort',
  'Very good',
  'Excellent',
] as const;

// ═══════════════════════════════════════
// HOMEWORK CUES — Section 6.9
// ═══════════════════════════════════════

export const HOMEWORK_CUES = [
  'Look forward',
  'Weight on front foot',
  'Knee in',
  'Bend knees',
  'Foot centered',
  'Shoulders aligned with board nose',
  'Activate scapula',
  'Activate hands',
  'Stay calm breath',
] as const;

// ═══════════════════════════════════════
// INCIDENT TYPE — Section 6.10
// ═══════════════════════════════════════

export const INCIDENT_TYPES = [
  { value: 'minor_injury', label: 'Minor injury' },
  { value: 'major_injury', label: 'Major injury' },
  { value: 'equipment_failure', label: 'Equipment failure' },
  { value: 'near_miss', label: 'Near miss' },
  { value: 'other', label: 'Other' },
] as const;

// ═══════════════════════════════════════
// SESSION TYPE
// ═══════════════════════════════════════

export const SESSION_TYPES = [
  { value: 'Training', label: 'Training' },
  { value: 'Competition', label: 'Competition' },
  { value: 'Evaluation', label: 'Evaluation' },
] as const;
