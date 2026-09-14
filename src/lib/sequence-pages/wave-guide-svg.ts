// ═══ WAVE GUIDE · la cara de la ola ilustrada, con el recorrido original ═══
//
// Línea de diseño aprobada por Marcelo (2026-09-14, imágenes "Backside pumping
// four-zone wave guide" regular + espejada): ola más alta junto al punto de
// rompimiento y más baja hacia el hombro, pocket en la esquina donde rompe,
// cuatro zonas que cubren toda la cara (Z4 desde la cresta, Z1 hasta el flat),
// recorrido por tramos con el color de cada comando, líneas celestes de Hold,
// flecha al final, etiquetas y leyenda.
//
// FUENTE DE VERDAD DEL RECORRIDO: los `segments` de cada secuencia
// (src/lib/sequence-pages/bb-seq-*.ts), dibujados en el viewBox 720×300 del
// tablero plano original (zonas de 55 px entre y=30 y y=250). Acá NO se
// redibujan: se aplica una transformación determinista que estira la altura
// de la cara según x (cresta a y=30 junto al pocket, a y=110 en el hombro)
// manteniendo cada punto en la misma zona y a la misma profundidad relativa.
// Curvas, puntos de transición, colores y Hold se conservan.
//
// Puro TypeScript sin React: lo usa el componente <WaveGuide/> del portal y el
// script de exportación (scripts/export-wave-guides.ts) que genera los SVG/PNG
// del paquete tss-design-handoff. Una sola fuente para las dos cosas.

import type { WaveBoardData, Command } from './types';

export const COMMAND_COLORS: Record<Command, string> = {
  posture: '#FF3B3B',
  rail: '#22C55E',
  projection: '#FFD400',
  maneuver: '#2F6BFF',
  closure: '#FF5FA2',
};
export const HOLD_COLOR = '#7DE3FF';
export const POCKET_COLOR = '#B388FF';
export const COMMAND_LABELS: Record<Command, string> = {
  posture: 'Posture',
  rail: 'Rotation / rail',
  projection: 'Projection',
  maneuver: 'Maneuver',
  closure: 'Closure',
};

/** Hacia dónde corre la ola en el dibujo. Independiente del stance y de
 *  frontside/backside: cambiar la dirección no cambia el nombre de la maniobra. */
export type WaveDirection = 'right' | 'left';

export interface WaveGuideOptions {
  waveDirection?: WaveDirection;
  /** Leyenda dentro del SVG (para los archivos exportados). En el app la leyenda va en HTML. */
  legend?: boolean;
  /** Texto accesible. */
  title?: string;
  /** Sin la ilustración (solo zonas + recorrido), por si hace falta un fondo neutro. */
  plain?: boolean;
  /** width/height fijos en el <svg> (archivos exportados). En el app se omiten: escala al ancho de la tarjeta. */
  fixedSize?: boolean;
}

// ── Geometría base (ola hacia la derecha; se espeja todo el grupo) ──
const W = 720;
const H = 300;
const FACE_X0 = 60;   // borde de la cara junto a la espuma
const FACE_X1 = 660;  // hombro
const FLAT_Y = 250;   // el flat, horizontal
const TOP_AT_POCKET = 30;   // cresta junto al pocket (= tablero original)
const TOP_AT_SHOULDER = 110; // cresta en el hombro: la ola baja hacia el hombro
const ORIG_TOP = 30;
const ORIG_H = FLAT_Y - ORIG_TOP; // 220 en el tablero original

/** Altura de la cresta en x: lineal del pocket al hombro (y sigue fuera de la cara). */
export function crestY(x: number): number {
  return TOP_AT_POCKET + ((x - FACE_X0) / (FACE_X1 - FACE_X0)) * (TOP_AT_SHOULDER - TOP_AT_POCKET);
}

/** Punto del tablero plano → punto sobre la cara con altura variable. Misma zona, misma profundidad relativa. */
export function mapPoint(x: number, y: number): [number, number] {
  const top = crestY(x);
  return [x, top + ((y - ORIG_TOP) / ORIG_H) * (FLAT_Y - top)];
}

/** Separador entre zonas (i = 1..3) o borde (0 = cresta, 4 = flat) en x. */
export function zoneLineY(i: number, x: number): number {
  const top = crestY(x);
  return top + (i / 4) * (FLAT_Y - top);
}

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Re-mapea un path `M x,y C x1,y1 x2,y2 x,y …` (absoluto, como en las configs). */
export function mapPath(d: string): string {
  const out: string[] = [];
  const re = /([MLCQSTZmlcqstz])([^MLCQSTZmlcqstz]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const cmd = m[1];
    if (/[a-z]/.test(cmd)) throw new Error(`wave-guide: relative command "${cmd}" not supported in "${d}"`);
    const nums = (m[2].match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    if (cmd === 'Z') { out.push('Z'); continue; }
    const pts: string[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const [x, y] = mapPoint(nums[i], nums[i + 1]);
      pts.push(`${f(x)},${f(y)}`);
    }
    out.push(cmd + pts.join(' '));
  }
  return out.join(' ');
}

/** Puntos muestreados del recorrido ya mapeado (para ubicar etiquetas sin pisar la línea). */
function samplePoints(data: WaveBoardData): [number, number][] {
  const pts: [number, number][] = [];
  const re = /([MC])([^MC]*)/g;
  for (const s of data.segments) {
    let m: RegExpExecArray | null; let cur: [number, number] | null = null;
    while ((m = re.exec(s.d))) {
      const n = (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number);
      if (m[1] === 'M') { cur = mapPoint(n[0], n[1]); pts.push(cur); continue; }
      for (let i = 0; i + 5 < n.length; i += 6) {
        const p0 = cur!, p1 = mapPoint(n[i], n[i + 1]), p2 = mapPoint(n[i + 2], n[i + 3]), p3 = mapPoint(n[i + 4], n[i + 5]);
        for (let t = 0.1; t <= 1.0001; t += 0.1) {
          const u = 1 - t;
          pts.push([u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]);
          if (s.hold) pts.push([pts[pts.length - 1][0], pts[pts.length - 1][1] + 16]);
        }
        cur = p3;
      }
    }
    re.lastIndex = 0;
  }
  return pts;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONO = "'TSS IBM Plex Mono', 'IBM Plex Mono', Menlo, monospace";
const SANS = "'TSS Archivo', Archivo, 'Helvetica Neue', Arial, sans-serif";

export const DEFAULT_ZONE_LABELS: [string, string, string, string] = ['Z4 · high · by the lip', 'Z3 · upper middle', 'Z2 · lower middle', 'Z1 · low · by the flat'];

/** Capas reutilizables. Cada una devuelve un <g id="wg-…">. */
export const layers = {
  /** Fondo ilustrado: cara con degradé, líneas de energía, labio y flat. */
  face(): string {
    const top0 = crestY(0), top1 = crestY(W);
    const facePath = `M0,${f(top0)} L${W},${f(top1)} L${W},${FLAT_Y} L0,${FLAT_Y} Z`;
    // Líneas de energía: arcos que bajan de la cresta al flat, inclinados hacia el pocket.
    let grid = '';
    for (let x = FACE_X0 + 20; x <= FACE_X1 + 40; x += 46) {
      const t = crestY(x);
      grid += `<path d="M${f(x + 26)},${f(t + 1)} Q${f(x - 4)},${f((t + FLAT_Y) / 2)} ${f(x - 12)},${FLAT_Y}" />`;
    }
    // Contornos horizontales suaves (la textura de la cara).
    let contours = '';
    for (let i = 1; i <= 7; i++) {
      const y0 = top0 + (FLAT_Y - top0) * (i / 8), y1 = top1 + (FLAT_Y - top1) * (i / 8);
      contours += `<path d="M0,${f(y0)} C${W * 0.35},${f(y0 + 6)} ${W * 0.65},${f(y1 - 6)} ${W},${f(y1)}" />`;
    }
    return `<g id="wg-face">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#061C2B"/>
  <path d="${facePath}" fill="url(#wg-face-grad)"/>
  <g stroke="#7DE3FF" stroke-width="1" fill="none" opacity=".22">${grid}</g>
  <g stroke="#9FE8FF" stroke-width="1" fill="none" opacity=".14">${contours}</g>
  <path d="M0,${f(top0)} L${W},${f(top1)}" stroke="#FFFFFF" stroke-width="2.5" opacity=".9"/>
  <path d="M0,${f(top0 + 4)} L${W},${f(top1 + 4)}" stroke="#BDEFFF" stroke-width="5" opacity=".18"/>
  <rect x="0" y="${FLAT_Y}" width="${W}" height="${H - FLAT_Y}" fill="#04121D"/>
  <path d="M0,${FLAT_Y} L${W},${FLAT_Y}" stroke="#3AA7D8" stroke-width="1.5" opacity=".55"/>
  <path d="M0,${FLAT_Y + 14} C120,${FLAT_Y + 8} 240,${FLAT_Y + 20} 360,${FLAT_Y + 12} S600,${FLAT_Y + 6} ${W},${FLAT_Y + 14}" stroke="#3AA7D8" stroke-width="1" fill="none" opacity=".25"/>
</g>`;
  },

  /** Espuma: el labio rompiendo en la esquina del pocket y la espuma bajando. */
  foam(): string {
    const t = crestY(0);
    return `<g id="wg-foam">
  <path d="M-6,${f(t - 14)} C30,${f(t - 30)} 90,${f(t - 26)} 128,${f(t + 6)} C112,${f(t + 26)} 84,${f(t + 34)} 60,${f(t + 44)} C40,${f(t + 30)} 12,${f(t + 12)} -6,${f(t + 10)} Z" fill="#EAF7FF" opacity=".92"/>
  <path d="M-6,${f(t + 4)} C22,${f(t + 30)} 46,${f(t + 70)} 52,${f(FLAT_Y - 4)} L-6,${f(FLAT_Y)} Z" fill="#FFFFFF" opacity=".22"/>
  <path d="M-6,${f(t + 30)} C14,${f(t + 60)} 26,${f(t + 120)} 30,${f(FLAT_Y)} L-6,${f(FLAT_Y)} Z" fill="#FFFFFF" opacity=".28"/>
  <g fill="#FFFFFF">
    <circle cx="96" cy="${f(t - 8)}" r="9" opacity=".95"/><circle cx="118" cy="${f(t - 2)}" r="6" opacity=".9"/><circle cx="136" cy="${f(t + 6)}" r="3.5" opacity=".8"/>
    <circle cx="72" cy="${f(t - 18)}" r="7" opacity=".9"/><circle cx="48" cy="${f(t - 20)}" r="10" opacity=".85"/><circle cx="24" cy="${f(t - 12)}" r="8" opacity=".9"/>
    <circle cx="150" cy="${f(t + 14)}" r="2" opacity=".7"/><circle cx="60" cy="${f(t + 60)}" r="5" opacity=".35"/><circle cx="34" cy="${f(t + 100)}" r="7" opacity=".3"/><circle cx="18" cy="${f(t + 160)}" r="9" opacity=".28"/>
  </g>
</g>`;
  },

  /** Zonas Z1–Z4: tres separadores punteados que cubren la cara completa. */
  zones(): string {
    let sep = '';
    for (let i = 1; i <= 3; i++) {
      sep += `<path d="M${FACE_X0},${f(zoneLineY(i, FACE_X0))} L${W},${f(zoneLineY(i, W))}" />`;
    }
    return `<g id="wg-zones" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="4 5" fill="none" opacity=".55">${sep}</g>`;
  },

  /** Pocket: anillo violeta (fuera del lenguaje de los comandos) con halo. */
  pocket(data: WaveBoardData): string {
    const [x, y] = mapPoint(data.pocket.x, data.pocket.y);
    return `<g id="wg-pocket">
  <circle cx="${f(x)}" cy="${f(y)}" r="22" fill="${POCKET_COLOR}" opacity=".18"/>
  <circle cx="${f(x)}" cy="${f(y)}" r="14" fill="#061C2B" opacity=".55"/>
  <circle cx="${f(x)}" cy="${f(y)}" r="14" fill="none" stroke="${POCKET_COLOR}" stroke-width="4"/>
  <circle cx="${f(x)}" cy="${f(y)}" r="9.5" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".9"/>
</g>`;
  },

  /** Hold: arco celeste AL LADO de la línea (desplazado hacia abajo), como en el PDF "Dibujar la Ola". */
  hold(data: WaveBoardData): string {
    const paths = data.segments.filter((s) => s.hold).map((s) => `<path d="${mapPath(s.d)}" transform="translate(0,16)"/>`).join('');
    if (!paths) return '<g id="wg-hold"></g>';
    return `<g id="wg-hold" stroke="${HOLD_COLOR}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".95">${paths}</g>`;
  },

  /** El recorrido: un tramo por comando, con su color. Con un filo oscuro debajo para que lea sobre la cara. */
  line(data: WaveBoardData): string {
    const under = data.segments.map((s) => `<path d="${mapPath(s.d)}"/>`).join('');
    const over = data.segments.map((s) => `<path d="${mapPath(s.d)}" stroke="${COMMAND_COLORS[s.command]}"/>`).join('');
    return `<g id="wg-line">
  <g stroke="#061C2B" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55">${under}</g>
  <g stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round">${over}</g>
</g>`;
  },

  /** Flecha blanca en el punto final del recorrido, orientada según el último tramo. */
  arrow(data: WaveBoardData): string {
    const last = data.segments[data.segments.length - 1];
    if (!last) return '<g id="wg-arrow"></g>';
    const nums = (last.d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    const [ex, ey] = mapPoint(nums[nums.length - 2], nums[nums.length - 1]);
    const [cx, cy] = mapPoint(nums[nums.length - 4] ?? nums[0], nums[nums.length - 3] ?? nums[1]);
    const ang = (Math.atan2(ey - cy, ex - cx) * 180) / Math.PI;
    return `<g id="wg-arrow" transform="translate(${f(ex)},${f(ey)}) rotate(${f(ang)})">
  <path d="M-6,-11 L16,0 L-6,11 Z" fill="#061C2B" opacity=".6" transform="translate(1,1)"/>
  <path d="M-6,-11 L16,0 L-6,11 Z" fill="#FFFFFF"/>
</g>`;
  },
};

/** Etiquetas (no se espejan): zonas, POCKET con línea guía, FLAT. Cada etiqueta
 *  de zona busca un lugar libre (primero junto al pocket, después el hombro, después
 *  el medio) para no pisar el recorrido ni el pocket; lleva una pastilla oscura. */
function labelsLayer(data: WaveBoardData, dir: WaveDirection): string {
  const zl = data.zoneLabels ?? DEFAULT_ZONE_LABELS;
  const right = dir === 'right';
  const mx = (x: number) => (right ? x : W - x);
  const obstacles = samplePoints(data).map(([x, y]) => [mx(x), y] as [number, number]);
  const [pxg, pyg] = mapPoint(data.pocket.x, data.pocket.y);
  const px = mx(pxg), py = pyg;
  for (let a = 0; a < 360; a += 30) obstacles.push([px + 26 * Math.cos(a), py + 26 * Math.sin(a)]);
  const CH = 7.3; // ancho aprox. por carácter a 12px mono
  const free = (x0: number, y0: number, w: number, h: number) => !obstacles.some(([ox, oy]) => ox > x0 - 8 && ox < x0 + w + 8 && oy > y0 - 6 && oy < y0 + h + 6);
  let zones = '';
  for (let i = 0; i < 4; i++) {
    const text = zl[i];
    const w = text.length * CH + 12, h = 18;
    // candidatos: (x del borde izquierdo de la pastilla en pantalla, fracción de altura dentro de la zona)
    const xs = right ? [FACE_X0 + 10, W - 10 - w, W / 2 - w / 2] : [W - FACE_X0 - 10 - w, 10, W / 2 - w / 2];
    const fr = [0.5, 0.3, 0.7, 0.15, 0.85];
    let placed: [number, number] | null = null;
    outer: for (const x0 of xs) for (const q of fr) {
      const gx = mx(x0 + w / 2);
      const yc = zoneLineY(i, gx) + (zoneLineY(i + 1, gx) - zoneLineY(i, gx)) * q;
      if (free(x0, yc - h / 2, w, h)) { placed = [x0, yc]; break outer; }
    }
    if (!placed) { const gx = mx(xs[0] + w / 2); placed = [xs[0], (zoneLineY(i, gx) + zoneLineY(i + 1, gx)) / 2]; }
    const [x0, yc] = placed;
    zones += `<g transform="translate(${f(x0)},${f(yc)})"><rect x="0" y="-9" width="${f(w)}" height="18" rx="4" fill="#061C2B" opacity=".62"/><text x="6" y="4">${esc(text)}</text></g>`;
  }
  const pLabelX = right ? px + 34 : px - 34;
  const pocket = `<path d="M${f(right ? px + 16 : px - 16)},${f(py - 6)} L${f(right ? px + 28 : px - 28)},${f(py - 16)} L${f(pLabelX)},${f(py - 16)}" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity=".9"/>
  <text x="${f(pLabelX + (right ? 4 : -4))}" y="${f(py - 12)}" text-anchor="${right ? 'start' : 'end'}" fill="#FFFFFF" font-weight="700">POCKET</text>`;
  const fx = right ? FACE_X0 + 40 : W - (FACE_X0 + 40);
  const flat = `<path d="M${f(fx)},${FLAT_Y + 3} L${f(right ? fx - 14 : fx + 14)},${FLAT_Y + 26} L${f(right ? fx - 26 : fx + 26)},${FLAT_Y + 26}" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity=".9"/>
  <text x="${f(right ? fx - 30 : fx + 30)}" y="${FLAT_Y + 30}" text-anchor="${right ? 'end' : 'start'}" fill="#FFFFFF" font-weight="700">FLAT</text>`;
  const shoulder = right
    ? `<text x="${W - 12}" y="${FLAT_Y + 30}" text-anchor="end" opacity=".7">→ toward the shoulder</text>`
    : `<text x="12" y="${FLAT_Y + 30}" text-anchor="start" opacity=".7">← toward the shoulder</text>`;
  return `<g id="wg-labels" font-family="${MONO}" font-size="12" fill="#FFFFFF" fill-opacity=".92">${zones}${pocket}${flat}${shoulder}</g>`;
}

/** Leyenda dentro del SVG (exportación). Hace dos filas si no entra en el ancho. */
const LEGEND_ROW = 30;
function legendRows(data: WaveBoardData): { swatch: string; label: string; w: number }[][] {
  const used = Array.from(new Set(data.segments.map((s) => s.command)));
  const items = used.map((c) => ({ swatch: `<rect x="0" y="-5" width="30" height="10" rx="5" fill="${COMMAND_COLORS[c]}"/>`, label: COMMAND_LABELS[c] }));
  if (data.segments.some((s) => s.hold)) items.push({ swatch: `<rect x="0" y="-5" width="30" height="10" rx="5" fill="${HOLD_COLOR}"/>`, label: 'Hold' });
  items.push({ swatch: `<circle cx="15" cy="0" r="8" fill="none" stroke="${POCKET_COLOR}" stroke-width="3"/>`, label: 'Pocket' });
  const rows: { swatch: string; label: string; w: number }[][] = [[]];
  let x = 16;
  for (const it of items) {
    const w = 38 + it.label.length * 8.2 + 26;
    if (x + w > W - 8 && rows[rows.length - 1].length) { rows.push([]); x = 16; }
    rows[rows.length - 1].push({ ...it, w });
    x += w;
  }
  return rows;
}
function legendLayer(rows: { swatch: string; label: string; w: number }[][], y: number): string {
  const parts: string[] = [];
  rows.forEach((row, r) => {
    let x = 16;
    for (const it of row) {
      parts.push(`<g transform="translate(${f(x)},${y + r * LEGEND_ROW})">${it.swatch}<text x="38" y="5" font-family="${SANS}" font-size="14" font-weight="600" fill="#FFFFFF">${esc(it.label)}</text></g>`);
      x += it.w;
    }
  });
  return `<g id="wg-legend">${parts.join('')}</g>`;
}

/** El SVG completo como string. */
export function buildWaveGuideSvg(data: WaveBoardData, opts: WaveGuideOptions = {}): string {
  const dir: WaveDirection = opts.waveDirection ?? 'right';
  const legend = !!opts.legend;
  const rows = legend ? legendRows(data) : [];
  const legendH = legend ? 12 + rows.length * LEGEND_ROW : 0;
  const height = H + legendH;
  const geo = dir === 'left' ? ` transform="translate(${W},0) scale(-1,1)"` : '';
  const title = opts.title ? `<title>${esc(opts.title)}</title>` : '';
  const illustration = opts.plain ? `<rect x="0" y="0" width="${W}" height="${H}" fill="#061C2B"/><g id="wg-zone-bands" fill="#FFFFFF">${[0, 1, 2, 3].map((i) => `<path d="M${FACE_X0},${f(zoneLineY(i, FACE_X0))} L${W},${f(zoneLineY(i, W))} L${W},${f(zoneLineY(i + 1, W))} L${FACE_X0},${f(zoneLineY(i + 1, FACE_X0))} Z" opacity="${i % 2 ? '.04' : '.07'}"/>`).join('')}</g>` : layers.face() + layers.foam();
  const size = opts.fixedSize ? ` width="${W}" height="${height}"` : ` style="display:block;width:100%;height:auto"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}"${size} role="img" data-wave-direction="${dir}">${title}
<defs>
  <linearGradient id="wg-face-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2C8DD1"/>
    <stop offset=".35" stop-color="#0F4F8A"/>
    <stop offset="1" stop-color="#072B4B"/>
  </linearGradient>
  <clipPath id="wg-clip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
</defs>
<g id="wg-geometry" clip-path="url(#wg-clip)"${geo}>
${illustration}
${layers.zones()}
${layers.pocket(data)}
${layers.hold(data)}
${layers.line(data)}
${layers.arrow(data)}
</g>
${labelsLayer(data, dir)}
${legend ? `<rect x="0" y="${H}" width="${W}" height="${legendH}" fill="#061C2B"/>${legendLayer(rows, H + 24)}` : ''}
</svg>`;
}

/** Ítems de leyenda para renderizarla en HTML (el app). */
export function legendItems(data: WaveBoardData): { key: string; color: string; label: string; kind: 'line' | 'ring' }[] {
  const used = Array.from(new Set(data.segments.map((s) => s.command)));
  const items: { key: string; color: string; label: string; kind: 'line' | 'ring' }[] = used.map((c) => ({ key: c, color: COMMAND_COLORS[c], label: COMMAND_LABELS[c], kind: 'line' as const }));
  if (data.segments.some((s) => s.hold)) items.push({ key: 'hold', color: HOLD_COLOR, label: 'Hold · the arc beside the line: this position is kept', kind: 'line' });
  items.push({ key: 'pocket', color: POCKET_COLOR, label: 'Pocket · where the energy is', kind: 'ring' });
  return items;
}
