// ═══ Supabase de mentira para pruebas de compuertas ═══
// Tablas en memoria + el encadenado mínimo que usan las acciones:
// from().select().eq().maybeSingle(), insert(), update().eq(), delete(),
// order/limit/range, storage.from().download/remove. Registra cada operación
// en `ops` para poder afirmar "NO escribió nada".
import { randomUUID } from 'node:crypto';

export type Row = Record<string, any>;
type Filter = [string, string, any];

export function fakeSupabase(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = {};
  for (const [k, v] of Object.entries(seed)) tables[k] = v.map((r) => ({ ...r }));
  const ops: { table: string; op: string; payload?: any; filters: Filter[] }[] = [];

  const match = (r: Row, [f, k, v]: Filter) => {
    switch (f) {
      case 'eq': return r[k] === v;
      case 'neq': return r[k] !== v;
      case 'in': return Array.isArray(v) && v.includes(r[k]);
      case 'is': return r[k] == v;
      case 'ilike': return String(r[k] ?? '').toLowerCase() === String(v).toLowerCase().replace(/%/g, '');
      case 'gte': return r[k] >= v;
      case 'lte': return r[k] <= v;
      case 'gt': return r[k] > v;
      case 'lt': return r[k] < v;
      default: return true;
    }
  };

  function from(table: string) {
    const rows = () => (tables[table] ??= []);
    const st = { op: 'select', payload: null as any, filters: [] as Filter[], limitN: null as number | null, range: null as [number, number] | null, single: null as null | 'maybe' | 'single' };
    const apply = () => rows().filter((r) => st.filters.every((f) => match(r, f)));
    const exec = () => {
      ops.push({ table, op: st.op, payload: st.payload, filters: st.filters });
      let data: any;
      if (st.op === 'select') data = apply();
      else if (st.op === 'insert' || st.op === 'upsert') {
        const arr = (Array.isArray(st.payload) ? st.payload : [st.payload]).map((r: Row) => ({ id: randomUUID(), ...r }));
        rows().push(...arr); data = arr;
      } else if (st.op === 'update') { data = apply(); data.forEach((r: Row) => Object.assign(r, st.payload)); }
      else if (st.op === 'delete') { data = apply(); tables[table] = rows().filter((r) => !data.includes(r)); }
      if (st.limitN != null) data = data.slice(0, st.limitN);
      if (st.range) data = data.slice(st.range[0], st.range[1] + 1);
      if (st.single === 'maybe') return { data: data[0] ?? null, error: null };
      if (st.single === 'single') return data[0] ? { data: data[0], error: null } : { data: null, error: { message: 'no rows' } };
      return { data, error: null };
    };
    const filt = (f: string) => (k: string, v: any) => { st.filters.push([f, k, v]); return b; };
    const b: any = {
      select: () => b,
      insert: (p: any) => { st.op = 'insert'; st.payload = p; return b; },
      upsert: (p: any) => { st.op = 'upsert'; st.payload = p; return b; },
      update: (p: any) => { st.op = 'update'; st.payload = p; return b; },
      delete: () => { st.op = 'delete'; return b; },
      eq: filt('eq'), neq: filt('neq'), in: filt('in'), is: filt('is'), ilike: filt('ilike'),
      gte: filt('gte'), lte: filt('lte'), gt: filt('gt'), lt: filt('lt'),
      or: () => b, not: () => b, order: () => b,
      limit: (n: number) => { st.limitN = n; return b; },
      range: (a: number, c: number) => { st.range = [a, c]; return b; },
      maybeSingle: () => { st.single = 'maybe'; return b; },
      single: () => { st.single = 'single'; return b; },
      then: (res: any, rej: any) => Promise.resolve().then(exec).then(res, rej),
    };
    return b;
  }

  const storage = {
    from: (_bucket: string) => ({
      download: async (_p: string) => ({ data: new Blob([Buffer.from('%PDF-fake')]), error: null }),
      remove: async (_p: string[]) => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null }),
    }),
    listBuckets: async () => ({ data: [], error: null }),
  };

  const writes = () => ops.filter((o) => o.op !== 'select');
  return { from, storage, ops, tables, writes };
}
export type FakeSupabase = ReturnType<typeof fakeSupabase>;
