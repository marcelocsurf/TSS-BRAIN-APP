// Lógica pura: reglas del método y validaciones que no tocan la base.
import { describe, it, expect, vi } from 'vitest';
import { pickWeakestCriterion } from '@/lib/utils/criteria';
import { dobError } from '@/lib/utils/dob';
import { suggestCorrectedEmail } from '@/lib/utils/email-typo';
import { computeV2, isValidV2Answers } from '@/lib/quiz/surf-level-v2';

vi.mock('@/lib/utils/tz', () => ({
  elSalvadorToday: () => '2026-09-05',
  elSalvadorNowHM: () => '08:30',
  elSalvadorDatePlus: (d: number) => '2026-09-05',
  toElSalvadorDate: (x: any) => x,
}));
import { campEnrollmentClosed, isMultiDay, campDayProgress } from '@/lib/utils/camp-window';

describe('pickWeakestCriterion — el PRIMER eslabón que falla, en orden de tarjeta', () => {
  const c = (i: number, r: 'met' | 'partial' | 'not_met') => ({ criterion_index: i, criterion_text: `c${i}`, result: r });
  it('devuelve el primero no logrado aunque otro esté peor', () => {
    expect(pickWeakestCriterion([c(2, 'not_met'), c(1, 'partial'), c(0, 'met')])?.criterion_index).toBe(1);
  });
  it('null cuando todo está logrado o no hay datos', () => {
    expect(pickWeakestCriterion([c(0, 'met'), c(1, 'met')])).toBeNull();
    expect(pickWeakestCriterion(null)).toBeNull();
    expect(pickWeakestCriterion([])).toBeNull();
  });
});

describe('dobError — fecha de nacimiento posible', () => {
  it('acepta vacío y fechas normales', () => {
    expect(dobError('')).toBeNull();
    expect(dobError('1990-05-20')).toBeNull();
  });
  it('rechaza futuro, más de 110 años y menos de 3', () => {
    expect(dobError('2099-01-01')).toMatch(/future/);
    expect(dobError('1900-01-01')).toMatch(/check the year/);
    const y = new Date().getFullYear() - 1;
    expect(dobError(`${y}-01-01`)).toMatch(/under 3/);
    expect(dobError('no-es-fecha')).toMatch(/not valid/);
  });
});

describe('suggestCorrectedEmail — solo sugiere, nunca corrige', () => {
  it('detecta dominios mal tipeados', () => {
    expect(suggestCorrectedEmail('ana@gmal.com')).toBe('ana@gmail.com');
    expect(suggestCorrectedEmail('ana@gmail.con')).toBe('ana@gmail.com');
    expect(suggestCorrectedEmail('ana@outlook.ccom')).toBe('ana@outlook.com');
  });
  it('no toca dominios legítimos', () => {
    expect(suggestCorrectedEmail('ana@googlemail.com')).toBeNull();
    expect(suggestCorrectedEmail('ana@gmail.com')).toBeNull();
    expect(suggestCorrectedEmail('sin-arroba')).toBeNull();
  });
});

describe('quiz V2 — la regla del agua manda', () => {
  it('valida el formato de respuestas', () => {
    expect(isValidV2Answers([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(true);
    expect(isValidV2Answers([3, 3, 3])).toBe(false);
    expect(isValidV2Answers([4, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(false);
  });
  it('todo perfecto = 100 puntos, sin tope', () => {
    const r = computeV2([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    expect(r.score).toBe(100);
    expect(r.mar).toBe(50);
    expect(r.cappedBy).toBeNull();
  });
  it('ola perfecta pero no sabe volver solo → tope por el agua', () => {
    const r = computeV2([3, 3, 3, 3, 0, 3, 3, 3, 3, 3]);
    expect(r.cappedBy).toBe('water');
    expect(r.belt).toBe('yellow_belt');
  });
  it('mar perfecto pero no agarra la ola → tope por evidencia', () => {
    const r = computeV2([3, 3, 3, 3, 3, 0, 3, 3, 3, 3]);
    expect(r.cappedBy).toBe('evidence');
  });
});

describe('campEnrollmentClosed — un camp iniciado no admite inscripciones', () => {
  it('una clase de un día nunca cierra por esta regla', () => {
    expect(isMultiDay({ start_date: '2026-09-05', end_date: '2026-09-05' })).toBe(false);
    expect(campEnrollmentClosed({ start_date: '2026-09-01', end_date: '2026-09-01', scheduled_time: '06:00' })).toBe(false);
  });
  it('arrancó ayer → cerrado; arranca mañana → abierto', () => {
    expect(campEnrollmentClosed({ start_date: '2026-09-04', end_date: '2026-09-10' })).toBe(true);
    expect(campEnrollmentClosed({ start_date: '2026-09-06', end_date: '2026-09-10' })).toBe(false);
  });
  it('el día 1 queda abierto hasta la hora de encuentro (ahora son las 08:30)', () => {
    expect(campEnrollmentClosed({ start_date: '2026-09-05', end_date: '2026-09-10', scheduled_time: '08:00' })).toBe(true);
    expect(campEnrollmentClosed({ start_date: '2026-09-05', end_date: '2026-09-10', scheduled_time: '09:00' })).toBe(false);
    expect(campEnrollmentClosed({ start_date: '2026-09-05', end_date: '2026-09-10', scheduled_time: null })).toBe(false);
  });
  it('cuenta el día en curso', () => {
    expect(campDayProgress({ start_date: '2026-09-03', end_date: '2026-09-08' })).toEqual({ day: 3, total: 6 });
  });
});

// ═══ Progreso por lado (Marcelo 2026-09-10) ═══
import { sideBalance } from '@/lib/sequence-sides';
describe('sideBalance — el lado flojo es el próximo movimiento, sin perder el número', () => {
  const seq = (id: string, order: number, name: string, minRating: number | null, extra: Partial<Parameters<typeof sideBalance>[0][number]> = {}) =>
    ({ id, order, name, state: 'working' as const, minRating, selfSequenceRating: null, ...extra });
  it('empareja #8 con #9 y aconseja el backside cuando queda 2★ atrás', () => {
    const b = sideBalance([seq('BB-SEQ-08', 8, 'Frontside Pumping', 4), seq('BB-SEQ-09', 9, 'Backside Pumping', 2), seq('BB-SEQ-10', 10, 'Frontside Snap', 3)]);
    expect(b.fs).toBe(3.5);
    expect(b.bs).toBe(2);
    expect(b.gap).toBe(1.5);
    expect(b.pairs[0]).toMatchObject({ move: 'Pumping', both: false, gap: 2 });
    expect(b.pairs[0].fs?.label).toBe('#8 Frontside Pumping');
    expect(b.advice).toMatchObject({ side: 'bs', sequenceId: 'BB-SEQ-09' });
    expect(b.advice?.text).toContain('backside first');
  });
  it('sin brecha (o lado flojo ya en 4★) no hay consejo: manda el orden del método', () => {
    expect(sideBalance([seq('BB-SEQ-08', 8, 'Frontside Pumping', 4), seq('BB-SEQ-09', 9, 'Backside Pumping', 4)]).advice).toBeNull();
    expect(sideBalance([seq('BB-SEQ-08', 8, 'Frontside Pumping', 5), seq('BB-SEQ-09', 9, 'Backside Pumping', 4)]).advice).toBeNull();
    expect(sideBalance([seq('BB-SEQ-08', 8, 'Frontside Pumping', 4)]).gap).toBeNull();
  });
  it('una secuencia de dos lados (Yellow #7) se lee por lado y conserva su número', () => {
    const b = sideBalance([seq('YB-SEQ-7.0', 7, 'Drawing on the Wave', 4, { sideRatings: { fs: 4, bs: 2 } })]);
    expect(b.pairs).toHaveLength(1);
    expect(b.pairs[0]).toMatchObject({ both: true, gap: 2 });
    expect(b.pairs[0].fs?.label).toBe('#7 Drawing on the Wave');
    expect(b.advice?.sequenceId).toBe('YB-SEQ-7.0');
    expect(b.advice?.side).toBe('bs');
  });
  it('las secuencias sin lado no entran en la cuenta', () => {
    const b = sideBalance([seq('WB-SEQ-1', 1, 'Board Control', 5), seq('BB-NAV', 7.1, 'Navigating', 3)]);
    expect(b.pairs).toHaveLength(0);
    expect(b.fs).toBeNull();
  });
});
