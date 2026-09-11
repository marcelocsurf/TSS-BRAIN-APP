import type { SequencePageConfig } from './types';
import { BB_SEQ_08 } from './bb-seq-08';

// Blue Belt · Sequence #9 · Backside Pumping.
// Mismo molde que la #8 (Marcelo 2026-09-09). Doctrina (doctrine_rules,
// "Backside pump: the M is the body" y "hand and elbow strike"): la M es la
// forma del CUERPO, no un trazo en la ola; la mano de ATRÁS (lado de la ola)
// abre la palma hacia arriba y se tira hacia la línea; el codazo lidera la
// bajada y cambia el riel; la línea en la cara es la misma que frontside.
export const BB_SEQ_09: SequencePageConfig = {
  id: 'BB-SEQ-09',
  belt: 'blue_belt',
  courseKey: 'blue_belt',
  number: 9,
  title: 'Backside Pumping',
  // Como en la pestaña Course: FP1 → Posture (White) → BS mechanics → Pump.
  stepIds: ['STP-035', 'STP-018', 'STP-038', 'STP-037'],
  think: {
    whatIs: {
      headline: 'Backside pumping is the same partnership — the wave’s energy plus your biomechanics — on a wave that breaks behind you: chest open to the wave, eyes over the back shoulder.',
      line: 'Arcs from the top of the face down through the middle and up again. One arc per pump.',
      where: 'Z2 to Z4 — the open face, wherever there is wall in front of you. It does not need to touch the lip.',
      whatFor: 'Speed you can spend on your backside: to make a section, to reach the pocket, to set up the bottom turn. The closer to the pocket, the more energy the wave gives you.',
    },
    feet: BB_SEQ_08.think.feet,
    bodyFromLesson: 'STP-037',
    keyWords: [
      { label: 'Body', words: ['Posture', 'Palm up', 'Extend', 'Elbow (the M)', 'Low', 'Posture'] },
      // Marcelo 2026-09-09: en backside la maniobra es el codazo, la M (no la Cruz).
      { label: 'Method', words: ['Posture', 'Rotation / rail', 'Projection', 'Maneuver (the elbow strike · the M)', 'Back to posture'] },
    ],
    board: BB_SEQ_08.think.board,
  },
  feel: {
    visualize: 'Eyes closed, on the sand, chest open to an imaginary wave behind you. Run the six words in order and picture the line: up, down, up. Feel the back hand open palm up and throw toward the line, then the elbow strike that makes the M with your body. Ten pumps in your head.',
    land: ['DRL-BB-037'],
    skate: [],
  },
  do: {
    result: 'The board accelerates on every down-cycle on your backside: chest open, eyes over the back shoulder, the back hand throwing toward the line and the elbow strike changing the rail, with your weight never leaving the front foot.',
    missionId: 'MIS-BB-037',
    timing: 'Start the pump as soon as you have wall in front of you. The palm-up throw sets the line; the elbow strike lands the down-cycle on the lower third of the face; the up-cycle uses the top without touching the lip.',
    competence: 'Five backside waves with a clean pump line, eyes over the shoulder on where you want to go, body running the sequence on its own. If you can execute it and you feel comfortable, it is yours.',
  },
  // El foco se elige de los pasos del cuerpo. Mismo orden que las key words.
  details: [
    {
      key: 'posture',
      command: 'posture',
      title: 'Start with posture · chest open, eyes over the shoulder',
      symptom: 'Closed chest facing the nose, eyes forward, standing tall or with the weight back.',
      indicators: [
        { ok: 'The cycle starts in posture: low, weight on the front foot, chest open toward the wave, eyes over the back shoulder.', no: 'Chest closed toward the nose or eyes looking forward; there is nothing to rotate from.', fix: 'Open the chest, eyes over the shoulder, then move.' },
      ],
      deeper: { label: 'BS Body Mechanics', lessonId: 'STP-038', drillId: 'DRL-BB-038', missionId: 'MIS-BB-038' },
    },
    {
      key: 'palm',
      command: 'rail',
      title: '1 · Back hand, palm up, throws to the line · get on the rail',
      symptom: 'The front hand leads or both hands swing; the line has no direction.',
      indicators: [
        { ok: 'The back hand (wave side) opens the palm up and throws toward where you want to draw the line, before the legs extend.', no: 'The front hand leads, or the palm stays down; the body does not get on the rail.', fix: 'Palm up, throw to the line.' },
      ],
      deeper: { label: 'Pump Backside', lessonId: 'STP-037' },
    },
    {
      key: 'extend',
      command: 'projection',
      title: '2 · Extend, weight forward · projection',
      symptom: 'The board stalls on the down-cycle; the weight went to the back foot.',
      indicators: [
        { ok: 'At full extension the chest is still over the front foot, never behind it.', no: 'The chest drops behind the front foot; the board loses speed.', fix: 'Chest over the front foot.' },
        { ok: 'The back foot only follows the rails; the front foot sinks the rail toward where you want to go.', no: 'The weight drifts to the back foot; the board stalls.', fix: 'Weight forward, front foot sinks the rail.' },
      ],
      deeper: { label: 'Pump Backside', lessonId: 'STP-037' },
    },
    {
      key: 'elbow',
      command: 'maneuver',
      title: '3 · Elbow strike · the M is your body',
      symptom: 'The rail does not change; the arms wave an M in the air instead of striking.',
      indicators: [
        { ok: 'One arm strikes with the elbow and the other arm is active and receives it: back and both elbows make the M with your body, and the rail changes.', no: 'The arms draw an M in the air, or only one arm works; the rail does not change.', fix: 'Strike the elbow, the other arm receives. The M is your body.' },
        { ok: 'The elbow strike leads the way down: the board drops with energy.', no: 'The head or the front hand tries to lead it down; nothing drops.', fix: 'The elbow leads it down.' },
      ],
      deeper: { label: 'Pump Backside', lessonId: 'STP-037' },
    },
    {
      key: 'low',
      command: 'posture',
      title: '4 · Get low, back to posture',
      symptom: 'You end taller each cycle; the pump dies out.',
      indicators: [
        { ok: 'You get low and land back in the same open-chest posture you started from, every cycle.', no: 'You end taller or the chest closes; the pump dies out.', fix: 'Low, then back to posture.' },
      ],
      deeper: { label: 'Power Posture (White Belt)', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'MIS-WB-018' },
    },
  ],
  review: {
    howItFeels: 'You feel you can generate speed forward on your backside using the face of the wave, with your chest open and your eyes already where you are going. You feel in control of your board and you are drawing your lines. The rhythm is yours: you decide when to take the wave’s energy and when to add your own.',
  },
};
