"use client";

import { useState } from "react";
import { LIBRARY, type ModelCategory } from "./library";

type Props = {
  selectedSrc: string | null;
  onSelect: (src: string, title: string) => void;
  library?: ModelCategory[];
};

export default function ModelLibrary({ selectedSrc, onSelect, library }: Props) {
  const cats = library && library.length > 0 ? library : LIBRARY;
  const [openCat, setOpenCat] = useState<string | null>(cats[0]?.id ?? null);

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto p-2">
      <h2 className="px-1 pb-1 text-sm font-bold text-cyan-300">
        TSS Model Library
      </h2>
      {cats.length === 0 && (
        <p className="px-2 py-3 text-xs text-white/40">No model clips yet.</p>
      )}
      {cats.map((cat) => {
        const open = openCat === cat.id;
        return (
          <div key={cat.id} className="rounded-xl bg-white/5">
            <button
              onClick={() => setOpenCat(open ? null : cat.id)}
              className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold"
            >
              {cat.name}
              <span className="text-white/40">{open ? "−" : "+"}</span>
            </button>
            {open && (
              <div className="space-y-1 px-2 pb-2">
                {cat.clips.map((clip) => (
                  <button
                    key={clip.id}
                    onClick={() => onSelect(clip.src, clip.title)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                      selectedSrc === clip.src
                        ? "bg-cyan-500 font-semibold"
                        : "bg-white/10"
                    }`}
                  >
                    <span className="block">{clip.title}</span>
                    {clip.description && (
                      <span className="mt-0.5 block text-[10px] text-white/50">{clip.description}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
