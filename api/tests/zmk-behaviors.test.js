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

  await t.test('FR-001: Modern system behaviors &sys_reset, &soft_off, &kt and backward-compatible &reset', () => {
    const sysReset = behaviors.find(b => b.code === '&sys_reset');
    assert.ok(sysReset, '&sys_reset behavior must exist');

    const reset = behaviors.find(b => b.code === '&reset');
    assert.ok(reset, '&reset legacy behavior must exist');

    const softOff = behaviors.find(b => b.code === '&soft_off');
    assert.ok(softOff, '&soft_off behavior must exist');

    const kt = behaviors.find(b => b.code === '&kt');
    assert.ok(kt, '&kt behavior must exist');
    assert.deepEqual(kt.params, ['code'], '&kt must accept a keycode parameter');
  });

  await t.test('FR-004: RGB_COLOR_HSB must accept hue, sat, and bri parameters', () => {
    const rgbBehavior = behaviors.find(b => b.code === '&rgb_ug');
    assert.ok(rgbBehavior, '&rgb_ug behavior must exist');

    const hsbCmd = rgbBehavior.commands.find(c => c.code === 'RGB_COLOR_HSB');
    assert.ok(hsbCmd, 'RGB_COLOR_HSB command must exist');
    assert.ok(Array.isArray(hsbCmd.additionalParams), 'RGB_COLOR_HSB must have additionalParams');

    const hue = hsbCmd.additionalParams.find(p => p.name === 'hue');
    const sat = hsbCmd.additionalParams.find(p => p.name === 'sat');
    const bri = hsbCmd.additionalParams.find(p => p.name === 'bri');

    assert.ok(hue && hue.min === 0 && hue.max === 360, 'Hue should be 0-360');
    assert.ok(sat && sat.min === 0 && sat.max === 100, 'Saturation should be 0-100');
    assert.ok(bri && bri.min === 0 && bri.max === 100, 'Brightness should be 0-100');
  });
});
