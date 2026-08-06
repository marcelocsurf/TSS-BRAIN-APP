# Handoff: The Surf Sequence® Brand System

## Overview
Complete brand-implementation package for The Surf Sequence® (TSS) — a licensed surf
education methodology. It lets Claude Code (or any developer) build websites, apps
(TSS Brain, TSS High Performance), decks, and collateral that follow the official
Brand Manual v10.0 without reverse-engineering it.

## About the design files
`brand-manual/The Surf Sequence Brand Manual.html` is a **self-contained reference
document** (open in any browser, works offline). It is the source of truth for rules
AND the reference implementation of the visual system — its own layout demonstrates
every pattern. It is not production code to copy verbatim; recreate patterns in your
target stack using the tokens.

## Fidelity
High-fidelity. Colors, type specs, spacing scale and component patterns are final
(Brand Manual v10.0, adopted palette). Implement pixel-faithfully from tokens.

## How to use with Claude Code
1. Copy this folder into your repo (e.g. `/brand`).
2. Move/merge `CLAUDE.md` into your repo root (or reference it from your existing one).
3. Import `tokens/tss-tokens.css` globally; read `tokens/tss-tokens.json` for JS/native.
4. Use logo files from `assets/` as-is. Never redraw the mark.
5. Point Claude Code at the manual for any judgment call: it demonstrates every rule.

## Contents
- `CLAUDE.md` — operating rules for Claude Code (drop in repo root)
- `tokens/tss-tokens.css` — CSS custom properties (color, type, Fibonacci scales)
- `tokens/tss-tokens.json` — same data machine-readable + logo/naming/voice rules
- `assets/` — official logo files (cyan/white/ink marks, lockups) + brand photos
- `brand-manual/The Surf Sequence Brand Manual.html` — full manual, standalone

## Design tokens (summary)
Colors: cyan #00D2FF (official) · ink #061C2B · paper #F7F9FA · grey #55666E · sand #E9E2D2 (physical only)
Type: Archivo (display expanded / body) · IBM Plex Mono (labels) · Lora Italic (tagline only)
Scale: Fibonacci 5/8/13/21/34/55/89/144 for ALL spacing + type sizes
Full details in tokens files and CLAUDE.md.

## Assets provenance
Logo PNGs derived from the official master logo supplied by the founder. Photos are
brand-owned (founder, Puro Surf academy). App icons for TSS Brain / TSS High
Performance are specified in manual §3.10 (composed from the mark; no separate files).
