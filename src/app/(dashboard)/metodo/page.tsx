import { getMethodHQ } from '@/lib/actions/method';
import { MethodHQ } from '@/components/method/MethodHQ';

// ═══ EL MÉTODO — el cuartel general del negocio ═══
//
// Solo el dueño (is_platform_admin — el gate vive en las actions). No es
// la biblioteca: acá no se otorga nada a nadie. Es donde el método se
// guarda, se ordena y se DESARROLLA: cada área tiene su bóveda de
// documentos y su checklist de lo que debería existir.

export const dynamic = 'force-dynamic';

export default async function MetodoPage() {
  const res = await getMethodHQ();
  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <h1 className="text-xl font-bold text-[var(--tss-navy)]">El Método · Cuartel general</h1>
      <p className="text-[13px] text-gray-500 mt-1 max-w-2xl">
        Todo lo que ES el negocio, en un solo lugar: doctrina, marca, certificación,
        negocio, mercadeo, operaciones y legal. Cada área guarda sus documentos y te
        muestra qué falta desarrollar. Nada de esto se otorga a coaches ni alumnos —
        para eso está la biblioteca.
      </p>
      {res.ok ? (
        <MethodHQ initial={res.data} />
      ) : (
        <p className="mt-6 text-sm text-red-600">{res.error}</p>
      )}
    </div>
  );
}
