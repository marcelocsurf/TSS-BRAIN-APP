"use client";

import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import VideoPanel from "./VideoPanel";
import Toolbar from "./Toolbar";
import ModelLibrary from "./ModelLibrary";
import StudentClips from "./StudentClips";
import { makeThumb, MAX_CLIPS_PER_GROUP, type Group } from "./clips";
import type { Shape, DrawSettings } from "./types";

type PanelKey = "student" | "model";

let seq = 0;
const uid = (p: string) => `${p}${++seq}_${performance.now().toFixed(0)}`;

export default function VideoAnalyzer() {
  const [studentSrc, setStudentSrc] = useState<string | null>(null);
  const [modelSrc, setModelSrc] = useState<string | null>(null);
  const [modelTitle, setModelTitle] = useState<string>("TSS Model");

  const [studentShapes, setStudentShapes] = useState<Shape[]>([]);
  const [modelShapes, setModelShapes] = useState<Shape[]>([]);

  const [active, setActive] = useState<PanelKey>("student");
  const [showLibrary, setShowLibrary] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"students" | "models">("students");
  const [layout, setLayout] = useState<"dual" | "student" | "model">("dual");

  // Student roster: groups of local clips (in-memory, never uploaded).
  const [groups, setGroups] = useState<Group[]>([
    { id: "g1", name: "Grupo 1", clips: [] },
  ]);
  const [activeGroupId, setActiveGroupId] = useState("g1");
  const [currentClipId, setCurrentClipId] = useState<string | null>(null);
  const [settings, setSettings] = useState<DrawSettings>({
    tool: "arrow",
    color: "#ef4444",
    width: 5,
  });

  const studentVideo = useRef<HTMLVideoElement>(null);
  const modelVideo = useRef<HTMLVideoElement>(null);
  const studentStage = useRef<Konva.Stage>(null);
  const modelStage = useRef<Konva.Stage>(null);

  const studentUrl = useRef<string | null>(null);

  // In single-panel layouts, keep the drawing target on the visible panel.
  useEffect(() => {
    if (layout === "student") setActive("student");
    else if (layout === "model") setActive("model");
  }, [layout]);

  function pickStudentFile(file: File) {
    if (studentUrl.current) URL.revokeObjectURL(studentUrl.current);
    const url = URL.createObjectURL(file);
    studentUrl.current = url;
    setStudentShapes([]);
    setStudentSrc(url);
    setActive("student");
  }

  function selectModel(src: string, title: string) {
    setModelShapes([]);
    setModelSrc(src);
    setModelTitle(title);
    setActive("model");
  }

  // ----- Student roster (groups + clips) -----

  function addFiles(files: FileList) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        const room = MAX_CLIPS_PER_GROUP - g.clips.length;
        const incoming = Array.from(files).slice(0, Math.max(0, room));
        const added = incoming.map((f) => ({
          id: uid("c"),
          name: f.name,
          url: URL.createObjectURL(f),
        }));
        // Generate thumbnails asynchronously and patch them in.
        added.forEach((clip) => {
          makeThumb(clip.url).then((thumb) => {
            if (!thumb) return;
            setGroups((cur) =>
              cur.map((gg) => ({
                ...gg,
                clips: gg.clips.map((cc) =>
                  cc.id === clip.id ? { ...cc, thumb } : cc
                ),
              }))
            );
          });
        });
        return { ...g, clips: [...g.clips, ...added] };
      })
    );
  }

  function selectClip(clipId: string) {
    const group = groups.find((g) => g.id === activeGroupId);
    const clip = group?.clips.find((c) => c.id === clipId);
    if (!clip) return;
    setStudentShapes([]);
    setStudentSrc(clip.url);
    setCurrentClipId(clipId);
    setActive("student");
    if (layout === "model") setLayout("dual");
  }

  function removeClip(clipId: string) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        const clip = g.clips.find((c) => c.id === clipId);
        if (clip) URL.revokeObjectURL(clip.url);
        return { ...g, clips: g.clips.filter((c) => c.id !== clipId) };
      })
    );
    if (currentClipId === clipId) setCurrentClipId(null);
  }

  function addGroup() {
    const id = uid("g");
    setGroups((prev) => [...prev, { id, name: `Grupo ${prev.length + 1}`, clips: [] }]);
    setActiveGroupId(id);
  }

  function renameGroup(id: string) {
    const g = groups.find((x) => x.id === id);
    const name = window.prompt("Nombre del grupo / alumno:", g?.name ?? "");
    if (name && name.trim()) {
      setGroups((prev) =>
        prev.map((x) => (x.id === id ? { ...x, name: name.trim() } : x))
      );
    }
  }

  function undo() {
    if (active === "student") setStudentShapes((s) => s.slice(0, -1));
    else setModelShapes((s) => s.slice(0, -1));
  }

  function clear() {
    if (active === "student") setStudentShapes([]);
    else setModelShapes([]);
  }

  // Compose current video frame + annotations into a PNG and download it.
  function exportPng() {
    const video = active === "student" ? studentVideo.current : modelVideo.current;
    const stage = active === "student" ? studentStage.current : modelStage.current;
    if (!video) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const canvas = document.createElement("canvas");
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1) current video frame
    ctx.drawImage(video, 0, 0, vw, vh);

    // 2) annotations, scaled from on-screen size to native video size.
    // Temporarily neutralize zoom/pan so the overlay maps to the full frame.
    if (stage) {
      const savedScale = stage.scaleX();
      const savedPos = stage.position();
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      const sw = stage.width();
      const sh = stage.height();
      if (sw && sh) {
        const scale = Math.min(sw / vw, sh / vh);
        const dispW = vw * scale;
        const dispH = vh * scale;
        const offX = (sw - dispW) / 2;
        const offY = (sh - dispH) / 2;
        const overlay = stage.toCanvas();
        ctx.drawImage(overlay, offX, offY, dispW, dispH, 0, 0, vw, vh);
      }
      // restore zoom/pan
      stage.scale({ x: savedScale, y: savedScale });
      stage.position(savedPos);
      stage.batchDraw();
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tss-analysis-${active}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  }

  const activeLabel = active === "student" ? "Student" : "Model";

  return (
    <div className="flex h-full w-full flex-col bg-[#0B1B2B] text-white">
      <header className="flex shrink-0 flex-wrap items-center gap-3 px-3 py-2">
        <h1 className="text-base font-extrabold tracking-tight">
          TSS Quick Video Analyzer
        </h1>
        {/* Layout toggle: 2 panels, only student, or only model */}
        <div className="ml-auto flex gap-1">
          {([
            ["dual", "2 pantallas"],
            ["student", "Solo alumno"],
            ["model", "Solo modelo"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setLayout(key)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 ${
                layout === key ? "bg-cyan-500" : "bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowLibrary((v) => !v)}
          className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold active:scale-95"
        >
          {showLibrary ? "Ocultar librería" : "Mostrar librería"}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {showLibrary && (
          <aside className="flex w-44 shrink-0 flex-col border-r border-white/10">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setSidebarTab("students")}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                  sidebarTab === "students" ? "bg-cyan-500" : "bg-white/10"
                }`}
              >
                Alumnos
              </button>
              <button
                onClick={() => setSidebarTab("models")}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                  sidebarTab === "models" ? "bg-cyan-500" : "bg-white/10"
                }`}
              >
                Modelos
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {sidebarTab === "students" ? (
                <StudentClips
                  groups={groups}
                  activeGroupId={activeGroupId}
                  currentClipId={currentClipId}
                  onAddGroup={addGroup}
                  onRenameGroup={renameGroup}
                  onSelectGroup={setActiveGroupId}
                  onAddFiles={addFiles}
                  onSelectClip={selectClip}
                  onRemoveClip={removeClip}
                />
              ) : (
                <ModelLibrary selectedSrc={modelSrc} onSelect={selectModel} />
              )}
            </div>
          </aside>
        )}

        <main
          className={`grid min-h-0 flex-1 gap-2 p-2 ${
            layout === "dual" ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {layout !== "model" && (
            <VideoPanel
              title="Student Video"
              src={studentSrc}
              isActive={active === "student"}
              shapes={studentShapes}
              settings={settings}
              videoRef={studentVideo}
              stageRef={studentStage}
              onShapesChange={setStudentShapes}
              onActivate={() => setActive("student")}
              onPickFile={pickStudentFile}
              emptyHint="Importa un video del alumno desde el iPad."
            />
          )}
          {layout !== "student" && (
            <VideoPanel
              title={modelSrc ? modelTitle : "TSS Model Video"}
              src={modelSrc}
              isActive={active === "model"}
              shapes={modelShapes}
              settings={settings}
              videoRef={modelVideo}
              stageRef={modelStage}
              onShapesChange={setModelShapes}
              onActivate={() => setActive("model")}
              emptyHint="Elige un video modelo de la librería."
            />
          )}
        </main>
      </div>

      <Toolbar
        settings={settings}
        onChange={setSettings}
        onUndo={undo}
        onClear={clear}
        onExport={exportPng}
        activeLabel={activeLabel}
      />
    </div>
  );
}
