'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listCampTemplates, createCampInstance } from '@/lib/actions/camps';
import { listStudents, type StudentRow } from '@/lib/actions/students';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { BELT_DISPLAY } from '@/lib/constants/belts';

export default function NewCampPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    template_id: '',
    camp_name: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    modality: 'group' as 'individual' | 'group',
    student_ids: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      listCampTemplates(),
      listStudents({ status: 'active' }),
      getCurrentCoach(),
    ]).then(([t, s, c]) => {
      setTemplates(t);
      setStudents(s.students);
      setCoach(c);
    });
  }, []);

  const toggleStudent = (id: string) => {
    setForm(f => ({
      ...f,
      student_ids: f.student_ids.includes(id)
        ? f.student_ids.filter(s => s !== id)
        : [...f.student_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.template_id || !form.camp_name || form.student_ids.length === 0) {
      setError('Select a template, name the camp, and add at least one student.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const instance = await createCampInstance({
        ...form,
        coach_id: coach.id,
      });
      router.push(`/camps/${instance.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create camp');
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === form.template_id);

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-[var(--tss-navy)] mb-6">Create Camp Instance</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Template */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Template</h3>
          <select value={form.template_id} onChange={e => setForm(f => ({ ...f, template_id: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Select template...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.template_name} ({t.duration_days} days)
              </option>
            ))}
          </select>
          {selectedTemplate && (
            <p className="text-xs text-gray-500">{selectedTemplate.description}</p>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Details</h3>
          <input type="text" placeholder="Camp name *" value={form.camp_name}
            onChange={e => setForm(f => ({ ...f, camp_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start</label>
              <input type="date" value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End</label>
              <input type="date" value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            {(['group', 'individual'] as const).map(m => (
              <button key={m} type="button" onClick={() => setForm(f => ({ ...f, modality: m }))}
                className={`flex-1 py-2 text-xs rounded-lg border capitalize ${
                  form.modality === m ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]' : 'border-gray-200 text-gray-600'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)] mb-3">
            Participants ({form.student_ids.length})
          </h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {students.map(s => (
              <button key={s.id} type="button" onClick={() => toggleStudent(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  form.student_ids.includes(s.id)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: BELT_DISPLAY[s.belt_level]?.color || '#999' }}>
                  {s.first_name[0]}{s.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{s.first_name} {s.last_name}</p>
                  <p className="text-[10px] text-gray-400">{BELT_DISPLAY[s.belt_level]?.levelName}</p>
                </div>
                {form.student_ids.includes(s.id) && (
                  <span className="text-blue-600 text-xs">&#10003;</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-[var(--tss-navy)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Camp'}
          </button>
        </div>
      </form>
    </div>
  );
}
