export type Clip = {
  id: string;
  name: string;
  url: string; // object URL (local, never uploaded)
  thumb?: string; // data URL thumbnail
};

export type Group = {
  id: string;
  name: string;
  clips: Clip[];
};

export const MAX_CLIPS_PER_GROUP = 20;

// Capture the first frame of a local video as a small JPEG thumbnail.
// Resolves to undefined if the browser can't decode/seek the file.
export function makeThumb(url: string, signal?: AbortSignal): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve(undefined);
    const v = document.createElement("video");
    v.src = url;
    v.muted = true;
    v.playsInline = true;
    // 'metadata', no 'auto': para sacar UN cuadro no hace falta bufferear
    // 100 MB. Con 'auto' cada miniatura descargaba el archivo completo — 20
    // clips seguidos eran 20 archivos enteros pasando por memoria, y eso
    // fabricaba el error de decodificación que después detonaba el crash.
    v.preload = "metadata";

    let settled = false;
    const done = (val: string | undefined) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      v.removeAttribute("src");
      v.load();
      resolve(val);
    };
    // Cerrar el analizador tiene que cortar el lote en seco: antes seguía
    // decodificando hasta 160 s después de que el coach ya se había ido.
    const onAbort = () => done(undefined);
    signal?.addEventListener("abort", onAbort, { once: true });

    // iPad/Safari can leave a decoder stuck when several videos load at
    // once — bail after 8s so the slot frees and the clip still lists.
    const timer = setTimeout(() => done(undefined), 8000);

    // OJO — esto se dispara con `loadedmetadata`, NO con `loadeddata`.
    // Con preload="metadata" el navegador carga los datos del archivo pero
    // NO se compromete a decodificar el primer cuadro, así que `loadeddata`
    // puede no llegar nunca: cada miniatura se colgaría 8 s y volvería vacía
    // — veinte clips serían 160 s sin una sola miniatura. Y sin miniaturas se
    // cae también la recuperación de sesión, que es como el coach reconoce
    // sus videos al volver.
    // El SEEK sí obliga al navegador a traer y decodificar ese cuadro, con
    // preload metadata o sin él. Por eso pedimos el cuadro directamente.
    v.onloadedmetadata = () => {
      try {
        v.currentTime = Math.min(0.1, (v.duration || 0.2) / 2);
      } catch {
        done(undefined);
      }
    };

    const draw = () => {
      try {
        const W = 160;
        const ratio = v.videoWidth ? v.videoHeight / v.videoWidth : 0.56;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = Math.round(W * ratio);
        const ctx = c.getContext("2d");
        if (!ctx) return done(undefined);
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const data = c.toDataURL("image/jpeg", 0.6);
        c.width = 0; c.height = 0;          // soltar el lienzo enseguida
        done(data);
      } catch {
        done(undefined);
      }
    };

    v.onseeked = () => {
      // `seeked` avisa que el tiempo se movió, no que el cuadro ya esté
      // pintado. Donde existe, esperamos al cuadro real — si no, la
      // miniatura sale negra de vez en cuando.
      const rvfc = (v as unknown as {
        requestVideoFrameCallback?: (cb: () => void) => number;
      }).requestVideoFrameCallback;
      if (typeof rvfc === "function") rvfc.call(v, draw);
      else draw();
    };
    v.onerror = () => done(undefined);
  });
}
