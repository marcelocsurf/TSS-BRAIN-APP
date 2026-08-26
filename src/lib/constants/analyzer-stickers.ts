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

// Sin nombres ni grupos: el coach los VE y elige. Poner nombre a cada uno
// era complicarlo (pedido de Marcelo 2026-08-26).
export type StickerDef = { id: string; src: string; ratio: number };

export const STICKERS: StickerDef[] = [
  { id: 'sweet-spot', src: '/stickers/sweet-spot.svg', ratio: 1 },
  { id: 'foot-zones', src: '/stickers/foot-zones.svg', ratio: 330 / 250 },
  { id: 'wave-stages', src: '/stickers/wave-stages.svg', ratio: 220 / 360 },
  { id: 'yes', src: '/stickers/yes.svg', ratio: 1 },
  { id: 'no', src: '/stickers/no.svg', ratio: 1 },
  { id: 'eyes', src: '/stickers/eyes.svg', ratio: 130 / 220 },
  { id: 'knees', src: '/stickers/knees.svg', ratio: 130 / 200 },
  { id: 'num-1', src: '/stickers/num-1.svg', ratio: 1 },
  { id: 'num-2', src: '/stickers/num-2.svg', ratio: 1 },
  { id: 'num-3', src: '/stickers/num-3.svg', ratio: 1 },
  { id: 'three-circles', src: '/stickers/three-circles.svg', ratio: 200 / 240 },
];
