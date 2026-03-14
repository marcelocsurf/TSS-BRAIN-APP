'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  coachId: string;
  coachName: string;
  evaluatorId: string;
}

export function EvaluationForm({ coachId, coachName, evaluatorId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    technical_score: 0,
    methodology_score: 0,
    communication_score: 0,
    consistency_score: 0,
    overall_score: 0,
    strengths: '',
    areas_to_improve: '',
    director_notes: '',
    recommended_for_promotion: false,
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (form.technical_score === 0 || form.methodology_score === 0 ||
        form.communication_score === 0 || form.consistency_score === 0 || form.overall_score === 0) {
      alert('Please fill all score fields.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.from('coach_evaluations').insert({
      coach_id: coachId,
      evaluated_by: evaluatorId,
      ...form,
    });
    setSaved(true);
    setTimeout(() => router.push('/coaches'), 1500);
  };

  if (saved) {
    return (
      <div className="bg-green-50 rounded-xl p-8 text-center">
        <p className="text-lg font-semibold text-green-700">✓ Evaluation saved</p>
        <p className="text-sm text-green-600 mt-1">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono tracking-widest text-[var(--tss-gold)] uppercase mb-1">Director Evaluation</p>
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">{coachName}</h2>
        <p className="text-sm text-gray-400">Score 1–10 in each dimension</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
        <ScoreInput label="Technical — P·R·C·H application, sequence delivery, correction quality" value={form.technical_score} onChange={v => set('technical_score', v)} />
        <ScoreInput label="Methodology — Fidelity to TSS, use of Three Circles, Block System" value={form.methodology_score} onChange={v => set('methodology_score', v)} />
        <ScoreInput label="Communication — Clarity with students, safety briefings, feedback delivery" value={form.communication_score} onChange={v => set('communication_score', v)} />
        <ScoreInput label="Consistency — Session structure, documentation, punctuality, reliability" value={form.consistency_score} onChange={v => set('consistency_score', v)} />
        <div className="border-t border-gray-100 pt-4">
          <ScoreInput label="Overall — Director's holistic assessment" value={form.overall_score} onChange={v => set('overall_score', v)} highlight />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Strengths</label>
          <textarea value={form.strengths} onChange={e => set('strengths', e.target.value)}
            rows={2} placeholder="What this coach does particularly well..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Areas to Improve</label>
          <textarea value={form.areas_to_improve} onChange={e => set('areas_to_improve', e.target.value)}
            rows={2} placeholder="Where this coach needs to develop..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--tss-navy)] mb-1">🔒 Director Notes <span className="text-gray-400 font-normal">(internal only)</span></label>
          <textarea value={form.director_notes} onChange={e => set('director_notes', e.target.value)}
            rows={2} placeholder="Private assessment — not shared with coach..."
            className="w-full px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-200" />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.recommended_for_promotion}
            onChange={e => set('recommended_for_promotion', e.target.checked)}
            className="w-4 h-4 rounded" />
          <span className="text-sm font-medium text-[var(--tss-navy)]">⭐ Recommend for certification upgrade</span>
        </label>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3 bg-[var(--tss-navy)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Evaluation'}
      </button>
    </div>
  );
}

function ScoreInput({ label, value, onChange, highlight }: {
  label: string; value: number; onChange: (v: number) => void; highlight?: boolean;
}) {
  return (
    <div>
      <label className={`block text-xs font-medium mb-2 ${highlight ? 'text-[var(--tss-navy)]' : 'text-gray-600'}`}>{label}</label>
      <div className="flex gap-1.5">
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded-lg text-xs font-medium border transition-all ${
              value === n
                ? highlight
                  ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
                  : 'bg-[var(--tss-gold)] text-white border-[var(--tss-gold)]'
                : value > 0 && n <= value
                  ? highlight
                    ? 'bg-[var(--tss-navy)]/20 text-[var(--tss-navy)] border-[var(--tss-navy)]/20'
                    : 'bg-[var(--tss-gold)]/20 text-[var(--tss-gold)] border-[var(--tss-gold)]/20'
                  : 'border-gray-200 text-gray-400'
            }`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-300">Needs work</span>
        <span className="text-[10px] text-gray-300">Excellent</span>
      </div>
    </div>
  );
}
