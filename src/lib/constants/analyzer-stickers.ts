// ═══ STICKERS DEL ANALIZADOR ═══
// Pedido de Marcelo (2026-08-26): "que sí sean como sticker, y poder tener
// varios, así los puedo pegar ahí y usarlo de apoyo para explicar algo".
//
// OJO — NO son transparencias: son STICKERS. Cada uno lleva horneado su borde
// blanco troquelado y su sombra, así se ve PEGADO encima del video, como los
// que lleva en la tabla. Por eso nacen opacos.
//
// Para agregar uno: dejar el archivo en public/stickers/ y sumarlo acá.
// El borde blanco y la sombra van DENTRO del SVG (ver los existentes), no en
// el código — así cada sticker puede tener su forma propia.

export type StickerDef = { id: string; name: string; src: string; ratio: number; group: string };

export const STICKERS: StickerDef[] = [
  // ── La tabla y el pie ──
  { id: 'sweet-spot', name: '🎯 Sweet spot', src: '/stickers/sweet-spot.svg', ratio: 1, group: 'Tabla' },
  { id: 'foot-zones', name: '🦶 Zonas del pie', src: '/stickers/foot-zones.svg', ratio: 330 / 250, group: 'Tabla' },

  // ── La ola ──
  { id: 'wave-stages', name: '🌊 Partes de la ola', src: '/stickers/wave-stages.svg', ratio: 220 / 360, group: 'Ola' },

  // ── Para explicar: bien / mal, y el orden de los movimientos ──
  { id: 'yes', name: '✅ Así', src: '/stickers/yes.svg', ratio: 1, group: 'Explicar' },
  { id: 'no', name: '❌ Así no', src: '/stickers/no.svg', ratio: 1, group: 'Explicar' },
  { id: 'eyes', name: '👀 Mirá adelante', src: '/stickers/eyes.svg', ratio: 130 / 220, group: 'Explicar' },
  { id: 'knees', name: '🦵 Flexioná', src: '/stickers/knees.svg', ratio: 130 / 200, group: 'Explicar' },
  { id: 'num-1', name: '1️⃣', src: '/stickers/num-1.svg', ratio: 1, group: 'Explicar' },
  { id: 'num-2', name: '2️⃣', src: '/stickers/num-2.svg', ratio: 1, group: 'Explicar' },
  { id: 'num-3', name: '3️⃣', src: '/stickers/num-3.svg', ratio: 1, group: 'Explicar' },
  { id: 'three-circles', name: '⭕ 3 Circles', src: '/stickers/three-circles.svg', ratio: 200 / 240, group: 'Explicar' },
];

export const STICKER_GROUPS = ['Tabla', 'Ola', 'Explicar'] as const;
