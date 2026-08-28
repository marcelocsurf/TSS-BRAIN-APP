'use client';

import { useState } from 'react';
import { generateAccessCodeBatch, getCodeUsageByAcademy } from '@/lib/actions/course';
import { displayDate } from '@/lib/utils/tz';

interface AccessCodeRow {
  code: string;
  product_type: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  notes: string | null;
  batch_label?: string | null;
  academy_id?: string | null;
  students?: { first_name: string; last_name: string } | null;
}

interface AcademyUsage {
  academy_id: string;
  academy_name: string;
  total_generated: number;
  total_redeemed: number;
  this_month_generated: number;
  this_month_redeemed: number;
}

interface GrantBilling {
  academy_id: string;
  academy_name: string;
  total_grants: number;
  this_month_grants: number;
}

type FilterTab = 'all' | 'pending' | 'redeemed';

const PRODUCT_TYPES: { value: string; label: string }[] = [
  { value: 'white_belt', label: 'White Belt' },
  { value: 'yellow_belt', label: 'Yellow Belt' },
  { value: 'blue_belt', label: 'Blue Belt' },
];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-[var(--tss-cyan)] text-white hover:opacity-80 transition-opacity"
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}

export function CourseCodesClient({
  initialCodes,
  isPlatformAdmin,
  initialUsage,
  grantBilling = [],
}: {
  initialCodes: AccessCodeRow[];
  isPlatformAdmin: boolean;
  initialUsage: AcademyUsage[];
  grantBilling?: GrantBilling[];
}) {
  const [codes, setCodes] = useState<AccessCodeRow[]>(initialCodes);
  const [usage] = useState<AcademyUsage[]>(initialUsage);

  // Generate batch form state
  const [batchLabel, setBatchLabel] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [productType, setProductType] = useState('white_belt');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBatch, setGeneratedBatch] = useState<string[] | null>(null);

  // Filter
  const [filter, setFilter] = useState<FilterTab>('all');

  const handleGenerate = async () => {
    if (!batchLabel.trim()) {
      setError('Please enter a batch label');
      return;
    }
    setGenerating(true);
    setError(null);
    setGeneratedBatch(null);

    const res = await generateAccessCodeBatch(
      quantity,
      productType,
      batchLabel.trim(),
      undefined,
      expiresInDays ? parseInt(expiresInDays, 10) : null,
    );
    setGenerating(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setGeneratedBatch(res.codes);

    // Prepend generated codes to local list
    const now = new Date().toISOString();
    const newRows: AccessCodeRow[] = res.codes.map((code) => ({
      code,
      product_type: productType,
      used_by: null,
      used_at: null,
      created_at: now,
      notes: null,
      batch_label: batchLabel.trim(),
      students: null,
    }));
    setCodes((prev) => [...newRows, ...prev]);
    setBatchLabel('');
  };

  const filteredCodes = codes.filter((c) => {
    if (filter === 'pending') return !c.used_by;
    if (filter === 'redeemed') return !!c.used_by;
    return true;
  });

  const pendingCount = codes.filter((c) => !c.used_by).length;
  const redeemedCount = codes.filter((c) => !!c.used_by).length;

  return (
    <div className="space-y-6">
      {/* ── Course Grants — Billing (platform admin only) ── */}
      {isPlatformAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-base mb-1 text-[var(--tss-navy)]">
            Course Grants — Billing
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Billable course activations counted per academy.
          </p>
          {grantBilling.length === 0 ? (
            <p className="text-sm text-gray-500">No course grants recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-2 pr-4 font-medium">Academy</th>
                    <th className="pb-2 px-3 font-medium text-right">Total Grants</th>
                    <th className="pb-2 pl-3 font-medium text-right">This Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grantBilling.map((row) => (
                    <tr key={row.academy_id}>
                      <td className="py-2 pr-4 font-medium">{row.academy_name}</td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        {row.total_grants}
                      </td>
                      <td className="py-2 pl-3 text-right tabular-nums text-green-700">
                        {row.this_month_grants}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Generate Batch ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-bold text-base mb-4 text-[var(--tss-navy)]">Generate Code Batch</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Batch Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              placeholder="White Belt Mayo 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (1–50)</label>
            <input
              type="number"
              value={quantity}
              min={1}
              max={50}
              onChange={(e) => setQuantity(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Product Type</label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
          >
            {PRODUCT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Expira en (días) — opcional</label>
          <input
            type="number"
            value={expiresInDays}
            min={1}
            onChange={(e) => setExpiresInDays(e.target.value)}
            placeholder="ej. 90 · vacío = sin vencimiento"
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)]"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-[var(--tss-navy)] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {generating ? 'Generating...' : `Generate ${quantity} Code${quantity !== 1 ? 's' : ''}`}
        </button>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        {generatedBatch && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-green-800">
                ✓ {generatedBatch.length} codes generated
              </p>
              <CopyButton
                text={generatedBatch.join('\n')}
                label="Copy All"
              />
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {generatedBatch.map((code) => (
                <div key={code} className="flex items-center gap-2 bg-white border border-green-200 rounded px-3 py-1.5">
                  <code className="flex-1 font-mono text-sm font-bold tracking-wider">{code}</code>
                  <CopyButton text={code} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share these codes with students. Each code can only be used once.
            </p>
          </div>
        )}
      </div>

      {/* ── Platform Admin Stats Bar ── */}
      {isPlatformAdmin && usage.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-base mb-3 text-[var(--tss-navy)]">Usage by Academy</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 pr-4 font-medium">Academy</th>
                  <th className="pb-2 px-3 font-medium text-right">Total</th>
                  <th className="pb-2 px-3 font-medium text-right">Redeemed</th>
                  <th className="pb-2 px-3 font-medium text-right">This Month</th>
                  <th className="pb-2 pl-3 font-medium text-right">Redeemed (Mo.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usage.map((row) => (
                  <tr key={row.academy_id}>
                    <td className="py-2 pr-4 font-medium">{row.academy_name}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row.total_generated}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-green-700">{row.total_redeemed}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row.this_month_generated}</td>
                    <td className="py-2 pl-3 text-right tabular-nums text-green-700">{row.this_month_redeemed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Code List ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter tabs */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
          <h2 className="font-bold text-base mr-auto">Codes</h2>
          {(['all', 'pending', 'redeemed'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                filter === tab
                  ? 'bg-[var(--tss-navy)] text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {tab === 'all' ? `All (${codes.length})` : tab === 'pending' ? `Pending (${pendingCount})` : `Redeemed (${redeemedCount})`}
            </button>
          ))}
        </div>

        {filteredCodes.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            {codes.length === 0
              ? 'No codes yet. Generate your first batch above.'
              : 'No codes match this filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium hidden md:table-cell">Batch</th>
                  <th className="px-3 py-2 font-medium hidden sm:table-cell">Product</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium hidden md:table-cell">Used By</th>
                  <th className="px-3 py-2 font-medium hidden lg:table-cell">Date</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCodes.map((c) => {
                  const isRedeemed = !!c.used_by;
                  return (
                    <tr key={c.code} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <code className="font-mono text-xs font-bold tracking-wider">{c.code}</code>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 hidden md:table-cell">
                        {c.batch_label || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 hidden sm:table-cell capitalize">
                        {c.product_type.replace('_', ' ')}
                      </td>
                      <td className="px-3 py-2.5">
                        {isRedeemed ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                            Redeemed
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 hidden md:table-cell">
                        {c.students
                          ? `${c.students.first_name} ${c.students.last_name}`
                          : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-400 hidden lg:table-cell">
                        {displayDate(c.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        {!isRedeemed && <CopyButton text={c.code} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
