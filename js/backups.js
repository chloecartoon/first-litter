(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FirstLitterBackups = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DB_NAME = 'first-litter-recovery';
  const DB_VERSION = 1;
  const STORE_NAME = 'snapshots';
  const MAX_SNAPSHOTS = 3;
  const MANUAL_BACKUP_REMINDER_DAYS = 7;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function jsonBytes(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
    return unescape(encodeURIComponent(text)).length;
  }

  function formatBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return value + ' B';
    if (value < 1024 * 1024) return Math.round(value / 1024) + ' KB';
    return (value / (1024 * 1024)).toFixed(value < 10 * 1024 * 1024 ? 1 : 0) + ' MB';
  }

  function daysBetween(earlier, later) {
    const from = new Date(earlier);
    const to = new Date(later || Date.now());
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
    return Math.floor((to.getTime() - from.getTime()) / 86400000);
  }

  function manualBackupDue(backupMeta, onboarding, now) {
    const meta = backupMeta || {};
    const startedAt = meta.lastManualBackupAt || (onboarding && onboarding.completedAt);
    if (!startedAt) return false;
    return daysBetween(startedAt, now) >= MANUAL_BACKUP_REMINDER_DAYS;
  }

  function snapshotDue(backupMeta, now) {
    const last = backupMeta && backupMeta.lastAutoSnapshotAt;
    if (!last) return true;
    return daysBetween(last, now) >= 1;
  }

  function openDatabase(indexedDb) {
    const idb = indexedDb || (typeof indexedDB !== 'undefined' ? indexedDB : null);
    if (!idb) return Promise.reject(new Error('Automatic recovery copies are not supported in this browser.'));
    return new Promise((resolve, reject) => {
      const request = idb.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open recovery storage.'));
    });
  }

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Recovery storage operation failed.'));
    });
  }

  async function prune(db, keep) {
    const readTransaction = db.transaction(STORE_NAME, 'readonly');
    const records = await requestResult(readTransaction.objectStore(STORE_NAME).getAll());
    const expired = records
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(Math.max(1, Number(keep) || MAX_SNAPSHOTS));
    for (const record of expired) {
      const writeTransaction = db.transaction(STORE_NAME, 'readwrite');
      await requestResult(writeTransaction.objectStore(STORE_NAME).delete(record.id));
    }
  }

  async function captureSnapshot(state, options) {
    const opts = options || {};
    const createdAt = new Date(opts.now || Date.now()).toISOString();
    const storedState = clone(state);
    const record = {
      id: createdAt + ':' + (opts.reason || 'automatic'),
      createdAt,
      reason: opts.reason || 'automatic',
      schemaVersion: storedState.schemaVersion || null,
      sizeBytes: jsonBytes(storedState),
      state: storedState
    };
    const db = await openDatabase(opts.indexedDB);
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      await requestResult(transaction.objectStore(STORE_NAME).put(record));
      await prune(db, opts.keep || MAX_SNAPSHOTS);
      return { ...record, state: undefined };
    } finally {
      db.close();
    }
  }

  async function listSnapshots(options) {
    const db = await openDatabase(options && options.indexedDB);
    try {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const records = await requestResult(transaction.objectStore(STORE_NAME).getAll());
      return records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    } finally {
      db.close();
    }
  }

  async function requestPersistence(storageManager) {
    const manager = storageManager || (typeof navigator !== 'undefined' ? navigator.storage : null);
    if (!manager || typeof manager.persisted !== 'function' || typeof manager.persist !== 'function') {
      return { supported: false, granted: false, alreadyGranted: false };
    }
    const alreadyGranted = await manager.persisted();
    if (alreadyGranted) return { supported: true, granted: true, alreadyGranted: true };
    const granted = await manager.persist();
    return { supported: true, granted: Boolean(granted), alreadyGranted: false };
  }

  async function storageEstimate(storageManager) {
    const manager = storageManager || (typeof navigator !== 'undefined' ? navigator.storage : null);
    if (!manager || typeof manager.estimate !== 'function') return null;
    const result = await manager.estimate();
    return {
      usage: Number(result.usage) || 0,
      quota: Number(result.quota) || 0
    };
  }

  return Object.freeze({
    DB_NAME,
    STORE_NAME,
    MAX_SNAPSHOTS,
    MANUAL_BACKUP_REMINDER_DAYS,
    jsonBytes,
    formatBytes,
    manualBackupDue,
    snapshotDue,
    captureSnapshot,
    listSnapshots,
    requestPersistence,
    storageEstimate
  });
});
