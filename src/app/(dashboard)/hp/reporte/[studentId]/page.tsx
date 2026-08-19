import { isRealPlatformAdmin } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { ReportView } from './ReportView';

// ─── Reporte del atleta (el "Reporte PDF" de la app HP) ───
// Página imprimible: el botón Imprimir → Guardar como PDF del navegador
// produce el PDF. Solo admin de plataforma.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportePage({ params }: { params: Promise<{ studentId: string }> }) {
  const ok = await isRealPlatformAdmin().catch(() => false);
  if (!ok) redirect('/dashboard');
  const { studentId } = await params;
  return <ReportView studentId={studentId} />;
}
