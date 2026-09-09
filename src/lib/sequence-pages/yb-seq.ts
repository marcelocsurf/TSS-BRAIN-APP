import type { SequencePageConfig } from './types';
import { BB_CATCH } from './bb-entry';

// ═══ YELLOW BELT · secuencias 6 y 7 en cuatro pestañas ═══
// Marcelo (2026-09-09): "la 6, Reading & Earning the Wave, se trata de ir y
// agarrar una ola: ser autosuficiente… la 7 es dibujar en la cara de la
// ola: con conciencia seguir la dinámica del surfing, arriba, abajo, cambiar
// de riel a riel y empezar a navegar; se hace con algo básico, simplemente
// cambiando de riel, sin proyecciones, usando la extensión de las piernas;
// y salirse sobre el hombro antes de que cierre: tomar control, dibujar la
// cara y decidir a dónde salir".

// La 6 es la misma cadena que "Catch Waves" de Blue, con voz de Yellow.
export const YB_SEQ_6: SequencePageConfig = {
  ...BB_CATCH,
  id: 'YB-SEQ-6.0',
  kind: 'entry',
  eyebrow: undefined,
  belt: 'yellow_belt',
  courseKey: 'yellow_belt',
  number: 6,
  title: 'Reading & Earning the Wave',
  think: {
    ...BB_CATCH.think,
    whatIs: {
      headline: 'Going out and catching a wave on your own: reading the ocean and earning the wave. Self-sufficiency.',
      line: 'Out the back → read the stage → chase the pocket → paddle with the right angle → catch. The sequence ends the moment the wave is yours.',
      where: 'In the lineup, on green moving waves. This is where you stop needing someone to put you on a wave.',
      whatFor: 'Self-sufficiency. Everything after this — the lines, the turns, the maneuvers — starts with a wave you caught yourself, in the right place, with speed.',
    },
  },
  do: {
    ...BB_CATCH.do,
    missionId: 'MIS-YB-SEQ6-RUN',
    result: 'Three green waves caught on your own at stage 2–3, chasing the pocket, with the right angle. Nobody put you on the wave.',
  },
  review: { howItFeels: 'It feels like the wave was yours before you caught it: you saw it coming, you knew where the energy was, you arrived with time. Nobody pushed you in. That is the moment you stop being taken by waves and start taking them.' },
};

export const YB_SEQ_7: SequencePageConfig = {
  id: 'YB-SEQ-7.0',
  belt: 'yellow_belt',
  courseKey: 'yellow_belt',
  number: 7,
  title: 'Drawing on the Wave',
  stepIds: ['STP-034', 'STP-030', 'STP-031', 'STP-032'],
  think: {
    whatIs: {
      headline: 'Drawing on the face of the wave: with awareness, following the dynamic of surfing — up, down, up, down — rail to rail, and starting to navigate the wave.',
      line: 'Down the face, back up, down again: the board goes from one rail to the other, and every change is a simple one — you extend the legs and the rail changes. No projections, no maneuvers yet. One clean line up and down that stays where the energy is.',
      where: 'Z2 and Z3 — the open face between the flat and the lip. Never to the flat: there the energy ends. When the wave is about to close, you see the exit and go out through the shoulder before it does.',
      whatFor: 'Taking control. You stop riding wherever the wave takes you: you draw the face, you keep the energy alive, and you decide where and when to get out.',
    },
    feet: {
      text: 'At Yellow Belt you work with FP2 and FP1. FP2 is your default for the up-and-down; FP1 when the line asks for a tighter change. FP3 comes later.',
      recommended: ['P2', 'P1'],
      options: [
        { back: 'P2', label: 'FP2 · neutral', tradeoff: 'Your default. The balance point: stability and speed for round lines up and down.' },
        { back: 'P1', label: 'FP1 · tail', tradeoff: 'When the change needs to be tighter. The tail stays live.' },
        { back: 'P3', label: 'FP3 · forward', tradeoff: 'Not yet. Speed only; it comes with the pump at Blue Belt.' },
      ],
      rule: 'The weight always stays on the front foot. The back foot only follows the rails. It is the front foot, centred on the stringer, that sinks the rail toward where you want to go.',
    },
    bodyFromLesson: 'STP-031',
    bodyMarkdown: `**The up-and-down pattern**

1. **Cobra and pick the line.** Chest up, hands at the ribs, redirect the nose down the line you chose — you are surfing before you stand. Cobra + correct line = time.
2. **Stand in posture** on that line, back foot in FP2.
3. **Going down:** stay compressed, stable posture, eyes on where you are going. Do not go to the flat.
4. **Before the flat, change the rail:** rotate up — eyes, shoulders, hips — and **extend the legs**. That extension is what moves the board from one rail to the other and sends you back up the face.
5. **Going up:** rotation and leg extension. Use the top of the face without touching the lip.
6. **Before the top, change the rail again:** flex the legs, back into posture, rotate down. The board comes down the face on the other rail.
7. **Repeat** — as many cycles as the wave gives you.
8. **Out from the shoulder** when the wave is about to close: see the exit, decide, and go out with control.

It is the simplest version of the dynamic you will use in every maneuver later: down, up, rail to rail — always where the energy is.`,
    rulesMarkdown: `- Never to the flat: down there the energy ends and the board dies.
- The rail changes with the extension of the legs and the rotation — not with the arms.
- Weight stays forward the whole ride: the front foot sinks the rail, the back foot follows.
- Stay close to the pocket: the closer you ride to the energy, the more speed you keep.
- See the exit before the wave closes. Going out through the shoulder is a decision, not an accident.`,
    keyWords: [
      { label: 'Body', words: ['Cobra · line', 'Posture', 'Down · compress', 'Extend · rail', 'Up', 'Flex · rail', 'Shoulder'] },
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Projection', 'Back to posture'] },
    ],
    // Zonas: Z4 30-85 · Z3 85-140 · Z2 140-195 · Z1 195-250. Arriba y abajo por
    // Z2-Z3, cambio de riel antes del flat y antes del labio; salida por el hombro.
    board: {
      pocket: { x: 110, y: 70 },
      segments: [
        { d: 'M140,100 C155,100 168,110 178,124', command: 'posture' },
        { d: 'M178,124 C200,158 224,182 256,184', command: 'rail' },
        { d: 'M256,184 C282,186 300,160 316,132', command: 'projection' },
        { d: 'M316,132 C332,106 350,96 366,98', command: 'rail' },
        { d: 'M366,98 C382,100 396,112 404,124', command: 'posture' },
        { d: 'M404,124 C426,158 450,182 482,184', command: 'rail' },
        { d: 'M482,184 C508,186 526,160 542,132', command: 'projection' },
        { d: 'M542,132 C558,106 576,96 592,98', command: 'rail' },
        { d: 'M592,98 C614,100 632,110 650,122', command: 'posture' },
      ],
      markers: [
        { x: 140, y: 100, label: 'I' },
        { x: 256, y: 184, label: 'B' },
        { x: 366, y: 98, label: 'A' },
        { x: 650, y: 122, label: 'S' },
      ],
    },
  },
  feel: {
    visualize: 'Eyes closed, on the sand. Picture two invisible lines on the wave: the lip on top, the flat at the bottom. Your board bounces between them like a ping-pong ball, never crossing either: down, extend, up, flex, down. Feel the legs do the rail change. Then see the shoulder and go out. Ten waves in your head.',
    land: ['DRL-YB-034', 'DRL-YB-031', 'DRL-YB-031-06', 'DRL-YB-031-04', 'DRL-YB-032-02'],
    skate: ['DRL-YB-031-05'],
  },
  do: {
    result: 'One wave where you pick the line from the cobra, stand on it, surf it up and down, rail to rail, as many cycles as it gives you, without going to the flat — and get out through the shoulder by choice before it closes.',
    missionId: 'MIS-YB-SEQ7-RUN',
    timing: 'Start the first descent as soon as you are standing on your line. Change the rail before the flat, not at it; change again before the lip. When the section ahead is closing, that is your exit — see it two cycles early.',
    competence: 'Five waves with a sustained up-and-down line that never touches the flat, and an exit through the shoulder you decided. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    {
      key: 'cobra', title: 'Cobra + pick the line',
      symptom: 'You stand up first and decide later; the board goes straight and the wave leaves you.',
      indicators: [{ ok: 'In the cobra the nose already points down the line you chose; you are surfing before you stand.', no: 'The board goes straight to the beach; the decision comes after the pop-up.', fix: 'Cobra, redirect the nose, then stand.' }],
      deeper: { label: 'Cobra + Pick Line', lessonId: 'STP-034', drillId: 'DRL-YB-034', missionId: 'MIS-YB-034' },
    },
    {
      key: 'posture', command: 'posture', title: 'Stand in posture · on your line',
      symptom: 'You stand tall, weight back, looking at the board; the first descent goes straight.',
      indicators: [{ ok: 'You are standing in posture on the line you chose, back foot in FP2, eyes on where you are going.', no: 'Standing tall or with the weight back; the board goes straight to the beach.', fix: 'Posture first, eyes down the line.' }],
      deeper: { label: 'Pop Up + Foot Position 1 or 2', lessonId: 'STP-030', drillId: 'DRL-YB-030-03', missionId: 'MIS-YB-030' },
    },
    {
      key: 'down', command: 'rail', title: '1 · Going down, compressed · change the rail before the flat',
      symptom: 'You go all the way to the flat and the board dies; or you never come down at all.',
      indicators: [
        { ok: 'You come down the face compressed and stable, and you start the change before the flat.', no: 'You ride to the flat: no energy, only resistance.', fix: 'Compress down, change before the flat.' },
        { ok: 'The rail changes with rotation and the extension of the legs — eyes, shoulders, hips, then the legs push.', no: 'You swing the arms and the board does not answer.', fix: 'Rotate, then extend the legs. The legs change the rail.' },
      ],
      deeper: { label: 'Go Up and Down', lessonId: 'STP-031', drillId: 'DRL-YB-031', missionId: 'MIS-YB-031' },
    },
    {
      key: 'up', command: 'projection', title: '2 · Extend · going up',
      symptom: 'You come down but never go back up; one line to the flat and the wave leaves you.',
      indicators: [{ ok: 'The extension of the legs sends the board back up the face, using the top without touching the lip.', no: 'The legs stay bent; the board stays low and the wave passes you.', fix: 'Extend. Use the top of the face.' }],
      deeper: { label: 'Go Up and Down', lessonId: 'STP-031', drillId: 'DRL-YB-031-06', missionId: 'MIS-YB-031' },
    },
    {
      key: 'flex', command: 'rail', title: '3 · Flex, back to posture · change the rail before the lip',
      symptom: 'You hit the lip, or you get stuck at the top and fall behind the wave.',
      indicators: [{ ok: 'Before the top you flex, come back to posture and rotate down; the board comes down on the other rail.', no: 'You go over the lip or stall at the top.', fix: 'Flex before the lip. Back to posture, rotate down.' }],
      deeper: { label: 'Go Up and Down', lessonId: 'STP-031', drillId: 'DRL-YB-031-02', missionId: 'MIS-YB-031' },
    },
    {
      key: 'shoulder', command: 'closure', title: '4 · Out from the shoulder · by choice',
      symptom: 'Every wave ends in the foam or a closeout; the wave decides how the ride ends.',
      indicators: [{ ok: 'You see the exit before the wave closes and go out through the shoulder with control, on purpose.', no: 'The wave closes on you; the ride ends in a fall.', fix: 'See the exit two cycles early. Decide, and go.' }],
      deeper: { label: 'Out from the Shoulder', lessonId: 'STP-032', drillId: 'DRL-YB-032-02', missionId: 'MIS-YB-032' },
    },
  ],
  review: {
    howItFeels: 'It feels like the wave stops carrying you and you start steering it: down, up, rail to rail, always where the energy is. You feel your legs changing the rail, not your arms. And when the wave is about to close, you already know where you are going out. That is control.',
  },
};
