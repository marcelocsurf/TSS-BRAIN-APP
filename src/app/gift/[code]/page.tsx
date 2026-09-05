// ═══ /gift/[code] — link de regalo del libro ONE WAVE ═══
// Público (token-gated por el código). La persona pone nombre + email y entra
// a su portal con el libro. Ver src/lib/actions/book-gift.ts.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { validateBookGift } from '@/lib/actions/book-gift';
import { GiftClaim } from './GiftClaim';

export default async function GiftPage({ params }: { params: { code: string } | Promise<{ code: string }> }) {
  const { code } = await Promise.resolve(params);
  const state = await validateBookGift(code);
  return <GiftClaim code={code} state={state} />;
}
