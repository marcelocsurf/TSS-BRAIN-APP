'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCampTemplate,
  updateCampTemplate,
  type CreateTemplateInput,
  type TemplateDayInput,
  type TemplateBlockInput,
} from '@/lib/actions/camps';
import {
  TRAINING_VENUES,
  MISSION_TIME_OPTIONS,
  WARMUP_OPTIONS,
  SIMULATION_OPTIONS,
  MENTAL_HACK_OPTIONS,
} from '@/lib/constants/brand';
import { getTemplateCatalog, type TemplateCatalog } from '@/lib/actions/template-catalog';
import { StepDrillPicker } from '@/components/shared/StepDrillPicker';
import { ContentVideoManager } from '@/components/content/ContentVideoManager';
import type { ContentVideo } from '@/lib/actions/content';
import { ActivityForm } from '@/components/camp/ActivityForm';
import { ACTIVITY_TYPES } from '@/lib/constants/brand';

import { LEVEL_NAMES, LEVEL_BELT_COLOR, LEVEL_BELT_LABEL } from '@/lib/constants/belts';
const LEVEL_OPTIONS = LEVEL_NAMES;
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
    block_type: 'water_mission',
    step_id: null,
    drill_id: null,
    drill_custom: null,
    mission_id: null,
    mission_custom: null,
    // M78 — Activity taxonomy
    explain_md: null,
    demonstrate_md: null,
    simulate_md: null,
    feedback_md: null,
    equipment: null,
    activity_subtype: null,
    step_ids: null,
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
  /** Edit mode only — per-day media keyed by template_day_id. */
  dayMedia?: Record<string, ContentVideo[]>;
}

export function TemplateBuilderForm({ mode, templateId, initialData, dayMedia }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [templateName, setTemplateName] = useState(initialData?.template_name || '');
  const [levelName, setLevelName] = useState(initialData?.level_name || 'Beginner');
  const [durationDays, setDurationDays] = useState(initialData?.duration_days || 1);
  const [modality, setModality] = useState(initialData?.modality || 'individual');
  const [deliveryModel, setDeliveryModel] = useState(initialData?.delivery_model || 'in-person');
  const [description, setDescription] = useState(initialData?.description || '');
  const [includesCourse, setIncludesCourse] = useState<'white_belt' | 'yellow_belt' | 'blue_belt' | ''>(
    initialData?.includes_course_key ?? '',
  );
  const [serviceKind, setServiceKind] = useState<'surf_camp' | 'surf_lesson' | 'custom' | ''>(
    initialData?.service_kind ?? '',
  );
  const [capacityMax, setCapacityMax] = useState<number>(initialData?.capacity_max ?? 4);
  const initialMinutes = initialData?.session_duration_minutes ?? null;
  const [sessionHours, setSessionHours] = useState<number>(
    initialMinutes != null ? Math.floor(initialMinutes / 60) : 0,
  );
  const [sessionMinutes, setSessionMinutes] = useState<number>(
    initialMinutes != null ? initialMinutes % 60 : 0,
  );
  const [cardColor, setCardColor] = useState<string>(initialData?.card_color ?? '');
  const [accentColor, setAccentColor] = useState<string>(initialData?.accent_color ?? '');
  const [days, setDays] = useState<TemplateDayInput[]>(
    initialData?.days || [emptyDay(1)]
  );

  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  // M44 — sequence catalog (STPs + drills + missions) filtered to this
  // template's level. Reloads when level changes so the picker only shows
  // relevant items.
  const [catalog, setCatalog] = useState<TemplateCatalog | null>(null);
  useEffect(() => {
    let mounted = true;
    getTemplateCatalog(levelName).then((c) => {
      if (mounted) setCatalog(c);
    });
    return () => {
      mounted = false;
    };
  }, [levelName]);

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

  // Move a block up (-1) or down (+1). Re-numbers block_order so the
  // DB write reflects the new order.
  const moveBlock = (dayIdx: number, blockIdx: number, direction: -1 | 1) => {
    setDays((prev) =>
      prev.map((d, di) => {
        if (di !== dayIdx) return d;
        const target = blockIdx + direction;
        if (target < 0 || target >= d.blocks.length) return d;
        const next = [...d.blocks];
        [next[blockIdx], next[target]] = [next[target], next[blockIdx]];
        return {
          ...d,
          blocks: next.map((b, i) => ({ ...b, block_order: i + 1 })),
        };
      })
    );
  };

  // Duplicate a block — copies all fields, inserts right after the
  // original, re-numbers block_order.
  const duplicateBlock = (dayIdx: number, blockIdx: number) => {
    setDays((prev) =>
      prev.map((d, di) => {
        if (di !== dayIdx) return d;
        const original = d.blocks[blockIdx];
        const copy: TemplateBlockInput = { ...original };
        const next = [
          ...d.blocks.slice(0, blockIdx + 1),
          copy,
          ...d.blocks.slice(blockIdx + 1),
        ].map((b, i) => ({ ...b, block_order: i + 1 }));
        return { ...d, blocks: next };
      })
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
      const totalMinutes = sessionHours * 60 + sessionMinutes;
      const input: CreateTemplateInput = {
        template_name: templateName.trim(),
        level_name: levelName,
        duration_days: days.length,
        modality,
        delivery_model: deliveryModel,
        description: description.trim(),
        days,
        includes_course_key: includesCourse || null,
        service_kind: serviceKind || null,
        capacity_max: capacityMax > 0 ? capacityMax : null,
        session_duration_minutes: totalMinutes > 0 ? totalMinutes : null,
        card_color: cardColor || null,
        accent_color: accentColor || null,
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
            {/* Belt swatch + select. Native <select> can't render
                colored chips inside <option>, so we surface the belt
                colour as a 4px stripe attached to the field and append
                the belt name to each option label. */}
            <div className="flex items-stretch gap-2">
              <div
                className="w-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: LEVEL_BELT_COLOR[levelName] ?? '#E8E8E8',
                  border: levelName === 'Beginner' ? '1px solid #D1D5DB' : 'none',
                }}
                aria-hidden
              />
              <select
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
              >
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l} ({LEVEL_BELT_LABEL[l] ?? 'Belt'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Service Category
            </label>
            <select
              value={serviceKind}
              onChange={(e) => setServiceKind(e.target.value as 'surf_camp' | 'surf_lesson' | 'custom' | '')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
            >
              <option value="">— Unspecified</option>
              <option value="surf_camp">Surf Camp (multi-day)</option>
              <option value="surf_lesson">Surf / Skate Lesson (single)</option>
              <option value="custom">Custom</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              Drives the colour of the card on the calendar.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Capacity (max students)
            </label>
            <input
              type="number"
              min={1}
              value={capacityMax}
              onChange={(e) => setCapacityMax(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Number of spots open per instance of this service.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Card Colour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cardColor || '#F3F4F6'}
                onChange={(e) => setCardColor(e.target.value)}
                className="h-9 w-12 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                placeholder="#FFFC00"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
              />
              {cardColor && (
                <button
                  type="button"
                  onClick={() => setCardColor('')}
                  className="text-[10px] text-gray-500 hover:text-red-600 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Background of the service card on the calendar.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Accent Colour (left stripe)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor || '#9CA3AF'}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-9 w-12 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#F5C518"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
              />
              {accentColor && (
                <button
                  type="button"
                  onClick={() => setAccentColor('')}
                  className="text-[10px] text-gray-500 hover:text-red-600 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Belt-level stripe on the left edge.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Session Duration (per day)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={12}
                value={sessionHours}
                onChange={(e) => setSessionHours(Math.max(0, Math.min(12, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
                placeholder="0"
              />
              <span className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>h</span>
              <input
                type="number"
                min={0}
                max={59}
                step={5}
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
                placeholder="0"
              />
              <span className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>min</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              How long each day&apos;s session lasts (e.g. a lesson = 1h 30m).
            </p>
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
              Includes course
            </label>
            <select
              value={includesCourse}
              onChange={(e) => setIncludesCourse(e.target.value as 'white_belt' | 'yellow_belt' | 'blue_belt' | '')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
            >
              <option value="">— None (lesson only)</option>
              <option value="white_belt">White Belt course</option>
              <option value="yellow_belt">Yellow Belt course</option>
              <option value="blue_belt">Blue Belt course</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1 leading-tight">
              Camps that include a course auto-promote enrolled Leads to Members and unlock portal access.
            </p>
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

                {/* Day-level Evaluation Focus removed on purpose — it now
                    lives only inside each Mission block, where it auto-
                    populates from the linked step's success criteria. */}

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

              {/* ── SUPPORT MATERIAL (PPT / video / image / diagram) ── */}
              {day.id ? (
                <div className="border-t border-gray-100 pt-3">
                  <h4
                    className="text-xs font-semibold text-[var(--tss-navy)] mb-2"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Support Material
                  </h4>
                  <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                    PowerPoint / Google Slides / videos / images for this day.
                    The coach sees them inline on /camps/[id] when reading the
                    plan.
                  </p>
                  <ContentVideoManager
                    templateDayId={day.id}
                    videos={dayMedia?.[day.id] ?? []}
                  />
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] text-gray-400 italic">
                    Save this template once to enable per-day support material
                    upload.
                  </p>
                </div>
              )}

              {/* ── ACTIVITIES (M78) ── */}
              <div className="border-t border-gray-100 pt-3">
                <h4
                  className="text-xs font-semibold text-[var(--tss-navy)] mb-2"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Activities
                </h4>

                <div className="space-y-3">
                  {day.blocks.map((block, blockIdx) => {
                    const activityType =
                      ACTIVITY_TYPES.find((t) => t.value === block.block_type) ??
                      ACTIVITY_TYPES.find((t) => t.value === 'custom')!;
                    return (
                      <div
                        key={blockIdx}
                        className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 border-l-4"
                        style={{ borderLeftColor: activityType.color }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-[var(--tss-navy)] text-white text-[10px] font-bold flex items-center justify-center">
                              {block.block_order}
                            </span>
                            <span
                              className="text-[10px] uppercase tracking-wider font-semibold"
                              style={{ fontFamily: 'var(--font-mono)', color: activityType.color }}
                            >
                              {activityType.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Move up"
                              disabled={blockIdx === 0}
                              onClick={() => moveBlock(dayIdx, blockIdx, -1)}
                              className="text-[12px] text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              title="Move down"
                              disabled={blockIdx === day.blocks.length - 1}
                              onClick={() => moveBlock(dayIdx, blockIdx, 1)}
                              className="text-[12px] text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              title="Duplicate"
                              onClick={() => duplicateBlock(dayIdx, blockIdx)}
                              className="text-[10px] text-gray-400 hover:text-gray-700 px-1"
                            >
                              📋
                            </button>
                            {day.blocks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBlock(dayIdx, blockIdx)}
                                className="text-[10px] text-red-400 hover:text-red-600 px-1"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        <ActivityForm
                          block={block}
                          catalog={catalog}
                          onChange={(patch) => updateBlock(dayIdx, blockIdx, patch)}
                        />
                      </div>
                    );
                  })}
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
