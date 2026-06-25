import type { Metadata, Viewport } from 'next';
import './globals.css';
import InstallPWA from '@/components/InstallPWA';

export const metadata: Metadata = {
  // metadataBase makes relative OG/icon URLs resolve to an absolute URL so
  // link previews (WhatsApp/iMessage/social) work. Override via env when the
  // custom domain (app.thesurfsequence.com) is live.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tss-brain-app.vercel.app'),
  title: 'The Surf Sequence',
  description: 'The Surf Sequence — learn to surf the right way, step by step.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'The Surf Sequence',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/tss-logo-color.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'The Surf Sequence',
    description: 'The Surf Sequence — learn to surf the right way, step by step.',
    siteName: 'The Surf Sequence',
    type: 'website',
    images: [{ url: '/tss-logo-color.png', width: 512, height: 512, alt: 'The Surf Sequence' }],
  },
  twitter: {
    card: 'summary',
    title: 'The Surf Sequence',
    description: 'The Surf Sequence — learn to surf the right way, step by step.',
    images: ['/tss-logo-color.png'],
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
    <html lang="en" translate="no">
      <head>
        {/* Stop browser auto-translation (Safari/Chrome). Translating the page
            rewrites the DOM and breaks React's controlled inputs + event
            handlers — symptoms: forms clearing, buttons going dead. The app is
            authored in English by design. */}
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
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
