// ═══ La ola del TSS_Wave_Kit · el recorrido de cualquier secuencia ═══
// Marcelo (2026-10-01): "pone el nuevo y elimina ese viejo que ya no lo
// usamos en nada". La ola fotorrealista del kit (public/tss/waves) es la única
// ola del app. Las 6 secuencias Blue traen sus capas de recorrido hechas por el
// kit; el resto (#7, el juego del círculo 3) se dibuja acá con la MISMA
// fórmula del kit (TSS_Wave_Kit/generate.py: crest, pos, project), así el
// recorrido cae igual sobre la ola. Prueba en src/test/pure.test.ts: lo que
// dibuja este archivo coincide con las capas del kit.
//
// Los recorridos de las configs viven en un viewBox 720×300 (cara desplegada:
// cresta y = 30, flat y = 250). El kit los proyecta a 2048×683.

import type { WaveBoardData, Command } from './types';

export const COMMAND_COLORS: Record<Command, string> = {
  posture: '#FF3B3B',
  rail: '#19C567',       // --tss-cmd-rotation (manual v10.1)
  projection: '#FFD600', // --tss-cmd-projection
  maneuver: '#2F69FF',   // --tss-cmd-maneuver
  closure: '#F454A2',    // --tss-cmd-closure
};
export const HOLD_COLOR = '#7DE3FF';
export const POCKET_COLOR = '#BA69EE'; // --tss-cmd-pocket (manual v10.1)
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

export const KIT_W = 2048;
export const KIT_H = 683;

/** Altura de la cresta en x (espacio del kit): sube del pocket al hombro. */
export function kitCrest(X: number): number {
  return 98 + 152 * ((Math.max(460, Math.min(2048, X)) - 460) / 1588) ** 0.63;
}

/** Punto de la cara desplegada (720×300) → punto sobre la ola del kit. */
export function kitPos(x: number, y: number): [number, number] {
  const X = 430 + ((x - 60) / 600) * 1510;
  const top = kitCrest(X);
  return [X, top + ((y - 30) / 220) * (600 - top)];
}

const f3 = (n: number) => n.toFixed(3);

/** Proyecta un path absoluto (M, L, C, Z — como las configs) al kit; `dy` baja
 *  el tramo antes de proyectar (el hold va 16 por debajo de la línea). */
export function kitPath(d: string, dy = 0): string {
  return d.replace(/([MCLZ])([^MCLZ]*)/g, (_m, cmd: string, rest: string) => {
    const nums = (rest.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    const pts: string[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const [X, Y] = kitPos(nums[i], nums[i + 1] + dy);
      pts.push(`${f3(X)},${f3(Y)}`);
    }
    return cmd + pts.join(' ');
  }).replace(/\s*\n\s*/g, '');
}

/** Hold + recorrido de una secuencia, en una sola capa del tamaño del kit
 *  (misma pila que las capas del kit: hold debajo, la línea encima, flecha al final). */
export function kitRouteSvg(data: WaveBoardData, waveDirection: WaveDirection): string {
  const last = data.segments.length - 1;
  const hold = data.segments.filter((s) => s.hold)
    .map((s) => `<path d="${kitPath(s.d, 16)}" fill="none" stroke="${HOLD_COLOR}" stroke-width="8" stroke-linecap="round"/>`).join('');
  const route = data.segments
    .map((s, i) => `<path d="${kitPath(s.d)}" fill="none" stroke="${COMMAND_COLORS[s.command]}" stroke-width="13" stroke-linecap="round"${i === last ? ' marker-end="url(#arrow)"' : ''}/>`).join('');
  const body = hold + route;
  const geo = waveDirection === 'left' ? `<g transform="translate(2048 0) scale(-1 1)">${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${KIT_W} ${KIT_H}" width="${KIT_W}" height="${KIT_H}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#F0F7FA"/></marker></defs>${geo}</svg>`;
}

/** Ítems de leyenda para renderizarla en HTML. */
export function legendItems(data: WaveBoardData): { key: string; color: string; label: string; kind: 'line' | 'ring' }[] {
  const used = Array.from(new Set(data.segments.map((s) => s.command)));
  const items: { key: string; color: string; label: string; kind: 'line' | 'ring' }[] = used.map((c) => ({ key: c, color: COMMAND_COLORS[c], label: COMMAND_LABELS[c], kind: 'line' as const }));
  if (data.segments.some((s) => s.hold)) items.push({ key: 'hold', color: HOLD_COLOR, label: 'Hold · the arc beside the line: this position is kept', kind: 'line' });
  items.push({ key: 'pocket', color: POCKET_COLOR, label: 'Pocket · where the energy is', kind: 'ring' });
  return items;
}
