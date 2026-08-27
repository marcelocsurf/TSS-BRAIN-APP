// Graduation rules per belt — the "complete evaluation" that decides whether
// a student is ready for the next level. Kept deliberately small so the coach
// sees a simple readiness verdict, without losing the canon criteria.
//
// An STP counts as "demonstrated" when rated >= stpThreshold stars.
// Canon rule (Blue Belt and forward): the student must reach stpThreshold on
// EVERY part of the sequence (4★ en cada parte) — requireAllStps = true. A belt
// is earned when: all sequence STPs are demonstrated AND principles met >= minPrinciples.

export interface GraduationRule {
  beltLabel: string;
  // Course sections whose STPs make up the sequence rated in the final
  // evaluation. Yellow Belt sums White + Yellow so all fundamentals are
  // re-confirmed, not just the new YB steps.
  sections: string[];
  stpThreshold: number;   // stars needed for an STP to count as demonstrated
  minStps: number;        // shown in the UI; with requireAllStps it equals the catalog
  // Canon rule: the student must hit stpThreshold on EVERY part of the
  // sequence (4★ in each STP) — not just a subset.
  requireAllStps: boolean;
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
    minStps: 25,
    requireAllStps: true,
    principles: [],
    minPrinciples: 0,
  },
  // Yellow Belt — full White->Yellow sequence. Verificado contra producción
  // 2026-08-27: son 25 + 10 = 35 pasos activos, no 33. La constante había
  // quedado de cuando Yellow tenía 8.
  yellow_belt: {
    beltLabel: 'Yellow Belt',
    sections: ['white_belt', 'yellow_belt'],
    stpThreshold: 4,
    minStps: 35,
    requireAllStps: true,
    principles: [
      'Endurance and enjoyment are not opposites',
      'Cobra + Line = TIME',
      'External × Internal = sustained line',
      'Exit with elegance, not with turbulence',
      'Errors are signals, not failures',
    ],
    minPrinciples: 3,
  },
  // Blue Belt — full White->Yellow->Blue sequence. Verificado contra
  // producción 2026-08-27: son 25 + 10 + 20 = 55 pasos activos, no 48.
  // Principles
  // are the Blue Belt Exit Test criteria (verbatim from the manual). Canon rule:
  // 4★ in EVERY part of the sequence to advance (requireAllStps).
  blue_belt: {
    beltLabel: 'Blue Belt',
    sections: ['white_belt', 'yellow_belt', 'blue_belt'],
    stpThreshold: 4,
    minStps: 55,
    requireAllStps: true,
    principles: [
      'Execute the Universal Sequence Formula on at least 4 of 5 attempts per sequence (Seq #10, #11, #12, #13)',
      'Pump effectively on FS and BS (Seq #8, #9) at least 3 of 5 attempts per side',
      'Self-identify which stage failed when execution is below threshold',
      'Demonstrate the 4 BB Concepts (Floater, Impulso, Low Finish, BT Concept) in context',
      'Verbalize Compromiso Consciente in your own words',
    ],
    minPrinciples: 4,
  },
};
