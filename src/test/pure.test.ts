// Lógica pura: reglas del método y validaciones que no tocan la base.
import { describe, it, expect, vi } from 'vitest';
import { pickWeakestCriterion } from '@/lib/utils/criteria';
import { takesRunStar, selfStarsThatCount } from '@/lib/stars';
import { sequenceStarChanges } from '@/lib/evaluation/sequence-stars';
import { dobError } from '@/lib/utils/dob';
import { suggestCorrectedEmail } from '@/lib/utils/email-typo';
import { computeV2, isValidV2Answers } from '@/lib/quiz/surf-level-v2';
import { studentBlockNote, isInternalBlockNote, carriedFromClose } from '@/lib/planner/block-notes';

vi.mock('@/lib/utils/tz', () => ({
  elSalvadorToday: () => '2026-09-05',
  elSalvadorNowHM: () => '08:30',
  elSalvadorDatePlus: (d: number) => '2026-09-05',
  toElSalvadorDate: (x: any) => x,
}));
import { campEnrollmentClosed, isMultiDay, campDayProgress, participantLastDay, participantPresentOn, stayLength } from '@/lib/utils/camp-window';

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

// Las marcas internas del planner NO son notas para el alumno. Si alguien
// agrega una marca nueva y olvida esta lista, el alumno la ve entre comillas
// como si se la hubiera escrito su coach.
describe('notes_pre — marca interna vs. nota del coach', () => {
  const MARCAS = [
    'Set at the close of day 3.',
    'Moved on at the close of day 2.',
    'Carried over from day 5.',
    'Added at the close.',
    'Added by the coach.',
  ];
  it('ninguna marca del planner llega al alumno', () => {
    for (const m of MARCAS) {
      expect(isInternalBlockNote(m)).toBe(true);
      expect(studentBlockNote(m)).toBeNull();
    }
  });
  it('la nota de verdad del coach sí llega, sin espacios de más', () => {
    expect(studentBlockNote('  Acordate de mirar la sección   ')).toBe('Acordate de mirar la sección');
    expect(studentBlockNote('')).toBeNull();
    expect(studentBlockNote(null)).toBeNull();
  });
  it('una nota que empieza parecido no se traga', () => {
    expect(studentBlockNote('Added by the coach of the other group, ignorá esto')).toBeNull();
    expect(studentBlockNote('Carried the board yourself today — bien ahí')).toBe('Carried the board yourself today — bien ahí');
  });
  it('el planner reconoce de qué día viene la misión', () => {
    expect(carriedFromClose('Set at the close of day 3.')?.day).toBe('3');
    expect(carriedFromClose('Moved on at the close of day 12.')?.day).toBe('12');
    expect(carriedFromClose('Carried over from day 5.')?.day).toBe('5');
    expect(carriedFromClose('Added by the coach.')).toBeUndefined();
    expect(carriedFromClose('Buen pop up hoy')).toBeUndefined();
  });
});

// ═══ Camp corto: quién está cada día ═══
// Esta función la usan 19 pantallas (el plan del coach, el transporte, la
// agenda del host, la programación diaria…). Si se equivoca, o el coach
// evalúa a alguien que ya se fue, o le borra los días que sí hizo.
describe('participantPresentOn — la estadía del campista', () => {
  const camp = { start: '2026-10-05', end: '2026-10-10' }; // 6 días

  it('sin fechas hace el camp completo: está el último día', () => {
    expect(participantPresentOn({}, camp.end)).toBe(true);
    expect(participantLastDay({})).toBeNull();
  });

  it('camp corto de 3 días: está el día 3 y ya no el día 4', () => {
    const p = { planned_departure: '2026-10-07' };
    expect(participantPresentOn(p, '2026-10-07')).toBe(true);
    expect(participantPresentOn(p, '2026-10-08')).toBe(false);
  });

  it('el día de salida cuenta como presente: el historial de ese día no se pierde', () => {
    expect(participantPresentOn({ departed_on: '2026-10-07' }, '2026-10-07')).toBe(true);
  });

  it('irse antes de lo contratado manda sobre el plan', () => {
    const p = { planned_departure: '2026-10-08', departed_on: '2026-10-06' };
    expect(participantLastDay(p)).toBe('2026-10-06');
    expect(participantPresentOn(p, '2026-10-07')).toBe(false);
  });

  it('alargar un día: se mueve el plan y vuelve a estar', () => {
    expect(participantPresentOn({ planned_departure: '2026-10-07' }, '2026-10-08')).toBe(false);
    expect(participantPresentOn({ planned_departure: '2026-10-08' }, '2026-10-08')).toBe(true);
  });

  it('cierre anticipado sin fecha: el día del cierre cuenta, el siguiente no', () => {
    const p = { finalized_at: '2026-10-07T20:00:00.000Z' }; // 14h en El Salvador
    expect(participantPresentOn(p, '2026-10-07')).toBe(true);
    expect(participantPresentOn(p, '2026-10-08')).toBe(false);
  });

  it('sin día que comparar no se filtra a nadie', () => {
    expect(participantPresentOn({ planned_departure: '2026-10-07' }, null)).toBe(true);
  });

  it('cuenta los días contratados contra los del camp', () => {
    expect(stayLength({}, camp.start, camp.end)).toEqual({ days: 6, total: 6 });
    expect(stayLength({ planned_departure: '2026-10-07' }, camp.start, camp.end)).toEqual({ days: 3, total: 6 });
    expect(stayLength({ planned_departure: '2026-10-05' }, camp.start, camp.end)).toEqual({ days: 1, total: 6 });
  });
});


import { pickSequenceVideos, resolveSequenceVideo, hasStanceVideos } from '@/lib/sequence-pages/videos';

describe('videos por secuencia · lado y stance', () => {
  const rows = [
    { title: 'WB-SEQ-4 · BS Goofy', file_url: 'u-bs-goofy' },
    { title: 'WB-SEQ-4 · FS Regular turn', file_url: 'u-fs-regular' },
    { title: 'WB-SEQ-4 · Backside turn', file_url: 'u-bs' },
    { title: 'WB-SEQ-4 · Directional Turns', file_url: 'u-general' },
    { title: 'WB-SEQ-4 · sin url', file_url: null },
  ];
  const v = pickSequenceVideos(rows, 'WB-SEQ-4');
  it('clasifica por lado y stance', () => {
    expect(v.bs_goofy?.url).toBe('u-bs-goofy');
    expect(v.fs_regular?.url).toBe('u-fs-regular');
    expect(v.bs?.url).toBe('u-bs');
    expect(v.general?.url).toBe('u-general');
    expect(hasStanceVideos(v)).toBe(true);
  });
  it('cae de lado+stance a lado, a stance y a general', () => {
    expect(resolveSequenceVideo(v, 'bs', 'goofy')?.url).toBe('u-bs-goofy');
    expect(resolveSequenceVideo(v, 'bs', 'regular')?.url).toBe('u-bs');
    expect(resolveSequenceVideo(v, 'fs', 'goofy')?.url).toBe('u-general');
    const noGeneral = pickSequenceVideos([{ title: 'X · BS Goofy', file_url: 'g' }], 'X');
    expect(resolveSequenceVideo(noGeneral, 'fs', 'goofy')).toBeNull();
    expect(resolveSequenceVideo(noGeneral, null, null)?.url).toBe('g');
    expect(resolveSequenceVideo(v, null, null)?.url).toBe('u-general');
  });
  it('la primera fila (más nueva) gana', () => {
    const w = pickSequenceVideos([{ title: 'X · BS new', file_url: 'new' }, { title: 'X · BS old', file_url: 'old' }], 'X');
    expect(w.bs?.url).toBe('new');
  });
});

describe('takesRunStar — un run a 4★+ cuenta para cada paso (2026-09-25)', () => {
  it('llena un paso sin nota propia', () => {
    expect(takesRunStar(undefined, 4)).toBe(true);
    expect(takesRunStar({ current_rating: null, self_source: 'executed' }, 4)).toBe(true);
  });
  it('sube un paso ejecutado más bajo o igual', () => {
    expect(takesRunStar({ current_rating: 3, self_source: 'executed' }, 4)).toBe(true);
    expect(takesRunStar({ current_rating: 4, self_source: 'executed' }, 4)).toBe(true);
  });
  it('NUNCA baja un paso ejecutado más alto', () => {
    expect(takesRunStar({ current_rating: 5, self_source: 'executed' }, 4)).toBe(false);
  });
  it('pisa una autoevaluación sin ola, aunque diga 5', () => {
    expect(takesRunStar({ current_rating: 5, self_source: 'assessed' }, 4)).toBe(true);
  });
  it('la autoevaluación vale hasta 3★ para el camino', () => {
    expect(selfStarsThatCount(5, 'assessed')).toBe(3);
    expect(selfStarsThatCount(5, 'executed')).toBe(5);
    expect(selfStarsThatCount(null)).toBeNull();
  });
});

describe('sequenceStarChanges — estrellas para toda la secuencia (2026-09-26)', () => {
  const cur = (m: Record<string, number | null>) => (id: string) => m[id] ?? null;
  it('"La tiene" sube a 4★ lo vacío y lo que estaba abajo; no toca lo que ya llega', () => {
    const r = sequenceStarChanges(['a', 'b', 'c', 'd'], cur({ a: null, b: 3, c: 4, d: 5 }), 4, { raiseOnly: true });
    expect(r).toEqual([{ stepId: 'a', stars: 4 }, { stepId: 'b', stars: 4 }]);
  });
  it('5★ a la línea: sube todo a 5; una 5★ vieja no se reescribe', () => {
    const r = sequenceStarChanges(['a', 'b', 'c'], cur({ a: null, b: 4, c: 5 }), 5);
    expect(r).toEqual([{ stepId: 'a', stars: 5 }, { stepId: 'b', stars: 5 }]);
  });
  it('4★ a la línea nunca baja una 5★ de otro camp, pero sí corrige una 5★ de esta pasada', () => {
    const r = sequenceStarChanges(['a', 'b'], cur({ a: 5, b: 5 }), 4, { writtenThisPass: new Set(['b']) });
    expect(r).toEqual([{ stepId: 'b', stars: 4 }]);
  });
  it('nada que escribir cuando todo ya está en esa estrella', () => {
    expect(sequenceStarChanges(['a', 'b'], cur({ a: 4, b: 4 }), 4)).toEqual([]);
  });
});
