// Normalize sharing URLs from common hosts (Google Drive, Dropbox) to
// direct-image URLs the browser will actually render in an <img> tag.
// The plain "share link" pages return HTML, not bytes, so they look
// broken inside our media grid.

export function directImageUrl(url: string): string {
  // Google Drive: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  //          or:  https://drive.google.com/open?id=FILE_ID
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveFile) return `https://lh3.googleusercontent.com/d/${driveFile[1]}=w1600`;
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (driveOpen) return `https://lh3.googleusercontent.com/d/${driveOpen[1]}=w1600`;
  const driveUc = url.match(/drive\.google\.com\/uc\?(?:export=\w+&)?id=([\w-]+)/);
  if (driveUc) return `https://lh3.googleusercontent.com/d/${driveUc[1]}=w1600`;

  // Dropbox: ?dl=0 renders the preview page; ?raw=1 returns bytes.
  if (/dropbox\.com\//.test(url)) {
    return url.replace(/[?&]dl=\d/, '').concat(url.includes('?') ? '&raw=1' : '?raw=1');
  }

  return url;
}

// Document embed (PowerPoint / PDF / Google Slides / Google Docs).
// Used by the coach Media lightbox to open a PPTX or PDF inside an
// iframe. Drive's /preview endpoint renders any file natively.
export function documentEmbedUrl(url: string): string {
  // Google Slides
  const slides = url.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/);
  if (slides) {
    return `https://docs.google.com/presentation/d/${slides[1]}/embed?start=false&loop=false&delayms=3000`;
  }
  // Google Docs
  const docs = url.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
  if (docs) return `https://docs.google.com/document/d/${docs[1]}/preview`;
  // Google Sheets
  const sheets = url.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  if (sheets) return `https://docs.google.com/spreadsheets/d/${sheets[1]}/preview`;
  // Google Drive any-file → /preview
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`;
  return url;
}
