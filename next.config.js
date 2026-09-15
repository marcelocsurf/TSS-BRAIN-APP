/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDF decks (catálogos de servicios) superan el límite default de 1MB de
  // las server actions — sin esto, subir una presentación falla en silencio.
  experimental: {
    serverActions: { bodySizeLimit: '25mb' },
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
