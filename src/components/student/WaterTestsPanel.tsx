'use client';

// Pruebas de agua: cómo se GANA el nivel de océano.
//
// Hasta acá el ocean_level salía del quiz de intake —lo que el alumno dice de
// sí mismo— y del ojo del coach. Esto lo vuelve observable.
//
// Se pasa o no se pasa. No hay estrellas: flotaste tres minutos o no. La
// técnica es gradual; esto es seguridad.
//
// El panel NO cambia el ocean_level por su cuenta: le dice al coach hasta
// dónde llega el alumno con pruebas pasadas, y subirlo lo sigue decidiendo él
// en el panel de Ocean Level.

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  WATER_TESTS,
  LEVEL_REQUIREMENTS,
  requirementLabel,
  testByKey,
  lastByTestAndLevel,
  meetsRequirement,
} from '@/lib/constants/water-tests';
import { OCEAN_LEVEL_INFO, type OceanLevel } from '@/lib/constants/ocean-levels';
import { getWaterTests, recordWaterTest, type WaterTestRow } from '@/lib/actions/water-tests';

const LEVELS = Object.keys(LEVEL_REQUIREMENTS) as OceanLevel[];

export function WaterTestsPanel({
  studentId,
  coachId,
  currentLevel,
}: {
  studentId: string;
  coachId: string;
  currentLevel: string | null;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<WaterTestRow[] | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<{ level: OceanLevel; test: string; measured: string; conditions: string } | null>(null);

  useEffect(() => {
    getWaterTests(studentId).then((r) => {
      if (r.ok) setRows(r.rows);
      else setError(r.error);
    });
  }, [studentId]);

  // El último resultado de cada (prueba, nivel) y la regla de "cumplido" viven
  // en water-tests.ts: la guía del alumno lee lo mismo que esta ficha.
  const last = lastByTestAndLevel(rows ?? []);
  const meets = (level: OceanLevel, req: { test: string; target: number | null }) =>
    meetsRequirement(last, level, req as any);

  // Hasta dónde llega con pruebas pasadas. Acumulativo: no se salta un nivel.
  let earned: OceanLevel | null = null;
  for (const l of LEVELS) {
    if ((LEVEL_REQUIREMENTS[l] ?? []).every((req) => meets(l, req))) earned = l;
    else break;
  }

  const save = (passed: boolean) => {
    if (!form) return;
    setError('');
    startTransition(async () => {
      const res = await recordWaterTest({
        studentId,
        coachId,
        testKey: form.test,
        targetLevel: form.level,
        passed,
        measured: form.measured ? Number(form.measured) : null,
        conditions: form.conditions,
      });
      if (!res.ok) { setError(res.error); return; }
      setForm(null);
      const r = await getWaterTests(studentId);
      if (r.ok) setRows(r.rows);
      router.refresh();
    });
  };

  if (rows === null && !error) {
    return <p className="text-sm text-gray-400 italic">Cargando…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-[11px] text-gray-500 flex-1">
          Se pasa o no se pasa — no hay estrellas. Esto no cambia su Ocean Level: te dice qué
          está respaldado por una prueba.
        </p>
        <span className="text-[10px] font-mono shrink-0">
          {earned ? (
            <span className="text-emerald-600 font-bold">
              probado hasta {OCEAN_LEVEL_INFO[earned].short}
            </span>
          ) : (
            <span className="text-gray-400">sin pruebas</span>
          )}
          {currentLevel && (
            <span className="text-gray-400"> · ficha: {currentLevel}</span>
          )}
        </span>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      {LEVELS.map((level) => {
        const reqs = LEVEL_REQUIREMENTS[level] ?? [];
        const info = OCEAN_LEVEL_INFO[level];
        const done = reqs.every((req) => meets(level, req));
        return (
          <div key={level} className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 flex items-baseline gap-2">
              <span className="text-[11px] font-mono text-cyan-700">{info.short}</span>
              <span className="text-[13px] font-semibold text-gray-900">{info.name}</span>
              <span className="ml-auto text-[10px] font-mono shrink-0">
                {done ? <span className="text-emerald-600 font-bold">✓ probado</span>
                      : <span className="text-gray-400">{reqs.filter((r) => meets(level, r)).length}/{reqs.length}</span>}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {reqs.map((req) => {
                const r = last.get(`${req.test}:${level}`);
                const ok = meets(level, req);
                const t = testByKey(req.test);
                return (
                  <div key={req.test} className="px-3 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={`text-[12.5px] ${ok ? 'text-gray-800' : 'text-gray-600'}`}>
                        {ok && <span className="text-emerald-600">✓ </span>}
                        {requirementLabel(req)}
                      </p>
                      <p className="text-[10.5px] text-gray-400">{t?.proves}</p>
                      {r && (
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                          {r.passed ? 'pasó' : 'no pasó'}
                          {r.measured != null && ` · ${r.measured}${t?.unit ? ' ' + t.unit : ''}`}
                          {' · '}{new Date(r.tested_at).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ level, test: req.test, measured: '', conditions: '' })}
                      className="shrink-0 text-[11px] px-2.5 h-7 rounded-lg border border-gray-200 hover:border-gray-400"
                    >
                      {r ? 'repetir' : 'registrar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {form && (
        <div className="rounded-xl border-2 border-cyan-500 p-3 space-y-2">
          <p className="text-[12.5px] font-semibold text-gray-900">
            {testByKey(form.test)?.name} · {OCEAN_LEVEL_INFO[form.level].short}
          </p>
          {testByKey(form.test)?.unit && (
            <input
              type="number"
              inputMode="decimal"
              value={form.measured}
              onChange={(e) => setForm({ ...form, measured: e.target.value })}
              placeholder={`Cuánto (${testByKey(form.test)?.unit})`}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-[13px]"
            />
          )}
          <input
            value={form.conditions}
            onChange={(e) => setForm({ ...form, conditions: e.target.value })}
            placeholder="Condiciones (opcional) — p. ej. mar chico, piscina"
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-[13px]"
          />
          <div className="flex gap-2">
            <button type="button" disabled={pending} onClick={() => save(true)}
              className="flex-1 h-9 rounded-lg bg-emerald-600 text-white text-[12.5px] font-bold disabled:opacity-50">
              Pasó
            </button>
            <button type="button" disabled={pending} onClick={() => save(false)}
              className="flex-1 h-9 rounded-lg bg-gray-200 text-gray-700 text-[12.5px] font-bold disabled:opacity-50">
              No pasó
            </button>
            <button type="button" onClick={() => setForm(null)}
              className="px-3 h-9 rounded-lg text-[12.5px] text-gray-400">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
