// White Belt Glossary — 35 essential TSS vocabulary terms.
// Source: 09_GLOSSARY.md from the COMPLETE PACKAGE (canon v1 EN).
// Maintained in code instead of DB to keep the portal glossary instantly
// available without an extra round-trip and without an extra migration.
// If Marcelo updates 09_GLOSSARY.md, sync here.

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const WB_GLOSSARY: GlossaryTerm[] = [
  { term: '5 KEY WORDS (5KW)', definition: '5-word canonical mnemonic per step. Memorize and recite while training.' },
  { term: 'A-frame', definition: 'A wave that breaks both directions from a single peak.' },
  { term: 'Belt', definition: 'Your TSS progression level. White → Yellow → Blue → Purple → Brown → Black.' },
  { term: 'Block', definition: 'Pedagogical group of steps within a belt. White Belt has Blocks 0 to 6.' },
  { term: 'Cobra', definition: 'Prone position with chest raised and hands at the ribs. Base of the Pop-Up.' },
  { term: 'Coach Cue', definition: 'Pedagogical phrase that condenses the teaching of a step.' },
  { term: 'Conciencia', definition: 'Belt Value of Pre-Course. Awareness of self, surroundings, impact.' },
  { term: 'Drill (DRL)', definition: 'Structured exercise that trains a specific step. Mechanics, repetition.' },
  { term: 'EDPF', definition: 'TSS pedagogical model: Explain → Demonstrate → Participate → Feedback.' },
  { term: 'Exit Test', definition: 'The 3-component test that earns you the White Belt certification.' },
  { term: 'FP2', definition: 'Feet Position #2 — canonical center back-foot position on the board.' },
  { term: 'Goofy', definition: 'Surfing stance with right foot forward, left foot back.' },
  { term: 'Go/no-go decision', definition: "Honest assessment of whether today's conditions match your level." },
  { term: 'Humildad', definition: 'Belt Value of White Belt. Open to learn, willing to fail, ready to grow.' },
  { term: 'Impact Zone', definition: 'Where the wave breaks with force. Avoid as a beginner.' },
  { term: 'Lineup', definition: 'The zone where surfers wait for waves.' },
  { term: 'Micro-cue', definition: 'Short verbal phrase you take to the water to anchor execution.' },
  { term: 'Mission (MIS)', definition: 'Specific objective applied in water. Defined time, reps, success criteria.' },
  { term: 'One Wave Framework', definition: 'TSS principle: extract maximum learning from each individual wave. Quality over quantity.' },
  { term: 'Peak', definition: 'Highest part of the wave, where it breaks first. Defines priority.' },
  { term: 'Power Stance', definition: 'Canonical posture: shoulders forward, weight forward, back knee compact, exhale active.' },
  { term: 'Pre-Course', definition: 'Module 0 — the 8 mandatory items before water training.' },
  { term: 'Priority Rule', definition: 'The surfer closest to the peak has priority over the wave.' },
  { term: 'Regular', definition: 'Surfing stance with left foot forward, right foot back.' },
  { term: 'Rip Current', definition: 'Current that pulls outward. Paddle parallel to shore, never against.' },
  { term: 'Safe Zone', definition: 'Area where you can practice without big waves breaking on top.' },
  { term: 'Sequence (SEQ)', definition: 'Canonical order of steps. White Belt has 5 cumulative sequences.' },
  { term: 'Softboard', definition: 'Foam, soft, safe board. The White Belt board.' },
  { term: 'Star-fall', definition: 'Safety position: arms extended, body flat, face up. Never dive head-first.' },
  { term: 'Step (STP)', definition: 'Canonical individual movement unit. 25 active in White Belt.' },
  { term: 'Sweet Spot', definition: 'Optimal point on board where you lie prone (nose barely floats, tail just submerged).' },
  { term: 'Triad', definition: 'Surfer × Ocean × Task. The 3 variables of every TSS pedagogical decision.' },
  { term: 'Turtle Roll', definition: 'Safety technique to pass foam while prone, without releasing the board.' },
  { term: 'VCA-6', definition: 'Venue Analysis framework: 6 elements before paddling out.' },
  { term: 'Whitewater', definition: 'White foam after the wave breaks. Where you train in White Belt.' },
];
