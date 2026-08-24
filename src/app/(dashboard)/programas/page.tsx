import { redirect } from 'next/navigation';
import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { ProgramasManager } from './ProgramasManager';

// Programas de entreno (línea Alto Rendimiento) — SOLO admin de plataforma
// (is_platform_admin, como /academies). El rol 'admin' de coaches es de
// academia y NO alcanza: esta superficie busca alumnos de todas las
// academias. El coach con Escalón 2 tendrá su versión recortada en el Paso 4.
export default async function ProgramasPage({
  searchParams,
}: {
  searchParams?: Promise<{ programa?: string }>;
}) {
  const platform = await isRealPlatformAdmin().catch(() => false);
  if (!platform) redirect('/');

  // Deep-link desde el cockpit /hp: "✎ Editar su plan" de un atleta abre
  // directo el editor de SU programa (?programa={id}).
  const sp = await searchParams;
  return <ProgramasManager initialProgramId={sp?.programa ?? null} />;
}
