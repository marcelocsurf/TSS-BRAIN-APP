import { listCommunityPosts } from '@/lib/actions/community';
import { CommunityManager } from '@/components/community/CommunityManager';

// ═══ THE LINEUP — el panel donde Marcelo publica para la comunidad ═══
//
// Canal, no foro (plan 2026-08-14): él postea, los miembros reaccionan.
// Lo publicado aparece en el portal del alumno: en el Home como no leído
// y en la pestaña The Lineup como archivo permanente.
//
// REGLA DE LANZAMIENTO (el único riesgo que lo arruina): no publicar la
// primera pieza hasta tener 6-8 cargadas. Un alumno que entra y ve dos
// posts concluye "no lo usa nadie", y esa conclusión no se revierte. La
// pestaña del portal recién aparece cuando hay algo publicado.

export const dynamic = 'force-dynamic';

export default async function CommunityAdminPage() {
  const res = await listCommunityPosts();
  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-[var(--tss-navy)]">The Lineup · Comunidad</h1>
      <p className="text-[13px] text-gray-500 mt-1">
        Lo que publiques acá les llega a los miembros: al Home como nuevo y a la
        pestaña The Lineup como archivo. La pestaña recién les aparece cuando hay
        algo publicado — cargá 6-8 piezas antes de publicar la primera.
      </p>
      {res.ok ? (
        <CommunityManager initial={res.posts} />
      ) : (
        <p className="mt-6 text-sm text-red-600">{res.error}</p>
      )}
    </div>
  );
}
