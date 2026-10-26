(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FirstLitterCarePlan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SOURCES = Object.freeze({
    'MERCK-WHELP-2026': {
      label: 'Merck Veterinary Manual, Whelping',
      url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/whelping-and-queening-in-bitches-and-queens'
    },
    'MERCK-LABOUR-2025': {
      label: 'Merck Veterinary Manual, Labour and Postpartum Care',
      url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/labor-delivery-and-postpartum-care-in-bitches-and-queens'
    },
    'MERCK-NEONATE-2025': {
      label: 'Merck Veterinary Manual, Neonatal Care',
      url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-the-neonate/management-of-the-neonate-in-dogs-and-cats'
    },
    'WSAVA-VACCINE-2024': {
      label: 'WSAVA Vaccination Guidelines 2024',
      url: 'https://wsava.org/wp-content/uploads/2024/04/WSAVA-Vaccination-guidelines-2024.pdf'
    },
    'CAPC-GENERAL': {
      label: 'Companion Animal Parasite Council',
      url: 'https://capcvet.org/guidelines/general-guidelines/'
    },
    'AAHA-LIFESTAGE-2019': {
      label: 'AAHA Canine Life Stage Guidelines',
      url: 'https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf'
    },
    'AVSAB-SOCIAL': {
      label: 'AVSAB Puppy Socialization Statement',
      url: 'https://avsab.org/wp-content/uploads/2024/12/Puppy-Socialization-Position-Statement-FINAL.pdf'
    }
  });

  const range = (start, end, step) => {
    const values = [];
    for (let value = start; value <= end; value += step || 1) values.push(value);
    return values;
  };

  const DEFINITIONS = Object.freeze([
    {
      id: 'save-vet-contacts', title: 'Save your regular and emergency vet contacts',
      class: 'auto', subjectType: 'mother', anchor: 'plan-start', offsets: [0],
      stages: ['pregnancy-in-progress', 'near-delivery', 'labour', 'puppies-born'],
      why: 'Having the right number ready matters when you are tired or worried.', guideTarget: 'settings', guideLabel: 'Add veterinary contacts'
    },
    {
      id: 'confirm-whelping-plan', title: 'Confirm the pregnancy and whelping plan with your vet',
      class: 'vet-confirmed', subjectType: 'mother', anchor: 'plan-start', offsets: [0],
      stages: ['pregnancy-in-progress', 'near-delivery'],
      why: 'Pregnancy timing, checks, and intervention depend on the individual dog.', sourceId: 'MERCK-WHELP-2026'
    },
    {
      id: 'prepare-whelping-area', title: 'Prepare the whelping area and essential supplies',
      class: 'auto', subjectType: 'mother', anchor: 'estimated-due', offsets: [-14], catchUp: true,
      stages: ['pregnancy-in-progress', 'near-delivery'],
      why: 'A quiet prepared area makes delivery-night decisions easier.', guideTarget: 'prep:box', guideLabel: 'Open whelping-area checklist'
    },
    {
      id: 'confirm-emergency-plan', title: 'Confirm your delivery-night and emergency plan',
      class: 'auto', subjectType: 'mother', anchor: 'estimated-due', offsets: [-14], catchUp: true,
      stages: ['pregnancy-in-progress', 'near-delivery'],
      why: 'Know who can help, where you will go, and how you will get there.', guideTarget: 'sos', guideLabel: 'Review emergency contacts'
    },
    {
      id: 'ask-late-pregnancy-check', title: 'Ask whether a late-pregnancy check is appropriate',
      class: 'vet-confirmed', subjectType: 'mother', anchor: 'estimated-due', offsets: [-14], catchUp: true,
      stages: ['pregnancy-in-progress', 'near-delivery'],
      why: 'Your veterinarian can decide whether examination or imaging is useful.', sourceId: 'MERCK-WHELP-2026', guideTarget: 'prep:momcare', guideLabel: 'Open mother-dog checklist'
    },
    {
      id: 'open-delivery-mode', title: 'Open Delivery Mode and keep the emergency number ready',
      class: 'auto', subjectType: 'mother', anchor: 'plan-start', offsets: [0], stages: ['labour'],
      why: 'Delivery Mode keeps timing, puppy logging, and emergency contacts together.', guideTarget: 'delivery', guideLabel: 'Open Delivery Mode'
    },
    {
      id: 'newborn-vet-check', title: 'Arrange the newborn and mother vet check',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [1], catchUp: true, maxCatchUpDays: 7,
      why: 'A complete neonatal examination is recommended within 24 hours of natural delivery.', sourceId: 'MERCK-NEONATE-2025', guideTarget: 'puppies', guideLabel: 'Open puppy records'
    },
    {
      id: 'weigh-puppies-morning', title: 'Weigh every puppy this morning',
      class: 'observation', subjectType: 'litter', anchor: 'birth', offsets: range(0, 6), occurrencePrefix: 'am',
      why: 'Twice-daily weights in the first week make changes easier to spot.', sourceId: 'MERCK-LABOUR-2025', guideTarget: 'weigh-litter', guideLabel: 'Weigh the litter'
    },
    {
      id: 'weigh-puppies-evening', title: 'Weigh every puppy this evening',
      class: 'observation', subjectType: 'litter', anchor: 'birth', offsets: range(0, 6), occurrencePrefix: 'pm',
      why: 'Twice-daily weights in the first week make changes easier to spot.', sourceId: 'MERCK-LABOUR-2025', guideTarget: 'weigh-litter', guideLabel: 'Weigh the litter'
    },
    {
      id: 'weigh-puppies-daily', title: 'Weigh every puppy today',
      class: 'observation', subjectType: 'litter', anchor: 'birth', offsets: range(7, 13), occurrencePrefix: 'day',
      why: 'Daily weights through the second week help show whether each puppy is gaining.', sourceId: 'MERCK-NEONATE-2025', guideTarget: 'weigh-litter', guideLabel: 'Weigh the litter'
    },
    {
      id: 'weigh-puppies-three-day', title: 'Weigh every puppy today',
      class: 'observation', subjectType: 'litter', anchor: 'birth', offsets: range(14, 29, 3), occurrencePrefix: 'three-day',
      why: 'Weight checks every three days continue through the first month.', sourceId: 'MERCK-NEONATE-2025', guideTarget: 'weigh-litter', guideLabel: 'Weigh the litter'
    },
    {
      id: 'daily-puppy-check', title: 'Check every puppy: warmth, vigour, nursing, and elimination',
      class: 'observation', subjectType: 'litter', anchor: 'birth', offsets: range(0, 20), occurrencePrefix: 'day',
      why: 'Daily observation helps you notice a puppy that needs veterinary attention.', sourceId: 'MERCK-NEONATE-2025', guideTarget: 'puppies', guideLabel: 'Open puppy records'
    },
    {
      id: 'daily-mother-check', title: 'Check the mother: appetite, temperature, mammary glands, and discharge',
      class: 'observation', subjectType: 'mother', anchor: 'birth', offsets: range(0, 20), occurrencePrefix: 'day',
      why: 'Daily postpartum checks make changes visible early.', sourceId: 'MERCK-LABOUR-2025', guideTarget: 'mother-check', guideLabel: 'Check the mother dog'
    },
    {
      id: 'confirm-parasite-plan', title: 'Confirm the litter parasite-control plan with your vet',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [12], catchUp: true, maxCatchUpDays: 30,
      why: 'The veterinarian should choose the product, dose, and dates for the litter and nursing mother.', sourceId: 'CAPC-GENERAL', guideTarget: 'puppies', guideLabel: 'Open litter care plan'
    },
    {
      id: 'create-socialisation-plan', title: 'Create the puppies’ safe early socialisation plan',
      class: 'auto', subjectType: 'litter', anchor: 'birth', offsets: [35], catchUp: true, maxCatchUpDays: 45,
      why: 'The first three months are an important socialisation period.', sourceId: 'AVSAB-SOCIAL', guideTarget: 'development', guideLabel: 'Open Grow guidance'
    },
    {
      id: 'confirm-vaccine-series', title: 'Confirm the puppy vaccine series with your vet',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [42], catchUp: true, maxCatchUpDays: 60,
      why: 'The actual series depends on age, local risk, previous doses, and veterinary advice.', sourceId: 'WSAVA-VACCINE-2024', guideTarget: 'puppies', guideLabel: 'Open litter care plan'
    },
    {
      id: 'growth-nutrition-review', title: 'Review growth, diet, and body condition with your vet',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [42, 70, 112, 182], occurrencePrefix: 'review',
      why: 'Nutrition and growth should be adjusted to each puppy, food, and life stage.', sourceId: 'AAHA-LIFESTAGE-2019', guideTarget: 'development', guideLabel: 'Open growth guidance'
    },
    {
      id: 'safe-outside-timing', title: 'Confirm safe class and outside-exposure timing with your vet',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [49], catchUp: true, maxCatchUpDays: 60,
      why: 'Early socialisation matters, but disease risk and safe locations vary.', sourceId: 'AVSAB-SOCIAL', guideTarget: 'development', guideLabel: 'Open socialisation guidance'
    },
    {
      id: 'permanent-id-review', title: 'Discuss permanent identification with your vet',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [49], catchUp: true, maxCatchUpDays: 90,
      why: 'Identification timing and requirements vary by puppy and location.', sourceId: 'AAHA-LIFESTAGE-2019', guideTarget: 'puppies', guideLabel: 'Open puppy records'
    },
    {
      id: 'final-puppy-core-dose-check', title: 'Check the final puppy core dose is planned for 16 weeks or older',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [105], catchUp: true, maxCatchUpDays: 30,
      why: 'WSAVA recommends the final puppy core dose at 16 weeks or older.', sourceId: 'WSAVA-VACCINE-2024', guideTarget: 'puppies', guideLabel: 'Open litter care plan'
    },
    {
      id: 'six-month-revaccination-check', title: 'Confirm the six-month revaccination plan',
      class: 'vet-confirmed', subjectType: 'litter', anchor: 'birth', offsets: [175], catchUp: true, maxCatchUpDays: 21,
      why: 'WSAVA recommends revaccination at or after 26 weeks.', sourceId: 'WSAVA-VACCINE-2024', guideTarget: 'puppies', guideLabel: 'Open litter care plan'
    }
  ]);

  function parseDateKey(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const parts = value.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function dateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(value, amount) {
    const date = parseDateKey(value);
    if (!date) return '';
    date.setUTCDate(date.getUTCDate() + amount);
    return dateKey(date);
  }

  function diffDays(later, earlier) {
    const a = parseDateKey(later);
    const b = parseDateKey(earlier);
    if (!a || !b) return null;
    return Math.round((a - b) / 86400000);
  }

  function birthDate(state) {
    if (state.litter && state.litter.birthDate) return state.litter.birthDate;
    return (state.puppies || []).map(puppy => puppy.birthDate).filter(Boolean).sort()[0] || '';
  }

  function estimatedDueDate(state) {
    const pregnancy = state.pregnancy || {};
    if (pregnancy.status === 'puppies-born' || pregnancy.dateType === 'birth') return '';
    if (pregnancy.vetDueDate) return pregnancy.vetDueDate;
    if (pregnancy.dateType === 'vet-due' && pregnancy.primaryDate) return pregnancy.primaryDate;
    if (pregnancy.primaryDate) return addDays(pregnancy.primaryDate, 63);
    if (state.settings && state.settings.c1) return addDays(state.settings.c1, 63);
    return '';
  }

  function stage(state) {
    if (birthDate(state)) return 'puppies-born';
    return (state.pregnancy && state.pregnancy.status) || 'not-set';
  }

  function mergeDefinitions(existing) {
    const merged = new Map();
    (existing || []).forEach(definition => merged.set(definition.id, definition));
    DEFINITIONS.forEach(definition => merged.set(definition.id, { ...definition, sourceReviewedAt: definition.sourceId ? '2026-10-25' : null }));
    return [...merged.values()];
  }

  function generate(state, options) {
    const today = (options && options.today) || dateKey(new Date());
    const planStart = (state.onboarding && state.onboarding.planStartedOn) || today;
    const currentStage = stage(state);
    const due = estimatedDueDate(state);
    const born = birthDate(state);
    const instances = [];

    DEFINITIONS.forEach(definition => {
      if (definition.stages && !definition.stages.includes(currentStage)) return;
      let anchor = '';
      if (definition.anchor === 'plan-start') anchor = planStart;
      if (definition.anchor === 'estimated-due') anchor = due;
      if (definition.anchor === 'birth') anchor = born;
      if (!anchor) return;

      definition.offsets.forEach((offset, index) => {
        const originalDueDate = addDays(anchor, offset);
        if (!originalDueDate) return;
        let dueDate = originalDueDate;
        if (originalDueDate < planStart) {
          const lateness = diffDays(planStart, originalDueDate);
          const canCatchUp = definition.catchUp && (definition.maxCatchUpDays === undefined || lateness <= definition.maxCatchUpDays);
          if (!canCatchUp) return;
          dueDate = planStart;
        }
        const occurrenceKey = (definition.occurrencePrefix || 'once') + '-' + (definition.offsets.length > 1 ? offset : index);
        const source = definition.sourceId ? SOURCES[definition.sourceId] : null;
        instances.push({
          id: `generated:${definition.id}:${occurrenceKey}:${definition.subjectType}`,
          definitionId: definition.id,
          occurrenceKey,
          title: definition.title,
          subjectId: definition.subjectType === 'mother' ? 'mother' : 'litter-1',
          subjectType: definition.subjectType,
          dueDate,
          originalDueDate,
          status: 'pending',
          source: 'generated',
          class: definition.class,
          why: definition.why || '',
          sourceId: definition.sourceId || null,
          sourceLabel: source ? source.label : '',
          sourceUrl: source ? source.url : '',
          sourceReviewedAt: definition.sourceId ? '2026-10-25' : null,
          guideTarget: definition.guideTarget || '',
          guideLabel: definition.guideLabel || '',
          createdAt: `${today}T00:00:00.000Z`
        });
      });
    });
    return instances.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title));
  }

  return Object.freeze({ SOURCES, DEFINITIONS, addDays, diffDays, birthDate, estimatedDueDate, stage, mergeDefinitions, generate });
});
