const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

test('ZMK Keycodes Metadata Tests', async (t) => {
  const filePath = path.resolve(__dirname, '../services/zmk/data/zmk-keycodes.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let keycodes;

  await t.test('zmk-keycodes.json should be valid JSON array', () => {
    assert.doesNotThrow(() => {
      keycodes = JSON.parse(fileContent);
    });
    assert.ok(Array.isArray(keycodes));
  });

  await t.test('FR-005: Modern consumer, multimedia and navigation keycodes are present', () => {
    const allNames = new Set(keycodes.flatMap(k => k.names));
    const requiredModernKeycodes = [
      'C_MIC_MUTE',
      'C_MUTE_MIC',
      'C_AL_TASK_OR_APP',
      'C_AL_WWW',
      'C_KB_LAYOUT_SELECT',
      'C_ILLUMINATION_TOGGLE'
    ];

    for (const code of requiredModernKeycodes) {
      assert.ok(allNames.has(code), `Expected keycode ${code} to be present in catalog`);
    }
  });
});
