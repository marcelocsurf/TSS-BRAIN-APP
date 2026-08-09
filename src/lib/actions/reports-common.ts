'use server';

import { getCurrentCoach, type CurrentCoach } from '@/lib/actions/auth';

// Resolución de alcance (scope) compartida por TODOS los reportes.
// Los reportes usan createAdminClient() (salta RLS), así que cada query DEBE
// filtrar por academy_id a mano. Este resolver centraliza esa decisión:
//   - coordinador/admin de academia → SIEMPRE su propia academia
//   - platform admin → la academia del override (?academy=), su act-as, o TODAS
// Los coaches/asistentes NO ven reportes (los de dinero menos que nadie).

export interface ReportScope {
  ok: boolean;
  me?: CurrentCoach;
  /** null = todas las academias (solo platform admin sin override). */
  scopeAcademyId?: string | null;
  /** true si puede elegir academia / ver el consolidado de todas. */
  isPlatformAdmin?: boolean;
}

export async function resolveReportScope(academyIdOverride?: string | null): Promise<ReportScope> {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'admin' || me.role === 'coordinator')) {
    return { ok: false };
  }
  const scopeAcademyId = me.is_platform_admin
    ? (academyIdOverride || me.academy_id || null)
    : (me.academy_id ?? null);
  return { ok: true, me, scopeAcademyId, isPlatformAdmin: !!me.is_platform_admin };
}
