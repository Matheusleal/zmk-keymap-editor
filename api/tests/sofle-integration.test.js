const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const { loadKeymapFromDts, parseKeymap } = require('../services/zmk/keymap')
const { loadLayout, loadKeymap } = require('../services/zmk/local-source')

const SOFLE_PATH = 'D:/Projects/github/mine/Matheusleal/zmk-sofle'

test('ZMK Sofle Repository Integration Tests (Read-Only)', async (t) => {
  const hasSofle = fs.existsSync(SOFLE_PATH)

  await t.test('loadKeymapFromDts parses eyelash_sofle.keymap into 3 layers and 64 keys', (context) => {
    if (!hasSofle) {
      context.skip('zmk-sofle repo not present at expected path')
      return
    }

    const keymapPath = path.join(SOFLE_PATH, 'config', 'eyelash_sofle.keymap')
    assert.ok(fs.existsSync(keymapPath), 'eyelash_sofle.keymap must exist')

    const dtsContent = fs.readFileSync(keymapPath, 'utf8')
    const loaded = loadKeymapFromDts(dtsContent)
    const parsed = parseKeymap(loaded)

    assert.equal(parsed.layers.length, 3, 'Must have 3 layers')
    assert.deepEqual(parsed.layer_names, ['LAYER 0', 'LAYER 1', 'LAYER 2'])

    for (let i = 0; i < 3; i++) {
      assert.equal(parsed.layers[i].length, 64, `Layer ${i} must have 64 keys`)
    }

    // Check pointing and special behaviors
    const layer0Key0 = parsed.layers[0][0]
    assert.equal(layer0Key0.value, '&kp')
    assert.equal(layer0Key0.params[0].value, 'ESC')

    // Layer 1 pointing keys (e.g. mkp LCLK, mmv MOVE_UP)
    const layer1Keys = parsed.layers[1]
    const hasMkp = layer1Keys.some(k => k.value === '&mkp')
    const hasMmv = layer1Keys.some(k => k.value === '&mmv')
    assert.ok(hasMkp, 'Layer 1 must contain &mkp')
    assert.ok(hasMmv, 'Layer 1 must contain &mmv')

    // Layer 2 system and rgb keys (&sys_reset, &soft_off, &rgb_ug)
    const layer2Keys = parsed.layers[2]
    const hasSysReset = layer2Keys.some(k => k.value === '&sys_reset')
    const hasSoftOff = layer2Keys.some(k => k.value === '&soft_off')
    const hasRgb = layer2Keys.some(k => k.value === '&rgb_ug')
    assert.ok(hasSysReset, 'Layer 2 must contain &sys_reset')
    assert.ok(hasSoftOff, 'Layer 2 must contain &soft_off')
    assert.ok(hasRgb, 'Layer 2 must contain &rgb_ug')

    // Encoders sensor-bindings
    assert.equal(parsed.sensor_bindings.length, 3, 'Must have sensor bindings for 3 layers')
    assert.match(parsed.sensor_bindings[0][0], /&inc_dec_kp/)
  })

  await t.test('local-source auto-discovers and loads layout and keymap', (context) => {
    if (!hasSofle) {
      context.skip('zmk-sofle repo not present at expected path')
      return
    }

    const layout = loadLayout()
    const keymap = loadKeymap()

    assert.equal(layout.length, 64, 'Layout must contain 64 keys')
    assert.equal(keymap.layers.length, 3, 'Keymap must contain 3 layers')
    assert.equal(keymap.layers[0].length, 64, 'Keymap layer 0 must contain 64 keys')
  })
})

