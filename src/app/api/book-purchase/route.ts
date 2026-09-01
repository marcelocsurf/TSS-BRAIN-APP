import { NextRequest, NextResponse } from 'next/server';
import { grantBookAccess } from '@/lib/actions/book-purchase';
import { rateLimitOk, clientIp } from '@/lib/rate-limit';

// ═══ /api/book-purchase — webhook de Wompi (venta del libro ONE WAVE) ═══
//
// Wompi SV manda un HTTP POST a la URL registrada cuando una transacción es
// exitosa (docs.wompi.sv/webhook). El payload NO viene firmado, así que la
// autenticidad se resuelve con un SECRETO EN LA URL: al registrar el webhook
// en Wompi se usa /api/book-purchase?k=<BOOK_WEBHOOK_SECRET>. Sin secreto
// válido → 401 y nada se otorga (nadie puede "regalarse" el libro con un
// POST).
//
// Campos del payload (verbatim de la doc): IdTransaccion,
// ResultadoTransaccion ("ExitosaAprobada"), Monto, EnlacePago{Id,
// IdentificadorEnlaceComercio, NombreProducto}, EsProductiva, y el cliente
// (Nombre/Email — la doc varía el casing, se aceptan ambos).

export const dynamic = 'force-dynamic';

const pick = (obj: any, ...keys: string[]) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
};

export async function POST(req: NextRequest) {
  if (!rateLimitOk(`book:${clientIp(req.headers)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });
  }

  const secret = process.env.BOOK_WEBHOOK_SECRET;
  if (!secret) {
    // Sin configurar todavía (falta la cuenta de Wompi): el endpoint existe
    // pero no otorga nada.
    return NextResponse.json({ ok: false, error: 'Not configured.' }, { status: 503 });
  }
  if (req.nextUrl.searchParams.get('k') !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  // Log completo del payload real: la doc de Wompi es parca — el primer
  // pago de verdad nos confirma los nombres de campo exactos.
  console.log('[book-purchase] webhook payload:', JSON.stringify(body).slice(0, 2000));

  const resultado = pick(body, 'ResultadoTransaccion', 'resultadoTransaccion');
  if (resultado && resultado !== 'ExitosaAprobada') {
    // Rechazadas/fallidas: se registran y nada más.
    return NextResponse.json({ ok: true, ignored: resultado });
  }

  const cliente = body?.cliente ?? body?.Cliente ?? {};
  const email =
    pick(cliente, 'Email', 'email', 'CorreoElectronico', 'correoElectronico') ??
    pick(body, 'Email', 'email', 'EmailCliente', 'emailCliente');
  const nombre = pick(cliente, 'Nombre', 'nombre', 'NombreCompleto') ?? pick(body, 'Nombre', 'nombre');
  const telefono = pick(cliente, 'Telefono', 'telefono') ?? pick(body, 'Telefono', 'telefono');

  if (!email) {
    // Sin email no hay a quién entregar: 200 para que Wompi no reintente en
    // loop, pero queda logueado para resolver a mano.
    console.error('[book-purchase] approved payment WITHOUT email — resolve manually. IdTransaccion:', pick(body, 'IdTransaccion', 'idTransaccion'));
    return NextResponse.json({ ok: true, warning: 'No email in payload — logged for manual delivery.' });
  }

  const r = await grantBookAccess({ email, name: nombre, phone: telefono, source: 'wompi' });
  if (!r.ok) {
    console.error('[book-purchase] grant failed:', r.error);
    return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
