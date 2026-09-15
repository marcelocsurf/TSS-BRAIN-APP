// ═══ PADDLING ANGLE · la lámina de STP-029 (y las etapas de STP-033) ═══
//
// Marcelo (2026-09-15): "para paddling angle aquí hay una imagen que podrías
// mejorar siguiendo la línea gráfica; la podemos poner en la clase que habla
// sobre el ángulo de remada". La lámina original (foto + flechas): Stage 1
// lejos del pocket con flechas amarillas casi paralelas a la ola · Stage 2
// cerca del pocket con flechas verdes a 45° · Stage 3 el pocket con flechas
// rojas hacia la playa y el labio cayendo en blanco · Stage 4 la espuma · el
// surfista remando en magenta hacia Stage 2. Acá se dibuja con la misma ola
// del Wave Guide (línea aprobada) y los textos de la lección: Option 1 far
// from pocket · Option 2 near pocket · Option 3 in front of pocket.
//
// La ola rompe a la derecha como en la lámina original (waveDirection left).

import { layers, crestY, type WaveDirection } from './wave-guide-svg';

const W = 720, H = 300, FLAT_Y = 250;
export const PADDLE_COLORS = { option1: '#FFD600', option2: '#19C567', option3: '#FF3B3B', lip: '#FFFFFF', paddle: '#F454A2' } as const;
const MONO = "'TSS IBM Plex Mono', 'IBM Plex Mono', Menlo, monospace";
const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Flecha recta desde (x,y) con ángulo (grados, 0 = hacia -x o sea hacia el pocket en el marco base) y largo. */
function arrow(x: number, y: number, deg: number, len: number, color: string, w = 4): string {
  const a = (deg * Math.PI) / 180;
  const dx = -Math.cos(a), dy = Math.sin(a); // hacia el pocket (-x) y hacia la playa (+y)
  const x2 = x + dx * len, y2 = y + dy * len;
  const hx = -dx, hy = -dy; // vector de vuelta para la punta
  const px = -dy, py = dx;  // perpendicular
  const head = 9;
  return `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x2 - dx * head * 0.6)}" y2="${f(y2 - dy * head * 0.6)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>
<path d="M${f(x2)},${f(y2)} L${f(x2 + hx * head + px * head * 0.6)},${f(y2 + hy * head + py * head * 0.6)} L${f(x2 + hx * head - px * head * 0.6)},${f(y2 + hy * head - py * head * 0.6)} Z" fill="${color}"/>`;
}

export function buildPaddlingAngleSvg(opts: { waveDirection?: WaveDirection; fixedSize?: boolean; title?: string } = {}): string {
  const dir = opts.waveDirection ?? 'left';
  const mirror = dir === 'left';
  const mx = (x: number) => (mirror ? W - x : x);
  const geo = mirror ? ` transform="translate(${W},0) scale(-1,1)"` : '';
  const size = opts.fixedSize ? ` width="${W}" height="${H}"` : ` style="display:block;width:100%;height:auto"`;
  const under = (g: string) => `<g stroke="#061C2B" stroke-width="9" opacity=".5" fill="none" stroke-linecap="round">${g.replace(/stroke="[^"]*"/g, 'stroke="#061C2B"').replace(/fill="[^"]*"/g, 'fill="#061C2B"')}</g>`;

  // ── Marco base: pocket a la izquierda. ──
  // Stage 3 · in front of the pocket (rojas, empinadas hacia la playa).
  let s3 = '';
  for (const x of [92, 124, 156, 188]) s3 += arrow(x, crestY(x) + 34, 72, 46, PADDLE_COLORS.option3);
  // El labio cayendo (blancas) sobre el pocket.
  let lip = '';
  for (const x of [76, 104, 132, 160, 188]) lip += arrow(x + 4, crestY(x) - 8, 100, 26, PADDLE_COLORS.lip, 3);
  // Stage 2 · near the pocket (verdes, 45°).
  let s2 = '';
  for (const x of [262, 312, 362]) s2 += arrow(x, crestY(x) + 26, 42, 50, PADDLE_COLORS.option2);
  // Stage 1 · far from the pocket (amarillas, casi paralelas a la ola, hacia el pocket).
  let s1 = '';
  for (const x of [470, 560, 650]) s1 += arrow(x, crestY(x) + 42, 12, 56, PADDLE_COLORS.option1);
  // Contornos suaves de las zonas (como en la lámina: óvalo Stage 1, círculo Stage 2).
  const zones = `<g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 6" opacity=".7">
  <rect x="428" y="${f(crestY(540) + 8)}" width="270" height="76" rx="38"/>
  <circle cx="314" cy="${f(crestY(314) + 40)}" r="66"/>
</g>`;
  // El surfista remando (magenta, punteado) desde abajo hacia Stage 2.
  const pts: [number, number][] = [[640, 284], [578, 272], [514, 256], [450, 236], [392, 214]];
  let paddle = '';
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const deg = (Math.atan2(by - ay, -(bx - ax)) * 180) / Math.PI;
    paddle += arrow(ax, ay, deg, Math.hypot(bx - ax, by - ay) - 10, PADDLE_COLORS.paddle, 4);
  }
  // La tabla del surfista, en el punto de partida.
  const board = `<g transform="translate(662,286) rotate(-14)"><ellipse cx="0" cy="0" rx="26" ry="7" fill="#F7F9FA" stroke="#061C2B" stroke-width="1.5"/><circle cx="6" cy="-2" r="4" fill="#061C2B"/></g>`;

  // ── Etiquetas (no se espejan): pastillas navy con texto blanco. ──
  const pill = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle') => {
    const w = text.length * 7.6 + 16;
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    return `<g transform="translate(${f(x0)},${f(y)})"><rect x="0" y="-11" width="${f(w)}" height="22" rx="4" fill="#061C2B" opacity=".92"/><text x="${f(w / 2)}" y="4.5" text-anchor="middle" font-family="${MONO}" font-size="12" font-weight="700" fill="#FFFFFF">${text}</text></g>`;
  };
  const labels = `<g id="pa-labels">
${pill(mx(563), crestY(563) - 16, 'Stage 1')}
${pill(mx(314), crestY(314) - 52, 'Stage 2')}
${pill(mx(150), crestY(150) + 112, 'Stage 3 · Pocket')}
${pill(mx(30), FLAT_Y + 28, 'Stage 4 · Whitewater', mirror ? 'end' : 'start')}
</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"${size} role="img" data-wave-direction="${dir}">${opts.title ? `<title>${opts.title}</title>` : ''}
<defs>
  <linearGradient id="wg-face-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA9E6"/><stop offset=".22" stop-color="#1B6FB5"/><stop offset=".6" stop-color="#0B3F73"/><stop offset="1" stop-color="#062A4C"/></linearGradient>
  <radialGradient id="wg-pocket-glow" cx="0.12" cy="0.1" r="0.75"><stop offset="0" stop-color="#9FE8FF" stop-opacity=".55"/><stop offset=".35" stop-color="#3FA9E6" stop-opacity=".18"/><stop offset="1" stop-color="#062A4C" stop-opacity="0"/></radialGradient>
  <linearGradient id="wg-flat-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A2E4E"/><stop offset="1" stop-color="#04131F"/></linearGradient>
  <linearGradient id="wg-foam-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".85"/><stop offset="1" stop-color="#CDEFFF" stop-opacity=".15"/></linearGradient>
  <clipPath id="pa-clip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
</defs>
<g id="pa-geometry" clip-path="url(#pa-clip)"${geo}>
${layers.face()}
${layers.foam()}
${zones}
<g id="pa-lip">${lip}</g>
<g id="pa-option3">${under(s3)}${s3}</g>
<g id="pa-option2">${under(s2)}${s2}</g>
<g id="pa-option1">${under(s1)}${s1}</g>
<g id="pa-paddle">${under(paddle)}${paddle}${board}</g>
</g>
${labels}
</svg>`;
}

/** Leyenda en HTML (las palabras de la lección STP-029). */
export const PADDLE_LEGEND: { key: string; color: string; label: string }[] = [
  { key: 'option1', color: PADDLE_COLORS.option1, label: 'Option 1 · Far from pocket' },
  { key: 'option2', color: PADDLE_COLORS.option2, label: 'Option 2 · Near pocket' },
  { key: 'option3', color: PADDLE_COLORS.option3, label: 'Option 3 · In front of pocket' },
  { key: 'lip', color: PADDLE_COLORS.lip, label: 'The lip · the pocket\'s energy' },
  { key: 'paddle', color: PADDLE_COLORS.paddle, label: 'You, paddling in' },
];
