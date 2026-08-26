"use client";

import { forwardRef, useRef, useState } from "react";
import { Stage, Layer, Line, Arrow, Circle, Text, Group, Arc } from "react-konva";
import type Konva from "konva";
import { shapeVisible, type Shape, type DrawSettings } from "./types";

type Props = {
  /** Segundo actual del video — decide qué dibujos se ven. */
  now?: number;
  /** Dibujos de pausa que ya cumplieron su turno en esta pasada. */
  consumed?: Set<string>;
  width: number;
  height: number;
  scale: number;
  posX: number;
  posY: number;
  shapes: Shape[];
  settings: DrawSettings;
  onShapesChange: (next: Shape[]) => void;
  onActivate: () => void;
};

let idCounter = 0;
const nextId = () => `s${++idCounter}_${performance.now().toFixed(0)}`;

// Ángulo en el vértice v entre los rayos v->a y v->b, con UN DECIMAL.
// Kinovea muestra 124.1°, no 124°: en un bottom turn la diferencia de un
// grado entre dos intentos es justamente lo que el coach quiere señalar.
function angleDeg(p: number[]) {
  const [vx, vy, ax, ay, bx, by] = p;
  const a1 = Math.atan2(ay - vy, ax - vx);
  const a2 = Math.atan2(by - vy, bx - vx);
  let d = Math.abs((a1 - a2) * (180 / Math.PI));
  if (d > 180) d = 360 - d;
  return d;
}

// El SECTOR sombreado entre los dos rayos — lo que hace que el ángulo se lea
// de un vistazo en vez de tener que seguir dos líneas sueltas.
function angleArc(p: number[]) {
  const [vx, vy, ax, ay, bx, by] = p;
  const deg = (r: number) => (r * 180) / Math.PI;
  const a1 = deg(Math.atan2(ay - vy, ax - vx));
  const a2 = deg(Math.atan2(by - vy, bx - vx));
  let sweep = a2 - a1;
  while (sweep <= -180) sweep += 360;
  while (sweep > 180) sweep -= 360;
  // El radio sigue al rayo más corto para que el abanico no se pase de largo.
  const r = Math.min(Math.hypot(ax - vx, ay - vy), Math.hypot(bx - vx, by - vy)) * 0.55;
  return { x: vx, y: vy, rotation: sweep < 0 ? a2 : a1, angle: Math.abs(sweep), radius: r,
    // Dónde va el número: en la mitad del abanico, un poco afuera del centro.
    lx: vx + Math.cos((((sweep < 0 ? a2 : a1) + Math.abs(sweep) / 2) * Math.PI) / 180) * r * 0.62,
    ly: vy + Math.sin((((sweep < 0 ? a2 : a1) + Math.abs(sweep) / 2) * Math.PI) / 180) * r * 0.62 };
}

const DrawingCanvas = forwardRef<Konva.Stage, Props>(function DrawingCanvas(
  { now = 0, consumed, width, height, scale, posX, posY, shapes, settings, onShapesChange, onActivate },
  ref
) {
  const drawing = useRef(false);
  const draftId = useRef<string | null>(null);
  // For the multi-tap angle tool.
  const [pending, setPending] = useState<number[]>([]);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  // Solo se pintan los dibujos vivos en este instante del video. Los que no
  // tienen duración son permanentes y se ven siempre (comportamiento viejo).
  // El trazo que se está dibujando AHORA siempre se ve, aunque el video siga
  // corriendo y ya se haya pasado de su ventana — si no, se desvanece bajo el
  // dedo del coach mientras lo dibuja.
  const visible = shapes.filter((s) => s.id === draftId.current || shapeVisible(s, now, consumed));

  // Pointer position in *content* coordinates (already accounts for zoom/pan).
  function point(stage: Konva.Stage | null) {
    return stage?.getRelativePointerPosition() ?? null;
  }

  function handleDown(e: Konva.KonvaEventObject<PointerEvent | TouchEvent>) {
    onActivate();
    const stage = e.target.getStage();
    const p = point(stage);
    if (!p) return;

    if (settings.tool === "angle") {
      const np = [...pending, p.x, p.y];
      if (np.length === 6) {
        onShapesChange([
          ...shapes,
          {
            id: nextId(),
            tool: "angle",
            color: settings.color,
            width: settings.width,
            t: now,
            dur: settings.dur ?? null,
            hold: (settings.dur ?? null) !== null && !!settings.hold,
            points: np,
          },
        ]);
        setPending([]);
        setHover(null);
      } else {
        setPending(np);
      }
      return;
    }

    drawing.current = true;
    const id = nextId();
    draftId.current = id;
    // Nace anclado al instante del video en que se dibujó, con la duración
    // que el coach tenga elegida (null = queda fijo).
    const base = { id, color: settings.color, width: settings.width, t: now, dur: settings.dur ?? null,
      hold: (settings.dur ?? null) !== null && !!settings.hold };
    let shape: Shape;
    if (settings.tool === "circle") {
      shape = { ...base, tool: "circle", points: [p.x, p.y, 0] };
    } else if (settings.tool === "free") {
      shape = { ...base, tool: "free", points: [p.x, p.y] };
    } else {
      shape = { ...base, tool: settings.tool, points: [p.x, p.y, p.x, p.y] };
    }
    onShapesChange([...shapes, shape]);
  }

  function handleMove(e: Konva.KonvaEventObject<PointerEvent | TouchEvent>) {
    const stage = e.target.getStage();
    const p = point(stage);
    if (!p) return;

    if (settings.tool === "angle") {
      if (pending.length > 0) setHover(p);
      return;
    }
    if (!drawing.current || !draftId.current) return;

    const next = shapes.map((s) => {
      if (s.id !== draftId.current) return s;
      if (s.tool === "circle") {
        const r = Math.hypot(p.x - s.points[0], p.y - s.points[1]);
        return { ...s, points: [s.points[0], s.points[1], r] };
      }
      if (s.tool === "free") {
        return { ...s, points: [...s.points, p.x, p.y] };
      }
      return { ...s, points: [s.points[0], s.points[1], p.x, p.y] };
    });
    onShapesChange(next);
  }

  function handleUp() {
    drawing.current = false;
    draftId.current = null;
  }

  return (
    <Stage
      ref={ref}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      x={posX}
      y={posY}
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
    >
      <Layer>
        {/* ── Cómo se ven las líneas ──────────────────────────────────
            Cada trazo se dibuja DOS VECES: primero un contorno oscuro más
            grueso, después el color encima. Es el truco de la televisión
            deportiva: sobre agua brillante al mediodía un trazo plano se
            lava y se ve amateur; con el contorno, el color resalta contra
            cualquier fondo. Cuesta una pasada más de dibujo y cambia todo.
            HALO es un múltiplo del grosor para que escale parejo. */}
        {visible.map((s) => {
          const w = s.width / scale;
          const halo = w + 3 / scale;
          const common = {
            lineCap: "round" as const,
            lineJoin: "round" as const,
            shadowColor: "#000",
            shadowBlur: 6 / scale,
            shadowOpacity: 0.35,
            shadowForStrokeEnabled: true,
          };
          if (s.tool === "circle") {
            return (
              <Group key={s.id}>
                <Circle x={s.points[0]} y={s.points[1]} radius={s.points[2]}
                  stroke="rgba(0,0,0,.55)" strokeWidth={halo} />
                <Circle x={s.points[0]} y={s.points[1]} radius={s.points[2]}
                  stroke={s.color} strokeWidth={w} {...common} />
              </Group>
            );
          }
          if (s.tool === "arrow") {
            const head = Math.max(12, s.width * 3.2) / scale;
            return (
              <Group key={s.id}>
                <Arrow points={s.points} stroke="rgba(0,0,0,.55)" fill="rgba(0,0,0,.55)"
                  strokeWidth={halo} pointerLength={head + 1.5 / scale} pointerWidth={head + 1.5 / scale}
                  lineCap="round" lineJoin="round" />
                <Arrow points={s.points} stroke={s.color} fill={s.color}
                  strokeWidth={w} pointerLength={head} pointerWidth={head} {...common} />
              </Group>
            );
          }
          if (s.tool === "angle") {
            const [vx, vy, ax, ay, bx, by] = s.points;
            const pts = [ax, ay, vx, vy, bx, by];
            const arc = angleArc(s.points);
            return (
              <Group key={s.id}>
                {/* El abanico relleno, como Kinovea. Semitransparente para no
                    tapar lo que está midiendo. */}
                {arc.radius > 4 / scale && (
                  <Arc x={arc.x} y={arc.y} innerRadius={0} outerRadius={arc.radius}
                    rotation={arc.rotation} angle={arc.angle}
                    fill={s.color} opacity={0.32} />
                )}
                <Line points={pts} stroke="rgba(0,0,0,.55)" strokeWidth={halo} lineCap="round" lineJoin="round" />
                <Line points={pts} stroke={s.color} strokeWidth={w} {...common} />
              </Group>
            );
          }
          // línea recta + mano alzada
          const tension = s.tool === "free" ? 0.5 : 0;
          return (
            <Group key={s.id}>
              <Line points={s.points} stroke="rgba(0,0,0,.55)" strokeWidth={halo}
                lineCap="round" lineJoin="round" tension={tension} />
              <Line points={s.points} stroke={s.color} strokeWidth={w} tension={tension} {...common} />
            </Group>
          );
        })}

        {/* El número del ángulo, DENTRO del abanico y con contorno oscuro:
            sobre agua un texto plano no se lee. Un decimal, como Kinovea. */}
        {visible
          .filter((s) => s.tool === "angle")
          .map((s) => {
            const arc = angleArc(s.points);
            const txt = `${angleDeg(s.points).toFixed(1)}°`;
            return (
              <Text
                key={s.id + "_t"}
                x={arc.lx - 30 / scale}
                y={arc.ly - 11 / scale}
                width={60 / scale}
                align="center"
                text={txt}
                fontSize={20 / scale}
                fontStyle="bold"
                fill={s.color}
                stroke="rgba(0,0,0,.75)"
                strokeWidth={3 / scale}
                fillAfterStrokeEnabled
                listening={false}
              />
            );
          })}
      </Layer>
    </Stage>
  );
});

export default DrawingCanvas;
