'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  entityId: string;
  entityType: 'student' | 'coach';
  currentPhotoUrl: string | null;
  displayName: string;
  avatarColor?: string;
}

export function PhotoUpload({ entityId, entityType, currentPhotoUrl, displayName, avatarColor }: Props) {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${entityType}s/${entityId}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Update record
      const table = entityType === 'student' ? 'students' : 'coaches';
      await supabase.from(table).update({ photo_url: publicUrl }).eq('id', entityId);

      setPhotoUrl(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove photo?')) return;
    const supabase = createClient();
    const table = entityType === 'student' ? 'students' : 'coaches';
    await supabase.from(table).update({ photo_url: null }).eq('id', entityId);
    setPhotoUrl(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden cursor-pointer relative group"
        style={{ backgroundColor: photoUrl ? 'transparent' : (avatarColor || '#1A1A2E') }}
        onClick={() => fileInputRef.current?.click()}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {uploading ? '...' : '📷'}
          </span>
        </div>
      </div>

      {/* Actions */}
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
            <span className="text-gray-200 text-xs">·</span>
            <button onClick={handleRemove} className="text-xs text-red-400 hover:underline">
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
