'use server';

// Student PIN + session — Fase 6/7 of the onboarding plan.
//
// Flow:
// - Student finishes intake → setStudentPin(portalToken, pin) stores a
//   scrypt hash + salt in students.pin_hash (format `scrypt$<salt>$<hash>`).
// - On entry (/), student types their PIN → loginStudentByPin(pin) looks
//   up the matching student, rotates current_session_id, and sets a
//   signed httpOnly cookie tss_student_session (30 days).
// - validateStudentSession() runs on every portal page render. If the
//   cookie's session_id no longer matches students.current_session_id the
//   student was kicked by a login from another device (anti-sharing).
// - logoutStudent() clears the cookie and invalidates current_session_id.
//
// Uses Node crypto scrypt — no external bcrypt dep.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { scryptSync, randomBytes, randomUUID, timingSafeEqual, createHmac } from 'crypto';

const COOKIE_NAME = 'tss_student_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function hashPin(pin: string, saltHex?: string): string {
  const salt = saltHex ?? randomBytes(16).toString('hex');
  const derived = scryptSync(pin, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPin(pin: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  const actualHex = scryptSync(pin, salt, 64).toString('hex');
  // timingSafeEqual requires equal-length buffers; both are 128 hex chars.
  return timingSafeEqual(Buffer.from(actualHex, 'hex'), Buffer.from(expectedHex, 'hex'));
}

function sessionSecret(): string {
  return (
    process.env.STUDENT_SESSION_SECRET ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'tss-dev-fallback-secret'
  );
}

function signSession(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('hex');
}

function makeCookieValue(portalToken: string, sessionId: string): string {
  const payload = `${portalToken}:${sessionId}`;
  return `${payload}.${signSession(payload)}`;
}

function parseCookieValue(value: string): { portalToken: string; sessionId: string } | null {
  const idx = value.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = value.slice(0, idx);
  const sig = value.slice(idx + 1);
  const expected = signSession(payload);
  if (sig.length !== expected.length) return null;
  const sigOk = timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  if (!sigOk) return null;
  const [portalToken, sessionId] = payload.split(':');
  if (!portalToken || !sessionId) return null;
  return { portalToken, sessionId };
}

// ─── Set / change PIN (called from intake or from the portal) ───
export async function setStudentPin(portalToken: string, pin: string): Promise<void> {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN must be 4 to 6 digits.');
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('students')
    .update({
      pin_hash: hashPin(pin),
      pin_set_at: new Date().toISOString(),
    })
    .eq('portal_token', portalToken)
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Student not found.');
}

// ─── Login with PIN — returns { portalToken } on success, sets cookie ───
export async function loginStudentByPin(pin: string): Promise<{ portalToken: string }> {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN must be 4 to 6 digits.');
  }
  const admin = createAdminClient();

  // We can't index by hash (each row has its own salt), so we have to scan
  // students that have a PIN set. Production with many students should add
  // a secondary identifier (email/phone + PIN) — for the current scale this
  // is fine and short-lived; promote-to-member volumes are modest.
  const { data: candidates } = await admin
    .from('students')
    .select('id, portal_token, pin_hash')
    .not('pin_hash', 'is', null);

  const match = (candidates ?? []).find(
    (s) => s.pin_hash && verifyPin(pin, s.pin_hash),
  );
  if (!match) throw new Error('PIN not recognized.');

  // Rotate session id — kicks any other device using the previous one.
  const newSessionId = randomUUID();
  await admin
    .from('students')
    .update({
      current_session_id: newSessionId,
      current_session_started_at: new Date().toISOString(),
    })
    .eq('id', match.id);

  const jar = await cookies();
  jar.set(COOKIE_NAME, makeCookieValue(match.portal_token, newSessionId), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return { portalToken: match.portal_token };
}

// ─── Validate session for a given portal_token. Called from portal layout. ───
// Returns 'ok' | 'no_session' | 'kicked'. On 'kicked' bumps the kick counter.
export async function validateStudentSession(
  portalToken: string,
): Promise<{ status: 'ok' | 'no_session' | 'kicked'; kickedAt?: string | null }> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return { status: 'no_session' };

  const parsed = parseCookieValue(raw);
  if (!parsed || parsed.portalToken !== portalToken) {
    return { status: 'no_session' };
  }

  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, current_session_id, current_session_started_at, session_kick_count')
    .eq('portal_token', portalToken)
    .single();
  if (!student) return { status: 'no_session' };

  if (student.current_session_id && student.current_session_id !== parsed.sessionId) {
    // Another device took over. Record the kick + clear our cookie.
    await admin
      .from('students')
      .update({
        last_session_kicked_at: new Date().toISOString(),
        session_kick_count: (student.session_kick_count ?? 0) + 1,
      })
      .eq('id', student.id);
    jar.delete(COOKIE_NAME);
    return { status: 'kicked', kickedAt: student.current_session_started_at };
  }

  return { status: 'ok' };
}

// ─── Logout — invalidate cookie + clear session_id so next attempt requires PIN ───
export async function logoutStudent(portalToken: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('students')
    .update({ current_session_id: null, current_session_started_at: null })
    .eq('portal_token', portalToken);
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  revalidatePath('/portal/' + portalToken);
  redirect('/');
}

// ─── Helper used by `/` to bypass the entry form when the cookie is valid. ───
export async function getActiveStudentPortalToken(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parsed = parseCookieValue(raw);
  if (!parsed) return null;

  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('portal_token, current_session_id')
    .eq('portal_token', parsed.portalToken)
    .single();
  if (!student) return null;
  if (student.current_session_id !== parsed.sessionId) return null;
  return student.portal_token;
}
