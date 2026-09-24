// ═══ /one-wave/[code] — link de regalo del libro ONE WAVE (antes /gift) ═══
// Público (token-gated por el código). La persona pone nombre + email y entra
// a su portal con el libro. Ver src/lib/actions/book-gift.ts.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import type { Metadata } from 'next';
import { validateBookGift } from '@/lib/actions/book-gift';

// Vista previa del link (WhatsApp, iMessage): la portada del libro y no el
// logo genérico del app (Marcelo 2026-09-15). URL absoluta para que WhatsApp
// la resuelva sin depender de metadataBase.
const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
const OG_TITLE = 'ONE WAVE · a gift for you';
// La vista previa habla del LIBRO, no del método (Marcelo 2026-09-24). La
// frase es la del propio forro: es la promesa que él ya escribió.
const OG_DESC = 'A practical system to train with intention, learn from every session, and keep the joy of surfing. By Marcelo Castellanos — someone sent you a copy.';
export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    type: 'book',
    siteName: 'The Surf Sequence',
    images: [{ url: `${APP_BASE}/web/img/one-wave-cover.jpg`, width: 480, height: 720, alt: 'ONE WAVE — the book' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESC,
    images: [`${APP_BASE}/web/img/one-wave-cover.jpg`],
  },
};
import { GiftClaim } from './GiftClaim';

export default async function GiftPage({ params }: { params: { code: string } | Promise<{ code: string }> }) {
  const { code } = await Promise.resolve(params);
  const state = await validateBookGift(code);
  return <GiftClaim code={code} state={state} />;
}
