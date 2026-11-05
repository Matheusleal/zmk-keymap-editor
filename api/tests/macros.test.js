const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeymap, validateKeymapJson } = require('../services/zmk/keymap');

test('Macros Devicetree Serializer and Model Tests', async (t) => {
  const sampleLayout = [
    { x: 0, y: 0 },
    { x: 1, y: 0 }
  ];

  const sampleKeymap = {
    keyboard: 'test_board',
    layer_names: ['Base'],
    layers: [
      [
        { value: '&kp', params: [{ value: 'A', params: [] }] },
        { value: '&kp', params: [{ value: 'B', params: [] }] }
      ]
    ],
    macros: [
      {
        name: 'zed_em_kay',
        wait_ms: 30,
        tap_ms: 40,
        bindings: [
          '&macro_press &kp LSHFT',
          '&macro_tap &kp Z &kp M &kp K',
          '&macro_release &kp LSHFT'
        ]
      },
      {
        name: 'hello_world',
        bindings: [
          { action: 'press', binding: '&kp LCTRL' },
          { action: 'wait_time', value: 100 },
          { action: 'tap', binding: '&kp C' },
          { action: 'release', binding: '&kp LCTRL' }
        ]
      }
    ]
  };

  await t.test('FR-007: generateKeymap generates valid DTS macros node', () => {
    const result = generateKeymap(sampleLayout, sampleKeymap);
    assert.ok(result.code.includes('macros {'), 'Should contain macros node');
    assert.ok(result.code.includes('compatible = "zmk,behavior-macro";'), 'Should declare compatible = "zmk,behavior-macro"');
    assert.ok(result.code.includes('#binding-cells = <0>;'), 'Should declare #binding-cells = <0>');

    assert.ok(result.code.includes('zed_em_kay: zed_em_kay {'), 'Should declare zed_em_kay label and node');
    assert.ok(result.code.includes('wait-ms = <30>;'), 'Should set wait-ms = <30>');
    assert.ok(result.code.includes('tap-ms = <40>;'), 'Should set tap-ms = <40>');
    assert.ok(result.code.includes('<&macro_press &kp LSHFT>'), 'Should have &macro_press binding');
    assert.ok(result.code.includes('<&macro_tap &kp Z &kp M &kp K>'), 'Should have &macro_tap binding');
    assert.ok(result.code.includes('<&macro_release &kp LSHFT>'), 'Should have &macro_release binding');

    assert.ok(result.code.includes('hello_world: hello_world {'), 'Should declare hello_world node');
    assert.ok(result.code.includes('<&macro_wait_time 100>'), 'Should support wait_time action');
    assert.ok(result.code.includes('<&macro_tap &kp C>'), 'Should support tap action');
  });

  await t.test('validateKeymapJson validates macro definitions', () => {
    assert.doesNotThrow(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        macros: [
          { name: 'm1', bindings: ['&kp A'] }
        ]
      });
    });

    assert.throws(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        macros: 'not-an-array'
      });
    }, /"macros" must be an array/);

    assert.throws(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        macros: [{ name: 'invalid_macro', bindings: [] }]
      });
    }, /non-empty "bindings" array/);
  });
});
