'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface PhotoUploaderProps {
  entityType: 'student' | 'coach';
  entityId: string;
  currentPhotoUrl: string | null;
  onUploadComplete?: (url: string) => void;
}

export function PhotoUploader({
  entityType,
  entityId,
  currentPhotoUrl,
  onUploadComplete,
}: PhotoUploaderProps) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${entityType}s/${entityId}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path);

      // Append cache-bust to force browsers to refetch
      const freshUrl = `${publicUrl}?t=${Date.now()}`;

      const table = entityType === 'student' ? 'students' : 'coaches';
      const { error: updateErr } = await supabase
        .from(table)
        .update({ photo_url: freshUrl })
        .eq('id', entityId);

      if (updateErr) throw updateErr;

      setPhotoUrl(freshUrl);
      onUploadComplete?.(freshUrl);
      // Refresh server components so ProfilePhoto picks up the new URL
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove photo?')) return;

    try {
      const supabase = createClient();
      const table = entityType === 'student' ? 'students' : 'coaches';
      const { error: updateErr } = await supabase
        .from(table)
        .update({ photo_url: null })
        .eq('id', entityId);

      if (updateErr) throw updateErr;
      setPhotoUrl(null);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Remove failed.';
      setError(message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Preview / click target */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden cursor-pointer relative group bg-gray-100"
        onClick={() => fileInputRef.current?.click()}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-2xl">+</span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {uploading ? '...' : 'Upload'}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-[var(--tss-navy)] hover:underline disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : photoUrl ? 'Change photo' : 'Add photo'}
        </button>
        {photoUrl && (
          <>
            <span className="text-gray-300 text-xs">|</span>
            <button
              onClick={handleRemove}
              className="text-xs text-red-400 hover:underline"
            >
              Remove
            </button>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
