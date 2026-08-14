import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Sirve un material (PDF) SIN exponer nunca la URL de Supabase.
//
// Antes, el portal pedía una signed URL del bucket y la abría en una pestaña
// nueva: esa URL quedaba en la barra de direcciones, funcionaba una hora para
// cualquiera y sin login, y se pegaba en WhatsApp en dos toques. El libro One
// Wave era, en la práctica, un link público con caducidad.
//
// Ahora la única URL que existe del lado del cliente es esta, y lleva el portal
// token de la persona. Compartirla es regalar el portal entero — progreso,
// sesiones, evaluaciones — que es el desincentivo que de verdad funciona.
// La signed URL nunca sale del servidor.
//
// Esto NO impide la captura de pantalla, y no pretende hacerlo. Impide que
// exista un link que se pueda pasar.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'coach-presentations';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function denied() {
  // Mismo 404 para "no existe", "no te lo otorgaron" y "token inválido": una
  // respuesta distinta por caso le diría a un curioso qué ids son reales.
  return new NextResponse('Not found', { status: 404 });
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string; id: string } }
) {
  const { token, id } = params;
  if (!token || !UUID_RE.test(token) || !UUID_RE.test(id)) return denied();

  const admin = createAdminClient();

  const { data: resource } = await admin
    .from('coach_resources')
    .select('id, title, file_url, storage_path, active, audience')
    .eq('id', id)
    .maybeSingle();
  if (!resource || !resource.active) return denied();

  // ── ¿Quién pide? Alumno primero, coach después. El token es el mismo tipo de
  // credencial que ya gobierna /portal/[token] y /coach-portal/[token]. ──
  let granted = false;

  const { data: student } = await admin
    .from('students')
    .select('id')
    .eq('portal_token', token)
    .maybeSingle();

  if (student) {
    // Un material marcado solo para coaches no se sirve a un alumno aunque
    // alguien le haya creado el grant por error.
    if (resource.audience === 'coaches') return denied();
    const { data: grant } = await admin
      .from('student_resource_grants')
      .select('student_id')
      .eq('student_id', student.id)
      .eq('resource_id', id)
      .maybeSingle();
    granted = !!grant;
  } else {
    const { data: coach } = await admin
      .from('coaches')
      .select('id')
      .eq('portal_token', token)
      .maybeSingle();
    if (!coach) return denied();
    const { data: grant } = await admin
      .from('coach_resource_grants')
      .select('coach_id')
      .eq('coach_id', coach.id)
      .eq('resource_id', id)
      .maybeSingle();
    granted = !!grant;
  }

  if (!granted) return denied();

  const headers: Record<string, string> = {
    'Content-Type': 'application/pdf',
    // inline: se ve dentro del visor, no dispara una descarga.
    'Content-Disposition': `inline; filename="${(resource.title || 'material').replace(/[^\w .-]/g, '')}.pdf"`,
    // Sin caché compartida: el permiso es por persona, no por URL.
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Robots-Tag': 'noindex, nofollow',
  };

  // Legacy: materiales viejos sin storage_path viven como archivo estático del
  // propio app (/presentations/...). Redirigir ahí no filtra nada externo.
  if (!resource.storage_path) {
    if (!resource.file_url) return denied();
    return NextResponse.redirect(new URL(resource.file_url, _req.url));
  }

  const { data: blob, error } = await admin.storage
    .from(BUCKET)
    .download(resource.storage_path);
  if (error || !blob) return denied();

  return new NextResponse(await blob.arrayBuffer(), { status: 200, headers });
}
