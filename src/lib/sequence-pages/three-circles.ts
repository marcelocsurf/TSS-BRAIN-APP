// ═══ THE THREE CIRCLES OF POWER — el curso de los fundamentos ═══
//
// Marcelo (2026-09-09): "es un sistema de los fundamentos: una vez parados,
// cómo ir de izquierda a derecha, cómo dibujar las líneas que queremos en
// la cara de la ola, con el entendimiento de los cuatro movimientos básicos
// (cuerpo), la posición de los pies y cómo conecto con mi tabla (tabla), y
// cómo funcionan las energías de la ola, fuerza interna y externa (ola). Al
// unirlos aprendemos a pintar, a fluir y a sentirnos en control: ahí ya
// estamos jugando." Decisiones: Think + Feel, SIN Do en cuerpo y tabla (el
// Do vive en las secuencias); solo la ola lleva juego; compresión-extensión
// en AMARILLO (es el motor de la proyección); reusar drills existentes.
//
// Fuentes: lección YB-FND-01 (3 Circles of Power), STP-017/018/019/021/022
// (White), STP-035 (FP1), STP-047 (Hold), doctrine_rules (Power Posture,
// hold: para qué / cómo se siente / hasta dónde; pies: FP = pie de atrás,
// pie de adelante centrado = neutro; pump y pies; juego ecológico).
import type { Command } from './types';

export interface CircleMove {
  key: string;
  command: Command;
  hold?: boolean;
  name: string;
  /** Una línea: qué es. */
  what: string;
  /** Cómo lo hace el cuerpo / qué entender. */
  think: string[];
  /** Cómo se siente (opcional). */
  feels?: string;
  /** Drills existentes para sentirlo fuera del agua. */
  feel: string[];
  /** Lección para ir más adentro. */
  lessonId: string;
  lessonLabel: string;
}

export interface Circle {
  key: 'body' | 'board' | 'wave';
  n: 1 | 2 | 3;
  label: string;
  sub: string;
  question: string;
  intro: string;
  moves?: CircleMove[];
  /** Tabla: posiciones del pie de atrás. */
  feet?: { pos: 'P1' | 'P2' | 'P3'; label: string; line: string; energy: string }[];
  frontFoot?: string[];
  /** Ola: lo que se lee. */
  reads?: { word: string; note: string }[];
  formula?: string;
  feel?: string[];
  game?: { name: string; image: string; rule: string; how: string };
  lessonId: string;
  lessonLabel: string;
}

export const CIRCLES_INTRO = {
  title: 'The Three Circles of Power',
  headline: 'Surfing is drawing lines on the face of the wave while keeping your speed. That is the game.',
  what: 'Once you are standing, the question is how you go left and right: how you draw the lines you want on the face. The Three Circles are what let you play that game. They give you the power to decide where you want to go and at what moment: to paint the line you want, to change direction, to keep the speed while you do it.',
  three: 'There are three: your body, your board and the wave. Each one holds a piece you cannot do without. Where the three overlap, you get flow — and when you put them together you are painting, flowing, in control, drawing on the face understanding the energies. At that point you are already playing.',
  when: 'The Three Circles switch on after the pop-up. Everything before that — paddling, prone, entry, passing waves — is diagnosed with the Block System, not with the circles.',
  language: 'This is also the language. The four movements of the body carry the colours you will see in every sequence: posture red, rotation on the rail green, compression and extension yellow (the engine of the projection), hold as a light-blue ring. Learn the colours here; the Infinite Circle adds the rest.',
  diagnose: [
    { circle: 'Body', q: 'My posture broke, I did not rotate, I compressed but never extended, I let the turn go.' },
    { circle: 'Board', q: 'I was in the wrong foot position for what I was asking of the board.' },
    { circle: 'Wave', q: 'I was off the pocket, I picked the wrong line, I read the section late.' },
  ],
};

export const CIRCLES: Circle[] = [
  {
    key: 'body', n: 1, label: 'Body', sub: 'P · R · C · H',
    question: 'How do I control my body and use it in my favour?',
    intro: 'Four movements. In the method they are called P·R·C·H: posture, rotation, compression and extension, hold. With them your body works to take you where you want to go, with stability. Here you understand them and you feel them on land; you execute them in the sequences.',
    lessonId: 'YB-FND-01', lessonLabel: '3 Circles of Power (the lesson)',
    moves: [
      {
        key: 'posture', command: 'posture', name: 'Posture',
        what: 'Stability and neutrality. The base you return to.',
        // Detalle completo de Marcelo (2026-09-09), regla "Power Posture" en doctrine_rules.
        think: [
          'Shoulders forward, pointing in the same direction as the nose of the board. That is the base: it connects you to the board and prepares the rotation.',
          'Weight on the front leg — it activates the position. Front foot centred on the stringer, toes across the board so toe and heel push the rails; back foot without weight.',
          'Front hand toward the nose (goofy: left; regular: right). The other arm holds the position: shoulder back activating the scapula so the chest points even more forward, elbow glued to the ribs, hand pointing down or back, opposite to the front hand. That is the exaggerated position.',
          'Flex — ideally toward 90 degrees, the maximum position. It can be less, but there must be flexion.',
          'Back knee forward, pointing where you want to go, following the direction. Weight stays on the front foot.',
          'Arms and hands active — slightly rigid with activation, not loose like spaghetti. Eyes forward, shoulders over the front foot.',
          'Exhale in the position: relaxed and active at the same time. Every action starts here and ends here.',
        ],
        feel: ['DRL-WB-018-A'],
        lessonId: 'STP-018', lessonLabel: 'Power Stance / Posture',
      },
      {
        key: 'rotation', command: 'rail', name: 'Rotation · the rail',
        what: 'Kinetic activation to engage and change your rails.',
        think: ['Eyes → head → shoulders → hips → the power travels down to your feet. It always starts with the eyes.', 'The oblique is what turns the lean into a real rotation and puts you on the rail.', 'Frontside and backside use the same chain with a different arm shape.'],
        feel: ['DRL-WB-022-A', 'DRL-WB-021-A'],
        lessonId: 'STP-022', lessonLabel: 'Turn Frontside · Turn Backside',
      },
      {
        key: 'compression', command: 'projection', name: 'Compression · extension',
        what: 'One movement with two halves: you compress to absorb and load, you extend to release and project.',
        think: ['Compressing without extending stores energy you never use.', 'Flex · touch · push · extend: from posture, the knees bend, the chest goes toward them, and the extension sends you forward.', 'This is the engine of the projection: what you load in a turn is what you spend on the next line.'],
        feel: ['DRL-WB-019-A'],
        lessonId: 'STP-019', lessonLabel: 'Impulse — Forward Momentum',
      },
      {
        key: 'hold', command: 'rail', hold: true, name: 'Hold',
        what: 'Keeping the position against the forces that show up. Starting a turn is not doing a turn.',
        think: ['Hold is the tool to keep positions: to navigate, to manage the energy and use it at the right moment.', 'It is also knowing how far: when you rotate, understand up to what point you can keep leaning — and there you hold. You do not keep leaning if you are going to fall. Understand until when, and at that point you wait.'],
        feels: 'In a bottom turn you feel the centrifugal force that wants to take you to the flat. The rail of your board and the fins let you fight that force, and the position of your body holds the energy so you can redirect it where you want, projecting it toward the line you want to draw. Those are the G forces you feel when you hold.',
        feel: ['DRL-BB-047'],
        lessonId: 'STP-047', lessonLabel: 'Hold',
      },
    ],
  },
  {
    key: 'board', n: 2, label: 'Board', sub: 'where your feet go',
    question: 'How do I connect with my board so it becomes an extension of my body?',
    intro: 'The feet are how you connect: how you make the board do what you want, so it stops being an object you manage and answers to Circle 1. Where you put the back foot decides the line you can draw, the energy and the speed you can generate. Where you put the front foot decides how the rails answer to your weight.',
    lessonId: 'STP-035', lessonLabel: 'Foot Position 1 (FP1)',
    feet: [
      { pos: 'P1', label: 'P1 · full tail', line: 'The tightest turns. The tail stays live so a turn can come out of anything.', energy: 'Maximum control and manoeuvrability, least speed.' },
      { pos: 'P2', label: 'P2 · neutral', line: 'The balance point: ready for whatever comes next.', energy: 'Stability and speed. Your default.' },
      { pos: 'P3', label: 'P3 · forward', line: 'Long, fast lines. Where you go when speed is the only job.', energy: 'Acceleration, drive and projection. The pumping position. Far less manoeuvrability.' },
    ],
    frontFoot: [
      'The front foot lands centred across the board, on the stringer. That is the neutral position: you can press the same with the tips of your toes and with the heel.',
      'The closer your foot is to a rail, the more that rail sinks as soon as you put weight forward — because of where the foot is, not because you wanted it.',
      'Done with awareness it is a tool: on a longboard, in a tube, on a shortboard you sometimes want exactly that. The point is to have the idea and the consciousness to do it when you want, the way you want.',
      'FP1, FP2 and FP3 always describe the back foot. The front foot is about centre and rails.',
      'The rule that surprises people: no matter how good your body mechanics are, if your feet are in the wrong place the turn will not work. Circle 1 cannot rescue Circle 2.',
    ],
    feel: ['DRL-BB-035', 'DRL-BB-035-02'],
  },
  {
    key: 'wave', n: 3, label: 'Wave', sub: 'the two energies',
    question: 'How do I understand the wave’s energy and use it in my favour?',
    intro: 'This circle is where the two forces meet: the energy of the wave (external force) and what your body generates with the movements (internal force). When they communicate, you use them in harmony — and the line you can draw is the result.',
    lessonId: 'STP-033', lessonLabel: 'Reading Wave Stages 1–4',
    formula: 'The wave’s energy (external force) × what your body generates (internal force) = the line you can draw.',
    reads: [
      { word: 'Energy', note: 'The power and momentum living in the section. Highest at the pocket, lowest at the flat.' },
      { word: 'Direction', note: 'The line you choose and the angle you take across the face.' },
      { word: 'Section', note: 'Reading where the wave is going to let you express next.' },
      { word: 'Pocket', note: 'The sweet spot. The closer you ride to it, the more speed you get; the closer your turns are to the breaking part, the more radical your surfing becomes.' },
      { word: 'The flat', note: 'Where the energy ends. Go there and the wave stops giving.' },
    ],
    feel: ['DRL-YB-033', 'DRL-YB-028'],
    game: {
      name: 'The flat is fire',
      image: 'The face of the wave is your canvas and the flat, down there, is fire.',
      rule: 'Ride close to the pocket, move away, come back — as many times as you want. Touch the flat and you lost. Each wave is a new round.',
      how: 'No counting, no scoring. The wave is the referee. If you want it harder, the fire rises: the lower third of the face burns too.',
    },
  },
];
