// src/types/session.ts
// TypeScript types for the 22-step cascade session flow.

export type BeltLevel =
  | 'white_belt'
  | 'yellow_belt'
  | 'blue_belt'
  | 'purple_belt'
  | 'brown_belt'
  | 'black_belt';

export type CascadeMoment = 'context' | 'planning' | 'close';

export type OceanRiskState = 'allowed' | 'caution' | 'blocked';

export type SessionStatus = 'not_achieved' | 'partial' | 'competent' | 'mastered';

export type CompletionState = 'draft' | 'closed';

// ─── Database row types ───

export interface PilarPart {
  id: string;
  name: string;
  pilar_id: 'technical' | 'tactical' | 'mental' | 'physical' | 'safety';
  description: string | null;
  min_belt: BeltLevel;
  max_belt: BeltLevel;
  display_order: number;
  active: boolean;
}

export interface DropdownOption {
  id: string;
  category: string;
  value: string;
  label: string | null;
  display_order: number;
  active: boolean;
  metadata: Record<string, unknown> | null;
}

export interface RatingScale {
  id: string;
  scale_name: string;
  label: string;
  description: string | null;
  min_belt: BeltLevel;
  max_belt: BeltLevel;
  min_value: number;
  max_value: number;
  display_order: number;
}

export interface DrillOption {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  key_cue: string | null;
  pilar: string;
  belt_level_range: string | null;
}

// ─── Student context loaded on Step 1 ───

export interface StudentCascadeContext {
  id: string;
  first_name: string;
  last_name: string;
  belt_level: BeltLevel;
  ocean_level: string | null;
  current_sequence_number: number | null;
  current_step_order: number | null;
  allergies: string | null;
  injuries: string | null;
  medical_notes: string | null;
  risk_notes: string | null;
  last_session_date: string | null;
  last_session_mission: string | null;
  last_session_pilar: string | null;
  last_session_status: string | null;
  last_homework: string | null;
  next_recommended_focus: string | null;
  waiver_signed: boolean;
}

// ─── Cascade form state ───

export interface CascadeFormState {
  // Navigation
  currentStep: number;
  isSubmitting: boolean;

  // Derived / auto-loaded
  student: StudentCascadeContext | null;
  oceanRiskState: OceanRiskState | null;
  isWaterVenue: boolean;

  // Coach assignment
  assigned_coach_id: string | null;
  assigned_coach_name: string | null;

  // Step 1: Student
  student_id: string | null;

  // Step 2: Training Venue
  training_venue: string | null;

  // Step 3: Ocean Conditions
  ocean_conditions: string | null;

  // Step 4: Session Type
  session_type: string;

  // Step 5: Date
  session_date: string;
  session_time: string | null;

  // Step 6: Pilar Part
  pilar_part_id: string | null;
  pilar_id_snapshot: string | null;
  mission_type: string | null;

  // Step 7: Mission
  mission: string | null;

  // Step 8: Drill
  drill_id: string | null;

  // Step 9: Warm-up
  warm_up: string | null;

  // Step 10: Simulation
  simulation: string | null;

  // Step 11: Mental Hack
  mental_hack: string | null;

  // Step 12: Mission Time
  mission_time: string | null;

  // Step 13: Repetitions
  repetitions: number | null;

  // Step 14: Status
  status: SessionStatus | null;

  // Step 15: Focus Rating
  focus_rating: number | null;

  // Step 16: Progressive Ratings
  frustration_rating: number | null;
  composure_rating: number | null;
  control_rating: number | null;
  autonomy_rating: number | null;
  linking_rating: number | null;
  commitment_rating: number | null;
  variety_rating: number | null;
  precision_rating: number | null;
  knowledge_rating: number | null;
  integration_rating: number | null;

  // Step 17: Coach Feedback
  coach_feedback_quick: string | null;
  coach_feedback_text: string | null;

  // Step 18: Achieved
  achieved: string | null;

  // Step 19: What's Next
  whats_next_pilar_part_id: string | null;

  // Step 20: Homework
  homework_cues: string[];
  homework_text: string | null;

  // Step 21: Total Duration
  total_duration: string | null;

  // Step 22: Incident Report
  incident_report: boolean;
  incident_type: string | null;
  incident_description: string | null;
  incident_action_taken: string | null;
}

// ─── Reducer action types ───

export type CascadeAction =
  | { type: 'SET_ASSIGNED_COACH'; payload: { id: string; name: string } }
  | { type: 'SET_STUDENT'; payload: StudentCascadeContext }
  | { type: 'SET_VENUE'; payload: { venue: string; isWater: boolean } }
  | { type: 'SET_OCEAN'; payload: { conditions: string; riskState: OceanRiskState } }
  | { type: 'SET_SESSION_TYPE'; payload: string }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_SESSION_TIME'; payload: string }
  | { type: 'SET_PILAR_PART'; payload: { id: string; pilarId: string } }
  | { type: 'SET_MISSION_TYPE'; payload: string }
  | { type: 'SET_MISSION'; payload: string }
  | { type: 'SET_DRILL'; payload: string }
  | { type: 'SET_WARM_UP'; payload: string }
  | { type: 'SET_SIMULATION'; payload: string }
  | { type: 'SET_MENTAL_HACK'; payload: string }
  | { type: 'SET_MISSION_TIME'; payload: string }
  | { type: 'SET_REPETITIONS'; payload: number }
  | { type: 'SET_STATUS'; payload: SessionStatus }
  | { type: 'SET_FOCUS_RATING'; payload: number }
  | { type: 'SET_RATING'; payload: { scale: string; value: number } }
  | { type: 'SET_COACH_FEEDBACK_QUICK'; payload: string }
  | { type: 'SET_COACH_FEEDBACK_TEXT'; payload: string }
  | { type: 'SET_ACHIEVED'; payload: string }
  | { type: 'SET_WHATS_NEXT'; payload: string }
  | { type: 'SET_HOMEWORK_CUES'; payload: string[] }
  | { type: 'SET_HOMEWORK_TEXT'; payload: string }
  | { type: 'SET_TOTAL_DURATION'; payload: string }
  | { type: 'SET_INCIDENT_REPORT'; payload: boolean }
  | { type: 'SET_INCIDENT_TYPE'; payload: string }
  | { type: 'SET_INCIDENT_DESCRIPTION'; payload: string }
  | { type: 'SET_INCIDENT_ACTION'; payload: string }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET' };

// ─── Step component props ───

export interface StepProps {
  formState: CascadeFormState;
  onNext: () => void;
  onBack: () => void;
}

// ─── Cascade step config ───

export interface CascadeStepConfig {
  id: number;
  key: string;
  label: string;
  moment: CascadeMoment;
  skippable?: boolean;
}
