const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKeymapFromDts, updateKeymapDts } = require('../services/zmk/keymap');

test('AST Keymap Engine Integration Tests', async (t) => {
  const sampleDts = `/*
 * Proprietary Device Settings
 */
#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>

/ {
    // Unmodeled user node
    my_display {
        compatible = "custom,display";
        width = <128>;
    };

    combos {
        compatible = "zmk,combos";
        cb_esc {
            key-positions = <0 1>;
            bindings = <&kp ESC>;
            timeout-ms = <45>;
        };
    };

    macros {
        m_save: m_save {
            compatible = "zmk,behavior-macro";
            #binding-cells = <0>;
            wait-ms = <20>;
            tap-ms = <30>;
            bindings = <&macro_press &kp LCTRL>, <&macro_tap &kp S>, <&macro_release &kp LCTRL>;
        };
    };

    conditional_layers {
        compatible = "zmk,conditional-layers";
        tri_layer {
            if-layers = <1 2>;
            then-layer = <3>;
        };
    };

    behaviors {
        hm: homerow_mods {
            compatible = "zmk,behavior-hold-tap";
            flavor = "balanced";
            tapping-term-ms = <200>;
            hold-trigger-key-positions = <6 7 8>;
        };
    };

    keymap {
        compatible = "zmk,keymap";

        default_layer {
            bindings = <&kp Q &kp W>;
        };

        lower_layer {
            bindings = <&kp NUM_1 &kp NUM_2>;
        };
    };
};
`;

  await t.test('FR-010: loadKeymapFromDts parses all ZMK domains accurately', () => {
    const keymap = loadKeymapFromDts(sampleDts);

    assert.equal(keymap.layers.length, 2, 'Should extract 2 layers');
    assert.deepEqual(keymap.layers[0], ['&kp Q', '&kp W']);
    assert.deepEqual(keymap.layers[1], ['&kp NUM_1', '&kp NUM_2']);
    assert.deepEqual(keymap.layer_names, ['default_layer', 'lower_layer']);

    assert.equal(keymap.combos.length, 1, 'Should extract 1 combo');
    assert.equal(keymap.combos[0].name, 'cb_esc');
    assert.deepEqual(keymap.combos[0].key_positions, [0, 1]);
    assert.equal(keymap.combos[0].bindings, '&kp ESC');

    assert.equal(keymap.macros.length, 1, 'Should extract 1 macro');
    assert.equal(keymap.macros[0].name, 'm_save');

    assert.equal(keymap.conditional_layers.length, 1, 'Should extract 1 conditional layer rule');
    assert.deepEqual(keymap.conditional_layers[0].if_layers, [1, 2]);
    assert.equal(keymap.conditional_layers[0].then_layer, 3);

    assert.equal(keymap.custom_behaviors.length, 1, 'Should extract 1 custom behavior');
    assert.equal(keymap.custom_behaviors[0].flavor, 'balanced');
  });

  await t.test('FR-011: updateKeymapDts non-destructively updates layers and preserves custom nodes', () => {
    const keymap = loadKeymapFromDts(sampleDts);

    // Modify layer 0 bindings
    keymap.layers[0] = ['&kp A', '&kp B'];
    const updatedDts = updateKeymapDts(sampleDts, keymap);

    assert.ok(updatedDts.includes('bindings = <&kp A &kp B>;'), 'Updated default_layer with new bindings');
    assert.ok(updatedDts.includes('my_display {'), 'my_display custom node preserved intact');
    assert.ok(updatedDts.includes('width = <128>;'), 'Preserved property inside custom node');
    assert.ok(updatedDts.includes('Proprietary Device Settings'), 'Preserved header comment');
    assert.ok(updatedDts.includes('cb_esc {'), 'Preserved combos block');
    assert.ok(updatedDts.includes('m_save: m_save {'), 'Preserved macros block');
  });
});
