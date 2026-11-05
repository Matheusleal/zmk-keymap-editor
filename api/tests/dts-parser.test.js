const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDts } = require('../services/zmk/dts/parser');

test('Devicetree AST Lossless Parser Tests', async (t) => {
  const sampleDts = `/*
 * Custom Header Comment
 */
#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#define CUSTOM_TIMEOUT 30

/ {
    // Custom unknown node
    my_custom_hardware {
        compatible = "vendor,custom-sensor";
        spi-max-frequency = <4000000>;
        status = "okay";
        enable-power;
    };

    combos {
        compatible = "zmk,combos";
        combo_esc {
            timeout-ms = <50>;
            key-positions = <0 1>;
            bindings = <&kp ESC>;
        };
    };

    keymap {
        compatible = "zmk,keymap";

        default_layer {
            bindings = <
                &kp Q &kp W &kp E &kp R
            >;
        };
    };
};
`;

  await t.test('FR-010: Parser extracts directives, comments and root node', () => {
    const doc = parseDts(sampleDts);
    assert.ok(doc, 'Should produce a DtsDocument');

    const directives = doc.statements.filter(s => s.type === 'directive');
    assert.equal(directives.length, 3, 'Should parse 3 directives');
    assert.ok(directives[0].raw.includes('#include <behaviors.dtsi>'));
    assert.ok(directives[2].raw.includes('#define CUSTOM_TIMEOUT 30'));

    const comments = doc.statements.filter(s => s.type === 'comment');
    assert.ok(comments.length >= 1, 'Should preserve header comment');
    assert.ok(comments[0].raw.includes('Custom Header Comment'));

    assert.ok(doc.rootNode, 'Should identify root node /');
    assert.equal(doc.rootNode.name, '/');
  });

  await t.test('NFR-001: Preserves unmodeled custom hardware nodes and boolean properties', () => {
    const doc = parseDts(sampleDts);
    const customNode = doc.rootNode.getChild('my_custom_hardware');
    assert.ok(customNode, 'my_custom_hardware node must be preserved in AST');
    assert.equal(customNode.getProperty('compatible').value, 'vendor,custom-sensor');
    assert.equal(customNode.getProperty('spi-max-frequency').value, '4000000');
    assert.equal(customNode.getProperty('enable-power').value, true);
  });

  await t.test('FR-010: Parses keymap layers and combos accurately', () => {
    const doc = parseDts(sampleDts);
    const combosNode = doc.rootNode.getChild('combos');
    assert.ok(combosNode, 'combos node must exist');
    const comboEsc = combosNode.getChild('combo_esc');
    assert.ok(comboEsc, 'combo_esc node must exist');
    assert.equal(comboEsc.getProperty('key-positions').value, '0 1');

    const keymapNode = doc.rootNode.getChild('keymap');
    assert.ok(keymapNode, 'keymap node must exist');
    const defaultLayer = keymapNode.getChild('default_layer');
    assert.ok(defaultLayer, 'default_layer must exist');
    assert.ok(defaultLayer.getProperty('bindings').value.includes('&kp Q'));
  });
});

