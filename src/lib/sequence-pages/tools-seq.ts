// ═══ Forward Momentum como HERRAMIENTA de toda cinta (Marcelo 2026-09-30) ═══
// "Sí, así los 3 momentos." No es una secuencia: es un fundamento de toda
// cinta (salió de White #3 el 2026-09-24 y vive como la lección STP-019 en
// "Tools"). kind 'tool' = la misma página de 4 pestañas, que el coach receta
// con "+ another sequence today" en CUALQUIER cinta.
//
// Reglas (resolve.ts, SessionPlanner, DayCloseCard, service-planner):
//  · nunca se resuelve por pasos: solo con sequence_id 'TOOL-MOMENTUM';
//  · nunca es la línea del alumno ni la de mañana: se AGREGA al día;
//  · no está en Let's Play (STP-019 sigue SIN wb_sequence_id): se registra
//    con sus misiones (?drill=MIS-…), que mueven la estrella de STP-019;
//  · la estrella del cierre cae en STP-019 (Marcelo: sí), como Circle 1 · Body.
// Lo que se receta: la misión completa (los tres momentos, en UNA ola) o un
// momento suelto: después del pop-up o después de una maniobra. El momento 3
// (cuando perdés velocidad) va SOLO dentro de la completa (Marcelo 2026-09-30).
// Los textos salen de la lección STP-019, del Forward Momentum Drill
// (DRL-WB-019-A) y de lo que Marcelo dictó el 2026-09-30.
import type { Indicator, SequencePageConfig } from './types';

/** El cuerpo, igual en los tres momentos: los criterios del Forward Momentum
 *  Drill, tal cual (son los mismos de las misiones), con los errores y las
 *  correcciones de la lección y de la capa del coach. */
const BODY: Indicator[] = [
  { ok: 'Flex: knees bend, chest drops toward them.', no: 'No leg flexion; the chest does not move forward.', fix: 'Flex first. Then touch.' },
  { ok: 'Touch: one or both hands reach down and touch the water.', no: 'The hands go down before the knees bend.', fix: 'Chest to the knees first, then the hands reach down.' },
  { ok: 'Push: the hands push against the water — a real push, not a half-touch.', no: 'Half movement with no real push.', fix: 'Full push.' },
  { ok: 'Extend forward: body and legs spring ahead — forward, not up.', no: 'The body pops upward and the board does not gain speed.', fix: 'Forward, not up.' },
];

// El MISMO título en elements (lo que elige el coach en el planner) y en
// details (lo que abre la página): detailForFocus los empareja por palabras.
// Sin " · " ni número adelante (stripStep y shortMoment cortan ahí).
const POPUP = 'Right after the pop-up';
const MANEUVER = 'After a maneuver';
const SPEED = 'When you lose speed or get stuck';

export const TOOL_MOMENTUM: SequencePageConfig = {
  id: 'TOOL-MOMENTUM',
  kind: 'tool',
  eyebrow: 'Tools · every belt',
  belt: 'white_belt',
  courseKey: 'white_belt',
  // Toda cinta: quien tiene solo Yellow o solo Blue también la abre.
  alsoCourseKeys: ['yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'],
  number: 0,
  title: 'Forward Momentum',
  stepIds: ['STP-019'],
  // Lo que el coach puede recetar suelto: dos momentos. El tercero vive solo
  // dentro de la misión completa ("All three moments").
  elements: [
    { id: 'TOOL-MOMENTUM:POPUP', title: POPUP, stepId: 'STP-019' },
    { id: 'TOOL-MOMENTUM:MANEUVER', title: MANEUVER, stepId: 'STP-019' },
  ],
  // Una mano o dos se dice EN el paso Touch (sin selector Backside · Frontside:
  // es la misma técnica).
  chain: [
    { title: 'Flex', note: 'knees bend, chest drops toward them' },
    { title: 'Touch', note: 'one hand, mostly frontside · two hands backside, or whenever you are stuck in the foam and need speed' },
    { title: 'Push', note: 'a real push, not a half-touch' },
    { title: 'Extend forward', note: 'forward, not up' },
    { title: 'Back to posture' },
  ],
  think: {
    whatIs: {
      headline: 'The speed and energy you create and then carry, so the board keeps flowing instead of stalling.',
      line: 'Flex and push yourself forward — one hand, mostly frontside; two hands backside, or whenever you are stuck in the foam and need speed — then back to posture.',
      where: 'Three moments, at every belt: right after the pop-up · after a maneuver · whenever you lose speed or get stuck in the water or the foam.',
      whatFor: 'When the wave dies or the foam slows, your ride dies — unless you generate forward momentum. Without momentum, technique dies; with it, every maneuver that comes later becomes possible.',
    },
    bodyFromLesson: 'STP-019',
    // La lección no separa "The rules…" ni tiene "## Common mistakes", y su
    // "How your body does it" mezcla indicadores y notas: el cuerpo y las
    // reglas de la herramienta viven acá (de la lección y del drill).
    bodyMarkdown: `**The movement**

1. **Flex.** Knees bend, chest drops toward them.
2. **Touch.** One or both hands reach down and touch the water.
3. **Push.** The hands push against the water — a real push, not a half-touch.
4. **Extend forward.** Body and legs spring ahead — forward, not up.
5. **Back to posture.**

**One hand or two**

- **One hand** — mostly frontside: touch the water with your leading hand and push yourself forward.
- **Two hands** — backside, or whenever you are stuck in the foam and need speed: grab the water and push yourself forward.

Flexion stores energy, extension releases it ahead, and the board regains speed and stability instead of stalling.`,
    rulesMarkdown: `- A fundamental: the same technique at every belt, and it belongs to no sequence.
- Three moments: right after the pop-up · after a maneuver, to finish it · whenever you lose speed or get stuck in the water or the foam.
- One hand, mostly frontside. Two hands backside, or whenever you are stuck in the foam.
- A real push, not a half-touch. Extend forward, not up.
- Every time, back to posture.
- The drill is dry-land from posture; the mission is in the water.`,
    keyWords: [{ label: 'The 5 words', words: ['Flex', 'Touch', 'Push', 'Extend', 'Momentum'] }],
  },
  feel: {
    visualize: 'See yourself right after the pop-up, after a maneuver, and on a slowing board: flex, touch, push, extend — momentum returns. Watch legs bend, chest forward, real push, full extension.',
    land: ['DRL-WB-019-A'],
    skate: [],
  },
  do: {
    result: 'One wave where you use the momentum at every moment the wave gives you: right after the pop-up, after your maneuver, and whenever the board loses speed or gets stuck in the water or the foam.',
    // La misión COMPLETA (MIS-WB-019-A reescrita, display_order 1: es la que
    // evalúa el paso STP-019).
    missionId: 'MIS-WB-019-A',
    timing: 'Right after the pop-up · as your maneuver ends · the moment the board loses speed or gets stuck.',
    competence: 'Three waves across three sessions where you use it at every moment and the board accelerates. If you can execute it and you feel comfortable, it is yours.',
  },
  details: [
    {
      key: 'popup',
      title: POPUP,
      symptom: 'You pop up and the wave starts without the push forward.',
      indicators: [
        { ok: 'Right after the pop-up you push yourself forward.', no: 'You pop up and do not use it.', fix: 'Pop-up, then momentum.' },
        ...BODY,
      ],
      deeper: { label: 'Forward Momentum', lessonId: 'STP-019', drillId: 'DRL-WB-019-A', missionId: 'MIS-WB-019-B' },
    },
    {
      key: 'maneuver',
      title: MANEUVER,
      symptom: 'The maneuver ends and the momentum is not used to finish it.',
      indicators: [
        { ok: 'After your maneuver, the momentum finishes it and you are back in posture.', no: 'The maneuver ends without the momentum.', fix: 'Finish it: momentum, back to posture.' },
        ...BODY,
      ],
      deeper: { label: 'Forward Momentum', lessonId: 'STP-019', drillId: 'DRL-WB-019-A', missionId: 'MIS-WB-019-C' },
    },
    {
      // Solo dentro de la misión completa: sin misión propia.
      key: 'speed',
      title: SPEED,
      symptom: 'The board loses speed or gets stuck in the water or the foam, and the tool is not used.',
      indicators: [
        { ok: 'When the board loses speed or gets stuck, you fire it on your own — two hands when you are stuck in the foam.', no: 'Not using the tool when speed is needed.', fix: 'Momentum. Touch the water. Push forward.' },
        ...BODY,
      ],
      deeper: { label: 'Forward Momentum', lessonId: 'STP-019', drillId: 'DRL-WB-019-A' },
    },
  ],
  review: { howItFeels: 'After each push the board regains speed and stability instead of stalling.' },
};

/** ¿Es una herramienta (toda cinta, fuera de las secuencias)? */
export const isToolPage = (c: { kind?: string } | null | undefined): boolean => c?.kind === 'tool';
