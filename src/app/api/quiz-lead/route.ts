import { NextRequest, NextResponse } from 'next/server';
import { createLeadFromQuiz } from '@/lib/actions/quiz-lead';
import { LEVELS, levelForScore } from '@/lib/quiz/surf-level';

// Public endpoint for the external "Find Your Surf Level" quiz (website /
// Netlify). It accepts the payload the standalone HTML already sends and maps
// it to TSS Brain's createLeadFromQuiz — so the lead lives in the right system
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
function beltFromLevelName(name: string | null | undefined): string | null {
  if (!name) return null;
  const lv = LEVELS.find((l) => l.name.toLowerCase() === name.trim().toLowerCase());
  return lv?.belt ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Accept both the external HTML shape (nombre/surf_level/academia) and the
    // native shape (first_name/belt/academy_slug).
    const nombre: string = (body.nombre ?? body.first_name ?? '').toString().trim();
    if (!nombre) {
      return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400, headers: CORS });
    }
    const parts = nombre.split(' ');
    const first_name = parts[0];
    const last_name = parts.slice(1).join(' ') || null;

    const email = (body.email ?? null) || null;
    const phone = (body.phone ?? null) || null;
    if (!email && !phone) {
      return NextResponse.json({ ok: false, error: 'Email or phone is required.' }, { status: 400, headers: CORS });
    }

    const academy_slug = body.academia ?? body.academy_slug ?? null;

    // Score: number 0–70, or null (never-surfed gate) → treat as Beginner.
    const rawScore = body.score;
    const score = typeof rawScore === 'number' ? rawScore : 0;

    // Belt: prefer an explicit belt; else map from surf_level name; else from score.
    const belt =
      (typeof body.belt === 'string' ? body.belt : null) ||
      beltFromLevelName(body.surf_level) ||
      levelForScore(score).belt;

    // Skillmap: native {name,pct}[] or external answers.skills {name,p}[].
    let skillmap: { name: string; pct: number }[] = [];
    if (Array.isArray(body.skillmap)) {
      skillmap = body.skillmap;
    } else if (Array.isArray(body?.answers?.skills)) {
      skillmap = body.answers.skills.map((s: any) => ({ name: s.name, pct: s.pct ?? s.p ?? 0 }));
    }

    const res = await createLeadFromQuiz({
      first_name,
      last_name,
      email,
      phone,
      academy_slug,
      belt,
      score,
      skillmap,
    });

    if (!res.ok) {
      return NextResponse.json(res, { status: 400, headers: CORS });
    }
    return NextResponse.json({ ok: true }, { status: 200, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Failed' }, { status: 500, headers: CORS });
  }
}
