// ═══ "Tu lado" · pares frontside / backside (Marcelo 2026-09-19) ═══
// En seis días un regular solo practica su lado (derechas → frontside) y un
// goofy el otro. La plantilla dice "Pumping · your side" y el app resuelve la
// secuencia real por alumno al crear el camp: Regular → frontside (#8, #10,
// #12), Goofy → backside (#9, #11, #13). Sin stance conocido → frontside y se
// avisa. Los ids PAIR-* viven solo en plantillas; los planes y el portal ya
// llevan la secuencia resuelta.

import { SIDE_PAIRS } from '@/lib/constants/learning-blocks';

export type SidePairId = 'PAIR-PUMP' | 'PAIR-SNAP' | 'PAIR-CUTBACK';

export const SIDE_PAIR_IDS: SidePairId[] = ['PAIR-PUMP', 'PAIR-SNAP', 'PAIR-CUTBACK'];

const BY_MOVE: Record<SidePairId, string> = { 'PAIR-PUMP': 'Pumping', 'PAIR-SNAP': 'Snap', 'PAIR-CUTBACK': 'Cutback' };

export function isSidePair(id: string | null | undefined): id is SidePairId {
  return !!id && (SIDE_PAIR_IDS as string[]).includes(id);
}

export function sidePairOf(id: SidePairId): { move: string; fs: string; bs: string } {
  const move = BY_MOVE[id];
  const p = SIDE_PAIRS.find((x) => x.move === move)!;
  return p;
}

/** Etiqueta para la plantilla: "Pumping · your side (#8 frontside / #9 backside)". */
export function sidePairLabel(id: SidePairId): string {
  const p = sidePairOf(id);
  const n = (sid: string) => sid.replace(/^BB-SEQ-0?/, '#');
  return `${p.move} · your side (${n(p.fs)} frontside / ${n(p.bs)} backside)`;
}

/** Resuelve el par a la secuencia del alumno según su stance. */
export function resolveSidePair(id: SidePairId, stance: string | null | undefined): { sequenceId: string; side: 'fs' | 'bs'; known: boolean } {
  const p = sidePairOf(id);
  const s = String(stance ?? '').trim().toLowerCase();
  if (s === 'goofy') return { sequenceId: p.bs, side: 'bs', known: true };
  if (s === 'regular') return { sequenceId: p.fs, side: 'fs', known: true };
  return { sequenceId: p.fs, side: 'fs', known: false };
}
