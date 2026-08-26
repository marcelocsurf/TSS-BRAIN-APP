"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
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
  // Segundo actual del video. Los dibujos con duración aparecen y desaparecen
  // según esto. `timeupdate` en WebKit solo dispara ~4 veces por segundo —
  // demasiado grueso para que una línea de 1 s se vea entrar y salir limpia —
  // así que mientras REPRODUCE se refresca por cuadro con rAF, y cuando está
  // pausado alcanza con timeupdate/seek.
  const [now, setNow] = useState(0);
  const [missing, setMissing] = useState(false);

  // ⚠ ACÁ SE CERRABA LA APP (Stanley, 2026-08-25, con clientes enfrente).
  // Había un "fallback": si el video no arrancaba, se releía el archivo
  // COMPLETO y se convertía a texto base64 (data: URL) para volver a
  // intentarlo. Un clip de iPhone en 4K de 15 s son ~100 MB; en base64 son
  // ~140 MB, y hay que tener los dos a la vez → un pico de 250-400 MB de
  // golpe. Safari en iPad no avisa cuando se pasa: mata la pestaña. Como la
  // app está instalada, eso se ve como "se cerró la aplicación".
  // Y encima era inútil: si el video no arranca por el códec (los .mov HEVC
  // del iPhone), pasarlo a base64 no cambia el códec — gastaba la memoria y
  // fallaba igual. El commit que lo introdujo decía que el bug era de iPad y
  // que se había verificado "in headless Chrome": el camino que solo corre en
  // iPad nunca se probó en un iPad.
  // Sin fallback: si el video no abre, se lo decimos y listo. Nadie se queda
  // sin app a mitad de una clase.
  function handleVideoError() {
    setMissing(true);
  }

  // ⚠ CAUSA #2 del cierre: al desmontar el panel, el <video> se iba con su
  // decodificador y sus buffers vivos. Y se desmonta seguido: cada toque en
  // "2 pantallas / Solo alumno / Solo modelo" tira un panel entero, y cerrar
  // el analizador tira los dos. En iPad eso se acumula hasta que el sistema
  // mata la pestaña.
  // Va como callback ref y NO como cleanup de useEffect: React corre el
  // cleanup DESPUÉS de escribir el DOM, así que un cleanup con deps [src]
  // borraría el src NUEVO y el video quedaría en negro tras cada cambio de
  // clip. El callback ref solo recibe null en el desmontaje real.
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    const ref = videoRef as MutableRefObject<HTMLVideoElement | null>;
    const prev = ref.current;
    if (!node && prev) {
      prev.pause();
      prev.removeAttribute("src");
      prev.load();          // fuerza a WebKit a soltar el recurso ya
    }
    ref.current = node;
  }, [videoRef]);

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
    setNow(0);
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
    cancelHold();
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
    cancelHold();
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
    setNow(el.currentTime);
  }

  // ── PAUSA AUTOMÁTICA EN EL DIBUJO ────────────────────────────────
  // El video llega al segundo de una línea marcada con ⏸, se congela lo que
  // dure, y sigue sin ella. `consumed` recuerda cuáles ya cumplieron su turno
  // en esta pasada — si no, al soltar el video se volvería a pausar en el
  // mismo punto para siempre.
  const [consumed, setConsumed] = useState<Set<string>>(() => new Set());
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holding = useRef(false);

  // Volver atrás (o cambiar de video) rearma todas las pausas: el coach le da
  // play de nuevo y la clase se vuelve a explicar sola.
  const lastNow = useRef(0);
  useEffect(() => {
    if (now < lastNow.current - 0.35) setConsumed(new Set());
    lastNow.current = now;
  }, [now]);
  useEffect(() => {
    setConsumed(new Set());
    holding.current = false;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (!playing || holding.current) return;
    // TODAS las líneas de ese instante, no una: si el coach dibujó seis en el
    // mismo momento, antes se pausaba SEIS veces seguidas — se veía como que
    // el video se pausaba y arrancaba solo sin control (reporte de Marcelo).
    // Ahora una sola pausa, con la duración más larga de las que caen ahí.
    // Y solo dispara en una ventana corta después del segundo del dibujo: sin
    // eso, cualquier línea vieja no consumida frenaba el video apenas le daba
    // play, una y otra vez.
    const due = shapes.filter(
      (sh) => sh.hold && sh.dur != null && sh.t != null
        && !consumed.has(sh.id) && now >= sh.t && now < sh.t + 0.5
    );
    if (due.length === 0) return;
    const el = videoRef.current;
    if (!el) return;
    const secs = Math.max(...due.map((d) => d.dur ?? 1));
    holding.current = true;
    el.pause();
    setPlaying(false);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      setConsumed((c) => { const n = new Set(c); for (const d of due) n.add(d.id); return n; });
      holding.current = false;
      const v = videoRef.current;
      if (v) { v.play().then(() => setPlaying(true)).catch(() => {}); }
    }, secs * 1000);
  }, [now, playing, shapes, consumed, videoRef]);

  // El coach MANDA. Si toca play/pausa mientras una línea tiene el video
  // congelado, se cancela la pausa automática y no se vuelve a soltar sola —
  // antes el temporizador seguía corriendo y le daba play encima, y por eso
  // "costaba que respondiera el botón".
  function cancelHold() {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (holding.current) {
      holding.current = false;
      // Las que estaban frenando se dan por vistas: si no, vuelve a pausar
      // en el mismo punto apenas le dé play.
      setConsumed((c) => {
        const n = new Set(c);
        for (const sh of shapes) {
          if (sh.hold && sh.t != null && sh.dur != null && now >= sh.t && now < sh.t + 0.5) n.add(sh.id);
        }
        return n;
      });
    }
  }

  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  // Reloj fino solo mientras reproduce; se apaga al pausar (no dejamos un
  // rAF corriendo en un iPad que ya va justo de memoria).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const el = videoRef.current;
      if (el) setNow(el.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, videoRef]);

  function onSeek(e: ChangeEvent<HTMLInputElement>) {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    cancelHold();
    const v = Number(e.target.value);
    el.currentTime = v * el.duration;
    setProgress(v);
    setNow(el.currentTime);
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
    "rounded-lg px-2.5 py-1.5 text-xs font-semibold active:scale-95 transition";

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border ${
        isActive ? "border-cyan-400" : "border-white/10"
      } bg-black/40`}
    >
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="text-xs font-bold text-cyan-300">{title}</span>
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
              ref={attachVideo}
              src={src ?? undefined}
              // Only request CORS for remote model clips (needed to export the
              // annotated frame). Local files are blob:/data: URLs — setting
              // crossOrigin on them can stop Safari/iPad from loading the video.
              crossOrigin={src.startsWith("blob:") || src.startsWith("data:") ? undefined : "anonymous"}
              playsInline
              // 'auto' le pide a WebKit bufferear todo lo que pueda del
              // archivo — y en vista dual hay DOS pidiendo lo mismo sobre
              // archivos de cientos de MB. 'metadata' carga solo lo necesario
              // para mostrar el primer cuadro; el resto entra al darle play.
              preload="metadata"
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
              now={now}
              consumed={consumed}
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
        <div className="shrink-0 space-y-1.5 p-1.5">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={onSeek}
            className="w-full accent-cyan-400"
          />
          <div className="flex flex-wrap items-center gap-1.5">
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
