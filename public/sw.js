// Minimal service worker for TSS BRAIN PWA.
// Network-first for HTML (so portal content stays fresh), cache-first for
// static assets (icons, fonts) once the app has been opened.
//
// v3 (2026-09-09): una navegación que falla NUNCA cae a '/'. Antes, con red
// mala o un fetch cortado, el alumno veía la pantalla de entrada (código /
// PIN) en la URL del portal y creía que lo habían sacado ("me manda a home").
// Ahora: si la red falla, se responde con una página de "sin conexión" con
// botón de reintentar, y se mantiene la URL a la que iba.

const CACHE_NAME = 'tss-brain-v3';
const STATIC_ASSETS = [
  '/tss-logo-white.png',
  '/tss-logo-color.png',
];

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Surf Sequence</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#061C2B;color:#F7F9FA;font-family:-apple-system,system-ui,Archivo,sans-serif;text-align:center;padding:24px}
h1{font-size:20px;margin:0 0 8px}p{margin:0 0 18px;opacity:.75;font-size:14px;line-height:1.5}
button{background:#00D2FF;color:#061C2B;border:0;border-radius:999px;padding:12px 22px;font-weight:700;font-size:14px}</style></head>
<body><div><h1>No connection</h1><p>Your portal is still here. Check your signal and try again.</p><button onclick="location.reload()">Retry</button></div></body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Los ASSETS de Next (/_next/*.js) van a la red; si la red falla NO se les
  // contesta con HTML: el navegador recibiría "<!DOCTYPE" en vez de JS y el
  // trozo nunca cargaría. Mejor que falle limpio y Next reintente.
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((r) => r || Response.error())));
    return;
  }

  // Navegaciones y HTML: red primero; si falla, la misma URL cacheada (casi
  // nunca existe) o la página de "sin conexión". NUNCA la entrada '/'.
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then(
          (r) => r || new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
        ),
      ),
    );
    return;
  }

  // Cache-first solo para los estáticos que guardamos (logos).
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
