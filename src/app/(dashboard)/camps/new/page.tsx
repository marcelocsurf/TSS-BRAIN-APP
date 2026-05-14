'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listCampTemplates, createCampInstance } from '@/lib/actions/camps';
import { listStudents, type StudentRow } from '@/lib/actions/students';
import { getCurrentCoach } from '@/lib/actions/sessions';
import { getCurrentCoach as getAuthCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { getCoachesForAssignment, type CoachForAssignment } from '@/lib/actions/cascade-sessions';
import { BELT_DISPLAY } from '@/lib/constants/belts';

export default function NewCampPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [coaches, setCoaches] = useState<CoachForAssignment[]>([]);
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    template_id: '',
    camp_name: '',
    head_coach_id: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    modality: 'group' as 'individual' | 'group',
    student_ids: [] as string[],
    // Custom-template overrides (only used when selected template is_custom)
    capacity_override: 4,
    duration_override: 1,
  });

  useEffect(() => {
    // Role guard: only coordinators and above can create camps
    getAuthCoach().then(async (authCoach) => {
      if (!authCoach || !(await isCoordinatorOrAbove(authCoach.role))) {
        router.replace('/');
        return;
      }
    });

    Promise.all([
      listCampTemplates(),
      listStudents({ status: 'active' }),
      getCurrentCoach(),
      getCoachesForAssignment(),
    ]).then(([t, s, c, coachesList]) => {
      setTemplates(t);
      setStudents(s.students);
      setCoach(c);
      setCoaches(coachesList);
      // Default head coach to current coach
      if (c?.id) {
        setForm(f => ({ ...f, head_coach_id: c.id }));
      }
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

  const selectedTemplate = templates.find(t => t.id === form.template_id);
  const effectiveCapacity = selectedTemplate?.is_custom
    ? form.capacity_override
    : selectedTemplate?.capacity_max ?? Infinity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.template_id || !form.camp_name || form.student_ids.length === 0) {
      setError('Select a service, name it, and add at least one student.');
      return;
    }
    if (form.student_ids.length > effectiveCapacity) {
      setError(
        `This service has a capacity of ${effectiveCapacity}. Remove ${form.student_ids.length - effectiveCapacity} student(s).`
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      const instance = await createCampInstance({
        ...form,
        coach_id: coach.id,
        head_coach_id: form.head_coach_id || coach.id,
      });
      router.push(`/camps/${instance.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create camp');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-[var(--tss-navy)] mb-6">Open a New Service</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Service Template */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Service</h3>
          <select value={form.template_id} onChange={e => setForm(f => ({ ...f, template_id: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Select service...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.template_name}
                {t.duration_days ? ` · ${t.duration_days}d` : ''}
                {t.capacity_max ? ` · ${t.capacity_max} spots` : ''}
                {t.is_custom ? ' · custom' : ''}
              </option>
            ))}
          </select>
          {selectedTemplate && (
            <>
              <p className="text-xs text-gray-500">{selectedTemplate.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.service_kind && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase font-mono tracking-wider">
                    {selectedTemplate.service_kind.replace(/_/g, ' ')}
                  </span>
                )}
                {!selectedTemplate.is_custom && selectedTemplate.capacity_max && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Capacity: {selectedTemplate.capacity_max} students
                  </span>
                )}
                {selectedTemplate.duration_days && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {selectedTemplate.duration_days} day{selectedTemplate.duration_days > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Custom-template inline overrides */}
          {selectedTemplate?.is_custom && (
            <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.capacity_override}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity_override: parseInt(e.target.value, 10) || 1 }))
                  }
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Duration (days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.duration_override}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration_override: parseInt(e.target.value, 10) || 1 }))
                  }
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Details</h3>
          <input type="text" placeholder="Camp name *" value={form.camp_name}
            onChange={e => setForm(f => ({ ...f, camp_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />

          {/* Head Coach */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Head Coach</label>
            <select
              value={form.head_coach_id}
              onChange={e => setForm(f => ({ ...f, head_coach_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Select head coach...</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.display_name} ({c.role})
                </option>
              ))}
            </select>
          </div>

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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
              Participants ({form.student_ids.length}
              {effectiveCapacity !== Infinity ? ` / ${effectiveCapacity}` : ''})
            </h3>
            {effectiveCapacity !== Infinity && form.student_ids.length >= effectiveCapacity && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                Full
              </span>
            )}
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {students.map(s => {
              const isSelected = form.student_ids.includes(s.id);
              const atCapacity = !isSelected && form.student_ids.length >= effectiveCapacity;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={atCapacity}
                  onClick={() => toggleStudent(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200'
                      : atCapacity
                      ? 'opacity-30 cursor-not-allowed border border-transparent'
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
                  {isSelected && <span className="text-blue-600 text-xs">&#10003;</span>}
                </button>
              );
            })}
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
