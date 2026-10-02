// ═══ Las dos piezas visuales del Home (diseño A, Marcelo 2026-10-01) ═══
// WaterRing: las horas en el agua como un círculo partido en dos colores —
// training (cyan) y free surf (verde) — con el total en el centro ("antes era
// un círculo… era más visual y bonito").
// FlowDial: el Flow Channel como "Orbit" (Marcelo 2026-10-02, opción C del
// canvas "Flow channel · v10.1"): un anillo de 270° como el de las horas, el
// canal en cyan (el único color, manual v10.1), una perilla en su promedio y,
// fuera del canal, una línea punteada que muestra el camino de vuelta.
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

export function FlowDial({ avg, count, minRatings = 2, tone = 'dark' }: {
  /** Promedio 1–5 de las calificaciones de flow (null sin datos). */
  avg: number | null | undefined;
  count: number;
  minRatings?: number;
  tone?: VisualTone;
}) {
  const has = avg != null && count >= minRatings;
  // Redondeado al decimal que se muestra: número, zona y perilla siempre dicen lo mismo.
  const v = has ? Math.round(Math.max(1, Math.min(5, avg as number)) * 10) / 10 : 3;
  const zone = flowZone(v);
  const easy = has && zone === 'easy', hard = has && zone === 'hard', inChannel = has && zone === 'opt';
  const dark = tone === 'dark';
  // Sobre arena el cyan de texto no llega al contraste: el número y la raya del
  // canal van en el cyan profundo de los rótulos (#00728A).
  const C = {
    ink: dark ? '#F7F9FA' : '#10263B',
    sub: dark ? '#C9D6DD' : '#10263B',
    muted: dark ? '#8FB3C4' : '#55666E',
    track: dark ? 'rgba(214,225,231,0.14)' : 'rgba(16,38,59,0.12)',
    tick: dark ? '#55666E' : '#A39C8A',
    channel: CYAN,
    channelText: dark ? CYAN : '#00728A',
    knobStroke: dark ? '#061C2B' : '#10263B',
  };
  // Anillo de 270° abierto abajo; ángulos desde las 12, en sentido horario:
  // 1 = −135°, 3 = 0° (arriba), 5 = +135°. El canal 2.5–3.5 = ±33.75°.
  const cx = 162, cy = 116, R = 92, SW = 13, KNOB = 11.5;
  const toDeg = (x: number) => -135 + (x - 1) * 67.5;
  const pt = (deg: number, r: number) => { const a = (deg * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
  const capDeg = (px: number) => (px / R) * (180 / Math.PI);
  const n2 = (n: number) => n.toFixed(2);
  const arc = (d0: number, d1: number, r: number) => {
    const p0 = pt(d0, r), p1 = pt(d1, r);
    return `M${n2(p0[0])} ${n2(p0[1])} A${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${n2(p1[0])} ${n2(p1[1])}`;
  };
  const track = arc(-135, 135, R);
  // Recortado por la tapa redonda: sus bordes visibles caen justo en 2.5 y 3.5.
  const channel = arc(toDeg(2.5) + capDeg(SW / 2), toDeg(3.5) - capDeg(SW / 2), R);
  let ticksMajor = '', ticksMinor = '';
  for (let t = 1; t <= 5.001; t += 0.5) {
    const major = Math.abs(t - Math.round(t)) < 0.01;
    const a = pt(toDeg(t), R + 15), b = pt(toDeg(t), major ? R + 21 : R + 18);
    const seg = `M${n2(a[0])} ${n2(a[1])} L${n2(b[0])} ${n2(b[1])} `;
    if (major) ticksMajor += seg; else ticksMinor += seg;
  }
  const knobDeg = toDeg(v);
  // Fuera del canal: puntos sobre el anillo desde la perilla hasta el cyan.
  let trail: { d: string; dash: string } | null = null;
  if (easy || hard) {
    const t0 = easy ? knobDeg + capDeg(KNOB + 5) : toDeg(3.5) + capDeg(5);
    const t1 = easy ? toDeg(2.5) - capDeg(5) : knobDeg - capDeg(KNOB + 5);
    const len = ((t1 - t0) * Math.PI / 180) * R;
    if (len >= 7) { const n = Math.max(1, Math.round(len / 7)); trail = { d: arc(t0, t1, R), dash: `0 ${(len / n - 0.01).toFixed(3)}` }; }
  }
  const headline = inChannel ? 'In the flow channel' : hard ? 'Above the channel' : 'Below the channel';
  // Las frases de siempre: el consejo no cambia de lugar a lugar.
  const advice = easy ? 'Too easy lately — raise the challenge.' : hard ? 'Too hard lately — lower the challenge.' : "You're in the learning zone — keep it here.";
  const MONO = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontSize: 12, lineHeight: '16px', letterSpacing: '0.18em', textTransform: 'uppercase' as const };
  // La zona en la que estás se enciende: cyan solo para el canal; boredom y
  // anxiety se marcan por forma (raya punteada, los mismos puntos del camino).
  const legend = (on: boolean, isChannel: boolean) => ({
    ...MONO, justifySelf: 'center' as const, padding: '0 0 4px 0.18em',
    color: on ? C.ink : C.muted,
    borderBottom: on ? (isChannel ? `2px solid ${dark ? CYAN : '#00728A'}` : `2px dotted ${C.muted}`) : '2px solid transparent',
  });
  return (
    <span className="flex flex-col w-full">
      <span className="relative block w-full mx-auto" style={{ maxWidth: 324 }}>
        <svg width="100%" viewBox="0 0 324 198" role="img" style={{ display: 'block' }}
          aria-label={has ? `Flow channel: average ${v.toFixed(1)} of 5 across ${count} rated sessions. ${headline}. The channel runs from 2.5 to 3.5.` : 'Flow channel: not enough rated sessions yet'}>
          <path d={ticksMinor} fill="none" stroke={C.tick} strokeWidth={1.5} strokeLinecap="round" />
          <path d={ticksMajor} fill="none" stroke={C.tick} strokeWidth={1.5} strokeLinecap="round" />
          <path d={track} fill="none" stroke={C.track} strokeWidth={SW} strokeLinecap="round" />
          <path d={channel} fill="none" stroke={C.channel} strokeWidth={SW} strokeLinecap="round" opacity={has ? 1 : 0.45} />
          {trail && <path d={trail.d} fill="none" stroke={C.muted} strokeWidth={3} strokeLinecap="round" strokeDasharray={trail.dash} />}
          {has && (
            <circle cx={cx} cy={cy - R} r={10} fill="#F7F9FA" stroke={C.knobStroke} strokeWidth={3}
              className="motion-reduce:transition-none"
              style={{ transformBox: 'view-box', transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${knobDeg.toFixed(2)}deg)`, transition: 'transform 480ms cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
          )}
        </svg>
        <span aria-hidden="true" className="absolute inset-x-0 flex flex-col items-center gap-1" style={{ top: '38.4%' }}>
          <span className="block leading-[0.95]" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, fontSize: 55, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: !has ? C.muted : inChannel ? C.channelText : C.ink }}>
            {has ? v.toFixed(1) : '–'}
          </span>
          <span className="block" style={{ ...MONO, letterSpacing: '0.2em', paddingLeft: '0.2em', color: dark ? C.sub : C.muted }}>Average</span>
        </span>
      </span>
      <span className="grid mt-1.5" style={{ gridTemplateColumns: '3fr 2fr 3fr', textAlign: 'center' }}>
        <span style={legend(easy, false)}>Boredom</span>
        <span style={legend(inChannel, true)}>Channel</span>
        <span style={legend(hard, false)}>Anxiety</span>
      </span>
      {has ? (
        <>
          <span className="block mt-[18px] text-center uppercase" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', lineHeight: 0.95, color: C.ink }}>{headline}</span>
          <span className="block mt-2 text-center text-[13px] leading-normal" style={{ color: C.sub, textWrap: 'balance' as any }}>{advice}</span>
        </>
      ) : (
        <span className="block mt-4 text-center text-[14px] leading-snug" style={{ color: C.sub }}>
          {count === 1 ? 'Rate 1 more session to see your flow.' : 'Rate 2 sessions to see where your flow lives.'}
        </span>
      )}
    </span>
  );
}
