// Fixed category set for the Video Analyzer model library. Shared by the
// server actions and the admin uploader. (Kept out of the 'use server' file
// because those can only export async functions.)
export const MODEL_CATEGORIES: { slug: string; name: string }[] = [
  { slug: 'take-off', name: 'Take Off' },
  { slug: 'bottom-turn', name: 'Bottom Turn' },
  { slug: 'top-turn', name: 'Top Turn' },
  { slug: 'cutback', name: 'Cutback' },
  { slug: 'floater', name: 'Floater' },
  { slug: 'barrel-line', name: 'Barrel Line' },
  { slug: 'air', name: 'Air' },
];
