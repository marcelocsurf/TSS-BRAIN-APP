import type { SequencePageConfig } from './types';

// Blue Belt · Sequence #8 · Frontside Pumping.
// Modelo pedagógico (Marcelo 2026-09-09): la misión es SIEMPRE la línea
// completa (el pump); dentro de ella el alumno elige, si quiere, UN detalle
// como foco. Los pies son conocimiento (FP1/2/3 = maniobrabilidad vs
// velocidad), no un drill ni una misión. Criterios y resultado aprobados.
export const BB_SEQ_08: SequencePageConfig = {
  id: 'BB-SEQ-08',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 8,
  title: 'Frontside Pumping',
  // Como en la pestaña Course: FP1 → Posture (White) → Pump.
  stepIds: ['STP-035', 'STP-018', 'STP-036'],
  think: {
    whatIs: {
      // Regla de Marcelo (2026-09-11, doctrine_rules): la ola Y tu biomecánica, juntas — nunca una sin la otra.
      headline: 'Pumping is the wave’s energy and your biomechanics working together: you use the face and your body to draw the lines that make speed.',
      line: 'Arcs from the top of the face down through the middle and up again. One arc per pump.',
      where: 'Z2 to Z4 — the open face, wherever there is wall in front of you. It does not need to touch the lip.',
      whatFor: 'Speed you can spend: to make a section, to reach the pocket, to set up a maneuver. The closer to the pocket, the more energy the wave gives you.',
    },
    feet: {
      text: 'You can pump from any back-foot position. What changes is what you get out of it.',
      options: [
        { back: 'P1', label: 'FP1 · tail', tradeoff: 'Most maneuverable, least speed. The tail stays live so a turn can come out of the pump.' },
        { back: 'P2', label: 'FP2 · neutral', tradeoff: 'A bit more speed, a bit less maneuverability. Ready for whatever comes next.' },
        { back: 'P3', label: 'FP3 · forward', tradeoff: 'Most speed, far less maneuverability. Where you go when speed is the only job.' },
      ],
      rule: 'The weight always stays on the front foot. The back foot only follows the rails — the knee points where the board is going. It is the front foot that sinks the rail toward where you want to go.',
    },
    bodyFromLesson: 'STP-036',
    keyWords: [
      { label: 'Body', words: ['Posture', 'Oblique', 'Extend', 'Swim', 'Low', 'Posture'] },
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Projection', 'Maneuver (the Cruz)', 'Back to posture'] },
    ],
    board: {
      pocket: { x: 110, y: 70 },
      segments: [
        { d: 'M140,95 C155,95 168,105 178,120', command: 'posture' },
        { d: 'M178,120 C195,150 212,172 235,180', command: 'rail' },
        { d: 'M235,180 C262,184 278,155 292,130', command: 'projection' },
        { d: 'M292,130 C305,112 322,100 338,98', command: 'maneuver' },
        { d: 'M338,98 C346,98 352,99 358,101', command: 'posture' },
        { d: 'M358,101 C372,115 385,150 405,175', command: 'rail' },
        { d: 'M405,175 C432,184 447,155 461,130', command: 'projection' },
        { d: 'M461,130 C474,112 490,100 505,98', command: 'maneuver' },
        { d: 'M505,98 C512,98 518,99 524,101', command: 'posture' },
        { d: 'M524,101 C538,115 552,150 572,175', command: 'rail' },
        { d: 'M572,175 C598,184 612,158 630,138', command: 'projection' },
      ],
      markers: [
        { x: 140, y: 95, label: 'I' },
        { x: 235, y: 180, label: 'A' },
        { x: 358, y: 101, label: 'B' },
        { x: 630, y: 138, label: 'S' },
      ],
    },
  },
  feel: {
    visualize: 'Eyes closed, on the sand. Run the six words in order and picture the line on the face: up, down, up. Feel where the weight is at each word. Ten pumps in your head.',
    land: ['DRL-BB-036'],
    skate: ['DRL-BB-036-02'],
  },
  do: {
    result: 'The board accelerates on every down-cycle: arcs from the top of the face down through the middle and up again, with your weight never leaving the front foot.',
    missionId: 'MIS-BB-036',
    timing: 'Start the pump as soon as you have wall in front of you. The down-cycle lands on the lower third of the face; the up-cycle uses the top without touching the lip.',
    competence: 'Five waves with a clean pump line, eyes on where you want to go, body running the sequence on its own. If you can execute it and you feel comfortable, it is yours.',
  },
  // El foco se elige de los mismos pasos del cuerpo (Marcelo 2026-09-09):
  // "si algo de ahí falla, eso es lo que trabajo con enfoque". Mismo orden
  // que las key words: Posture · Oblique · Extend · Swim · Low · Posture.
  details: [
    {
      key: 'posture',
      command: 'posture',
      title: 'Start with posture',
      symptom: 'The pump does not start from posture: chest away from the nose, standing tall, weight not on the front foot.',
      indicators: [
        { ok: 'The cycle starts in posture: chest to the nose, low, weight on the front foot.', no: 'You start tall or with the weight back; there is nothing to compress from.', fix: 'Posture first, then move.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
    {
      key: 'oblique',
      command: 'rail',
      title: '1 · Lead with the oblique · get on the rail',
      symptom: 'The legs push first and the hand follows late; no rhythm.',
      indicators: [
        { ok: 'The leading hand goes first: the oblique projects you forward before the legs extend.', no: 'The legs push first and the hands follow late.', fix: 'Hand first, then extend.' },
      ],
      deeper: { label: 'Pump Frontside', lessonId: 'STP-036' },
    },
    {
      key: 'extend',
      command: 'projection',
      title: '2 · Extend, weight forward · projection',
      symptom: 'The board stalls on the down-cycle; the weight went to the back foot.',
      indicators: [
        { ok: 'At full extension the chest is still over the front foot, never behind it.', no: 'The chest drops behind the front foot; the board loses speed.', fix: 'Chest over the front foot.' },
        { ok: 'The back foot only follows the rails; the front foot sinks the rail toward where you want to go.', no: 'The weight drifts to the back foot; the board stalls.', fix: 'Weight forward, front foot sinks the rail.' },
        // Marcelo 2026-09-09: solo el brazo de adelante proyecta; el de atrás
        // (izquierdo regular / derecho goofy) se queda en postura: escápula
        // activa hacia atrás y codo pegado a las costillas.
        { ok: 'Only the leading arm projects. The back arm stays in posture: scapula active and pulled back, elbow glued to the ribs.', no: 'Both arms swing forward; the back elbow leaves the ribs and the posture opens.', fix: 'One arm projects. The other holds: scapula back, elbow on the ribs.' },
      ],
      deeper: { label: 'Pump Frontside', lessonId: 'STP-036' },
    },
    {
      key: 'swim',
      command: 'maneuver',
      title: '3 · Swim the arm, elbow over the head · the Cruz',
      symptom: 'The arm stays low; the pump is legs only.',
      indicators: [
        { ok: 'The arm swims through with the elbow higher than the head.', no: 'The arm stays low or swings sideways.', fix: 'Elbow above the head.' },
      ],
      deeper: { label: 'Pump Frontside', lessonId: 'STP-036' },
    },
    {
      key: 'low',
      command: 'posture',
      title: '4 · Get low, back to posture',
      symptom: 'You end taller each cycle; the pump dies out.',
      indicators: [
        { ok: 'You get low and land back in the same posture you started from, every cycle.', no: 'You end taller each cycle; the pump dies out.', fix: 'Low, then back to posture.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
  ],
  review: {
    howItFeels: 'You feel you can generate speed forward using the face of the wave. You feel in control of your board and you are drawing your lines. You have the ability to make sections and to gain speed using the wave and your line. The rhythm is yours: you decide when to take the wave’s energy and when to add your own.',
  },
};
