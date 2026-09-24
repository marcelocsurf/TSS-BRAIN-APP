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
