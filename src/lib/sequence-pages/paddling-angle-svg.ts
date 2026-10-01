// ═══ PADDLING ANGLE · la lámina de STP-029 (y las etapas de STP-033) ═══
//
// Marcelo (2026-09-15): "para paddling angle aquí hay una imagen que podrías
// mejorar siguiendo la línea gráfica; la podemos poner en la clase que habla
// sobre el ángulo de remada". La lámina original (foto + flechas): Stage 1
// lejos del pocket con flechas amarillas casi paralelas a la ola · Stage 2
// cerca del pocket con flechas verdes a 45° · Stage 3 el pocket con flechas
// rojas hacia la playa y el labio cayendo en blanco · Stage 4 la espuma · el
// surfista remando en magenta hacia Stage 2. Textos de la lección: Option 1
// far from pocket · Option 2 near pocket · Option 3 in front of pocket.
//
// 2026-10-01: sobre la ola del TSS_Wave_Kit (la única ola del app; Marcelo:
// "elimina ese viejo"). Las flechas se pensaron sobre la cara vieja (720×300,
// cresta de 30 junto al pocket a 110 en el hombro, flat en 250) y se llevan a
// la ola del kit con su misma fórmula (wave-kit.ts).
//
// La ola rompe a la derecha como en la lámina original (waveDirection left).

import { kitPos, kitCrest, KIT_W, KIT_H, type WaveDirection } from './wave-kit';

export const PADDLE_COLORS = { option1: '#FFD600', option2: '#19C567', option3: '#FF3B3B', lip: '#FFFFFF', paddle: '#F454A2' } as const;
const MONO = "'TSS IBM Plex Mono', 'IBM Plex Mono', Menlo, monospace";
const f = (n: number) => (Math.round(n * 10) / 10).toString();
/** Escala de los trazos: la lámina vieja medía 720 de ancho, el kit 2048. */
const S = 2.5;

/** Cresta de la cara vieja, solo para ubicar las flechas como se diseñaron. */
const oldCrest = (x: number) => 30 + ((x - 60) / 600) * 80;
/** Punto sobre la cara vieja → mismo lugar relativo sobre la ola del kit. */
function onKit(x: number, yFace: number): [number, number] {
  const c = oldCrest(x);
  return kitPos(x, 30 + ((yFace - c) / (250 - c)) * 220);
}

/** Flecha recta desde (x,y) del kit con ángulo (grados, 0 = hacia el pocket,
 *  positivo = hacia la playa) y largo en unidades del kit. */
function arrow(x: number, y: number, deg: number, len: number, color: string, w = 4 * S): string {
  const a = (deg * Math.PI) / 180;
  const dx = -Math.cos(a), dy = Math.sin(a);
  const x2 = x + dx * len, y2 = y + dy * len;
  const hx = -dx, hy = -dy;
  const px = -dy, py = dx;
  const head = 9 * S;
  return `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x2 - dx * head * 0.6)}" y2="${f(y2 - dy * head * 0.6)}" stroke="${color}" stroke-width="${f(w)}" stroke-linecap="round"/>
<path d="M${f(x2)},${f(y2)} L${f(x2 + hx * head + px * head * 0.6)},${f(y2 + hy * head + py * head * 0.6)} L${f(x2 + hx * head - px * head * 0.6)},${f(y2 + hy * head - py * head * 0.6)} Z" fill="${color}"/>`;
}
const arrowAt = (p: [number, number], deg: number, len: number, color: string, w?: number) => arrow(p[0], p[1], deg, len * S, color, w);

export function buildPaddlingAngleSvg(opts: { waveDirection?: WaveDirection; fixedSize?: boolean; title?: string } = {}): string {
  const dir = opts.waveDirection ?? 'left';
  const mirror = dir === 'left';
  const mx = (x: number) => (mirror ? KIT_W - x : x);
  // La ola del kit ya viene espejada en wave-left: solo se espeja lo dibujado encima.
  const geo = mirror ? ` transform="translate(${KIT_W},0) scale(-1,1)"` : '';
  const size = opts.fixedSize ? ` width="${KIT_W}" height="${KIT_H}"` : ` style="display:block;width:100%;height:auto"`;
  const under = (g: string) => `<g stroke="#061C2B" stroke-width="${9 * S}" opacity=".5" fill="none" stroke-linecap="round">${g.replace(/stroke="[^"]*"/g, 'stroke="#061C2B"').replace(/fill="[^"]*"/g, 'fill="#061C2B"')}</g>`;

  // ── Marco base: pocket a la izquierda. ──
  // Stage 3 · in front of the pocket (rojas, empinadas hacia la playa).
  let s3 = '';
  for (const x of [92, 124, 156, 188]) s3 += arrowAt(onKit(x, oldCrest(x) + 34), 72, 46, PADDLE_COLORS.option3);
  // El labio cayendo (blancas) sobre el pocket.
  let lip = '';
  for (const x of [76, 104, 132, 160, 188]) lip += arrowAt(onKit(x + 4, oldCrest(x) - 8), 100, 26, PADDLE_COLORS.lip, 3 * S);
  // Stage 2 · near the pocket (verdes, 45°).
  let s2 = '';
  for (const x of [262, 312, 362]) s2 += arrowAt(onKit(x, oldCrest(x) + 26), 42, 50, PADDLE_COLORS.option2);
  // Stage 1 · far from the pocket (amarillas, casi paralelas a la ola, hacia el pocket).
  let s1 = '';
  for (const x of [470, 560, 650]) s1 += arrowAt(onKit(x, oldCrest(x) + 42), 12, 56, PADDLE_COLORS.option1);
  // Contornos suaves de las zonas (como en la lámina: óvalo Stage 1, círculo Stage 2).
  const [r0x, r0y] = onKit(428, oldCrest(540) + 8), [r1x, r1y] = onKit(698, oldCrest(540) + 84);
  const [cx, cy] = onKit(314, oldCrest(314) + 40);
  const ry = 66 * ((600 - kitCrest(cx)) / (250 - oldCrest(314)));
  const zones = `<g fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="15 15" opacity=".75">
  <rect x="${f(r0x)}" y="${f(r0y)}" width="${f(r1x - r0x)}" height="${f(r1y - r0y)}" rx="${f((r1y - r0y) / 2)}"/>
  <ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(66 * 2.5167)}" ry="${f(ry)}"/>
</g>`;
  // El surfista remando (magenta, punteado) desde el flat hacia Stage 2.
  const pts = ([[612, 262], [556, 252], [498, 240], [440, 226], [384, 210]] as [number, number][]).map(([x, y]) => onKit(x, y));
  let paddle = '';
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const deg = (Math.atan2(by - ay, -(bx - ax)) * 180) / Math.PI;
    paddle += arrow(ax, ay, deg, Math.hypot(bx - ax, by - ay) - 10 * S, PADDLE_COLORS.paddle, 4 * S);
  }
  // La tabla del surfista, en el punto de partida.
  const [bx0, by0] = onKit(632, 264);
  const board = `<g transform="translate(${f(bx0)},${f(by0)}) rotate(-14) scale(${S})"><ellipse cx="0" cy="0" rx="26" ry="7" fill="#F7F9FA" stroke="#061C2B" stroke-width="1.5"/><circle cx="6" cy="-2" r="4" fill="#061C2B"/></g>`;

  // ── Etiquetas (no se espejan): pastillas navy con texto blanco. ──
  const pill = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle') => {
    const w = (text.length * 7.6 + 16) * S;
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    return `<g transform="translate(${f(x0)},${f(y)})"><rect x="0" y="${-11 * S}" width="${f(w)}" height="${22 * S}" rx="${4 * S}" fill="#061C2B" opacity=".92"/><text x="${f(w / 2)}" y="${4.5 * S}" text-anchor="middle" font-family="${MONO}" font-size="${12 * S}" font-weight="700" fill="#FFFFFF">${text}</text></g>`;
  };
  const at = (x: number, yFace: number) => { const [X, Y] = onKit(x, yFace); return [mx(X), Y] as const; };
  const [l1x, l1y] = at(563, oldCrest(563) - 16);
  const [l2x, l2y] = at(314, oldCrest(314) - 52);
  const [l3x, l3y] = at(150, oldCrest(150) + 112);
  const labels = `<g id="pa-labels">
${pill(l1x, l1y, 'Stage 1')}
${pill(l2x, l2y, 'Stage 2')}
${pill(l3x, l3y, 'Stage 3 · Pocket')}
${pill(mx(60), 630, 'Stage 4 · Whitewater', mirror ? 'end' : 'start')}
</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${KIT_W} ${KIT_H}"${size} role="img" data-wave-direction="${dir}">${opts.title ? `<title>${opts.title}</title>` : ''}
<image href="/tss/waves/wave-clean-wave-${dir}.webp" x="0" y="0" width="${KIT_W}" height="${KIT_H}" preserveAspectRatio="none"/>
<g id="pa-geometry"${geo}>
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
