'use client';

import { useEffect, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  listBoards, createBoard, updateBoard, deleteBoard,
  listRentals, createRental, returnRental, cancelRental, getRentalIdUrl,
  type Board, type BoardStatus, type Rental,
} from '@/lib/actions/boards';

const TYPE_OPTIONS = [
  { value: 'soft', label: 'Soft top' },
  { value: 'hard', label: 'Hard top' },
];
const SHAPE_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'fun', label: 'Fun' },
  { value: 'long', label: 'Long' },
];
const STATUS_LABEL: Record<BoardStatus, string> = {
  available: 'Available',
  in_use: 'In use',
  in_repair: 'In repair',
  retired: 'Retired',
  rented: 'Rented',
};
const STATUS_COLOR: Record<BoardStatus, string> = {
  available: 'bg-emerald-50 text-emerald-700',
  in_use: 'bg-blue-50 text-blue-600',
  in_repair: 'bg-amber-50 text-amber-700',
  retired: 'bg-gray-100 text-gray-500',
  rented: 'bg-purple-50 text-purple-600',
};

export function BoardInventoryManager({ academyId }: { academyId: string }) {
  const [tab, setTab] = useState<'inventory' | 'rentals'>('inventory');
  const [boards, setBoards] = useState<Board[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const reload = async () => {
    try {
      const [b, r] = await Promise.all([listBoards(academyId), listRentals(academyId)]);
      setBoards(b);
      setRentals(r);
    } catch (e: any) {
      setError(e.message || 'Could not load the inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [academyId]);

  const available = boards.filter((b) => b.status === 'available');
  const rentedCount = boards.filter((b) => b.status === 'rented').length;
  const activeRentals = rentals.filter((r) => r.status === 'active' || r.status === 'overdue');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-white">
      <h1 className="text-xl font-bold mb-1">Board Inventory & Rentals</h1>
      <p className="text-[13px] text-white/60 mb-4">
        Manage the academy's boards and rent them to walk-ins. Separate from the Board Selector.
      </p>

      <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
        <TabBtn active={tab === 'inventory'} onClick={() => setTab('inventory')}>
          Inventory ({boards.length})
        </TabBtn>
        <TabBtn active={tab === 'rentals'} onClick={() => setTab('rentals')}>
          Rentals ({activeRentals.length})
        </TabBtn>
      </div>

      {error && <p className="text-sm text-red-300 mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-white/50">Loading…</p>
      ) : tab === 'inventory' ? (
        <InventoryTab
          academyId={academyId}
          boards={boards}
          rentedCount={rentedCount}
          pending={pending}
          startTransition={startTransition}
          reload={reload}
          setError={setError}
        />
      ) : (
        <RentalsTab
          academyId={academyId}
          available={available}
          rentals={rentals}
          pending={pending}
          startTransition={startTransition}
          reload={reload}
          setError={setError}
        />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active ? 'bg-white text-[var(--tss-navy)]' : 'text-white/60 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// ── Inventory tab ──────────────────────────────────────────────
function InventoryTab({
  academyId, boards, rentedCount, pending, startTransition, reload, setError,
}: {
  academyId: string;
  boards: Board[];
  rentedCount: number;
  pending: boolean;
  startTransition: React.TransitionStartFunction;
  reload: () => Promise<void>;
  setError: (s: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [bType, setBType] = useState('soft');
  const [bShape, setBShape] = useState('fun');
  const [bFeet, setBFeet] = useState('7');
  const [bInches, setBInches] = useState('2');
  const [bVolume, setBVolume] = useState('');
  const [bBrand, setBBrand] = useState('');
  const [bModel, setBModel] = useState('');

  const add = () => {
    setError('');
    startTransition(async () => {
      try {
        await createBoard({
          academy_id: academyId,
          brand: bBrand.trim() || null,
          model: bModel.trim() || null,
          board_type: bType,
          shape: bShape,
          length_feet: bFeet ? parseInt(bFeet, 10) : null,
          length_inches: bInches ? parseInt(bInches, 10) : null,
          volume_liters: bVolume.trim() || null,
          notes: null,
        });
        setBVolume(''); setBBrand(''); setBModel(''); setAdding(false);
        await reload();
      } catch (e: any) { setError(e.message || 'Could not create the board.'); }
    });
  };
  const setStatus = (id: string, status: BoardStatus) => {
    startTransition(async () => {
      try { await updateBoard(id, { status }); await reload(); }
      catch (e: any) { setError(e.message || 'Could not update.'); }
    });
  };
  const remove = (id: string, code: string) => {
    if (!confirm(`Remove board ${code} from the inventory?`)) return;
    startTransition(async () => {
      try { await deleteBoard(id); await reload(); }
      catch (e: any) { setError(e.message || 'Could not delete.'); }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-white/70">
          {boards.length} boards · {rentedCount} rented out
        </p>
        <button onClick={() => setAdding((v) => !v)} className="text-[13px] text-[var(--tss-cyan)] hover:underline">
          {adding ? 'Cancel' : '+ Add board'}
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-white/10 p-3 space-y-2 bg-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Mini label="Type">
              <select value={bType} onChange={(e) => setBType(e.target.value)} className={selCls}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Mini>
            <Mini label="Shape">
              <select value={bShape} onChange={(e) => setBShape(e.target.value)} className={selCls}>
                {SHAPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Mini>
            <Mini label="Feet"><input value={bFeet} onChange={(e) => setBFeet(e.target.value)} inputMode="numeric" className={inpCls} /></Mini>
            <Mini label="Inch"><input value={bInches} onChange={(e) => setBInches(e.target.value)} inputMode="numeric" className={inpCls} /></Mini>
            <Mini label="Volume (L)"><input value={bVolume} onChange={(e) => setBVolume(e.target.value)} placeholder="42" className={inpCls} /></Mini>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Mini label="Brand (optional)"><input value={bBrand} onChange={(e) => setBBrand(e.target.value)} placeholder="Torq" className={inpCls} /></Mini>
            <Mini label="Model (optional)"><input value={bModel} onChange={(e) => setBModel(e.target.value)} placeholder="Mod Fish" className={inpCls} /></Mini>
          </div>
          <button onClick={add} disabled={pending} className="w-full py-2 text-[var(--tss-navy)] bg-white text-sm font-semibold rounded-lg disabled:opacity-50">
            {pending ? 'Saving…' : 'Add to inventory'}
          </button>
        </div>
      )}

      {boards.length === 0 ? (
        <p className="text-sm text-white/40 italic">No boards yet. Add the first one.</p>
      ) : (
        <ul className="divide-y divide-white/5 rounded-xl border border-white/10 overflow-hidden">
          {boards.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 p-3 bg-white/[0.03]">
              <div className="min-w-0">
                <p className="text-sm font-mono font-semibold">{b.code}</p>
                <p className="text-[11px] text-white/50">
                  {[
                    [b.brand, b.model].filter(Boolean).join(' ') || null,
                    b.board_type, b.shape,
                    b.length_feet ? `${b.length_feet}'${b.length_inches || ''}` : null,
                    b.volume_liters ? `${b.volume_liters}L` : null,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={b.status}
                  onChange={(e) => setStatus(b.id, e.target.value as BoardStatus)}
                  disabled={b.status === 'rented'}
                  className={`text-[10px] font-semibold rounded-full px-2 py-1 border-0 ${STATUS_COLOR[b.status]} disabled:opacity-70`}
                >
                  {(['available', 'in_use', 'in_repair', 'retired', 'rented'] as BoardStatus[]).map((s) => (
                    <option key={s} value={s} disabled={s === 'rented'}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button onClick={() => remove(b.id, b.code)} className="text-[13px] text-white/30 hover:text-red-400">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {rentedCount > 0 && (
        <p className="text-[11px] text-white/40">Rented boards are managed from the Rentals tab.</p>
      )}
    </div>
  );
}

// ── Rentals tab ────────────────────────────────────────────────
function RentalsTab({
  academyId, available, rentals, pending, startTransition, reload, setError,
}: {
  academyId: string;
  available: Board[];
  rentals: Rental[];
  pending: boolean;
  startTransition: React.TransitionStartFunction;
  reload: () => Promise<void>;
  setError: (s: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [boardId, setBoardId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [docType, setDocType] = useState('passport');
  const [days, setDays] = useState('1');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [notes, setNotes] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const active = rentals.filter((r) => r.status === 'active' || r.status === 'overdue');
  const past = rentals.filter((r) => r.status === 'returned' || r.status === 'cancelled');

  const resetForm = () => {
    setBoardId(''); setName(''); setPhone(''); setEmail(''); setDocType('passport');
    setDays('1'); setPrice(''); setDeposit(''); setNotes(''); setDocFile(null); setCreating(false);
  };

  const submit = () => {
    setError('');
    if (!boardId) { setError('Pick a board to rent.'); return; }
    if (!name.trim()) { setError('Enter the renter name.'); return; }
    startTransition(async () => {
      try {
        // Upload the ID document (if any) to the PRIVATE bucket from the browser.
        let id_doc_path: string | null = null;
        if (docFile) {
          setUploading(true);
          const supabase = createClient();
          const ext = docFile.name.split('.').pop() || 'jpg';
          const path = `${academyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { error: upErr } = await supabase.storage.from('rental-ids').upload(path, docFile, { upsert: false });
          setUploading(false);
          if (upErr) throw new Error(`Could not upload the ID photo: ${upErr.message}`);
          id_doc_path = path;
        }
        const n = parseInt(days, 10) || 1;
        const start = new Date();
        const expected = new Date(start.getTime() + n * 86400000);
        await createRental({
          academy_id: academyId,
          board_id: boardId,
          renter_name: name,
          renter_phone: phone,
          renter_email: email,
          id_doc_path,
          id_doc_type: docFile ? docType : null,
          expected_return_date: expected.toISOString().slice(0, 10),
          price_total: price ? parseFloat(price) : null,
          deposit: deposit ? parseFloat(deposit) : null,
          notes,
        });
        resetForm();
        await reload();
      } catch (e: any) { setUploading(false); setError(e.message || 'Could not create the rental.'); }
    });
  };

  const doReturn = (id: string) => {
    startTransition(async () => {
      try { await returnRental(id); await reload(); }
      catch (e: any) { setError(e.message || 'Could not return.'); }
    });
  };
  const doCancel = (id: string) => {
    if (!confirm('Cancel this rental and free the board?')) return;
    startTransition(async () => {
      try { await cancelRental(id); await reload(); }
      catch (e: any) { setError(e.message || 'Could not cancel.'); }
    });
  };
  const viewId = async (id: string) => {
    try {
      const url = await getRentalIdUrl(id);
      if (url) window.open(url, '_blank', 'noopener');
      else setError('No ID document on file for this rental.');
    } catch (e: any) { setError(e.message || 'Could not open the ID document.'); }
  };

  return (
    <div className="space-y-4">
      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          disabled={available.length === 0}
          className="w-full py-2.5 bg-white text-[var(--tss-navy)] text-sm font-semibold rounded-xl disabled:opacity-40"
        >
          {available.length === 0 ? 'No available boards to rent' : '+ New rental'}
        </button>
      ) : (
        <div className="rounded-xl border border-white/10 p-3 space-y-2 bg-white/5">
          <Mini label="Board">
            <select value={boardId} onChange={(e) => setBoardId(e.target.value)} className={selCls}>
              <option value="">Select a board…</option>
              {available.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code}{b.volume_liters ? ` · ${b.volume_liters}L` : ''}
                </option>
              ))}
            </select>
          </Mini>
          <Mini label="Renter name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inpCls} /></Mini>
          <div className="grid grid-cols-2 gap-2">
            <Mini label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inpCls} /></Mini>
            <Mini label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inpCls} /></Mini>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Mini label="Days"><input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" className={inpCls} /></Mini>
            <Mini label="Price"><input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="$" className={inpCls} /></Mini>
            <Mini label="Deposit"><input value={deposit} onChange={(e) => setDeposit(e.target.value)} inputMode="decimal" placeholder="$" className={inpCls} /></Mini>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Mini label="ID type">
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className={selCls}>
                <option value="passport">Passport</option>
                <option value="dui">DUI / National ID</option>
                <option value="license">Driver license</option>
              </select>
            </Mini>
            <Mini label="ID photo (private)">
              <input type="file" accept="image/*" capture="environment" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} className="block w-full text-[11px] text-white/70 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-white/10 file:text-white" />
            </Mini>
          </div>
          <Mini label="Notes"><input value={notes} onChange={(e) => setNotes(e.target.value)} className={inpCls} /></Mini>
          <p className="text-[10px] text-white/40">The ID photo is stored privately and only visible to academy staff via a temporary link.</p>
          <div className="flex gap-2">
            <button onClick={resetForm} className="flex-1 py-2 border border-white/15 text-sm rounded-lg">Cancel</button>
            <button onClick={submit} disabled={pending || uploading} className="flex-1 py-2 bg-white text-[var(--tss-navy)] text-sm font-semibold rounded-lg disabled:opacity-50">
              {uploading ? 'Uploading…' : pending ? 'Saving…' : 'Create rental'}
            </button>
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">Active ({active.length})</p>
          <ul className="space-y-2">
            {active.map((r) => <RentalRow key={r.id} r={r} onReturn={doReturn} onCancel={doCancel} onViewId={viewId} />)}
          </ul>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">History</p>
          <ul className="space-y-2">
            {past.slice(0, 30).map((r) => <RentalRow key={r.id} r={r} onViewId={viewId} />)}
          </ul>
        </div>
      )}

      {active.length === 0 && past.length === 0 && (
        <p className="text-sm text-white/40 italic">No rentals yet.</p>
      )}
    </div>
  );
}

function RentalRow({
  r, onReturn, onCancel, onViewId,
}: {
  r: Rental;
  onReturn?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewId: (id: string) => void;
}) {
  const isActive = r.status === 'active' || r.status === 'overdue';
  const overdue = isActive && r.expected_return_date && r.expected_return_date < new Date().toISOString().slice(0, 10);
  return (
    <li className="rounded-xl border border-white/10 p-3 bg-white/[0.03]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{r.renter_name}</p>
          <p className="text-[11px] text-white/50">
            {[
              r.board_code,
              [r.renter_phone, r.renter_email].filter(Boolean).join(' · ') || null,
            ].filter(Boolean).join(' · ')}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">
            {r.start_date}{r.expected_return_date ? ` → ${r.expected_return_date}` : ''}
            {r.price_total != null ? ` · ${r.currency || '$'}${r.price_total}` : ''}
            {r.deposit != null ? ` · dep ${r.deposit}` : ''}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          overdue ? 'bg-red-50 text-red-600' : isActive ? 'bg-purple-50 text-purple-600' : 'bg-white/10 text-white/50'
        }`}>
          {overdue ? 'Overdue' : r.status}
        </span>
      </div>
      <div className="flex gap-2 mt-2">
        {r.id_doc_path && (
          <button onClick={() => onViewId(r.id)} className="text-[11px] text-[var(--tss-cyan)] hover:underline">View ID</button>
        )}
        {isActive && onReturn && (
          <button onClick={() => onReturn(r.id)} className="text-[11px] text-emerald-400 hover:underline">Mark returned</button>
        )}
        {isActive && onCancel && (
          <button onClick={() => onCancel(r.id)} className="text-[11px] text-white/40 hover:text-red-400">Cancel</button>
        )}
      </div>
    </li>
  );
}

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] uppercase tracking-wider text-white/40 font-mono mb-0.5">{label}</label>
      {children}
    </div>
  );
}

const inpCls = 'w-full px-2 py-1.5 border border-white/15 bg-white/5 rounded-lg text-xs text-white placeholder-white/30';
const selCls = 'w-full px-2 py-1.5 border border-white/15 bg-white/5 rounded-lg text-xs text-white';
