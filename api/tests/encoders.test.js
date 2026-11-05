const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeymap, loadKeymapFromDts, updateKeymapDts } = require('../services/zmk/keymap');

test('Rotary Encoders sensor-bindings Serializer and Model Tests', async (t) => {
  const sampleLayout = [
    { x: 0, y: 0 },
    { x: 1, y: 0 }
  ];

  const sampleKeymap = {
    keyboard: 'test_board',
    layer_names: ['Base', 'Media'],
    layers: [
      [{ value: '&kp', params: [{ value: 'A', params: [] }] }, { value: '&kp', params: [{ value: 'B', params: [] }] }],
      [{ value: '&trans', params: [] }, { value: '&trans', params: [] }]
    ],
    sensor_bindings: [
      ['&inc_dec_kp C_VOL_UP C_VOL_DN'],
      ['&inc_dec_kp PG_UP PG_DN']
    ]
  };

  await t.test('FR-013: generateKeymap generates valid DTS sensor-bindings in layer nodes', () => {
    const result = generateKeymap(sampleLayout, sampleKeymap);
    assert.ok(result.code.includes('sensor-bindings = <&inc_dec_kp C_VOL_UP C_VOL_DN>;'), 'Should set sensor-bindings on default_layer');
    assert.ok(result.code.includes('sensor-bindings = <&inc_dec_kp PG_UP PG_DN>;'), 'Should set sensor-bindings on Media layer');
  });

  await t.test('FR-013: loadKeymapFromDts and updateKeymapDts round-trip sensor-bindings', () => {
    const dtsWithEncoder = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <&kp A &kp B>;
            sensor-bindings = <&inc_dec_kp C_VOL_UP C_VOL_DN>;
        };
    };
};
`;
    const loaded = loadKeymapFromDts(dtsWithEncoder);
    assert.equal(loaded.sensor_bindings.length, 1);
    assert.deepEqual(loaded.sensor_bindings[0], ['&inc_dec_kp C_VOL_UP C_VOL_DN']);

    loaded.sensor_bindings[0] = ['&inc_dec_kp PG_UP PG_DN'];
    const updated = updateKeymapDts(dtsWithEncoder, loaded);
    assert.ok(updated.includes('sensor-bindings = <&inc_dec_kp PG_UP PG_DN>;'));
  });
});
