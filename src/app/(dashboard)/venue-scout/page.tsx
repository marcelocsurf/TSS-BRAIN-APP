import { VenueScoutLauncher } from '@/components/venue-scout/VenueScoutLauncher';

export const dynamic = 'force-dynamic';

export default function VenueScoutPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Venue Scout
        </h2>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Análisis táctico de spots · competencia y sesión libre
        </p>
      </div>
      <VenueScoutLauncher variant="light" />
      <p className="text-xs text-gray-400 mt-3">
        Se abre a pantalla completa. Es una herramienta de análisis — tu trabajo queda en este dispositivo (no se guarda en el servidor).
      </p>
    </div>
  );
}
