// ═══ Videos de una secuencia: general, backside y frontside ═══
//
// Marcelo (2026-09-25, Directional Turns): "debe de poder ser general pero
// rápido poder elegir si es frontside o backside y así le pongo video a cada
// uno". Convención en Library (Admin → kind "video", título que empieza por
// el id de la secuencia):
//   "WB-SEQ-4 · Directional Turns"            → general
//   "WB-SEQ-4 · BS Turn backside" / "… · Backside …"  → backside
//   "WB-SEQ-4 · FS Turn frontside" / "… · Frontside …" → frontside
// Si un lado no tiene video, se usa el general.

export type SequenceVideoRef = { url: string; title: string };
export type SequenceVideos = { general: SequenceVideoRef | null; bs: SequenceVideoRef | null; fs: SequenceVideoRef | null };

export function pickSequenceVideos(rows: { title: string; file_url: string | null }[] | null | undefined, sequenceId: string): SequenceVideos {
  const out: SequenceVideos = { general: null, bs: null, fs: null };
  for (const r of rows ?? []) {
    if (!r.file_url) continue;
    const rest = String(r.title).slice(sequenceId.length).trim();
    const side: 'bs' | 'fs' | null = /^[·\-–—:\s]*(BS|backside)\b/i.test(rest) ? 'bs' : /^[·\-–—:\s]*(FS|frontside)\b/i.test(rest) ? 'fs' : null;
    const ref = { url: r.file_url, title: r.title };
    // Las filas vienen de más nueva a más vieja: la primera de cada tipo gana.
    if (side) { if (!out[side]) out[side] = ref; } else if (!out.general) out.general = ref;
  }
  return out;
}
