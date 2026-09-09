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
      headline: 'Pumping generates speed with your body, not with the wave.',
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
      { label: 'Pump', words: ['Posture', 'Oblique', 'Extend', 'Swim', 'Low', 'Posture'] },
    ],
    board: {
      pocket: { x: 110, y: 70 },
      segments: [
        { d: 'M140,95 C160,95 175,110 185,130', command: 'posture' },
        { d: 'M185,130 C200,160 215,175 235,180', command: 'rail' },
        { d: 'M235,180 C265,185 280,150 300,120', command: 'projection' },
        { d: 'M300,120 C315,100 335,95 350,100', command: 'posture' },
        { d: 'M350,100 C365,110 380,150 400,175', command: 'rail' },
        { d: 'M400,175 C430,185 445,150 465,120', command: 'projection' },
        { d: 'M465,120 C480,100 500,95 515,100', command: 'posture' },
        { d: 'M515,100 C530,110 545,150 565,175', command: 'rail' },
        { d: 'M565,175 C590,182 605,160 625,140', command: 'projection' },
      ],
      markers: [
        { x: 140, y: 95, label: 'I' },
        { x: 235, y: 180, label: 'A' },
        { x: 350, y: 100, label: 'B' },
        { x: 625, y: 140, label: 'S' },
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
    competence: 'Five waves with a clean pump line — eyes on where you want to go, body running the sequence on its own. If you are still saying the words in your head, keep at the mission.',
  },
  details: [
    {
      key: 'posture',
      title: 'Posture · start and return',
      symptom: 'The pump does not start in posture, or you end taller each cycle.',
      indicators: [
        { ok: 'Every cycle starts and ends in the same posture: chest to the nose, low, weight on the front foot.', no: 'You end taller each cycle; the pump dies out.', fix: 'Low, then back to posture.' },
        { ok: 'At full extension the chest is still over the front foot — never behind it.', no: 'The chest drops behind the front foot; the board loses speed.', fix: 'Chest over the front foot.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
    {
      key: 'hands',
      title: 'Hands and arms',
      symptom: 'The legs push first and the hands follow late; no rhythm.',
      indicators: [
        { ok: 'The leading hand goes first — the oblique projects forward before the legs extend.', no: 'The legs push first and the hands follow late.', fix: 'Hand first, then extend.' },
        { ok: 'The arm swims through with the elbow higher than the head.', no: 'The arm stays low; the pump is legs only.', fix: 'Elbow above the head.' },
      ],
      deeper: { label: 'Pump Frontside', lessonId: 'STP-036' },
    },
    {
      key: 'weight',
      title: 'Weight and feet',
      symptom: 'The board stalls on the down-cycle; the weight went back.',
      indicators: [
        { ok: 'Weight stays on the front foot through the whole cycle — the back foot only follows the rails.', no: 'The weight drifts to the back foot; the board stalls.', fix: 'Weight forward, front foot sinks the rail.' },
        { ok: 'The back foot is where you chose it — FP1, FP2 or FP3 for what you are after — and stays there through the pump.', no: 'The foot sits wherever it landed, by habit, not by choice.', fix: 'Choose the foot before the wave asks.' },
      ],
      deeper: { label: 'Foot Position at Blue Belt', lessonId: 'STP-035' },
    },
  ],
  review: {
    howItFeels: 'The board pushes back into your front foot on the way down. The rhythm is yours, not the wave’s. When it works, you stop hearing the words.',
  },
};
