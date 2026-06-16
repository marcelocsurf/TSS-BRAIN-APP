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
export function makeThumb(url: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.src = url;
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";

    const done = (val: string | undefined) => {
      v.removeAttribute("src");
      v.load();
      resolve(val);
    };

    v.onloadeddata = () => {
      try {
        v.currentTime = Math.min(0.1, (v.duration || 0.2) / 2);
      } catch {
        done(undefined);
      }
    };
    v.onseeked = () => {
      try {
        const W = 160;
        const ratio = v.videoWidth ? v.videoHeight / v.videoWidth : 0.56;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = Math.round(W * ratio);
        const ctx = c.getContext("2d");
        if (!ctx) return done(undefined);
        ctx.drawImage(v, 0, 0, c.width, c.height);
        done(c.toDataURL("image/jpeg", 0.6));
      } catch {
        done(undefined);
      }
    };
    v.onerror = () => done(undefined);
  });
}
