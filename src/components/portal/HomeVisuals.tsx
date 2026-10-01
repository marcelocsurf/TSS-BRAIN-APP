// ═══ Las dos piezas visuales del Home (diseño A, Marcelo 2026-10-01) ═══
// WaterRing: las horas en el agua como un círculo partido en dos colores —
// training (cyan) y free surf (verde) — con el total en el centro ("antes era
// un círculo… era más visual y bonito").
// FlowDial: el Flow Channel como un dial (Marcelo eligió la opción 3): gris =
// boredom, verde = el canal, rojo = anxiety; la aguja = el promedio de flow.
// Home y My progress usan este mismo dial (flowZone: 2.5–3.5 es el canal).

const CYAN = '#00D2FF';
const MINT = '#06D6A0';

export type VisualTone = 'dark' | 'sand';

const fmtHm = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export function WaterRing({ trainingMinutes, freeSurfMinutes, size = 112, tone = 'dark' }: {
  trainingMinutes: number;
  freeSurfMinutes: number;
  size?: number;
  tone?: VisualTone;
}) {
  const t = Math.max(0, trainingMinutes || 0);
  const f = Math.max(0, freeSurfMinutes || 0);
  const total = t + f;
  const stroke = Math.round(size * 0.107);
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const ft = total ? t / total : 0;
  const ff = total ? f / total : 0;
  const ink = tone === 'dark' ? '#F7F9FA' : '#10263B';
  const sub = tone === 'dark' ? '#C9D6DD' : '#55666E';
  const track = tone === 'dark' ? 'rgba(214,225,231,0.14)' : '#DCD7C6';
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  // La cifra grande son las horas; los minutos van debajo (o solo minutos).
  const big = h > 0 ? `${h}h` : `${m}m`;
  const small = h > 0 && m > 0 ? `${m}m` : '';
  const bigSize = big.length <= 3 ? size * 0.2 : size * 0.16;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={total ? `Time in the water: ${fmtHm(total)} — training ${fmtHm(t)}, free surf ${fmtHm(f)}` : 'Time in the water: no sessions yet'}
      style={{ flexShrink: 0, display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      {ft > 0 && (
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={CYAN} strokeWidth={stroke}
          strokeDasharray={`${(c * ft).toFixed(1)} ${c.toFixed(1)}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      )}
      {ff > 0 && (
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={MINT} strokeWidth={stroke}
          strokeDasharray={`${(c * ff).toFixed(1)} ${c.toFixed(1)}`} strokeDashoffset={(-c * ft).toFixed(1)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      )}
      <text x={size / 2} y={size / 2 + (small ? -2 : bigSize * 0.35)} textAnchor="middle" fill={ink}
        style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontWeight: 900, fontSize: bigSize }}>{total ? big : '0h'}</text>
      {small && (
        <text x={size / 2} y={size / 2 + bigSize * 0.85} textAnchor="middle" fill={sub}
          style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontWeight: 700, fontSize: size * 0.125 }}>{small}</text>
      )}
    </svg>
  );
}

/** Zonas del Flow Channel (las mismas que My progress): 1–5 → 0–100%, el canal es 37.5–62.5% (2.5–3.5). */
const EASY_END = 37.5, OPT_END = 62.5;
export function flowZone(avg: number): 'easy' | 'opt' | 'hard' {
  const pct = ((avg - 1) / 4) * 100;
  return pct < EASY_END ? 'easy' : pct > OPT_END ? 'hard' : 'opt';
}

export function FlowDial({ avg, count, minRatings = 2, word, tone = 'dark' }: {
  /** Promedio 1–5 de las calificaciones de flow (null sin datos). */
  avg: number | null | undefined;
  count: number;
  minRatings?: number;
  /** La palabra de la zona (flowWordOf del portal): Optimal, Easy, Hard… */
  word?: string;
  tone?: VisualTone;
}) {
  const has = avg != null && count >= minRatings;
  const a = has ? Math.max(1, Math.min(5, avg as number)) : 3;
  const zone = has ? flowZone(a) : 'opt';
  const dark = tone === 'dark';
  const ink = dark ? '#F7F9FA' : '#10263B';
  const muted = dark ? '#A9BCC7' : '#55666E';
  const grey = dark ? '#3A5566' : '#B9C4CA';
  const red = '#E0555A';
  const color = !has ? muted : zone === 'opt' ? (dark ? MINT : '#066B51') : zone === 'hard' ? (dark ? '#FF9A9A' : '#B03A2E') : (dark ? '#C9D6DD' : '#55666E');
  const headline = zone === 'opt' ? 'In the flow channel' : zone === 'hard' ? 'Above the channel' : 'Below the channel';
  // Las frases de siempre (FlowChannelCard): el consejo no cambia de lugar a lugar.
  const advice = zone === 'easy' ? 'Too easy lately — raise the challenge.' : zone === 'hard' ? 'Too hard lately — lower the challenge.' : "You're in the learning zone — keep it here.";
  // El dial: 180° (izquierda) = 1, 0° (derecha) = 5. Los arcos siguen las zonas.
  const W = 300, cx = 150, cy = 150, r = 118;
  const P = (deg: number) => { const rad = (deg * Math.PI) / 180; return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]; };
  const arc = (d0: number, d1: number) => { const [x0, y0] = P(d0); const [x1, y1] = P(d1); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };
  const deg = (pct: number) => 180 - (pct / 100) * 180;
  const needleDeg = (180 - ((a - 1) / 4) * 180) * (Math.PI / 180);
  const nx = cx + (r - 30) * Math.cos(needleDeg);
  const ny = cy - (r - 30) * Math.sin(needleDeg);
  return (
    <span className="flex flex-col items-center w-full">
      <svg width="100%" viewBox={`0 16 ${W} 160`} role="img" style={{ maxWidth: W, display: 'block' }}
        aria-label={has ? `Flow channel: ${a.toFixed(1)}, ${headline.toLowerCase()}` : 'Flow channel: not enough ratings yet'}>
        <path d={arc(180, deg(EASY_END) + 1)} fill="none" stroke={grey} strokeWidth={22} opacity={has ? 1 : 0.5} />
        <path d={arc(deg(EASY_END) - 1, deg(OPT_END) + 1)} fill="none" stroke={MINT} strokeWidth={22} opacity={has ? 1 : 0.5} />
        <path d={arc(deg(OPT_END) - 1, 0)} fill="none" stroke={red} strokeWidth={22} opacity={has ? 1 : 0.5} />
        {has && <line x1={cx} y1={cy} x2={nx.toFixed(1)} y2={ny.toFixed(1)} stroke={ink} strokeWidth={4} strokeLinecap="round" />}
        <circle cx={cx} cy={cy} r={9} fill={has ? ink : muted} />
        <text x={22} y={172} fill={muted} style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontSize: 10, letterSpacing: 1 }}>BOREDOM</text>
        <text x={278} y={172} textAnchor="end" fill={dark ? '#FF9A9A' : '#B03A2E'} style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontSize: 10, letterSpacing: 1 }}>ANXIETY</text>
      </svg>
      {has ? (
        <>
          <span className="block text-[40px] leading-none mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>{a.toFixed(1)}</span>
          <span className="block text-[15px] font-extrabold uppercase mt-1 text-center" style={{ letterSpacing: '0.06em', color }}>{headline}{word ? ` · ${word}` : ''}</span>
          <span className="block text-[14px] leading-snug text-center mt-1.5" style={{ color: ink }}>{advice}</span>
        </>
      ) : (
        <span className="block text-[14px] leading-snug text-center mt-2" style={{ color: ink }}>
          {count === 1 ? 'Rate 1 more session to see your flow.' : 'Rate 2 sessions to see where your flow lives.'}
        </span>
      )}
    </span>
  );
}
