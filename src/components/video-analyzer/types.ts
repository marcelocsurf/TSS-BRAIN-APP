export type Tool = "line" | "arrow" | "circle" | "free" | "angle" | "sticker";

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
  // ── PAUSA AUTOMÁTICA (pedido de Marcelo, 2026-08-26) ──
  // "hacés una línea y el video se pausa donde hiciste la línea, por el mismo
  // tiempo opcional, y luego se va la línea y el video continúa".
  // El video llega al segundo del dibujo, se CONGELA `dur` segundos con la
  // línea a la vista, y sigue sin ella. Es la explicación sola: el coach no
  // tiene que pausar a mano ni narrar mientras busca el momento.
  hold?: boolean;
  // ── STICKERS (pedido de Marcelo, 2026-08-26) ──
  // Material de enseñanza de The Surf Sequence pegado ENCIMA del video: la
  // diana del sweet spot, las zonas del pie en el tail (full speed / neutro /
  // maniobras), el mat de memoria muscular, las partes de la ola. El coach lo
  // ubica sobre la tabla del alumno, lo agranda y lo gira hasta que calza.
  src?: string;        // ruta del PNG/SVG
  w?: number;          // ancho en coordenadas del lienzo
  h?: number;
  rot?: number;        // grados
  alpha?: number;      // 0..1 — para no tapar la ola
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
  /** Si los dibujos nuevos además PAUSAN el video al llegar a ellos. */
  hold?: boolean;
};

/** Opciones de duración que ve el coach. */
export const DURATIONS: Array<{ v: number | null; label: string }> = [
  { v: null, label: "Fija" },
  { v: 1, label: "1s" },
  { v: 2, label: "2s" },
  { v: 3, label: "3s" },
  { v: 5, label: "5s" },
];

/**
 * ¿Se ve este dibujo en el instante `now` del video?
 * `consumed` = dibujos de pausa que ya cumplieron su turno en esta pasada:
 * al soltar el video la línea se va, que es justo lo que pidió Marcelo.
 */
export function shapeVisible(s: Shape, now: number, consumed?: Set<string>): boolean {
  if (s.t == null || s.dur == null) return true;   // permanente
  if (s.hold && consumed?.has(s.id)) return false;
  return now >= s.t && now < s.t + s.dur;
}
