// ═══ Los Tres Círculos como SECUENCIAS (Marcelo 2026-09-19) ═══
// Hasta ahora eran una lista de seis juegos. Ahora cada círculo es una
// secuencia con el mismo molde que #3 o #8: el paso es el elemento (Posture,
// Rotation…), el juego es su Do it, y las estrellas caen en la lección real
// (STP-018 Power Posture, STP-022 Turn, STP-019 Forward Momentum, STP-047
// Hold, STP-035 Foot Position, STP-033 Reading Wave Stages). Así la plantilla,
// el plan, el cierre y la evaluación final los tratan igual que a una
// secuencia. Las páginas /circles y los juegos no cambian: se conectan.
import type { SequencePageConfig } from './types';

const ind = (ok: string, no: string, fix: string) => [{ ok, no, fix }];

export const CIRCLE_BODY: SequencePageConfig = {
  id: 'CIRCLE-BODY',
  kind: 'circle',
  eyebrow: 'The Three Circles · 1 of 3',
  belt: 'yellow_belt',
  courseKey: 'yellow_belt',
  number: 1,
  title: 'Circle 1 · Body',
  stepIds: ['STP-018', 'STP-022', 'STP-019', 'STP-047'],
  games: { 'STP-018': 'GAME-3C-POSTURE', 'STP-022': 'GAME-3C-RAIL', 'STP-019': 'GAME-3C-COMPACT', 'STP-047': 'GAME-3C-HOLD' },
  think: {
    whatIs: { headline: 'How do I control my body and use it in my favour?', line: 'Four movements: posture, rotation, compression and extension, hold. P · R · C · H.', where: 'After the pop-up, on every wave.', whatFor: 'With them your body takes you where you want to go, with stability.' },
    bodyFromLesson: 'YB-FND-01',
    keyWords: [{ label: 'P · R · C · H', words: ['posture', 'rotation', 'compression', 'hold'] }],
  },
  feel: { visualize: 'Stand in posture. Eyes, head, shoulders, hips: the rotation travels down. Flex, touch, push, extend. And hold the position against the force.', land: ['DRL-WB-018-A', 'DRL-WB-022-A', 'DRL-WB-019-A', 'DRL-BB-047'], skate: [] },
  do: { result: 'Play the four games of the body, one per element. The wave is the referee.', missionId: 'GAME-3C-POSTURE', timing: 'One element per session, or the whole circle across a week.', competence: 'Each game at 4★.' },
  details: [
    { key: 'posture', command: 'posture', title: 'Posture', symptom: 'Standing tall, weight back, loose arms.', indicators: ind('Shoulders to the nose, weight on the front leg, flexed, back knee forward, arms active.', 'Tall, weight back, spaghetti arms.', 'Shoulders · weight · knee · compact · exhale.'), deeper: { label: 'Power Stance / Posture', lessonId: 'STP-018', drillId: 'DRL-WB-018-A', missionId: 'GAME-3C-POSTURE' } },
    { key: 'rotation', command: 'rail', title: 'Rotation · the rail', symptom: 'You lean but the board does not change rail.', indicators: ind('Eyes → head → shoulders → hips: the oblique turns the lean into a rotation and puts you on the rail.', 'You lean from the waist; the board runs straight.', 'Look where you want to go; the oblique turns you.'), deeper: { label: 'Turn Frontside · Turn Backside', lessonId: 'STP-022', drillId: 'DRL-WB-022-A', missionId: 'GAME-3C-RAIL' } },
    { key: 'compression', command: 'projection', title: 'Compression · extension', symptom: 'You compress and never extend; the board dies.', indicators: ind('Flex, touch, push, extend: what you load, you spend on the next line.', 'You stay low or stay tall; no projection.', 'Flex · touch · push · extend.'), deeper: { label: 'Forward Momentum', lessonId: 'STP-019', drillId: 'DRL-WB-019-A', missionId: 'GAME-3C-COMPACT' } },
    { key: 'hold', command: 'rail', title: 'Hold', symptom: 'You start the turn and let it go; the line breaks.', indicators: ind('You keep the lean and the line until the moment you chose to release.', 'You fall out of the turn early or over-lean and fall.', 'Understand how far; there, hold.'), deeper: { label: 'Hold', lessonId: 'STP-047', drillId: 'DRL-BB-047', missionId: 'GAME-3C-HOLD' } },
  ],
  review: { howItFeels: 'Your body answers before you think: posture, rotation, compression, hold.' },
};

export const CIRCLE_BOARD: SequencePageConfig = {
  id: 'CIRCLE-BOARD',
  kind: 'circle',
  eyebrow: 'The Three Circles · 2 of 3',
  belt: 'yellow_belt',
  courseKey: 'yellow_belt',
  number: 2,
  title: 'Circle 2 · Board',
  stepIds: ['STP-035'],
  games: { 'STP-035': 'GAME-3C-BUTTON' },
  // Lo que se planea y lo que se rompe en la tabla (Marcelo 2026-09-21).
  elements: [
    { id: 'CIRCLE-BOARD:P1', title: 'Back foot · P1 (tail)', stepId: 'STP-035' },
    { id: 'CIRCLE-BOARD:P2', title: 'Back foot · P2 (centre)', stepId: 'STP-035' },
    { id: 'CIRCLE-BOARD:P3', title: 'Back foot · P3 (forward)', stepId: 'STP-035' },
    { id: 'CIRCLE-BOARD:FRONT', title: 'Front foot · centred', stepId: 'STP-035' },
  ],
  think: {
    whatIs: { headline: 'How do I connect with my board so it becomes an extension of my body?', line: 'Where your back foot goes decides the line, the energy and the speed you can generate.', where: 'Before every turn.', whatFor: 'P1 for the tightest turns, P2 the default, P3 for speed.' },
    feet: { text: 'Three buttons on the board: P1 full tail, P2 neutral, P3 forward.', options: [{ back: 'P1', label: 'P1 · full tail', tradeoff: 'Maximum control, least speed.' }, { back: 'P2', label: 'P2 · neutral', tradeoff: 'Stability and speed. Your default.' }, { back: 'P3', label: 'P3 · forward', tradeoff: 'Acceleration and drive. Far less manoeuvrability.' }], rule: 'Press the button before anything else.', recommended: [] },
    bodyFromLesson: 'STP-035',
    keyWords: [{ label: 'Buttons', words: ['P1', 'P2', 'P3'] }],
  },
  feel: { visualize: 'Three buttons on the board. Before anything else, press the one the next line needs.', land: ['DRL-BB-035'], skate: [] },
  do: { result: 'Press the Button: before every line, your back foot lands on the button you chose.', missionId: 'GAME-3C-BUTTON', timing: 'One session; comes back in every sequence.', competence: 'The game at 4★.' },
  details: [
    { key: 'button', command: 'posture', title: 'Foot position · P1 · P2 · P3', symptom: 'The foot lands wherever; the board decides the line.', indicators: ind('You choose P1, P2 or P3 before the line and the foot lands there.', 'Off-centre or floating between buttons.', 'Say the button, then press it.'), deeper: { label: 'Foot Position 1 (FP1)', lessonId: 'STP-035', missionId: 'GAME-3C-BUTTON' } },
  ],
  review: { howItFeels: 'The board answers to your feet, not the other way around.' },
};

export const CIRCLE_WAVE: SequencePageConfig = {
  id: 'CIRCLE-WAVE',
  kind: 'circle',
  eyebrow: 'The Three Circles · 3 of 3',
  belt: 'yellow_belt',
  courseKey: 'yellow_belt',
  number: 3,
  title: 'Circle 3 · Wave',
  stepIds: ['STP-033'],
  games: { 'STP-033': 'GAME-3C-POCKET-FOAM' },
  // Lo que se rompe en la ola (Marcelo 2026-09-21).
  elements: [
    { id: 'CIRCLE-WAVE:SPEED', title: 'Lost speed', stepId: 'STP-033' },
    { id: 'CIRCLE-WAVE:FAR', title: 'Too far from the pocket', stepId: 'STP-033' },
    { id: 'CIRCLE-WAVE:FLAT', title: 'Went to the flat', stepId: 'STP-033' },
  ],
  think: {
    whatIs: { headline: 'Where is the energy, and how do I use it?', line: 'Two energies: the pocket and the foam. Move away, come back, touch the foam without getting eaten, get back to the wall.', where: 'On the face, every wave.', whatFor: 'This is the general game: it makes you use the body and the board at once.' },
    bodyFromLesson: 'STP-033',
    keyWords: [{ label: 'The two energies', words: ['pocket', 'foam'] }],
  },
  feel: { visualize: 'See the pocket and the foam as two engines. You leave one, you come back to it, you touch the other and you are back on the wall.', land: [], skate: [] },
  do: { result: 'Pocket and Foam: play with the two energies without getting eaten and without falling.', missionId: 'GAME-3C-POCKET-FOAM', timing: 'Every session once the body and the board answer.', competence: 'The game at 4★.' },
  details: [
    { key: 'energies', command: 'projection', title: 'The two energies · pocket and foam', symptom: 'You stay in one place; the foam eats you or the wall leaves you behind.', indicators: ind('You move away from the pocket, come back, touch the foam and return to the wall, in control.', 'Stuck on the shoulder, or eaten by the foam.', 'Read where the energy is; go and come back.'), deeper: { label: 'Reading Wave Stages 1–4', lessonId: 'STP-033', missionId: 'GAME-3C-POCKET-FOAM' } },
  ],
  review: { howItFeels: 'You are drawing on the face, using the energies instead of fighting them.' },
};

export const CIRCLE_SEQUENCES = [CIRCLE_BODY, CIRCLE_BOARD, CIRCLE_WAVE];
export function isCircleSequence(id: string | null | undefined): boolean { return id === 'CIRCLE-BODY' || id === 'CIRCLE-BOARD' || id === 'CIRCLE-WAVE'; }

/** Nombre del ELEMENTO de un círculo para un paso (Posture, Rotation…); para
 *  secuencias normales devuelve el fallback (el título de la lección). */
export function elementTitle(cfg: SequencePageConfig | null | undefined, stepId: string | null | undefined, fallback: string | null): string | null {
  if (!cfg || !stepId) return fallback;
  const sub = cfg.elements?.find((e) => e.id === stepId);
  if (sub) return sub.title;
  if (cfg.kind !== 'circle') return fallback;
  return cfg.details.find((d) => d.deeper?.lessonId === stepId)?.title ?? fallback;
}

/** Los elementos que se pueden planear o romper en una secuencia: los
 *  sub-elementos de un círculo de un solo paso, o sus pasos. */
export function sequenceElements(cfg: SequencePageConfig, titleOf: (stepId: string) => string | null): { id: string; title: string }[] {
  if (cfg.elements?.length) return cfg.elements.map((e) => ({ id: e.id, title: e.title }));
  return cfg.stepIds.map((id) => ({ id, title: elementTitle(cfg, id, titleOf(id)) ?? id }));
}

/** ¿Este id es un paso o un sub-elemento de la secuencia? */
export function isElementOf(cfg: SequencePageConfig | null | undefined, id: string | null | undefined): boolean {
  if (!cfg || !id) return false;
  return cfg.stepIds.includes(id) || !!cfg.elements?.some((e) => e.id === id);
}
