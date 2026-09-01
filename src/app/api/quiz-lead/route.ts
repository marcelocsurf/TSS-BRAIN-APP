import { NextRequest, NextResponse } from 'next/server';
import { createLeadFromQuiz } from '@/lib/actions/quiz-lead';
import { rateLimitOk, clientIp } from '@/lib/rate-limit';


// Public endpoint for the external "Find Your Surf Level" quiz (website /
// Netlify). It accepts the payload the standalone HTML already sends and maps
// it to The Surf Sequence's createLeadFromQuiz — so the lead lives in the right system
// (students table) with the quiz result, dedup, reuse and notification email.
//
// External HTML change needed: POST here instead of the Supabase REST URL, and
// drop the apikey/Authorization headers.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Level NAME ("Beginner".."Elite") → TSS belt key, using the shared LEVELS table.

export async function POST(req: NextRequest) {
  try {
    // Mismo rate limit que /api/quiz-v2-lead (revisión 2026-09-01): este
    // endpoint legacy comparte el costo real (insert + email de aviso).
    if (!rateLimitOk(`qv1:${clientIp(req.headers)}`, 8, 10 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts — try again in a few minutes.' },
        { status: 429, headers: CORS },
      );
    }
    const body = await req.json().catch(() => ({}));

    // Accept both the external HTML shape (nombre/surf_level/academia) and the
    // native shape (first_name/belt/academy_slug).
    // Shape nuevo (first_name + last_name explícitos, quiz co-brandeado con
    // dos campos) o legacy ("nombre" en un campo único, copias externas del
    // HTML que no podemos redeployar): el legacy se parte por espacios y
    // mantiene permitido el apellido vacío para no romperlo.
    const explicitLast: string = (body.last_name ?? '').toString().trim();
    let first_name: string;
    let last_name: string | null;
    if (explicitLast) {
      first_name = (body.first_name ?? '').toString().trim();
      last_name = explicitLast;
    } else {
      const nombre: string = (body.nombre ?? body.first_name ?? '').toString().trim();
      const parts = nombre.split(' ');
      first_name = parts[0] ?? '';
      last_name = parts.slice(1).join(' ') || null;
    }
    if (!first_name) {
      return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400, headers: CORS });
    }

    const email = (body.email ?? null) || null;
    const phone = (body.phone ?? null) || null;
    if (!email && !phone) {
      return NextResponse.json({ ok: false, error: 'Email or phone is required.' }, { status: 400, headers: CORS });
    }

    const academy_slug = body.academia ?? body.academy_slug ?? null;

    // Score: number 0–70, or null (never-surfed gate) → treat as Beginner.
    const rawScore = body.score;
    const score = typeof rawScore === 'number' ? rawScore : 0;

    // La cinta la calcula el SERVIDOR en createLeadFromQuiz (clamp del score
    // + regla del agua). El belt/surf_level textual del body se ignora: este
    // endpoint es público con CORS abierto — cualquiera podía POSTear
    // belt='black_belt' con score 0 (auditoría 2026-08-31).

    // Skillmap: native {name,pct}[] or external answers.skills {name,p}[].
    let skillmap: { name: string; pct: number }[] = [];
    if (Array.isArray(body.skillmap)) {
      skillmap = body.skillmap;
    } else if (Array.isArray(body?.answers?.skills)) {
      skillmap = body.answers.skills.map((s: any) => ({ name: s.name, pct: s.pct ?? s.p ?? 0 }));
    }

    // Respuestas CRUDAS (el HTML actualizado 2026-08-31 las manda): índices
    // 0–3 por pregunta. Con ellas el servidor recalcula todo con resolveLevel
    // — mismo motor que el intake. Las copias viejas del HTML (con el gate
    // que pre-llenaba 7s/10s) fallan esta validación y caen al camino
    // conservador del score clampeado.
    const rawTech = body?.answers?.raw;
    const rawOcean = body?.answers?.ocean;
    const isIdx = (x: unknown) => typeof x === 'number' && Number.isInteger(x) && x >= -1 && x <= 3;
    const tech_answers =
      Array.isArray(rawTech) && rawTech.length >= 7 && rawTech.slice(0, 7).every(isIdx)
        ? rawTech.slice(0, 7)
        : undefined;
    const ocean_answers =
      tech_answers && Array.isArray(rawOcean) && rawOcean.every(isIdx)
        ? rawOcean.slice(0, 3)
        : undefined;

    const res = await createLeadFromQuiz({
      first_name,
      last_name,
      email,
      phone,
      academy_slug,
      tech_answers,
      ocean_answers,
      score,
      skillmap,
      // Solo el shape legacy ("nombre" en un campo) puede venir sin apellido —
      // copias externas del HTML que no podemos redeployar desde acá.
      allow_missing_last_name: !explicitLast,
    });

    if (!res.ok) {
      return NextResponse.json(res, { status: 400, headers: CORS });
    }
    return NextResponse.json({ ok: true }, { status: 200, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Failed' }, { status: 500, headers: CORS });
  }
}
