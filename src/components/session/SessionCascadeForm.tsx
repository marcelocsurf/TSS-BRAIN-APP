'use client';

import { useReducer, useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { INITIAL_CASCADE_STATE, isWaterVenue as checkWaterVenue } from '@/lib/constants/cascade';
import {
  createCascadeSession,
  getDrillsForCascade,
  getDropdownOptions,
  getPilarParts,
  getRatingScalesForBelt,
} from '@/lib/actions/cascade-sessions';
import type {
  BeltLevel,
  CascadeAction,
  CascadeFormState,
  DropdownOption,
  DrillOption,
  OceanRiskState,
  PilarPart,
  RatingScale,
  SessionStatus,
  StudentCascadeContext,
} from '@/types/session';

import { CascadeProgress } from './CascadeProgress';
import { Step01Student } from './steps/Step01Student';
import { Step02Venue } from './steps/Step02Venue';
import { Step03Ocean } from './steps/Step03Ocean';
import { Step04SessionType } from './steps/Step04SessionType';
import { Step05Date } from './steps/Step05Date';
import { Step06PilarPart } from './steps/Step06PilarPart';
import { Step07Mission } from './steps/Step07Mission';
import { Step08Drill } from './steps/Step08Drill';
import { Step09WarmUp } from './steps/Step09WarmUp';
import { Step10Simulation } from './steps/Step10Simulation';
import { Step11MentalHack } from './steps/Step11MentalHack';
import { Step12MissionTime } from './steps/Step12MissionTime';
import { Step13Repetitions } from './steps/Step13Repetitions';
import { Step14Status } from './steps/Step14Status';
import { Step15Focus } from './steps/Step15Focus';
import { Step16ProgressiveRatings } from './steps/Step16ProgressiveRatings';
import { Step17CoachFeedback } from './steps/Step17CoachFeedback';
import { Step18Achieved } from './steps/Step18Achieved';
import { Step19WhatsNext } from './steps/Step19WhatsNext';
import { Step20Homework } from './steps/Step20Homework';
import { Step21TotalDuration } from './steps/Step21TotalDuration';
import { Step22IncidentClose } from './steps/Step22IncidentClose';

// ─── Reducer ───

function cascadeReducer(state: CascadeFormState, action: CascadeAction): CascadeFormState {
  switch (action.type) {
    case 'SET_STUDENT':
      return {
        ...state,
        student: action.payload,
        student_id: action.payload.id,
      };
    case 'SET_VENUE':
      return {
        ...state,
        training_venue: action.payload.venue,
        isWaterVenue: action.payload.isWater,
        // Reset ocean if switching to non-water
        ...(action.payload.isWater ? {} : { ocean_conditions: null, oceanRiskState: null }),
      };
    case 'SET_OCEAN':
      return {
        ...state,
        ocean_conditions: action.payload.conditions,
        oceanRiskState: action.payload.riskState,
      };
    case 'SET_SESSION_TYPE':
      return { ...state, session_type: action.payload };
    case 'SET_DATE':
      return { ...state, session_date: action.payload };
    case 'SET_PILAR_PART':
      return {
        ...state,
        pilar_part_id: action.payload.id,
        pilar_id_snapshot: action.payload.pilarId,
        // Reset drill when pilar part changes
        drill_id: null,
      };
    case 'SET_MISSION':
      return { ...state, mission: action.payload };
    case 'SET_DRILL':
      return { ...state, drill_id: action.payload };
    case 'SET_WARM_UP':
      return { ...state, warm_up: action.payload };
    case 'SET_SIMULATION':
      return { ...state, simulation: action.payload };
    case 'SET_MENTAL_HACK':
      return { ...state, mental_hack: action.payload };
    case 'SET_MISSION_TIME':
      return { ...state, mission_time: action.payload };
    case 'SET_REPETITIONS':
      return { ...state, repetitions: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_FOCUS_RATING':
      return { ...state, focus_rating: action.payload };
    case 'SET_RATING': {
      const key = `${action.payload.scale}_rating` as keyof CascadeFormState;
      return { ...state, [key]: action.payload.value };
    }
    case 'SET_COACH_FEEDBACK_QUICK':
      return { ...state, coach_feedback_quick: action.payload };
    case 'SET_COACH_FEEDBACK_TEXT':
      return { ...state, coach_feedback_text: action.payload };
    case 'SET_ACHIEVED':
      return { ...state, achieved: action.payload };
    case 'SET_WHATS_NEXT':
      return { ...state, whats_next_pilar_part_id: action.payload };
    case 'SET_HOMEWORK_CUES':
      return { ...state, homework_cues: action.payload };
    case 'SET_HOMEWORK_TEXT':
      return { ...state, homework_text: action.payload };
    case 'SET_TOTAL_DURATION':
      return { ...state, total_duration: action.payload };
    case 'SET_INCIDENT_REPORT':
      return {
        ...state,
        incident_report: action.payload,
        ...(action.payload ? {} : { incident_type: null, incident_description: null, incident_action_taken: null }),
      };
    case 'SET_INCIDENT_TYPE':
      return { ...state, incident_type: action.payload };
    case 'SET_INCIDENT_DESCRIPTION':
      return { ...state, incident_description: action.payload };
    case 'SET_INCIDENT_ACTION':
      return { ...state, incident_action_taken: action.payload };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'RESET':
      return { ...INITIAL_CASCADE_STATE, session_date: new Date().toISOString().split('T')[0] } as CascadeFormState;
    default:
      return state;
  }
}

// ─── Props ───

interface Props {
  initialStudent: StudentCascadeContext | null;
  students: { id: string; first_name: string; last_name: string; belt_level: string }[];
  venues: DropdownOption[];
  sessionTypes: DropdownOption[];
}

// ─── Component ───

export function SessionCascadeForm({ initialStudent, students, venues, sessionTypes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialState: CascadeFormState = {
    ...INITIAL_CASCADE_STATE,
    session_date: new Date().toISOString().split('T')[0],
    ...(initialStudent
      ? { student: initialStudent, student_id: initialStudent.id, currentStep: 2 }
      : {}),
  } as CascadeFormState;

  const [state, dispatch] = useReducer(cascadeReducer, initialState);

  // ─── Lazy-loaded data ───
  const [oceanOptions, setOceanOptions] = useState<DropdownOption[]>([]);
  const [pilarParts, setPilarParts] = useState<PilarPart[]>([]);
  const [drills, setDrills] = useState<DrillOption[]>([]);
  const [warmUpOptions, setWarmUpOptions] = useState<DropdownOption[]>([]);
  const [simulationOptions, setSimulationOptions] = useState<DropdownOption[]>([]);
  const [mentalHackOptions, setMentalHackOptions] = useState<DropdownOption[]>([]);
  const [missionTimeOptions, setMissionTimeOptions] = useState<DropdownOption[]>([]);
  const [feedbackQuickOptions, setFeedbackQuickOptions] = useState<DropdownOption[]>([]);
  const [homeworkCueOptions, setHomeworkCueOptions] = useState<DropdownOption[]>([]);
  const [totalDurationOptions, setTotalDurationOptions] = useState<DropdownOption[]>([]);
  const [incidentTypeOptions, setIncidentTypeOptions] = useState<DropdownOption[]>([]);
  const [ratingScales, setRatingScales] = useState<RatingScale[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ─── Load data when entering specific steps ───

  useEffect(() => {
    const step = state.currentStep;

    if (step === 3 && oceanOptions.length === 0) {
      getDropdownOptions('ocean_conditions').then(setOceanOptions);
    }
    if (step === 6 && pilarParts.length === 0 && state.student) {
      getPilarParts(state.student.belt_level as BeltLevel).then(setPilarParts);
    }
    if (step === 8 && state.student) {
      // Find the selected pilar part name to filter drills
      const selectedPart = pilarParts.find(p => p.id === state.pilar_part_id);
      getDrillsForCascade({
        pilarPartName: selectedPart?.name,
        beltLevel: state.student.belt_level as BeltLevel,
        isWaterVenue: state.isWaterVenue,
      }).then(setDrills);
    }
    if (step === 9 && warmUpOptions.length === 0) {
      getDropdownOptions('warm_up').then(setWarmUpOptions);
    }
    if (step === 10 && simulationOptions.length === 0) {
      getDropdownOptions('simulation').then(setSimulationOptions);
    }
    if (step === 11 && mentalHackOptions.length === 0) {
      getDropdownOptions('mental_hack').then(setMentalHackOptions);
    }
    if (step === 12 && missionTimeOptions.length === 0) {
      getDropdownOptions('mission_time').then(setMissionTimeOptions);
    }
    if (step === 16 && ratingScales.length === 0 && state.student) {
      getRatingScalesForBelt(state.student.belt_level as BeltLevel).then(setRatingScales);
    }
    if (step === 17 && feedbackQuickOptions.length === 0) {
      getDropdownOptions('coach_feedback_quick').then(setFeedbackQuickOptions);
    }
    if (step === 19 && pilarParts.length === 0 && state.student) {
      getPilarParts(state.student.belt_level as BeltLevel).then(setPilarParts);
    }
    if (step === 20 && homeworkCueOptions.length === 0) {
      getDropdownOptions('homework_cues').then(setHomeworkCueOptions);
    }
    if (step === 21 && totalDurationOptions.length === 0) {
      getDropdownOptions('total_duration').then(setTotalDurationOptions);
    }
    if (step === 22 && incidentTypeOptions.length === 0) {
      getDropdownOptions('incident_type').then(setIncidentTypeOptions);
    }
  }, [state.currentStep]);

  // ─── Navigation ───

  function goNext() {
    let next = state.currentStep + 1;
    // Skip Step 3 if non-water venue
    if (next === 3 && !state.isWaterVenue) next = 4;
    if (next <= 22) dispatch({ type: 'GO_TO_STEP', payload: next });
  }

  function goBack() {
    let prev = state.currentStep - 1;
    // Skip Step 3 if non-water venue
    if (prev === 3 && !state.isWaterVenue) prev = 2;
    if (prev >= 1) dispatch({ type: 'GO_TO_STEP', payload: prev });
  }

  // ─── Save session ───

  function handleSave() {
    setSaveError(null);
    dispatch({ type: 'SET_SUBMITTING', payload: true });

    startTransition(async () => {
      const result = await createCascadeSession(state);
      dispatch({ type: 'SET_SUBMITTING', payload: false });

      if (result.success) {
        router.push(`/students/${state.student_id}`);
      } else {
        setSaveError(result.error ?? 'Failed to save session');
      }
    });
  }

  // ─── Venue switch (ocean blocked) ───

  function handleForceVenueSwitch() {
    dispatch({ type: 'GO_TO_STEP', payload: 2 });
  }

  // ─── Render current step ───

  function renderStep() {
    switch (state.currentStep) {
      case 1:
        return (
          <Step01Student
            formState={state}
            students={students}
            onStudentLoaded={(s) => dispatch({ type: 'SET_STUDENT', payload: s })}
          />
        );
      case 2:
        return (
          <Step02Venue
            formState={state}
            options={venues}
            onSelect={(v, w) => dispatch({ type: 'SET_VENUE', payload: { venue: v, isWater: w } })}
          />
        );
      case 3:
        return (
          <Step03Ocean
            formState={state}
            options={oceanOptions}
            onSelect={(c, r) => dispatch({ type: 'SET_OCEAN', payload: { conditions: c, riskState: r } })}
            onForceVenueSwitch={handleForceVenueSwitch}
          />
        );
      case 4:
        return (
          <Step04SessionType
            formState={state}
            options={sessionTypes}
            onSelect={(v) => dispatch({ type: 'SET_SESSION_TYPE', payload: v })}
          />
        );
      case 5:
        return (
          <Step05Date
            formState={state}
            onSelect={(v) => dispatch({ type: 'SET_DATE', payload: v })}
          />
        );
      case 6:
        return (
          <Step06PilarPart
            formState={state}
            pilarParts={pilarParts}
            onSelect={(id, pilarId) => dispatch({ type: 'SET_PILAR_PART', payload: { id, pilarId } })}
          />
        );
      case 7:
        return (
          <Step07Mission
            formState={state}
            onChange={(v) => dispatch({ type: 'SET_MISSION', payload: v })}
          />
        );
      case 8:
        return (
          <Step08Drill
            formState={state}
            drills={drills}
            onSelect={(v) => dispatch({ type: 'SET_DRILL', payload: v })}
          />
        );
      case 9:
        return (
          <Step09WarmUp
            formState={state}
            options={warmUpOptions}
            onSelect={(v) => dispatch({ type: 'SET_WARM_UP', payload: v })}
          />
        );
      case 10:
        return (
          <Step10Simulation
            formState={state}
            options={simulationOptions}
            onSelect={(v) => dispatch({ type: 'SET_SIMULATION', payload: v })}
          />
        );
      case 11:
        return (
          <Step11MentalHack
            formState={state}
            options={mentalHackOptions}
            onSelect={(v) => dispatch({ type: 'SET_MENTAL_HACK', payload: v })}
          />
        );
      case 12:
        return (
          <Step12MissionTime
            formState={state}
            options={missionTimeOptions}
            onSelect={(v) => dispatch({ type: 'SET_MISSION_TIME', payload: v })}
          />
        );
      case 13:
        return (
          <Step13Repetitions
            formState={state}
            onChange={(v) => dispatch({ type: 'SET_REPETITIONS', payload: v })}
          />
        );
      case 14:
        return (
          <Step14Status
            formState={state}
            onSelect={(v) => dispatch({ type: 'SET_STATUS', payload: v })}
          />
        );
      case 15:
        return (
          <Step15Focus
            formState={state}
            onSelect={(v) => dispatch({ type: 'SET_FOCUS_RATING', payload: v })}
          />
        );
      case 16:
        return (
          <Step16ProgressiveRatings
            formState={state}
            ratingScales={ratingScales}
            onRate={(scale, value) => dispatch({ type: 'SET_RATING', payload: { scale, value } })}
          />
        );
      case 17:
        return (
          <Step17CoachFeedback
            formState={state}
            options={feedbackQuickOptions}
            onSelectQuick={(v) => dispatch({ type: 'SET_COACH_FEEDBACK_QUICK', payload: v })}
            onChangeText={(v) => dispatch({ type: 'SET_COACH_FEEDBACK_TEXT', payload: v })}
          />
        );
      case 18:
        return (
          <Step18Achieved
            formState={state}
            onChange={(v) => dispatch({ type: 'SET_ACHIEVED', payload: v })}
          />
        );
      case 19:
        return (
          <Step19WhatsNext
            formState={state}
            pilarParts={pilarParts}
            onSelect={(v) => dispatch({ type: 'SET_WHATS_NEXT', payload: v })}
          />
        );
      case 20:
        return (
          <Step20Homework
            formState={state}
            cueOptions={homeworkCueOptions}
            onToggleCue={(cue) => {
              const cues = state.homework_cues.includes(cue)
                ? state.homework_cues.filter((c) => c !== cue)
                : [...state.homework_cues, cue];
              dispatch({ type: 'SET_HOMEWORK_CUES', payload: cues });
            }}
            onChangeText={(v) => dispatch({ type: 'SET_HOMEWORK_TEXT', payload: v })}
          />
        );
      case 21:
        return (
          <Step21TotalDuration
            formState={state}
            options={totalDurationOptions}
            onSelect={(v) => dispatch({ type: 'SET_TOTAL_DURATION', payload: v })}
          />
        );
      case 22:
        return (
          <Step22IncidentClose
            formState={state}
            incidentTypes={incidentTypeOptions}
            onToggleIncident={(v) => dispatch({ type: 'SET_INCIDENT_REPORT', payload: v })}
            onSetIncidentType={(v) => dispatch({ type: 'SET_INCIDENT_TYPE', payload: v })}
            onSetIncidentDescription={(v) => dispatch({ type: 'SET_INCIDENT_DESCRIPTION', payload: v })}
            onSetIncidentAction={(v) => dispatch({ type: 'SET_INCIDENT_ACTION', payload: v })}
            onSave={handleSave}
            isSaving={state.isSubmitting}
          />
        );
      default:
        return null;
    }
  }

  // ─── Can advance? ───

  function canAdvance(): boolean {
    switch (state.currentStep) {
      case 1: return !!state.student_id && !!state.student;
      case 2: return !!state.training_venue;
      case 3: return !!state.ocean_conditions && state.oceanRiskState !== 'blocked';
      case 4: return !!state.session_type;
      case 5: return !!state.session_date;
      default: return true; // Planning + Close steps are more flexible
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress */}
      <CascadeProgress currentStep={state.currentStep} isWaterVenue={state.isWaterVenue} />

      {/* Step content */}
      <div className="px-4 py-6">
        {renderStep()}
      </div>

      {/* Error */}
      {saveError && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {/* Navigation (not shown on step 22 — it has its own save button) */}
      {state.currentStep < 22 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 max-w-lg mx-auto">
          {state.currentStep > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance() || isPending}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              canAdvance() && !isPending
                ? 'bg-[#1A1A2E] text-white hover:opacity-90 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isPending ? 'Loading...' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
