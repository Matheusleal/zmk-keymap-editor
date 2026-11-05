const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDts } = require('../services/zmk/dts/parser');
const { serializeDts } = require('../services/zmk/dts/serializer');

test('Devicetree AST Lossless Serializer Round-Trip Tests', async (t) => {
  const originalDts = `/*
 * Copyright (c) 2026 Custom Author
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#define QUICK_TAP 100

/ {
    // Custom non-modeled sensor
    custom_sensor {
        compatible = "custom,gyro";
        interrupt-gpios = <&gpio0 6 0>;
        status = "okay";
        active-high;
    };

    combos {
        compatible = "zmk,combos";
        combo_boot {
            timeout-ms = <50>;
            key-positions = <0 1>;
            bindings = <&bootloader>;
        };
    };

    keymap {
        compatible = "zmk,keymap";

        default_layer {
            bindings = <&kp A &kp B>;
        };
    };
};
`;

  await t.test('NFR-001: Round-trip serialization preserves directives, comments, and unmodeled nodes', () => {
    const doc = parseDts(originalDts);
    const serialized = serializeDts(doc);

    assert.ok(serialized.includes('Copyright (c) 2026 Custom Author'), 'Preserves copyright comment');
    assert.ok(serialized.includes('#include <behaviors.dtsi>'), 'Preserves #include directive');
    assert.ok(serialized.includes('#define QUICK_TAP 100'), 'Preserves #define directive');
    assert.ok(serialized.includes('custom_sensor {'), 'Preserves custom hardware node');
    assert.ok(serialized.includes('interrupt-gpios = <&gpio0 6 0>;'), 'Preserves custom properties');
    assert.ok(serialized.includes('active-high;'), 'Preserves boolean properties');
    assert.ok(serialized.includes('combo_boot {'), 'Preserves combos node');
    assert.ok(serialized.includes('default_layer {'), 'Preserves keymap layer node');
  });

  await t.test('FR-011: Targeted layer edit preserves untouched sibling nodes and directives', () => {
    const doc = parseDts(originalDts);

    // Modify default_layer bindings
    const defaultLayer = doc.rootNode.getChild('keymap').getChild('default_layer');
    defaultLayer.setProperty('bindings', '&kp C &kp D', '<&kp C &kp D>');

    const serialized = serializeDts(doc);
    assert.ok(serialized.includes('bindings = <&kp C &kp D>;'), 'Updated binding in layer');
    assert.ok(serialized.includes('custom_sensor {'), 'custom_sensor remains untouched');
    assert.ok(serialized.includes('#define QUICK_TAP 100'), 'Directives remain untouched');
  });
});
