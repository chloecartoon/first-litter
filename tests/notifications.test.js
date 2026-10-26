'use strict';

const assert = require('node:assert/strict');
const Notifications = require('../js/notifications.js');

function test(name, fn) {
  try {
    fn();
    console.log('✓', name);
  } catch (error) {
    console.error('✗', name);
    throw error;
  }
}

test('invalid reminder times fall back to nine in the morning', () => {
  assert.equal(Notifications.normalizeTime('18:30'), '18:30');
  assert.equal(Notifications.normalizeTime('25:00'), '09:00');
  assert.equal(Notifications.normalizeTime(''), '09:00');
});

test('iPhone requires the installed Home Screen app', () => {
  const result = Notifications.supportStatus({
    isSecureContext: true,
    standalone: false,
    navigator: { userAgent: 'iPhone', serviceWorker: {} },
    Notification: { permission: 'default' }
  });
  assert.equal(result.supported, false);
  assert.equal(result.code, 'ios-install-required');
});

test('supported installed apps report the current permission', () => {
  const result = Notifications.supportStatus({
    isSecureContext: true,
    standalone: true,
    navigator: { userAgent: 'iPhone', serviceWorker: {} },
    Notification: { permission: 'granted' }
  });
  assert.equal(result.supported, true);
  assert.equal(result.permission, 'granted');
});

test('next reminder moves to tomorrow after the chosen time', () => {
  assert.equal(
    Notifications.nextReminderAt('09:00', '2026-10-25T10:00:00').toISOString().slice(0, 10),
    '2026-10-26'
  );
  assert.equal(
    Notifications.nextReminderAt('11:00', '2026-10-25T10:00:00').toISOString().slice(0, 10),
    '2026-10-25'
  );
});

test('important-care reminders contain a count but no dog or medical data', () => {
  const payload = Notifications.reminderPayload(3);
  assert.match(payload.body, /3 important care tasks/);
  assert.equal(JSON.stringify(payload).includes('Mochi'), false);
  assert.deepEqual(payload.data, { url: 'app.html?open=today' });
});

test('one reminder is sent per day only when important care is due', () => {
  const tasks = [{ id: 'task-1' }];
  assert.equal(Notifications.shouldNotify({ enabled: true }, tasks, '2026-10-25', 'granted'), true);
  assert.equal(Notifications.shouldNotify({ enabled: true, lastReminderDate: '2026-10-25' }, tasks, '2026-10-25', 'granted'), false);
  assert.equal(Notifications.shouldNotify({ enabled: true }, [], '2026-10-25', 'granted'), false);
  assert.equal(Notifications.shouldNotify({ enabled: false }, tasks, '2026-10-25', 'granted'), false);
});

test('server subscription record contains only endpoint keys and timing', () => {
  const record = Notifications.minimalSubscriptionRecord({
    endpoint: 'https://push.example/subscription',
    expirationTime: null,
    keys: { p256dh: 'public-key', auth: 'auth-key' },
    dogName: 'must not leave device'
  }, { reminderTime: '08:15', timeZone: 'Asia/Kuala_Lumpur', dogName: 'must not leave device' });
  assert.deepEqual(Object.keys(record).sort(), ['reminderTime', 'subscription', 'timeZone']);
  assert.equal(JSON.stringify(record).includes('dogName'), false);
  assert.equal(record.reminderTime, '08:15');
});
