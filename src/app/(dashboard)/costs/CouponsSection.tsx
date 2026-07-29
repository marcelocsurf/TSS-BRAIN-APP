'use client';

// Coupons + public QR links for class signup (M147). Lives on the Costs page
// (same audience: admin + coordinator).

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveCoupon, toggleCoupon, deleteCoupon, type Coupon } from '@/lib/actions/coupons';
import { Plus, Trash2, QrCode } from 'lucide-react';

type Tpl = { id: string; template_name: string; service_kind: string | null };

export function CouponsSection({ coupons, academySlug, templates }: {
  coupons: Coupon[];
  academySlug: string | null;
  templates: Tpl[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState('');
  const [pct, setPct] = useState('50');
  const [expires, setExpires] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [showQr, setShowQr] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const joinUrl = (tpl?: string) => `${origin}/join/${academySlug}${tpl ? `?tpl=${tpl}` : ''}`;
  const qrImg = (url: string) => `https://api.qrserver.com/v1/create-qr-code/?size=340x340&margin=12&data=${encodeURIComponent(url)}`;
  // QR walk-in signup: clases + trips + lecciones de surf (Discover / drop-in).
  // Los camps quedan fuera a propósito — se venden por seller/coordinador.
  const classTemplates = templates.filter((t) => ['class', 'trip', 'surf_lesson'].includes(t.service_kind ?? ''));

  return (
    <div className="space-y-4">
      {/* ── Coupons ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[var(--tss-navy)]">Class coupons</p>
        <p className="text-[11px] text-gray-500 mb-3">
          Codes people enter when signing up by QR. <strong>100% = free</strong> (courtesy, auto-settled); anything else is a discount. Rotate by deactivating and creating a new one.
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE (e.g. GUEST-S30)"
            className="flex-1 min-w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
          <span className="inline-flex items-center gap-1 text-sm text-gray-500">
            <input type="number" min={1} max={100} value={pct} onChange={(e) => setPct(e.target.value)}
              className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-right" />%
          </span>
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} title="Expiry (optional)"
            className="px-2 py-2 border border-gray-200 rounded-lg text-xs text-gray-500" />
          <input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Max uses"
            className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-xs" />
          <button type="button" disabled={pending || !code.trim()}
            onClick={() => start(async () => {
              const r = await saveCoupon({ code, percent_off: parseInt(pct, 10) || 50, expires_on: expires || null, max_uses: maxUses ? parseInt(maxUses, 10) : null });
              if (!r.ok) { alert(r.error); return; }
              setCode(''); setExpires(''); setMaxUses('');
              router.refresh();
            })}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--tss-navy)] text-white text-xs font-bold disabled:opacity-40">
            <Plus size={13} /> Add
          </button>
        </div>

        {coupons.length === 0 ? (
          <p className="text-[12px] text-gray-400">No coupons yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-mono font-bold text-[var(--tss-navy)]">{c.code}
                    <span className={`ml-2 text-[9px] font-sans font-bold rounded-full px-2 py-0.5 ${c.percent_off >= 100 ? 'bg-purple-50 text-purple-700' : 'bg-sky-50 text-sky-700'}`}>
                      {c.percent_off >= 100 ? 'FREE' : `−${c.percent_off}%`}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {c.uses} use{c.uses === 1 ? '' : 's'}{c.max_uses ? ` / ${c.max_uses}` : ''}{c.expires_on ? ` · expires ${c.expires_on}` : ''}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <button type="button" disabled={pending}
                    onClick={() => start(async () => { await toggleCoupon(c.id, !c.active); router.refresh(); })}
                    className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {c.active ? 'Active' : 'Off'}
                  </button>
                  <button type="button" disabled={pending}
                    onClick={() => { if (confirm(`Delete coupon ${c.code}?`)) start(async () => { await deleteCoupon(c.id); router.refresh(); }); }}
                    className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── QR links ── */}
      {academySlug && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-[var(--tss-navy)] inline-flex items-center gap-1.5"><QrCode size={15} /> Class signup QRs</p>
          <p className="text-[11px] text-gray-500 mb-3">Print once — each QR is permanent. The general one lists every upcoming class; per-class QRs filter to that class only.</p>
          <div className="space-y-1.5">
            {[{ id: '', template_name: '🌊 ALL CLASSES (general QR)' }, ...classTemplates].map((t) => {
              const url = joinUrl(t.id || undefined);
              return (
                <div key={t.id || 'all'} className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-[var(--tss-navy)] min-w-0 truncate">{t.template_name}</p>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <button type="button" onClick={() => { navigator.clipboard?.writeText(url); }}
                        className="text-[10px] font-bold text-gray-500 hover:text-[var(--tss-navy)] px-2 py-1 rounded bg-white border border-gray-200">Copy link</button>
                      <button type="button" onClick={() => setShowQr(showQr === (t.id || 'all') ? null : (t.id || 'all'))}
                        className="text-[10px] font-bold text-white px-2 py-1 rounded bg-[var(--tss-navy)]">QR</button>
                    </div>
                  </div>
                  {showQr === (t.id || 'all') && (
                    <div className="mt-2 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrImg(url)} alt={`QR ${t.template_name}`} className="mx-auto w-44 h-44 rounded-lg border border-gray-200 bg-white" />
                      <p className="text-[9px] text-gray-400 mt-1 break-all">{url}</p>
                      <a href={qrImg(url)} target="_blank" rel="noreferrer" className="inline-block mt-1 text-[10px] font-bold text-[var(--tss-cyan-text,#0090B0)] underline">Open full size to print</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
