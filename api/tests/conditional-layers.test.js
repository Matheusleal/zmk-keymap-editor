const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeymap, validateKeymapJson } = require('../services/zmk/keymap');

test('Conditional Layers Devicetree Serializer and Model Tests', async (t) => {
  const sampleLayout = [
    { x: 0, y: 0 },
    { x: 1, y: 0 }
  ];

  const sampleKeymap = {
    keyboard: 'test_board',
    layer_names: ['Base', 'Lower', 'Raise', 'Adjust'],
    layers: [
      [{ value: '&kp', params: [{ value: 'A', params: [] }] }, { value: '&kp', params: [{ value: 'B', params: [] }] }],
      [{ value: '&trans', params: [] }, { value: '&trans', params: [] }],
      [{ value: '&trans', params: [] }, { value: '&trans', params: [] }],
      [{ value: '&sys_reset', params: [] }, { value: '&bootloader', params: [] }]
    ],
    conditional_layers: [
      {
        name: 'tri_layer',
        if_layers: [1, 2],
        then_layer: 3
      }
    ]
  };

  await t.test('FR-008: generateKeymap generates valid DTS conditional_layers node', () => {
    const result = generateKeymap(sampleLayout, sampleKeymap);
    assert.ok(result.code.includes('conditional_layers {'), 'Should contain conditional_layers block');
    assert.ok(result.code.includes('compatible = "zmk,conditional-layers";'), 'Should declare compatible = "zmk,conditional-layers"');
    assert.ok(result.code.includes('tri_layer {'), 'Should declare rule node tri_layer');
    assert.ok(result.code.includes('if-layers = <1 2>;'), 'Should set if-layers = <1 2>');
    assert.ok(result.code.includes('then-layer = <3>;'), 'Should set then-layer = <3>');
  });

  await t.test('validateKeymapJson validates conditional layers definitions', () => {
    assert.doesNotThrow(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        conditional_layers: [
          { name: 'rule1', if_layers: [1, 2], then_layer: 3 }
        ]
      });
    });

    assert.throws(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        conditional_layers: 'not-an-array'
      });
    }, /"conditional_layers" must be an array/);

    assert.throws(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        conditional_layers: [{ name: 'invalid_rule', if_layers: [1], then_layer: 2 }]
      });
    }, /at least 2 layers/);
  });
});
