// Brand Manual v4.2 Ch. 7 — Voice & Language
// Updated for Session Cascade v2 — March 2026

export const BRAND = {
  name: 'The Surf Sequence',
  abbreviation: 'TSS',
  tagline: 'Evolve through play',
  appName: 'The Surf Sequence',

  // TSS Brand Manual v10 — paleta oficial
  colors: {
    navy: '#061C2B',      // Ink — fondo primario / autoridad
    brandBlue: '#0A2438', // Ink claro — tarjetas sobre ink
    cyan: '#00D2FF',      // Signature Cyan v10 — acento de identidad
    grey: '#4E4D4D',      // Structural Grey
    gold: '#FFD166',      // Pop dorado v10 (ratings, progreso)
    white: '#F7F9FA',     // Paper
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
// VENUE ANALYSIS (M45) — what the coach picks before going in.
// Coaches were typing free-form text; now they pick from a canonical
// list so the data is comparable across sessions / academies.
// ═══════════════════════════════════════

// Wave size in feet — coaches call it in ft on the El Salvador coast.
export const WAVE_SIZE_OPTIONS = [
  { value: '0-1ft', label: '0–1 ft' },
  { value: '1-2ft', label: '1–2 ft' },
  { value: '2-3ft', label: '2–3 ft' },
  { value: '3-4ft', label: '3–4 ft' },
  { value: '4-5ft', label: '4–5 ft' },
  { value: '5-6ft', label: '5–6 ft' },
  { value: '6-8ft', label: '6–8 ft' },
  { value: '8ft+',  label: '8 ft+' },
] as const;

export const WIND_OPTIONS = [
  { value: 'glassy',           label: 'Glassy' },
  { value: 'offshore-light',   label: 'Light offshore' },
  { value: 'offshore-strong',  label: 'Strong offshore' },
  { value: 'side',             label: 'Side / cross' },
  { value: 'onshore-light',    label: 'Light onshore' },
  { value: 'onshore-strong',   label: 'Strong onshore' },
] as const;

export const TIDE_OPTIONS = [
  { value: 'low-rising',  label: 'Low rising' },
  { value: 'mid-rising',  label: 'Mid rising' },
  { value: 'high',        label: 'High' },
  { value: 'mid-falling', label: 'Mid falling' },
  { value: 'low-falling', label: 'Low falling' },
] as const;

export const HAZARD_OPTIONS = [
  { value: 'rocks',        label: 'Rocks' },
  { value: 'current',      label: 'Current' },
  { value: 'shallow',      label: 'Shallow / reef' },
  { value: 'marine_life',  label: 'Marine life' },
  { value: 'pollution',    label: 'Pollution' },
  { value: 'shorebreak',   label: 'Shorebreak' },
  { value: 'wind_swell',   label: 'Wind / chop' },
] as const;

export const CROWD_LEVEL_OPTIONS = [
  { value: 'empty',    label: 'Empty' },
  { value: 'light',    label: 'Light' },
  { value: 'medium',   label: 'Medium' },
  { value: 'crowded',  label: 'Crowded' },
  { value: 'packed',   label: 'Packed' },
] as const;

export const WATER_TEMP_OPTIONS = [
  { value: 'cold',  label: 'Cold' },
  { value: 'cool',  label: 'Cool' },
  { value: 'mild',  label: 'Mild' },
  { value: 'warm',  label: 'Warm' },
  { value: 'hot',   label: 'Hot' },
] as const;

export const SKY_OPTIONS = [
  { value: 'clear',         label: 'Clear' },
  { value: 'partly_cloudy', label: 'Partly cloudy' },
  { value: 'overcast',      label: 'Overcast' },
  { value: 'rain',          label: 'Rain' },
  { value: 'storm',         label: 'Storm' },
] as const;

// M48 — Incident categories for the close-of-class report.
// Labels are plain text; the consumer maps `value` → a Lucide icon at
// render time so the UI stays consistent with the rest of the app.
export const INCIDENT_TYPE_OPTIONS = [
  { value: 'medical',          label: 'Accident / injury' },
  { value: 'board',            label: 'Board broken or dinged' },
  { value: 'equipment',        label: 'Fin / leash / equipment' },
  { value: 'altercation',      label: 'Fight in the water' },
  { value: 'frustration',      label: 'Mishandled frustration' },
  { value: 'misunderstanding', label: 'Misunderstanding with student' },
  { value: 'conduct',          label: 'Conduct' },
  { value: 'venue',            label: 'Venue / weather' },
  { value: 'other',            label: 'Other' },
] as const;

// Human label for an incident type value (falls back to the raw value).
export function incidentTypeLabel(value: string | null | undefined): string {
  if (!value) return 'Incidente';
  return INCIDENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

// ═══════════════════════════════════════
// BOARD ASSIGNMENT (M45) — per student per session.
// ═══════════════════════════════════════

export const BOARD_TYPE_OPTIONS = [
  { value: 'soft', label: 'Soft top' },
  { value: 'hard', label: 'Hard top' },
] as const;

// Whole-foot range commonly used at TSS. Inches are 0-11.
export const BOARD_SIZE_FEET_OPTIONS = [5, 6, 7, 8, 9, 10, 11, 12];
export const BOARD_SIZE_INCHES_OPTIONS = [0, 2, 4, 6, 8, 10];

// Surf spots the academy uses on the El Salvador coast — offered as a dropdown
// when the coach picks the class-day venue (M133). "Other" reveals a free text
// input for anything not listed.
export const SURF_SPOT_OPTIONS = [
  'El Sunzal',
  'La Paz',
  'Negrei',
  'El Zonte Punta',
  'Rio Mar',
  'El Zonte Matadero',
  'K61',
  'K59',
  'Punta Roca',
  'San Blas',
  'Mizata',
  'El Palmar',
  'La Bocana',
  'Cocal',
  'Fishermans',
  'Conchalío',
] as const;

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
    { value: 'zen_swing', label: 'Zen Swing' },
    { value: 'head_to_toe', label: 'Head to Toe' },
    { value: 'custom', label: 'Custom' },
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

// ═══════════════════════════════════════
// ACTIVITY TYPES — M78 template Activity taxonomy
// ═══════════════════════════════════════
//
// Each entry in a template day is an "Activity" of one of these types.
// The TemplateBuilderForm renders a type-specific sub-form. The coach
// reader (CampPlanReader) renders a type-specific card with icon/color
// so the coach scans the day plan at a glance.

export const ACTIVITY_TYPES = [
  { value: 'water_mission',  label: 'Water Games',    color: '#5AC3E7', description: 'In-water mission / game tied to an STP. Pick a canonical mission from the catalog or write a custom one.' },
  { value: 'land_drill',     label: 'Land Drill',     color: '#F59E0B', description: 'Out-of-water drill — runs the EDPF flow (Explain · Demonstrate · Simulate · Feedback).' },
  { value: 'warm_up',        label: 'Warm-Up',        color: '#EF4444', description: 'Body-zone activation. Pick a sub-type (Head-to-toe / Kids / Custom).' },
  { value: 'venue_analysis', label: 'Venue Analysis', color: '#10B981', description: 'Group or student-led venue read (CRT-WB-05).' },
  { value: 'mental',         label: 'Mental',         color: '#8B5CF6', description: 'Breath, focus, key words. Pick a sub-type (Bhastrika / Box Breathing / Key Words / Focus Stamp / Visualization).' },
  { value: 'get_in_stp',     label: 'Get-in-STP',     color: '#06B6D4', description: 'Run one STP or a chained sequence of STPs as the focal exercise.' },
  { value: 'theory',         label: 'Theory',         color: '#6366F1', description: 'Classroom / land theory block.' },
  { value: 'evaluation',     label: 'Evaluation',     color: '#0EA5E9', description: 'Formal evaluation moment. Links to /camps/[id]/evaluate.' },
  { value: 'free_practice',  label: 'Free Practice',  color: '#A3A3A3', description: 'Open water time, no specific mission.' },
  { value: 'custom',         label: 'Custom',         color: '#737373', description: 'Free-form fallback.' },
  // Legacy alias — pre-M78 blocks were created as 'mission'. The UI
  // maps them to "Water Games" without rewriting the row.
  { value: 'mission',        label: 'Water Games (legacy)', color: '#5AC3E7', description: 'Pre-M78 Mission Block.' },
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number]['value'];

export const WARMUP_SUBTYPES = [
  { value: 'head_to_toe', label: 'Head to toe (dynamic)' },
  { value: 'kids',        label: 'Kids (unnatural animal)' },
  { value: 'specific',    label: 'Specific (per session focus)' },
  { value: 'flow_motion', label: 'Flow motion simulation' },
  { value: 'custom',      label: 'Custom' },
] as const;

export const MENTAL_SUBTYPES = [
  { value: 'key_words',     label: 'Key Words' },
  { value: 'bhastrika',     label: 'Bhastrika' },
  { value: 'box_breathing', label: 'Box Breathing' },
  { value: 'focus_stamp',   label: 'Focus Stamp' },
  { value: 'visualization', label: 'Visualization' },
  { value: 'custom',        label: 'Custom' },
] as const;

// Per-activity equipment — single text field but seeded with common
// values so the admin can pick fast.
export const EQUIPMENT_OPTIONS = [
  { value: 'surf_board',     label: 'Surf board' },
  { value: 'skate_board',    label: 'Skate / Surf-skate' },
  { value: 'mat',            label: 'Mat' },
  { value: 'cones',          label: 'Cones' },
  { value: 'chalk_line',     label: 'Chalk line' },
  { value: 'notebook',       label: 'Notebook' },
  { value: 'whiteboard',     label: 'Whiteboard / Pizarra' },
  { value: 'pool',           label: 'Pool' },
  { value: 'whitewater',     label: 'Whitewater zone' },
  { value: 'green_wave',     label: 'Green wave zone' },
  { value: 'leash',          label: 'Leash' },
  { value: 'video_room',     label: 'Video analysis room' },
  { value: 'none',           label: 'None / Body-only' },
] as const;

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
  'Back knee to the nose',
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
