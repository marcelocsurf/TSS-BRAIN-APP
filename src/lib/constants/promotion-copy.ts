// Copy student-facing del banner de promoción — POR CINTA NUEVA, en LENGUAJE
// DE SECUENCIAS (canon: White = Sequences #1–#5 Mission Series · Yellow =
// #6–#7 Paddling & Entry · Blue = #8–#13 Rail Changes & Named Maneuvers ·
// Purple = 15 Named Expressions · Brown = Aerial System · Black = mastery).
// `mastered` = la secuencia que dominó (cinta que cierra); `next` = la que
// desbloquea. Inglés por marca. Las Named Expressions nunca se traducen.
import type { BeltLevel } from './belts';

export const PROMOTION_COPY: Record<BeltLevel, { mastered: string; next: string }> = {
  // Nadie es promovido A white — placeholder por completitud del tipo.
  white_belt: { mastered: '', next: '' },
  yellow_belt: {
    mastered:
      'You mastered the White Belt sequence (Sequences #1–#5): controlling your board, reading where the wave is going, catching whitewater on your own and the turtle roll.',
    next:
      'Yellow Belt opens Sequences #6–#7 — paddling out past where you can touch the bottom and catching green waves by yourself.',
  },
  blue_belt: {
    mastered:
      'You mastered the Yellow Belt sequence (Sequences #6–#7): paddling out, timing, positioning and catching green waves on your own.',
    next:
      'Blue Belt opens Sequences #8–#13 — rail changes and your first named maneuvers: bottom turns and cutbacks with intention.',
  },
  purple_belt: {
    mastered:
      'You mastered the Blue Belt sequence (Sequences #8–#13): bottom turns, cutbacks and reading the ocean unassisted in changing conditions.',
    next:
      'Purple Belt unlocks the 15 Named Expressions — snaps, floaters and vertical surfing with your own style.',
  },
  brown_belt: {
    mastered:
      'You mastered the Purple Belt expressions: vertical maneuvers, linked with your own style, in complex conditions.',
    next:
      'Brown Belt is precision — full combinations, every break type, and the Aerial System.',
  },
  black_belt: {
    mastered:
      'You mastered every sequence in the system: full combinations with precision, in any condition the ocean throws at you.',
    next:
      'Black Belt is mastery — complete control, complete expression. The Surf Sequence is yours now.',
  },
};

/** Cintas claras donde el texto del CTA va en tinta; el resto usa blanco. */
export const LIGHT_BELTS: BeltLevel[] = ['white_belt', 'yellow_belt'];
