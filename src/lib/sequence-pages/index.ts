import type { SequencePageConfig } from './types';
import { BB_SEQ_08 } from './bb-seq-08';
import { BB_SEQ_09 } from './bb-seq-09';

/** Secuencias que ya tienen la página de 4 pestañas. Se agregan de a una. */
export const SEQUENCE_PAGES: Record<string, SequencePageConfig> = {
  [BB_SEQ_08.id]: BB_SEQ_08,
  [BB_SEQ_09.id]: BB_SEQ_09,
};

export function sequencePageFor(sequenceId: string | null | undefined): SequencePageConfig | null {
  if (!sequenceId) return null;
  return SEQUENCE_PAGES[sequenceId] ?? null;
}

export type { SequencePageConfig, Indicator, WaveBoardData, WaveSegment, Command } from './types';
