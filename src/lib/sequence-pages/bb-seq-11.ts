import type { SequencePageConfig } from './types';
import { BB_SEQ_08 } from './bb-seq-08';
import { BB_SEQ_10 } from './bb-seq-10';

// Blue Belt · Sequence #11 · Backside Snap.
// Espejo de la #10 con el lenguaje backside de Marcelo (2026-09-09):
// Posture · Rail rotation + hold (bottom turn backside) · Projection (Choke)
// · Tapaloco (el cambio de riel, la maniobra) · Elbow strike, the M (cierre)
// · Back to posture. Doctrina: la M es el cuerpo; el codazo lleva la
// energía al riel; la línea es la misma que frontside en espejo (U + cambio
// de riel hacia abajo, tan radical como se quiera, sin labio); BT siempre
// una U; hold; pies P1/P2, nunca P3.
export const BB_SEQ_11: SequencePageConfig = {
  id: 'BB-SEQ-11',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 11,
  title: 'Backside Snap',
  stepIds: ['STP-035', 'STP-018', 'STP-039B', 'STP-043', 'STP-044', 'STP-045'],
  think: {
    whatIs: {
      headline: 'The backside snap is the frontside snap in the mirror: a long U on the face, then an aggressive rail change — made with the Choke, the Tapaloco and the elbow strike.',
      line: 'From the top of the face, a long U through the middle, then an aggressive rail change pointing down — as radical as you want, it can point to the flat. One U, one change, and you keep running the face.',
      where: 'Anywhere on the face where there is wall in front of you. It does not need the lip. The bottom turn is medium — mid-face — because that is the depth this maneuver asks for.',
      whatFor: 'To change direction on your backside without losing the wave: you load in the bottom turn, project with the Choke, change the rail with the Tapaloco, close with the elbow strike and come back to posture with speed for the next cycle.',
    },
    feet: {
      text: 'For the snap the back foot goes back: P1 for the most radical change, P2 as the option. Never P3.',
      recommended: ['P1', 'P2'],
      options: BB_SEQ_10.think.feet.options,
      rule: BB_SEQ_08.think.feet.rule,
    },
    bodyFromLesson: 'STP-039B',
    bodyMarkdown: `**The backside snap pattern**

1. **Start with posture.** Chest open toward the wave, eyes over your back shoulder.
2. **Bottom turn backside:** weight front · front arm at shoulder height, aimed where you are going · fingertips skimming the water · oblique · hold. A long U through the middle of the face.
3. **Projection — the Choke:** the legs extend while the arm crosses over the waist (goofy left, regular right) as if grabbing a sword from the other side; the chest rotates toward the maneuver and the nose points where the shoulders point.
4. **The Tapaloco — the rail change:** the hand (goofy right, regular left) goes over the head, palm up, covering the opposite ear; eyes over the shoulder to where you want to go; the oblique changes and the rail engages, pointing down.
5. **Elbow strike — the M:** the elbow of the arm that did the Tapaloco goes up; the other arm is active and receives it; back and both elbows make the M with your body; the scapulas unite and the energy travels down to the foot and the rail. The back foot follows the elbow.
6. **Back to posture.**

It starts and ends in posture. The U sets up the change; the Tapaloco makes it; the elbow strike closes it.`,
    rulesMarkdown: `- Stance: P1 or P2 — the tail alive. Weight always on the front foot, never behind the hip, or you get stuck on the wave.
- The bottom turn is always a U; medium (mid-face) is the depth the snap asks for. It ends when the Choke begins — no gap.
- Hold in the bottom turn: rail, fins and body position hold the centrifugal force so you can project it toward the line you want.
- The Choke is the backside projection: extension plus the arm crossing; the chest rotates toward the maneuver.
- The Tapaloco can be done with the arm, the elbow or the shoulder, but the ideal is the hand: palm up, over the head, covering the opposite ear. What matters is that the rail changes.
- The M is the shape of your body, not a line on the wave: elbow up, the other arm receives, scapulas unite.
- The rail change points down; it can point to the flat, more or less radical, no limit. It does not need the lip.`,
    keyWords: [
      { label: 'Body', words: ['Posture', 'Fingertips to the water', 'Choke', 'Tapaloco', 'Elbow', 'Posture'] },
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Projection', 'Maneuver (the Tapaloco)', 'Back to posture'] },
    ],
    // Misma línea que la #10 (Z2 la U, Z3 el cambio, salida por Z2).
    board: BB_SEQ_10.think.board,
  },
  feel: {
    visualize: 'Eyes closed, on the sand, chest open to an imaginary wave behind you. Run the words in order and picture the line: down into the U with the front arm high, the Choke as you come up, the hand over the head at the top, the elbow strike that changes the rail, running again. Ten snaps in your head.',
    land: ['DRL-BB-043', 'DRL-BB-044', 'DRL-BB-045', 'DRL-BB-SEQ11-RUN'],
    skate: ['DRL-BB-SEQ11-SKATE'],
  },
  do: {
    result: 'One clean change of direction on your backside: a long U through the middle of the face, the Choke, the Tapaloco changing the rail at the top, the elbow strike closing it, and you come back to posture still running the wave with speed.',
    missionId: 'MIS-BB-045',
    timing: 'Start the bottom turn as soon as you have wall in front of you. The U lands mid-face; the Choke fires the moment the U ends; the Tapaloco changes the rail wherever the face gives you wall — it does not wait for the lip; the elbow strike follows the moment the rail has changed.',
    competence: 'Five backside waves with a complete snap line — U, Choke, Tapaloco, elbow strike, back to posture — eyes over the shoulder on where you want to go, body running the sequence on its own. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    {
      key: 'posture',
      command: 'posture',
      title: 'Start with posture · chest open, eyes over the shoulder',
      symptom: 'Closed chest facing the nose, eyes forward, standing tall or with the weight back.',
      indicators: [
        { ok: 'The cycle starts in posture: low, weight on the front foot, chest open toward the wave, eyes over the back shoulder.', no: 'Chest closed toward the nose or eyes looking forward; there is nothing to rotate from.', fix: 'Open the chest, eyes over the shoulder, then the U.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
    {
      key: 'bt',
      command: 'rail',
      title: '1 · Bottom turn backside · front arm high, fingertips to the water, oblique, hold',
      symptom: 'The U is not there: the front arm drops, the turn is a passive lean, or you let it go before the Choke.',
      indicators: [
        { ok: 'Weight front, the front arm at shoulder height aimed where you are going, only the fingertips graze the water, and the oblique turns the lean into rotation.', no: 'The front arm drops to the hip and the rotation stops travelling; the turn becomes a lean.', fix: 'Front arm at the shoulder, fingertips to the water, oblique.' },
        { ok: 'You hold the bottom turn: rail, fins and body fight the centrifugal force until the Choke begins.', no: 'You let the turn go early, or you keep leaning past the point where you fall.', fix: 'Hold. Understand until when, and wait there.' },
        { ok: 'The U is mid-face: a long U that sets up the change.', no: 'The U goes to the flat and arrives at the top without speed, or stays so high there is nothing to load.', fix: 'Mid-face U. The depth is what the snap asks for.' },
      ],
      deeper: { label: 'Bottom Turn Medium — Backside', lessonId: 'STP-039B' },
    },
    {
      key: 'choke',
      command: 'projection',
      title: '2 · Projection · the Choke',
      symptom: 'You skip the Choke and go from the bottom turn straight to the Tapaloco; or the legs never extend; or the weight drifts back.',
      indicators: [
        { ok: 'The Choke fires the moment the U ends: legs extend and the arm crosses over the waist like grabbing a sword; the chest rotates toward the maneuver and the nose points where the shoulders point.', no: 'No arm crossing, or the legs stay bent; there is no projection, only a bottom turn that fades.', fix: 'Extend and cross. The Choke is the projection.' },
        { ok: 'Weight stays forward and the scapula is active through the Choke.', no: 'The weight drifts to the back foot; the board stalls before the change.', fix: 'Weight forward, scapula active.' },
      ],
      deeper: { label: 'Choke (BS Projection)', lessonId: 'STP-043', drillId: 'DRL-BB-043', missionId: 'MIS-BB-043' },
    },
    {
      key: 'tapaloco',
      command: 'maneuver',
      title: '3 · The Tapaloco · hand over the head, the rail changes',
      symptom: 'The hand goes up but the rail does not change; the palm stays down; the eyes do not lead; the weight is behind the hip.',
      indicators: [
        { ok: 'The hand goes over the head, palm up, covering the opposite ear; eyes over the shoulder to where you want to go; the oblique changes and the rail engages, pointing down.', no: 'The palm stays down or the hand stops at the shoulder; the rail does not change.', fix: 'Palm up, over the head, cover the ear. Eyes over the shoulder.' },
        { ok: 'Weight stays forward through the change and the front leg extends.', no: 'The weight goes behind the hip; you get stuck on the wave and lose speed.', fix: 'Weight forward. Front leg extends.' },
      ],
      deeper: { label: 'Tapaloco Snap', lessonId: 'STP-044', drillId: 'DRL-BB-044', missionId: 'MIS-BB-044' },
    },
    {
      key: 'elbow',
      command: 'closure',
      title: '4 · Elbow strike · the M is your body',
      symptom: 'The elbow goes down, or too softly, or the other arm is dead; no energy reaches the rail.',
      indicators: [
        { ok: 'The elbow of the Tapaloco arm goes up; the other arm is active and receives it; back and both elbows make the M with your body.', no: 'The elbow is thrown down, or the other arm hangs dead: half the movement.', fix: 'Elbow up. The other arm receives. The M is your body.' },
        { ok: 'The scapulas unite and the energy travels down to the foot and the rail; the back foot follows the elbow.', no: 'A soft elbow with no rotational energy; nothing reaches the rail.', fix: 'Scapulas together, back foot follows the elbow.' },
      ],
      deeper: { label: 'Elbow (BS Closure)', lessonId: 'STP-045', drillId: 'DRL-BB-045', missionId: 'MIS-BB-045' },
    },
    {
      key: 'low',
      command: 'posture',
      title: '5 · Back to posture',
      symptom: 'You end the snap extended or stuck in the Tapaloco; no next cycle.',
      indicators: [
        { ok: 'After the elbow strike you land back in posture: low, weight on the front foot, chest open, eyes already on the next section.', no: 'You stay extended, or the chest closes; the pump for the next section never starts.', fix: 'Low, back to posture, eyes on the next section.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
  ],
  review: {
    howItFeels: 'It feels like a dynamic from the top down, with intention: you go up and come down on purpose, and at the change of direction you add a little more rotation and a little more energy than the wave gave you — with your back to the wave, the hand over the head and the elbow doing the work. Not a bottom turn: a change of direction you decided — a fast rail change — and you come out of it still running.',
  },
};
