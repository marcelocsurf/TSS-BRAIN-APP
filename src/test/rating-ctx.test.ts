import { describe, it, expect } from 'vitest';
import { ratingCtx } from '@/lib/evaluation/rating-ctx';

// Historial de estrellas (00226): el contexto que viaja con cada escritura.
describe('ratingCtx', () => {
  it('keeps the source, drops empty values and always adds a fresh nonce', () => {
    const a = ratingCtx('official_panel', { kind: 'coach', coach_id: 'c1', sequence_id: null, side: undefined as any, camp_session_id: '' });
    expect(a).toMatchObject({ source: 'official_panel', kind: 'coach', coach_id: 'c1' });
    expect('sequence_id' in a).toBe(false);
    expect('side' in a).toBe(false);
    expect('camp_session_id' in a).toBe(false);
    const b = ratingCtx('official_panel', { kind: 'coach', coach_id: 'c1' });
    expect(typeof a.n).toBe('string');
    expect(a.n).not.toBe(b.n);
  });
});
