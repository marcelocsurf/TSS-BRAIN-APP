import type { SequencePageConfig } from './types';
import { BB_SEQ_08 } from './bb-seq-08';
import { BB_SEQ_09 } from './bb-seq-09';
import { BB_SEQ_10 } from './bb-seq-10';
import { BB_SEQ_11 } from './bb-seq-11';
import { BB_SEQ_12 } from './bb-seq-12';
import { BB_SEQ_13 } from './bb-seq-13';
import { BB_NAV, BB_CATCH, BB_LINE } from './bb-entry';
import { YB_SEQ_6, YB_SEQ_7 } from './yb-seq';
import { WB_SEQ_1, WB_SEQ_2, WB_SEQ_3, WB_SEQ_4, WB_SEQ_5 } from './wb-seq';

/** Secuencias que ya tienen la página de 4 pestañas. Se agregan de a una. */
export const SEQUENCE_PAGES: Record<string, SequencePageConfig> = {
  [BB_SEQ_08.id]: BB_SEQ_08,
  [BB_SEQ_09.id]: BB_SEQ_09,
  [BB_SEQ_10.id]: BB_SEQ_10,
  [BB_SEQ_11.id]: BB_SEQ_11,
  [BB_SEQ_12.id]: BB_SEQ_12,
  [BB_SEQ_13.id]: BB_SEQ_13,
  [BB_NAV.id]: BB_NAV,
  [BB_CATCH.id]: BB_CATCH,
  [BB_LINE.id]: BB_LINE,
  [YB_SEQ_6.id]: YB_SEQ_6,
  [YB_SEQ_7.id]: YB_SEQ_7,
  [WB_SEQ_1.id]: WB_SEQ_1,
  [WB_SEQ_2.id]: WB_SEQ_2,
  [WB_SEQ_3.id]: WB_SEQ_3,
  [WB_SEQ_4.id]: WB_SEQ_4,
  [WB_SEQ_5.id]: WB_SEQ_5,
};

export function sequencePageFor(sequenceId: string | null | undefined): SequencePageConfig | null {
  if (!sequenceId) return null;
  return SEQUENCE_PAGES[sequenceId] ?? null;
}

export type { SequencePageConfig, Indicator, WaveBoardData, WaveSegment, Command } from './types';
