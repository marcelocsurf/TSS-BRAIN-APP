'use client';

// ═══ DOCTRINA VIVA — las reglas de Marcelo y a qué materiales llegaron ═══
//
// Una regla por fila. Debajo, los materiales del paso que la regla toca:
// lección, drills, misiones, ficha del coach, página de secuencia. Cada uno
// dice si ya se revisó contra la regla ("al día") o si sigue pendiente
// ("revisar"). El dueño agrega reglas nuevas acá; el resto del app se
// corrige a partir de esta lista, no al revés.
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { MATERIAL_KINDS, MATERIAL_LABELS, DOCTRINE_BELTS, isBrandRule, type MaterialKind } from '@/lib/constants/doctrine';
import { upsertDoctrineRule, setDoctrineReview, deleteDoctrineRule, type DoctrineData, type DoctrineRule } from '@/lib/actions/doctrine';

const BELT_LABEL: Record<string, string> = { all: 'General', pre: 'Pre-curso', white: 'White', yellow: 'Yellow', blue: 'Blue', purple: 'Purple', brown: 'Brown', black: 'Black' };

export function DoctrineLive({ data }: { data: DoctrineData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<DoctrineRule | null | 'new'>(null);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [belt, setBelt] = useState<string>('all');
  // Reglas técnicas · Filosofía y marca (Marcelo 2026-09-11)
  const [scope, setScope] = useState<'tech' | 'brand'>('tech');

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn().catch(() => ({ ok: false, error: 'Sin conexión — reintentá.' }));
      if (!r.ok) alert(r.error || 'No se pudo guardar.');
      router.refresh();
    });

  const rules = useMemo(() => {
    let rs = data.rules.filter((r) => (scope === 'brand') === isBrandRule(r.applies_to));
    if (belt !== 'all') rs = rs.filter((r) => r.belt === belt || r.belt === 'all');
    if (filter === 'pending') rs = rs.filter((r) => r.materials.some((m) => !m.reviewed));
    return rs;
  }, [data.rules, belt, filter, scope]);

  const pendingCount = data.rules.reduce((n, r) => n + r.materials.filter((m) => !m.reviewed).length, 0);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="px-4 pt-3 flex gap-1.5">
        {([['tech', 'Reglas técnicas'], ['brand', 'Filosofía y marca']] as const).map(([id, label]) => {
          const n = data.rules.filter((r) => (id === 'brand') === isBrandRule(r.applies_to)).length;
          return (
            <button key={id} type="button" onClick={() => setScope(id)}
              className="text-[12px] font-semibold rounded-full px-3 py-1.5 border"
              style={scope === id ? { background: 'var(--tss-navy, #0A1628)', color: '#fff', borderColor: 'transparent' } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
              {label} · {n}
            </button>
          );
        })}
      </div>
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-[var(--tss-navy)]">{scope === 'brand' ? 'Filosofía y marca · lo que Marcelo decidió' : 'Doctrina viva · la fuente única'}</h3>
          <p className="text-[11px] text-gray-500 leading-snug">
            {data.rules.length} reglas · {pendingCount === 0 ? 'todos los materiales al día' : `${pendingCount} material${pendingCount === 1 ? '' : 'es'} por revisar`}.
            Una regla nueva se escribe acá primero; después se corrige lo que toca.
          </p>
        </div>
        <select value={belt} onChange={(e) => setBelt(e.target.value)} className="text-[12px] border border-gray-200 rounded-lg px-2 py-1.5">
          {DOCTRINE_BELTS.map((b) => <option key={b} value={b}>{BELT_LABEL[b]}</option>)}
        </select>
        <button type="button" onClick={() => setFilter(filter === 'all' ? 'pending' : 'all')}
          className="text-[12px] rounded-lg px-2.5 py-1.5 border" style={{ borderColor: filter === 'pending' ? '#0090B0' : '#e5e7eb', color: filter === 'pending' ? '#0090B0' : '#6b7280' }}>
          {filter === 'pending' ? 'Viendo: por revisar' : 'Solo por revisar'}
        </button>
        <button type="button" onClick={() => setEditing('new')} className="inline-flex items-center gap-1 text-[12px] font-semibold text-white rounded-full px-3 py-1.5" style={{ background: 'var(--tss-navy, #0A1628)' }}>
          <Plus size={13} /> Regla
        </button>
      </div>

      {editing && (
        <RuleForm
          initial={editing === 'new' ? null : editing}
          steps={data.steps}
          busy={pending}
          onCancel={() => setEditing(null)}
          onSave={(input) => { run(() => upsertDoctrineRule(input)); setEditing(null); }}
        />
      )}

      <div className="divide-y divide-gray-100">
        {rules.map((r) => (
          <RuleRow key={r.id} rule={r} busy={pending}
            onEdit={() => setEditing(r)}
            onDelete={() => { if (confirm(`¿Borrar la regla "${r.topic}"?`)) run(() => deleteDoctrineRule(r.id)); }}
            onToggle={(m) => run(() => setDoctrineReview(r.id, m.kind, m.id, !m.reviewed))} />
        ))}
        {rules.length === 0 && <p className="px-4 py-6 text-[12px] text-gray-400">Nada que mostrar con este filtro.</p>}
      </div>
    </section>
  );
}

function RuleRow({ rule, busy, onEdit, onDelete, onToggle }: {
  rule: DoctrineRule; busy: boolean; onEdit: () => void; onDelete: () => void; onToggle: (m: DoctrineRule['materials'][number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const pend = rule.materials.filter((m) => !m.reviewed).length;
  return (
    <div className="px-4 py-3">
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left flex items-start gap-2.5">
        <ChevronDown size={14} className={`mt-1 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[var(--tss-navy)] leading-snug">
            {rule.topic}
            {rule.status !== 'active' && <span className="ml-2 text-[10px] uppercase text-gray-400">{rule.status}</span>}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {BELT_LABEL[rule.belt] ?? rule.belt}
            {rule.step_id ? ` · ${rule.step_id}${rule.step_title ? ` ${rule.step_title}` : ''}` : ''}
            {rule.sequence_id ? ` · ${rule.sequence_id}` : ''}
            {` · ${rule.source} · ${rule.decided_on}`}
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-semibold rounded-full px-2 py-0.5" style={pend ? { background: '#FFF4E5', color: '#B45309' } : { background: '#E6FBF4', color: '#0a7c5d' }}>
          {pend ? `${pend} por revisar` : 'al día'}
        </span>
      </button>
      {open && (
        <div className="mt-2 pl-6 space-y-2">
          <p className="text-[13px] text-gray-800 leading-relaxed">{rule.rule_en}</p>
          {rule.rule_es && <p className="text-[12px] text-gray-500 leading-snug italic">{rule.rule_es}</p>}
          {rule.rationale && <p className="text-[12px] text-gray-500 leading-snug">Por qué: {rule.rationale}</p>}
          <p className="text-[10.5px] text-gray-400">Toca: {rule.applies_to.map((k) => MATERIAL_LABELS[k]).join(' · ')}</p>
          {rule.materials.length > 0 && (
            <div className="rounded-xl bg-gray-50 px-3 py-2 space-y-1">
              {rule.materials.map((m) => (
                <button key={`${m.kind}:${m.id}`} type="button" disabled={busy} onClick={() => onToggle(m)}
                  className="w-full flex items-center gap-2 text-left text-[12px] disabled:opacity-50">
                  {m.reviewed ? <CheckCircle2 size={14} style={{ color: '#06D6A0' }} /> : <Circle size={14} className="text-amber-500" />}
                  <span className="text-gray-400 w-24 shrink-0">{MATERIAL_LABELS[m.kind]}</span>
                  <span className="font-mono text-[11px] text-gray-500 shrink-0">{m.id}</span>
                  <span className="truncate text-gray-700">{m.title}</span>
                  <span className="ml-auto text-[10.5px] text-gray-400 shrink-0">{m.reviewed ? `revisado ${m.reviewed_at?.slice(0, 10)}` : 'revisar'}</span>
                </button>
              ))}
            </div>
          )}
          {rule.materials.length === 0 && <p className="text-[11px] text-gray-400">Sin materiales enlazados (regla general o paso sin piezas).</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#0090B0]"><Pencil size={12} /> Editar</button>
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500"><Trash2 size={12} /> Borrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RuleForm({ initial, steps, busy, onCancel, onSave }: {
  initial: DoctrineRule | null;
  steps: DoctrineData['steps'];
  busy: boolean;
  onCancel: () => void;
  onSave: (input: Parameters<typeof upsertDoctrineRule>[0]) => void;
}) {
  const [topic, setTopic] = useState(initial?.topic ?? '');
  const [ruleEn, setRuleEn] = useState(initial?.rule_en ?? '');
  const [ruleEs, setRuleEs] = useState(initial?.rule_es ?? '');
  const [rationale, setRationale] = useState(initial?.rationale ?? '');
  const [stepId, setStepId] = useState(initial?.step_id ?? '');
  const [sequenceId, setSequenceId] = useState(initial?.sequence_id ?? '');
  const [belt, setBelt] = useState(initial?.belt ?? 'all');
  const [source, setSource] = useState(initial?.source ?? 'Marcelo');
  const [applies, setApplies] = useState<MaterialKind[]>(initial?.applies_to ?? ['lesson', 'drill', 'mission', 'coach', 'page']);
  const [status, setStatus] = useState<DoctrineRule['status']>(initial?.status ?? 'active');
  const [err, setErr] = useState('');

  const toggle = (k: MaterialKind) => setApplies((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  return (
    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tema (corto)" className="sm:col-span-2 text-[13px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
        <select value={belt} onChange={(e) => setBelt(e.target.value)} className="text-[12px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
          {DOCTRINE_BELTS.map((b) => <option key={b} value={b}>{BELT_LABEL[b]}</option>)}
        </select>
      </div>
      <textarea value={ruleEn} onChange={(e) => setRuleEn(e.target.value)} rows={3} placeholder="La regla, en inglés (es lo que va a los materiales del alumno)" className="w-full text-[13px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
      <textarea value={ruleEs} onChange={(e) => setRuleEs(e.target.value)} rows={2} placeholder="En español, con tus palabras (opcional)" className="w-full text-[12px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
      <input value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Por qué (opcional)" className="w-full text-[12px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select value={stepId} onChange={(e) => setStepId(e.target.value)} className="text-[12px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
          <option value="">Paso: general (ninguno)</option>
          {steps.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.title}</option>)}
        </select>
        <input value={sequenceId} onChange={(e) => setSequenceId(e.target.value)} placeholder="Secuencia (BB-SEQ-08…)" className="text-[12px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white font-mono" />
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Fuente" className="text-[12px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
      </div>
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] text-gray-500 mr-1">Toca:</span>
        {MATERIAL_KINDS.map((k) => (
          <button key={k} type="button" onClick={() => toggle(k)} className="text-[11px] rounded-full px-2 py-0.5 border"
            style={applies.includes(k) ? { background: '#0A1628', color: '#fff', borderColor: '#0A1628' } : { color: '#6b7280', borderColor: '#e5e7eb' }}>
            {MATERIAL_LABELS[k]}
          </button>
        ))}
        {initial && (
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="ml-auto text-[11px] border border-gray-200 rounded-lg px-2 py-1 bg-white">
            <option value="active">vigente</option><option value="draft">borrador</option><option value="superseded">reemplazada</option>
          </select>
        )}
      </div>
      {err && <p className="text-[12px] text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={() => {
          if (!topic.trim() || !ruleEn.trim()) { setErr('Falta el tema o la regla.'); return; }
          onSave({ id: initial?.id ?? null, topic, rule_en: ruleEn, rule_es: ruleEs, rationale, step_id: stepId || null, sequence_id: sequenceId || null, belt, source, applies_to: applies, status });
        }} className="rounded-full px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50" style={{ background: 'var(--tss-navy, #0A1628)' }}>
          {busy ? 'Guardando…' : 'Guardar regla'}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 text-[12px] text-gray-500">Cancelar</button>
      </div>
    </div>
  );
}
