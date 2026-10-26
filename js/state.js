(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FirstLitterState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCHEMA_VERSION = 3;
  const KEYS = Object.freeze({
    current: 'snoopy.v3',
    previous: 'snoopy.v2',
    legacy: 'snoopy.v1',
    invalidRecovery: 'snoopy.v3.invalid-recovery'
  });

  const DEFAULT_BACKUP_META = Object.freeze({
    lastManualBackupAt: null,
    lastManualBackupBytes: null,
    lastAutoSnapshotAt: null,
    lastAutoSnapshotBytes: null,
    persistenceStatus: 'unknown'
  });

  const DEFAULT_NOTIFICATION_PREFERENCES = Object.freeze({
    enabled: false,
    reminderTime: '09:00',
    permissionAskedAt: null,
    permissionStatus: 'default',
    lastReminderDate: null,
    mode: 'on-device',
    pushStatus: 'not-connected',
    timeZone: ''
  });

  const CARE_DEFINITIONS = Object.freeze([
    {
      id: 'newborn-vet-check',
      title: 'Arrange the newborn and mother vet check',
      class: 'vet-confirmed',
      subjectType: 'litter',
      anchor: 'birth',
      timing: { withinHours: 24 },
      sourceId: 'MERCK-NEONATE-2025',
      sourceReviewedAt: '2026-10-25'
    },
    {
      id: 'confirm-parasite-plan',
      title: 'Confirm the litter parasite-control plan',
      class: 'vet-confirmed',
      subjectType: 'litter',
      anchor: 'birth',
      timing: { beforeDay: 14 },
      sourceId: 'CAPC-GENERAL',
      sourceReviewedAt: '2026-10-25'
    },
    {
      id: 'confirm-vaccine-series',
      title: 'Confirm the puppy vaccine series',
      class: 'vet-confirmed',
      subjectType: 'litter',
      anchor: 'birth',
      timing: { reviewFromWeek: 6 },
      sourceId: 'WSAVA-VACCINE-2024',
      sourceReviewedAt: '2026-10-25'
    },
    {
      id: 'final-puppy-core-dose-check',
      title: 'Check the final puppy core dose is planned for 16 weeks or older',
      class: 'vet-confirmed',
      subjectType: 'litter',
      anchor: 'birth',
      timing: { notBeforeDay: 112 },
      sourceId: 'WSAVA-VACCINE-2024',
      sourceReviewedAt: '2026-10-25'
    },
    {
      id: 'six-month-revaccination-check',
      title: 'Confirm the six-month revaccination plan',
      class: 'vet-confirmed',
      subjectType: 'litter',
      anchor: 'birth',
      timing: { notBeforeDay: 182 },
      sourceId: 'WSAVA-VACCINE-2024',
      sourceReviewedAt: '2026-10-25'
    }
  ]);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function isoNow(now) {
    return (now instanceof Date ? now : new Date(now || Date.now())).toISOString();
  }

  function mergeLegacyDefaults(value, legacyDefaults) {
    const defaults = clone(legacyDefaults || {});
    const input = isObject(value) ? clone(value) : {};
    return {
      ...defaults,
      ...input,
      settings: { ...(defaults.settings || {}), ...(isObject(input.settings) ? input.settings : {}) },
      checks: isObject(input.checks) ? input.checks : (defaults.checks || {}),
      temps: Array.isArray(input.temps) ? input.temps : (defaults.temps || []),
      puppies: Array.isArray(input.puppies) ? input.puppies : (defaults.puppies || []),
      snoopyHealth: {
        ...((defaults && defaults.snoopyHealth) || {}),
        ...(isObject(input.snoopyHealth) ? input.snoopyHealth : {}),
        weights: Array.isArray(input.snoopyHealth && input.snoopyHealth.weights)
          ? input.snoopyHealth.weights
          : (((defaults && defaults.snoopyHealth) || {}).weights || []),
        daily: isObject(input.snoopyHealth && input.snoopyHealth.daily)
          ? input.snoopyHealth.daily
          : (((defaults && defaults.snoopyHealth) || {}).daily || {}),
        eclampsiaChecks: Array.isArray(input.snoopyHealth && input.snoopyHealth.eclampsiaChecks)
          ? input.snoopyHealth.eclampsiaChecks
          : (((defaults && defaults.snoopyHealth) || {}).eclampsiaChecks || [])
      }
    };
  }

  function oldestBirthDate(puppies) {
    return (puppies || [])
      .map(puppy => puppy && puppy.birthDate)
      .filter(Boolean)
      .sort()[0] || '';
  }

  function puppyDogRecord(puppy) {
    return {
      id: String(puppy.id),
      role: 'puppy',
      name: puppy.name || '',
      sex: puppy.sex || 'unknown',
      birthDate: puppy.birthDate || '',
      legacyPuppyId: puppy.id
    };
  }

  function legacyCareEvents(puppies, migratedAt) {
    const seen = new Set();
    const events = [];
    (puppies || []).forEach(puppy => {
      const care = isObject(puppy && puppy.care) ? puppy.care : {};
      Object.keys(care).forEach(definitionId => {
        const value = care[definitionId];
        if (value !== true && typeof value !== 'string') return;
        const completedOn = typeof value === 'string' ? value : '';
        const key = definitionId + ':' + completedOn;
        if (seen.has(key)) return;
        seen.add(key);
        events.push({
          id: 'legacy-care:' + definitionId + ':' + (completedOn || 'undated'),
          taskDefinitionId: definitionId,
          status: 'completed',
          completedOn: completedOn || null,
          recordedAt: migratedAt,
          source: 'snoopy.v2'
        });
      });
    });
    return events;
  }

  function syncDerived(state) {
    const next = clone(state);
    const settings = next.settings || {};
    const puppies = Array.isArray(next.puppies) ? next.puppies : [];
    const existingProfile = isObject(next.profile) ? next.profile : {};
    const existingPregnancy = isObject(next.pregnancy) ? next.pregnancy : {};
    const existingLitter = isObject(next.litter) ? next.litter : {};
    const existingDogs = isObject(next.dogs) ? next.dogs : {};

    next.schemaVersion = SCHEMA_VERSION;
    next.profile = {
      ...existingProfile,
      id: existingProfile.id || 'mother',
      role: 'mother',
      name: settings.momName || existingProfile.name || 'Mama',
      dateOfBirth: existingProfile.dateOfBirth || '',
      approximateAge: existingProfile.approximateAge || '',
      weightKg: Number(settings.snoopyWeight || existingProfile.weightKg || 0) || null,
      sex: existingProfile.sex || 'female'
    };
    const inferredStatus = puppies.length
      ? 'puppies-born'
      : (existingPregnancy.status && existingPregnancy.status !== 'not-set'
          ? existingPregnancy.status
          : (settings.c1 ? 'pregnancy-in-progress' : 'not-set'));
    next.pregnancy = {
      ...existingPregnancy,
      status: inferredStatus,
      dateType: existingPregnancy.dateType || (settings.c1 ? 'estimated-conception' : ''),
      primaryDate: existingPregnancy.primaryDate || settings.c1 || '',
      secondaryMatingDate: existingPregnancy.secondaryMatingDate || settings.c2 || '',
      vetDueDate: existingPregnancy.vetDueDate || '',
      dateProvenance: existingPregnancy.dateProvenance || (settings.c1 ? 'owner-entered estimate' : ''),
      isEstimate: existingPregnancy.isEstimate !== false
    };
    const birthDate = existingLitter.birthDate || oldestBirthDate(puppies);
    next.litter = {
      ...existingLitter,
      id: existingLitter.id || 'litter-1',
      motherDogId: next.profile.id,
      birthDate,
      puppyIds: puppies.map(puppy => String(puppy.id))
    };
    next.dogs = {
      ...existingDogs,
      [next.profile.id]: { ...next.profile }
    };
    puppies.forEach(puppy => {
      next.dogs[String(puppy.id)] = { ...(existingDogs[String(puppy.id)] || {}), ...puppyDogRecord(puppy) };
    });
    next.taskDefinitions = Array.isArray(next.taskDefinitions) && next.taskDefinitions.length
      ? next.taskDefinitions
      : clone(CARE_DEFINITIONS);
    next.taskInstances = Array.isArray(next.taskInstances) ? next.taskInstances : [];
    next.taskEvents = Array.isArray(next.taskEvents) ? next.taskEvents : [];
    next.customTasks = Array.isArray(next.customTasks) ? next.customTasks : [];
    next.onboarding = isObject(next.onboarding)
      ? next.onboarding
      : { completedAt: null, planStartedOn: null, needsProfileReview: false };
    next.backupMeta = {
      ...DEFAULT_BACKUP_META,
      ...(isObject(next.backupMeta) ? next.backupMeta : {})
    };
    next.notificationPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(isObject(next.notificationPreferences) ? next.notificationPreferences : {})
    };
    return next;
  }

  function createDefault(legacyDefaults) {
    return syncDerived({
      ...mergeLegacyDefaults({}, legacyDefaults),
      schemaVersion: SCHEMA_VERSION,
      profile: {},
      pregnancy: {},
      litter: {},
      dogs: {},
      taskDefinitions: clone(CARE_DEFINITIONS),
      taskInstances: [],
      taskEvents: [],
      customTasks: [],
      onboarding: { completedAt: null, planStartedOn: null, needsProfileReview: false },
      backupMeta: clone(DEFAULT_BACKUP_META),
      notificationPreferences: clone(DEFAULT_NOTIFICATION_PREFERENCES),
      migration: null
    });
  }

  function validateV2(value) {
    if (!isObject(value)) return { valid: false, errors: ['Backup must be an object.'] };
    const errors = [];
    if (value.settings !== undefined && !isObject(value.settings)) errors.push('settings must be an object.');
    if (value.puppies !== undefined && !Array.isArray(value.puppies)) errors.push('puppies must be an array.');
    if (value.temps !== undefined && !Array.isArray(value.temps)) errors.push('temps must be an array.');
    if (value.checks !== undefined && !isObject(value.checks)) errors.push('checks must be an object.');
    return { valid: errors.length === 0, errors };
  }

  function validateV3(value) {
    if (!isObject(value)) return { valid: false, errors: ['Backup must be an object.'] };
    const errors = [];
    if (value.schemaVersion !== SCHEMA_VERSION) errors.push('schemaVersion must be 3.');
    if (!isObject(value.settings)) errors.push('settings must be an object.');
    if (!Array.isArray(value.puppies)) errors.push('puppies must be an array.');
    if (!isObject(value.profile)) errors.push('profile must be an object.');
    if (!isObject(value.pregnancy)) errors.push('pregnancy must be an object.');
    if (!isObject(value.litter)) errors.push('litter must be an object.');
    if (!isObject(value.dogs)) errors.push('dogs must be an object.');
    if (!isObject(value.onboarding)) errors.push('onboarding must be an object.');
    if (!isObject(value.backupMeta)) errors.push('backupMeta must be an object.');
    if (!isObject(value.litter) || !Array.isArray(value.litter.puppyIds)) errors.push('litter.puppyIds must be an array.');
    if (isObject(value.settings) && value.settings.emergencyVets !== undefined && !Array.isArray(value.settings.emergencyVets)) {
      errors.push('settings.emergencyVets must be an array.');
    }
    if (Array.isArray(value.puppies) && value.puppies.some(puppy => !isObject(puppy))) {
      errors.push('Every puppy record must be an object.');
    }
    ['taskDefinitions', 'taskInstances', 'taskEvents', 'customTasks'].forEach(key => {
      if (!Array.isArray(value[key])) errors.push(key + ' must be an array.');
      else if (value[key].some(item => !isObject(item))) errors.push('Every ' + key + ' record must be an object.');
    });
    return { valid: errors.length === 0, errors };
  }

  function migrateV1ToV2(v1, legacyDefaults) {
    const source = isObject(v1) ? v1 : {};
    const settings = isObject(source.settings) ? source.settings : {};
    const merged = mergeLegacyDefaults({
      checks: source.checks || {},
      puppies: source.puppies || [],
      lastPuppyTime: source.lastPuppyTime || null,
      settings: {
        c1: settings.c1 || '',
        c2: settings.c2 || '',
        vetName: settings.vetName || '',
        vetPhone: settings.vetPhone || ''
      }
    }, legacyDefaults);
    if (settings.emerName) {
      merged.settings.emergencyVets = [
        { name: settings.emerName, phones: [settings.emerPhone].filter(Boolean) },
        ...((legacyDefaults && legacyDefaults.settings && legacyDefaults.settings.emergencyVets) || [])
      ];
    }
    merged.temps = (source.temps || []).map(entry => {
      if (!entry || Number(entry.temp) <= 50) return entry;
      return { ...entry, temp: Math.round(((entry.temp - 32) * 5 / 9) * 10) / 10 };
    });
    return merged;
  }

  function migrateV2(value, legacyDefaults, now, sourceKey) {
    const checked = validateV2(value);
    if (!checked.valid) throw new Error(checked.errors.join(' '));
    const migratedAt = isoNow(now);
    const legacy = mergeLegacyDefaults(value, legacyDefaults);
    const hasLegacyActivity = Boolean(
      legacy.settings.c1 ||
      legacy.settings.c2 ||
      legacy.settings.vetName ||
      (legacy.settings.momName && legacy.settings.momName !== 'Mama') ||
      legacy.puppies.length ||
      legacy.temps.length ||
      Object.keys(legacy.checks || {}).length
    );
    return syncDerived({
      ...legacy,
      schemaVersion: SCHEMA_VERSION,
      profile: {},
      pregnancy: {},
      litter: {},
      dogs: {},
      taskDefinitions: clone(CARE_DEFINITIONS),
      taskInstances: [],
      taskEvents: legacyCareEvents(legacy.puppies, migratedAt),
      customTasks: [],
      onboarding: {
        completedAt: hasLegacyActivity ? migratedAt : null,
        planStartedOn: hasLegacyActivity ? migratedAt.slice(0, 10) : null,
        needsProfileReview: hasLegacyActivity
      },
      backupMeta: clone(DEFAULT_BACKUP_META),
      notificationPreferences: clone(DEFAULT_NOTIFICATION_PREFERENCES),
      migration: {
        fromSchema: sourceKey === KEYS.legacy ? 1 : 2,
        sourceKey,
        migratedAt,
        preservedSource: true
      }
    });
  }

  function hydrateV3(value, legacyDefaults) {
    const checked = validateV3(value);
    if (!checked.valid) throw new Error(checked.errors.join(' '));
    return syncDerived({ ...mergeLegacyDefaults(value, legacyDefaults), ...clone(value) });
  }

  function writeAndVerify(storage, state) {
    const ready = syncDerived(state);
    storage.setItem(KEYS.current, JSON.stringify(ready));
    const written = JSON.parse(storage.getItem(KEYS.current));
    const checked = validateV3(written);
    if (!checked.valid) throw new Error('Saved v3 data could not be verified: ' + checked.errors.join(' '));
    return ready;
  }

  function parse(raw, label) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(label + ' is not valid JSON.');
    }
  }

  function load(storage, legacyDefaults, now) {
    const currentRaw = storage.getItem(KEYS.current);
    let currentError = null;
    if (currentRaw) {
      try {
        return { state: hydrateV3(parse(currentRaw, KEYS.current), legacyDefaults), source: KEYS.current, migrated: false, error: null };
      } catch (error) {
        currentError = error;
        try { storage.setItem(KEYS.invalidRecovery, currentRaw); } catch (_) { /* preserve best effort */ }
      }
    }

    const previousRaw = storage.getItem(KEYS.previous);
    if (previousRaw) {
      try {
        const migrated = migrateV2(parse(previousRaw, KEYS.previous), legacyDefaults, now, KEYS.previous);
        return { state: writeAndVerify(storage, migrated), source: KEYS.previous, migrated: true, error: currentError };
      } catch (error) {
        currentError = currentError || error;
      }
    }

    const legacyRaw = storage.getItem(KEYS.legacy);
    if (legacyRaw) {
      try {
        const v1 = parse(legacyRaw, KEYS.legacy);
        const v2 = migrateV1ToV2(v1, legacyDefaults);
        const migrated = migrateV2(v2, legacyDefaults, now, KEYS.legacy);
        return { state: writeAndVerify(storage, migrated), source: KEYS.legacy, migrated: true, error: currentError };
      } catch (error) {
        currentError = currentError || error;
      }
    }

    return { state: createDefault(legacyDefaults), source: 'default', migrated: false, error: currentError };
  }

  function save(storage, value, legacyDefaults) {
    return writeAndVerify(storage, syncDerived({ ...mergeLegacyDefaults(value, legacyDefaults), ...clone(value) }));
  }

  function importBackup(value, legacyDefaults, now) {
    try {
      if (value && value.schemaVersion === SCHEMA_VERSION) {
        return { ok: true, state: hydrateV3(value, legacyDefaults), migrated: false, errors: [] };
      }
      if (value && value.schemaVersion && value.schemaVersion > SCHEMA_VERSION) {
        return { ok: false, state: null, migrated: false, errors: ['This backup was created by a newer version of First Litter.'] };
      }
      return {
        ok: true,
        state: migrateV2(value, legacyDefaults, now, 'imported-v2-backup'),
        migrated: true,
        errors: []
      };
    } catch (error) {
      return { ok: false, state: null, migrated: false, errors: [error.message] };
    }
  }

  return Object.freeze({
    SCHEMA_VERSION,
    KEYS,
    CARE_DEFINITIONS,
    createDefault,
    validateV2,
    validateV3,
    migrateV2,
    load,
    save,
    importBackup,
    syncDerived
  });
});
