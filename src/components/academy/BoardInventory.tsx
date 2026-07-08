'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBoard, updateBoard, deleteBoard, type Board, type BoardStatus, type BoardCondition } from '@/lib/actions/boards';

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
const CONDITION_ORDER: BoardCondition[] = ['excellent', 'good', 'fair', 'poor'];
const CONDITION_LABEL: Record<BoardCondition, string> = {
  excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor',
};
const CONDITION_COLOR: Record<BoardCondition, string> = {
  excellent: 'bg-emerald-50 text-emerald-700',
  good: 'bg-sky-50 text-sky-700',
  fair: 'bg-amber-50 text-amber-700',
  poor: 'bg-red-50 text-red-600',
};

export function BoardInventory({ academyId, boards }: { academyId: string; boards: Board[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  // New-board form
  const [bType, setBType] = useState('soft');
  const [bShape, setBShape] = useState('fun');
  const [bFeet, setBFeet] = useState('7');
  const [bInches, setBInches] = useState('2');
  const [bVolume, setBVolume] = useState('');
  const [bBrand, setBBrand] = useState('');
  const [bModel, setBModel] = useState('');
  const [bCondition, setBCondition] = useState<BoardCondition>('good');

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
          condition: bCondition,
        });
        setBVolume(''); setBBrand(''); setBModel(''); setBCondition('good');
        setAdding(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message || 'Could not create the board.');
      }
    });
  };

  const setStatus = (id: string, status: BoardStatus) => {
    startTransition(async () => {
      try { await updateBoard(id, { status }); router.refresh(); }
      catch (e: any) { setError(e.message || 'No se pudo actualizar.'); }
    });
  };

  const setCondition = (id: string, condition: BoardCondition) => {
    startTransition(async () => {
      try { await updateBoard(id, { condition }); router.refresh(); }
      catch (e: any) { setError(e.message || 'No se pudo actualizar.'); }
    });
  };

  const remove = (id: string, code: string) => {
    if (!confirm(`Remove board ${code} from the inventory?`)) return;
    startTransition(async () => {
      try { await deleteBoard(id); router.refresh(); }
      catch (e: any) { setError(e.message || 'No se pudo eliminar.'); }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-semibold">
          🏄 Board inventory ({boards.length})
        </p>
        <button onClick={() => setAdding((v) => !v)} className="text-[11px] text-[var(--tss-navy)] hover:underline">
          {adding ? 'Cancel' : '+ Add board'}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 -mt-1">
        The code is auto-suggested. Coaches pick these boards when planning; closing the day returns them to available.
      </p>

      {adding && (
        <div className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Mini label="Tipo">
              <select value={bType} onChange={(e) => setBType(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Mini>
            <Mini label="Shape">
              <select value={bShape} onChange={(e) => setBShape(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white">
                {SHAPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Mini>
            <Mini label="Feet">
              <input value={bFeet} onChange={(e) => setBFeet(e.target.value)} inputMode="numeric" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
            <Mini label="Inch">
              <input value={bInches} onChange={(e) => setBInches(e.target.value)} inputMode="numeric" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
            <Mini label="Volume (L)">
              <input value={bVolume} onChange={(e) => setBVolume(e.target.value)} placeholder="ej. 42" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Mini label="Brand (optional)">
              <input value={bBrand} onChange={(e) => setBBrand(e.target.value)} placeholder="ej. Torq" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
            <Mini label="Model (optional)">
              <input value={bModel} onChange={(e) => setBModel(e.target.value)} placeholder="ej. Mod Fish" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
            <Mini label="Condition">
              <select value={bCondition} onChange={(e) => setBCondition(e.target.value as BoardCondition)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white">
                {CONDITION_ORDER.map((c) => <option key={c} value={c}>{CONDITION_LABEL[c]}</option>)}
              </select>
            </Mini>
          </div>
          <button onClick={add} disabled={pending} className="w-full py-2 text-white text-xs font-semibold rounded-lg disabled:opacity-50 bg-[var(--tss-navy)]">
            {pending ? 'Saving…' : 'Add to inventory'}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {boards.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No boards yet. Add the first one.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {boards.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-sm font-mono font-semibold text-[var(--tss-navy)]">{b.code}</p>
                <p className="text-[11px] text-gray-500">
                  {[
                    [b.brand, b.model].filter(Boolean).join(' ') || null,
                    b.board_type, b.shape,
                    b.length_feet ? `${b.length_feet}'${b.length_inches || ''}` : null,
                    b.volume_liters ? `${b.volume_liters}L` : null,
                  ].filter(Boolean).join(' · ')}
                </p>
                {(b.uses ?? 0) > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Used {b.uses} {b.uses === 1 ? 'time' : 'times'}
                    {b.first_used ? ` · since ${b.first_used}` : ''}
                    {b.last_used && b.last_used !== b.first_used ? ` · last ${b.last_used}` : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={b.condition ?? 'good'}
                  onChange={(e) => setCondition(b.id, e.target.value as BoardCondition)}
                  title="Board condition"
                  className={`text-[10px] font-semibold rounded-full px-2 py-1 border-0 ${CONDITION_COLOR[b.condition ?? 'good']}`}
                >
                  {CONDITION_ORDER.map((c) => (
                    <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
                  ))}
                </select>
                <select
                  value={b.status}
                  onChange={(e) => setStatus(b.id, e.target.value as BoardStatus)}
                  className={`text-[10px] font-semibold rounded-full px-2 py-1 border-0 ${STATUS_COLOR[b.status]}`}
                >
                  {(['available', 'in_use', 'in_repair', 'retired'] as BoardStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button onClick={() => remove(b.id, b.code)} className="text-[11px] text-gray-300 hover:text-red-500">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-0.5">{label}</label>
      {children}
    </div>
  );
}
