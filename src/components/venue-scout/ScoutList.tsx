'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, MapPin, Waves, Trophy } from 'lucide-react';
import { createScout, deleteScout, type VenueScoutRow } from '@/lib/actions/venue-scout';

export function ScoutList({ scouts }: { scouts: VenueScoutRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [list, setList] = useState(scouts);

  function newScout() {
    start(async () => {
      const r = await createScout({ mode: 'comp' });
      if (r.ok && r.id) router.push(`/venue-scout/${r.id}`);
      else alert(r.error || 'No se pudo crear el scout.');
    });
  }
  function remove(id: string) {
    if (!confirm('¿Borrar este análisis?')) return;
    setList((prev) => prev.filter((s) => s.id !== id));
    start(async () => { await deleteScout(id); router.refresh(); });
  }

  return (
    <div className="space-y-4">
      <button
        onClick={newScout}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--tss-navy)] text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        <Plus size={16} /> Nuevo análisis
      </button>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <MapPin size={36} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">Aún no analizaste ningún spot.</p>
          <p className="text-xs text-gray-400 mt-1">Tocá "Nuevo análisis" para empezar.</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {list.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)]">
                {s.mode === 'free' ? <Waves size={18} /> : <Trophy size={18} />}
              </span>
              <Link href={`/venue-scout/${s.id}`} className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">{s.spot_name || 'Spot sin nombre'}</p>
                <p className="text-[11px] text-gray-400">
                  {s.mode === 'free' ? 'Sesión libre' : 'Competencia'}
                  {s.scout_date ? ` · ${s.scout_date}` : ''}
                  {s.student_name ? ` · ${s.student_name}` : ''}
                  {s.shared_with_student ? ' · compartido' : ''}
                </p>
              </Link>
              <button onClick={() => remove(s.id)} className="p-1 text-gray-300 hover:text-red-500 shrink-0" aria-label="Borrar"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
