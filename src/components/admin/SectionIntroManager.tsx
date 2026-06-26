'use client';

import { useState, useTransition } from 'react';
import { setSectionIntro, type SectionIntro } from '@/lib/actions/section-intros';
import { toEmbedUrl } from '@/lib/utils/video-embed';

const SECTIONS: { key: string; label: string }[] = [
  { key: 'pre_course', label: 'Pre-Course (intro)' },
  { key: 'wb_onboarding', label: 'White Belt — Onboarding' },
  { key: 'white_belt', label: 'White Belt — Sequences' },
  { key: 'yb_onboarding', label: 'Yellow Belt — Onboarding' },
  { key: 'yellow_belt', label: 'Yellow Belt — Sequences' },
  { key: 'bb_onboarding', label: 'Blue Belt — Onboarding' },
  { key: 'blue_belt', label: 'Blue Belt — Sequences' },
];

export function SectionIntroManager({ initial }: { initial: Record<string, SectionIntro> }) {
  const [urls, setUrls] = useState<Record<string, string>>(
    Object.fromEntries(SECTIONS.map((s) => [s.key, initial[s.key]?.video_url || ''])),
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState('');

  const save = (key: string) => {
    setError(''); setSaved(null);
    startTransition(async () => {
      try { await setSectionIntro(key, urls[key] || ''); setSaved(key); }
      catch (e: any) { setError(e.message || 'Could not save.'); }
    });
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
      {SECTIONS.map((s) => {
        const preview = toEmbedUrl(urls[s.key] || '');
        return (
          <div key={s.key} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-[var(--tss-navy)] mb-2">{s.label}</p>
            <div className="flex gap-2">
              <input
                value={urls[s.key]}
                onChange={(e) => setUrls({ ...urls, [s.key]: e.target.value })}
                placeholder="https://youtu.be/…  ·  vimeo.com/…  ·  drive.google.com/…"
                className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <button
                onClick={() => save(s.key)}
                disabled={pending}
                className="px-4 py-2 bg-[var(--tss-navy)] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {saved === s.key ? 'Saved ✓' : 'Save'}
              </button>
            </div>
            {urls[s.key] && (
              <div className="mt-3 rounded-lg overflow-hidden bg-black aspect-video max-w-sm">
                {preview ? (
                  <iframe src={preview} title={`${s.label} preview`} className="w-full h-full" allowFullScreen />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs">Invalid URL</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
