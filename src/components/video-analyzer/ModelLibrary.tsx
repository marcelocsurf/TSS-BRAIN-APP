"use client";

import { useState } from "react";
import { LIBRARY } from "./library";

type Props = {
  selectedSrc: string | null;
  onSelect: (src: string, title: string) => void;
};

export default function ModelLibrary({ selectedSrc, onSelect }: Props) {
  const [openCat, setOpenCat] = useState<string | null>(LIBRARY[0]?.id ?? null);

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto p-2">
      <h2 className="px-1 pb-1 text-sm font-bold text-cyan-300">
        TSS Model Library
      </h2>
      {LIBRARY.map((cat) => {
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
                    {clip.title}
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
