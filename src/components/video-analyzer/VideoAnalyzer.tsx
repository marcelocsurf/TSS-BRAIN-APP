"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import VideoPanel from "./VideoPanel";
import Toolbar from "./Toolbar";
import ModelLibrary from "./ModelLibrary";
import StudentClips from "./StudentClips";
import { makeThumb, MAX_CLIPS_PER_GROUP, type Group } from "./clips";
import type { Shape, DrawSettings } from "./types";
import type { ModelCategory } from "./library";
import { getModelClips } from "@/lib/actions/model-clips";
import { saveSession, loadSession, clearSession, worthRestoring, type StoredSession } from "./session-store";

type PanelKey = "student" | "model";

const EMPTY_SHAPES: Shape[] = [];

let seq = 0;
const uid = (p: string) => `${p}${++seq}_${performance.now().toFixed(0)}`;

export default function VideoAnalyzer({ scope }: { scope?: string }) {
  // Identidad de quien abrió el analizador. Sin ella no se guarda nada — ver
  // session-store.ts: una clave global mezclaba las sesiones de dos personas
  // en el iPad compartido de la academia.
  const canPersist = !!scope;
  const [studentSrc, setStudentSrc] = useState<string | null>(null);
  const [modelSrc, setModelSrc] = useState<string | null>(null);
  const [modelTitle, setModelTitle] = useState<string>("The Surf Sequence Model");

  // Un juego de dibujos POR CLIP. Antes había uno solo para todos: pasabas al
  // siguiente video y las líneas del anterior se perdían para siempre.
  const [shapesByClip, setShapesByClip] = useState<Record<string, Shape[]>>({});
  const [modelShapes, setModelShapes] = useState<Shape[]>([]);
  // Clave del video del alumno en pantalla: el id del clip, o "__file" cuando
  // vino del botón de abrir archivo suelto.
  const [shapeKey, setShapeKey] = useState<string>("__file");
  const studentShapes = shapesByClip[shapeKey] ?? EMPTY_SHAPES;
  const setStudentShapes = useCallback(
    (next: Shape[] | ((prev: Shape[]) => Shape[])) => {
      setShapesByClip((all) => {
        const prev = all[shapeKeyRef.current] ?? EMPTY_SHAPES;
        const value = typeof next === "function" ? (next as (p: Shape[]) => Shape[])(prev) : next;
        return { ...all, [shapeKeyRef.current]: value };
      });
    },
    []
  );

  const [active, setActive] = useState<PanelKey>("student");
  const [showLibrary, setShowLibrary] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"students" | "models">("students");
  const [layout, setLayout] = useState<"dual" | "student" | "model">("dual");
  // SINCRONIZAR: el coach pone al alumno y al modelo en el MISMO instante de
  // la ola (el bottom turn, el take-off) y toca 🔗. A partir de ahí se mueven
  // juntos conservando ese desfase — no arrancan los dos del segundo cero,
  // porque las dos olas nunca empiezan igual.
  const [synced, setSynced] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const [library, setLibrary] = useState<ModelCategory[]>([]);
  // Cola ÚNICA de miniaturas. El AbortController se aborta SOLO al cerrar el
  // analizador. Antes cada importación abortaba la anterior: si el coach
  // agregaba una segunda tanda mientras la primera todavía procesaba (hay
  // decenas de segundos de ventana con clips 4K), esos clips se quedaban SIN
  // miniatura para siempre — y la miniatura es lo único que le permite
  // reconocer sus videos al recuperar la sesión.
  const thumbAbort = useRef<AbortController | null>(null);
  const thumbQueue = useRef<{ id: string; url: string }[]>([]);
  const thumbBusy = useRef(false);

  // Sesión anterior encontrada: se ofrece recuperarla en vez de restaurarla
  // sola — el coach decide si sigue con eso o arranca limpio.
  const [prev, setPrev] = useState<StoredSession | null>(null);
  // Clips restaurados que todavía esperan que el coach vuelva a elegir el
  // archivo (el video no se guarda: solo su nombre, miniatura y dibujos).
  const [pendingLink, setPendingLink] = useState<Record<string, true>>({});

  // `checked` = ya sabemos si había sesión. Hasta entonces NO se guarda ni se
  // deja trabajar: si el coach empezaba a importar antes de que llegara el
  // diálogo, el autoguardado pisaba la sesión buena y "Recuperar" se comía lo
  // recién hecho. Y una lectura FALLIDA no es "no hay sesión": ahí tampoco se
  // guarda, para no borrar por un error transitorio.
  const [checked, setChecked] = useState(false);
  const [readOk, setReadOk] = useState(false);
  useEffect(() => {
    if (!canPersist) { setChecked(true); return; }
    loadSession(scope!)
      .then((r) => {
        if (r.ok) { setReadOk(true); if (worthRestoring(r.session)) setPrev(r.session); }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // Load the admin-managed model clips from Supabase on first open.
  useEffect(() => {
    let alive = true;
    getModelClips()
      .then((cats) => { if (alive) setLibrary(cats); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

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

  const shapeKeyRef = useRef(shapeKey);
  shapeKeyRef.current = shapeKey;

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
    // Antes esto guardaba los dibujos bajo una clave suelta ("__file") que no
    // pertenecía a ningún clip: se contaban en el diálogo de recuperar pero
    // no había forma de volver a ellos, y al reabrir el archivo se borraban
    // solos. Ahora el botón "Importar video" del panel crea un clip normal en
    // el grupo activo, así entra en el guardado y en la recuperación como
    // cualquier otro.
    const url = URL.createObjectURL(file);
    const id = uid("c");
    setGroups((prevG) =>
      prevG.map((g) =>
        g.id === activeGroupId && g.clips.length < MAX_CLIPS_PER_GROUP
          ? { ...g, clips: [...g.clips, { id, name: file.name, url }] }
          : g
      )
    );
    setShapeKey(id);
    setCurrentClipId(id);
    setStudentSrc(url);
    setActive("student");
    enqueueThumbs([{ id, url }]);
  }

  function selectModel(src: string, title: string) {
    setSynced(false);   // el desfase era de OTRO par de videos
    setModelShapes([]);
    setModelSrc(src);
    setModelTitle(title);
    setActive("model");
  }

  // ----- Student roster (groups + clips) -----

  function addFiles(files: FileList) {
    // Capture the files + create their object URLs IMMEDIATELY. The caller
    // (StudentClips.pick) clears the input with `e.target.value = ""` right
    // after calling us, which empties the live FileList. Reading it lazily
    // inside a setState updater therefore saw 0 files → nothing was added
    // (the list stayed at 0/20). Snapshotting here fixes that.
    const picked = Array.from(files);
    if (picked.length === 0) return;

    const current = groups.find((g) => g.id === activeGroupId);
    const room = current ? MAX_CLIPS_PER_GROUP - current.clips.length : MAX_CLIPS_PER_GROUP;
    const added = picked.slice(0, Math.max(0, room)).map((f) => ({
      id: uid("c"),
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    if (added.length === 0) return;

    setGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId ? { ...g, clips: [...g.clips, ...added] } : g
      )
    );

    // Generate thumbnails ONE AT A TIME — iPad/Safari can only decode a few
    // videos concurrently, so firing all at once made some clips (and the
    // player) fail to load. Sequential keeps every clip stable.
    enqueueThumbs(added.map((c) => ({ id: c.id, url: c.url })));
  }

  // Una miniatura por vez (el decodificador del iPad no aguanta varias a la
  // vez) pero SIN cancelar lo anterior: las tandas nuevas se suman a la cola.
  function enqueueThumbs(items: { id: string; url: string }[]) {
    thumbQueue.current.push(...items);
    if (thumbBusy.current) return;
    thumbBusy.current = true;
    const signal = (thumbAbort.current ??= new AbortController()).signal;
    (async () => {
      try {
        while (thumbQueue.current.length > 0) {
          if (signal.aborted) return;
          const next = thumbQueue.current.shift()!;
          const thumb = await makeThumb(next.url, signal);
          if (!thumb || signal.aborted) continue;
          setGroups((cur) =>
            cur.map((gg) => ({
              ...gg,
              clips: gg.clips.map((cc) => (cc.id === next.id ? { ...cc, thumb } : cc)),
            }))
          );
        }
      } finally {
        thumbBusy.current = false;
      }
    })();
  }

  // ── Guardado continuo (con freno de 800 ms) ──────────────────────
  // Se guarda la ESTRUCTURA del trabajo, nunca el video. Si la app se cae o
  // el coach cierra sin querer, al volver está todo: sus grupos, el orden,
  // las miniaturas y —lo que más duele perder— sus dibujos por clip.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!canPersist || !checked || !readOk || prev) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveSession(scope!, snap());
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // OJO: este cleanup corre en CADA cambio de dependencia, así que acá no
    // se puede volcar el guardado (anularía el freno). El volcado va en el
    // efecto de desmontaje, más abajo.
  }, [groups, activeGroupId, currentClipId, shapesByClip, modelShapes, modelSrc, modelTitle, pendingLink, prev, canPersist, checked, readOk, scope]);

  // El retrato de la sesión, en un solo lugar: lo usa el guardado con freno y
  // también el volcado inmediato al cerrar.
  function snap(): StoredSession {
    const value: StoredSession = {
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          clips: g.clips.map((c) => ({ id: c.id, name: c.name, thumb: c.thumb, linked: !pendingLink[c.id] })),
        })),
        activeGroupId,
        currentClipId,
        shapesByClip,
        modelShapes,
        modelSrc,
        modelTitle,
        savedAt: Date.now(),
    };
    snapRef.current = value;
    return value;
  }

  // Recuperar la sesión anterior: vuelve todo menos el archivo de video, que
  // el coach re-elige con un toque en el clip (queda marcado con ↻).
  function restorePrev() {
    if (!prev) return;
    // Soltar lo que hubiera abierto: si no, esos object URLs quedan colgados.
    if (studentUrl.current) { URL.revokeObjectURL(studentUrl.current); studentUrl.current = null; }
    for (const g of groupsRef.current) for (const c of g.clips) if (c.url) URL.revokeObjectURL(c.url);
    setStudentSrc(null);
    setCurrentClipId(null);
    setShapeKey("__file");
    setGroups(prev.groups.map((g) => ({
      id: g.id,
      name: g.name,
      clips: g.clips.map((c) => ({ id: c.id, name: c.name, url: "", thumb: c.thumb })),
    })));
    setPendingLink(Object.fromEntries(
      prev.groups.flatMap((g) => g.clips.map((c) => [c.id, true as const]))
    ));
    setActiveGroupId(prev.activeGroupId);
    setShapesByClip(prev.shapesByClip ?? {});
    setModelShapes(prev.modelShapes ?? []);
    if (prev.modelSrc) { setModelSrc(prev.modelSrc); setModelTitle(prev.modelTitle); }
    setPrev(null);
  }

  function discardPrev() {
    setPrev(null);
    if (scope) clearSession(scope).catch(() => {});
  }

  // Volver a vincular un clip restaurado con su archivo real.
  function relinkClip(clipId: string, file: File) {
    const url = URL.createObjectURL(file);
    setGroups((prevG) => prevG.map((g) => ({
      ...g,
      clips: g.clips.map((c) => (c.id === clipId ? { ...c, url, name: file.name } : c)),
    })));
    setPendingLink((m) => { const { [clipId]: _drop, ...rest } = m; return rest; });
    setShapeKey(clipId);
    setStudentSrc(url);
    setCurrentClipId(clipId);
    setActive("student");
  }

  // Al cerrar el analizador: cortar el lote de miniaturas y devolver todos
  // los object URLs. Antes no se liberaba ni uno solo.
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  // Lo último que hizo el coach no se puede perder por el freno de 800 ms:
  // al cerrar el analizador —o al mandar la app a segundo plano, que en iPad
  // es el paso previo a que iOS la mate— se escribe ya.
  const snapRef = useRef<StoredSession | null>(null);
  const flush = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    if (!scope || !snapRef.current) return;
    saveSession(scope, { ...snapRef.current, savedAt: Date.now() }).catch(() => {});
  }, [scope]);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flush]);

  useEffect(() => () => {
    flush();
    thumbAbort.current?.abort();
    if (studentUrl.current) URL.revokeObjectURL(studentUrl.current);
    for (const g of groupsRef.current) {
      for (const c of g.clips) URL.revokeObjectURL(c.url);
    }
  }, []);

  function toggleSync() {
    if (synced) { setSynced(false); return; }
    const sv = studentVideo.current, mv = modelVideo.current;
    if (!sv || !mv) return;
    setSyncOffset(mv.currentTime - sv.currentTime);   // el desfase de AHORA
    setSynced(true);
  }

  function selectClip(clipId: string) {
    const group = groups.find((g) => g.id === activeGroupId);
    const clip = group?.clips.find((c) => c.id === clipId);
    if (!clip) return;
    // Clip recuperado sin archivo todavía: no hay nada que reproducir, hay
    // que pedírselo. StudentClips muestra el ↻ y dispara el selector.
    if (!clip.url) return;
    setSynced(false);   // el desfase era de OTRO par de videos
    setShapeKey(clipId);          // sus dibujos vuelven solos
    setStudentSrc(clip.url);
    setCurrentClipId(clipId);
    setActive("student");
    if (layout === "model") setLayout("dual");
  }

  function removeClip(clipId: string) {
    const group = groups.find((g) => g.id === activeGroupId);
    const clip = group?.clips.find((c) => c.id === clipId);
    // Si el que se borra es el que está en pantalla, hay que soltar el video
    // ANTES de revocar su URL — si no, el coach ve un cartel de error y cree
    // que la herramienta se rompió.
    const viendo = currentClipId === clipId;
    if (viendo) {
      setStudentSrc(null);
      setCurrentClipId(null);
      setShapeKey("__file");
    }
    setShapesByClip((all) => {
      const { [clipId]: _drop, ...rest } = all;
      return rest;
    });
    setGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId ? { ...g, clips: g.clips.filter((c) => c.id !== clipId) } : g
      )
    );
    // El revoke va FUERA del updater (que React puede ejecutar dos veces en
    // desarrollo) y después de que el <video> soltó la fuente.
    if (clip) setTimeout(() => URL.revokeObjectURL(clip.url), 0);
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

    // Tope de 1920 px de ancho: un cuadro 4K son 3840×2160 = 33 MB de canvas
    // (más el de Konva encima), y en iPad ese pico se suma a los dos videos
    // vivos. Para mandarle una imagen anotada al alumno, 1080p sobra.
    const MAX_W = 1920;
    const k = vw > MAX_W ? MAX_W / vw : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vw * k);
    canvas.height = Math.round(vh * k);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1) current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
        ctx.drawImage(overlay, offX, offY, dispW, dispH, 0, 0, canvas.width, canvas.height);
      }
      // restore zoom/pan
      stage.scale({ x: savedScale, y: savedScale });
      stage.position(savedPos);
      stage.batchDraw();
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = `tss-analysis-${active}-${Date.now()}.png`;
      a.click();
      // Safari empieza la descarga en el tick siguiente: revocar de inmediato
      // la cancelaba y no bajaba nada. Se libera un minuto después.
      setTimeout(() => URL.revokeObjectURL(href), 60000);
      // Y se suelta el canvas grande a mano — iOS tarda en recogerlo solo.
      canvas.width = 0;
      canvas.height = 0;
    }, "image/png");
  }

  const activeLabel = active === "student" ? "Student" : "Model";

  const prevClips = prev ? prev.groups.reduce((n, g) => n + g.clips.length, 0) : 0;
  const prevShapes = prev
    ? Object.values(prev.shapesByClip ?? {}).reduce((n, a) => n + a.length, 0)
    : 0;

  return (
    <div className="flex h-full w-full flex-col bg-[#0B1B2B] text-white">
      {/* ── Sesión anterior encontrada ──────────────────────────────
          Si la app se cerró (o el coach cerró sin querer), acá está su
          trabajo esperándolo. No se restaura solo: él decide. */}
      {prev && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-[#12293F] p-5 text-center">
            <p className="text-2xl">↻</p>
            <h2 className="mt-1 text-base font-bold">Tenés una sesión sin terminar</h2>
            <p className="mt-1.5 text-[13px] text-white/70">
              {prevClips > 0 && <>{prevClips} video{prevClips === 1 ? "" : "s"}</>}
              {prevClips > 0 && prevShapes > 0 && " · "}
              {prevShapes > 0 && <>{prevShapes} dibujo{prevShapes === 1 ? "" : "s"}</>}
              {" — con sus grupos y sus anotaciones."}
            </p>
            <p className="mt-2 text-[11.5px] text-white/45">
              Los videos no se guardan en la app, así que te los va a volver a pedir
              con un toque. Todo lo demás vuelve como estaba.
            </p>
            <button
              type="button"
              onClick={restorePrev}
              className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-[#0B1B2B] active:scale-95"
            >
              Recuperar mi sesión
            </button>
            <button
              type="button"
              onClick={discardPrev}
              className="mt-2 w-full rounded-xl bg-white/10 px-4 py-2 text-[13px] active:scale-95"
            >
              Empezar de cero
            </button>
          </div>
        </div>
      )}
      <header className="flex shrink-0 flex-wrap items-center gap-2 px-3 py-1.5 pr-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* ?v cache-bust: Safari cached the pre-middleware-fix 307 redirect
            for this path, showing a broken image. New URL forces a re-fetch. */}
        <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" className="h-8 w-auto shrink-0" />
        <h1
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading, Playfair Display), serif' }}
        >
          Video Analyzer
        </h1>
        <span
          className="hidden sm:inline text-[10px] uppercase tracking-[0.15em] text-[#5AC3E7]"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          The Surf Sequence
        </span>
        {/* Build marker — confirms the device is running the latest deploy
            (not a stale cached PWA shell). */}
        <span
          className="text-[10px] tracking-[0.15em] text-white/40"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          build jun24c
        </span>
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
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold active:scale-95 ${
                layout === key ? "bg-cyan-500" : "bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* 🔗 SINCRONIZAR — solo tiene sentido con los dos videos a la vista.
            Se apoya en dónde están AHORA los dos: el coach los deja en el
            mismo momento de la ola y toca acá. */}
        {layout === "dual" && studentSrc && modelSrc && (
          <button
            onClick={toggleSync}
            title={synced ? "Los dos videos se mueven juntos" : "Poné los dos en el mismo momento de la ola y tocá acá"}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold active:scale-95 ${
              synced ? "bg-amber-400 text-[#0B1B2B]" : "bg-white/10"
            }`}
          >
            {synced ? "🔗 Sincronizados" : "🔗 Sincronizar"}
          </button>
        )}
        <button
          onClick={() => setShowLibrary((v) => !v)}
          className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold active:scale-95"
        >
          {showLibrary ? "Ocultar librería" : "Mostrar librería"}
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Phone scrim — tap to close the library drawer (md+ has no overlay) */}
        {showLibrary && (
          <button
            type="button"
            aria-label="Close library"
            onClick={() => setShowLibrary(false)}
            className="absolute inset-0 z-10 bg-black/50 md:hidden"
          />
        )}
        {showLibrary && (
          <aside className="absolute inset-y-0 left-0 z-20 flex w-64 max-w-[85%] shrink-0 flex-col border-r border-white/10 bg-[#0B1B2B] md:static md:z-auto md:w-44 md:max-w-none md:bg-transparent">
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
                  pendingLink={pendingLink}
                  onRelinkClip={relinkClip}
                />
              ) : (
                <ModelLibrary selectedSrc={modelSrc} onSelect={selectModel} library={library} />
              )}
            </div>
          </aside>
        )}

        <main
          className={`grid min-h-0 flex-1 gap-1.5 p-1.5 ${
            layout === "dual"
              ? "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1"
              : "grid-cols-1 grid-rows-1"
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
              peer={modelVideo}
              peerOffset={syncOffset}
              synced={synced && layout === "dual"}
            />
          )}
          {layout !== "student" && (
            <VideoPanel
              title={modelSrc ? modelTitle : "The Surf Sequence Model Video"}
              src={modelSrc}
              isActive={active === "model"}
              shapes={modelShapes}
              settings={settings}
              videoRef={modelVideo}
              stageRef={modelStage}
              onShapesChange={setModelShapes}
              onActivate={() => setActive("model")}
              emptyHint="Elige un video modelo de la librería."
              peer={studentVideo}
              peerOffset={-syncOffset}
              synced={synced && layout === "dual"}
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
