'use client';

// Reusable STP → drill + mission picker with custom fallback.
//
// Used by the camp-template builder and (in a follow-up) by the coach
// SessionPlanner so both screens speak the same language: pick a step
// from the sequence, then pick a canonical drill + mission for it, or
// write your own.

import { useState } from 'react';
import type { CatalogStp, CatalogDrill } from '@/lib/actions/template-catalog';

export interface StepBlockValue {
  step_id: string | null;
  drill_id: string | null;
  drill_custom: string | null;
  mission_id: string | null;
  mission_custom: string | null;
}

interface Props {
  value: StepBlockValue;
  stps: CatalogStp[];
  drills: CatalogDrill[];     // type='drill' (out-of-water)
  missions: CatalogDrill[];   // type='mission' (in-water)
  onChange: (patch: Partial<StepBlockValue>) => void;
  /** Which slots to render below the STP picker. Default 'both'. */
  slots?: 'both' | 'drill_only' | 'mission_only';
}

export function StepDrillPicker({ value, stps, drills, missions, onChange, slots = 'both' }: Props) {
  const showDrill = slots === 'both' || slots === 'drill_only';
  const showMission = slots === 'both' || slots === 'mission_only';
  const stepDrills = drills.filter((d) => d.step_id === value.step_id);
  const stepMissions = missions.filter((d) => d.step_id === value.step_id);
  const drillLabel = value.drill_id
    ? drills.find((d) => d.id === value.drill_id)?.title
    : null;
  const missionLabel = value.mission_id
    ? missions.find((d) => d.id === value.mission_id)?.title
    : null;

  const [showDrillPicker, setShowDrillPicker] = useState(false);
  const [showMissionPicker, setShowMissionPicker] = useState(false);

  return (
    <div className="space-y-2">
      {/* STP picker */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
          Sequence step (STP)
        </label>
        <select
          value={value.step_id ?? ''}
          onChange={(e) => {
            const newStep = e.target.value || null;
            // Changing STP clears the canonical drill+mission (they
            // belonged to the old step). Custom write-ins are kept.
            onChange({
              step_id: newStep,
              drill_id: null,
              mission_id: null,
            });
          }}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
        >
          <option value="">— pick a step —</option>
          {stps.map((stp) => (
            <option key={stp.id} value={stp.id}>
              {stp.id} · {stp.title}
            </option>
          ))}
        </select>
      </div>

      {/* Drill picker (only if STP is picked) */}
      {value.step_id && showDrill && (
        <CatalogSlot
          label="Drill (out-of-water)"
          options={stepDrills}
          selectedId={value.drill_id}
          selectedLabel={drillLabel}
          customText={value.drill_custom}
          open={showDrillPicker}
          setOpen={setShowDrillPicker}
          onPickCanon={(id) => onChange({ drill_id: id, drill_custom: null })}
          onPickCustom={(text) => onChange({ drill_custom: text, drill_id: null })}
          emptyMessage="No canonical drills for this STP — write your own below."
          customPlaceholder="Or write your own drill"
        />
      )}

      {/* Mission picker (only if STP is picked) */}
      {value.step_id && showMission && (
        <CatalogSlot
          label="Mission (in-water)"
          options={stepMissions}
          selectedId={value.mission_id}
          selectedLabel={missionLabel}
          customText={value.mission_custom}
          open={showMissionPicker}
          setOpen={setShowMissionPicker}
          onPickCanon={(id) => onChange({ mission_id: id, mission_custom: null })}
          onPickCustom={(text) => onChange({ mission_custom: text, mission_id: null })}
          emptyMessage="No canonical missions for this STP — write your own below."
          customPlaceholder="Or write your own mission"
        />
      )}
    </div>
  );
}

// Shared catalog slot — used for both drill and mission. Includes a
// search box that appears when 5+ options exist, so the admin can
// type to filter instead of scrolling.
function CatalogSlot({
  label,
  options,
  selectedId,
  selectedLabel,
  customText,
  open,
  setOpen,
  onPickCanon,
  onPickCustom,
  emptyMessage,
  customPlaceholder,
}: {
  label: string;
  options: CatalogDrill[];
  selectedId: string | null;
  selectedLabel: string | null | undefined;
  customText: string | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  onPickCanon: (id: string) => void;
  onPickCustom: (text: string) => void;
  emptyMessage: string;
  customPlaceholder: string;
}) {
  const [search, setSearch] = useState('');
  const filtered = search.trim()
    ? options.filter((d) => {
        const s = search.toLowerCase();
        return (
          d.title.toLowerCase().includes(s) ||
          d.id.toLowerCase().includes(s) ||
          (d.key_words ?? []).some((k) => k.toLowerCase().includes(s))
        );
      })
    : options;

  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </label>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-left px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-50"
        >
          {selectedLabel || customText || (
            <span className="text-gray-400 italic">— tap to pick or write —</span>
          )}
        </button>
      ) : (
        <div className="space-y-1.5 bg-white p-2 rounded-lg border border-gray-200">
          {options.length >= 5 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${options.length} options…`}
              autoFocus
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px]"
            />
          )}
          {filtered.length > 0 ? (
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onPickCanon(d.id);
                    setSearch('');
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-gray-50"
                >
                  <strong>{d.id}</strong> · {d.title}
                  {d.key_words && d.key_words.length > 0 && (
                    <span className="text-gray-400">
                      {' · '}
                      {d.key_words.slice(0, 3).join(' · ')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : options.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic px-1">{emptyMessage}</p>
          ) : (
            <p className="text-[10px] text-gray-400 italic px-1">
              No matches for &ldquo;{search}&rdquo;
            </p>
          )}
          <CustomInput
            value={customText}
            placeholder={customPlaceholder}
            onCommit={(v) => {
              onPickCustom(v);
              setSearch('');
              setOpen(false);
            }}
          />
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setOpen(false);
            }}
            className="text-[10px] text-gray-500 hover:text-gray-700"
          >
            cancel
          </button>
        </div>
      )}
    </div>
  );
}

function CustomInput({
  value,
  placeholder,
  onCommit,
}: {
  value: string | null;
  placeholder: string;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value ?? '');
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => local.trim() && local !== (value ?? '') && onCommit(local.trim())}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px]"
    />
  );
}
