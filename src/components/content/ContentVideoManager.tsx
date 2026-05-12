'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
}

export function ContentVideoManager({ videos, lessonId, drillMissionId }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newUrl.trim()) {
      setError('Paste a video URL');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await addContentVideo({
          lessonId,
          drillMissionId,
          url: newUrl,
          label: newLabel || undefined,
        });
        setNewUrl('');
        setNewLabel('');
        setAdding(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message || 'Failed to add video');
      }
    });
  };

  return (
    <div className="space-y-2">
      {videos.length === 0 && !adding && (
        <p className="text-[11px] text-gray-400 italic">No videos yet.</p>
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
            placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
            autoFocus
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewUrl('');
                setNewLabel('');
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
              {pending ? 'Saving…' : 'Add Video'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full px-3 py-2 text-xs text-gray-600 border border-dashed border-gray-300 hover:border-gray-500 rounded-lg"
        >
          + Add Video
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
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState('');

  const save = () => {
    startTransition(async () => {
      try {
        await updateContentVideo(video.id, { url, label });
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
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setUrl(video.url);
              setLabel(video.label || '');
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

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">
          {video.label || '(no label)'}
        </p>
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-blue-600 hover:underline truncate block"
        >
          {video.url}
        </a>
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
