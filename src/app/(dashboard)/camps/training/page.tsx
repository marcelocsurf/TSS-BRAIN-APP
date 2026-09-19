import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentCoach } from '@/lib/actions/auth';
import { listTrainingCoaches, listTrainingScenarios } from '@/lib/actions/training';
import { TrainingPanel } from './TrainingPanel';

export const dynamic = 'force-dynamic';

export default async function TrainingPage({ searchParams }: { searchParams: Promise<{ coach?: string; scenario?: string; start?: string }> }) {
  // Preselección por URL (?coach=oso&scenario=camp_yb,camp_bb&start=2026-09-25):
  // para armar un escenario puntual sin tocar veinte chips.
  const sp = await searchParams;
  const preset = sp.coach || sp.scenario || sp.start ? { coach: sp.coach ?? null, scenarios: (sp.scenario ?? '').split(',').filter(Boolean), start: sp.start ?? null } : null;
  const me = await getCurrentCoach();
  if (!me || !['admin', 'coordinator'].includes(me.role)) redirect('/camps');
  const [coaches, scenarios] = await Promise.all([listTrainingCoaches(), listTrainingScenarios()]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <Link href="/camps" className="text-[12px] text-[#55666E] hover:underline">← Servicios</Link>
        <h1 className="text-2xl font-bold text-[#10263B] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>Capacitación de coaches</h1>
        <p className="text-sm text-[#55666E] mt-1 max-w-xl">
          Crea, por cada coach elegido, tres servicios de PRUEBA con alumnos de prueba: un surf camp de 6 días, una clase de surf y una clase de skate.
          El coach los ve en su portal con la franja “PRUEBA” y sigue el flujo normal (plan, dar la clase, cerrar, evaluación final).
          Nada de esto manda correos ni encuestas, no cambia cintas ni cuenta para nómina o reportes. Al terminar, “Borrar pruebas” lo limpia todo.
        </p>
      </div>
      {!me.academy_id ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          Sos admin sin academia activa. Entrá a <Link href="/academies" className="underline font-semibold">Academias</Link> y tocá “Actuar como” en Puro Surf; después volvé acá.
        </div>
      ) : (
        <TrainingPanel coaches={coaches} scenarios={scenarios} defaultDate={preset?.start && /^\d{4}-\d{2}-\d{2}$/.test(preset.start) ? preset.start : today} preset={preset} />
      )}
    </div>
  );
}
