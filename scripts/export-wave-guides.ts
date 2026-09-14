// ═══ Exporta los Wave Guides de las 6 secuencias Blue (08–13) × 2 direcciones ═══
//
// Uso (desde la raíz del app):
//   npx esbuild scripts/export-wave-guides.ts --bundle --platform=node --format=cjs \
//     --tsconfig=tsconfig.json --outfile=/tmp/export-wave-guides.cjs && node /tmp/export-wave-guides.cjs <carpeta-destino>
//
// Genera assets/<id>-wave-right.svg / -wave-left.svg. Si @resvg/resvg-js está
// resoluble (NODE_PATH), también el PNG a 2× (1440×680). Los recorridos salen
// de src/lib/sequence-pages (fuente de verdad); nada se dibuja a ojo.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SEQUENCE_PAGES } from '../src/lib/sequence-pages';
import { buildWaveGuideSvg, type WaveDirection } from '../src/lib/sequence-pages/wave-guide-svg';

const IDS = ['BB-SEQ-08', 'BB-SEQ-09', 'BB-SEQ-10', 'BB-SEQ-11', 'BB-SEQ-12', 'BB-SEQ-13'];
const out = process.argv[2];
if (!out) { console.error('destino?'); process.exit(1); }
mkdirSync(join(out, 'assets'), { recursive: true });

let Resvg: any = null;
try { Resvg = require('@resvg/resvg-js').Resvg; } catch { console.warn('sin @resvg/resvg-js: solo SVG'); }

const manifest: { id: string; title: string; direction: WaveDirection; svg: string; png: string | null; segments: number; hold: number }[] = [];
for (const id of IDS) {
  const cfg = SEQUENCE_PAGES[id];
  if (!cfg?.think.board) { console.error(`FALTA el recorrido (think.board) de ${id}`); continue; }
  for (const direction of ['right', 'left'] as WaveDirection[]) {
    const slug = `${id.toLowerCase()}-wave-${direction}`;
    const svg = buildWaveGuideSvg(cfg.think.board, { waveDirection: direction, legend: true, fixedSize: true, title: `${cfg.title} · wave ${direction}` });
    writeFileSync(join(out, 'assets', `${slug}.svg`), svg);
    let png: string | null = null;
    if (Resvg) {
      const r = new Resvg(svg, { fitTo: { mode: 'width', value: 1440 }, font: { loadSystemFonts: true } });
      writeFileSync(join(out, 'assets', `${slug}.png`), r.render().asPng());
      png = `assets/${slug}.png`;
    }
    manifest.push({ id, title: cfg.title, direction, svg: `assets/${slug}.svg`, png, segments: cfg.think.board.segments.length, hold: cfg.think.board.segments.filter((s) => s.hold).length });
  }
}
writeFileSync(join(out, 'assets', 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`${manifest.length} variantes → ${out}/assets`);
