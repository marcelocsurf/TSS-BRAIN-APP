import type { SequencePageConfig } from './types';
import { BB_SEQ_08 } from './bb-seq-08';

// Blue Belt · Sequence #10 · Frontside Snap.
// Marcelo (2026-09-09): "postura · bottom turn medio · proyección · cruz ·
// postura; es un cambio de dirección; seguir el formato del pump".
// Doctrina (doctrine_rules): BT = Weight front · Elbow and forearm to the
// water · Palm down · Oblique · Hold, siempre una U cuya profundidad depende
// de lo que viene; la línea del snap = U prolongada en la mitad de la cara +
// cambio de riel agresivo hacia abajo (puede apuntar al flat, sin límite, sin labio); un
// solo brazo proyecta; la Cruz = de la proyección volver a postura y cambiar
// de riel con el oblicuo (avión); el oblicuo trabaja a los dos lados; la
// corrida completa en la arena es el drill de cierre.
export const BB_SEQ_10: SequencePageConfig = {
  id: 'BB-SEQ-10',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 10,
  title: 'Frontside Snap',
  stepIds: ['STP-035', 'STP-018', 'STP-039', 'STP-040', 'STP-041', 'STP-042'],
  think: {
    whatIs: {
      headline: 'The snap is a change of direction: a long U on the face, then an aggressive rail change to keep running the wave.',
      line: 'From the top of the face, a long U through the middle, then an aggressive rail change pointing down — as radical as you want: it can point to the flat, there is no limit. The concept is the line: one U, one change, and you keep running the face.',
      where: 'Anywhere on the face where there is wall in front of you. It does not need the lip: the snap can be done in different parts of the wave. The bottom turn is medium — mid-face — because that is the depth this maneuver asks for.',
      whatFor: 'To change direction without losing the wave: you load in the bottom turn, project, change the rail and come back to posture with speed for the next cycle.',
    },
    // Marcelo (2026-09-09): "en snap sugerir P1 para mayor radicalidad, o P2,
    // pero nunca P3" — el mapa de la tabla lo indica.
    feet: {
      text: 'For the snap the back foot goes back: P1 for the most radical change, P2 as the option. Never P3.',
      recommended: ['P1', 'P2'],
      options: [
        { back: 'P1', label: 'FP1 · tail', tradeoff: 'The snap position. Maximum manoeuvrability: the rail change comes out of the tail. The most radical.' },
        { back: 'P2', label: 'FP2 · neutral', tradeoff: 'The option: a softer, longer change of direction. Less radical.' },
        { back: 'P3', label: 'FP3 · forward', tradeoff: 'Not for the snap. From here the board does not want to turn: pump first, then bring the foot back.' },
      ],
      rule: BB_SEQ_08.think.feet.rule,
    },
    bodyFromLesson: 'STP-039',
    // El cuerpo de la secuencia completa (la lección STP-039 solo trae el BT).
    bodyMarkdown: `**The frontside snap pattern**

1. **Start with posture.**
2. **Bottom turn:** weight front · elbow and forearm to the water · palm down · oblique · hold. A long U through the middle of the face.
3. **Projection:** extend the legs, weight forward; only the leading arm projects, the back arm stays in posture.
4. **The Cruz:** back to posture, eyes over the shoulder to where you want to go, the oblique the other way, the front leg extends with the body forward over the front foot — head leading like the nose of a plane, hands as the wings — and the rail changes, pointing down — as radical as you want.
5. **Back to posture:** throw, extend, low finish — the Grenade — and you are in posture again, running the face.

It starts and ends in posture. The U sets up the change; the Cruz makes it.`,
    rulesMarkdown: `- Stance: FP1 — the tail alive. Weight always on the front foot.
- The bottom turn is always a U; medium (mid-face) is the depth the snap asks for. It ends when the projection begins — no gap.
- Hold in the bottom turn: rail, fins and body position hold the centrifugal force so you can project it toward the line you want.
- Projection: one arm projects; the other holds posture — scapula back, elbow on the ribs.
- The Cruz is the transition from the projection to the rail change: the oblique works the other way now.
- The rail change points down; it can point to the flat, more or less radical, no limit. It does not need the lip. Then you keep running the face.
- Critical: weight stays forward through the whole line.`,
    keyWords: [
      { label: 'Body', words: ['Posture', 'Forearm to the water', 'Extend', 'Cruz', 'Low', 'Posture'] },
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Projection', 'Maneuver (the Cruz)', 'Back to posture'] },
    ],
    // Zonas del tablero: Z4 y30-85 (labio) · Z3 85-140 · Z2 140-195 · Z1 195-250 (flat).
    // La U es MEDIA (Z2, nunca Z1), el cambio de riel en Z3 (sin labio), la
    // salida sigue corriendo la cara por Z2.
    board: {
      pocket: { x: 110, y: 70 },
      segments: [
        { d: 'M150,118 C164,118 176,126 186,138', command: 'posture' },
        { d: 'M186,138 C206,166 240,184 290,184 C318,184 336,170 350,152', command: 'rail', hold: true },
        { d: 'M350,152 C366,130 386,110 408,98', command: 'projection' },
        { d: 'M408,98 C422,90 440,90 446,102 C450,112 442,122 434,128', command: 'maneuver' },
        { d: 'M434,128 C448,142 470,152 492,154', command: 'closure' },
        { d: 'M492,154 C508,154 520,156 530,160', command: 'posture' },
        { d: 'M530,160 C562,172 600,180 640,172', command: 'rail' },
      ],
      markers: [
        { x: 150, y: 118, label: 'I' },
        { x: 290, y: 184, label: 'B' },
        { x: 446, y: 100, label: 'M' },
        { x: 640, y: 172, label: 'S' },
      ],
    },
  },
  feel: {
    visualize: 'Eyes closed, on the sand. Run the five words in order and picture the line: down into the U, up, the change at the top, down and to the side, running again. Feel the hold in the bottom turn and the moment the Cruz changes the rail. Ten snaps in your head.',
    land: ['DRL-BB-039', 'DRL-BB-040', 'DRL-BB-041', 'DRL-BB-042', 'DRL-BB-SEQ10-RUN'],
    skate: ['DRL-BB-SEQ10-SKATE'],
  },
  do: {
    result: 'One clean change of direction: a long U through the middle of the face, the projection, the rail change at the top pointing down — as radical as you want — and you come back to posture still running the wave with speed.',
    missionId: 'MIS-BB-042',
    timing: 'Start the bottom turn as soon as you have wall in front of you. The U lands mid-face; the projection fires the moment the U ends; the Cruz changes the rail wherever the face gives you wall — it does not wait for the lip.',
    competence: 'Five frontside waves with a complete snap line — U, projection, Cruz, back to posture — eyes on where you want to go, body running the sequence on its own. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    {
      key: 'posture',
      command: 'posture',
      title: 'Start with posture',
      symptom: 'The line does not start from posture: standing tall, weight back, chest away from the nose.',
      indicators: [
        { ok: 'The cycle starts in posture: shoulders pointing where the nose points, low, weight on the front foot.', no: 'You start tall or with the weight back; there is nothing to load the bottom turn from.', fix: 'Posture first, then the U.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
    {
      key: 'bt',
      command: 'rail',
      title: '1 · Bottom turn · weight front, forearm to the water, palm down, oblique, hold',
      symptom: 'The U is not there: too low into the flat, too high with no energy, a passive lean, or you let it go before the projection.',
      indicators: [
        { ok: 'Weight front, the whole forearm goes to the water with the palm down, and the oblique turns the lean into rotation: you are on the rail.', no: 'Only the hand drops, or the palm faces sideways; the turn is a lean, not a rotation.', fix: 'Elbow and forearm to the water, palm down, oblique.' },
        { ok: 'You hold the bottom turn: rail, fins and body fight the centrifugal force until the projection begins.', no: 'You let the turn go early, or you keep leaning past the point where you fall.', fix: 'Hold. Understand until when, and wait there.' },
        { ok: 'The U is mid-face: a long U that sets up the change.', no: 'The U goes to the flat and arrives at the top without speed, or stays so high there is nothing to load.', fix: 'Mid-face U. The depth is what the snap asks for.' },
      ],
      deeper: { label: 'Bottom Turn Medium — Frontside', lessonId: 'STP-039', drillId: 'DRL-BB-039', missionId: 'MIS-BB-039' },
    },
    {
      key: 'projection',
      command: 'projection',
      title: '2 · Projection · extend, one arm projects',
      symptom: 'No launch: the legs never extend, the weight drifts back, or both arms swing.',
      indicators: [
        { ok: 'The projection fires the moment the U ends: legs extend, chest aligned toward the maneuver, weight still on the front foot.', no: 'A gap between the bottom turn and the projection, or the legs stay bent; nothing launches.', fix: 'Extend as the U ends. No gap.' },
        { ok: 'Only the leading arm projects; the back arm stays in posture, scapula back, elbow glued to the ribs.', no: 'Both arms swing forward and the posture opens.', fix: 'One arm projects. The other holds.' },
      ],
      deeper: { label: 'Projection', lessonId: 'STP-040', drillId: 'DRL-BB-040', missionId: 'MIS-BB-040' },
    },
    {
      key: 'cruz',
      command: 'maneuver',
      title: '3 · The Cruz · back to posture, rail change with the oblique',
      symptom: 'The Cruz is a pose without a rail change, or the body falls behind the front foot.',
      indicators: [
        { ok: 'Coming from the projection you are back in posture: weight on the front foot, eyes over the shoulder to where you want to go.', no: 'You go straight from the projection into a swing; nothing to change the rail from.', fix: 'Posture first, eyes over the shoulder.' },
        { ok: 'The oblique works the other way and the rail changes; the front leg extends with the body forward over the front foot — head leading like the nose of a plane, hands as the wings.', no: 'The hand crosses but the rail does not change, or the body drops behind the front foot.', fix: 'Oblique, front leg, body forward. Airplane.' },
        { ok: 'The rail change points down — as radical as you chose — and you keep running the face.', no: 'The change never really happens, or you wait for a lip that never comes.', fix: 'Change the rail, pointing down. It does not need the lip.' },
      ],
      deeper: { label: 'Cruz Snap', lessonId: 'STP-041', drillId: 'DRL-BB-041', missionId: 'MIS-BB-041' },
    },
    {
      key: 'low',
      command: 'posture',
      title: '4 · Back to posture · throw, extend, low finish',
      symptom: 'You end the snap extended or stuck in the Cruz; no next cycle.',
      indicators: [
        { ok: 'You throw the leading arm, extend with the rail still engaged, and land back in posture: hips down, chest over the front knee.', no: 'A soft closure, or the rail is already gone when you throw; you cannot return to posture.', fix: 'Throw, extend, low finish — the Grenade.' },
      ],
      deeper: { label: 'Grenade', lessonId: 'STP-042', drillId: 'DRL-BB-042', missionId: 'MIS-BB-042' },
    },
  ],
  review: {
    howItFeels: 'It feels like a dynamic from the top down, with intention: you go up and come down on purpose, and at the change of direction you add a little more rotation and a little more energy than the wave gave you. Not a bottom turn — a change of direction you decided: a fast rail change, and you come out of it still running.',
  },
};
