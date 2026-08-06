# CLAUDE.md — The Surf Sequence® Brand System

You are building for **The Surf Sequence®** (internal: TSS). This file is the operating
summary of the official Brand Manual v10.0. The full manual is in `brand-manual/`
(open `The Surf Sequence Brand Manual.html` in a browser). Machine-readable values
live in `tokens/tss-tokens.css` and `tokens/tss-tokens.json` — ALWAYS import/read
tokens instead of hardcoding values.

## Essence (why the design looks the way it does)
The brand is the productive tension between the chaotic ocean and the mathematical
precision of a system. "The ocean has no manual. The Surf Sequence does."
The Fibonacci spiral logo is a declaration, not decoration — so the ENTIRE system
runs on Fibonacci numbers (5 8 13 21 34 55 89 144): all spacing, all type sizes.
Everything you build must feel: rigorous, credible, belonging-worthy, forward-moving.

## Hard rules (non-negotiable)
1. **Color**: Sequence Cyan `#00D2FF` is the ONLY official color (it is the trademark).
   Supports: navy ink `#061C2B`, paper `#F7F9FA`, tide grey `#55666E`, sand `#E9E2D2`.
   Ratio ≈ 60% paper / 25% ink / 10% cyan / 5% grey. Cyan = precise accent or one big
   scale moment — never wallpaper. Sand is for PHYSICAL goods only, never screens.
   No gradients. Pop colors (`--tss-pop-*`) = UI status feedback only. Belt colors = level
   identity only. Neither ever appears in marketing or branding surfaces.
2. **Type**: Archivo (display: expanded 118–125% stretch, 700–900, UPPERCASE, -2% tracking;
   body: 400–700 sentence case) + IBM Plex Mono (labels/data: UPPERCASE, +18–22% tracking).
   Lora Italic ONLY for the tagline "Evolve through play" (always italic, sentence case).
   Biennale = wordmark artwork only; never load it as a font.
   Type sizes come from the Fibonacci scale: 13/21/34/55/89/144. No intermediate sizes.
3. **Spacing**: Fibonacci only — 5/8/13/21/34/55/89/144. Section padding: 89px desktop.
   Hairline borders: `rgba(14,32,41,0.16)` on light, `rgba(247,249,250,0.16)` on dark.
   Corners are square (radius 0) except app icon tiles (34px) — the system is rectilinear.
4. **Logo**: use ONLY the files in `assets/` (cyan/white/ink marks + lockups). Never
   recreate, stretch, flip, rotate, recolor, or shadow the mark. Clear space = 1× spiral
   unit. Min sizes: 24px digital mark, 4cm printed full logo.
5. **Naming**: public copy says "The Surf Sequence" — never bare "TSS" externally.
   TSS is allowed internally and in: TSS Brain, TSS High Performance, TSS Certified Coach.
6. **Voice**: expert not elite, precise not cold, playful not casual. Say Mission/Session/
   Level/Belt/Coach/Methodology. Never "surf school", never "stoke/shred", never overpromise.

## Signature visual patterns (reuse these)
- **Section header rail**: mono label (number, e.g. "3.4") + UPPERCASE Archivo Expanded
  title + right-aligned mono annotation, all on one baseline over a 2px ink rule.
- **Spec rows**: data presented as hairline-separated rows (grid with mono index column),
  not cards. Tables read like technical documentation.
- **Chapter dividers**: full-bleed ink sections, giant outlined chapter numeral
  (`-webkit-text-stroke` cyan at low opacity) top-right, content bottom-left.
- **Blueprint grid**: on ink surfaces, optional Fibonacci grid overlay
  (`linear-gradient` 1px lines, rgba(0,210,255,0.05–0.10), 34–89px cells).
- **Crop marks / registration corners** on presentation plates (13px L-corners).
- **Stat blocks**: huge outlined or cyan Archivo numerals over mono uppercase captions.
- Emoji: never. Icons: quarter-arc geometry only (see manual §3.6), one color, stroked.

## Doctrine vocabulary (spell these exactly)
The Surf Sequence® · Evolve through play · TSS Brain · TSS High Performance ·
Three Circles of Power (→ FLOW) · P·R·C·H (Posture/Rotation/Compression/Hold) ·
Belt system: White→Yellow→Blue→Purple→Brown→Black · Learning Blocks 00–07 ·
The Infinite Circle · EDPF (Explain/Demonstrate/Practice/Feedback) · IPM ·
Compartiendo Olas · Puro Surf · Enkrateia SA de CV (IP owner).
Named expressions (Cruz Snap, Tapaloco, Grenade…) are constitutional: never rename/translate.

## Fonts (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=IBM+Plex+Mono:wght@400;500&family=Lora:ital,wght@1,400;1,500&display=swap" rel="stylesheet">
```
CSS for display type: `font-family:'Archivo'; font-stretch:125%; font-weight:850;
text-transform:uppercase; letter-spacing:-0.02em; line-height:0.95;`

## When unsure
Open the manual and copy what it does — the manual itself is built with these exact
rules and is the reference implementation. Prefer whitespace and hairlines over boxes,
mono labels over icons, one cyan accent over many colors.
