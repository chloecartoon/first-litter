'use strict';

const assert = require('node:assert/strict');
const CarePlan = require('../js/care-plan.js');
const Tasks = require('../js/tasks.js');

function baseState(overrides = {}) {
  return {
    settings: { c1: '', c2: '', momName: 'Mama' },
    profile: { id: 'mother', name: 'Mama', sex: 'female' },
    pregnancy: { status: 'not-set', dateType: '', primaryDate: '', vetDueDate: '' },
    litter: { id: 'litter-1', birthDate: '', puppyIds: [] },
    puppies: [],
    onboarding: { completedAt: '2026-10-25T00:00:00.000Z', planStartedOn: '2026-10-25' },
    taskDefinitions: [], taskInstances: [], taskEvents: [], customTasks: [],
    ...overrides
  };
}

function test(name, fn) {
  try { fn(); console.log('✓', name); }
  catch (error) { console.error('✗', name); throw error; }
}

test('pregnancy plan creates current actions and no pre-join backlog', () => {
  const state = baseState({
    pregnancy: { status: 'near-delivery', dateType: 'vet-due', primaryDate: '2026-10-30', vetDueDate: '2026-10-30' }
  });
  const generated = CarePlan.generate(state, { today: '2026-10-25' });
  assert.ok(generated.some(task => task.definitionId === 'prepare-whelping-area' && task.dueDate === '2026-10-25'));
  assert.equal(generated.some(task => task.dueDate < '2026-10-25'), false);
});

test('each onboarding entry stage generates the expected first-day care', () => {
  const cases = [
    {
      status: 'pregnancy-in-progress',
      pregnancy: { status: 'pregnancy-in-progress', dateType: 'estimated-conception', primaryDate: '2026-09-25' },
      expected: 'confirm-whelping-plan'
    },
    {
      status: 'near-delivery',
      pregnancy: { status: 'near-delivery', dateType: 'vet-due', primaryDate: '2026-10-29', vetDueDate: '2026-10-29' },
      expected: 'prepare-whelping-area'
    },
    {
      status: 'labour',
      pregnancy: { status: 'labour' },
      expected: 'open-delivery-mode'
    },
    {
      status: 'puppies-born',
      pregnancy: { status: 'puppies-born', dateType: 'birth', primaryDate: '2026-10-25' },
      litter: { id: 'litter-1', birthDate: '2026-10-25', puppyIds: [] },
      expected: 'daily-puppy-check'
    }
  ];

  cases.forEach(entry => {
    const generated = CarePlan.generate(baseState({
      pregnancy: entry.pregnancy,
      ...(entry.litter ? { litter: entry.litter } : {})
    }), { today: '2026-10-25' });
    assert.ok(generated.some(task => task.definitionId === entry.expected && task.dueDate === '2026-10-25'), entry.status);
    assert.equal(generated.some(task => task.dueDate < '2026-10-25'), false, entry.status);
  });
});

test('late puppy joiner receives no historical recurring tasks', () => {
  const state = baseState({
    pregnancy: { status: 'puppies-born' },
    litter: { id: 'litter-1', birthDate: '2026-08-01', puppyIds: [] }
  });
  const generated = CarePlan.generate(state, { today: '2026-10-25' });
  assert.equal(generated.some(task => task.definitionId === 'daily-puppy-check'), false);
  assert.equal(generated.some(task => task.dueDate < '2026-10-25'), false);
});

test('first-week litter gets two weight tasks for each day', () => {
  const state = baseState({
    pregnancy: { status: 'puppies-born' },
    litter: { id: 'litter-1', birthDate: '2026-10-25', puppyIds: [] }
  });
  const generated = CarePlan.generate(state, { today: '2026-10-25' });
  const weights = generated.filter(task => task.definitionId.startsWith('weigh-puppies-'));
  assert.equal(weights.filter(task => task.dueDate === '2026-10-25').length, 2);
  assert.equal(weights.filter(task => task.dueDate === '2026-10-31').length, 2);
});

test('reconcile preserves completion and does not duplicate instances', () => {
  const state = baseState({ pregnancy: { status: 'labour' } });
  const generated = CarePlan.generate(state, { today: '2026-10-25' });
  Tasks.reconcile(state, generated, '2026-10-25T08:00:00.000Z');
  const id = generated[0].id;
  assert.equal(Tasks.complete(state, id, '2026-10-25T09:00:00.000Z'), true);
  Tasks.reconcile(state, generated, '2026-10-25T10:00:00.000Z');
  assert.equal(state.taskInstances.filter(task => task.id === id).length, 1);
  assert.equal(Tasks.findTask(state, id).status, 'completed');
});

test('changing the due-date anchor replaces only incomplete future tasks and keeps history', () => {
  const state = baseState({
    pregnancy: { status: 'pregnancy-in-progress', dateType: 'vet-due', primaryDate: '2026-11-20', vetDueDate: '2026-11-20' }
  });
  Tasks.reconcile(state, CarePlan.generate(state, { today: '2026-10-25' }), '2026-10-25T08:00:00.000Z');
  const completed = state.taskInstances.find(task => task.definitionId === 'save-vet-contacts');
  const oldFutureDates = state.taskInstances.filter(task => task.dueDate > '2026-10-25').map(task => task.dueDate);
  Tasks.complete(state, completed.id, '2026-10-25T09:00:00.000Z');

  state.pregnancy.primaryDate = '2026-12-01';
  state.pregnancy.vetDueDate = '2026-12-01';
  Tasks.reconcile(state, CarePlan.generate(state, { today: '2026-10-25' }), '2026-10-25T10:00:00.000Z');

  assert.equal(Tasks.findTask(state, completed.id).status, 'completed');
  assert.equal(state.taskEvents.filter(event => event.taskId === completed.id && event.action === 'completed').length, 1);
  assert.equal(state.taskInstances.some(task => task.status === 'pending' && oldFutureDates.includes(task.dueDate)), false);
  assert.equal(new Set(state.taskInstances.map(task => task.id)).size, state.taskInstances.length);
  assert.ok(state.taskInstances.some(task => task.definitionId === 'prepare-whelping-area' && task.dueDate === '2026-11-17'));
});

test('reschedule keeps one task and records history', () => {
  const state = baseState({ pregnancy: { status: 'labour' } });
  const generated = CarePlan.generate(state, { today: '2026-10-25' });
  Tasks.reconcile(state, generated, '2026-10-25T08:00:00.000Z');
  const id = generated[0].id;
  assert.equal(Tasks.reschedule(state, id, '2026-10-27', '2026-10-25T09:00:00.000Z'), true);
  Tasks.reconcile(state, generated, '2026-10-25T10:00:00.000Z');
  assert.equal(Tasks.findTask(state, id).dueDate, '2026-10-27');
  assert.equal(state.taskInstances.filter(task => task.id === id).length, 1);
  assert.equal(state.taskEvents.at(-1).action, 'rescheduled');
});

test('custom tasks appear in the correct view and can be skipped', () => {
  const state = baseState();
  const custom = Tasks.addCustom(state, { title: 'Call breeder', dueDate: '2026-10-26', subjectId: 'mother' }, '2026-10-25T08:00:00.000Z');
  assert.ok(custom);
  assert.equal(Tasks.views(state, '2026-10-25').upcoming.length, 1);
  assert.equal(Tasks.skip(state, custom.id, '2026-10-25T09:00:00.000Z'), true);
  assert.equal(Tasks.views(state, '2026-10-25').upcoming.length, 0);
});

test('a record can complete the matching generated task by definition and date', () => {
  const state = baseState({
    pregnancy: { status: 'puppies-born' },
    litter: { id: 'litter-1', birthDate: '2026-10-25', puppyIds: [] }
  });
  Tasks.reconcile(state, CarePlan.generate(state, { today: '2026-10-25' }), '2026-10-25T08:00:00.000Z');
  const completed = Tasks.completeByDefinition(state, 'daily-mother-check', '2026-10-25', '2026-10-25T09:00:00.000Z');
  assert.ok(completed);
  assert.equal(completed.status, 'completed');
  assert.equal(state.taskEvents.at(-1).taskDefinitionId, 'daily-mother-check');
});

test('custom tasks can belong to an individual puppy', () => {
  const state = baseState();
  const custom = Tasks.addCustom(state, {
    title: 'Bring blue-collar puppy notes', dueDate: '2026-10-26', subjectId: 'p1', subjectType: 'puppy'
  }, '2026-10-25T08:00:00.000Z');
  assert.equal(custom.subjectId, 'p1');
  assert.equal(custom.subjectType, 'puppy');
});

test('a litter birth date is never treated as a future pregnancy due date', () => {
  const state = baseState({
    pregnancy: { status: 'puppies-born', dateType: 'birth', primaryDate: '2026-10-25' },
    litter: { id: 'litter-1', motherDogId: 'mother', birthDate: '2026-10-25', puppyIds: [] }
  });
  assert.equal(CarePlan.estimatedDueDate(state), '');
});
