'use strict';

const assert = require('node:assert/strict');
const State = require('../js/state.js');

class MemoryStorage {
  constructor(seed = {}) { this.data = new Map(Object.entries(seed)); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

const defaults = {
  settings: { c1: '', c2: '', momName: 'Mama', snoopyWeight: 5, emergencyVets: [] },
  checks: {},
  temps: [],
  puppies: [],
  lastPuppyTime: null,
  snoopyHealth: { weights: [], daily: {}, eclampsiaChecks: [] }
};

function test(name, fn) {
  try {
    fn();
    console.log('✓', name);
  } catch (error) {
    console.error('✗', name);
    throw error;
  }
}

test('fresh load creates a valid v3 state without writing storage', () => {
  const storage = new MemoryStorage();
  const result = State.load(storage, defaults, '2026-10-25T00:00:00.000Z');
  assert.equal(result.source, 'default');
  assert.equal(result.state.schemaVersion, 3);
  assert.equal(result.state.profile.name, 'Mama');
  assert.equal(State.validateV3(result.state).valid, true);
  assert.equal(result.state.notificationPreferences.reminderTime, '09:00');
  assert.equal(result.state.notificationPreferences.pushStatus, 'not-connected');
  assert.equal(storage.getItem(State.KEYS.current), null);
});

test('v2 migration writes v3 and preserves the original v2 record', () => {
  const v2 = {
    settings: { c1: '2026-08-01', c2: '', momName: 'Snoopy', snoopyWeight: 6 },
    checks: { supplies: { s1: true } },
    temps: [{ date: '2026-09-01', temp: 37.4 }],
    puppies: [{ id: 7, name: 'Bean', sex: '♀ F', birthDate: '2026-10-01', care: { checkup: '2026-10-02' } }],
    snoopyHealth: { weights: [{ date: '2026-10-01', kg: 5.8 }], daily: {}, eclampsiaChecks: [] }
  };
  const original = JSON.stringify(v2);
  const storage = new MemoryStorage({ [State.KEYS.previous]: original });
  const result = State.load(storage, defaults, '2026-10-25T00:00:00.000Z');

  assert.equal(result.migrated, true);
  assert.equal(result.state.profile.name, 'Snoopy');
  assert.equal(result.state.litter.birthDate, '2026-10-01');
  assert.deepEqual(result.state.litter.puppyIds, ['7']);
  assert.equal(result.state.taskEvents[0].taskDefinitionId, 'checkup');
  assert.equal(storage.getItem(State.KEYS.previous), original);
  assert.equal(State.validateV3(JSON.parse(storage.getItem(State.KEYS.current))).valid, true);
});

test('migration fixtures cover empty, pregnancy, delivery-era, and post-delivery v2 states', () => {
  const fixtures = [
    {
      name: 'empty',
      value: {},
      check(state) {
        assert.equal(state.pregnancy.status, 'not-set');
        assert.equal(state.onboarding.completedAt, null);
      }
    },
    {
      name: 'pregnancy',
      value: { settings: { momName: 'Luna', c1: '2026-09-25' }, puppies: [], temps: [], checks: {} },
      check(state) {
        assert.equal(state.profile.name, 'Luna');
        assert.equal(state.pregnancy.status, 'pregnancy-in-progress');
        assert.equal(state.pregnancy.primaryDate, '2026-09-25');
      }
    },
    {
      name: 'delivery-era',
      value: {
        settings: { momName: 'Bella', c1: '2026-08-24' },
        puppies: [], temps: [{ date: '2026-10-25', when: 'PM', temp: 37.2 }], checks: {},
        lastPuppyTime: 1792890000000
      },
      check(state) {
        assert.equal(state.lastPuppyTime, 1792890000000);
        assert.equal(state.temps[0].temp, 37.2);
        assert.equal(state.onboarding.needsProfileReview, true);
      }
    },
    {
      name: 'post-delivery',
      value: {
        settings: { momName: 'Ruby' }, checks: {}, temps: [],
        puppies: [{
          id: 'p1', name: 'Bean', sex: '♀ F', birthDate: '2026-10-25', collar: 'yellow',
          weights: [{ date: '2026-10-25', g: 210 }], photos: ['data:image/png;base64,abc'],
          milestones: { eyes: '2026-11-05' }, training: { handling: true }, care: { checkup: '2026-10-26' }
        }]
      },
      check(state) {
        assert.equal(state.pregnancy.status, 'puppies-born');
        assert.equal(state.litter.birthDate, '2026-10-25');
        assert.deepEqual(state.puppies[0].weights, [{ date: '2026-10-25', g: 210 }]);
        assert.deepEqual(state.puppies[0].photos, ['data:image/png;base64,abc']);
        assert.equal(state.puppies[0].milestones.eyes, '2026-11-05');
        assert.equal(state.puppies[0].training.handling, true);
      }
    }
  ];

  fixtures.forEach(fixture => {
    const original = JSON.stringify(fixture.value);
    const storage = new MemoryStorage({ [State.KEYS.previous]: original });
    const result = State.load(storage, defaults, '2026-10-26T00:00:00.000Z');
    assert.equal(result.migrated, true, fixture.name);
    assert.equal(State.validateV3(result.state).valid, true, fixture.name);
    assert.equal(storage.getItem(State.KEYS.previous), original, fixture.name);
    fixture.check(result.state);
  });
});

test('v1 Fahrenheit temperatures migrate without deleting v1', () => {
  const v1 = { settings: { momName: 'Old record' }, temps: [{ temp: 100 }], puppies: [] };
  const original = JSON.stringify(v1);
  const storage = new MemoryStorage({ [State.KEYS.legacy]: original });
  const result = State.load(storage, defaults, '2026-10-25T00:00:00.000Z');

  assert.equal(result.migrated, true);
  assert.equal(result.state.temps[0].temp, 37.8);
  assert.equal(storage.getItem(State.KEYS.legacy), original);
});

test('saving syncs compatibility fields into the v3 profile and litter', () => {
  const storage = new MemoryStorage();
  const state = State.createDefault(defaults);
  state.settings.momName = 'Mochi';
  state.puppies.push({ id: 12, name: 'Dot', birthDate: '2026-10-10', sex: '?' });
  const saved = State.save(storage, state, defaults);

  assert.equal(saved.profile.name, 'Mochi');
  assert.equal(saved.pregnancy.status, 'puppies-born');
  assert.deepEqual(saved.litter.puppyIds, ['12']);
  assert.equal(saved.dogs['12'].name, 'Dot');
});

test('invalid v3 is preserved before a valid v2 rollback is migrated', () => {
  const storage = new MemoryStorage({
    [State.KEYS.current]: '{bad json',
    [State.KEYS.previous]: JSON.stringify({ settings: { momName: 'Safe copy' }, puppies: [], temps: [], checks: {} })
  });
  const result = State.load(storage, defaults, '2026-10-25T00:00:00.000Z');

  assert.equal(result.state.profile.name, 'Safe copy');
  assert.equal(storage.getItem(State.KEYS.invalidRecovery), '{bad json');
});

test('future-schema backups are rejected without mutation', () => {
  const result = State.importBackup({ schemaVersion: 4 }, defaults, '2026-10-25T00:00:00.000Z');
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /newer version/i);
});

test('malformed v2 shapes are rejected', () => {
  const result = State.importBackup({ settings: [], puppies: {} }, defaults, '2026-10-25T00:00:00.000Z');
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /settings must be an object/i);
});

test('malformed v3 records are rejected before restore', () => {
  const backup = State.createDefault(defaults);
  backup.puppies = ['not a puppy record'];
  backup.taskInstances = ['not a task record'];
  const result = State.importBackup(backup, defaults, '2026-10-25T00:00:00.000Z');
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /puppy record/i);
  assert.match(result.errors.join(' '), /taskInstances record/i);
});

test('failed saves leave the previous valid local copy untouched', () => {
  const storage = new MemoryStorage();
  const first = State.createDefault(defaults);
  first.settings.momName = 'Safe copy';
  State.save(storage, first, defaults);
  const before = storage.getItem(State.KEYS.current);
  storage.setItem = () => { throw new Error('Quota exceeded'); };

  const changed = State.createDefault(defaults);
  changed.settings.momName = 'Unsaved change';
  assert.throws(() => State.save(storage, changed, defaults), /Quota exceeded/);
  assert.equal(storage.getItem(State.KEYS.current), before);
});
