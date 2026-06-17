'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBoard, updateBoard, deleteBoard, type Board, type BoardStatus } from '@/lib/actions/boards';

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
  available: 'Disponible',
  in_use: 'En uso',
  in_repair: 'En reparación',
  retired: 'Retirada',
};
const STATUS_COLOR: Record<BoardStatus, string> = {
  available: 'bg-emerald-50 text-emerald-700',
  in_use: 'bg-blue-50 text-blue-600',
  in_repair: 'bg-amber-50 text-amber-700',
  retired: 'bg-gray-100 text-gray-500',
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

  const add = () => {
    setError('');
    startTransition(async () => {
      try {
        await createBoard({
          academy_id: academyId,
          board_type: bType,
          shape: bShape,
          length_feet: bFeet ? parseInt(bFeet, 10) : null,
          length_inches: bInches ? parseInt(bInches, 10) : null,
          volume_liters: bVolume.trim() || null,
          notes: null,
        });
        setBVolume('');
        setAdding(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message || 'No se pudo crear la tabla.');
      }
    });
  };

  const setStatus = (id: string, status: BoardStatus) => {
    startTransition(async () => {
      try { await updateBoard(id, { status }); router.refresh(); }
      catch (e: any) { setError(e.message || 'No se pudo actualizar.'); }
    });
  };

  const remove = (id: string, code: string) => {
    if (!confirm(`¿Eliminar la tabla ${code} del inventario?`)) return;
    startTransition(async () => {
      try { await deleteBoard(id); router.refresh(); }
      catch (e: any) { setError(e.message || 'No se pudo eliminar.'); }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-semibold">
          🏄 Inventario de tablas ({boards.length})
        </p>
        <button onClick={() => setAdding((v) => !v)} className="text-[11px] text-[var(--tss-navy)] hover:underline">
          {adding ? 'Cancelar' : '+ Agregar tabla'}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 -mt-1">
        El código se sugiere solo. El coach elige estas tablas al planear; el cierre las devuelve a disponible.
      </p>

      {adding && (
        <div className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Mini label="Tipo">
              <select value={bType} onChange={(e) => setBType(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Mini>
            <Mini label="Forma">
              <select value={bShape} onChange={(e) => setBShape(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white">
                {SHAPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Mini>
            <Mini label="Pies">
              <input value={bFeet} onChange={(e) => setBFeet(e.target.value)} inputMode="numeric" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
            <Mini label="Pulg.">
              <input value={bInches} onChange={(e) => setBInches(e.target.value)} inputMode="numeric" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
            <Mini label="Litraje">
              <input value={bVolume} onChange={(e) => setBVolume(e.target.value)} placeholder="ej. 42" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            </Mini>
          </div>
          <button onClick={add} disabled={pending} className="w-full py-2 text-white text-xs font-semibold rounded-lg disabled:opacity-50 bg-[var(--tss-navy)]">
            {pending ? 'Guardando…' : 'Agregar al inventario'}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {boards.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Sin tablas aún. Agregá la primera.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {boards.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-sm font-mono font-semibold text-[var(--tss-navy)]">{b.code}</p>
                <p className="text-[11px] text-gray-500">
                  {[b.board_type, b.shape, b.length_feet ? `${b.length_feet}'${b.length_inches || ''}` : null, b.volume_liters ? `${b.volume_liters}L` : null].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
