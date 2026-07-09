import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listSpaces, listBookingsForDay } from '@/lib/actions/spaces';
import { SpaceBoard } from '@/components/spaces/SpaceBoard';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function todayIso(): string {
  const now = new Date();
  const es = new Date(now.getTime() - 6 * 60 * 60 * 1000); // El Salvador
  return es.toISOString().slice(0, 10);
}

export default async function SpacesPage() {
  const me = await getCurrentCoach();
  if (!me) redirect('/dashboard');

  const today = todayIso();
  const [spaces, bookings] = await Promise.all([listSpaces(), listBookingsForDay(today)]);
  const canManage = await isCoordinatorOrAbove(me.role);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Espacios
        </h2>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Reserva de espacios de la academia · {spaces.length} espacio{spaces.length === 1 ? '' : 's'}
        </p>
      </div>

      {spaces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500">Aún no hay espacios en esta academia.</p>
          {canManage && <p className="text-xs text-gray-400 mt-1">Pedí al admin que los cargue, o se agregan desde aquí (próximamente).</p>}
        </div>
      ) : (
        <SpaceBoard
          spaces={spaces}
          initialDate={today}
          initialBookings={bookings}
          currentCoachId={me.id}
          canManage={canManage}
        />
      )}
    </div>
  );
}
