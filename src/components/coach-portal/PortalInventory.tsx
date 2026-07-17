'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Package, Plus, AlertTriangle, Check } from 'lucide-react';
import { getInventory, saveInventoryCount, addInventoryItem, type InventoryItem } from '@/lib/actions/inventory';

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

  function commit(item: InventoryItem, patch: { qty_in_use?: number; qty_in_stock?: number; notes?: string | null; minimum?: number | null }) {
    setItems((prev) => (prev ?? []).map((x) => (x.id === item.id ? { ...x, ...patch } as InventoryItem : x)));
    start(async () => {
      const res = await saveInventoryCount(token, item.id, patch);
      if (!res.ok) { alert(res.error || 'Could not save.'); return; }
      setSavedId(item.id);
      setTimeout(() => setSavedId((v) => (v === item.id ? null : v)), 1200);
    });
  }

  if (items === null) {
    return <p className="text-sm text-white/40 px-1 py-6 text-center">Loading inventory…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: '#0F1E33' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] inline-flex items-center gap-1.5">
          <Package size={13} /> Academy inventory
        </p>
        <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed">
          Count and update each item — changes save on the spot and the check is logged with your name.
        </p>
        {lowCount > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-300 bg-red-500/10 border border-red-400/30 rounded-full px-2.5 py-1">
            <AlertTriangle size={11} /> {lowCount} item{lowCount > 1 ? 's' : ''} below minimum
          </p>
        )}
      </div>

      {grouped.length === 0 && (
        <p className="text-[13px] text-white/40 px-1">No inventory items yet. Add the first one below.</p>
      )}

      {grouped.map(([category, rows]) => (
        <div key={category} className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#0F1E33' }}>
          <p className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-white/50 border-b border-white/10">
            {category} · {rows.length}
          </p>
          <div className="divide-y divide-white/[0.06]">
            {rows.map((it) => {
              const low = it.minimum != null && it.qty_in_stock < it.minimum;
              return (
                <div key={it.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-white font-medium min-w-0 truncate">
                      {it.name}
                      {it.unit && <span className="text-white/40 font-normal"> · {it.unit}</span>}
                    </p>
                    {savedId === it.id && (
                      <span className="text-[10px] text-emerald-400 inline-flex items-center gap-0.5 shrink-0"><Check size={11} /> saved</span>
                    )}
                    {low && savedId !== it.id && (
                      <span className="text-[9px] font-semibold uppercase text-red-300 bg-red-500/10 border border-red-400/30 rounded-full px-1.5 py-0.5 shrink-0">
                        low · min {it.minimum}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <QtyField label="In use" value={it.qty_in_use} onCommit={(v) => commit(it, { qty_in_use: v })} />
                    <QtyField label="In stock" value={it.qty_in_stock} low={low} onCommit={(v) => commit(it, { qty_in_stock: v })} />
                    <MinField value={it.minimum} onCommit={(v) => commit(it, { minimum: v })} />
                  </div>
                  <p className="mt-1 text-[10px] text-white/30 leading-snug">
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
          className="w-full rounded-2xl border border-dashed border-white/20 py-3 text-[13px] font-semibold text-white/60 hover:text-white hover:border-[var(--tss-cyan)]/50 transition-colors inline-flex items-center justify-center gap-1.5"
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
      <span className="block text-[9px] font-mono uppercase tracking-wider text-white/40 mb-1">{label}</span>
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
        className={`w-full rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none ${low ? 'border border-red-400/50' : 'border border-white/15'}`}
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
      <span className="block text-[9px] font-mono uppercase tracking-wider text-amber-300/70 mb-1">Min ⚠</span>
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
        className="w-full rounded-lg px-3 py-2 text-sm text-white text-center border border-amber-400/25 focus:outline-none placeholder:text-white/25"
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
      className="mt-2 w-full rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-white/25 border border-white/10 focus:outline-none"
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
    <div className="rounded-2xl border border-white/10 p-4 space-y-2.5" style={{ background: '#0F1E33' }}>
      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">New item</p>
      <div className="grid grid-cols-2 gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg px-3 py-2 text-sm text-white border border-white/15 focus:outline-none" style={{ background: '#0A1628' }}>
          {['Surf', 'Gym', 'Skate', 'Tech', 'Misc'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className="rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 border border-white/15 focus:outline-none" style={{ background: 'rgba(255,255,255,.06)' }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Qty in stock" className="rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 border border-white/15 focus:outline-none" style={{ background: 'rgba(255,255,255,.06)' }} />
        <input type="number" min={0} value={minimum} onChange={(e) => setMinimum(e.target.value)} placeholder="Minimum (optional)" className="rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 border border-white/15 focus:outline-none" style={{ background: 'rgba(255,255,255,.06)' }} />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || !name.trim()}
          onClick={() => onAdd({ category, name, qty_in_stock: parseInt(stock, 10) || 0, minimum: minimum ? parseInt(minimum, 10) : null })}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
          style={{ background: '#5AC3E7', color: '#0A1628' }}
        >
          {pending ? 'Adding…' : 'Add item'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 bg-white/5">Cancel</button>
      </div>
    </div>
  );
}
