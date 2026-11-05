const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const fs = require('fs')

const zmkBehaviors = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../services/zmk/data/zmk-behaviors.json'))
)
const zmkKeycodes = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../services/zmk/data/zmk-keycodes.json'))
)
const { generateKeymap } = require('../services/zmk/keymap')

test('ZMK Pointing and Mouse Subsystem Tests', async (t) => {
  await t.test('behaviors include &mkp, &mmv, and &msc pointing definitions', () => {
    const mkp = zmkBehaviors.find(b => b.code === '&mkp')
    const mmv = zmkBehaviors.find(b => b.code === '&mmv')
    const msc = zmkBehaviors.find(b => b.code === '&msc')

    assert.ok(mkp, '&mkp should be defined')
    assert.ok(mmv, '&mmv should be defined')
    assert.ok(msc, '&msc should be defined')

    assert.deepEqual(mkp.includes, ['#include <dt-bindings/zmk/pointing.h>'])
    assert.deepEqual(mmv.includes, ['#include <dt-bindings/zmk/pointing.h>'])
    assert.deepEqual(msc.includes, ['#include <dt-bindings/zmk/pointing.h>'])

    const mkpCommands = mkp.commands.map(c => c.code)
    assert.ok(mkpCommands.includes('LCLK'))
    assert.ok(mkpCommands.includes('RCLK'))
    assert.ok(mkpCommands.includes('MCLK'))
    assert.ok(mkpCommands.includes('MB4'))
    assert.ok(mkpCommands.includes('MB5'))

    const mmvCommands = mmv.commands.map(c => c.code)
    assert.ok(mmvCommands.includes('MOVE_UP'))
    assert.ok(mmvCommands.includes('MOVE_DOWN'))
    assert.ok(mmvCommands.includes('MOVE_LEFT'))
    assert.ok(mmvCommands.includes('MOVE_RIGHT'))

    const mscCommands = msc.commands.map(c => c.code)
    assert.ok(mscCommands.includes('SCRL_UP'))
    assert.ok(mscCommands.includes('SCRL_DOWN'))
  })

  await t.test('keycodes contain pointing category keys', () => {
    const pointingKeycodes = zmkKeycodes.filter(k => k.context === 'Pointing')
    assert.ok(pointingKeycodes.length >= 8, 'Pointing keycodes should be defined')

    const names = pointingKeycodes.flatMap(k => k.names)
    assert.ok(names.includes('LCLK'))
    assert.ok(names.includes('RCLK'))
    assert.ok(names.includes('MOVE_UP'))
    assert.ok(names.includes('SCRL_DOWN'))
  })

  await t.test('generateKeymap includes dt-bindings/zmk/pointing.h when mouse keys are used', () => {
    const layout = [{ x: 0, y: 0 }]
    const keymap = {
      keyboard: 'test_mouse_board',
      layers: [
        [{ value: '&mkp', params: [{ value: 'LCLK' }] }]
      ]
    }

    const output = generateKeymap(layout, keymap)
    assert.match(output.code, /#include <dt-bindings\/zmk\/pointing\.h>/)
    assert.match(output.code, /&mkp LCLK/)
  })
})
