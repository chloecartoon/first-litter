# First Litter

### ▶︎ [Open the app](https://chloecartoon.github.io/first-litter/)

No sign-up, no install, nothing to pay. It works offline once you've opened it,
and everything you enter stays on your own device.

---

A calm, offline companion for taking a dog through pregnancy, whelping, and the
puppies' first six months. It puts important care on a simple Today list and
keeps ordinary household routines out of the way.

## What it does

- **Guided setup** for the mother dog and the stage you are at now
- **Today and Upcoming** care plans generated from the date you know
- **Custom tasks** for important care that is specific to your litter
- **Optional reminders** with an owner-selected time and a clear permission step
- **Countdown** from a mating date, estimated conception date, or vet-provided due date
- **Prep checklists** — supplies, whelping box setup, mum's pre-labour care
- **Labour watch** — early signs, stage 1, and a temperature trend log
- **Delivery** — a timer between puppies and a per-puppy birth log
- **Puppy logs** — daily weights with sparklines, photos, milestones, care dates,
  and a warning if a pup stops gaining
- **Mum's recovery** — weight, daily check-ins, and an eclampsia symptom check
- **Nutrition** — stage-aware prompts to follow the exact food guide and veterinarian-approved plan
- **Training School** — 29 cues from week 3 to six months, each broken into
  illustrated step-by-step instructions

## How your data works

There is **no server and no account**. Everything lives in your browser's own
storage, on your device. Nothing is uploaded, nothing is shared, and nobody else
can see it — including whoever published this.

That also means the data doesn't follow you between devices. Use
**Settings → Backup** to export a file and restore it elsewhere. First Litter
also keeps the three newest automatic recovery copies on the same device. It
creates another recovery copy before restoring anything, and gives a calm weekly
reminder when a manual backup file is due.

Reminder permission is requested only after the owner taps **Enable reminders**.
On-device checks can notify while First Litter is open. Reliable notification
delivery while the app is closed requires a Web Push delivery service and is
intentionally outside this build. On iPhone and iPad, notifications require
First Litter to be added to the Home Screen.

## Install it on your phone

Open the site in your phone's browser, then:

- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** menu → Install app

It then works fully offline.

## Run it yourself

Only needed if you want to change the code — to just *use* it, open the
[live app](https://chloecartoon.github.io/first-litter/).

No build step and no dependencies. It is a small set of static files.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/app.html`.

## Set it up

The app guides you through the first setup. Add the mother dog's name, age,
weight, sex, the stage you are at, and the date you know. Then add your regular
and local emergency veterinary contacts in **Settings**.

## A word of caution

This is a tracking and reference tool written by a dog owner, not a vet. It
does not diagnose anything. If something looks wrong, call your vet — that's
what the big red button is for.

## Licence

MIT — see [LICENSE](LICENSE).
