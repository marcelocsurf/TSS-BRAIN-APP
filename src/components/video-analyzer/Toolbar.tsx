"use client";

import { DURATIONS, type DrawSettings, type Tool } from "./types";

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
  onChange: (next: DrawSettings) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  activeLabel: string;
};

export default function Toolbar({
  settings,
  onChange,
  onUndo,
  onClear,
  onExport,
  activeLabel,
}: Props) {
  const btn = "rounded-lg px-2.5 py-1.5 text-xs font-semibold active:scale-95 transition";

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
