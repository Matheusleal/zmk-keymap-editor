const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeymap, validateKeymapJson } = require('../services/zmk/keymap');

test('Combos Devicetree Serializer and Model Tests', async (t) => {
  const sampleLayout = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ];

  const sampleKeymap = {
    keyboard: 'test_board',
    layer_names: ['Base'],
    layers: [
      [
        { value: '&kp', params: [{ value: 'A', params: [] }] },
        { value: '&kp', params: [{ value: 'B', params: [] }] },
        { value: '&kp', params: [{ value: 'C', params: [] }] }
      ]
    ],
    combos: [
      {
        name: 'combo_esc',
        timeout_ms: 40,
        key_positions: [0, 1],
        bindings: '&kp ESC',
        layers: [0]
      },
      {
        name: 'combo_reset',
        timeout_ms: 50,
        key_positions: [1, 2],
        bindings: '&sys_reset'
      }
    ]
  };

  await t.test('FR-006: generateKeymap generates valid DTS combos node', () => {
    const result = generateKeymap(sampleLayout, sampleKeymap);
    assert.ok(result.code.includes('combos {'), 'Should contain combos node');
    assert.ok(result.code.includes('compatible = "zmk,combos";'), 'Should declare compatible = "zmk,combos"');
    assert.ok(result.code.includes('combo_esc {'), 'Should declare combo_esc node');
    assert.ok(result.code.includes('timeout-ms = <40>;'), 'Should set timeout-ms = <40>');
    assert.ok(result.code.includes('key-positions = <0 1>;'), 'Should set key-positions = <0 1>');
    assert.ok(result.code.includes('bindings = <&kp ESC>;'), 'Should set bindings = <&kp ESC>');
    assert.ok(result.code.includes('layers = <0>;'), 'Should set layers = <0>');

    assert.ok(result.code.includes('combo_reset {'), 'Should declare combo_reset node');
    assert.ok(result.code.includes('bindings = <&sys_reset>;'), 'Should set bindings = <&sys_reset>');
  });

  await t.test('Combos headers include required behavior dt-bindings', () => {
    const result = generateKeymap(sampleLayout, sampleKeymap);
    assert.ok(result.code.includes('#include <dt-bindings/zmk/keys.h>'), 'Should include keys.h for &kp in combo');
    assert.ok(result.json.includes('"combos"'), 'JSON should serialize combos array');
  });

  await t.test('validateKeymapJson validates combo structure', () => {
    assert.doesNotThrow(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        combos: [
          { name: 'cb1', key_positions: [0, 1], bindings: '&kp ESC' }
        ]
      });
    });

    assert.throws(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        combos: 'not-an-array'
      });
    }, /"combos" must be an array/);

    assert.throws(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        combos: [{ name: 'cb_invalid', key_positions: [0] }]
      });
    }, /at least 2 positions/);
  });
});

