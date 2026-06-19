// TSS Model Library catalog.
// Drop .mp4 files into /public/tss-library/<category>/ and add an entry here.
// Missing files are handled gracefully by the UI.

export type ModelClip = {
  id: string;
  title: string;
  src: string; // path under /public or a Supabase Storage URL
  description?: string | null;
};

export type ModelCategory = {
  id: string;
  name: string;
  clips: ModelClip[];
};

// Empty by design — the model library is fully admin-managed via the DB
// (see model_clips + /admin/video-library). This static fallback stays empty.
export const LIBRARY: ModelCategory[] = [];
