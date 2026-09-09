import type { SequencePageConfig } from './types';

// ═══ Las tres secuencias de ENTRADA del curso Blue ═══
// Marcelo (2026-09-09): "en teoría son cosas que ya vio en los belts
// anteriores, pero si alguien entra ya aquí porque tiene años de surfear
// puede ir a ver esos fundamentos… cada una se vuelve una secuencia y tiene
// pasos para ejecutarse". Mismo molde de cuatro pestañas, sin tablero de la
// ola ni pies (son bloques 1-3, lo que pasa una vez por ola antes del
// círculo). Los pasos son lecciones de White y Yellow; las misiones de la
// cadena completa son nuevas (MIS-BB-NAV / -CATCH / -LINE).

export const BB_NAV: SequencePageConfig = {
  id: 'BB-NAV',
  kind: 'entry',
  eyebrow: 'Getting to the wave · 1 of 3',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 0,
  title: 'Navigate the Ocean',
  stepIds: ['STP-010', 'STP-027', 'STP-024', 'YB-FND-03'],
  think: {
    whatIs: {
      headline: 'Getting out the back on your own: the board ready under you, the right paddling speed, and a way through every wave that comes at you.',
      line: 'Sweet spot → paddle at the speed the moment asks for → turtle roll or duck dive through the foam → out the back, ready.',
      where: 'From the sand to the lineup. Everything here happens lying on the board, before the Three Circles switch on.',
      whatFor: 'Getting to the lineup is half the battle. Arrive with energy, with the board, and in the right place — or the wave you wanted is gone before you are there.',
    },
    bodyFromLesson: 'STP-027',
    bodyMarkdown: `**The navigation pattern**

1. **Sweet spot.** Mount the board prone where the nose barely floats and the tail is just submerged. The board is ready, not fighting you.
2. **Paddle with purpose.** V1 cruising to hold position, V2 working to move, V3 to reach the peak with time, V4 sprint only for the take-off or a critical save. Match the speed to the wave, not to your nerves.
3. **Pass the foam.** Turtle roll: nose against the foam, roll under holding the rails, elbows on top of the board, wait through the turbulence, come back paddling. Duck dive on a shortboard: paddle · sink nose · drive tail · tuck · rise.
4. **Out the back.** Turn, sit, read. You arrived with energy.

The board never gets between you and the wave; the body is on the ocean side.`,
    rulesMarkdown: `- Sweet spot first: a board floating level is the only board that paddles well.
- Speed is a decision: V1–V2 most of the time; V3–V4 only when a wave asks for it.
- Turtle roll about one metre before the foam; duck dive as the wave arrives. Never let go of the board.
- Safety: the board never between you and the wave; never over the head.`,
    keyWords: [{ label: 'Steps', words: ['Sweet spot', 'Speed', 'Turtle roll · duck dive', 'Out the back'] }],
  },
  feel: {
    visualize: 'On the sand, eyes closed: the mount on the sweet spot, the first strokes at V1, a set coming, the roll under the foam and the recovery, the sprint for the last one, the lineup. One full paddle-out in your head.',
    land: ['DRL-WB-010-A', 'DRL-YB-027', 'DRL-WB-024-A'],
    skate: [],
  },
  do: {
    result: 'Three paddle-outs on your own, from the sand to the lineup, without the board fighting you, without losing ground on any wave, choosing the speed yourself.',
    missionId: 'MIS-BB-NAV',
    timing: 'Read the sets from the sand before you enter. Go on the lull; pass the foam as it comes; sprint only when a set is on you.',
    competence: 'Three paddle-outs in a row where the board floats level, the speed is yours, and every foam is passed without losing the board or your ground. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'sweet', title: 'Sweet spot', symptom: 'The board fights you: nose diving or tail sinking, paddling that goes nowhere.', indicators: [{ ok: 'The board floats level on each mount; you find the spot without thinking.', no: 'Nose under or tail under; every stroke is a fight.', fix: 'Slide until the nose barely floats.' }], deeper: { label: 'Get on Your Board / Find Sweet Spot', lessonId: 'STP-010', drillId: 'DRL-WB-010-A', missionId: 'MIS-WB-010' } },
    { key: 'speed', title: 'Paddling speed', symptom: 'You sprint everything and arrive empty, or cruise everything and arrive late.', indicators: [{ ok: 'You choose the speed for the moment: V1–V2 to travel, V3–V4 only when a wave asks.', no: 'One speed for everything; no energy left for the take-off.', fix: 'Name the speed before you paddle.' }], deeper: { label: 'Paddling Speeds 1–2–3–4', lessonId: 'STP-027', drillId: 'DRL-YB-027', missionId: 'MIS-YB-027' } },
    { key: 'foam', title: 'Turtle roll · duck dive', symptom: 'You lose the board, or you are pushed back to where you started.', indicators: [{ ok: 'Five rolls (or three duck dives) in a row without losing the board or your ground; you recover to paddling each time.', no: 'The board goes; the foam takes you back to the beach.', fix: 'Nose against the foam, roll about one metre before it. Shortboard: sink the nose, drive the tail.' }], deeper: { label: 'Turtle Roll · Duck Dive', lessonId: 'STP-024', drillId: 'DRL-WB-024-A', missionId: 'MIS-WB-024' } },
  ],
  review: { howItFeels: 'It feels like the ocean stops being an obstacle: you go where you decided, at the speed you decided, and every wave on the way out is something you pass through, not something that happens to you.' },
};

export const BB_CATCH: SequencePageConfig = {
  id: 'BB-CATCH',
  kind: 'entry',
  eyebrow: 'Getting to the wave · 2 of 3',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 0,
  title: 'Catch Waves',
  stepIds: ['STP-010', 'STP-024', 'STP-027', 'STP-033', 'STP-028', 'STP-029'],
  think: {
    whatIs: {
      headline: 'Reading the ocean and earning the wave: stage, pocket, angle — and you catch it, on your own.',
      line: 'Out the back → read the stage → chase the pocket → paddle with the right angle → catch. The sequence ends the moment the wave is yours.',
      where: 'In the lineup, on green moving waves. This is Yellow Belt sequence 6, complete, as Blue uses it every wave.',
      whatFor: 'Every maneuver of Blue starts with a wave caught in the right place with speed. Catch late or off the pocket and there is no circle to run.',
    },
    bodyFromLesson: 'STP-029',
    bodyMarkdown: `**The catch pattern**

1. **Out the back** on the sweet spot, passing the foam, paddling with purpose.
2. **Read the stage.** Waves break because they travel and hit a bottom. Stage 1 is not catchable; stage 2–3 is where you want to be; stage 4 is too late.
3. **Chase the pocket.** The point of maximum energy, where it is about to break. Eyes on it the whole paddle-in.
4. **Paddle with the correct angle.** Far from the pocket: aggressive angle toward it. Near it: a moderate adjustment. In front of it: use its energy directly.
5. **Catch it.** The wave takes you: the sequence is complete. What you do standing up is the next sequence.

The speeds and the pocket are one system: the speed exists to reach the pocket on time.`,
    rulesMarkdown: `- Stage before commitment: do not waste energy on stage 1.
- Eyes on the pocket from the first stroke to the take-off.
- The angle depends on where the pocket is — pocket awareness is the prerequisite.
- Self-sufficiency is the goal: nobody puts you on the wave.`,
    keyWords: [{ label: 'Steps', words: ['Stage', 'Pocket', 'Angle', 'Catch'] }],
  },
  feel: {
    visualize: 'From the beach, track twenty waves: name the stage of each one as it moves, point at the pocket as it forms, say the angle you would take. Then close your eyes and catch one in your head.',
    land: ['DRL-YB-033', 'DRL-YB-028', 'DRL-YB-029'],
    skate: [],
  },
  do: {
    result: 'Three green waves caught on your own at stage 2–3, chasing the pocket, with the right angle. Nobody put you on the wave.',
    missionId: 'MIS-BB-CATCH',
    timing: 'Commit at stage 2, catch at stage 3. The angle is chosen before the last five strokes.',
    competence: 'Three waves in a row where you can say, for each one, the stage you caught it at, where the pocket was and the angle you took. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'stage', title: 'Read the stage', symptom: 'You paddle for waves that are not there yet, or too late for the ones that are.', indicators: [{ ok: 'You name the stage of each wave as it moves and commit at stage 2–3.', no: 'You chase stage 1 and arrive empty for the real one.', fix: 'Watch, name the stage, then move.' }], deeper: { label: 'Reading Wave Stages 1–4', lessonId: 'STP-033', drillId: 'DRL-YB-033', missionId: 'MIS-YB-033' } },
    { key: 'pocket', title: 'Chase the pocket', symptom: 'You catch the wave far from the energy, on the shoulder, with no speed.', indicators: [{ ok: 'Your eyes stay on the pocket the whole paddle-in and you position yourself to reach it.', no: 'You look at the beach or at your board; the pocket passes you.', fix: 'Eyes on the pocket. Paddle to it.' }], deeper: { label: 'Chase the Pocket', lessonId: 'STP-028', drillId: 'DRL-YB-028', missionId: 'MIS-YB-028' } },
    { key: 'angle', title: 'Paddle with the correct angle', symptom: 'You paddle straight to the beach and the wave passes under you, or you angle without knowing why.', indicators: [{ ok: 'The angle matches where the pocket is: aggressive when far, moderate when near, direct when in front.', no: 'Same angle for every wave.', fix: 'Call your angle before the last strokes.' }], deeper: { label: 'Paddle with the Correct Angle', lessonId: 'STP-029', drillId: 'DRL-YB-029', missionId: 'MIS-YB-029' } },
  ],
  review: { howItFeels: 'It feels like the wave was yours before you caught it: you saw it coming, you knew where the energy was, you arrived with time. Nobody pushed you in.' },
};

export const BB_LINE: SequencePageConfig = {
  id: 'BB-LINE',
  kind: 'entry',
  eyebrow: 'Getting to the wave · 3 of 3',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 0,
  title: 'Pick Your Line + Pop-Up',
  stepIds: ['STP-034', 'STP-016', 'STP-030'],
  think: {
    whatIs: {
      headline: 'From lying down to standing on the line you chose, in about two seconds, with the back foot exactly where you decided.',
      line: 'Cobra and pick the line → pop-up, both feet together → land in posture, back foot in FP2 by default or FP1 on purpose → already running the line.',
      where: 'On the green face, the moment the wave takes you. This is the door to the Infinite Circle: the loop starts the instant you are standing.',
      whatFor: 'Where you stand up, how fast, and where the back foot lands decide the first line of the ride — and the first line decides the first maneuver.',
    },
    bodyFromLesson: 'STP-016',
    bodyMarkdown: `**The line + pop-up pattern**

1. **Cobra.** Chest up, hands at the ribs, eyes forward down the wave.
2. **Pick the line.** Redirect the nose down the line you chose. Cobra + correct line = time.
3. **Pop-up.** One movement, about two seconds: both feet land together, never the back foot first. Hips down, head up on landing.
4. **Back foot where you decided.** FP2 by default — the balance point. FP1 on purpose when the first move is a tight turn. Shuffle if the line asks for it.
5. **Posture.** Shoulders pointing where the nose points, weight on the front foot, low. You are running the line — and the circle begins.`,
    rulesMarkdown: `- The line is chosen in the cobra, before you stand. Never the other way round.
- Both feet land together. Hands release only when centred and stable.
- FP1, FP2 and FP3 are the back foot. The front foot lands centred on the stringer.
- Land in posture, not tall: the pop-up ends in the base every maneuver starts from.`,
    keyWords: [{ label: 'Steps', words: ['Cobra', 'Line', 'Two seconds', 'FP2 · FP1', 'Posture'] }],
  },
  feel: {
    visualize: 'On the mat: cobra, eyes down the line, the two-second pop-up, both feet together, the back foot landing in FP2 — then shuffle to FP1 and back. Ten pop-ups in your head before ten on the mat.',
    land: ['DRL-YB-034', 'DRL-WB-016-A', 'DRL-YB-030', 'DRL-YB-030-03'],
    skate: [],
  },
  do: {
    result: 'Five waves where the line is chosen in the cobra, the pop-up takes about two seconds with both feet together, and you land in posture with the back foot where you decided.',
    missionId: 'MIS-BB-LINE',
    timing: 'Cobra as the wave takes you; the line is set before the hands release; the pop-up fires as the board starts to glide down the line.',
    competence: 'Five waves in a row standing in posture on the line you chose, back foot landing where you decided, no back-foot-first landings. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'cobra', title: 'Cobra + pick the line', symptom: 'You stand up first and decide later; the board goes straight.', indicators: [{ ok: 'In the cobra the nose already points down the line you chose.', no: 'The board goes straight to the beach; the decision comes after standing.', fix: 'Cobra, redirect the nose, then stand.' }], deeper: { label: 'Cobra + Pick Line', lessonId: 'STP-034', drillId: 'DRL-YB-034', missionId: 'MIS-YB-034' } },
    { key: 'popup', title: 'Pop-up · two seconds, feet together', symptom: 'A slow pop-up in two stages, the back foot first, or a knee on the board.', indicators: [{ ok: 'One movement, about two seconds, both feet land together; hips down, head up.', no: 'Back foot first, or knee down; the glide is lost.', fix: 'Solid cobra, then one movement. Feet together.' }], deeper: { label: 'Pop-Up', lessonId: 'STP-016', drillId: 'DRL-WB-016-A', missionId: 'MIS-WB-016' } },
    { key: 'feet', title: 'Back foot where you decided', symptom: 'The back foot lands wherever it lands, by habit; the first turn does not come.', indicators: [{ ok: 'FP2 by default, FP1 on purpose; you know where the back foot landed and why.', no: 'The foot sits wherever it landed; the board does not answer.', fix: 'Decide the foot before the pop-up. Shuffle if needed.' }], deeper: { label: 'Pop Up + Foot Position 1 or 2', lessonId: 'STP-030', drillId: 'DRL-YB-030-03', missionId: 'MIS-YB-030' } },
  ],
  review: { howItFeels: 'It feels like the ride starts before you are standing: the line is already there, the pop-up only puts you on it, and your feet land where your head already was.' },
};
