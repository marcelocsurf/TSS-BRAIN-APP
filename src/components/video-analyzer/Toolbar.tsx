"use client";

import { DURATIONS, type DrawSettings, type Tool } from "./types";
import { STICKERS, STICKER_GROUPS } from "@/lib/constants/analyzer-stickers";
import { useState } from "react";

const TOOLS: { id: Tool; label: string }[] = [
  { id: "line", label: "Línea" },
  { id: "arrow", label: "Flecha" },
  { id: "circle", label: "Círculo" },
  { id: "angle", label: "Ángulo" },
  { id: "free", label: "Libre" },
];

// Paleta elegida para leerse SOBRE AGUA. El rojo puro se apaga contra el
// azul del mar; estos tonos son más saturados y claros, y con el contorno
// oscuro que ahora lleva cada trazo resaltan con sol o con sombra.
const COLORS = ["#FF3B5C", "#00E5FF", "#FFD166", "#39D98A", "#FFFFFF"];
const WIDTHS = [3, 5, 8];

type Props = {
  settings: DrawSettings;
  onAddSticker?: (src: string, ratio: number) => void;
  /** Transparencia del sticker agarrado, si hay uno. */
  stickerAlpha?: number | null;
  onStickerAlpha?: (a: number) => void;
  onDeleteSticker?: () => void;
  onChange: (next: DrawSettings) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  activeLabel: string;
};

export default function Toolbar({
  settings,
  onAddSticker,
  stickerAlpha,
  onStickerAlpha,
  onDeleteSticker,
  onChange,
  onUndo,
  onClear,
  onExport,
  activeLabel,
}: Props) {
  const btn = "rounded-lg px-2.5 py-1.5 text-xs font-semibold active:scale-95 transition";
  const [stickersOpen, setStickersOpen] = useState(false);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-t border-white/10 bg-black/60 p-1.5">
      <span className="px-1 text-xs text-white/50">Dibujar en: {activeLabel}</span>

      {/* Cuánto dura el dibujo. "Fija" = queda para siempre (lo de antes).
          Con una duración, aparece en el segundo en que lo dibujaste y se va;
          al volver a pasar el video, reaparece. */}
      <div className="flex items-center gap-1">
        <span className="px-1 text-[10px] uppercase tracking-wider text-white/40">Dura</span>
        {DURATIONS.map((d) => (
          <button
            key={String(d.v)}
            onClick={() => onChange({ ...settings, dur: d.v })}
            className={`${btn} ${
              (settings.dur ?? null) === d.v ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Con ⏸ prendido, el video se CONGELA al llegar al dibujo lo que dure
          y después sigue sin él — la clase se explica sola. Solo tiene
          sentido con una duración elegida. */}
      <button
        onClick={() => onChange({ ...settings, hold: !settings.hold })}
        disabled={(settings.dur ?? null) === null}
        title="Pausar el video al llegar a la línea"
        className={`${btn} disabled:opacity-30 ${settings.hold ? "bg-amber-400 text-[#0B1B2B]" : "bg-white/10"}`}
      >
        ⏸ Pausa
      </button>

      {/* ── STICKERS ── El material de The Surf Sequence PEGADO encima del
          video: el coach lo arrastra sobre la tabla del alumno, lo agranda y
          lo gira. Van en un cajón porque son varios y la barra ya está llena. */}
      {onAddSticker && (
        <div className="relative">
          <button
            onClick={() => setStickersOpen((v) => !v)}
            className={`${btn} ${stickersOpen ? "bg-cyan-500" : "bg-white/10"}`}
          >
            🏷 Stickers
          </button>
          {stickersOpen && (
            <div className="absolute bottom-full left-0 z-30 mb-1.5 w-64 rounded-xl border border-white/15 bg-[#0B1B2B] p-2 shadow-2xl">
              {STICKER_GROUPS.map((g) => (
                <div key={g} className="mb-1.5 last:mb-0">
                  <p className="px-1 pb-1 text-[9px] uppercase tracking-wider text-white/40">{g}</p>
                  <div className="flex flex-wrap gap-1">
                    {STICKERS.filter((k) => k.group === g).map((k) => (
                      <button
                        key={k.id}
                        onClick={() => { onAddSticker(k.src, k.ratio); setStickersOpen(false); }}
                        className="rounded-lg bg-white/10 px-2 py-1.5 text-[11px] font-semibold active:scale-95"
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Con un sticker agarrado: transparencia y quitar. */}
      {stickerAlpha != null && (
        <div className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-2 py-1">
          <span className="text-[10px] uppercase tracking-wider text-white/60">Sticker</span>
          <input
            type="range" min={0.15} max={1} step={0.05} value={stickerAlpha}
            onChange={(e) => onStickerAlpha?.(Number(e.target.value))}
            aria-label="Transparencia del sticker"
            className="w-20"
          />
          <button onClick={onDeleteSticker} className={`${btn} bg-white/10`} title="Quitar sticker">✕</button>
        </div>
      )}

      <div className="flex gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange({ ...settings, tool: t.id })}
            className={`${btn} ${
              settings.tool === t.id ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ ...settings, color: c })}
            style={{ background: c }}
            className={`h-8 w-8 rounded-lg border-2 ${
              settings.color === c ? "border-white" : "border-transparent"
            }`}
            aria-label={`color ${c}`}
          />
        ))}
      </div>

      <div className="flex gap-1">
        {WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => onChange({ ...settings, width: w })}
            className={`${btn} ${
              settings.width === w ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            {w}px
          </button>
        ))}
      </div>

      <div className="ml-auto flex gap-1">
        <button className={`${btn} bg-white/10`} onClick={onUndo}>
          Deshacer
        </button>
        <button className={`${btn} bg-white/10`} onClick={onClear}>
          Limpiar
        </button>
        <button className={`${btn} bg-emerald-600`} onClick={onExport}>
          Exportar PNG
        </button>
      </div>
    </div>
  );
}
