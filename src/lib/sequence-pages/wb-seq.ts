import type { SequencePageConfig } from './types';

// ═══ WHITE BELT · las 5 secuencias en cuatro pestañas ═══
// Marcelo (2026-09-09): "el mismo formato con las secuencias de White".
// Son secuencias de entrada (kind 'entry': sin tablero de la ola ni pies,
// salvo la #4 que lleva pies). Los pasos son las 25 lecciones de White; las
// misiones de la cadena completa son nuevas (MIS-WB-SEQ1..5-RUN), sin
// conteo; el conteo vive en la competencia. Indicadores desde "How you know
// you have it" de cada lección y la doctrina (nariz contra la energía,
// tabla nunca entre vos y la ola, pies juntos, caderas abajo, Power
// Posture completa, impulso flex·touch·push·extend).

const NO_SKATE: string[] = [];

export const WB_SEQ_1: SequencePageConfig = {
  id: 'WB-SEQ-1',
  kind: 'entry',
  belt: 'white_belt',
  courseKey: 'white_belt',
  number: 1,
  title: 'Board Control',
  // Marcelo (2026-09-09): la secuencia arranca en Grab Board. Venue Analysis y
  // Warm Up son la preparación de CADA sesión (prep), no pasos de la secuencia.
  stepIds: ['STP-003', 'STP-004', 'STP-005', 'STP-006', 'STP-007', 'STP-008', 'STP-009'],
  prep: [
    { lessonId: 'STP-001', label: 'Venue Analysis', note: 'Read the spot before you touch the board: safe zone, impact zone, hazards, entry and exit.' },
    { lessonId: 'STP-002', label: 'Warm Up', note: 'Mobility · activation · simulation · breath. You enter warm and focused.' },
  ],
  think: {
    whatIs: {
      headline: 'Controlling your board: grabbing it, walking out with it, placing it, passing the foam standing, turning safely, and walking back — from the sand and back.',
      line: 'Grab the board → walk out → put it in the water → control it → pass the foam standing → turn around safely → walk back.',
      where: 'From the sand to waist-deep water and back. Everything here happens standing, with the board in your hands.',
      whatFor: 'This is the first part of the bigger sequence: controlling your board — knowing it, grabbing it, passing foams, turning. Every ride later depends on getting in and out with the board, safely, without thinking.',
    },
    bodyFromLesson: 'STP-006',
    bodyMarkdown: `**The board control pattern**

1. **Grab the board:** knees bent, back straight, both hands on the rails, carried under control.
2. **Walk out** on a lull, board beside you, on the ocean side of your body.
3. **Put the board in the water** at waist depth, gently, nose pointing into the incoming waves — against the direction the wave's energy travels.
4. **Control it:** press the tail, keep the centre, pivot with the foam; the board never gets between you and the wave.
5. **Go through whitewater standing:** align, wait, press, lift, pass — and move forward after each one.
6. **Turn around safely:** check, pivot, body between the board and the wave, ready to paddle.
7. **Walk back to the sand:** look back, read the foam, adjust, land composed.`,
    rulesMarkdown: `- The board is never between you and the wave: your body stays on the ocean side.
- Never carry the board over your head; the second carry is under the armpit.
- The nose points into the incoming waves whenever the board is in the water.
- Enter on a lull, not on a set. Look back on the way out and on the way in.`,
    keyWords: [{ label: 'Steps', words: ['Grab', 'Walk out', 'Place', 'Control', 'Pass', 'Turn', 'Walk back'] }],
  },
  feel: {
    visualize: 'On the sand, venue read and body warm: lift the board with your knees, walk to the water beside it, place it nose to the foam, feel the tail under your hand as a foam comes, turn with the board on the beach side, walk back looking behind you. One full lap in your head.',
    land: ['DRL-WB-003-A', 'DRL-WB-04', 'DRL-WB-005-A', 'DRL-WB-006-A', 'DRL-WB-07', 'DRL-WB-008-A', 'DRL-WB-009-A'],
    skate: NO_SKATE,
  },
  do: {
    result: 'One full lap on your own: board carried and placed correctly, three foam lines passed standing with the board under control, a safe turn, and back to the sand composed.',
    missionId: 'MIS-WB-SEQ1-RUN',
    timing: 'Venue read and warm-up done before you touch the board. Enter on a lull. Face every foam with the nose into it; never turn your back on a set.',
    competence: 'Three laps across three sessions where nothing has to be corrected: the board never gets away, never gets between you and a wave, and you come back composed. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'grab', title: 'Grab the board', symptom: 'You lift with your back, swing the board, or slap it down.', indicators: [{ ok: 'Knees bent, back straight, both hands on the rails; carried under control; set down gently.', no: 'Back lift, swinging, slap.', fix: 'Centre · knees · rails · lift · carry.' }], deeper: { label: 'Grab Board', lessonId: 'STP-003', drillId: 'DRL-WB-003-A', missionId: 'MIS-WB-003' } },
    { key: 'walk', title: 'Walk out', symptom: 'You enter on a set, lose the board, or arrive flustered.', indicators: [{ ok: 'You wait for a lull, enter without losing the board and arrive at waist depth composed.', no: 'You walk into a set and the board goes.', fix: 'Patience · drag · side · face · place.' }], deeper: { label: 'Walk Out', lessonId: 'STP-004', drillId: 'DRL-WB-04', missionId: 'MIS-WB-004' } },
    { key: 'place', title: 'Put the board in the water', symptom: 'The board slaps in, or ends up sideways to the foam.', indicators: [{ ok: 'The board enters gently and stays with the nose pointing into the incoming waves — never parallel.', no: 'Sideways board; the foam takes it.', fix: 'Depth · pause · lower · release · nose into the waves.' }], deeper: { label: 'Put Board in the Water', lessonId: 'STP-005', drillId: 'DRL-WB-005-A', missionId: 'MIS-WB-005' } },
    { key: 'control', title: 'Control your board', symptom: 'The board turns sideways, or gets between you and the wave.', indicators: [{ ok: 'Nose always into the foam, you on the ocean side, several foams passed without losing control.', no: 'Sideways board, body on the beach side.', fix: 'Tail · centre · side · press · pivot.' }], deeper: { label: 'Control Your Board', lessonId: 'STP-006', drillId: 'DRL-WB-006-A', missionId: 'MIS-WB-006' } },
    { key: 'pass', title: 'Go through whitewater standing', symptom: 'The foam knocks you back, or the board disconnects.', indicators: [{ ok: 'You pass the foam without losing balance, the board stays connected, and you move forward after each one.', no: 'You go backward with every foam.', fix: 'Align · wait · press · lift · pass.' }], deeper: { label: 'Go Through Whitewater Standing', lessonId: 'STP-007', drillId: 'DRL-WB-07', missionId: 'MIS-WB-007' } },
    { key: 'turn', title: 'Turn around safely', symptom: 'You turn with the board between you and the wave, or end up scrambling.', indicators: [{ ok: 'You check, pivot with the body between the board and the wave, and finish ready to paddle.', no: 'The board is on the wave side during the turn.', fix: 'Check · pivot · back · control · ready.' }], deeper: { label: 'Turn Around Safely', lessonId: 'STP-008', drillId: 'DRL-WB-008-A', missionId: 'MIS-WB-008' } },
    { key: 'back', title: 'Walk back to the sand', symptom: 'You get hit from behind, or arrive panicked.', indicators: [{ ok: 'You look back, read the foam, adjust, and land composed without getting hit.', no: 'Back to the ocean, hit from behind.', fix: 'Look · read · walk · adjust · land.' }], deeper: { label: 'Walk Back to the Sand', lessonId: 'STP-009', drillId: 'DRL-WB-009-A', missionId: 'MIS-WB-009' } },
  ],
  review: { howItFeels: 'It feels like the board is yours, not the ocean’s: you know where you are, what is coming, and the board answers to your hands. Nothing surprises you on the way in or on the way out.' },
};

export const WB_SEQ_2: SequencePageConfig = {
  id: 'WB-SEQ-2',
  kind: 'entry',
  belt: 'white_belt',
  courseKey: 'white_belt',
  number: 2,
  title: 'Sweet Spot',
  stepIds: ['STP-010', 'STP-011', 'STP-012', 'STP-013', 'STP-014'],
  think: {
    whatIs: {
      headline: 'The power to catch a wave and choose the line you surf — lying down — and to dismount safely.',
      line: 'Sweet spot → align with the whitewater → paddle to catch it → cobra and steer left and right → prone dismount.',
      where: 'Waist-deep water, on the whitewater. Everything lying on the board.',
      whatFor: 'The second part of the bigger sequence: finding the sweet spot, aligning with the foam, understanding the direction to catch it, the cobra, surfing prone, and dismounting safely lying down. What you gain is the power to catch a wave and choose your line — before you ever stand up.',
    },
    bodyFromLesson: 'STP-013',
    bodyMarkdown: `**The sweet spot pattern**

1. **Get on your board on the sweet spot:** nose barely floating, tail just under. The board floats level and is ready to paddle.
2. **Get aligned with the whitewater:** shoulder check, nose pointing where the foam is going. You do not paddle until you are aligned.
3. **Paddle to catch it:** start early, one-two, keep going until the board accelerates with the foam.
4. **Cobra + turn left and right:** hands at the ribs, chest up, eyes where you want to go, press the rail — the board steers.
5. **Prone dismount:** decide, hold the rails, shift, rotate, land controlled — never face first.`,
    rulesMarkdown: `- Level board first: a board that fights you does not paddle and does not catch.
- Align before you paddle: the nose points where the foam is going.
- Start early and commit: stop paddling only when the board is gliding.
- Never let go of the rails until you are stable in the water.`,
    keyWords: [{ label: 'Steps', words: ['Sweet spot', 'Align', 'Paddle', 'Cobra · steer', 'Dismount'] }],
  },
  feel: {
    visualize: 'On the sand, lying on the board: find the level point, look over your shoulder at an imaginary foam, paddle one-two, lift into cobra and look left, then right, then slide off holding the rails. Ten rides in your head.',
    land: ['DRL-WB-010-A', 'DRL-WB-011-A', 'DRL-WB-012-A', 'DRL-WB-013-A', 'DRL-WB-014-A'],
    skate: NO_SKATE,
  },
  do: {
    result: 'One foam wave caught by paddling, ridden prone with the board level, steered left and right from the cobra, and left with a controlled dismount.',
    missionId: 'MIS-WB-SEQ2-RUN',
    timing: 'Mount and align while the foam is still far. Start paddling early; the cobra comes once the board is gliding; decide the dismount before the water gets shallow.',
    competence: 'Five foam rides in a session where the board floats level, you catch by paddling, you steer both ways on purpose, and every dismount is controlled. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'sweet', title: 'Sweet spot', symptom: 'Nose diving or tail sinking; paddling goes nowhere.', indicators: [{ ok: 'The board floats level on each mount and feels ready, not fighting.', no: 'Nose under or tail under.', fix: 'Slide until the nose barely floats.' }], deeper: { label: 'Get on Your Board / Find Sweet Spot', lessonId: 'STP-010', drillId: 'DRL-WB-010-A', missionId: 'MIS-WB-010' } },
    { key: 'align', title: 'Align with the whitewater', symptom: 'The foam hits you sideways and spins the board.', indicators: [{ ok: 'Shoulder check before every attempt; the nose is aligned with where the foam is going before you paddle.', no: 'You paddle without looking; the foam catches you sideways.', fix: 'Sweet · read · shoulder · align · ready.' }], deeper: { label: 'Get Aligned with the White Water', lessonId: 'STP-011', drillId: 'DRL-WB-011-A', missionId: 'MIS-WB-011' } },
    { key: 'paddle', title: 'Paddle to catch', symptom: 'You start late, or stop before the board is gliding.', indicators: [{ ok: 'You start early and keep paddling until the board accelerates with the foam.', no: 'Late start; you stop and the foam passes.', fix: 'Distance · start · one-two · forward · commit.' }], deeper: { label: 'Paddle to Catch White Water', lessonId: 'STP-012', drillId: 'DRL-WB-012-A', missionId: 'MIS-WB-012' } },
    { key: 'cobra', title: 'Cobra + turn left and right', symptom: 'The board goes straight wherever the foam takes it.', indicators: [{ ok: 'From the cobra the board responds: the direction matches what you decided, both ways.', no: 'Straight to the beach every time.', fix: 'Hands · chest · eyes · rail · steer.' }], deeper: { label: 'Cobra + Turn Left and Right', lessonId: 'STP-013', drillId: 'DRL-WB-013-A', missionId: 'MIS-WB-013' } },
    { key: 'dismount', title: 'Prone dismount', symptom: 'You fall off face first, or lose the board.', indicators: [{ ok: 'You decide the exit, keep the rails until stable, and land controlled.', no: 'Face first, board gone.', fix: 'Decide · rails · shift · rotate · land.' }], deeper: { label: 'Prone Dismount', lessonId: 'STP-014', drillId: 'DRL-WB-014-A', missionId: 'MIS-WB-014' } },
  ],
  review: { howItFeels: 'It feels like the first time the ocean pushes you and you like it: the board is level, the foam arrives where you expected, and the ride goes where you pointed. Getting off is your choice.' },
};

export const WB_SEQ_3: SequencePageConfig = {
  id: 'WB-SEQ-3',
  kind: 'entry',
  belt: 'white_belt',
  courseKey: 'white_belt',
  number: 3,
  title: 'Pop-Up',
  stepIds: ['STP-015', 'STP-016', 'STP-017', 'STP-018', 'STP-019', 'STP-020'],
  think: {
    whatIs: {
      headline: 'Standing up: the pop-up on the line you chose, the feet in the centre, the Power Posture, the impulse — and the starfish to dismount standing, safely.',
      line: 'Cobra, pick the line → pop-up, both feet together → back foot in FP2 → Power Posture → impulse for speed → starfish dismount when needed.',
      where: 'On the whitewater, waist-deep. The moment the foam takes you.',
      whatFor: 'The third part of the bigger sequence: getting to your feet. That is the objective — and it includes how you dismount standing, with the starfish. Here you build the base every maneuver starts from.',
    },
    feet: {
      text: 'At White Belt the back foot lands in FP2, the centre. The front foot lands centred on the stringer, toes across the board.',
      recommended: ['P2'],
      options: [
        { back: 'P2', label: 'FP2 · neutral', tradeoff: 'Your position. The balance point: the board responds to pressure and stays level.' },
        { back: 'P1', label: 'FP1 · tail', tradeoff: 'Comes at Yellow Belt, for the turns.' },
        { back: 'P3', label: 'FP3 · forward', tradeoff: 'Comes at Blue Belt, for speed.' },
      ],
      rule: 'The front foot lands centred across the board, on the stringer, toes across — so toe and heel push the rails. The weight stays on the front foot.',
    },
    bodyFromLesson: 'STP-018',
    bodyMarkdown: `**The pop-up pattern**

1. **Cobra, pick the line.** Chest up, hands at the ribs, eyes on the direction you chose — and say it.
2. **Pop-up.** One movement, about two seconds: both feet land together, never the back foot first. Hips down, head up. Hands release only when centred and stable.
3. **Feet in the centre:** back foot in FP2, front foot centred on the stringer with the toes across the board.
4. **Power Posture:** shoulders pointing where the nose points · weight on the front leg · front hand toward the nose, the other arm with the shoulder back and the elbow on the ribs · flex · back knee toward where you go · arms active · eyes forward · exhale.
5. **Momentum:** flex · touch · push · extend — forward momentum when the ride slows.
6. **Starfish dismount** when it is time to go down: decide before you lose balance, bend, open wide, fall into the foam.`,
    rulesMarkdown: `- The line is chosen in the cobra, before you stand.
- Both feet land together. Hips down, head up.
- FP2 is the back foot; the front foot is about centre and rails.
- The posture is active, not tense: exhale in it.
- Decide the dismount before you lose balance — never after.`,
    keyWords: [{ label: 'Steps', words: ['Cobra · line', 'Pop-up', 'FP2', 'Posture', 'Momentum', 'Starfish'] }],
  },
  feel: {
    visualize: 'On the mat: cobra, eyes down the line, the two-second pop-up with both feet together, the back foot landing in the centre, the posture locked, one impulse, and a soft starfish fall. Ten pop-ups in your head before ten on the mat.',
    land: ['DRL-WB-015-A', 'DRL-WB-016-A', 'DRL-WB-017-A', 'DRL-WB-018-A', 'DRL-WB-019-A', 'DRL-WB-020-A'],
    skate: NO_SKATE,
  },
  do: {
    result: 'One foam wave where the line is chosen in the cobra, the pop-up takes about two seconds with both feet together, you stand in Power Posture with the back foot in FP2, add one impulse, and go down with a starfish when it is time.',
    missionId: 'MIS-WB-SEQ3-RUN',
    timing: 'Cobra as the foam takes you; pop-up once the board is gliding; posture before anything else; impulse when the ride slows; starfish before you lose balance.',
    competence: 'Three clean stands across three sessions with the feet where you decided and the posture held, plus three safe starfish exits. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'line', title: 'Cobra, pick the line', symptom: 'You stand up first and decide later.', indicators: [{ ok: 'You say the direction while still in the cobra, keep your eyes on it through the pop-up, and the board goes there.', no: 'The board goes straight; the decision comes after standing.', fix: 'Cobra · eyes · line · commit · stand.' }], deeper: { label: 'Cobra Pick Line', lessonId: 'STP-015', drillId: 'DRL-WB-015-A', missionId: 'MIS-WB-015' } },
    { key: 'popup', title: 'Pop-up', symptom: 'Two-stage pop-up, back foot first, or a knee on the board.', indicators: [{ ok: 'Solid cobra, then one movement of about two seconds; both feet land together, hips down, head up; hands release only when centred.', no: 'Back foot first, knee down, hands off too early.', fix: 'Cobra · hands · exhale · feet · connect.' }], deeper: { label: 'Pop-Up', lessonId: 'STP-016', drillId: 'DRL-WB-016-A', missionId: 'MIS-WB-016' } },
    { key: 'feet', title: 'Feet in the centre · FP2', symptom: 'The back foot lands wherever; the board does not respond.', indicators: [{ ok: 'Back foot in FP2, front foot centred on the stringer with the toes across; you feel the board respond to pressure.', no: 'Feet off centre; a rail sinks by itself.', fix: 'Centre · rails · FP2 · back foot · connect.' }], deeper: { label: 'Feet Position Center #2', lessonId: 'STP-017', drillId: 'DRL-WB-017-A', missionId: 'MIS-WB-017' } },
    { key: 'posture', command: 'posture', title: 'Power Posture', symptom: 'Standing tall, weight back, chest away from the nose, loose arms.', indicators: [{ ok: 'Shoulders pointing where the nose points, weight on the front leg, flexed, back knee forward, arms active, eyes forward — and you exhale in it.', no: 'Tall, weight back, spaghetti arms.', fix: 'Shoulders · weight · knee · compact · exhale.' }], deeper: { label: 'Power Stance / Posture', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' } },
    { key: 'impulse', command: 'projection', title: 'Forward Momentum', symptom: 'The ride dies as soon as the foam slows.', indicators: [{ ok: 'From posture: flex, touch, push, extend — and the board accelerates.', no: 'You stand still and the ride ends.', fix: 'Flex · touch · push · extend.' }], deeper: { label: 'Forward Momentum', lessonId: 'STP-019', drillId: 'DRL-WB-019-A', missionId: 'MIS-WB-019' } },
    { key: 'starfish', title: 'Starfish dismount', symptom: 'You fall stiff, late, or onto the board.', indicators: [{ ok: 'You decide before losing balance, bend, open wide and fall calm into the foam without losing the board.', no: 'Stiff fall after the balance is gone.', fix: 'Decide · bend · open · fall · foam.' }], deeper: { label: 'Starfish Dismount', lessonId: 'STP-020', drillId: 'DRL-WB-020-A', missionId: 'MIS-WB-020' } },
  ],
  review: { howItFeels: 'It feels like standing on something that answers: the pop-up puts you where your eyes already were, the posture holds you, and one push makes the board go. Going down is your decision, not the wave’s.' },
};

export const WB_SEQ_4: SequencePageConfig = {
  id: 'WB-SEQ-4',
  kind: 'entry',
  belt: 'white_belt',
  courseKey: 'white_belt',
  number: 4,
  title: 'Directional Turns',
  stepIds: ['STP-021', 'STP-022'],
  think: {
    whatIs: {
      headline: 'Now standing, you start steering the board right and left — backside and frontside, built by the chain, not by drift — and you dismount.',
      line: 'From posture: look → oblique → hip → heel or toes → the rail engages and the board changes direction. Backside on one rail, frontside on the other. Then the dismount you already know: starfish standing, or prone.',
      where: 'On the whitewater, standing, once the posture holds.',
      whatFor: 'The fourth part of the bigger sequence: with the first three built — catching the wave, standing up — you start handling the board right and left standing, and you dismount. These two turns are the seed of every line and every maneuver later.',
    },
    feet: {
      text: 'Back foot in FP2, front foot centred. The turn comes from the chain and the rail, not from moving the feet.',
      recommended: ['P2'],
      options: [
        { back: 'P2', label: 'FP2 · neutral', tradeoff: 'Your position for the first turns.' },
        { back: 'P1', label: 'FP1 · tail', tradeoff: 'Comes at Yellow Belt, for tighter turns.' },
        { back: 'P3', label: 'FP3 · forward', tradeoff: 'Comes at Blue Belt, for speed.' },
      ],
      rule: 'Weight on the front foot; the front foot sinks the rail toward where you want to go; the back foot follows.',
    },
    bodyFromLesson: 'STP-021',
    bodyMarkdown: `**The directional turn pattern**

1. **Posture** — the base the turn starts from and returns to.
2. **Look** where you want to go. Eyes first, always.
3. **Oblique** — the rotation travels: eyes → head → shoulders → hips.
4. **Hip and rail** — backside: the heels press and the backside rail engages. Frontside: the toes press and the frontside rail engages, posture connected, no buckling.
5. **The board changes direction** — not drifts. Back to posture.`,
    rulesMarkdown: `- The chain in order: look · oblique · hip · heel (or toes) · rail.
- The posture stays connected through the turn: no buckling forward.
- The board changes direction because the rail engaged, not because you leaned.
- Both sides: backside and frontside, cleanly.`,
    keyWords: [
      { label: 'Body', words: ['Look', 'Oblique', 'Hip', 'Heel · toes', 'Rail'] },
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Back to posture'] },
    ],
  },
  feel: {
    visualize: 'On the sand in posture: look left, feel the oblique, the hip, the heels pressing — the backside turn. Then right: toes, frontside rail. Ten each side in your head.',
    land: ['DRL-WB-021-A', 'DRL-WB-022-A'],
    skate: NO_SKATE,
  },
  do: {
    result: 'One whitewater ride with one turn where the board changed direction because the rail engaged — backside or frontside — and you came back to posture.',
    missionId: 'MIS-WB-SEQ4-RUN',
    timing: 'Posture first. The turn starts when the board is gliding and the feet are set; eyes lead before anything moves.',
    competence: 'Three backside turns and three frontside turns across three sessions where the board answered the rail and the posture never buckled. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'backside', command: 'rail', title: 'Turn backside', symptom: 'The board drifts instead of turning; the chain is out of order.', indicators: [{ ok: 'Look → oblique → hip → heel → rail, in that order; the board changes direction, not just drifts.', no: 'A lean with no rotation; the board keeps going straight.', fix: 'Look · oblique · hip · heel · rail.' }], deeper: { label: 'Turn Backside', lessonId: 'STP-021', drillId: 'DRL-WB-021-A', missionId: 'MIS-WB-021' } },
    { key: 'frontside', command: 'rail', title: 'Turn frontside', symptom: 'You buckle forward or the rail does not engage.', indicators: [{ ok: 'Same chain on the frontside rail, posture connected — no buckling — and the board responds.', no: 'Chest collapses forward; the board does not answer.', fix: 'Look · oblique · posture · front · rail.' }], deeper: { label: 'Turn Frontside', lessonId: 'STP-022', drillId: 'DRL-WB-022-A', missionId: 'MIS-WB-022' } },
  ],
  review: { howItFeels: 'It feels like the board turns because you asked: your eyes went first, your body followed, the rail bit, and the board changed direction. Both sides.' },
};

export const WB_SEQ_5: SequencePageConfig = {
  id: 'WB-SEQ-5',
  kind: 'entry',
  belt: 'white_belt',
  courseKey: 'white_belt',
  number: 5,
  title: 'Independence',
  stepIds: ['STP-023', 'STP-024', 'STP-025'],
  think: {
    whatIs: {
      headline: 'Independence: everything before was done walking in, waist-deep, in safe conditions. Now you enter paddling, pass the foams with turtle rolls, direct the board, position yourself — and catch the wave to do everything you already know.',
      line: 'Set your goal → paddle out with technique and gears → turtle roll through the foam → turn left and right lying on the board → position yourself → catch the foam and run the whole sequence you already own.',
      where: 'From the shore to the lineup, lying on the board.',
      whatFor: 'The fifth part of the bigger sequence: a small independence — entering, playing with the foams, passing them, moving, catching them — still in a controlled place. Humility is the belt value: you know what you can do, and you do it on your own. Sequence 6, at Yellow, takes this to the lineup with other surfers and unbroken waves.',
    },
    bodyFromLesson: 'STP-023',
    bodyMarkdown: `**The independence pattern**

1. **Set your goal** for the session on the sand.
2. **Paddle out:** sweet spot, enter, elbow over the ear, body straight, arrow paddle; shift gears 1 → 2 → 3 on demand. Arrive with energy.
3. **Turtle roll:** align the nose against the foam, roll under holding the rails, elbows on top of the board, hold, recover to paddling.
4. **Turn left and right lying on the board:** one stroke, back, pivot — intentional, controlled, ready to paddle.
5. **Position yourself and catch the foam** — and run everything you already own: cobra, line, pop-up, posture, turn, dismount.`,
    rulesMarkdown: `- Technique over effort: elbow over the ear, body straight, arrow paddle.
- Turtle roll about one metre before the foam; never let go of the board.
- Every prone turn is intentional and ends ready to paddle.
- Humility: you choose the conditions that match your level.`,
    keyWords: [{ label: 'Steps', words: ['Goal', 'Paddle out', 'Turtle roll', 'Turn prone', 'Ready'] }],
  },
  feel: {
    visualize: 'On the sand: say your goal, mount on the sweet spot, paddle with the elbow over the ear, see the foam, roll under holding the rails, come up paddling, pivot left, pivot right. One paddle-out in your head.',
    land: ['DRL-WB-023-A', 'DRL-WB-024-A', 'DRL-WB-025-A'],
    skate: NO_SKATE,
  },
  do: {
    result: 'One paddle-out on your own, with your goal set, technique held, every foam passed with a turtle roll, and the board redirected left and right lying down — arriving with energy.',
    missionId: 'MIS-WB-SEQ5-RUN',
    timing: 'Goal on the sand, not in the water. Roll about one metre before each foam. Turn prone only when you have decided where you are going.',
    competence: 'Three paddle-outs across three sessions arriving with energy, no board lost, six intentional prone turns. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    { key: 'paddle', title: 'Paddle out', symptom: 'You arrive exhausted, or the technique falls apart.', indicators: [{ ok: 'Elbow over the ear, body straight, gears 1 → 2 → 3 on demand; you reach the lineup with energy in reserve.', no: 'Splashing, bent body, empty on arrival.', fix: 'Sweet · enter · elbow · forward · arrow.' }], deeper: { label: 'Paddle Out', lessonId: 'STP-023', drillId: 'DRL-WB-023-A', missionId: 'MIS-WB-023' } },
    { key: 'turtle', title: 'Turtle roll', symptom: 'You lose the board or get pushed back.', indicators: [{ ok: 'Nose against the foam, roll about one metre before it holding the rails, elbows on the board, and you recover to paddling.', no: 'Late roll, board gone.', fix: 'Align · rails · elbows · hold · recover.' }], deeper: { label: 'Turtle Roll', lessonId: 'STP-024', drillId: 'DRL-WB-024-A', missionId: 'MIS-WB-024' } },
    { key: 'prone', title: 'Turn left and right lying on the board', symptom: 'You drift around instead of turning; you end up not ready to paddle.', indicators: [{ ok: 'Each direction change is intentional and controlled, you choose the mode for the situation, and you finish ready to paddle.', no: 'Spinning, unsure, not ready.', fix: 'Turn · one · back · pivot · ready.' }], deeper: { label: 'Turn Left and Right Lying on Board', lessonId: 'STP-025', drillId: 'DRL-WB-025-A', missionId: 'MIS-WB-025' } },
  ],
  review: { howItFeels: 'It feels like nobody has to be next to you: you set the goal, you get out there, you pass what comes, and you point the board where you decided. Independence, with humility.' },
};
