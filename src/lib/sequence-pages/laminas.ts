// ═══ Las láminas del método, por secuencia ═══
// Marcelo dibuja láminas que explican una secuencia de una sola mirada. Van
// arriba del Think it: primero el mapa, y el texto plegado debajo. Se tocan
// y se abren en grande — en el teléfono la letra fina no se lee de otro modo.
//
// Los archivos viven en public/uploads/fotos y se sirven en /uploads/fotos/…
// Para agregar una: subir el .webp y añadir una línea acá. No hace falta
// tocar ningún componente.

export type Lamina = {
  /** Clave estable para las láminas de las páginas propias (círculos). */
  key?: string;
  src: string;
  /** Lo que lee alguien que no puede ver la imagen. Describe el contenido,
   *  no la forma: es la única vía a esta información sin la vista. */
  alt: string;
  /** El paso o la idea que explica, en pocas palabras. */
  caption?: string;
};

const CATCH_WAVES: Lamina[] = [
  {
    src: '/uploads/fotos/catch-waves-wave-stages.webp',
    caption: 'Read the stage',
    alt: 'Theoretical class — understand how waves work. The four wave stages: 1 swell, 2 steepening, 3 breaking, 4 whitewater. The common wave shapes: beach break, point break and reef break. And the types of waves: beach breaks, point breaks, reef breaks, lefts and rights, and close outs.',
  },
  {
    src: '/uploads/fotos/catch-waves-paddling-angle.webp',
    caption: 'Paddle with the correct angle',
    alt: 'Paddling angle — three options depending on where the pocket is. Option 1, far from the pocket: paddle on a flatter part of the wave, further from where it steepens. Option 2, near the pocket: paddle closer to where the wave starts to steepen. Option 3, in front of the pocket: paddle directly towards it, getting in front of the steepest part. What changes the choice is whether the pocket has a lip or is just whitewater.',
  },
];

const PICK_YOUR_LINE: Lamina[] = [
  {
    src: '/uploads/fotos/pick-your-line-cobra.webp',
    caption: 'Cobra + pick the line',
    alt: 'Cobra + pick the line — one of the most important moments in the sequence, because this is where you choose the line that starts the ride. Technically it is how you direct the board while still lying down: through the cobra you guide it right or left and move toward where you want to go, which buys you a calmer pop-up without feeling rushed. The four biomechanical cues: do the cobra; look where you want to go; use the oblique to sink the rail; start traveling in that direction.',
  },
];

/** Por id de secuencia. Catch Waves y la #6 de Yellow son la misma secuencia
 *  con otro nombre según la cinta, así que comparten las láminas. */
export const SEQUENCE_LAMINAS: Record<string, Lamina[]> = {
  'BB-CATCH': CATCH_WAVES,
  'YB-SEQ-6.0': CATCH_WAVES,
  'BB-LINE': PICK_YOUR_LINE,
};

// ═══ Láminas de las páginas propias (Tres Círculos, Infinite Circle) ═══
// FUENTE ÚNICA (2026-09-30): las dibujan ThreeCirclesPage e InfiniteCirclePage
// y las usa el coach para ponerlas en pantalla. Para cambiar una, se cambia acá.
export const THREE_CIRCLES_LAMINAS: Lamina[] = [
  { key: 'circle-1', src: '/uploads/fotos/circle-1-basic-movements.webp', caption: 'Circle 1 · Basic movements', alt: 'Circle 1 · Basic Movements: the three circles overlap into flow — the four movements P·R·C·H, the feet on the board, and the dynamic of the wave — with the kinetic chain of the rotation: sight, neck and head, torso, hip, ankles.' },
  { key: 'circle-2-feet', src: '/uploads/fotos/circle-2-foot-position-v2.webp', caption: 'Circle 2 · Foot position', alt: 'Circle 2 · Foot Position on the Board: FP3 forward gives most speed and least maneuverability, FP2 neutral is ready for what comes next, FP1 at the tail is most maneuverable and least speed. Stability: a gentle wave at FP3, a tighter wave at FP2, a figure eight at FP1. The weight always stays on the front foot; the back foot only follows the rails.' },
  { key: 'circle-2-brake', src: '/uploads/fotos/circle-2-brake-accelerator.webp', caption: 'Circle 2 · Brake and accelerator', alt: 'How the board answers · brake and accelerator. Press the back foot and the board brakes: the tail sinks and you slow down on purpose. Stay forward and the board runs. Every board accelerates most at its widest and thickest part, around the centre: it is a direction, not a spot. The closer your weight gets to it, the more speed.' },
  { key: 'circle-2-front', src: '/uploads/fotos/circle-2-front-foot.webp', caption: 'Circle 2 · The front foot', alt: 'The front foot · centre and rails. The front foot lands centred on the stringer: that is neutral, and you can press the same with the toes and with the heel. The closer the foot is to a rail, the more that rail sinks. FP1, FP2 and FP3 always describe the back foot. The rule that surprises people: Circle 1 cannot rescue Circle 2.' },
  { key: 'circle-3', src: '/uploads/fotos/circle-3-wave-dynamics.webp', caption: 'Circle 3 · Wave dynamics', alt: "Circle 3 · Wave Dynamics: combine them at the right moment — when one energy is running out, add the other. The wave's energy times what your body generates is the line you can draw. On the wave face, go down and go up between the four zones: Z1 low by the flat, Z2 lower middle, Z3 upper middle, Z4 high. The energy lives by the pocket; down at the flat there is none, only resistance." },
];
export const INFINITE_CIRCLE_LAMINAS: Lamina[] = [
  // Marcelo 2026-09-30: arriba del paso "Rotation + hold · the bottom turn" (los dos lados).
  { key: 'bottom-turn-types', src: '/uploads/fotos/types-of-bottom-turns.webp', caption: 'Types of bottom turns', alt: "Types of Bottom Turns: the bottom turn is always a U, at different depths — long or tight, mid-face, almost at the flat, or out onto the flat. Be aware of the wave's flat section: reaching it costs speed, and sometimes that is exactly what you want. The bottom turn ends when the projection is executed." },
  { key: 'learning-blocks', src: '/uploads/fotos/learning-blocks.webp', caption: 'The eight learning blocks', alt: 'Learning Blocks — the eight blocks of the method. 01 preparation and positioning; 02 the wave entry; 03 pop-up and connect with the board; 04 power posture; 05 rotation and bottom turn, frontside and backside; 06 projection; 06 maneuvers; and 08 the infinite circle concept, which carries the sweet spot, chasing the wave, the paddling angle, cobra plus pick your line, and the pop-up with feet positioning.' },
];
/** Una lámina de los círculos por su clave (la dibuja la página del alumno). */
export function circlePlate(key: string): Lamina {
  const l = [...THREE_CIRCLES_LAMINAS, ...INFINITE_CIRCLE_LAMINAS].find((x) => x.key === key);
  if (!l) throw new Error(`Unknown circle plate: ${key}`);
  return l;
}

/** Las láminas de una lección: las imágenes que dibuja MarkdownContent (una
 *  imagen SOLA en su línea, mismo patrón), en orden. */
export function laminasInMarkdown(md: string | null | undefined): Lamina[] {
  const out: Lamina[] = [];
  for (const line of String(md ?? '').split('\n')) {
    const m = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (m) out.push({ src: m[2], alt: m[1] || 'Plate', caption: m[1] || undefined });
  }
  return out;
}

/** El texto de la lección sin sus láminas (las mismas líneas que junta
 *  laminasInMarkdown): cuando las láminas van en una tira aparte, no se
 *  dibujan otra vez una abajo de la otra. */
export function stripLaminas(md: string | null | undefined): string {
  return String(md ?? '').split('\n').filter((line) => !/^!\[([^\]]*)\]\(([^)\s]+)\)$/.test(line.trim())).join('\n').replace(/^\s+/, '');
}
