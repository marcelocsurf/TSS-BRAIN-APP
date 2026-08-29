// Turn a YouTube / Vimeo / Google Drive share URL into an embeddable URL.
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  // shorts/ y live/ incluidos: el contenido de surf es corto — un Short es
  // lo primero que Marcelo va a pegar, y youtube.com/shorts NO se puede
  // embeber crudo (X-Frame-Options: DENY → caja gris muda).
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  const gd = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  const gdOpen = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (gdOpen) return `https://drive.google.com/file/d/${gdOpen[1]}/preview`;
  return url;
}

/** ¿Este src es seguro para un <iframe>? Solo los hosts de embed conocidos.
 *  Lo demás (texto pegado, un link cualquiera) se muestra como LINK, no como
 *  iframe — un src basura carga el 404 del propio portal adentro de la
 *  tarjeta, y uno no-embebible una caja gris muda. */
export function isEmbeddable(src: string | null): boolean {
  if (!src) return false;
  return /^https:\/\/(www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/|drive\.google\.com\/file\/d\/[\w-]+\/preview)/.test(src);
}
