import type { SequencePageConfig } from './types';
import { BB_SEQ_08 } from './bb-seq-08';

// Blue Belt · Sequence #12 · Frontside Cutback.
// Marcelo (2026-09-09): "la idea es alejarme del pocket con: postura ·
// bottom turn largo · proyección · cruz + hold · granada · back to posture".
// Doctrina: el cierre apunta a la CARA de la ola, no a la espuma (un 8
// acostado); el hold mantiene la posición y administra la energía — saber
// hasta dónde y esperar ahí; la U es larga porque lo que viene pide espacio.
export const BB_SEQ_12: SequencePageConfig = {
  id: 'BB-SEQ-12',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 12,
  title: 'Frontside Cutback',
  stepIds: ['STP-035', 'STP-018', 'STP-039', 'STP-040', 'STP-046', 'STP-047'],
  think: {
    whatIs: {
      headline: 'The cutback is moving away from the pocket and coming back: a long U to create space, then a wide arc — the Cruz, held — that closes pointing at the face.',
      line: 'A long bottom turn away from the pocket, the climb, then one wide arc that turns back and closes with the board pointing at the face of the wave — not at the foam. The drawing is a lying figure 8.',
      where: 'Farther from the pocket than the snap. You move away along the face to create the space you need to come back. If the board never turns back, it was a snap, not a cutback.',
      whatFor: 'To go back to where the energy is. You ran away from the pocket; the cutback brings you back to it with speed, ready for the next cycle.',
    },
    // Pies: P1 o P2 (la cola viva para sostener la Cruz en todo el arco). Por confirmar con Marcelo.
    feet: {
      text: 'For the cutback the back foot goes back: P1 to hold the tightest arc, P2 for a longer, softer one. Never P3.',
      recommended: ['P1', 'P2'],
      options: [
        { back: 'P1', label: 'FP1 · tail', tradeoff: 'The tightest arc: the tail stays live to hold the Cruz all the way round.' },
        { back: 'P2', label: 'FP2 · neutral', tradeoff: 'A longer, softer arc. Less radical, more speed through the turn.' },
        { back: 'P3', label: 'FP3 · forward', tradeoff: 'Not for the cutback. From here the board does not want to turn back.' },
      ],
      rule: BB_SEQ_08.think.feet.rule,
    },
    bodyFromLesson: 'STP-046',
    bodyMarkdown: `**The frontside cutback pattern**

1. **Start with posture.**
2. **Long bottom turn:** weight front · elbow and forearm to the water · palm down · oblique · hold. A longer U than the snap: you are moving away from the pocket to create the space you will need to come back.
3. **Projection:** extend the legs, weight forward; only the leading arm projects, the back arm stays in posture.
4. **The Cruz — and hold it:** back to posture, eyes over the shoulder to where you want to go, the oblique the other way, the front leg extends with the body forward over the front foot — head leading like the nose of a plane, hands as the wings. And you stay there: flexed, in the Cruz, drawing the arc, saving the energy. Hold is knowing how far you can lean and waiting there.
5. **Grenade:** when the board points back at the face of the wave — throw the leading arm, extend, low finish.
6. **Back to posture,** coming back to where the energy is.

It starts and ends in posture. The long U makes the space; the held Cruz draws the arc; the Grenade closes it pointing at the face.`,
    rulesMarkdown: `- Stance: P1 or P2 — the tail alive. Weight always on the front foot.
- The bottom turn is always a U; here it is long, because what comes next asks for space. It ends when the projection begins — no gap.
- Hold in the bottom turn and hold in the Cruz: rail, fins and body position hold the centrifugal force so you can redirect the energy where you want.
- The Cruz is held through the whole arc: leg flexed (it can extend a little and bend back), all the details of the Cruz preserved, until the Grenade.
- The close points at the FACE of the wave, not at the foam. A lying figure 8.
- Do not throw the Grenade early: the hold saves that energy for the moment the board points at the face.
- Critical: weight stays forward through the whole line.`,
    keyWords: [
      { label: 'Body', words: ['Posture', 'Long U', 'Extend', 'Cruz · hold', 'Grenade', 'Posture'] },
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Projection', 'Maneuver (the Cruz)', 'Back to posture'] },
    ],
    // Zonas: Z4 30-85 · Z3 85-140 · Z2 140-195 · Z1 195-250. La U larga en Z2
    // alejándose del pocket, la subida, el arco sostenido en Z3 que vuelve y
    // cierra apuntando a la cara (hacia el pocket), postura de nuevo.
    board: {
      pocket: { x: 110, y: 70 },
      segments: [
        { d: 'M140,110 C156,112 170,120 182,132', command: 'posture' },
        { d: 'M182,132 C210,164 260,186 330,186 C372,186 400,172 420,152', command: 'rail', hold: true },
        { d: 'M420,152 C440,130 462,110 486,98', command: 'projection' },
        { d: 'M486,98 C520,84 566,90 580,112 C592,132 574,148 546,152', command: 'maneuver', hold: true },
        { d: 'M546,152 C520,156 492,150 470,140', command: 'closure' },
        { d: 'M470,140 C456,134 446,130 436,128', command: 'posture' },
        { d: 'M436,128 C410,124 380,130 350,146', command: 'rail' },
      ],
      markers: [
        { x: 140, y: 110, label: 'I' },
        { x: 330, y: 186, label: 'B' },
        { x: 580, y: 112, label: 'M' },
        { x: 350, y: 146, label: 'S' },
      ],
    },
  },
  feel: {
    visualize: 'Eyes closed, on the sand. Run the words in order and picture the figure 8: the long U away from the pocket, the climb, the wide arc held in the Cruz, the moment the board points at the face and the Grenade fires, back in posture heading to where the energy is. Ten cutbacks in your head.',
    land: ['DRL-BB-046', 'DRL-BB-047', 'DRL-BB-047-02', 'DRL-BB-SEQ12-RUN'],
    skate: ['DRL-BB-SEQ12-SKATE'],
  },
  do: {
    result: 'One complete cutback: a long U away from the pocket, the projection, the Cruz held through a wide arc, the Grenade when the board points at the face, and you come back to posture heading to the pocket with speed.',
    missionId: 'MIS-BB-046',
    timing: 'Start the long bottom turn once you have run away from the pocket and there is space behind you. The projection fires as the U ends; the Cruz is held for as long as the arc takes — the Grenade waits for the board to point at the face, not before.',
    competence: 'Five frontside waves with a complete cutback line — long U, projection, Cruz held, Grenade at the face, back to posture — body running the sequence on its own. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    {
      key: 'posture',
      command: 'posture',
      title: 'Start with posture',
      symptom: 'The line does not start from posture: standing tall, weight back, chest away from the nose.',
      indicators: [
        { ok: 'The cycle starts in posture: shoulders pointing where the nose points, low, weight on the front foot.', no: 'You start tall or with the weight back; there is nothing to load the long U from.', fix: 'Posture first, then the long U.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
    {
      key: 'bt',
      command: 'rail',
      title: '1 · Long bottom turn · away from the pocket',
      symptom: 'The U is too short (no space to come back), goes to the flat, or you let it go before the projection.',
      indicators: [
        { ok: 'Weight front, forearm to the water with the palm down, oblique: you are on the rail, and the U is long enough to create space behind you.', no: 'A short U like the snap: there is no space to come back and the arc dies.', fix: 'Longer U. Make the space first.' },
        { ok: 'You hold the bottom turn until the projection begins.', no: 'You let the turn go early, or you keep leaning past the point where you fall.', fix: 'Hold. Understand until when, and wait there.' },
      ],
      deeper: { label: 'Bottom Turn Medium — Frontside', lessonId: 'STP-039', drillId: 'DRL-BB-039', missionId: 'MIS-BB-039' },
    },
    {
      key: 'projection',
      command: 'projection',
      title: '2 · Projection · extend, one arm projects',
      symptom: 'No launch: the legs never extend, the weight drifts back, or both arms swing.',
      indicators: [
        { ok: 'The projection fires the moment the U ends: legs extend, chest aligned toward the arc, weight still on the front foot.', no: 'A gap between the bottom turn and the projection, or the legs stay bent.', fix: 'Extend as the U ends. No gap.' },
        { ok: 'Only the leading arm projects; the back arm stays in posture, scapula back, elbow glued to the ribs.', no: 'Both arms swing forward and the posture opens.', fix: 'One arm projects. The other holds.' },
      ],
      deeper: { label: 'Projection', lessonId: 'STP-040', drillId: 'DRL-BB-040', missionId: 'MIS-BB-040' },
    },
    {
      key: 'cruz',
      command: 'maneuver',
      title: '3 · The Cruz, held · draw the arc',
      symptom: 'You enter the Cruz but release it too soon: a snap instead of a cutback, or the arc breaks in two lines.',
      indicators: [
        { ok: 'From the projection you are back in posture, eyes over the shoulder, and the oblique changes the rail; front leg extends, body forward over the front foot — airplane.', no: 'The hand crosses but the rail does not change, or the body drops behind the front foot.', fix: 'Oblique, front leg, body forward. Airplane.' },
        { ok: 'You stay in the Cruz, flexed, through the whole arc: all its details preserved, the energy saved.', no: 'You release early and the Grenade fires with the board still pointing at the shoulder — a snap, not a cutback.', fix: 'Hold the Cruz. The Grenade waits.' },
        { ok: 'Hold is knowing how far: you lean up to the point you can keep, and you wait there — rail and fins fighting the centrifugal force.', no: 'You keep leaning past the point and fall, or you stand up out of the Cruz.', fix: 'Understand until when. Wait there.' },
      ],
      deeper: { label: 'Cruz Cutback · Hold', lessonId: 'STP-046', drillId: 'DRL-BB-047', missionId: 'MIS-BB-046' },
    },
    {
      key: 'grenade',
      command: 'closure',
      title: '4 · Grenade · when the board points at the face',
      symptom: 'You throw too early (the board still points at the shoulder) or too softly; or you close toward the foam.',
      indicators: [
        { ok: 'The Grenade fires when the board points back at the face of the wave: throw the leading arm, extend with the rail still engaged, low finish.', no: 'You throw with the board pointing at the foam or at the shoulder; the close does not convert.', fix: 'Wait for the face. Then throw, extend, low.' },
      ],
      deeper: { label: 'Grenade', lessonId: 'STP-042', drillId: 'DRL-BB-042', missionId: 'MIS-BB-042' },
    },
    {
      key: 'low',
      command: 'posture',
      title: '5 · Back to posture · heading to the energy',
      symptom: 'You end the cutback extended, or pointing away from the pocket; no next cycle.',
      indicators: [
        { ok: 'You land back in posture, low, weight on the front foot, heading to the pocket with speed.', no: 'You stay extended, or the board still points away; the wave leaves without you.', fix: 'Low, back to posture, eyes on the pocket.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
  ],
  review: {
    howItFeels: 'It feels like patience with the rail engaged: you run away from the energy on purpose, and in the Cruz you wait — flexed, holding against the force — until the face comes back into view. Then the Grenade lets everything go and you are heading to the pocket again with speed. A big, round line you drew and closed yourself.',
  },
};
