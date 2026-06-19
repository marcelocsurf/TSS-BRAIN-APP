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
  { phase: 'Speed', scenario: "You're up and riding, but the wave gets slow and mushy ahead of you.", prompt: 'What happens?',
    opts: [
      { t: 'I slow down and the wave dies — I don’t know how to keep going', s: 0 },
      { t: 'I try to keep moving but I usually lose the wave', s: 3 },
      { t: 'I move my board side to side to keep my speed and stay with the wave', s: 7 },
      { t: 'I generate speed easily and stay ahead of the slow section', s: 10 }] },
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
  // Narrative shown on the result screen (verbatim from the lead-magnet quiz).
  rt?: string;   // section title
  m1?: string;   // paragraph 1
  m2?: string;   // paragraph 2
  q?: string;    // closing quote
}

export const LEVELS: QuizLevel[] = [
  { name: 'Beginner', belt: 'white_belt', min: 0, max: 9, color: '#6c63ff',
    rt: 'Why this level matters',
    m1: 'Every advanced surfer started exactly here. This isn’t a label — it’s a starting point. The surfers who progress fastest from Beginner build a rock-solid foundation: ocean comfort, paddle fitness, and a popup that becomes muscle memory.',
    m2: 'Skipping this stage is the #1 reason surfers plateau later. The fundamentals you build now become the invisible platform everything else stands on.',
    q: 'The best time to build the right habits is before the wrong ones take over.' },
  { name: 'Novice', belt: 'yellow_belt', min: 10, max: 25, color: '#2d9f4e',
    rt: 'Why this level matters',
    m1: 'You can catch waves — that’s a real milestone. But here’s what separates Novices who stay stuck for years from those who level up in months: intentional practice on wave selection and turning mechanics.',
    m2: 'Most surfers stay at this level longer than needed because they keep doing what’s comfortable instead of training what’s weak. Your next unlock isn’t more time in the water — it’s smarter time.',
    q: 'Surfing more doesn’t mean improving more. Training the right thing at the right time does.' },
  { name: 'Foundation', belt: 'blue_belt', min: 26, max: 40, color: '#e68a00',
    rt: 'The critical stage',
    m1: 'This is the most important level in surf development. You can ride and turn — but the quality of your bottom turn and speed generation will determine everything that follows.',
    m2: 'Foundation surfers who skip to advanced maneuvers develop compensating habits that are extremely hard to undo. Those who master speed, compression, and rail-to-rail transitions here unlock performance surfing almost effortlessly.',
    q: 'Your bottom turn is your signature. Everything above the lip is just a reflection of what happens below it.' },
  { name: 'Emerging', belt: 'purple_belt', min: 41, max: 53, color: '#ff6b6b',
    rt: 'Where performance begins',
    m1: 'You’ve earned real skills. You surf with power and intention. But this is where ego becomes the biggest enemy of progress — it feels like you should land everything, and when you don’t, frustration creeps in.',
    m2: 'The gap between Emerging and Pre-Elite isn’t new tricks. It’s consistency, reading critical sections, and committing fully when it matters. The mental game becomes as important as the physical one.',
    q: 'The difference between good and great isn’t what you do on your best wave — it’s what you do on every wave.' },
  { name: 'Pre-Elite', belt: 'brown_belt', min: 54, max: 63, color: '#00bcd4',
    rt: 'The final gap',
    m1: 'You’re in the top 2% of surfers who’ve taken this assessment. At this level, improvement isn’t adding moves — it’s eliminating inconsistency and surfing critical waves with full commitment, every time.',
    m2: 'The athletes who break through here do so by refining timing, wave selection in consequential conditions, and the mental resilience to commit when stakes are highest.',
    q: 'At this level, the wave doesn’t care about your talent. It only rewards your commitment.' },
  { name: 'Elite', belt: 'black_belt', min: 64, max: 70, color: '#e040fb',
    rt: 'The endless pursuit',
    m1: 'You’re surfing at the highest level. But you already know — there’s no finish line. The pursuit is progressive surfing, competition IQ, and performing in the most challenging conditions on the planet.',
    m2: 'Even at this stage, the best in the world work on fundamentals daily. The difference is in details that only become visible at this speed.',
    q: 'Mastery isn’t a destination. It’s a standard you hold yourself to every single session.' },
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
