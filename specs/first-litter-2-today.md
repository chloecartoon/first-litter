# First Litter 2.0: Today — Spec

_Last updated: 2026-10-25_

## Objective

Redesign First Litter around a simple daily question: **what important care does the mother dog or her puppies need today?** The app is for ordinary dog owners caring for a pregnant dog and her litter, including first-time owners who may join halfway through pregnancy or after the puppies are born.

The first phase succeeds when an owner can open the app, immediately understand what matters today, complete or deal with each important task, and find upcoming care without needing to understand the app's underlying categories.

## Scope

**In scope:**

- A mobile-first onboarding flow for the mother dog.
- An automatically generated care plan from pregnancy through the puppies' first six months.
- A Today view containing important tasks due today and overdue important tasks.
- A separate Upcoming view for future important tasks.
- Starting the app during pregnancy, near delivery, during whelping, or after birth.
- Completing, rescheduling, or skipping an important task.
- Adding an owner-defined task that is not in the generated plan.
- Optional reminders when important tasks are due.
- Automatic on-device saving, local recovery snapshots, persistent storage requests, and manual backup and restore.
- Reorganising existing pregnancy, whelping, recovery, puppy-development, and training material behind the new Today and Upcoming flow.
- Snoopy as the First Litter mascot and guide.

**Out of scope:**

- General adult-dog and senior-dog care.
- Routine reminders for meals, walks, water, or other ordinary daily chores.
- Several unrelated adult dogs in one household.
- Family accounts, invitations, shared task completion, or sitter access.
- Transferring a puppy profile to a new owner.
- User accounts and cross-device syncing.
- Automatic cloud backup.
- A native iOS or Android app.
- A complete visual redesign of every existing reference screen during this phase.
- Medical diagnosis, invented medication schedules, or medication dosage advice.

## Requirements

1. The app must remain a mobile-first installable web app that also works in a normal browser.
2. The app must continue to work offline after its required assets have been cached.
3. Initial dog setup must ask for the mother's name, date of birth or approximate age, current weight, and sex.
4. The sex field must support female, male, and unknown, while pregnancy features must only be offered when relevant.
5. Pregnancy setup must accept the timing information the owner has, including a mating date, estimated conception date, or vet-provided due date.
6. The app must clearly distinguish dates calculated by First Litter from dates confirmed or supplied by a veterinarian.
7. The owner must be able to begin at any supported stage without being shown overdue tasks from before they began using the app.
8. First Litter must generate the normal care plan automatically, with the goal that owners rarely need to create standard care tasks themselves.
9. Generated tasks must be limited to important, stage-specific care for the mother or puppies rather than ordinary household routines.
10. The generated plan must cover pregnancy preparation, labour and delivery, the mother's recovery, litter care, puppy development, and puppy care and training through six months.
11. The Today view must show only important tasks due today and important tasks that are overdue.
12. Future tasks must appear in a separate Upcoming view and must not clutter Today.
13. An important missed task must remain overdue until the owner completes, reschedules, or skips it.
14. Completing a task from Today must also add the completion to the relevant dog or litter history without requiring a second logging step.
15. The owner must be able to add a custom task for the mother, an individual puppy, or the litter where relevant.
16. Custom tasks must support a title and due date; recurrence and other advanced scheduling fields are not required unless already supported by the selected implementation.
17. The interface must use plain language and expose advanced detail only when it becomes relevant to the current stage or task.
18. Health-related tasks and guidance must be traceable to reliable sources and reviewed before public release.
19. Health-related guidance must tell the owner when veterinary help is appropriate without presenting First Litter as a diagnostic tool.
20. First Litter must not invent medication names, doses, or schedules; an owner must enter or confirm any vet-prescribed medication details.
21. Notifications must be optional and requested only through a clear owner action after the care plan has been created.
22. The owner must be able to select a preferred reminder time.
23. Notifications must be reserved for important due care and must not be used for generic engagement messages.
24. Tapping a notification must open the Today view.
25. Dog, litter, health, and completion records must remain on the owner's device in this phase.
26. The notification service may store only the anonymous push subscription and the minimum timing information needed to deliver reminders; it must not store dog or litter records.
27. The app must save every user change automatically on the device.
28. The app must maintain local recovery snapshots so an owner can recover from an accidental edit or recent data problem.
29. The app must request persistent browser storage where the platform supports it and explain that this reduces, but does not eliminate, the risk of local data loss.
30. The existing manual backup export and restore capability must remain available and become easy to find.
31. The app must occasionally remind the owner to create an off-device manual backup without blocking care tasks.
32. Existing valid First Litter data must be migrated to the new data structure without silently deleting pregnancy, puppy, weight, milestone, care, training, or settings records.
33. The new data structure must use dog and litter records plus reusable care-plan modules rather than hard-coding the interface around one named mother dog.
34. Saved data must include a schema version so later releases can migrate it safely.
35. Snoopy must remain the First Litter mascot, appearing in onboarding, explanations, empty states, milestone celebrations, and calm guidance.
36. The owner's mother dog and puppies must remain the subjects of records and tasks; Snoopy must not be presented as the owner's dog.
37. Snoopy must support comprehension without appearing on every task or reducing the prominence of due care.
38. Existing pregnancy, labour, recovery, puppy-development, and training content must remain reachable from relevant tasks or the supporting guide structure.

## User flow

1. The owner opens First Litter in a browser or from the phone's Home Screen.
2. On first use, the app explains that data stays on the device and introduces Snoopy as the guide.
3. The owner adds the mother dog's name, age or date of birth, weight, and sex.
4. The owner enters the pregnancy date information they know or identifies that the puppies have already been born.
5. First Litter determines the current stage and creates the relevant care plan from that point forward.
6. The owner lands on Today and sees important due and overdue care only.
7. The owner completes, reschedules, or skips each task. Completion updates the relevant history automatically.
8. The owner can open a task for supporting instructions or reach the relevant existing guide when more context is needed.
9. The owner can open Upcoming to understand what important care is approaching.
10. The owner can add a custom task when the generated plan does not cover a personal need.
11. After the plan exists, the owner may enable notifications and select a preferred reminder time.
12. The app continues adapting the plan through pregnancy, delivery, recovery, and puppy development until six months.
13. The owner may export a manual backup and restore it on the same or another device.

### Alternate entry paths

- **Starts midway through pregnancy:** calculate the current stage and generate present and future tasks only.
- **Starts near delivery:** prioritise delivery preparation and current safety guidance without creating a historical backlog.
- **Starts during whelping:** provide a direct route into the existing delivery flow, then create remaining delivery and recovery care.
- **Starts after birth:** ask for the birth date, create the mother-recovery and puppy-development plan from the current day, and omit earlier tasks.
- **Notifications declined or unsupported:** retain the complete Today experience without repeatedly requesting permission.

## Inputs & outputs

### Inputs

- Mother dog's name.
- Date of birth or approximate age.
- Current weight and its unit.
- Sex.
- Mating date, estimated conception date, vet-provided due date, or puppy birth date, depending on entry stage.
- Task actions: complete, reschedule, or skip.
- Owner-created task title and due date.
- Notification consent and preferred reminder time.
- Existing First Litter data during migration or restore.
- Manual backup file during restore.

### Outputs

- A stage-aware care plan covering the supported journey.
- Today list of due and overdue important tasks.
- Upcoming list of future important tasks.
- Completion and task-action history associated with the mother, puppy, or litter.
- Contextual guidance linked from tasks.
- Optional due-task notifications.
- Local recovery snapshots.
- Downloadable manual backup file.

### Stored data

- Versioned dog, litter, pregnancy, puppy, task, completion, weight, milestone, care, training, notification-preference, and settings records on the device.
- Anonymous push subscription and minimum reminder timing data in the notification service only when the owner opts in.

## Constraints

- The current product is a static GitHub Pages PWA centred in `app.html`, with `sw.js`, `manifest.json`, and local browser storage.
- The redesign must preserve offline use and the ability to run without an app-store installation.
- The existing project has no application build step or runtime dependencies; any decision to introduce them requires a separate implementation decision and justification.
- The current app contains pregnancy, delivery, puppy, development, nutrition, training, emergency, settings, and backup behaviour that must be preserved unless this spec explicitly replaces it.
- The notification feature requires a small external Web Push delivery service even though dog and litter data remain local.
- Notification behaviour must degrade safely when permission is denied, the app is not installed, push is unsupported, or the device is offline.
- The existing warm illustrated identity and Snoopy assets remain part of the product; this phase is a UX and information-architecture redesign, not a full rebrand.
- Medical timing, warnings, and care instructions require source verification and must not be invented during implementation.

## Edge cases to handle

- Missing pregnancy dates -> explain which date types are accepted and allow the owner to return after obtaining better information.
- Several possible mating dates -> calculate and display a range rather than presenting false precision.
- Estimated date replaced by a vet-confirmed date -> rebuild future tasks without duplicating completed history.
- Owner joins late -> generate only current and future care; do not create an overdue historical backlog.
- Puppies already born -> use birth date as the timeline anchor and skip pregnancy and delivery tasks.
- No task due today -> show a calm, useful empty state and the next important upcoming item.
- Overdue task -> keep it visible until completed, rescheduled, or explicitly skipped.
- Rescheduled task -> move it to the selected date without leaving a duplicate on the original date.
- Skipped task -> retain the skip in history without repeatedly regenerating the same occurrence.
- Duplicate generated and custom tasks -> allow the owner to remove or skip the custom duplicate without damaging the generated plan.
- Notification permission denied -> continue without notifications and do not repeatedly prompt.
- Web Push unsupported -> explain that reminders are unavailable on that device while preserving the care plan.
- Notification arrives after a task was already completed -> opening it must show the current Today state, not stale task instructions.
- Device is offline -> task generation, task completion, history, guides, and backup export must continue working; remote notification subscription changes may wait until connectivity returns.
- Browser refuses persistent storage -> warn that manual backups remain important without blocking app use.
- Local save fails or reaches a storage limit -> show a clear error, preserve the last valid snapshot, and guide the owner to export a backup.
- Restore file is invalid or from an unsupported future schema -> reject it safely without overwriting current data.
- Migration from current First Litter data fails -> preserve the original stored data, stop the migration, and provide a recoverable error rather than resetting the app.
- Owner changes a key timeline date -> recalculate incomplete future tasks while preserving completed, skipped, and manually created history.
- Missing or unknown sex -> keep non-reproductive flows available and ask for relevant details only when necessary.
- Zero puppies or an incomplete birth log -> allow delivery and recovery flows to continue without assuming a litter size.

## Definition of done

- [ ] A new owner can create the mother dog's profile and pregnancy or birth timeline without needing a tutorial.
- [ ] An owner can start during any supported stage without receiving historical overdue tasks.
- [ ] Today shows only important due and overdue care.
- [ ] Upcoming shows future important care separately.
- [ ] Completing a task from Today updates the relevant history in the same action.
- [ ] Rescheduling removes the task from its old date and places it on the new date without duplication.
- [ ] Skipping records the choice and prevents the same task occurrence from immediately regenerating.
- [ ] An owner can add and manage a custom task.
- [ ] Generated care covers pregnancy through the puppies' first six months and excludes ordinary meal, walk, and water reminders.
- [ ] Every health-related generated task has a verified source recorded for review.
- [ ] No interface text diagnoses a condition or invents medication details.
- [ ] The app functions offline after installation or initial asset caching.
- [ ] Notification permission is requested only after an explicit owner action.
- [ ] An opted-in owner can receive an important-care reminder at the selected time on supported devices.
- [ ] Notification service records contain no dog, puppy, litter, weight, medical, or completion data.
- [ ] The app remains fully usable when notifications are declined or unsupported.
- [ ] Every change is saved locally and recent recovery snapshots are available.
- [ ] Manual backup export and restore work with the new schema.
- [ ] Existing valid data migrates without losing supported records.
- [ ] A failed migration or restore does not overwrite the last valid data.
- [ ] Snoopy appears as the First Litter mascot while the owner's dogs remain the subjects of care.
- [ ] The redesigned core flow works on current iPhone Safari/Home Screen and Android Chrome/Home Screen sizes.
- [ ] There are no uncaught console errors in onboarding, Today, Upcoming, task actions, offline use, backup, restore, or migration flows.

## Open questions

- Which veterinary or animal-welfare sources will define and review the generated task catalogue?
- Which Web Push delivery service will be used, and what deletion policy will apply to expired anonymous subscriptions?
- How many local recovery snapshots should be kept, and for how long?
- What exact interval should control the reminder to create a manual off-device backup?
- Which existing reference screens require small navigation changes during phase one so every generated task can reach its supporting guidance?
