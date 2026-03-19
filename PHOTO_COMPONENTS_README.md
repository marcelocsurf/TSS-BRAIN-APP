# Profile Photo Components

Reusable components for displaying and uploading profile photos across TSS BRAIN.

## Components

### ProfilePhoto (display only, server-safe)

```tsx
import { ProfilePhoto } from '@/components/shared/ProfilePhoto';

<ProfilePhoto
  photoUrl={coach.photo_url}   // string | null
  name="John Smith"             // used for initials fallback
  size="lg"                     // 'sm' (32px) | 'md' (48px) | 'lg' (64px) | 'xl' (96px)
/>
```

- Shows circular photo if `photoUrl` is provided
- Falls back to first-letter initial on navy background
- Works in both server and client components

### PhotoUploader (client component, upload + remove)

```tsx
import { PhotoUploader } from '@/components/shared/PhotoUploader';

<PhotoUploader
  entityType="coach"                     // 'student' | 'coach'
  entityId={coach.id}                    // UUID
  currentPhotoUrl={coach.photo_url}      // string | null
  onUploadComplete={(url) => {}}         // optional callback
/>
```

- Uploads to Supabase Storage bucket `avatars` at path `{entityType}s/{entityId}.{ext}`
- Updates the corresponding table (`students` or `coaches`) `photo_url` column
- Shows upload preview, hover overlay, change/remove buttons
- Handles loading and error states
- Max file size: 5 MB, images only

## Server Actions (optional, for server-side flows)

```tsx
import { uploadProfilePhoto, removeProfilePhoto } from '@/lib/actions/photos';

// Upload via FormData
const url = await uploadProfilePhoto('coach', coachId, formData);

// Remove
await removeProfilePhoto('coach', coachId);
```

## Database

The `coaches` table needs a `photo_url` column. Run the migration in `phase_photos_sql.sql`:

```sql
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS photo_url text;
```

## Supabase Storage

Photos are stored in the `avatars` bucket. Make sure:
1. The bucket exists and is public (for `getPublicUrl` to work)
2. RLS policies allow authenticated users to upload/update files

## Next.js Image Config

If using `next/image` with Supabase Storage URLs, ensure your `next.config.js` includes the Supabase storage hostname in `images.remotePatterns`.
