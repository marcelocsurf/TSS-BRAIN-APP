'use server';

// ═══ Enviar ONE WAVE a mano (admin) ═══
//
// Pedido de Marcelo (2026-09-01): poder mandarle el libro-en-portal a
// quien él quiera — para probar el circuito completo y pulir la
// experiencia antes (y después) de conectar Wompi. Mismo motor que la
// compra real (grantBookAccess): crea/encuentra al alumno, otorga el
// recurso y manda el email de entrega con su link de portal.

import { getCurrentCoach, isRealPlatformAdmin } from '@/lib/actions/auth';
import { grantBookAccess } from './book-purchase';

export async function adminSendBook(input: {
  email: string;
  name?: string | null;
  phone?: string | null;
}): Promise<{ ok: boolean; error?: string; portal_url?: string }> {
  // Mismo gate que la página Library: admin del sistema o dueño.
  const me = await getCurrentCoach();
  const isPlatform = await isRealPlatformAdmin().catch(() => false);
  if (!me || (!isPlatform && me.role !== 'admin')) {
    return { ok: false, error: 'Solo un admin puede enviar el libro.' };
  }
  return grantBookAccess({ ...input, source: `manual:${me.id}` });
}
