'use client';

// ═══ Mostrar láminas a la clase (Marcelo 2026-09-29) ═══
// "Si quiere enseñar algo, que pueda elegir la filmina." Desde el 2026-09-30
// es el MISMO modo presentación que el de la secuencia (ClassDeck), con
// diapositivas de lámina: se ve y se maneja igual en todas partes.

import { ClassDeck } from './ClassDeck';

export interface PresentedLamina { src: string; alt: string; caption?: string; from?: string }

export function LaminaPresenter({ items, start = 0, onClose }: { items: PresentedLamina[]; start?: number; onClose: () => void }) {
  return (
    <ClassDeck
      slides={items.map((l) => ({ kind: 'plate' as const, src: l.src, alt: l.alt, from: l.from }))}
      start={start}
      onClose={onClose}
    />
  );
}
