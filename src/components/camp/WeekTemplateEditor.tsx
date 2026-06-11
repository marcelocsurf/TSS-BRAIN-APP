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
  weekdays: number[];
  service_template_id: string;
  scheduled_time: string;
  default_head_coach_id: string;
};

// Group the stored one-weekday-per-row slots back into multi-day drafts
// (same service + time + coach → one row with several days selected).
function groupInitialSlots(initial?: WeekTemplateRow): SlotDraft[] {
  if (!initial?.slots?.length) return [];
  const map = new Map<string, SlotDraft>();
  for (const s of initial.slots) {
    const key = `${s.service_template_id}|${s.scheduled_time ?? ''}|${s.default_head_coach_id ?? ''}`;
    if (!map.has(key)) {
      map.set(key, {
        weekdays: [],
        service_template_id: s.service_template_id,
        scheduled_time: s.scheduled_time ?? '',
        default_head_coach_id: s.default_head_coach_id ?? '',
      });
    }
    map.get(key)!.weekdays.push(s.weekday);
  }
  return Array.from(map.values()).map((d) => ({ ...d, weekdays: d.weekdays.sort((a, b) => a - b) }));
}

export function WeekTemplateEditor({ mode, initial, campTemplates, coaches }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [slots, setSlots] = useState<SlotDraft[]>(groupInitialSlots(initial));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const addSlot = () =>
    setSlots((s) => [
      ...s,
      {
        weekdays: [0],
        service_template_id: campTemplates[0]?.id ?? '',
        scheduled_time: '',
        default_head_coach_id: '',
      },
    ]);

  const updateSlot = (i: number, patch: Partial<SlotDraft>) =>
    setSlots((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const toggleDay = (i: number, day: number) =>
    setSlots((s) =>
      s.map((row, idx) => {
        if (idx !== i) return row;
        const has = row.weekdays.includes(day);
        const weekdays = has
          ? row.weekdays.filter((d) => d !== day)
          : [...row.weekdays, day].sort((a, b) => a - b);
        return { ...row, weekdays };
      }),
    );

  const removeSlot = (i: number) => setSlots((s) => s.filter((_, idx) => idx !== i));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (slots.some((s) => s.weekdays.length === 0)) {
      setError('Each slot needs at least one day selected.');
      return;
    }
    if (slots.some((s) => !s.service_template_id)) {
      setError('Each slot needs a service picked.');
      return;
    }
    startTransition(async () => {
      try {
        // Expand each multi-day draft into one stored slot per weekday.
        const expanded: WeekTemplateSlotInput[] = [];
        let order = 0;
        for (const s of slots) {
          for (const day of s.weekdays) {
            expanded.push({
              weekday: day,
              service_template_id: s.service_template_id,
              scheduled_time: s.scheduled_time || null,
              default_head_coach_id: s.default_head_coach_id || null,
              display_order: order++,
            });
          }
        }
        const payload = {
          name: name.trim(),
          description: description.trim() || null,
          slots: expanded,
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
            style={{ fontFamily: 'var(--font-heading)' }}
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
              <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                {/* Day chips — pick one or many */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {WEEKDAYS.map((d, idx) => {
                    const on = slot.weekdays.includes(idx);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(i, idx)}
                        className={`w-9 py-1 text-[11px] rounded-lg border transition-colors ${
                          on
                            ? 'bg-[var(--tss-navy)] text-white border-transparent'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="ml-auto text-red-500 hover:text-red-700 flex items-center justify-center p-1"
                    aria-label="Remove slot"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
                {/* Service + time + coach */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <select
                    value={slot.service_template_id}
                    onChange={(e) => updateSlot(i, { service_template_id: e.target.value })}
                    className="col-span-6 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
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
                    className="col-span-3 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                    placeholder="Time"
                  />
                  <select
                    value={slot.default_head_coach_id}
                    onChange={(e) => updateSlot(i, { default_head_coach_id: e.target.value })}
                    className="col-span-3 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">No coach</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                {slot.weekdays.length > 1 && (
                  <p className="text-[10px] text-gray-400">
                    Creates {slot.weekdays.length} services — one per selected day.
                  </p>
                )}
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
