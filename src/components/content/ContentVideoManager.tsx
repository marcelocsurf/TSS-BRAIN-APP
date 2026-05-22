'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { directImageUrl } from '@/lib/media-url';
import {
  addContentVideo,
  updateContentVideo,
  deleteContentVideo,
  reorderContentVideo,
  type ContentVideo,
} from '@/lib/actions/content';

// Inline video manager for a single parent (lesson OR drill_mission).
// Renders the current videos list + an add-new form. Each video has
// edit / reorder / delete controls. Designed for the /content admin
// page where Marcelo manages all videos in one screen.

interface Props {
  videos: ContentVideo[];
  lessonId?: string;
  drillMissionId?: string;
  stepId?: string;
}

const MEDIA_OPTIONS: { value: 'video' | 'image' | 'diagram'; label: string; placeholder: string }[] = [
  { value: 'video',   label: 'Video',   placeholder: 'https://youtube.com/watch?v=… or https://vimeo.com/…' },
  { value: 'image',   label: 'Image',   placeholder: 'https://… (imgur, Drive, your CDN — direct image URL)' },
  { value: 'diagram', label: 'Diagram', placeholder: 'https://… (image URL of the diagram)' },
];

export function ContentVideoManager({ videos, lessonId, drillMissionId, stepId }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newMediaType, setNewMediaType] = useState<'video' | 'image' | 'diagram'>('video');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newUrl.trim()) {
      setError('Paste a URL');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await addContentVideo({
          lessonId,
          drillMissionId,
          stepId,
          url: newUrl,
          label: newLabel || undefined,
          caption: newCaption || undefined,
          mediaType: newMediaType,
        });
        setNewUrl('');
        setNewLabel('');
        setNewCaption('');
        setNewMediaType('video');
        setAdding(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message || 'Failed to add media');
      }
    });
  };

  const placeholder =
    MEDIA_OPTIONS.find((o) => o.value === newMediaType)?.placeholder ??
    'https://…';

  return (
    <div className="space-y-2">
      {videos.length === 0 && !adding && (
        <p className="text-[11px] text-gray-400 italic">No media yet.</p>
      )}

      {videos.map((v, idx) => (
        <VideoRow
          key={v.id}
          video={v}
          isFirst={idx === 0}
          isLast={idx === videos.length - 1}
          pending={pending}
          onChange={() => router.refresh()}
        />
      ))}

      {adding ? (
        <div className="bg-white rounded-lg border border-amber-200 p-3 space-y-2">
          <div className="flex gap-1.5">
            {MEDIA_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setNewMediaType(opt.value)}
                className={`flex-1 px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                  newMediaType === opt.value
                    ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Intro · Demo · Common errors)"
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
          />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
            autoFocus
          />
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="Caption (optional) — short note shown under the thumbnail"
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewUrl('');
                setNewLabel('');
                setNewCaption('');
                setNewMediaType('video');
                setError('');
              }}
              className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || !newUrl.trim()}
              onClick={handleAdd}
              className="flex-1 px-3 py-1.5 text-xs text-white bg-[var(--tss-navy)] rounded disabled:opacity-50"
            >
              {pending ? 'Saving…' : `Add ${MEDIA_OPTIONS.find((o) => o.value === newMediaType)?.label}`}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full px-3 py-2 text-xs text-gray-600 border border-dashed border-gray-300 hover:border-gray-500 rounded-lg"
        >
          + Add Media
        </button>
      )}
    </div>
  );
}

// ─── Single video row ──

function VideoRow({
  video,
  isFirst,
  isLast,
  pending,
  onChange,
}: {
  video: ContentVideo;
  isFirst: boolean;
  isLast: boolean;
  pending: boolean;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(video.url);
  const [label, setLabel] = useState(video.label || '');
  const [caption, setCaption] = useState(video.caption || '');
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState('');

  const save = () => {
    startTransition(async () => {
      try {
        await updateContentVideo(video.id, { url, label, caption });
        setEditing(false);
        setError('');
        onChange();
      } catch (e: any) {
        setError(e.message || 'Failed to save');
      }
    });
  };

  const remove = () => {
    if (!confirm('Delete this video?')) return;
    startTransition(async () => {
      try {
        await deleteContentVideo(video.id);
        onChange();
      } catch (e: any) {
        setError(e.message || 'Failed to delete');
      }
    });
  };

  const move = (dir: 'up' | 'down') => {
    startTransition(async () => {
      try {
        await reorderContentVideo(video.id, dir);
        onChange();
      } catch (e: any) {
        setError(e.message || 'Failed to reorder');
      }
    });
  };

  if (editing) {
    return (
      <div className="bg-white rounded-lg border border-blue-200 p-3 space-y-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono"
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setUrl(video.url);
              setLabel(video.label || '');
              setCaption(video.caption || '');
              setError('');
            }}
            className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || pending}
            onClick={save}
            className="flex-1 px-3 py-1.5 text-xs text-white bg-[var(--tss-navy)] rounded disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  const isImage = video.media_type === 'image' || video.media_type === 'diagram';
  const typePill = video.media_type ?? 'video';

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={directImageUrl(video.url)} alt={video.label || ''} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">VIDEO</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-gray-800 truncate">
            {video.label || '(no label)'}
          </p>
          <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
            {typePill}
          </span>
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-blue-600 hover:underline truncate block"
        >
          {video.url}
        </a>
        {video.caption && (
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{video.caption}</p>
        )}
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <IconBtn disabled={isFirst || busy || pending} onClick={() => move('up')} title="Move up">↑</IconBtn>
        <IconBtn disabled={isLast || busy || pending} onClick={() => move('down')} title="Move down">↓</IconBtn>
        <IconBtn disabled={busy || pending} onClick={() => setEditing(true)} title="Edit">✎</IconBtn>
        <IconBtn disabled={busy || pending} onClick={remove} title="Delete">×</IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 text-sm"
    >
      {children}
    </button>
  );
}
