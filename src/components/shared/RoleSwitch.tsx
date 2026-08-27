'use client';

/**
 * Interruptor de perfil para quien es coach Y atleta.
 *
 * Muestra SIEMPRE las dos caras, con la actual encendida. Antes era un link
 * suelto que decía "Coach view →": había que leerlo para entender que existía
 * otro portal. Así se ve de un vistazo en cuál estás parado y que hay otro.
 */
export function RoleSwitch({
  current,
  otherHref,
  accent,
}: {
  current: 'coach' | 'athlete';
  otherHref: string;
  /** Color de marca del portal donde se pinta. */
  accent: string;
}) {
  const seg = 'px-3 h-7 flex items-center text-[10px] font-bold tracking-wider rounded-full transition-opacity';
  const on = { background: accent, color: '#061C2B' };
  const off = { color: 'rgba(255,255,255,.55)' };
  const label = { coach: 'COACH', athlete: 'ATHLETE' } as const;
  const other = current === 'coach' ? 'athlete' : 'coach';
  return (
    <div
      className="inline-flex items-center rounded-full p-0.5 gap-0.5"
      style={{ background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.14)' }}
    >
      <span className={seg} style={on}>
        {current === 'coach' ? '🧢' : '🏄'} {label[current]}
      </span>
      <a href={otherHref} className={`${seg} hover:opacity-100 opacity-70`} style={off}>
        {other === 'coach' ? '🧢' : '🏄'} {label[other]}
      </a>
    </div>
  );
}
