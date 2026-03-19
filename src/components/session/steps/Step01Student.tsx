'use client';

import { useState, useTransition } from 'react';
import { getStudentWithCascadeContext } from '@/lib/actions/cascade-sessions';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import type { CascadeFormState, StudentCascadeContext } from '@/types/session';

interface Props {
  formState: CascadeFormState;
  students: { id: string; first_name: string; last_name: string; belt_level: string }[];
  onStudentLoaded: (student: StudentCascadeContext) => void;
}

export function Step01Student({ formState, students, onStudentLoaded }: Props) {
  const [selected, setSelected] = useState(formState.student_id ?? '');
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');

  function handleSelect(studentId: string) {
    setSelected(studentId);
    startTransition(async () => {
      const student = await getStudentWithCascadeContext(studentId);
      onStudentLoaded(student);
    });
  }

  const loadedStudent = formState.student;

  const filteredStudents = search.length >= 2
    ? students.filter(
        (s) =>
          s.first_name.toLowerCase().includes(search.toLowerCase()) ||
          s.last_name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Select Student</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Type student name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]"
      />

      {search.length < 2 && !loadedStudent && (
        <p className="text-sm text-gray-400 text-center py-4">Type at least 2 letters to search</p>
      )}

      {/* Student list */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filteredStudents.slice(0, 20).map((s) => {
          const belt = BELT_DISPLAY[s.belt_level as keyof typeof BELT_DISPLAY];
          const isSelected = selected === s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s.id)}
              disabled={isPending}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'border-[#D4A843] bg-amber-50'
                  : 'border-gray-100 hover:border-gray-200'
              } ${isPending ? 'opacity-50' : ''}`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: belt?.color || '#999' }}
              >
                {s.first_name[0]}{s.last_name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {s.first_name} {s.last_name}
                </p>
                <p className="text-xs text-gray-400">{belt?.en || s.belt_level}</p>
              </div>
              {isSelected && (
                <span className="ml-auto text-[#D4A843] text-lg">&#10003;</span>
              )}
            </button>
          );
        })}
        {search.length >= 2 && filteredStudents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No students match "{search}"</p>
        )}
        {filteredStudents.length > 20 && (
          <p className="text-xs text-gray-400 text-center py-2">Showing 20 of {filteredStudents.length} — type more to narrow</p>
        )}
      </div>

      {/* Auto-loaded context */}
      {loadedStudent && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Auto-loaded</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Belt</span>
              <p className="font-medium">{BELT_DISPLAY[loadedStudent.belt_level]?.en}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Ocean Level</span>
              <p className="font-medium">{loadedStudent.ocean_level || '—'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Sequence</span>
              <p className="font-medium">#{loadedStudent.current_sequence_number}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Last Session</span>
              <p className="font-medium">
                {loadedStudent.last_session_date
                  ? new Date(loadedStudent.last_session_date).toLocaleDateString()
                  : 'None'}
              </p>
            </div>
          </div>

          {/* Medical alerts */}
          {(loadedStudent.allergies || loadedStudent.injuries || loadedStudent.risk_notes) && (
            <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs font-semibold text-red-600 mb-1">Medical Alerts</p>
              {loadedStudent.allergies && (
                <p className="text-xs text-red-700">Allergies: {loadedStudent.allergies}</p>
              )}
              {loadedStudent.injuries && (
                <p className="text-xs text-red-700">Injuries: {loadedStudent.injuries}</p>
              )}
              {loadedStudent.risk_notes && (
                <p className="text-xs text-red-700">Risk: {loadedStudent.risk_notes}</p>
              )}
            </div>
          )}

          {/* Last homework reference */}
          {loadedStudent.last_homework && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs font-semibold text-amber-700">Last Homework</p>
              <p className="text-xs text-amber-800">{loadedStudent.last_homework}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
