// Graduation rules per belt — the "complete evaluation" that decides whether
// a student is ready for the next level. Kept deliberately small so the coach
// sees a simple readiness verdict, without losing the canon criteria.
//
// An STP counts as "demonstrated" when rated >= stpThreshold stars.
// A belt is earned when: demonstrated STPs >= minStps AND principles met >= minPrinciples.

export interface GraduationRule {
  beltLabel: string;
  // Course sections whose STPs make up the sequence rated in the final
  // evaluation. Yellow Belt sums White + Yellow so all fundamentals are
  // re-confirmed, not just the new YB steps.
  sections: string[];
  stpThreshold: number;   // stars needed for an STP to count as demonstrated
  minStps: number;        // minimum STPs demonstrated (across the sections)
  principles: string[];   // canon principles to check ([] = none for this belt)
  minPrinciples: number;  // minimum principles embodied
}

// Keyed by the belt the camp graduates students INTO (template includes_course_key).
export const GRADUATION_RULES: Record<string, GraduationRule> = {
  // White Belt — WB Exit Test: >= 18 of 25 WB STPs.
  white_belt: {
    beltLabel: 'White Belt',
    sections: ['white_belt'],
    stpThreshold: 4,
    minStps: 18,
    principles: [],
    minPrinciples: 0,
  },
  // Yellow Belt — full White->Yellow sequence (25 + 8 = 33). Re-confirm all
  // fundamentals + the 8 YB steps: >= 24 of 33 STPs + >= 3 of 5 principles.
  yellow_belt: {
    beltLabel: 'Yellow Belt',
    sections: ['white_belt', 'yellow_belt'],
    stpThreshold: 4,
    minStps: 24,
    principles: [
      'Endurance and enjoyment are not opposites',
      'Cobra + Line = TIME',
      'External × Internal = sustained line',
      'Exit with elegance, not with turbulence',
      'Errors are signals, not failures',
    ],
    minPrinciples: 3,
  },
};
