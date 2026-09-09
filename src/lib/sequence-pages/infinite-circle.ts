// ═══ THE INFINITE CIRCLE — el curso teórico del lenguaje ═══
//
// Marcelo (2026-09-09): "que entremos en más detalle y lo dividamos en
// backside y frontside; dentro de cada uno repasar los pasos… así se
// introduce con detalle de qué se trata el Infinite Circle y se deja claro,
// antes de entrar a las secuencias, cuál será el lenguaje; ahí agregar el
// código de colores de cada acción". Es un curso de CONCEPTOS, no de
// aplicación: el alumno ya viene de los 3 Círculos de Poder (postura,
// rotación, compresión, hold) y acá se le presentan proyección, Cruz,
// granada, choke, tapaloco y codazo.
//
// Fuentes: lección BB-FND-INF, YB-FND-01 (3 círculos), lecciones STP-018,
// 039, 039B, 040, 041, 042, 043, 044, 045, 047, 049, canon "Block System &
// Infinite Circle" (bloques 4-7 cíclicos) y doctrine_rules (cadena del BT,
// oblicuo a los dos lados, línea del snap, la M es el cuerpo, codazo).
import type { Command, WaveBoardData } from './types';

export interface LoopStep {
  key: string;
  /** Comando del método (da el color). */
  command: Command;
  /** Capa celeste: esta posición se sostiene. */
  hold?: boolean;
  /** Nombre en el lenguaje del método. */
  name: string;
  /** Qué palabra del método es (para la etiqueta). */
  commandLabel: string;
  /** Ya lo tenés de los 3 Círculos, o es nuevo en Blue. */
  known: 'three-circles' | 'new';
  whatIs: string;
  body: string[];
  keyWords: string[];
  /** La lección del paso, para ir más adentro. */
  lessonId: string;
  lessonLabel: string;
}

export interface LoopSide {
  key: 'fs' | 'bs';
  label: string;
  sub: string;
  chain: string;
  steps: LoopStep[];
  board: WaveBoardData;
}

export const LOOP_INTRO = {
  title: 'The Infinite Circle',
  headline: 'Once you are up and riding, all maneuver surfing is one pattern that repeats.',
  what: 'Posture → rotation on the rail (the bottom turn, and you hold it) → projection → maneuver → back to posture. Then again. Every sequence of Blue Belt is this loop, with a different maneuver in the middle. That is why it is called infinite: each time you return to posture you can rotate again, project again and express again — as many times as the wave allows.',
  why: 'White Belt = survive and stand up. Yellow Belt = ride one clean line. Blue Belt = link maneuvers infinitely. The Infinite Circle is that link, and this page is the language you will use in every sequence from here on.',
  before: 'Before the loop there is an entry that happens once per wave: sweet spot → chase the wave → paddling angle → cobra + pick your line → pop-up + feet. You already own it. The loop starts the moment you are standing.',
  known: [
    { word: 'Posture', note: 'Your stable base. Every action starts and ends here. Chest to the nose, low, weight on the front foot, scapula active.' },
    { word: 'Rotation', note: 'Eyes → head → shoulders → hips → feet. It always starts with the eyes. It is how you engage and change a rail.' },
    { word: 'Compression · extension', note: 'One movement, two halves: compress to absorb and load, extend to release and project.' },
    { word: 'Hold', note: 'The tool that keeps a position: to navigate, to manage the energy and use it at the right moment. In a bottom turn you feel the centrifugal force pulling you to the flat; the rail and the fins fight it, and your body position holds the energy so you can redirect it toward the line you want to draw. Starting a turn is not doing a turn.' },
  ],
  newWords: [
    { word: 'Projection', note: 'The moment the energy loaded in the bottom turn becomes forward and upward speed toward the maneuver.' },
    { word: 'The Cruz', note: 'The frontside maneuver: from the projection back to posture, then an aggressive rail change with the oblique — head leading like the nose of a plane, hands as the wings.' },
    { word: 'Grenade', note: 'The frontside closure: you throw the leading arm and extend out of the Cruz, back to posture.' },
    { word: 'Choke', note: 'The backside projection: legs extend while the arm crosses the waist like grabbing a sword from the other side.' },
    { word: 'Tapaloco', note: 'The backside rail change: the hand, palm up, goes over the head covering the opposite ear.' },
    { word: 'Elbow strike · the M', note: 'The backside closure: one elbow strikes up, the other arm receives; back and both elbows make an M with your body.' },
  ],
  colours: [
    { command: 'posture' as Command, label: 'Posture', note: 'start and end of every cycle' },
    { command: 'rail' as Command, label: 'Rotation / rail', note: 'bottom turn, rail change' },
    { command: 'projection' as Command, label: 'Projection', note: 'extend, speed toward the maneuver' },
    { command: 'maneuver' as Command, label: 'Maneuver', note: 'the Cruz frontside · the Tapaloco backside' },
    { command: 'closure' as Command, label: 'Closure', note: 'the Grenade frontside · the elbow strike backside' },
  ],
  diagnose: [
    { block: 'Posture', q: 'Is the base collapsing? Standing tall, weight back, chest away from the nose?' },
    { block: 'Rotation / rail', q: 'Is the rotation incomplete? Is the rail not engaging? Did you let the bottom turn go instead of holding it?' },
    { block: 'Projection', q: 'Is there no projection? Drifting without direction, legs never extending?' },
    { block: 'Maneuver', q: 'Is the maneuver failing because the step before it was incomplete? The block before the failure is usually where the real problem lives.' },
    { block: 'Back to posture', q: 'Is speed lost because you never return to posture? Then there is no next cycle.' },
  ],
};

// Una vuelta del círculo sobre la cara: postura a media cara → U del bottom
// turn (riel, sostenido) → proyección hacia arriba → maniobra arriba →
// cierre bajando → postura de nuevo, y arranca la segunda vuelta.
const LOOP_BOARD: WaveBoardData = {
  pocket: { x: 90, y: 70 },
  segments: [
    { d: 'M120,150 C132,150 142,158 152,172', command: 'posture' },
    { d: 'M152,172 C170,205 200,232 240,232 C262,232 278,220 292,200', command: 'rail', hold: true },
    { d: 'M292,200 C310,170 330,120 352,86', command: 'projection' },
    { d: 'M352,86 C362,72 378,64 396,66 C412,68 420,80 416,94', command: 'maneuver' },
    { d: 'M416,94 C408,116 400,134 398,148', command: 'closure' },
    { d: 'M398,148 C410,150 420,158 430,172', command: 'posture' },
    { d: 'M430,172 C448,205 478,232 518,232 C540,232 556,220 570,200', command: 'rail', hold: true },
    { d: 'M570,200 C588,170 608,120 630,86', command: 'projection' },
  ],
  markers: [
    { x: 120, y: 150, label: 'I' },
    { x: 240, y: 232, label: 'B' },
    { x: 396, y: 66, label: 'M' },
    { x: 398, y: 148, label: 'S' },
  ],
};

export const LOOP_SIDES: LoopSide[] = [
  {
    key: 'fs',
    label: 'Frontside',
    sub: 'chest to the wave',
    chain: 'Posture · Rotation + hold (bottom turn) · Projection · Cruz · Grenade · Back to posture',
    board: LOOP_BOARD,
    steps: [
      {
        key: 'posture', command: 'posture', name: 'Posture', commandLabel: 'Posture', known: 'three-circles',
        whatIs: 'Your stable base. Every cycle of the circle starts here and ends here.',
        body: ['Chest to the nose, low.', 'Front foot centred on the stringer, toes across the board; weight on the front foot, back foot without weight.', 'Back knee pointing toward the nose from the hip. Scapula active.', 'Reach and cross: the shoulders point where the board goes.'],
        keyWords: ['Chest', 'Low', 'Front foot', 'Scapula'],
        lessonId: 'STP-018', lessonLabel: 'Power Stance / Posture (White Belt)',
      },
      {
        key: 'bt', command: 'rail', hold: true, name: 'Rotation + hold · the bottom turn', commandLabel: 'Rotation / rail', known: 'three-circles',
        whatIs: 'The most important concept in surfing: where you turn speed into direction and load the energy for everything that follows. It is always a U, and it ends when the projection begins. There are different depths — some longer, some tighter; mid-face, almost at the flat, or even out onto the flat — depending on what you are going to execute and the angle you want to reach. The U sets you up for what comes next. You hold it: starting a turn is not doing a turn.',
        body: ['Weight front.', 'Elbow and forearm to the water — the whole forearm goes low, not just the fingers.', 'Palm down.', 'Oblique — that is what turns the lean into a real rotation and puts you on the rail.', 'Hold. You feel the centrifugal force pulling you to the flat; rail, fins and your body position hold that energy so you can project it toward the line you want. The bottom turn ends when the projection begins; there is no gap.'],
        keyWords: ['Weight front', 'Elbow and forearm to the water', 'Palm down', 'Oblique', 'Hold'],
        lessonId: 'STP-039', lessonLabel: 'Bottom Turn Medium — Frontside',
      },
      {
        key: 'projection', command: 'projection', name: 'Projection', commandLabel: 'Projection', known: 'new',
        whatIs: 'The energy stored in the bottom turn becomes forward and upward speed toward the maneuver. It fires immediately after the bottom turn.',
        body: ['Legs extend — the chain reaction from the compression of the bottom turn.', 'Chest aligns toward where the maneuver will happen; the shoulders point.', 'Only the leading arm projects. The back arm stays in posture: scapula active and pulled back, elbow glued to the ribs.', 'Weight stays forward the whole time.'],
        keyWords: ['Extend', 'Align', 'Point', 'Weight forward'],
        lessonId: 'STP-040', lessonLabel: 'Projection',
      },
      {
        key: 'cruz', command: 'maneuver', name: 'The Cruz', commandLabel: 'Maneuver', known: 'new',
        whatIs: 'The frontside maneuver: the transition from the projection to an aggressive rail change. Coming from the projection you enter the Cruz, which is basically returning to posture, and from there you change the rail with the oblique. The line: a long U through the middle of the face, then the rail change pointing down but not straight to the flat — to the side, to keep running the face. It does not need the lip.',
        body: ['Back to posture first: weight stays on the front foot.', 'Eyes over the shoulder to where you want to go.', 'The oblique works the other way now — the same muscle that took you into the bottom turn changes the rail here (rotation and its rules).', 'The front leg extends while the body stays forward over the front foot — like an airplane: the head is the nose leading, the hands are the wings.', 'The hand crosses (goofy left, regular right); the rail tilts and changes. The Cruz without a rail change is not a maneuver.'],
        keyWords: ['Posture', 'Eyes over the shoulder', 'Oblique', 'Front leg', 'Airplane', 'Rail change'],
        lessonId: 'STP-041', lessonLabel: 'Cruz Snap',
      },
      {
        key: 'grenade', command: 'closure', name: 'Grenade', commandLabel: 'Closure', known: 'new',
        whatIs: 'The explosive release that closes the Cruz and brings you back to posture — like throwing a grenade.',
        body: ['From the Cruz: explode up and forward; throw the leading arm.', 'Extend the legs fully, with the rail still engaged — otherwise the closure does not convert.', 'Land back in posture: hips down, chest over the front knee. Low finish.', 'Ready for the next cycle immediately.'],
        keyWords: ['Explode', 'Throw', 'Extend', 'Return', 'Low'],
        lessonId: 'STP-042', lessonLabel: 'Grenade',
      },
      {
        key: 'back', command: 'posture', name: 'Back to posture', commandLabel: 'Posture', known: 'three-circles',
        whatIs: 'You close the circle where it started. If you are back in posture, the wave can give you another cycle.',
        body: ['Same posture you started from: low, weight on the front foot, chest to the nose.', 'Eyes already on the next section.'],
        keyWords: ['Posture'],
        lessonId: 'STP-018', lessonLabel: 'Power Stance / Posture (White Belt)',
      },
    ],
  },
  {
    key: 'bs',
    label: 'Backside',
    sub: 'back to the wave',
    chain: 'Posture · Rail rotation + hold (bottom turn backside) · Projection (Choke) · Tapaloco · Elbow strike, the M · Back to posture',
    board: LOOP_BOARD,
    steps: [
      {
        key: 'posture', command: 'posture', name: 'Posture', commandLabel: 'Posture', known: 'three-circles',
        whatIs: 'Same base as frontside, with the backside orientation: chest open toward the wave, eyes over the back shoulder.',
        body: ['Chest to the nose, low, weight on the front foot.', 'Chest rotates open toward the wave face, not toward the shore.', 'Eyes lead over the back shoulder toward where you are going.', 'Oblique engaged on the back side of the body.'],
        keyWords: ['Chest open', 'Eyes over the shoulder', 'Low', 'Front foot'],
        lessonId: 'STP-038', lessonLabel: 'BS Body Mechanics',
      },
      {
        key: 'bt', command: 'rail', hold: true, name: 'Rail rotation + hold · the bottom turn backside', commandLabel: 'Rotation / rail', known: 'three-circles',
        whatIs: 'The same U — as deep, as long or as tight as what comes next asks for — with a different arm shape. It ends when the Choke begins. It is the entry to the whole backside expression: the Choke, the Tapaloco and the elbow strike live on the speed and the angle this turn creates.',
        body: ['Weight front.', 'Front arm at shoulder height, aimed where you are going.', 'Fingertips skimming the water (frontside the whole forearm drops; backside the arm stays high and only the fingertips graze).', 'Oblique, and hold: fight the centrifugal force with rail, fins and body position, keep the energy for the Choke. The bottom turn ends when the Choke begins.'],
        keyWords: ['Weight front', 'Front arm', 'Fingertips', 'Oblique', 'Hold'],
        lessonId: 'STP-039B', lessonLabel: 'Bottom Turn Medium — Backside',
      },
      {
        key: 'choke', command: 'projection', name: 'Projection · the Choke', commandLabel: 'Projection', known: 'new',
        whatIs: 'The backside projection. Speed through extension plus the choke movement, while the chest rotates toward the maneuver.',
        body: ['Legs extend — the chain reaction from the bottom turn.', 'The arm crosses over the waist (goofy left, regular right) as if grabbing a sword from the other side.', 'The chest rotates toward the maneuver; the nose of the board points where the shoulders point.', 'Weight stays forward; scapula active. The Choke ends when the Tapaloco begins.'],
        keyWords: ['Cross', 'Extend', 'Chest', 'Shoulders', 'Point'],
        lessonId: 'STP-043', lessonLabel: 'Choke (BS Projection)',
      },
      {
        key: 'tapaloco', command: 'maneuver', name: 'Tapaloco · the rail change', commandLabel: 'Maneuver', known: 'new',
        whatIs: 'The action that changes the rail on the backside. It can be done with the arm, the elbow or the shoulder, but the ideal is the hand: palm up, over the head, covering the opposite ear. Same line as the frontside snap, in the mirror: U through the middle of the face, then the rail change down and to the side.',
        body: ['Look over the shoulder.', 'Throw the hand (goofy right, regular left) over the head, palm up, covering the opposite ear.', 'Eyes over the shoulder toward where you want to go; the oblique changes and the rail engages.', 'Weight always forward — never behind the hip, or you get stuck on the wave.'],
        keyWords: ['Hand', 'Palm up', 'Over', 'Ear', 'Forward'],
        lessonId: 'STP-044', lessonLabel: 'Tapaloco Snap',
      },
      {
        key: 'elbow', command: 'closure', name: 'Elbow strike · the M', commandLabel: 'Closure', known: 'new',
        whatIs: 'The backside closure: rotational energy that travels down to the rail after the Tapaloco. The M is the shape of your body, not a line on the wave.',
        body: ['Throw the elbow of the arm that did the Tapaloco, upward, not downward.', 'The other arm stays active and receives it: back and both elbows make the M with your body.', 'Scapulas trying to unite — that is what sends the energy down to the foot and the rail.', 'The back foot follows the elbow. Then back to posture.'],
        keyWords: ['Throw', 'Up', 'M', 'Scapula', 'Foot'],
        lessonId: 'STP-045', lessonLabel: 'Elbow (BS Closure)',
      },
      {
        key: 'back', command: 'posture', name: 'Back to posture', commandLabel: 'Posture', known: 'three-circles',
        whatIs: 'You close the circle where it started, chest still open, eyes already on the next section.',
        body: ['Same posture you started from: low, weight on the front foot.', 'Chest open toward the wave; eyes over the back shoulder.'],
        keyWords: ['Posture'],
        lessonId: 'STP-018', lessonLabel: 'Power Stance / Posture (White Belt)',
      },
    ],
  },
];
