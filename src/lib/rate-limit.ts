// ═══ Rate limit best-effort, EN MEMORIA (revisión 2026-09-01) ═══
//
// Para los endpoints públicos sin auth (quiz leads). En serverless cada
// instancia tiene su propia ventana — no es una defensa perfecta, pero corta
// el vector real barato: un loop de curl inundando students + los emails de
// aviso a la academia. Sin dependencias, sin infra nueva.

const buckets = new Map<string, number[]>();

export function rateLimitOk(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  // Higiene: que el mapa no crezca sin límite en instancias longevas.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

/** IP del request detrás del proxy de Vercel. */
export function clientIp(headers: Headers): string {
  return (headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim() || 'unknown';
}
