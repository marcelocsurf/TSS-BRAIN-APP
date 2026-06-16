"use client";

import type { DrawSettings, Tool } from "./types";

const TOOLS: { id: Tool; label: string }[] = [
  { id: "line", label: "Línea" },
  { id: "arrow", label: "Flecha" },
  { id: "circle", label: "Círculo" },
  { id: "angle", label: "Ángulo" },
  { id: "free", label: "Libre" },
];

const COLORS = ["#ef4444", "#22d3ee", "#facc15", "#22c55e", "#ffffff"];
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
  const btn = "rounded-xl px-3 py-3 text-sm font-semibold active:scale-95 transition";

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-black/60 p-2">
      <span className="px-1 text-xs text-white/50">Dibujar en: {activeLabel}</span>

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
            className={`h-11 w-11 rounded-xl border-2 ${
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
