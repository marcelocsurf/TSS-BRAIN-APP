// Ocean Self-Sufficiency Quiz — runs as Stage 0 of intake.
//
// 6 questions: P0 gating (short-circuits if never surfed) + P1-P5.
//
// Scoring is CROSS-CALIBRATED to detect over-self-evaluation:
//   - P4 = level the student declares (technique-blind)
//   - P1+P2+P3 = ACTUAL technical understanding (board control, self-rescue, etiquette)
//   - P5 = conditions-reading habit
// If P4 says "head-high" but P1-P3 fail, the level gets demoted.
// This is the "be astute" requirement Marcelo emphasized.

import type { OceanLevel } from './ocean-levels';
import { oceanLevelByTier } from './ocean-levels';

export type OceanQuestionId = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export interface OceanOption {
  value: string;
  label: string;
  /** Per-option score contribution. P5 is multi-select so each option scores 1 if checked. */
  score?: number;
  /** Used by P4 to indicate declared level tier (1-5). */
  declaredTier?: number;
  /** Used by P0 to short-circuit. */
  shortCircuitTo?: OceanLevel;
}

export interface OceanQuestion {
  id: OceanQuestionId;
  prompt: string;
  helper?: string;
  /** 'single' = radio (single choice). 'multi' = checkbox group. */
  type: 'single' | 'multi';
  options: OceanOption[];
}

export const OCEAN_QUIZ: OceanQuestion[] = [
  {
    id: 'P0',
    prompt:
      "Have you surfed before in waves where your feet don't touch the bottom (you have to paddle to stay afloat)?",
    helper: "If never, we'll skip the rest — there's nothing to test yet.",
    type: 'single',
    options: [
      {
        value: 'never',
        label: 'I have never surfed',
        shortCircuitTo: 'beginner',
      },
      {
        value: 'whitewater_only',
        label: 'Only in whitewater / shorebreak (feet still touch the bottom)',
        shortCircuitTo: 'beginner',
      },
      {
        value: 'yes',
        label: "Yes, I've paddled out and caught waves where I can't touch bottom",
      },
    ],
  },
  {
    id: 'P1',
    prompt:
      "You're on the inside, a set is coming, and the next wave is about to break ON TOP of you. What do you do FIRST?",
    helper: 'How you actually handle pressure with your board.',
    type: 'single',
    options: [
      { value: 'let_go', label: 'I let go of the board and dive under', score: 0 },
      { value: 'turtle', label: 'I do a turtle roll (vuelta de tortuga)', score: 2 },
      { value: 'duck', label: 'I do a duck dive', score: 3 },
      { value: 'unsure', label: "Hasn't happened to me / not sure", score: 0 },
    ],
  },
  {
    id: 'P2',
    prompt:
      "A current is pulling you out and you can't paddle straight back to where you entered. What's the FIRST thing you do?",
    helper: 'The "obvious" answer is the wrong one.',
    type: 'single',
    options: [
      {
        value: 'paddle_against',
        label: 'Keep paddling hard against the current to get back to the same spot',
        score: 0,
      },
      {
        value: 'paddle_parallel',
        label: 'Paddle parallel to the beach until I clear the rip, then come in',
        score: 3,
      },
      { value: 'signal', label: 'Wave my arm and signal for help', score: 0 },
      { value: 'wait', label: 'Float and wait for someone to help me', score: 0 },
    ],
  },
  {
    id: 'P3',
    prompt: 'Two surfers paddle for the same wave at the same time. Who has priority?',
    helper: 'Basic etiquette — Pre-Course rule.',
    type: 'single',
    options: [
      { value: 'first_paddling', label: 'The one who started paddling out first', score: 0 },
      {
        value: 'closest_peak',
        label: 'The one closest to the peak (where the wave breaks first)',
        score: 3,
      },
      { value: 'first_up', label: 'The one who stands up first', score: 1 },
      { value: 'unsure', label: "I'm not sure", score: 0 },
    ],
  },
  {
    id: 'P4',
    prompt:
      'Up to what wave size would you go out ALONE — no coach beside you — and reach the lineup paddling in under 5 minutes?',
    helper: 'Be honest about what you can actually do.',
    type: 'single',
    options: [
      { value: 'waist', label: 'Up to waist-high', declaredTier: 2 },
      { value: 'chest', label: 'Up to chest-high', declaredTier: 3 },
      { value: 'head', label: 'Up to head-high', declaredTier: 4 },
      { value: 'overhead', label: 'Overhead or bigger', declaredTier: 5 },
    ],
  },
  {
    id: 'P5',
    prompt:
      'Before paddling out at a NEW spot, what do you check? (select all that apply)',
    helper: 'Habit reveals readiness more than any belt.',
    type: 'multi',
    options: [
      { value: 'wave_size', label: 'Wave size', score: 1 },
      { value: 'period', label: 'Swell period', score: 1 },
      { value: 'tide', label: 'Tide (rising / falling / time)', score: 1 },
      { value: 'wind', label: 'Wind (direction + strength)', score: 1 },
      { value: 'channels', label: 'Channels / currents / where the rip is', score: 1 },
      { value: 'impact', label: 'Where the impact zone is', score: 1 },
      { value: 'crowd', label: 'Crowd / other surfers', score: 1 },
      { value: 'hazards', label: 'Hazards (rocks, coral, bottom)', score: 1 },
    ],
  },
];

export type OceanQuizAnswers = {
  P0: string | null;
  P1: string | null;
  P2: string | null;
  P3: string | null;
  P4: string | null;
  P5: string[]; // multi-select
};

export const EMPTY_OCEAN_ANSWERS: OceanQuizAnswers = {
  P0: null,
  P1: null,
  P2: null,
  P3: null,
  P4: null,
  P5: [],
};

export interface OceanQuizScore {
  declaredTier: number; // 1-5 from P4
  technicalScore: number; // 0-9 from P1+P2+P3
  readingScore: number; // 0-8 from P5
  penalty: number; // tiers demoted
  finalTier: number; // 1-5 after calibration
  shortCircuited: boolean; // true if P0 ended quiz early
}

export function scoreOceanQuiz(answers: OceanQuizAnswers): {
  level: OceanLevel;
  score: OceanQuizScore;
} {
  // P0 short-circuit
  const p0 = OCEAN_QUIZ[0].options.find((o) => o.value === answers.P0);
  if (p0?.shortCircuitTo) {
    return {
      level: p0.shortCircuitTo,
      score: {
        declaredTier: 1,
        technicalScore: 0,
        readingScore: 0,
        penalty: 0,
        finalTier: 1,
        shortCircuited: true,
      },
    };
  }

  const optionScore = (qIdx: number, value: string | null): number => {
    if (!value) return 0;
    const opt = OCEAN_QUIZ[qIdx].options.find((o) => o.value === value);
    return opt?.score ?? 0;
  };

  const technicalScore =
    optionScore(1, answers.P1) +
    optionScore(2, answers.P2) +
    optionScore(3, answers.P3); // 0-9

  const p4 = OCEAN_QUIZ[4].options.find((o) => o.value === answers.P4);
  const declaredTier = p4?.declaredTier ?? 2; // default to L2 if missing

  const readingScore = (answers.P5 ?? []).reduce((sum, v) => {
    const opt = OCEAN_QUIZ[5].options.find((o) => o.value === v);
    return sum + (opt?.score ?? 0);
  }, 0); // 0-8

  // Penalty rules (cross-calibration — detects over-self-evaluation)
  let penalty = 0;
  if (technicalScore <= 1) penalty += 2;
  else if (technicalScore <= 3) penalty += 1;
  if (readingScore < 3) penalty += 1;

  const finalTier = Math.max(1, declaredTier - penalty);

  return {
    level: oceanLevelByTier(finalTier),
    score: {
      declaredTier,
      technicalScore,
      readingScore,
      penalty,
      finalTier,
      shortCircuited: false,
    },
  };
}

/** Validate that the user can submit (all required questions answered). */
export function isOceanQuizComplete(answers: OceanQuizAnswers): boolean {
  if (!answers.P0) return false;
  // Short-circuit: P0 alone is enough
  const p0 = OCEAN_QUIZ[0].options.find((o) => o.value === answers.P0);
  if (p0?.shortCircuitTo) return true;
  // Otherwise need P1-P5 all answered (P5 just needs the question seen — empty multi-select is fine since "I check nothing" is a valid answer that triggers penalty)
  return !!(answers.P1 && answers.P2 && answers.P3 && answers.P4);
}
