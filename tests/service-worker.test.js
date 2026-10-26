'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

function test(name, fn) {
  try { fn(); console.log('✓', name); }
  catch (error) { console.error('✗', name); throw error; }
}

function coreAssets() {
  const match = sw.match(/const CORE_ASSETS = (\[[\s\S]*?\]);/);
  assert.ok(match, 'CORE_ASSETS must be declared as a literal array');
  return Function(`"use strict"; return ${match[1]};`)();
}

function normalizeAsset(value) {
  return value.replace(/^\.\//, '').split(/[?#]/)[0];
}

test('service worker caches the installed start page and every local app dependency', () => {
  const cached = new Set(coreAssets().map(normalizeAsset));
  const required = new Set(['index.html', 'app.html', 'manifest.json', normalizeAsset(manifest.start_url)]);

  for (const icon of manifest.icons || []) required.add(normalizeAsset(icon.src));
  for (const match of app.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|tel:|data:|#)/.test(value) || value.includes('${')) continue;
    required.add(normalizeAsset(value));
  }

  const missing = [...required].filter(asset => asset && !cached.has(asset));
  assert.deepEqual(missing, []);
});

test('cache version changes when the offline shell changes', () => {
  assert.match(sw, /const CACHE_NAME = 'first-litter-v\d+';/);
});
