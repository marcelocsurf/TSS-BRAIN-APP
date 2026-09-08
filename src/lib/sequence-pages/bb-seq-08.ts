import type { SequencePageConfig } from './types';

// Blue Belt · Sequence #8 · Frontside Pumping (FP1 → Pump).
// Criterios y resultado APROBADOS por Marcelo 2026-09-09; doctrina 2026-09-02.
export const BB_SEQ_08: SequencePageConfig = {
  id: 'BB-SEQ-08',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 8,
  title: 'Frontside Pumping',
  // FP1 → Posture (prestada de White, como en la pestaña Course) → Pump.
  stepIds: ['STP-035', 'STP-018', 'STP-036'],
  think: {
    whatIs: {
      headline: 'Pumping generates speed with your body, not with the wave.',
      line: 'Arcs from the top of the face down through the middle and up again. One arc per pump.',
      where: 'Z2 to Z4 — the open face, wherever there is wall in front of you. It does not need to touch the lip.',
      whatFor: 'Speed you can spend: to make a section, to reach the pocket, to set up a maneuver. The closer to the pocket, the more energy the wave gives you.',
    },
    feet: {
      text: 'FP is the back foot. The front foot sits on the target — centred over the stringer, toes across — and does not move. Choose the back foot for what you are after, and hold it through the whole pump.',
      phases: [
        { phase: 'I · Entry', back: 'P3', note: 'full speed' },
        { phase: 'A · Setup', back: 'P3' },
        { phase: 'B · Link', back: 'P3' },
        { phase: 'S · Exit', back: 'P1', note: 'only if a maneuver comes next' },
      ],
    },
    bodyFromLesson: 'STP-036',
    keyWords: [
      { label: 'Pump', words: ['Posture', 'Oblique', 'Extend', 'Swim', 'Low', 'Posture'] },
      { label: 'FP1', words: ['Back', 'Tail', 'Weight-front', 'Engage', 'Tilt'] },
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
    land: ['DRL-BB-035', 'DRL-BB-036'],
    skate: ['DRL-BB-035-02', 'DRL-BB-036-02'],
  },
  do: {
    result: 'The board accelerates on every down-cycle: arcs from the top of the face down through the middle and up again, with your weight never leaving the front foot.',
    missionId: 'MIS-BB-036',
    timing: 'Start the pump as soon as you have wall in front of you. The down-cycle lands on the lower third of the face; the up-cycle uses the top without touching the lip.',
    competence: 'Five waves with a clean pump line — eyes on where you want to go, body running the sequence on its own. If you are still saying the words in your head, keep at the mission.',
    whenNot: [
      { symptom: 'The pump does not start or end in posture, or the weight went back', label: 'Posture', lessonId: 'STP-018' },
      { symptom: 'The back foot moved during the pump, or the tail never engaged', label: 'Foot Position', lessonId: 'STP-035', stepId: 'STP-035' },
      { symptom: 'The elbow stayed low, or the legs did not compress and extend', label: 'The pump itself', lessonId: 'STP-036', stepId: 'STP-036' },
    ],
  },
  review: {
    groups: [
      {
        title: 'Foot Position 1',
        indicators: [
          { ok: 'The back foot goes all the way to the tail — not halfway — while the front foot stays put, centred over the stringer.', no: 'The foot stops halfway; the front foot drifts.', fix: 'Back foot to the tail, front foot stays.', step: { label: 'Foot Position 1', lessonId: 'STP-035' } },
          { ok: 'Weight stays on the front foot while the back foot moves — the foot goes back, the weight does not.', no: 'The weight follows the foot back; the board stalls.', fix: 'Move the foot, keep the weight forward.', step: { label: 'Posture', lessonId: 'STP-018' } },
          { ok: 'Tilt comes from the back foot on the tail — heel and toes press the rail — and the board answers at once.', no: 'The board is slow to answer; the tilt comes from the shoulders.', fix: 'Press the rail with the back foot.', step: { label: 'Foot Position 1', lessonId: 'STP-035' } },
          { ok: 'The back foot moves on purpose: tail for the turn, forward for speed — and it can stay on the tail if that is what comes next.', no: 'The foot sits wherever it landed, by habit, not by choice.', fix: 'Decide where the foot goes before the wave asks.', step: { label: 'Foot Position 1', lessonId: 'STP-035' } },
        ],
      },
      {
        title: 'Pump Frontside',
        indicators: [
          { ok: 'The leading hand goes first — the oblique projects forward before the legs extend.', no: 'The legs push first and the hands follow late; no rhythm.', fix: 'Hand first, then extend.', step: { label: 'Pump Frontside', lessonId: 'STP-036' } },
          { ok: 'At full extension the chest is still over the front foot — never behind it.', no: 'The chest drops behind the front foot; the board loses speed.', fix: 'Chest over the front foot.', step: { label: 'Posture', lessonId: 'STP-018' } },
          { ok: 'The arm swims through with the elbow higher than the head.', no: 'The arm stays low; the pump is legs only.', fix: 'Elbow above the head.', step: { label: 'Pump Frontside', lessonId: 'STP-036' } },
          { ok: 'Get low and land back in posture — every cycle ends where it started.', no: 'You end taller each cycle; the pump dies out.', fix: 'Low, then back to posture.', step: { label: 'Posture', lessonId: 'STP-018' } },
        ],
      },
    ],
    howItFeels: 'The board pushes back into your front foot on the way down. The rhythm is yours, not the wave’s. When it works, you stop hearing the words.',
  },
};
