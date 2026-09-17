# Icon Layout Rollout — Spec

_Last updated: 2026-07-20_

## Objective

Snoopy's reference screens read like a manual — stacked `<ul>` bullet lists and paragraph blocks that have to be read top to bottom. This replaces that prose with an icon-led layout: a week/stage scroller, tappable "today's actions", and icon rows where the description is always visible. Same words, different arrangement. Also fixes two things that surfaced while designing it: care items have no completion date, and there's no swipe-back gesture.

Success: Chloe can open any of these screens at 3am, see what's due today without reading, and tap back out with her thumb.

Design direction was chosen from a live preview comparing three treatments (collapse / terser / icon layout). Icon layout won. Preview: `claude.ai/code/artifact/b97a9a2c-9f8c-44af-b26d-08dfba6205b0`

---

## Scope

**In scope — five surfaces get the icon layout:**
1. Grow guide (`#screen-development`) — "This week's guide" card
2. Labor & Delivery (`#screen-labor`) — "⚠ Call vet immediately if" card
3. Aftercare (`#screen-aftercare`) — "Socialization curriculum" card
4. Snoopy Health (`#screen-snoopy`) — "Nutrition — through the whole journey" card
5. Grow guide — "Emergency bottle-feeding (Esbilac / KMR)" card

**Also in scope:**
6. Care items become litter-wide with editable completion dates
7. Overdue colour unified to amber
8. Edge-swipe back gesture

**Out of scope:**
- **Prep screen** — already checkbox rows with icons and a progress bar; not the same problem
- **Royal Canin Mini Puppy chart** — a data table, not prose; leave as-is
- **Palette changes** — pastels stay (see `[[snoopy-keep-pastels]]`)
- **Illustrated icon swap** — replacing emoji with Snoopy character art is its own spec; needs art direction
- **Backup nudge**, **past-date weigh-ins** — separate specs
- No new screens

---

## Requirements

### Icon layout (surfaces 1–5)

1. Each content row renders as: icon, bold short label, and a description line **always visible** — no tap-to-expand, no chevron, no "tap for detail" copy.
2. Rows are single-column full-width, not a 2-column grid — full sentences need the width.
3. Rows are **not interactive** (no cursor, hover, or focus styling) unless they genuinely do something.
4. Screens with stages (Grow guide weeks 1–10, Aftercare weeks 1/2/3/4/5–6/7–8, Snoopy Health stages pregnancy/nursing/weaning-recovery) get a horizontal scroller of chips above the card.
5. The scroller **auto-selects the current week/stage**, computed from real dates — reuse `litterCurrentWeek()` for litter-driven screens.
6. Selecting a chip swaps the card content to that stage. Every stage must have real authored content — **no placeholder states**. (The preview only built weeks 3 and 4; the real app needs all of them.)
7. The Grow guide keeps its "today's actions" strip: care items due this week as tappable pills above the card.
8. Tapping a pill toggles that care item done, with a visible done state (dimmed, strikethrough, check badge).
9. Where nothing is due, the strip shows "Nothing due this week" rather than rendering empty.

### Care items (surface 6)

10. Checking a care item for one puppy marks it done for **every puppy in the litter**. Unchecking clears it for all.
11. When a care item is checked, store and display the **completion date**, shown immediately on the row.
12. Completion dates are **editable** — same inline edit pattern as the weight log (`openWeightEditRow`): tap ✎, date input, Save.
13. Unchecking a care item clears its stored completion date.
14. Existing saved data has no completion dates. Items already checked before this change show "date not recorded" and can have a date added by editing.

### Colour (surface 7)

15. Overdue on the per-puppy Care Timeline changes from `--alert` (red) to `--warning` (amber), matching the Grow guide. Red stays reserved for genuine emergencies (vet-now warnings, eclampsia, never-feed).

### Swipe-back (surface 8)

16. A left-to-right swipe **starting within 20px of the left screen edge** navigates back to the previous screen.
17. Swipes starting anywhere else do nothing — horizontal scrollers (week scroller, today strip, weight sparkline, photo strip, RC table) must keep scrolling normally.
18. Requires a minimum horizontal travel (~60px) and must be more horizontal than vertical, so it doesn't fire on vertical scrolls.
19. On the four tab-bar root screens (Home, Logs, Grow, Snoopy) the gesture does nothing — see Open Questions.

### Milestones (verify only)

20. Development milestone dates are already editable (built 2026-07-20). Verify still working after the refactor. Milestones stay **per-puppy** — puppies legitimately open their eyes on different days, so litter-wide does not apply.

---

## User flow

**Main path — checking the Grow guide:**
1. Open Grow. The week scroller is already on the current week (day 21 → week 3).
2. Today's due care items sit above the card as pills: "Weaning", "Deworm #1", "Nail trim".
3. Tap "Deworm #1" → marks done for all 5 puppies, today's date stored, pill dims with a check.
4. Below, the week's content reads as icon rows — icon, label, description, all visible.
5. Swipe from the left edge → back to Home.

**Alternate — fixing a date:**
1. Realise you dewormed on Tuesday but only ticked it Thursday.
2. Open a puppy's Care Timeline. The row shows "Deworming #1 · 16 Jul".
3. Tap ✎, change the date, Save. Updates for all puppies.

**Alternate — looking ahead:**
1. Tap week 5 in the scroller → card swaps to that week's real content.

---

## Inputs & outputs

**Stored (localStorage `snoopy.v2`):**
- Care completion dates — new. Current shape is `p.care[itemId] = true`. Needs to carry a date; must not break existing saves where the value is a bare boolean.
- Everything else unchanged.

**Computed, not stored:**
- Current week/stage (from `birthDate`)
- Due/overdue status (from `birthDate` + item day offset)
- Gruel batch and bottle amounts (already built)

---

## Constraints

- Single-file app at `app.html`. No build step, no framework, no new dependencies.
- **Must also be copied to `deploy/index.html`** — that's the installed PWA. These drifted 17 days apart before; don't let it happen again.
- Existing pastel palette and Caveat/Poppins pairing unchanged.
- Mobile-first; primary device is Chloe's phone as an installed PWA.
- Health guardrail carried from `option-b-data-behavior`: no invented medical thresholds; computed health output keeps its "check with your vet" note; routine lateness uses `--warning`, never `--alert`.

---

## Edge cases to handle

- **No puppies yet** → week scroller and guide stay locked, as today ("Add a puppy first").
- **Week with nothing due** → today strip shows "Nothing due this week", not an empty row.
- **Puppies with different birth dates** → a litter can cross midnight, so per-puppy due dates may differ by a day. Litter-wide check writes the same completion date to every puppy regardless of their individual due date.
- **Care item checked, then unchecked** → completion date is cleared, not kept stale.
- **Completion date set in the future** → allow it (she may pre-log a vet appointment), but don't show it as overdue.
- **Pre-existing checked items with no date** → show "date not recorded", offer edit. Never invent a date.
- **Swipe starting on a horizontal scroller** → scrolls, never navigates.
- **Swipe on a tab-bar root screen** → nothing happens.
- **Diagonal or vertical swipe** → ignored; must not hijack normal scrolling.
- **Swipe with a sheet/modal open** → closes the sheet rather than switching screens.

---

## Definition of done

- [ ] All five surfaces render as icon rows with descriptions visible, no tap needed
- [ ] No "tap for detail" copy or chevron affordance remains anywhere
- [ ] Week/stage scrollers auto-select the current week from real dates
- [ ] Every week/stage has real authored content — no placeholders
- [ ] Tapping a today-pill marks the care item done for all puppies
- [ ] Care rows show a completion date as soon as they're checked
- [ ] Completion dates are editable and persist across reload
- [ ] Unchecking clears the date
- [ ] Existing pre-change saves still load, showing "date not recorded"
- [ ] Care Timeline overdue is amber, not red
- [ ] Red remains only on genuine emergencies
- [ ] Edge-swipe from the left navigates back
- [ ] Swiping the week scroller, sparkline, photo strip, and RC table scrolls without navigating
- [ ] Milestone date editing still works
- [ ] No console errors
- [ ] Verified against the Jul-2 backup (5 pups)
- [ ] `deploy/index.html` updated to match `app.html`

---

## Open questions

1. **Tab-bar root screens** — the spec assumes edge-swipe does nothing on Home / Logs / Grow / Snoopy, since there's no back history. Alternative: return to Home from the other three. Assumption made; confirm or correct.
2. **Alert red regression** — `app.html` uses `--alert: #C24B38`, but the pre-sync `deploy/index.html` had a softer `#D86A5A`. The sync on 2026-07-20 overwrote it. Unclear whether the softer red was deliberate. Not changed here; needs a decision.
3. **Snoopy Health stage scroller** — Snoopy's stage is currently a `<select>` dropdown with 8 options that also drives the portion calculator. Unclear whether the nutrition card's new scroller should drive that same dropdown or stay independent. Defaulting to independent (display only) unless told otherwise.
