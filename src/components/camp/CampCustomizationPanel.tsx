'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveStudentCustomization } from '@/lib/actions/camps';

interface Block {
  id: string;
  block_order: number;
  pilar: string | null;
  pilar_part: string | null;
  mission: string | null;
  drill_name: string | null;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Customization {
  student_id: string;
  day_number: number;
  block_order: number;
  custom_drill_name: string | null;
  custom_mission: string | null;
  custom_notes: string | null;
}

interface Props {
  campInstanceId: string;
  dayNumber: number;
  blocks: Block[];
  participants: { students: Student }[];
  existingCustomizations: Customization[];
}

export function CampCustomizationPanel({
  campInstanceId,
  dayNumber,
  blocks,
  participants,
  existingCustomizations,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Build map of existing customizations
  const customMap = new Map<string, Customization>();
  existingCustomizations.forEach((c) => {
    customMap.set(`${c.student_id}-${c.block_order}`, c);
  });

  // Track which students have any customization
  const customizedStudents = new Set(existingCustomizations.map((c) => c.student_id));

  // Local state for editing
  const [overrides, setOverrides] = useState<
    Record<number, { drill: string; mission: string; notes: string }>
  >({});

  const selectStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setSaved(false);
    // Load existing customizations into local state
    const initial: Record<number, { drill: string; mission: string; notes: string }> = {};
    blocks.forEach((b) => {
      const key = `${studentId}-${b.block_order}`;
      const existing = customMap.get(key);
      initial[b.block_order] = {
        drill: existing?.custom_drill_name || '',
        mission: existing?.custom_mission || '',
        notes: existing?.custom_notes || '',
      };
    });
    setOverrides(initial);
  };

  const updateOverride = (blockOrder: number, field: string, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [blockOrder]: { ...prev[blockOrder], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      for (const block of blocks) {
        const override = overrides[block.block_order];
        if (!override) continue;
        // Only save if there is actual content
        if (override.drill || override.mission || override.notes) {
          await saveStudentCustomization(
            campInstanceId,
            selectedStudent,
            dayNumber,
            block.block_order,
            override.drill || null,
            override.mission || null,
            override.notes || null
          );
        }
      }
      setSaved(true);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
          Customize for Student
        </h3>
        <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-[10px] text-gray-400">
            Override drill names and missions for individual students on this day.
          </p>

          {/* Student selector */}
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => {
              const student = p.students;
              if (!student) return null;
              const isCustomized = customizedStudents.has(student.id);
              const isSelected = selectedStudent === student.id;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => selectStudent(student.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
                      : isCustomized
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {student.first_name} {student.last_name}
                  {isCustomized && !isSelected && (
                    <span className="ml-1 text-[10px]">*</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Override fields per block */}
          {selectedStudent && (
            <div className="space-y-2 mt-3">
              {blocks
                .sort((a, b) => a.block_order - b.block_order)
                .map((block) => {
                  const override = overrides[block.block_order] || {
                    drill: '',
                    mission: '',
                    notes: '',
                  };
                  return (
                    <div
                      key={block.block_order}
                      className="border border-gray-100 rounded-lg p-2 bg-gray-50/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded bg-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center">
                          {block.block_order}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {block.pilar_part || block.pilar || 'Block'}
                        </span>
                        <span className="text-[10px] text-gray-300">
                          Base: {block.drill_name || 'none'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                            Custom Drill
                          </label>
                          <input
                            type="text"
                            value={override.drill}
                            onChange={(e) =>
                              updateOverride(block.block_order, 'drill', e.target.value)
                            }
                            placeholder={block.drill_name || 'Same as template'}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                            Custom Mission
                          </label>
                          <input
                            type="text"
                            value={override.mission}
                            onChange={(e) =>
                              updateOverride(block.block_order, 'mission', e.target.value)
                            }
                            placeholder={block.mission || 'Same as template'}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                            Notes
                          </label>
                          <input
                            type="text"
                            value={override.notes}
                            onChange={(e) =>
                              updateOverride(block.block_order, 'notes', e.target.value)
                            }
                            placeholder="Additional notes for this student..."
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2 bg-[var(--tss-gold)] text-white rounded-xl text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Customizations'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
