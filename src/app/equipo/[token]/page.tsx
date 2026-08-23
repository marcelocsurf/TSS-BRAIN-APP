import { SpecialistPortal } from '@/components/specialist/SpecialistPortal';

// ═══ PORTAL DEL EQUIPO HP (especialistas) — token-gated ═══
// Psicólogo, prep. físico, nutricionista, head coach y asistente ven acá a
// SUS atletas (los de sus temporadas activas): plan, score, muro del equipo,
// dieta, sesiones online y citas. Staff-facing → español. Brand v10.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function EquipoPage({ params }: Props) {
  const { token } = await params;
  return <SpecialistPortal token={token} />;
}
