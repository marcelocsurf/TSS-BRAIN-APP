'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCampTemplate,
  updateCampTemplate,
  type CreateTemplateInput,
  type TemplateDayInput,
  type TemplateBlockInput,
} from '@/lib/actions/camps';
import {
  PILARS,
  PILAR_LABELS,
  type Pilar,
  TRAINING_VENUES,
  MISSION_TIME_OPTIONS,
  WARMUP_OPTIONS,
  SIMULATION_OPTIONS,
  MENTAL_HACK_OPTIONS,
} from '@/lib/constants/brand';

const LEVEL_OPTIONS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
const MODALITY_OPTIONS = ['individual', 'group'];
const DELIVERY_OPTIONS = ['in-person', 'online', 'hybrid'];
const BLOCK_TYPE_OPTIONS = [
  { value: 'mission', label: 'Mission' },
  { value: 'evaluation', label: 'Evaluation' },
  { value: 'free_practice', label: 'Free Practice' },
];
const EVAL_TYPE_OPTIONS = [
  { value: 'progress_check', label: 'Progress Check' },
  { value: 'sequence_evaluation', label: 'Sequence Evaluation' },
  { value: 'ocean_assessment', label: 'Ocean Assessment' },
  { value: 'final', label: 'Final Evaluation' },
];

function emptyBlock(order: number): TemplateBlockInput {
  return {
    block_order: order,
    pilar: null,
    is_safety_layer: false,
    pilar_part: null,
    mission: null,
    drill_name: null,
    mission_time: '15',
    repetitions_default: null,
    warm_up: null,
    simulation: null,
    mental_hack: null,
    evaluation_focus: null,
    block_type: 'mission',
  };
}

function emptyDay(dayNumber: number): TemplateDayInput {
  return {
    day_number: dayNumber,
    venue_default: null,
    ocean_condition_target: null,
    day_goal: null,
    day_notes: null,
    evaluation_focus: null,
    has_evaluation: false,
    evaluation_type: null,
    blocks: [emptyBlock(1)],
  };
}

interface Props {
  mode: 'create' | 'edit';
  templateId?: string;
  initialData?: CreateTemplateInput;
}

export function TemplateBuilderForm({ mode, templateId, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [templateName, setTemplateName] = useState(initialData?.template_name || '');
  const [levelName, setLevelName] = useState(initialData?.level_name || 'Beginner');
  const [durationDays, setDurationDays] = useState(initialData?.duration_days || 1);
  const [modality, setModality] = useState(initialData?.modality || 'individual');
  const [deliveryModel, setDeliveryModel] = useState(initialData?.delivery_model || 'in-person');
  const [description, setDescription] = useState(initialData?.description || '');
  const [days, setDays] = useState<TemplateDayInput[]>(
    initialData?.days || [emptyDay(1)]
  );

  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  const toggleDay = (idx: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const updateDay = (idx: number, patch: Partial<TemplateDayInput>) => {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const addDay = () => {
    const nextNum = days.length + 1;
    setDays((prev) => [...prev, emptyDay(nextNum)]);
    setDurationDays(days.length + 1);
    setExpandedDays((prev) => new Set(prev).add(days.length));
  };

  const removeDay = (idx: number) => {
    if (days.length <= 1) return;
    setDays((prev) =>
      prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day_number: i + 1 }))
    );
    setDurationDays(days.length - 1);
  };

  const updateBlock = (dayIdx: number, blockIdx: number, patch: Partial<TemplateBlockInput>) => {
    setDays((prev) =>
      prev.map((d, di) =>
        di === dayIdx
          ? {
              ...d,
              blocks: d.blocks.map((b, bi) => (bi === blockIdx ? { ...b, ...patch } : b)),
            }
          : d
      )
    );
  };

  const addBlock = (dayIdx: number) => {
    setDays((prev) =>
      prev.map((d, di) =>
        di === dayIdx
          ? { ...d, blocks: [...d.blocks, emptyBlock(d.blocks.length + 1)] }
          : d
      )
    );
  };

  const removeBlock = (dayIdx: number, blockIdx: number) => {
    setDays((prev) =>
      prev.map((d, di) =>
        di === dayIdx
          ? {
              ...d,
              blocks: d.blocks
                .filter((_, bi) => bi !== blockIdx)
                .map((b, i) => ({ ...b, block_order: i + 1 })),
            }
          : d
      )
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!templateName.trim()) {
      setError('Template name is required.');
      return;
    }
    if (days.length === 0) {
      setError('At least one day is required.');
      return;
    }

    setLoading(true);
    try {
      const input: CreateTemplateInput = {
        template_name: templateName.trim(),
        level_name: levelName,
        duration_days: days.length,
        modality,
        delivery_model: deliveryModel,
        description: description.trim(),
        days,
      };

      if (mode === 'edit' && templateId) {
        await updateCampTemplate(templateId, input);
      } else {
        await createCampTemplate(input);
      }
      router.push('/camps/templates');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER FIELDS ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-mono)' }}>
          Template Info
        </h3>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
            Template Name *
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] focus:border-transparent"
            placeholder="e.g. Novice 6-Day Intensive"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Level
            </label>
            <select
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
            >
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Modality
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
            >
              {MODALITY_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Delivery Model
            </label>
            <select
              value={deliveryModel}
              onChange={(e) => setDeliveryModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
            >
              {DELIVERY_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Duration (days)
            </label>
            <input
              type="number"
              min={1}
              value={days.length}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] focus:border-transparent resize-none"
            placeholder="Brief description of this camp template..."
          />
        </div>
      </div>

      {/* ── DAY BUILDER ── */}
      {days.map((day, dayIdx) => (
        <div key={dayIdx} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Day header — clickable accordion */}
          <button
            type="button"
            onClick={() => toggleDay(dayIdx)}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--tss-navy)] text-white text-xs font-bold flex items-center justify-center">
                {day.day_number}
              </span>
              <span className="text-sm font-medium text-[var(--tss-navy)]">
                Day {day.day_number}
              </span>
              {day.day_goal && (
                <span className="text-xs text-gray-400 truncate max-w-[200px]">
                  — {day.day_goal}
                </span>
              )}
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {day.blocks.length} block{day.blocks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {days.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDay(dayIdx);
                  }}
                  className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer px-1"
                >
                  Remove
                </span>
              )}
              <span className="text-gray-400 text-xs">
                {expandedDays.has(dayIdx) ? '▲' : '▼'}
              </span>
            </div>
          </button>

          {expandedDays.has(dayIdx) && (
            <div className="p-4 space-y-4">
              {/* Day fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    Day Goal
                  </label>
                  <input
                    type="text"
                    value={day.day_goal || ''}
                    onChange={(e) => updateDay(dayIdx, { day_goal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
                    placeholder="What should students achieve today?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    Venue Default
                  </label>
                  <select
                    value={day.venue_default || ''}
                    onChange={(e) => updateDay(dayIdx, { venue_default: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
                  >
                    <option value="">Select venue...</option>
                    {TRAINING_VENUES.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    Evaluation Focus
                  </label>
                  <input
                    type="text"
                    value={day.evaluation_focus || ''}
                    onChange={(e) => updateDay(dayIdx, { evaluation_focus: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
                    placeholder="What to evaluate..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    Day Notes
                  </label>
                  <textarea
                    value={day.day_notes || ''}
                    onChange={(e) => updateDay(dayIdx, { day_notes: e.target.value || null })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)] resize-none"
                    placeholder="Additional notes for this day..."
                  />
                </div>

                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={day.has_evaluation}
                      onChange={(e) =>
                        updateDay(dayIdx, {
                          has_evaluation: e.target.checked,
                          evaluation_type: e.target.checked ? 'progress_check' : null,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-xs text-gray-600">Has Evaluation</span>
                  </label>
                  {day.has_evaluation && (
                    <select
                      value={day.evaluation_type || 'progress_check'}
                      onChange={(e) => updateDay(dayIdx, { evaluation_type: e.target.value })}
                      className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
                    >
                      {EVAL_TYPE_OPTIONS.map((et) => (
                        <option key={et.value} value={et.value}>{et.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* ── BLOCKS ── */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-[var(--tss-navy)] mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                  Mission Blocks
                </h4>

                <div className="space-y-3">
                  {day.blocks.map((block, blockIdx) => (
                    <div
                      key={blockIdx}
                      className="border border-gray-100 rounded-xl p-3 bg-gray-50/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[var(--tss-navy)] text-white text-[10px] font-bold flex items-center justify-center">
                            {block.block_order}
                          </span>
                          <select
                            value={block.block_type}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { block_type: e.target.value })}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          >
                            {BLOCK_TYPE_OPTIONS.map((bt) => (
                              <option key={bt.value} value={bt.value}>{bt.label}</option>
                            ))}
                          </select>
                        </div>
                        {day.blocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBlock(dayIdx, blockIdx)}
                            className="text-[10px] text-red-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Pilar</label>
                          <select
                            value={block.pilar || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { pilar: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          >
                            <option value="">Select pilar...</option>
                            {PILARS.map((p) => (
                              <option key={p} value={p}>{PILAR_LABELS[p]}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Pilar Part</label>
                          <input
                            type="text"
                            value={block.pilar_part || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { pilar_part: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                            placeholder="e.g. Pop-up"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Mission</label>
                          <input
                            type="text"
                            value={block.mission || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { mission: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                            placeholder="Mission description..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Drill Name</label>
                          <input
                            type="text"
                            value={block.drill_name || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { drill_name: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                            placeholder="e.g. Wave catch drill"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Mission Time</label>
                          <select
                            value={block.mission_time || '15'}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { mission_time: e.target.value })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          >
                            {MISSION_TIME_OPTIONS.map((mt) => (
                              <option key={mt.value} value={mt.value}>{mt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Repetitions</label>
                          <input
                            type="number"
                            min={0}
                            value={block.repetitions_default ?? ''}
                            onChange={(e) =>
                              updateBlock(dayIdx, blockIdx, {
                                repetitions_default: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Warm-up</label>
                          <select
                            value={block.warm_up || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { warm_up: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          >
                            <option value="">None</option>
                            {WARMUP_OPTIONS.map((w) => (
                              <option key={w.value} value={w.value}>{w.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Simulation</label>
                          <select
                            value={block.simulation || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { simulation: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          >
                            <option value="">None</option>
                            {SIMULATION_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Mental Hack</label>
                          <select
                            value={block.mental_hack || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { mental_hack: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          >
                            <option value="">None</option>
                            {MENTAL_HACK_OPTIONS.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>Eval Focus</label>
                          <input
                            type="text"
                            value={block.evaluation_focus || ''}
                            onChange={(e) => updateBlock(dayIdx, blockIdx, { evaluation_focus: e.target.value || null })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                            placeholder="What to evaluate..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addBlock(dayIdx)}
                  className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-[var(--tss-gold)] hover:text-[var(--tss-gold)] transition-colors"
                >
                  + Add Block
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Day */}
      <button
        type="button"
        onClick={addDay}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[var(--tss-navy)] hover:text-[var(--tss-navy)] transition-colors font-medium"
      >
        + Add Day
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-medium hover:brightness-110 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Saving...'
          : mode === 'edit'
          ? 'Update Template'
          : 'Save Template'}
      </button>
    </div>
  );
}
