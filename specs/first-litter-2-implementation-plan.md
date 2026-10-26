# First Litter 2.0 — Implementation Plan

_Prepared: 2026-10-25_

## Progress

- **Phase 0 completed, 2026-10-25:** unsafe and overconfident health guidance corrected, universal feeding calculators removed, source notes added, and the broken Delivery Mode entry action repaired.
- **Phase 1 foundation completed, 2026-10-25:** v3 state, validation, non-destructive v2/v1 migration, legacy care-history conversion, source-backed task definitions, and migration tests added.
- **Phase 2 completed, 2026-10-25:** guided setup, Today and Upcoming, task actions, custom tasks, offline support, and the first complete care-plan journey added.
- **Phase 3 completed, 2026-10-25:** Today tasks connected to delivery, preparation, mother check-ins, puppy weighing, care timelines, and the existing Grow experience without duplicate schedules.
- **Phase 4 completed, 2026-10-25:** safe save failure handling, three rolling IndexedDB recovery copies, pre-restore recovery, stricter import validation, manual export status, weekly reminders, and persistent-storage feedback added.
- **Phase 5 completed for this build, 2026-10-25:** explicit notification opt-in, reminder-time preference, important-care-only on-device checks, privacy-minimal payloads, iPhone Home Screen guidance, service-worker notification display, and tap-to-open-Today behaviour added. Background Web Push was deliberately deferred from this build by owner decision.
- **Next:** Phase 6 verification and final spec review.

## Outcome

Build one complete, testable journey first:

```text
Set up the mother dog
        ↓
Enter pregnancy or birth timing
        ↓
Generate the relevant care plan
        ↓
See important care in Today
        ↓
Complete, reschedule, or skip a task
        ↓
See the action in history and the next item in Upcoming
```

The current delivery, puppy, development, and training features remain available while this new core is introduced in controlled phases.

## Phase 0 — Safety patch

**Purpose:** remove guidance that should not remain public while the redesign is underway.

1. Remove the instruction to swing a distressed newborn puppy.
2. Replace neonatal emergency wording with minimal, owner-safe steps and a prompt to contact the vet.
3. Replace “final vaccine at ten weeks” with a vet-confirmed series that includes a final puppy core dose at 16 weeks or older and a 26-week plan check.
4. Replace the current fixed deworming sequence with a vet-confirmed parasite plan beginning from the two-week guideline anchor.
5. Remove universal feeding quantities and brand assumptions from generated care. Keep product-specific material clearly labelled as product information until it is redesigned.
6. Replace the universal legal rehoming claim with jurisdiction-neutral wording.
7. Add a small source and safety note to affected reference sections.

**Gate:** the app loads, existing records remain untouched, and the contraindicated instruction is no longer present anywhere in the repository.

## Phase 1 — Versioned data foundation

**Purpose:** make the new UX possible without risking current data.

### Proposed v3 concepts

- `schemaVersion`
- `profile` for the mother dog
- `pregnancy` with date value, date type, provenance, and uncertainty
- `litter` with birth date and puppy IDs
- `dogs` for mother and puppy records
- `taskDefinitions` sourced from the approved catalogue
- `taskInstances` for generated dated tasks
- `taskEvents` for completed, skipped, and rescheduled actions
- `customTasks`
- `settings`
- `backupMeta`
- `notificationPreferences`

### Migration rules

1. Read `snoopy.v2` without altering it.
2. Validate the shape of data that will be migrated.
3. Build v3 in memory and record a migration report.
4. Write v3 under a new key.
5. Read v3 back and validate it.
6. Keep the original v2 data as a rollback copy until the owner explicitly removes it or a later retention policy is approved.
7. If any step fails, continue loading v2 and show a recoverable message. Never reset to defaults silently.

### Task-engine rules

- Generate stable task instance IDs from definition, subject, and due date.
- Keep generated definitions separate from owner actions.
- Recalculate only incomplete future tasks when a timeline date changes.
- Preserve completed, skipped, rescheduled, and custom-task history.
- Store source ID and source-review date on health-related definitions.
- Generate no pre-join backlog.

**Gate:** fixture-based migration tests preserve current settings, temperatures, puppies, weights, care dates, milestones, health check-ins, training state, and photos.

## Phase 2 — Thin vertical UX slice

**Purpose:** prove the new core loop before redesigning secondary screens.

### Screens

1. **Welcome and privacy**
   - Introduce Snoopy as the mascot.
   - Explain that dog records stay on the device.
2. **Mother setup**
   - Name.
   - Date of birth or approximate age.
   - Current weight and unit.
   - Sex.
3. **Journey setup**
   - Pregnancy in progress, near delivery, labour, or puppies already born.
   - Mating date, estimated conception date, vet due date, or birth date as relevant.
   - Clearly label estimates and vet-confirmed dates.
4. **Today**
   - Important due tasks.
   - Needs Attention section for overdue tasks.
   - One prominent action per task.
   - Calm empty state with the next upcoming item.
5. **Task detail/action sheet**
   - Why this matters.
   - Complete, reschedule, or skip.
   - Supporting guide link and source note where health-related.
6. **Upcoming**
   - Grouped by date or stage.
   - No routine chores.
7. **Add custom task**
   - Title, subject, and due date.

### Interaction targets

- Setup should not require discovering Settings.
- Today must be understandable without a tutorial.
- Completing a task must take one primary action and write history at the same time.
- Today and Upcoming must remain usable without notifications.

**Gate:** a new user can complete the entire journey using seeded data on a narrow phone viewport, with no console errors.

## Phase 3 — Connect the current product

**Purpose:** preserve useful specialist features instead of rebuilding them unnecessarily.

1. Link pregnancy-preparation tasks to the relevant Prep checklist item.
2. Link labour tasks and alerts to Delivery Mode and emergency contacts.
3. Link neonatal weight tasks directly to the correct puppy weigh-in control.
4. Link mother recovery observations to the existing mother check-in.
5. Replace the fixed `CARE_PLAN_ITEMS` schedule with approved task definitions and owner-confirmed vet dates.
6. Link development and socialisation tasks to the existing Grow and Training content after its claims are reviewed.
7. Preserve puppy photos, weights, collar colours, milestones, training state, and delivery history.
8. Keep Snoopy in welcome, empty states, explanations, and celebrations, not every task row.

**Gate:** the new Today flow can reach every retained specialist feature without duplicate or contradictory schedules.

## Phase 4 — Storage safety and backups

1. Wrap every save in error handling.
2. Request persistent storage when supported and explain the result.
3. Design local snapshots after measuring real backup sizes, especially backups containing puppy photos.
4. Validate imports by schema and data shape before showing the overwrite confirmation.
5. Create a recovery copy before any restore.
6. Make Export and Restore easy to reach.
7. Track the last successful manual backup and show a calm reminder at the approved interval.

**Decision applied:** keep the three newest recovery snapshots in IndexedDB. This avoids duplicating photo-heavy state in `localStorage` and does not introduce a server.

**Gate:** failed saves, invalid imports, future-schema files, and failed migrations preserve the last valid state.

## Phase 5 — Optional notifications

Notifications begin only after Today and Upcoming work correctly.

1. Add an explicit “Enable reminders” action after plan creation.
2. Store dog and task records only on the device.
3. Send the notification service only an anonymous subscription and minimum schedule information.
4. Let the owner choose a reminder time.
5. Open Today when the notification is tapped.
6. Remove expired subscriptions and document the retention policy.
7. Handle denied permission, unsupported browsers, uninstalled PWAs, offline changes, and stale notifications.

**Decision applied for this build:** do not connect a provider or self-hosted push service. Closed-app background delivery is deferred to a later expansion.

**Implemented locally:** permission and scheduling preferences, foreground/on-resume checks, privacy-safe subscription shaping, push-event display, and notification click-through. The app plainly explains that this build checks reminders while it is open or when the owner returns.

## Phase 6 — Verification

### Automated checks

- Migration fixtures for empty, pregnancy, delivery, and post-delivery v2 states.
- Task generation by entry stage and timeline anchor.
- No historical backlog for a late joiner.
- Complete, reschedule, skip, and custom-task event handling.
- Timeline changes preserve history and do not duplicate future tasks.
- Invalid restore and failed save recovery.
- Service-worker asset coverage.

### Manual checks

- Fresh setup on a narrow iPhone-sized viewport.
- Fresh setup on an Android-sized viewport.
- Installed Home Screen launch.
- Offline reload and task completion.
- Existing v2 backup migration.
- Pregnancy start, late-pregnancy start, delivery start, and puppies-already-born start.
- Snoopy use and plain-language comprehension.
- Screen-reader labels, focus order, touch targets, and colour contrast.
- Notification opt-in and opt-out on supported devices after Phase 5.

### Verification result — 26 October 2026

- Automated migration, task, backup, notification, and service-worker checks pass.
- Fresh pregnancy, late-pregnancy, labour, and puppies-already-born setup paths pass in isolated mobile-sized browser sessions.
- Offline reload, offline task completion, and persistence after another offline reload pass.
- Dialog focus, Escape-to-close, focus return, form labels, 44 px critical controls, and primary text contrast pass the local accessibility review.
- Installed Home Screen launch and real notification permission opt-in/opt-out still require a physical iPhone and Android device. The in-app preview cannot reproduce those operating-system flows reliably.

## File strategy

Keep the product as a static, no-build PWA for this phase. Avoid introducing a framework or package manager merely for the redesign.

The current `app.html` is over 5,500 lines, so implementation should extract only the new stable concerns into plain static files while preserving no-build deployment:

- `js/state.js` for versioned state, validation, migration, and saving.
- `js/care-plan.js` for approved definitions and task generation.
- `js/tasks.js` for task actions and history.
- `js/notifications.js` only when Phase 5 begins.
- Existing visual and specialist feature code can remain in `app.html` initially and move only when touched.

This is a structural change and should be applied incrementally. Each extraction must keep the app working before the next extraction starts.

## Build order

1. Phase 0 safety patch.
2. Phase 1 v3 data and migration tests.
3. Phase 2 onboarding, Today, task actions, and Upcoming.
4. User review of the working core loop.
5. Phase 3 specialist-feature connections.
6. Phase 4 recovery and backup hardening.
7. Phase 5 notifications.
8. Phase 6 real-device verification and final spec review.

## First implementation checkpoint

The first code checkpoint should contain only:

- Safety corrections.
- v3 schema and non-destructive migration.
- Seeded care definitions with source metadata.
- Onboarding.
- Today and Upcoming.
- Complete, reschedule, skip, and custom task actions.

It should not yet contain push notifications, accounts, cloud backup, family sharing, adult-dog care, or a full rewrite of every reference screen.
