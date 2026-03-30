'use client';

import { useState, useTransition } from 'react';
import { getStudentWithCascadeContext } from '@/lib/actions/cascade-sessions';
import { BELT_DISPLAY } from '@/lib/constants/belts';
import type { CascadeFormState, StudentCascadeContext } from '@/types/session';
import type { CoachForAssignment } from '@/lib/actions/cascade-sessions';

const BELT_COLORS: Record<string, string> = {
  white_belt: '#E8E8E8',
  yellow_belt: '#F5C518',
  blue_belt: '#1E6FBF',
  purple_belt: '#7B4FBE',
  brown_belt: '#7D4E27',
  black_belt: '#111111',
};

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

interface Props {
  formState: CascadeFormState;
  students: { id: string; first_name: string; last_name: string; belt_level: string; waiver_signed?: boolean }[];
  onStudentLoaded: (student: StudentCascadeContext) => void;
  canAssignCoach: boolean;
  coaches: CoachForAssignment[];
  onCoachAssigned: (coachId: string, coachName: string) => void;
}

export function Step01Student({
  formState,
  students,
  onStudentLoaded,
  canAssignCoach,
  coaches,
  onCoachAssigned,
}: Props) {
  const [selected, setSelected] = useState(formState.student_id ?? '');
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState('');

  function handleSelect(studentId: string) {
    setSelected(studentId);
    setLoadError('');
    startTransition(async () => {
      try {
        const student = await getStudentWithCascadeContext(studentId);
        onStudentLoaded(student);
      } catch (err: any) {
        console.error('Failed to load student context:', err);
        setLoadError(err.message || 'Failed to load student data');
      }
    });
  }

  const loadedStudent = formState.student;

  // Show all students if fewer than 20, otherwise require at least 1 char
  const filteredStudents = (() => {
    if (students.length < 20 && search.length === 0) {
      return students;
    }
    if (search.length === 0) {
      return [];
    }
    const normalizedSearch = normalize(search);
    return students.filter(
      (s) =>
        normalize(s.first_name).includes(normalizedSearch) ||
        normalize(s.last_name).includes(normalizedSearch)
    );
  })();

  // Check waiver status from loaded student context
  const waiverMissing = loadedStudent && !loadedStudent.waiver_signed;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A2E]">Select Student</h3>

      {/* ── Coach Assignment Section ── */}
      {canAssignCoach ? (
        <div className="bg-blue-50 rounded-xl p-3 space-y-1">
          <label className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
            Assign Session Coach
          </label>
          <select
            value={formState.assigned_coach_id ?? ''}
            onChange={(e) => {
              const coach = coaches.find(c => c.id === e.target.value);
              if (coach) onCoachAssigned(coach.id, coach.display_name);
            }}
            className="w-full p-2 rounded-lg border border-blue-200 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          >
            <option value="" disabled>Select a coach...</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name} ({c.role})
              </option>
            ))}
          </select>
        </div>
      ) : (
        formState.assigned_coach_name && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">
              Session Coach: <span className="font-medium text-gray-700">{formState.assigned_coach_name}</span>
            </p>
          </div>
        )
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Type student name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]"
      />

      {students.length >= 20 && search.length === 0 && !loadedStudent && (
        <p className="text-sm text-gray-400 text-center py-4">Type at least 1 letter to search</p>
      )}

      {/* Student list */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filteredStudents.slice(0, 20).map((s) => {
          const belt = BELT_DISPLAY[s.belt_level as keyof typeof BELT_DISPLAY];
          const isSelected = selected === s.id;
          const beltColor = BELT_COLORS[s.belt_level] || '#999';

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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {s.first_name} {s.last_name}
                  </p>
                  {/* Belt color badge */}
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0 border border-gray-300"
                    style={{ backgroundColor: beltColor }}
                    title={belt?.en || s.belt_level}
                  />
                </div>
                <p className="text-xs text-gray-400">{belt?.en || s.belt_level}</p>
              </div>
              {isSelected && (
                <span className="ml-auto text-[#D4A843] text-lg">&#10003;</span>
              )}
            </button>
          );
        })}
        {search.length >= 1 && filteredStudents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No students match &quot;{search}&quot;</p>
        )}
        {filteredStudents.length > 20 && (
          <p className="text-xs text-gray-400 text-center py-2">Showing 20 of {filteredStudents.length} — type more to narrow</p>
        )}
      </div>

      {/* Error display */}
      {loadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-700">Error loading student</p>
          <p className="text-xs text-red-600 mt-1">{loadError}</p>
        </div>
      )}

      {/* Waiver warning — soft, does not block session */}
      {waiverMissing && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-semibold text-amber-700">
            {'\u26A0\uFE0F'} This student has not signed the waiver yet.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            You can continue, but ensure the waiver is signed before the next session.
          </p>
        </div>
      )}

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
              <p className="font-medium">{loadedStudent.ocean_level || '\u2014'}</p>
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
