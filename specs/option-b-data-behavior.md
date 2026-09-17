# Spec — Option B: "the app does the thinking"

**Goal:** Turn Snoopy's static reference content into computed answers driven by data the app already stores (puppy count, per-puppy weight logs, puppy age). No new screens — evolve existing cards. Keep the soft pastel palette (see [[snoopy-keep-pastels]]).

**File:** single-file app at `app.html`. All line numbers below are from the current file; confirm before editing.

**Health-adjacent guardrail (read first):** This app is used by an anxious pet parent, not a vet. Do NOT invent precise medical thresholds (e.g. "healthy = X g/day"). Use only *trend direction* + the one genuinely recognized red flag (a newborn puppy losing weight / failing to gain). Frame flags as "check nursing," never as diagnosis. Every computed health output carries a one-line "not a substitute for your vet" note.

---

## Feature 1 — Full weight trend from day 1 (Chloe's explicit ask)

**Current:** `renderPuppyDetail()` at `app.html:3430` does `const wts = p.weights.slice(-7)` and renders vertical bars. Breaks past ~7 points and hides early data.

**Change:**
- Remove the `.slice(-7)` — plot the **entire** `p.weights` history, day 1 → today.
- Replace the bar layout with an **SVG sparkline** (bars don't scale to 17+ points). Follow the `dataviz` skill for the treatment:
  - Line stroke = this puppy's **collar colour** (`collarHex(p.collar)`), 2.5px, round caps.
  - Faint gridlines in `--divider`; axis labels in `--muted`, `tabular-nums`.
  - Emphasized endpoint dot (marigold `#E8A23A` fill, surface stroke).
  - Optional soft area fill under the line at low opacity.
  - Container gets `overflow-x: auto` so it never pushes the page sideways.
- Keep the numeric "current weight" and "+Xg from birth" already present above it.
- Header label changes from "Weight history (last 7)" (`app.html:1456`) to "Weight — day 1 to today".

## Feature 2 — Weight-trend verdict (conservative)

Add a one-line verdict beside the current weight in the puppy detail header.

**Logic (trend-only, no medical thresholds):**
- `latest > previous weigh` → "↑ Gaining" · `--success`
- `latest === previous` → "→ Holding" · `--muted`
- `latest < previous` → "↓ Down since last weigh — check she's nursing" · `--warning` (NOT `--alert`), and link/scroll to the existing "Emergency bottle-feeding (Esbilac / KMR)" card (`app.html:1712`).
- Always also show cumulative "+Xg since birth".
- Under the verdict, muted 11px: "Trend only — check with your vet if worried."

## Feature 3 — Computed feed amounts

Turn static recipes into numbers for *this* litter.

**3a. Gruel batch (weaning).** Dev guide currently states the recipe as static text ("1 part Royal Canin Mini Puppy + 3 parts warm water + splash of Esbilac", "1 tsp/puppy, 3–4× day"). Compute a batch line from `state.puppies.length`:
- e.g. 5 pups → "Today's gruel: ~5 tsp kibble + 15 tsp warm water + a splash of Esbilac, offered 3–4× a day." Keep the ratio (1:3) intact; scale kibble by puppy count.

**3b. Per-puppy emergency bottle amount.** The KMR/Esbilac card states "~3ml per 100g body weight per feeding" (`app.html:1715`). For each puppy with a logged weight, compute: `round(latestWeightG / 100 * 3)` ml. Render a small per-pup line: "Pup 1 (166g) → ~5 ml per feed." Recompute on new weigh-ins.

## Feature 4 — Milestone auto-flag into the Grow guide

The per-puppy Care Timeline already auto-flags overdue from age (`app.html:3459`, `dueDays < 0 → OVERDUE`). The Development/Grow weekly guide still shows milestones as **static text** ("Deworming #1 due — day 21").

- Reuse the existing age→status computation (`MILESTONES` at `app.html:2632`; per-week status logic already sketched at `app.html:2750`) so the Grow guide shows live per-puppy status (done / due this week / overdue) instead of flat prose.
- Overdue uses `--warning` (routine-late), never `--alert`. This matches the two-tier urgency rule established in the Home rebuild.

---

## Also verify (found during tracing, not a feature)
- **"Nail trim #1" has no checkbox** in the Care Timeline because it's tagged `info: true` (`app.html` `carePlan`/`MILESTONES`). Every sibling row is checkable. Confirm this is intentional; if not, drop the `info` flag so it renders a checkbox like the others.

## Out of scope
- No palette changes (pastels stay). No new screens. No illustrated-icon swap (needs art). No changes to Home (done in Phase 1).

## Done when
- Puppy detail shows the full day-1 trend as a sparkline with a trend verdict.
- Grow guide shows computed gruel batch + per-pup bottle amounts + live milestone status.
- All health outputs carry the "check with your vet" note and use warning (never alert) for routine flags.
- No console errors; verified against the Jul-2 backup (5 pups, day 17).
