const test = require('node:test')
const assert = require('node:assert/strict')
const { generateKeymapSvg, formatBindingLabel } = require('../services/zmk/export/svgDrawer')

test('Keymap SVG Drawer (Keymap Drawer Style) Tests', async (t) => {
  await t.test('formatBindingLabel formats standard ZMK bindings for visualization', () => {
    assert.equal(formatBindingLabel('&kp A'), 'A')
    assert.equal(formatBindingLabel('&kp SPACE'), 'SPACE')
    assert.equal(formatBindingLabel('&trans'), '▽')
    assert.equal(formatBindingLabel('&none'), '')
    assert.equal(formatBindingLabel('&mo 1'), 'MO(1)')
    assert.equal(formatBindingLabel('&to 2'), 'TO(2)')
    assert.equal(formatBindingLabel('&mkp LCLK'), 'LCLK')
    assert.equal(formatBindingLabel('&mmv MOVE_UP'), 'MMV(UP)')
    assert.equal(formatBindingLabel({ value: '&kp', params: [{ value: 'ENTER' }] }), 'ENTER')
  })

  await t.test('FR-016: generateKeymapSvg renders multi-layer SVG with layers and keycaps', () => {
    const layout = [
      { x: 0, y: 0, u: 1, h: 1 },
      { x: 1, y: 0, u: 1, h: 1 },
      { x: 2, y: 0, u: 1, h: 1 }
    ]

    const keymap = {
      layer_names: ['Base', 'Lower'],
      layers: [
        ['&kp Q', '&kp W', '&kp E'],
        ['&kp N1', '&kp N2', '&trans']
      ]
    }

    const svg = generateKeymapSvg(layout, keymap)

    assert.ok(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
    assert.match(svg, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    assert.match(svg, /<\/svg>/)

    // Checks layer titles
    assert.match(svg, /Base/)
    assert.match(svg, /Lower/)

    // Checks key text labels
    assert.match(svg, />Q<\/text>/)
    assert.match(svg, />W<\/text>/)
    assert.match(svg, />E<\/text>/)
    assert.match(svg, />N1<\/text>/)
    assert.match(svg, />▽<\/text>/)
  })

  await t.test('FR-016: generateKeymapSvg renders combos and sensor-bindings if present', () => {
    const layout = [
      { x: 0, y: 0 },
      { x: 1, y: 0 }
    ]

    const keymap = {
      layer_names: ['Default'],
      layers: [['&kp J', '&kp K']],
      combos: [
        {
          name: 'combo_esc',
          key_positions: [0, 1],
          bindings: '&kp ESC',
          layers: [0]
        }
      ],
      sensor_bindings: ['&inc_dec_kp C_VOL_UP C_VOL_DN']
    }

    const svg = generateKeymapSvg(layout, keymap)

    assert.match(svg, />Combos<\/text>/)
    assert.match(svg, /\[0, 1\] ➔ ESC/)
    assert.match(svg, /⟲⟳ Encoder: &amp;inc_dec_kp C_VOL_UP C_VOL_DN/)
  })

  await t.test('generateKeymapSvg validates layout input', () => {
    assert.throws(() => {
      generateKeymapSvg([], { layers: [] })
    }, /Layout must be a non-empty array/)
  })
})
