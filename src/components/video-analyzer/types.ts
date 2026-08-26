export type Tool = "line" | "arrow" | "circle" | "free" | "angle";

export type Shape = {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  // ── VIDA ÚTIL DEL DIBUJO (pedido de Marcelo, 2026-08-26) ──
  // "poner una línea y que se le pueda poner el tiempo de cuánto debe durar
  // y luego desaparece, pero si le doy play otra vez aparecen de nuevo".
  // t  = segundo del video en que se dibujó (aparece ahí).
  // dur = cuántos segundos dura. null = queda para siempre (lo de antes).
  // Sin t definido, el dibujo es permanente — así los que ya existían siguen
  // comportándose igual.
  t?: number;
  dur?: number | null;
  // line / arrow: [x1, y1, x2, y2]
  // free: [x1, y1, x2, y2, ...]
  // circle: [cx, cy, radius]
  // angle: [vx, vy, ax, ay, bx, by]
  points: number[];
};

export type DrawSettings = {
  tool: Tool;
  color: string;
  width: number;
  /** Duración con la que nacen los dibujos nuevos. null = permanente. */
  dur?: number | null;
};

/** Opciones de duración que ve el coach. */
export const DURATIONS: Array<{ v: number | null; label: string }> = [
  { v: null, label: "Fija" },
  { v: 1, label: "1s" },
  { v: 2, label: "2s" },
  { v: 3, label: "3s" },
  { v: 5, label: "5s" },
];

/** ¿Se ve este dibujo en el instante `now` del video? */
export function shapeVisible(s: Shape, now: number): boolean {
  if (s.t == null || s.dur == null) return true;   // permanente
  return now >= s.t && now < s.t + s.dur;
}
