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
