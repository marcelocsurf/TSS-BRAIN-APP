'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Trash2 } from 'lucide-react';
import {
  createWeekTemplate,
  updateWeekTemplate,
  deleteWeekTemplate,
  type WeekTemplateSlotInput,
  type WeekTemplateRow,
} from '@/lib/actions/week-templates';

interface CampTemplateLite {
  id: string;
  template_name: string;
  level_name: string | null;
  service_kind: string | null;
}

interface CoachLite {
  id: string;
  display_name: string;
}

interface Props {
  mode: 'create' | 'edit';
  initial?: WeekTemplateRow;
  campTemplates: CampTemplateLite[];
  coaches: CoachLite[];
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type SlotDraft = {
  weekday: number;
  service_template_id: string;
  scheduled_time: string;
  default_head_coach_id: string;
};

export function WeekTemplateEditor({ mode, initial, campTemplates, coaches }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [slots, setSlots] = useState<SlotDraft[]>(
    initial?.slots.map((s) => ({
      weekday: s.weekday,
      service_template_id: s.service_template_id,
      scheduled_time: s.scheduled_time ?? '',
      default_head_coach_id: s.default_head_coach_id ?? '',
    })) ?? [],
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const addSlot = () =>
    setSlots((s) => [
      ...s,
      {
        weekday: 0,
        service_template_id: campTemplates[0]?.id ?? '',
        scheduled_time: '',
        default_head_coach_id: '',
      },
    ]);

  const updateSlot = (i: number, patch: Partial<SlotDraft>) =>
    setSlots((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const removeSlot = (i: number) => setSlots((s) => s.filter((_, idx) => idx !== i));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          name: name.trim(),
          description: description.trim() || null,
          slots: slots.map((s, i): WeekTemplateSlotInput => ({
            weekday: s.weekday,
            service_template_id: s.service_template_id,
            scheduled_time: s.scheduled_time || null,
            default_head_coach_id: s.default_head_coach_id || null,
            display_order: i,
          })),
        };
        if (mode === 'edit' && initial) {
          await updateWeekTemplate(initial.id, payload);
        } else {
          await createWeekTemplate(payload);
        }
        router.push('/camps/week-templates');
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const deleteIt = () => {
    if (!initial) return;
    if (!confirm(`Delete "${initial.name}"? Existing camp instances are not affected.`)) return;
    startTransition(async () => {
      try {
        await deleteWeekTemplate(initial.id);
        router.push('/camps/week-templates');
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div>
          <label
            className="block text-xs font-medium text-gray-500 mb-1"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Standard Surf Week"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
            required
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium text-gray-500 mb-1"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="High-season weekly rhythm: 3 camps + 5 lessons + 2 surfskate"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3
            className="text-sm font-bold text-[var(--tss-navy)]"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Slots ({slots.length})
          </h3>
          <button
            type="button"
            onClick={addSlot}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90"
          >
            <Plus size={12} strokeWidth={2} /> Add slot
          </button>
        </div>

        {slots.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-4">
            No slots yet. Add one slot per service you want this week template to stamp.
          </p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2"
              >
                <select
                  value={slot.weekday}
                  onChange={(e) => updateSlot(i, { weekday: parseInt(e.target.value, 10) })}
                  className="col-span-2 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                >
                  {WEEKDAYS.map((d, idx) => (
                    <option key={d} value={idx}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={slot.service_template_id}
                  onChange={(e) =>
                    updateSlot(i, { service_template_id: e.target.value })
                  }
                  className="col-span-4 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                  required
                >
                  <option value="">— Pick service —</option>
                  {campTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.template_name}
                      {t.level_name ? ` (${t.level_name})` : ''}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={slot.scheduled_time}
                  onChange={(e) => updateSlot(i, { scheduled_time: e.target.value })}
                  className="col-span-2 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                  placeholder="Time"
                />
                <select
                  value={slot.default_head_coach_id}
                  onChange={(e) =>
                    updateSlot(i, { default_head_coach_id: e.target.value })
                  }
                  className="col-span-3 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                >
                  <option value="">No default coach</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="col-span-1 text-red-500 hover:text-red-700 flex items-center justify-center"
                  aria-label="Remove slot"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2 bg-[var(--tss-navy)] text-white text-sm font-semibold rounded-xl disabled:opacity-50"
        >
          {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create week template'}
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={deleteIt}
            disabled={pending}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-50"
          >
            <Trash2 size={13} strokeWidth={1.75} />
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
