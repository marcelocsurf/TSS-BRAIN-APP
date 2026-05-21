import type { Metadata, Viewport } from 'next';
import './globals.css';
import InstallPWA from '@/components/InstallPWA';

export const metadata: Metadata = {
  title: 'TSS BRAIN',
  description: 'The Surf Sequence — Coaching Operating System',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'TSS BRAIN',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/tss-logo-color.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#5AC3E7',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Lora:ital@1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <InstallPWA />
      </body>
    </html>
  );
}
