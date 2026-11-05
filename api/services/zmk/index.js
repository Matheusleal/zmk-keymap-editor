const {
  parseKeyBinding,
  generateKeymap
} = require('./keymap')

const {
  loadBehaviors,
  loadKeycodes,
  loadLayout,
  loadKeymap,
  exportKeymap
} = require('./local-source')

const {
  generateKeymapSvg
} = require('./export/svgDrawer')

module.exports = {
  parseKeyBinding,
  generateKeymap,
  loadBehaviors,
  loadKeycodes,
  loadLayout,
  loadKeymap,
  exportKeymap,
  generateKeymapSvg
}
