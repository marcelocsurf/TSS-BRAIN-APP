"use client";

import { forwardRef, useRef, useState } from "react";
import { Stage, Layer, Line, Arrow, Circle, Text } from "react-konva";
import type Konva from "konva";
import type { Shape, DrawSettings } from "./types";

type Props = {
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

// Angle (in degrees) at vertex v between rays v->a and v->b.
function angleDeg(p: number[]) {
  const [vx, vy, ax, ay, bx, by] = p;
  const a1 = Math.atan2(ay - vy, ax - vx);
  const a2 = Math.atan2(by - vy, bx - vx);
  let d = Math.abs((a1 - a2) * (180 / Math.PI));
  if (d > 180) d = 360 - d;
  return Math.round(d);
}

const DrawingCanvas = forwardRef<Konva.Stage, Props>(function DrawingCanvas(
  { width, height, scale, posX, posY, shapes, settings, onShapesChange, onActivate },
  ref
) {
  const drawing = useRef(false);
  const draftId = useRef<string | null>(null);
  // For the multi-tap angle tool.
  const [pending, setPending] = useState<number[]>([]);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

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
    const base = { id, color: settings.color, width: settings.width };
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
      className="no-touch-scroll absolute inset-0"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
    >
      <Layer>
        {shapes.map((s) => {
          if (s.tool === "circle") {
            return (
              <Circle
                key={s.id}
                x={s.points[0]}
                y={s.points[1]}
                radius={s.points[2]}
                stroke={s.color}
                strokeWidth={s.width / scale}
              />
            );
          }
          if (s.tool === "arrow") {
            return (
              <Arrow
                key={s.id}
                points={s.points}
                stroke={s.color}
                fill={s.color}
                strokeWidth={s.width / scale}
                pointerLength={Math.max(10, s.width * 3) / scale}
                pointerWidth={Math.max(10, s.width * 3) / scale}
              />
            );
          }
          if (s.tool === "angle") {
            const [vx, vy, ax, ay, bx, by] = s.points;
            return (
              <Line
                key={s.id}
                points={[ax, ay, vx, vy, bx, by]}
                stroke={s.color}
                strokeWidth={s.width / scale}
                lineCap="round"
                lineJoin="round"
              />
            );
          }
          // line + free
          return (
            <Line
              key={s.id}
              points={s.points}
              stroke={s.color}
              strokeWidth={s.width / scale}
              lineCap="round"
              lineJoin="round"
              tension={s.tool === "free" ? 0.4 : 0}
            />
          );
        })}

        {/* Degree labels for finished angles */}
        {shapes
          .filter((s) => s.tool === "angle")
          .map((s) => (
            <Text
              key={s.id + "_t"}
              x={s.points[0] + 8 / scale}
              y={s.points[1] - 22 / scale}
              text={`${angleDeg(s.points)}°`}
              fontSize={18 / scale}
              fontStyle="bold"
              fill={s.color}
            />
          ))}

        {/* Live preview while placing an angle */}
        {pending.length >= 2 && (
          <Line
            points={
              pending.length === 2
                ? [pending[0], pending[1], hover?.x ?? pending[0], hover?.y ?? pending[1]]
                : [
                    pending[2],
                    pending[3],
                    pending[0],
                    pending[1],
                    hover?.x ?? pending[0],
                    hover?.y ?? pending[1],
                  ]
            }
            stroke={settings.color}
            strokeWidth={settings.width / scale}
            dash={[6 / scale, 6 / scale]}
            lineCap="round"
          />
        )}
      </Layer>
    </Stage>
  );
});

export default DrawingCanvas;
