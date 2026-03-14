'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function InternalNotesCard({ studentId, notes }: { studentId: string; notes: string | null }) {
  const [value, setValue] = useState(notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await supabase.from('students').update({
      coach_notes_general: value || null
    }).eq('id', studentId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-red-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-red-500">🔒 Internal Coach Notes</h3>
        <span className="text-[10px] text-red-300 bg-red-50 px-2 py-0.5 rounded-full">Never visible to student</span>
      </div>
      <div className="px-4 py-3">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={3}
          placeholder="Private notes about this student — behavior, attitude, real assessment..."
          className="w-full px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-sm resize-none text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-200"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-2 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
