// Surf-level quiz — single source of truth (used by the public lead magnet
// AND, later, by the intake Stage 1). Scenario-based (no self-rating) so the
// result is realistic. 6 levels map 1:1 to the TSS belts.

export interface QuizOption { t: string; s: number }
export interface QuizQuestion { phase: string; scenario: string; prompt: string; opts: QuizOption[] }

export const QUESTIONS: QuizQuestion[] = [
  { phase: 'Getting Out', scenario: "You're at the beach. The waves are 3-4 feet and breaking consistently. You paddle out toward the lineup.", prompt: 'What happens when a wall of whitewater comes at you?',
    opts: [
      { t: 'I get pushed back to shore — I lose my board or can’t get past the impact zone', s: 0 },
      { t: 'I can push through small ones but anything chest-high sends me back', s: 3 },
      { t: 'I duck dive under and keep paddling — I make it out without much trouble', s: 7 },
      { t: 'I read the sets, time my paddle-out, and duck dive through anything cleanly', s: 10 }] },
  { phase: 'Catching Waves', scenario: 'You spot a clean wave. You turn around and start paddling to catch it.', prompt: 'What typically happens next?',
    opts: [
      { t: 'The wave passes under me, or I catch it but can’t stand up in time', s: 0 },
      { t: 'I catch whitewater and stand up, but I miss most green waves', s: 3 },
      { t: 'I catch green waves regularly and pop up in one smooth motion', s: 7 },
      { t: 'I pick waves selectively, catch them early, and pop up instantly in the pocket', s: 10 }] },
  { phase: 'Riding The Wave', scenario: "You've caught the wave and you're on your feet. The wave is peeling to the right along the beach.", prompt: 'What does your ride look like?',
    opts: [
      { t: 'I ride straight to shore in the whitewater — I can’t control direction yet', s: 0 },
      { t: 'I angle along the face a little but I can’t do proper turns', s: 3 },
      { t: 'I ride the open face, turn both directions, and link a few maneuvers', s: 7 },
      { t: 'I carve confidently with speed, reading the wave and adjusting my line in real time', s: 10 }] },
  { phase: 'Generating Speed', scenario: "You're riding along and the wave starts to flatten out. You need speed to make the next section.", prompt: 'What do you do?',
    opts: [
      { t: 'I don’t know how to generate speed — I ride what the wave gives me', s: 0 },
      { t: 'I try pumping but slow down and the wave catches up', s: 3 },
      { t: 'I pump effectively and generate speed — I keep up with most sections', s: 7 },
      { t: 'I project speed naturally between maneuvers and rarely get caught behind', s: 10 }] },
  { phase: 'Power Surfing', scenario: "You're coming off a fast bottom turn on a head-high wave. The lip is pitching above you.", prompt: 'What can you realistically do?',
    opts: [
      { t: 'I wouldn’t be here — I don’t surf waves this size or do bottom turns', s: 0 },
      { t: 'I do a bottom turn but can’t project up to the lip', s: 3 },
      { t: 'I hit the lip and sometimes land it — my timing is getting there', s: 7 },
      { t: 'I hit the lip with power, redirect off the top, and drive back down with speed', s: 10 }] },
  { phase: 'Flow & Connection', scenario: 'The wave goes flat ahead. No steep face. But there’s a section reforming 20 feet down the line.', prompt: 'How do you connect?',
    opts: [
      { t: 'I don’t know how — I ride until the wave dies', s: 0 },
      { t: 'I try turning back but lose speed and stall', s: 3 },
      { t: 'I cutback into the pocket, reset, and keep moving forward', s: 7 },
      { t: 'Full roundhouse cutback, rebound off the foam, accelerate into the next section', s: 10 }] },
  { phase: 'The Finish', scenario: 'End of your ride. The wave is closing out and the lip is throwing. One last chance.', prompt: 'Your closing move?',
    opts: [
      { t: 'I ride until the wave dies or I fall — no real finish', s: 0 },
      { t: 'I try to kick out cleanly over the back', s: 3 },
      { t: 'I throw a floater or attempt a closeout re-entry', s: 7 },
      { t: 'Full vertical hit, layback snap, or air — and I land it', s: 10 }] },
];

export interface QuizLevel {
  name: string;
  belt: string;       // maps to TSS belt_level
  min: number; max: number;
  color: string;
}

export const LEVELS: QuizLevel[] = [
  { name: 'Beginner',  belt: 'white_belt',  min: 0,  max: 9,  color: '#6c63ff' },
  { name: 'Novice',    belt: 'yellow_belt', min: 10, max: 25, color: '#2d9f4e' },
  { name: 'Foundation',belt: 'blue_belt',   min: 26, max: 40, color: '#e68a00' },
  { name: 'Emerging',  belt: 'purple_belt', min: 41, max: 53, color: '#ff6b6b' },
  { name: 'Pre-Elite', belt: 'brown_belt',  min: 54, max: 63, color: '#00bcd4' },
  { name: 'Elite',     belt: 'black_belt',  min: 64, max: 70, color: '#e040fb' },
];

export const SKILLS = ['Paddle Out', 'Takeoff', 'Wave Riding', 'Speed', 'Power', 'Flow', 'Finishing'];
export const MAX_SCORE = 70;

// ── Ocean knowledge (autonomy) — feeds ocean_level, separate from technique ──
// Each option carries the ocean_level it implies. We take the LOWEST level
// across answers (safety-first: a gap anywhere caps autonomy).
export interface OceanOption { t: string; level: string }
export interface OceanQuestion { phase: string; scenario: string; prompt: string; opts: OceanOption[] }

export const OCEAN_QUESTIONS: OceanQuestion[] = [
  { phase: 'Currents', scenario: 'You paddle out and realize you’re drifting sideways down the beach, away from where you started.', prompt: 'What’s going on and what do you do?',
    opts: [
      { t: 'I wouldn’t notice until I was far away — I’d feel lost', level: 'beginner' },
      { t: 'I notice but I’d panic a bit / need someone to guide me back', level: 'supervised' },
      { t: 'It’s a current; I paddle parallel to shore to get out of it, then back in', level: 'semi_autonomous' },
      { t: 'I read currents before entering and use them to my advantage', level: 'autonomous' }] },
  { phase: 'Priority & Etiquette', scenario: 'A surfer is already up and riding toward you on the same wave you’re about to take.', prompt: 'What do you do?',
    opts: [
      { t: 'I don’t really know the rules yet', level: 'beginner' },
      { t: 'I know I shouldn’t drop in but I’m not always sure who has priority', level: 'supervised' },
      { t: 'They have priority (closest to the peak) — I pull back and don’t drop in', level: 'semi_autonomous' },
      { t: 'I read the lineup, know the priority order, and communicate clearly', level: 'autonomous' }] },
  { phase: 'Self-Rescue', scenario: 'You lose your board, you’re past where you can stand, and you’re a bit tired.', prompt: 'What’s your plan?',
    opts: [
      { t: 'I’d be in trouble — I rely on having someone close by', level: 'beginner' },
      { t: 'I can manage in small/calm conditions only, with supervision', level: 'supervised' },
      { t: 'I stay calm, signal if needed, and can swim/float back in known spots', level: 'semi_autonomous' },
      { t: 'I’m comfortable self-rescuing in head-high+ conditions alone', level: 'autonomous' }] },
];

const OCEAN_ORDER = ['beginner', 'supervised', 'semi_autonomous', 'autonomous', 'advanced'];

// Lowest (most conservative) ocean level across answers.
export function oceanLevelFromAnswers(answers: number[]): string {
  let worstIdx = OCEAN_ORDER.length - 1;
  let any = false;
  for (let i = 0; i < OCEAN_QUESTIONS.length; i++) {
    const a = answers[i];
    if (typeof a !== 'number' || a < 0) continue;
    any = true;
    const lvl = OCEAN_QUESTIONS[i].opts[a]?.level;
    const idx = OCEAN_ORDER.indexOf(lvl);
    if (idx >= 0 && idx < worstIdx) worstIdx = idx;
  }
  return any ? OCEAN_ORDER[worstIdx] : 'beginner';
}

export function scoreFromAnswers(answers: number[]): number {
  let score = 0;
  for (let i = 0; i < QUESTIONS.length; i++) {
    const a = answers[i];
    if (typeof a !== 'number' || a < 0) continue;
    // a is either an option index (0-3) or a pre-filled raw score (>3, from the gate skip)
    score += a <= 3 ? (QUESTIONS[i].opts[a]?.s ?? 0) : a;
  }
  return score;
}

export function levelForScore(score: number): QuizLevel {
  let lv = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) { lv = LEVELS[i]; break; }
  }
  return lv;
}

// Per-skill percentage (one question per skill, in order).
export function skillMap(answers: number[]): { name: string; pct: number }[] {
  return SKILLS.map((name, i) => {
    const a = answers[i];
    const raw = typeof a === 'number' && a >= 0 ? (a <= 3 ? (QUESTIONS[i].opts[a]?.s ?? 0) : a) : 0;
    return { name, pct: Math.round((raw / 10) * 100) };
  });
}
