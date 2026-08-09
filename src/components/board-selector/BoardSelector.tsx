'use client';

// TSS Board Selector — native React port of the standalone HTML tool.
// Pure client-side math: weight/height/skill/conditions → recommended board
// volume, type, dimensions and fin setup. No deps, no backend.

import { useState } from 'react';
import { BELT_HIERARCHY, BELT_DISPLAY } from '@/lib/constants/belts';

const NAVY = '#0A1628';
const CYAN = '#5AC3E7';
const MID = '#C8D0DC';
const SOFT = '#8A95A8';

interface Board {
  name: string; desc: string; length: string; width: string; thick: string;
  fin: string; finDesc: string; alt: string; altDesc: string;
}

const BOARDS: Record<string, Board> = {
  foamie: { name: 'Foamie / Soft-top', desc: 'Maximum flotation and forgiveness. Safe, durable, and ideal for first waves. Wide outline provides exceptional stability for learning pop-up mechanics.', length: '8\'0"–9\'6"', width: '22"–23"', thick: '3.0"–3.25"', fin: 'Single or Thruster (soft fins)', finDesc: 'Soft flexible fins for safety. Single fin for stability.', alt: 'Single Fin', altDesc: 'Simplest setup for learning balance' },
  longboard: { name: 'Longboard', desc: 'Classic surf cruiser. Excellent wave-catching, smooth glide, and nose-riding potential. Ideal for small to medium waves and building fundamental skills.', length: '9\'0"–9\'6"', width: '22.5"–23.5"', thick: '2.75"–3.0"', fin: '2+1 (Single + side bites)', finDesc: 'Center fin for stability, side bites for directional control.', alt: 'Single Fin', altDesc: 'Traditional setup for nose riding' },
  funboard: { name: 'Funboard / Mini-Mal', desc: 'The progression board. Combines longboard paddle power with shorter board maneuverability. Great bridge between beginner and intermediate equipment.', length: '7\'0"–8\'0"', width: '21"–22"', thick: '2.75"–3.0"', fin: 'Thruster (3 fins)', finDesc: 'Most versatile setup for learning turns and speed management.', alt: '2+1 Setup', altDesc: 'More drive and stability if coming from longboard' },
  fish: { name: 'Fish', desc: 'Speed machine for smaller waves. Wide outline and swallow tail generate speed where shortboards struggle. Loose, skatey feel with excellent wave count.', length: '5\'6"–6\'4"', width: '20.5"–21.5"', thick: '2.5"–2.75"', fin: 'Twin Fin or Quad', finDesc: 'Twin for speed and flow. Quad for more hold and drive.', alt: 'Twin Fin', altDesc: 'Pure speed and flow in small surf' },
  hybrid: { name: 'Hybrid', desc: 'Best of both worlds. Shortboard responsiveness with added volume for easier paddling. Performs across a wide range of conditions.', length: '5\'10"–6\'6"', width: '20"–21"', thick: '2.5"–2.63"', fin: 'Thruster or 5-Fin (convertible)', finDesc: 'Thruster for control. Switch to quad on small days.', alt: 'Quad', altDesc: 'Extra speed in softer conditions' },
  shortboard: { name: 'Shortboard', desc: 'High-performance platform for progressive surfing. Tight turns, vertical maneuvers, and responsive rail-to-rail transitions. Requires solid fundamentals.', length: '5\'8"–6\'2"', width: '18.75"–19.5"', thick: '2.38"–2.5"', fin: 'Thruster (3 fins)', finDesc: 'The standard for performance surfing. Balance of drive, hold, and release.', alt: 'Quad', altDesc: 'Alternative for extra speed or bigger surf' },
  performance: { name: 'Performance Shortboard', desc: 'Competition-level equipment. Reduced volume for maximum responsiveness. Every input translates directly to board response. Demands high fitness and skill.', length: '5\'6"–6\'0"', width: '18.25"–19"', thick: '2.25"–2.44"', fin: 'Thruster (3 fins)', finDesc: 'Precision setup. Performance fins with medium-high rake.', alt: 'Quad', altDesc: 'Big wave hold or extra down-the-line speed' },
  gun: { name: 'Step-Up / Gun', desc: 'Built for waves of consequence. Added length for paddle speed into bigger waves. Pin or round tail for maximum hold on steep faces.', length: '6\'4"–8\'0"+', width: '18.5"–19.5"', thick: '2.5"–2.75"', fin: 'Thruster (3 fins)', finDesc: 'Larger fins for hold in powerful waves. Higher rake for drawn-out turns.', alt: 'Quad', altDesc: 'Alternative for speed and early entry in big surf' },
};

const SKILL_FACTORS: Record<string, number> = { beginner: 0.65, novice: 0.55, intermediate: 0.45, advanced: 0.38, expert: 0.35, elite: 0.32 };
const SKILL_BELTS: Record<string, string> = { beginner: 'White', novice: 'Yellow', intermediate: 'Blue', advanced: 'Purple', expert: 'Brown', elite: 'Black' };
// Hex por nombre corto de cinta ('White'…), derivado de la fuente única (belts.ts).
const BELT_HEX: Record<string, string> = Object.fromEntries(
  BELT_HIERARCHY.map((b) => [BELT_DISPLAY[b].en.replace(' Belt', ''), BELT_DISPLAY[b].color]),
);
const WAVE_ADJ: Record<string, number> = { small: 3, medium: 0, overhead: -2, big: -3 };
const FREQ_ADJ: Record<string, number> = { daily: -2, '3-5': -1, '1-2': 1, occasional: 3 };
const AGE_ADJ: Record<string, number> = { under20: -1, '20-35': 0, '35-50': 2, '50+': 3 };
const MAT_ADJ: Record<string, number> = { pu: 0, eps: -2 };

interface Result {
  vol: number; minV: number; maxV: number; board: Board;
  finSize: string; finRange: string; volDown: number; volUp: number; pct: number;
  tips: string[];
}

const card = 'rounded-md p-5';
const cardStyle = { background: 'rgba(13,45,94,.4)', border: '1px solid rgba(90,195,231,.15)' };
const cardTitle = 'text-[10px] tracking-[0.2em] uppercase mb-4';
const fieldLabel = 'block text-[13px] font-medium mb-1.5';
const inputCls = 'w-full rounded text-sm px-3 py-2.5';
const inputStyle = { background: 'rgba(10,22,40,.8)', border: '1px solid rgba(90,195,231,.2)', color: '#fff' };

export default function BoardSelector() {
  const [weight, setWeight] = useState('75');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState('178');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [age, setAge] = useState('20-35');
  const [skill, setSkill] = useState('intermediate');
  const [waves, setWaves] = useState('medium');
  const [freq, setFreq] = useState('3-5');
  const [material, setMaterial] = useState('pu');
  const [result, setResult] = useState<Result | null>(null);

  const getWeightKg = () => {
    const w = parseFloat(weight) || 75;
    return weightUnit === 'lbs' ? w * 0.4536 : w;
  };

  const calculate = () => {
    const wkg = getWeightKg();
    const factor = SKILL_FACTORS[skill] ?? 0.45;
    let vol = wkg * factor + (WAVE_ADJ[waves] || 0) + (FREQ_ADJ[freq] || 0) + (AGE_ADJ[age] || 0) + (MAT_ADJ[material] || 0);
    vol = Math.max(18, Math.round(vol * 10) / 10);
    const minV = Math.round(vol * 0.9 * 10) / 10;
    const maxV = Math.round(vol * 1.1 * 10) / 10;

    let board: Board;
    if (skill === 'beginner') board = vol > 55 ? BOARDS.foamie : BOARDS.longboard;
    else if (skill === 'novice') board = vol > 45 ? BOARDS.longboard : BOARDS.funboard;
    else if (skill === 'intermediate') board = waves === 'small' ? BOARDS.fish : vol > 40 ? BOARDS.funboard : BOARDS.hybrid;
    else if (skill === 'advanced') board = BOARDS.shortboard;
    else if (skill === 'expert') board = BOARDS.performance;
    else board = waves === 'big' ? BOARDS.gun : BOARDS.performance;
    if (waves === 'big' && (skill === 'advanced' || skill === 'expert' || skill === 'elite')) board = BOARDS.gun;

    let finSize, finRange;
    if (wkg < 55) { finSize = 'XS'; finRange = '< 55 kg / < 120 lbs'; }
    else if (wkg < 70) { finSize = 'S'; finRange = '55–70 kg / 120–155 lbs'; }
    else if (wkg < 85) { finSize = 'M'; finRange = '70–85 kg / 155–185 lbs'; }
    else if (wkg < 95) { finSize = 'L'; finRange = '85–95 kg / 185–210 lbs'; }
    else { finSize = 'XL'; finRange = '95+ kg / 210+ lbs'; }

    const belt = SKILL_BELTS[skill];
    const tips: string[] = [];
    tips.push(`Your TSS belt level: <strong style="color:${BELT_HEX[belt]}">${belt} Belt</strong> (${skill.charAt(0).toUpperCase() + skill.slice(1)})`);
    tips.push(`Base formula: ${wkg.toFixed(1)} kg × ${factor} = ${Math.round(wkg * factor * 10) / 10}L (before adjustments)`);
    if (waves === 'small') tips.push('Small wave adjustment: +3L for extra paddle power and wave count');
    if (waves === 'big') tips.push('Big wave adjustment: −3L for duck diving and steep drops');
    if (freq === 'occasional') tips.push('Occasional surfer: +3L — extra volume compensates for less paddle fitness');
    if (freq === 'daily') tips.push('Daily surfer: −2L — your fitness allows a tighter, more responsive board');
    if (age === '50+') tips.push('Age 50+: +3L — extra float reduces paddle fatigue and keeps wave count high');
    if (age === '35-50') tips.push('Age 35-50: +2L — slight volume bump for comfort without sacrificing performance');
    if (material === 'eps') tips.push('EPS/Epoxy construction: −2L — epoxy boards have more inherent buoyancy');
    tips.push('Consider having a <strong style="color:' + CYAN + '">quiver</strong>: one board for small days (+5L), one daily driver, one step-up for bigger surf');

    const pct = Math.min(100, Math.max(0, ((vol - 15) / (90 - 15)) * 100));
    setResult({ vol, minV, maxV, board, finSize, finRange, volDown: Math.round((vol - 5) * 10) / 10, volUp: Math.round((vol + 5) * 10) / 10, pct, tips });
  };

  const reset = () => {
    setWeight('75'); setWeightUnit('kg'); setHeight('178'); setHeightUnit('cm');
    setFeet('5'); setInches('10'); setAge('20-35'); setSkill('intermediate');
    setWaves('medium'); setFreq('3-5'); setMaterial('pu'); setResult(null);
  };

  return (
    <div style={{ background: NAVY, color: '#fff', minHeight: '100%', fontFamily: 'var(--font-body, DM Sans), sans-serif' }} className="overflow-y-auto">
      <div className="max-w-3xl mx-auto px-5 pt-6 pb-16">
        {/* Header with TSS logo */}
        <div className="text-center pb-6 mb-8" style={{ borderBottom: '1px solid rgba(90,195,231,.12)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" className="h-8 w-auto mx-auto mb-4" />
          <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>
            Equipment System
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading), serif' }}>Board Selector</h1>
          <p className="text-sm mt-2" style={{ color: MID }}>Find your ideal surfboard volume, type, dimensions, and fin setup.</p>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className={card} style={cardStyle}>
            <div className={cardTitle} style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Biometrics</div>
            <div className="mb-4">
              <label className={fieldLabel} style={{ color: MID }}>Weight</label>
              <div className="flex gap-2">
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} style={inputStyle} />
                <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className={inputCls} style={{ ...inputStyle, flex: '0 0 80px' }}>
                  <option value="kg">kg</option><option value="lbs">lbs</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className={fieldLabel} style={{ color: MID }}>Height</label>
              <div className="flex gap-2">
                {heightUnit === 'cm' ? (
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} style={inputStyle} />
                ) : (
                  <div className="flex gap-2 flex-1">
                    <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} placeholder="ft" className={inputCls} style={inputStyle} />
                    <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} placeholder="in" className={inputCls} style={inputStyle} />
                  </div>
                )}
                <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)} className={inputCls} style={{ ...inputStyle, flex: '0 0 80px' }}>
                  <option value="cm">cm</option><option value="ft">ft/in</option>
                </select>
              </div>
            </div>
            <div>
              <label className={fieldLabel} style={{ color: MID }}>Age Range</label>
              <select value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="under20">Under 20</option><option value="20-35">20–35</option>
                <option value="35-50">35–50</option><option value="50+">50+</option>
              </select>
            </div>
          </div>

          <div className={card} style={cardStyle}>
            <div className={cardTitle} style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Skill &amp; Conditions</div>
            <div className="mb-4">
              <label className={fieldLabel} style={{ color: MID }}>Surf Level (TSS Belt)</label>
              <select value={skill} onChange={(e) => setSkill(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="beginner">White Belt — Beginner</option>
                <option value="novice">Yellow Belt — Novice</option>
                <option value="intermediate">Blue Belt — Intermediate</option>
                <option value="advanced">Purple Belt — Advanced</option>
                <option value="expert">Brown Belt — Expert</option>
                <option value="elite">Black Belt — Elite</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={fieldLabel} style={{ color: MID }}>Primary Wave Conditions</label>
              <select value={waves} onChange={(e) => setWaves(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="small">Small &amp; Mushy (1–3 ft)</option>
                <option value="medium">Medium (3–5 ft)</option>
                <option value="overhead">Overhead (5–8 ft)</option>
                <option value="big">Big (8+ ft)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={fieldLabel} style={{ color: MID }}>Surf Frequency</label>
              <select value={freq} onChange={(e) => setFreq(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="daily">Daily</option><option value="3-5">3–5x / week</option>
                <option value="1-2">1–2x / week</option><option value="occasional">Occasional / Trips</option>
              </select>
            </div>
            <div>
              <label className={fieldLabel} style={{ color: MID }}>Board Construction</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="pu">PU / Polyester (traditional)</option>
                <option value="eps">EPS / Epoxy (lighter, more float)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center my-8">
          <button onClick={calculate} className="px-8 py-3.5 rounded font-semibold text-sm" style={{ background: CYAN, color: NAVY }}>
            Calculate My Board
          </button>
          <button onClick={reset} className="px-8 py-3.5 rounded font-semibold text-sm" style={{ background: 'transparent', border: '1px solid rgba(200,208,220,.3)', color: MID }}>
            Reset
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5">
            <div className={card} style={{ ...cardStyle, textAlign: 'center', padding: '36px 20px' }}>
              <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Recommended Volume</span>
              <div className="my-3">
                <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 'clamp(56px,12vw,84px)', color: CYAN, fontWeight: 500 }}>{result.vol}</span>
                <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 22, color: CYAN, opacity: 0.7 }}>L</span>
              </div>
              <p className="text-sm" style={{ color: MID }}>Ideal range: <strong style={{ color: CYAN }}>{result.minV}L – {result.maxV}L</strong></p>
              <div className="relative h-2 rounded-full my-5 mx-auto" style={{ maxWidth: 500, background: 'rgba(90,195,231,.1)' }}>
                <div className="h-full rounded-full" style={{ width: `${result.pct}%`, background: `linear-gradient(90deg,${CYAN},#06D6A0)` }} />
                <div className="absolute" style={{ top: -6, left: `${result.pct}%`, width: 2, height: 20, background: '#fff' }} />
              </div>
              <div className="flex justify-between mx-auto" style={{ maxWidth: 500, fontFamily: 'var(--font-mono), monospace', fontSize: 9, color: SOFT }}>
                <span>15L</span><span>30L</span><span>45L</span><span>60L</span><span>80L+</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className={card} style={cardStyle}>
                <div className={cardTitle} style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Recommended Board</div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading), serif' }}>{result.board.name}</h2>
                <p className="text-sm mb-5" style={{ color: MID, lineHeight: 1.7 }}>{result.board.desc}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[['Length', result.board.length], ['Width', result.board.width], ['Thickness', result.board.thick]].map(([h, v]) => (
                    <div key={h} className="rounded-md p-3" style={{ background: 'rgba(13,45,94,.3)', border: '1px solid rgba(90,195,231,.12)' }}>
                      <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>{h}</div>
                      <div className="text-lg font-semibold">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={card} style={cardStyle}>
                <div className={cardTitle} style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Fin Setup</div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading), serif' }}>{result.board.fin}</h2>
                <p className="text-sm mb-5" style={{ color: MID, lineHeight: 1.7 }}>{result.board.finDesc}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md p-3" style={{ background: 'rgba(13,45,94,.3)', border: '1px solid rgba(90,195,231,.12)' }}>
                    <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Fin Size</div>
                    <div className="text-lg font-semibold">{result.finSize}</div>
                    <div className="text-xs mt-1" style={{ color: MID }}>{result.finRange}</div>
                  </div>
                  <div className="rounded-md p-3" style={{ background: 'rgba(13,45,94,.3)', border: '1px solid rgba(90,195,231,.12)' }}>
                    <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Alternative</div>
                    <div className="text-lg font-semibold">{result.board.alt}</div>
                    <div className="text-xs mt-1" style={{ color: MID }}>{result.board.altDesc}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={card} style={cardStyle}>
              <div className={cardTitle} style={{ color: CYAN, fontFamily: 'var(--font-mono), monospace' }}>Personalized Tips</div>
              <div className="space-y-2">
                {result.tips.map((t, i) => (
                  <div key={i} className="text-[13px] px-3.5 py-2.5" style={{ color: MID, lineHeight: 1.6, background: 'rgba(90,195,231,.04)', borderLeft: '2px solid rgba(90,195,231,.3)' }} dangerouslySetInnerHTML={{ __html: t }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
