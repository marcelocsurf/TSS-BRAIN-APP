'use client';

import { useState } from 'react';
import { generateAccessCode } from '@/lib/actions/course';

interface AccessCodeRow {
  code: string;
  product_type: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  notes: string | null;
  students?: { first_name: string; last_name: string; email: string } | null;
}

export function CourseCodesClient({ initialCodes }: { initialCodes: AccessCodeRow[] }) {
  const [codes, setCodes] = useState<AccessCodeRow[]>(initialCodes);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState('');
  const [latestCode, setLatestCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    const res = await generateAccessCode('white_belt', notes || undefined);
    setGenerating(false);

    if (!res.ok) {
      setError(res.error || 'Failed to generate code');
      return;
    }

    setLatestCode(res.code!);
    // Add to local list
    setCodes((prev) => [
      {
        code: res.code!,
        product_type: 'white_belt',
        used_by: null,
        used_at: null,
        created_at: new Date().toISOString(),
        notes: notes || null,
      },
      ...prev,
    ]);
    setNotes('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  const unusedCount = codes.filter((c) => !c.used_by).length;
  const usedCount = codes.length - unusedCount;

  return (
    <div className="space-y-6">
      {/* Generate new code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-bold text-base mb-3">Generate New Code</h2>

        <label className="block text-xs font-medium text-gray-700 mb-1">
          Notes (e.g., "Pagado por Pepito - Stripe")
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
          placeholder="Optional notes about this code..."
        />

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-[var(--tss-navy)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {generating ? 'Generating...' : '+ Generate Code'}
        </button>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        {latestCode && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-green-700 mb-1">✓ Code generated successfully</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-green-300 rounded px-3 py-2 font-mono text-sm font-bold">
                {latestCode}
              </code>
              <button
                onClick={() => copyToClipboard(latestCode)}
                className="bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Send this code to your student. They will use it during signup.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-[var(--tss-navy)]">{codes.length}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-amber-600">{unusedCount}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Unused</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{usedCount}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Activated</div>
        </div>
      </div>

      {/* List of codes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-bold text-base">All Codes</h2>
        </div>
        {codes.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No codes yet. Generate your first code above.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {codes.map((c) => (
              <div key={c.code} className="px-4 py-3 flex items-center gap-3">
                <code className="flex-1 font-mono text-xs sm:text-sm">{c.code}</code>

                {c.used_by ? (
                  <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                    ✓ {c.students?.first_name} {c.students?.last_name}
                  </div>
                ) : (
                  <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    Unused
                  </div>
                )}

                {!c.used_by && (
                  <button
                    onClick={() => copyToClipboard(c.code)}
                    className="text-xs text-[var(--tss-navy)] hover:underline"
                  >
                    Copy
                  </button>
                )}

                {c.notes && (
                  <span className="text-[10px] text-gray-400 italic hidden sm:block">
                    {c.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
