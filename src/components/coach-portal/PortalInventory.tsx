'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Package, Plus, AlertTriangle, Check, ClipboardList } from 'lucide-react';
import { getInventory, saveInventoryCount, addInventoryItem, type InventoryItem } from '@/lib/actions/inventory';
import { createRequisitionFromLowStock } from '@/lib/actions/requisitions';
import { InventoryCalendar } from './InventoryCalendar';

// The academy's real inventory, countable from the phone — the digital
// version of the weekly Excel. Grouped by category; each row saves on blur
// and logs a check (who, when, note). Low stock (< minimum) highlights red.

// token = a portal_token (coach portal / support). Omit it (session mode) on
// the dashboard, where the server scopes to the current/act-as academy.
export function PortalInventory({ token = null }: { token?: string | null }) {
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    getInventory(token).then(setItems).catch(() => setItems([]));
  }, [token]);

  const grouped = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    for (const it of items ?? []) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  const lowCount = (items ?? []).filter((i) => i.minimum != null && i.qty_in_stock < i.minimum).length;
  // Cada guardado es "el último inventario": el calendario se refresca solo.
  const [histKey, setHistKey] = useState(0);

  function commit(item: InventoryItem, patch: { qty_in_use?: number; qty_in_stock?: number; notes?: string | null; minimum?: number | null }) {
    setItems((prev) => (prev ?? []).map((x) => (x.id === item.id ? { ...x, ...patch } as InventoryItem : x)));
    start(async () => {
      const res = await saveInventoryCount(token, item.id, patch);
      if (!res.ok) { alert(res.error || 'Could not save.'); return; }
      setSavedId(item.id);
      setHistKey((k) => k + 1);
      setTimeout(() => setSavedId((v) => (v === item.id ? null : v)), 1200);
    });
  }

  if (items === null) {
    return <p className="text-sm text-[#55666E] px-1 py-6 text-center">Loading inventory…</p>;
  }

  return (
    <div className="space-y-4">
      {/* Último inventario + calendario de conteos (Daren, 2026-09-15). */}
      <InventoryCalendar token={token} refreshKey={histKey} />
      <div className="rounded-lg border border-[#DCD7C6] p-4" style={{ background: '#E9E2D2' }}>
        <p className="text-[11px] font-mono uppercase tracking-wider inline-flex items-center gap-1.5" style={{ color: '#00A8CC' }}>
          <Package size={13} /> Academy inventory
        </p>
        <p className="text-[12px] text-[#55666E] mt-1.5 leading-relaxed">
          Count and update each item — changes save on the spot and the check is logged with your name.
        </p>
        {lowCount > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#B03A2E] bg-[rgba(255,107,107,.12)] border border-[#FF6B6B] rounded-full px-2.5 py-1">
              <AlertTriangle size={11} /> {lowCount} item{lowCount > 1 ? 's' : ''} below minimum
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const r = await createRequisitionFromLowStock(token);
                  if (!r.ok) { alert(r.error || 'No se pudo crear la requisición.'); return; }
                  alert(`✓ Requisición creada con ${r.count} ítem(s). Ya aparece en el dashboard para verla y sacar el PDF.`);
                });
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-3 py-1 disabled:opacity-50"
              style={{ background: '#00D2FF', color: '#061C2B' }}
            >
              <ClipboardList size={12} /> Crear requisición de compra
            </button>
          </div>
        )}
      </div>

      {grouped.length === 0 && (
        <p className="text-[13px] text-[#55666E] px-1">No inventory items yet. Add the first one below.</p>
      )}

      {grouped.map(([category, rows]) => (
        <div key={category} className="rounded-lg border border-[#DCD7C6] overflow-hidden" style={{ background: '#E9E2D2' }}>
          <p className="px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider text-[#55666E] border-b border-[#DCD7C6]">
            {category} · {rows.length}
          </p>
          <div className="divide-y divide-white/[0.06]">
            {rows.map((it) => {
              const low = it.minimum != null && it.qty_in_stock < it.minimum;
              return (
                <div key={it.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-[#10263B] font-medium min-w-0 truncate">
                      {it.name}
                      {it.unit && <span className="text-[#55666E] font-normal"> · {it.unit}</span>}
                    </p>
                    {savedId === it.id && (
                      <span className="text-[11px] text-emerald-400 inline-flex items-center gap-0.5 shrink-0"><Check size={11} /> saved</span>
                    )}
                    {low && savedId !== it.id && (
                      <span className="text-[11px] font-semibold uppercase text-[#B03A2E] bg-[rgba(255,107,107,.12)] border border-[#FF6B6B] rounded-full px-1.5 py-0.5 shrink-0">
                        low · min {it.minimum}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <QtyField label="In use" value={it.qty_in_use} onCommit={(v) => commit(it, { qty_in_use: v })} />
                    <QtyField label="In stock" value={it.qty_in_stock} low={low} onCommit={(v) => commit(it, { qty_in_stock: v })} />
                    <MinField value={it.minimum} onCommit={(v) => commit(it, { minimum: v })} />
                  </div>
                  <p className="mt-1 text-[11px] text-[#55666E] leading-snug">
                    Set a minimum → you get an alert when In stock drops below it.
                  </p>
                  <NoteField value={it.notes} onCommit={(v) => commit(it, { notes: v })} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add item */}
      {showAdd ? (
        <AddItemForm
          pending={pending}
          onCancel={() => setShowAdd(false)}
          onAdd={(input) => {
            start(async () => {
              const res = await addInventoryItem(token, input);
              if (!res.ok || !res.item) { alert(res.error || 'Could not add.'); return; }
              setItems((prev) => [...(prev ?? []), res.item!]);
              setShowAdd(false);
            });
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="w-full rounded-lg border border-dashed border-[#DCD7C6] py-3 text-[13px] font-semibold text-[#55666E] hover:text-[#10263B] hover:border-[#00D2FF] transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <Plus size={15} /> Add item
        </button>
      )}
    </div>
  );
}

function QtyField({ label, value, low, onCommit }: { label: string; value: number; low?: boolean; onCommit: (v: number) => void }) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => setLocal(String(value)), [value]);
  return (
    <label className="block">
      <span className="block text-[11px] font-mono uppercase tracking-wider text-[#55666E] mb-1">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const n = parseInt(local, 10);
          if (!Number.isNaN(n) && n !== value) onCommit(Math.max(0, n));
          else setLocal(String(value));
        }}
        className={`w-full rounded-lg px-3 py-2 text-sm text-[#10263B] text-center focus:outline-none ${low ? 'border border-red-400/50' : 'border border-[#DCD7C6]'}`}
        style={{ background: 'rgba(255,255,255,.06)' }}
      />
    </label>
  );
}

// Minimum threshold. Blank = no minimum (no alert). Amber accent so it reads as
// the "reorder line", distinct from the count fields.
function MinField({ value, onCommit }: { value: number | null; onCommit: (v: number | null) => void }) {
  const [local, setLocal] = useState(value == null ? '' : String(value));
  useEffect(() => setLocal(value == null ? '' : String(value)), [value]);
  return (
    <label className="block">
      <span className="block text-[11px] font-mono uppercase tracking-wider text-amber-300/70 mb-1">Min ⚠</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const t = local.trim();
          if (t === '') { if (value != null) onCommit(null); return; }
          const n = parseInt(t, 10);
          if (!Number.isNaN(n) && n !== value) onCommit(Math.max(0, n));
          else setLocal(value == null ? '' : String(value));
        }}
        placeholder="—"
        className="w-full rounded-lg px-3 py-2 text-sm text-[#10263B] text-center border border-[#FFD166] focus:outline-none placeholder:text-[#55666E]"
        style={{ background: 'rgba(255,255,255,.06)' }}
      />
    </label>
  );
}

function NoteField({ value, onCommit }: { value: string | null; onCommit: (v: string) => void }) {
  const [local, setLocal] = useState(value ?? '');
  useEffect(() => setLocal(value ?? ''), [value]);
  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if ((local || '') !== (value ?? '')) onCommit(local); }}
      placeholder="Note (e.g. one board dinged, bought 5 new)…"
      className="mt-2 w-full rounded-lg px-3 py-2 text-[12px] text-[#10263B] placeholder:text-[#55666E] border border-[#DCD7C6] focus:outline-none"
      style={{ background: 'rgba(255,255,255,.04)' }}
    />
  );
}

function AddItemForm({ pending, onAdd, onCancel }: {
  pending: boolean;
  onAdd: (input: { category: string; name: string; unit?: string | null; qty_in_use?: number; qty_in_stock?: number; minimum?: number | null }) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState('Surf');
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [minimum, setMinimum] = useState('');
  return (
    <div className="rounded-lg border border-[#DCD7C6] p-4 space-y-2.5" style={{ background: '#E9E2D2' }}>
      <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#00D2FF)]">New item</p>
      <div className="grid grid-cols-2 gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg px-3 py-2 text-sm text-[#10263B] border border-[#DCD7C6] focus:outline-none" style={{ background: '#061C2B' }}>
          {['Surf', 'Gym', 'Skate', 'Tech', 'Misc'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className="rounded-lg px-3 py-2 text-sm text-[#10263B] placeholder:text-[#55666E] border border-[#DCD7C6] focus:outline-none" style={{ background: 'rgba(255,255,255,.06)' }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Qty in stock" className="rounded-lg px-3 py-2 text-sm text-[#10263B] placeholder:text-[#55666E] border border-[#DCD7C6] focus:outline-none" style={{ background: 'rgba(255,255,255,.06)' }} />
        <input type="number" min={0} value={minimum} onChange={(e) => setMinimum(e.target.value)} placeholder="Minimum (optional)" className="rounded-lg px-3 py-2 text-sm text-[#10263B] placeholder:text-[#55666E] border border-[#DCD7C6] focus:outline-none" style={{ background: 'rgba(255,255,255,.06)' }} />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || !name.trim()}
          onClick={() => onAdd({ category, name, qty_in_stock: parseInt(stock, 10) || 0, minimum: minimum ? parseInt(minimum, 10) : null })}
          className="flex-1 rounded-[5px] py-2.5 text-sm font-bold disabled:opacity-50"
          style={{ background: '#00D2FF', color: '#061C2B' }}
        >
          {pending ? 'Adding…' : 'Add item'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-[5px] px-4 py-2.5 text-sm font-semibold text-[#55666E] bg-[#F7F9FA]">Cancel</button>
      </div>
    </div>
  );
}
