// ═══ EL TOKEN DEL PORTAL ES LA CREDENCIAL DEL ALUMNO ═══
// Las acciones del portal usan el cliente admin, que se salta RLS. Si además
// reciben el studentId desde el navegador, cualquiera con el UUID de otro
// alumno lee y escribe sus datos. El token viaja en la URL, ya lo validó la
// página, y es lo único que el servidor puede creer.
//
// Este módulo NO lleva 'use server' a propósito: si lo llevara, cada export
// sería un endpoint público más, que es justo lo que estamos cerrando.

import { createAdminClient } from '@/lib/supabase/admin';

export async function studentIdFromPortalToken(portalToken: string): Promise<string | null> {
  if (!portalToken || typeof portalToken !== 'string') return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('students')
    .select('id')
    .eq('portal_token', portalToken)
    .maybeSingle();
  // Un error de base NO es "este alumno no existe": si se traga, una caída
  // momentánea se ve como "no autorizado" o como un portal vacío.
  if (error) throw error;
  return data?.id ?? null;
}
