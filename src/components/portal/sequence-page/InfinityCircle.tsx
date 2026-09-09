// ═══ La imagen del Círculo Infinito ═══
// Marcelo (2026-09-09, con dos referencias: su diagrama "The infinite circle
// concept" y el póster "El Círculo Infinito"): un círculo con los pasos como
// nodos, el ∞ en el centro, "loop until the wave ends" y la secuencia de
// entrada (una vez por ola) debajo. Cada nodo lleva el color de su comando.
import { COMMAND_COLORS, HOLD_COLOR } from './WaveBoard';

const PAPER = '#F7F9FA', CYAN = '#00D2FF';
const MONO = 'var(--font-plex), IBM Plex Mono, Menlo, monospace';

export function InfinityCircle({ side = 'fs' }: { side?: 'fs' | 'bs' }) {
  const cx = 360, cy = 230, r = 150;
  // Cinco nodos en sentido horario desde arriba. Etiquetas por lado.
  const nodes = [
    { angle: -90, command: 'posture' as const, n: '01', label: 'Posture', sub: 'start · and end' },
    { angle: -18, command: 'rail' as const, hold: true, n: '02', label: 'Rotation + hold', sub: side === 'fs' ? 'the bottom turn' : 'the bottom turn backside' },
    { angle: 54, command: 'projection' as const, n: '03', label: 'Projection', sub: side === 'fs' ? 'extend, weight forward' : 'the Choke' },
    { angle: 126, command: 'maneuver' as const, n: '04', label: 'Maneuver', sub: side === 'fs' ? 'the Cruz' : 'the Tapaloco' },
    { angle: 198, command: 'closure' as const, n: '05', label: 'Closure', sub: side === 'fs' ? 'the Grenade' : 'the elbow strike · the M' },
  ];
  const pos = (deg: number, rad = r) => ({ x: cx + rad * Math.cos((deg * Math.PI) / 180), y: cy + rad * Math.sin((deg * Math.PI) / 180) });
  // Arcos coloreados entre nodos (el color del tramo = el paso que arranca).
  const arc = (a: number, b: number) => {
    const p = pos(a), q = pos(b);
    return `M${p.x.toFixed(1)},${p.y.toFixed(1)} A${r},${r} 0 0 1 ${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  };
  const angles = nodes.map((n) => n.angle);

  return (
    <svg viewBox="0 0 720 470" role="img" aria-label="The Infinite Circle: posture, rotation and hold, projection, maneuver, closure, back to posture" className="w-full h-auto block">
      <defs>
        <pattern id="ic-grid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36,0 L0,0 0,36" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="720" height="470" fill="url(#ic-grid)" />

      {/* Arcos por comando */}
      {nodes.map((n, i) => {
        const next = angles[(i + 1) % angles.length] + (i === angles.length - 1 ? 360 : 0);
        return <path key={n.n} d={arc(n.angle, next)} stroke={COMMAND_COLORS[n.command]} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".95" />;
      })}
      {/* Hold: anillo celeste sobre el tramo del bottom turn */}
      <path d={arc(nodes[1].angle, nodes[2].angle)} stroke={HOLD_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 5" />

      {/* Centro */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="64" fontWeight="700" fill={CYAN} fontFamily="Archivo, sans-serif">∞</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize="11" fill="rgba(247,249,250,.62)" fontFamily={MONO} letterSpacing="3">LOOP UNTIL THE WAVE ENDS</text>

      {/* Nodos y etiquetas */}
      {nodes.map((n) => {
        const p = pos(n.angle);
        const lp = pos(n.angle, r + 38);
        const anchor = Math.abs(Math.cos((n.angle * Math.PI) / 180)) < 0.2 ? 'middle' : Math.cos((n.angle * Math.PI) / 180) > 0 ? 'start' : 'end';
        const dy = Math.sin((n.angle * Math.PI) / 180) > 0.6 ? 14 : Math.sin((n.angle * Math.PI) / 180) < -0.6 ? -8 : 4;
        return (
          <g key={n.n}>
            <circle cx={p.x} cy={p.y} r="12" fill="#061C2B" stroke={COMMAND_COLORS[n.command]} strokeWidth="4" />
            {n.hold && <circle cx={p.x} cy={p.y} r="18" fill="none" stroke={HOLD_COLOR} strokeWidth="2" />}
            <text x={lp.x} y={lp.y + dy} textAnchor={anchor} fontSize="13" fontWeight="700" fill={PAPER} fontFamily={MONO} letterSpacing="1.5">{n.n} {n.label.toUpperCase()}</text>
            <text x={lp.x} y={lp.y + dy + 15} textAnchor={anchor} fontSize="11" fill="rgba(247,249,250,.62)" fontFamily="Archivo, sans-serif">{n.sub}</text>
          </g>
        );
      })}

      {/* Entrada, una vez por ola */}
      <text x={cx} y="440" textAnchor="middle" fontSize="10.5" fill="rgba(247,249,250,.55)" fontFamily={MONO} letterSpacing="2">ENTRY · ONCE PER WAVE · SWEET SPOT · CHASE · ANGLE · COBRA + LINE · POP-UP</text>
    </svg>
  );
}
