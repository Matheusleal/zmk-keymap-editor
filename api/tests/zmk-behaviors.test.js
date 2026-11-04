const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

test('ZMK Behaviors Metadata Tests', async (t) => {
  const filePath = path.resolve(__dirname, '../services/zmk/data/zmk-behaviors.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let behaviors;

  await t.test('zmk-behaviors.json should be valid JSON array', () => {
    assert.doesNotThrow(() => {
      behaviors = JSON.parse(fileContent);
    });
    assert.ok(Array.isArray(behaviors));
  });

  await t.test('FR-002: &out behavior descriptions must be semantically correct', () => {
    const outBehavior = behaviors.find(b => b.code === '&out');
    assert.ok(outBehavior, '&out behavior must exist');

    const bleCommand = outBehavior.commands.find(c => c.code === 'OUT_BLE');
    assert.ok(bleCommand, 'OUT_BLE command must exist');
    assert.match(bleCommand.description, /Bluetooth/i, 'OUT_BLE should describe Bluetooth profile');

    const usbCommand = outBehavior.commands.find(c => c.code === 'OUT_USB');
    assert.ok(usbCommand, 'OUT_USB command must exist');
    assert.match(usbCommand.description, /USB/i, 'OUT_USB should describe USB');
  });

  await t.test('FR-003: &bt behavior must support BT_CLR_ALL and BT_DISC', () => {
    const btBehavior = behaviors.find(b => b.code === '&bt');
    assert.ok(btBehavior, '&bt behavior must exist');

    const clrAll = btBehavior.commands.find(c => c.code === 'BT_CLR_ALL');
    assert.ok(clrAll, 'BT_CLR_ALL command must exist');
    assert.match(clrAll.description, /all profiles/i);

    const disc = btBehavior.commands.find(c => c.code === 'BT_DISC');
    assert.ok(disc, 'BT_DISC command must exist');
    assert.ok(disc.additionalParams && disc.additionalParams.length > 0, 'BT_DISC should have additional parameters');
    const indexParam = disc.additionalParams.find(p => p.name === 'index');
    assert.ok(indexParam, 'BT_DISC must have index parameter');
    assert.deepEqual(indexParam.enum, [0, 1, 2, 3, 4], 'BT_DISC profiles must be [0, 1, 2, 3, 4]');
  });
});
