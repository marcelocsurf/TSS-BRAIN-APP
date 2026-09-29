// ═══ Las láminas del método, por secuencia ═══
// Marcelo dibuja láminas que explican una secuencia de una sola mirada. Van
// arriba del Think it: primero el mapa, y el texto plegado debajo. Se tocan
// y se abren en grande — en el teléfono la letra fina no se lee de otro modo.
//
// Los archivos viven en public/uploads/fotos y se sirven en /uploads/fotos/…
// Para agregar una: subir el .webp y añadir una línea acá. No hace falta
// tocar ningún componente.

export type Lamina = {
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
    caption: 'Cobra + pick line',
    alt: 'Cobra + pick line — one of the most important moments in the sequence, because this is where you choose the line that starts the ride. Technically it is how you direct the board while still lying down: through the cobra you guide it right or left and move toward where you want to go, which buys you a calmer pop-up without feeling rushed. The four biomechanical cues: do the cobra; look where you want to go; use the oblique to sink the rail; start traveling in that direction.',
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
// Las mismas que dibujan ThreeCirclesPage e InfiniteCirclePage; acá para que
// el coach pueda elegirlas y mostrarlas en pantalla (2026-09-29). Si cambia
// una lámina en esas páginas, cambiarla también acá.
export const THREE_CIRCLES_LAMINAS: Lamina[] = [
  { src: '/uploads/fotos/circle-1-basic-movements.webp', caption: 'Circle 1 · Basic movements', alt: 'Circle 1 · Basic Movements: the four movements P·R·C·H, the feet on the board and the dynamic of the wave, with the kinetic chain of the rotation.' },
  { src: '/uploads/fotos/circle-2-foot-position.webp', caption: 'Circle 2 · Foot position', alt: 'Circle 2 · Foot Position on the Board: FP3 forward, FP2 neutral, FP1 at the tail.' },
  { src: '/uploads/fotos/circle-2-brake-accelerator.webp', caption: 'Circle 2 · Brake and accelerator', alt: 'How the board answers: press the back foot and the board brakes; stay forward and the board runs.' },
  { src: '/uploads/fotos/circle-2-front-foot.webp', caption: 'Circle 2 · The front foot', alt: 'The front foot: centred on the stringer is neutral; the closer to a rail, the more that rail sinks.' },
  { src: '/uploads/fotos/circle-3-wave-dynamics.webp', caption: 'Circle 3 · Wave dynamics', alt: 'Circle 3 · Wave Dynamics: combine the wave energy with what your body generates; the four zones of the face.' },
];
export const INFINITE_CIRCLE_LAMINAS: Lamina[] = [
  { src: '/uploads/fotos/learning-blocks.webp', caption: 'The eight learning blocks', alt: 'Learning Blocks — the eight blocks of the method, from preparation to the infinite circle.' },
];

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
