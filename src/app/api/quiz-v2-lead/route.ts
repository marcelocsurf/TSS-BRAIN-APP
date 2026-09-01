import { NextRequest, NextResponse } from 'next/server';
import { createLeadFromQuiz, submitQuizV2ByToken } from '@/lib/actions/quiz-lead';
import { isValidV2Answers } from '@/lib/quiz/surf-level-v2';
import { rateLimitOk, clientIp } from '@/lib/rate-limit';

// ═══ /api/quiz-v2-lead — el endpoint del quiz OFICIAL (quiz-v2.html) ═══
//
// Mismo origen (el quiz vive en app.thesurfsequence.com): sin CORS abierto —
// a diferencia de /api/quiz-lead, que quedó para las copias legacy del sitio.
// El body trae RESPUESTAS (10 índices 0-3); el nivel lo calcula el servidor.
//
// Dos caminos:
//  · con token  → alumno existente (intake/portal): se ata a SU ficha, sin
//    datos de contacto (ya los tenemos).
//  · sin token  → lead nuevo: nombre + apellido + email/teléfono.

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Rate limit (revisión 2026-09-01): endpoint sin auth que inserta leads y
  // dispara el email de aviso — 8 envíos por IP cada 10 minutos alcanza para
  // cualquier uso humano y corta el loop barato de spam.
  if (!rateLimitOk(`qv2:${clientIp(req.headers)}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts — try again in a few minutes.' },
      { status: 429 },
    );
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  if (!isValidV2Answers(body?.answers)) {
    return NextResponse.json({ ok: false, error: 'Invalid answers.' }, { status: 400 });
  }
  const board = typeof body.board === 'string' ? body.board.slice(0, 30) : null;
  const needs = Array.isArray(body.needs)
    ? body.needs.filter((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 3).slice(0, 2)
    : [];

  if (typeof body.token === 'string' && body.token.trim()) {
    const r = await submitQuizV2ByToken(body.token, { answers: body.answers, board, needs });
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  }

  const r = await createLeadFromQuiz({
    first_name: typeof body.first_name === 'string' ? body.first_name.slice(0, 80) : '',
    last_name: typeof body.last_name === 'string' ? body.last_name.slice(0, 80) : null,
    email: typeof body.email === 'string' ? body.email.slice(0, 160) : null,
    phone: typeof body.phone === 'string' ? body.phone.slice(0, 40) : null,
    academy_slug: typeof body.academy_slug === 'string' ? body.academy_slug.slice(0, 80) : null,
    v2: { answers: body.answers, board, needs },
  });
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
