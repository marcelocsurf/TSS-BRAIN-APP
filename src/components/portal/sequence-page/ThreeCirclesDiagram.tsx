// ═══ Los tres círculos de poder — según el logo original de Marcelo ═══
// Referencia (2026-09-09): lockup oficial "3 Circles of Power Surf System":
// tres círculos en triángulo (uno arriba, dos abajo) con un espiral en el
// centro; el diagrama original lleva "4 Basic Movement · P R C H" arriba,
// "Feet position on the Surfboard" con la tablita a la izquierda, "Dynamic of
// the wave" con la onda a la derecha, y FLOW señalando el centro.
// Sobre Ink, trazo Paper; el círculo activo se pinta con su color de marca.
const CYAN = '#00D2FF', GOLD = '#FFD166', VIOLET = '#B388FF', PAPER = '#F7F9FA', INK = '#061C2B';
const MONO = 'var(--font-plex), IBM Plex Mono, Menlo, monospace';
const SANS = 'var(--font-archivo), Archivo, sans-serif';

export function ThreeCirclesDiagram({ active }: { active?: 'body' | 'board' | 'wave' }) {
  const R = 118;
  const C = {
    body: { cx: 300, cy: 138, color: CYAN },
    board: { cx: 228, cy: 258, color: GOLD },
    wave: { cx: 372, cy: 258, color: VIOLET },
  };
  const stroke = (k: keyof typeof C) => (active === k ? C[k].color : 'rgba(247,249,250,.85)');
  const width = (k: keyof typeof C) => (active === k ? 5 : 3);
  const fade = (k: keyof typeof C) => (!active || active === k ? 1 : 0.45);
  // Espiral del centro (el del logo).
  const spiral = (() => {
    const cx = 300, cy = 210; let d = ''; const turns = 3.2, steps = 90;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2; const r = 1.2 + (i / steps) * 13;
      const x = cx + r * Math.cos(t), y = cy + r * Math.sin(t);
      d += (i ? ' L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    return d;
  })();

  return (
    <svg viewBox="0 0 600 400" role="img" aria-label="The Three Circles of Power: 4 basic movements P·R·C·H, feet position on the surfboard, dynamic of the wave; where they overlap, flow" className="w-full h-auto block">
      {/* Círculos */}
      {(['body', 'board', 'wave'] as const).map((k) => (
        <g key={k} opacity={fade(k)}>
          <circle cx={C[k].cx} cy={C[k].cy} r={R} fill={C[k].color} opacity={active === k ? 0.08 : 0.03} />
          <circle cx={C[k].cx} cy={C[k].cy} r={R} fill="none" stroke={stroke(k)} strokeWidth={width(k)} />
        </g>
      ))}

      {/* 01 · Cuerpo: 4 Basic Movement · P R C H */}
      <g opacity={fade('body')}>
        <text x="300" y="82" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={PAPER} fontFamily={SANS}>4 basic movements</text>
        {['P', 'R', 'C', 'H'].map((l, i) => (
          <g key={l}>
            <circle cx={255 + i * 30} cy="112" r="12" fill="none" stroke={PAPER} strokeWidth="2" />
            <text x={255 + i * 30} y="116.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={PAPER} fontFamily={SANS}>{l}</text>
          </g>
        ))}
        <text x="300" y="42" textAnchor="middle" fontSize="10.5" fill="rgba(247,249,250,.62)" fontFamily={MONO} letterSpacing="2">01 BODY</text>
      </g>

      {/* 02 · Tabla: feet position on the surfboard (tablita con 3 posiciones) */}
      <g opacity={fade('board')}>
        <text x="172" y="252" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={PAPER} fontFamily={SANS}>
          <tspan x="172" dy="0">Feet position</tspan>
          <tspan x="172" dy="14">on the surfboard</tspan>
        </text>
        <path d="M232,214 C246,232 250,282 246,310 C244,326 236,334 232,336 C228,334 220,326 218,310 C214,282 218,232 232,214 z" fill={INK} stroke={PAPER} strokeWidth="2" />
        {[276, 296, 316].map((y, i) => <circle key={y} cx="232" cy={y} r={5.5 - i * 0.6} fill="none" stroke={PAPER} strokeWidth="1.8" />)}
        <text x="140" y="368" textAnchor="middle" fontSize="10.5" fill="rgba(247,249,250,.62)" fontFamily={MONO} letterSpacing="2">02 BOARD</text>
      </g>

      {/* 03 · Ola: dynamic of the wave (la onda) */}
      <g opacity={fade('wave')}>
        <text x="418" y="252" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={PAPER} fontFamily={SANS}>
          <tspan x="418" dy="0">Dynamic of</tspan>
          <tspan x="418" dy="14">the wave</tspan>
        </text>
        <path d="M368,304 C368,290 380,290 380,304 C380,318 392,318 392,304 C392,290 404,290 404,304 C404,318 416,318 416,304 C416,290 428,290 428,304 C428,318 440,318 440,304 L440,296" fill="none" stroke={PAPER} strokeWidth="2.2" strokeLinecap="round" />
        <text x="460" y="368" textAnchor="middle" fontSize="10.5" fill="rgba(247,249,250,.62)" fontFamily={MONO} letterSpacing="2">03 WAVE</text>
      </g>

      {/* Centro: el espiral y FLOW */}
      <path d={spiral} fill="none" stroke={PAPER} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="318" y1="210" x2="470" y2="210" stroke="rgba(247,249,250,.5)" strokeWidth="1" />
      <text x="476" y="214" fontSize="13" fontWeight="800" fill={PAPER} fontFamily={SANS} letterSpacing="1">FLOW</text>
      <text x="300" y="392" textAnchor="middle" fontSize="10.5" fill="rgba(247,249,250,.55)" fontFamily={MONO} letterSpacing="2">3 CIRCLES OF POWER · SURF SYSTEM</text>
    </svg>
  );
}
