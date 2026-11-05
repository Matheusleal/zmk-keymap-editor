const { describe, it } = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')

const { parseDtsToKeymap } = require('../../app/src/parsers/keymapParser.js')

describe('Client-Side Keymap Parser Tests', () => {
  it('parses multi-layer DTS keymaps with brace counting without truncation', () => {
    const dtsSample = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp Q &kp W &kp E &kp R
                &kp A &kp S &kp D &kp F
            >;
            display-name = "Base";
        };
        lower_layer {
            bindings = <
                &kp N1 &kp N2 &kp N3 &kp N4
                &kp PLUS &kp MINUS &kp ASTRK &kp SLASH
            >;
            display-name = "Lower";
        };
        raise_layer {
            bindings = <
                &mo 1 &kp ESC &kp SPACE &kp ENTER
                &kp TAB &kp BACKSPACE &kp DELETE &trans
            >;
            display-name = "Raise";
        };
    };
};
`
    const parsed = parseDtsToKeymap(dtsSample)
    assert.strictEqual(parsed.layers.length, 3, 'Should parse all 3 layers')
    assert.deepStrictEqual(parsed.layer_names, ['Base', 'Lower', 'Raise'])
    assert.strictEqual(parsed.layers[0].length, 8)
    assert.strictEqual(parsed.layers[1].length, 8)
    assert.strictEqual(parsed.layers[2].length, 8)

    assert.strictEqual(parsed.layers[0][0].value, '&kp')
    assert.strictEqual(parsed.layers[0][0].params[0].value, 'Q')
    assert.strictEqual(parsed.layers[2][0].value, '&mo')
    assert.strictEqual(parsed.layers[2][0].params[0].value, '1')
  })

  it('parses eyelash_sofle.keymap accurately into 3 layers and 64 keys', () => {
    const filePath = 'D:/Projects/github/mine/Matheusleal/zmk-sofle/config/eyelash_sofle.keymap'
    if (fs.existsSync(filePath)) {
      const dts = fs.readFileSync(filePath, 'utf8')
      const parsed = parseDtsToKeymap(dts)
      assert.strictEqual(parsed.layers.length, 3)
      assert.deepStrictEqual(parsed.layer_names, ['LAYER 0', 'LAYER 1', 'LAYER 2'])
      assert.strictEqual(parsed.layers[0].length, 64)
      assert.strictEqual(parsed.layers[1].length, 64)
      assert.strictEqual(parsed.layers[2].length, 64)
      assert.strictEqual(parsed.layers[0][0].value, '&kp')
      assert.strictEqual(parsed.layers[0][0].params[0].value, 'ESC')
    }
  })
})

