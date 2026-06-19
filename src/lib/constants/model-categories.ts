// Fixed category set for the Video Analyzer model library. Shared by the
// server actions and the admin uploader. (Kept out of the 'use server' file
// because those can only export async functions.)
// Empty by design — the admin creates every category via "Custom…"
// (e.g. "Sequence 4"). Add fixed presets here only if ever needed.
export const MODEL_CATEGORIES: { slug: string; name: string }[] = [];
