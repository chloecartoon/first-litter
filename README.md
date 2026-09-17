# First Litter

### ▶︎ [Open the app](https://chloecartoon.github.io/first-litter/)

No sign-up, no install, nothing to pay. It works offline once you've opened it,
and everything you enter stays on your own device.

---

A calm, offline companion for taking a dog through pregnancy, whelping, and the
puppies' first months. Built to feel like a warm illustrated journal, not a
clinical tracker — the kind of thing you open at 2am to check what's normal.

## What it does

- **Countdown** to the due date, from one or two conception dates
- **Prep checklists** — supplies, whelping box setup, mum's pre-labour care
- **Labour watch** — early signs, stage 1, and a temperature log (a drop below
  37.8°C usually means labour within 24 hours)
- **Delivery** — a timer between puppies and a per-puppy birth log
- **Puppy logs** — daily weights with sparklines, photos, milestones, care dates,
  and a warning if a pup stops gaining
- **Mum's recovery** — weight, daily check-ins, and an eclampsia symptom check
- **Nutrition** — portion maths through pregnancy, nursing and weaning
- **Training School** — 29 cues from week 3 to six months, each broken into
  illustrated step-by-step instructions

## How your data works

There is **no server and no account**. Everything lives in your browser's own
storage, on your device. Nothing is uploaded, nothing is shared, and nobody else
can see it — including whoever published this.

That also means the data doesn't follow you between devices. Use
**Settings → Backup** to export a file and restore it elsewhere.

## Install it on your phone

Open the site in your phone's browser, then:

- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** menu → Install app

It then works fully offline.

## Run it yourself

Only needed if you want to change the code — to just *use* it, open the
[live app](https://chloecartoon.github.io/first-litter/).

No build step, no dependencies. It's one HTML file.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/app.html`.

## Set it up

Open **Settings** first and enter your dog's name, the conception date(s), and
your vet's number. The dog's name is used throughout the app — the default is
"Mama".

The emergency vet numbers that ship with it are 24-hour clinics in the Klang
Valley, Malaysia. Replace them with your own local ones.

## A word of caution

This is a tracking and reference tool written by a dog owner, not a vet. It
does not diagnose anything. If something looks wrong, call your vet — that's
what the big red button is for.

## Licence

MIT — see [LICENSE](LICENSE).
