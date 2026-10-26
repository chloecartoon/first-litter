# First Litter 2.0 — Baseline Review

_Reviewed: 2026-10-25_

## Result: CHANGES NEEDED

This is the expected baseline before the First Litter 2.0 build. The current app already has useful pregnancy, delivery, puppy, training, offline, and backup foundations, but it does not yet implement the approved Today-first task system.

The current app was loaded successfully from a local server in the in-app browser. The initial accessibility tree rendered the Home, Prep, Labor, More, and Emergency controls without an obvious startup crash. Full offline, iPhone, Android, migration, and notification behaviour has not yet been verified.

## Release-blocking safety finding

`app.html:1488` tells an owner to swing a distressed newborn head-down. The current Merck Veterinary Manual says neonates should **not** be swung because doing so can cause concussion or cerebral haemorrhage. This instruction must be removed before broader UI work or another public release.

Source: [Merck Veterinary Manual — Management of the Neonate in Dogs and Cats](https://www.merckvetmanual.com/management-and-nutrition/management-of-the-neonate/management-of-the-neonate-in-dogs-and-cats)

## Requirement-by-requirement baseline

| Spec requirement | Status | Current evidence and gap |
|---|---|---|
| 1. Mobile-first installable web app | ✅ Met | `manifest.json:1-24` declares a standalone portrait PWA. `app.html` is laid out as a phone interface. |
| 2. Offline after assets are cached | ⚠️ Unverified | `sw.js:1-71` and `app.html:5481-5486` provide caching and service-worker registration. Real-device offline behaviour has not been tested. |
| 3. Onboarding asks name, age, weight, sex | ❌ Failed | There is no onboarding. Settings asks only the mother's name and pregnancy dates at `app.html:1586-1605`. |
| 4. Sex supports female, male, unknown | ❌ Failed | The mother is hard-coded as female through labels and pronouns. Only puppies have a sex selector. |
| 5. Accept mating, conception, vet due, or birth date | ❌ Failed | Settings accepts two fields labelled conception dates only at `app.html:1595-1605`. |
| 6. Distinguish calculated and vet-confirmed dates | ❌ Failed | `computeCountdown()` adds 63 days to the entered dates at `app.html:2132-2143` without provenance or uncertainty labels. |
| 7. Join at any supported stage without old backlog | ❌ Failed | Stage derives only from conception dates and whether puppies exist. There is no explicit entry stage or plan start date. |
| 8. Generate the normal care plan automatically | ⚠️ Partial | `renderToday()` generates a short stage-based list at `app.html:3563-3618`, but there is no dated care-plan engine. |
| 9. Important stage-specific care only | ❌ Failed | Today includes routine meals, walks, bedding, and similar chores at `app.html:3577-3617`. |
| 10. Cover pregnancy through six months | ⚠️ Partial | Pregnancy, delivery, puppy development, and training content exists, but the dated care plan stops around ten weeks and is not one continuous generated plan. |
| 11. Today shows due and overdue important tasks | ❌ Failed | Today shows the current stage's static list. It has no due dates or overdue state. |
| 12. Separate Upcoming view | ❌ Failed | No Upcoming screen or grouped future-task view exists. |
| 13. Missed important task stays overdue | ❌ Failed | Today state is stored under the current date at `app.html:3621-3639`; yesterday's incomplete item does not roll forward. |
| 14. Completion also updates care history | ❌ Failed | Today toggles a date-keyed boolean only. It does not write a normalised completion event tied to the mother, puppy, or litter. |
| 15. Add custom task | ❌ Failed | No custom-task form or storage exists. |
| 16. Custom task title and due date | ❌ Failed | No custom-task model exists. |
| 17. Plain language and progressive disclosure | ⚠️ Partial | The language is generally direct, and some reference details are collapsible, but Home exposes countdown, temperature, two peeks, a plan, weigh-in, and tips before setup is complete. |
| 18. Health guidance traceable to reliable sources | ❌ Failed | No source registry or citations exist in `app.html`; several precise medical and feeding claims are hard-coded. |
| 19. Explain when veterinary help is appropriate without diagnosing | ⚠️ Partial | Emergency-call guidance exists, but some copy presents a single threshold as decisive and the app contains owner-performed emergency procedures that require review. |
| 20. Do not invent medication details | ❌ Failed | There is no safe medication model. Parasite and feeding schedules are hard-coded rather than entered or confirmed from a vet plan. |
| 21. Optional notification consent after plan creation | ❌ Failed | No notification permission or subscription code exists. |
| 22. Preferred reminder time | ❌ Failed | No notification preferences exist. |
| 23. Notifications only for important care | ❌ Failed | No notification system exists. |
| 24. Notification opens Today | ❌ Failed | No notification click handler exists in `sw.js`. |
| 25. Dog and litter records remain on device | ✅ Met | Records are stored in local browser storage at `app.html:1996-2092`. |
| 26. Push service stores minimum anonymous data | ❌ Failed | No push service or data contract exists. |
| 27. Save every change locally | ⚠️ Partial | Most interactions call `save()`, but `save()` at `app.html:2092` has no failure handling and there is no test proving every mutation is covered. |
| 28. Local recovery snapshots | ❌ Failed | Only the current `snoopy.v2` state is stored. |
| 29. Request persistent browser storage | ❌ Failed | There is no call to `navigator.storage.persist()`. |
| 30. Easy manual backup and restore | ⚠️ Partial | Export and import exist at `app.html:5413-5434`, but they are buried in Settings and restore validates JSON syntax only. |
| 31. Occasional manual-backup reminder | ❌ Failed | No reminder metadata or prompt exists. |
| 32. Safely migrate existing valid data | ❌ Failed | A one-way v1-to-v2 migration exists at `app.html:2053-2090`, but it deletes the v1 key immediately and provides no rollback copy or v3 migration. |
| 33. Dog, litter, and reusable care-plan modules | ❌ Failed | The state is hard-coded around `settings.momName`, `snoopyHealth`, and `puppies` at `app.html:2008-2033`. |
| 34. Schema version inside saved data | ❌ Failed | The storage key contains `v2`, but the saved object itself has no schema version. |
| 35. Snoopy remains the mascot | ✅ Met | Snoopy appears in Home, delivery, empty states, and guides, for example `app.html:1223-1229` and `1425-1431`. |
| 36. Owner's dogs remain the care subjects | ✅ Met | The mother's configurable name and each puppy's profile are used throughout the care and log screens. |
| 37. Snoopy supports rather than overwhelms care | ✅ Met | Mascot placement is mostly limited to headers, empty states, and tips rather than every checklist row. |
| 38. Existing guidance remains reachable | ✅ Met | Stage-aware tabs and More provide access to Prep, Labor, Logs, Grow, mother care, Settings, and emergency contacts at `app.html:2268-2336`. |

## Current UX gaps affecting the approved core flow

1. **Setup is hidden.** A new owner sees “Go to Settings” and must discover More, then Settings, rather than being guided through setup.
2. **Home competes with itself.** Countdown, temperature logging, mother health, weekly development, daily plan, weigh-in, and tips share the same level of prominence.
3. **Tasks are not real scheduled objects.** They are strings rebuilt from the current stage and checkboxes stored under a calendar date.
4. **There is no recovery path for missed care.** Incomplete items do not become overdue and cannot be rescheduled or explicitly skipped.
5. **There is no future preview.** Owners cannot see why a preparation item matters or what is due next week without reading several separate screens.
6. **Starting late is ambiguous.** Adding one puppy changes the whole navigation to post-delivery, but there is no explicit “puppies are already here” setup path.
7. **The current data model mixes product concepts.** Mother profile, settings, nutrition defaults, health history, litter records, and task checks live in one object without entity IDs or schema metadata.

## Health-content gaps requiring correction or confirmation

- `app.html:1488` recommends swinging a newborn puppy. Current Merck guidance explicitly advises against it.
- `app.html:2640` calls the ten-week appointment the “final vaccine” while current WSAVA guidance recommends repeated core doses every two to four weeks with the final puppy dose at 16 weeks or older, plus revaccination at or after 26 weeks.
- `app.html:3716-3721` starts deworming at day 21 and supplies a fixed clinic-branded schedule. CAPC and AAHA guidance starts at two weeks and repeats every two weeks until regular broad-spectrum control begins. Product choice and dosing still belong to a veterinarian.
- `app.html:2132-2143` treats 63 days from an entered conception date as exact. Current Merck guidance says breeding dates do not predict whelping accurately enough without ovulation timing.
- `app.html:5282-5390` calculates universal daily grams from body weight and stage despite also naming one product. Feeding amount should come from the specific product, body condition, growth, and a veterinary nutrition plan.
- `app.html:2374` recommends a heating pad as a supply. Merck warns that heating pads can burn neonates that cannot move away; safe heat-source wording needs review.
- `app.html:1490` and `2383` recommend Karo syrup or honey on the gums. This must be replaced with owner-safe emergency wording reviewed by a veterinarian.
- `app.html:2597` presents day 56 as a universal legal rehoming minimum. Law and best-practice requirements vary by jurisdiction, so this should not be a universal app claim.

## Edge-case baseline

Every new edge case in the First Litter 2.0 spec remains open except basic JSON parse failure on restore.

- Missing pregnancy dates -> current app shows a setup message, but no guided recovery.
- Several mating dates -> two dates are accepted, but both are treated as exact 63-day anchors.
- Vet date replaces estimate -> future content recalculates, but task history does not exist.
- Owner joins late -> no explicit plan-start boundary.
- Puppies already born -> possible only by manually adding a puppy; there is no onboarding path.
- No task due -> no true due-task engine or next-item empty state.
- Overdue, reschedule, skip, duplicate tasks -> unsupported.
- Notification failures and stale notifications -> unsupported.
- Offline mutation and subscription reconciliation -> unverified or unsupported.
- Persistent storage refusal -> unsupported.
- Local save failure -> uncaught by `save()`.
- Invalid restore -> malformed JSON is rejected, but structurally invalid JSON can overwrite current data.
- Future-schema restore -> unsupported.
- Migration failure -> load falls back to defaults; there is no user-facing recovery flow.
- Timeline-date change -> static content recalculates, but completed care is not protected by a task-event model.
- Unknown mother sex -> unsupported.
- Zero puppies -> supported by an empty state and delivery flow.

## Definition-of-done baseline

| Definition-of-done item | Baseline |
|---|---|
| Guided mother and timeline setup | ❌ |
| Start at any supported stage without backlog | ❌ |
| Today contains due and overdue important care only | ❌ |
| Upcoming separates future care | ❌ |
| One action completes and records a task | ❌ |
| Reschedule without duplication | ❌ |
| Skip without regeneration | ❌ |
| Add and manage custom task | ❌ |
| Generated plan through six months without routine chores | ❌ |
| Source recorded for every health task | ❌ |
| No diagnosis or invented medication detail | ❌ |
| Offline operation verified | ⚠️ Code exists, real-device verification pending |
| Notification request follows explicit action | ❌ |
| Due-care reminder works at selected time | ❌ |
| Push service stores no dog data | ❌ |
| App works when notifications are unavailable | ✅ Current app has no notification dependency |
| Automatic save plus recovery snapshots | ❌ Automatic save only |
| Backup and restore use the new schema | ❌ |
| Existing data migrates without loss | ❌ New migration absent |
| Failed migration or restore preserves valid data | ❌ |
| Snoopy is mascot while owner dogs remain subjects | ✅ |
| iPhone and Android Home Screen sizes verified | ⚠️ Not yet tested |
| No uncaught errors across specified flows | ⚠️ Not yet testable because flows are absent |

## Handoff priorities

1. Remove or rewrite the contraindicated newborn-swinging guidance before other feature work.
2. Replace unsafe or overconfident schedule claims with the source-backed catalogue.
3. Introduce a versioned v3 state and a non-destructive v2 migration before changing Today.
4. Build the onboarding-to-Today-to-Upcoming thin slice.
5. Connect existing delivery, puppy logs, development, and training features after the task engine is stable.
