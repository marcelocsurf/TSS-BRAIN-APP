"use client";

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type Konva from "konva";
import DrawingCanvas from "./DrawingCanvas";
import type { Shape, DrawSettings } from "./types";

const SPEEDS = [0.25, 0.5, 0.75, 1];
const MAX_ZOOM = 4;
const MIN_ZOOM = 1;

type Props = {
  title: string;
  src: string | null;
  isActive: boolean;
  shapes: Shape[];
  settings: DrawSettings;
  videoRef: RefObject<HTMLVideoElement>;
  stageRef: RefObject<Konva.Stage>;
  onShapesChange: (next: Shape[]) => void;
  onActivate: () => void;
  onPickFile?: (file: File) => void;
  emptyHint?: string;
};

export default function VideoPanel({
  title,
  src,
  isActive,
  shapes,
  settings,
  videoRef,
  stageRef,
  onShapesChange,
  onActivate,
  onPickFile,
  emptyHint,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0); // 0..1
  const [missing, setMissing] = useState(false);
  // iOS Safari often fails to play a local video from a blob: URL (blob URLs
  // don't serve the Range requests iOS expects). When that happens we re-read
  // the same blob as a data: URL, which iOS plays reliably.
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const triedFallback = useRef(false);

  const effectiveSrc = fallbackSrc ?? src;

  async function handleVideoError() {
    // First failure on a local blob → retry once via a data: URL.
    if (src && src.startsWith("blob:") && !triedFallback.current) {
      triedFallback.current = true;
      try {
        const blob = await fetch(src).then((r) => r.blob());
        const reader = new FileReader();
        reader.onload = () => setFallbackSrc(reader.result as string);
        reader.onerror = () => setMissing(true);
        reader.readAsDataURL(blob);
        return;
      } catch {
        /* fall through to the error overlay */
      }
    }
    setMissing(true);
  }

  // Zoom / pan state (shared by video + drawing overlay).
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const panDrag = useRef<{ x: number; y: number } | null>(null);

  // Keep the overlay the same pixel size as the rendered <video>.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [videoRef, src]);

  // Reset transient state when the source changes.
  useEffect(() => {
    setMissing(false);
    setPlaying(false);
    setProgress(0);
    setFallbackSrc(null);
    triedFallback.current = false;
    resetView();
    const el = videoRef.current;
    if (el) el.playbackRate = speed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Picking any drawing tool exits pan mode — otherwise the transparent
  // pan layer stays on top of the canvas and swallows the draw gestures,
  // so the coach "can't draw" after using the hand tool.
  useEffect(() => {
    setPanMode(false);
  }, [settings.tool]);

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPanMode(false);
    setMirrored(false);
  }

  // Zoom around the panel center so the focus point stays put.
  function applyZoom(target: number) {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, target));
    const cx = size.w / 2;
    const cy = size.h / 2;
    setPan((prev) => {
      const contentX = (cx - prev.x) / zoom;
      const contentY = (cy - prev.y) / zoom;
      return { x: cx - contentX * z, y: cy - contentY * z };
    });
    setZoom(z);
    if (z === 1) setPan({ x: 0, y: 0 });
  }

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function changeSpeed(s: number) {
    setSpeed(s);
    const el = videoRef.current;
    if (el) el.playbackRate = s;
  }

  function step(seconds: number) {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    setPlaying(false);
    el.currentTime = Math.min(
      Math.max(0, el.currentTime + seconds),
      el.duration || el.currentTime + seconds
    );
  }

  function onTimeUpdate() {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  }

  function onSeek(e: ChangeEvent<HTMLInputElement>) {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const v = Number(e.target.value);
    el.currentTime = v * el.duration;
    setProgress(v);
  }

  function fullscreen() {
    const node = wrapRef.current;
    if (node?.requestFullscreen) node.requestFullscreen();
  }

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && onPickFile) onPickFile(f);
    e.target.value = "";
  }

  // Pan drag handlers (only when the hand tool is on).
  function panStart(e: ReactPointerEvent) {
    onActivate();
    panDrag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function panMove(e: ReactPointerEvent) {
    if (!panDrag.current) return;
    setPan({ x: e.clientX - panDrag.current.x, y: e.clientY - panDrag.current.y });
  }
  function panEnd() {
    panDrag.current = null;
  }

  const btn =
    "rounded-xl px-3 py-3 text-sm font-semibold active:scale-95 transition";

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border ${
        isActive ? "border-cyan-400" : "border-white/10"
      } bg-black/40`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-bold text-cyan-300">{title}</span>
        {onPickFile && (
          // A <label> opens the file picker via a native tap — reliable on iOS
          // Safari/iPad, where a display:none input triggered by a programmatic
          // .click() often fails to open the picker at all.
          <label className={`${btn} bg-cyan-600 cursor-pointer`}>
            Importar video
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={pickFile}
            />
          </label>
        )}
      </div>

      <div
        ref={wrapRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-black"
        onPointerDown={onActivate}
      >
        {src ? (
          <>
            <video
              ref={videoRef}
              src={effectiveSrc ?? undefined}
              // Only request CORS for remote model clips (needed to export the
              // annotated frame). Local files are blob:/data: URLs — setting
              // crossOrigin on them can stop Safari/iPad from loading the video.
              crossOrigin={src.startsWith("blob:") || src.startsWith("data:") ? undefined : "anonymous"}
              playsInline
              preload="auto"
              className="h-full w-full object-contain"
              style={{
                transformOrigin: "top left",
                // Mirror flips around the left edge, so shift back by the
                // scaled width to keep the video in view.
                transform: `translate(${pan.x + (mirrored ? size.w * zoom : 0)}px, ${pan.y}px) scale(${mirrored ? -zoom : zoom}, ${zoom})`,
              }}
              onLoadedMetadata={() => setMissing(false)}
              onTimeUpdate={onTimeUpdate}
              onEnded={() => setPlaying(false)}
              onError={handleVideoError}
            />
            <DrawingCanvas
              ref={stageRef}
              width={size.w}
              height={size.h}
              scale={zoom}
              posX={pan.x}
              posY={pan.y}
              shapes={shapes}
              settings={settings}
              onShapesChange={onShapesChange}
              onActivate={onActivate}
            />
            {/* Transparent layer that captures pan drags above the canvas */}
            {panMode && (
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onPointerDown={panStart}
                onPointerMove={panMove}
                onPointerUp={panEnd}
                onPointerLeave={panEnd}
              />
            )}
            {missing && src.startsWith('blob:') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 text-center text-sm text-amber-300">
                No se pudo reproducir este video en este dispositivo.
                <br />
                Intenta con un .mp4 (H.264). Los .mov/HEVC del iPad a veces no se reproducen en el navegador.
              </div>
            )}
            {missing && !src.startsWith('blob:') && !src.startsWith('data:') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 text-center text-sm text-amber-300">
                No se pudo cargar este video modelo.
                <br />
                Coloca el archivo .mp4 en /public{src}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/50">
            {emptyHint ?? "Sin video"}
          </div>
        )}
      </div>

      {src && (
        <div className="shrink-0 space-y-2 p-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={onSeek}
            className="w-full accent-cyan-400"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button className={`${btn} bg-cyan-600`} onClick={togglePlay}>
              {playing ? "Pausa" : "Play"}
            </button>
            <button className={`${btn} bg-white/10`} onClick={() => step(-1 / 30)}>
              ◀ Frame
            </button>
            <button className={`${btn} bg-white/10`} onClick={() => step(1 / 30)}>
              Frame ▶
            </button>

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <button className={`${btn} bg-white/10`} onClick={() => applyZoom(zoom - 0.5)}>
                −
              </button>
              <span className="w-12 text-center text-xs tabular-nums text-white/70">
                {Math.round(zoom * 100)}%
              </span>
              <button className={`${btn} bg-white/10`} onClick={() => applyZoom(zoom + 0.5)}>
                +
              </button>
              <button
                className={`${btn} ${panMode ? "bg-cyan-500" : "bg-white/10"}`}
                onClick={() => setPanMode((v) => !v)}
                title="Mover el video (paneo)"
              >
                ✋
              </button>
              <button
                className={`${btn} ${mirrored ? "bg-cyan-500" : "bg-white/10"}`}
                onClick={() => setMirrored((v) => !v)}
                title="Mirror — flip the image horizontally"
              >
                ⇄
              </button>
              <button className={`${btn} bg-white/10`} onClick={resetView}>
                Reset
              </button>
            </div>

            <div className="ml-auto flex gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`${btn} ${
                    speed === s ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
            <button className={`${btn} bg-white/10`} onClick={fullscreen}>
              ⛶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
