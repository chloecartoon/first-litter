(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FirstLitterNotifications = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_REMINDER_TIME = '09:00';

  function normalizeTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || '')) ? String(value) : DEFAULT_REMINDER_TIME;
  }

  function isIos(userAgent) {
    return /iPad|iPhone|iPod/.test(String(userAgent || ''));
  }

  function supportStatus(environment) {
    const env = environment || {};
    const nav = env.navigator || (typeof navigator !== 'undefined' ? navigator : {});
    const notification = env.Notification || (typeof Notification !== 'undefined' ? Notification : null);
    const secure = env.isSecureContext !== undefined
      ? env.isSecureContext
      : (typeof isSecureContext !== 'undefined' ? isSecureContext : false);
    const standalone = env.standalone !== undefined
      ? env.standalone
      : Boolean(nav.standalone || (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches));

    if (!secure) return { supported: false, code: 'secure-context-required', permission: 'unavailable' };
    if (!notification || !nav.serviceWorker) return { supported: false, code: 'unsupported', permission: 'unavailable' };
    if (isIos(nav.userAgent) && !standalone) {
      return { supported: false, code: 'ios-install-required', permission: notification.permission || 'default' };
    }
    return { supported: true, code: 'supported', permission: notification.permission || 'default' };
  }

  function nextReminderAt(time, now) {
    const value = normalizeTime(time);
    const [hours, minutes] = value.split(':').map(Number);
    const current = new Date(now || Date.now());
    const next = new Date(current);
    next.setHours(hours, minutes, 0, 0);
    if (next.getTime() <= current.getTime()) next.setDate(next.getDate() + 1);
    return next;
  }

  function reminderPayload(taskCount) {
    const count = Math.max(0, Number(taskCount) || 0);
    return {
      title: 'First Litter',
      body: count === 1
        ? '1 important care task needs your attention today.'
        : `${count} important care tasks need your attention today.`,
      tag: 'first-litter-important-care',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      data: { url: 'app.html?open=today' }
    };
  }

  function shouldNotify(preferences, tasks, today, permission) {
    const prefs = preferences || {};
    return Boolean(
      prefs.enabled &&
      permission === 'granted' &&
      Array.isArray(tasks) && tasks.length > 0 &&
      prefs.lastReminderDate !== today
    );
  }

  function minimalSubscriptionRecord(subscription, preferences) {
    const raw = subscription && typeof subscription.toJSON === 'function' ? subscription.toJSON() : subscription;
    if (!raw || !raw.endpoint) throw new Error('Push subscription is missing its endpoint.');
    return {
      subscription: {
        endpoint: raw.endpoint,
        expirationTime: raw.expirationTime || null,
        keys: raw.keys ? { p256dh: raw.keys.p256dh, auth: raw.keys.auth } : undefined
      },
      reminderTime: normalizeTime(preferences && preferences.reminderTime),
      timeZone: (preferences && preferences.timeZone) || 'UTC'
    };
  }

  function urlBase64ToUint8Array(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
    return Uint8Array.from([...raw].map(character => character.charCodeAt(0)));
  }

  async function subscribe(registration, vapidPublicKey) {
    if (!registration || !registration.pushManager) throw new Error('Background push is not supported here.');
    if (!vapidPublicKey) throw new Error('Background push has not been connected yet.');
    const existing = await registration.pushManager.getSubscription();
    return existing || registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
  }

  return Object.freeze({
    DEFAULT_REMINDER_TIME,
    normalizeTime,
    isIos,
    supportStatus,
    nextReminderAt,
    reminderPayload,
    shouldNotify,
    minimalSubscriptionRecord,
    urlBase64ToUint8Array,
    subscribe
  });
});
