import type { SequencePageConfig } from './types';
import { BB_SEQ_08 } from './bb-seq-08';
import { BB_SEQ_12 } from './bb-seq-12';

// Blue Belt · Sequence #13 · Backside Cutback.
// Marcelo (2026-09-09) confirmó los pasos: posture · bottom turn backside
// largo · Choke · Tapaloco + hold rotation · codazo · back to posture.
// Explicada por sí misma (nunca como espejo). Doctrina: el cierre apunta a
// la CARA (8 acostado); hold = mantener la posición, saber hasta dónde y
// esperar; la M es el cuerpo; el codazo lleva la energía al riel; pies: P2
// posible, el 8 sale de P1.
export const BB_SEQ_13: SequencePageConfig = {
  id: 'BB-SEQ-13',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 13,
  title: 'Backside Cutback',
  stepIds: ['STP-035', 'STP-018', 'STP-039B', 'STP-043', 'STP-048', 'STP-049', 'STP-045'],
  think: {
    whatIs: {
      headline: 'The backside cutback is moving away from the pocket with your back to the wave and coming back: a long U to create space, then a wide arc — the Tapaloco, with the rotation held — that closes with the elbow strike pointing at the face.',
      line: 'A long bottom turn away from the pocket, the climb, then one wide arc that turns back and closes with the board pointing at the face of the wave. The drawing is a lying figure 8, and it uses all the zones of the wave: down to the flat, up to the lip, down again and back up to the face. A cutback can also be simpler: just coming back to the foam and out to the face again.',
      where: 'Farther from the pocket than the snap. You move away along the face to create the space you need to come back. If the board never turns back pointing at the face, it was a snap, not a cutback.',
      whatFor: 'To go back to where the energy is on your backside. You ran away from the pocket; the cutback brings you back to it with speed, ready for the next cycle.',
    },
    feet: BB_SEQ_12.think.feet,
    bodyFromLesson: 'STP-048',
    bodyMarkdown: `**The backside cutback pattern**

1. **Start with posture.** Chest open toward the wave, eyes over your back shoulder.
2. **Long bottom turn backside:** weight front · front arm at shoulder height, aimed where you are going · fingertips skimming the water · oblique · hold. A longer U than the snap: you are moving away from the pocket to create the space you will need to come back.
3. **The Choke:** the legs extend while the arm crosses over the waist (goofy left, regular right) as if grabbing a sword from the other side; the chest rotates toward the arc and the nose points where the shoulders point.
4. **The Tapaloco — and hold the rotation:** the hand (goofy right, regular left) goes over the head, palm up, covering the opposite ear; eyes over the shoulder; the oblique changes and the rail engages. And you stay there: in the new-rail posture, simple rotation, oblique engaged, legs flexed, drawing the arc, saving the energy. Hold is knowing how far you can lean and waiting there.
5. **Elbow strike — the M:** when the board points back at the face of the wave — the elbow of the Tapaloco arm goes up, the other arm receives, the scapulas unite and the energy travels down to the foot and the rail. The back foot follows the elbow.
6. **Back to posture,** coming back to where the energy is.

It starts and ends in posture. The long U makes the space; the held Tapaloco draws the arc; the elbow strike closes it pointing at the face.`,
    rulesMarkdown: `- Stance: P1 to draw the figure 8; P2 is possible for a longer, softer arc. Never P3. Weight always on the front foot, never behind the hip.
- The bottom turn is always a U; here it is long, because what comes next asks for space. It ends when the Choke begins — no gap.
- Hold in the bottom turn and hold the rotation after the Tapaloco: rail, fins and body position hold the centrifugal force so you can redirect the energy where you want.
- The Tapaloco changes the rail (hand, palm up, over the head is the ideal); then the rotation is held through the whole arc, legs flexed, until the elbow strike.
- The M is the shape of your body, not a line on the wave: elbow up, the other arm receives, scapulas unite.
- The close points at the FACE of the wave, not at the foam. A lying figure 8.
- Do not throw the elbow early: the hold saves that energy for the moment the board points at the face.`,
    keyWords: [
      { label: 'Body', words: ['Posture', 'Long U', 'Choke', 'Tapaloco · hold', 'Elbow', 'Posture'] },
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Projection', 'Maneuver (the Tapaloco)', 'Back to posture'] },
    ],
    // Misma geometría que la #12: 8 acostado, U larga en Z2, arco sostenido en Z3, cierre a la cara.
    board: BB_SEQ_12.think.board,
  },
  feel: {
    visualize: 'Eyes closed, on the sand, chest open to an imaginary wave behind you. Run the words in order and picture the figure 8: the long U away from the pocket with the front arm high, the Choke on the climb, the hand over the head at the top and the rotation held through the wide arc, the moment the board points at the face and the elbow strikes, back in posture heading to where the energy is. Ten cutbacks in your head.',
    land: ['DRL-BB-048', 'DRL-BB-049', 'DRL-BB-049-02', 'DRL-BB-SEQ13-RUN'],
    skate: ['DRL-BB-SEQ13-SKATE'],
  },
  do: {
    result: 'One complete backside cutback: a long U away from the pocket, the Choke, the Tapaloco with the rotation held through a wide arc, the elbow strike when the board points at the face, and you come back to posture heading to the pocket with speed.',
    missionId: 'MIS-BB-048',
    timing: 'Start the long bottom turn once you have run away from the pocket and there is space behind you. The Choke fires as the U ends; the Tapaloco changes the rail at the top and the rotation is held for as long as the arc takes — the elbow strike waits for the board to point at the face, not before.',
    competence: 'Five backside waves with a complete cutback line — long U, Choke, Tapaloco, rotation held, elbow strike at the face, back to posture — body running the sequence on its own. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    {
      key: 'posture',
      command: 'posture',
      title: 'Start with posture · chest open, eyes over the shoulder',
      symptom: 'Closed chest facing the nose, eyes forward, standing tall or with the weight back.',
      indicators: [
        { ok: 'The cycle starts in posture: low, weight on the front foot, chest open toward the wave, eyes over the back shoulder.', no: 'Chest closed toward the nose or eyes looking forward; there is nothing to rotate from.', fix: 'Open the chest, eyes over the shoulder, then the long U.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
    {
      key: 'bt',
      command: 'rail',
      title: '1 · Long bottom turn backside · away from the pocket',
      symptom: 'The U is too short (no space to come back), the front arm drops, or you let it go before the Choke.',
      indicators: [
        { ok: 'Weight front, the front arm at shoulder height aimed where you are going, fingertips to the water, oblique: you are on the rail, and the U is long enough to create space behind you.', no: 'A short U like the snap, or the front arm drops to the hip: there is no space and the rotation stops travelling.', fix: 'Longer U, front arm at the shoulder. Make the space first.' },
        { ok: 'You hold the bottom turn until the Choke begins.', no: 'You let the turn go early, or you keep leaning past the point where you fall.', fix: 'Hold. Understand until when, and wait there.' },
      ],
      deeper: { label: 'Bottom Turn Medium — Backside', lessonId: 'STP-039B' },
    },
    {
      key: 'choke',
      command: 'projection',
      title: '2 · The Choke · extend and cross',
      symptom: 'You skip the Choke and go from the bottom turn straight to the Tapaloco; or the legs never extend; or the weight drifts back.',
      indicators: [
        { ok: 'The Choke fires the moment the U ends: legs extend and the arm crosses over the waist like grabbing a sword; the chest rotates toward the arc.', no: 'No arm crossing, or the legs stay bent; the bottom turn fades with no projection.', fix: 'Extend and cross. The Choke is the projection.' },
        { ok: 'Weight stays forward and the scapula is active through the Choke.', no: 'The weight drifts to the back foot; the board stalls before the arc.', fix: 'Weight forward, scapula active.' },
      ],
      deeper: { label: 'Choke (BS Projection)', lessonId: 'STP-043', drillId: 'DRL-BB-043', missionId: 'MIS-BB-043' },
    },
    {
      key: 'tapaloco',
      command: 'maneuver',
      title: '3 · The Tapaloco, rotation held · draw the arc',
      symptom: 'The rail changes but you release too soon: a snap instead of a cutback; or the arc breaks in two lines.',
      indicators: [
        { ok: 'The hand goes over the head, palm up, covering the opposite ear; eyes over the shoulder; the oblique changes and the rail engages.', no: 'The palm stays down or the hand stops at the shoulder; the rail does not change.', fix: 'Palm up, over the head, cover the ear.' },
        { ok: 'You stay in the new-rail posture, simple rotation, oblique engaged, legs flexed, through the whole arc — saving the energy.', no: 'You stand up out of the rotation or throw the elbow with the board still pointing at the shoulder: a snap, not a cutback.', fix: 'Hold the rotation. The elbow waits.' },
        { ok: 'Hold is knowing how far: you lean up to the point you can keep, and you wait there — rail and fins fighting the centrifugal force.', no: 'You keep leaning past the point and fall, or the weight goes behind the hip and you get stuck.', fix: 'Understand until when. Wait there. Weight forward.' },
      ],
      deeper: { label: 'Tapaloco Cutback · Hold Rotation', lessonId: 'STP-048', drillId: 'DRL-BB-049', missionId: 'MIS-BB-048' },
    },
    {
      key: 'elbow',
      command: 'closure',
      title: '4 · Elbow strike · when the board points at the face',
      symptom: 'You throw the elbow too early (the board still points at the shoulder), downward, or too softly; or the other arm is dead.',
      indicators: [
        { ok: 'The elbow strike fires when the board points back at the face: the elbow of the Tapaloco arm goes up, the other arm receives, the scapulas unite — the M is your body — and the energy travels down to the rail.', no: 'The elbow is thrown down, or with the board pointing at the foam or at the shoulder; the close does not convert.', fix: 'Wait for the face. Elbow up, the other arm receives.' },
      ],
      deeper: { label: 'Elbow (BS Closure)', lessonId: 'STP-045', drillId: 'DRL-BB-045', missionId: 'MIS-BB-045' },
    },
    {
      key: 'low',
      command: 'posture',
      title: '5 · Back to posture · heading to the energy',
      symptom: 'You end the cutback extended, or pointing away from the pocket; no next cycle.',
      indicators: [
        { ok: 'After the elbow strike you land back in posture: low, weight on the front foot, chest open, heading to the pocket with speed.', no: 'You stay extended, or the board still points away; the wave leaves without you.', fix: 'Low, back to posture, eyes on the pocket.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
  ],
  review: {
    howItFeels: 'It feels like patience with your back to the wave: you run away from the energy on purpose, and after the Tapaloco you wait in the rotation — flexed, holding against the force — until the face comes back into view. Then the elbow strike lets everything go and you are heading to the pocket again with speed. A big, round line you drew and closed yourself.',
  },
};
