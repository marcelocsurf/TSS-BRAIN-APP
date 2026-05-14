// M9 — Per-academy branding resolver.
//
// Returns the effective brand colors + logo for an academy, falling back
// to the global TSS defaults when the academy hasn't set its own.
// Used by /portal/[token], /coach-portal/[token] and /intake/[token] to
// theme the top bar / hero header.

import { BRAND } from '@/lib/constants/brand';

export interface AcademyBranding {
  primary: string;      // header bg, primary CTA
  accent: string;       // small caps gold-equivalent
  logoUrl: string | null;
  tagline: string;      // small italic under name (falls back to TSS tagline)
  name: string;         // academy display name
}

export interface RawAcademyBrand {
  name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  tagline?: string | null;
}

export function resolveAcademyBranding(
  academy: RawAcademyBrand | null | undefined
): AcademyBranding {
  return {
    primary: academy?.primary_color || BRAND.colors.navy,
    accent: academy?.accent_color || BRAND.colors.gold,
    logoUrl: academy?.logo_url || null,
    tagline: academy?.tagline || BRAND.tagline,
    name: academy?.name || 'The Surf Sequence',
  };
}
