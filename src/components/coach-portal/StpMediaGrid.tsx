'use client';

import { useState } from 'react';
import { PlayCircle, ImageIcon, Workflow, X } from 'lucide-react';
import type { StpMedia } from '@/lib/actions/coach-tools';
import { directImageUrl } from '@/lib/media-url';

// Embed URL helper — duplicated from CoachPortalTabs.embedUrlFor so this
// component stays self-contained. YouTube/Vimeo → embed URL, everything
// else → as-is.
function embedUrlFor(url: string): string {
  const yt = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

// YouTube/Vimeo thumbnail helper (for video tiles without embedding).
function thumbForVideo(url: string): string | null {
  const yt = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`;
  return null;
}

export function StpMediaGrid({ media }: { media: StpMedia[] }) {
  const [open, setOpen] = useState<StpMedia | null>(null);

  if (media.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic px-1">
        No visual aids attached to this step yet.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {media.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpen(m)}
            className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-gray-300 hover:shadow transition-all"
          >
            <Thumb m={m} />
            <div className="px-3 py-2 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <TypePill type={m.media_type} />
                {m.label && (
                  <p className="text-xs font-semibold text-[var(--tss-navy)] truncate">{m.label}</p>
                )}
              </div>
              {m.caption && (
                <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{m.caption}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {open && <Lightbox media={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Thumb({ m }: { m: StpMedia }) {
  if (m.media_type === 'image' || m.media_type === 'diagram') {
    return (
      <div className="aspect-video bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={directImageUrl(m.url)} alt={m.label || ''} className="w-full h-full object-cover" />
      </div>
    );
  }
  const ytThumb = thumbForVideo(m.url);
  return (
    <div className="aspect-video bg-black relative">
      {ytThumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ytThumb} alt={m.label || ''} className="w-full h-full object-cover opacity-80" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-[10px] font-mono uppercase tracking-wider">
          External video
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
          <PlayCircle size={28} strokeWidth={1.75} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function TypePill({ type }: { type: 'video' | 'image' | 'diagram' }) {
  const styles =
    type === 'video'
      ? 'bg-red-50 text-red-700'
      : type === 'image'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-purple-50 text-purple-700';
  const Icon = type === 'video' ? PlayCircle : type === 'image' ? ImageIcon : Workflow;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${styles}`}
    >
      <Icon size={10} strokeWidth={2} />
      {type}
    </span>
  );
}

function Lightbox({ media: m, onClose }: { media: StpMedia; onClose: () => void }) {
  const isVideo = m.media_type === 'video';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
        aria-label="Close"
      >
        <X size={20} strokeWidth={2} />
      </button>

      <div
        className="w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <div className="aspect-video bg-black">
            <iframe
              src={embedUrlFor(m.url)}
              title={m.label || 'Coach video'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={directImageUrl(m.url)}
              alt={m.label || ''}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
          </div>
        )}

        {(m.label || m.caption) && (
          <div className="mt-3 text-center text-white">
            {m.label && <p className="text-sm font-semibold">{m.label}</p>}
            {m.caption && <p className="text-xs text-white/70 mt-1">{m.caption}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
