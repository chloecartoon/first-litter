# First Litter 2.0 — Source-Backed Care Catalogue

_Research snapshot: 2026-10-25_

## Purpose

This catalogue defines what First Litter may generate as an important task from pregnancy through six months. It is a product-content baseline, not veterinary approval. A veterinarian must review the final task wording, timing, emergency thresholds, and Malaysia-specific considerations before public release.

## Task classes

- **Auto:** First Litter may generate this because the action is broadly applicable and does not prescribe treatment.
- **Vet-confirmed:** First Litter may prompt the owner to arrange or confirm the item, but the veterinarian provides the actual schedule, product, dose, or medical decision.
- **Observation:** The owner records a sign or trend. The app must not diagnose from one observation.
- **Alert:** Urgent reference shown when relevant. It is not a dismissible routine task and should direct the owner to a veterinarian.
- **Guide:** Educational or developmental content linked from a task, not something that must appear on Today every day.

## Product rules

1. Today contains important due and overdue care only. Meals, walks, water, ordinary cleaning, and other household routines are excluded.
2. The app generates actions, not diagnoses. It may say “record,” “check,” “prepare,” “book,” or “contact your vet,” but not prescribe medication or declare a condition.
3. Vaccine, parasite, feeding, supplement, imaging, and medication decisions must be confirmed by a veterinarian or the relevant product instructions.
4. A calculated pregnancy date is an estimate unless it comes from documented ovulation timing or a veterinarian.
5. Emergency signs remain visible and reachable, but completing a checklist must never imply the emergency is resolved.
6. Region-specific law, disease prevalence, and veterinary schedules must not be presented as universal.
7. First Litter must store a source ID and source-review date with every generated health task definition.

## Pregnancy and setup

| Proposed task | Trigger | Class | Owner-facing intent | Evidence and notes |
|---|---|---|---|---|
| Complete the mother profile | First setup | Auto | Add name, age, weight, and sex so the plan can be personalised. | Product requirement, not a medical claim. |
| Add the pregnancy timing you know | First setup | Auto | Record mating date, estimated conception date, or vet-provided due date and label its source. | Merck notes that breeding dates alone do not predict whelping precisely. |
| Save your regular and emergency vet contacts | After setup | Auto | Make help reachable from Today and Delivery Mode. | Safety and product workflow. |
| Confirm a pregnancy and whelping plan with your vet | After setup | Vet-confirmed | Record the plan and any dates the vet gives you. | Reproductive timing and intervention depend on clinical assessment. |
| Prepare the whelping area and essential supplies | Before the estimated delivery window | Auto | Complete a short preparation checklist with safe heat and hygiene wording. | Timing remains a product decision; equipment wording needs veterinary review. |
| Confirm who can help and how you will reach emergency care | Before delivery window | Auto | Save a practical delivery-night plan. | Non-medical risk reduction. |
| Ask whether imaging or another late-pregnancy check is appropriate | Late pregnancy | Vet-confirmed | Do not automatically prescribe an X-ray week. Record the vet's decision. | Breed, litter, timing, and clinical need vary. |
| Record late-pregnancy temperature observations | Only if enabled by owner or vet | Observation | Show a trend and explain that a drop can occur before labour but is not a diagnosis by itself. | Merck reports a drop in most dogs 8–24 hours before whelping, with variation. |

## Whelping and immediate delivery

| Proposed task or alert | Trigger | Class | Owner-facing intent | Evidence and notes |
|---|---|---|---|---|
| Start Delivery Mode | Owner identifies labour | Auto | Begin timing and make emergency contacts prominent. | Product workflow. |
| Log each puppy | Each birth | Auto | Record time, sex, weight, markings, and notes. | Supports delivery history and neonatal monitoring. |
| Confirm the newborn is warm, breathing, and attempting to nurse | After each birth | Observation | Record a simple status and surface veterinary help when anything is not right. | Merck neonatal care prioritises warmth, oxygenation, vigour, and effective suckling. |
| Remove membrane from the face, gently clear the airway, rub and dry | Only when the mother does not promptly do so | Guide | Provide minimal owner-safe first steps while directing the owner to veterinary help. | Merck supports prompt membrane removal, gentle suction, rubbing, drying, and warmth. It explicitly says not to swing neonates. |
| Call the vet for maternal or fetal distress | Relevant signs or prolonged labour | Alert | Show the saved emergency contact and concise signs. | Exact owner-facing thresholds need veterinary review because professional and owner sources vary by context. |
| Confirm delivery completion with a veterinarian when uncertain | Owner is unsure all puppies were delivered | Vet-confirmed | Avoid using a timer alone to declare delivery complete. | Merck says imaging or examination may be needed to confirm all neonates are delivered. |

## Mother and neonatal period, birth to 21 days

| Proposed task | Trigger | Class | Owner-facing intent | Evidence and notes |
|---|---|---|---|---|
| Arrange a neonatal physical examination | Within the first 24 hours | Vet-confirmed | Have each newborn and the mother assessed as advised by the vet. | Merck recommends a complete physical examination of neonates within 24 hours of natural delivery. |
| Record birth weight when dry | After each birth | Auto | Establish the starting point for each puppy. | Merck postpartum guidance. |
| Weigh each puppy twice daily | First week | Auto | Record the trend and flag loss or failure to gain for veterinary attention. | Merck postpartum guidance says twice daily for the first week. |
| Weigh each puppy daily | Week 2 | Auto | Continue weight trend monitoring. | Merck neonatal guidance says daily through the first two weeks. |
| Weigh every three days | Weeks 3–4 | Auto | Continue monitoring while reducing burden. | Merck neonatal guidance recommends every three days until one month. |
| Check each puppy's vigour, nursing, elimination, and weight trend | Daily through day 21 | Observation | Record a short neonatal check without diagnosing illness. | Merck calls for daily neonatal evaluation. |
| Check the mother's appetite, temperature, mammary glands, discharge, and maternal behaviour | Daily during the neonatal period | Observation | Make changes visible and direct concerning findings to the vet. | Merck calls for daily evaluation of these areas. |
| Check the litter's warmth and safe heat setup | Daily through four weeks | Observation | Use age-appropriate environmental guidance and ensure puppies can avoid excess heat. | Merck provides age-specific environmental ranges and warns heating pads can burn immobile neonates. |
| Contact the vet about weight loss, failure to gain, failure to nurse, chilling, breathing difficulty, or marked lethargy | Concerning observation | Alert | Make veterinary contact the action, not an app-generated diagnosis or home treatment plan. | Merck neonatal morbidity and sepsis guidance. |

## Parasite, vaccination, and veterinary schedule

| Proposed task | Trigger | Class | Owner-facing intent | Evidence and notes |
|---|---|---|---|---|
| Confirm the litter's parasite-control plan | Before two weeks | Vet-confirmed | Record the vet-approved product and dates. Do not generate a drug or dose. | CAPC guidance begins puppy anthelmintic treatment at two weeks and repeats every two weeks until regular broad-spectrum control begins. Regional protocols vary. |
| Parasite-control appointment or owner-confirmed dose | Vet-entered dates | Vet-confirmed | Remind from the actual plan rather than a clinic name hard-coded in the app. | CAPC and AAHA. |
| Confirm the primary vaccine series | Around the first puppy visits | Vet-confirmed | Record actual appointments and local requirements. | WSAVA recommends multiple core doses every two to four weeks, with the final puppy dose at 16 weeks or older. |
| Check that the final puppy core dose is scheduled at 16 weeks or older | Before 16 weeks | Vet-confirmed | Prevent the app from treating a ten-week dose as “final.” | WSAVA 2024 guidelines. |
| Confirm the 26-week revaccination plan | Near six months | Vet-confirmed | Record the vet's recommendation at the end of First Litter's current scope. | WSAVA advises revaccination at or after 26 weeks rather than waiting until 12–16 months. |
| Prepare questions for recurring puppy examinations | Before vet visits | Guide | Bring weight trends, parasite history, behaviour, nutrition, and concerns. | AAHA suggests puppy examinations roughly every three to four weeks, individualised by the veterinary team. |
| Discuss permanent identification | During puppy veterinary care | Vet-confirmed | Record whether and when microchipping is planned. | AAHA includes permanent identification in puppy care but does not support one universal day for every region. |

## Development, socialisation, and training

| Proposed task | Trigger | Class | Owner-facing intent | Evidence and notes |
|---|---|---|---|---|
| Begin gentle handling and positive exposure | Neonatal period onward | Guide | Offer short, safe, age-appropriate activities without forcing a frightened puppy. | AAHA recommends socialising and handling from the neonatal period. |
| Create the early socialisation plan | Before eight weeks | Auto | Plan safe exposure to people, surfaces, sounds, handling, and normal household experiences. | AVSAB identifies the first three months as the most important socialisation period. |
| Confirm safe class or outside-exposure timing with the vet | Before classes or public exposure | Vet-confirmed | Balance disease risk with early socialisation rather than waiting blindly for every vaccine. | AVSAB supports appropriate socialisation before full vaccination and describes safeguards for classes. |
| Continue reward-based training | Weekly through six months | Guide | Surface one age-appropriate training activity at a time. | AVSAB's current training position supports reward-based methods and rejects aversive methods. |
| Review growth, diet, and body condition with the vet | At puppy visits or when growth changes | Vet-confirmed | Avoid universal grams-per-day calculators. Use product instructions, body condition, breed/size, and clinical advice. | AAHA recommends individualised nutrition assessment and trend monitoring. |

## Content to remove from the automatic plan

- Routine meals, walks, water refills, ordinary bedding changes, and similar household chores.
- A universal “switch to puppy food now” instruction without diet context.
- Universal grams-per-day calculations based only on weight and age.
- Brand-specific feeding instructions presented as general veterinary guidance.
- A universal X-ray week.
- A universal legal rehoming age.
- A fixed microchip day.
- A fixed medication, dewormer, supplement, or dose generated by the app.
- “Final vaccine at ten weeks.”
- Swinging a newborn puppy to clear fluid.
- Honey or corn syrup as a generic first-line emergency instruction.
- Any completion action that implies an emergency has been medically resolved.

## Source register

- **MERCK-WHELP-2026:** [Merck Veterinary Manual — Whelping and Queening in Bitches and Queens](https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/whelping-and-queening-in-bitches-and-queens), reviewed June 2025, updated July 2026.
- **MERCK-LABOUR-2025:** [Merck Veterinary Manual — Labor, Delivery, and Postpartum Care](https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/labor-delivery-and-postpartum-care-in-bitches-and-queens), reviewed June 2025.
- **MERCK-NEONATE-2025:** [Merck Veterinary Manual — Management of the Neonate in Dogs and Cats](https://www.merckvetmanual.com/management-and-nutrition/management-of-the-neonate/management-of-the-neonate-in-dogs-and-cats), updated August 2025.
- **WSAVA-VACCINE-2024:** [WSAVA — 2024 Guidelines for the Vaccination of Dogs and Cats](https://wsava.org/wp-content/uploads/2024/04/WSAVA-Vaccination-guidelines-2024.pdf).
- **CAPC-GENERAL:** [Companion Animal Parasite Council — General Guidelines](https://capcvet.org/guidelines/general-guidelines/).
- **CAPC-ASCARID:** [Companion Animal Parasite Council — Ascarid Guideline](https://capcvet.org/guidelines/ascarid/).
- **AAHA-LIFESTAGE-2019:** [AAHA — 2019 Canine Life Stage Guidelines](https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf).
- **AAHA-CHECKLIST:** [AAHA — Canine Life Stage Checklist](https://www.aaha.org/resources/life-stage-canine-2019/life-stage-checklist/).
- **AVSAB-SOCIAL:** [AVSAB — Puppy Socialization Position Statement](https://avsab.org/wp-content/uploads/2024/12/Puppy-Socialization-Position-Statement-FINAL.pdf).
- **AVSAB-TRAINING:** [AVSAB — Humane Dog Training Position Statement](https://avsab.org/wp-content/uploads/2024/12/AVSAB-Humane-Dog-Training-Position-Statement-2021.pdf).

## Required review before implementation

1. A veterinarian reviews the emergency and neonatal-resuscitation copy.
2. A Malaysia-based veterinarian reviews parasite, vaccination, rabies, imaging, and common local clinic workflows.
3. Product design decides which safe tasks are prominent enough for Today versus available as guides.
4. Every accepted health task receives a stable source ID, review date, and owner-safe wording before being added to code.
