'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  upsertCostRate, deleteCostRate, saveCoachPayRate, setTemplateCostItem,
  DRIVER_LABEL, type CostRate, type CoachPayRate, type CostDriver, type RecipeRow,
} from '@/lib/actions/costs';
import { Plus, Trash2, Check } from 'lucide-react';

// Costs settings UI (M145). Three sections: coach pay matrix (level × group
// size), the editable cost catalog, and per-template recipes.

const LEVELS = ['Beginner', 'Novice', 'Foundation', 'Emerging'];
const SIZES = [1, 2, 3, 4, 5, 6];
const CATEGORIES = ['coaching', 'training', 'video', 'materials', 'wellness', 'experience', 'tss', 'ops'];
const DRIVERS = Object.keys(DRIVER_LABEL) as CostDriver[];

const $ = (cents: number) => (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);

type Settings = {
  rates: CostRate[];
  matrix: CoachPayRate[];
  templates: Array<{ id: string; template_name: string; level_name: string | null; service_kind: string | null; duration_days: number | null }>;
  recipes: Array<RecipeRow & { template_id: string }>;
};

export function CostsManager({ initial }: { initial: Settings }) {
  const [rates, setRates] = useState<CostRate[]>(initial.rates);
  const [matrix, setMatrix] = useState<CoachPayRate[]>(initial.matrix);
  const [recipes, setRecipes] = useState(initial.recipes);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const flash = (k: string) => { setSavedKey(k); setTimeout(() => setSavedKey((v) => (v === k ? null : v)), 1200); };

  return (
    <div className="space-y-5">
      {/* ── 1. Coach pay matrix ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[var(--tss-navy)]">Coach pay matrix</p>
        <p className="text-[11px] text-gray-500 mb-3">$ per DAY, by level and number of ENROLLED students. Freelance model.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 py-1.5">Level</th>
                {SIZES.map((n) => (
                  <th key={n} className="text-center text-[10px] font-mono uppercase tracking-wider text-gray-400 py-1.5">{n} stu.</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((lvl) => (
                <tr key={lvl} className="border-t border-gray-50">
                  <td className="py-1.5 font-semibold text-[var(--tss-navy)]">{lvl}</td>
                  {SIZES.map((n) => {
                    const cell = matrix.find((m) => m.level_name === lvl && m.group_size === n);
                    const key = `${lvl}-${n}`;
                    return (
                      <td key={n} className="py-1.5 text-center">
                        <span className="inline-flex items-center gap-0.5">
                          <span className="text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            min={0}
                            defaultValue={cell ? $(cell.per_day_cents) : ''}
                            placeholder="—"
                            onBlur={(e) => {
                              const v = parseFloat(e.target.value);
                              if (Number.isNaN(v)) return;
                              const cents = Math.round(v * 100);
                              if (cell && cell.per_day_cents === cents) return;
                              start(async () => {
                                const r = await saveCoachPayRate(lvl, n, cents);
                                if (!r.ok) { alert(r.error); return; }
                                setMatrix((prev) => {
                                  const rest = prev.filter((m) => !(m.level_name === lvl && m.group_size === n));
                                  return [...rest, { level_name: lvl, group_size: n, per_day_cents: cents }];
                                });
                                flash(key);
                              });
                            }}
                            className="w-14 text-center px-1 py-1 border border-gray-200 rounded-lg text-sm"
                          />
                          {savedKey === key && <Check size={12} className="text-emerald-500" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2. Cost catalog ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[var(--tss-navy)]">Cost catalog</p>
        <p className="text-[11px] text-gray-500 mb-3">Each item has a driver: what triggers it and how it scales. Edit amounts inline.</p>
        <div className="space-y-1.5">
          {rates.map((r) => (
            <RateRow
              key={r.id}
              rate={r}
              pending={pending}
              saved={savedKey === r.id}
              onSave={(patch) => start(async () => {
                const res = await upsertCostRate({ id: r.id, name: r.name, category: r.category, driver: r.driver, amount_cents: r.amount_cents, active: r.active, notes: r.notes, ...patch });
                if (!res.ok) { alert(res.error); return; }
                setRates((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
                flash(r.id);
              })}
              onDelete={() => {
                if (!confirm(`Delete "${r.name}"?`)) return;
                start(async () => {
                  const res = await deleteCostRate(r.id);
                  if (!res.ok) { alert(res.error); return; }
                  setRates((prev) => prev.filter((x) => x.id !== r.id));
                });
              }}
            />
          ))}
          {rates.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No cost items yet — run the seed or add the first one below.</p>}
        </div>
        <AddRateForm pending={pending} onAdd={(input) => start(async () => {
          const res = await upsertCostRate(input);
          if (!res.ok || !res.id) { alert(res.error || 'Could not add.'); return; }
          setRates((prev) => [...prev, { id: res.id!, name: input.name, category: input.category ?? null, driver: input.driver, amount_cents: input.amount_cents, active: true, notes: null }]);
        })} />
      </div>

      {/* ── 3. Recipes per service template ── */}
      <RecipesSection rates={rates} templates={initial.templates} recipes={recipes} setRecipes={setRecipes} pending={pending} start={start} />
    </div>
  );
}

function RateRow({ rate, pending, saved, onSave, onDelete }: {
  rate: CostRate; pending: boolean; saved: boolean;
  onSave: (patch: Partial<CostRate>) => void; onDelete: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 ${rate.active ? 'bg-gray-50' : 'bg-white opacity-50'}`}>
      <button
        type="button"
        disabled={pending}
        onClick={() => onSave({ active: !rate.active })}
        className={`w-8 h-5 rounded-full relative transition-colors shrink-0 ${rate.active ? 'bg-emerald-500' : 'bg-gray-300'}`}
        title={rate.active ? 'Active' : 'Inactive'}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${rate.active ? 'left-3.5' : 'left-0.5'}`} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[var(--tss-navy)] truncate">{rate.name}</p>
        <p className="text-[10px] text-gray-400">
          {rate.category ?? '—'} · {DRIVER_LABEL[rate.driver] ?? rate.driver}
        </p>
      </div>
      <span className="inline-flex items-center gap-0.5 shrink-0">
        <span className="text-gray-400 text-xs">$</span>
        <input
          type="number"
          min={0}
          step="0.01"
          defaultValue={$(rate.amount_cents)}
          onBlur={(e) => {
            const v = parseFloat(e.target.value);
            if (Number.isNaN(v)) return;
            const cents = Math.round(v * 100);
            if (cents !== rate.amount_cents) onSave({ amount_cents: cents });
          }}
          className="w-20 text-right px-2 py-1 border border-gray-200 rounded-lg text-sm font-semibold"
        />
        {saved && <Check size={13} className="text-emerald-500" />}
      </span>
      <button type="button" disabled={pending} onClick={onDelete} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function AddRateForm({ pending, onAdd }: {
  pending: boolean;
  onAdd: (input: { name: string; category: string; driver: CostDriver; amount_cents: number }) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ops');
  const [driver, setDriver] = useState<CostDriver>('per_student_flat');
  const [amount, setAmount] = useState('');
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[var(--tss-navy)]/[0.03] border border-gray-100 p-2.5">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className="flex-1 min-w-[140px] px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm" />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={driver} onChange={(e) => setDriver(e.target.value as CostDriver)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
        {DRIVERS.map((d) => <option key={d} value={d}>{DRIVER_LABEL[d]}</option>)}
      </select>
      <span className="inline-flex items-center gap-0.5">
        <span className="text-gray-400 text-xs">$</span>
        <input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right" />
      </span>
      <button
        type="button"
        disabled={pending || !name.trim()}
        onClick={() => { onAdd({ name, category, driver, amount_cents: Math.round((parseFloat(amount) || 0) * 100) }); setName(''); setAmount(''); }}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--tss-navy)] text-white text-xs font-bold disabled:opacity-50"
      >
        <Plus size={13} /> Add
      </button>
    </div>
  );
}

function RecipesSection({ rates, templates, recipes, setRecipes, pending, start }: {
  rates: CostRate[];
  templates: Settings['templates'];
  recipes: Settings['recipes'];
  setRecipes: (fn: (prev: Settings['recipes']) => Settings['recipes']) => void;
  pending: boolean;
  start: (fn: () => Promise<void>) => void;
}) {
  const [tplId, setTplId] = useState<string>('');
  const tplRecipe = useMemo(() => new Map(recipes.filter((r) => r.template_id === tplId).map((r) => [r.cost_rate_id, r])), [recipes, tplId]);
  const hasRecipe = tplRecipe.size > 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-[var(--tss-navy)]">Service recipes</p>
      <p className="text-[11px] text-gray-500 mb-3">
        Which cost items apply to each service. A service with no recipe uses <strong>every active item</strong> by default.
      </p>
      <select value={tplId} onChange={(e) => setTplId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3">
        <option value="">Pick a service template…</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>{t.template_name} ({t.level_name ?? '—'} · {t.duration_days ?? '?'}d)</option>
        ))}
      </select>
      {tplId && (
        <div className="space-y-1">
          {!hasRecipe && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
              This service has no recipe yet → all active items apply. Untick any item to create its custom recipe.
            </p>
          )}
          {rates.filter((r) => r.active).map((r) => {
            const row = tplRecipe.get(r.id);
            const enabled = hasRecipe ? (row?.enabled ?? false) : true;
            return (
              <label key={r.id} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer ${enabled ? 'bg-gray-50' : 'bg-white opacity-60'}`}>
                <input
                  type="checkbox"
                  checked={enabled}
                  disabled={pending}
                  onChange={(e) => {
                    const on = e.target.checked;
                    start(async () => {
                      // First untick on a recipe-less template: materialize the
                      // full recipe so the rest keep applying.
                      if (!hasRecipe) {
                        for (const other of rates.filter((x) => x.active)) {
                          await setTemplateCostItem(tplId, other.id, other.id === r.id ? on : true, null);
                        }
                        setRecipes((prev) => [
                          ...prev.filter((x) => x.template_id !== tplId),
                          ...rates.filter((x) => x.active).map((x) => ({ template_id: tplId, cost_rate_id: x.id, enabled: x.id === r.id ? on : true, override_cents: null })),
                        ]);
                        return;
                      }
                      const res = await setTemplateCostItem(tplId, r.id, on, row?.override_cents ?? null);
                      if (!res.ok) { alert(res.error); return; }
                      setRecipes((prev) => [
                        ...prev.filter((x) => !(x.template_id === tplId && x.cost_rate_id === r.id)),
                        { template_id: tplId, cost_rate_id: r.id, enabled: on, override_cents: row?.override_cents ?? null },
                      ]);
                    });
                  }}
                  className="h-4 w-4 accent-[var(--tss-navy)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-[var(--tss-navy)] truncate">{r.name}</span>
                  <span className="block text-[10px] text-gray-400">{DRIVER_LABEL[r.driver]}</span>
                </span>
                <span className="text-sm font-semibold text-gray-600 shrink-0">${$(row?.override_cents ?? r.amount_cents)}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
