// ═══ Videos de una secuencia: general, por lado y por stance ═══
//
// Marcelo (2026-09-25, Directional Turns): "general pero rápido poder elegir
// frontside o backside, y un video Goofy y uno Regular de cada uno". Un
// Regular ve todo Regular, un Goofy todo Goofy (automático por su ficha), con
// un interruptor por si el stance no está definido. Convención en Library
// (Admin → kind "video", título que empieza por el id de la secuencia):
//   "WB-SEQ-4 · Directional Turns"         → general
//   "WB-SEQ-4 · BS Turn backside"          → backside (también "· Backside …")
//   "WB-SEQ-4 · FS Goofy" / "· FS Regular" → frontside por stance
//   "WB-SEQ-4 · BS Goofy" / "· BS Regular" → backside por stance
// Orden de fallback: lado+stance → lado → stance → general.

export type SequenceVideoRef = { url: string; title: string };
export type Stance = 'goofy' | 'regular';
export type SequenceVideos = {
  general: SequenceVideoRef | null;
  bs: SequenceVideoRef | null;
  fs: SequenceVideoRef | null;
  bs_goofy: SequenceVideoRef | null;
  bs_regular: SequenceVideoRef | null;
  fs_goofy: SequenceVideoRef | null;
  fs_regular: SequenceVideoRef | null;
  goofy: SequenceVideoRef | null;
  regular: SequenceVideoRef | null;
};

export function pickSequenceVideos(rows: { title: string; file_url: string | null }[] | null | undefined, sequenceId: string): SequenceVideos {
  const out: SequenceVideos = { general: null, bs: null, fs: null, bs_goofy: null, bs_regular: null, fs_goofy: null, fs_regular: null, goofy: null, regular: null };
  for (const r of rows ?? []) {
    if (!r.file_url) continue;
    const rest = String(r.title).slice(sequenceId.length).trim();
    const side: 'bs' | 'fs' | null = /^[·\-–—:\s]*(BS|backside)\b/i.test(rest) ? 'bs' : /^[·\-–—:\s]*(FS|frontside)\b/i.test(rest) ? 'fs' : null;
    const stance: Stance | null = /\bgoofy\b/i.test(rest) ? 'goofy' : /\bregular\b/i.test(rest) ? 'regular' : null;
    const key = (side && stance ? `${side}_${stance}` : side ?? stance ?? 'general') as keyof SequenceVideos;
    // Las filas vienen de más nueva a más vieja: la primera de cada tipo gana.
    if (!out[key]) out[key] = { url: r.file_url, title: r.title };
  }
  return out;
}

export function hasStanceVideos(v: SequenceVideos | null | undefined): boolean {
  return !!v && !!(v.bs_goofy || v.bs_regular || v.fs_goofy || v.fs_regular || v.goofy || v.regular);
}

/** El video que toca: lado+stance → lado → stance → general. */
export function resolveSequenceVideo(v: SequenceVideos | null | undefined, side: 'bs' | 'fs' | null, stance: Stance | null): SequenceVideoRef | null {
  if (!v) return null;
  if (side && stance && v[`${side}_${stance}` as keyof SequenceVideos]) return v[`${side}_${stance}` as keyof SequenceVideos] as SequenceVideoRef;
  if (side && v[side]) return v[side];
  if (stance && v[stance]) return v[stance];
  // Con un lado elegido y sin video de ese lado: el general o nada — nunca el
  // video del otro lado (un frontside no se enseña con el backside).
  if (v.general) return v.general;
  if (side) return null;
  return v.bs ?? v.fs ?? v.bs_regular ?? v.bs_goofy ?? v.fs_regular ?? v.fs_goofy ?? v.regular ?? v.goofy ?? null;
}
