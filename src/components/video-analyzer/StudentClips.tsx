"use client";

import { type ChangeEvent } from "react";
import { MAX_CLIPS_PER_GROUP, type Group } from "./clips";

type Props = {
  groups: Group[];
  activeGroupId: string;
  currentClipId: string | null;
  onAddGroup: () => void;
  onRenameGroup: (id: string) => void;
  onSelectGroup: (id: string) => void;
  onAddFiles: (files: FileList) => void;
  onSelectClip: (clipId: string) => void;
  onRemoveClip: (clipId: string) => void;
};

export default function StudentClips({
  groups,
  activeGroupId,
  currentClipId,
  onAddGroup,
  onRenameGroup,
  onSelectGroup,
  onAddFiles,
  onSelectClip,
  onRemoveClip,
}: Props) {
  const group = groups.find((g) => g.id === activeGroupId) ?? groups[0];

  function pick(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) onAddFiles(e.target.files);
    e.target.value = "";
  }

  const full = group ? group.clips.length >= MAX_CLIPS_PER_GROUP : false;

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden p-2">
      <h2 className="px-1 text-sm font-bold text-cyan-300">Alumnos</h2>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-1">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelectGroup(g.id)}
            onDoubleClick={() => onRenameGroup(g.id)}
            className={`rounded-lg px-2 py-2 text-xs font-semibold ${
              g.id === activeGroupId ? "bg-cyan-500" : "bg-white/10"
            }`}
            title="Doble toque para renombrar"
          >
            {g.name}
          </button>
        ))}
        <button
          onClick={onAddGroup}
          className="rounded-lg bg-white/10 px-2 py-2 text-xs font-semibold"
          title="Nuevo grupo / alumno"
        >
          ＋
        </button>
      </div>

      {/* A <label> opens the picker via a native tap — reliable on iOS
          Safari/iPad, unlike a display:none input + programmatic .click(). */}
      {full ? (
        <button
          disabled
          className="rounded-xl px-3 py-3 text-sm font-semibold bg-white/10 text-white/40"
        >
          Grupo lleno (20)
        </button>
      ) : (
        <label className="rounded-xl px-3 py-3 text-sm font-semibold active:scale-95 bg-cyan-600 cursor-pointer text-center">
          ＋ Agregar videos
          <input
            type="file"
            accept="video/*"
            multiple
            className="sr-only"
            onChange={pick}
          />
        </label>
      )}

      <div className="px-1 text-[11px] text-white/40">
        {group?.clips.length ?? 0}/{MAX_CLIPS_PER_GROUP} videos
      </div>

      {/* Clip list */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {group?.clips.length === 0 && (
          <p className="px-1 text-xs text-white/40">
            Agrega videos desde la galería del iPad o la carpeta de la Mac.
          </p>
        )}
        {group?.clips.map((c, i) => (
          <div
            key={c.id}
            className={`flex items-center gap-2 rounded-xl p-1 ${
              currentClipId === c.id ? "bg-cyan-500/30 ring-1 ring-cyan-400" : "bg-white/5"
            }`}
          >
            <button
              onClick={() => onSelectClip(c.id)}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-black">
                {c.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-white/40">
                    ▶
                  </span>
                )}
              </span>
              <span className="line-clamp-2 text-xs">
                {i + 1}. {c.name}
              </span>
            </button>
            <button
              onClick={() => onRemoveClip(c.id)}
              className="px-2 py-2 text-xs text-white/50 active:scale-95"
              title="Quitar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
