# CLAUDE.md — The Surf Sequence® Brand System (Manual v10.1)

You are building for **The Surf Sequence®**. This file is the operating summary of the
official Brand Manual v10.1 (2026-09-15). The full manual is in `brand-manual/` — open
it in a browser. Machine-readable values are in `tokens/tss-tokens.css` and
`tokens/tss-tokens.json`. **Always read tokens; never hardcode a brand value.**

## Essence — why it looks this way
The brand is the productive tension between the chaotic ocean and the mathematical
precision of a system. **"The ocean has no manual. The Surf Sequence does."**
The Fibonacci spiral in the logo is a declaration, not decoration — so the whole system
runs on Fibonacci numbers (5 8 13 21 34 55 89 144): every spacing value, every type size.
What you build must feel rigorous, credible, belonging-worthy, and forward-moving.

**Mission** — "Make surfing a sport you can learn — one sequence, one game, one belt at a
time; accessible to anyone willing to put in time and effort."
**Vision** — "Be for surfing what PADI is for diving — the standard."
**Tagline** — *Evolve through play* (Lora Italic, always italic, sentence case, nothing else).

## Hard rules

**1 · Colour.** Sequence Cyan `#00D2FF` is the ONLY official colour — it is the trademark.
Supports: ink `#061C2B`, paper `#F7F9FA`, tide grey `#55666E`, sand `#E9E2D2`.
No gradients, ever. Cyan is a precise accent or one big scale moment — never wallpaper.

**Two surface modes.** Document mode (dashboards, records, intake, email, decks, print):
paper 60 / ink 25 / cyan 10 / grey 5. Portal mode (Course, sequence pages, Let's Play,
Home): ink ground `#061C2B`, Sand cards, Paper inner surfaces, cyan accent, white bottom
nav. Sand **is** used on screen — it is the card surface. Anything else inverting the
ratio is drift, not a third mode.

**Four separate colour families. Never cross-map them:**
- *Command notation* (`--tss-cmd-*`, saturated) — drawing a sequence line. Technical, never branding.
- *Three Circles* (`--tss-circle-*`) — Body cyan, Board #FFDC33, Wave #BA69EE.
- *Foot positions* (`--tss-foot-*`, pastels) — live inside the board figure only.
- *Belts* and *pop* — progression identity and UI status. Never marketing.

**2 · Type.** Archivo for display (expanded 118–125% stretch, 700–900, UPPERCASE, -0.02em
tracking) and body (400–700, sentence case). IBM Plex Mono for labels, data, codes, specs
(UPPERCASE, +0.18–0.22em). Lora Italic for the tagline only. Sizes come from the Fibonacci
scale — 13 / 21 / 34 / 55 / 89 / 144 — no intermediate values. On screen: title 36px,
subtitle 17px, section 23px, body 14–16px, labels 12px. Reading headings never become
full uppercase paragraphs.

**3 · Spacing & geometry.** Fibonacci only. Section padding 89px desktop. Hairline borders,
not boxes. Print and editorial are square (radius 0); the digital product uses 8px cards /
5px controls; app icon tiles 34px. Touch targets ≥44px, primary action ≥48px.
Mobile reference 390px, max content 480px, 16px gutters (12px under 360px), 72px bottom nav.

**4 · Logo.** Use ONLY the files in `assets/`. Never recreate, stretch, flip, rotate,
recolour, shadow, or box the mark. No square/badge logo versions — the rounded app tile is
an OS container, not a logo. Clear space = 1× the spiral's smallest square. Minimum: 24px
digital mark, 4cm printed full logo. Fixed figure rasters (board map, force icons) are never
redrawn, recoloured, or scaled above native size.

**5 · Naming.** Public copy always says "The Surf Sequence". Never bare "TSS" in
student-facing text. TSS is allowed internally and in: TSS Brain, TSS High Performance,
TSS Certified Coach, the ® badge on physical goods.

**6 · Voice — English everywhere**, student-facing and internal alike. Direct. Second person.
Verbs first ("Connect through your feet"). No marketing adjectives — nothing is amazing,
ultimate, revolutionary or world-class. Doctrine words stay exact. Never "surf school",
never "stoke/shred/hang ten", never overpromise. Emoji: never.

## How the method works (so your copy and UI don't contradict it)
Skill self-organises between surfer and ocean — the method is ecological, not prescriptive.
A **drill** is ONE constraint. A **mission** is ONE execution on a real wave. A **game** is
variability. The **criteria** are what the surfer learns to notice. The **coach confirms in
the water** — no level is granted from land work.

A **sequence** is the unit of teaching, and it moves through four moments:
**Think it** (understand) → **Feel it** (rehearse on land) → **Do it** (the mission, one
execution, no counting) → **Review** (indicators, common mistakes, how it felt).
The plan is not graded. Opening a card, rehearsing, or changing a foot position must never
mark a lesson complete or record progress. The execution and the two-way review ARE recorded.

## Signature visual patterns — reuse these
- **Section header rail**: mono number ("3.4") + UPPERCASE Archivo Expanded title +
  right-aligned mono annotation, on one baseline over a 2px ink rule.
- **Spec rows**: hairline-separated grid rows with a mono index column — not cards.
  Data reads like technical documentation.
- **Chapter dividers**: full-bleed ink, giant outlined numeral (`-webkit-text-stroke` cyan
  at low alpha) top-right, content bottom-left.
- **Blueprint grid**: on ink surfaces, optional Fibonacci grid overlay (1px cyan lines at
  0.05–0.10 alpha, 34–89px cells).
- **Stat blocks**: huge outlined or cyan Archivo numerals over mono uppercase captions.
- **Icons**: quarter-arc geometry only, one colour, stroked. No third-party icon sets.
- Prefer whitespace and hairlines over boxes; mono labels over icons; one cyan accent over
  many colours.

## Doctrine vocabulary — spell these exactly
The Surf Sequence® · Evolve through play · TSS Brain · TSS High Performance ·
Three Circles of Power (→ FLOW) · P·R·C·H (Posture / Rotation / Compression / Hold) ·
belts White→Yellow→Blue→Purple→Brown→Black · Learning Blocks 00–07 · The Infinite Circle ·
EDPF (Explain / Demonstrate / Practice / Feedback) · IPM · Z1–Z4 and the pocket ·
P1 tail / P2 neutral / P3 forward · Compartiendo Olas · Puro Surf · Enkrateia SA de CV.
Named expressions (Cruz, Tapaloco, Grenade, Choke, Elbow…) are constitutional:
never renamed, never translated.

**Belt values** (tied to belts, do not change): Humility · Process & Resilience ·
Conscious Commitment · Personal Responsibility · Gratitude.
**Vibes** (attitude in the water, never tied to a belt, never an evaluation criterion):
Awareness · Love · Flow · Adaptation.

## Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=IBM+Plex+Mono:wght@400;500&family=Lora:ital,wght@1,400;1,500&display=swap" rel="stylesheet">
```
Display type: `font-family:'Archivo'; font-stretch:125%; font-weight:850;
text-transform:uppercase; letter-spacing:-0.02em; line-height:0.95;`

## Known drift — ask before choosing
The shipped implementation package uses card `#F3F0E5` and inner `#F8F5EC`; the manual
specifies Sand `#E9E2D2` and Paper `#F7F9FA`. They are close but not identical. Follow the
manual unless you are editing the existing portal code, where matching the surrounding
code wins. Flag it rather than silently picking one.

Two definitions are still open in manual 9.6: whether rail change earns its own marker,
and the exact duration of a hold. Do not invent answers.
TSS High Performance branding is unresolved — do not design for it without asking.

## When unsure
Open the manual and copy what it does. The manual is built with these exact rules and is
the reference implementation of the system.
