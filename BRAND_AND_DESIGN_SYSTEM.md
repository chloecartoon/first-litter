# Snoopy App — Brand & Design System

A pregnancy & whelping companion for Snoopy. Built to feel like a warm, illustrated journal — not a clinical tracker.

---

## 1. Product Essence

**What it is:** A daily companion app to monitor Snoopy through pregnancy, labor, delivery, and the puppy phase.

**Core jobs:**
- Countdown to estimated due date
- Daily to-do (pre / during / post delivery)
- Preparation checklist (whelping box, supplies)
- Labor & delivery prep
- Puppy logs (per pup tracking)
- Food plan (nutrition by trimester)

**Audience mindset:** Anxious-excited. First-time or experienced pet parent who wants reassurance, not a textbook. They open the app at 2am to check "what's normal."

**Promise in one line:** *"You've got this. We've got Snoopy."*

---

## 2. Brand Personality

| We are | We are not |
|---|---|
| Warm, illustrated, hand-drawn | Sterile, medical, clinical |
| Calm and reassuring | Alarming, fear-based |
| Specific and practical | Vague or generic |
| Cozy like a journal | Slick like a dashboard |
| Gentle humor where it fits | Forced cuteness or baby-talk |

**Voice cues:** "Day 42 — Snoopy's belly is starting to show 💛", "Pack your delivery kit today", "Puppy #3 latched on at 2:14pm — good girl."

Never say: "leverage," "optimize," "track your pet's journey." Just say what's happening.

---

## 3. Color System

The palette pulls the **soft cream of the character sheet** and pairs it with the **mood-app pastels** — but muted half a step so the app feels calm at 3am, not loud.

### Primary

| Role | Name | Hex | Use |
|---|---|---|---|
| Background | Cream Paper | `#FBF6EC` | App background — the character-sheet beige |
| Surface | Soft White | `#FFFDF8` | Cards, sheets |
| Ink | Snoopy Black | `#1F1B17` | Primary text, illustration strokes |
| Accent | Snoopy Spot | `#2A2622` | Headers, illustration fills |

### Pastel accents (status & sections)

| Name | Hex | Used for |
|---|---|---|
| Belly Pink | `#FFD3D8` | Pregnancy / due date module |
| Mint Calm | `#C8EBD0` | Health & food plan, "all good" states |
| Sunny Butter | `#FFE9A8` | Daily to-do, reminders |
| Sky Wash | `#CFE4F5` | Puppy logs, water/cool topics |
| Lavender Soft | `#E2D6F2` | Sleep, night-mode, rest |
| Peach Warm | `#FFCFB0` | Labor & delivery section (warm, not alarming) |

### Semantic

| Role | Hex |
|---|---|
| Success | `#5BA66A` |
| Warning | `#E0A23A` |
| Alert (use rarely) | `#D86A5A` |
| Muted text | `#6E665C` |
| Divider | `#EFE7D7` |

**Rule:** Every screen uses Cream Paper as background and *one* pastel as the section anchor. Never stack three pastels in one view — pick one to lead.

---

## 4. Typography

Pairs a friendly geometric sans with a hand-drawn display, mirroring the character sheet's title style.

| Role | Font | Weight | Size (mobile) |
|---|---|---|---|
| Display / hero | **Caveat** or **Patrick Hand** | 700 | 32–44pt |
| Headline | **Poppins** | 700 | 24–28pt |
| Section title | Poppins | 600 | 18–20pt |
| Body | Poppins | 400 | 15–16pt |
| Label / chip | Poppins | 600 | 12–13pt, tracking +0.5 |
| Numeric (countdown, weights) | Poppins | 700 | 48–72pt |

**Rule:** Caveat only for emotional moments — the countdown number, puppy names, "You did it" celebration screens. Everywhere else, Poppins.

---

## 5. Iconography & Illustration

This is the **biggest brand differentiator**. The app should feel illustrated, not iconified.

- **Style:** Hand-drawn, slightly wobbly line, same weight as the Snoopy sheet (~2px stroke at 24px).
- **Snoopy assets:** Four PNG cutouts pulled directly from the character sheet — `snoopy-happy-cut.png`, `snoopy-curious-cut.png`, `snoopy-sleepy-cut.png`, `snoopy-excited-cut.png`. Live in `assets/snoopy/`.
- **Snoopy expression → use mapping:**
  - **Happy** (Belly Pink context) — default, home greeting
  - **Curious** (Sunny Butter context) — tips, new info, onboarding
  - **Sleepy** (Lavender Soft context) — empty states, night mode, resting
  - **Excited** (Mint Calm context) — puppy born, milestones, wins
- **Sticker container:** Always inside a **white circle** (`var(--surface)` = `#FFFDF8`). Pastels live on the surrounding card or page, never directly behind Snoopy — keeps her instantly readable at any size.
- **Icons (UI):** Rounded, single-weight, ink color, optional pastel fill behind in a circle. Never thin/outlined system icons.
- **Empty states:** Always feature Snoopy (sleepy by default) + one sentence ("No logs yet. Snoopy's resting.").

---

## 6. Layout & Spacing

- **Grid:** 4pt base. Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48.
- **Margins:** 20pt horizontal on mobile.
- **Cards:** 20pt radius. 24pt internal padding. Soft shadow `0 2px 12px rgba(31,27,23,0.06)`.
- **Buttons:** Pill-shaped (full radius). 52pt tall primary. Black fill, cream text — high contrast, character-sheet feel.
- **Sheets / modals:** 28pt top radius, drag handle.
- **Tab bar:** 4 tabs, illustrated icons, active state = pastel pill behind icon.

---

## 7. Component Library

### Buttons
- **Primary:** Snoopy Black fill, Soft White text, pill radius, 52pt.
- **Secondary:** Cream Paper fill, 1.5px Snoopy Black border, ink text.
- **Tertiary / text:** Ink text, no chrome, small underline on press.

### Cards
- **Module card:** Pastel background, 20pt radius, sticker illustration top-left, big numeric or headline, one line of context.
- **Checklist card:** Soft White, rows with circular check (empty → Snoopy Spot fill on tick).

### Inputs
- 16pt radius, Soft White fill, 1px divider border, ink text. Focus = 2px Belly Pink ring.

### Chips / pills
- Pastel fill, ink text, 12pt vertical / 14pt horizontal padding, full radius. Used for trimester labels, puppy tags, food categories.

### Countdown ring
- Hero element on Home. Thick (12pt) Belly Pink ring on Cream. Big Caveat number in middle ("23 days"). Small label below ("until Snoopy's due date").

---

## 8. Screen-Level Direction

### Home / Dashboard
- Top: Snoopy sticker + greeting ("Day 41 with Snoopy 💛").
- Countdown ring card (Belly Pink).
- "Today's checklist" card (Sunny Butter) — 3 tasks max visible, with "see all."
- Quick links row: Food · Prep · Logs · Labor.
- Bottom: gentle tip card ("Snoopy may start nesting this week. Watch for blanket-digging.").

### Due Date / Pregnancy Timeline
- Vertical timeline by week. Each week = pastel card with what's happening inside Snoopy + what to do.
- Trimester chips at top to jump.

### Daily To-Do
- Grouped: **Before · During · After**. User flips between via tabs.
- Each task: checkbox, title, one-line why, optional link to related prep item.

### Preparation List
- Categorized: Whelping box · Cleaning · Feeding · Emergency · Vet contacts.
- Progress bar at top ("12 of 18 ready").
- Tap item → detail with photo, why it matters, where to buy.

### Labor Preparation
- Peach Warm theme — warm, not alarming.
- "Signs of labor" reference card (always accessible).
- Pre-labor checklist (last 7 days).
- Vet emergency button — pinned, never more than one tap away.

### Delivery Mode
- Switch into a focused, low-light layout (Lavender Soft background OK here).
- Timer + "Log a puppy" button as hero.
- Each puppy log: time born, sex, weight, color/markings, notes, photo.
- Running list visible below — never hidden.

### Puppy Logs (post-delivery)
- One card per pup with name, sticker color tag, current weight, last feed.
- Tap → detail with weight chart, feeding log, milestones.

### Food Plan
- Mint Calm theme.
- Current stage banner ("Week 6 — increase calories by 25%").
- Daily meal cards: portion, time, notes.
- Shopping list auto-generated from plan.

---

## 9. Motion

- **Easing:** `cubic-bezier(0.4, 0.0, 0.2, 1)` for everything. No bounces.
- **Durations:** 200ms (taps), 320ms (transitions), 500ms (celebrations).
- **Snoopy reactions:** Small idle wiggle on Home (every ~8s). Play-bow animation on milestone completion.
- **Page transitions:** Soft cross-fade + 8pt rise. No slide-from-right system feel.

---

## 10. Tone Examples (copy)

| Context | Write this | Not this |
|---|---|---|
| Countdown | "23 days until Snoopy's due" | "Estimated delivery: T-23" |
| Task done | "Nice — that's done." | "Task completed successfully" |
| Labor sign | "Snoopy may be starting. Stay close." | "Warning: Labor symptoms detected" |
| Puppy born | "Puppy #3 is here 🤍 2:14pm" | "New entry added" |
| Empty state | "No logs yet. Snoopy's resting." | "You have no data" |

---

## 11. Accessibility

- Minimum text contrast 4.5:1 on Cream Paper — verified for all ink + muted text.
- Pastel cards must use ink text, never white text on pastels.
- Touch targets ≥ 44pt.
- All Snoopy stickers have alt text describing the expression.
- Dark mode: shift Cream Paper → `#1A1714`, surfaces → `#252220`, pastels desaturate ~30%.

---

## 12. Quick Reference (for the builder)

```css
/* Tokens */
--bg: #FBF6EC;
--surface: #FFFDF8;
--ink: #1F1B17;
--muted: #6E665C;
--divider: #EFE7D7;

--belly-pink: #FFD3D8;
--mint-calm: #C8EBD0;
--sunny-butter: #FFE9A8;
--sky-wash: #CFE4F5;
--lavender-soft: #E2D6F2;
--peach-warm: #FFCFB0;

--success: #5BA66A;
--warning: #E0A23A;
--alert: #D86A5A;

--radius-card: 20px;
--radius-button: 999px;
--radius-input: 16px;

--shadow-card: 0 2px 12px rgba(31,27,23,0.06);

--font-display: "Caveat", "Patrick Hand", cursive;
--font-ui: "Poppins", system-ui, sans-serif;
```

---

**Single source of truth:** if a screen feels clinical, add Snoopy. If it feels loud, reduce to one pastel. If a number matters, make it Caveat and huge.

---

## Pup Art — the training illustration kit (added 16 Sep 2026, redrawn 17 Sep)

Training School draws its step illustrations from a parametric SVG puppy rather than image
files, so every step stays on-brand and nothing has to be redrawn by hand.

**The rule that makes them readable:** each pose is **one closed torso silhouette plus drawn
limbs** — never a stack of overlapping ellipses. The first version built the dog from parts and
every pose came out as the same cream blob; sit was indistinguishable from lying down. Three
torso paths now carry all ten poses:

- `TORSO_LEVEL` — horizontal body → stand, lookup, walk, run, jump (rotated)
- `TORSO_SIT` + `HAUNCH_SIT` — steep spine, chest column, folded hind leg drawn on top in
  `furShade`. The visible folded hind leg is what makes "sitting" read; without it the shape
  looks like a crouch.
- `TORSO_DOWN` — flattened body, front legs stretched forward

**A single frozen pose cannot show a movement.** Any step that describes motion ("lure the nose
up and back") uses a two-frame `seq` — before on top, after below, red arrow between, a Caveat
caption under each. Consecutive steps that look identical are the failure mode to watch for.

```js
// one frame
{ pose: 'sit', mood: 'happy', back: [['mat', 10, 74, 124]], props: [['hand', 144, 22, 0]] }
// before -> after
{ seq: [ { pose: 'stand',  props: [...], cap: 'treat at nose height' },
         { pose: 'lookup', props: [...], cap: 'lift it up + back' } ] }
```

- **Poses:** stand · lookup · sit · sitBack · turnAway · down · walk · run · paw · jump
- **Props:** hand · treat · arrow · mat · bowl · crate · human · leash · door · spark · sound · clock · cross
- **Canvas:** `viewBox="0 0 168 100"` per frame, floor at y=82, ground shadow sized per pose.
  The dog occupies roughly x=10–120; keep props right of x=130 or left of x=35.
- **Mood:** `'happy'` swaps the eye for a smile arc and adds a tongue. Anything else = calm.
- `back` draws behind the dog, `props` in front.

**Rules:** fur `#FFF2DC`, shading `#EBD7B4`, limbs `#F0E0C2`, ink stroke 2.6, rounded caps.
Limbs are a shade darker than the torso so they separate instead of merging. Motion arrows are
`--alert` and dashed — they show where a *lure* travels, never where the dog goes.
