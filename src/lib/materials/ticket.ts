import { createHmac, timingSafeEqual } from 'node:crypto';

// ═══ Ticket de lectura de un material ═══
// El link del libro llevaba solo el token del portal, así que copiarlo servía
// para siempre (Marcelo 2026-09-08: "no quiero que puedan pasar el link").
// Ahora la ruta /api/materials exige además un ticket firmado que vence a los
// 10 minutos y va atado al alumno y al material. El lector dentro del app lo
// pide justo antes de abrir; un link copiado muere solo.
const TTL_MS = 10 * 60 * 1000;

function secret(): string {
  return process.env.STUDENT_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'tss-dev-fallback-secret';
}

function sig(studentId: string, resourceId: string, exp: number): string {
  return createHmac('sha256', secret()).update(`${studentId}:${resourceId}:${exp}`).digest('hex');
}

export function signMaterialTicket(studentId: string, resourceId: string, now = Date.now()): string {
  const exp = now + TTL_MS;
  return `${exp}.${sig(studentId, resourceId, exp)}`;
}

export function verifyMaterialTicket(ticket: string | null | undefined, studentId: string, resourceId: string, now = Date.now()): boolean {
  if (!ticket) return false;
  const dot = ticket.indexOf('.');
  if (dot < 1) return false;
  const exp = Number(ticket.slice(0, dot));
  const given = ticket.slice(dot + 1);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = sig(studentId, resourceId, exp);
  if (given.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(given, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
