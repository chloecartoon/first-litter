'use strict';

const assert = require('node:assert/strict');
const Backups = require('../js/backups.js');

function test(name, fn) {
  try {
    fn();
    console.log('✓', name);
  } catch (error) {
    console.error('✗', name);
    throw error;
  }
}

test('backup size uses encoded JSON bytes', () => {
  assert.equal(Backups.jsonBytes({ name: 'Mochi' }), Buffer.byteLength(JSON.stringify({ name: 'Mochi' })));
  assert.ok(Backups.jsonBytes({ name: '小白' }) > JSON.stringify({ name: '小白' }).length);
});

test('automatic snapshots are due at most once per day', () => {
  assert.equal(Backups.snapshotDue({}, '2026-10-25T12:00:00.000Z'), true);
  assert.equal(Backups.snapshotDue({ lastAutoSnapshotAt: '2026-10-25T08:00:00.000Z' }, '2026-10-25T12:00:00.000Z'), false);
  assert.equal(Backups.snapshotDue({ lastAutoSnapshotAt: '2026-10-24T08:00:00.000Z' }, '2026-10-25T12:00:00.000Z'), true);
});

test('manual export reminder waits seven days', () => {
  const onboarding = { completedAt: '2026-10-18T08:00:00.000Z' };
  assert.equal(Backups.manualBackupDue({}, onboarding, '2026-10-24T08:00:00.000Z'), false);
  assert.equal(Backups.manualBackupDue({}, onboarding, '2026-10-25T08:00:00.000Z'), true);
  assert.equal(Backups.manualBackupDue({ lastManualBackupAt: '2026-10-23T08:00:00.000Z' }, onboarding, '2026-10-25T08:00:00.000Z'), false);
});

test('backup sizes are shown in owner-friendly units', () => {
  assert.equal(Backups.formatBytes(900), '900 B');
  assert.equal(Backups.formatBytes(2048), '2 KB');
  assert.equal(Backups.formatBytes(1572864), '1.5 MB');
});
