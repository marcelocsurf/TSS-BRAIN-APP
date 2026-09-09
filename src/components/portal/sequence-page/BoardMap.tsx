// ═══ El mapa de la tabla ═══
// La tabla de Marcelo: el blanco (pie de adelante, D) sobre el stringer con
// sus anillos de tolerancia — verde centro, amarillo cerca, rosado afuera —
// y las tres bandas de la cola para el pie de atrás: P3 full speed (verde),
// P2 neutral (rosado), P1 maneuvers (amarillo).
import type { BackFoot } from '@/lib/sequence-pages/types';

const OUTLINE =
  'M160,10 C184,10 216,80 234,200 C248,290 252,380 247,460 C242,540 226,620 208,674 C201,696 182,708 160,710 ' +
  'C138,708 119,696 112,674 C94,620 78,540 73,460 C68,380 72,290 86,200 C104,80 136,10 160,10 z';

const BAND_Y: Record<BackFoot, number> = { P3: 586, P2: 628, P1: 680 };

export function BoardMap({ active, compact = false }: { active?: BackFoot[]; compact?: boolean }) {
  const on = new Set(active ?? []);
  return (
    <svg viewBox="0 0 320 730" role="img" aria-label="Your board: the target for the front foot and the three tail bands for the back foot"
      className="h-auto block mx-auto" style={{ width: compact ? 150 : '100%', maxWidth: 260 }}>
      <defs>
        <clipPath id="bm-clip"><path d={OUTLINE} /></clipPath>
        <pattern id="bm-hatch" width="9" height="9" patternUnits="userSpaceOnUse">
          <line x1="4.5" y1="0" x2="4.5" y2="9" stroke="#0b1b28" strokeWidth="1.2" opacity=".5" />
        </pattern>
      </defs>
      <path d={OUTLINE} fill="#000" opacity=".25" transform="translate(3,5)" />
      <path d={OUTLINE} fill="#F7F9FA" stroke="#0b1b28" strokeWidth="3" strokeLinejoin="round" />
      <g clipPath="url(#bm-clip)">
        <rect x="60" y="372" width="200" height="200" fill="url(#bm-hatch)" />
        <path d="M60,572 C110,548 210,548 260,572 L260,610 C210,586 110,586 60,610 z" fill="#8EE39A" opacity={on.size && !on.has('P3') ? 0.35 : 1} />
        <path d="M60,610 C110,586 210,586 260,610 L260,652 C210,628 110,628 60,652 z" fill="#F58AC0" opacity={on.size && !on.has('P2') ? 0.35 : 1} />
        <path d="M60,652 C110,628 210,628 260,652 L260,730 L60,730 z" fill="#F3E24A" opacity={on.size && !on.has('P1') ? 0.35 : 1} />
        <path d="M60,572 C110,548 210,548 260,572" fill="none" stroke="#0b1b28" strokeWidth="2" />
        <path d="M60,610 C110,586 210,586 260,610" fill="none" stroke="#0b1b28" strokeWidth="2" />
        <path d="M60,652 C110,628 210,628 260,652" fill="none" stroke="#0b1b28" strokeWidth="2" />
      </g>
      <line x1="160" y1="10" x2="160" y2="710" stroke="#0b1b28" strokeWidth="2" />
      <line x1="72" y1="372" x2="248" y2="372" stroke="#0b1b28" strokeWidth="2.5" />
      <circle cx="160" cy="372" r="86" fill="#F58AC0" stroke="#0b1b28" strokeWidth="3" />
      <circle cx="160" cy="372" r="64" fill="#F7F9FA" stroke="#0b1b28" strokeWidth="3" />
      <circle cx="160" cy="372" r="42" fill="#F3E24A" stroke="#0b1b28" strokeWidth="3" />
      <circle cx="160" cy="372" r="20" fill="#8EE39A" stroke="#0b1b28" strokeWidth="3" />
      <g fontFamily="var(--font-plex), IBM Plex Mono, Menlo, monospace" fontSize="13" fontWeight="700">
        <ellipse cx="160" cy="372" rx="13" ry="25" fill="#061C2B" opacity=".85" transform="rotate(80 160 372)" />
        <text x="153" y="377" fill="#F0F7FA">D</text>
        {(['P3', 'P2', 'P1'] as BackFoot[]).map((p) => (
          <g key={p} opacity={on.size && !on.has(p) ? 0.25 : 0.7}>
            <ellipse cx="160" cy={BAND_Y[p]} rx="11" ry="21" fill="#061C2B" transform={`rotate(80 160 ${BAND_Y[p]})`} />
            <text x="151" y={BAND_Y[p] + 5} fill="#F0F7FA">{p}</text>
          </g>
        ))}
      </g>
      {!compact && (
        <g fontFamily="var(--font-plex), IBM Plex Mono, Menlo, monospace" fontSize="12" fill="rgba(247,249,250,.72)">
          <text x="262" y="590">P3 · speed</text>
          <text x="262" y="632">P2 · neutral</text>
          <text x="262" y="684">P1 · maneuver</text>
          <text x="250" y="300">D · centre</text>
          <text x="10" y="30">NOSE</text><text x="10" y="720">TAIL</text>
        </g>
      )}
    </svg>
  );
}
