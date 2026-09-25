/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDF decks (catálogos de servicios) superan el límite default de 1MB de
  // las server actions — sin esto, subir una presentación falla en silencio.
  experimental: {
    serverActions: { bodySizeLimit: '25mb' },
  },
  poweredByHeader: false,
  // Cabeceras básicas (auditoría de lanzamiento 2026-09-25): los portales por
  // link no se enmarcan en otros sitios, no se adivina el tipo de archivo y el
  // token de la URL no viaja como referer a YouTube/Google Fonts.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      {
        source: '/(portal|coach-portal|manager-portal|front-desk|feedback|experience|intake|respond|equipo|one-wave|gift|booking|join|my-portal)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  // El quiz v1 del sitio (find-your-level.html, /70) quedó sustituido por el
  // v2 (/quiz). La URL vieja sigue circulando (Nadine Pander la usó el
  // 2026-09-14): va al oficial.
  async redirects() {
    return [
      { source: '/find-your-level.html', destination: '/quiz', permanent: true },
      { source: '/find-your-level', destination: '/quiz', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Konva references an optional native `canvas` package we don't use in
  // the browser. Alias it to false so the bundler doesn't try to resolve it.
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

module.exports = nextConfig;
