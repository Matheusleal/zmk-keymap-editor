const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeymap, validateKeymapJson } = require('../services/zmk/keymap');

test('Custom Behaviors Devicetree Serializer and Model Tests', async (t) => {
  const sampleLayout = [
    { x: 0, y: 0 },
    { x: 1, y: 0 }
  ];

  const sampleKeymap = {
    keyboard: 'test_board',
    layer_names: ['Base'],
    layers: [
      [{ value: '&hm', params: [{ value: 'LSHIFT', params: [] }, { value: 'A', params: [] }] }, { value: '&kp', params: [{ value: 'B', params: [] }] }]
    ],
    custom_behaviors: [
      {
        name: 'homerow_mods',
        code: '&hm',
        type: 'hold-tap',
        flavor: 'balanced',
        tapping_term_ms: 200,
        quick_tap_ms: 150,
        require_prior_idle_ms: 125,
        bindings: ['&kp', '&kp'],
        hold_trigger_key_positions: [5, 6, 7, 8],
        hold_trigger_on_release: true
      }
    ]
  };

  await t.test('FR-009: generateKeymap generates valid DTS custom hold-tap behaviors node', () => {
    const result = generateKeymap(sampleLayout, sampleKeymap);
    assert.ok(result.code.includes('behaviors {'), 'Should contain behaviors block');
    assert.ok(result.code.includes('compatible = "zmk,behavior-hold-tap";'), 'Should declare compatible = "zmk,behavior-hold-tap"');
    assert.ok(result.code.includes('hm: homerow_mods {'), 'Should declare node hm: homerow_mods');
    assert.ok(result.code.includes('flavor = "balanced";'), 'Should set flavor = "balanced"');
    assert.ok(result.code.includes('tapping-term-ms = <200>;'), 'Should set tapping-term-ms = <200>');
    assert.ok(result.code.includes('quick-tap-ms = <150>;'), 'Should set quick-tap-ms = <150>');
    assert.ok(result.code.includes('require-prior-idle-ms = <125>;'), 'Should set require-prior-idle-ms = <125>');
    assert.ok(result.code.includes('bindings = <&kp>, <&kp>;'), 'Should set bindings = <&kp>, <&kp>');
    assert.ok(result.code.includes('hold-trigger-key-positions = <5 6 7 8>;'), 'Should set hold-trigger-key-positions');
    assert.ok(result.code.includes('hold-trigger-on-release;'), 'Should set hold-trigger-on-release');
  });

  await t.test('validateKeymapJson validates custom behaviors definitions', () => {
    assert.doesNotThrow(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        custom_behaviors: [
          { name: 'hm', flavor: 'balanced' }
        ]
      });
    });

    assert.throws(() => {
      validateKeymapJson({
        layers: [['&kp A', '&kp B']],
        custom_behaviors: 'not-an-array'
      });
    }, /"behaviors" must be an array/);
  });
});
