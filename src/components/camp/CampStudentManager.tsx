'use client';

import { useState, useEffect } from 'react';
import { listStudents, type StudentRow } from '@/lib/actions/students';
import { addStudentToCamp, removeStudentFromCamp } from '@/lib/actions/camps';
import { BELT_DISPLAY } from '@/lib/constants/belts';

interface Props {
  campInstanceId: string;
  currentParticipantIds: string[];
}

export function CampStudentManager({ campInstanceId, currentParticipantIds }: Props) {
  const [showManager, setShowManager] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (showManager && students.length === 0) {
      listStudents({ status: 'active', limit: 100 }).then(res => setStudents(res.students));
    }
  }, [showManager, students.length]);

  const handleAdd = async (studentId: string) => {
    setActionId(studentId);
    try {
      await addStudentToCamp(campInstanceId, studentId);
    } catch (err: any) {
      alert(err.message);
    }
    setActionId(null);
  };

  const handleRemove = async (studentId: string) => {
    if (!confirm('Remove this student from the camp?')) return;
    setActionId(studentId);
    try {
      await removeStudentFromCamp(campInstanceId, studentId);
    } catch (err: any) {
      alert(err.message);
    }
    setActionId(null);
  };

  const availableStudents = students.filter(s => !currentParticipantIds.includes(s.id));

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        type="button"
        onClick={() => setShowManager(!showManager)}
        className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90"
      >
        {showManager ? 'Close' : 'Manage Students'}
      </button>

      {showManager && (
        <div className="mt-3 space-y-3">
          {/* Remove existing */}
          {currentParticipantIds.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Remove from camp</p>
              <div className="flex flex-wrap gap-1">
                {currentParticipantIds.map(pid => {
                  const s = students.find(st => st.id === pid);
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => handleRemove(pid)}
                      disabled={actionId === pid}
                      className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full hover:bg-red-100 disabled:opacity-50"
                    >
                      {s ? `${s.first_name} ${s.last_name}` : pid.slice(0, 8)} &times;
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add new */}
          {availableStudents.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Add to camp</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {availableStudents.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAdd(s.id)}
                    disabled={actionId === s.id}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-green-50 text-left transition-colors disabled:opacity-50"
                  >
                    <div
                      className="w-5 h-5 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: BELT_DISPLAY[s.belt_level]?.color || '#999' }}
                    >
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <span className="text-xs text-gray-700 flex-1">{s.first_name} {s.last_name}</span>
                    <span className="text-[10px] text-green-600">+ Add</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
