'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function VideoLinkEditor({ sessionResultId, currentLink }: {
  sessionResultId: string;
  currentLink: string;
}) {
  const [link, setLink] = useState(currentLink);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('student_session_results')
      .update({ video_link: link || null })
      .eq('id', sessionResultId);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!editing && !link) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-400 hover:text-[var(--tss-navy)] flex items-center gap-1 mt-1"
      >
        + Add video link
      </button>
    );
  }

  if (!editing && link) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--tss-navy)] font-medium flex items-center gap-1"
        >
          ▶ Video link
        </a>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Edit
        </button>
        {saved && <span className="text-xs text-green-500">✓ Saved</span>}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <input
        type="url"
        value={link}
        onChange={e => setLink(e.target.value)}
        placeholder="https://drive.google.com/... or YouTube link"
        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 bg-[var(--tss-navy)] text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setLink(currentLink); }}
          className="px-3 py-1 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
