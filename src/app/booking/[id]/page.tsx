import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { getPublicBooking } from '@/lib/actions/public-classes';
import { ManageBooking } from './ManageBooking';

// Gestión de reserva por el CLIENTE (link del email de confirmación).
// Política 24 h: cancelar antes es gratis; dentro, se debe la clase completa.

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getPublicBooking(id).catch(() => null);

  return (
    <div className={`min-h-screen pb-16 ${archivo.variable} ${plexMono.variable}`} style={{ background: '#F7F9FA' }}>
      <div className="max-w-md mx-auto px-4 pt-8">
        {!booking ? (
          <p className="text-sm text-gray-500 text-center py-10">This booking link is not valid.</p>
        ) : (
          <ManageBooking booking={booking} />
        )}
      </div>
    </div>
  );
}
