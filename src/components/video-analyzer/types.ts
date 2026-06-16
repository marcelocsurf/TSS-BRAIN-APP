export type Tool = "line" | "arrow" | "circle" | "free" | "angle";

export type Shape = {
  id: string;
  tool: Tool;
  color: string;
  width: number;
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
};
