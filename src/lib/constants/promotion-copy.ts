// Copy student-facing del banner de promoción — POR CINTA NUEVA, basado en el
// canon de progresión TSS. `mastered` resume lo que dominó (la cinta que cierra)
// y `next` lo que desbloquea (la cinta nueva). Inglés por marca (cliente).
// Regla del canon: las Named Expressions nunca se traducen.
import type { BeltLevel } from './belts';

export const PROMOTION_COPY: Record<BeltLevel, { mastered: string; next: string }> = {
  // Nadie es promovido A white — placeholder por completitud del tipo.
  white_belt: { mastered: '', next: '' },
  yellow_belt: {
    mastered:
      'You own the fundamentals: controlling your board, reading where the wave is going, catching whitewater on your own and the turtle roll.',
    next:
      'Yellow Belt is where you paddle out past where you can touch the bottom — and start catching green waves by yourself.',
  },
  blue_belt: {
    mastered:
      'You catch green waves on your own: paddling out, timing, positioning and managing yourself beyond standing depth.',
    next:
      'Blue Belt is where the maneuvers begin — bottom turns, cutbacks and riding the open face with intention.',
  },
  purple_belt: {
    mastered:
      'You ride with intention: bottom turns, cutbacks and reading the ocean unassisted in changing conditions.',
    next:
      'Purple Belt unlocks vertical surfing — snaps, floaters and linking maneuvers with your own style.',
  },
  brown_belt: {
    mastered:
      'You link vertical maneuvers with your own style and read complex conditions independently.',
    next:
      'Brown Belt is precision: full combinations, every break type — and your first aerials.',
  },
  black_belt: {
    mastered:
      'You execute complex combinations with precision, in every condition the ocean throws at you.',
    next:
      'Black Belt is mastery — complete control, complete expression. The sequence is yours now.',
  },
};

/** Cintas claras donde el texto del CTA va en tinta; el resto usa blanco. */
export const LIGHT_BELTS: BeltLevel[] = ['white_belt', 'yellow_belt'];
