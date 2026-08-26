// ═══ STICKERS DEL ANALIZADOR ═══
// Material de enseñanza de The Surf Sequence que el coach pega ENCIMA del
// video del alumno: lo ubica sobre su tabla, lo agranda y lo gira hasta que
// calza. Pedido de Marcelo (2026-08-26).
//
// Para agregar uno: dejar el archivo en public/stickers/ y sumarlo acá.
// PNG con fondo TRANSPARENTE o SVG. Los que tienen texto conviene que lo
// lleven con contorno oscuro, porque van sobre agua.

export type StickerDef = { id: string; name: string; src: string; ratio: number };

export const STICKERS: StickerDef[] = [
  { id: 'sweet-spot', name: '🎯 Sweet spot', src: '/stickers/sweet-spot.svg', ratio: 1 },
  { id: 'foot-zones', name: '🦶 Zonas del pie', src: '/stickers/foot-zones.svg', ratio: 300 / 220 },
  { id: 'wave-stages', name: '🌊 Partes de la ola', src: '/stickers/wave-stages.svg', ratio: 180 / 320 },
];
