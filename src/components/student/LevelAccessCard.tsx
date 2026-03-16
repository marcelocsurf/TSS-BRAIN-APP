'use client';

import { useState, useTransition } from 'react';
import { grantLevelAccess, revokeLevelAccess } from '@/lib/actions/access';
import { BELT_DISPLAY, BELT_HIERARCHY } from '@/lib/constants/belts';

export function LevelAccessCard({
  studentId,
  unlockedKeys,
}: {
  studentId: string;
  unlockedKeys: string[];
}) {
  const unlocked = new Set(unlockedKeys);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Level Access</h3>
      </div>
      <div className="px-4 py-3 space-y-1">
        {BELT_HIERARCHY.map((beltKey) => {
          const display = BELT_DISPLAY[beltKey];
          const isUnlocked = unlocked.has(beltKey);
          return (
            <div key={beltKey} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: display.color }}
                />
                <span className="text-sm text-gray-700">{display.en}</span>
                <span className="text-xs text-gray-400">{display.levelName}</span>
              </div>
              <GrantButton
                studentId={studentId}
                levelKey={beltKey}
                isUnlocked={isUnlocked}
              />
            </div>
          );
        })}
        <p className="text-xs text-gray-400 pt-3 border-t border-gray-50 mt-2">
          Unlocked levels appear in the student portal library.
        </p>
      </div>
    </div>
  );
}

function GrantButton({
  studentId,
  levelKey,
  isUnlocked: initialUnlocked,
}: {
  studentId: string;
  levelKey: string;
  isUnlocked: boolean;
}) {
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [pending, startTransition] = useTransition();

  const handleGrant = () => {
    startTransition(async () => {
      await grantLevelAccess({ student_id: studentId, level_key: levelKey });
      setUnlocked(true);
    });
  };

  const handleRevoke = () => {
    startTransition(async () => {
      await revokeLevelAccess({ student_id: studentId, level_key: levelKey });
      setUnlocked(false);
    });
  };

  if (unlocked) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-600 font-medium">Unlocked</span>
        <button
          onClick={handleRevoke}
          disabled={pending}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 disabled:opacity-50"
        >
          {pending ? '...' : 'Revoke'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleGrant}
      disabled={pending}
      className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? '...' : 'Grant'}
    </button>
  );
}
